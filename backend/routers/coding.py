from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional, List
from core.security import get_current_user, get_optional_user
from services_py.coding_service import coding_service

router = APIRouter(prefix="/api/coding", tags=["Coding Arena"])

@router.get("/patterns")
async def get_patterns():
    patterns = await coding_service.get_patterns()
    return {
        "success": True,
        "data": patterns
    }

@router.get("/patterns/{pattern_id}")
async def get_pattern_details(pattern_id: str, optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    user_id = optional_user["id"] if optional_user else None
    details = await coding_service.get_pattern_details(pattern_id, user_id)
    return {
        "success": True,
        "data": details
    }

@router.get("/problems")
async def get_problems(company: Optional[str] = None, difficulty: Optional[str] = None, pattern: Optional[str] = None):
    problems = await coding_service.get_problems(company, difficulty, pattern)
    return {
        "success": True,
        "data": problems
    }

@router.get("/problems/{problem_id}")
async def get_problem_details(problem_id: str):
    problem = await coding_service.get_problem_details(problem_id)
    return {
        "success": True,
        "data": problem
    }

@router.post("/execute")
async def execute_code(payload: Dict[str, Any], optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    user_id = optional_user["id"] if optional_user else None
    res = await coding_service.execute_code(user_id, payload)
    return {
        "success": True,
        "data": res
    }

@router.post("/hint")
async def get_hint(payload: Dict[str, Any], optional_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    return {
        "success": True,
        "data": {
            "hint": "Analyze potential edge cases such as empty input arrays or boundary numbers.",
            "hintLevel": payload.get("hintLevel", 1)
        }
    }

@router.post("/submit")
@router.post("/submissions")
async def submit_code(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    lang_id_map = {63: "javascript", 71: "python", 62: "java", 54: "cpp"}
    payload_copy = dict(payload)
    if "languageId" in payload_copy and "language" not in payload_copy:
        payload_copy["language"] = lang_id_map.get(payload_copy["languageId"], "javascript")

    if payload_copy.get("status") and payload_copy.get("topic"):
        from core.database import get_database, serialize_doc
        from datetime import datetime
        db = get_database()
        status_val = payload_copy["status"]
        topic_name = payload_copy["topic"]
        problem_id = payload_copy.get("problemId")
        sub_doc = {
            "userId": user_id,
            "problemId": problem_id,
            "topic": topic_name,
            "status": status_val,
            "code": payload_copy.get("code", ""),
            "language": payload_copy.get("language", "python"),
            "createdAt": datetime.utcnow()
        }
        await db["submissions"].insert_one(sub_doc)
        if status_val == "Accepted":
            await db["mistakes"].update_many(
                {"userId": user_id, "topic": topic_name, "resolved": False},
                {"$set": {"resolved": True, "resolvedAt": datetime.utcnow()}}
            )
        else:
            await db["mistakes"].update_one(
                {"userId": user_id, "topic": topic_name},
                {
                    "$set": {
                        "domain": "Coding",
                        "topic": topic_name,
                        "lastAttemptAt": datetime.utcnow(),
                        "resolved": False,
                        "problemId": problem_id
                    },
                    "$inc": {"attemptCount": 1}
                },
                upsert=True
            )
        return {
            "success": True,
            "data": {
                "submission": serialize_doc(sub_doc),
                "status": status_val
            }
        }

    res = await coding_service.execute_code(user_id, payload_copy)
    return {
        "success": True,
        "data": {
            "submission": res,
            "status": res.get("status")
        }
    }
