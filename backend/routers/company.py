from fastapi import APIRouter, Depends
from typing import Dict, Any, Optional
from core.security import get_current_user
from services_py.company_service import company_service

router = APIRouter(prefix="/api/company", tags=["Company Hub"])

@router.get("")
async def get_all_companies():
    companies = await company_service.get_all_companies()
    return {
        "success": True,
        "message": "Companies fetched successfully",
        "data": {"companies": companies}
    }

@router.get("/{name}")
async def get_company_details(name: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await company_service.get_company_details(name, user_id)
    return {
        "success": True,
        "message": "Company fetched successfully",
        "data": res
    }

@router.post("/roadmap")
async def generate_roadmap(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    roadmap = await company_service.generate_roadmap(
        user_id=user_id,
        company_id=payload.get("companyId", ""),
        timeframe_days=int(payload.get("timeframeDays", 30)),
        student_level=payload.get("studentLevel", "Junior")
    )
    return {
        "success": True,
        "message": "Roadmap generated",
        "data": {"roadmap": roadmap}
    }

@router.post("/mentor-chat")
async def mentor_chat(payload: Dict[str, Any]):
    reply = await company_service.mentor_chat(
        company_name=payload.get("companyName", "Tech Company"),
        user_level=payload.get("userLevel", "Junior"),
        history=payload.get("history", []),
        current_message=payload.get("currentMessage", "")
    )
    return {
        "success": True,
        "message": "Mentor replied",
        "data": {"reply": reply}
    }
