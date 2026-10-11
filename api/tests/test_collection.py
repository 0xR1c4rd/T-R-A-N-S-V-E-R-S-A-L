from httpx import AsyncClient

from tests.conftest import assert_erreur, creer_utilisateur


async def ajouter(client: AsyncClient, auth: dict[str, str], item_id: int, **extra: object):
    return await client.post("/me/collection", headers=auth, json={"item_id": item_id, "statut": "a_decouvrir", **extra})


async def test_routes_me_exigent_un_token(client: AsyncClient) -> None:
    for methode, url in [("GET", "/me/collection"), ("POST", "/me/collection"), ("GET", "/me/stats"),
                         ("PATCH", "/me/collection/1"), ("DELETE", "/me/collection/1")]:
        assert_erreur(await client.request(methode, url), 401)


async def test_ajout_201_avec_item_imbrique(client: AsyncClient, auth: dict[str, str]) -> None:
    r = await ajouter(client, auth, 1, note=4, commentaire="top")
    assert r.status_code == 201
    corps = r.json()
    assert corps["statut"] == "a_decouvrir" and corps["note"] == 4
    assert corps["item"]["titre"] == "Chimay Bleue"
    assert corps["date_ajout"]


async def test_ajout_doublon_409(client: AsyncClient, auth: dict[str, str]) -> None:
    await ajouter(client, auth, 1)
    assert_erreur(await ajouter(client, auth, 1), 409)


async def test_ajout_item_inexistant_404(client: AsyncClient, auth: dict[str, str]) -> None:
    assert_erreur(await ajouter(client, auth, 999), 404)


async def test_ajout_note_hors_bornes_422(client: AsyncClient, auth: dict[str, str]) -> None:
    assert_erreur(await ajouter(client, auth, 1, note=6), 422)


async def test_liste_filtre_statut_et_tri_note(client: AsyncClient, auth: dict[str, str]) -> None:
    await ajouter(client, auth, 1, note=2)
    await ajouter(client, auth, 2, note=5)
    await client.post("/me/collection", headers=auth, json={"item_id": 3, "statut": "termine"})

    par_note = (await client.get("/me/collection", headers=auth, params={"tri": "note"})).json()
    assert [e["note"] for e in par_note] == [5, 2, None]

    termine = (await client.get("/me/collection", headers=auth, params={"statut": "termine"})).json()
    assert len(termine) == 1


async def test_tri_invalide_422(client: AsyncClient, auth: dict[str, str]) -> None:
    assert_erreur(await client.get("/me/collection", headers=auth, params={"tri": "foo"}), 422)


async def test_patch_modifie_et_peut_effacer_la_note(client: AsyncClient, auth: dict[str, str]) -> None:
    entry_id = (await ajouter(client, auth, 1, note=3)).json()["id"]
    r = await client.patch(f"/me/collection/{entry_id}", headers=auth, json={"statut": "termine", "note": 5})
    assert (r.json()["statut"], r.json()["note"]) == ("termine", 5)
    r = await client.patch(f"/me/collection/{entry_id}", headers=auth, json={"note": None})
    assert r.json()["note"] is None


async def test_patch_statut_null_refuse_en_422_pas_500(client: AsyncClient, auth: dict[str, str]) -> None:
    entry_id = (await ajouter(client, auth, 1)).json()["id"]
    r = await client.patch(f"/me/collection/{entry_id}", headers=auth, json={"statut": None})
    assert_erreur(r, 422)


async def test_patch_inexistant_404(client: AsyncClient, auth: dict[str, str]) -> None:
    assert_erreur(await client.patch("/me/collection/999", headers=auth, json={"note": 1}), 404)


async def test_delete_204_puis_404(client: AsyncClient, auth: dict[str, str]) -> None:
    entry_id = (await ajouter(client, auth, 1)).json()["id"]
    r = await client.delete(f"/me/collection/{entry_id}", headers=auth)
    assert r.status_code == 204 and r.content == b""
    assert_erreur(await client.delete(f"/me/collection/{entry_id}", headers=auth), 404)


async def test_isolation_entre_utilisateurs(client: AsyncClient, auth: dict[str, str]) -> None:
    """Sécurité : un utilisateur ne voit, ne modifie et ne supprime pas l'entrée d'un autre."""
    entry_id = (await ajouter(client, auth, 1, note=4)).json()["id"]
    autre = await creer_utilisateur(client, "b@test.fr", "motdepasse2")

    assert (await client.get("/me/collection", headers=autre)).json() == []
    assert_erreur(await client.patch(f"/me/collection/{entry_id}", headers=autre, json={"note": 1}), 404)
    assert_erreur(await client.delete(f"/me/collection/{entry_id}", headers=autre), 404)

    # L'entrée du propriétaire est intacte.
    intacte = (await client.get("/me/collection", headers=auth)).json()
    assert intacte[0]["note"] == 4

    # Et chacun peut ajouter le même item sans conflit (la contrainte est par utilisateur).
    assert (await ajouter(client, autre, 1)).status_code == 201


async def test_stats(client: AsyncClient, auth: dict[str, str]) -> None:
    vide = (await client.get("/me/stats", headers=auth)).json()
    assert vide == {"total": 0, "par_statut": {"a_decouvrir": 0, "en_cours": 0, "termine": 0}, "note_moyenne": None}

    await ajouter(client, auth, 1, note=2)
    await ajouter(client, auth, 2, note=5)
    stats = (await client.get("/me/stats", headers=auth)).json()
    assert stats["total"] == 2
    assert stats["par_statut"]["a_decouvrir"] == 2
    assert stats["note_moyenne"] == 3.5