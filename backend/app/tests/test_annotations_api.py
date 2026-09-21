def _make_project(client, auth_headers):
    return client.post("/projects", json={"name": "P"}, headers=auth_headers).json()["id"]


def test_create_rectangle_annotation(client, auth_headers):
    project_id = _make_project(client, auth_headers)
    resp = client.post(
        f"/projects/{project_id}/annotations",
        json={
            "type": "rectangle",
            "x": 10,
            "y": 20,
            "width": 120,
            "height": 80,
            "color": "#cc5500",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["type"] == "rectangle"
    assert body["width"] == 120
    assert body["points"] is None


def test_create_arrow_annotation_with_points(client, auth_headers):
    project_id = _make_project(client, auth_headers)
    resp = client.post(
        f"/projects/{project_id}/annotations",
        json={
            "type": "arrow",
            "x": 0,
            "y": 0,
            "width": 100,
            "height": 50,
            "points": [[0, 50], [100, 0]],
            "color": "#b22222",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["points"] == [[0, 50], [100, 0]]


def test_annotations_appear_in_project_graph(client, auth_headers):
    project_id = _make_project(client, auth_headers)
    client.post(
        f"/projects/{project_id}/annotations",
        json={"type": "text", "x": 5, "y": 5, "width": 100, "height": 30, "color": "#daa520",
              "text": "Note"},
        headers=auth_headers,
    )
    graph = client.get(f"/projects/{project_id}/graph", headers=auth_headers).json()
    assert len(graph["annotations"]) == 1
    assert graph["annotations"][0]["text"] == "Note"


def test_update_annotation_position_and_color(client, auth_headers):
    project_id = _make_project(client, auth_headers)
    annotation = client.post(
        f"/projects/{project_id}/annotations",
        json={"type": "circle", "x": 0, "y": 0, "width": 60, "height": 60, "color": "#cc5500"},
        headers=auth_headers,
    ).json()

    resp = client.put(
        f"/annotations/{annotation['id']}",
        json={"x": 50, "y": 75, "color": "#6b8e23"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["x"] == 50
    assert resp.json()["y"] == 75
    assert resp.json()["color"] == "#6b8e23"


def test_delete_annotation(client, auth_headers):
    project_id = _make_project(client, auth_headers)
    annotation = client.post(
        f"/projects/{project_id}/annotations",
        json={"type": "freehand", "x": 0, "y": 0, "width": 40, "height": 40,
              "points": [[0, 0], [10, 10], [40, 40]], "color": "#8b4513"},
        headers=auth_headers,
    ).json()

    resp = client.delete(f"/annotations/{annotation['id']}", headers=auth_headers)
    assert resp.status_code == 204

    graph = client.get(f"/projects/{project_id}/graph", headers=auth_headers).json()
    assert graph["annotations"] == []


def test_deleting_project_cascades_to_annotations(client, auth_headers):
    project_id = _make_project(client, auth_headers)
    client.post(
        f"/projects/{project_id}/annotations",
        json={"type": "rectangle", "x": 0, "y": 0, "width": 10, "height": 10, "color": "#cc5500"},
        headers=auth_headers,
    )

    resp = client.delete(f"/projects/{project_id}", headers=auth_headers)
    assert resp.status_code == 204

    resp = client.get(f"/projects/{project_id}/graph", headers=auth_headers)
    assert resp.status_code == 404
