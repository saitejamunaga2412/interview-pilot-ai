import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from main import app
from core.config import settings
from services_py.email_service import email_service
from core.database import get_database, to_object_id
from core.security import create_access_token

@pytest.mark.asyncio
async def test_cors_preflight_localhost_5174():
    """Verify that http://localhost:5174 is granted CORS permission."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Preflight on /api/auth/login
        res_login = await client.options(
            "/api/auth/login",
            headers={
                "origin": "http://localhost:5174",
                "access-control-request-method": "POST",
                "access-control-request-headers": "content-type"
            }
        )
        assert res_login.status_code == 200
        assert res_login.headers.get("access-control-allow-origin") == "http://localhost:5174"
        assert "POST" in res_login.headers.get("access-control-allow-methods", "")

        # Preflight on /api/profile
        res_prof = await client.options(
            "/api/profile",
            headers={
                "origin": "http://localhost:5174",
                "access-control-request-method": "GET",
                "access-control-request-headers": "authorization"
            }
        )
        assert res_prof.status_code == 200
        assert res_prof.headers.get("access-control-allow-origin") == "http://localhost:5174"

@pytest.mark.asyncio
async def test_cors_actual_request_origin():
    """Verify that actual POST and GET requests retain the CORS header."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/auth/login",
            json={"email": "wrong@example.com", "password": "WrongPassword!"},
            headers={"origin": "http://localhost:5174"}
        )
        assert res.headers.get("access-control-allow-origin") == "http://localhost:5174"

@pytest.mark.asyncio
async def test_email_service_safety():
    """Verify that email service handles bad credentials or delivery failures gracefully."""
    # Invalid email syntax
    res_bad = email_service.send_email("", "Subject", "<p>Test</p>")
    assert res_bad["success"] is False
    assert "Invalid recipient" in res_bad["error"]

    # When test mode is True, does not crash and returns dry_run
    orig_mode = settings.EMAIL_TEST_MODE
    settings.EMAIL_TEST_MODE = True
    try:
        res_dry = email_service.send_email("candidate@example.com", "Subject", "<p>Test</p>")
        assert res_dry["success"] is True
        assert res_dry["mode"] == "dry_run"
    finally:
        settings.EMAIL_TEST_MODE = orig_mode
