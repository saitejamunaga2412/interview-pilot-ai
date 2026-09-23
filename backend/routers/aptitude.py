from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional
from core.security import get_current_user, get_optional_user
from services_py.aptitude_service import aptitude_service

def make_aptitude_router(prefix: str, default_domain: str):
    router = APIRouter(prefix=prefix, tags=[default_domain])

    @router.get("/topics")
    async def get_topics(optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
        user_id = optional_user["id"] if optional_user else None
        topics = await aptitude_service.get_topics(default_domain, user_id)
        return {
            "success": True,
            "message": f"{default_domain} topics retrieved successfully",
            "data": topics
        }

    @router.get("/topics/{topic_id}")
    async def get_topic_details(topic_id: str, optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
        user_id = optional_user["id"] if optional_user else None
        details = await aptitude_service.get_topic_details(topic_id, user_id)
        return {
            "success": True,
            "message": "Topic details retrieved successfully",
            "data": details
        }

    @router.get("/practice/{topic_id}")
    async def get_practice_questions(
        topic_id: str,
        difficulty: str = "Easy",
        limit: int = 10,
        optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
    ):
        questions = await aptitude_service.get_practice_questions(
            topic_id,
            {"difficulty": difficulty, "limit": limit}
        )
        return {
            "success": True,
            "message": "Practice questions retrieved successfully",
            "data": {
                "questions": questions,
                "availableCount": len(questions),
                "requestedCount": limit
            }
        }

    @router.post("/submit")
    async def submit_practice(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
        user_id = current_user["id"]
        res = await aptitude_service.submit_practice(user_id, {**payload, "domain": default_domain})
        return {
            "success": True,
            "message": f"{default_domain} practice submitted and evaluated",
            "data": res
        }

    @router.get("/progress")
    async def get_progress(current_user: Dict[str, Any] = Depends(get_current_user)):
        user_id = current_user["id"]
        summary = await aptitude_service.get_progress_summary(user_id, default_domain)
        return {
            "success": True,
            "message": f"{default_domain} progress summary loaded",
            "data": summary
        }

    @router.post("/complete-learn/{topic_id}")
    async def complete_learn(topic_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
        return {
            "success": True,
            "message": "Learn section marked complete",
            "data": {"topicId": topic_id, "status": "completed"}
        }

    return router

aptitude_router = make_aptitude_router("/api/aptitude", "Aptitude")
reasoning_router = make_aptitude_router("/api/reasoning", "Reasoning")
