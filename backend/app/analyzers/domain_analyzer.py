import re
import ipaddress
from typing import Dict, Any, List, Optional
import tldextract

COMMON_TARGET_BRANDS = [
    "microsoft", "office365", "m365", "outlook", "azure",
    "google", "gmail", "workspace",
    "apple", "icloud",
    "amazon", "aws",
    "paypal",
    "netflix",
    "instagram",
    "facebook", "meta",
    "linkedin",
    "wellsfargo", "chase", "bankofamerica", "citibank",
    "dhl", "fedex", "usps", "ups",
    "docusign", "dropbox", "adobe", "zoom", "slack", "github", "stripe"
]

SUSPICIOUS_TLDS = {
    "top", "xyz", "biz", "cc", "vip", "link", "online", "click", "site",
    "info", "work", "rest", "buzz", "tokyo", "icu", "cam", "fit", "surf", "gq", "ml", "cf"
}

def is_ip_address(host: str) -> bool:
    if not host:
        return False
    # Strip port if present
    clean_host = host.split(":")[0].strip("[]")
    try:
        ipaddress.ip_address(clean_host)
        return True
    except ValueError:
        return False

def analyze_domain(domain_str: str) -> Dict[str, Any]:
    """
    Performs structural, lexical, and brand-impersonation analysis on a domain.
    """
    clean_domain = (domain_str or "").strip().lower()
    if not clean_domain:
        return {
            "domain": "",
            "is_ip": False,
            "is_punycode": False,
            "suspicious_tld": False,
            "excessive_subdomains": False,
            "excessive_hyphens": False,
            "length_anomaly": False,
            "brand_impersonation": False,
            "matched_brand": None,
            "risk_score": 0.0,
            "findings": []
        }

    extracted = tldextract.extract(clean_domain)
    subdomain = extracted.subdomain
    registered_domain = getattr(extracted, "top_domain_under_public_suffix", None) or extracted.registered_domain
    domain_name = extracted.domain
    suffix = extracted.suffix

    is_ip = is_ip_address(clean_domain)
    is_punycode = clean_domain.startswith("xn--") or ".xn--" in clean_domain
    suspicious_tld = suffix.lower() in SUSPICIOUS_TLDS
    subdomain_count = len(subdomain.split(".")) if subdomain else 0
    excessive_subdomains = subdomain_count >= 2
    hyphen_count = clean_domain.count("-")
    excessive_hyphens = hyphen_count >= 2
    length_anomaly = len(clean_domain) > 30

    # Brand impersonation check
    brand_impersonation = False
    matched_brand = None
    brand_findings = []

    # Check if a known brand keyword appears in domain name or subdomain,
    # but the registered domain is NOT the official brand domain
    full_host_clean = f"{subdomain}.{domain_name}" if subdomain else domain_name
    for brand in COMMON_TARGET_BRANDS:
        # Look for brand substring in registered domain or subdomain
        if brand in full_host_clean:
            # Check if this is an authentic domain for the brand
            official_domains = {
                "microsoft": "microsoft.com",
                "office365": "office.com",
                "m365": "microsoft365.com",
                "outlook": "outlook.com",
                "azure": "azure.com",
                "google": "google.com",
                "gmail": "gmail.com",
                "apple": "apple.com",
                "icloud": "icloud.com",
                "amazon": "amazon.com",
                "aws": "amazon.com",
                "paypal": "paypal.com",
                "netflix": "netflix.com",
                "instagram": "instagram.com",
                "facebook": "facebook.com",
                "meta": "meta.com",
                "linkedin": "linkedin.com",
                "wellsfargo": "wellsfargo.com",
                "chase": "chase.com",
                "bankofamerica": "bankofamerica.com",
                "citibank": "citi.com",
                "dhl": "dhl.com",
                "fedex": "fedex.com",
                "usps": "usps.com",
                "ups": "ups.com",
                "docusign": "docusign.com",
                "dropbox": "dropbox.com",
                "adobe": "adobe.com",
                "zoom": "zoom.us",
                "slack": "slack.com",
                "github": "github.com",
                "stripe": "stripe.com"
            }

            official = official_domains.get(brand, f"{brand}.com")
            if registered_domain != official:
                brand_impersonation = True
                matched_brand = brand.capitalize()
                brand_findings.append(f"Possible brand impersonation pattern detected targeting '{matched_brand}'.")
                break

    # Lookalike pattern check (e.g. micr0soft, paypa1, g00gle)
    lookalike_patterns = [
        (r"micr[0o]s[0o]ft", "Microsoft"),
        (r"paypa[l1i]", "PayPal"),
        (r"g[0o]{2}gle", "Google"),
        (r"appl[e3]", "Apple"),
        (r"am[a4]z[0o]n", "Amazon"),
        (r"netfl[i1]x", "Netflix")
    ]
    for pattern, brand_name in lookalike_patterns:
        if re.search(pattern, full_host_clean, re.IGNORECASE) and not matched_brand:
            brand_impersonation = True
            matched_brand = brand_name
            brand_findings.append(f"Character substitution lookalike pattern detected resembling '{brand_name}'.")
            break

    findings = []
    risk_score = 0.0

    if is_ip:
        risk_score += 25.0
        findings.append("Host is an IP address instead of a standard domain name.")

    if is_punycode:
        risk_score += 20.0
        findings.append("Internationalized Domain Name (Punycode 'xn--') detected; frequently used for visual spoofing.")

    if suspicious_tld:
        risk_score += 15.0
        findings.append(f"Suspicious or high-risk top-level domain '.{suffix}' detected.")

    if excessive_subdomains:
        risk_score += 12.0
        findings.append(f"Excessive subdomain depth ({subdomain_count} levels) detected.")

    if excessive_hyphens:
        risk_score += 12.0
        findings.append(f"Excessive hyphenation ({hyphen_count} hyphens) in domain string.")

    if length_anomaly:
        risk_score += 8.0
        findings.append(f"Unusually long domain name ({len(clean_domain)} characters).")

    if brand_impersonation:
        risk_score += 20.0
        findings.extend(brand_findings)

    return {
        "domain": clean_domain,
        "registered_domain": registered_domain,
        "subdomain": subdomain,
        "suffix": suffix,
        "is_ip": is_ip,
        "is_punycode": is_punycode,
        "suspicious_tld": suspicious_tld,
        "excessive_subdomains": excessive_subdomains,
        "excessive_hyphens": excessive_hyphens,
        "length_anomaly": length_anomaly,
        "brand_impersonation": brand_impersonation,
        "matched_brand": matched_brand,
        "risk_score": min(100.0, risk_score),
        "findings": findings
    }
