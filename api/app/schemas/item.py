from typing import List
from pydantic import BaseModel


class ItemOut(BaseModel):
    id: int
    titre: str
    categorie: str
    description: str
    image_url: str
    annee: int
    brasserie: str
    degre_alcool: float


class ItemListOut(BaseModel):
    total: int
    page: int
    limit: int
    results: List[ItemOut]