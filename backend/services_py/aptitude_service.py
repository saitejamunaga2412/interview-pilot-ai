import re
from datetime import datetime
from typing import Dict, Any, List, Optional
from core.database import get_database, to_object_id, serialize_doc

class AptitudeService:
    @classmethod
    async def get_topics(cls, domain: str = "Aptitude", user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        db = get_database()
        query = {"category": domain}
        topics = await db["learningtopics"].find(query).to_list(50)
        return serialize_doc(topics)

    @classmethod
    async def get_topic_details(cls, topic_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        db = get_database()
        topic = await db["learningtopics"].find_one({
            "$or": [{"topicId": topic_id}, {"_id": to_object_id(topic_id)}]
        })
        if not topic:
            # Return basic topic fallback
            topic = {
                "topicId": topic_id,
                "title": topic_id.replace("-", " ").title(),
                "category": "Aptitude",
                "formulas": ["Speed = Distance / Time", "Time = Distance / Speed"],
                "shortcuts": ["Relative speed in same direction = s1 - s2"]
            }
        return serialize_doc(topic)

    @classmethod
    async def get_practice_questions(cls, topic_id: str, options: Dict[str, Any]) -> List[Dict[str, Any]]:
        db = get_database()
        limit = int(options.get("limit", 10))
        difficulty = options.get("difficulty", "Easy")

        query: Dict[str, Any] = {
            "type": {"$in": ["aptitude", "reasoning", "Aptitude", "Reasoning"]}
        }
        if difficulty and difficulty.lower() != "all":
            query["difficulty"] = re.compile(f"^{difficulty}$", re.I)

        questions = await db["questions"].find(query).limit(limit).to_list(limit)
        if not questions:
            # Fallback sample questions if database questions collection has different tags
            questions = await db["questions"].find({}).limit(limit).to_list(limit)

        return serialize_doc(questions)

    @classmethod
    async def submit_practice(cls, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        answers = payload.get("answers", [])
        if not answers:
            raise ValueError("No answers submitted for evaluation")

        db = get_database()
        q_ids = [to_object_id(a.get("questionId")) for a in answers if a.get("questionId")]
        questions = await db["questions"].find({"_id": {"$in": q_ids}}).to_list(len(q_ids))
        q_map = {str(q["_id"]): q for q in questions}

        correct_count = 0
        total_time = 0
        results = []

        for ans in answers:
            q_id = str(ans.get("questionId"))
            q = q_map.get(q_id)
            if not q:
                q = {
                    "title": ans.get("title") or ans.get("questionText") or "Practice Question",
                    "questionText": ans.get("questionText") or ans.get("title") or "Practice Question",
                    "topic": payload.get("topicId", "Aptitude"),
                    "correctAnswer": ans.get("correctAnswer", "")
                }

            user_ans = str(ans.get("answer", "")).strip()
            correct_ans = str(q.get("correctAnswer", "")).strip()
            is_correct = user_ans == correct_ans
            time_spent = int(ans.get("timeSpentSeconds") or 45)

            total_time += time_spent
            if is_correct:
                correct_count += 1
            else:
                # Log to Mistake Book
                await db["mistakes"].update_one(
                    {"userId": user_id, "sourceId": q_id},
                    {
                        "$set": {
                            "userId": user_id,
                            "sourceType": "aptitude",
                            "sourceId": q_id,
                            "topic": q.get("topic", "Aptitude"),
                            "question": q.get("questionText") or q.get("title", "Practice Question"),
                            "studentAnswer": user_ans,
                            "correctAnswer": correct_ans,
                            "mistakeType": "Calculation Error",
                            "explanation": q.get("explanation", "Review the step-by-step formula."),
                            "resolved": False,
                            "lastAttemptAt": datetime.utcnow()
                        },
                        "$inc": {"attemptCount": 1}
                    },
                    upsert=True
                )

            results.append({
                "questionId": q_id,
                "title": q.get("title"),
                "questionText": q.get("questionText"),
                "userAnswer": user_ans,
                "correctAnswer": correct_ans,
                "isCorrect": is_correct,
                "timeSpentSeconds": time_spent,
                "explanation": q.get("explanation", "Apply standard quantitative formula.")
            })

        total_count = len(answers)
        accuracy = round((correct_count / total_count) * 100) if total_count > 0 else 0
        score = accuracy

        # Record attempt
        await db["assessmentattempts"].insert_one({
            "userId": user_id,
            "topicId": payload.get("topicId", "Aptitude"),
            "domain": payload.get("domain", "Aptitude"),
            "score": score,
            "accuracy": accuracy,
            "totalQuestions": total_count,
            "correctCount": correct_count,
            "createdAt": datetime.utcnow()
        })

        return {
            "score": score,
            "accuracy": accuracy,
            "correctCount": correct_count,
            "totalCount": total_count,
            "totalTimeSpentSeconds": total_time,
            "results": results
        }

    @classmethod
    async def get_progress_summary(cls, user_id: str, domain: str = "Aptitude") -> Dict[str, Any]:
        db = get_database()
        attempts = await db["assessmentattempts"].find({"userId": user_id, "domain": domain}).to_list(50)
        if not attempts:
            return {"accuracy": 0, "questionsSolved": 0, "masteredCount": 0}

        avg_acc = round(sum(a.get("accuracy", 0) for a in attempts) / len(attempts))
        total_q = sum(a.get("totalQuestions", 0) for a in attempts)
        return {"accuracy": avg_acc, "questionsSolved": total_q, "masteredCount": len(attempts)}

aptitude_service = AptitudeService()
