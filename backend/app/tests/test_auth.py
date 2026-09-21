def test_login_with_valid_credentials_returns_token(client, auth_headers):
    assert "Authorization" in auth_headers


def test_login_with_wrong_password_returns_401(client, db_session):
    from app.models import User
    from app.security import hash_password

    db_session.add(User(username="edwin", hashed_password=hash_password("secret")))
    db_session.commit()

    resp = client.post("/auth/login", json={"username": "edwin", "password": "wrong"})
    assert resp.status_code == 401


def test_protected_endpoint_requires_auth(client):
    resp = client.get("/projects")
    assert resp.status_code in (401, 403)


def test_protected_endpoint_rejects_bad_token(client):
    resp = client.get("/projects", headers={"Authorization": "Bearer garbage"})
    assert resp.status_code == 401
