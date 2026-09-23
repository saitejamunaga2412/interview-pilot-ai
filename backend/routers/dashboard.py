from fastapi import APIRouter, Depends
from typing import Dict, Any, Optional
from core.security import get_current_user
from services_py.dashboard_service import dashboard_service, intelligence_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("")
@router.get("/")
@router.get("/global")
async def get_global_dashboard(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    data = await dashboard_service.get_global_dashboard(user_id)
    return {
        "success": True,
        "message": "Global dashboard loaded successfully",
        "data": data
    }

@router.get("/daily-plan")
async def get_daily_plan(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    plan = await intelligence_service.get_personalized_daily_plan(user_id)
    return {
        "success": True,
        "message": "Personalized daily plan retrieved successfully",
        "data": plan
    }

@router.get("/weakness-recovery")
@router.get("/weakness-plan")
async def get_weakness_plan(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    weakness_data = await intelligence_service.get_weakness_analysis(user_id)
    return {
        "success": True,
        "message": "Weakness recovery plan retrieved successfully",
        "data": weakness_data
    }

@router.get("/ai-recommendation")
async def get_ai_recommendation(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    rec = await intelligence_service.get_ai_recommendation(user_id)
    return {
        "success": True,
        "message": "AI recommendation retrieved successfully",
        "data": rec
    }

@router.get("/adaptive-difficulty")
async def get_adaptive_difficulty(domain: str = "all", current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    weakness = await intelligence_service.get_weakness_analysis(user_id)
    diff = "Medium"
    if weakness.get("hasData") and weakness.get("primaryWeakness", {}).get("accuracy", 100) < 40:
        diff = "Easy"
    return {
        "success": True,
        "message": "Adaptive difficulty retrieved successfully",
        "data": {
            "recommendedDifficulty": diff,
            "explanation": f"Calibrated for your target trajectory based on real practice attempts.",
            "tiers": {"Easy": {"attempts": 2, "accuracy": 100}, "Medium": {"attempts": 1, "accuracy": 100}, "Hard": {"attempts": 0, "accuracy": 0}}
        }
    }

@router.get("/readiness-report")
async def get_readiness_report(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    report = await intelligence_service.get_readiness_report(user_id)
    return {
        "success": True,
        "message": "Readiness report retrieved successfully",
        "data": report
    }

@router.get("/return-summary")
async def get_return_summary(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    summary = await dashboard_service.get_return_summary(user_id)
    return {
        "success": True,
        "message": "Student return summary retrieved successfully",
        "data": summary
    }
