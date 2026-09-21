def _make_node_with_task(client, auth_headers):
    project_id = client.post("/projects", json={"name": "P"}, headers=auth_headers).json()["id"]
    node = client.post(
        f"/projects/{project_id}/nodes", json={"title": "N"}, headers=auth_headers
    ).json()
    task = client.post(
        f"/nodes/{node['id']}/tasks", json={"title": "Parent task"}, headers=auth_headers
    ).json()
    return node, task


def test_create_subtask(client, auth_headers):
    node, task = _make_node_with_task(client, auth_headers)

    resp = client.post(
        f"/tasks/{task['id']}/subtasks", json={"title": "Subtask 1"}, headers=auth_headers
    )
    assert resp.status_code == 201
    assert resp.json()["parent_task_id"] == task["id"]

    tasks = client.get(f"/nodes/{node['id']}/tasks", headers=auth_headers).json()
    assert len(tasks) == 1
    assert tasks[0]["id"] == task["id"]
    assert len(tasks[0]["subtasks"]) == 1
    assert tasks[0]["subtasks"][0]["title"] == "Subtask 1"


def test_completing_all_subtasks_completes_parent(client, auth_headers):
    node, task = _make_node_with_task(client, auth_headers)
    sub1 = client.post(
        f"/tasks/{task['id']}/subtasks", json={"title": "S1"}, headers=auth_headers
    ).json()
    sub2 = client.post(
        f"/tasks/{task['id']}/subtasks", json={"title": "S2"}, headers=auth_headers
    ).json()

    client.put(f"/tasks/{sub1['id']}", json={"done": True}, headers=auth_headers)
    tasks = client.get(f"/nodes/{node['id']}/tasks", headers=auth_headers).json()
    assert tasks[0]["done"] is False

    client.put(f"/tasks/{sub2['id']}", json={"done": True}, headers=auth_headers)
    tasks = client.get(f"/nodes/{node['id']}/tasks", headers=auth_headers).json()
    assert tasks[0]["done"] is True


def test_uncompleting_a_subtask_uncompletes_parent(client, auth_headers):
    node, task = _make_node_with_task(client, auth_headers)
    sub1 = client.post(
        f"/tasks/{task['id']}/subtasks", json={"title": "S1"}, headers=auth_headers
    ).json()
    client.put(f"/tasks/{sub1['id']}", json={"done": True}, headers=auth_headers)
    tasks = client.get(f"/nodes/{node['id']}/tasks", headers=auth_headers).json()
    assert tasks[0]["done"] is True

    client.put(f"/tasks/{sub1['id']}", json={"done": False}, headers=auth_headers)
    tasks = client.get(f"/nodes/{node['id']}/tasks", headers=auth_headers).json()
    assert tasks[0]["done"] is False


def test_cannot_toggle_parent_directly_when_it_has_subtasks(client, auth_headers):
    node, task = _make_node_with_task(client, auth_headers)
    client.post(f"/tasks/{task['id']}/subtasks", json={"title": "S1"}, headers=auth_headers)

    resp = client.put(f"/tasks/{task['id']}", json={"done": True}, headers=auth_headers)
    assert resp.json()["done"] is False


def test_deleting_incomplete_subtask_can_complete_parent(client, auth_headers):
    node, task = _make_node_with_task(client, auth_headers)
    sub1 = client.post(
        f"/tasks/{task['id']}/subtasks", json={"title": "S1"}, headers=auth_headers
    ).json()
    sub2 = client.post(
        f"/tasks/{task['id']}/subtasks", json={"title": "S2"}, headers=auth_headers
    ).json()
    client.put(f"/tasks/{sub1['id']}", json={"done": True}, headers=auth_headers)

    client.delete(f"/tasks/{sub2['id']}", headers=auth_headers)

    tasks = client.get(f"/nodes/{node['id']}/tasks", headers=auth_headers).json()
    assert tasks[0]["done"] is True
    assert len(tasks[0]["subtasks"]) == 1


def test_cannot_create_subtask_under_a_subtask(client, auth_headers):
    node, task = _make_node_with_task(client, auth_headers)
    sub1 = client.post(
        f"/tasks/{task['id']}/subtasks", json={"title": "S1"}, headers=auth_headers
    ).json()

    resp = client.post(
        f"/tasks/{sub1['id']}/subtasks", json={"title": "S1a"}, headers=auth_headers
    )
    assert resp.status_code == 400


def test_deleting_parent_task_cascades_to_subtasks(client, auth_headers):
    node, task = _make_node_with_task(client, auth_headers)
    client.post(f"/tasks/{task['id']}/subtasks", json={"title": "S1"}, headers=auth_headers)

    resp = client.delete(f"/tasks/{task['id']}", headers=auth_headers)
    assert resp.status_code == 204

    tasks = client.get(f"/nodes/{node['id']}/tasks", headers=auth_headers).json()
    assert tasks == []


def test_node_progress_counts_only_top_level_tasks(client, auth_headers):
    node, task = _make_node_with_task(client, auth_headers)
    client.post(f"/tasks/{task['id']}/subtasks", json={"title": "S1"}, headers=auth_headers)
    client.post(f"/tasks/{task['id']}/subtasks", json={"title": "S2"}, headers=auth_headers)

    project_id = node["project_id"]
    graph = client.get(f"/projects/{project_id}/graph", headers=auth_headers).json()
    graph_node = graph["nodes"][0]
    assert graph_node["total_tasks"] == 1
    assert graph_node["done_tasks"] == 0
