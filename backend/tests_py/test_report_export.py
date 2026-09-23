import pytest
import httpx
from datetime import datetime
from bson import ObjectId
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from main import app
from core.database import get_database

BASE_URL = "http://127.0.0.1:5000"

@pytest.mark.asyncio
async def test_pdf_report_endpoints():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email = f"report_test_{ts}@example.com"
        pwd = "ReportPassword123!"

        # 1. Register candidate
        reg_res = await client.post("/api/auth/register", json={"name": "Alex Report", "email": email, "password": pwd})
        assert reg_res.status_code == 200
        token = reg_res.json()["data"]["token"]
        user_id = reg_res.json()["data"]["user"]["id"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Insert mock interview session and result in DB
        db = get_database()
        sess_id = str(ObjectId())
        await db["interviewsessions"].insert_one({
            "_id": ObjectId(sess_id),
            "userId": user_id,
            "role": "Full Stack Engineer",
            "level": "Intermediate",
            "overallScore": 86,
            "interviewMode": "technical",
            "duration": 30,
            "isTimedInterview": False,
            "status": "Completed",
            "createdAt": datetime.utcnow()
        })
        await db["results"].insert_one({
            "sessionId": sess_id,
            "userId": user_id,
            "question": "Explain event delegation in JavaScript",
            "userAnswer": "It leverages event bubbling to handle events at a parent element.",
            "score": 90,
            "feedback": "Clear and accurate explanation.",
            "strengths": ["Clear communication", "Correct terminology"],
            "improvements": ["Mention performance benefits of fewer listeners"],
            "createdAt": datetime.utcnow()
        })

        # 3. Test GET /api/result/download-report/{sessionId}
        res_dl = await client.get(f"/api/result/download-report/{sess_id}", headers=headers)
        assert res_dl.status_code == 200
        assert res_dl.headers["content-type"] == "application/pdf"
        assert f"filename=Interview_Report_{sess_id}.pdf" in res_dl.headers.get("content-disposition", "")
        assert res_dl.content.startswith(b"%PDF")
        assert len(res_dl.content) > 1000

        # 4. Test GET /api/result/report/{sessionId} (alias)
        res_rep = await client.get(f"/api/result/report/{sess_id}", headers=headers)
        assert res_rep.status_code == 200
        assert res_rep.headers["content-type"] == "application/pdf"
        assert res_rep.content.startswith(b"%PDF")

        # Cleanup
        await db["interviewsessions"].delete_one({"_id": ObjectId(sess_id)})
        await db["results"].delete_many({"sessionId": sess_id})
        await db["users"].delete_one({"_id": ObjectId(user_id)})
