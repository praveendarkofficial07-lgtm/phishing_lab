import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from backend.app.database import get_db
from backend.app.models.investigation import Investigation, IOC, AnalystNote, TimelineEvent, EvidenceItem
from backend.app.schemas.investigation import (
    InvestigationCreate,
    InvestigationResponse,
    InvestigationListItem,
    InvestigationStatusUpdate,
    NoteCreate,
    NoteResponse,
    TimelineCreate,
    TimelineResponse,
    EvidenceCreate,
    EvidenceResponse,
    IOCResponse
)
from backend.app.schemas.analysis import FullAnalysisRequest, AttachmentMetadata
from backend.app.services.pipeline import run_investigation_pipeline
from backend.app.services.report_service import generate_pdf_report

router = APIRouter(prefix="/api", tags=["Investigations"])

def generate_case_id(db: Session) -> str:
    current_year = datetime.now().year
    count = db.query(Investigation).count() + 1
    return f"PH-{current_year}-{count:04d}"

@router.post("/investigations", response_model=InvestigationResponse)
def create_investigation(case_in: InvestigationCreate, db: Session = Depends(get_db)):
    """
    Submits a suspicious email for full investigation.
    Executes automated ML and heuristic pipelines and persists case artifacts.
    """
    if not case_in.title.strip():
        raise HTTPException(status_code=400, detail="Case title is required.")

    case_id = generate_case_id(db)

    # Run analysis pipeline
    analysis_req = FullAnalysisRequest(
        sender=case_in.sender or "",
        recipient=case_in.recipient or "",
        subject=case_in.subject or "",
        reply_to=case_in.reply_to or "",
        body_plain=case_in.body_plain or "",
        body_html=case_in.body_html or "",
        raw_headers=case_in.raw_headers or "",
        manual_urls=case_in.manual_urls or [],
        attachments=case_in.attachments or []
    )
    analysis_res = run_investigation_pipeline(analysis_req)

    # Determine initial status
    initial_status = case_in.status or ("Investigating" if analysis_res.risk_score >= 50 else "Open")

    investigation = Investigation(
        case_id=case_id,
        title=case_in.title,
        analyst_name=case_in.analyst_name or "Security Analyst",
        description=case_in.description or "",
        priority=case_in.priority or "Medium",
        status=initial_status,
        sender=case_in.sender or "",
        recipient=case_in.recipient or "",
        subject=case_in.subject or "",
        email_date=case_in.email_date or datetime.now().strftime("%a, %d %b %Y %H:%M:%S UTC"),
        reply_to=case_in.reply_to or "",
        body_plain=case_in.body_plain or "",
        body_html=case_in.body_html or "",
        raw_headers=case_in.raw_headers or "",
        risk_score=analysis_res.risk_score,
        risk_level=analysis_res.risk_level,
        ml_probability=analysis_res.ml_prediction.phishing_probability,
        ml_verdict=analysis_res.ml_prediction.verdict,
        analysis_summary=analysis_res.analysis_summary,
        explainability=json.dumps([p for p in analysis_res.explainability.evidence_points]),
        indicators=json.dumps([ind.model_dump() for ind in analysis_res.content_indicators]),
        url_analysis=json.dumps([u.model_dump() for u in analysis_res.url_analysis]),
        header_analysis=json.dumps(analysis_res.header_analysis.model_dump()),
        attachment_info=json.dumps([att.model_dump() for att in analysis_res.attachments]),
        recommended_actions=json.dumps(analysis_res.recommended_actions)
    )
    db.add(investigation)
    db.flush()

    # Save IOCs
    for ioc in analysis_res.extracted_iocs:
        ioc_record = IOC(
            investigation_id=investigation.id,
            ioc_type=ioc.ioc_type,
            value=ioc.value,
            risk_level=ioc.risk_level,
            context=ioc.context
        )
        db.add(ioc_record)

    # Save initial timeline events
    db.add(TimelineEvent(
        investigation_id=investigation.id,
        event_type="Case Created",
        description=f"Investigation {case_id} registered by {investigation.analyst_name}."
    ))
    db.add(TimelineEvent(
        investigation_id=investigation.id,
        event_type="Analysis Pipeline Completed",
        description=f"System evaluated case as {analysis_res.risk_level} (Score: {analysis_res.risk_score}/100, ML: {analysis_res.ml_prediction.phishing_probability:.1%})."
    ))

    # Add initial note if description provided
    if case_in.description:
        db.add(AnalystNote(
            investigation_id=investigation.id,
            author=investigation.analyst_name,
            note=case_in.description
        ))

    db.commit()
    db.refresh(investigation)
    return format_investigation_response(investigation)

