"""
Endpoints para gestión de configuraciones de IA.
Actualizado para usar SQLAlchemy con Neon PostgreSQL.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.models.schemas import AIConfigCreate, AIConfigUpdate, AIConfigResponse, AIProviderResponse
from app.services.encryption import encryption_service
from app.db.database import get_db
from app.db.models import AIConfig, AIProviderCatalog, Profile
from app.core.logger import logger
from app.api.routes.auth import verify_firebase_token

router = APIRouter(prefix="/ai-configs", tags=["AI Configurations"])


# Providers
@router.get("/providers", response_model=List[AIProviderResponse])
async def list_providers(db: AsyncSession = Depends(get_db)):
    """Lista proveedores de IA disponibles."""
    result = await db.execute(
        select(AIProviderCatalog).where(AIProviderCatalog.is_active == True)
    )
    providers = result.scalars().all()

    if not providers:
        # Mock data si no hay proveedores en DB
        return [
            {"name": "openai", "display_name": "OpenAI", "models": [
                {"id": "gpt-4o", "name": "GPT-4o"},
                {"id": "gpt-4o-mini", "name": "GPT-4o Mini"}
            ], "is_active": True},
            {"name": "anthropic", "display_name": "Anthropic", "models": [
                {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet"},
                {"id": "claude-3-5-haiku-20241022", "name": "Claude 3.5 Haiku"}
            ], "is_active": True},
            {"name": "google", "display_name": "Google AI", "models": [
                {"id": "gemini-2.0-flash-exp", "name": "Gemini 2.0 Flash"},
                {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro"}
            ], "is_active": True}
        ]

    return [
        {
            "name": p.name,
            "display_name": p.display_name,
            "models": p.models or [],
            "is_active": p.is_active
        }
        for p in providers
    ]


@router.get("/providers/{provider_name}", response_model=AIProviderResponse)
async def get_provider(provider_name: str, db: AsyncSession = Depends(get_db)):
    """Obtiene detalles de un proveedor."""
    result = await db.execute(
        select(AIProviderCatalog).where(
            AIProviderCatalog.name == provider_name)
    )
    provider = result.scalar_one_or_none()

    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    return {
        "name": provider.name,
        "display_name": provider.display_name,
        "models": provider.models or [],
        "is_active": provider.is_active
    }


# Configs
@router.get("/", response_model=List[AIConfigResponse])
async def list_configs(
    firebase_user: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """Lista configuraciones del usuario."""
    # Obtener profile del usuario
    result = await db.execute(
        select(Profile).where(Profile.firebase_uid == firebase_user["uid"])
    )
    profile = result.scalar_one_or_none()

    if not profile:
        return []

    # Obtener configs
    result = await db.execute(
        select(AIConfig).where(AIConfig.profile_id == profile.id)
    )
    configs = result.scalars().all()

    return [
        {
            "id": str(c.id),
            "provider_name": c.provider_name,
            "selected_model": c.selected_model,
            "custom_params": c.custom_params or {},
            "is_active": c.is_active,
            "has_api_key": bool(c.encrypted_key)
        }
        for c in configs
    ]


@router.post("/", response_model=AIConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_config(
    config: AIConfigCreate,
    firebase_user: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """Crea configuración de IA."""
    # Obtener profile
    result = await db.execute(
        select(Profile).where(Profile.firebase_uid == firebase_user["uid"])
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=404, detail="Profile not found. Please sync first.")

    # Verificar si ya existe
    result = await db.execute(
        select(AIConfig).where(
            AIConfig.profile_id == profile.id,
            AIConfig.provider_name == config.provider_name
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=409, detail="Config already exists for this provider")

    # Cifrar API key
    encrypted_key = encryption_service.encrypt(config.api_key)

    # Crear config
    new_config = AIConfig(
        profile_id=profile.id,
        provider_name=config.provider_name,
        selected_model=config.selected_model,
        encrypted_key=encrypted_key,
        custom_params=config.custom_params or {}
    )

    db.add(new_config)
    await db.commit()
    await db.refresh(new_config)

    return {
        "id": str(new_config.id),
        "provider_name": new_config.provider_name,
        "selected_model": new_config.selected_model,
        "custom_params": new_config.custom_params or {},
        "is_active": new_config.is_active,
        "has_api_key": True
    }


@router.put("/{provider_name}", response_model=AIConfigResponse)
async def update_config(
    provider_name: str,
    updates: AIConfigUpdate,
    firebase_user: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """Actualiza configuración de IA."""
    # Obtener profile
    result = await db.execute(
        select(Profile).where(Profile.firebase_uid == firebase_user["uid"])
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Obtener config existente
    result = await db.execute(
        select(AIConfig).where(
            AIConfig.profile_id == profile.id,
            AIConfig.provider_name == provider_name
        )
    )
    config = result.scalar_one_or_none()

    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    # Actualizar campos
    if updates.api_key:
        config.encrypted_key = encryption_service.encrypt(updates.api_key)
    if updates.selected_model:
        config.selected_model = updates.selected_model
    if updates.custom_params is not None:
        config.custom_params = updates.custom_params
    if updates.is_active is not None:
        config.is_active = updates.is_active

    await db.commit()
    await db.refresh(config)

    return {
        "id": str(config.id),
        "provider_name": config.provider_name,
        "selected_model": config.selected_model,
        "custom_params": config.custom_params or {},
        "is_active": config.is_active,
        "has_api_key": bool(config.encrypted_key)
    }


@router.delete("/{provider_name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_config(
    provider_name: str,
    firebase_user: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """Elimina configuración de IA."""
    # Obtener profile
    result = await db.execute(
        select(Profile).where(Profile.firebase_uid == firebase_user["uid"])
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Obtener config
    result = await db.execute(
        select(AIConfig).where(
            AIConfig.profile_id == profile.id,
            AIConfig.provider_name == provider_name
        )
    )
    config = result.scalar_one_or_none()

    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    await db.delete(config)
    await db.commit()
