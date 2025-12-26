"""Script to initialize database tables in Neon PostgreSQL."""
from app.db.database import Database
from sqlalchemy import text
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.models import Base  # noqa: F401 - Needed to register models


async def init_database():
    """Create all tables in the database."""
    print("🚀 Initializing database...")

    db = Database()

    try:
        # Create tables
        await db.create_tables()
        print("✅ Database tables created successfully!")

        # Verify connection
        async for session in db.get_session():
            result = await session.execute(text("SELECT 1"))
            print("✅ Database connection verified!")
            break

    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        raise
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(init_database())
