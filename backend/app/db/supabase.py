"""
Cliente de Supabase para operaciones de base de datos.
"""
from typing import Optional, Dict, Any, List
from supabase import create_client
from app.core.config import settings
from app.core.logger import logger


class SupabaseClient:
    """Cliente singleton de Supabase."""

    _instance: Optional["SupabaseClient"] = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _ensure_initialized(self):
        """Inicializa el cliente solo cuando se necesita."""
        if self._client is not None:
            return

        if not settings.supabase_url or not settings.supabase_service_key:
            logger.warning("Supabase credentials not configured")
            return

        try:
            self._client = create_client(
                settings.supabase_url,
                settings.supabase_service_key
            )
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase: {e}")

    @property
    def client(self):
        """Retorna el cliente de Supabase."""
        self._ensure_initialized()
        return self._client

    @property
    def is_configured(self) -> bool:
        """Verifica si Supabase está configurado."""
        return bool(settings.supabase_url and settings.supabase_service_key)

    # AI Configs
    def get_ai_config(self, user_id: str, provider_name: str) -> Optional[Dict[str, Any]]:
        """Obtiene configuración de IA."""
        if not self.client:
            return None
        response = self.client.table("ai_configs").select("*").eq(
            "user_id", user_id
        ).eq("provider_name", provider_name).maybe_single().execute()
        return response.data

    def list_user_ai_configs(self, user_id: str) -> List[Dict[str, Any]]:
        """Lista configuraciones de un usuario."""
        if not self.client:
            return []
        response = self.client.table("ai_configs").select("*").eq(
            "user_id", user_id
        ).execute()
        return response.data or []

    def create_ai_config(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Crea configuración de IA."""
        if not self.client:
            raise RuntimeError("Supabase not configured")
        response = self.client.table("ai_configs").insert(data).execute()
        return response.data[0]

    def update_ai_config(self, config_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Actualiza configuración de IA."""
        if not self.client:
            raise RuntimeError("Supabase not configured")
        response = self.client.table("ai_configs").update(data).eq(
            "id", config_id
        ).execute()
        return response.data[0]

    def delete_ai_config(self, config_id: str) -> None:
        """Elimina configuración de IA."""
        if not self.client:
            raise RuntimeError("Supabase not configured")
        self.client.table("ai_configs").delete().eq("id", config_id).execute()

    # Providers
    def list_providers(self) -> List[Dict[str, Any]]:
        """Lista proveedores de IA."""
        if not self.client:
            return []
        response = self.client.table("ai_providers_catalog").select("*").eq(
            "is_active", True
        ).execute()
        return response.data or []

    def get_provider(self, name: str) -> Optional[Dict[str, Any]]:
        """Obtiene un proveedor por nombre."""
        if not self.client:
            return None
        response = self.client.table("ai_providers_catalog").select("*").eq(
            "name", name
        ).maybe_single().execute()
        return response.data


# Instancia global
supabase = SupabaseClient()
