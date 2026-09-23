import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from core.database import get_database, to_object_id, serialize_doc

logger = logging.getLogger("uvicorn.error")

class NotificationService:
    @classmethod
    async def get_notifications(cls, user_id: str, limit: int = 30) -> List[Dict[str, Any]]:
        db = get_database()
        notes = await db["notifications"].find({"userId": user_id}).sort("createdAt", -1).limit(limit).to_list(limit)
        return serialize_doc(notes)

    @classmethod
    async def get_unread_count(cls, user_id: str) -> int:
        db = get_database()
        count = await db["notifications"].count_documents({"userId": user_id, "read": False})
        return count

    @classmethod
    async def mark_read(cls, user_id: str, notification_id: str) -> bool:
        db = get_database()
        n_oid = to_object_id(notification_id)
        if not n_oid:
            return False
        res = await db["notifications"].update_one(
            {"_id": n_oid, "userId": user_id},
            {"$set": {"read": True}}
        )
        return res.modified_count > 0

    @classmethod
    async def mark_all_read(cls, user_id: str) -> int:
        db = get_database()
        res = await db["notifications"].update_many(
            {"userId": user_id, "read": False},
            {"$set": {"read": True}}
        )
        return res.modified_count

    @classmethod
    async def delete_notification(cls, user_id: str, notification_id: str) -> bool:
        db = get_database()
        n_oid = to_object_id(notification_id)
        if not n_oid:
            return False
        res = await db["notifications"].delete_one({"_id": n_oid, "userId": user_id})
        return res.deleted_count > 0

    @classmethod
    async def create_notification(cls, payload: Dict[str, Any]) -> Optional[str]:
        db = get_database()
        dedupe_key = payload.get("dedupeKey")
        if dedupe_key:
            exists = await db["notifications"].find_one({"userId": payload["userId"], "dedupeKey": dedupe_key})
            if exists:
                return str(exists["_id"])

        doc = {
            "userId": payload["userId"],
            "type": payload.get("type", "general"),
            "title": payload.get("title", "Notification"),
            "message": payload.get("message", ""),
            "priority": payload.get("priority", "normal"),
            "actionLabel": payload.get("actionLabel"),
            "actionRoute": payload.get("actionRoute"),
            "source": payload.get("source", "system"),
            "dedupeKey": dedupe_key,
            "read": False,
            "createdAt": datetime.utcnow()
        }
        res = await db["notifications"].insert_one(doc)
        return str(res.inserted_id)

notification_service = NotificationService()
