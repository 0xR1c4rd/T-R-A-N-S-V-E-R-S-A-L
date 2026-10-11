FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Utilisateur non-root + dossier persistant pour la base SQLite.
RUN useradd --create-home appuser && mkdir /data && chown appuser /data
USER appuser

EXPOSE 8000

# seed.py est idempotent : on peut le relancer à chaque démarrage sans doublons.
CMD ["sh", "-c", "python seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]