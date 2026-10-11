from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_session
from app.models.user import User

# auto_error=False : on lève nous-mêmes l'erreur pour garder un 401 et un message en français.
bearer_scheme = HTTPBearer(auto_error=False)


def _non_authentifie(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> User:
    if credentials is None:
        raise _non_authentifie("Authentification requise")

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise _non_authentifie("Token invalide ou expiré")

    try:
        user_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        raise _non_authentifie("Token invalide")

    user = await session.get(User, user_id)
    if user is None:
        raise _non_authentifie("Utilisateur introuvable")

    return user