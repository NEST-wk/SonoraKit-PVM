"""
Endpoints para gestión de configuraciones de IA.
"""
from fastapi import APIRouter, HTTPException, Header, status
from typing import List, Optional
from app.models.schemas import AIConfigCreate, AIConfigUpdate, AIConfigResponse, AIProviderResponse
from app.services.encryption import encryption_service
from app.db.supabase import supabase
from app.core.logger import logger

router = APIRouter(prefix="/ai-configs", tags=["AI Configurations"])


def get_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    """Obtiene el user_id del header."""
    if not x_user_id:
        raise HTTPException(
            status_code=401, detail="X-User-ID header required")
    return x_user_id


# Providers
@router.get("/providers", response_model=List[AIProviderResponse])
async def list_providers():
    """Lista proveedores de IA disponibles."""
    if not supabase.is_configured:
        # Mock data si no hay Supabase
        return [
            {"name": "openai", "display_name": "OpenAI", "models": [
                {"id": "gpt-4o", "name": "GPT-4o"},
                {"id": "gpt-4o-mini", "name": "GPT-4o Mini"}
            ], "is_active": True},
            {"name": "anthropic", "display_name": "Anthropic", "models": [
                {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet"}
            ], "is_active": True}
        ]
    return supabase.list_providers()


@router.get("/providers/{provider_name}", response_model=AIProviderResponse)
async def get_provider(provider_name: str):
    """Obtiene detalles de un proveedor."""
    if not supabase.is_configured:
        raise HTTPException(status_code=404, detail="Provider not found")

    provider = supabase.get_provider(provider_name)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


# Configs
@router.get("/", response_model=List[AIConfigResponse])
async def list_configs(x_user_id: str = Header(...)):
    """Lista configuraciones del usuario."""
    user_id = get_user_id(x_user_id)

    if not supabase.is_configured:
        return []

    configs = supabase.list_user_ai_configs(user_id)
    for c in configs:
        c["has_api_key"] = bool(c.get("encrypted_key"))
        c.pop("encrypted_key", None)
    return configs


@router.post("/", response_model=AIConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_config(config: AIConfigCreate, x_user_id: str = Header(...)):
    """Crea configuración de IA."""
    user_id = get_user_id(x_user_id)

    if not supabase.is_configured:
        raise HTTPException(status_code=503, detail="Database not configured")

    # Verificar si ya existe
    existing = supabase.get_ai_config(user_id, config.provider_name)
    if existing:
        raise HTTPException(
            status_code=409, detail="Config already exists for this provider")

    # Cifrar API key
    encrypted_key = encryption_service.encrypt(config.api_key)

    data = {
        "user_id": user_id,
        "provider_name": config.provider_name,
        "selected_model": config.selected_model,
        "encrypted_key": encrypted_key,
        "custom_params": config.custom_params or {}
    }

    created = supabase.create_ai_config(data)
    created["has_api_key"] = True
    created.pop("encrypted_key", None)
    return created


@router.put("/{provider_name}", response_model=AIConfigResponse)
async def update_config(provider_name: str, updates: AIConfigUpdate, x_user_id: str = Header(...)):
    """Actualiza configuración de IA."""
    user_id = get_user_id(x_user_id)

    if not supabase.is_configured:
        raise HTTPException(status_code=503, detail="Database not configured")

    existing = supabase.get_ai_config(user_id, provider_name)
    if not existing:
        raise HTTPException(status_code=404, detail="Config not found")

    data = {}
    if updates.api_key:
        data["encrypted_key"] = encryption_service.encrypt(updates.api_key)
    if updates.selected_model:
        data["selected_model"] = updates.selected_model
    if updates.custom_params is not None:
        data["custom_params"] = updates.custom_params
    if updates.is_active is not None:
        data["is_active"] = updates.is_active

    if not data:
        raise HTTPException(status_code=400, detail="No updates provided")

    updated = supabase.update_ai_config(existing["id"], data)
    updated["has_api_key"] = True
    updated.pop("encrypted_key", None)
    return updated


@router.delete("/{provider_name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_config(provider_name: str, x_user_id: str = Header(...)):
    """Elimina configuración de IA."""
    user_id = get_user_id(x_user_id)

    if not supabase.is_configured:
        raise HTTPException(status_code=503, detail="Database not configured")

    existing = supabase.get_ai_config(user_id, provider_name)
    if not existing:
        raise HTTPException(status_code=404, detail="Config not found")

    supabase.delete_ai_config(existing["id"])
