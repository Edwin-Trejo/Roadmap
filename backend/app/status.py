from collections import deque
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class Status(str, Enum):
    COMPLETE = "complete"
    IN_PROGRESS = "in_progress"
    NEXT = "next"
    LOCKED = "locked"


@dataclass
class NodeInput:
    id: int
    total_tasks: int
    done_tasks: int
    status_override: Optional[Status] = None


def _topological_order(node_ids: list[int], edges: list[tuple[int, int]]) -> list[int]:
    successors: dict[int, list[int]] = {nid: [] for nid in node_ids}
    in_degree: dict[int, int] = {nid: 0 for nid in node_ids}
    for source, target in edges:
        successors[source].append(target)
        in_degree[target] += 1

    queue = deque([nid for nid in node_ids if in_degree[nid] == 0])
    order: list[int] = []
    while queue:
        nid = queue.popleft()
        order.append(nid)
        for succ in successors[nid]:
            in_degree[succ] -= 1
            if in_degree[succ] == 0:
                queue.append(succ)

    # Any nodes left out (e.g. a cycle) are appended so every node still gets a status.
    order.extend(nid for nid in node_ids if nid not in order)
    return order


def compute_statuses(
    nodes: list[NodeInput], edges: list[tuple[int, int]]
) -> dict[int, Status]:
    node_by_id = {n.id: n for n in nodes}
    predecessors: dict[int, list[int]] = {n.id: [] for n in nodes}
    for source, target in edges:
        predecessors[target].append(source)

    order = _topological_order([n.id for n in nodes], edges)
    statuses: dict[int, Status] = {}

    for nid in order:
        node = node_by_id[nid]
        if node.status_override is not None:
            statuses[nid] = node.status_override
            continue

        if node.total_tasks > 0 and node.done_tasks >= node.total_tasks:
            statuses[nid] = Status.COMPLETE
        elif node.done_tasks > 0:
            statuses[nid] = Status.IN_PROGRESS
        else:
            preds = predecessors[nid]
            if not preds or all(statuses.get(p) == Status.COMPLETE for p in preds):
                statuses[nid] = Status.NEXT
            else:
                statuses[nid] = Status.LOCKED

    return statuses
