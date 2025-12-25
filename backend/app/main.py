"""
Punto de entrada principal de FastAPI.
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logger import logger
from app.api.routes import health, ai_configs


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ciclo de vida de la aplicación."""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    yield
    logger.info("Shutting down")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )


# Routes
app.include_router(health.router, prefix="/api/v1")
app.include_router(ai_configs.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs" if settings.debug else "disabled"
    }
