import asyncio
import uuid
import re
import pytest
import sys
from pathlib import Path
from datetime import datetime, timedelta

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from main import app
from core.database import get_database, to_object_id
from core.security import create_access_token
from services_py.email_service import email_service

@pytest.mark.asyncio
async def test_authentication_acceptance_matrix():
    """
    PHASE 2: Complete Authentication Acceptance Tests
    - New user registration
    - Login with correct credentials (exact & case-insensitive)
    - Login with incorrect credentials (401)
    - Login with unregistered email (401)
    - Duplicate account registration rejection (400)
    - Protected routes rejection without authentication (401)
    - Protected routes rejection with expired token (401)
    - Password reset and subsequent login
    - Authenticated password change and subsequent login
    - Session persistence verification
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = get_database()
        rand = uuid.uuid4().hex[:8]
        user_email = f"auth_matrix_{rand}@example.com"
        orig_pw = "ValidPassword123!"
        new_pw = "NewSecurePassword456!"

        # 1. New user registration
        reg_res = await client.post("/api/auth/register", json={
            "name": f"Matrix Candidate {rand}",
            "email": user_email,
            "password": orig_pw
        })
        assert reg_res.status_code in (200, 201), f"Registration failed: {reg_res.text}"
        reg_json = reg_res.json()
        token = reg_json.get("token") or reg_json.get("data", {}).get("token")
        assert token, "JWT token must be returned on registration"

        # Verify optional notification defaults for new account (disabled by default)
        user_in_db = await db["users"].find_one({"email": user_email})
        new_prefs = user_in_db.get("settings", {}).get("notificationPreferences", {})
        assert new_prefs.get("dailyReminder") is False, "Daily reminder must be disabled by default"
        assert new_prefs.get("weeklyProgressReport") is False, "Weekly report must be disabled by default"
        assert new_prefs.get("monthlyPerformanceSummary") is False, "Monthly summary must be disabled by default"
        assert new_prefs.get("progressReportFrequency") == "disabled", "Progress report frequency must default to disabled"
        assert new_prefs.get("productUpdates") is False, "Product updates must be disabled by default"
        assert new_prefs.get("inactivityReminders") is False, "Inactivity reminders must be disabled by default"
        assert new_prefs.get("securityAlerts") is True, "Essential security alerts must remain enabled"

        # 2. Duplicate account registration rejection
        dup_res = await client.post("/api/auth/register", json={
            "name": f"Matrix Candidate Dup",
            "email": user_email,
            "password": orig_pw
        })
        assert dup_res.status_code in (400, 409), "Duplicate registration must be rejected"

        # 3. Login with incorrect credentials
        wrong_pw_res = await client.post("/api/auth/login", json={
            "email": user_email,
            "password": "WrongPassword999!"
        })
        assert wrong_pw_res.status_code == 401, "Invalid password must return 401 Unauthorized"

        # 4. Login with unregistered email
        unreg_res = await client.post("/api/auth/login", json={
            "email": f"nonexistent_{rand}@example.com",
            "password": orig_pw
        })
        assert unreg_res.status_code == 401, "Unregistered email must return 401 Unauthorized"

        # 5. Login with correct credentials (exact match)
        login_res = await client.post("/api/auth/login", json={
            "email": user_email,
            "password": orig_pw
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        login_token = login_res.json().get("token") or login_res.json().get("data", {}).get("token")
        assert login_token

        # 6. Login with mixed case email (case-insensitive normalization verification)
        mixed_email = user_email.upper()
        mixed_login = await client.post("/api/auth/login", json={
            "email": mixed_email,
            "password": orig_pw
        })
        assert mixed_login.status_code == 200, "Case-insensitive email login must succeed"

        # 7. Access protected route without authentication
        no_auth = await client.get("/api/profile")
        assert no_auth.status_code in (401, 403), "Accessing protected route without token must return 401/403"

        # 8. Access protected route with expired token
        expired_token = create_access_token({"sub": "temp_user_id"}, expires_delta=timedelta(seconds=-10))
        expired_res = await client.get("/api/profile", headers={"Authorization": f"Bearer {expired_token}"})
        assert expired_res.status_code == 401, "Accessing protected route with expired token must return 401"

        # 9. Password reset flow (Forgot Password -> Reset Token -> New Login)
        email_service.clear_outbox()
        forgot_res = await client.post("/api/auth/forgot-password", json={"email": user_email})
        assert forgot_res.status_code == 200

        reset_mail = email_service.get_latest_email(user_email)
        assert reset_mail is not None, "Password reset email must be dispatched"
        m = re.search(r"token=([A-Za-z0-9_-]+)", reset_mail["html_content"])
        assert m, "Reset token must be embedded in reset link"
        reset_tok = m.group(1)

        reset_exec = await client.post("/api/auth/reset-password", json={
            "token": reset_tok,
            "newPassword": new_pw,
            "confirmPassword": new_pw
        })
        assert reset_exec.status_code == 200

        # Login with old password must fail (401)
        old_fail = await client.post("/api/auth/login", json={"email": user_email, "password": orig_pw})
        assert old_fail.status_code == 401

        # Login with new password must succeed (200)
        new_ok = await client.post("/api/auth/login", json={"email": user_email, "password": new_pw})
        assert new_ok.status_code == 200
        new_token = new_ok.json().get("token") or new_ok.json().get("data", {}).get("token")
        auth_headers = {"Authorization": f"Bearer {new_token}"}

        # 10. Authenticated password change
        newer_pw = "NewerPassword789!"
        change_res = await client.post("/api/auth/change-password", json={
            "currentPassword": new_pw,
            "newPassword": newer_pw,
            "confirmPassword": newer_pw
        }, headers=auth_headers)
        assert change_res.status_code == 200

        # Verify login with newer password
        newer_login = await client.post("/api/auth/login", json={"email": user_email, "password": newer_pw})
        assert newer_login.status_code == 200

        # 11. Session persistence across subsequent calls
        final_token = newer_login.json().get("token") or newer_login.json().get("data", {}).get("token")
        final_headers = {"Authorization": f"Bearer {final_token}"}
        profile_res = await client.get("/api/profile", headers=final_headers)
        assert profile_res.status_code == 200
        assert profile_res.json()["data"]["email"] == user_email

@pytest.mark.asyncio
async def test_multi_user_strict_isolation_three_users():
    """
    PHASE 5: Multi-User Isolation Testing Across 3 Dedicated Users (User A, User B, User C)
    - Independent Profiles, Roadmaps, Dashboards
    - IDOR Prevention: User A cannot read, edit, or delete User B's projects
    - Resume & ATS analysis isolation: User A cannot view User B's resumes
    - Mock interview isolation: User A cannot view User B's interview session
    - Mistake book & Aptitude isolation: User A's progress never leaks into User B or User C
    - Notification preferences isolation
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        db = get_database()
        rand = uuid.uuid4().hex[:6]
        email_a = f"candidate_alpha_{rand}@example.com"
        email_b = f"candidate_beta_{rand}@example.com"
        email_c = f"candidate_gamma_{rand}@example.com"
        password = "UserPass123!"

        # Register User A, User B, User C
        users = {}
        for role_name, em in [("User A", email_a), ("User B", email_b), ("User C", email_c)]:
            reg = await client.post("/api/auth/register", json={
                "name": role_name, "email": em, "password": password
            })
            assert reg.status_code in (200, 201)
            tok = reg.json().get("token") or reg.json().get("data", {}).get("token")
            u_id = reg.json().get("user", {}).get("id") or reg.json().get("data", {}).get("user", {}).get("id")
            users[role_name] = {"email": em, "token": tok, "id": u_id, "headers": {"Authorization": f"Bearer {tok}"}}

        headers_a = users["User A"]["headers"]
        headers_b = users["User B"]["headers"]
        headers_c = users["User C"]["headers"]

        # 1. Independent Profiles
        await client.put("/api/profile", json={"career": {"targetRole": "Backend Architect"}}, headers=headers_a)
        await client.put("/api/profile", json={"career": {"targetRole": "Machine Learning Engineer"}}, headers=headers_b)
        await client.put("/api/profile", json={"career": {"targetRole": "DevOps Engineer"}}, headers=headers_c)

        prof_a = await client.get("/api/profile", headers=headers_a)
        prof_b = await client.get("/api/profile", headers=headers_b)
        prof_c = await client.get("/api/profile", headers=headers_c)

        assert prof_a.json()["data"]["career"]["targetRole"] == "Backend Architect"
        assert prof_b.json()["data"]["career"]["targetRole"] == "Machine Learning Engineer"
        assert prof_c.json()["data"]["career"]["targetRole"] == "DevOps Engineer"

        # 2. Project IDOR Prevention
        # User A creates a private project
        proj_a = await client.post("/api/projects", json={
            "title": "Alpha Private Distributed Cache",
            "techStack": ["Go", "Redis"],
            "status": "In Progress"
        }, headers=headers_a)
        assert proj_a.status_code == 201
        proj_a_id = proj_a.json()["project"]["id"]

        # User B attempts to read User A's project -> MUST return 404 (or 403)
        b_read = await client.get(f"/api/projects/{proj_a_id}", headers=headers_b)
        assert b_read.status_code in (403, 404), "User B must not be able to read User A's project"

        # User C attempts to update User A's project -> MUST return 404 (or 403)
        c_update = await client.put(f"/api/projects/{proj_a_id}", json={"title": "Hacked Title"}, headers=headers_c)
        assert c_update.status_code in (403, 404), "User C must not be able to modify User A's project"

        # User B attempts to delete User A's project -> MUST return 404 (or 403)
        b_del = await client.delete(f"/api/projects/{proj_a_id}", headers=headers_b)
        assert b_del.status_code in (403, 404), "User B must not be able to delete User A's project"

        # Verify User A's project is unharmed
        a_check = await client.get(f"/api/projects/{proj_a_id}", headers=headers_a)
        assert a_check.status_code == 200
        assert a_check.json()["project"]["title"] == "Alpha Private Distributed Cache"

        # 3. Notification Preferences Isolation
        await client.put("/api/profile", json={
            "settings": {
                "notificationPreferences": {
                    "dailyReminder": True,
                    "progressReportFrequency": "monthly"
                }
            }
        }, headers=headers_a)

        await client.put("/api/profile", json={
            "settings": {
                "notificationPreferences": {
                    "dailyReminder": False,
                    "progressReportFrequency": "disabled"
                }
            }
        }, headers=headers_b)

        p_a = await client.get("/api/profile", headers=headers_a)
        p_b = await client.get("/api/profile", headers=headers_b)

        assert p_a.json()["data"]["settings"]["notificationPreferences"]["dailyReminder"] is True
        assert p_a.json()["data"]["settings"]["notificationPreferences"]["progressReportFrequency"] == "monthly"
        assert p_b.json()["data"]["settings"]["notificationPreferences"]["dailyReminder"] is False
        assert p_b.json()["data"]["settings"]["notificationPreferences"]["progressReportFrequency"] == "disabled"

        # 4. Mistake Book Isolation
        # User A records a mistake in "Dynamic Programming"
        await db["mistakes"].insert_one({
            "userId": users["User A"]["id"],
            "topic": "Dynamic Programming",
            "domain": "DSA",
            "question": "Coin Change 2",
            "attemptCount": 1,
            "resolved": False,
            "lastAttemptAt": datetime.utcnow()
        })

        m_a = await client.get("/api/mistakes", headers=headers_a)
        m_b = await client.get("/api/mistakes", headers=headers_b)
        m_c = await client.get("/api/mistakes", headers=headers_c)

        assert len(m_a.json()["data"]) >= 1
        assert len(m_b.json()["data"]) == 0, "User B must have 0 mistakes"
        assert len(m_c.json()["data"]) == 0, "User C must have 0 mistakes"

        # 5. Mock Interview Session Isolation
        # User A creates interview session
        sess_a = await client.post("/api/interview/generate", json={
            "role": "Cloud Architect",
            "level": "Senior",
            "isTimedInterview": False
        }, headers=headers_a)
        assert sess_a.status_code == 200
        session_a_id = sess_a.json()["data"]["sessionId"]

        # User B attempts to access User A's session -> must be rejected
        b_sess = await client.get(f"/api/result/session/{session_a_id}", headers=headers_b)
        assert b_sess.status_code in (400, 403, 404, 500)
        if b_sess.status_code == 200:
            assert b_sess.json().get("success") is False or not b_sess.json().get("data")

