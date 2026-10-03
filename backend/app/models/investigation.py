from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(32), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    analyst_name = Column(String(100), default="Security Analyst")
    description = Column(Text, default="")
    priority = Column(String(20), default="Medium")
    status = Column(String(30), default="Open")  # Open, Investigating, Contained, Resolved, False Positive

    # Email details
    sender = Column(String(255), default="")
    recipient = Column(String(255), default="")
    subject = Column(String(255), default="")
    email_date = Column(String(100), default="")
    reply_to = Column(String(255), default="")
    body_plain = Column(Text, default="")
    body_html = Column(Text, default="")
    raw_headers = Column(Text, default="")

    # Analysis Results
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String(20), default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    ml_probability = Column(Float, default=0.0)
    ml_verdict = Column(String(20), default="Legitimate")
    analysis_summary = Column(Text, default="")
    explainability = Column(Text, default="[]")  # JSON list of reasoning points
    indicators = Column(Text, default="[]")      # JSON list of detected indicators
    url_analysis = Column(Text, default="[]")    # JSON list of evaluated URLs
    header_analysis = Column(Text, default="{}") # JSON dict of header parsing results
    attachment_info = Column(Text, default="[]") # JSON list of attachments
    recommended_actions = Column(Text, default="[]") # JSON list of defensive actions

    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    iocs = relationship("IOC", back_populates="investigation", cascade="all, delete-orphan")
    notes = relationship("AnalystNote", back_populates="investigation", cascade="all, delete-orphan", order_by="AnalystNote.created_at.desc()")
    timeline = relationship("TimelineEvent", back_populates="investigation", cascade="all, delete-orphan", order_by="TimelineEvent.timestamp.asc()")
    evidence = relationship("EvidenceItem", back_populates="investigation", cascade="all, delete-orphan")


class IOC(Base):
    __tablename__ = "iocs"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    ioc_type = Column(String(20), nullable=False)  # URL, Domain, IP, Email, Hash
    value = Column(String(500), nullable=False, index=True)
    risk_level = Column(String(20), default="LOW")
    context = Column(String(255), default="")
    first_seen = Column(DateTime, default=utc_now)
    last_seen = Column(DateTime, default=utc_now)

    investigation = relationship("Investigation", back_populates="iocs")


class AnalystNote(Base):
    __tablename__ = "analyst_notes"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    author = Column(String(100), default="Analyst")
    note = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    investigation = relationship("Investigation", back_populates="notes")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # Creation, Analysis, Status Change, Note Added, etc.
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=utc_now)

    investigation = relationship("Investigation", back_populates="timeline")


class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = Column(String(50), default="Text")
    name = Column(String(255), nullable=False)
    value = Column(Text, default="")
    description = Column(Text, default="")
    sha256 = Column(String(64), default="")
    created_at = Column(DateTime, default=utc_now)

    investigation = relationship("Investigation", back_populates="evidence")
