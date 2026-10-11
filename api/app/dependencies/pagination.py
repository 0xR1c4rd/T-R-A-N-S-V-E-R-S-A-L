from dataclasses import dataclass

from fastapi import Query


@dataclass
class Pagination:
    page: int
    limit: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


def pagination_params(
    page: int = Query(default=1, ge=1, description="Numéro de page (à partir de 1)"),
    limit: int = Query(default=12, ge=1, le=50, description="Éléments par page (1 à 50)"),
) -> Pagination:
    return Pagination(page=page, limit=limit)