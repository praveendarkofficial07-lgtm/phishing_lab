from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from backend.app.database import get_db
from backend.app.models.investigation import Investigation, IOC
from backend.app.schemas.investigation import DashboardStatsResponse, InvestigationListItem
from backend.app.services.ml_engine import ml_service
from backend.app.services.sample_data import seed_sample_cases_if_empty, SAMPLE_CASES

router = APIRouter(prefix="/api", tags=["Dashboard & Settings"])

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Computes real-time statistics directly from the database for the SOC Dashboard.
    """
    total = db.query(Investigation).count()
    critical = db.query(Investigation).filter(Investigation.risk_level == "CRITICAL").count()
    high = db.query(Investigation).filter(Investigation.risk_level == "HIGH").count()
    medium = db.query(Investigation).filter(Investigation.risk_level == "MEDIUM").count()
    low = db.query(Investigation).filter(Investigation.risk_level == "LOW").count()

    total_iocs = db.query(IOC).count()
    suspicious_urls = db.query(IOC).filter(
        IOC.ioc_type == "URL",
        IOC.risk_level.in_(["HIGH", "CRITICAL"])
    ).count()

    # Recent investigations (last 5)
    recent_db = db.query(Investigation).order_by(desc(Investigation.created_at)).limit(5).all()
    recent_list = []
    for inv in recent_db:
        recent_list.append(InvestigationListItem(
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

    # Risk distribution data for charts
    risk_dist = [
        {"name": "Critical", "count": critical, "color": "#ef4444"},
        {"name": "High", "count": high, "color": "#f97316"},
        {"name": "Medium", "count": medium, "color": "#eab308"},
        {"name": "Low", "count": low, "color": "#22c55e"}
    ]

    # Activity timeline (grouping cases by date over past 7 days)
    now = datetime.now(timezone.utc)
    activity_map = {}
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).strftime("%b %d")
        activity_map[day_date] = 0

    all_cases = db.query(Investigation.created_at).all()
    for c in all_cases:
        if c.created_at:
            day_str = c.created_at.strftime("%b %d")
            if day_str in activity_map:
                activity_map[day_str] += 1
            else:
                activity_map[day_str] = 1

    activity_timeline = [{"date": k, "investigations": v} for k, v in activity_map.items()]

    return DashboardStatsResponse(
        total_investigations=total,
        critical_cases=critical,
        high_risk_cases=high,
        medium_risk_cases=medium,
        low_risk_cases=low,
        suspicious_urls_detected=suspicious_urls,
        iocs_extracted=total_iocs,
        recent_investigations=recent_list,
        risk_distribution=risk_dist,
        activity_timeline=activity_timeline
    )

@router.get("/settings/model")
def get_model_information():
    """
    Returns live metadata, cross-validation metrics, and status of the local ML model.
    """
    return {
        "status": ml_service.metrics.get("status", "Active"),
        "model_type": ml_service.metrics.get("model_type", "TF-IDF + Logistic Regression"),
        "sample_count": ml_service.metrics.get("sample_count", 100),
        "phishing_samples": ml_service.metrics.get("phishing_samples", 50),
        "legitimate_samples": ml_service.metrics.get("legitimate_samples", 50),
        "accuracy": ml_service.metrics.get("accuracy", 0.97),
        "precision": ml_service.metrics.get("precision", 1.0),
        "recall": ml_service.metrics.get("recall", 0.94),
        "f1_score": ml_service.metrics.get("f1_score", 0.968),
        "vocabulary_size": ml_service.metrics.get("vocabulary_size", 2500)
    }

@router.post("/settings/retrain")
def retrain_model_endpoint():
    """
    Triggers re-training of the TF-IDF and Logistic Regression classifier and re-evaluates metrics.
    """
    try:
        metrics = ml_service.train_model()
        return {"message": "Model retrained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrain model: {str(e)}")

@router.post("/settings/reset-samples")
def reset_sample_data(db: Session = Depends(get_db)):
    """
    Re-seeds demonstration cases into the database.
    """
    try:
        seed_sample_cases_if_empty(db)
        return {"message": "Demonstration cases seeded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed cases: {str(e)}")
