"""
Cliente de base de datos PostgreSQL usando SQLAlchemy + asyncpg para Neon.
"""
from typing import Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
from app.core.logger import logger

Base = declarative_base()


class Database:
    """Cliente de base de datos async."""

    _instance: Optional["Database"] = None
    _engine = None
    _session_factory = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _ensure_initialized(self):
        """Inicializa el engine solo cuando se necesita."""
        if self._engine is not None:
            return

        if not settings.database_url:
            logger.warning("Database URL not configured")
            return

        try:
            # Convertir postgresql:// a postgresql+asyncpg://
            db_url = settings.database_url
            if db_url.startswith("postgresql://"):
                db_url = db_url.replace(
                    "postgresql://", "postgresql+asyncpg://", 1)

            # asyncpg usa 'ssl' en lugar de 'sslmode'
            db_url = db_url.replace("?sslmode=require", "?ssl=require")

            self._engine = create_async_engine(
                db_url,
                echo=settings.debug,
                pool_size=5,
                max_overflow=10
            )

            self._session_factory = async_sessionmaker(
                bind=self._engine,
                class_=AsyncSession,
                expire_on_commit=False
            )

            logger.info("Database engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")

    @property
    def engine(self):
        """Retorna el engine de SQLAlchemy."""
        self._ensure_initialized()
        return self._engine

    @property
    def is_configured(self) -> bool:
        """Verifica si la DB está configurada."""
        return bool(settings.database_url)

    async def get_session(self) -> AsyncSession:
        """Obtiene una sesión de base de datos."""
        self._ensure_initialized()
        if not self._session_factory:
            raise RuntimeError("Database not configured")
        return self._session_factory()

    async def create_tables(self):
        """Crea las tablas en la base de datos."""
        self._ensure_initialized()
        if not self._engine:
            raise RuntimeError("Database not configured")
        async with self._engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created")

    async def close(self):
        """Cierra las conexiones."""
        if self._engine:
            await self._engine.dispose()
            logger.info("Database connections closed")


# Instancia global
db = Database()


# Dependency para FastAPI
async def get_db() -> AsyncSession:
    """Dependency para obtener sesión de DB."""
    session = await db.get_session()
    try:
        yield session
    finally:
        await session.close()
