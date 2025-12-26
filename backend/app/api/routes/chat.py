"""
Endpoints para el chat con IA.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import List, Optional
import json
import uuid

from app.db.database import get_db
from app.db.models import Profile, AIConfig, Chat, Message
from app.services.ai_service import ai_service
from app.services.encryption import encryption_service
from app.api.routes.auth import verify_firebase_token
from app.core.logger import logger

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    provider: str
    model: str
    messages: List[ChatMessage]
    chat_id: Optional[str] = None
    stream: bool = False


class ChatResponse(BaseModel):
    content: str
    chat_id: str
    message_id: str


class ChatSummary(BaseModel):
    id: str
    title: str
    provider_name: Optional[str]
    model_id: Optional[str]
    message_count: int
    created_at: str
    updated_at: str


@router.post("/completions")
async def chat_completions(
    request: ChatRequest,
    firebase_user: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """Envía un mensaje al chat y obtiene respuesta de la IA."""

    # Obtener profile
    result = await db.execute(
        select(Profile).where(Profile.firebase_uid == firebase_user["uid"])
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Obtener API key del usuario para el proveedor
    result = await db.execute(
        select(AIConfig).where(
            AIConfig.profile_id == profile.id,
            AIConfig.provider_name == request.provider,
            AIConfig.is_active == True
        )
    )
    ai_config = result.scalar_one_or_none()

    if not ai_config:
        raise HTTPException(
            status_code=400,
            detail=f"No API key configured for {request.provider}. Please add your API key in Settings."
        )

    # Desencriptar API key
    try:
        api_key = encryption_service.decrypt(ai_config.encrypted_key)
    except Exception as e:
        logger.error(f"Error decrypting API key: {e}")
        raise HTTPException(
            status_code=500, detail="Error with API key encryption")

    # Obtener o crear chat
    chat_id = request.chat_id
    if chat_id:
        result = await db.execute(
            select(Chat).where(
                Chat.id == uuid.UUID(chat_id),
                Chat.profile_id == profile.id
            )
        )
        chat = result.scalar_one_or_none()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
    else:
        # Crear nuevo chat
        chat = Chat(
            profile_id=profile.id,
            title=request.messages[0].content[:50] + "..." if len(
                request.messages[0].content) > 50 else request.messages[0].content,
            provider_name=request.provider,
            model_id=request.model
        )
        db.add(chat)
        await db.flush()
        chat_id = str(chat.id)

    # Guardar mensaje del usuario
    user_message = Message(
        chat_id=chat.id,
        role="user",
        content=request.messages[-1].content
    )
    db.add(user_message)

    # Convertir mensajes para el servicio de IA
    messages_for_ai = [{"role": m.role, "content": m.content}
                       for m in request.messages]

    if request.stream:
        # Respuesta en streaming
        async def generate():
            full_response = ""
            try:
                async for chunk in ai_service.chat_completion(
                    provider=request.provider,
                    model=request.model,
                    messages=messages_for_ai,
                    api_key=api_key,
                    stream=True
                ):
                    full_response += chunk
                    yield f"data: {json.dumps({'content': chunk, 'chat_id': chat_id})}\n\n"

                # Guardar respuesta completa
                assistant_message = Message(
                    chat_id=chat.id,
                    role="assistant",
                    content=full_response
                )
                db.add(assistant_message)

                # Actualizar contador de mensajes
                chat.message_count += 2
                await db.commit()

                yield f"data: {json.dumps({'done': True, 'chat_id': chat_id, 'message_id': str(assistant_message.id)})}\n\n"

            except Exception as e:
                logger.error(f"Streaming error: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    else:
        # Respuesta normal
        try:
            response = await ai_service.chat_completion(
                provider=request.provider,
                model=request.model,
                messages=messages_for_ai,
                api_key=api_key,
                stream=False
            )

            # Guardar respuesta
            assistant_message = Message(
                chat_id=chat.id,
                role="assistant",
                content=response["content"],
                tokens_used=response.get("usage", {}).get("total_tokens", 0)
            )
            db.add(assistant_message)

            # Actualizar contador de mensajes
            chat.message_count += 2
            await db.commit()

            return {
                "content": response["content"],
                "chat_id": chat_id,
                "message_id": str(assistant_message.id),
                "usage": response.get("usage", {})
            }

        except Exception as e:
            logger.error(f"Chat completion error: {e}")
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=List[ChatSummary])
async def get_chat_history(
    firebase_user: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """Obtiene el historial de chats del usuario."""

    result = await db.execute(
        select(Profile).where(Profile.firebase_uid == firebase_user["uid"])
    )
    profile = result.scalar_one_or_none()

    if not profile:
        return []

    result = await db.execute(
        select(Chat)
        .where(Chat.profile_id == profile.id)
        .order_by(Chat.updated_at.desc())
        .limit(50)
    )
    chats = result.scalars().all()

    return [
        {
            "id": str(chat.id),
            "title": chat.title,
            "provider_name": chat.provider_name,
            "model_id": chat.model_id,
            "message_count": chat.message_count,
            "created_at": chat.created_at.isoformat(),
            "updated_at": chat.updated_at.isoformat()
        }
        for chat in chats
    ]


@router.get("/{chat_id}/messages")
async def get_chat_messages(
    chat_id: str,
    firebase_user: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """Obtiene los mensajes de un chat específico."""

    result = await db.execute(
        select(Profile).where(Profile.firebase_uid == firebase_user["uid"])
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Verificar que el chat pertenece al usuario
    result = await db.execute(
        select(Chat).where(
            Chat.id == uuid.UUID(chat_id),
            Chat.profile_id == profile.id
        )
    )
    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Obtener mensajes
    result = await db.execute(
        select(Message)
        .where(Message.chat_id == chat.id)
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()

    return {
        "chat": {
            "id": str(chat.id),
            "title": chat.title,
            "provider_name": chat.provider_name,
            "model_id": chat.model_id
        },
        "messages": [
            {
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    }


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    firebase_user: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """Elimina un chat."""

    result = await db.execute(
        select(Profile).where(Profile.firebase_uid == firebase_user["uid"])
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    result = await db.execute(
        select(Chat).where(
            Chat.id == uuid.UUID(chat_id),
            Chat.profile_id == profile.id
        )
    )
    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    await db.delete(chat)
    await db.commit()

    return {"message": "Chat deleted successfully"}
