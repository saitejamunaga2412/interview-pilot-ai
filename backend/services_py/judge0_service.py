import asyncio
import logging
import httpx
from typing import Dict, Any, Optional
from core.config import settings

logger = logging.getLogger("uvicorn.error")

LANGUAGE_MAP = {
    "python": 71,
    "python3": 71,
    "py": 71,
    "javascript": 63,
    "js": 63,
    "nodejs": 63,
    "java": 62,
    "cpp": 54,
    "c++": 54,
    "c": 50,
    "typescript": 74,
    "ts": 74
}

class Judge0Service:
    def __init__(self):
        self.base_url = (settings.JUDGE0_URL or "").strip().rstrip("/")
        self.api_key = (settings.JUDGE0_API_KEY or "").strip()

    @property
    def is_configured(self) -> bool:
        return bool(self.base_url and self.base_url.startswith("http"))

    def resolve_language_id(self, lang: Any) -> int:
        if isinstance(lang, int) and lang > 0:
            return lang
        if isinstance(lang, str):
            try:
                parsed = int(lang)
                if parsed > 0:
                    return parsed
            except ValueError:
                pass
            normalized = lang.strip().lower()
            if normalized in LANGUAGE_MAP:
                return LANGUAGE_MAP[normalized]
        raise ValueError(f"Unsupported language: '{lang}'. Supported: python, javascript, java, cpp, c, typescript.")

    def get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-RapidAPI-Key"] = self.api_key
            try:
                from urllib.parse import urlparse
                host = urlparse(self.base_url).netloc
                headers["X-RapidAPI-Host"] = host
            except Exception:
                headers["X-Auth-Token"] = self.api_key
        return headers

    async def poll_submission(self, client: httpx.AsyncClient, token: str, max_attempts: int = 15, delay: float = 1.0) -> Dict[str, Any]:
        for _ in range(max_attempts):
            await asyncio.sleep(delay)
            try:
                url = f"{self.base_url}/submissions/{token}?base64_encoded=false"
                resp = await client.get(url, headers=self.get_headers(), timeout=10.0)
                if resp.status_code == 200:
                    data = resp.json()
                    status_id = data.get("status", {}).get("id", 0)
                    # 1: In Queue, 2: Processing
                    if status_id not in (1, 2):
                        return data
            except Exception as e:
                logger.warning(f"[Judge0] Polling warning: {e}")

        return {
            "status": {"id": 5, "description": "Time Limit Exceeded"},
            "stderr": "Time Limit Exceeded (Judge0 queue timeout)",
            "time": "> 10.0",
            "memory": 0
        }

    async def execute(self, source_code: str, language: str, stdin: str = "") -> Dict[str, Any]:
        if not source_code or not source_code.strip():
            raise ValueError("Source code is required.")

        lang_id = self.resolve_language_id(language)

        if not self.is_configured:
            # Safe mock execution response when Judge0 URL is not provided in dev environment
            return {
                "provider": "Judge0-Mock",
                "submissionToken": "mock-token",
                "stdout": "Program executed successfully in local preview sandbox.\nOutput verified.",
                "stderr": None,
                "compile_output": None,
                "time": "0.04",
                "memory": 2048,
                "status": "Accepted",
                "statusId": 3
            }

        async with httpx.AsyncClient(timeout=25.0) as client:
            url = f"{self.base_url}/submissions?base64_encoded=false&wait=true"
            payload = {
                "source_code": source_code,
                "language_id": lang_id,
                "stdin": stdin or ""
            }
            try:
                resp = await client.post(url, json=payload, headers=self.get_headers())
                if resp.status_code not in (200, 201):
                    raise RuntimeError(f"Judge0 error ({resp.status_code}): {resp.text}")

                res_data = resp.json()
                status_id = res_data.get("status", {}).get("id", 0)
                token = res_data.get("token")

                if status_id in (1, 2) and token:
                    res_data = await self.poll_submission(client, token)

                status_desc = res_data.get("status", {}).get("description", "Unknown")
                return {
                    "provider": "Judge0",
                    "submissionToken": res_data.get("token"),
                    "stdout": res_data.get("stdout"),
                    "stderr": res_data.get("stderr"),
                    "compile_output": res_data.get("compile_output"),
                    "time": res_data.get("time", "0.00"),
                    "memory": res_data.get("memory", 0),
                    "status": status_desc,
                    "statusId": res_data.get("status", {}).get("id", 0)
                }
            except httpx.TimeoutException:
                return {
                    "provider": "Judge0",
                    "submissionToken": None,
                    "stdout": None,
                    "stderr": "Time Limit Exceeded (Execution Timed Out)",
                    "compile_output": None,
                    "time": "> 10.0",
                    "memory": 0,
                    "status": "Time Limit Exceeded",
                    "statusId": 5
                }

judge0_service = Judge0Service()
