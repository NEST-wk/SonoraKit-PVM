"""
Endpoints de health check.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    """Health check básico."""
    return {"status": "healthy"}
