import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "InterviewPilot AI"
    ENV: str = "development"
    ENVIRONMENT: str = ""
    PORT: int = 5000
    HOST: str = "0.0.0.0"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # MongoDB
    MONGO_URI: str = "mongodb://127.0.0.1:27017/interview_ai"
    DB_NAME: str = "interview_ai"
    
    # Auth & JWT
    JWT_SECRET: str = "default_jwt_secret_key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_DAYS: int = 7
    
    # AI Engine (Google Gemini Only)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-lite-latest"
    GEMINI_TIMEOUT: float = 25.0
    
    # Code Execution Sandbox (Judge0)
    JUDGE0_URL: str = ""
    JUDGE0_API_KEY: str = ""
    
    # Email / SMTP (Optional)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = "InterviewPilot AI <interviewpilotai.notify@gmail.com>"
    EMAIL_TEST_MODE: bool = False
    
    # Uploads
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    PHOTO_MAX_SIZE_MB: int = 2
    RESUME_MAX_SIZE_MB: int = 5

    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "allow"

    def get_frontend_url(self, request=None) -> str:
        if request is not None:
            origin = request.headers.get("origin")
            referer = request.headers.get("referer")
            if origin and any(origin.startswith(prefix) for prefix in ["http://localhost", "http://127.0.0.1", "https://"]):
                return origin.rstrip("/")
            if referer:
                from urllib.parse import urlparse
                p = urlparse(referer)
                if p.scheme and p.netloc:
                    return f"{p.scheme}://{p.netloc}"

        from pathlib import Path
        from dotenv import dotenv_values
        env_path = BASE_DIR / ".env"
        env_vals = dotenv_values(env_path) if env_path.exists() else {}
        configured = env_vals.get("FRONTEND_URL") or self.FRONTEND_URL or "http://localhost:5173"
        raw_urls = configured.split(",")
        return raw_urls[0].strip().rstrip("/") if raw_urls else "http://localhost:5173"

settings = Settings()

# Ensure uploads directory exists
uploads_path = Path(settings.UPLOAD_DIR)
(uploads_path / "photos").mkdir(parents=True, exist_ok=True)
(uploads_path / "resumes").mkdir(parents=True, exist_ok=True)
