from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginIn, RegisterIn, TokenOut, UserOut
from app.schemas.errors import NON_AUTHENTIFIE, VALIDATION, reponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un compte utilisateur",
    responses={409: reponse("Email déjà utilisé"), 422: VALIDATION},
)
async def register(data: RegisterIn, session: AsyncSession = Depends(get_session)) -> User:
    existing = await session.exec(select(User).where(User.email == data.email))
    if existing.first() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email déjà utilisé")

    user = User(email=data.email, hashed_password=hash_password(data.password))
    session.add(user)
    try:
        await session.commit()
    except IntegrityError:
        # Deux inscriptions simultanées avec le même email : la contrainte unique tranche.
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email déjà utilisé")
    await session.refresh(user)
    return user


@router.post(
    "/login",
    response_model=TokenOut,
    summary="Se connecter et obtenir un token JWT",
    responses={401: reponse("Email ou mot de passe incorrect"), 422: VALIDATION},
)
async def login(data: LoginIn, session: AsyncSession = Depends(get_session)) -> TokenOut:
    result = await session.exec(select(User).where(User.email == data.email))
    user = result.first()

    if user is None or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
        )

    token = create_access_token({"sub": str(user.id)})
    return TokenOut(access_token=token)


@router.get(
    "/me",
    response_model=UserOut,
    summary="Récupérer les infos de l'utilisateur connecté",
    responses={401: NON_AUTHENTIFIE},
)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user