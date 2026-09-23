from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from core.database import get_database, serialize_doc, to_object_id
from core.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register(req: RegisterRequest):
    db = get_database()
    email_clean = req.email.strip().lower()

    existing = await db["users"].find_one({"email": email_clean})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Email already registered"}
        )

    user_doc = {
        "name": req.name.strip(),
        "email": email_clean,
        "password": hash_password(req.password),
        "profilePhoto": "",
        "career": {
            "targetRole": "",
            "targetCompanies": [],
            "skills": []
        },
        "academic": {},
        "learningPreferences": {},
        "onboardingCompleted": False,
        "settings": {
            "theme": "dark",
            "notificationPreferences": {"email": True, "push": True, "inApp": True}
        },
        "createdAt": datetime.utcnow()
    }

    res = await db["users"].insert_one(user_doc)
    user_id = str(res.inserted_id)

    token = create_access_token({"id": user_id})

    user_clean = serialize_doc(user_doc)
    user_clean.pop("password", None)
    user_clean["_id"] = user_id
    user_clean["id"] = user_id

    # Create welcome notification
    await db["notifications"].insert_one({
        "userId": user_id,
        "type": "welcome",
        "title": "Welcome to InterviewPilot AI!",
        "message": "Your placement preparation workspace is ready. Start by setting your target company or exploring the Coding Arena.",
        "priority": "normal",
        "actionLabel": "Go to Dashboard",
        "actionRoute": "/dashboard",
        "read": False,
        "createdAt": datetime.utcnow()
    })

    return {
        "success": True,
        "message": "User registered successfully",
        "data": {
            "token": token,
            "user": user_clean
        }
    }

@router.post("/login")
async def login(req: LoginRequest):
    db = get_database()
    email_clean = req.email.strip().lower()

    user = await db["users"].find_one({"email": email_clean})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid email or password"}
        )

    if not verify_password(req.password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid email or password"}
        )

    user_id = str(user["_id"])
    token = create_access_token({"id": user_id})

    # Update previousLoginAt / lastLoginAt
    now = datetime.utcnow()
    prev = user.get("lastLoginAt")
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"lastLoginAt": now, "previousLoginAt": prev}}
    )

    user_clean = serialize_doc(user)
    user_clean.pop("password", None)
    user_clean["_id"] = user_id
    user_clean["id"] = user_id

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "token": token,
            "user": user_clean
        }
    }

@router.get("/profile")
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_clean = {k: v for k, v in current_user.items() if k != "password"}
    return {
        "success": True,
        "message": "Profile loaded",
        "data": {
            "user": user_clean
        }
    }

@router.post("/logout")
async def logout():
    return {
        "success": True,
        "message": "Logged out successfully"
    }
