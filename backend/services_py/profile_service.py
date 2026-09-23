import os
from pathlib import Path
from typing import Dict, Any, Optional
from core.database import get_database, to_object_id, serialize_doc
from core.config import settings

USER_SCOPED_COLLECTIONS = [
    "interviewsessions",
    "results",
    "placementsimulations",
    "mistakes",
    "mistakenotebooks",
    "careermemories",
    "aiprofiles",
    "ailearningmemories",
    "assessmentattempts",
    "bookmarks",
    "codingprogresses",
    "companyprogresses",
    "learningprogresses",
    "revisionitems",
    "skillgraphs",
    "submissions",
    "topicprogresses",
    "usernotes",
    "usertargets",
    "notifications"
]

def calculate_profile_completion(user: Dict[str, Any]) -> int:
    score = 0
    if user.get("name"): score += 10
    if user.get("email"): score += 10
    if user.get("phoneNumber"): score += 10
    academic = user.get("academic") or {}
    if academic.get("college"): score += 15
    if academic.get("branch") or academic.get("degree"): score += 10
    career = user.get("career") or {}
    if career.get("targetRole"): score += 15
    if career.get("targetCompanies"): score += 10
    skills = career.get("skills") or user.get("placementProfile", {}).get("skills") or user.get("skills") or (user.get("resumeData") or {}).get("skills")
    if skills: score += 10
    if career.get("resumeUrl") or user.get("resumeData") or user.get("resumeUrl"): score += 10
    return min(100, score)

class ProfileService:
    @classmethod
    async def get_profile(cls, user_id: str) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)
        if not user_oid:
            raise ValueError("Invalid user ID")

        user = await db["users"].find_one({"_id": user_oid})
        if not user:
            raise ValueError("User not found")

        user_data = serialize_doc(user)
        user_data["completionPercentage"] = calculate_profile_completion(user)
        return user_data

    @classmethod
    async def update_profile(cls, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)
        if not user_oid:
            raise ValueError("Invalid user ID")

        set_fields = {}
        top_level = ["name", "phoneNumber", "dateOfBirth", "gender", "profilePhoto", "resumeUrl", "onboardingCompleted"]
        for f in top_level:
            if f in payload:
                set_fields[f] = payload[f]

        nested = ["academic", "career", "placementProfile", "learningPreferences", "settings"]
        for n in nested:
            if n in payload and isinstance(payload[n], dict):
                for sub_k, sub_v in payload[n].items():
                    set_fields[f"{n}.{sub_k}"] = sub_v

        # Ensure skills are synchronized across placementProfile and career
        if "skills" in payload:
            set_fields["career.skills"] = payload["skills"]
            set_fields["placementProfile.skills"] = payload["skills"]
        elif "placementProfile" in payload and "skills" in payload["placementProfile"]:
            set_fields["career.skills"] = payload["placementProfile"]["skills"]
        elif "career" in payload and "skills" in payload["career"]:
            set_fields["placementProfile.skills"] = payload["career"]["skills"]

        if set_fields:
            await db["users"].update_one({"_id": user_oid}, {"$set": set_fields})

        return await cls.get_profile(user_id)

    @classmethod
    async def delete_account(cls, user_id: str) -> Dict[str, str]:
        db = get_database()
        user_oid = to_object_id(user_id)
        if not user_oid:
            raise ValueError("Invalid user ID")

        user = await db["users"].find_one({"_id": user_oid})
        if not user:
            raise ValueError("User not found")

        # 1. Purge uploaded files
        uploads_dir = Path(settings.UPLOAD_DIR)
        for sub in ["photos", "resumes"]:
            dir_path = uploads_dir / sub
            if dir_path.exists():
                for f in dir_path.glob(f"{user_id}-*"):
                    try:
                        f.unlink(missing_ok=True)
                    except Exception:
                        pass

        # 2. Cascade delete across all user-scoped collections
        for col_name in USER_SCOPED_COLLECTIONS:
            try:
                await db[col_name].delete_many({"$or": [{"userId": user_id}, {"user": user_oid}, {"userId": user_oid}]})
            except Exception:
                pass

        # 3. Delete user document itself
        await db["users"].delete_one({"_id": user_oid})

        return {"message": "Account and all associated records deleted permanently."}

profile_service = ProfileService()
