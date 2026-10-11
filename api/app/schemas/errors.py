from typing import Any

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    code: int
    message: str


class ErrorOut(BaseModel):
    """Format d'erreur uniforme de l'API."""

    erreur: ErrorDetail


def reponse(description: str) -> dict[str, Any]:
    """Raccourci pour déclarer un code d'erreur dans `responses=` d'une route."""
    return {"model": ErrorOut, "description": description}


NON_AUTHENTIFIE = reponse("Token absent, invalide ou expiré")
VALIDATION = reponse("Données de la requête invalides")