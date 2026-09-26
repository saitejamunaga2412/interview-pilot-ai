import logging
from datetime import datetime, timedelta
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

    @classmethod
    async def acquire_delivery_lock(
        cls,
        dedupe_key: str,
        user_id: str,
        recipient: str,
        notification_type: str,
        subject: str
    ) -> bool:
        """
        Atomically claims an email dispatch slot in MongoDB.
        Guarantees that duplicate emails cannot be dispatched even under concurrent requests
        or repeated scheduler ticks.
        """
        if not dedupe_key:
            return True
        db = get_database()
        now = datetime.utcnow()

        existing = await db["notification_deliveries"].find_one({"dedupeKey": dedupe_key})
        if existing:
            status = existing.get("status")
            if status in ["accepted_by_smtp", "sent", "delivered", "suppressed"]:
                return False
            if status == "pending":
                updated_at = existing.get("updatedAt") or existing.get("createdAt")
                if updated_at and (now - updated_at) < timedelta(minutes=10):
                    return False
            # Allow up to 3 retry attempts for previously failed dispatches
            if existing.get("attemptCount", 1) >= 3:
                return False

            res = await db["notification_deliveries"].update_one(
                {"dedupeKey": dedupe_key, "status": existing.get("status")},
                {
                    "$set": {
                        "userId": user_id,
                        "recipient": recipient,
                        "type": notification_type,
                        "subject": subject,
                        "status": "pending",
                        "updatedAt": now
                    },
                    "$inc": {"attemptCount": 1}
                }
            )
            return res.modified_count > 0
        else:
            try:
                await db["notification_deliveries"].insert_one({
                    "dedupeKey": dedupe_key,
                    "userId": user_id,
                    "recipient": recipient,
                    "type": notification_type,
                    "subject": subject,
                    "status": "pending",
                    "attemptCount": 1,
                    "createdAt": now,
                    "updatedAt": now
                })
                return True
            except Exception:
                # Caught race condition where another process concurrently inserted
                return False

    @classmethod
    async def can_send_email(cls, dedupe_key: str) -> bool:
        """Checks whether an email with this dedupe_key has already been sent or is in progress."""
        if not dedupe_key:
            return True
        db = get_database()
        existing = await db["notification_deliveries"].find_one({"dedupeKey": dedupe_key})
        if existing:
            status = existing.get("status")
            if status in ["accepted_by_smtp", "sent", "delivered", "suppressed"]:
                return False
            if status == "pending":
                # In-flight guard: if a dispatch was attempted in the last 10 minutes, prevent duplicate
                updated_at = existing.get("updatedAt") or existing.get("createdAt")
                if updated_at and (datetime.utcnow() - updated_at) < timedelta(minutes=10):
                    return False
            # Allow up to 3 retry attempts for failed dispatches
            if existing.get("attemptCount", 1) >= 3:
                return False
        return True

    @classmethod
    async def record_delivery_attempt(cls, dedupe_key: str, user_id: str, recipient: str, notification_type: str, subject: str) -> None:
        if not dedupe_key:
            return
        db = get_database()
        await db["notification_deliveries"].update_one(
            {"dedupeKey": dedupe_key},
            {
                "$set": {
                    "userId": user_id,
                    "recipient": recipient,
                    "type": notification_type,
                    "subject": subject,
                    "status": "pending",
                    "updatedAt": datetime.utcnow()
                },
                "$inc": {"attemptCount": 1},
                "$setOnInsert": {"createdAt": datetime.utcnow()}
            },
            upsert=True
        )

    @classmethod
    async def record_delivery_result(cls, dedupe_key: str, success: bool, error: Optional[str] = None, mode: Optional[str] = None, delivery_status: Optional[str] = None) -> None:
        if not dedupe_key:
            return
        db = get_database()
        if delivery_status:
            status = delivery_status
        elif mode in ["dry_run", "suppressed", "suppressed_placeholder"]:
            status = "suppressed"
        elif success:
            status = "accepted_by_smtp"
        else:
            status = "failed"

        await db["notification_deliveries"].update_one(
            {"dedupeKey": dedupe_key},
            {
                "$set": {
                    "status": status,
                    "error": error,
                    "acceptedAt": datetime.utcnow() if success else None,
                    "updatedAt": datetime.utcnow()
                }
            }
        )

    @classmethod
    async def get_delivery_stats(cls) -> Dict[str, Any]:
        """Aggregates email delivery tracking metrics for admin monitoring."""
        db = get_database()
        total_queued = await db["notification_deliveries"].count_documents({})
        accepted = await db["notification_deliveries"].count_documents({"status": "accepted_by_smtp"})
        failed = await db["notification_deliveries"].count_documents({"status": "failed"})
        suppressed = await db["notification_deliveries"].count_documents({"status": {"$in": ["suppressed", "dry_run"]}})

        # Aggregate retry counts
        retries_cursor = db["notification_deliveries"].aggregate([
            {"$match": {"attemptCount": {"$gt": 1}}},
            {"$group": {"_id": None, "totalRetries": {"$sum": {"$subtract": ["$attemptCount", 1]}}}}
        ])
        retries_doc = await retries_cursor.to_list(1)
        total_retries = retries_doc[0]["totalRetries"] if retries_doc else 0

        # Breakdown by notification type
        type_cursor = db["notification_deliveries"].aggregate([
            {"$group": {"_id": "$type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ])
        by_type = {doc["_id"] or "unspecified": doc["count"] async for doc in type_cursor}

        # Recent failures (masked recipient for privacy)
        failed_cursor = db["notification_deliveries"].find(
            {"status": "failed"},
            {"_id": 0, "type": 1, "recipient": 1, "error": 1, "updatedAt": 1, "attemptCount": 1}
        ).sort("updatedAt", -1).limit(10)
        recent_errors = []
        async for doc in failed_cursor:
            raw_rec = doc.get("recipient") or ""
            parts = raw_rec.split("@")
            masked_rec = f"{parts[0][:2]}***@{parts[1]}" if len(parts) == 2 and len(parts[0]) > 2 else "***@***"
            recent_errors.append({
                "type": doc.get("type"),
                "maskedRecipient": masked_rec,
                "error": doc.get("error", "Unknown error")[:120],
                "attempts": doc.get("attemptCount", 1),
                "timestamp": doc.get("updatedAt").isoformat() if doc.get("updatedAt") else None
            })

        return {
            "totalTracked": total_queued,
            "acceptedBySmtp": accepted,
            "failed": failed,
            "suppressedDuplicatesOrDryRun": suppressed,
            "totalRetries": total_retries,
            "byType": by_type,
            "recentErrors": recent_errors
        }

notification_service = NotificationService()

