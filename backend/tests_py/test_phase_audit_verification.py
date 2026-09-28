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
    """Verify heuristic evaluation bounds, anti-keyword-stuffing, and disclaimer metadata when AI is offline."""
    user_id = str(ObjectId())

    # Simulate AI service offline / rate limit by mocking generate_json to raise RuntimeError
    with patch("services_py.interview_service.ai_provider.generate_json", side_effect=RuntimeError("Gemini quota 429")):
        # 1. Keyword stuffing attempt: list of keywords without sentence structure
        stuffed_ans = "api rest cache redis database sql query index latency throughput concurrency thread async await microservice docker"
        res_stuffed = await interview_service.evaluate_answer(
            user_id,
            {
                "sessionId": str(ObjectId()),
                "question": "Explain database indexing and query optimization.",
                "answer": stuffed_ans,
                "role": "Backend Engineer",
                "level": "Intermediate"
            }
        )
        assert res_stuffed["score"] <= 20, f"Keyword stuffing should be penalized to <= 20, got {res_stuffed['score']}"
        assert res_stuffed["isVerifiedAiEvaluation"] is False
        assert res_stuffed["evaluationStatus"] == "Heuristic Fallback"
        assert "not equivalent to human or expert assessment" in res_stuffed.get("evaluationDisclaimer", "").lower()

        # 2. Too short answer (< 15 words)
        short_ans = "I use indexes to make queries faster."
        res_short = await interview_service.evaluate_answer(
            user_id,
            {
                "sessionId": str(ObjectId()),
                "question": "How do you optimize slow database queries in production?",
                "answer": short_ans,
                "role": "Backend Engineer",
                "level": "Intermediate"
            }
        )
        assert res_short["score"] <= 25, f"Short answer (<15 words) should be capped at <= 25, got {res_short['score']}"
        assert res_short["isVerifiedAiEvaluation"] is False

        # 3. Off-topic answer
        offtopic_ans = "I enjoy baking apple pies and swimming at the beach during the summer months with my friends."
        res_offtopic = await interview_service.evaluate_answer(
            user_id,
            {
                "sessionId": str(ObjectId()),
                "question": "How do you design a high-throughput caching layer with Redis?",
                "answer": offtopic_ans,
                "role": "Backend Engineer",
                "level": "Intermediate"
            }
        )
        assert res_offtopic["score"] <= 25, f"Off-topic answer should be capped at <= 25, got {res_offtopic['score']}"
        assert res_offtopic["isVerifiedAiEvaluation"] is False

        # 4. Substantive, relevant answer with technical vocabulary and causal trade-off reasoning
        good_ans = (
            "In order to diagnose database query bottlenecks, I analyze the slow query log and examine execution plans using EXPLAIN. "
            "We add compound B-Tree indexes because full table scans severely increase query latency and CPU utilization. "
            "Additionally, we introduce a Redis cache layer for high-throughput read operations, which reduces database load by 60% and optimizes 99th percentile response times."
        )
        res_good = await interview_service.evaluate_answer(
            user_id,
            {
                "sessionId": str(ObjectId()),
                "question": "How do you diagnose and optimize database queries and server bottlenecks?",
                "answer": good_ans,
                "role": "Backend Architect",
                "level": "Senior"
            }
        )
        assert res_good["score"] >= 65, f"Substantive answer should score >= 65, got {res_good['score']}"
        assert res_good["score"] <= 100
        assert res_good["isVerifiedAiEvaluation"] is False
        assert res_good["evaluationStatus"] == "Heuristic Fallback"


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
