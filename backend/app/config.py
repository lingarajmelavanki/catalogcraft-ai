import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    APP_ENV: str = "development"
    DATABASE_URL: str = "sqlite:///./catalogcraft.db"
    ANTHROPIC_API_KEY: Optional[str] = None
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_MODEL: str = "anthropic/claude-sonnet-5.5"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    UPLOAD_DIR: str = "uploads"
    EXPORT_DIR: str = "exports"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def is_live_ai_available(self) -> bool:
        anthropic = (self.ANTHROPIC_API_KEY or os.environ.get("ANTHROPIC_API_KEY") or "").strip()
        openrouter = (self.OPENROUTER_API_KEY or os.environ.get("OPENROUTER_API_KEY") or "").strip()
        return bool(anthropic or openrouter)

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.EXPORT_DIR, exist_ok=True)
