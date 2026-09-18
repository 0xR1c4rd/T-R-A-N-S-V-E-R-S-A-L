from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.dependencies.pagination import pagination_params
from app.models.item import Item
from app.schemas.item import ItemOut, ItemListOut

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=ItemListOut, summary="Rechercher dans le catalogue avec filtre et pagination")
async def list_items(
    q: Optional[str] = Query(default=None, min_length=2),
    categorie: Optional[str] = Query(default=None),
    pagination: dict = Depends(pagination_params),
    session: AsyncSession = Depends(get_session),
):
    page = pagination["page"]
    limit = pagination["limit"]

    query = select(Item)
    if q is not None:
        query = query.where(Item.titre.ilike(f"%{q}%"))
    if categorie is not None:
        query = query.where(Item.categorie == categorie)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await session.exec(count_query)).one()

    query = query.offset((page - 1) * limit).limit(limit)
    results = (await session.exec(query)).all()

    return ItemListOut(total=total, page=page, limit=limit, results=results)


@router.get("/{item_id}", response_model=ItemOut, summary="Récupérer la fiche détaillée d'un item")
async def get_item(item_id: int, session: AsyncSession = Depends(get_session)):
    item = await session.get(Item, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item introuvable",
        )
    return item