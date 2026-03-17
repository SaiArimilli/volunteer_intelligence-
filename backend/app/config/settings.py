"""Application settings loaded from environment variables."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "volunteer_intelligence"
    anthropic_api_key: str = ""
    secret_key: str = "changeme"
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    app_env: str = "development"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