def format_investigation_response(inv: Investigation) -> dict:
    try:
        expl = json.loads(inv.explainability) if inv.explainability else []
    except Exception:
        expl = []
    try:
        inds = json.loads(inv.indicators) if inv.indicators else []
    except Exception:
        inds = []
    try:
        urls = json.loads(inv.url_analysis) if inv.url_analysis else []
    except Exception:
        urls = []
    try:
        hdrs = json.loads(inv.header_analysis) if inv.header_analysis else {}
    except Exception:
        hdrs = {}
    try:
        atts = json.loads(inv.attachment_info) if inv.attachment_info else []
    except Exception:
        atts = []
    try:
        acts = json.loads(inv.recommended_actions) if inv.recommended_actions else []
    except Exception:
        acts = []

    return {
        "id": inv.id,
        "case_id": inv.case_id,
        "title": inv.title,
        "analyst_name": inv.analyst_name,
        "description": inv.description or "",
        "priority": inv.priority,
        "status": inv.status,
        "sender": inv.sender or "",
        "recipient": inv.recipient or "",
        "subject": inv.subject or "",
        "email_date": inv.email_date or "",
        "reply_to": inv.reply_to or "",
        "body_plain": inv.body_plain or "",
        "body_html": inv.body_html or "",
        "raw_headers": inv.raw_headers or "",
        "risk_score": inv.risk_score,
        "risk_level": inv.risk_level,
        "ml_probability": inv.ml_probability,
        "ml_verdict": inv.ml_verdict,
        "analysis_summary": inv.analysis_summary or "",
        "explainability": expl,
        "indicators": inds,
        "url_analysis": urls,
        "header_analysis": hdrs,
        "attachment_info": atts,
        "recommended_actions": acts,
        "created_at": inv.created_at,
        "updated_at": inv.updated_at,
        "iocs": inv.iocs,
        "notes": inv.notes,
        "timeline": inv.timeline,
        "evidence": inv.evidence
    }

