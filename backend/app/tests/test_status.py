from app.status import NodeInput, Status, compute_statuses


def test_node_with_no_predecessors_and_no_tasks_is_next():
    nodes = [NodeInput(id=1, total_tasks=0, done_tasks=0)]
    statuses = compute_statuses(nodes, edges=[])
    assert statuses[1] == Status.NEXT


def test_node_with_all_tasks_done_is_complete():
    nodes = [NodeInput(id=1, total_tasks=3, done_tasks=3)]
    statuses = compute_statuses(nodes, edges=[])
    assert statuses[1] == Status.COMPLETE


def test_node_with_some_tasks_done_is_in_progress():
    nodes = [NodeInput(id=1, total_tasks=3, done_tasks=1)]
    statuses = compute_statuses(nodes, edges=[])
    assert statuses[1] == Status.IN_PROGRESS


def test_node_with_incomplete_predecessor_is_locked():
    nodes = [
        NodeInput(id=1, total_tasks=2, done_tasks=1),
        NodeInput(id=2, total_tasks=0, done_tasks=0),
    ]
    statuses = compute_statuses(nodes, edges=[(1, 2)])
    assert statuses[2] == Status.LOCKED


def test_node_becomes_next_once_predecessor_completes():
    nodes = [
        NodeInput(id=1, total_tasks=2, done_tasks=2),
        NodeInput(id=2, total_tasks=0, done_tasks=0),
    ]
    statuses = compute_statuses(nodes, edges=[(1, 2)])
    assert statuses[1] == Status.COMPLETE
    assert statuses[2] == Status.NEXT


def test_branch_node_is_locked_until_shared_predecessor_completes():
    # 1 -> 2, 1 -> 3 (branch)
    nodes = [
        NodeInput(id=1, total_tasks=1, done_tasks=0),
        NodeInput(id=2, total_tasks=0, done_tasks=0),
        NodeInput(id=3, total_tasks=0, done_tasks=0),
    ]
    statuses = compute_statuses(nodes, edges=[(1, 2), (1, 3)])
    assert statuses[2] == Status.LOCKED
    assert statuses[3] == Status.LOCKED


def test_merge_node_requires_all_predecessors_complete():
    # 1 -> 3, 2 -> 3 (merge); only 1 is complete
    nodes = [
        NodeInput(id=1, total_tasks=1, done_tasks=1),
        NodeInput(id=2, total_tasks=1, done_tasks=0),
        NodeInput(id=3, total_tasks=0, done_tasks=0),
    ]
    statuses = compute_statuses(nodes, edges=[(1, 3), (2, 3)])
    assert statuses[3] == Status.LOCKED


def test_merge_node_is_next_once_all_predecessors_complete():
    nodes = [
        NodeInput(id=1, total_tasks=1, done_tasks=1),
        NodeInput(id=2, total_tasks=1, done_tasks=1),
        NodeInput(id=3, total_tasks=0, done_tasks=0),
    ]
    statuses = compute_statuses(nodes, edges=[(1, 3), (2, 3)])
    assert statuses[3] == Status.NEXT


def test_status_override_wins_regardless_of_tasks_or_predecessors():
    nodes = [
        NodeInput(id=1, total_tasks=0, done_tasks=0, status_override=Status.LOCKED),
        NodeInput(
            id=2,
            total_tasks=5,
            done_tasks=5,
            status_override=Status.IN_PROGRESS,
        ),
    ]
    statuses = compute_statuses(nodes, edges=[(1, 2)])
    assert statuses[1] == Status.LOCKED
    assert statuses[2] == Status.IN_PROGRESS
