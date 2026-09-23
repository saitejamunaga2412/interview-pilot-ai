import io
from datetime import datetime
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_interview_pdf(
    session: Dict[str, Any],
    questions: List[Dict[str, Any]],
    user_info: Dict[str, Any]
) -> bytes:
    """
    Generates a structured, professional PDF evaluation report for an interview session.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#4F46E5")     # Indigo primary
    c_dark = colors.HexColor("#0F172A")        # Slate dark
    c_text = colors.HexColor("#334155")        # Slate text
    c_muted = colors.HexColor("#64748B")       # Muted slate
    c_bg_light = colors.HexColor("#F8FAFC")    # Slate 50
    c_border = colors.HexColor("#E2E8F0")      # Slate 200
    c_accent = colors.HexColor("#10B981")      # Emerald
    c_warn = colors.HexColor("#F59E0B")        # Amber

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=c_dark,
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=c_muted,
        fontName='Helvetica'
    )
    section_head_style = ParagraphStyle(
        'SectionHead',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=c_primary,
        fontName='Helvetica-Bold',
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=c_text,
        fontName='Helvetica'
    )
    bold_style = ParagraphStyle(
        'DocBold',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=c_dark,
        fontName='Helvetica-Bold'
    )
    card_title_style = ParagraphStyle(
        'CardTitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=c_dark,
        fontName='Helvetica-Bold'
    )
    feedback_style = ParagraphStyle(
        'FeedbackText',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=c_text,
        fontName='Helvetica'
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>InterviewPilot AI</b><br/><font size=8 color='#64748B'>AI-Powered Placement Operating System</font>", body_style),
            Paragraph(f"<b>Session Report</b><br/><font size=8 color='#64748B'>Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</font>", ParagraphStyle('RightH', parent=body_style, alignment=2))
        ]
    ]
    t_header = Table(header_data, colWidths=[3.5 * inch, 3.5 * inch])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_header)
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=4, spaceAfter=14))

    # 2. Main Title & Session Meta
    role = session.get("role", "Software Engineer")
    level = session.get("level", "Standard")
    mode = session.get("interviewMode", "Technical").capitalize()
    score = session.get("overallScore", 0)
    user_name = user_info.get("name") or user_info.get("fullName") or "Candidate"
    user_email = user_info.get("email") or "Not provided"

    story.append(Paragraph(f"{role} — Mock Interview Evaluation", title_style))
    story.append(Paragraph(f"Level: <b>{level}</b> | Mode: <b>{mode}</b> | Candidate: <b>{user_name}</b> ({user_email})", subtitle_style))
    story.append(Spacer(1, 14))

    # 3. Score & Metrics Summary Grid
    score_color = c_accent if score >= 75 else (c_warn if score >= 50 else colors.HexColor("#EF4444"))
    score_label = "Proficient / Ready" if score >= 75 else ("Developing" if score >= 50 else "Needs Practice")

    summary_data = [
        [
            Paragraph("<b>Overall Score</b>", bold_style),
            Paragraph("<b>Performance Status</b>", bold_style),
            Paragraph("<b>Total Questions</b>", bold_style),
            Paragraph("<b>Duration / Format</b>", bold_style)
        ],
        [
            Paragraph(f"<font size=16 color='{score_color.hexval()}'><b>{score}%</b></font>", bold_style),
            Paragraph(f"<b>{score_label}</b>", bold_style),
            Paragraph(f"<b>{len(questions)}</b> answers evaluated", body_style),
            Paragraph(f"{session.get('duration', 30)} min ({'Timed' if session.get('isTimedInterview') else 'Self-Paced'})", body_style)
        ]
    ]
    t_summary = Table(summary_data, colWidths=[1.75 * inch, 2.0 * inch, 1.5 * inch, 1.75 * inch])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg_light),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 16))

    # 4. Questions & Evaluated Answers
    story.append(Paragraph("Detailed Question Breakdown & AI Feedback", section_head_style))
    story.append(Spacer(1, 6))

    if not questions:
        story.append(Paragraph("<i>No detailed question records found for this session.</i>", body_style))
    else:
        for idx, q_res in enumerate(questions, start=1):
            q_text = q_res.get("question", f"Question {idx}")
            user_ans = q_res.get("userAnswer") or q_res.get("answer") or "No answer submitted."
            q_score = q_res.get("score", 0)
            feedback = q_res.get("feedback", "No specific feedback recorded.")
            strengths = q_res.get("strengths", [])
            improvements = q_res.get("improvements", [])

            q_color = c_accent if q_score >= 75 else (c_warn if q_score >= 50 else colors.HexColor("#EF4444"))

            card_rows = [
                [
                    Paragraph(f"<b>Q{idx}: {q_text}</b>", card_title_style),
                    Paragraph(f"<font color='{q_color.hexval()}'><b>Score: {q_score}%</b></font>", ParagraphStyle('RScore', parent=bold_style, alignment=2))
                ],
                [
                    Paragraph(f"<b>Candidate Answer:</b> {user_ans[:350]}{'...' if len(user_ans) > 350 else ''}", feedback_style),
                    ""
                ],
                [
                    Paragraph(f"<b>AI Feedback:</b> {feedback}", feedback_style),
                    ""
                ]
            ]

            if strengths:
                strengths_str = ", ".join(strengths) if isinstance(strengths, list) else str(strengths)
                card_rows.append([
                    Paragraph(f"<b>Key Strengths:</b> {strengths_str}", feedback_style),
                    ""
                ])

            if improvements:
                imp_str = ", ".join(improvements) if isinstance(improvements, list) else str(improvements)
                card_rows.append([
                    Paragraph(f"<b>Growth Opportunities:</b> {imp_str}", feedback_style),
                    ""
                ])

            t_card = Table(card_rows, colWidths=[5.6 * inch, 1.4 * inch])
            t_card.setStyle(TableStyle([
                ('SPAN', (0, 1), (1, 1)),
                ('SPAN', (0, 2), (1, 2)),
                *([('SPAN', (0, i), (1, i)) for i in range(3, len(card_rows))]),
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ('BOX', (0, 0), (-1, -1), 0.8, c_border),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))

            story.append(KeepTogether([t_card, Spacer(1, 10)]))

    # 5. Footer note
    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.8, color=c_border, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph(
        "InterviewPilot AI • Confidential Interview Assessment Report • Keep learning and practicing to accelerate placement readiness.",
        ParagraphStyle('Footer', parent=subtitle_style, alignment=1, fontSize=7.5, textColor=c_muted)
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
