from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.dependencies.pagination import Pagination, pagination_params
from app.models.item import Item
from app.schemas.errors import VALIDATION, reponse
from app.schemas.item import ItemListOut, ItemOut

router = APIRouter(prefix="/items", tags=["items"])


def _echapper_like(texte: str) -> str:
    """Neutralise % et _ pour qu'ils soient cherchés littéralement et non comme jokers."""
    return texte.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


@router.get(
    "",
    response_model=ItemListOut,
    summary="Rechercher dans le catalogue avec filtre et pagination",
    responses={422: VALIDATION},
)
async def list_items(
    q: Optional[str] = Query(default=None, min_length=2, description="Mot-clé recherché dans le titre"),
    categorie: Optional[str] = Query(default=None, description="Filtre exact sur la catégorie"),
    pagination: Pagination = Depends(pagination_params),
    session: AsyncSession = Depends(get_session),
) -> ItemListOut:
    query = select(Item)
    if q is not None:
        query = query.where(Item.titre.ilike(f"%{_echapper_like(q)}%", escape="\\"))
    if categorie is not None:
        query = query.where(Item.categorie == categorie)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await session.exec(count_query)).one()

    query = query.order_by(Item.id).offset(pagination.offset).limit(pagination.limit)
    results = (await session.exec(query)).all()

    return ItemListOut(
        total=total,
        page=pagination.page,
        limit=pagination.limit,
        results=[ItemOut.model_validate(r) for r in results],
    )


@router.get(
    "/{item_id}",
    response_model=ItemOut,
    summary="Récupérer la fiche détaillée d'un item",
    responses={404: reponse("Item introuvable"), 422: VALIDATION},
)
async def get_item(item_id: int, session: AsyncSession = Depends(get_session)) -> Item:
    item = await session.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item introuvable")
    return item