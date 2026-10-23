# Roadmap MCP Server

Lets Claude (Claude Code or Claude Desktop) create and manage roadmaps in
your self-hosted Roadmap app directly — create projects, add phases
(nodes), connect them, add tasks/subtasks, mark things done.

Runs as part of the same `docker-compose.yml` as the rest of the app, on
`roadmaptool`, reachable only over Tailscale — nothing is exposed beyond
that. It never touches node status directly (that stays fully auto-derived,
same rule the web app enforces) and doesn't touch annotations
(drawing/shapes aren't meaningful for an LLM to call a tool for).

## Running it (production — on roadmaptool)

It's defined as the `mcp` service in the root `docker-compose.yml`, built
from this directory's `Dockerfile`. `docker compose up --build -d` from the
repo root brings it up alongside `postgres`/`api`/`web`, listening on
`:8001` with the MCP endpoint at `/mcp`. It talks to `api` over the internal
Docker network (`http://api:8000`), using the same `ROADMAP_USERNAME` /
`ROADMAP_PASSWORD` from your `.env` that seeds the web app's login.

It validates the `Host` header on incoming requests (DNS-rebinding
protection) against `MCP_ALLOWED_HOSTS` in `.env` — set this to whatever
host:port Claude will actually connect through (default `roadmaptool:8001`).

**Claude Code / Claude Desktop config** — point at the running service, no
credentials needed client-side (the server already holds them):

```json
{
  "mcpServers": {
    "roadmap": {
      "type": "http",
      "url": "http://roadmaptool:8001/mcp"
    }
  }
}
```

Claude Code reads this from `.mcp.json` at the project root (not committed —
see `.mcp.json.example`). Claude Desktop uses the same `mcpServers` block in
`claude_desktop_config.json`. Restart Claude Code/Desktop after changing it.
Your Tailscale network needs to be connected for the connection to reach
roadmaptool, same as using the web app itself.

## Running it locally (development / quick iteration)

```sh
cd mcp-server
python -m venv .venv
./.venv/Scripts/activate   # or `source .venv/bin/activate` on macOS/Linux
pip install -e ".[dev]"
pytest                      # run the test suite
```

By default `server.py` runs over **stdio** (`MCP_TRANSPORT` unset), for
testing without touching the deployed container. To point Claude Code at a
local stdio instance instead of the remote one, use a `command`/`args`
entry instead of `type: http`:

```json
{
  "mcpServers": {
    "roadmap": {
      "command": "/absolute/path/to/mcp-server/.venv/Scripts/python.exe",
      "args": ["/absolute/path/to/mcp-server/server.py"],
      "env": {
        "ROADMAP_API_URL": "http://roadmaptool:8000",
        "ROADMAP_USERNAME": "edwin",
        "ROADMAP_PASSWORD": "your-password"
      }
    }
  }
}
```

To run the HTTP transport locally (e.g. to test the container path without
Docker), set `MCP_TRANSPORT=streamable-http` before running `server.py`.

## Available tools

| Tool | What it does |
|---|---|
| `list_projects` | List all projects with completion % and current next steps |
| `create_project` / `update_project` / `delete_project` | Manage a project |
| `get_roadmap` | Full graph for a project: nodes, their tasks/subtasks and derived status, and the edges between them |
| `create_node` / `update_node` / `delete_node` | Manage a phase |
| `connect_nodes` / `delete_edge` | Connect/disconnect phases (what leads to what) |
| `add_task` / `add_subtask` / `update_task` / `delete_task` | Manage tasks and subtasks |
