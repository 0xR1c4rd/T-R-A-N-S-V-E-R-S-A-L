from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.models.collection_entry import CollectionEntry, Statut
from app.models.item import Item
from app.models.user import User
from app.schemas.collection import EntryIn, EntryUpdate, EntryOut
from app.schemas.collection import EntryIn, EntryUpdate, EntryOut, StatsOut

router = APIRouter(prefix="/me", tags=["collection"])


@router.get("/collection", response_model=list[EntryOut])
async def list_collection(
    statut: Optional[Statut] = Query(default=None),
    tri: Optional[str] = Query(default=None, pattern="^(date|note)$"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    query = select(CollectionEntry).where(CollectionEntry.user_id == current_user.id)

    if statut is not None:
        query = query.where(CollectionEntry.statut == statut)

    if tri == "date":
        query = query.order_by(CollectionEntry.date_ajout.desc())
    elif tri == "note":
        query = query.order_by(CollectionEntry.note.desc())

    entries = (await session.exec(query)).all()

    result = []
    for entry in entries:
        item = await session.get(Item, entry.item_id)
        result.append(EntryOut(**entry.model_dump(), item=item))
    return result


@router.post("/collection", response_model=EntryOut, status_code=status.HTTP_201_CREATED)
async def add_to_collection(
    data: EntryIn,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    item = await session.get(Item, data.item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item introuvable",
        )

    existing = await session.exec(
        select(CollectionEntry).where(
            CollectionEntry.user_id == current_user.id,
            CollectionEntry.item_id == data.item_id,
        )
    )
    if existing.first() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cet item est déjà dans votre collection",
        )

    entry = CollectionEntry(
        statut=data.statut,
        note=data.note,
        commentaire=data.commentaire,
        user_id=current_user.id,
        item_id=data.item_id,
    )
    session.add(entry)
    await session.commit()
    await session.refresh(entry)

    return EntryOut(**entry.model_dump(), item=item)


@router.patch("/collection/{entry_id}", response_model=EntryOut)
async def update_entry(
    entry_id: int,
    data: EntryUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    entry = await session.get(CollectionEntry, entry_id)
    if entry is None or entry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrée introuvable",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)

    session.add(entry)
    await session.commit()
    await session.refresh(entry)

    item = await session.get(Item, entry.item_id)
    return EntryOut(**entry.model_dump(), item=item)


@router.delete("/collection/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    entry = await session.get(CollectionEntry, entry_id)
    if entry is None or entry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrée introuvable",
        )

    await session.delete(entry)
    await session.commit()


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    query = select(CollectionEntry).where(CollectionEntry.user_id == current_user.id)
    entries = (await session.exec(query)).all()

    total = len(entries)
    par_statut = {s.value: 0 for s in Statut}
    notes = []

    for entry in entries:
        par_statut[entry.statut.value] += 1
        if entry.note is not None:
            notes.append(entry.note)

    note_moyenne = round(sum(notes) / len(notes), 2) if notes else None

    return {"total": total, "par_statut": par_statut, "note_moyenne": note_moyenne}


@router.get("/stats", response_model=StatsOut)
async def get_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    query = select(CollectionEntry).where(CollectionEntry.user_id == current_user.id)
    entries = (await session.exec(query)).all()

    total = len(entries)
    par_statut = {s.value: 0 for s in Statut}
    notes = []

    for entry in entries:
        par_statut[entry.statut.value] += 1
        if entry.note is not None:
            notes.append(entry.note)

    note_moyenne = round(sum(notes) / len(notes), 2) if notes else None

    return {"total": total, "par_statut": par_statut, "note_moyenne": note_moyenne}