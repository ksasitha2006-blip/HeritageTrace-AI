"""
Application settings loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    # ── Service ───────────────────────────────────────────────────────────────
    SERVICE_NAME: str = "HeritageTrace AI Agent Service"
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    DEBUG: bool = False

    # ── CORS ──────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # ── OpenAI / LLM ──────────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o"
    LLM_TEMPERATURE: float = 0.1

    # ── File Storage ──────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    REPORTS_DIR: str = "reports"
    FEATURE_DB_PATH: str = str(Path(__file__).resolve().parents[1] / "data" / "features.sqlite3")
    MAX_FILE_SIZE_MB: int = 20

    # ── Similarity Matching ───────────────────────────────────────────────────
    SIMILARITY_THRESHOLD: float = 0.75     # Cosine similarity cutoff
    ORB_MAX_FEATURES: int = 500
    SIFT_CONTRAST_THRESHOLD: float = 0.04

    # ── Tesseract OCR ─────────────────────────────────────────────────────────
    TESSERACT_CMD: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
