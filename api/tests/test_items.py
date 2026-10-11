import pytest
from httpx import AsyncClient

from tests.conftest import assert_erreur


async def test_liste_par_defaut(client: AsyncClient) -> None:
    r = await client.get("/items")
    assert r.status_code == 200
    corps = r.json()
    assert (corps["total"], corps["page"], corps["limit"]) == (3, 1, 12)
    assert len(corps["results"]) == 3


async def test_pagination(client: AsyncClient) -> None:
    r = await client.get("/items", params={"limit": 2, "page": 2})
    corps = r.json()
    assert corps["total"] == 3
    assert len(corps["results"]) == 1


async def test_recherche_par_mot_cle(client: AsyncClient) -> None:
    r = await client.get("/items", params={"q": "chim"})
    assert [i["titre"] for i in r.json()["results"]] == ["Chimay Bleue"]


async def test_recherche_echappe_les_jokers_like(client: AsyncClient) -> None:
    # "%" et "_" doivent être cherchés littéralement, pas comme jokers SQL.
    assert (await client.get("/items", params={"q": "0% "})).json()["total"] == 1
    assert (await client.get("/items", params={"q": "%%"})).json()["total"] == 0
    assert (await client.get("/items", params={"q": "t_P"})).json()["total"] == 1


async def test_filtre_categorie(client: AsyncClient) -> None:
    r = await client.get("/items", params={"categorie": "IPA"})
    assert r.json()["total"] == 1


@pytest.mark.parametrize(
    "params",
    [{"page": 0}, {"limit": 0}, {"limit": 51}, {"q": "a"}],
)
async def test_parametres_invalides_422(client: AsyncClient, params: dict[str, int | str]) -> None:
    assert_erreur(await client.get("/items", params=params), 422)


async def test_fiche_item(client: AsyncClient) -> None:
    r = await client.get("/items/1")
    assert r.status_code == 200
    assert r.json()["titre"] == "Chimay Bleue"


async def test_fiche_item_inexistant_404(client: AsyncClient) -> None:
    assert_erreur(await client.get("/items/999"), 404)