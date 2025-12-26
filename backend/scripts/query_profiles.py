"""Script para consultar la tabla profiles."""
from sqlalchemy import text
from app.db.database import Database
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


async def query_profiles():
    db = Database()
    db._ensure_initialized()

    async with db._engine.begin() as conn:
        result = await conn.execute(text("SELECT * FROM profiles"))
        rows = result.fetchall()

        if not rows:
            print("📭 La tabla profiles está vacía")
        else:
            print(f"📊 {len(rows)} perfil(es) encontrado(s):")
            for row in rows:
                print(row)

    await db.close()


if __name__ == "__main__":
    asyncio.run(query_profiles())
