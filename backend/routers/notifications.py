from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
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
@router.patch("/read-all")
async def mark_all_read(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_id = current_user["id"]
    modified = await notification_service.mark_all_read(user_id)
    return {
        "success": True,
        "message": f"Marked {modified} notifications as read"
    }

@router.put("/{notification_id}/read")
@router.patch("/{notification_id}/read")
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

@router.get("/email-stats")
async def get_email_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Admin and system email delivery tracking metrics."""
    stats = await notification_service.get_delivery_stats()
    return {
        "success": True,
        "data": stats
    }

@router.api_route("/unsubscribe", methods=["GET", "POST"])
async def unsubscribe_endpoint(
    token: Optional[str] = None,
    category: Optional[str] = "productUpdates",
    email: Optional[str] = None
):
    """
    Handles RFC-compliant one-click and web unsubscribe for optional communications.
    Preserves essential account and security emails while immediately disabling optional categories.
    """
    from core.database import get_database
    from core.security import decode_token
    db = get_database()

    target_email = None
    target_category = category or "productUpdates"

    if token:
        try:
            payload = decode_token(token)
            target_email = payload.get("sub") or payload.get("email")
            target_category = payload.get("category") or target_category
        except Exception:
            pass

    if not target_email and email:
        target_email = email.strip().lower()

    if not target_email:
        # If user opened the link without token/email, redirect to settings page
        return {
            "success": True,
            "message": "Please manage your notification preferences directly in Settings",
            "redirect": "/settings"
        }

    # Update database immediately for target user
    update_fields = {}
    if target_category == "productUpdates":
        update_fields["settings.notificationPreferences.productUpdates"] = False
    elif target_category == "dailyReminder":
        update_fields["settings.notificationPreferences.dailyReminder"] = False
    elif target_category == "weeklyProgressReport":
        update_fields["settings.notificationPreferences.weeklyProgressReport"] = False
    elif target_category == "monthlyPerformanceSummary":
        update_fields["settings.notificationPreferences.monthlyPerformanceSummary"] = False
    elif target_category in ["all", "all_optional"]:
        update_fields["settings.notificationPreferences.productUpdates"] = False
        update_fields["settings.notificationPreferences.dailyReminder"] = False
        update_fields["settings.notificationPreferences.weeklyProgressReport"] = False
        update_fields["settings.notificationPreferences.monthlyPerformanceSummary"] = False
    else:
        update_fields["settings.notificationPreferences.productUpdates"] = False

    res = await db["users"].update_many(
        {"email": target_email.lower().strip()},
        {"$set": update_fields}
    )

    return {
        "success": True,
        "message": f"Successfully unsubscribed from {target_category} emails. Essential security notifications remain active.",
        "modifiedCount": res.modified_count
    }

