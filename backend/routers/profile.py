import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from typing import Dict, Any
from core.config import settings
from core.security import get_current_user
from services_py.profile_service import profile_service

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("")
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    profile = await profile_service.get_profile(user_id)
    completion = {"percentage": profile.get("completionPercentage", 0)}
    return {
        "success": True,
        "message": "Profile retrieved successfully",
        "data": {
            **profile,
            "user": profile,
            "completion": completion
        }
    }

@router.put("")
async def update_profile(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    try:
        updated = await profile_service.update_profile(user_id, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": str(e)}
        )
    completion = {"percentage": updated.get("completionPercentage", 0)}
    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": {
            **updated,
            "user": updated,
            "completion": completion
        }
    }

@router.post("/photo")
@router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...), current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Unsupported file type. Only JPEG, PNG, and WebP are allowed."}
        )

    content = await file.read()
    if len(content) > settings.PHOTO_MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "File size exceeds limit."}
        )

    ext = ".png" if "png" in file.content_type else (".webp" if "webp" in file.content_type else ".jpg")
    filename = f"{user_id}-{int(os.times().elapsed * 1000)}{ext}"
    dest_path = Path(settings.UPLOAD_DIR) / "photos" / filename
    with open(dest_path, "wb") as f:
        f.write(content)

    photo_url = f"/uploads/photos/{filename}"
    await profile_service.update_profile(user_id, {"profilePhoto": photo_url})
    profile = await profile_service.get_profile(user_id)
    completion = {"percentage": profile.get("completionPercentage", 0)}
    return {
        "success": True,
        "message": "Profile photo uploaded successfully",
        "data": {
            **profile,
            "user": profile,
            "completion": completion
        }
    }

@router.post("/resume")
@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), current_user: Dict[str, Any] = Depends(get_current_user)):
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
            detail={"success": False, "message": "Resume file exceeds 5MB limit."}
        )

    filename = f"{user_id}-{int(os.times().elapsed * 1000)}.pdf"
    dest_path = Path(settings.UPLOAD_DIR) / "resumes" / filename
    with open(dest_path, "wb") as f:
        f.write(content)

    resume_url = f"/uploads/resumes/{filename}"
    await profile_service.update_profile(user_id, {"career": {"resumeUrl": resume_url}})
    profile = await profile_service.get_profile(user_id)
    completion = {"percentage": profile.get("completionPercentage", 0)}
    return {
        "success": True,
        "message": "Resume uploaded successfully",
        "data": {
            **profile,
            "user": profile,
            "completion": completion
        }
    }

@router.delete("")
async def delete_account(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await profile_service.delete_account(user_id)
    return {
        "success": True,
        "message": res["message"],
        "data": None
    }
