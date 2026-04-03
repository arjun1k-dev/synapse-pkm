import asyncio
from sqlalchemy import text
from database import engine, Base
from models import Node, Edge

async def create_search_trigger():
    """Create trigger and index after ensuring the table exists."""
    async with engine.begin() as conn:
        # Create the function (does not depend on the table)
        await conn.execute(text("""
            CREATE OR REPLACE FUNCTION nodes_search_vector_update() RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B');
                RETURN NEW;
            END
            $$ LANGUAGE plpgsql;
        """))

        # Check if the 'nodes' table exists before creating trigger
        result = await conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'nodes'
            );
        """))
        table_exists = result.scalar()
        
        if table_exists:
            await conn.execute(text("DROP TRIGGER IF EXISTS nodes_search_vector_trigger ON nodes;"))
            await conn.execute(text("""
                CREATE TRIGGER nodes_search_vector_trigger
                BEFORE INSERT OR UPDATE ON nodes
                FOR EACH ROW EXECUTE FUNCTION nodes_search_vector_update();
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS nodes_search_idx ON nodes USING GIN (search_vector);"))
            await conn.execute(text("UPDATE nodes SET title = title WHERE search_vector IS NULL;"))
            print("✅ Trigger and index created on 'nodes' table.")
        else:
            print("⚠️ 'nodes' table not found – trigger creation skipped (will be retried on next startup).")

async def init():
    # Step 1: Create tables (if they don't exist) – this is idempotent
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Tables ensured (nodes, edges).")
    
    # Step 2: Create the search trigger and index (separate transaction)
    await create_search_trigger()

if __name__ == "__main__":
    asyncio.run(init())