import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from core.database import get_database, to_object_id, serialize_doc
from services_py.ai_provider import GeminiProvider

ai_provider = GeminiProvider()

class IntelligenceService:
    @classmethod
    async def get_readiness_report(cls, user_id: str) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)

        user, submissions, interviews, progress, assessments, unresolved_mistakes = await asyncio.gather(
            db["users"].find_one({"_id": user_oid}),
            db["submissions"].find({"userId": user_id}).to_list(100),
            db["interviewsessions"].find({"userId": user_id}).to_list(50),
            db["learningprogresses"].find({"user": user_oid}).to_list(50),
            db["assessmentattempts"].find({"userId": user_id}).to_list(50),
            db["mistakes"].find({"userId": user_id, "resolved": False}).sort("attemptCount", -1).to_list(10)
        )

        has_resume = bool(user and (user.get("career", {}).get("resumeUrl") or user.get("resumeData")))
        accepted_count = sum(1 for s in submissions if s.get("status") == "Accepted")

        # Has user performed ANY measurable activity?
        has_activity = bool(submissions or interviews or assessments or progress or unresolved_mistakes)

        # 1. Coding (30%)
        coding_score = 0
        if submissions:
            vol_score = min(60, round((accepted_count / 30) * 60))
            acc_score = round((accepted_count / len(submissions)) * 40)
            coding_score = min(100, vol_score + acc_score)

        # 2. Aptitude & Diagnostics (20%)
        total_ass = len(assessments)
        passed_ass = sum(1 for a in assessments if (a.get("score") or a.get("overallScore") or 0) >= 60)
        aptitude_score = 0
        if total_ass > 0:
            aptitude_score = min(100, round((passed_ass / total_ass) * 70 + min(30, total_ass * 5)))

        # 3. CS Fundamentals (20%)
        completed_topics = sum(1 for p in progress if p.get("status") == "completed")
        cs_score = min(100, completed_topics * 20)

        # 4. AI Interview (20%)
        interview_score = 0
        if interviews:
            valid_scores = [i.get("overallScore", 0) for i in interviews if (i.get("overallScore") or 0) > 0]
            if valid_scores:
                avg = sum(valid_scores) / len(valid_scores)
                interview_score = min(100, round(avg * 0.8 + min(20, len(interviews) * 5)))

        # 5. Resume (10%)
        resume_score = 0
        if has_resume:
            resume_score = 75
            skills = user.get("resumeData", {}).get("skills", [])
            if len(skills) >= 5: resume_score += 15
            projects = user.get("resumeData", {}).get("projects", [])
            if len(projects) >= 2: resume_score += 10
            resume_score = min(100, resume_score)

        if not has_activity:
            overall_readiness = 0
            readiness_status = "INSUFFICIENT DATA"
            main_blocker = "No performance data recorded yet"
            action_rec = "Complete your initial diagnostic assessment or first coding challenge to calibrate score."
        else:
            weights = {"coding": 0.30, "aptitude": 0.20, "cs": 0.20, "interview": 0.20, "resume": 0.10}
            overall_readiness = round(
                (coding_score * weights["coding"]) +
                (aptitude_score * weights["aptitude"]) +
                (cs_score * weights["cs"]) +
                (interview_score * weights["interview"]) +
                (resume_score * weights["resume"])
            )
            if overall_readiness >= 80: readiness_status = "READY"
            elif overall_readiness >= 65: readiness_status = "NEARLY READY"
            else: readiness_status = "NEEDS MORE PRACTICE"

            main_blocker = "No critical blockers detected"
            repeated = next((m for m in unresolved_mistakes if m.get("attemptCount", 0) >= 2), None)
            if repeated:
                main_blocker = f"Repeated conceptual errors on {repeated.get('topic')} ({repeated.get('attemptCount')} attempts)."
            elif not has_resume:
                main_blocker = "Resume not uploaded for ATS screening"
            elif coding_score < 40:
                main_blocker = "Low coding problem volume and consistency"
            elif aptitude_score < 40:
                main_blocker = "Aptitude and problem-solving speed below placement benchmark"
            action_rec = "Focus on your today's priority task."

        dimensions = [
            {"name": "Coding", "score": coding_score, "weight": "30%", "desc": f"{accepted_count} problems accepted"},
            {"name": "Aptitude", "score": aptitude_score, "weight": "20%", "desc": f"{total_ass} assessments/tests attempted"},
            {"name": "CS Fundamentals", "score": cs_score, "weight": "20%", "desc": f"{completed_topics} modules completed"},
            {"name": "AI Interview", "score": interview_score, "weight": "20%", "desc": f"{len(interviews)} mocks completed"},
            {"name": "Resume", "score": resume_score, "weight": "10%", "desc": "Document verified" if has_resume else "Missing resume"}
        ]

        return {
            "overallReadiness": overall_readiness,
            "readinessStatus": readiness_status,
            "dimensions": dimensions,
            "mainBlocker": main_blocker,
            "actionRecommendation": action_rec,
            "hasActivity": has_activity
        }

    @classmethod
    async def get_weakness_analysis(cls, user_id: str) -> Dict[str, Any]:
        db = get_database()

        mistakes, submissions, assessments = await asyncio.gather(
            db["mistakes"].find({"userId": user_id, "resolved": False}).sort("attemptCount", -1).to_list(10),
            db["submissions"].find({"userId": user_id}).sort("createdAt", -1).to_list(30),
            db["assessmentattempts"].find({"userId": user_id, "status": "Evaluated"}).sort("createdAt", -1).to_list(10)
        )

        # 1. Check repeated unresolved mistakes
        if mistakes:
            top_m = mistakes[0]
            topic = top_m.get("topic", "Dynamic Programming")
            domain = top_m.get("domain", "Coding")
            attempts = top_m.get("attemptCount", 1)
            accuracy = max(20, round(100 / max(1, attempts + 1)))

            recovery_plan = [
                {"day": 1, "title": f"Core Foundations of {topic}", "duration": "25 min"},
                {"day": 2, "title": f"Pattern Recognition & Edge Cases in {topic}", "duration": "30 min"},
                {"day": 3, "title": f"Timed Practice & Verification for {topic}", "duration": "35 min"}
            ]

            return {
                "hasData": True,
                "primaryWeakness": {
                    "topic": topic,
                    "domain": domain,
                    "attempts": attempts,
                    "accuracy": accuracy,
                    "status": "Needs Recovery"
                },
                "recoveryPlan": recovery_plan,
                "practiceRoute": "/mistakes" if domain == "Coding" else "/arena",
                "mainBlocker": f"Unresolved weakness in {topic} ({attempts} failed attempts)"
            }

        # 2. Check weak topics from assessments
        for ass in assessments:
            weak_topics = ass.get("weakTopics", [])
            if weak_topics:
                topic = weak_topics[0]
                recovery_plan = [
                    {"day": 1, "title": f"{topic} Conceptual Fundamentals", "duration": "25 min"},
                    {"day": 2, "title": f"{topic} Diagnostic Exercises", "duration": "30 min"},
                    {"day": 3, "title": f"{topic} Mock Assessment Drill", "duration": "30 min"}
                ]
                return {
                    "hasData": True,
                    "primaryWeakness": {
                        "topic": topic,
                        "domain": "Assessment Diagnostic",
                        "attempts": 1,
                        "accuracy": round(ass.get("accuracy", 45)),
                        "status": "Weak"
                    },
                    "recoveryPlan": recovery_plan,
                    "practiceRoute": "/assessment",
                    "mainBlocker": f"Diagnostic performance indicated weakness in {topic}"
                }

        # 3. Check failed coding submissions
        failed_subs = [s for s in submissions if s.get("status") != "Accepted"]
        if failed_subs:
            recent_failed = failed_subs[0]
            prob = await db["questions"].find_one({"_id": to_object_id(recent_failed.get("problemId"))})
            topic = (prob.get("topics") or [prob.get("title", "DSA")])[0] if prob else "Algorithmic Implementation"
            return {
                "hasData": True,
                "primaryWeakness": {
                    "topic": topic,
                    "domain": "Coding",
                    "attempts": len(failed_subs),
                    "accuracy": 35,
                    "status": "Needs Practice"
                },
                "recoveryPlan": [
                    {"day": 1, "title": f"{topic} Core Patterns", "duration": "25 min"},
                    {"day": 2, "title": f"{topic} Edge Case Handling", "duration": "30 min"}
                ],
                "practiceRoute": "/arena",
                "mainBlocker": f"Unaccepted submissions in {topic}"
            }

        # Clean empty state when no weakness data exists
        return {
            "hasData": False,
            "primaryWeakness": None,
            "recoveryPlan": [
                {"day": 1, "title": "Diagnostic Baseline Session", "duration": "20 min"},
                {"day": 2, "title": "Core Skill Calibration", "duration": "25 min"}
            ],
            "practiceRoute": "/assessment",
            "mainBlocker": "Complete your first assessment to unlock personalized weakness recovery."
        }

    @classmethod
    async def get_personalized_daily_plan(cls, user_id: str) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)

        user, submissions, interviews, assessments, mistakes = await asyncio.gather(
            db["users"].find_one({"_id": user_oid}),
            db["submissions"].find({"userId": user_id}).to_list(30),
            db["interviewsessions"].find({"userId": user_id}).to_list(20),
            db["assessmentattempts"].find({"userId": user_id}).to_list(20),
            db["mistakes"].find({"userId": user_id, "resolved": False}).sort("attemptCount", -1).to_list(5)
        )

        career = (user.get("career") or {}) if user else {}
        target_role = career.get("targetRole") or user.get("targetRole") or "Software Engineer"
        target_companies = career.get("targetCompanies") or ["Google", "Amazon", "TCS"]
        skill_level = career.get("currentSkillLevel") or "Beginner"
        daily_hours = career.get("dailyHours") or 1
        preferred_lang = career.get("preferredLanguage") or "Python"
        first_priority = (user.get("learningPreferences", {}).get("interests") or ["Coding"])[0] if user else "Coding"
        baseline_completed = career.get("baselineCompleted", False)

        # 1. Determine Next Best Action / Priority Task based on real user data
        if mistakes and mistakes[0].get("attemptCount", 0) >= 2:
            top_m = mistakes[0]
            priority_task = {
                "title": f"Review {top_m.get('topic')} Concept",
                "why": f"You encountered repeated errors in {top_m.get('topic')} ({top_m.get('attemptCount')} attempts). Targeted practice recommended.",
                "action": f"Retry and resolve {top_m.get('topic')} in Mistake Book",
                "estimated": "20 min",
                "path": "/mistakes",
                "domain": top_m.get("domain", "Mistakes"),
                "progress": 25
            }
        elif not baseline_completed and not assessments:
            priority_task = {
                "title": "Initial Placement Diagnostic",
                "why": f"Calibrate your starting baseline for {target_role} across Aptitude, DSA, and CS Core.",
                "action": "Complete the 10-minute diagnostic assessment",
                "estimated": "15 min",
                "path": "/assessment",
                "domain": "Diagnostic",
                "progress": 0
            }
        elif first_priority == "Aptitude" and not any(a.get("category") == "Aptitude" for a in assessments):
            priority_task = {
                "title": "Quantitative & Logical Aptitude",
                "why": f"Selected as your first focus area for {target_companies[0] if target_companies else 'campus'} recruitment drives.",
                "action": "Complete 15 quantitative reasoning problems",
                "estimated": "25 min",
                "path": "/aptitude",
                "domain": "Aptitude",
                "progress": 0
            }
        elif not submissions:
            priority_task = {
                "title": f"{preferred_lang} Algorithmic Foundations",
                "why": f"First coding session in {preferred_lang} to calibrate syntax and problem-solving speed for {target_role}.",
                "action": "Solve your first problem in Coding Arena",
                "estimated": "25 min",
                "path": "/arena",
                "domain": "Coding",
                "progress": 0
            }
        elif not interviews:
            priority_task = {
                "title": f"{target_role} Technical Mock",
                "why": "No interview performance data recorded yet. Measure communication and technical depth.",
                "action": "Complete a 15-minute AI Technical Simulation",
                "estimated": "20 min",
                "path": "/interview",
                "domain": "AI Interview",
                "progress": 0
            }
        else:
            priority_task = {
                "title": "Two Pointers & Binary Search Practice",
                "why": f"High frequency recruitment pattern for {target_role} roles at {', '.join(target_companies[:2])}.",
                "action": "Solve 2 medium algorithmic challenges",
                "estimated": "30 min",
                "path": "/arena",
                "domain": "Coding",
                "progress": 50
            }

        # 2. Dynamic daily sequence tailored to daily_hours & preferences
        if daily_hours >= 3:
            sequence = [
                {"step": 1, "name": "CS Fundamentals", "task": "Review 1 OS or DBMS Core Topic", "estimated": "30 min", "completed": False, "path": "/learning"},
                {"step": 2, "name": "Coding Arena", "task": f"Solve 2 DSA problems in {preferred_lang}", "estimated": "60 min", "completed": len(submissions) > 0, "path": "/arena"},
                {"step": 3, "name": "Aptitude", "task": "Complete 15 quantitative problems", "estimated": "45 min", "completed": len(assessments) > 0, "path": "/aptitude"},
                {"step": 4, "name": "AI Mock Interview", "task": f"15-min Technical Mock for {target_role}", "estimated": "30 min", "completed": len(interviews) > 0, "path": "/interview"},
                {"step": 5, "name": "Review Mistakes", "task": "Verify unresolved mistakes in Mistake Book", "estimated": "15 min", "completed": len(mistakes) == 0, "path": "/mistakes"}
            ]
        elif daily_hours == 2:
            sequence = [
                {"step": 1, "name": "Concept Learning", "task": f"Study 1 high-yield pattern for {target_role}", "estimated": "25 min", "completed": False, "path": "/learning"},
                {"step": 2, "name": "Coding Arena", "task": f"Solve 1-2 DSA problems in {preferred_lang}", "estimated": "45 min", "completed": len(submissions) > 0, "path": "/arena"},
                {"step": 3, "name": "Aptitude / Core", "task": "Practice 10 quantitative or CS questions", "estimated": "30 min", "completed": len(assessments) > 0, "path": "/aptitude"},
                {"step": 4, "name": "Review Mistakes", "task": "Review and resolve conceptual errors", "estimated": "20 min", "completed": len(mistakes) == 0, "path": "/mistakes"}
            ]
        else: # 1 hour default
            sequence = [
                {"step": 1, "name": "Daily Priority", "task": priority_task.get("action", "Complete core practice"), "estimated": "25 min", "completed": False, "path": priority_task.get("path", "/arena")},
                {"step": 2, "name": "Targeted Practice", "task": f"Solve 1 problem in {first_priority}", "estimated": "25 min", "completed": False, "path": "/arena" if first_priority == "Coding" else "/aptitude"},
                {"step": 3, "name": "Quick Review", "task": "Review daily takeaways & mistakes", "estimated": "10 min", "completed": False, "path": "/mistakes"}
            ]

        return {
            "priorityTask": priority_task,
            "tasks": [priority_task],
            "sequence": sequence,
            "targetRole": target_role,
            "dailyHours": daily_hours,
            "preferredLanguage": preferred_lang,
            "firstPriority": first_priority,
            "weakestCodingTopic": mistakes[0].get("topic") if mistakes else None
        }

    @classmethod
    async def get_ai_recommendation(cls, user_id: str) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)

        user, submissions_count, interviews_count, assessment_attempts, mistakes = await asyncio.gather(
            db["users"].find_one({"_id": user_oid}),
            db["submissions"].count_documents({"userId": user_id, "status": "Accepted"}),
            db["interviewsessions"].count_documents({"userId": user_id}),
            db["assessmentattempts"].find({"userId": user_id}).sort("createdAt", -1).limit(5).to_list(5),
            db["mistakes"].find({"userId": user_id, "resolved": False}).sort("attemptCount", -1).limit(3).to_list(3)
        )

        career = (user.get("career") or {}) if user else {}
        target_role = career.get("targetRole") or "Software Engineer"
        target_companies = career.get("targetCompanies") or ["Tech Companies"]
        skill_level = career.get("currentSkillLevel") or "Beginner"
        preferred_lang = career.get("preferredLanguage") or "Python"
        daily_hours = career.get("dailyHours") or 1
        baseline_score = career.get("baselineScore")

        weak_topic = mistakes[0].get("topic") if mistakes else None
        if not weak_topic and assessment_attempts:
            for a in assessment_attempts:
                if a.get("weakTopics"):
                    weak_topic = a["weakTopics"][0]
                    break

        # Check if new user
        is_new_user = (submissions_count == 0 and interviews_count == 0 and len(assessment_attempts) == 0)

        # Fallback recommendation
        if weak_topic:
            rec_text = f"Focus on {weak_topic} recovery to address recurring errors and gain up to +8 points in placement readiness."
            action_route = "/mistakes" if mistakes else "/arena"
        elif is_new_user:
            rec_text = f"Complete your initial skill assessment to calibrate your personalized preparation trajectory for {target_role}."
            action_route = "/assessment"
        else:
            rec_text = f"Maintain coding consistency in {preferred_lang} by tackling medium-difficulty problems targeting {target_companies[0]} benchmarks."
            action_route = "/arena"

        # Ask Gemini for intelligent reasoning using real available context
        try:
            prompt = f"""You are the AI Placement Advisor for InterviewPilot AI.
Analyze this candidate's authentic profile and activity:
- Target Role: {target_role}
- Target Companies: {', '.join(target_companies[:3])}
- Declared Level: {skill_level}
- Preferred Language: {preferred_lang}
- Daily Study Target: {daily_hours} hours
- Baseline Assessment Score: {baseline_score if baseline_score is not None else 'Not taken yet'}
- Coding Problems Accepted: {submissions_count}
- Mock Interviews Completed: {interviews_count}
- Identified Weak Topic: {weak_topic or 'None recorded yet'}
- New User: {is_new_user}

Instruction:
Answer: What should this user focus on next, and why?
Do NOT fabricate test scores or numbers that are not listed above.
If the candidate is new or lacks data, advise them directly to complete diagnostic calibration.
Return ONLY valid JSON:
{{
  "recommendation": "1-2 impactful sentences stating exact next focus and why.",
  "actionLabel": "START NOW",
  "actionRoute": "{action_route}"
}}"""
            gemini_res = await ai_provider.generate_json(prompt)
            data = gemini_res.get("data", {})
            if data.get("recommendation"):
                rec_text = data["recommendation"]
                if data.get("actionRoute"):
                    action_route = data["actionRoute"]
        except Exception:
            pass

        return {
            "recommendation": rec_text,
            "actionLabel": "START NOW",
            "actionRoute": action_route,
            "targetRole": target_role,
            "weakTopic": weak_topic
        }

