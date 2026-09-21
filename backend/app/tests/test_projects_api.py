def test_create_and_list_projects(client, auth_headers):
    resp = client.post(
        "/projects", json={"name": "Roadmap App", "description": "test"}, headers=auth_headers
    )
    assert resp.status_code == 201
    project_id = resp.json()["id"]

    resp = client.get("/projects", headers=auth_headers)
    assert resp.status_code == 200
    names = [p["name"] for p in resp.json()]
    assert "Roadmap App" in names
    assert resp.json()[0]["id"] == project_id


def test_new_project_has_zero_percent_and_no_next_steps(client, auth_headers):
    resp = client.post("/projects", json={"name": "Empty"}, headers=auth_headers)
    project_id = resp.json()["id"]

    resp = client.get("/projects", headers=auth_headers)
    summary = next(p for p in resp.json() if p["id"] == project_id)
    assert summary["percent_complete"] == 0.0
    assert summary["next_step_titles"] == []


def test_full_graph_flow_computes_status_and_summary(client, auth_headers):
    project_id = client.post(
        "/projects", json={"name": "Flow"}, headers=auth_headers
    ).json()["id"]

    node_a = client.post(
        f"/projects/{project_id}/nodes", json={"title": "Design"}, headers=auth_headers
    ).json()
    node_b = client.post(
        f"/projects/{project_id}/nodes", json={"title": "Build"}, headers=auth_headers
    ).json()

    client.post(
        f"/projects/{project_id}/edges",
        json={"source_node_id": node_a["id"], "target_node_id": node_b["id"]},
        headers=auth_headers,
    )

    task = client.post(
        f"/nodes/{node_a['id']}/tasks", json={"title": "Write spec"}, headers=auth_headers
    ).json()

    graph = client.get(f"/projects/{project_id}/graph", headers=auth_headers).json()
    by_id = {n["id"]: n for n in graph["nodes"]}
    assert by_id[node_a["id"]]["status"] == "next"
    assert by_id[node_b["id"]]["status"] == "locked"

    client.put(
        f"/tasks/{task['id']}", json={"done": True}, headers=auth_headers
    )

    graph = client.get(f"/projects/{project_id}/graph", headers=auth_headers).json()
    by_id = {n["id"]: n for n in graph["nodes"]}
    assert by_id[node_a["id"]]["status"] == "complete"
    assert by_id[node_b["id"]]["status"] == "next"

    summary = next(
        p for p in client.get("/projects", headers=auth_headers).json() if p["id"] == project_id
    )
    assert summary["percent_complete"] == 100.0
    assert summary["next_step_titles"] == ["Build"]


def test_deleting_project_cascades_to_nodes_and_tasks(client, auth_headers):
    project_id = client.post(
        "/projects", json={"name": "ToDelete"}, headers=auth_headers
    ).json()["id"]
    node = client.post(
        f"/projects/{project_id}/nodes", json={"title": "N"}, headers=auth_headers
    ).json()

    resp = client.delete(f"/projects/{project_id}", headers=auth_headers)
    assert resp.status_code == 204

    resp = client.get(f"/projects/{project_id}/graph", headers=auth_headers)
    assert resp.status_code == 404
