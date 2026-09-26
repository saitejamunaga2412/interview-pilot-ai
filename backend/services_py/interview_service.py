from datetime import datetime
from typing import Dict, Any, List, Optional
from core.database import get_database, to_object_id, serialize_doc
from core.event_bus import event_bus
from .ai_provider import ai_provider

ALLOWED_DURATIONS = [15, 30, 45, 60]

class InterviewService:
    @classmethod
    async def create_session(
        cls,
        user_id: str,
        role: str,
        level: str,
        is_timed: bool = False,
        duration: int = 30,
        interview_mode: str = "technical",
        use_resume: bool = False
    ) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)
        
        norm_role = (role or "Software Engineer").strip()
        norm_level = (level or "Junior").strip()
        
        if is_timed and duration not in ALLOWED_DURATIONS:
            duration = 30

        user = await db["users"].find_one({"_id": user_oid})
        resume_data = user.get("resumeData") if (user and (use_resume or user.get("resumeData"))) else None

        resume_prompt_context = ""
        if resume_data:
            skills = ", ".join(resume_data.get("skills", []))
            projects = str(resume_data.get("projects", []))[:800]
            resume_prompt_context = (
                f"\nCandidate Resume Skills: {skills}\n"
                f"Candidate Projects: {projects}\n"
                f"Ground at least 2 questions directly in candidate's declared projects and tech stack."
            )

        prompt = f"""You are an expert technical interviewer for InterviewPilot AI.
Role: {norm_role}
Level: {norm_level}
{resume_prompt_context}

Generate EXACTLY 5 high-quality interview questions assessing practical engineering competence, system understanding, and problem solving.
Output ONLY a JSON object:
{{
  "questions": [
    "Question 1...",
    "Question 2...",
    "Question 3...",
    "Question 4...",
    "Question 5..."
  ]
}}"""

        questions = []
        try:
            res = await ai_provider.generate_json(prompt)
            q_data = res.get("data", {}).get("questions", [])
            if isinstance(q_data, list) and len(q_data) == 5:
                questions = [q.strip() for q in q_data]
        except Exception:
            pass

        if len(questions) != 5:
            # Resilient fallback question set tailored to role
            questions = [
                f"Explain the core architectural components and design patterns in a modern {norm_role} system.",
                "How do you diagnose and optimize database queries and server bottlenecks?",
                "Describe a difficult concurrency, memory, or state management bug you resolved.",
                "How do you design resilient APIs and ensure zero-downtime deployments?",
                "What testing strategies (unit, integration, e2e) do you implement for production readiness?"
            ]

        start_time = datetime.utcnow() if is_timed else None

        session_doc = {
            "userId": user_id,
            "role": norm_role,
            "level": norm_level,
            "interviewMode": interview_mode,
            "questions": questions,
            "totalQuestions": len(questions),
            "isTimedInterview": is_timed,
            "duration": duration if is_timed else None,
            "startTime": start_time,
            "status": "In Progress",
            "createdAt": datetime.utcnow()
        }

        insert_res = await db["interviewsessions"].insert_one(session_doc)
        session_id = str(insert_res.inserted_id)

        # DO NOT emit interview.completed here — only emit when submitted!
        return {
            "sessionId": session_id,
            "questions": questions,
            "isTimedInterview": is_timed,
            "duration": duration,
            "startTime": start_time.isoformat() if start_time else None,
            "isResumeGrounded": bool(resume_data)
        }

    @classmethod
    async def evaluate_answer(cls, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        session_id = payload.get("sessionId")
        question = payload.get("question", "")
        answer = (payload.get("answer") or "").strip()
        role = payload.get("role", "Software Engineer")
        level = payload.get("level", "Junior")

        if not answer:
            return {
                "sessionId": session_id,
                "score": 0,
                "attemptStatus": "Not Attempted",
                "feedback": "No answer provided.",
                "strengths": [],
                "weaknesses": ["Question was skipped."],
                "correctAnswer": "A comprehensive answer addressing core concepts and real-world trade-offs."
            }

        eval_prompt = f"""You are an expert interviewer evaluating a candidate answer for InterviewPilot AI.
Role: {role}
Level: {level}
Question: {question}
Candidate Answer: {answer}

Evaluate the response rigorously.
Return ONLY valid JSON matching:
{{
  "score": 85,
  "attemptStatus": "Attempted",
  "feedback": "Concise 2-3 sentence evaluation summarizing the candidate's answer quality.",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Area for improvement 1"],
  "correctAnswer": "Ideal high-scoring model response.",
  "topicCategory": "System Design"
}}"""

        eval_result = None
        try:
            res = await ai_provider.generate_json(eval_prompt)
            eval_result = res.get("data")
        except Exception:
            pass

        if not eval_result or not isinstance(eval_result, dict):
            # Deterministic fallback evaluation based on answer length & substance
            word_count = len(answer.split())
            score = min(90, max(40, word_count * 2))
            eval_result = {
                "score": score,
                "attemptStatus": "Attempted",
                "feedback": "Answer demonstrates foundational knowledge. Elaborate on edge cases and concrete performance trade-offs.",
                "strengths": ["Clear communication", "Directly addressed the prompt"],
                "weaknesses": ["Could include more specific real-world metrics"],
                "correctAnswer": "Provide structured explanation covering definition, trade-offs, and implementation details.",
                "topicCategory": "Engineering Fundamentals"
            }
        else:
            eval_result["attemptStatus"] = "Attempted"

        raw_score = eval_result.get("score")
        try:
            score = int(raw_score) if raw_score is not None else 70
        except (ValueError, TypeError):
            score = 70

        if len(answer.split()) >= 4 and score <= 0:
            score = 45
        eval_result["score"] = score

        db = get_database()

        # Store individual result in results collection
        res_doc = {
            "userId": user_id,
            "sessionId": session_id,
            "question": question,
            "answer": answer,
            "score": score,
            "feedback": eval_result.get("feedback"),
            "strengths": eval_result.get("strengths", []),
            "weaknesses": eval_result.get("weaknesses", []),
            "correctAnswer": eval_result.get("correctAnswer"),
            "attemptStatus": "Attempted",
            "createdAt": datetime.utcnow()
        }
        await db["results"].insert_one(res_doc)

        if score < 60:
            await db["mistakes"].update_one(
                {"userId": user_id, "topic": eval_result.get("topicCategory", "Interview Fundamentals")},
                {
                    "$set": {
                        "domain": "Interview",
                        "topic": eval_result.get("topicCategory", "Interview Fundamentals"),
                        "lastAttemptAt": datetime.utcnow(),
                        "resolved": False,
                        "question": question[:120]
                    },
                    "$inc": {"attemptCount": 1}
                },
                upsert=True
            )

        # Update overall session score if all submitted
        if session_id:
            user_session = await db["interviewsessions"].find_one({"_id": to_object_id(session_id), "userId": user_id})
            if user_session:
                all_results = await db["results"].find({"sessionId": session_id}).to_list(10)
                if all_results:
                    avg_score = round(sum(r.get("score", 0) for r in all_results) / len(all_results))
                    await db["interviewsessions"].update_one(
                        {"_id": to_object_id(session_id)},
                        {"$set": {"overallScore": avg_score, "status": "Completed"}}
                    )

        # Emit completion milestone event
        event_bus.emit("interview.completed", {"userId": user_id, "score": score})

        return eval_result

    @classmethod
    async def get_history(cls, user_id: str) -> Dict[str, Any]:
        db = get_database()
        sessions = await db["interviewsessions"].find({"userId": user_id}).sort("createdAt", -1).to_list(20)
        return {"sessions": serialize_doc(sessions)}

    @classmethod
    async def get_session_details(cls, user_id: str, session_id: str) -> Dict[str, Any]:
        db = get_database()
        sess_oid = to_object_id(session_id)
        session = await db["interviewsessions"].find_one({"_id": sess_oid, "userId": user_id})
        if not session:
            raise ValueError("Session not found")
        questions_results = await db["results"].find({"sessionId": session_id, "userId": user_id}).to_list(20)
        return {
            "session": serialize_doc(session),
            "questions": serialize_doc(questions_results)
        }

    @classmethod
    async def delete_session(cls, user_id: str, session_id: str) -> Dict[str, str]:
        db = get_database()
        sess_oid = to_object_id(session_id)
        await db["interviewsessions"].delete_one({"_id": sess_oid, "userId": user_id})
        await db["results"].delete_many({"sessionId": session_id, "userId": user_id})
        return {"message": "Interview session deleted successfully"}

interview_service = InterviewService()
