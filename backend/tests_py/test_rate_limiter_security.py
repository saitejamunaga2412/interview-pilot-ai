import os
import sys
import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from httpx import AsyncClient, ASGITransport
from main import app
from core.rate_limiter import RateLimiterMiddleware

@pytest.mark.asyncio
async def test_production_environment_ignores_test_client_header():
    """
    SECURITY TEST:
    Verify that an attacker in 'production' sending 'x-test-client: interviewpilot-test-runner'
    CANNOT bypass rate limiting.
    """
    original_env = os.environ.get("ENVIRONMENT")
    original_bypass = os.environ.get("ALLOW_TEST_HEADER_BYPASS")
    
    try:
        os.environ["ENVIRONMENT"] = "production"
        os.environ["ALLOW_TEST_HEADER_BYPASS"] = "0"
        RateLimiterMiddleware.clear_requests()

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"x-test-client": "interviewpilot-test-runner"}
            
            # Send 30 requests (the limit for /api/auth/login)
            for i in range(30):
                res = await client.post("/api/auth/login", json={"email": f"fake_{i}@test.com", "password": "pass"}, headers=headers)
                assert res.status_code in (400, 401, 404, 422), f"Request {i} unexpected status: {res.status_code}"

            # The 31st request MUST be rejected with HTTP 429 Too Many Requests
            res_31 = await client.post("/api/auth/login", json={"email": "attacker@test.com", "password": "pass"}, headers=headers)
            assert res_31.status_code == 429, f"Expected 429 Too Many Requests in production, got {res_31.status_code}"
            assert res_31.json().get("success") is False
            assert "Too many requests" in res_31.json().get("message", "")
    finally:
        if original_env is not None:
            os.environ["ENVIRONMENT"] = original_env
        else:
            os.environ.pop("ENVIRONMENT", None)
        if original_bypass is not None:
            os.environ["ALLOW_TEST_HEADER_BYPASS"] = original_bypass
        else:
            os.environ.pop("ALLOW_TEST_HEADER_BYPASS", None)
        RateLimiterMiddleware.clear_requests()

@pytest.mark.asyncio
async def test_development_environment_ignores_test_client_header():
    """
    SECURITY TEST:
    Verify that in standard 'development' environment without explicit test flags,
    the header is not trusted and normal rate limiting applies.
    """
    original_env = os.environ.get("ENVIRONMENT")
    original_bypass = os.environ.get("ALLOW_TEST_HEADER_BYPASS")

    try:
        os.environ["ENVIRONMENT"] = "development"
        os.environ.pop("ALLOW_TEST_HEADER_BYPASS", None)
        RateLimiterMiddleware.clear_requests()

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"x-test-client": "interviewpilot-test-runner"}

            for i in range(30):
                await client.post("/api/auth/login", json={"email": f"dev_{i}@test.com", "password": "pass"}, headers=headers)

            res_blocked = await client.post("/api/auth/login", json={"email": "dev_blocked@test.com", "password": "pass"}, headers=headers)
            assert res_blocked.status_code == 429, f"Expected 429 Too Many Requests in dev, got {res_blocked.status_code}"
    finally:
        if original_env is not None:
            os.environ["ENVIRONMENT"] = original_env
        else:
            os.environ.pop("ENVIRONMENT", None)
        if original_bypass is not None:
            os.environ["ALLOW_TEST_HEADER_BYPASS"] = original_bypass
        else:
            os.environ.pop("ALLOW_TEST_HEADER_BYPASS", None)
        RateLimiterMiddleware.clear_requests()

@pytest.mark.asyncio
async def test_explicit_test_environment_permits_authorized_runner():
    """
    VERIFICATION TEST:
    When ENVIRONMENT='test' AND ALLOW_TEST_HEADER_BYPASS='1',
    authorized test runner with the matching header CAN perform high-concurrency operations.
    """
    original_env = os.environ.get("ENVIRONMENT")
    original_bypass = os.environ.get("ALLOW_TEST_HEADER_BYPASS")

    try:
        os.environ["ENVIRONMENT"] = "test"
        os.environ["ALLOW_TEST_HEADER_BYPASS"] = "1"
        RateLimiterMiddleware.clear_requests()

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"x-test-client": "interviewpilot-test-runner"}

            # Send 35 requests (exceeds standard 30 limit)
            for i in range(35):
                res = await client.post("/api/auth/login", json={"email": f"authorized_{i}@test.com", "password": "pass"}, headers=headers)
                # None should be 429
                assert res.status_code != 429, f"Request {i} was throttled with 429"
    finally:
        if original_env is not None:
            os.environ["ENVIRONMENT"] = original_env
        else:
            os.environ.pop("ENVIRONMENT", None)
        if original_bypass is not None:
            os.environ["ALLOW_TEST_HEADER_BYPASS"] = original_bypass
        else:
            os.environ.pop("ALLOW_TEST_HEADER_BYPASS", None)
        RateLimiterMiddleware.clear_requests()
