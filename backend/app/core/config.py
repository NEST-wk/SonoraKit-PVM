"""
Configuración centralizada usando Pydantic Settings.
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Configuración de la aplicación."""

    # App
    app_name: str = "SonoraKit PVM API"
    app_version: str = "0.1.0"
    debug: bool = True

    # Security
    master_key: str = ""
    secret_key: str = "dev-secret-key"

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""

    # CORS
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"

    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 86400  # 24 horas

    @property
    def cors_origins(self) -> List[str]:
        """Convierte string de orígenes a lista."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Singleton de settings."""
    return Settings()


settings = get_settings()
