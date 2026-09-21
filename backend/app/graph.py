from app.models import Edge, Node, Task
from app.status import NodeInput, Status, compute_statuses


def top_level_tasks(node: Node) -> list[Task]:
    return [t for t in node.tasks if t.parent_task_id is None]


def compute_node_statuses(nodes: list[Node], edges: list[Edge]) -> dict[int, Status]:
    inputs = [
        NodeInput(
            id=n.id,
            total_tasks=len(top_level_tasks(n)),
            done_tasks=sum(1 for t in top_level_tasks(n) if t.done),
        )
        for n in nodes
    ]
    edge_pairs = [(e.source_node_id, e.target_node_id) for e in edges]
    return compute_statuses(inputs, edge_pairs)


def node_to_dict(node: Node, status: Status) -> dict:
    tasks = top_level_tasks(node)
    return {
        "id": node.id,
        "project_id": node.project_id,
        "title": node.title,
        "description": node.description,
        "position_x": node.position_x,
        "position_y": node.position_y,
        "status": status,
        "total_tasks": len(tasks),
        "done_tasks": sum(1 for t in tasks if t.done),
        "tasks": tasks,
    }


def project_percent_complete(nodes: list[Node]) -> float:
    total = sum(len(top_level_tasks(n)) for n in nodes)
    if total == 0:
        return 0.0
    done = sum(sum(1 for t in top_level_tasks(n) if t.done) for n in nodes)
    return round(done / total * 100, 1)


def next_step_titles(nodes: list[Node], statuses: dict[int, Status]) -> list[str]:
    return [n.title for n in nodes if statuses.get(n.id) == Status.NEXT]
