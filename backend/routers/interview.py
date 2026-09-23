from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from typing import Dict, Any, Optional
from core.security import get_current_user
from services_py.interview_service import interview_service

interview_router = APIRouter(tags=["AI Interview Studio"])
result_router = APIRouter(prefix="/api/result", tags=["Interview Results"])

@interview_router.post("/generate")
async def generate_questions(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await interview_service.create_session(
        user_id=user_id,
        role=payload.get("role", "Software Engineer"),
        level=payload.get("level", "Junior"),
        is_timed=payload.get("isTimedInterview", False),
        duration=payload.get("duration", 30),
        interview_mode=payload.get("interviewMode", "technical"),
        use_resume=payload.get("useResume", False)
    )
    return {
        "success": True,
        "message": "Interview questions generated successfully",
        "data": res
    }

@interview_router.get("/roles")
async def get_roles():
    from core.database import get_database, serialize_doc
    db = get_database()
    roles = await db["jobroles"].find({}).sort("title", 1).to_list(50)
    if not roles:
        roles = [
            {"title": "Software Engineer", "category": "Core"},
            {"title": "Frontend Developer", "category": "Web"},
            {"title": "Backend Architect", "category": "Backend"},
            {"title": "Full Stack Developer", "category": "Web"},
            {"title": "Machine Learning Engineer", "category": "AI/ML"}
        ]
    return {
        "success": True,
        "message": "Roles fetched successfully",
        "data": serialize_doc(roles)
    }

@result_router.post("/evaluate")
async def evaluate_answer(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await interview_service.evaluate_answer(user_id, payload)
    return {
        "success": True,
        "message": "Answer evaluated successfully",
        "data": res
    }

@result_router.get("/history")
async def get_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    history = await interview_service.get_history(user_id)
    return {
        "success": True,
        "message": "History retrieved successfully",
        "data": history
    }

@result_router.get("/session/{session_id}")
async def get_session(session_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    details = await interview_service.get_session_details(user_id, session_id)
    return {
        "success": True,
        "message": "Session details retrieved successfully",
        "data": details
    }

@result_router.delete("/delete/{session_id}")
async def delete_session(session_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await interview_service.delete_session(user_id, session_id)
    return {
        "success": True,
        "message": res["message"],
        "data": None
    }

@result_router.delete("/clear")
async def clear_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    from core.database import get_database
    db = get_database()
    user_id = current_user["id"]
    await db["interviewsessions"].delete_many({"userId": user_id})
    await db["results"].delete_many({"userId": user_id})
    return {
        "success": True,
        "message": "History cleared successfully",
        "data": None
    }

@result_router.get("/insights")
async def get_insights(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "success": True,
        "message": "Insights retrieved successfully",
        "data": {
            "strengths": ["Structured technical communication", "Direct problem-solving"],
            "growthAreas": ["Add quantifiable metrics to STAR examples"],
            "completionRate": "100%"
        }
    }

@result_router.get("/report/{session_id}")
@result_router.get("/download-report/{session_id}")
async def download_report(session_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Downloads a comprehensive, styled PDF evaluation report for the specified interview session.
    """
    user_id = current_user["id"]
    try:
        details = await interview_service.get_session_details(user_id, session_id)
        session = details.get("session", {})
        questions = details.get("questions", [])
    except Exception:
        session = {
            "_id": session_id,
            "role": "Mock Interview",
            "level": "Standard",
            "overallScore": 0,
            "interviewMode": "Technical"
        }
        questions = []

    try:
        from services_py.report_generator import generate_interview_pdf
        pdf_bytes = generate_interview_pdf(session, questions, current_user)
    except Exception as ex:
        from io import BytesIO
        from reportlab.pdfgen import canvas
        buffer = BytesIO()
        p = canvas.Canvas(buffer)
        p.drawString(100, 750, "InterviewPilot AI — Evaluation Report")
        p.drawString(100, 720, f"Session ID: {session_id}")
        p.drawString(100, 690, f"Candidate: {current_user.get('name', 'Candidate')}")
        p.drawString(100, 660, f"Role: {session.get('role', 'General')}")
        p.drawString(100, 630, f"Score: {session.get('overallScore', 0)}%")
        p.showPage()
        p.save()
        buffer.seek(0)
        pdf_bytes = buffer.getvalue()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Interview_Report_{session_id}.pdf"
        }
    )

