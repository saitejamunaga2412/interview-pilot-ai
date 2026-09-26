import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime
from typing import Any, Dict, List, Union
from .config import settings

logger = logging.getLogger("uvicorn.error")

client: AsyncIOMotorClient = None
db = None

def get_database():
    global client, db
    try:
        current_loop = asyncio.get_running_loop()
    except RuntimeError:
        current_loop = None

    needs_reconnect = False
    if db is None or client is None:
        needs_reconnect = True
    else:
        # Check if underlying client io_loop is closed
        client_loop = getattr(client, "io_loop", None)
        if client_loop and (client_loop.is_closed() or (current_loop and client_loop != current_loop)):
            needs_reconnect = True

    if needs_reconnect:
        client = AsyncIOMotorClient(settings.MONGO_URI)
        try:
            db_name = settings.MONGO_URI.split("/")[-1].split("?")[0] or settings.DB_NAME
        except Exception:
            db_name = settings.DB_NAME
        db = client[db_name]
    return db

def serialize_doc(doc: Union[Dict, List, Any]) -> Any:
    """Recursively converts MongoDB ObjectIds and datetimes to JSON-serializable types."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        res = {}
        for k, v in doc.items():
            if k == "_id":
                res["_id"] = str(v)
                if "id" not in doc:
                    res["id"] = str(v)
            elif isinstance(v, ObjectId):
                res[k] = str(v)
            elif isinstance(v, datetime):
                res[k] = v.isoformat()
            elif isinstance(v, (dict, list)):
                res[k] = serialize_doc(v)
            else:
                res[k] = v
        return res
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
    return doc

def to_object_id(id_str: Union[str, ObjectId]) -> ObjectId:
    if isinstance(id_str, ObjectId):
        return id_str
    try:
        return ObjectId(str(id_str).strip())
    except Exception:
        return None

async def ensure_indexes():
    """Ensure essential indexes exist for user scoping and query performance."""
    db = get_database()
    try:
        await db["users"].create_index("email", unique=True)
        await db["interviewsessions"].create_index("userId")
        await db["results"].create_index("userId")
        await db["results"].create_index("sessionId")
        await db["mistakes"].create_index("userId")
        await db["notifications"].create_index("userId")
        await db["notifications"].create_index([("userId", 1), ("dedupeKey", 1)])
        await db["notification_deliveries"].create_index("dedupeKey", unique=True)
        await db["notification_deliveries"].create_index("userId")
        await db["progress"].create_index("userId")
        await db["assessmentattempts"].create_index("userId")
        await db["assessmentattempts"].create_index([("userId", 1), ("status", 1)])
        await db["questions"].create_index([("topicId", 1), ("category", 1)])
        await db["resumeanalyses"].create_index([("userId", 1), ("createdAt", -1)])
        await db["projects"].create_index([("userId", 1), ("createdAt", -1)])
        logger.info("[MongoDB] Production indexes verified.")
    except Exception as ex:
        logger.warning(f"[MongoDB] Index creation notice: {ex}")
