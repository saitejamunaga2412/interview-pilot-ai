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
    GEMINI_TIMEOUT: float = 12.0
    
    # Code Execution Sandbox (Judge0)
    JUDGE0_URL: str = ""
    JUDGE0_API_KEY: str = ""
    
    # Email / SMTP (Optional)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = "InterviewPilot AI <no-reply@interviewpilot.ai>"
    EMAIL_TEST_MODE: bool = False
    
    # Uploads
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    PHOTO_MAX_SIZE_MB: int = 2
    RESUME_MAX_SIZE_MB: int = 5

    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "allow"

settings = Settings()

# Ensure uploads directory exists
uploads_path = Path(settings.UPLOAD_DIR)
(uploads_path / "photos").mkdir(parents=True, exist_ok=True)
(uploads_path / "resumes").mkdir(parents=True, exist_ok=True)
