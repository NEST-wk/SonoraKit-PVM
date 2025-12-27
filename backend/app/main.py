"""
Punto de entrada principal de FastAPI.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logger import logger
from app.api.routes import health, ai_configs, auth, chat


@asynccontextmanager
async def lifespan(_application: FastAPI):
    """Ciclo de vida de la aplicación."""
    logger.info("Starting %s v%s", settings.app_name, settings.app_version)
    yield
    logger.info("Shutting down")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS - Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Manejador global de excepciones no capturadas."""
    logger.error("Unhandled error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )


# Routes
app.include_router(health.router, prefix="/api/v1")
app.include_router(ai_configs.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Endpoint raíz con información básica de la API."""
    return {
        "message": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs" if settings.debug else "disabled"
    }
