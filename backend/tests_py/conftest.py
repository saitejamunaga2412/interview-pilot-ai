import sys
from pathlib import Path
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import pytest
from core.rate_limiter import RateLimiterMiddleware

@pytest.fixture(autouse=True)
def reset_rate_limiter_between_tests():
    RateLimiterMiddleware.clear_requests()
    yield
    RateLimiterMiddleware.clear_requests()
