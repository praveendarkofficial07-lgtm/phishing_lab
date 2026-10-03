import re
import urllib.parse
from typing import List, Dict, Any, Optional
from backend.app.schemas.analysis import URLAnalysisResult
from backend.app.analyzers.domain_analyzer import analyze_domain, is_ip_address

SUSPICIOUS_PATH_KEYWORDS = [
    "login", "signin", "sign-in", "auth", "authenticate", "verify", "verification",
    "security", "account", "update", "password", "credential", "banking", "sso",
    "token", "resolve", "session", "restore", "webscr", "confirm", "claim", "billing"
]

REDIRECT_PARAM_NAMES = [
    "url", "redirect", "next", "target", "dest", "destination", "goto", "return", "callback", "link"
]

def analyze_url(raw_url: str) -> URLAnalysisResult:
    """
    Analyzes a URL against security heuristics, structural anomalies, and threat indicators.
    """
    clean_url = (raw_url or "").strip()
    if not clean_url:
        return URLAnalysisResult(
            url="",
            scheme="",
            domain="",
            subdomain="",
            path="",
            query="",
            fragment="",
            is_https=False,
            risk_score=0.0,
            risk_level="LOW",
            risk_indicators=[]
        )

    # If scheme missing, prepend http:// for standard parsing
    parse_target = clean_url
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", clean_url):
        parse_target = f"http://{clean_url}"

    try:
        parsed = urllib.parse.urlsplit(parse_target)
    except Exception:
        return URLAnalysisResult(
            url=clean_url,
            scheme="unknown",
            domain=clean_url,
            subdomain="",
            path="",
            query="",
            fragment="",
            is_https=False,
            risk_score=75.0,
            risk_level="HIGH",
            risk_indicators=["Malformed or unparseable URL structure"]
        )

    scheme = parsed.scheme.lower() if parsed.scheme else "unknown"
    netloc = parsed.netloc.lower()
    path = parsed.path
    query = parsed.query
    fragment = parsed.fragment

    port: Optional[str] = None
    host = netloc
    if "@" in netloc:
        host = netloc.split("@")[-1]

    if ":" in host and not host.startswith("["):
        parts = host.split(":")
        host = parts[0]
        port = parts[1]

    # Domain analysis
    domain_info = analyze_domain(host)

    is_ip = is_ip_address(host)
    is_https = scheme == "https"
    has_at_symbol = "@" in clean_url
    excessive_length = len(clean_url) > 75
    has_url_encoding = "%" in clean_url

    # Suspicious keywords in path and query
    combined_path_query = f"{path} {query}".lower()
    matched_keywords = [kw for kw in SUSPICIOUS_PATH_KEYWORDS if kw in combined_path_query]

    # Credential related paths
    credential_related_path = any(
        kw in path.lower() for kw in ["login", "signin", "auth", "verify", "credential", "password", "sso", "session"]
    )

    # Redirect-like query params
    redirect_like_params = False
    if query:
        query_dict = urllib.parse.parse_qs(query)
        for param in query_dict.keys():
            if param.lower() in REDIRECT_PARAM_NAMES:
                redirect_like_params = True
                break

    # Calculate individual URL risk score
    risk_score = 0.0
    risk_indicators: List[str] = []

    if not is_https:
        risk_score += 15.0
        risk_indicators.append("Non-HTTPS protocol (cleartext HTTP)")

    if is_ip:
        risk_score += 25.0
        risk_indicators.append("Host is a numeric IP address rather than a domain name")

    if has_at_symbol:
        risk_score += 20.0
        risk_indicators.append("URL contains '@' character which can be used to disguise actual destination host")

    if domain_info["brand_impersonation"]:
        risk_score += 25.0
        risk_indicators.append(f"Possible brand impersonation pattern targeting {domain_info['matched_brand']}")

    if domain_info["suspicious_tld"]:
        risk_score += 15.0
        risk_indicators.append(f"Suspicious / high-abuse top-level domain: .{domain_info['suffix']}")

    if domain_info["excessive_hyphens"]:
        risk_score += 10.0
        risk_indicators.append("Suspicious domain structure with excessive hyphens")

    if domain_info["excessive_subdomains"]:
        risk_score += 10.0
        risk_indicators.append("Excessive subdomain depth")

    if domain_info["is_punycode"]:
        risk_score += 15.0
        risk_indicators.append("Punycode (xn--) internationalized domain name")

    if credential_related_path:
        risk_score += 15.0
        risk_indicators.append("Credential or authentication-harvesting path pattern")

    if redirect_like_params:
        risk_score += 10.0
        risk_indicators.append("Open-redirect query parameter pattern")

    if excessive_length:
        risk_score += 8.0
        risk_indicators.append(f"Excessive URL length ({len(clean_url)} chars)")

    if has_url_encoding:
        risk_score += 7.0
        risk_indicators.append("URL percent-encoding obfuscation detected")

    if port and port not in ("80", "443"):
        risk_score += 10.0
        risk_indicators.append(f"Non-standard HTTP port (:{port})")

    # Bound score
    normalized_score = min(100.0, risk_score)

    if normalized_score >= 75:
        risk_level = "CRITICAL"
    elif normalized_score >= 50:
        risk_level = "HIGH"
    elif normalized_score >= 25:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return URLAnalysisResult(
        url=clean_url,
        scheme=scheme,
        domain=host,
        subdomain=domain_info.get("subdomain", ""),
        port=port,
        path=path,
        query=query,
        fragment=fragment,
        is_ip_address=is_ip,
        is_https=is_https,
        suspicious_tld=domain_info.get("suspicious_tld", False),
        is_punycode=domain_info.get("is_punycode", False),
        has_url_encoding=has_url_encoding,
        excessive_length=excessive_length,
        suspicious_keywords=matched_keywords,
        credential_related_path=credential_related_path,
        redirect_like_params=redirect_like_params,
        has_at_symbol=has_at_symbol,
        risk_score=round(normalized_score, 1),
        risk_level=risk_level,
        risk_indicators=risk_indicators,
        matched_brand=domain_info.get("matched_brand")
    )

def extract_and_analyze_urls(text: str, manual_urls: Optional[List[str]] = None) -> List[URLAnalysisResult]:
    """
    Extracts URLs from text and analyzes them, combining with any manually supplied URLs.
    """
    url_pattern = r"(?:https?://|www\.)[^\s<>'\"\)]+"
    found_urls = re.findall(url_pattern, text or "")

    combined = list(dict.fromkeys(found_urls + (manual_urls or [])))
    results: List[URLAnalysisResult] = []

    for raw_u in combined:
        clean = raw_u.rstrip(".,;:!?'\"")
        if clean:
            results.append(analyze_url(clean))

    return results
