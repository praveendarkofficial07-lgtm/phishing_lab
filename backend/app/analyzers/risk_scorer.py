from typing import List, Dict, Any, Tuple
from backend.app.schemas.analysis import (
    ContentIndicator,
    URLAnalysisResult,
    HeaderAnalysisResult,
    AttachmentMetadata,
    MLPredictionResult,
    RiskAssessment,
    RiskBreakdownFactor
)

def compute_investigation_risk(
    ml_prediction: MLPredictionResult,
    content_indicators: List[ContentIndicator],
    url_results: List[URLAnalysisResult],
    header_result: HeaderAnalysisResult,
    attachments: List[AttachmentMetadata]
) -> RiskAssessment:
    """
    Computes a transparent, weighted risk score normalized between 0 and 100.
    Combines rule-based heuristics across content, URLs, headers, and attachments
    with the local ML phishing probability.
    """
    factors: List[RiskBreakdownFactor] = []
    raw_rule_points = 0.0

    # 1. Content Indicators
    for ind in content_indicators:
        raw_rule_points += ind.score_contribution
        factors.append(RiskBreakdownFactor(
            category="Email Content",
            factor=ind.indicator,
            weight=ind.score_contribution,
            description=f"Evidence: {ind.evidence}"
        ))

    # 2. URL Indicators
    for url_res in url_results:
        if url_res.risk_score > 0:
            # We add scaled score for each suspicious URL
            url_weight = round(url_res.risk_score * 0.25, 1)
            raw_rule_points += url_weight
            factors.append(RiskBreakdownFactor(
                category="URL Analysis",
                factor=f"Suspicious URL: {url_res.domain}",
                weight=url_weight,
                description=", ".join(url_res.risk_indicators[:3])
            ))

    # 3. Header Inconsistencies & Authentication Failures
    if header_result.risk_score > 0:
        hdr_weight = round(header_result.risk_score * 0.25, 1)
        raw_rule_points += hdr_weight
        factors.append(RiskBreakdownFactor(
            category="Email Headers",
            factor="Header Anomalies / Auth Failure",
            weight=hdr_weight,
            description=header_result.auth_summary + " | " + "; ".join(header_result.inconsistencies[:2])
        ))

    # 4. Attachment Security
    for att in attachments:
        if att.is_executable_or_script:
            att_weight = 20.0
            raw_rule_points += att_weight
            factors.append(RiskBreakdownFactor(
                category="Attachment",
                factor=f"Executable/Script File: {att.filename}",
                weight=att_weight,
                description=f"Dangerous extension '.{att.extension}' detected"
            ))

    # 5. ML Component: Phishing Probability
    # ML contributes up to 25 points directly into the hybrid composite score
    ml_points = round(ml_prediction.phishing_probability * 25.0, 1)
    if ml_prediction.phishing_probability >= 0.5:
        factors.append(RiskBreakdownFactor(
            category="Machine Learning",
            factor=f"ML Phishing Probability ({int(ml_prediction.phishing_probability * 100)}%)",
            weight=ml_points,
            description=f"Logistic Regression classifier scored text with {ml_prediction.phishing_probability:.1%} phishing confidence."
        ))
    else:
        factors.append(RiskBreakdownFactor(
            category="Machine Learning",
            factor=f"ML Legitimate Baseline ({int(ml_prediction.legitimate_probability * 100)}% legit)",
            weight=ml_points,
            description="ML model assessed text closer to legitimate communications."
        ))

    # Total score calculation:
    # Cap rule points at 75 max, and add ML points (up to 25)
    capped_rule_points = min(75.0, raw_rule_points)
    total_score = min(100.0, round(capped_rule_points + ml_points, 1))

    # Determine classification level:
    # 0–24: LOW, 25–49: MEDIUM, 50–74: HIGH, 75–100: CRITICAL
    if total_score >= 75.0:
        risk_level = "CRITICAL"
    elif total_score >= 50.0:
        risk_level = "HIGH"
    elif total_score >= 25.0:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return RiskAssessment(
        total_score=total_score,
        risk_level=risk_level,
        factors=factors,
        ml_weight=ml_points,
        rules_weight=capped_rule_points
    )
