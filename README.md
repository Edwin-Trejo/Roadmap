# Roadmap

A personal dashboard for tracking progress across projects, visualized as a
roadmap graph: phases are nodes connected by directed edges (supporting
branches and merges), each node holds a task checklist, and each node's
status (Locked / Next Step / In Progress / Complete) is derived automatically
from task completion and its predecessors. Also has Table and Notes views for
non-graph ways to work with the same roadmap data, and an MCP server so
Claude can manage roadmaps directly.

## Stack

- **Backend:** FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL, JWT auth
- **Frontend:** React + TypeScript + Vite + Tailwind CSS, React Flow for the
  roadmap canvas, TanStack Query for data fetching
- **MCP server:** Python (`mcp` SDK + httpx), local-only stdio server for
  Claude Code/Desktop — see `mcp-server/README.md`
- **Hosting:** Docker Compose, intended to run on a Tailscale-only network

## Local development

### Backend

```sh
cd backend
python -m venv .venv
./.venv/Scripts/activate   # or `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
pytest                      # run the test suite

# run against a local Postgres, or point DATABASE_URL at SQLite for a quick spin:
export DATABASE_URL=sqlite:///./dev.db
export SECRET_KEY=dev-secret
export ROADMAP_USERNAME=edwin
export ROADMAP_PASSWORD=devpassword
uvicorn app.main:app --reload
```

The API docs are at `http://localhost:8000/docs`.

### Frontend

```sh
cd frontend
npm install
npm run test   # vitest
npm run dev    # http://localhost:5173
```

Set `VITE_API_BASE_URL` (e.g. in `frontend/.env`) if the backend isn't at
`http://localhost:8000`.

### MCP server (Claude integration)

See `mcp-server/README.md` for setup — lets Claude Code/Desktop create and
manage roadmaps directly through tool calls, running locally against your
existing backend over Tailscale.

## Running everything with Docker Compose

```sh
cp .env.example .env   # edit SECRET_KEY / ROADMAP_USERNAME / ROADMAP_PASSWORD
docker compose up --build
```

This starts Postgres, the FastAPI backend (migrations run automatically on
boot), and the built frontend, served on `http://localhost:4173`.

## Deploying

Run the same `docker-compose.yml` on a Proxmox LXC/VM with Docker installed,
install Tailscale on that container and on your phone, and reach the app via
the container's Tailscale hostname — no public ports required.