class DashboardService:
    @classmethod
    async def get_global_dashboard(cls, user_id: str) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)

        user, submissions_count, recent_interviews, report, aptitude_summary = await asyncio.gather(
            db["users"].find_one({"_id": user_oid}),
            db["submissions"].count_documents({"userId": user_id, "status": "Accepted"}),
            db["interviewsessions"].find({"userId": user_id}).sort("createdAt", -1).limit(5).to_list(5),
            IntelligenceService.get_readiness_report(user_id),
            db["assessmentattempts"].find({"userId": user_id}).limit(10).to_list(10)
        )

        return {
            "profile": serialize_doc(user),
            "placementReadinessScore": report.get("overallReadiness", 0),
            "codingStats": {
                "problemsSolved": submissions_count
            },
            "aptitudeStats": {
                "accuracy": 0 if not aptitude_summary else round(sum(a.get("score") or a.get("overallScore") or 0 for a in aptitude_summary) / len(aptitude_summary)),
                "questionsSolved": len(aptitude_summary)
            },
            "recentInterviews": serialize_doc(recent_interviews),
            "readinessReport": report
        }

    @classmethod
    async def get_return_summary(cls, user_id: str) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)

        user, daily_plan, report = await asyncio.gather(
            db["users"].find_one({"_id": user_oid}),
            IntelligenceService.get_personalized_daily_plan(user_id),
            IntelligenceService.get_readiness_report(user_id)
        )

        first_name = (user.get("name", "").split()[0] if user and user.get("name") else "Candidate")
        hour = datetime.now().hour
        time_greeting = "Good morning" if hour < 12 else "Good afternoon" if hour < 17 else "Good evening"
        greeting = f"{time_greeting}, {first_name} 👋"

        readiness_score = report.get("overallReadiness", 0)
        has_activity = report.get("hasActivity", False)

        items = [
            {
                "id": "priority",
                "icon": "target",
                "label": "Today's Priority",
                "text": daily_plan.get("priorityTask", {}).get("action", "Complete your initial practice challenge.")
            },
            {
                "id": "progress",
                "icon": "trending",
                "label": "Progress",
                "text": f"Readiness score evaluated at {readiness_score}%." if has_activity else "Baseline diagnostic needed to unlock trajectory."
            },
            {
                "id": "focus",
                "icon": "alert",
                "label": "Focus Area",
                "text": f"Focus on {daily_plan.get('weakestCodingTopic')} recovery." if daily_plan.get("weakestCodingTopic") else f"Focus on {daily_plan.get('firstPriority', 'Coding')} foundations."
            }
        ]

        return {
            "greeting": greeting,
            "headline": "Here's what matters today.",
            "items": items,
            "actionLabel": "Start Today's Plan",
            "actionRoute": daily_plan.get("priorityTask", {}).get("path", "/arena"),
            "whileYouWereAway": {"show": False, "bulletPoints": []}
        }

dashboard_service = DashboardService()
intelligence_service = IntelligenceService()
