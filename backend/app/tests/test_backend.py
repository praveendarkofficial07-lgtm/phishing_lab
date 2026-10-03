import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.analyzers.url_analyzer import analyze_url
from backend.app.analyzers.header_analyzer import analyze_headers
from backend.app.analyzers.content_analyzer import analyze_email_content
from backend.app.analyzers.ioc_extractor import extract_all_iocs
from backend.app.analyzers.risk_scorer import compute_investigation_risk
from backend.app.services.ml_engine import ml_service
from backend.app.schemas.analysis import (
    FullAnalysisRequest,
    MLPredictionResult,
    AttachmentMetadata
)

from backend.app.database import init_db

init_db()
client = TestClient(app)

def test_url_analyzer_suspicious():
    url = "http://login-microsoft365-verify.com/auth/verify?session=123"
    res = analyze_url(url)
    assert res.is_https is False
    assert res.matched_brand == "Microsoft"
    assert res.credential_related_path is True
    assert res.risk_score >= 50
    assert res.risk_level in ("HIGH", "CRITICAL")

def test_url_analyzer_legitimate():
    url = "https://wiki.target-enterprise.com/display/ENG/Notes"
    res = analyze_url(url)
    assert res.is_https is True
    assert res.is_ip_address is False
    assert res.risk_level == "LOW"

def test_header_analyzer_spf_fail_and_reply_to_mismatch():
    headers = (
        "From: IT Admin <admin@company.com>\n"
        "Reply-To: evil@attacker-server.xyz\n"
        "Subject: Password Expired\n"
        "Authentication-Results: spf=fail; dkim=none\n"
    )
    res = analyze_headers(headers)
    assert res.spf == "FAIL"
    assert any("From domain" in inc for inc in res.inconsistencies)
    assert res.risk_score >= 30

def test_content_analyzer_phishing_triggers():
    text = "URGENT: Your account will be suspended within 24 hours. Enter your password immediately."
    inds = analyze_email_content(text, "Urgent Notice")
    assert len(inds) >= 2
    ind_names = [i.indicator for i in inds]
    assert any("Urgency" in name for name in ind_names)
    assert any("Suspension" in name or "Credential" in name for name in ind_names)

def test_content_analyzer_safe_text():
    text = "Hi Team, here is the weekly engineering sprint update. PRs look good."
    inds = analyze_email_content(text, "Sprint Update")
    assert len(inds) == 0

def test_ioc_extraction():
    sample_text = (
        "Check this link: http://malicious-domain.com/login and send details to attacker@hacker.io. "
        "Server IP is 194.26.29.112 and payload hash is e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    )
    iocs = extract_all_iocs(sample_text)
    types = {i.ioc_type for i in iocs}
    assert "URL" in types
    assert "Domain" in types
    assert "Email" in types
    assert "IP" in types
    assert "Hash" in types

def test_ml_model_prediction():
    phish_res = ml_service.predict("URGENT: Your Microsoft 365 password expires in 2 hours. Log in here to verify: http://evil.com")
    assert phish_res["phishing_probability"] >= 0.5
    assert phish_res["verdict"] == "Phishing"

    legit_res = ml_service.predict("Hi Team, sprint retrospective notes have been published in Confluence. Have a great weekend.")
    assert legit_res["legitimate_probability"] >= 0.5
    assert legit_res["verdict"] == "Legitimate"

def test_api_full_workflow():
    # 1. Analyze endpoint
    analyze_resp = client.post("/api/analyze", json={
        "sender": "attacker@fake-bank.cc",
        "recipient": "victim@target.com",
        "subject": "Urgent: Account Suspended within 24 hours",
        "body_plain": "Immediate action required. Verify your credentials here: http://fake-bank.cc/verify",
        "raw_headers": "From: attacker@fake-bank.cc\nReply-To: loot@evil.xyz\nAuthentication-Results: spf=fail"
    })
    assert analyze_resp.status_code == 200
    data = analyze_resp.json()
    assert data["risk_score"] >= 50
    assert data["risk_level"] in ("HIGH", "CRITICAL")
    assert len(data["content_indicators"]) > 0
    assert len(data["extracted_iocs"]) > 0

    # 2. Create case
    create_resp = client.post("/api/investigations", json={
        "title": "Automated Test Case: Suspicious Banking Message",
        "analyst_name": "Test Runner",
        "priority": "High",
        "sender": "attacker@fake-bank.cc",
        "recipient": "victim@target.com",
        "subject": "Urgent: Account Suspended within 24 hours",
        "body_plain": "Immediate action required. Verify your credentials here: http://fake-bank.cc/verify",
        "raw_headers": "From: attacker@fake-bank.cc\nReply-To: loot@evil.xyz\nAuthentication-Results: spf=fail"
    })
    assert create_resp.status_code == 200
    case = create_resp.json()
    inv_id = case["id"]
    assert case["case_id"].startswith("PH-")

    # 3. Retrieve case details
    get_resp = client.get(f"/api/investigations/{inv_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == inv_id

    # 4. Add analyst note
    note_resp = client.post(f"/api/investigations/{inv_id}/notes", json={
        "author": "Test Analyst",
        "note": "Initial triage confirmed credential harvesting URL."
    })
    assert note_resp.status_code == 200
    assert note_resp.json()["note"] == "Initial triage confirmed credential harvesting URL."

    # 5. Update case status
    status_resp = client.patch(f"/api/investigations/{inv_id}/status", json={
        "status": "Contained"
    })
    assert status_resp.status_code == 200
    assert status_resp.json()["new_status"] == "Contained"

    # 6. Generate and download PDF report
    report_resp = client.get(f"/api/investigations/{inv_id}/report")
    assert report_resp.status_code == 200
    assert report_resp.headers["content-type"] == "application/pdf"
    assert len(report_resp.content) > 1000

    # 7. Verify Dashboard statistics
    stats_resp = client.get("/api/dashboard/stats")
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total_investigations"] >= 1
    assert stats["iocs_extracted"] >= 1
