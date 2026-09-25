import pytest
import io
import zipfile
from unittest.mock import patch, AsyncMock
from reportlab.pdfgen import canvas
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from main import app
from core.database import get_database, to_object_id
from core.security import create_access_token
from services_py.ats_service import ats_service, ATS_WEIGHTS

def create_test_pdf(text_lines):
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    y = 750
    for line in text_lines:
        c.drawString(100, y, line)
        y -= 25
    c.save()
    return buf.getvalue()

def create_test_docx(text):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            '<w:body><w:p><w:r><w:t>' + text + '</w:t></w:r></w:p></w:body></w:document>'
        )
        z.writestr("word/document.xml", xml)
    return buf.getvalue()

@pytest.fixture
async def test_users():
    db = get_database()
    u1 = {
        "name": "ATS Candidate One",
        "email": "ats_user_one@test.com",
        "career": {"targetRole": "Software Engineer"}
    }
    u2 = {
        "name": "ATS Candidate Two",
        "email": "ats_user_two@test.com",
        "career": {"targetRole": "ML Engineer"}
    }
    res1 = await db["users"].insert_one(u1)
    res2 = await db["users"].insert_one(u2)
    id1 = str(res1.inserted_id)
    id2 = str(res2.inserted_id)

    token1 = create_access_token({"id": id1})
    token2 = create_access_token({"id": id2})

    yield {
        "user1": {"id": id1, "token": token1},
        "user2": {"id": id2, "token": token2}
    }

    # Cleanup
    await db["users"].delete_many({"_id": {"$in": [to_object_id(id1), to_object_id(id2)]}})
    await db["resumeanalyses"].delete_many({"userId": {"$in": [id1, id2]}})

# 1. Unauthorized ATS request
@pytest.mark.asyncio
async def test_01_unauthorized_ats_request():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/api/resume/ats/latest")
        assert r.status_code == 401
        r_hist = await client.get("/api/resume/ats/history")
        assert r_hist.status_code == 401

# 2. Valid PDF
@pytest.mark.asyncio
async def test_02_valid_pdf():
    lines = [
        "Alex Morgan",
        "alex@example.com | 9876543210 | linkedin.com/in/alex",
        "Skills: Python, FastAPI, Docker, SQL, Git, React",
        "Education: Bachelor of Technology in Computer Science",
        "Projects: Built scalable microservice handling 50k requests with 99.9% uptime"
    ]
    pdf_bytes = create_test_pdf(lines)
    extracted = ats_service.extract_text_from_bytes(pdf_bytes, "alex_resume.pdf")
    assert "Alex Morgan" in extracted
    assert len(extracted) > 80

# 3. Valid DOCX
@pytest.mark.asyncio
async def test_03_valid_docx():
    content = "Jane Doe | jane@example.com | Skills: Python, PyTorch, Pandas, Docker | Education: B.Tech Computer Science | Projects: Developed machine learning pipeline with 95% test accuracy."
    docx_bytes = create_test_docx(content)
    extracted = ats_service.extract_text_from_bytes(docx_bytes, "resume.docx")
    assert "Jane Doe" in extracted
    assert "PyTorch" in extracted

