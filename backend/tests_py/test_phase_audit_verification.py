import pytest
import httpx
from datetime import datetime
from bson import ObjectId
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from main import app
from core.database import get_database
from services_py.interview_service import interview_service

BASE_URL = "http://127.0.0.1:5000"

from unittest.mock import patch

@pytest.mark.asyncio
async def test_heuristic_scoring_calibrations():
    """Verify heuristic evaluation bounds across the complete 10-case validation matrix when AI is offline."""
    user_id = str(ObjectId())

    with patch("services_py.interview_service.ai_provider.generate_json", side_effect=RuntimeError("Gemini quota 429")):
        # Case 1: Correct and detailed answer with technical depth and metrics
        good_ans = (
            "In order to diagnose database query bottlenecks, I analyze the slow query log and examine execution plans using EXPLAIN. "
            "We add compound B-Tree indexes because full table scans severely increase query latency and CPU utilization. "
            "Additionally, we introduce a Redis cache layer for high-throughput read operations, which reduces database load by 60% and optimizes 99th percentile response times."
        )
        res1 = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": str(ObjectId()), "question": "How do you diagnose and optimize database queries and server bottlenecks?", "answer": good_ans}
        )
        assert res1["score"] >= 75, f"Case 1 (Detailed & Correct): expected >= 75, got {res1['score']}"
        assert res1["isVerifiedAiEvaluation"] is False
        assert res1["evaluationStatus"] == "Heuristic Fallback"

        # Case 2: Correct answer written in simple language
        simple_ans = (
            "An index works like a book index. It stores sorted keys with memory addresses so the database searches directly instead of reading the entire table one row at a time. This speeds up lookups significantly."
        )
        res2 = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": str(ObjectId()), "question": "Explain database indexing and how it works.", "answer": simple_ans}
        )
        assert res2["score"] >= 60, f"Case 2 (Simple language correct): expected >= 60, got {res2['score']}"

        # Case 3: Partially correct answer
        partial_ans = "Indexes make select queries faster, but you must be careful because too many indexes take disk space."
        res3 = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": str(ObjectId()), "question": "Explain database indexing trade-offs.", "answer": partial_ans}
        )
        assert 40 <= res3["score"] <= 65, f"Case 3 (Partially correct): expected 40-65, got {res3['score']}"

        # Case 4: Incorrect answer with unrelated technical keywords (React/Redux for DNS question)
        mismatched_tech_ans = "DNS resolution uses React state hooks, virtual DOM reconcilers, and Redux store reducers to dispatch action payloads into the server pipeline."
        res4 = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": str(ObjectId()), "question": "Explain how DNS resolution works.", "answer": mismatched_tech_ans}
        )
        assert res4["score"] <= 25, f"Case 4 (Unrelated tech words): expected <= 25, got {res4['score']}"

        # Case 5: Keyword stuffing and repeated terms
        stuffed_ans = "database database database database database sql sql sql sql index index index query cache cache cache"
        res5 = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": str(ObjectId()), "question": "Explain database indexing and query optimization.", "answer": stuffed_ans}
        )
        assert res5["score"] <= 20, f"Case 5 (Keyword stuffing): expected <= 20, got {res5['score']}"

        # Case 6: Empty and gibberish answers
        empty_res = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": str(ObjectId()), "question": "What is an index?", "answer": ""}
        )
        assert empty_res["score"] == 0
        assert empty_res["attemptStatus"] == "Not Attempted"

        gibberish_res = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": str(ObjectId()), "question": "What is an index?", "answer": "asdfjkl zxcvbnm qwertyuiop"}
        )
        assert gibberish_res["score"] <= 20

        # Case 7: Short but technically correct answer with Big-O notation
        concise_ans = "The average and worst-case time complexity is O(log n) in balanced BST."
        res7 = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": str(ObjectId()), "question": "What is the time complexity of searching in a binary search tree?", "answer": concise_ans}
        )
        assert 45 <= res7["score"] <= 60, f"Case 7 (Concise correct): expected 45-60, got {res7['score']}"

        # Case 8: Valid answer lacking words like 'because', 'therefore', or 'optimized'
        no_marker_ans = (
            "Microservices divide a monolithic application into independently deployable services. "
            "Each service manages its own database and communicates via REST APIs or message brokers. "
            "Teams can scale individual services on demand and use different programming languages tailored for each service domain."
        )
        res8 = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": str(ObjectId()), "question": "What are the core architecture patterns and benefits of microservices?", "answer": no_marker_ans}
        )
        assert res8["score"] >= 70, f"Case 8 (Valid without rigid markers): expected >= 70, got {res8['score']}"

        # Case 9: Explaining trade-offs without explicit numerical metrics
        tradeoff_ans = (
            "The trade-off of database indexing is that while read queries become faster, write operations such as insert and update become slower since the database must keep the index tree balanced."
        )
        res9 = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": str(ObjectId()), "question": "Explain database indexing trade-offs.", "answer": tradeoff_ans}
        )
        assert res9["score"] >= 65, f"Case 9 (Trade-off without numbers): expected >= 65, got {res9['score']}"

        # Case 10: Long answer irrelevant to the question
        long_irrelevant_ans = (
            "Yesterday I went to the supermarket and bought several fresh vegetables including tomatoes, cucumbers, and carrots. "
            "After returning home, I cooked a delicious Mediterranean salad with olive oil and lemon juice. "
            "Cooking healthy food provides sustained energy and enhances everyday productivity during afternoon walks."
        )
        res10 = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": str(ObjectId()), "question": "How do you design a high-throughput caching layer with Redis?", "answer": long_irrelevant_ans}
        )
        assert res10["score"] <= 20, f"Case 10 (Long irrelevant): expected <= 20, got {res10['score']}"



