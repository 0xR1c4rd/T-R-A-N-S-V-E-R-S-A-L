from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field, UniqueConstraint


class Statut(str, Enum):
    a_decouvrir = "a_decouvrir"
    en_cours = "en_cours"
    termine = "termine"


class CollectionEntry(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("user_id", "item_id"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    statut: Statut
    note: Optional[int] = Field(default=None, ge=1, le=5)
    commentaire: Optional[str] = None
    date_ajout: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")
    item_id: int = Field(foreign_key="item.id")