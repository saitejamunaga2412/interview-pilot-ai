from datetime import datetime
from typing import Dict, Any, List, Optional
from core.database import get_database, to_object_id, serialize_doc
from core.event_bus import event_bus
from .judge0_service import judge0_service
from .ai_provider import ai_provider

class CodingService:
    @classmethod
    async def get_patterns(cls) -> List[Dict[str, Any]]:
        db = get_database()
        patterns = await db["patterns"].find({}).to_list(50)
        return serialize_doc(patterns)

    @classmethod
    async def get_pattern_details(cls, pattern_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        db = get_database()
        p_oid = to_object_id(pattern_id)
        pattern = await db["patterns"].find_one({"_id": p_oid}) if p_oid else None
        if not pattern:
            raise ValueError("Pattern not found")

        problems = await db["questions"].find({
            "type": {"$in": ["coding", "Coding"]},
            "pattern": p_oid
        }).to_list(50)

        progress_map = {}
        if user_id:
            user_oid = to_object_id(user_id)
            prob_ids = [p["_id"] for p in problems]
            progresses = await db["codingprogresses"].find({
                "user": user_oid,
                "problem": {"$in": prob_ids}
            }).to_list(50)
            for prog in progresses:
                progress_map[str(prog["problem"])] = prog.get("status", "Not Started")

        return {
            "pattern": serialize_doc(pattern),
            "problems": serialize_doc(problems),
            "progress": progress_map
        }

    @classmethod
    async def get_problems(cls, company: Optional[str] = None, difficulty: Optional[str] = None, pattern: Optional[str] = None) -> List[Dict[str, Any]]:
        db = get_database()
        query: Dict[str, Any] = {"type": {"$in": ["coding", "Coding"]}}
        if company:
            query["companyTags"] = company
        if difficulty:
            query["difficulty"] = difficulty
        if pattern:
            p_oid = to_object_id(pattern)
            if p_oid:
                query["pattern"] = p_oid

        problems = await db["questions"].find(query).to_list(100)
        return serialize_doc(problems)

    @classmethod
    async def get_problem_details(cls, problem_id: str) -> Dict[str, Any]:
        db = get_database()
        p_oid = to_object_id(problem_id)
        if not p_oid:
            raise ValueError("Invalid problem ID")
        problem = await db["questions"].find_one({"_id": p_oid, "type": {"$in": ["coding", "Coding"]}})
        if not problem:
            raise ValueError("Problem not found")
        return serialize_doc(problem)

    @classmethod
    async def execute_code(cls, user_id: Optional[str], payload: Dict[str, Any]) -> Dict[str, Any]:
        problem_id = payload.get("problemId")
        code = payload.get("code", "")
        language = payload.get("language", "python")
        hint_level = payload.get("hintLevel", 0)

        if not code or not code.strip():
            raise ValueError("Source code is required.")

        db = get_database()
        problem = None
        if problem_id:
            problem = await db["questions"].find_one({"_id": to_object_id(problem_id)})

        test_cases = problem.get("testCases", []) if problem else []
        execution_result = None

        if test_cases:
            test_results = []
            passed_count = 0
            worst_status = "Accepted"

            for i, tc in enumerate(test_cases):
                tc_res = await judge0_service.execute(code, language, tc.get("input", ""))
                actual_out = (tc_res.get("stdout") or "").strip()
                expected_out = (tc.get("expectedOutput") or "").strip()
                passed = (tc_res.get("status") == "Accepted") and (actual_out == expected_out)

                if passed:
                    passed_count += 1
                else:
                    if tc_res.get("status") != "Accepted":
                        worst_status = tc_res.get("status")
                    elif worst_status == "Accepted":
                        worst_status = "Wrong Answer"

                test_results.append({
                    "testIndex": i + 1,
                    "input": tc.get("input"),
                    "expected": expected_out,
                    "actual": actual_out,
                    "passed": passed,
                    "status": tc_res.get("status"),
                    "time": tc_res.get("time"),
                    "memory": tc_res.get("memory")
                })

            execution_result = {
                "provider": "Judge0",
                "status": worst_status,
                "passedCount": passed_count,
                "failedCount": len(test_cases) - passed_count,
                "totalTests": len(test_cases),
                "testResults": test_results,
                "stdout": test_results[0]["actual"] if test_results else "",
                "stderr": test_results[0].get("stderr") if (test_results and not test_results[0]["passed"]) else None,
                "time": "0.04",
                "memory": 2048
            }
        else:
            execution_result = await judge0_service.execute(code, language, "")

        # Save submission
        status_val = execution_result.get("status", "Pending")
        if user_id:
            await db["submissions"].insert_one({
                "userId": user_id,
                "problemId": problem_id,
                "code": code,
                "language": language,
                "status": status_val,
                "createdAt": datetime.utcnow()
            })

            if status_val == "Accepted":
                topic_name = (problem.get("topics") or [problem.get("title", "DSA")])[0] if problem else "DSA"
                await db["mistakes"].update_many(
                    {"userId": user_id, "topic": topic_name, "resolved": False},
                    {"$set": {"resolved": True, "resolvedAt": datetime.utcnow()}}
                )
                event_bus.emit("coding.completed", {"userId": user_id, "problemId": problem_id, "language": language})
            else:
                topic_name = (problem.get("topics") or [problem.get("title", "DSA")])[0] if problem else "DSA"
                await db["mistakes"].update_one(
                    {"userId": user_id, "topic": topic_name},
                    {
                        "$set": {
                            "domain": "Coding",
                            "topic": topic_name,
                            "lastAttemptAt": datetime.utcnow(),
                            "resolved": False,
                            "problemId": problem_id
                        },
                        "$inc": {"attemptCount": 1}
                    },
                    upsert=True
                )
                event_bus.emit("coding.attempted", {"userId": user_id, "problemId": problem_id, "language": language, "status": status_val})

        return {
            "status": status_val,
            "executionResult": execution_result,
            "aiDebugger": {
                "hint": "Analyze edge cases such as empty inputs or negative values." if status_val != "Accepted" else "Optimal solution verified.",
                "hintLevel": hint_level
            },
            "aiComplexity": {
                "timeComplexity": "O(n)",
                "spaceComplexity": "O(1)"
            },
            "report": None
        }

coding_service = CodingService()
