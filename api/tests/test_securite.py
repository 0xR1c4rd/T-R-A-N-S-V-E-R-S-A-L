from datetime import datetime, timedelta, timezone

from httpx import AsyncClient
from jose import jwt
from sqlmodel import select

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import async_session_maker
from app.models.user import User
from tests.conftest import assert_erreur


def test_bcrypt_hash_et_verification() -> None:
    h = hash_password("motdepasse1")
    assert h.startswith("$2") and h != "motdepasse1"
    assert verify_password("motdepasse1", h)
    assert not verify_password("autre", h)


def test_token_a_une_expiration_courte() -> None:
    payload = jwt.decode(create_access_token({"sub": "1"}), settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    assert timedelta(0) < exp - datetime.now(timezone.utc) <= timedelta(minutes=settings.jwt_expire_minutes, seconds=5)


async def test_token_expire_refuse_401(client: AsyncClient) -> None:
    await client.post("/auth/register", json={"email": "a@test.fr", "password": "motdepasse1"})
    expire = jwt.encode(
        {"sub": "1", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    assert_erreur(await client.get("/auth/me", headers={"Authorization": f"Bearer {expire}"}), 401)


async def test_token_signe_avec_une_autre_cle_refuse_401(client: AsyncClient) -> None:
    await client.post("/auth/register", json={"email": "a@test.fr", "password": "motdepasse1"})
    faux = jwt.encode({"sub": "1"}, "mauvaise-cle", algorithm=settings.jwt_algorithm)
    assert_erreur(await client.get("/auth/me", headers={"Authorization": f"Bearer {faux}"}), 401)


async def test_mot_de_passe_stocke_hache_et_jamais_renvoye(client: AsyncClient) -> None:
    r = await client.post("/auth/register", json={"email": "a@test.fr", "password": "motdepasse1"})
    assert "password" not in r.text and "hash" not in r.text
    async with async_session_maker() as session:
        user = (await session.exec(select(User))).one()
    assert user.hashed_password.startswith("$2") and "motdepasse1" not in user.hashed_password