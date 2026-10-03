from typing import List, Dict, Any

SAMPLE_CASES: List[Dict[str, Any]] = [
    {
        "id": "sample-1",
        "title": "[DEMO] Fake Microsoft 365 Password Expiration Alert",
        "case_id_tag": "PH-DEMO-001",
        "category": "Credential Harvesting",
        "analyst_name": "Senior SOC Analyst",
        "priority": "Critical",
        "sender": "Microsoft IT Support <admin-support@login-microsoft365-verify.com>",
        "recipient": "employee@target-enterprise.com",
        "subject": "CRITICAL ALERT: Your Microsoft 365 Password Expires in 2 Hours",
        "email_date": "Mon, 28 Sep 2026 09:14:22 +0000",
        "reply_to": "credential-harvesting@attacker-infrastructure.xyz",
        "body_plain": (
            "[TRAINING / DEMONSTRATION DATA - SYNTHETIC PHISHING CASE]\n\n"
            "Dear User,\n\n"
            "Your Microsoft 365 corporate account password will expire in 2 hours.\n"
            "Failure to update your password immediately will result in your corporate mailbox and SharePoint access being permanently deactivated.\n\n"
            "To keep your current password and prevent service disruption, please verify your credentials immediately at the link below:\n\n"
            "http://login-microsoft365-verify.com/auth/verify?session=92841&redirect=portal\n\n"
            "This is an automated security notification. Do not ignore.\n\n"
            "IT Helpdesk & Global Security Operations"
        ),
        "raw_headers": (
            "From: \"Microsoft IT Support\" <admin-support@login-microsoft365-verify.com>\n"
            "To: <employee@target-enterprise.com>\n"
            "Subject: CRITICAL ALERT: Your Microsoft 365 Password Expires in 2 Hours\n"
            "Date: Mon, 28 Sep 2026 09:14:22 +0000\n"
            "Message-ID: <20260928091422.991204@mail.login-microsoft365-verify.com>\n"
            "Reply-To: <credential-harvesting@attacker-infrastructure.xyz>\n"
            "Return-Path: <bounce@unverified-relay-mailer.net>\n"
            "Received: from unverified-relay-mailer.net (unverified-relay-mailer.net [185.193.88.42])\n"
            "    by mx.target-enterprise.com with ESMTP id 8f812b1\n"
            "    for <employee@target-enterprise.com>; Mon, 28 Sep 2026 09:14:25 +0000\n"
            "Authentication-Results: mx.target-enterprise.com; spf=fail (sender IP 185.193.88.42); dkim=fail; dmarc=fail"
        ),
        "manual_urls": [
            "http://login-microsoft365-verify.com/auth/verify?session=92841&redirect=portal"
        ],
        "attachments": []
    },
    {
        "id": "sample-2",
        "title": "[DEMO] Fake Banking Wire Verification & Account Freeze Alert",
        "case_id_tag": "PH-DEMO-002",
        "category": "Financial Scam",
        "analyst_name": "Incident Responder",
        "priority": "High",
        "sender": "Chase Fraud Prevention Desk <security-alert@chase-bank-account-protection.link>",
        "recipient": "finance-dept@target-enterprise.com",
        "subject": "Urgent: Unauthorized Wire Transfer Detected ($8,500.00)",
        "email_date": "Mon, 28 Sep 2026 11:20:00 +0000",
        "reply_to": "fraud-intake@chase-bank-account-protection.link",
        "body_plain": (
            "[TRAINING / DEMONSTRATION DATA - SYNTHETIC PHISHING CASE]\n\n"
            "Notice of Suspicious Activity:\n\n"
            "A wire transfer of $8,500.00 to an overseas recipient in Eastern Europe was initiated from your commercial business checking account.\n"
            "If you did NOT authorize this transaction, you must act now. Your account will be temporarily frozen within 24 hours to prevent total loss of funds.\n\n"
            "Log in now to cancel this wire transfer and confirm your PIN:\n"
            "http://chase-bank-account-protection.link/login/dispute?token=abf912\n\n"
            "Customer Protection Department\nChase Bank Commercial Services"
        ),
        "raw_headers": (
            "From: \"Chase Fraud Prevention Desk\" <security-alert@chase-bank-account-protection.link>\n"
            "To: <finance-dept@target-enterprise.com>\n"
            "Subject: Urgent: Unauthorized Wire Transfer Detected ($8,500.00)\n"
            "Date: Mon, 28 Sep 2026 11:20:00 +0000\n"
            "Message-ID: <fraud-alert-202609281120@chase-bank-account-protection.link>\n"
            "Reply-To: <fraud-intake@chase-bank-account-protection.link>\n"
            "Return-Path: <bounces@chase-bank-account-protection.link>\n"
            "Received: from 194.26.29.112 by relay.securemail.org with SMTP; Mon, 28 Sep 2026 11:20:04 +0000\n"
            "Authentication-Results: mx.target-enterprise.com; spf=fail; dkim=none; dmarc=fail"
        ),
        "manual_urls": [
            "http://chase-bank-account-protection.link/login/dispute?token=abf912"
        ],
        "attachments": []
    },
    {
        "id": "sample-3",
        "title": "[DEMO] Fake DHL Parcel Delivery & Customs Fee Smishing/Phish",
        "case_id_tag": "PH-DEMO-003",
        "category": "Delivery Scam",
        "analyst_name": "Tier 1 Analyst",
        "priority": "Medium",
        "sender": "DHL Express Tracking <dispatch@track-dhl-parcel-service.top>",
        "recipient": "logistics@target-enterprise.com",
        "subject": "Your package #DHL-981249 is pending customs duty payment",
        "email_date": "Sun, 27 Sep 2026 14:02:18 +0000",
        "reply_to": "dispatch@track-dhl-parcel-service.top",
        "body_plain": (
            "[TRAINING / DEMONSTRATION DATA - SYNTHETIC PHISHING CASE]\n\n"
            "DHL Express International Notification:\n\n"
            "We attempted to deliver your parcel #DHL-981249 today, but delivery attempt failed due to an incomplete delivery address and an unpaid customs duty fee of $2.45.\n\n"
            "Please update delivery address and remit payment within 12 hours, otherwise the parcel will be returned to the international sender:\n"
            "http://track-dhl-parcel-service.top/pay/clearance?item=DHL981249\n\n"
            "Thank you for choosing DHL Worldwide Express."
        ),
        "raw_headers": (
            "From: \"DHL Express Tracking\" <dispatch@track-dhl-parcel-service.top>\n"
            "To: <logistics@target-enterprise.com>\n"
            "Subject: Your package #DHL-981249 is pending customs duty payment\n"
            "Date: Sun, 27 Sep 2026 14:02:18 +0000\n"
            "Message-ID: <dhl-dispatch-20260927@track-dhl-parcel-service.top>\n"
            "Received: from mail.track-dhl-parcel-service.top (mail.track-dhl-parcel-service.top [45.142.214.88])\n"
            "Authentication-Results: spf=fail; dkim=none; dmarc=none"
        ),
        "manual_urls": [
            "http://track-dhl-parcel-service.top/pay/clearance?item=DHL981249"
        ],
        "attachments": []
    },
    {
        "id": "sample-4",
        "title": "[DEMO] Fake Executive Urgent Request with Malicious Script Attachment",
        "case_id_tag": "PH-DEMO-004",
        "category": "Spear Phishing / Executive Impersonation",
        "analyst_name": "Threat Hunter",
        "priority": "Critical",
        "sender": "Mark Henderson, CEO <ceo.office@executive-corporate-cloud.biz>",
        "recipient": "assistant@target-enterprise.com",
        "subject": "Confidential Merger & Acquisition Document - Review Immediately",
        "email_date": "Mon, 28 Sep 2026 16:35:10 +0000",
        "reply_to": "henderson.private@attacker-inbox.site",
        "body_plain": (
            "[TRAINING / DEMONSTRATION DATA - SYNTHETIC PHISHING CASE]\n\n"
            "Are you at your desk right now?\n\n"
            "I need you to urgently review the attached confidential merger agreement before our 5:00 PM board meeting.\n"
            "Download and execute the corporate certificate verification tool attached to decrypt the confidential spreadsheet.\n"
            "Do not discuss this with anyone outside the executive committee.\n\n"
            "Mark Henderson\nChief Executive Officer"
        ),
        "raw_headers": (
            "From: \"Mark Henderson, CEO\" <ceo.office@executive-corporate-cloud.biz>\n"
            "To: <assistant@target-enterprise.com>\n"
            "Reply-To: <henderson.private@attacker-inbox.site>\n"
            "Subject: Confidential Merger & Acquisition Document - Review Immediately\n"
            "Date: Mon, 28 Sep 2026 16:35:10 +0000\n"
            "Message-ID: <merger-exec-9921@executive-corporate-cloud.biz>\n"
            "Authentication-Results: spf=fail; dkim=fail; dmarc=fail"
        ),
        "manual_urls": [
            "http://executive-corporate-cloud.biz/decrypt/merger-token"
        ],
        "attachments": [
            {
                "filename": "Merger_Agreement_Decryption_Tool.exe",
                "extension": "exe",
                "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "mime_type": "application/x-msdownload",
                "size_bytes": 1048576,
                "is_executable_or_script": True,
                "risk_level": "CRITICAL",
                "findings": ["Executable file payload attached to executive impersonation message."]
            }
        ]
    },
    {
        "id": "sample-5",
        "title": "[DEMO] Legitimate Internal Engineering Sprint Update & Town Hall Notice",
        "case_id_tag": "PH-DEMO-005",
        "category": "Benign / Legitimate Baseline",
        "analyst_name": "SOC Lead",
        "priority": "Low",
        "sender": "Engineering Team Leads <engineering-updates@target-enterprise.com>",
        "recipient": "all-engineers@target-enterprise.com",
        "subject": "Weekly Engineering Sprint Summary and Q3 Architecture Town Hall",
        "email_date": "Mon, 28 Sep 2026 10:00:00 +0000",
        "reply_to": "engineering-updates@target-enterprise.com",
        "body_plain": (
            "[TRAINING / DEMONSTRATION DATA - SYNTHETIC BENIGN CASE]\n\n"
            "Hi Team,\n\n"
            "Here is our weekly sprint update:\n"
            "- Completed database index optimizations for customer analytics pipeline\n"
            "- Scheduled regression testing for Thursday afternoon\n"
            "- Please review open pull requests in your queue before end of day tomorrow\n\n"
            "Also, our monthly engineering town hall is scheduled for Friday at 2:00 PM EST via our internal video link:\n"
            "https://internal-workspace.target-enterprise.com/meetings/town-hall\n\n"
            "Meeting agenda and sprint documentation are on our internal Confluence space:\n"
            "https://wiki.target-enterprise.com/display/ENG/Sprint+42+Notes\n\n"
            "Best regards,\nEngineering Leadership"
        ),
        "raw_headers": (
            "From: \"Engineering Team Leads\" <engineering-updates@target-enterprise.com>\n"
            "To: <all-engineers@target-enterprise.com>\n"
            "Subject: Weekly Engineering Sprint Summary and Q3 Architecture Town Hall\n"
            "Date: Mon, 28 Sep 2026 10:00:00 +0000\n"
            "Message-ID: <sprint-42-weekly@mail.target-enterprise.com>\n"
            "Reply-To: <engineering-updates@target-enterprise.com>\n"
            "Return-Path: <engineering-updates@target-enterprise.com>\n"
            "Received: from internal-smtp.target-enterprise.com (internal-smtp.target-enterprise.com [10.0.4.15])\n"
            "    by mx.target-enterprise.com with ESMTP id 9812903;\n"
            "    Mon, 28 Sep 2026 10:00:01 +0000\n"
            "Authentication-Results: mx.target-enterprise.com; spf=pass (sender IP 10.0.4.15); dkim=pass (domain=target-enterprise.com); dmarc=pass"
        ),
        "manual_urls": [
            "https://internal-workspace.target-enterprise.com/meetings/town-hall",
            "https://wiki.target-enterprise.com/display/ENG/Sprint+42+Notes"
        ],
        "attachments": []
    }
]

