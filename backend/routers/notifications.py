from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from core.security import get_current_user
from services_py.notification_service import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
async def get_notifications(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    notes = await notification_service.get_notifications(user_id)
    return {
        "success": True,
        "data": notes
    }

@router.get("/unread-count")
async def get_unread_count(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    count = await notification_service.get_unread_count(user_id)
    return {
        "success": True,
        "data": {"count": count}
    }

@router.put("/read-all")
async def mark_all_read(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    modified = await notification_service.mark_all_read(user_id)
    return {
        "success": True,
        "message": f"Marked {modified} notifications as read"
    }

@router.put("/{notification_id}/read")
async def mark_read(notification_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    success = await notification_service.mark_read(user_id, notification_id)
    return {
        "success": success,
        "message": "Notification marked as read" if success else "Notification not found"
    }

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    success = await notification_service.delete_notification(user_id, notification_id)
    return {
        "success": success,
        "message": "Notification deleted" if success else "Notification not found"
    }

@router.put("/preferences")
async def update_preferences(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    from services_py.profile_service import profile_service
    user_id = current_user["id"]
    await profile_service.update_profile(user_id, {"settings": {"notificationPreferences": payload}})
    return {
        "success": True,
        "message": "Notification preferences updated"
    }
