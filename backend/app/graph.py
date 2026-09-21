from app.models import Edge, Node
from app.status import NodeInput, Status, compute_statuses


def compute_node_statuses(nodes: list[Node], edges: list[Edge]) -> dict[int, Status]:
    inputs = [
        NodeInput(
            id=n.id,
            total_tasks=len(n.tasks),
            done_tasks=sum(1 for t in n.tasks if t.done),
            status_override=n.status_override,
        )
        for n in nodes
    ]
    edge_pairs = [(e.source_node_id, e.target_node_id) for e in edges]
    return compute_statuses(inputs, edge_pairs)


def node_to_dict(node: Node, status: Status) -> dict:
    return {
        "id": node.id,
        "project_id": node.project_id,
        "title": node.title,
        "description": node.description,
        "position_x": node.position_x,
        "position_y": node.position_y,
        "status_override": node.status_override,
        "status": status,
        "total_tasks": len(node.tasks),
        "done_tasks": sum(1 for t in node.tasks if t.done),
        "tasks": node.tasks,
    }


def project_percent_complete(nodes: list[Node]) -> float:
    total = sum(len(n.tasks) for n in nodes)
    if total == 0:
        return 0.0
    done = sum(sum(1 for t in n.tasks if t.done) for n in nodes)
    return round(done / total * 100, 1)


def next_step_titles(nodes: list[Node], statuses: dict[int, Status]) -> list[str]:
    return [n.title for n in nodes if statuses.get(n.id) == Status.NEXT]
