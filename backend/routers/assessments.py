from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from core.security import get_current_user, get_optional_user
from core.database import get_database, to_object_id
from services_py.assessment_service import assessment_service, simulation_service

assessment_router = APIRouter(tags=["Assessments"])
simulation_router = APIRouter(prefix="/api/simulation", tags=["Placement Simulation"])

@assessment_router.get("/dashboard")
async def get_assessment_dashboard(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    data = await assessment_service.get_dashboard(user_id)
    return {
        "success": True,
        "data": data
    }

@assessment_router.get("/all")
async def get_all_assessments():
    data = await assessment_service.get_all()
    return {
        "success": True,
        "data": data
    }

@assessment_router.get("/history")
async def get_assessment_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    data = await assessment_service.get_history(user_id)
    return {
        "success": True,
        "data": data
    }

@assessment_router.post("/start")
async def start_assessment(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await assessment_service.start_assessment(user_id, payload)
    return {
        "success": True,
        "data": res
    }

@assessment_router.get("/attempt/{attempt_id}")
async def get_assessment_attempt(attempt_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await assessment_service.get_attempt(user_id, attempt_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment attempt not found or unauthorized."
        )
    return {
        "success": True,
        "data": res
    }

@assessment_router.post("/attempt/{attempt_id}/autosave")
async def autosave_assessment_attempt(attempt_id: str, payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    answers = payload.get("answers", {})
    review_flags = payload.get("reviewFlags", {})
    success = await assessment_service.autosave_attempt(user_id, attempt_id, answers, review_flags)
    return {
        "success": success
    }

@assessment_router.post("/submit")
async def submit_assessment(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await assessment_service.submit_assessment(user_id, payload)
    return {
        "success": True,
        "data": res
    }

@assessment_router.get("/result/{result_id}")
async def get_result(result_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await assessment_service.get_result(user_id, result_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment result not found or unauthorized."
        )
    return {
        "success": True,
        "data": res
    }

@assessment_router.post("/{attempt_id}/autosave")
async def autosave_attempt_alias(attempt_id: str, payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    return await autosave_assessment_attempt(attempt_id, payload, current_user)

@assessment_router.post("/{attempt_id}/submit")
async def submit_assessment_alias(attempt_id: str, payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    payload_copy = dict(payload)
    if "attemptId" not in payload_copy:
        payload_copy["attemptId"] = attempt_id
    res = await assessment_service.submit_assessment(user_id, payload_copy)
    return {
        "success": True,
        "data": res
    }

@assessment_router.get("/{attempt_id}/result")
async def get_attempt_result_alias(attempt_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await assessment_service.get_result(user_id, attempt_id)
    if not res:
        db = get_database()
        attempt_doc = await db["assessmentattempts"].find_one({"_id": to_object_id(attempt_id), "userId": user_id})
        if attempt_doc and attempt_doc.get("resultId"):
            res = await assessment_service.get_result(user_id, attempt_doc["resultId"])
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment result not found or unauthorized."
        )
    return {
        "success": True,
        "data": res
    }

@assessment_router.get("/{assessment_id}")
async def get_assessment(assessment_id: str, current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    if current_user:
        user_id = current_user["id"]
        attempt = await assessment_service.get_attempt(user_id, assessment_id)
        if attempt:
            return {
                "success": True,
                "data": attempt
            }
    data = await assessment_service.get_assessment(assessment_id)
    return {
        "success": True,
        "data": data
    }

# Simulation routes
@simulation_router.post("/start")
async def start_simulation(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await simulation_service.start_simulation(user_id, payload.get("role", "Software Engineer"))
    return {
        "success": True,
        "data": res
    }

@simulation_router.get("/history")
async def get_simulation_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await simulation_service.get_history(user_id)
    return {
        "success": True,
        "data": res
    }

@simulation_router.get("/{sim_id}")
async def get_simulation(sim_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await simulation_service.get_simulation(user_id, sim_id)
    return {
        "success": True,
        "data": res
    }
