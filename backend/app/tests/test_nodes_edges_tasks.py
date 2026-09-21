def _make_project(client, auth_headers):
    return client.post("/projects", json={"name": "P"}, headers=auth_headers).json()["id"]


def test_update_node_position(client, auth_headers):
    project_id = _make_project(client, auth_headers)
    node = client.post(
        f"/projects/{project_id}/nodes", json={"title": "N"}, headers=auth_headers
    ).json()

    resp = client.put(
        f"/nodes/{node['id']}",
        json={"position_x": 42.5, "position_y": -10},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["position_x"] == 42.5
    assert resp.json()["position_y"] == -10


def test_status_override_reflected_in_graph(client, auth_headers):
    project_id = _make_project(client, auth_headers)
    node = client.post(
        f"/projects/{project_id}/nodes", json={"title": "N"}, headers=auth_headers
    ).json()

    client.put(
        f"/nodes/{node['id']}", json={"status_override": "in_progress"}, headers=auth_headers
    )
    graph = client.get(f"/projects/{project_id}/graph", headers=auth_headers).json()
    assert graph["nodes"][0]["status"] == "in_progress"

    client.put(
        f"/nodes/{node['id']}", json={"clear_status_override": True}, headers=auth_headers
    )
    graph = client.get(f"/projects/{project_id}/graph", headers=auth_headers).json()
    assert graph["nodes"][0]["status"] == "next"


def test_deleting_node_removes_its_edges(client, auth_headers):
    project_id = _make_project(client, auth_headers)
    a = client.post(
        f"/projects/{project_id}/nodes", json={"title": "A"}, headers=auth_headers
    ).json()
    b = client.post(
        f"/projects/{project_id}/nodes", json={"title": "B"}, headers=auth_headers
    ).json()
    client.post(
        f"/projects/{project_id}/edges",
        json={"source_node_id": a["id"], "target_node_id": b["id"]},
        headers=auth_headers,
    )

    resp = client.delete(f"/nodes/{a['id']}", headers=auth_headers)
    assert resp.status_code == 204

    graph = client.get(f"/projects/{project_id}/graph", headers=auth_headers).json()
    assert graph["edges"] == []
    assert len(graph["nodes"]) == 1


def test_task_crud(client, auth_headers):
    project_id = _make_project(client, auth_headers)
    node = client.post(
        f"/projects/{project_id}/nodes", json={"title": "N"}, headers=auth_headers
    ).json()

    task = client.post(
        f"/nodes/{node['id']}/tasks", json={"title": "Do thing"}, headers=auth_headers
    ).json()
    assert task["done"] is False

    resp = client.put(f"/tasks/{task['id']}", json={"done": True}, headers=auth_headers)
    assert resp.json()["done"] is True

    resp = client.delete(f"/tasks/{task['id']}", headers=auth_headers)
    assert resp.status_code == 204

    tasks = client.get(f"/nodes/{node['id']}/tasks", headers=auth_headers).json()
    assert tasks == []
