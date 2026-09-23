from datetime import datetime
from typing import Dict, Any, List, Optional
from core.database import get_database, to_object_id, serialize_doc
from .ai_provider import ai_provider

class CompanyService:
    @classmethod
    async def get_all_companies(cls) -> List[Dict[str, Any]]:
        db = get_database()
        comps = await db["companyprofiles"].find({}, {"name": 1, "tier": 1, "difficultyLevel": 1}).sort("name", 1).to_list(50)
        return serialize_doc(comps)

    @classmethod
    async def get_company_details(cls, company_name: str, user_id: str) -> Dict[str, Any]:
        db = get_database()
        comp = await db["companyprofiles"].find_one({"name": {"$regex": f"^{company_name}$", "$options": "i"}})
        if not comp:
            # Skeletons if not present
            comp = {
                "name": company_name,
                "tier": "Tier 1" if company_name in ["Google", "Amazon", "Microsoft", "Meta"] else "Tier 2",
                "overview": f"{company_name} engineering hiring overview and recruitment syllabus.",
                "difficultyLevel": 8 if company_name in ["Google", "Amazon", "Microsoft", "Meta"] else 5,
                "codingPattern": "Dynamic Programming, Graphs, and Hash Maps",
                "aptitudePattern": "Quantitative aptitude and critical reasoning"
            }
            res = await db["companyprofiles"].insert_one(comp)
            comp["_id"] = res.inserted_id

        comp_id = str(comp["_id"])
        progress = await db["companyprogresses"].find_one({"userId": user_id, "companyId": comp_id})
        if not progress:
            progress = {
                "userId": user_id,
                "companyId": comp_id,
                "roadmaps": {},
                "weakAreas": [],
                "strongAreas": []
            }
            await db["companyprogresses"].insert_one(progress)

        return {
            "company": serialize_doc(comp),
            "progress": serialize_doc(progress)
        }

    @classmethod
    async def generate_roadmap(cls, user_id: str, company_id: str, timeframe_days: int = 30, student_level: str = "Junior") -> List[Dict[str, Any]]:
        db = get_database()
        comp = await db["companyprofiles"].find_one({"_id": to_object_id(company_id)})
        comp_name = comp.get("name", "Target Company") if comp else "Target Company"

        prompt = f"""You are a career mentor at InterviewPilot AI.
Create a detailed {timeframe_days}-day preparation roadmap for a {student_level} student preparing for {comp_name}.
Output ONLY a valid JSON array of phases:
[
  {{
    "phase": "Week 1-2: Core DSA Foundations",
    "focus": "Arrays, Strings, and Two Pointers",
    "tasks": ["Solve 10 Array problems", "Review Big O complexity", "Implement Two Sum variations"]
  }},
  {{
    "phase": "Week 3-4: Advanced Structures & Mock",
    "focus": "Trees, Graphs, and System Design basics",
    "tasks": ["Solve 5 Tree traversals", "Practice 1 Mock Interview in studio"]
  }}
]"""

        roadmap_data = None
        try:
            res = await ai_provider.generate_json(prompt)
            data = res.get("data")
            if isinstance(data, list):
                roadmap_data = data
            elif isinstance(data, dict) and "roadmap" in data:
                roadmap_data = data["roadmap"]
        except Exception:
            pass

        if not roadmap_data:
            roadmap_data = [
                {
                    "phase": "Week 1: Algorithmic Foundations",
                    "focus": f"{comp_name} Coding Pattern Fundamentals",
                    "tasks": ["Master Two Pointers & Binary Search", "Practice Hash Map problem patterns"]
                },
                {
                    "phase": "Week 2: Technical Interview Calibration",
                    "focus": "STAR Framework & Deep Traversal",
                    "tasks": ["Practice 15-min AI Technical Mock", "Review repeated mistakes in Mistake Book"]
                }
            ]

        # Save to progress
        map_key = "thirtyDay" if timeframe_days == 30 else ("sixtyDay" if timeframe_days == 60 else "ninetyDay")
        await db["companyprogresses"].update_one(
            {"userId": user_id, "companyId": company_id},
            {"$set": {f"roadmaps.{map_key}": roadmap_data}},
            upsert=True
        )

        return roadmap_data

    @classmethod
    async def mentor_chat(cls, company_name: str, user_level: str, history: List[Dict[str, str]], current_message: str) -> str:
        prompt = f"""You are a senior hiring mentor at {company_name} advising a {user_level} candidate for InterviewPilot AI.
Candidate Question: {current_message}
Provide a crisp, actionable, placement-oriented response (3-5 sentences maximum). Focus directly on recruitment standards at {company_name}."""
        try:
            res = await ai_provider.generate(prompt)
            return res.get("text", "Focus on clean code, edge cases, and structured STAR explanations for your interviews.")
        except Exception:
            return f"To succeed at {company_name}, master high-frequency data structures, communicate your trade-offs clearly, and maintain a consistent coding streak."

company_service = CompanyService()
