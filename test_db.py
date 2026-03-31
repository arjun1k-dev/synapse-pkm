
import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy import text

# Force load .env
load_dotenv()

# Import the engine to see where it points
from backend.database import engine

async def check():
    print("--- CONNECTION DEBUG ---")
    print(f"Environment Variable: {os.getenv('DATABASE_URL')}")
    
    try:
        async with engine.connect() as conn:
            # 1. Check which DB we are connected to
            result = await conn.execute(text("SELECT current_database();"))
            db_name = result.scalar()
            print(f"✅ Connected to Database: {db_name}")

            # 2. List all tables
            result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = result.scalars().all()
            print(f"Tables found: {tables}")
            
            if "nodes" not in tables:
                print("❌ CRITICAL: The 'nodes' table is MISSING!")
            else:
                print("✅ The 'nodes' table exists.")
                
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(check())