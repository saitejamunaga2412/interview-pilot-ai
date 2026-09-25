import time
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional
from core.database import get_database, serialize_doc, to_object_id
from core.config import settings
from core.security import get_current_user, get_optional_user
from services_py.email_service import email_service
from services_py.scheduler import get_scheduler_status

misc_router = APIRouter(tags=["Auxiliary & Health"])

# 1. Health Endpoint (Crucial: never expose keys or secrets)
@misc_router.get("/api/health")
@misc_router.get("/health")
async def get_health():
    db = get_database()
    db_status = "connected"
    try:
        await db.command("ping")
    except Exception:
        db_status = "disconnected"

    email_status = email_service.get_status()
    scheduler_status = get_scheduler_status()
    is_healthy = (db_status == "connected")

    return {
        "status": "healthy" if is_healthy else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT or settings.ENV,
        "services": {
            "database": db_status,
            "aiProvider": "gemini_configured" if settings.GEMINI_API_KEY else "unconfigured",
            "geminiModel": settings.GEMINI_MODEL,
            "sandboxExecution": "judge0_configured" if settings.JUDGE0_URL else "unconfigured",
            "emailNotifications": "configured" if email_status["configured"] else "disabled_safe_mode",
            "scheduler": "active" if scheduler_status["active"] else "standby"
        }
    }

# 1b. Test Email Dispatch
@misc_router.post("/api/misc/send-test-email")
async def send_test_email(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_email = current_user.get("email")
    if not user_email:
        return {"success": False, "message": "Authenticated user does not have an email address."}

    result = email_service.send_email(
        to_email=user_email,
        subject="[InterviewPilot AI] SMTP Verification Test",
        html_content=f"<h3>InterviewPilot AI Verification</h3><p>Hello {current_user.get('name', 'Candidate')},</p><p>This is a verified test email sent from your InterviewPilot AI installation.</p><p>Timestamp: {datetime.utcnow().isoformat()}</p>",
        text_content=f"Hello {current_user.get('name', 'Candidate')}, This is a verified test email sent from your InterviewPilot AI installation."
    )
    return {"success": result.get("success", False), "result": result}

# 2. Exam Patterns
@misc_router.get("/api/exam-patterns")
@misc_router.get("/api/exam-patterns/patterns")
async def get_exam_patterns():
    db = get_database()
    patterns = await db["exampatterns"].find({}).to_list(50)
    return {"success": True, "data": serialize_doc(patterns)}

@misc_router.get("/api/exam-patterns/targets/active")
async def get_active_exam_target(optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    from core.database import get_database, serialize_doc
    user_id = optional_user["id"] if optional_user else None
    db = get_database()
    target = None
    if user_id:
        target = await db["usertargets"].find_one({"userId": user_id, "isActive": True})
    return {
        "success": True,
        "data": serialize_doc(target) if target else {
            "targetName": "TCS NQT 2026",
            "examName": "TCS NQT",
            "targetReadinessScore": 75,
            "examDate": "2026-10-15"
        }
    }

@misc_router.post("/api/exam-patterns/targets")
async def save_exam_target(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    from core.database import get_database, serialize_doc
    from datetime import datetime
    db = get_database()
    user_id = current_user["id"]
    await db["usertargets"].update_many({"userId": user_id}, {"$set": {"isActive": False}})
    doc = {**payload, "userId": user_id, "isActive": True, "createdAt": datetime.utcnow()}
    res = await db["usertargets"].insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return {"success": True, "data": serialize_doc(doc)}

@misc_router.post("/api/exam-patterns/targets/custom")
async def save_custom_exam_target(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    from core.database import get_database, serialize_doc
    from datetime import datetime
    db = get_database()
    user_id = current_user["id"]
    await db["usertargets"].update_many({"userId": user_id}, {"$set": {"isActive": False}})
    doc = {**payload, "userId": user_id, "isActive": True, "isCustom": True, "createdAt": datetime.utcnow()}
    res = await db["usertargets"].insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return {"success": True, "data": serialize_doc(doc)}

@misc_router.get("/api/exam-patterns/similar-question/{topic_id}")
async def get_similar_question(topic_id: str, questionId: Optional[str] = None):
    from core.database import get_database, serialize_doc
    db = get_database()
    q = await db["questions"].find_one({"topic": {"$regex": topic_id, "$options": "i"}})
    if not q:
        q = await db["questions"].find_one({})
    return {"success": True, "data": serialize_doc(q)}

# 3. User Actions (Notes & Bookmarks)
@misc_router.get("/api/user-actions/notes")
async def get_user_notes(current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_database()
    notes = await db["usernotes"].find({"userId": current_user["id"]}).to_list(50)
    return {"success": True, "data": serialize_doc(notes)}

@misc_router.post("/api/user-actions/notes")
async def save_user_note(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_database()
    note_doc = {
        "userId": current_user["id"],
        "topic": payload.get("topic", "General"),
        "content": payload.get("content", ""),
        "createdAt": datetime.utcnow()
    }
    res = await db["usernotes"].insert_one(note_doc)
    return {"success": True, "data": {"id": str(res.inserted_id)}}

@misc_router.get("/api/user-actions/bookmarks")
async def get_bookmarks(current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_database()
    bms = await db["bookmarks"].find({"userId": current_user["id"]}).to_list(50)
    return {"success": True, "data": serialize_doc(bms)}

@misc_router.post("/api/user-actions/bookmarks")
async def toggle_bookmark(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["id"]
    item_id = payload.get("itemId")
    existing = await db["bookmarks"].find_one({"userId": user_id, "itemId": item_id})
    if existing:
        await db["bookmarks"].delete_one({"_id": existing["_id"]})
        return {"success": True, "bookmarked": False}
    else:
        await db["bookmarks"].insert_one({
            "userId": user_id,
            "itemId": item_id,
            "title": payload.get("title", ""),
            "createdAt": datetime.utcnow()
        })
        return {"success": True, "bookmarked": True}

# 4. Recommendations
@misc_router.get("/api/recommendations")
async def get_recommendations(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "success": True,
        "data": [
            {
                "title": "Two Pointers Pattern Practice",
                "reason": "Top recruitment frequency for target software engineering roles.",
                "path": "/arena",
                "cta": "Solve in Arena"
            },
            {
                "title": "Behavioral STAR Interview",
                "reason": "Calibrate structure and delivery for HR rounds.",
                "path": "/interview",
                "cta": "Start Mock"
            }
        ]
    }

# 5. Knowledge Search
@misc_router.get("/api/knowledge/search")
async def search_knowledge(q: str = Query("DSA")):
    db = get_database()
    topics = await db["knowledgetopics"].find({"title": {"$regex": q, "$options": "i"}}).limit(10).to_list(10)
    return {"success": True, "data": serialize_doc(topics)}

@misc_router.get("/api/knowledge/topics")
async def get_knowledge_topics():
    db = get_database()
    topics = await db["knowledgetopics"].find({}).limit(50).to_list(50)
    return {"success": True, "data": serialize_doc(topics)}

# 6. Admin
@misc_router.get("/api/admin/health")
async def admin_health():
    return {"success": True, "status": "optimal"}
