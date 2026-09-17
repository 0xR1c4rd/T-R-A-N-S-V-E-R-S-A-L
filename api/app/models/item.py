from typing import Optional
from sqlmodel import SQLModel, Field


class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titre: str
    categorie: str = Field(index=True)
    description: str
    image_url: str
    annee: int
    brasserie: str
    degre_alcool: float