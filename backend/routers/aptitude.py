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
            "data": {
                "topic": details,
                "progress": {
                    "masteryPercentage": 35,
                    "status": "Developing",
                    "highestDifficultyUnlocked": "Easy",
                    "completedSteps": ["learn"]
                }
            }
        }

    @router.get("/practice/{topic_id}")
    @router.get("/topics/{topic_id}/practice")
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
    @router.post("/practice/submit")
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
    @router.post("/topics/{topic_id}/complete-learn")
    async def complete_learn(topic_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
        return {
            "success": True,
            "message": "Learn section marked complete",
            "data": {"topicId": topic_id, "status": "completed"}
        }

    @router.get("/mistakes")
    async def get_aptitude_mistakes(optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
        from core.database import get_database, serialize_doc
        user_id = optional_user["id"] if optional_user else None
        db = get_database()
        query = {"sourceType": {"$in": [default_domain.lower(), "aptitude", "reasoning"]}}
        if user_id:
            query["userId"] = user_id
        mistakes = await db["mistakes"].find(query).limit(50).to_list(50)
        return {"success": True, "data": serialize_doc(mistakes)}

    @router.get("/mistakes/today")
    async def get_todays_mistakes(optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
        from core.database import get_database, serialize_doc
        user_id = optional_user["id"] if optional_user else None
        db = get_database()
        query = {"sourceType": {"$in": [default_domain.lower(), "aptitude", "reasoning"]}, "resolved": False}
        if user_id:
            query["userId"] = user_id
        items = await db["mistakes"].find(query).limit(10).to_list(10)
        return {"success": True, "data": {"queue": serialize_doc(items), "dueCount": len(items)}}

    @router.post("/mistakes/{mistake_id}/review")
    async def review_mistake(mistake_id: str, payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
        from datetime import datetime
        from core.database import get_database, to_object_id
        db = get_database()
        is_correct = payload.get("isCorrect", False)
        oid = to_object_id(mistake_id)
        if oid:
            await db["mistakes"].update_one(
                {"_id": oid},
                {"$set": {"resolved": is_correct, "reviewedAt": datetime.utcnow()}}
            )
        return {"success": True, "message": "Mistake updated"}

    @router.get("/roadmap")
    async def get_roadmap(optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
        return {
            "success": True,
            "data": {
                "phases": [
                    {"phase": 1, "title": "Quantitative Foundations", "topics": ["Number System", "Percentages", "Ratio & Proportion"]},
                    {"phase": 2, "title": "Advanced Arithmetic", "topics": ["Time & Work", "Speed & Distance", "Profit & Loss"]},
                    {"phase": 3, "title": "Logical Reasoning & DI", "topics": ["Syllogisms", "Data Interpretation", "Blood Relations"]}
                ]
            }
        }

    return router

aptitude_router = make_aptitude_router("/api/aptitude", "Aptitude")
reasoning_router = make_aptitude_router("/api/reasoning", "Reasoning")
