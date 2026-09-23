from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from core.database import get_database, to_object_id, serialize_doc
from core.event_bus import event_bus

class LearningService:
    @classmethod
    async def get_dashboard_data(cls, user_id: str, query: Dict[str, Any] = None) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)

        progresses = await db["learningprogresses"].find({"user": user_oid}).to_list(100)
        flashcards = await db["revisionitems"].find({"userId": user_id}).to_list(20)

        completed_count = sum(1 for p in progresses if p.get("status") == "completed")
        total_topics = max(1, await db["learningtopics"].count_documents({}))

        return {
            "progress": {
                "completed": completed_count,
                "total": total_topics,
                "percentage": round((completed_count / total_topics) * 100)
            },
            "revisionQueue": serialize_doc(flashcards),
            "recentTopics": serialize_doc(progresses[:5])
        }

    @classmethod
    async def get_topic_details(cls, user_id: Optional[str], topic_id: str, force_regenerate: bool = False) -> Dict[str, Any]:
        db = get_database()
        topic = await db["knowledgetopics"].find_one({
            "$or": [{"topicId": topic_id}, {"_id": to_object_id(topic_id)}]
        })
        lesson = None
        if topic and topic.get("lesson"):
            lesson = await db["lessons"].find_one({"_id": topic["lesson"]})

        if not topic:
            # Clean fallback curriculum topic
            clean_title = topic_id.replace("-", " ").title()
            topic = {
                "topicId": topic_id,
                "title": clean_title,
                "category": "DSA",
                "difficulty": "Medium",
                "summary": f"Comprehensive guide to mastering {clean_title}."
            }
            lesson = {
                "beginnerExplanation": f"{clean_title} is a core computer science concept frequently tested in technical placement rounds.",
                "realLifeAnalogy": "Think of it like an organized library catalogue where items can be looked up predictably.",
                "timeComplexity": "O(log n) to O(n) depending on operation",
                "spaceComplexity": "O(1) auxiliary",
                "codeSnippet": f"// Optimized implementation of {clean_title}\nfunction solve() {{\n  return true;\n}}",
                "interviewTips": ["Check boundary conditions and empty inputs.", "State time and space complexity upfront."]
            }

        return {
            "topic": serialize_doc(topic),
            "lesson": serialize_doc(lesson)
        }

    @classmethod
    async def evaluate_quiz(cls, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        answers = payload.get("answers", [])
        total = max(1, len(answers))
        correct = sum(1 for a in answers if a.get("isCorrect") or a.get("selected") == a.get("correct"))
        score = round((correct / total) * 100)

        db = get_database()
        user_oid = to_object_id(user_id)
        topic_id = payload.get("topicId", "DSA")

        # Update progress
        await db["learningprogresses"].update_one(
            {"user": user_oid, "topicId": topic_id},
            {"$set": {"score": score, "status": "completed", "updatedAt": datetime.utcnow()}},
            upsert=True
        )

        event_bus.emit("learning.completed", {"userId": user_id, "score": score, "topicCategory": "DSA"})

        return {
            "score": score,
            "passed": score >= 60,
            "correctCount": correct,
            "totalQuestions": total
        }

    @classmethod
    async def update_section_progress(cls, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)
        topic_id = payload.get("topicId", "DSA")

        await db["learningprogresses"].update_one(
            {"user": user_oid, "topicId": topic_id},
            {"$set": {"status": "completed", "updatedAt": datetime.utcnow()}},
            upsert=True
        )

        event_bus.emit("learning.completed", {"userId": user_id, "score": 1, "topicCategory": payload.get("category", "DSA")})
        return {"topicId": topic_id, "status": "completed"}

    @classmethod
    async def review_flashcard(cls, user_id: str, flashcard_id: str, quality: str) -> Dict[str, Any]:
        # Spaced repetition intervals: again (1d), hard (3d), good (7d), easy (14d)
        interval_days = 1
        if quality == "hard": interval_days = 3
        elif quality == "good": interval_days = 7
        elif quality == "easy": interval_days = 14

        next_date = datetime.utcnow() + timedelta(days=interval_days)

        db = get_database()
        f_oid = to_object_id(flashcard_id)
        if f_oid:
            await db["revisionitems"].update_one(
                {"_id": f_oid, "userId": user_id},
                {
                    "$set": {"interval": interval_days, "nextReviewDate": next_date},
                    "$push": {"history": {"date": datetime.utcnow(), "quality": quality}}
                }
            )

        return {"flashcardId": flashcard_id, "interval": interval_days, "nextReviewDate": next_date.isoformat()}

learning_service = LearningService()
