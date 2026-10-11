import os

from dotenv import load_dotenv

load_dotenv()

SECRET_PAR_DEFAUT = "change-moi-avec-une-vraie-cle-secrete"


class Settings:
    """Configuration de l'application, lue depuis le fichier .env (non versionné)."""

    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))
    database_url: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./ma_collection.db")

    def __init__(self) -> None:
        if not self.jwt_secret_key or self.jwt_secret_key == SECRET_PAR_DEFAUT:
            raise RuntimeError(
                "JWT_SECRET_KEY manquante ou non modifiée : copiez .env.example vers .env "
                "puis générez une vraie clé (voir README)."
            )


settings = Settings()