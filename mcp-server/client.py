import httpx


class RoadmapClient:
    """Thin authenticated HTTP client for the Roadmap API.

    Mirrors frontend/src/api/client.ts's login/bearer-token pattern: log in
    once, cache the JWT, and transparently re-login-and-retry once on a 401.
    """

    def __init__(self, base_url: str, username: str, password: str):
        self.base_url = base_url.rstrip("/")
        self.username = username
        self.password = password
        self._token: str | None = None
        self._http = httpx.AsyncClient(base_url=self.base_url, timeout=10.0)

    async def _login(self) -> str:
        resp = await self._http.post(
            "/auth/login", json={"username": self.username, "password": self.password}
        )
        resp.raise_for_status()
        token = resp.json()["access_token"]
        self._token = token
        return token

    async def request(self, method: str, path: str, **kwargs) -> httpx.Response:
        if self._token is None:
            await self._login()

        resp = await self._http.request(
            method, path, headers={"Authorization": f"Bearer {self._token}"}, **kwargs
        )
        if resp.status_code == 401:
            await self._login()
            resp = await self._http.request(
                method, path, headers={"Authorization": f"Bearer {self._token}"}, **kwargs
            )

        resp.raise_for_status()
        return resp

    async def aclose(self) -> None:
        await self._http.aclose()
