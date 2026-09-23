import pytest
import httpx
from datetime import datetime
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from main import app

BASE_URL = "http://127.0.0.1:5000"

@pytest.mark.asyncio
async def test_ai_teacher_interactive_visual_suite():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email = f"visual_user_{ts}@example.com"
        reg = await client.post("/api/auth/register", json={"name": "Visual Tester", "email": email, "password": "Password123!"})
        token = reg.json()["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Simple definition query: "What is an array?" -> Must be concise, NO visualization block
        def_res = await client.post("/api/learning/teacher/chat", json={
            "currentMessage": "What is an array?",
            "history": []
        }, headers=headers)
        assert def_res.status_code == 200
        def_reply = def_res.json()["data"]["reply"]
        assert "```visualization" not in def_reply
        assert len(def_reply) < 400
        print("\n[PASS] 1. 'What is an array?' returns concise definition without forced visualization")

        # 2. "Explain Arrays" -> Must contain full 10-step pedagogy + visualization block
        exp_res = await client.post("/api/learning/teacher/chat", json={
            "currentMessage": "Explain Arrays",
            "history": []
        }, headers=headers)
        assert exp_res.status_code == 200
        exp_data = exp_res.json()["data"]
        exp_reply = exp_data["reply"]
        assert "```visualization" in exp_reply
        assert "type" in exp_reply
        assert "array_traversal" in exp_reply or "array_insertion" in exp_reply or "steps" in exp_reply
        assert "visualization" in exp_data
        print("[PASS] 2. 'Explain Arrays' contains structured explanation and embedded visualization")

        # 3. "Show array insertion" -> Must contain array_insertion visual block
        insert_res = await client.post("/api/learning/teacher/chat", json={
            "currentMessage": "Show array insertion",
            "history": [{"role": "user", "content": "Explain Arrays"}, {"role": "assistant", "content": exp_reply[:100]}]
        }, headers=headers)
        assert insert_res.status_code == 200
        insert_data = insert_res.json()["data"]
        assert "```visualization" in insert_data["reply"]
        assert "array_insertion" in insert_data["reply"]
        assert insert_data.get("visualization", {}).get("type") == "array_insertion"
        print("[PASS] 3. 'Show array insertion' contains array_insertion animation dataset")

        # 4. "Explain binary search" -> Must contain binary_search visual block
        bs_res = await client.post("/api/learning/teacher/chat", json={
            "currentMessage": "Explain binary search",
            "history": []
        }, headers=headers)
        assert bs_res.status_code == 200
        bs_data = bs_res.json()["data"]
        assert "```visualization" in bs_data["reply"]
        assert "binary_search" in bs_data["reply"]
        assert bs_data.get("visualization", {}).get("type") == "binary_search"
        print("[PASS] 4. 'Explain binary search' contains binary_search animation dataset")

        # 5. "I don't understand binary search" -> Simplifies and re-shows visualization
        sim_res = await client.post("/api/learning/teacher/chat", json={
            "currentMessage": "I don't understand binary search",
            "history": [{"role": "user", "content": "Explain binary search"}]
        }, headers=headers)
        assert sim_res.status_code == 200
        sim_data = sim_res.json()["data"]
        assert "```visualization" in sim_data["reply"]
        assert "binary_search" in sim_data["reply"] or "steps" in sim_data["reply"]
        print("[PASS] 5. 'I don't understand binary search' re-presents visualization with simplified intuition")

        # 6. Follow-up question: "Why did 30 move?"
        followup_res = await client.post("/api/learning/teacher/chat", json={
            "currentMessage": "Why did 30 move?",
            "history": [
                {"role": "user", "content": "Show array insertion"},
                {"role": "assistant", "content": insert_data["reply"][:300]}
            ]
        }, headers=headers)
        assert followup_res.status_code == 200
        followup_reply = followup_res.json()["data"]["reply"]
        assert len(followup_reply) > 20
        print("[PASS] 6. Follow-up query 'Why did 30 move?' handled within same context")