@pytest.mark.asyncio
async def test_interview_retries_and_session_ordering():
    """Verify safe retries, atomic upsert, and deterministic session question ordering."""
    db = get_database()
    user_id = str(ObjectId())
    sess_id = str(ObjectId())

    questions = [
        "Question A: Explain REST vs GraphQL trade-offs.",
        "Question B: How do you handle database deadlocks?",
        "Question C: Describe microservices communication patterns.",
        "Question D: How do you secure JWT authentication?",
        "Question E: What is your deployment canary strategy?"
    ]

    await db["interviewsessions"].insert_one({
        "_id": ObjectId(sess_id),
        "userId": user_id,
        "role": "Backend Engineer",
        "level": "Senior",
        "questions": questions,
        "totalQuestions": 5,
        "status": "In Progress",
        "createdAt": datetime.utcnow()
    })

    # Evaluate question D first (out of order)
    ans_d = "We secure JWT by storing tokens in httpOnly cookies, using short expiration times, and signing with asymmetric RS256 because localStorage is vulnerable to XSS."
    await interview_service.evaluate_answer(
        user_id,
        {
            "sessionId": sess_id,
            "question": questions[3],
            "questionIndex": 3,
            "answer": ans_d
        }
    )

    # Evaluate question A second
    ans_a = "GraphQL reduces over-fetching by allowing clients to request specific schemas, whereas REST leverages standard HTTP caching mechanisms because responses are resource-oriented."
    await interview_service.evaluate_answer(
        user_id,
        {
            "sessionId": sess_id,
            "question": questions[0],
            "questionIndex": 0,
            "answer": ans_a
        }
    )

    # Retry question D with updated answer
    ans_d_retry = "We enforce httpOnly cookies, rotate refresh tokens via Redis blacklists, and implement rate limiting on authentication routes in order to prevent brute-force attacks."
    await interview_service.evaluate_answer(
        user_id,
        {
            "sessionId": sess_id,
            "question": questions[3],
            "questionIndex": 3,
            "answer": ans_d_retry
        }
    )

    # Verify results collection has exactly 2 documents (no duplicate for Question D retry)
    results_in_db = await db["results"].find({"sessionId": sess_id, "userId": user_id}).to_list(10)
    assert len(results_in_db) == 2, f"Expected 2 results after retry, found {len(results_in_db)}"

    # Verify get_session_details returns questions ordered to match session.questions
    details = await interview_service.get_session_details(user_id, sess_id)
    ordered_q = details["questions"]
    assert len(ordered_q) == 2
    assert ordered_q[0]["question"] == questions[0], "Question 0 must appear first in ordered results"
    assert ordered_q[1]["question"] == questions[3], "Question 3 must appear second in ordered results"
    assert ordered_q[1]["answer"] == ans_d_retry, "Question 3 must reflect the retried answer"

    # Cleanup
    await db["interviewsessions"].delete_one({"_id": ObjectId(sess_id)})
    await db["results"].delete_many({"sessionId": sess_id})

