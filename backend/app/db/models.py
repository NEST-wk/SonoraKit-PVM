"""
Modelos SQLAlchemy para la base de datos.
"""
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.database import Base


class Profile(Base):
    """Perfil de usuario (vinculado a Firebase UID)."""
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String(128), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=False)
    display_name = Column(String(255))
    avatar_url = Column(Text)

    # Configuración de UI
    ui_config = Column(JSON, default={
        "theme": "dark",
        "language": "es",
        "primary_color": "#6366f1"
    })

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Relaciones
    ai_configs = relationship(
        "AIConfig", back_populates="profile", cascade="all, delete-orphan")
    chats = relationship("Chat", back_populates="profile",
                         cascade="all, delete-orphan")


class AIProviderCatalog(Base):
    """Catálogo de proveedores de IA."""
    __tablename__ = "ai_providers_catalog"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    base_url = Column(Text)
    is_active = Column(Boolean, default=True)
    models = Column(JSON, default=[])
    default_params = Column(JSON, default={})

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)


class AIConfig(Base):
    """Configuración de IA por usuario."""
    __tablename__ = "ai_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey(
        "profiles.id", ondelete="CASCADE"), nullable=False)
    provider_name = Column(String(50), ForeignKey(
        "ai_providers_catalog.name"), nullable=False)

    encrypted_key = Column(Text, nullable=False)
    selected_model = Column(String(100), nullable=False)
    custom_params = Column(JSON, default={})
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Relaciones
    profile = relationship("Profile", back_populates="ai_configs")


class Chat(Base):
    """Conversaciones."""
    __tablename__ = "chats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey(
        "profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="Nueva conversación")
    provider_name = Column(String(50))
    model_id = Column(String(100))
    message_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Relaciones
    profile = relationship("Profile", back_populates="chats")
    messages = relationship(
        "Message", back_populates="chat", cascade="all, delete-orphan")


class Message(Base):
    """Mensajes de chat."""
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey(
        "chats.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    tokens_used = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    chat = relationship("Chat", back_populates="messages")
