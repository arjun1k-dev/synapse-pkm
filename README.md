
<div align="center">
  <img src="./svgs/header.svg" width="100%" alt="Synapse Header"/>
</div>

<br/>

<div align="center">
  <img src="./svgs/badges-bar.svg" width="100%" alt="Badges"/>
</div>

<br/>

<div align="center">
  <img src="./svgs/toc-divider.svg" width="100%" alt=""/>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
  <img src="./svgs/toc-item-1.svg" width="100%" alt="What is Synapse"/>
  <img src="./svgs/toc-item-2.svg" width="100%" alt="Why Graph PKM"/>
  <img src="./svgs/toc-item-3.svg" width="100%" alt="Architecture"/>
  <img src="./svgs/toc-item-4.svg" width="100%" alt="Tech Deep Dive"/>
  <img src="./svgs/toc-item-5.svg" width="100%" alt="Quick Start"/>
  <img src="./svgs/toc-item-6.svg" width="100%" alt="Dev Setup"/>
  <img src="./svgs/toc-item-7.svg" width="100%" alt="Structure"/>
  <img src="./svgs/toc-item-8.svg" width="100%" alt="API"/>
  <img src="./svgs/toc-item-9.svg" width="100%" alt="Troubleshoot"/>
</div>

<br/>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
  <img src="./svgs/what-is-synapse.svg" width="100%" alt="What is Synapse"/>
  <img src="./svgs/core-philosophy.svg" width="100%" alt="Core Philosophy"/>
</div>

<br/>

<div align="center">
  <img src="./svgs/features-table-header.svg" width="100%" alt="Features"/>
</div>

| Feature | Description | Technology |
|---------|-------------|------------|
| **🔍 Semantic Search** | Full-text search with relevance ranking (Title weighted higher than Content) | PostgreSQL TSVector + GIN Index |
| **🕸️ Interactive Graph** | Visualize knowledge connections; drag to create relationships | React Flow + Canvas API |
| **📺 Video Integration** | Auto-fetch YouTube metadata and thumbnails | Web Scraping (BeautifulSoup) |
| **⚡ Real-time API** | Async Python backend for concurrent request handling | FastAPI + asyncpg |
| **🐳 One-Command Deploy** | Complete containerized stack | Docker Compose |

<br/>

<div align="center">
  <img src="./svgs/why-graph-section.svg" width="100%" alt="Why Graph PKM"/>
</div>

<!-- Keep the plain text for the graph explanation, no huge SVG needed here -->
> **Synapse** treats every piece of knowledge as a **Node** that can connect to any other node through **Edges**. This mirrors how human cognition works — through associative connections.

<br/>

<div align="center">
  <img src="./svgs/system-architecture-header.svg" width="100%" alt="Architecture Header"/>
</div>

<br/>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
  <img src="./svgs/architecture-detail.svg" width="100%" alt="Layered Architecture"/>
  <img src="./svgs/architecture-decisions.svg" width="100%" alt="Architectural Decisions"/>
</div>

<div align="center">
  <img src="./svgs/tech-deep-dive-header.svg" width="100%" alt="Tech Deep Dive"/>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
  <img src="./svgs/fastapi-card.svg" width="100%" alt="FastAPI"/>
  <img src="./svgs/sqlalchemy-card.svg" width="100%" alt="SQLAlchemy"/>
  <img src="./svgs/postgres-fts-card.svg" width="100%" alt="Full-Text Search"/>
  <img src="./svgs/nextjs-card.svg" width="100%" alt="Next.js"/>
  <img src="./svgs/react-flow-card.svg" width="100%" alt="React Flow"/>
  <img src="./svgs/state-mgmt-card.svg" width="100%" alt="State Management"/>
</div>

<br/>

<div align="center">
  <img src="./svgs/quick-start-header.svg" width="100%" alt="Quick Start"/>
</div>

### Prerequisites
- **Docker Desktop** 4.25+
- **Git** 2.40+
- **4GB RAM** minimum (8GB recommended)

### Step-by-Step Setup

**1. Clone the Repository**
```bash
git clone https://github.com/arjun1k-dev/synapse-pkm.git
cd synapse-pkm
```

**2. Configure Environment Variables**
```bash
cp .env.example .env
```
Edit `.env` with your database credentials.

**3. Launch the Application Stack**
```bash
docker-compose up --build
```
*Backend at `http://localhost:8000`, Frontend at `http://localhost:3000`*

**4. Initialize the Database Schema**
```bash
docker-compose exec backend python -m backend.init_db
```

<br/>

<div align="center">
  <img src="./svgs/development-setup-header.svg" width="100%" alt="Development Setup"/>
</div>

```bash
# Backend
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000

# Frontend
cd frontend
pnpm install
pnpm dev
```

<br/>

<div align="center">
  <img src="./svgs/project-structure-animated.svg" width="100%" alt="Project Structure"/>
</div>

<br/>

<div align="center">
  <img src="./svgs/api-docs-header.svg" width="100%" alt="API Documentation"/>
</div>

#### Nodes

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/nodes/?q={query}` | Search nodes | — | `NodeResponse[]` |
| `GET` | `/nodes/{id}` | Get specific node | — | `NodeResponse` |
| `POST` | `/nodes/` | Create new node | `NodeCreate` | `NodeResponse` |
| `PUT` | `/nodes/{id}` | Update node | `NodeCreate` | `NodeResponse` |
| `DELETE` | `/nodes/{id}` | Delete node | — | `{"message": "Deleted"}` |

#### Edges

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/edges/` | List all edges | — | `EdgeResponse[]` |
| `POST` | `/edges/` | Create connection | `EdgeCreate` | `EdgeResponse` |
| `GET` | `/nodes/{id}/connections` | Get edges from node | — | `EdgeResponse[]` |

<br/>

<div align="center">
  <img src="./svgs/troubleshooting-divider.svg" width="100%" alt="Troubleshooting"/>
</div>

*All troubleshooting steps remain as text, e.g.:*

**Port Already in Use**
```bash
sudo systemctl stop postgresql
```

**Backend: `Connection refused`** – verify `DATABASE_URL` uses `db` as hostname inside Docker.

<br/>

<div align="center">
  <img src="./svgs/contributing-header.svg" width="100%" alt="Contributing"/>
</div>


<br/>

<div align="center">
  <img src="./svgs/roadmap-timeline.svg" width="100%" alt="Roadmap"/>
</div>

<br/>

<div align="center">
  <img src="./svgs/footer-license.svg" width="100%" alt="License"/>
</div>

---

**Built with ❤️ by [arjun1k-dev](https://github.com/arjun1k-dev)**

> *"The mind is not a vessel to be filled, but a fire to be kindled — and fires spread through connections."*
