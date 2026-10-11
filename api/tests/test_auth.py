from httpx import AsyncClient

from tests.conftest import assert_erreur


async def test_register_201_sans_mot_de_passe(client: AsyncClient) -> None:
    r = await client.post("/auth/register", json={"email": "A@Test.fr", "password": "motdepasse1"})
    assert r.status_code == 201
    assert r.json() == {"id": 1, "email": "a@test.fr"}  # email normalisé, aucun hash renvoyé


async def test_register_doublon_409(client: AsyncClient) -> None:
    await client.post("/auth/register", json={"email": "a@test.fr", "password": "motdepasse1"})
    r = await client.post("/auth/register", json={"email": "A@TEST.fr", "password": "motdepasse1"})
    assert_erreur(r, 409)


async def test_register_mot_de_passe_trop_court_422(client: AsyncClient) -> None:
    r = await client.post("/auth/register", json={"email": "a@test.fr", "password": "123"})
    assert_erreur(r, 422)


async def test_login_ok_renvoie_un_token_bearer(client: AsyncClient) -> None:
    await client.post("/auth/register", json={"email": "a@test.fr", "password": "motdepasse1"})
    r = await client.post("/auth/login", json={"email": "a@test.fr", "password": "motdepasse1"})
    assert r.status_code == 200
    assert r.json()["token_type"] == "bearer"
    assert r.json()["access_token"]


async def test_login_mauvais_mot_de_passe_401(client: AsyncClient) -> None:
    await client.post("/auth/register", json={"email": "a@test.fr", "password": "motdepasse1"})
    r = await client.post("/auth/login", json={"email": "a@test.fr", "password": "faux"})
    assert_erreur(r, 401)


async def test_me_sans_token_401(client: AsyncClient) -> None:
    assert_erreur(await client.get("/auth/me"), 401)


async def test_me_token_invalide_401(client: AsyncClient) -> None:
    r = await client.get("/auth/me", headers={"Authorization": "Bearer nimportequoi"})
    assert_erreur(r, 401)


async def test_me_avec_token_200(client: AsyncClient, auth: dict[str, str]) -> None:
    r = await client.get("/auth/me", headers=auth)
    assert r.status_code == 200
    assert set(r.json()) == {"id", "email"}