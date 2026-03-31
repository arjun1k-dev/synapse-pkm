import asyncio
from backend.database import engine, Base
from backend.models import Node,Edge

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database initialized!")

if __name__ == "__main__":
    asyncio.run(init())
