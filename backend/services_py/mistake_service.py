from datetime import datetime
from typing import Dict, Any, List, Optional
from core.database import get_database, to_object_id, serialize_doc

class MistakeService:
    @classmethod
    async def get_mistakes(cls, user_id: str, resolved: Optional[bool] = None) -> List[Dict[str, Any]]:
        db = get_database()
        query: Dict[str, Any] = {"userId": user_id}
        if resolved is not None:
            query["resolved"] = resolved
        mistakes = await db["mistakes"].find(query).sort("lastAttemptAt", -1).to_list(50)
        return serialize_doc(mistakes)

    @classmethod
    async def get_stats(cls, user_id: str) -> Dict[str, Any]:
        db = get_database()
        total = await db["mistakes"].count_documents({"userId": user_id})
        resolved = await db["mistakes"].count_documents({"userId": user_id, "resolved": True})
        unresolved = total - resolved
        repeated = await db["mistakes"].count_documents({"userId": user_id, "resolved": False, "attemptCount": {"$gte": 2}})
        return {
            "totalMistakes": total,
            "resolvedMistakes": resolved,
            "unresolvedMistakes": unresolved,
            "repeatedMistakes": repeated
        }

    @classmethod
    async def resolve_mistake(cls, user_id: str, mistake_id: str) -> bool:
        db = get_database()
        m_oid = to_object_id(mistake_id)
        if not m_oid:
            return False
        res = await db["mistakes"].update_one(
            {"_id": m_oid, "userId": user_id},
            {"$set": {"resolved": True, "resolvedAt": datetime.utcnow()}}
        )
        return res.modified_count > 0

mistake_service = MistakeService()

class CareerAdvisorService:
    @classmethod
    async def get_dashboard(cls, user_id: str) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)
        user = await db["users"].find_one({"_id": user_oid})
        target_role = user.get("career", {}).get("targetRole") if user else "Software Engineer"
        
        return {
            "targetRole": target_role,
            "skillGap": [
                {"skill": "System Design", "level": "Developing", "gap": "High"},
                {"skill": "Dynamic Programming", "level": "Intermediate", "gap": "Medium"}
            ],
            "recommendedRoadmap": [
                {"step": "Phase 1: Algorithmic Rigor", "duration": "2 weeks", "goal": "Solve 15 Medium problems"},
                {"step": "Phase 2: Mock Interview Mastery", "duration": "2 weeks", "goal": "Complete 3 AI Technical Mocks"}
            ]
        }

career_advisor_service = CareerAdvisorService()
