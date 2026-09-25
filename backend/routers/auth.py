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

    # Dispatch welcome email if user opted in
    if user_doc.get("settings", {}).get("notificationPreferences", {}).get("email"):
        try:
            from services_py.email_service import email_service
            first_name = req.name.strip().split()[0]
            email_service.send_email(
                to_email=email_clean,
                subject="🚀 Welcome to InterviewPilot AI — Your Placement OS",
                html_content=f"<h3>Welcome, {first_name}!</h3><p>Your AI-powered placement preparation workspace is ready.</p><p><a href='http://localhost:5174/dashboard'>Launch Placement Dashboard &rarr;</a></p>",
                text_content=f"Welcome {first_name}! Your InterviewPilot AI workspace is ready at http://localhost:5174/dashboard"
            )
        except Exception:
            pass

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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    import secrets
    from datetime import timedelta
    db = get_database()
    email_clean = req.email.strip().lower()
    user = await db["users"].find_one({"email": email_clean})

    if not user:
        return {
            "success": True,
            "message": "If the account exists, a reset link has been sent"
        }

    reset_token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=1)

    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"resetPasswordToken": reset_token, "resetPasswordExpires": expires}}
    )

    try:
        from services_py.email_service import email_service
        user_name = user.get("name", "Candidate").split()[0]
        reset_link = f"http://localhost:5174/reset-password?token={reset_token}"
        email_service.send_email(
            to_email=email_clean,
            subject="🔑 Reset Your InterviewPilot AI Password",
            html_content=f"<h3>Password Reset Request</h3><p>Hi {user_name},</p><p>We received a request to reset your password. Click the link below or paste your reset token into the form:</p><p><a href='{reset_link}'>Reset My Password &rarr;</a></p><p><strong>Reset Token:</strong> <code>{reset_token}</code></p><p>This link expires in 1 hour.</p>",
            text_content=f"Hi {user_name}, Reset your password at: {reset_link} (Token: {reset_token})"
        )
    except Exception:
        pass

    return {
        "success": True,
        "message": "If the account exists, a reset link has been sent",
        "resetToken": reset_token
    }

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    db = get_database()
    token = req.token.strip()

    if len(req.newPassword) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Password must be at least 6 characters"}
        )

    user = await db["users"].find_one({
        "resetPasswordToken": token,
        "resetPasswordExpires": {"$gt": datetime.utcnow()}
    })

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Invalid or expired reset token"}
        )

    new_hashed = hash_password(req.newPassword)
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"password": new_hashed}, "$unset": {"resetPasswordToken": "", "resetPasswordExpires": ""}}
    )

    user_id = str(user["_id"])
    jwt_token = create_access_token({"id": user_id})
    user_clean = serialize_doc(user)
    user_clean.pop("password", None)
    user_clean["_id"] = user_id
    user_clean["id"] = user_id

    try:
        from services_py.email_service import email_service
        user_name = user.get("name", "Candidate").split()[0]
        email_service.send_email(
            to_email=user["email"],
            subject="🔒 Your InterviewPilot AI Password Has Been Changed",
            html_content=f"<h3>Password Changed Successfully</h3><p>Hi {user_name},</p><p>Your password for InterviewPilot AI has been updated successfully. If you did not make this change, please contact support immediately.</p>",
            text_content=f"Hi {user_name}, Your InterviewPilot AI password was successfully updated."
        )
    except Exception:
        pass

    return {
        "success": True,
        "message": "Password reset successful",
        "token": jwt_token,
        "user": user_clean
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
