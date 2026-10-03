from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ContentIndicator(BaseModel):
    indicator: str
    evidence: str
    severity: str  # Low, Medium, High, Critical
    explanation: str
    score_contribution: float = 0.0

class URLAnalysisResult(BaseModel):
    url: str
    scheme: str
    domain: str
    subdomain: str
    port: Optional[str] = None
    path: str
    query: str
    fragment: str
    is_ip_address: bool = False
    is_https: bool = True
    suspicious_tld: bool = False
    is_punycode: bool = False
    has_url_encoding: bool = False
    excessive_length: bool = False
    suspicious_keywords: List[str] = []
    credential_related_path: bool = False
    redirect_like_params: bool = False
    has_at_symbol: bool = False
    risk_score: float = 0.0
    risk_level: str = "LOW"
    risk_indicators: List[str] = []
    matched_brand: Optional[str] = None

class HeaderAnalysisResult(BaseModel):
    from_header: Optional[str] = None
    to_header: Optional[str] = None
    reply_to: Optional[str] = None
    return_path: Optional[str] = None
    message_id: Optional[str] = None
    date: Optional[str] = None
    originating_ip: Optional[str] = None
    received_hops_count: int = 0
    received_chain: List[str] = []
    spf: str = "UNKNOWN"       # PASS, FAIL, NONE / NOT PROVIDED, UNKNOWN
    dkim: str = "UNKNOWN"      # PASS, FAIL, NONE / NOT PROVIDED, UNKNOWN
    dmarc: str = "UNKNOWN"     # PASS, FAIL, NONE / NOT PROVIDED, UNKNOWN
    auth_summary: str = ""
    inconsistencies: List[str] = []
    risk_score: float = 0.0
    risk_level: str = "LOW"
    findings: List[str] = []

class ExtractedIOC(BaseModel):
    ioc_type: str  # URL, Domain, IP, Email, Hash
    value: str
    risk_level: str = "LOW"
    context: str = ""

class AttachmentMetadata(BaseModel):
    filename: str
    extension: str = ""
    sha256: str = ""
    mime_type: str = ""
    size_bytes: Optional[int] = None
    is_executable_or_script: bool = False
    risk_level: str = "LOW"
    findings: List[str] = []

class MLPredictionResult(BaseModel):
    phishing_probability: float
    legitimate_probability: float
    verdict: str
    model_version: str
    feature_importances: List[Dict[str, Any]] = []

class RiskBreakdownFactor(BaseModel):
    category: str
    factor: str
    weight: float
    description: str

class RiskAssessment(BaseModel):
    total_score: float
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    factors: List[RiskBreakdownFactor] = []
    ml_weight: float = 25.0
    rules_weight: float = 75.0

class ExplainabilityInsight(BaseModel):
    title: str
    evidence_points: List[str]
    verdict_explanation: str
    recommended_mitigation: List[str]

class FullAnalysisRequest(BaseModel):
    sender: Optional[str] = ""
    recipient: Optional[str] = ""
    subject: Optional[str] = ""
    reply_to: Optional[str] = ""
    body_plain: Optional[str] = ""
    body_html: Optional[str] = ""
    raw_headers: Optional[str] = ""
    manual_urls: Optional[List[str]] = []
    attachments: Optional[List[AttachmentMetadata]] = []

class FullAnalysisResponse(BaseModel):
    risk_score: float
    risk_level: str
    ml_prediction: MLPredictionResult
    content_indicators: List[ContentIndicator]
    url_analysis: List[URLAnalysisResult]
    header_analysis: HeaderAnalysisResult
    extracted_iocs: List[ExtractedIOC]
    attachments: List[AttachmentMetadata]
    risk_breakdown: RiskAssessment
    explainability: ExplainabilityInsight
    recommended_actions: List[str]
    analysis_summary: str

class URLAnalyzeRequest(BaseModel):
    url: str

class HeadersAnalyzeRequest(BaseModel):
    raw_headers: str

class IOCExtractRequest(BaseModel):
    text: str
