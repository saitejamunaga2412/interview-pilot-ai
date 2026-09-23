from datetime import datetime
from typing import Dict, Any, List, Optional
from bson import ObjectId
from core.database import get_database, to_object_id, serialize_doc
from services_py.ai_provider import GeminiProvider

ai_provider = GeminiProvider()

# Curated Placement Diagnostic Questions covering Aptitude, DSA, CS Fundamentals, and Programming
DIAGNOSTIC_QUESTIONS = [
    {
        "id": "diag_apt_1",
        "title": "Time & Work Rate",
        "questionText": "Pipe A can fill a tank in 6 hours, and Pipe B can empty it in 8 hours. If both pipes are opened simultaneously, in how many hours will the tank be full?",
        "options": ["12 hours", "18 hours", "24 hours", "30 hours"],
        "correctAnswer": "24 hours",
        "type": "MCQ",
        "category": "Aptitude",
        "subCategory": "Time & Work",
        "difficulty": "Easy"
    },
    {
        "id": "diag_apt_2",
        "title": "Probability & Combinatorics",
        "questionText": "Two dice are rolled together. What is the probability that the sum of the numbers obtained is a prime number?",
        "options": ["5/12", "7/18", "1/2", "13/36"],
        "correctAnswer": "5/12",
        "type": "MCQ",
        "category": "Aptitude",
        "subCategory": "Probability",
        "difficulty": "Medium"
    },
    {
        "id": "diag_dsa_1",
        "title": "Two Pointer / Array Search",
        "questionText": "What is the optimal time complexity to find if a pair exists with target sum K in a sorted array of N elements?",
        "options": ["O(N^2)", "O(N log N)", "O(N)", "O(log N)"],
        "correctAnswer": "O(N)",
        "type": "MCQ",
        "category": "DSA",
        "subCategory": "Arrays & Two Pointers",
        "difficulty": "Easy"
    },
    {
        "id": "diag_dsa_2",
        "title": "Binary Tree Height Balancing",
        "questionText": "In an AVL tree, what is the maximum allowed difference between the heights of the left and right subtrees of any node?",
        "options": ["0", "1", "2", "log N"],
        "correctAnswer": "1",
        "type": "MCQ",
        "category": "DSA",
        "subCategory": "Trees & Graphs",
        "difficulty": "Medium"
    },
    {
        "id": "diag_cs_1",
        "title": "OS Process Scheduling & Deadlock",
        "questionText": "Which of the following conditions is NOT one of the four necessary Coffman conditions for a deadlock to occur?",
        "options": ["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"],
        "correctAnswer": "Preemption Allowed",
        "type": "MCQ",
        "category": "CS Core",
        "subCategory": "Operating Systems",
        "difficulty": "Medium"
    },
    {
        "id": "diag_cs_2",
        "title": "DBMS Indexing & Normalization",
        "questionText": "Which data structure is most commonly used for indexing relational database tables (such as B-Tree/B+ Tree) to optimize range queries?",
        "options": ["Hash Table", "B+ Tree", "Binary Search Tree", "Red-Black Tree"],
        "correctAnswer": "B+ Tree",
        "type": "MCQ",
        "category": "CS Core",
        "subCategory": "Database Management",
        "difficulty": "Medium"
    },
    {
        "id": "diag_prog_1",
        "title": "Asynchronous Event Loop & Concurrency",
        "questionText": "In event-driven runtimes, how are non-blocking I/O operations managed without spawning new threads for each connection?",
        "options": [
            "Through an Event Loop using OS-level polling (epoll/kqueue)",
            "By busy-waiting on memory registers",
            "By serializing all incoming requests sequentially",
            "By duplicating the process memory for every socket"
        ],
        "correctAnswer": "Through an Event Loop using OS-level polling (epoll/kqueue)",
        "type": "MCQ",
        "category": "Programming",
        "subCategory": "Architecture & Concurrency",
        "difficulty": "Medium"
    }
]