def seed_sample_cases_if_empty(db, force: bool = False):
    """
    Seeds database with the 5 demonstration cases.
    """
    from backend.app.models.investigation import Investigation, IOC, TimelineEvent, AnalystNote, EvidenceItem
    from backend.app.services.pipeline import run_investigation_pipeline
    from backend.app.schemas.analysis import FullAnalysisRequest, AttachmentMetadata
    import json

    existing_titles = {inv.title for inv in db.query(Investigation.title).all()}
    count = db.query(Investigation).count()

    case_num = count + 1
    for s in SAMPLE_CASES:
        if not force and s["title"] in existing_titles:
            continue
        case_id = f"PH-2026-000{case_num}"
        case_num += 1

        # Run through analysis pipeline
        req = FullAnalysisRequest(
            sender=s["sender"],
            recipient=s["recipient"],
            subject=s["subject"],
            reply_to=s["reply_to"],
            body_plain=s["body_plain"],
            raw_headers=s["raw_headers"],
            manual_urls=s["manual_urls"],
            attachments=[AttachmentMetadata(**att) for att in s.get("attachments", [])]
        )
        res = run_investigation_pipeline(req)

        status = "Investigating" if res.risk_score >= 50 else ("Resolved" if res.risk_score < 25 else "Open")

        inv = Investigation(
            case_id=case_id,
            title=s["title"],
            analyst_name=s["analyst_name"],
            description=f"Demonstration investigation case: {s['category']}",
            priority=s["priority"],
            status=status,
            sender=s["sender"],
            recipient=s["recipient"],
            subject=s["subject"],
            email_date=s["email_date"],
            reply_to=s["reply_to"],
            body_plain=s["body_plain"],
            raw_headers=s["raw_headers"],
            risk_score=res.risk_score,
            risk_level=res.risk_level,
            ml_probability=res.ml_prediction.phishing_probability,
            ml_verdict=res.ml_prediction.verdict,
            analysis_summary=res.analysis_summary,
            explainability=json.dumps([p for p in res.explainability.evidence_points]),
            indicators=json.dumps([ind.model_dump() for ind in res.content_indicators]),
            url_analysis=json.dumps([u.model_dump() for u in res.url_analysis]),
            header_analysis=json.dumps(res.header_analysis.model_dump()),
            attachment_info=json.dumps([att.model_dump() for att in res.attachments]),
            recommended_actions=json.dumps(res.recommended_actions)
        )
        db.add(inv)
        db.flush()

        # Add IOCs
        for ioc_item in res.extracted_iocs:
            ioc_record = IOC(
                investigation_id=inv.id,
                ioc_type=ioc_item.ioc_type,
                value=ioc_item.value,
                risk_level=ioc_item.risk_level,
                context=ioc_item.context
            )
            db.add(ioc_record)

        # Add initial timeline events
        db.add(TimelineEvent(
            investigation_id=inv.id,
            event_type="Case Creation",
            description=f"Case initialized by {s['analyst_name']}. Message metadata ingested."
        ))
        db.add(TimelineEvent(
            investigation_id=inv.id,
            event_type="Automated Analysis",
            description=f"Automated pipeline completed: {res.risk_level} Risk (Score: {res.risk_score}). ML Probability: {res.ml_prediction.phishing_probability:.1%}."
        ))

        # Add note
        note_text = f"Sample demonstration case loaded. Analyzed indicators show risk classification '{res.risk_level}'."
        if res.risk_score >= 50:
            note_text += " Multiple high-severity phishing markers identified."
        else:
            note_text += " Verified message baseline. Consistent with legitimate communication."

        db.add(AnalystNote(
            investigation_id=inv.id,
            author="SOC Lead",
            note=note_text
        ))

    db.commit()
