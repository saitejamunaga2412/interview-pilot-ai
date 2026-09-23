import os
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from typing import Dict, Any
from core.config import settings
from core.security import get_current_user
from services_py.resume_service import resume_service

router = APIRouter(prefix="/api/resume", tags=["Resume ATS"])

@router.post("/upload")
@router.post("/analyze")
async def upload_and_analyze(file: UploadFile = File(...), current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Only PDF resumes are supported."}
        )

    content = await file.read()
    if len(content) > settings.RESUME_MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "File exceeds 5MB limit."}
        )

    filename = f"{user_id}-{int(os.times().elapsed * 1000)}.pdf"
    dest_path = Path(settings.UPLOAD_DIR) / "resumes" / filename
    with open(dest_path, "wb") as f:
        f.write(content)

    res = await resume_service.parse_and_analyze(user_id, content, filename)
    return {
        "success": True,
        "message": "Resume parsed successfully",
        "data": res
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
