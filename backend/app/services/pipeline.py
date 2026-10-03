from typing import List, Dict, Any
from backend.app.schemas.analysis import (
    FullAnalysisRequest,
    FullAnalysisResponse,
    MLPredictionResult,
    ExplainabilityInsight
)
from backend.app.services.ml_engine import ml_service
from backend.app.analyzers.content_analyzer import analyze_email_content
from backend.app.analyzers.url_analyzer import extract_and_analyze_urls
from backend.app.analyzers.header_analyzer import analyze_headers
from backend.app.analyzers.ioc_extractor import extract_all_iocs, analyze_attachment_metadata
from backend.app.analyzers.risk_scorer import compute_investigation_risk

def run_investigation_pipeline(req: FullAnalysisRequest) -> FullAnalysisResponse:
    """
    Executes the full phishing investigation analysis pipeline.
    """
    body_text = req.body_plain or ""
    # Strip HTML tags if HTML provided but plain body empty
    if not body_text and req.body_html:
        import re
        body_text = re.sub(r"<[^>]+>", " ", req.body_html)

    # 1. ML Analysis
    full_text_for_ml = f"{req.subject or ''}\n{body_text}".strip()
    ml_dict = ml_service.predict(full_text_for_ml)
    ml_result = MLPredictionResult(
        phishing_probability=ml_dict["phishing_probability"],
        legitimate_probability=ml_dict["legitimate_probability"],
        verdict=ml_dict["verdict"],
        model_version=ml_dict["model_version"],
        feature_importances=ml_dict["feature_importances"]
    )

    # 2. Content Indicators
    content_indicators = analyze_email_content(body_text, req.subject or "")

    # 3. URL Analysis
    url_results = extract_and_analyze_urls(body_text, req.manual_urls)

    # 4. Email Header Analysis
    header_result = analyze_headers(req.raw_headers or "")

    # 5. Attachment Metadata Processing
    processed_attachments = []
    if req.attachments:
        for att in req.attachments:
            processed_attachments.append(analyze_attachment_metadata(att))

    # 6. IOC Extraction
    extracted_iocs = extract_all_iocs(
        text=body_text,
        raw_headers=req.raw_headers or "",
        manual_urls=req.manual_urls,
        attachments=processed_attachments
    )

    # 7. Risk Scoring Engine
    risk_assessment = compute_investigation_risk(
        ml_prediction=ml_result,
        content_indicators=content_indicators,
        url_results=url_results,
        header_result=header_result,
        attachments=processed_attachments
    )

    # 8. Explainable AI Insights ("Why this was flagged")
    reasoning_points: List[str] = []

    if ml_result.phishing_probability >= 0.65:
        reasoning_points.append(
            f"Machine Learning classifier identified strong phishing textual patterns ({ml_result.phishing_probability:.1%} probability)."
        )

    for ind in content_indicators:
        reasoning_points.append(f"{ind.indicator}: {ind.evidence}")

    for u in url_results:
        if u.risk_score >= 40:
            reasons = "; ".join(u.risk_indicators[:2])
            reasoning_points.append(f"Suspicious destination URL detected: {u.url} ({reasons})")

    if header_result.inconsistencies:
        for inc in header_result.inconsistencies:
            reasoning_points.append(f"Header anomaly: {inc}")

    if header_result.spf == "FAIL":
        reasoning_points.append("Sender failed SPF authentication policy.")
    if header_result.dkim == "FAIL":
        reasoning_points.append("Cryptographic DKIM signature failed verification.")
    if header_result.dmarc == "FAIL":
        reasoning_points.append("Domain DMARC policy failed.")

    for att in processed_attachments:
        if att.is_executable_or_script:
            reasoning_points.append(f"High-risk attachment payload: {att.filename} ({att.extension})")

    if not reasoning_points:
        reasoning_points.append("No prominent social engineering or technical threat indicators identified.")

    # 9. Dynamic Recommended Defensive Actions
    recommended_actions: List[str] = []

    if risk_assessment.total_score >= 50.0:
        recommended_actions.append("Do NOT click any links or download attachments from this message.")
        recommended_actions.append("Add detected malicious sender addresses and reply-to domains to the organization blocklist.")

        if url_results:
            high_risk_urls = [u.domain for u in url_results if u.risk_score >= 25]
            if high_risk_urls:
                unique_domains = list(dict.fromkeys(high_risk_urls))[:4]
                recommended_actions.append(f"Block domains/hosts at web proxy/DNS firewall: {', '.join(unique_domains)}")

        if any(ind.indicator == "Credential Request / Harvesting" for ind in content_indicators):
            recommended_actions.append("Advise any recipient who interacted with this email to immediately reset corporate passwords and revoke active sessions.")

        if processed_attachments:
            recommended_actions.append("Submit attachment SHA-256 hashes to endpoint protection (EDR) blocklists.")

        recommended_actions.append("Preserve full original email headers and RFC 822 format for incident audit trail.")
    elif risk_assessment.total_score >= 25.0:
        recommended_actions.append("Exercise caution. Verify the sender through an out-of-band channel (e.g. phone or internal chat) before acting.")
        recommended_actions.append("Inspect links manually by hovering over hyperlinks to confirm target domain.")
        recommended_actions.append("Report message to internal security awareness queue for secondary triage.")
    else:
        recommended_actions.append("The email exhibits normal communication patterns and low technical risk.")
        recommended_actions.append("Standard security hygiene applies: always check sender details if unexpected.")

    # 10. Executive Analysis Summary
    summary = (
        f"Investigation classified as {risk_assessment.risk_level} Risk (Score: {risk_assessment.total_score}/100). "
        f"ML model assigned a {ml_result.phishing_probability:.1%} phishing probability. "
        f"Identified {len(content_indicators)} content indicators, {len(url_results)} URLs, "
        f"and extracted {len(extracted_iocs)} IOCs across message components."
    )

    explainability = ExplainabilityInsight(
        title=f"Why this investigation is assessed as {risk_assessment.risk_level} Risk",
        evidence_points=reasoning_points,
        verdict_explanation=summary,
        recommended_mitigation=recommended_actions
    )

    return FullAnalysisResponse(
        risk_score=risk_assessment.total_score,
        risk_level=risk_assessment.risk_level,
        ml_prediction=ml_result,
        content_indicators=content_indicators,
        url_analysis=url_results,
        header_analysis=header_result,
        extracted_iocs=extracted_iocs,
        attachments=processed_attachments,
        risk_breakdown=risk_assessment,
        explainability=explainability,
        recommended_actions=recommended_actions,
        analysis_summary=summary
    )
