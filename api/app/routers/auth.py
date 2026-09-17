from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import hash_password, verify_password, create_access_token
from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import RegisterIn, LoginIn, UserOut, TokenOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterIn, session: AsyncSession = Depends(get_session)):
    existing = await session.exec(select(User).where(User.email == data.email))
    if existing.first() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email déjà utilisé",
        )

    user = User(email=data.email, hashed_password=hash_password(data.password))
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
async def login(data: LoginIn, session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(User).where(User.email == data.email))
    user = result.first()

    if user is None or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
        )

    token = create_access_token({"sub": str(user.id)})
    return TokenOut(access_token=token)


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user