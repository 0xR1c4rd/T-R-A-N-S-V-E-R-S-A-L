from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def _erreur(code: int, message: str, headers: dict[str, str] | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=code,
        content={"erreur": {"code": code, "message": message}},
        headers=headers,
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Uniformise le format d'erreur de toute l'API : {"erreur": {"code", "message"}}."""

    # Starlette's HTTPException : couvre aussi celle de FastAPI (qui en hérite),
    # donc aussi les 404 de route inconnue et les 405.
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return _erreur(exc.status_code, str(exc.detail), exc.headers)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        erreurs = exc.errors()
        if erreurs:
            premiere = erreurs[0]
            champ = ".".join(str(p) for p in premiere["loc"][1:])
            message = f"Champ invalide « {champ} » : {premiere['msg']}" if champ else premiere["msg"]
        else:
            message = "Requête invalide"
        return _erreur(422, message)