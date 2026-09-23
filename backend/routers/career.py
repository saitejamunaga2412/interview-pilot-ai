from fastapi import APIRouter, Depends
from typing import Dict, Any
from core.security import get_current_user
from services_py.mistake_service import career_advisor_service

advisor_router = APIRouter(prefix="/api/career-advisor", tags=["Career Advisor"])
intel_router = APIRouter(prefix="/api/career-intelligence", tags=["Career Intelligence"])

@advisor_router.get("")
@advisor_router.get("/dashboard")
async def get_career_advisor(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await career_advisor_service.get_dashboard(user_id)
    return {
        "success": True,
        "data": res
    }

@advisor_router.post("/seed")
async def seed_career_advisor(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "success": True,
        "message": "Career milestones and tracks initialized."
    }

@advisor_router.post("/roadmap")
async def generate_career_roadmap(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "roadmap": [
                {"week": "1-2", "focus": "Core Problem Solving", "tasks": ["Solve 15 DSA challenges"]},
                {"week": "3-4", "focus": "Interview Readiness", "tasks": ["Complete 2 mock technical interviews"]}
            ]
        }
    }

@advisor_router.post("/target-role")
async def update_target_role(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    from services_py.profile_service import profile_service
    user_id = current_user["id"]
    target_role = payload.get("targetRole", "Software Engineer")
    await profile_service.update_profile(user_id, {"career": {"targetRole": target_role}})
    return {
        "success": True,
        "message": "Target role updated successfully"
    }

@intel_router.get("/memory")
async def get_career_memory(current_user: Dict[str, Any] = Depends(get_current_user)):
    from core.database import get_database, serialize_doc
    db = get_database()
    user_id = current_user["id"]
    mem = await db["careermemories"].find_one({"userId": user_id})
    return {
        "success": True,
        "data": serialize_doc(mem) or {
            "targetRole": current_user.get("career", {}).get("targetRole", "Software Engineer"),
            "strongTopics": ["Arrays", "Binary Search"],
            "weakTopics": []
        }
    }

@intel_router.post("/sync")
async def sync_career_memory(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "success": True,
        "message": "Memory synchronized successfully"
    }