@pytest.mark.asyncio
async def test_security_multi_tenant_isolation_and_admin_auth():
    """Verify cross-user access restrictions and admin role checks."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        db = get_database()

        # 1. Register User A
        reg_a = await client.post("/api/auth/register", json={
            "name": f"User A {ts}",
            "email": f"usera_{ts}@example.com",
            "password": "Password123!"
        })
        token_a = reg_a.json()["data"]["token"]
        user_a_id = reg_a.json()["data"]["user"]["id"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Register User B
        reg_b = await client.post("/api/auth/register", json={
            "name": f"User B {ts}",
            "email": f"userb_{ts}@example.com",
            "password": "Password123!"
        })
        token_b = reg_b.json()["data"]["token"]
        user_b_id = reg_b.json()["data"]["user"]["id"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 3. Create interview session and project for User A
        sess_a_id = str(ObjectId())
        await db["interviewsessions"].insert_one({
            "_id": ObjectId(sess_a_id),
            "userId": user_a_id,
            "role": "Cloud Architect",
            "level": "Senior",
            "questions": ["Explain multi-region failover."],
            "status": "Completed",
            "createdAt": datetime.utcnow()
        })

        proj_res = await client.post(
            "/api/projects",
            headers=headers_a,
            json={
                "title": "User A Private Infrastructure",
                "description": "Internal VPC design",
                "techStack": ["Terraform", "AWS"]
            }
        )
        assert proj_res.status_code == 201
        proj_a_id = proj_res.json()["project"]["id"]

        # 4. User B attempts to access User A's session -> Must be 404
        sess_leak = await client.get(f"/api/result/session/{sess_a_id}", headers=headers_b)
        assert sess_leak.status_code == 404, f"Cross-user session should return 404, got {sess_leak.status_code}"

        # 5. User B attempts to download User A's report -> Must be 404
        rep_leak = await client.get(f"/api/result/download-report/{sess_a_id}", headers=headers_b)
        assert rep_leak.status_code == 404, f"Cross-user report download should return 404, got {rep_leak.status_code}"

        # 6. User B attempts to mutate User A's project -> Must be 404
        proj_leak = await client.put(
            f"/api/projects/{proj_a_id}",
            headers=headers_b,
            json={"title": "Hacked Title"}
        )
        assert proj_leak.status_code == 404, f"Cross-user project mutation should return 404, got {proj_leak.status_code}"

        # 7. Standard User A attempts admin endpoints -> Must be 403 Forbidden
        admin_health = await client.get("/api/admin/health", headers=headers_a)
        assert admin_health.status_code == 403, f"Standard user accessing admin_health should be 403, got {admin_health.status_code}"

        email_stats = await client.get("/api/notifications/email-stats", headers=headers_a)
        assert email_stats.status_code == 403, f"Standard user accessing email-stats should be 403, got {email_stats.status_code}"

        # 8. Promote User A to admin in DB and verify access succeeds
        await db["users"].update_one({"_id": ObjectId(user_a_id)}, {"$set": {"role": "admin"}})
        admin_health_ok = await client.get("/api/admin/health", headers=headers_a)
        assert admin_health_ok.status_code == 200
        assert admin_health_ok.json()["success"] is True

        email_stats_ok = await client.get("/api/notifications/email-stats", headers=headers_a)
        assert email_stats_ok.status_code == 200
        assert email_stats_ok.json()["success"] is True

        # Cleanup
        await db["users"].delete_many({"_id": {"$in": [ObjectId(user_a_id), ObjectId(user_b_id)]}})
        await db["interviewsessions"].delete_one({"_id": ObjectId(sess_a_id)})
        await db["projects"].delete_one({"_id": ObjectId(proj_a_id)})

@pytest.mark.asyncio
async def test_session_lifecycle_and_non_premature_completion():
    """Verify session status remains 'In Progress' until all questions are evaluated."""
    db = get_database()
    user_id = str(ObjectId())
    sess_id = str(ObjectId())

    questions = [
        "Q1: What is a deadlock?",
        "Q2: Explain starvation.",
        "Q3: What is mutex vs semaphore?",
        "Q4: How do you prevent deadlocks?",
        "Q5: Describe priority inversion."
    ]

    await db["interviewsessions"].insert_one({
        "_id": ObjectId(sess_id),
        "userId": user_id,
        "role": "Systems Engineer",
        "level": "Senior",
        "questions": questions,
        "totalQuestions": 5,
        "status": "In Progress",
        "createdAt": datetime.utcnow()
    })

    with patch("services_py.interview_service.ai_provider.generate_json", side_effect=RuntimeError("Offline")):
        # Evaluate Question 1
        await interview_service.evaluate_answer(
            user_id,
            {"sessionId": sess_id, "question": questions[0], "questionIndex": 0, "answer": "A deadlock occurs when two processes each hold a resource the other needs."}
        )
        s1 = await db["interviewsessions"].find_one({"_id": ObjectId(sess_id)})
        assert s1["status"] == "In Progress", f"Expected 'In Progress' after 1 of 5 questions, got {s1['status']}"

        # Evaluate Question 2
        await interview_service.evaluate_answer(
            user_id,
            {"sessionId": sess_id, "question": questions[1], "questionIndex": 1, "answer": "Starvation is when a runnable process is perpetually denied CPU allocation."}
        )
        s2 = await db["interviewsessions"].find_one({"_id": ObjectId(sess_id)})
        assert s2["status"] == "In Progress", f"Expected 'In Progress' after 2 of 5 questions, got {s2['status']}"

        # Evaluate Questions 3, 4, 5
        for i in range(2, 5):
            await interview_service.evaluate_answer(
                user_id,
                {"sessionId": sess_id, "question": questions[i], "questionIndex": i, "answer": f"Explanation for question {i+1} covering synchronization primitives."}
            )

        # After all 5 evaluated: status must be 'Completed'
        s_final = await db["interviewsessions"].find_one({"_id": ObjectId(sess_id)})
        assert s_final["status"] == "Completed", f"Expected 'Completed' after 5 of 5 questions, got {s_final['status']}"
        assert s_final.get("completedAt") is not None
        assert s_final.get("overallScore") is not None

    # Cleanup
    await db["interviewsessions"].delete_one({"_id": ObjectId(sess_id)})
    await db["results"].delete_many({"sessionId": sess_id})

@pytest.mark.asyncio
async def test_concurrent_upsert_safety():
    """Verify simultaneous evaluations for the same question don't create duplicate documents."""
    import asyncio
    db = get_database()
    user_id = str(ObjectId())
    sess_id = str(ObjectId())
    q_text = "Explain concurrent read/write locks in Python."

    with patch("services_py.interview_service.ai_provider.generate_json", side_effect=RuntimeError("Offline")):
        # Fire 5 concurrent evaluation requests for the exact same question
        tasks = [
            interview_service.evaluate_answer(
                user_id,
                {
                    "sessionId": sess_id,
                    "question": q_text,
                    "questionIndex": 0,
                    "answer": f"Attempt {idx}: Read/write locks allow concurrent reads while serializing writes in order to maintain data consistency."
                }
            )
            for idx in range(5)
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Check that none raised an unhandled exception
        for r in results:
            assert isinstance(r, dict), f"Expected dict result, got {type(r)}"

        # Verify exactly 1 record exists in results collection
        db_results = await db["results"].find({"sessionId": sess_id, "userId": user_id}).to_list(10)
        assert len(db_results) == 1, f"Expected exactly 1 result document after concurrent upserts, found {len(db_results)}"

    # Cleanup
    await db["results"].delete_many({"sessionId": sess_id})


@pytest.mark.asyncio
async def test_duplicate_question_text_with_distinct_indices():
    """Verify identical question text at different indices preserves both results without collision."""
    db = get_database()
    user_id = str(ObjectId())
    sess_id = str(ObjectId())
    identical_question = "Explain the trade-offs of caching in high-scale architectures."

    await db["interviewsessions"].insert_one({
        "_id": ObjectId(sess_id),
        "userId": user_id,
        "role": "Backend Engineer",
        "level": "Senior",
        "questions": [identical_question, identical_question],
        "totalQuestions": 2,
        "status": "In Progress",
        "createdAt": datetime.utcnow()
    })

    with patch("services_py.interview_service.ai_provider.generate_json", side_effect=RuntimeError("Offline")):
        # Submit Answer for Question 0 (focusing on memory vs latency)
        ans0 = "Caching reduces query latency by storing hot data in RAM, but consumes substantial memory."
        res0 = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": sess_id, "question": identical_question, "questionIndex": 0, "answer": ans0}
        )

        # Submit Answer for Question 1 (focusing on cache invalidation & stale reads)
        ans1 = "The main challenge of caching is cache invalidation and handling eventual consistency under heavy write loads."
        res1 = await interview_service.evaluate_answer(
            user_id,
            {"sessionId": sess_id, "question": identical_question, "questionIndex": 1, "answer": ans1}
        )

        # Verify 2 distinct documents exist in results
        all_results = await db["results"].find({"sessionId": sess_id, "userId": user_id}).to_list(10)
        assert len(all_results) == 2, f"Expected 2 separate results for duplicate question text, found {len(all_results)}"

        # Verify get_session_details properly aligns results by questionIndex
        details = await interview_service.get_session_details(user_id, sess_id)
        session_questions = details["questions"]
        assert len(session_questions) == 2
        assert session_questions[0]["answer"] == ans0
        assert session_questions[1]["answer"] == ans1
        assert session_questions[0]["questionIndex"] == 0
        assert session_questions[1]["questionIndex"] == 1

        # Verify session completed after answering both questions
        sess_doc = await db["interviewsessions"].find_one({"_id": ObjectId(sess_id)})
        assert sess_doc["status"] == "Completed"

    # Cleanup
    await db["interviewsessions"].delete_one({"_id": ObjectId(sess_id)})
    await db["results"].delete_many({"sessionId": sess_id})


