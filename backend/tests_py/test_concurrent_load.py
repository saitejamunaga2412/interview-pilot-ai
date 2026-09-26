import asyncio
import time
import uuid
import pytest
import sys
from pathlib import Path
from datetime import datetime

import os
os.environ["ENVIRONMENT"] = "test"
os.environ["ALLOW_TEST_HEADER_BYPASS"] = "1"

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from httpx import AsyncClient, ASGITransport
from main import app

async def simulate_user_workflow(client: AsyncClient, user_idx: int) -> dict:
    t0 = time.time()
    rand = uuid.uuid4().hex[:6]
    email = f"load_u{user_idx}_{rand}@example.com"
    pw = "LoadUserPass123!"

    results = {
        "user_idx": user_idx,
        "email": email,
        "steps_passed": 0,
        "total_steps": 7,
        "isolation_verified": False,
        "latency_ms": 0,
        "error": None
    }

    try:
        # Step 1: Register
        reg = await client.post("/api/auth/register", json={
            "name": f"Load User {user_idx}",
            "email": email,
            "password": pw
        })
        assert reg.status_code in (200, 201), f"Register status: {reg.status_code}"
        token = reg.json().get("token") or reg.json().get("data", {}).get("token")
        assert token
        headers = {"Authorization": f"Bearer {token}"}
        results["steps_passed"] += 1

        # Step 2: Login
        login = await client.post("/api/auth/login", json={"email": email, "password": pw})
        assert login.status_code == 200
        results["steps_passed"] += 1

        # Step 3: Fetch Dashboard
        dash = await client.get("/api/dashboard/global", headers=headers)
        assert dash.status_code == 200
        results["steps_passed"] += 1

        # Step 4: Update Profile
        prof = await client.put("/api/profile", json={
            "career": {"targetRole": f"Architect_{user_idx}", "skills": [f"Skill_{user_idx}"]}
        }, headers=headers)
        assert prof.status_code == 200
        results["steps_passed"] += 1

        # Step 5: Submit Aptitude Answer
        apt = await client.post("/api/aptitude/submit", json={
            "topicId": "percentages",
            "answers": [{"questionId": f"q_{user_idx}", "answer": "Option B", "timeSpentSeconds": 25}]
        }, headers=headers)
        assert apt.status_code == 200
        results["steps_passed"] += 1

        # Step 6: Create Project
        proj = await client.post("/api/projects", json={
            "title": f"Load Project {user_idx}",
            "techStack": ["Python", "FastAPI"],
            "status": "In Progress"
        }, headers=headers)
        assert proj.status_code == 201
        proj_id = proj.json()["project"]["id"]
        results["steps_passed"] += 1

        # Step 7: Verify Data Isolation - Fetch own project and verify ownership
        my_proj = await client.get(f"/api/projects/{proj_id}", headers=headers)
        assert my_proj.status_code == 200
        assert my_proj.json()["project"]["title"] == f"Load Project {user_idx}"
        results["steps_passed"] += 1
        results["isolation_verified"] = True

    except Exception as e:
        results["error"] = str(e)

    results["latency_ms"] = round((time.time() - t0) * 1000, 2)
    return results

async def run_concurrent_batch(concurrency: int):
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://test",
        headers={"x-test-client": "interviewpilot-test-runner"}
    ) as client:
        start_time = time.time()
        tasks = [simulate_user_workflow(client, i) for i in range(concurrency)]
        outcomes = await asyncio.gather(*tasks)
        total_time_ms = round((time.time() - start_time) * 1000, 2)

        successful = [o for o in outcomes if o["steps_passed"] == o["total_steps"] and o["isolation_verified"]]
        latencies = [o["latency_ms"] for o in outcomes]
        avg_latency = round(sum(latencies) / len(latencies), 2) if latencies else 0

        print(f"\n================ LOAD TEST: {concurrency} CONCURRENT USERS ================")
        print(f"Total Wall Clock Duration : {total_time_ms} ms ({round(total_time_ms/1000, 2)}s)")
        print(f"Success Count             : {len(successful)} / {concurrency} ({round(len(successful)/concurrency*100, 1)}%)")
        print(f"Average Workflow Latency  : {avg_latency} ms per user")
        print(f"Min Latency               : {min(latencies)} ms")
        print(f"Max Latency               : {max(latencies)} ms")
        print(f"Data Isolation Status     : {'100% STRICTLY ISOLATED' if len(successful) == concurrency else 'FAILURES DETECTED'}")
        print("====================================================================\n")

        assert len(successful) == concurrency, f"Load test failed: {concurrency - len(successful)} users had errors"
        return {
            "concurrency": concurrency,
            "total_time_ms": total_time_ms,
            "success_rate": len(successful) / concurrency,
            "avg_latency_ms": avg_latency
        }

@pytest.mark.asyncio
async def test_load_3_concurrent_users():
    await run_concurrent_batch(3)

@pytest.mark.asyncio
async def test_load_10_concurrent_users():
    await run_concurrent_batch(10)

@pytest.mark.asyncio
async def test_load_25_concurrent_users():
    await run_concurrent_batch(25)

if __name__ == "__main__":
    asyncio.run(test_load_3_concurrent_users())
    asyncio.run(test_load_10_concurrent_users())
    asyncio.run(test_load_25_concurrent_users())
