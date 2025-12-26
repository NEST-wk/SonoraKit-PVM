"""
Modelos Pydantic para validación de datos.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class AIConfigCreate(BaseModel):
    """Crear configuración de IA."""
    provider_name: str = Field(..., min_length=1, max_length=50)
    api_key: str = Field(..., min_length=10)
    selected_model: str = Field(..., min_length=1)
    custom_params: Optional[Dict[str, Any]] = None


class AIConfigUpdate(BaseModel):
    """Actualizar configuración de IA."""
    api_key: Optional[str] = Field(None, min_length=10)
    selected_model: Optional[str] = None
    custom_params: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class AIConfigResponse(BaseModel):
    """Respuesta de configuración de IA."""
    id: str
    provider_name: str
    selected_model: str
    has_api_key: bool = True
    is_active: bool = True
    custom_params: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AIProviderResponse(BaseModel):
    """Respuesta de proveedor de IA."""
    name: str
    display_name: str
    models: List[Dict[str, Any]]
    is_active: bool = True
