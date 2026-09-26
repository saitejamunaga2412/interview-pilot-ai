import sys
from pathlib import Path
from datetime import datetime
import httpx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from main import app

BASE_URL = "http://127.0.0.1:5000"

@pytest.mark.asyncio
async def test_notification_flow_and_consistency():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email_a = f"notif_reg_a_{ts}@gmail.com"
        email_b = f"notif_reg_b_{ts}@gmail.com"
        pwd = "Password123!"

        # 1. Register User A
        res_a = await client.post("/api/auth/register", json={"name": "Alice QA", "email": email_a, "password": pwd})
        assert res_a.status_code == 200
        token_a = res_a.json()["data"]["token"]
        user_a_id = res_a.json()["data"]["user"]["id"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Register User B
        res_b = await client.post("/api/auth/register", json={"name": "Bob QA", "email": email_b, "password": pwd})
        assert res_b.status_code == 200
        token_b = res_b.json()["data"]["token"]
        user_b_id = res_b.json()["data"]["user"]["id"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 3. Initial state verification: Welcome notification must exist and unread count == 1
        unread_res = await client.get("/api/notifications/unread-count", headers=headers_a)
        assert unread_res.status_code == 200
        assert unread_res.json()["data"]["count"] == 1

        list_res = await client.get("/api/notifications", headers=headers_a)
        assert list_res.status_code == 200
        body = list_res.json()
        assert isinstance(body["data"], list)
        assert isinstance(body["notifications"], list)
        assert len(body["notifications"]) == 1
        assert body["notifications"][0]["type"] == "welcome"
        assert body["total"] == 1
        assert body["unreadCount"] == 1

        # 4. Trigger category notifications for Alice
        categories = [
            ("recommendation", "System Design Roadmap", "Master High Availability Architecture"),
            ("coding", "Binary Tree Traversal", "Practice 2 Hard problems"),
            ("interview", "Google Mock Interview", "Scheduled for 3:00 PM"),
            ("learning", "OS Concurrency Primitives", "Review Mutex and Semaphores")
        ]
        created_ids = []
        for ntype, title, msg in categories:
            resp = await client.post("/api/notifications/trigger-test", headers=headers_a, json={
                "type": ntype,
                "title": title,
                "message": msg
            })
            assert resp.status_code == 200
            created_ids.append(resp.json()["data"]["id"])

        # 5. Verify unread count matches badge count (1 welcome + 4 new = 5)
        unread_res2 = await client.get("/api/notifications/unread-count", headers=headers_a)
        assert unread_res2.json()["data"]["count"] == 5

        # 6. Verify category filtering
        for cat in ["coding", "interview", "learning", "recommendation"]:
            f_res = await client.get(f"/api/notifications?type={cat}", headers=headers_a)
            assert f_res.status_code == 200
            items = f_res.json()["notifications"]
            assert len(items) >= 1

        # 7. Mark single notification as read
        first_id = created_ids[0]
        m_res = await client.patch(f"/api/notifications/{first_id}/read", headers=headers_a)
        assert m_res.status_code == 200
        unread_res3 = await client.get("/api/notifications/unread-count", headers=headers_a)
        assert unread_res3.json()["data"]["count"] == 4

        # 8. Multi-user isolation: Bob must not see Alice's notifications
        bob_notifs = await client.get("/api/notifications", headers=headers_b)
        bob_items = bob_notifs.json()["notifications"]
        assert len(bob_items) == 1
        assert bob_items[0]["userId"] == user_b_id

        # 9. Mark all as read for Alice
        all_read = await client.patch("/api/notifications/read-all", headers=headers_a)
        assert all_read.status_code == 200
        unread_res4 = await client.get("/api/notifications/unread-count", headers=headers_a)
        assert unread_res4.json()["data"]["count"] == 0

        # 10. Verify Unread filter returns 0 items, while All filter still returns 5 items
        unread_filter = await client.get("/api/notifications?unreadOnly=true", headers=headers_a)
        assert len(unread_filter.json()["notifications"]) == 0

        all_filter = await client.get("/api/notifications", headers=headers_a)
        assert len(all_filter.json()["notifications"]) == 5
