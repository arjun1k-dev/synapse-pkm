from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from backend.database import get_db
from backend.models import Node, Edge, NodeType, EdgeType
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Synapse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for local dev)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
class NodeCreate(BaseModel):
    title: str
    content: Optional[str] = None
    node_type: NodeType = NodeType.NOTE

class NodeResponse(BaseModel):
    id: str
    title: str
    content: Optional[str]
    node_type: str
    created_at: datetime
    class Config:
        from_attributes = True
# Add this inside main.py

class EdgeCreate(BaseModel):
    source_id: str   # The ID of the node you are connecting FROM
    target_id: str   # The ID of the node you are connecting TO
    relation: EdgeType

class EdgeResponse(BaseModel):
    id: str
    source_id: str
    target_id: str
    relation: str
    class Config:
        from_attributes = True
# --- Node Endpoints ---

@app.post("/nodes/", response_model=NodeResponse)
async def create_node(node: NodeCreate, db: AsyncSession = Depends(get_db)):
    db_node = Node(title=node.title, content=node.content, node_type=node.node_type)
    db.add(db_node)
    await db.commit()
    await db.refresh(db_node)
    return db_node

@app.get("/nodes/", response_model=List[NodeResponse])
async def list_nodes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Node))
    return result.scalars().all()


# --- Delete Endpoint (Cleanup) ---

@app.delete("/nodes/{node_id}")
async def delete_node(node_id: str, db: AsyncSession = Depends(get_db)):
    # 1. Find the node
    result = await db.execute(select(Node).where(Node.id == node_id))
    node = result.scalar_one_or_none()

    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # 2. Delete the node
    await db.delete(node)
    await db.commit()
    
    return {"message": "Node deleted successfully"}
# --- Edge Endpoints ---

@app.post("/edges/", response_model=EdgeResponse)
async def create_edge(edge: EdgeCreate, db: AsyncSession = Depends(get_db)):
    # 1. Verify that both nodes actually exist before creating a link
    source_result = await db.execute(select(Node).where(Node.id == edge.source_id))
    source_node = source_result.scalar_one_or_none()
    
    target_result = await db.execute(select(Node).where(Node.id == edge.target_id))
    target_node = target_result.scalar_one_or_none()

    if not source_node or not target_node:
        raise HTTPException(status_code=404, detail="One or both nodes not found")

    # 2. Create the connection
    db_edge = Edge(
        source_id=edge.source_id,
        target_id=edge.target_id,
        relation=edge.relation
    )
    db.add(db_edge)
    await db.commit()
    await db.refresh(db_edge)
    return db_edge

@app.get("/nodes/{node_id}/connections", response_model=List[EdgeResponse])
async def get_node_connections(node_id: str, db: AsyncSession = Depends(get_db)):
    # Find all edges where this node is the source
    result = await db.execute(select(Edge).where(Edge.source_id == node_id))
    return result.scalars().all()

