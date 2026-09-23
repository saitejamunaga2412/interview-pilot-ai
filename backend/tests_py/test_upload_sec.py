import pytest
import httpx
import time
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from main import app

BASE_URL = "http://127.0.0.1:5000"

@pytest.mark.asyncio
async def test_resume_upload_security():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        # Register a temporary test user
        email = f"upload_sec_{int(time.time())}@example.com"
        reg_res = await client.post("/api/auth/register", json={
            "name": "Upload Sec Test",
            "email": email,
            "password": "Password123!"
        })
        assert reg_res.status_code == 200
        token = reg_res.json()["data"]["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Non-PDF upload
        files_bad = {"file": ("exploit.sh", b"echo hacked", "text/x-sh")}
        resp_bad = await client.post("/api/resume/upload", files=files_bad, headers=headers)
        assert resp_bad.status_code == 400, f"Expected 400 for non-pdf, got {resp_bad.status_code}"

        # 2. Oversized file (> 5MB)
        files_big = {"file": ("big.pdf", b"0" * (6 * 1024 * 1024), "application/pdf")}
        resp_big = await client.post("/api/resume/upload", files=files_big, headers=headers)
        assert resp_big.status_code == 400, f"Expected 400 for oversized file, got {resp_big.status_code}"

        # 3. Path traversal filename attempt (e.g. ../../hacked.pdf)
        files_trav = {"file": ("../../hacked.pdf", b"%PDF-1.4 dummy valid pdf content here", "application/pdf")}
        resp_trav = await client.post("/api/resume/upload", files=files_trav, headers=headers)
        assert resp_trav.status_code == 200, f"Expected 200 for upload, got {resp_trav.status_code}"
        saved_fn = resp_trav.json()["data"].get("filename", "")
        assert "hacked.pdf" not in saved_fn, "Server must not use raw untrusted client filename"
