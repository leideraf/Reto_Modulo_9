from __future__ import annotations

import json

from dotenv import load_dotenv
from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    """Configuración centralizada de la aplicación."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")

    env: str = Field(default="development", validation_alias=AliasChoices("APP_ENV", "ENV"))

    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/universidad",
        validation_alias=AliasChoices("APP_DATABASE_URL", "DATABASE_URL"),
    )
    api_title: str = "Universidad Digital API"
    api_version: str = "1.0.0"

    jwt_secret: str | None = Field(default=None, validation_alias="APP_JWT_SECRET")
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = Field(default=60, validation_alias="APP_JWT_EXPIRATION")
    cookie_name: str = "access_token"
    cookie_secure: bool = Field(default=False, validation_alias="APP_COOKIE_SECURE")
    cookie_samesite: str = Field(default="lax", validation_alias="APP_COOKIE_SAMESITE")

    cors_origins: list[str] = Field(default_factory=list, validation_alias="APP_CORS_ORIGINS")

    auto_create_tables: bool = True

    @property
    def is_production(self) -> bool:
        return self.env.lower() == "production"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value: object) -> list[str]:
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []

            # Accept JSON style arrays in .env, e.g. ["http://localhost:5173"]
            if raw.startswith("["):
                try:
                    parsed = json.loads(raw)
                except json.JSONDecodeError:
                    parsed = None
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]

            # Fallback: comma-separated list
            items = [item.strip() for item in raw.split(",") if item.strip()]
            return items
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return []


settings = Settings()
