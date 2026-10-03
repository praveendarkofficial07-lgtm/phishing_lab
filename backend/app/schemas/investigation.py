from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from backend.app.schemas.analysis import (
    FullAnalysisResponse,
    ExtractedIOC,
    AttachmentMetadata,
    ContentIndicator,
    URLAnalysisResult,
    HeaderAnalysisResult,
    MLPredictionResult
)

class NoteCreate(BaseModel):
    author: Optional[str] = "Analyst"
    note: str

class NoteResponse(BaseModel):
    id: int
    investigation_id: int
    author: str
    note: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TimelineCreate(BaseModel):
    event_type: str
    description: str

class TimelineResponse(BaseModel):
    id: int
    investigation_id: int
    event_type: str
    description: str
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class EvidenceCreate(BaseModel):
    item_type: str = "Text"
    name: str
    value: str = ""
    description: str = ""
    sha256: str = ""

class EvidenceResponse(BaseModel):
    id: int
    investigation_id: int
    item_type: str
    name: str
    value: str
    description: str
    sha256: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class IOCResponse(BaseModel):
    id: int
    investigation_id: int
    ioc_type: str
    value: str
    risk_level: str
    context: str
    first_seen: datetime
    last_seen: datetime
    model_config = ConfigDict(from_attributes=True)

class InvestigationCreate(BaseModel):
    title: str
    analyst_name: Optional[str] = "Security Analyst"
    description: Optional[str] = ""
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Open"
    sender: Optional[str] = ""
    recipient: Optional[str] = ""
    subject: Optional[str] = ""
    email_date: Optional[str] = ""
    reply_to: Optional[str] = ""
    body_plain: Optional[str] = ""
    body_html: Optional[str] = ""
    raw_headers: Optional[str] = ""
    manual_urls: Optional[List[str]] = []
    attachments: Optional[List[AttachmentMetadata]] = []

class InvestigationStatusUpdate(BaseModel):
    status: str

class InvestigationResponse(BaseModel):
    id: int
    case_id: str
    title: str
    analyst_name: str
    description: str
    priority: str
    status: str
    sender: str
    recipient: str
    subject: str
    email_date: str
    reply_to: str
    body_plain: str
    body_html: str
    raw_headers: str
    risk_score: float
    risk_level: str
    ml_probability: float
    ml_verdict: str
    analysis_summary: str
    explainability: List[Any] = []
    indicators: List[dict] = []
    url_analysis: List[dict] = []
    header_analysis: dict = {}
    attachment_info: List[dict] = []
    recommended_actions: List[str] = []
    created_at: datetime
    updated_at: datetime
    iocs: List[IOCResponse] = []
    notes: List[NoteResponse] = []
    timeline: List[TimelineResponse] = []
    evidence: List[EvidenceResponse] = []
    model_config = ConfigDict(from_attributes=True)

class InvestigationListItem(BaseModel):
    id: int
    case_id: str
    title: str
    analyst_name: str
    priority: str
    status: str
    sender: str
    subject: str
    risk_score: float
    risk_level: str
    created_at: datetime
    ioc_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class DashboardStatsResponse(BaseModel):
    total_investigations: int
    critical_cases: int
    high_risk_cases: int
    medium_risk_cases: int
    low_risk_cases: int
    suspicious_urls_detected: int
    iocs_extracted: int
    recent_investigations: List[InvestigationListItem]
    risk_distribution: List[dict]
    activity_timeline: List[dict]
