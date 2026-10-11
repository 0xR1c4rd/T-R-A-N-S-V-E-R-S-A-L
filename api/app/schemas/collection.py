from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, model_validator

from app.models.collection_entry import Statut
from app.schemas.item import ItemOut


class EntryIn(BaseModel):
    item_id: int
    statut: Statut
    note: Optional[int] = Field(default=None, ge=1, le=5)
    commentaire: Optional[str] = Field(default=None, max_length=1000)


class EntryUpdate(BaseModel):
    statut: Optional[Statut] = None
    note: Optional[int] = Field(default=None, ge=1, le=5)
    commentaire: Optional[str] = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def statut_non_nul(self) -> "EntryUpdate":
        # statut est obligatoire en base : l'omettre est permis, l'envoyer à null non.
        if "statut" in self.model_fields_set and self.statut is None:
            raise ValueError("statut ne peut pas être null")
        return self


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