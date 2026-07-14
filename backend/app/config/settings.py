"""Environment-backed application settings (bootstrap defaults).

These are loaded once from `.env` at process start. They act as *defaults* under
the runtime settings overlay in `services/settings_service.py`: the Admin panel can
override the Groq key/model at runtime (persisted to the DB) without a restart.
Secrets live only here / in the DB — never hardcoded in source.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Database
    database_url: str = "postgresql+psycopg2://crm_user:crm_pass@localhost:5432/aivao_crm"

    # Groq LLM (bootstrap defaults; runtime-overridable via the admin panel)
    groq_api_key: str = ""
    groq_model: str = "gemma2-9b-it"

    # Admin
    admin_token: str = "change-me-admin-token"

    # CORS
    frontend_origin: str = "http://localhost:5173"


settings = Settings()
