import httpx
import pytest

from client import RoadmapClient


@pytest.fixture
def client():
    return RoadmapClient(base_url="http://test", username="edwin", password="secret")


async def test_login_sets_token(client, httpx_mock):
    httpx_mock.add_response(url="http://test/auth/login", json={"access_token": "tok123"})

    token = await client._login()

    assert token == "tok123"
    assert client._token == "tok123"


async def test_request_logs_in_lazily_before_first_call(client, httpx_mock):
    httpx_mock.add_response(url="http://test/auth/login", json={"access_token": "tok123"})
    httpx_mock.add_response(url="http://test/projects", json=[])

    resp = await client.request("GET", "/projects")

    assert resp.status_code == 200
    assert client._token == "tok123"


async def test_request_reuses_cached_token_without_relogin(client, httpx_mock):
    client._token = "already-have-one"
    httpx_mock.add_response(url="http://test/projects", json=[])

    await client.request("GET", "/projects")

    # only the /projects call should have happened; no /auth/login request queued or consumed
    requests = httpx_mock.get_requests()
    assert len(requests) == 1
    assert requests[0].url.path == "/projects"


async def test_request_retries_once_after_401_by_relogging_in(client, httpx_mock):
    client._token = "stale-token"
    httpx_mock.add_response(url="http://test/projects", status_code=401)
    httpx_mock.add_response(url="http://test/auth/login", json={"access_token": "fresh-token"})
    httpx_mock.add_response(url="http://test/projects", json=[{"id": 1}])

    resp = await client.request("GET", "/projects")

    assert resp.status_code == 200
    assert resp.json() == [{"id": 1}]
    assert client._token == "fresh-token"


async def test_request_raises_if_still_unauthorized_after_retry(client, httpx_mock):
    client._token = "stale-token"
    httpx_mock.add_response(url="http://test/projects", status_code=401)
    httpx_mock.add_response(url="http://test/auth/login", json={"access_token": "still-bad"})
    httpx_mock.add_response(url="http://test/projects", status_code=401)

    with pytest.raises(httpx.HTTPStatusError):
        await client.request("GET", "/projects")
