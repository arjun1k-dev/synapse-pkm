
# 🧠 Synapse

> **A Graph-Based Personal Knowledge Management System for Engineers**
> 
> Transform fragmented notes into an interconnected semantic network. Built for deep learners who think in connections, not folders.

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-FCD34D?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📋 Table of Contents

- [What is Synapse?](#-what-is-synapse)
- [Why Graph-Based PKM?](#-why-graph-based-pkm)
- [System Architecture](#-system-architecture)
- [Technology Deep Dive](#-technology-deep-dive)
- [Quick Start Guide](#-quick-start-guide)
- [Development Setup](#-development-setup)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 What is Synapse?

**Synapse** is a **Personal Knowledge Management (PKM)** system that models information as a **graph network** rather than a hierarchical folder structure. 

### The Core Philosophy

Traditional note-taking tools force you into rigid hierarchies:
```
📁 Engineering/
   📁 Computer Science/
      📁 Algorithms/
         📄 Sorting.md
```

**Synapse** treats every piece of knowledge as a **Node** that can connect to any other node through **Edges**:

```
[Algorithms] ──PARENT_OF──► [Sorting Algorithms]
     │
     └──RELATED_TO──► [Data Structures]
            │
            └──REFERENCE──► [Big O Notation]
```

This mirrors how human cognition actually works — through **associative connections** rather than rigid categorization.

### Key Capabilities

| Feature | Description | Technology |
|---------|-------------|------------|
| **🔍 Semantic Search** | Full-text search with relevance ranking (Title weighted higher than Content) | PostgreSQL TSVector + GIN Index |
| **🕸️ Interactive Graph** | Visualize knowledge connections; drag to create relationships | React Flow + Canvas API |
| **📺 Video Integration** | Auto-fetch YouTube metadata and thumbnails | Web Scraping (BeautifulSoup) |
| **⚡ Real-time API** | Async Python backend for concurrent request handling | FastAPI + asyncpg |
| **🐳 One-Command Deploy** | Complete containerized stack | Docker Compose |

---

## 🧠 Why Graph-Based PKM?

### The Problem with Hierarchies

**Cognitive Overhead:** When you file a note about "Recursion," do you put it under "Algorithms," "Functional Programming," or "Problem Solving Techniques"? Hierarchies force premature categorization.

**Discovery Friction:** Finding related concepts requires navigating up and down trees. You miss cross-domain connections (e.g., how recursion patterns appear in both code and mathematical proofs).

### The Graph Solution

**Non-linear Organization:** A node can have multiple parents, children, and lateral relationships simultaneously.

**Emergent Structure:** Connections reveal patterns you didn't explicitly plan. The graph becomes a **mirror of your understanding**, not a pre-defined taxonomy.

**Context Preservation:** When reviewing a node, you see its entire neighborhood — what led to it, what it enables, and what relates laterally.

---

## 🏗️ System Architecture

Synapse follows a **Distributed Monorepo** pattern — separate services that communicate over HTTP but live in one repository for atomic development.

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Next.js    │  │   React      │  │   Tailwind   │       │
│  │   (App       │  │   Flow       │  │   CSS        │       │
│  │   Router)    │  │ (Graph UI)   │  │ (Styling)    │       │
│  └──────┬───────┘  └──────────────┘  └──────────────┘       │
│         │                                                   │
│         │ HTTP/REST (Fetch API)                             │
│         ▼                                                   │
├─────────────────────────────────────────────────────────────┤
│                   APPLICATION LAYER                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              FastAPI (Python 3.12)                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │   Pydantic  │  │   Async     │  │   CORS      │    │  │
│  │  │  Validation │  │   Endpoints │  │ Middleware  │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                 │
│                           │ SQL (asyncpg)                   │
│                           ▼                                 │
├─────────────────────────────────────────────────────────────┤
│                     DATA LAYER                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           PostgreSQL 15 (Containerized)             │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │    Nodes    │  │    Edges    │  │  TSVector   │  │    │
│  │  │   Table     │  │   Table     │  │  GIN Index  │  │    │
│  │  │ (Knowledge) │  │(Relations)  │  │  (Search)   │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Monorepo over Microservices** | V1 focuses on velocity. Single repo enables atomic commits across frontend/backend. Kubernetes complexity deferred to V2. |
| **SQL (Postgres) over NoSQL** | Knowledge is inherently relational. Graph traversals in NoSQL require application-level joins — slow and error-prone. |
| **Server-Side Search** | Client-side search downloads entire dataset. Postgres FTS with GIN index scales to millions of rows without browser memory issues. |
| **ASGI/Async over WSGI/Sync** | `asyncpg` allows non-blocking DB queries. Critical for concurrent graph operations (fetching node + edges simultaneously). |

---

## 🔬 Technology Deep Dive

### Backend Stack

#### **FastAPI — The Async Web Framework**

**Why not Flask or Django?**
- **Performance:** FastAPI is built on Starlette and Pydantic. Benchmarks show 2-3x throughput vs Flask under load.
- **Type Safety:** Automatic request/response validation via Python type hints. Invalid JSON returns 422 with detailed error messages — no manual validation code needed.
- **Async Native:** First-class `async/await` support. Your database queries don't block the event loop.

**Key Patterns Used:**
```python
# Dependency Injection for DB Sessions
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session  # Session automatically closes after request

@app.post("/nodes/", response_model=NodeResponse)
async def create_node(
    node: NodeCreate, 
    db: AsyncSession = Depends(get_db)  # Injected session
):
    # Database operations are non-blocking
    db.add(db_node)
    await db.commit()
```

#### **SQLAlchemy 2.0 — Modern Async ORM**

**The 2.0 Style (New Syntax):**
```python
class Node(Base):
    __tablename__ = "nodes"
    
    # Mapped[] provides full type inference
    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    
    # Relationships with explicit foreign key specification
    edges_out: Mapped[List["Edge"]] = relationship(
        "Edge", 
        foreign_keys="[Edge.source_id]",
        back_populates="source_node"
    )
```

**Why Async ORM Matters:**
Traditional ORMs (SQLAlchemy 1.x, Django ORM) use blocking I/O. Under load, each database query freezes the entire thread. With `asyncpg` + SQLAlchemy 2.0:
- One user fetching a large graph doesn't delay another user's search
- Connection pooling is handled efficiently by the async event loop

#### **PostgreSQL Full-Text Search (FTS)**

**Why not Elasticsearch?**
For V1, Postgres native FTS eliminates infrastructure complexity (no additional containers, no JVM, no cluster management). It's surprisingly capable:

**How It Works:**
1. **Tokenization:** `to_tsvector('english', 'Running runs runner')` → `'run':1,2,3`
2. **Weighting:** `setweight(to_tsvector(title), 'A')` + `setweight(to_tsvector(content), 'B')`
   - 'A' = Title matches (highest relevance)
   - 'B' = Content matches
3. **Indexing:** GIN (Generalized Inverted Index) allows `@@` (match) operations in milliseconds

**Automation via Triggers:**
```sql
-- This trigger fires BEFORE INSERT OR UPDATE
CREATE TRIGGER tsvectorupdate 
BEFORE INSERT OR UPDATE ON nodes
FOR EACH ROW EXECUTE FUNCTION nodes_search_vector_update();
```
The search index stays synchronized automatically — zero application code required.

### Frontend Stack

#### **Next.js 14 (App Router)**

**App Router vs Pages Router:**
- **Server Components:** Default components render on the server. Fetch data directly in the component without `useEffect` waterfalls.
- **Streaming:** UI streams to the browser progressively. Slow database queries don't block the entire page.
- **Nested Layouts:** Shared UI (navigation, sidebars) persists across route changes without remounting.

**Dynamic Route Handling:**
```typescript
// app/subjects/[id]/page.tsx
export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);  // React 19 'use' API unwraps the Promise
  // Data fetching happens here...
}
```

#### **React Flow — Interactive Graph Visualization**

**Canvas vs SVG:**
React Flow uses HTML5 Canvas for performance (can render 1000+ nodes smoothly) with React-friendly abstractions.

**Key Integration Points:**
- **`onConnect`:** Callback fires when user drags between connection handles. Sends POST to `/edges/` to persist relationship.
- **`useNodesState`/`useEdgesState`:** Hooks manage positions, selections, and viewport.
- **Custom Nodes:** Styled components that render your specific data (title, type badges, action buttons).

#### **State Management Strategy**

**No Redux/Zustand needed** — React 18+ features cover the use case:

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| `useState` | Local UI state (form inputs, modals) | `const [query, setQuery] = useState('')` |
| `useEffect` | Side effects (data fetching on mount) | `useEffect(() => { fetchNodes() }, [])` |
| Server Components | Initial data loading | Fetch directly in component body |
| URL State | Shareable search queries | `?q=algorithms` parsed via `useSearchParams` |

---

## 🚀 Quick Start Guide

### Prerequisites

**Required Software:**
- **Docker Desktop** 4.25+ ([Download](https://www.docker.com/products/docker-desktop/))
  - *Why:* We containerize PostgreSQL, Python, and Node.js. No "works on my machine" issues.
- **Git** 2.40+ ([Download](https://git-scm.com/downloads))
- **4GB RAM** minimum (8GB recommended for smooth operation)

**Verify Installation:**
```bash
docker --version  # Should show 24.0.0 or higher
docker-compose --version  # Should show 2.20.0 or higher
git --version
```

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/SkyArjun99/synapse.git
cd synapse
```

**What you're getting:**
- `backend/` — Python FastAPI application
- `frontend/` — Next.js React application  
- `docker-compose.yml` — Orchestration configuration
- `.env.example` — Template for environment variables

#### 2. Configure Environment Variables

```bash
cp .env.example .env
```

**Edit `.env` with your preferred text editor:**

```bash
# Database Configuration
POSTGRES_USER=synapse_user
POSTGRES_PASSWORD=your_secure_password_here  # Change this!
POSTGRES_DB=synapse_db
DATABASE_URL=postgresql+asyncpg://synapse_user:your_secure_password_here@db:5432/synapse_db

# API Configuration
NEXT_PUBLIC_API_URL=http://backend:8000  # Internal Docker network URL
```

**Security Note:** Never commit `.env` to Git. It's already in `.gitignore`, but verify before your first commit.

#### 3. Launch the Application Stack

```bash
docker-compose up --build
```

**What happens now:**
1. **Build Phase (2-5 minutes):**
   - Docker downloads Python 3.12 and Node 20 base images
   - Installs dependencies (`requirements.txt`, `package.json`)
   - Compiles frontend for production

2. **Database Initialization:**
   - PostgreSQL container starts
   - Health check verifies readiness (`pg_isready`)
   - Backend waits for healthy DB, then runs migrations

3. **Service Startup:**
   - Backend available at `http://localhost:8000`
   - Frontend available at `http://localhost:3000`

**First-Time Verification:**
```bash
# In a new terminal, check container status
docker-compose ps

# Expected output:
# NAME                STATUS          PORTS
# synapse-db-1        healthy         5432/tcp
# synapse-backend-1   Up              0.0.0.0:8000->8000/tcp
# synapse-frontend-1  Up              0.0.0.0:3000->3000/tcp
```

#### 4. Initialize the Database Schema

```bash
# Run database migrations in the backend container
docker-compose exec backend python -m backend.init_db
```

**What this does:**
- Creates `nodes` and `edges` tables
- Sets up Full-Text Search triggers
- **Warning:** This drops existing tables if re-run. Use only for fresh setup.

#### 5. Access the Application

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend App** | [http://localhost:3000](http://localhost:3000) | Main user interface |
| **API Documentation** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive Swagger UI |
| **Alternative API Docs** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | ReDoc interface |

**First Steps in the App:**
1. Create a **Subject** node (e.g., "Algorithms")
2. Create a **Topic** node (e.g., "Sorting")
3. Drag a connection from Subject to Topic in the Graph view
4. Search for "sort" in the Dashboard — watch FTS ranking prioritize title matches

---

## 🛠️ Development Setup

For active development (hot-reloading, debugging), run services outside Docker.

### Backend Development

#### 1. Python Environment Setup

```bash
cd backend

# Create isolated Python environment
python3.12 -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows PowerShell)
venv\Scripts\Activate.ps1
```

**Why virtualenv?** Isolates project dependencies from system Python. Prevents version conflicts between different projects.

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Key Dependencies:**
- `fastapi` — Web framework
- `sqlalchemy[asyncio]` — Async ORM
- `asyncpg` — Async PostgreSQL driver
- `pydantic` — Data validation
- `beautifulsoup4` — HTML parsing for scraping
- `python-dotenv` — Environment variable management

#### 3. Database Setup (Local PostgreSQL)

**Option A: Local Postgres Installation**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-15

# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Create database and user
createdb synapse_dev
createuser -P synapse_user  # Set password when prompted
```

**Option B: Docker Postgres (Recommended for consistency)**
```bash
docker run -d \
  --name synapse-postgres \
  -e POSTGRES_USER=synapse_user \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=synapse_dev \
  -p 5432:5432 \
  postgres:15-alpine
```

#### 4. Environment Configuration

Create `backend/.env`:
```bash
DATABASE_URL=postgresql+asyncpg://synapse_user:devpassword@localhost:5432/synapse_dev
```

#### 5. Run Development Server

```bash
# Must run from project root (not backend/ folder)
uvicorn backend.main:app --reload --port 8000
```

**The `--reload` flag:** Automatically restarts server when Python files change. Essential for development velocity.

**Verify:** Visit `http://localhost:8000/docs` — you should see the Swagger UI.

---

### Frontend Development

#### 1. Node.js Environment Setup

```bash
cd frontend

# Install dependencies (we use pnpm for speed)
pnpm install

# Or with npm if pnpm unavailable
npm install
```

**Why pnpm?** 
- **Disk Efficient:** Uses hard links/symlinks instead of copying `node_modules`
- **Fast:** Parallel downloads and better caching
- **Strict:** Prevents phantom dependency issues (using packages not in `package.json`)

#### 2. Environment Configuration

Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Critical:** `NEXT_PUBLIC_` prefix exposes the variable to browser JavaScript. Without it, the frontend couldn't call the backend.

#### 3. Run Development Server

```bash
pnpm dev
```

**Features you get:**
- **Hot Module Replacement (HMR):** Code changes reflect instantly without full page reload
- **Source Maps:** Debug TypeScript directly in browser DevTools
- **Error Overlay:** Runtime errors show in fullscreen overlay with stack traces

**Verify:** Visit `http://localhost:3000` — should connect to backend at port 8000.

---

## 📁 Project Structure

```
synapse/
├── 📂 backend/                    # Python FastAPI Application
│   ├── 📄 main.py                 # API routes, Pydantic schemas, business logic
│   ├── 📄 models.py               # SQLAlchemy ORM definitions (Node, Edge)
│   ├── 📄 database.py             # Async engine, session factory, Base class
│   ├── 📄 triggers.py             # PostgreSQL FTS trigger functions
│   ├── 📄 init_db.py              # Database initialization script
│   ├── 📄 requirements.txt        # Python dependencies
│   ├── 📄 Dockerfile              # Container build instructions
│   └── 📂 app/                    # (Alternative structure - optional)
│
├── 📂 frontend/                   # Next.js React Application
│   ├── 📂 app/                    # Next.js App Router (Next.js 13+)
│   │   ├── 📄 page.tsx            # Root page (Search Dashboard)
│   │   ├── 📄 layout.tsx          # Root layout (providers, metadata)
│   │   ├── 📂 map/                # Graph visualization route
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 watchlist/          # Video grid route
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 subjects/           # Dynamic subject pages
│   │   │   └── 📂 [id]/           # [id] = dynamic route parameter
│   │   │       └── 📄 page.tsx
│   │   └── 📂 nodes/              # Node editing routes
│   │       └── 📂 [id]/
│   │           └── 📂 edit/
│   │               └── 📄 page.tsx
│   ├── 📂 components/             # Reusable React components
│   │   ├── 📄 SearchBar.tsx
│   │   ├── 📄 NodeCard.tsx
│   │   ├── 📄 GraphCanvas.tsx
│   │   └── 📄 VideoCard.tsx
│   ├── 📂 lib/                    # Utility functions
│   │   └── 📄 api.ts              # Fetch wrappers, API types
│   ├── 📂 types/                  # TypeScript type definitions
│   │   └── 📄 index.ts
│   ├── 📄 package.json            # Node dependencies
│   ├── 📄 tailwind.config.ts      # Tailwind customization
│   ├── 📄 next.config.js          # Next.js configuration
│   └── 📄 Dockerfile              # Multi-stage container build
│
├── 📄 docker-compose.yml          # Multi-container orchestration
├── 📄 .env.example                # Environment variable template
├── 📄 .gitignore                  # Git exclusion patterns
└── 📄 README.md                   # This file
```

---

## 📚 API Documentation

### Core Endpoints

#### **Nodes** (Knowledge Units)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/nodes/?q={query}` | Search nodes (omit `q` for all) | — | `NodeResponse[]` |
| `GET` | `/nodes/{id}` | Get specific node | — | `NodeResponse` |
| `POST` | `/nodes/` | Create new node | `NodeCreate` | `NodeResponse` |
| `PUT` | `/nodes/{id}` | Update node | `NodeCreate` | `NodeResponse` |
| `DELETE` | `/nodes/{id}` | Delete node | — | `{"message": "Deleted"}` |

**Pydantic Schemas:**
```python
class NodeCreate(BaseModel):
    title: str                    # Required, max 200 chars
    content: Optional[str] = None # Optional long text
    node_type: NodeType = NodeType.NOTE  # Enum: SUBJECT/TOPIC/NOTE/VIDEO/SNIPPET

class NodeResponse(BaseModel):
    id: str                       # UUID v4
    title: str
    content: Optional[str]
    node_type: str
    created_at: datetime          # ISO 8601 format in JSON
```

#### **Edges** (Relationships)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/edges/` | List all edges | — | `EdgeResponse[]` |
| `POST` | `/edges/` | Create connection | `EdgeCreate` | `EdgeResponse` |
| `GET` | `/nodes/{id}/connections` | Get edges from node | — | `EdgeResponse[]` |

**Edge Schema:**
```python
class EdgeCreate(BaseModel):
    source_id: str    # UUID of origin node
    target_id: str    # UUID of destination node
    relation: EdgeType # Enum: PARENT_OF/REFERENCE/PREREQUISITE/RELATED
```

#### **Utilities**

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/preview/` | Scrape URL metadata | `url: str` (form) | `{"title": "...", "image": "..."}` |

**Usage Example:**
```bash
curl -X POST http://localhost:8000/preview/ \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

---

## 🔧 Troubleshooting

### Docker Issues

#### **Port Already in Use**
**Error:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:5432: bind: address already in use
```

**Diagnosis:** You have another PostgreSQL instance running (possibly system-installed Postgres or another Docker container).

**Solutions:**

*Option 1 — Stop existing Postgres:*
```bash
# Linux/Mac
sudo systemctl stop postgresql

# Or find and kill the process
sudo lsof -i :5432
sudo kill -9 <PID>
```

*Option 2 — Change mapped port:*
Edit `docker-compose.yml`:
```yaml
services:
  db:
    ports:
      - "5433:5432"  # Use 5433 on host instead
```

#### **Container Exits Immediately**
**Check logs:**
```bash
docker-compose logs backend
docker-compose logs db
```

**Common causes:**
- Database connection string incorrect (wrong password in `.env`)
- Database not ready before backend starts (should be handled by `depends_on` + healthcheck, but verify)

**Force clean restart:**
```bash
docker-compose down -v  # -v removes volumes (DELETES DATA)
docker-compose up --build
```

---

### Database Connection Issues

#### **Backend: `Connection refused`**
**Error:**
```
sqlalchemy.exc.OperationalError: (asyncpg.exceptions.ConnectionRefusedError) 
connection refused
```

**Diagnosis:** Backend can't reach database.

**Checklist:**
1. **Is DB container running?** `docker-compose ps` should show `healthy`
2. **Is DATABASE_URL correct?** In Docker, use `db` as hostname (service name), not `localhost`
   - ❌ `postgresql+asyncpg://user:pass@localhost:5432/db` (wrong inside Docker)
   - ✅ `postgresql+asyncpg://user:pass@db:5432/db` (correct for Docker network)
3. **Did you create the `.env` file?** `cp .env.example .env` is easy to forget

---

### Frontend Issues

#### **"Failed to fetch" in Browser Console**
**Diagnosis:** Frontend can't reach backend API.

**Debugging steps:**

1. **Check if backend is accessible:**
   ```bash
   curl http://localhost:8000/nodes/
   ```
   - If this works, the issue is frontend→backend communication inside Docker
   - If this fails, backend isn't running or crashed

2. **Verify `NEXT_PUBLIC_API_URL`:**
   - In Docker: Must be `http://backend:8000` (service name resolution)
   - Local dev: Must be `http://localhost:8000`

3. **CORS errors?** Check backend logs for CORS preflight failures. FastAPI CORS middleware should allow all origins in dev, but verify:
   ```python
   # backend/main.py
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # Restrict in production!
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

### Python Import Errors

#### **`ModuleNotFoundError: No module named 'backend'`**
**Cause:** Running Python from inside `backend/` folder instead of project root.

**Wrong:**
```bash
cd backend
python main.py  # or uvicorn main:app
```

**Correct:**
```bash
# From project root (synapse/)
uvicorn backend.main:app --reload
```

**Why:** Python's import system looks for `backend/` as a package. When you're inside `backend/`, imports like `from backend.database import ...` fail because `backend` isn't in the Python path.

---

## 🤝 Contributing

We welcome contributions from developers of all levels. Whether it's bug fixes, features, or documentation improvements — every PR matters.

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/synapse.git
   cd synapse
   ```
3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/SkyArjun99/synapse.git
   ```

### Development Workflow

#### Branch Naming
```bash
git checkout -b feature/semantic-search-enhancement
git checkout -b fix/edge-creation-race-condition
git checkout -b docs/api-examples
```

**Prefixes:**
- `feature/` — New functionality
- `fix/` — Bug fixes
- `docs/` — Documentation only
- `refactor/` — Code restructuring without behavior change

#### Commit Convention
We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add vector search endpoint for semantic queries"
git commit -m "fix: handle null content in search vector trigger"
git commit -m "docs: add troubleshooting section for Docker ports"
```

**Types:**
- `feat:` — New feature (minor version bump)
- `fix:` — Bug fix (patch version bump)
- `docs:` — Documentation changes
- `style:` — Formatting, missing semicolons, etc (no code change)
- `refactor:` — Code restructuring
- `test:` — Adding or correcting tests
- `chore:` — Build process, dependencies, etc

#### Before Submitting

**1. Sync with upstream:**
```bash
git fetch upstream
git rebase upstream/main
```

**2. Run quality checks:**

*Backend:*
```bash
cd backend
black .              # Format code
flake8 .             # Lint (if configured)
pytest               # Run tests (when test suite added)
```

*Frontend:*
```bash
cd frontend
pnpm lint            # ESLint check
pnpm type-check      # TypeScript validation (if configured)
pnpm build           # Ensure production build succeeds
```

**3. Update documentation** if you changed APIs, environment variables, or setup steps.

#### Pull Request Process

1. **Push to your fork:**
   ```bash
   git push origin feature/your-branch-name
   ```

2. **Open PR on GitHub** against `main` branch

3. **Fill out the PR template:**
   - What changes were made?
   - Why were they needed?
   - How was it tested?
   - Screenshots (for UI changes)

4. **Code Review:** Maintainers will review within 48 hours. Address feedback promptly.

5. **Merge:** Squash and merge once approved. Your contribution becomes part of the project history!

---

### Contribution Ideas

**Good First Issues:**
- Add input validation for URL scraping (handle non-YouTube sites better)
- Improve error messages in the frontend (toast notifications instead of console logs)
- Add keyboard shortcuts for graph navigation (arrow keys, delete for edges)

**Feature Requests (Check Issues Tab):**
- Export graph to PNG/PDF
- Dark/light theme toggle
- Mobile-responsive graph controls
- Batch node creation from Markdown import

**Documentation:**
- Video tutorial walkthrough
- Architecture decision records (ADRs)
- Deployment guides for AWS/GCP/Azure

---

## 🗺️ Roadmap

### Version 2.0 — Semantic Intelligence
- **Vector Embeddings:** Integrate OpenAI or open-source embeddings (all-MiniLM-L6-v2) for semantic similarity search
- **Hybrid Search:** Combine keyword FTS + vector similarity for best-of-both-worlds retrieval
- **Auto-Tagging:** LLM-based automatic node classification and relationship suggestions

### Version 2.5 — Collaboration
- **Multi-User Support:** OAuth2 (Google/GitHub) authentication
- **Real-time Sync:** WebSocket-based collaborative editing
- **Sharing:** Public/private graph sharing with view permissions

### Version 3.0 — Learning Optimization
- **Spaced Repetition:** Algorithmic resurfacing of nodes based on review history
- **Learning Paths:** Automated curriculum generation from graph structure
- **Progress Analytics:** Dashboard showing knowledge coverage and weak areas

---

## 📄 License

Synapse is released under the **MIT License**.

```
MIT License

Copyright (c) 2026 SkyArjun99

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Commercial Use:** Permitted. Build your own knowledge SaaS if you wish.  
**Attribution:** Appreciated but not legally required. A star on GitHub is the best thank you!

---

## 🙏 Acknowledgments

- **FastAPI** team for the incredible developer experience
- **React Flow** maintainers for making graph visualization accessible
- **PostgreSQL** community for the rock-solid FTS capabilities
- Contributors and early testers who shaped V1.0

---

**Built with ❤️ by [SkyArjun99](https://github.com/SkyArjun99)**

> *"The mind is not a vessel to be filled, but a fire to be kindled — and fires spread through connections."*
```