# 4. Invalid file
@pytest.mark.asyncio
async def test_04_invalid_file(test_users):
    transport = ASGITransport(app=app)
    token = test_users["user1"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    files = {"file": ("test.txt", b"plain text is not supported", "text/plain")}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post("/api/resume/ats/analyze", headers=headers, files=files)
        assert r.status_code == 400
        assert "Only PDF and DOCX" in r.json()["detail"]["message"]

# 5. Oversized file
@pytest.mark.asyncio
async def test_05_oversized_file(test_users):
    transport = ASGITransport(app=app)
    token = test_users["user1"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    oversized = b"a" * (6 * 1024 * 1024)
    files = {"file": ("big.pdf", oversized, "application/pdf")}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post("/api/resume/ats/analyze", headers=headers, files=files)
        assert r.status_code == 400
        assert "exceeds" in r.json()["detail"]["message"].lower()

# 6. Empty resume
@pytest.mark.asyncio
async def test_06_empty_resume(test_users):
    transport = ASGITransport(app=app)
    token = test_users["user1"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    empty_pdf = create_test_pdf([""])
    files = {"file": ("empty.pdf", empty_pdf, "application/pdf")}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post("/api/resume/ats/analyze", headers=headers, files=files)
        assert r.status_code == 400
        assert "insufficient" in r.json()["detail"]["message"].lower()

# 7. Text extraction
@pytest.mark.asyncio
async def test_07_text_extraction():
    lines = [
        "Sam Programmer",
        "sam@dev.org | github.com/sam",
        "Technical Skills: Python, JavaScript, MongoDB, Docker",
        "Education: BS in Computer Engineering"
    ]
    pdf_bytes = create_test_pdf(lines)
    text = ats_service.extract_text_from_bytes(pdf_bytes, "sam.pdf")
    parsed = ats_service.parse_sections_heuristic(text)
    assert parsed["name"] == "Sam Programmer"
    assert parsed["email"] == "sam@dev.org"
    assert parsed["github"] == "https://github.com/sam" or "github.com/sam" in text
    assert parsed["sections"]["skills"] is True
    assert parsed["sections"]["education"] is True

# 8. Gemini structured response
@pytest.mark.asyncio
async def test_08_gemini_structured_response():
    mock_gemini_resp = {
        "success": True,
        "data": {
            "role_alignment": {"score": 82, "summary": "Strong software engineering foundation"},
            "category_scores": {
                "keyword_match": 80,
                "skills_alignment": 85,
                "experience_relevance": 75,
                "projects_relevance": 88,
                "content_quality": 78,
                "structure": 90,
                "formatting": 85,
                "education": 95
            },
            "top_issues": [
                {
                    "title": "Missing measurable achievements",
                    "category": "PROJECTS",
                    "severity": "medium",
                    "evidence": "Project bullets lack metrics",
                    "why_it_matters": "Quantified bullets communicate impact",
                    "how_to_fix": "Add verifiable outcomes"
                }
            ],
            "bullet_improvements": [
                {
                    "current_bullet": "Created a machine learning model",
                    "problem": "Too generic",
                    "why_it_matters": "Needs technical depth",
                    "suggested_structure": "Action verb + Task + Stack + Outcome"
                }
            ],
            "strengths": ["Strong technical stack"],
            "recommendations": [{"priority": "high", "recommendation": "Add metrics to projects"}]
        }
    }
    with patch("services_py.ats_service.ai_provider.generate_json", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_gemini_resp
        res = await ats_service.analyze_with_gemini(
            resume_text="Sample resume text",
            target_role="Software Engineer",
            det_results={
                "deterministic_scores": {},
                "detected_keywords": ["Python"],
                "missing_keywords": ["Docker"],
                "missing_sections": [],
                "missing_contact": [],
                "parsed": {"normalized_resume": {}}
            }
        )
        assert res is not None
        assert "category_scores" in res
        assert res["category_scores"]["keyword_match"] == 80
        assert len(res["top_issues"]) == 1

# 9. ATS score calculation
@pytest.mark.asyncio
async def test_09_ats_score_calculation():
    scores = {
        "keyword_match": 80,
        "skills_alignment": 85,
        "experience_relevance": 75,
        "projects_relevance": 90,
        "content_quality": 70,
        "structure": 90,
        "formatting": 85,
        "education": 95
    }
    overall, final_scores = ats_service.calculate_overall_score(scores)
    assert 0 <= overall <= 100
    assert overall == 82
    assert final_scores["keyword_match"] == 80

    # Insufficient data test
    partial_scores = {
        "keyword_match": 80,
        "skills_alignment": 85,
        "experience_relevance": "INSUFFICIENT_DATA",
        "projects_relevance": 90,
        "content_quality": 70,
        "structure": 90,
        "formatting": 85,
        "education": 95
    }
    overall_p, final_p = ats_service.calculate_overall_score(partial_scores)
    assert final_p["experience_relevance"] == "INSUFFICIENT_DATA"
    assert 0 <= overall_p <= 100

# 10. Missing keyword detection
@pytest.mark.asyncio
async def test_10_missing_keyword_detection():
    text = "Candidate with skills in Python, Git, HTML, and CSS. Looking for Software Engineer role."
    det = ats_service.analyze_deterministic(text, "Software Engineer")
    assert "Python" in det["detected_keywords"]
    assert "Git" in det["detected_keywords"]
    assert "Docker" in det["missing_keywords"] or "FastAPI" in det["missing_keywords"]
    assert "Languages" in det["keyword_categories"]

# 11. Issue detection
@pytest.mark.asyncio
async def test_11_issue_detection():
    text = "John Doe\nSummary\nWorked on full stack application\nEducation\nBS Degree"
    det = ats_service.analyze_deterministic(text, "Software Engineer")
    assert len(det["missing_contact"]) >= 2
    assert "Email address" in det["missing_contact"]
    assert any(i["category"] == "CONTACT" for i in det["deterministic_issues"])

# 12. Target role analysis
@pytest.mark.asyncio
async def test_12_target_role_analysis():
    ml_text = "Experienced in PyTorch, TensorFlow, Scikit-learn, Pandas, Model Evaluation and MLOps."
    det_ml = ats_service.analyze_deterministic(ml_text, "ML Engineer")
    assert "PyTorch" in det_ml["detected_keywords"]
    assert "Pandas" in det_ml["detected_keywords"]

# 13. MongoDB persistence
@pytest.mark.asyncio
async def test_13_mongodb_persistence(test_users):
    transport = ASGITransport(app=app)
    token = test_users["user1"]["token"]
    user1_id = test_users["user1"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    lines = [
        "Alex Candidate",
        "alex@test.com | 555-0199 | linkedin.com/in/alex",
        "Technical Skills: Python, FastAPI, Docker, SQL, Git, React",
        "Education: Bachelor of Technology, Computer Science 2024",
        "Projects: Architected microservice with React and FastAPI handling 10k users"
    ]
    pdf_bytes = create_test_pdf(lines)
    files = {"file": ("alex_resume.pdf", pdf_bytes, "application/pdf")}
    data = {"targetRole": "Software Engineer"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post("/api/resume/ats/analyze", headers=headers, files=files, data=data)
        assert r.status_code == 200
        res = r.json()
        assert res["success"] is True
        assert res["data"]["userId"] == user1_id
        db = get_database()
        doc = await db["resumeanalyses"].find_one({"userId": user1_id})
        assert doc is not None
        assert doc["targetRole"] == "Software Engineer"

# 14. Latest analysis
@pytest.mark.asyncio
async def test_14_latest_analysis(test_users):
    transport = ASGITransport(app=app)
    token = test_users["user1"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    pdf_bytes = create_test_pdf([
        "Latest User",
        "latest@test.com | 999-0000",
        "Technical Skills: Python, SQL, Git",
        "Education: BS CS",
        "Projects: Built API gateway"
    ])
    files = {"file": ("latest.pdf", pdf_bytes, "application/pdf")}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First analyze
        await client.post("/api/resume/ats/analyze", headers=headers, files=files, data={"targetRole": "Software Engineer"})
        r = await client.get("/api/resume/ats/latest", headers=headers)
        assert r.status_code == 200
        latest = r.json()
        assert latest["success"] is True
        assert latest["data"] is not None
        assert latest["data"]["targetRole"] == "Software Engineer"

# 15. ATS history
@pytest.mark.asyncio
async def test_15_ats_history(test_users):
    transport = ASGITransport(app=app)
    token = test_users["user1"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    pdf_bytes = create_test_pdf([
        "History User",
        "history@test.com",
        "Skills: Python, React, MongoDB",
        "Education: BS CS",
        "Projects: Built portal"
    ])
    files = {"file": ("hist.pdf", pdf_bytes, "application/pdf")}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Analyze to populate history
        await client.post("/api/resume/ats/analyze", headers=headers, files=files, data={"targetRole": "Software Engineer"})
        r = await client.get("/api/resume/ats/history", headers=headers)
        assert r.status_code == 200
        hist = r.json()["data"]
        assert isinstance(hist, list)
        assert len(hist) >= 1

# 16. User isolation
@pytest.mark.asyncio
async def test_16_user_isolation(test_users):
    transport = ASGITransport(app=app)
    token1 = test_users["user1"]["token"]
    token2 = test_users["user2"]["token"]

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # User 2 checks latest - must be None
        r2_latest = await client.get("/api/resume/ats/latest", headers={"Authorization": f"Bearer {token2}"})
        assert r2_latest.status_code == 200
        assert r2_latest.json()["data"] is None

        # User 2 checks history - must be empty
        r2_hist = await client.get("/api/resume/ats/history", headers={"Authorization": f"Bearer {token2}"})
        assert r2_hist.status_code == 200
        assert len(r2_hist.json()["data"]) == 0

# 17. Gemini failure
@pytest.mark.asyncio
async def test_17_gemini_failure():
    with patch("services_py.ats_service.ai_provider.generate_json", side_effect=Exception("Gemini quota timeout")):
        text = "Candidate resume with skills: Python, Git, Docker, SQL. Education: B.Tech Computer Science."
        res = await ats_service.analyze_resume(
            user_id="mock_user_gemini_fail",
            file_bytes=create_test_pdf([text]),
            filename="mock.pdf",
            target_role_input="Software Engineer"
        )
        assert res is not None
        assert "overall_score" in res["analysis"]
        assert res["analysis"]["overall_score"] > 0
        db = get_database()
        await db["resumeanalyses"].delete_many({"userId": "mock_user_gemini_fail"})

# 18. Invalid Gemini JSON
@pytest.mark.asyncio
async def test_18_invalid_gemini_json():
    with patch("services_py.ats_service.ai_provider.generate_json", new_callable=AsyncMock) as mock_gen:
        # Invalid response missing category_scores
        mock_gen.return_value = {"success": True, "data": "unexpected plain string format"}
        text = "Candidate resume with skills: Python, Git, Docker. Education: B.Tech Computer Science."
        res = await ats_service.analyze_resume(
            user_id="mock_user_invalid_json",
            file_bytes=create_test_pdf([text]),
            filename="mock.pdf",
            target_role_input="Software Engineer"
        )
        assert res is not None
        assert res["overallScore"] > 0
        db = get_database()
        await db["resumeanalyses"].delete_many({"userId": "mock_user_invalid_json"})

# 19. No fake score for empty user
@pytest.mark.asyncio
async def test_19_no_fake_score(test_users):
    transport = ASGITransport(app=app)
    token2 = test_users["user2"]["token"]
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/api/resume/ats/latest", headers={"Authorization": f"Bearer {token2}"})
        assert r.status_code == 200
        assert r.json()["data"] is None
        assert r.json()["analysis"] is None

# 20. Resume refresh persistence
@pytest.mark.asyncio
async def test_20_resume_refresh_persistence(test_users):
    transport = ASGITransport(app=app)
    token1 = test_users["user1"]["token"]
    headers = {"Authorization": f"Bearer {token1}"}

    pdf_bytes = create_test_pdf([
        "Persistent User",
        "persistent@test.com",
        "Skills: Python, FastAPI, Docker, Git",
        "Education: Bachelor of Science",
        "Projects: Built automated testing harness"
    ])
    files = {"file": ("persist.pdf", pdf_bytes, "application/pdf")}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First analyze
        await client.post("/api/resume/ats/analyze", headers=headers, files=files, data={"targetRole": "Software Engineer"})

        # Simulate user refreshing page multiple times
        for _ in range(3):
            r = await client.get("/api/resume/ats/latest", headers=headers)
            assert r.status_code == 200
            data = r.json()["data"]
            assert data is not None
            assert "overallScore" in data
            assert data["analysis"]["detected_keywords"] is not None
