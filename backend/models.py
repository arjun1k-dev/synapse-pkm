from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum 
from sqlalchemy.dialects.postgresql import TSVECTOR as TSVector
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from datetime import datetime
from typing import Optional
import uuid
import enum

class NodeType(str, enum.Enum):
    SUBJECT = "SUBJECT"
    TOPIC = "TOPIC"
    NOTE = "NOTE"
    SNIPPET = "SNIPPET"
    VIDEO = "VIDEO"

class Node(Base):
    __tablename__ = "nodes"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text, nullable=True)
    node_type: Mapped[NodeType] = mapped_column(SQLEnum(NodeType), default=NodeType.NOTE)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    #NEW : Search Vector for Full Text Search
    search_vector: Mapped[Optional[str]] = mapped_column(TSVector , nullable=True)

    # Graph relationships
    edges_out = relationship("Edge", foreign_keys="[Edge.source_id]", back_populates="source_node")
    edges_in = relationship("Edge", foreign_keys="[Edge.target_id]", back_populates="target_node")

class EdgeType(str, enum.Enum):
    PARENT_OF = "PARENT_OF"
    REFERENCE = "REFERENCE"
    PREREQUISITE = "PREREQUISITE"
    RELATED = "RELATED"

class Edge(Base):
    __tablename__ = "edges"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_id: Mapped[str] = mapped_column(ForeignKey("nodes.id" , ondelete="CASCADE"))
    target_id: Mapped[str] = mapped_column(ForeignKey("nodes.id" , ondelete="CASCADE"))
    relation: Mapped[EdgeType] = mapped_column(SQLEnum(EdgeType))
    
    source_node = relationship("Node", foreign_keys=[source_id], back_populates="edges_out")
    target_node = relationship("Node", foreign_keys=[target_id], back_populates="edges_in")