@pytest.mark.asyncio
async def test_results_duplicate_checker_and_safe_index():
    """Verify check_results_duplicates correctly identifies duplicates without crashing ensure_indexes."""
    from core.database import check_results_duplicates, ensure_indexes
    db = get_database()
    test_session = str(ObjectId())

    # Insert two conflicting documents with same (sessionId, questionIndex)
    doc_a = {
        "sessionId": test_session,
        "questionIndex": 99,
        "userId": str(ObjectId()),
        "question": "What is indexing?",
        "score": 50,
        "createdAt": datetime.utcnow()
    }
    doc_b = {
        "sessionId": test_session,
        "questionIndex": 99,
        "userId": str(ObjectId()),
        "question": "What is indexing? duplicate",
        "score": 60,
        "createdAt": datetime.utcnow()
    }

    insert_a = await db["results"].insert_one(doc_a)
    insert_b = await db["results"].insert_one(doc_b)

    # Duplicate checker must find this conflict
    duplicates = await check_results_duplicates(db)
    found_conflicts = [d for d in duplicates if d["_id"].get("sessionId") == test_session and d["_id"].get("questionIndex") == 99]
    assert len(found_conflicts) == 1
    assert found_conflicts[0]["count"] == 2
    assert insert_a.inserted_id in found_conflicts[0]["docIds"]
    assert insert_b.inserted_id in found_conflicts[0]["docIds"]

    # ensure_indexes must run gracefully without crashing when conflicts exist
    await ensure_indexes()

    # Cleanup
    await db["results"].delete_many({"sessionId": test_session})


