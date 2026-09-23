import pytest
import httpx
from datetime import datetime
from bson import ObjectId
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from main import app

BASE_URL = "http://127.0.0.1:5000"

@pytest.mark.asyncio
async def test_health_and_services():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["services"]["database"] == "connected"
        from core.config import settings
        assert data["services"]["geminiModel"] == settings.GEMINI_MODEL
        # Confirm no secret leaked
        assert "AIza" not in resp.text

@pytest.mark.asyncio
async def test_auth_and_isolation():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email_a = f"pytest_a_{ts}@example.com"
        email_b = f"pytest_b_{ts}@example.com"
        pwd = "TestPassword123!"

        # Register Student A
        res_a = await client.post("/api/auth/register", json={"name": "Alice", "email": email_a, "password": pwd})
        assert res_a.status_code == 200
        token_a = res_a.json()["data"]["token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Duplicate email
        dup_a = await client.post("/api/auth/register", json={"name": "Alice 2", "email": email_a, "password": pwd})
        assert dup_a.status_code == 400

        # Register Student B
        res_b = await client.post("/api/auth/register", json={"name": "Bob", "email": email_b, "password": pwd})
        assert res_b.status_code == 200
        token_b = res_b.json()["data"]["token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # Invalid login
        bad_login = await client.post("/api/auth/login", json={"email": email_a, "password": "WrongPassword"})
        assert bad_login.status_code == 401

        # Profile update isolation
        await client.put("/api/profile", json={"career": {"targetRole": "Backend Lead"}}, headers=headers_a)
        await client.put("/api/profile", json={"career": {"targetRole": "Frontend Lead"}}, headers=headers_b)

        prof_a = await client.get("/api/profile", headers=headers_a)
        prof_b = await client.get("/api/profile", headers=headers_b)
        assert prof_a.json()["data"]["career"]["targetRole"] == "Backend Lead"
        assert prof_b.json()["data"]["career"]["targetRole"] == "Frontend Lead"

        # Dashboard readiness calculation (no fake 72%)
        dash_a = await client.get("/api/dashboard/global", headers=headers_a)
        assert dash_a.status_code == 200
        assert dash_a.json()["data"]["placementReadinessScore"] == 0

        # AI Teacher greeting cache
        greet_res = await client.post("/api/learning/teacher/chat", json={
            "currentMessage": "hi",
            "history": [],
            "contextMeta": {}
        }, headers=headers_a)
        assert greet_res.status_code == 200
        assert "InterviewPilot AI" in greet_res.json()["data"]["reply"]
        assert greet_res.json()["data"]["timing"]["provider"] == "cache"

        # Aptitude scoring
        apt_res = await client.post("/api/aptitude/submit", json={
            "topicId": "quant",
            "answers": [{"questionId": str(ObjectId()), "answer": "Option A", "timeSpentSeconds": 15}]
        }, headers=headers_a)
        assert apt_res.status_code == 200
        assert "accuracy" in apt_res.json()["data"]

        # Cascade account deletion
        del_b = await client.delete("/api/profile", headers=headers_b)
        assert del_b.status_code == 200
        del_check = await client.get("/api/profile", headers=headers_b)
        assert del_check.status_code == 401

@pytest.mark.asyncio
async def test_judge0_and_coding():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        reg = await client.post("/api/auth/register", json={"name": "Coder", "email": f"coder_{ts}@test.com", "password": "Password123!"})
        token = reg.json()["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        exec_res = await client.post("/api/coding/execute", json={
            "code": "print('Hello InterviewPilot AI')",
            "language": "python"
        }, headers=headers)
        assert exec_res.status_code == 200
        assert "executionResult" in exec_res.json()["data"]

@pytest.mark.asyncio
async def test_interview_lifecycle():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        reg = await client.post("/api/auth/register", json={"name": "Interviewer", "email": f"interview_{ts}@test.com", "password": "Password123!"})
        token = reg.json()["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create session
        gen_res = await client.post("/api/interview/generate", json={
            "role": "Frontend Developer",
            "level": "Junior",
            "isTimedInterview": True,
            "duration": 30
        }, headers=headers)
        assert gen_res.status_code == 200
        data = gen_res.json()["data"]
        assert len(data["questions"]) == 5
        assert data["duration"] == 30
        assert data["isTimedInterview"] is True
        session_id = data["sessionId"]

        # Evaluate question
        eval_res = await client.post("/api/result/evaluate", json={
            "sessionId": session_id,
            "question": data["questions"][0],
            "answer": "React uses a virtual DOM to reconcile diffs efficiently."
        }, headers=headers)
        assert eval_res.status_code == 200
        assert eval_res.json()["data"]["score"] >= 0

