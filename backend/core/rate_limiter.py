import os
import time
from collections import defaultdict
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Lightweight, in-memory sliding-window rate limiter for sensitive and expensive endpoints.
    Protects login/registration from brute-force and AI/Execution endpoints from quota exhaustion.
    """
    _instance = None

    def __init__(self, app):
        super().__init__(app)
        # Stores IP -> list of request timestamps
        self.requests = defaultdict(list)
        self.last_cleanup = time.time()
        RateLimiterMiddleware._instance = self

    @classmethod
    def clear_requests(cls):
        """Clears request history for test suite isolation."""
        if cls._instance:
            cls._instance.requests.clear()

    def get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "127.0.0.1"

    def is_authorized_test_bypass(self, request: Request) -> bool:
        """
        Only allows bypassing rate limits if the environment is EXPLICITLY configured
        as a dedicated test environment AND the explicit bypass flag is enabled.
        Production and Development environments strictly ignore the x-test-client header.
        """
        env = os.environ.get("ENVIRONMENT", "").strip().lower()
        allow_bypass = os.environ.get("ALLOW_TEST_HEADER_BYPASS", "").strip().lower() in ("1", "true")
        if env == "test" and allow_bypass:
            return request.headers.get("x-test-client") == "interviewpilot-test-runner"
        return False

    async def dispatch(self, request: Request, call_next):
        # Exclude static files, health checks, options preflights, and authorized test runners
        path = request.url.path
        if (
            request.method == "OPTIONS"
            or path in ("/api/health", "/health")
            or path.startswith("/uploads")
            or self.is_authorized_test_bypass(request)
        ):
            return await call_next(request)

        now = time.time()
        # Periodic cleanup of timestamps older than 60s every 5 minutes
        if now - self.last_cleanup > 300:
            for ip in list(self.requests.keys()):
                self.requests[ip] = [ts for ts in self.requests[ip] if now - ts < 60]
                if not self.requests[ip]:
                    del self.requests[ip]
            self.last_cleanup = now

        client_ip = self.get_client_ip(request)

        # Define window limits (per 60 seconds)
        if path in ("/api/auth/login", "/api/auth/register"):
            max_requests = 30
        elif path in ("/api/interview/generate", "/api/coding/execute", "/api/resume/upload", "/api/resume/analyze"):
            max_requests = 45
        elif path.startswith("/api/learning/teacher"):
            max_requests = 60
        else:
            max_requests = 200

        # Filter timestamps within last 60s
        history = [ts for ts in self.requests[client_ip] if now - ts < 60]
        if len(history) >= max_requests:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "message": "Too many requests. Please slow down and try again shortly."
                },
                headers={"Retry-After": "60"}
            )

        history.append(now)
        self.requests[client_ip] = history

        response = await call_next(request)
        return response
