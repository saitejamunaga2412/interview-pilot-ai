from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional
from core.security import get_current_user, get_optional_user
from services_py.learning_service import learning_service
from services_py.ai_teacher import AITeacherService

router = APIRouter(prefix="/api/learning", tags=["Learning"])

@router.get("/dashboard")
async def get_dashboard(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    data = await learning_service.get_dashboard_data(user_id)
    return {
        "success": True,
        "message": "Learning dashboard loaded successfully",
        "data": data
    }

@router.get("/topic/{topic_id}")
async def get_topic_details(topic_id: str, forceRegenerate: Optional[str] = None, optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    user_id = optional_user["id"] if optional_user else None
    data = await learning_service.get_topic_details(user_id, topic_id, forceRegenerate == "true")
    return {
        "success": True,
        "message": "Topic details retrieved successfully",
        "data": data
    }

@router.post("/teacher/chat")
async def chat_with_teacher(payload: Dict[str, Any], optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    topic_id = payload.get("topicId")
    history = payload.get("history", [])
    current_message = payload.get("currentMessage", "")
    step = payload.get("step", "general")
    context_meta = payload.get("contextMeta", {}) or {}

    user_name = "Student"
    if optional_user:
        context_meta["userId"] = optional_user["id"]
        if optional_user.get("name"):
            user_name = optional_user["name"].split()[0]
    context_meta["userName"] = user_name

    reply = await AITeacherService.chat(topic_id, history, current_message, step, context_meta)
    return {
        "success": True,
        "message": "AI Teacher generating",
        "data": reply
    }

@router.get("/teacher/chat/{chat_id}")
async def get_chat_status(chat_id: str):
    status_data = AITeacherService.get_chat_status(chat_id)
    if not status_data:
        return {
            "success": False,
            "message": "Chat not found",
            "data": {"status": "error"}
        }
    return {
        "success": True,
        "message": "Chat status retrieved",
        "data": status_data
    }

@router.post("/quiz")
async def evaluate_quiz(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await learning_service.evaluate_quiz(user_id, payload)
    return {
        "success": True,
        "message": "Quiz evaluated successfully",
        "data": res
    }

@router.post("/progress")
async def update_progress(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await learning_service.update_section_progress(user_id, payload)
    return {
        "success": True,
        "message": "Progress updated successfully",
        "data": {"progress": res}
    }

@router.post("/flashcards/review")
async def review_flashcard(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    flashcard_id = payload.get("flashcardId")
    quality = payload.get("quality", "good")
    res = await learning_service.review_flashcard(user_id, flashcard_id, quality)
    return {
        "success": True,
        "message": "Flashcard updated",
        "data": res
    }

@router.post("/review")
async def submit_review(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "success": True,
        "message": "Review submitted successfully",
        "data": {"item": payload}
    }

@router.post("/seed")
async def seed_graph(optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    return {
        "success": True,
        "message": "Graph seeded successfully",
        "data": {"nodes": []}
    }
