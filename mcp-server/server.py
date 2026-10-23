import os

from mcp.server.mcpserver import MCPServer
from mcp.server.transport_security import TransportSecuritySettings

from client import RoadmapClient

API_URL = os.environ["ROADMAP_API_URL"]
USERNAME = os.environ["ROADMAP_USERNAME"]
PASSWORD = os.environ["ROADMAP_PASSWORD"]

client = RoadmapClient(base_url=API_URL, username=USERNAME, password=PASSWORD)
server = MCPServer(name="roadmap")


def _strip_none(data: dict) -> dict:
    return {k: v for k, v in data.items() if v is not None}


@server.tool()
async def list_projects() -> list[dict]:
    """List every project (roadmap) with its overall completion % and current next-step node titles."""
    resp = await client.request("GET", "/projects")
    return resp.json()


@server.tool()
async def create_project(name: str, description: str | None = None) -> dict:
    """Create a new project (roadmap)."""
    resp = await client.request(
        "POST", "/projects", json=_strip_none({"name": name, "description": description})
    )
    return resp.json()


@server.tool()
async def update_project(
    project_id: int, name: str | None = None, description: str | None = None
) -> dict:
    """Rename a project or change its description."""
    resp = await client.request(
        "PUT", f"/projects/{project_id}", json=_strip_none({"name": name, "description": description})
    )
    return resp.json()


@server.tool()
async def delete_project(project_id: int) -> dict:
    """Permanently delete a project and everything in it (nodes, edges, tasks)."""
    await client.request("DELETE", f"/projects/{project_id}")
    return {"deleted": True, "project_id": project_id}


@server.tool()
async def get_roadmap(project_id: int) -> dict:
    """Get a project's full roadmap graph: every node (phase) with its tasks, subtasks,
    derived status (locked/next/in_progress/complete), and the edges connecting nodes."""
    resp = await client.request("GET", f"/projects/{project_id}/graph")
    return resp.json()


@server.tool()
async def create_node(
    project_id: int,
    title: str,
    description: str | None = None,
    position_x: float = 0,
    position_y: float = 0,
) -> dict:
    """Create a new node (phase/milestone) within a project."""
    resp = await client.request(
        "POST",
        f"/projects/{project_id}/nodes",
        json=_strip_none(
            {
                "title": title,
                "description": description,
                "position_x": position_x,
                "position_y": position_y,
            }
        ),
    )
    return resp.json()


@server.tool()
async def update_node(
    node_id: int,
    title: str | None = None,
    description: str | None = None,
    position_x: float | None = None,
    position_y: float | None = None,
) -> dict:
    """Rename a node, change its description, or reposition it on the canvas."""
    resp = await client.request(
        "PUT",
        f"/nodes/{node_id}",
        json=_strip_none(
            {
                "title": title,
                "description": description,
                "position_x": position_x,
                "position_y": position_y,
            }
        ),
    )
    return resp.json()


@server.tool()
async def delete_node(node_id: int) -> dict:
    """Delete a node and its tasks/subtasks. Also removes any edges connected to it."""
    await client.request("DELETE", f"/nodes/{node_id}")
    return {"deleted": True, "node_id": node_id}


@server.tool()
async def connect_nodes(project_id: int, source_node_id: int, target_node_id: int) -> dict:
    """Connect two nodes with a directed edge meaning "source leads to target" (what comes next).
    A node can have multiple outgoing edges (branches) or multiple incoming edges (merges)."""
    resp = await client.request(
        "POST",
        f"/projects/{project_id}/edges",
        json={"source_node_id": source_node_id, "target_node_id": target_node_id},
    )
    return resp.json()


@server.tool()
async def delete_edge(edge_id: int) -> dict:
    """Remove a connection between two nodes."""
    await client.request("DELETE", f"/edges/{edge_id}")
    return {"deleted": True, "edge_id": edge_id}


@server.tool()
async def add_task(node_id: int, title: str) -> dict:
    """Add a top-level task to a node."""
    resp = await client.request("POST", f"/nodes/{node_id}/tasks", json={"title": title})
    return resp.json()


@server.tool()
async def add_subtask(task_id: int, title: str) -> dict:
    """Add a subtask under an existing task (one level of nesting only). Once all of a
    task's subtasks are done, the parent task completes automatically."""
    resp = await client.request("POST", f"/tasks/{task_id}/subtasks", json={"title": title})
    return resp.json()


@server.tool()
async def update_task(task_id: int, title: str | None = None, done: bool | None = None) -> dict:
    """Rename a task/subtask or mark it done/not done. A task with subtasks has its
    done state derived automatically and can't be toggled directly."""
    resp = await client.request(
        "PUT", f"/tasks/{task_id}", json=_strip_none({"title": title, "done": done})
    )
    return resp.json()


@server.tool()
async def delete_task(task_id: int) -> dict:
    """Delete a task (and its subtasks, if any)."""
    await client.request("DELETE", f"/tasks/{task_id}")
    return {"deleted": True, "task_id": task_id}


def _main() -> None:
    transport = os.environ.get("MCP_TRANSPORT", "stdio")
    if transport == "stdio":
        server.run()
        return

    host = os.environ.get("MCP_HOST", "0.0.0.0")
    port = int(os.environ.get("MCP_PORT", "8001"))
    allowed_hosts = [h for h in os.environ.get("MCP_ALLOWED_HOSTS", "").split(",") if h]
    security = TransportSecuritySettings(allowed_hosts=allowed_hosts) if allowed_hosts else None
    server.run(transport="streamable-http", host=host, port=port, transport_security=security)


if __name__ == "__main__":
    _main()
