"""
Rutas de autenticación - sincronización Firebase <-> Neon PostgreSQL
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import httpx

from app.db.database import get_db
from app.db.models import Profile
from app.core.config import settings
from app.core.logger import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])


class UserProfile(BaseModel):
    """Respuesta del perfil de usuario."""
    id: str
    firebase_uid: str
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    ui_config: dict = {}


class SyncUserRequest(BaseModel):
    """Request para sincronizar usuario desde Firebase."""
    firebase_uid: str
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


async def verify_firebase_token(authorization: str = Header(...)) -> dict:
    """
    Verifica el token de Firebase usando la API REST.
    Retorna la información del usuario si el token es válido.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")

    # Verificar token con Firebase
    # Usamos la API REST de Firebase para verificar el token
    verify_url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={settings.firebase_api_key}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                verify_url,
                json={"idToken": token}
            )

            if response.status_code != 200:
                logger.error(
                    f"Firebase token verification failed: {response.text}")
                raise HTTPException(
                    status_code=401, detail="Invalid or expired token")

            data = response.json()
            users = data.get("users", [])

            if not users:
                raise HTTPException(status_code=401, detail="User not found")

            user = users[0]
            return {
                "uid": user.get("localId"),
                "email": user.get("email"),
                "display_name": user.get("displayName"),
                "avatar_url": user.get("photoUrl")
            }

        except httpx.RequestError as e:
            logger.error(f"Error verifying Firebase token: {e}")
            raise HTTPException(
                status_code=500, detail="Error verifying authentication")


@router.post("/sync", response_model=UserProfile)
async def sync_user_profile(
    firebase_user: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Sincroniza el usuario de Firebase con la base de datos Neon.
    Crea el perfil si no existe, o lo actualiza si ya existe.
    """
    try:
        # Buscar perfil existente
        result = await db.execute(
            select(Profile).where(Profile.firebase_uid == firebase_user["uid"])
        )
        profile = result.scalar_one_or_none()

        if profile:
            # Actualizar datos si cambiaron
            profile.email = firebase_user["email"]
            if firebase_user.get("display_name"):
                profile.display_name = firebase_user["display_name"]
            if firebase_user.get("avatar_url"):
                profile.avatar_url = firebase_user["avatar_url"]

            logger.info(f"Updated profile for user {firebase_user['uid']}")
        else:
            # Crear nuevo perfil
            profile = Profile(
                firebase_uid=firebase_user["uid"],
                email=firebase_user["email"],
                display_name=firebase_user.get("display_name"),
                avatar_url=firebase_user.get("avatar_url"),
                ui_config={
                    "theme": "dark",
                    "language": "es",
                    "primary_color": "#6366f1"
                }
            )
            db.add(profile)
            logger.info(f"Created new profile for user {firebase_user['uid']}")

        await db.commit()
        await db.refresh(profile)

        return UserProfile(
            id=str(profile.id),
            firebase_uid=profile.firebase_uid,
            email=profile.email,
            display_name=profile.display_name,
            avatar_url=profile.avatar_url,
            ui_config=profile.ui_config or {}
        )

    except Exception as e:
        await db.rollback()
        logger.error(f"Error syncing user profile: {e}")
        raise HTTPException(
            status_code=500, detail="Error syncing user profile")


@router.get("/me", response_model=UserProfile)
async def get_current_user(
    firebase_user: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene el perfil del usuario autenticado.
    """
    result = await db.execute(
        select(Profile).where(Profile.firebase_uid == firebase_user["uid"])
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=404, detail="Profile not found. Please sync first.")

    return UserProfile(
        id=str(profile.id),
        firebase_uid=profile.firebase_uid,
        email=profile.email,
        display_name=profile.display_name,
        avatar_url=profile.avatar_url,
        ui_config=profile.ui_config or {}
    )
