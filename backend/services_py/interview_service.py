import re
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
        db = get_database()
        session_id = payload.get("sessionId")
        question = payload.get("question", "")
        answer = (payload.get("answer") or "").strip()
        role = payload.get("role", "Software Engineer")
        level = payload.get("level", "Junior")
        question_index = payload.get("questionIndex")

        if question_index is None and session_id:
            try:
                sess = await db["interviewsessions"].find_one({"_id": to_object_id(session_id), "userId": user_id})
                if sess and "questions" in sess:
                    clean_questions = [str(q).strip() for q in sess["questions"]]
                    if question.strip() in clean_questions:
                        question_index = clean_questions.index(question.strip())
            except Exception:
                question_index = 0

        if not answer:
            empty_result = {
                "sessionId": session_id,
                "questionIndex": question_index if question_index is not None else 0,
                "score": 0,
                "attemptStatus": "Not Attempted",
                "feedback": "No answer provided.",
                "strengths": [],
                "weaknesses": ["Question was skipped."],
                "correctAnswer": "A comprehensive answer addressing core concepts and real-world trade-offs.",
                "isVerifiedAiEvaluation": False,
                "evaluationStatus": "Not Attempted",
                "evaluationDisclaimer": "Question was skipped or empty.",
                "retryAllowed": True
            }
            return empty_result

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
        is_verified_ai = False
        try:
            res = await ai_provider.generate_json(eval_prompt)
            eval_data = res.get("data")
            if isinstance(eval_data, dict) and "score" in eval_data:
                eval_result = eval_data
                is_verified_ai = True
        except Exception:
            eval_result = None
            is_verified_ai = False

        if not eval_result or not isinstance(eval_result, dict):
            # Substantive heuristic evaluation: evaluate question relevance, technical vocabulary, and explanatory depth
            q_lower = question.lower()
            ans_lower = answer.lower()
            words = ans_lower.split()
            word_count = len(words)
            
            # Extract meaningful question terms (including 3-letter technical acronyms like DNS, SQL, API, CPU, RAM)
            stopwords = {
                "what", "how", "why", "when", "where", "which", "with", "from", "that", "this",
                "your", "have", "been", "will", "would", "could", "should", "explain", "describe",
                "discuss", "the", "and", "for", "are", "you", "can", "use", "not", "any", "all",
                "out", "new", "its", "has", "had", "did", "was", "who", "whom", "into", "their"
            }
            q_raw_terms = [
                w.strip("?,.:;\"'()-_")
                for w in q_lower.split()
                if (len(w.strip("?,.:;\"'()-_")) >= 3) and (w.strip("?,.:;\"'()-_") not in stopwords)
            ]
            
            def stem_word(w: str) -> str:
                clean = w.strip("?,.:;\"'()-_").lower()
                for suf in ["ing", "tion", "tions", "ies", "es", "ed", "s"]:
                    if len(clean) > len(suf) + 3 and clean.endswith(suf):
                        return clean[:-len(suf)]
                return clean

            q_terms = [stem_word(t) for t in q_raw_terms if len(stem_word(t)) >= 3]
            ans_stems = [stem_word(w) for w in words]

            matched_q_terms = [
                term for term in q_terms
                if term in ans_lower or any(term in s or s in term for s in ans_stems if len(s) >= 4)
            ]

            
            # Domain-specific technical signals
            tech_vocabulary = {
                "api", "rest", "graphql", "grpc", "cache", "redis", "memcached", "database", "sql", "nosql",
                "query", "index", "b-tree", "hash", "latency", "throughput", "concurrency", "thread",
                "async", "await", "promise", "component", "state", "props", "hook", "dom", "algorithm",
                "complexity", "memory", "cpu", "server", "microservice", "docker", "kubernetes", "pipeline",
                "test", "deploy", "git", "schema", "architecture", "security", "token", "jwt", "scale",
                "scalability", "load", "optimization", "optimize", "distributed", "performance", "metric",
                "monitoring", "framework", "lifecycle", "queue", "kafka", "rabbitmq", "sharding", "replica",
                "replication", "transaction", "acid", "mutex", "lock", "deadlock", "dns", "tcp", "http",
                "tree", "graph", "heap", "stack", "linkedlist", "array", "binary", "sorting", "search",
                "linear", "logarithmic", "constant", "star", "loadbalancer", "cdn", "gateway", "resolver", "nameserver"
            }
            ans_words_clean = set(re.findall(r"[a-z0-9]+(?:-[a-z0-9]+)?", ans_lower))
            matched_tech = [t for t in tech_vocabulary if (t in ans_words_clean if len(t) <= 4 else t in ans_lower)]

            # Domain clusters for domain-mismatch protection
            domain_clusters = {
                "networking": {"dns", "ip", "tcp", "udp", "http", "https", "ssl", "tls", "resolver", "lookup", "nameserver", "packet", "socket", "network", "gateway", "cdn", "proxy", "loadbalancer"},
                "database": {"database", "sql", "nosql", "query", "index", "b-tree", "table", "schema", "transaction", "acid", "shard", "sharding", "replica", "replication", "deadlock", "redis", "cache"},
                "frontend": {"react", "hook", "props", "state", "dom", "component", "redux", "css", "html", "render", "jsx", "vdom", "reconcil"},
                "dsa": {"tree", "graph", "binary", "heap", "stack", "linkedlist", "array", "sorting", "search", "complexity", "algorithm", "travers", "recursion"}
            }
            q_words_clean = set(re.findall(r"[a-z0-9]+(?:-[a-z0-9]+)?", q_lower))

            q_cluster_names = [
                d for d, terms in domain_clusters.items()
                if any(t in q_words_clean or (len(t) > 4 and any(w.startswith(t) for w in q_words_clean)) for t in terms)
            ]
            has_domain_mismatch = False
            if q_cluster_names:
                ans_matches_q_cluster = any(
                    any((t in ans_words_clean or (len(t) > 4 and any(w.startswith(t) for w in ans_words_clean))) and t not in q_words_clean for t in domain_clusters[c])
                    for c in q_cluster_names
                )
                if not ans_matches_q_cluster:
                    other_clusters = [c for c in domain_clusters if c not in q_cluster_names]
                    other_matches = sum(
                        1 for c in other_clusters
                        if sum(1 for t in domain_clusters[c] if t in ans_words_clean or (len(t) > 4 and any(w.startswith(t) for w in ans_words_clean))) >= 2
                    )
                    if other_matches > 0:
                        has_domain_mismatch = True
            
            # Structural/depth indicators
            has_cause_effect = any(
                phr in ans_lower
                for phr in [
                    "because", "since", "as a result", "therefore", "in order to", "so that",
                    "instead of", "leads to", "resulting in", "trade-off", "tradeoff", "reduces",
                    "improves", "optimizes", "speeds up", "prevents", "ensures", "allows",
                    "avoids", "by using", "by storing", "enables", "causes", "meaning that"
                ]
            )
            has_metrics = bool(re.search(r"\b(o\([0-9a-z\s\^\*\+\-\/\(\)]+\)|\d+([%xX]|ms|s|gb|mb|kb|k)?)\b", answer, re.IGNORECASE))
            sentences = [s.strip() for s in re.split(r"[.!?]+", answer) if len(s.strip().split()) >= 3]

            # Anti-Keyword-Stuffing & Gibberish Protection:
            tech_density = (len(matched_tech) / max(1, word_count)) if word_count > 0 else 0
            is_keyword_stuffing = (tech_density > 0.4 and len(sentences) <= 1) or (word_count >= 10 and len(set(words)) / word_count < 0.4)

            if is_keyword_stuffing:
                calculated_score = 15
                feedback_text = "Answer appears to be isolated keywords or repetitive terms without coherent explanatory sentences. Use full sentences explaining technical decisions and trade-offs."
                strengths_list = ["Recognized relevant terminology"]
                weaknesses_list = ["Lacks sentence structure and context", "No problem-solving methodology demonstrated"]
            elif has_domain_mismatch:
                calculated_score = min(25, 10 + len(matched_tech) * 2)
                feedback_text = "Answer references technical concepts from an unrelated architectural domain. Please address the specific technology domain of the question directly."
                strengths_list = ["Demonstrates general technical vocabulary"]
                weaknesses_list = ["Concepts used belong to an unrelated domain", "Does not answer the core question asked"]
            elif word_count < 8:
                calculated_score = min(20, 10 + len(matched_tech) * 2)
                feedback_text = "Answer is too brief to demonstrate engineering competence. Elaborate with architecture details and implementation steps."
                strengths_list = ["Brief response"]
                weaknesses_list = ["Insufficient detail and depth"]
            elif len(matched_q_terms) == 0:
                # Off-topic / Irrelevant answer: does not address the question even if it mentions other tech concepts
                calculated_score = min(20, 10 + len(matched_tech) * 2)
                feedback_text = f"Answer does not address the core question topic ({', '.join(q_terms[:3]) if q_terms else 'the subject'}). Please answer the specific question directly."
                strengths_list = ["Attempted response"]
                weaknesses_list = ["Does not answer the core question asked", "Off-topic concepts discussed"]

            elif word_count < 15:
                # Concise, technically accurate answer
                if len(matched_q_terms) >= 1 and (len(matched_tech) >= 1 or has_metrics):
                    calculated_score = min(55, 30 + len(matched_q_terms) * 10 + (15 if has_metrics else 5))
                    feedback_text = "Concise and technically accurate core answer. Elaborate with architectural reasoning, edge cases, and trade-offs to achieve a higher score."
                    strengths_list = ["Accurate core concept", "Direct response to question"]
                    weaknesses_list = ["Provide more detailed architectural reasoning and trade-offs"]
                else:
                    calculated_score = min(25, 10 + len(matched_tech) * 3)
                    feedback_text = "Answer is brief and lacks sufficient technical depth. Provide concrete examples and detailed explanation."
                    strengths_list = ["Brief initial response"]
                    weaknesses_list = ["Lacks specific technical depth"]
            else:
                # Calibrated substantive scoring based on criteria:
                # Relevance (0-35), Technical Depth (0-35), Articulation/Explanation/Metrics (0-30)
                relevance_score = min(35, 12 + len(matched_q_terms) * 10) if (q_terms and matched_q_terms) else 20
                tech_score = min(35, len(matched_tech) * 7)
                has_coherent_sentences = len(sentences) >= 2 and word_count >= 25
                depth_score = (18 if (has_cause_effect or has_coherent_sentences) else 10) + (12 if has_metrics else 6)
                
                length_mult = 0.8 if word_count < 25 else 1.0
                calculated_score = int((relevance_score + tech_score + depth_score) * length_mult)
                calculated_score = min(90, max(30, calculated_score))
                feedback_text = "Answer demonstrates technical relevance and foundational understanding. Further detail on edge cases and failure modes would strengthen it."
                strengths_list = [f"Incorporates relevant engineering concepts ({', '.join(matched_tech[:3]) or 'technical focus'})", "Clear problem context"]
                weaknesses_list = ["Elaborate on production failure modes or scaling trade-offs"]

            eval_result = {
                "score": calculated_score,
                "attemptStatus": "Attempted",
                "feedback": feedback_text,
                "strengths": strengths_list,
                "weaknesses": weaknesses_list,
                "correctAnswer": f"A comprehensive model response addressing {q_terms[0] if q_terms else 'the core concept'} with architecture, performance trade-offs, and implementation metrics.",
                "topicCategory": "Engineering Fundamentals"
            }
        else:
            eval_result["attemptStatus"] = "Attempted"

        raw_score = eval_result.get("score")
        try:
            score = int(raw_score) if raw_score is not None else 70
        except (ValueError, TypeError):
            score = 70

        # Bound score properly between 0 and 100 without artificial inflation
        score = max(0, min(100, score))
        eval_result["score"] = score
        eval_result["isVerifiedAiEvaluation"] = is_verified_ai
        eval_result["evaluationStatus"] = "Verified" if is_verified_ai else "Heuristic Fallback"
        eval_result["evaluationDisclaimer"] = (
            "Verified evaluation generated by Google Gemini technical assessment engine."
            if is_verified_ai
            else "Automated heuristic estimate (AI evaluation offline). Not equivalent to human or expert assessment. Retry available."
        )
        eval_result["retryAllowed"] = True
        eval_result["questionIndex"] = question_index if question_index is not None else 0

        # Store individual result in results collection (upsert for idempotency & safe retries)
        res_doc = {
            "userId": user_id,
            "sessionId": session_id,
            "questionIndex": question_index if question_index is not None else 0,
            "question": question,
            "answer": answer,
            "score": score,
            "isVerifiedAiEvaluation": is_verified_ai,
            "evaluationStatus": eval_result["evaluationStatus"],
            "evaluationDisclaimer": eval_result["evaluationDisclaimer"],
            "feedback": eval_result.get("feedback"),
            "strengths": eval_result.get("strengths", []),
            "weaknesses": eval_result.get("weaknesses", []),
            "correctAnswer": eval_result.get("correctAnswer"),
            "attemptStatus": "Attempted",
            "updatedAt": datetime.utcnow()
        }

        # Safe Concurrent Upsert logic
        await db["results"].update_one(
            {
                "userId": user_id,
                "sessionId": session_id,
                "question": question
            },
            {
                "$set": res_doc,
                "$setOnInsert": {"createdAt": datetime.utcnow()}
            },
            upsert=True
        )

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

        # Update overall session score only when all expected questions are evaluated
        if session_id:
            user_session = await db["interviewsessions"].find_one({"_id": to_object_id(session_id), "userId": user_id})
            if user_session:
                all_results = await db["results"].find({"sessionId": session_id, "userId": user_id}).to_list(20)
                if all_results:
                    avg_score = round(sum(r.get("score", 0) for r in all_results) / len(all_results))
                    total_expected = user_session.get("totalQuestions") or len(user_session.get("questions", [])) or 5
                    is_completed = len(all_results) >= total_expected
                    update_data = {
                        "overallScore": avg_score,
                        "status": "Completed" if is_completed else user_session.get("status", "In Progress")
                    }
                    if is_completed and not user_session.get("completedAt"):
                        update_data["completedAt"] = datetime.utcnow()
                    await db["interviewsessions"].update_one(
                        {"_id": to_object_id(session_id), "userId": user_id},
                        {"$set": update_data}
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

        questions_results = await db["results"].find({"sessionId": session_id, "userId": user_id}).to_list(30)
        
        # Align results 1-to-1 with session questions
        session_questions = session.get("questions", [])
        ordered_results = []
        result_by_q = {r.get("question", "").strip(): r for r in questions_results}
        result_by_idx = {r.get("questionIndex"): r for r in questions_results if r.get("questionIndex") is not None}

        for idx, q_text in enumerate(session_questions):
            q_clean = q_text.strip()
            if q_clean in result_by_q:
                r = result_by_q[q_clean]
                r["questionIndex"] = idx
                ordered_results.append(r)
            elif idx in result_by_idx:
                ordered_results.append(result_by_idx[idx])

        # Include any remaining results that didn't match directly
        matched_ids = {str(r.get("_id")) for r in ordered_results}
        for r in questions_results:
            if str(r.get("_id")) not in matched_ids:
                ordered_results.append(r)

        return {
            "session": serialize_doc(session),
            "questions": serialize_doc(ordered_results)
        }


    @classmethod
    async def delete_session(cls, user_id: str, session_id: str) -> Dict[str, str]:
        db = get_database()
        sess_oid = to_object_id(session_id)
        await db["interviewsessions"].delete_one({"_id": sess_oid, "userId": user_id})
        await db["results"].delete_many({"sessionId": session_id, "userId": user_id})
        return {"message": "Interview session deleted successfully"}

interview_service = InterviewService()