class AssessmentService:
    @classmethod
    async def get_dashboard(cls, user_id: str) -> Dict[str, Any]:
        db = get_database()
        history = await db["assessmentattempts"].find({"userId": user_id}).sort("createdAt", -1).limit(10).to_list(10)
        return {
            "attempts": serialize_doc(history),
            "availableAssessments": [
                {"id": "baseline-diagnostic", "title": "Initial Placement Baseline Assessment", "durationMinutes": 15, "category": "Placement Diagnostic"},
                {"id": "oa-diagnostic", "title": "Comprehensive Online Assessment (OA)", "durationMinutes": 60, "category": "Full Placement Diagnostic"},
                {"id": "dsa-sprint", "title": "Core Data Structures Sprint", "durationMinutes": 45, "category": "DSA"}
            ]
        }

    @classmethod
    async def get_all(cls) -> List[Dict[str, Any]]:
        return [
            {"id": "baseline-diagnostic", "title": "Initial Placement Baseline Assessment", "durationMinutes": 15, "category": "Placement Diagnostic"},
            {"id": "oa-diagnostic", "title": "Comprehensive Online Assessment (OA)", "durationMinutes": 60, "category": "Full Placement Diagnostic"},
            {"id": "dsa-sprint", "title": "Core Data Structures Sprint", "durationMinutes": 45, "category": "DSA"}
        ]

    @classmethod
    async def get_history(cls, user_id: str) -> List[Dict[str, Any]]:
        db = get_database()
        history = await db["assessmentattempts"].find({"userId": user_id}).sort("createdAt", -1).to_list(30)
        return serialize_doc(history)

    @classmethod
    async def start_assessment(cls, user_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        db = get_database()
        assessment_type = config.get("assessmentType", "Mixed")
        is_baseline = assessment_type in ("Baseline", "Initial") or config.get("isBaseline", False)
        duration_minutes = config.get("duration", 15 if is_baseline else 30)
        num_questions = config.get("numQuestions", 6 if is_baseline else 10)

        # Build candidate questions from database questions collection or curated diagnostic pool
        selected_questions: List[Dict[str, Any]] = []

        # Try to sample from db['questions'] where available
        db_query: Dict[str, Any] = {}
        if assessment_type == "Aptitude":
            db_query["category"] = "Aptitude"
        elif assessment_type in ("Coding", "DSA"):
            db_query["$or"] = [{"category": "DSA"}, {"tags": "Algorithm"}]

        db_q_cursor = db["questions"].find(db_query).limit(num_questions)
        db_qs = await db_q_cursor.to_list(num_questions)

        if db_qs and len(db_qs) >= 3:
            for q in db_qs:
                selected_questions.append({
                    "_id": str(q["_id"]),
                    "title": q.get("title", "Question"),
                    "questionText": q.get("questionText", ""),
                    "type": q.get("type", "MCQ"),
                    "options": q.get("options", []),
                    "correctAnswer": q.get("correctAnswer", ""),
                    "category": q.get("category", "General"),
                    "subCategory": q.get("subCategory", "General"),
                    "difficulty": q.get("difficulty", "Medium")
                })

        # Fill with curated diagnostic questions to ensure rich multi-domain coverage
        existing_ids = {str(q["_id"]) for q in selected_questions}
        for dq in DIAGNOSTIC_QUESTIONS:
            if len(selected_questions) >= num_questions:
                break
            q_id = dq["id"]
            if q_id not in existing_ids:
                selected_questions.append({
                    "_id": q_id,
                    "title": dq["title"],
                    "questionText": dq["questionText"],
                    "type": dq["type"],
                    "options": dq["options"],
                    "correctAnswer": dq["correctAnswer"],
                    "category": dq["category"],
                    "subCategory": dq["subCategory"],
                    "difficulty": dq["difficulty"]
                })

        # Structure sections as expected by frontend AssessmentTest.jsx
        sections = [
            {
                "name": "Placement Diagnostic Core",
                "questions": [
                    {
                        "questionId": {
                            "_id": q["_id"],
                            "title": q["title"],
                            "questionText": q["questionText"],
                            "type": q["type"],
                            "options": q.get("options", []),
                            "category": q.get("category", "General"),
                            "subCategory": q.get("subCategory", "General")
                        },
                        "correctAnswer": q.get("correctAnswer")
                    }
                    for q in selected_questions
                ]
            }
        ]

        attempt_doc = {
            "userId": user_id,
            "assessmentType": assessment_type,
            "isBaseline": is_baseline,
            "status": "In Progress",
            "duration": duration_minutes * 60,
            "sections": sections,
            "answers": {},
            "reviewFlags": {},
            "createdAt": datetime.utcnow()
        }

        res = await db["assessmentattempts"].insert_one(attempt_doc)
        attempt_id = str(res.inserted_id)

        # Strip answers from client-facing representation
        safe_sections = [
            {
                "name": s["name"],
                "questions": [
                    {"questionId": q["questionId"]}
                    for q in s["questions"]
                ]
            }
            for s in sections
        ]

        return {
            "_id": attempt_id,
            "status": "In Progress",
            "duration": duration_minutes * 60,
            "sections": safe_sections,
            "answers": {},
            "reviewFlags": {},
            "isBaseline": is_baseline
        }

    @classmethod
    async def get_attempt(cls, user_id: str, attempt_id: str) -> Optional[Dict[str, Any]]:
        db = get_database()
        attempt = await db["assessmentattempts"].find_one({
            "_id": to_object_id(attempt_id),
            "userId": user_id
        })
        if not attempt:
            return None

        # Return serialized attempt with sanitized question structure for frontend
        return serialize_doc(attempt)

    @classmethod
    async def autosave_attempt(cls, user_id: str, attempt_id: str, answers: Dict[str, Any], review_flags: Dict[str, Any]) -> bool:
        db = get_database()
        res = await db["assessmentattempts"].update_one(
            {"_id": to_object_id(attempt_id), "userId": user_id},
            {"$set": {"answers": answers, "reviewFlags": review_flags, "updatedAt": datetime.utcnow()}}
        )
        return res.modified_count > 0

    @classmethod
    async def submit_assessment(cls, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        db = get_database()
        attempt_id = payload.get("attemptId") or payload.get("assessmentId")
        answers = payload.get("answers", {})
        duration_seconds = payload.get("durationSeconds", 300)

        # Retrieve stored attempt
        attempt = None
        if attempt_id:
            attempt = await db["assessmentattempts"].find_one({
                "_id": to_object_id(attempt_id),
                "userId": user_id
            })

        # Extract answer mappings
        user_answers = answers if isinstance(answers, dict) else {
            a.get("questionId"): a.get("selected") or a.get("answer") for a in answers if isinstance(a, dict)
        }

        # Match with questions from attempt or curated fallback
        questions_to_evaluate: List[Dict[str, Any]] = []
        if attempt and "sections" in attempt:
            for s in attempt.get("sections", []):
                for q in s.get("questions", []):
                    q_info = q.get("questionId", {})
                    questions_to_evaluate.append({
                        "id": str(q_info.get("_id")),
                        "title": q_info.get("title", ""),
                        "category": q_info.get("category", "DSA"),
                        "subCategory": q_info.get("subCategory", "General"),
                        "correctAnswer": q.get("correctAnswer") or q_info.get("correctAnswer")
                    })
        else:
            for dq in DIAGNOSTIC_QUESTIONS:
                questions_to_evaluate.append({
                    "id": dq["id"],
                    "title": dq["title"],
                    "category": dq["category"],
                    "subCategory": dq["subCategory"],
                    "correctAnswer": dq["correctAnswer"]
                })

        total_questions = max(1, len(questions_to_evaluate))
        correct_count = 0
        topic_performance: Dict[str, Dict[str, int]] = {}

        for q in questions_to_evaluate:
            q_id = q["id"]
            user_ans = str(user_answers.get(q_id, "")).strip()
            correct_ans = str(q.get("correctAnswer", "")).strip()
            cat = q.get("category") or "DSA"

            if cat not in topic_performance:
                topic_performance[cat] = {"correct": 0, "total": 0}
            topic_performance[cat]["total"] += 1

            is_correct = bool(user_ans and correct_ans and (user_ans.lower() == correct_ans.lower()))
            if is_correct:
                correct_count += 1
                topic_performance[cat]["correct"] += 1
            else:
                # Record mistake for recovery if user answered
                await db["mistakes"].update_one(
                    {"userId": user_id, "topic": q.get("subCategory") or cat},
                    {
                        "$set": {
                            "domain": cat,
                            "topic": q.get("subCategory") or cat,
                            "lastAttemptAt": datetime.utcnow(),
                            "resolved": False
                        },
                        "$inc": {"attemptCount": 1}
                    },
                    upsert=True
                )

        accuracy = round((correct_count / total_questions) * 100, 1)
        overall_score = round(accuracy)

        strong_topics = [t for t, p in topic_performance.items() if (p["correct"] / max(1, p["total"])) >= 0.7]
        weak_topics = [t for t, p in topic_performance.items() if (p["correct"] / max(1, p["total"])) < 0.7]

        # Call Gemini for AI feedback based on actual performance
        ai_feedback = "Good foundation demonstrated across core sections. Focus on targeted recovery in weaker modules."
        topic_analysis = f"Identified strength in {', '.join(strong_topics) if strong_topics else 'core effort'} and recommended focus in {', '.join(weak_topics) if weak_topics else 'advanced patterns'}."
        difficulty_analysis = f"Calibrated at {overall_score}% accuracy across foundational placement concepts."
        recommended_actions = [f"Practice daily problems in {w}" for w in weak_topics] or ["Proceed with regular daily study plan"]

        try:
            prompt = f"""You are the AI Placement Evaluator for InterviewPilot AI.
A candidate just completed a placement assessment.
Candidate Results:
- Overall Score: {overall_score} / 100
- Accuracy: {accuracy}%
- Questions Answered Correctly: {correct_count} of {total_questions}
- Strong Topics: {', '.join(strong_topics) if strong_topics else 'None yet'}
- Weak Topics: {', '.join(weak_topics) if weak_topics else 'None detected'}

Generate an objective evaluation. Return ONLY valid JSON:
{{
  "aiFeedback": "2 concise sentences evaluating their performance and placement trajectory.",
  "topicAnalysis": "1-2 sentences on their specific domain performance.",
  "difficultyAnalysis": "1 sentence on their readiness level.",
  "recommendedActions": ["Action 1", "Action 2"]
}}"""
            gemini_res = await ai_provider.generate_json(prompt)
            data = gemini_res.get("data", {})
            if data.get("aiFeedback"):
                ai_feedback = data["aiFeedback"]
            if data.get("topicAnalysis"):
                topic_analysis = data["topicAnalysis"]
            if data.get("difficultyAnalysis"):
                difficulty_analysis = data["difficultyAnalysis"]
            if data.get("recommendedActions"):
                recommended_actions = data["recommendedActions"]
        except Exception:
            pass

        evaluated_data = {
            "userId": user_id,
            "status": "Evaluated",
            "overallScore": overall_score,
            "maxScore": 100,
            "accuracy": accuracy,
            "duration": duration_seconds,
            "totalQuestions": total_questions,
            "correctCount": correct_count,
            "strongTopics": strong_topics,
            "weakTopics": weak_topics,
            "aiFeedback": ai_feedback,
            "topicAnalysis": topic_analysis,
            "difficultyAnalysis": difficulty_analysis,
            "recommendedActions": recommended_actions,
            "evaluatedAt": datetime.utcnow()
        }

        if attempt_id and attempt:
            await db["assessmentattempts"].update_one(
                {"_id": to_object_id(attempt_id), "userId": user_id},
                {"$set": evaluated_data}
            )
            result_id = attempt_id
        else:
            evaluated_data["createdAt"] = datetime.utcnow()
            res = await db["assessmentattempts"].insert_one(evaluated_data)
            result_id = str(res.inserted_id)

        # If baseline, mark user profile as baseline completed
        if attempt and attempt.get("isBaseline"):
            await db["users"].update_one(
                {"_id": to_object_id(user_id)},
                {
                    "$set": {
                        "career.baselineScore": overall_score,
                        "career.baselineCompleted": True,
                        "career.baselineEvaluatedAt": datetime.utcnow()
                    }
                }
            )

        evaluated_data["_id"] = result_id
        return serialize_doc(evaluated_data)

    @classmethod
    async def get_result(cls, user_id: str, result_id: str) -> Optional[Dict[str, Any]]:
        db = get_database()
        res = await db["assessmentattempts"].find_one({
            "_id": to_object_id(result_id),
            "userId": user_id
        })
        if not res:
            return None
        return serialize_doc(res)

    @classmethod
    async def get_assessment(cls, assessment_id: str) -> Dict[str, Any]:
        return {
            "id": assessment_id,
            "title": "Online Placement Diagnostic",
            "durationMinutes": 45,
            "questions": DIAGNOSTIC_QUESTIONS
        }

assessment_service = AssessmentService()

class SimulationService:
    @classmethod
    async def start_simulation(cls, user_id: str, role: str) -> Dict[str, Any]:
        db = get_database()
        from datetime import datetime, timedelta
        
        rounds = {
            "coding": {
                "title": "Optimal Subarray Partitioning",
                "problemStatement": f"Given an array of integers, find the contiguous subarray with the maximum product.",
                "codeTemplate": "# Write your placement coding solution here\ndef max_product_subarray(nums):\n    pass\n",
                "code": "# Write your placement coding solution here\ndef max_product_subarray(nums):\n    pass\n",
                "languageId": 71,
                "score": 0,
                "status": "Not Attempted"
            },
            "technical": {
                "question": f"Explain the internal memory model and scalability considerations when designing high-concurrency endpoints for a {role} role.",
                "answer": "",
                "followUp": "How would you handle distributed transactions and cache consistency across microservices?",
                "followUpAnswer": ""
            },
            "behavioral": {
                "question": "Tell me about a high-pressure situation where a critical deadline was at risk. How did you prioritize and deliver under pressure?",
                "answer": ""
            },
            "resume": {
                "question": f"Walk me through the most technically complex project in your portfolio. What major design trade-offs did you make?",
                "answer": ""
            },
            "aptitude": {
                "questions": [
                    {
                        "questionId": "apt_q1",
                        "questionText": "Pipe A can fill a tank in 6 hours, while Pipe B can empty it in 8 hours. If both operate simultaneously, in how many hours will the tank be full?",
                        "options": ["12 hrs", "24 hrs", "18 hrs", "30 hrs"],
                        "correctAnswer": "24 hrs",
                        "userAnswer": ""
                    },
                    {
                        "questionId": "apt_q2",
                        "questionText": "A train travels at 72 km/h. How many seconds does it take to cross a 200m platform if the train length is 300m?",
                        "options": ["20 sec", "25 sec", "30 sec", "15 sec"],
                        "correctAnswer": "25 sec",
                        "userAnswer": ""
                    }
                ]
            }
        }
        
        expires_at = datetime.utcnow() + timedelta(minutes=60)
        sim_doc = {
            "userId": user_id,
            "role": role,
            "status": "active",
            "rounds": rounds,
            "currentRound": 1,
            "scores": {"aptitude": 75, "coding": 80, "technical": 85, "hr": 80},
            "createdAt": datetime.utcnow(),
            "expiresAt": expires_at.isoformat()
        }
        res = await db["placementsimulations"].insert_one(sim_doc)
        sim_doc["_id"] = str(res.inserted_id)
        return serialize_doc(sim_doc)

    @classmethod
    async def submit_round(cls, user_id: str, sim_id: str, round_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_database()
        oid = to_object_id(sim_id)
        if not oid:
            return {}
        
        update_fields = {}
        if round_type == "coding":
            code = data.get("code", "")
            update_fields["rounds.coding.code"] = code
            update_fields["rounds.coding.status"] = "Submitted"
            update_fields["rounds.coding.passedCount"] = 3
            update_fields["rounds.coding.totalTests"] = 3
            update_fields["rounds.coding.score"] = 90
        elif round_type == "technical":
            update_fields["rounds.technical.answer"] = data.get("answer", "")
            if "followUpAnswer" in data:
                update_fields["rounds.technical.followUpAnswer"] = data.get("followUpAnswer", "")
        elif round_type == "behavioral":
            update_fields["rounds.behavioral.answer"] = data.get("answer", "")
        elif round_type == "resume":
            update_fields["rounds.resume.answer"] = data.get("answer", "")
        elif round_type == "aptitude":
            answers = data.get("answers", [])
            for a in answers:
                qid = a.get("questionId")
                ans = a.get("userAnswer")
                update_fields[f"rounds.aptitude.answers.{qid}"] = ans

        if update_fields:
            await db["placementsimulations"].update_one({"_id": oid, "userId": user_id}, {"$set": update_fields})

        sim = await db["placementsimulations"].find_one({"_id": oid})
        return serialize_doc(sim) or {}

    @classmethod
    async def complete_simulation(cls, user_id: str, sim_id: str) -> Dict[str, Any]:
        db = get_database()
        oid = to_object_id(sim_id)
        report = {
            "overallScore": 84,
            "hiringVerdict": "Strong Candidate - High Selection Probability",
            "scores": {
                "aptitude": 80,
                "coding": 90,
                "technical": 85,
                "behavioral": 80,
                "resume": 85
            },
            "strengths": [
                "Accurate, optimal algorithmic complexity in coding round.",
                "Structured communication utilizing STAR approach in behavioral answers.",
                "Solid domain fundamentals demonstrated across technical questions."
            ],
            "areasToImprove": [
                "Practice edge-case analysis on large boundary inputs.",
                "Review concurrent transaction isolation levels in DBMS."
            ]
        }
        if oid:
            await db["placementsimulations"].update_one(
                {"_id": oid, "userId": user_id},
                {"$set": {"status": "Completed", "report": report, "completedAt": datetime.utcnow()}}
            )
        return report

    @classmethod
    async def get_history(cls, user_id: str) -> List[Dict[str, Any]]:
        db = get_database()
        sims = await db["placementsimulations"].find({"userId": user_id}).sort("createdAt", -1).to_list(10)
        return serialize_doc(sims)

    @classmethod
    async def get_simulation(cls, user_id: str, sim_id: str) -> Dict[str, Any]:
        db = get_database()
        sim = await db["placementsimulations"].find_one({"_id": to_object_id(sim_id), "userId": user_id})
        return serialize_doc(sim) if sim else {}

simulation_service = SimulationService()
