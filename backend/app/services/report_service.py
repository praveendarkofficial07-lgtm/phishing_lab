import io
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)

def generate_pdf_report(investigation) -> io.BytesIO:
    """
    Builds a professional, comprehensive PDF investigation report for a case.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0f172a") # Dark slate
    accent_blue = colors.HexColor("#0284c7")
    accent_red = colors.HexColor("#dc2626")
    accent_amber = colors.HexColor("#d97706")
    accent_green = colors.HexColor("#16a34a")
    text_dark = colors.HexColor("#1e293b")
    text_muted = colors.HexColor("#64748b")
    bg_light = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#cbd5e1")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=text_muted,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    story = []

    # 1. HEADER / COVER BANNER
    story.append(Paragraph("AI-POWERED PHISHING INVESTIGATION LAB", title_style))
    story.append(Paragraph("DEFENSIVE CYBERSECURITY INCIDENT INVESTIGATION REPORT", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_blue, spaceAfter=12))

    # Case metadata bar table
    created_str = investigation.created_at.strftime("%Y-%m-%d %H:%M UTC") if investigation.created_at else "N/A"
    risk_color = accent_red if investigation.risk_level in ("HIGH", "CRITICAL") else (accent_amber if investigation.risk_level == "MEDIUM" else accent_green)

    meta_data = [
        [
            Paragraph(f"<b>Case ID:</b> {investigation.case_id}", body_style),
            Paragraph(f"<b>Status:</b> {investigation.status}", body_style),
            Paragraph(f"<b>Risk Level:</b> <font color='{risk_color.hexval()}'><b>{investigation.risk_level} ({investigation.risk_score}/100)</b></font>", body_style)
        ],
        [
            Paragraph(f"<b>Investigator:</b> {investigation.analyst_name}", body_style),
            Paragraph(f"<b>Priority:</b> {investigation.priority}", body_style),
            Paragraph(f"<b>Date:</b> {created_str}", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[2.5*inch, 2.2*inch, 2.7*inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # 2. EXECUTIVE SUMMARY
    story.append(Paragraph("1. Executive Summary", h1_style))
    summary_text = investigation.analysis_summary or "The investigation was completed with automated heuristic and ML inspection."
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 10))

    # 3. CASE & EMAIL INFORMATION
    story.append(Paragraph("2. Case & Email Metadata", h1_style))
    email_info_data = [
        [Paragraph("<b>Title:</b>", body_style), Paragraph(investigation.title or "N/A", body_style)],
        [Paragraph("<b>Sender:</b>", body_style), Paragraph(investigation.sender or "N/A", body_style)],
        [Paragraph("<b>Recipient:</b>", body_style), Paragraph(investigation.recipient or "N/A", body_style)],
        [Paragraph("<b>Subject:</b>", body_style), Paragraph(investigation.subject or "N/A", body_style)],
        [Paragraph("<b>Reply-To:</b>", body_style), Paragraph(investigation.reply_to or "N/A", body_style)],
        [Paragraph("<b>Email Date:</b>", body_style), Paragraph(investigation.email_date or "N/A", body_style)],
    ]
    email_table = Table(email_info_data, colWidths=[1.4*inch, 6.0*inch])
    email_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(email_table)
    story.append(Spacer(1, 12))

    # 4. RISK ASSESSMENT & ML ANALYSIS
    story.append(Paragraph("3. Risk Assessment & Machine Learning Verdict", h1_style))
    ml_prob = investigation.ml_probability or 0.0
    ml_analysis_data = [
        [
            Paragraph("<b>Overall Investigation Risk:</b>", body_style),
            Paragraph(f"<font color='{risk_color.hexval()}'><b>{investigation.risk_level}</b></font> (Score: {investigation.risk_score} / 100)", body_style)
        ],
        [
            Paragraph("<b>ML Phishing Probability:</b>", body_style),
            Paragraph(f"<b>{ml_prob * 100:.1f}%</b> (Verdict: {investigation.ml_verdict})", body_style)
        ],
        [
            Paragraph("<b>Model Architecture:</b>", body_style),
            Paragraph("TF-IDF N-gram Vectorizer (2500 features) + Logistic Regression (L2 regularization, balanced weights)", body_style)
        ]
    ]
    ml_table = Table(ml_analysis_data, colWidths=[2.2*inch, 5.2*inch])
    ml_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(ml_table)
    story.append(Spacer(1, 12))

    # 5. PHISHING INDICATORS (WHY THIS WAS FLAGGED)
    story.append(Paragraph("4. Phishing & Social Engineering Indicators", h1_style))
    try:
        indicators = json.loads(investigation.indicators) if investigation.indicators else []
    except Exception:
        indicators = []

    if indicators:
        ind_data = [[
            Paragraph("Indicator", table_header_style),
            Paragraph("Severity", table_header_style),
            Paragraph("Evidence", table_header_style),
            Paragraph("Explanation", table_header_style)
        ]]
        for ind in indicators:
            sev = ind.get("severity", "Medium")
            ind_data.append([
                Paragraph(f"<b>{ind.get('indicator', '')}</b>", body_style),
                Paragraph(sev, body_style),
                Paragraph(f"<i>{ind.get('evidence', '')}</i>", code_style),
                Paragraph(ind.get('explanation', ''), body_style)
            ])
        ind_table = Table(ind_data, colWidths=[1.8*inch, 0.9*inch, 2.2*inch, 2.5*inch])
        ind_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), primary_color),
            ('BOX', (0, 0), (-1, -1), 0.5, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(ind_table)
    else:
        story.append(Paragraph("No severe rule-based social engineering indicators were triggered.", body_style))
    story.append(Spacer(1, 12))

    # 6. URL ANALYSIS
    story.append(Paragraph("5. URL & Destination Analysis", h1_style))
    try:
        url_items = json.loads(investigation.url_analysis) if investigation.url_analysis else []
    except Exception:
        url_items = []

    if url_items:
        url_data = [[
            Paragraph("URL / Host", table_header_style),
            Paragraph("Protocol", table_header_style),
            Paragraph("Risk Level", table_header_style),
            Paragraph("Key Findings", table_header_style)
        ]]
        for u in url_items:
            findings_text = "; ".join(u.get("risk_indicators", [])) or "No severe findings"
            url_data.append([
                Paragraph(f"<b>{u.get('domain', '')}</b><br/>{u.get('url', '')[:50]}", code_style),
                Paragraph(u.get('scheme', '').upper(), body_style),
                Paragraph(f"<b>{u.get('risk_level', 'LOW')}</b> ({u.get('risk_score', 0)})", body_style),
                Paragraph(findings_text, body_style)
            ])
        url_table = Table(url_data, colWidths=[2.5*inch, 0.9*inch, 1.2*inch, 2.8*inch])
        url_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), primary_color),
            ('BOX', (0, 0), (-1, -1), 0.5, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(url_table)
    else:
        story.append(Paragraph("No external URLs were present or extracted from the submitted email.", body_style))
    story.append(Spacer(1, 12))

    # 7. EMAIL HEADER ANALYSIS
    story.append(Paragraph("6. Header Analysis & Authentication", h1_style))
    try:
        hdr = json.loads(investigation.header_analysis) if investigation.header_analysis else {}
    except Exception:
        hdr = {}

    hdr_data = [
        [Paragraph("<b>SPF Status:</b>", body_style), Paragraph(hdr.get("spf", "NONE / NOT PROVIDED"), body_style)],
        [Paragraph("<b>DKIM Status:</b>", body_style), Paragraph(hdr.get("dkim", "NONE / NOT PROVIDED"), body_style)],
        [Paragraph("<b>DMARC Status:</b>", body_style), Paragraph(hdr.get("dmarc", "NONE / NOT PROVIDED"), body_style)],
        [Paragraph("<b>Originating IP:</b>", body_style), Paragraph(hdr.get("originating_ip") or "Not Identified", body_style)],
        [Paragraph("<b>Inconsistencies:</b>", body_style), Paragraph("; ".join(hdr.get("inconsistencies", [])) or "None detected", body_style)],
    ]
    hdr_table = Table(hdr_data, colWidths=[1.8*inch, 5.6*inch])
    hdr_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(hdr_table)
    story.append(Spacer(1, 12))

    # 8. IOC TABLE
    story.append(Paragraph("7. Extracted Indicators of Compromise (IOCs)", h1_style))
    iocs = investigation.iocs or []
    if iocs:
        ioc_data = [[
            Paragraph("Type", table_header_style),
            Paragraph("Indicator Value", table_header_style),
            Paragraph("Risk", table_header_style),
            Paragraph("Context", table_header_style)
        ]]
        for ioc in iocs[:15]:
            ioc_data.append([
                Paragraph(f"<b>{ioc.ioc_type}</b>", body_style),
                Paragraph(ioc.value, code_style),
                Paragraph(ioc.risk_level, body_style),
                Paragraph(ioc.context or "", body_style)
            ])
        ioc_table = Table(ioc_data, colWidths=[1.0*inch, 3.2*inch, 0.9*inch, 2.3*inch])
        ioc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), primary_color),
            ('BOX', (0, 0), (-1, -1), 0.5, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(ioc_table)
    else:
        story.append(Paragraph("No technical IOCs extracted.", body_style))
    story.append(Spacer(1, 12))

    # 9. RECOMMENDED DEFENSIVE ACTIONS
    story.append(Paragraph("8. Recommended Defensive Actions", h1_style))
    try:
        actions = json.loads(investigation.recommended_actions) if investigation.recommended_actions else []
    except Exception:
        actions = []

    if actions:
        for idx, act in enumerate(actions, 1):
            story.append(Paragraph(f"• <b>Action {idx}:</b> {act}", body_style))
            story.append(Spacer(1, 3))
    else:
        story.append(Paragraph("Standard organizational email hygiene is advised.", body_style))
    story.append(Spacer(1, 12))

    # 10. TIMELINE & NOTES
    story.append(Paragraph("9. Investigation Timeline & Analyst Notes", h1_style))
    timeline_items = investigation.timeline or []
    if timeline_items:
        t_data = [[
            Paragraph("Timestamp", table_header_style),
            Paragraph("Event Type", table_header_style),
            Paragraph("Details", table_header_style)
        ]]
        for t in timeline_items:
            t_str = t.timestamp.strftime("%Y-%m-%d %H:%M") if t.timestamp else ""
            t_data.append([
                Paragraph(t_str, body_style),
                Paragraph(f"<b>{t.event_type}</b>", body_style),
                Paragraph(t.description, body_style)
            ])
        t_table = Table(t_data, colWidths=[1.8*inch, 1.6*inch, 4.0*inch])
        t_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), primary_color),
            ('BOX', (0, 0), (-1, -1), 0.5, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(t_table)
    story.append(Spacer(1, 10))

    notes_items = investigation.notes or []
    if notes_items:
        story.append(Paragraph("<b>Analyst Notes:</b>", body_style))
        for n in notes_items:
            n_time = n.created_at.strftime("%Y-%m-%d %H:%M") if n.created_at else ""
            story.append(Paragraph(f"[{n_time}] <b>{n.author}:</b> {n.note}", body_style))
            story.append(Spacer(1, 3))

    # Build document
    doc.build(story)
    buffer.seek(0)
    return buffer
