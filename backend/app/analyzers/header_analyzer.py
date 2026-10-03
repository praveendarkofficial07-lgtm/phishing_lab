import re
import email
from email import policy
import ipaddress
from typing import Dict, Any, List, Optional
from backend.app.schemas.analysis import HeaderAnalysisResult
import tldextract

def extract_email_address(raw_header: Optional[str]) -> Optional[str]:
    if not raw_header:
        return None
    match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_header)
    return match.group(0).lower() if match else None

def extract_domain_from_email(email_str: Optional[str]) -> Optional[str]:
    if not email_str:
        return None
    if "@" in email_str:
        domain = email_str.split("@")[-1].strip().lower()
        extracted = tldextract.extract(domain)
        top_dom = getattr(extracted, "top_domain_under_public_suffix", None) or extracted.registered_domain
        return top_dom if top_dom else domain
    return None

def parse_auth_status(text: str, mechanism: str) -> str:
    """
    Parses SPF, DKIM, or DMARC status.
    Differentiates PASS, FAIL, NONE / NOT PROVIDED, UNKNOWN.
    """
    if not text:
        return "NONE / NOT PROVIDED"

    pattern = rf"{mechanism}\s*=\s*([a-zA-Z\-]+)"
    match = re.search(pattern, text, re.IGNORECASE)
    if not match:
        return "NONE / NOT PROVIDED"

    val = match.group(1).lower()
    if val in ("pass", "ok"):
        return "PASS"
    elif val in ("fail", "softfail", "permerror", "temperror"):
        return "FAIL"
    elif val in ("none", "neutral"):
        return "NONE / NOT PROVIDED"
    else:
        return "UNKNOWN"

def analyze_headers(raw_headers: str) -> HeaderAnalysisResult:
    clean_headers = (raw_headers or "").strip()
    if not clean_headers:
        return HeaderAnalysisResult(
            from_header=None,
            to_header=None,
            reply_to=None,
            return_path=None,
            message_id=None,
            date=None,
            originating_ip=None,
            received_hops_count=0,
            received_chain=[],
            spf="NONE / NOT PROVIDED",
            dkim="NONE / NOT PROVIDED",
            dmarc="NONE / NOT PROVIDED",
            auth_summary="No raw headers submitted for inspection.",
            inconsistencies=[],
            risk_score=0.0,
            risk_level="LOW",
            findings=["Headers were not provided with this submission."]
        )

    try:
        msg = email.message_from_string(clean_headers, policy=policy.compat32)
    except Exception:
        return HeaderAnalysisResult(
            auth_summary="Malformed header block encountered.",
            inconsistencies=["Header format could not be parsed according to RFC 5322."],
            risk_score=40.0,
            risk_level="MEDIUM",
            findings=["Failed to parse raw headers."]
        )

    from_header = msg.get("From", "")
    to_header = msg.get("To", "")
    reply_to = msg.get("Reply-To", "")
    return_path = msg.get("Return-Path", "")
    message_id = msg.get("Message-ID", "")
    date_header = msg.get("Date", "")
    auth_results = msg.get("Authentication-Results", "")
    received_list = msg.get_all("Received", []) or []

    # Fallback to individual header check (e.g. Received-SPF, X-DKIM-Status)
    received_spf = msg.get("Received-SPF", "")
    combined_auth_text = f"{auth_results} {received_spf}".strip()

    spf_status = parse_auth_status(combined_auth_text, "spf")
    dkim_status = parse_auth_status(combined_auth_text, "dkim")
    dmarc_status = parse_auth_status(combined_auth_text, "dmarc")

    # Inconsistency checks
    inconsistencies: List[str] = []
    findings: List[str] = []
    risk_score = 0.0

    from_addr = extract_email_address(from_header)
    reply_to_addr = extract_email_address(reply_to)
    return_path_addr = extract_email_address(return_path)

    from_domain = extract_domain_from_email(from_addr)
    reply_to_domain = extract_domain_from_email(reply_to_addr)
    return_path_domain = extract_domain_from_email(return_path_addr)

    # 1. From vs Reply-To mismatch
    if from_domain and reply_to_domain and from_domain != reply_to_domain:
        inconsistencies.append(
            f"From domain ({from_domain}) does not match Reply-To domain ({reply_to_domain})"
        )
        findings.append(
            f"Sender and Reply-To domain mismatch: Responses will be routed to a different domain ({reply_to_domain})."
        )
        risk_score += 20.0

    # 2. From vs Return-Path mismatch
    if from_domain and return_path_domain and from_domain != return_path_domain:
        inconsistencies.append(
            f"From domain ({from_domain}) differs from Return-Path ({return_path_domain})"
        )
        findings.append("Return-Path envelope sender does not align with the display From domain.")
        risk_score += 10.0

    # 3. Authentication evaluation
    if spf_status == "FAIL":
        risk_score += 15.0
        findings.append("SPF (Sender Policy Framework) validation failed.")
    elif spf_status == "PASS":
        findings.append("SPF verification passed.")

    if dkim_status == "FAIL":
        risk_score += 15.0
        findings.append("DKIM (DomainKeys Identified Mail) cryptographic signature failed.")
    elif dkim_status == "PASS":
        findings.append("DKIM verification passed.")

    if dmarc_status == "FAIL":
        risk_score += 15.0
        findings.append("DMARC alignment policy failed.")
    elif dmarc_status == "PASS":
        findings.append("DMARC verification passed.")

    if spf_status == "NONE / NOT PROVIDED" and dkim_status == "NONE / NOT PROVIDED":
        findings.append("No SPF or DKIM cryptographic authentication records found in headers.")

    # 4. Received chain analysis & originating IP extraction
    originating_ip: Optional[str] = None
    received_chain: List[str] = []

    for r_entry in received_list:
        clean_entry = " ".join(r_entry.split())
        received_chain.append(clean_entry)

    # Search for originating IP in Received headers (earliest / bottom hop usually closest to origin)
    all_received_text = " ".join(received_list)
    ip_matches = re.findall(r"\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]", all_received_text)
    if not ip_matches:
        ip_matches = re.findall(r"\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b", all_received_text)

    for ip_str in ip_matches:
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            if not ip_obj.is_private and not ip_obj.is_loopback:
                originating_ip = ip_str
                break
        except ValueError:
            continue

    if not originating_ip and ip_matches:
        originating_ip = ip_matches[0]

    # Check for missing Message-ID or Date
    if not message_id:
        inconsistencies.append("Missing standard RFC 5322 Message-ID header")
        risk_score += 5.0

    if not date_header:
        inconsistencies.append("Missing standard RFC 5322 Date header")
        risk_score += 5.0

    # Risk level determination
    normalized_score = min(100.0, risk_score)
    if normalized_score >= 70:
        risk_level = "CRITICAL"
    elif normalized_score >= 45:
        risk_level = "HIGH"
    elif normalized_score >= 20:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    auth_summary = f"SPF: {spf_status} | DKIM: {dkim_status} | DMARC: {dmarc_status}"

    return HeaderAnalysisResult(
        from_header=from_header or None,
        to_header=to_header or None,
        reply_to=reply_to or None,
        return_path=return_path or None,
        message_id=message_id or None,
        date=date_header or None,
        originating_ip=originating_ip,
        received_hops_count=len(received_list),
        received_chain=received_chain,
        spf=spf_status,
        dkim=dkim_status,
        dmarc=dmarc_status,
        auth_summary=auth_summary,
        inconsistencies=inconsistencies,
        risk_score=round(normalized_score, 1),
        risk_level=risk_level,
        findings=findings
    )
