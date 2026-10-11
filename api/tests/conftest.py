import os
import tempfile
from collections.abc import AsyncIterator
from typing import Any

# Doit être fait AVANT l'import de l'application : la config est lue à l'import.
_db_dir = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_db_dir}/test.db"
os.environ["JWT_SECRET_KEY"] = "cle-de-test-uniquement-" + "x" * 32

import pytest  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlmodel import SQLModel  # noqa: E402

from app.db.session import async_session_maker, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models.item import Item  # noqa: E402


@pytest.fixture(autouse=True)
async def base_propre() -> AsyncIterator[None]:
    """Recrée des tables vides et 3 items avant chaque test."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)
    async with async_session_maker() as session:
        session.add_all(
            [
                Item(titre="Chimay Bleue", categorie="Trappiste", description="d", image_url="u", annee=1948, brasserie="Chimay", degre_alcool=9.0),
                Item(titre="Punk IPA", categorie="IPA", description="d", image_url="u", annee=2007, brasserie="BrewDog", degre_alcool=5.6),
                Item(titre="100% Malt_Pur", categorie="Blonde", description="d", image_url="u", annee=2000, brasserie="X", degre_alcool=5.0),
            ]
        )
        await session.commit()
    yield


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


async def creer_utilisateur(client: AsyncClient, email: str = "a@test.fr", password: str = "motdepasse1") -> dict[str, str]:
    """Inscrit puis connecte un utilisateur ; renvoie l'en-tête Authorization."""
    await client.post("/auth/register", json={"email": email, "password": password})
    r = await client.post("/auth/login", json={"email": email, "password": password})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
async def auth(client: AsyncClient) -> dict[str, str]:
    return await creer_utilisateur(client)


def assert_erreur(reponse: Any, code: int) -> None:
    """Vérifie le format d'erreur imposé par le contrat."""
    assert reponse.status_code == code
    corps = reponse.json()
    assert set(corps) == {"erreur"}
    assert corps["erreur"]["code"] == code
    assert isinstance(corps["erreur"]["message"], str)