@pytest.mark.asyncio
async def test_retry_transition_from_heuristic_to_verified_ai():
    """Verify that an initial failed AI call falls back to heuristic and a subsequent retry transitions to verified AI."""
    db = get_database()
    user_id = str(ObjectId())
    sess_id = str(ObjectId())
    q_text = "How do you mitigate cascading failures in distributed systems?"

    # Initial attempt: Gemini offline
    with patch("services_py.interview_service.ai_provider.generate_json", side_effect=RuntimeError("503 Service Unavailable")):
        res_initial = await interview_service.evaluate_answer(
            user_id,
            {
                "sessionId": sess_id,
                "question": q_text,
                "questionIndex": 0,
                "answer": "We use circuit breakers, exponential backoff with jitter, and bulkhead isolation to prevent cascading failures."
            }
        )
        assert res_initial["isVerifiedAiEvaluation"] is False
        assert res_initial["evaluationStatus"] == "Heuristic Fallback"
        assert res_initial["retryAllowed"] is True

        # Check in DB
        db_doc = await db["results"].find_one({"sessionId": sess_id, "questionIndex": 0})
        assert db_doc["isVerifiedAiEvaluation"] is False
        assert db_doc["evaluationStatus"] == "Heuristic Fallback"

    # Retry attempt: Gemini comes back online
    ai_response_payload = {
        "success": True,
        "data": {
            "score": 95,
            "feedback": "Outstanding answer covering circuit breakers, backoff, and bulkheads accurately.",
            "strengths": ["Clear fault tolerance patterns", "Proactive mitigation"],
            "weaknesses": [],
            "correctAnswer": "Circuit breakers and bulkheads effectively isolate failures.",
            "topicCategory": "Distributed Systems"
        }
    }
    with patch("services_py.interview_service.ai_provider.generate_json", return_value=ai_response_payload):
        res_retry = await interview_service.evaluate_answer(
            user_id,
            {
                "sessionId": sess_id,
                "question": q_text,
                "questionIndex": 0,
                "answer": "We use circuit breakers, exponential backoff with jitter, and bulkhead isolation to prevent cascading failures across microservices."
            }
        )
        assert res_retry["isVerifiedAiEvaluation"] is True
        assert res_retry["evaluationStatus"] == "Verified"
        assert res_retry["score"] == 95

        # Check in DB: in-place update without creating second document
        all_docs = await db["results"].find({"sessionId": sess_id, "questionIndex": 0}).to_list(10)
        assert len(all_docs) == 1
        assert all_docs[0]["isVerifiedAiEvaluation"] is True
        assert all_docs[0]["score"] == 95

    # Cleanup
    await db["results"].delete_many({"sessionId": sess_id})


