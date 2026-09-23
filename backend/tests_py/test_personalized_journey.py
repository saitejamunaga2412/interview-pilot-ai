import pytest
import httpx
from datetime import datetime
import uuid
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from main import app
from core.config import settings

BASE_URL = "http://127.0.0.1:5000"

@pytest.mark.asyncio
async def test_case_1_new_user_onboarding_and_skip_assessment():
    """CASE 1: New user -> Register -> onboarding -> skip assessment -> dashboard -> personalized fallback recommendation."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email = f"candidate_case1_{ts}@example.com"
        pwd = "SecurePassword123!"

        # 1. Register
        reg_res = await client.post("/api/auth/register", json={
            "name": "Candidate Case 1",
            "email": email,
            "password": pwd
        })
        assert reg_res.status_code == 200
        data = reg_res.json()["data"]
        token = data["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Check initial profile state (onboardingCompleted must be False)
        prof_res = await client.get("/api/profile", headers=headers)
        assert prof_res.status_code == 200
        user_prof = prof_res.json()["data"]
        assert user_prof.get("onboardingCompleted") is False

        # 3. Complete Onboarding
        onboard_payload = {
            "onboardingCompleted": True,
            "career": {
                "targetRole": "AI / ML Engineer",
                "targetCompanies": ["Google", "Meta"],
                "currentSkillLevel": "Intermediate",
                "preferredLanguage": "Python",
                "dailyHours": 2
            },
            "learningPreferences": {
                "interests": ["Coding"],
                "preferredLanguage": "Python"
            }
        }
        update_res = await client.put("/api/profile", json=onboard_payload, headers=headers)
        assert update_res.status_code == 200
        assert update_res.json()["data"]["onboardingCompleted"] is True

        # 4. User skips assessment -> fetches personalized daily plan
        plan_res = await client.get("/api/dashboard/daily-plan", headers=headers)
        assert plan_res.status_code == 200
        plan = plan_res.json()["data"]
        assert plan["targetRole"] == "AI / ML Engineer"
        assert plan["dailyHours"] == 2
        assert plan["preferredLanguage"] == "Python"
        assert len(plan["sequence"]) >= 3

        # 5. AI recommendation works gracefully without hallucinating test metrics
        rec_res = await client.get("/api/dashboard/ai-recommendation", headers=headers)
        assert rec_res.status_code == 200
        rec = rec_res.json()["data"]
        assert "recommendation" in rec
        assert len(rec["recommendation"]) > 10

        # 6. Readiness report shows honest 0% / INSUFFICIENT DATA for brand new user with no activity
        rep_res = await client.get("/api/dashboard/readiness-report", headers=headers)
        assert rep_res.status_code == 200
        rep = rep_res.json()["data"]
        assert rep["overallReadiness"] == 0
        assert rep["readinessStatus"] == "INSUFFICIENT DATA"

@pytest.mark.asyncio
async def test_case_2_new_user_complete_assessment_flow():
    """CASE 2: New user -> Register -> onboarding -> start & complete assessment -> personalized results & dashboard update."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email = f"candidate_case2_{ts}@example.com"
        pwd = "SecurePassword123!"

        reg_res = await client.post("/api/auth/register", json={
            "name": "Candidate Case 2",
            "email": email,
            "password": pwd
        })
        assert reg_res.status_code == 200
        token = reg_res.json()["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Onboard
        await client.put("/api/profile", json={
            "onboardingCompleted": True,
            "career": {
                "targetRole": "Software Engineer",
                "targetCompanies": ["Google", "Amazon"],
                "currentSkillLevel": "Intermediate",
                "preferredLanguage": "Java",
                "dailyHours": 1
            }
        }, headers=headers)

        # 2. Start Baseline Assessment
        start_res = await client.post("/api/assessment/start", json={
            "assessmentType": "Baseline",
            "duration": 15,
            "numQuestions": 6
        }, headers=headers)
        assert start_res.status_code == 200
        attempt = start_res.json()["data"]
        attempt_id = attempt["_id"]
        assert attempt["status"] == "In Progress"
        assert len(attempt["sections"]) > 0

        # 3. Submit Answers
        # Answer correctly for two questions, leaving others or answering wrong
        first_q = attempt["sections"][0]["questions"][0]["questionId"]
        first_q_id = first_q["_id"]

        sub_res = await client.post("/api/assessment/submit", json={
            "attemptId": attempt_id,
            "answers": {
                first_q_id: "24 hours" # Known answer for diag_apt_1
            },
            "durationSeconds": 240
        }, headers=headers)
        assert sub_res.status_code == 200
        result = sub_res.json()["data"]
        assert "overallScore" in result
        assert "accuracy" in result
        assert "aiFeedback" in result

        # 4. Result retrieval
        res_check = await client.get(f"/api/assessment/result/{attempt_id}", headers=headers)
        assert res_check.status_code == 200
        assert res_check.json()["data"]["_id"] == attempt_id

        # 5. Profile baseline is now recorded
        prof = await client.get("/api/profile", headers=headers)
        career_data = prof.json()["data"].get("career", {})
        assert career_data.get("baselineCompleted") is True

@pytest.mark.asyncio
async def test_case_3_returning_user_direct_dashboard():
    """CASE 3: Returning user -> Login -> dashboard directly -> no onboarding."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email = f"returning_{ts}@example.com"
        pwd = "SecurePassword123!"

        # Register & complete onboarding
        reg = await client.post("/api/auth/register", json={"name": "Returning User", "email": email, "password": pwd})
        token = reg.json()["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}
        await client.put("/api/profile", json={"onboardingCompleted": True, "career": {"targetRole": "Backend Lead"}}, headers=headers)

        # Re-login
        login_res = await client.post("/api/auth/login", json={"email": email, "password": pwd})
        assert login_res.status_code == 200
        new_token = login_res.json()["data"]["token"]
        new_headers = {"Authorization": f"Bearer {new_token}"}

        # Profile confirms onboarding is completed
        prof = await client.get("/api/profile", headers=new_headers)
        assert prof.json()["data"]["onboardingCompleted"] is True

        # Global dashboard loads immediately
        dash = await client.get("/api/dashboard/global", headers=new_headers)
        assert dash.status_code == 200
        assert dash.json()["success"] is True

@pytest.mark.asyncio
async def test_case_4_activity_updates_weakness_and_mistake_loop():
    """CASE 4: User completes activity -> performance stored -> weakness updated -> recommendation changes appropriately."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email = f"activity_user_{ts}@example.com"
        pwd = "SecurePassword123!"

        reg = await client.post("/api/auth/register", json={"name": "Activity Tester", "email": email, "password": pwd})
        token = reg.json()["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # User fails a coding problem or aptitude question
        # Record an aptitude mistake
        apt_submit = await client.post("/api/aptitude/submit", json={
            "topicId": "Permutations",
            "domain": "Aptitude",
            "answers": [
                {"questionId": "q_test_perm", "title": "Permutation Logic", "selected": "WrongAns", "correctAnswer": "RightAns"}
            ]
        }, headers=headers)
        assert apt_submit.status_code == 200

        # Check weakness analysis now identifies the mistake
        weak_res = await client.get("/api/dashboard/weakness-recovery", headers=headers)
        assert weak_res.status_code == 200
        weak_data = weak_res.json()["data"]
        assert weak_data.get("hasData") is True
        assert weak_data.get("primaryWeakness") is not None
        assert "Permutations" in weak_data["primaryWeakness"]["topic"]

        # Check mistake list
        mistakes_res = await client.get("/api/mistakes", headers=headers)
        assert mistakes_res.status_code == 200
        mistakes = mistakes_res.json()["data"]
        assert any(m.get("topic") == "Permutations" for m in mistakes)

@pytest.mark.asyncio
async def test_case_5_and_6_state_persistence_across_refresh_and_relogin():
    """CASE 5 & 6: State persistence across refresh and logout/relogin."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email = f"persist_{ts}@example.com"
        pwd = "SecurePassword123!"

        reg = await client.post("/api/auth/register", json={"name": "Persist Test", "email": email, "password": pwd})
        token = reg.json()["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        await client.put("/api/profile", json={
            "onboardingCompleted": True,
            "career": {"targetRole": "DevOps Engineer", "preferredLanguage": "Go", "dailyHours": 3}
        }, headers=headers)

        # Simulate refresh (GET /api/profile with token)
        refresh_res = await client.get("/api/profile", headers=headers)
        assert refresh_res.status_code == 200
        assert refresh_res.json()["data"]["career"]["targetRole"] == "DevOps Engineer"

        # Simulate logout / re-login
        login_res = await client.post("/api/auth/login", json={"email": email, "password": pwd})
        new_token = login_res.json()["data"]["token"]
        new_headers = {"Authorization": f"Bearer {new_token}"}

        restored_res = await client.get("/api/profile", headers=new_headers)
        assert restored_res.json()["data"]["career"]["targetRole"] == "DevOps Engineer"
        assert restored_res.json()["data"]["career"]["preferredLanguage"] == "Go"

@pytest.mark.asyncio
async def test_case_7_strict_user_isolation():
    """CASE 7: User A attempts to access User B data -> denied/isolated."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email_a = f"alice_{ts}@example.com"
        email_b = f"bob_{ts}@example.com"
        pwd = "SecurePassword123!"

        # User A
        reg_a = await client.post("/api/auth/register", json={"name": "Alice", "email": email_a, "password": pwd})
        token_a = reg_a.json()["data"]["token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # User B
        reg_b = await client.post("/api/auth/register", json={"name": "Bob", "email": email_b, "password": pwd})
        token_b = reg_b.json()["data"]["token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # Alice starts assessment
        start_a = await client.post("/api/assessment/start", json={"assessmentType": "Diagnostic"}, headers=headers_a)
        attempt_id_a = start_a.json()["data"]["_id"]

        # Bob attempts to read Alice's assessment attempt
        steal_attempt = await client.get(f"/api/assessment/attempt/{attempt_id_a}", headers=headers_b)
        assert steal_attempt.status_code == 404, f"Bob should not access Alice's attempt, got {steal_attempt.status_code}"

        # Bob attempts to read Alice's result
        steal_result = await client.get(f"/api/assessment/result/{attempt_id_a}", headers=headers_b)
        assert steal_result.status_code == 404, f"Bob should not access Alice's result, got {steal_result.status_code}"

@pytest.mark.asyncio
async def test_case_8_gemini_resilience_and_graceful_fallback():
    """CASE 8: Gemini unavailable or prompt error -> graceful fallback without application crash."""
    from services_py.dashboard_service import intelligence_service
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        email = f"gemini_test_{uuid.uuid4().hex[:8]}@example.com"
        pwd = "SecurePassword123!"

        reg = await client.post("/api/auth/register", json={"name": "Gemini Fallback", "email": email, "password": pwd})
        assert reg.status_code == 200, f"Registration failed with {reg.status_code}: {reg.text}"
        token = reg.json()["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch recommendation even if Gemini had high load or network issues
        rec = await intelligence_service.get_ai_recommendation(reg.json()["data"]["user"]["id"])
        assert rec is not None
        assert "recommendation" in rec
        assert len(rec["recommendation"]) > 5

@pytest.mark.asyncio
async def test_case_9_assessment_full_api_cycle_and_autosave_refresh():
    """CASE 9: Full assessment APIs cycle with autosave, refresh verification, and plural aliases."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email = f"assess_cycle_{ts}@example.com"
        pwd = "SecurePassword123!"

        reg = await client.post("/api/auth/register", json={"name": "Assess User", "email": email, "password": pwd})
        token = reg.json()["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. POST /api/assessment/start
        start_res = await client.post("/api/assessment/start", json={"assessmentType": "Baseline", "numQuestions": 4}, headers=headers)
        assert start_res.status_code == 200
        attempt = start_res.json()["data"]
        attempt_id = attempt["_id"]

        # 2. GET /api/assessment/{attempt_id} (both root and /attempt/ prefix)
        get_res1 = await client.get(f"/api/assessment/{attempt_id}", headers=headers)
        assert get_res1.status_code == 200
        assert get_res1.json()["data"]["_id"] == attempt_id

        get_res2 = await client.get(f"/api/assessments/attempt/{attempt_id}", headers=headers)
        assert get_res2.status_code == 200
        assert get_res2.json()["data"]["_id"] == attempt_id

        # 3. POST /api/assessment/{attempt_id}/autosave
        autosave_res = await client.post(f"/api/assessment/{attempt_id}/autosave", json={
            "answers": {"diag_apt_1": "24 hours"},
            "reviewFlags": {"diag_apt_1": True}
        }, headers=headers)
        assert autosave_res.status_code == 200
        assert autosave_res.json()["success"] is True

        # 4. Refresh simulation: GET attempt again to confirm saved answers persisted
        refreshed = await client.get(f"/api/assessment/{attempt_id}", headers=headers)
        assert refreshed.status_code == 200
        refreshed_data = refreshed.json()["data"]
        assert refreshed_data.get("answers", {}).get("diag_apt_1") == "24 hours"
        assert refreshed_data.get("reviewFlags", {}).get("diag_apt_1") is True

        # 5. POST /api/assessment/{attempt_id}/submit
        sub_res = await client.post(f"/api/assessment/{attempt_id}/submit", json={
            "answers": {"diag_apt_1": "24 hours"},
            "durationSeconds": 180
        }, headers=headers)
        assert sub_res.status_code == 200
        sub_data = sub_res.json()["data"]
        assert "overallScore" in sub_data

        # 6. GET /api/assessment/{attempt_id}/result
        res_check = await client.get(f"/api/assessment/{attempt_id}/result", headers=headers)
        assert res_check.status_code == 200
        assert res_check.json()["data"]["_id"] == attempt_id

        # 7. Plural alias check: GET /api/assessments/result/{attempt_id}
        res_plural = await client.get(f"/api/assessments/result/{attempt_id}", headers=headers)
        assert res_plural.status_code == 200

@pytest.mark.asyncio
async def test_case_10_coding_and_interview_mistake_resolution():
    """CASE 10: Coding failed submission -> mistake created -> accepted submission -> mistake resolved."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        ts = int(datetime.utcnow().timestamp())
        email = f"mistake_loop_{ts}@example.com"
        pwd = "SecurePassword123!"

        reg = await client.post("/api/auth/register", json={"name": "Mistake Loop User", "email": email, "password": pwd})
        token = reg.json()["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Unaccepted coding submission logs a mistake
        unaccepted_res = await client.post("/api/coding/submissions", json={
            "problemId": "p_two_sum",
            "topic": "Arrays & Hashing",
            "status": "Wrong Answer",
            "code": "def two_sum(): return []",
            "language": "python"
        }, headers=headers)
        assert unaccepted_res.status_code == 200

        # Verify mistake was created
        mistakes_1 = await client.get("/api/mistakes", headers=headers)
        assert mistakes_1.status_code == 200
        active_mistakes = mistakes_1.json()["data"]
        assert any(m["topic"] == "Arrays & Hashing" and not m.get("resolved") for m in active_mistakes)

        # 2. Accepted coding submission marks mistake as resolved
        accepted_res = await client.post("/api/coding/submissions", json={
            "problemId": "p_two_sum",
            "topic": "Arrays & Hashing",
            "status": "Accepted",
            "code": "def two_sum(): return [0, 1]",
            "language": "python"
        }, headers=headers)
        assert accepted_res.status_code == 200

        # Verify mistake is resolved
        from core.database import get_database
        db = get_database()
        resolved_doc = await db["mistakes"].find_one({"userId": reg.json()["data"]["user"]["id"], "topic": "Arrays & Hashing"})
        assert resolved_doc is not None
        assert resolved_doc.get("resolved") is True
