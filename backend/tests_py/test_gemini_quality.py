import asyncio
import time
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services_py.ai_provider import ai_provider
from services_py.ai_teacher import AITeacherService
from services_py.interview_service import interview_service
from services_py.resume_service import resume_service
from services_py.mistake_service import career_advisor_service

async def run_quality_audit():
    print("=== GEMINI AI QUALITY & FEATURE AUDIT ===")
    
    # 1. Empty message
    t0 = time.time()
    res1 = await AITeacherService.chat(None, [], "", "general", {})
    t1 = time.time()
    print(f"1. Empty Message -> Status: {res1.get('status')}, Elapsed: {(t1-t0)*1000:.1f}ms")
    assert res1.get("status") == "ready", "Empty message should return ready status"

    # 2. Greeting
    t0 = time.time()
    res2 = await AITeacherService.chat(None, [], "Hello!", "general", {"userName": "Alex"})
    t2 = time.time()
    print(f"2. Greeting -> Reply: \"{res2.get('reply')}\", Elapsed: {(t2-t0)*1000:.1f}ms")
    assert len(res2.get("reply", "")) < 200, "Greeting should be concise"
    assert "Alex" in res2.get("reply", "") or "InterviewPilot" in res2.get("reply", "")

    # 3. Binary search
    t0 = time.time()
    res3 = await AITeacherService.chat(None, [], "What is a binary search?", "general", {})
    t3 = time.time()
    print(f"3. Binary Search -> Length: {len(res3.get('reply', ''))} chars, Elapsed: {(t3-t0)*1000:.1f}ms")
    assert "log" in res3.get("reply", "").lower() or "divide" in res3.get("reply", "").lower(), "Should mention log n or divide"

    # 4. Merge sort time complexity
    t0 = time.time()
    res4 = await AITeacherService.chat(None, [], "Explain time complexity of merge sort.", "general", {})
    t4 = time.time()
    print(f"4. Merge Sort Complexity -> Length: {len(res4.get('reply', ''))} chars, Elapsed: {(t4-t0)*1000:.1f}ms")
    assert "log" in res4.get("reply", "").lower() and "complexity" in res4.get("reply", "").lower(), "Must explain log n complexity"

    # 5. Coding question (with code generation)
    t0 = time.time()
    res5 = await AITeacherService.chat(None, [], "How to invert a binary tree in Python?", "general", {})
    t5 = time.time()
    print(f"5. Coding Question -> Has code block: {'```' in res5.get('reply', '')}, Elapsed: {(t5-t0)*1000:.1f}ms")
    assert "```" in res5.get("reply", ""), "Coding question must include formatted code block"

    # 6. Interview Question Generation
    t0 = time.time()
    res6 = await interview_service.create_session("dummy_uid", "Software Engineer", "Junior", False, 30, "technical", False)
    t6 = time.time()
    questions = res6.get("questions", [])
    print(f"6. Interview Generation -> Generated {len(questions)} questions, Elapsed: {(t6-t0)*1000:.1f}ms")
    assert len(questions) > 0, "Should generate interview questions"

    # 7. Resume ATS Intelligence
    t0 = time.time()
    res7 = await resume_service.parse_and_analyze(
        "dummy_uid",
        b"John Doe\nSoftware Engineer\nSkills: Python, React, SQL, Docker\nExperience: Built scalable microservices.",
        "test.pdf"
    )
    t7 = time.time()
    ats_score = res7.get("resumeData", {}).get("aiAnalysis", {}).get("atsScore")
    print(f"7. Resume ATS Intelligence -> Score: {ats_score}, Elapsed: {(t7-t0)*1000:.1f}ms")
    assert ats_score is not None

    # 8. User Context Personalization
    t0 = time.time()
    res8 = await AITeacherService.chat(None, [], "What should I focus on for my upcoming placement?", "general", {
        "userName": "Alex",
        "targetRole": "ML Engineer",
        "weakTopics": ["Dynamic Programming"]
    })
    t8 = time.time()
    reply8 = res8.get("reply", "")
    print(f"8. Personalized Context -> Length: {len(reply8)} chars, Elapsed: {(t8-t0)*1000:.1f}ms")
    print(f"   Context snippet: {reply8[:120]}...")
    assert len(reply8) > 50

    print("ALL AI QUALITY & FEATURE TESTS PASSED!")

if __name__ == "__main__":
    asyncio.run(run_quality_audit())
