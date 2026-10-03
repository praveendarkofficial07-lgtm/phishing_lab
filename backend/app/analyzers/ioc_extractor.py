import re
import ipaddress
from typing import List, Dict, Any, Optional
from backend.app.schemas.analysis import ExtractedIOC, AttachmentMetadata
import tldextract

URL_REGEX = r"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[^\s<>'\"\)\]]+"
EMAIL_REGEX = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
IPV4_REGEX = r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b"
MD5_REGEX = r"\b[a-fA-F0-9]{32}\b"
SHA1_REGEX = r"\b[a-fA-F0-9]{40}\b"
SHA256_REGEX = r"\b[a-fA-F0-9]{64}\b"

COMMON_BENIGN_DOMAINS = {
    "google.com", "microsoft.com", "apple.com", "github.com", "w3.org", "schema.org", "ietf.org"
}

SUSPICIOUS_EXTENSIONS = {
    "exe", "scr", "bat", "cmd", "vbs", "vbe", "js", "jse", "wsf", "wsh",
    "ps1", "hta", "jar", "iso", "img", "docm", "xlsm", "pptm", "dll", "pif"
}

def analyze_attachment_metadata(att: AttachmentMetadata) -> AttachmentMetadata:
    findings = []
    is_suspicious = False
    filename = (att.filename or "").strip()
    ext = ""

    if "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()
    att.extension = ext

    # Double extension check, e.g. invoice.pdf.exe
    parts = filename.split(".")
    if len(parts) > 2 and parts[-1].lower() in SUSPICIOUS_EXTENSIONS:
        findings.append(f"Deceptive double file extension detected: '.{parts[-2]}.{parts[-1]}'")
        is_suspicious = True

    if ext in SUSPICIOUS_EXTENSIONS:
        findings.append(f"Executable or macro-enabled script extension: '.{ext}'")
        is_suspicious = True

    if att.sha256 and len(att.sha256) != 64:
        findings.append("Provided attachment hash does not conform to valid SHA-256 formatting.")

    risk_level = "CRITICAL" if is_suspicious else "LOW"
    att.is_executable_or_script = is_suspicious
    att.risk_level = risk_level
    att.findings = findings
    return att

def extract_all_iocs(
    text: str,
    raw_headers: str = "",
    manual_urls: Optional[List[str]] = None,
    attachments: Optional[List[AttachmentMetadata]] = None
) -> List[ExtractedIOC]:
    """
    Extracts all Indicators of Compromise (IOCs) across text, headers, manual URLs, and attachments.
    """
    combined_corpus = f"{text}\n{raw_headers}\n{' '.join(manual_urls or [])}"
    iocs_map: Dict[str, ExtractedIOC] = {}

    # 1. URLs
    urls = re.findall(URL_REGEX, combined_corpus)
    if manual_urls:
        urls.extend(manual_urls)

    for raw_url in set(urls):
        clean_url = raw_url.rstrip(".,;:!?'\"")
        if not clean_url:
            continue
        risk = "HIGH" if ("http://" in clean_url or any(k in clean_url.lower() for k in ["login", "verify", "update", "bank", "token"])) else "MEDIUM"
        key = f"URL:{clean_url}"
        iocs_map[key] = ExtractedIOC(
            ioc_type="URL",
            value=clean_url,
            risk_level=risk,
            context="Extracted from email body or submitted URL list"
        )

        # Extract domain from the URL
        try:
            domain_extracted = tldextract.extract(clean_url)
            top_dom = getattr(domain_extracted, "top_domain_under_public_suffix", None) or domain_extracted.registered_domain
            if top_dom:
                dom = top_dom.lower()
                dom_key = f"Domain:{dom}"
                if dom_key not in iocs_map:
                    dom_risk = "LOW" if dom in COMMON_BENIGN_DOMAINS else "MEDIUM"
                    iocs_map[dom_key] = ExtractedIOC(
                        ioc_type="Domain",
                        value=dom,
                        risk_level=dom_risk,
                        context=f"Domain extracted from URL '{clean_url}'"
                    )
        except Exception:
            pass

    # 2. Email addresses
    emails = re.findall(EMAIL_REGEX, combined_corpus)
    for email_addr in set(emails):
        clean_email = email_addr.lower()
        key = f"Email:{clean_email}"
        iocs_map[key] = ExtractedIOC(
            ioc_type="Email",
            value=clean_email,
            risk_level="LOW",
            context="Identified email address entity"
        )
        # Also extract domain from email
        if "@" in clean_email:
            dom = clean_email.split("@")[-1].strip().lower()
            dom_key = f"Domain:{dom}"
            if dom_key not in iocs_map and "." in dom:
                iocs_map[dom_key] = ExtractedIOC(
                    ioc_type="Domain",
                    value=dom,
                    risk_level="LOW" if dom in COMMON_BENIGN_DOMAINS else "MEDIUM",
                    context=f"Domain extracted from sender/recipient email address"
                )

    # 3. IP Addresses
    ip_matches = re.findall(IPV4_REGEX, combined_corpus)
    for ip_str in set(ip_matches):
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            # Skip loopback and common private subnets unless in headers
            is_private = ip_obj.is_private or ip_obj.is_loopback
            risk = "LOW" if is_private else "MEDIUM"
            context = "Private network address" if is_private else "Public IP address identified in email content/headers"
            key = f"IP:{ip_str}"
            iocs_map[key] = ExtractedIOC(
                ioc_type="IP",
                value=ip_str,
                risk_level=risk,
                context=context
            )
        except ValueError:
            continue

    # 4. Cryptographic Hashes (SHA-256, SHA-1, MD5)
    sha256_matches = re.findall(SHA256_REGEX, combined_corpus)
    for h in set(sha256_matches):
        key = f"Hash:{h.lower()}"
        iocs_map[key] = ExtractedIOC(
            ioc_type="Hash",
            value=h.lower(),
            risk_level="MEDIUM",
            context="SHA-256 hash artifact"
        )

    sha1_matches = re.findall(SHA1_REGEX, combined_corpus)
    for h in set(sha1_matches):
        if len(h) == 40:
            key = f"Hash:{h.lower()}"
            if key not in iocs_map:
                iocs_map[key] = ExtractedIOC(
                    ioc_type="Hash",
                    value=h.lower(),
                    risk_level="MEDIUM",
                    context="SHA-1 hash artifact"
                )

    md5_matches = re.findall(MD5_REGEX, combined_corpus)
    for h in set(md5_matches):
        # Exclude common hex color codes or substrings
        if len(h) == 32:
            key = f"Hash:{h.lower()}"
            if key not in iocs_map:
                iocs_map[key] = ExtractedIOC(
                    ioc_type="Hash",
                    value=h.lower(),
                    risk_level="MEDIUM",
                    context="MD5 hash artifact"
                )

    # 5. Attachment metadata and hashes
    if attachments:
        for att in attachments:
            if att.sha256:
                h_val = att.sha256.strip().lower()
                key = f"Hash:{h_val}"
                iocs_map[key] = ExtractedIOC(
                    ioc_type="Hash",
                    value=h_val,
                    risk_level="HIGH" if att.is_executable_or_script else "MEDIUM",
                    context=f"SHA-256 hash for attachment '{att.filename}'"
                )
            if att.filename:
                key = f"File:{att.filename}"
                iocs_map[key] = ExtractedIOC(
                    ioc_type="File",
                    value=att.filename,
                    risk_level="CRITICAL" if att.is_executable_or_script else "LOW",
                    context=f"Attachment artifact (MIME: {att.mime_type or 'unknown'})"
                )

    return list(iocs_map.values())
