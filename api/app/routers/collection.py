from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import col, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.models.collection_entry import CollectionEntry, Statut
from app.models.item import Item
from app.models.user import User
from app.schemas.collection import EntryIn, EntryOut, EntryUpdate, StatsOut
from app.schemas.errors import NON_AUTHENTIFIE, VALIDATION, reponse

router = APIRouter(prefix="/me", tags=["collection"])

ENTREE_INTROUVABLE = reponse("Entrée introuvable (ou appartenant à un autre utilisateur)")


async def _entree_du_user(session: AsyncSession, entry_id: int, user: User) -> CollectionEntry:
    """Charge une entrée en vérifiant côté serveur qu'elle appartient à l'utilisateur.

    Une entrée d'un autre utilisateur renvoie 404 (et non 403) pour ne pas révéler son existence.
    """
    entry = await session.get(CollectionEntry, entry_id)
    if entry is None or entry.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrée introuvable")
    return entry


@router.get(
    "/collection",
    response_model=list[EntryOut],
    summary="Lister la collection personnelle de l'utilisateur",
    responses={401: NON_AUTHENTIFIE, 422: VALIDATION},
)
async def list_collection(
    statut: Optional[Statut] = Query(default=None, description="Filtre par statut"),
    tri: Optional[str] = Query(default=None, pattern="^(date|note)$", description="date (défaut) ou note"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[EntryOut]:
    query = (
        select(CollectionEntry, Item)
        .join(Item, col(Item.id) == col(CollectionEntry.item_id))
        .where(CollectionEntry.user_id == current_user.id)
    )
    if statut is not None:
        query = query.where(CollectionEntry.statut == statut)

    if tri == "note":
        query = query.order_by(col(CollectionEntry.note).desc().nulls_last(), col(CollectionEntry.date_ajout).desc())
    else:
        query = query.order_by(col(CollectionEntry.date_ajout).desc())

    rows = (await session.exec(query)).all()
    return [EntryOut(**entry.model_dump(), item=item) for entry, item in rows]


@router.post(
    "/collection",
    response_model=EntryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter un item à sa collection",
    responses={
        401: NON_AUTHENTIFIE,
        404: reponse("Item inexistant"),
        409: reponse("Item déjà présent dans la collection"),
        422: VALIDATION,
    },
)
async def add_to_collection(
    data: EntryIn,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> EntryOut:
    item = await session.get(Item, data.item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item introuvable")

    existing = await session.exec(
        select(CollectionEntry).where(
            CollectionEntry.user_id == current_user.id,
            CollectionEntry.item_id == data.item_id,
        )
    )
    deja_present = HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Cet item est déjà dans votre collection",
    )
    if existing.first() is not None:
        raise deja_present

    entry = CollectionEntry(
        statut=data.statut,
        note=data.note,
        commentaire=data.commentaire,
        user_id=current_user.id,
        item_id=data.item_id,
    )
    session.add(entry)
    try:
        await session.commit()
    except IntegrityError:
        # Deux ajouts simultanés : la contrainte unique (user_id, item_id) tranche.
        await session.rollback()
        raise deja_present
    await session.refresh(entry)

    return EntryOut(**entry.model_dump(), item=item)


@router.patch(
    "/collection/{entry_id}",
    response_model=EntryOut,
    summary="Modifier une entrée de sa collection",
    responses={401: NON_AUTHENTIFIE, 404: ENTREE_INTROUVABLE, 422: VALIDATION},
)
async def update_entry(
    entry_id: int,
    data: EntryUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> EntryOut:
    entry = await _entree_du_user(session, entry_id, current_user)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)

    session.add(entry)
    await session.commit()
    await session.refresh(entry)

    item = await session.get(Item, entry.item_id)
    return EntryOut(**entry.model_dump(), item=item)


@router.delete(
    "/collection/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une entrée de sa collection",
    responses={401: NON_AUTHENTIFIE, 404: ENTREE_INTROUVABLE, 422: VALIDATION},
)
async def delete_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    entry = await _entree_du_user(session, entry_id, current_user)
    await session.delete(entry)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/stats",
    response_model=StatsOut,
    summary="Obtenir les statistiques de sa collection",
    responses={401: NON_AUTHENTIFIE},
)
async def get_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> StatsOut:
    query = select(CollectionEntry).where(CollectionEntry.user_id == current_user.id)
    entries = (await session.exec(query)).all()

    par_statut = {s.value: 0 for s in Statut}
    notes: list[int] = []
    for entry in entries:
        par_statut[entry.statut.value] += 1
        if entry.note is not None:
            notes.append(entry.note)

    note_moyenne = round(sum(notes) / len(notes), 2) if notes else None
    return StatsOut(total=len(entries), par_statut=par_statut, note_moyenne=note_moyenne)