@router.get("/investigations", response_model=List[InvestigationListItem])
def list_investigations(
    risk: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns filtered and sorted list of investigations.
    """
    query = db.query(Investigation)

    if risk and risk.upper() != "ALL":
        query = query.filter(Investigation.risk_level == risk.upper())

    if status and status.upper() != "ALL":
        query = query.filter(Investigation.status == status)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Investigation.title.ilike(term),
                Investigation.case_id.ilike(term),
                Investigation.sender.ilike(term),
                Investigation.subject.ilike(term),
                Investigation.analyst_name.ilike(term)
            )
        )

    investigations = query.order_by(desc(Investigation.created_at)).all()

    result = []
    for inv in investigations:
        result.append(InvestigationListItem(
            id=inv.id,
            case_id=inv.case_id,
            title=inv.title,
            analyst_name=inv.analyst_name,
            priority=inv.priority,
            status=inv.status,
            sender=inv.sender or "",
            subject=inv.subject or "",
            risk_score=inv.risk_score,
            risk_level=inv.risk_level,
            created_at=inv.created_at,
            ioc_count=len(inv.iocs)
        ))
    return result

@router.get("/investigations/{inv_id}", response_model=InvestigationResponse)
def get_investigation_details(inv_id: int, db: Session = Depends(get_db)):
    """
    Retrieves full investigation dossier including evidence, IOCs, and notes.
    """
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation with ID {inv_id} not found.")
    return format_investigation_response(inv)

@router.patch("/investigations/{inv_id}/status")
def update_investigation_status(inv_id: int, body: InvestigationStatusUpdate, db: Session = Depends(get_db)):
    """
    Updates investigation workflow status (Open, Investigating, Contained, Resolved, False Positive).
    """
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    valid_statuses = ["Open", "Investigating", "Contained", "Resolved", "False Positive"]
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    old_status = inv.status
    inv.status = body.status
    inv.updated_at = datetime.now(timezone.utc)

    # Add timeline event
    db.add(TimelineEvent(
        investigation_id=inv.id,
        event_type="Status Changed",
        description=f"Status transitioned from '{old_status}' to '{body.status}'."
    ))

    db.commit()
    return {"message": "Status updated successfully", "new_status": body.status}

@router.delete("/investigations/{inv_id}")
def delete_investigation(inv_id: int, db: Session = Depends(get_db)):
    """
    Permanently removes an investigation and all associated artifacts.
    """
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    case_id = inv.case_id
    db.delete(inv)
    db.commit()
    return {"message": f"Investigation {case_id} deleted successfully."}

@router.post("/investigations/{inv_id}/notes", response_model=NoteResponse)
def add_analyst_note(inv_id: int, note_in: NoteCreate, db: Session = Depends(get_db)):
    """
    Adds an analyst note and logs a timeline entry.
    """
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    if not note_in.note.strip():
        raise HTTPException(status_code=400, detail="Note content cannot be empty.")

    note = AnalystNote(
        investigation_id=inv.id,
        author=note_in.author or "Analyst",
        note=note_in.note
    )
    db.add(note)

    db.add(TimelineEvent(
        investigation_id=inv.id,
        event_type="Analyst Note Added",
        description=f"{note.author} recorded an investigation note."
    ))

    db.commit()
    db.refresh(note)
    return note

@router.post("/investigations/{inv_id}/timeline", response_model=TimelineResponse)
def add_timeline_event(inv_id: int, event_in: TimelineCreate, db: Session = Depends(get_db)):
    """
    Records an investigator timeline event.
    """
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    event = TimelineEvent(
        investigation_id=inv.id,
        event_type=event_in.event_type,
        description=event_in.description
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.post("/investigations/{inv_id}/evidence", response_model=EvidenceResponse)
def add_evidence(inv_id: int, ev_in: EvidenceCreate, db: Session = Depends(get_db)):
    """
    Records a textual or artifact evidence item for the case.
    """
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    ev = EvidenceItem(
        investigation_id=inv.id,
        item_type=ev_in.item_type,
        name=ev_in.name,
        value=ev_in.value,
        description=ev_in.description,
        sha256=ev_in.sha256
    )
    db.add(ev)

    db.add(TimelineEvent(
        investigation_id=inv.id,
        event_type="Evidence Attached",
        description=f"Evidence artifact '{ev.name}' added to case."
    ))

    db.commit()
    db.refresh(ev)
    return ev

@router.get("/investigations/{inv_id}/report")
def export_investigation_report(inv_id: int, db: Session = Depends(get_db)):
    """
    Generates and downloads a formal PDF investigation report.
    """
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    try:
        pdf_stream = generate_pdf_report(inv)
        filename = f"{inv.case_id}_Investigation_Report.pdf"
        return Response(
            content=pdf_stream.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")

@router.get("/iocs")
def get_all_iocs(
    ioc_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    IOC Explorer: lists extracted IOCs across all investigations.
    """
    query = db.query(IOC).join(Investigation)

    if ioc_type and ioc_type.upper() != "ALL":
        query = query.filter(IOC.ioc_type.ilike(ioc_type))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                IOC.value.ilike(term),
                IOC.context.ilike(term),
                Investigation.case_id.ilike(term)
            )
        )

    iocs = query.order_by(desc(IOC.last_seen)).all()

    results = []
    for item in iocs:
        results.append({
            "id": item.id,
            "investigation_id": item.investigation_id,
            "case_id": item.investigation.case_id if item.investigation else "N/A",
            "case_title": item.investigation.title if item.investigation else "N/A",
            "ioc_type": item.ioc_type,
            "value": item.value,
            "risk_level": item.risk_level,
            "context": item.context,
            "first_seen": item.first_seen,
            "last_seen": item.last_seen
        })
    return results
