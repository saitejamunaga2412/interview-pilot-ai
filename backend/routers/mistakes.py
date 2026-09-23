from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional
from core.security import get_current_user
from services_py.mistake_service import mistake_service

router = APIRouter(prefix="/api/mistakes", tags=["Mistake Notebook"])

@router.get("")
async def get_mistakes(resolved: Optional[bool] = None, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    mistakes = await mistake_service.get_mistakes(user_id, resolved)
    return {
        "success": True,
        "data": mistakes
    }

@router.get("/stats")
async def get_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    stats = await mistake_service.get_stats(user_id)
    return {
        "success": True,
        "data": stats
    }

@router.put("/{mistake_id}/resolve")
async def resolve_mistake(mistake_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    res = await mistake_service.resolve_mistake(user_id, mistake_id)
    return {
        "success": res,
        "message": "Mistake marked as resolved" if res else "Mistake not found"
    }