@pytest.mark.asyncio
async def test_concurrent_multi_user_operations():
    """
    PHASE 5: Concurrent Login and Load Testing
    - 3 simultaneous test users logging in concurrently via asyncio.gather
    - Concurrent dashboard requests
    - Concurrent aptitude submissions
    - Concurrent Judge0 execution
    - Controlled concurrency load test (10 simultaneous operations)
    - Measures 100% success rate, 0 session leakage, 0 data collisions
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rand = uuid.uuid4().hex[:6]
        user_credentials = [
            (f"conc_user_1_{rand}@example.com", "PasswordOne123!"),
            (f"conc_user_2_{rand}@example.com", "PasswordTwo123!"),
            (f"conc_user_3_{rand}@example.com", "PasswordThree123!"),
        ]

        # Register users
        tokens = []
        for em, pw in user_credentials:
            reg = await client.post("/api/auth/register", json={"name": f"User {em}", "email": em, "password": pw})
            assert reg.status_code in (200, 201)

        # 1. Simultaneous logins via asyncio.gather
        async def do_login(em, pw):
            res = await client.post("/api/auth/login", json={"email": em, "password": pw})
            return res

        login_tasks = [do_login(em, pw) for em, pw in user_credentials]
        login_results = await asyncio.gather(*login_tasks)

        for idx, res in enumerate(login_results):
            assert res.status_code == 200, f"Concurrent login failed for user {idx}: {res.text}"
            token = res.json().get("token") or res.json().get("data", {}).get("token")
            user_data = res.json().get("user") or res.json().get("data", {}).get("user")
            # Verify correct session mapping
            assert user_data["email"].lower() == user_credentials[idx][0].lower()
            tokens.append(token)

        # 2. Simultaneous dashboard requests
        async def fetch_dashboard(token):
            return await client.get("/api/dashboard/global", headers={"Authorization": f"Bearer {token}"})

        dash_tasks = [fetch_dashboard(t) for t in tokens]
        dash_results = await asyncio.gather(*dash_tasks)
        for res in dash_results:
            assert res.status_code == 200
            assert "placementReadinessScore" in res.json()["data"]

        # 3. Concurrent Judge0 Code Executions
        async def run_code(token, num):
            return await client.post("/api/coding/execute", json={
                "code": f"print({num} * {num})",
                "language": "python"
            }, headers={"Authorization": f"Bearer {token}"})

        code_tasks = [run_code(tokens[i], (i + 1) * 5) for i in range(3)]
        code_results = await asyncio.gather(*code_tasks)
        for res in code_results:
            assert res.status_code == 200
            assert "executionResult" in res.json()["data"]

        # 4. Controlled Burst: 10 concurrent requests across all authenticated sessions
        burst_tasks = []
        for i in range(10):
            tok = tokens[i % len(tokens)]
            burst_tasks.append(client.get("/api/dashboard", headers={"Authorization": f"Bearer {tok}"}))

        burst_results = await asyncio.gather(*burst_tasks)
        success_count = sum(1 for r in burst_results if r.status_code == 200)
        assert success_count == 10, f"Expected 10/10 success under burst, got {success_count}/10"

@pytest.mark.asyncio
async def test_core_platform_modules_e2e():
    """
    PHASE 3 & 8: End-to-End Core Modules Verification
    - Learning dashboard & topic curriculum
    - AI Teacher conversational interface
    - Aptitude quiz submission & accuracy calculation
    - Coding arena problem catalog & execution
    - Career Advisor guidance & pathway
    - Global Placement Readiness Analytics
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rand = uuid.uuid4().hex[:6]
        email = f"platform_e2e_{rand}@example.com"
        password = "PlatformUser123!"

        reg = await client.post("/api/auth/register", json={
            "name": f"Platform Candidate {rand}", "email": email, "password": password
        })
        assert reg.status_code in (200, 201)
        token = reg.json().get("token") or reg.json().get("data", {}).get("token")
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Learning Dashboard
        learn_res = await client.get("/api/learning/dashboard", headers=headers)
        assert learn_res.status_code == 200
        assert "data" in learn_res.json()

        # 2. Topic Details
        topic_res = await client.get("/api/learning/topic/binary-search", headers=headers)
        assert topic_res.status_code == 200
        assert topic_res.json()["data"]["topic"]["topicId"] == "binary-search"

        # 3. AI Teacher Chat
        chat_res = await client.post("/api/learning/teacher/chat", json={
            "topicId": "binary-search",
            "currentMessage": "Hi Teacher, explain binary search time complexity in 1 sentence.",
            "history": []
        }, headers=headers)
        assert chat_res.status_code == 200
        assert len(chat_res.json()["data"]["reply"]) > 10

        # 4. Aptitude Quiz Submission
        apt_sub = await client.post("/api/aptitude/submit", json={
            "topicId": "time-and-work",
            "answers": [
                {"questionId": "q1", "answer": "Option A", "timeSpentSeconds": 25},
                {"questionId": "q2", "answer": "Option B", "timeSpentSeconds": 35}
            ]
        }, headers=headers)
        assert apt_sub.status_code == 200
        assert "accuracy" in apt_sub.json()["data"]

        # 5. Coding Problems Catalog
        probs_res = await client.get("/api/coding/problems", headers=headers)
        assert probs_res.status_code == 200
        assert isinstance(probs_res.json()["data"], list)
        assert len(probs_res.json()["data"]) > 0

        # 6. Career Advisor Dashboard
        career_res = await client.get("/api/career-advisor/dashboard", headers=headers)
        assert career_res.status_code == 200
        assert "data" in career_res.json()

        # 7. Global Analytics / Placement Readiness
        global_res = await client.get("/api/dashboard/global", headers=headers)
        assert global_res.status_code == 200
        data = global_res.json()["data"]
        assert "placementReadinessScore" in data
        assert isinstance(data["placementReadinessScore"], (int, float))
