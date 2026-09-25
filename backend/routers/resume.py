import os
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Query, Request
from typing import Dict, Any, Optional
from core.config import settings
from core.security import get_current_user
from services_py.resume_service import resume_service
from services_py.ats_service import ats_service
from core.database import get_database, to_object_id

router = APIRouter(prefix="/api/resume", tags=["Resume ATS"])

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/octet-stream"
}

def validate_resume_file(filename: str, content_type: Optional[str], size: int):
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Only PDF and DOCX resume formats are supported."}
        )

    if content_type and content_type not in ALLOWED_MIME_TYPES and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Invalid document MIME type. Please upload a valid PDF or DOCX file."}
        )

    max_bytes = settings.RESUME_MAX_SIZE_MB * 1024 * 1024
    if size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": f"File size exceeds the {settings.RESUME_MAX_SIZE_MB}MB limit."}
        )

@router.post("/upload")
@router.post("/analyze")
async def upload_and_analyze(
    file: Optional[UploadFile] = File(None),
    resume: Optional[UploadFile] = File(None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user["id"]
    upload_file = file or resume
    if not upload_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Please provide a resume file."}
        )

    content = await upload_file.read()
    validate_resume_file(upload_file.filename or "resume.pdf", upload_file.content_type, len(content))

    ext = Path(upload_file.filename or "resume.pdf").suffix.lower() or ".pdf"
    filename = f"{user_id}-{int(os.times().elapsed * 1000)}{ext}"
    dest_path = Path(settings.UPLOAD_DIR) / "resumes" / filename
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(dest_path, "wb") as f:
        f.write(content)

    res = await resume_service.parse_and_analyze(user_id, content, filename)
    return {
        "success": True,
        "message": "Resume parsed successfully",
        "data": res
    }

@router.post("/ats/analyze")
async def ats_analyze(
    file: Optional[UploadFile] = File(None),
    resume: Optional[UploadFile] = File(None),
    targetRole: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user["id"]
    upload_file = file or resume

    content = None
    filename = "resume.pdf"

    if upload_file:
        content = await upload_file.read()
        filename = upload_file.filename or "resume.pdf"
        validate_resume_file(filename, upload_file.content_type, len(content))

        # Save uploaded file
        ext = Path(filename).suffix.lower() or ".pdf"
        saved_filename = f"{user_id}-ats-{int(os.times().elapsed * 1000)}{ext}"
        dest_path = Path(settings.UPLOAD_DIR) / "resumes" / saved_filename
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        with open(dest_path, "wb") as f:
            f.write(content)
        filename = saved_filename
    else:
        # Check if user already has an uploaded resume file on disk
        db = get_database()
        user_oid = to_object_id(user_id)
        user = await db["users"].find_one({"_id": user_oid})
        resume_url = user.get("career", {}).get("resumeUrl") if user else None
        if resume_url and "/uploads/resumes/" in resume_url:
            saved_name = resume_url.split("/uploads/resumes/")[-1]
            existing_path = Path(settings.UPLOAD_DIR) / "resumes" / saved_name
            if existing_path.exists():
                with open(existing_path, "rb") as f:
                    content = f.read()
                filename = saved_name

        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": "No resume file provided. Please upload a PDF or DOCX resume to analyze."}
            )

    try:
        result = await ats_service.analyze_resume(
            user_id=user_id,
            file_bytes=content,
            filename=filename,
            target_role_input=targetRole
        )
        return {
            "success": True,
            "message": "ATS analysis complete",
            "data": result,
            "analysis": result.get("analysis", {})
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": str(ve)}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": f"Resume analysis is temporarily unavailable. Please try again. ({str(e)})"}
        )

@router.get("/ats/latest")
async def get_latest_ats(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    latest = await ats_service.get_latest_analysis(user_id)
    return {
        "success": True,
        "data": latest,
        "analysis": latest.get("analysis") if latest else None
    }

@router.get("/ats/history")
async def get_ats_history(
    limit: int = Query(15, ge=1, le=50),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user["id"]
    history = await ats_service.get_history(user_id, limit)
    return {
        "success": True,
        "data": history
    }

@router.get("")
async def get_resume(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await resume_service.get_resume_details(user_id)
    return {
        "success": True,
        "message": "Resume fetched successfully",
        "data": res
    }
