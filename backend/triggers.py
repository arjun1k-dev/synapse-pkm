from sqlalchemy import text
from backend.database import engine

async def create_search_trigger():
    async with engine.begin() as conn:
        # 1. Create the Function (Single Command)
        await conn.execute(text("""
            CREATE OR REPLACE FUNCTION nodes_search_vector_update() RETURNS trigger AS $$             BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B');
                RETURN NEW;
            END
            $$ LANGUAGE plpgsql;
        """))

        # 2. Drop Old Trigger (Separate Command)
        await conn.execute(text(
            "DROP TRIGGER IF EXISTS nodes_search_vector_trigger ON nodes;"
        ))

        # 3. Create New Trigger (Separate Command)
        await conn.execute(text("""
            CREATE TRIGGER nodes_search_vector_trigger
            BEFORE INSERT OR UPDATE ON nodes
            FOR EACH ROW EXECUTE FUNCTION nodes_search_vector_update();
        """))
        
        # 4. Create Index (Separate Command)
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS nodes_search_idx ON nodes USING GIN (search_vector);
        """))

    print("✅ Search Trigger and Index created successfully!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(create_search_trigger())