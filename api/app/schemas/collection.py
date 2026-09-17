from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from app.models.collection_entry import Statut
from app.schemas.item import ItemOut


class EntryIn(BaseModel):
    item_id: int
    statut: Statut
    note: Optional[int] = Field(default=None, ge=1, le=5)
    commentaire: Optional[str] = None


class EntryUpdate(BaseModel):
    statut: Optional[Statut] = None
    note: Optional[int] = Field(default=None, ge=1, le=5)
    commentaire: Optional[str] = None


class EntryOut(BaseModel):
    id: int
    statut: Statut
    note: Optional[int]
    commentaire: Optional[str]
    date_ajout: datetime
    item: ItemOut
    
class StatsOut(BaseModel):
    total: int
    par_statut: dict[str, int]
    note_moyenne: Optional[float]