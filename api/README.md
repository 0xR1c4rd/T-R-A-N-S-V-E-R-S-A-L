# Ma Collection — API (Backend)

API REST pour l'application « Ma Collection », univers **bières**.

Stack : Python · FastAPI · SQLModel · SQLite (async, via aiosqlite) · JWT

## Prérequis

- Python 3.11 ou supérieur
- pip

## Installation

Depuis le dossier `api/` :

```bash
python3 -m venv .venv
source .venv/bin/activate        # sous Windows : .venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

Copier le fichier d'exemple et générer une vraie clé secrète :

```bash
cp .env.example .env
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Coller la valeur générée dans `.env`, à la place de `JWT_SECRET_KEY`.

Le fichier `.env` ne doit **jamais** être versionné (il est déjà dans `.gitignore`).

## Peuplement du catalogue

Le catalogue n'est pas récupéré depuis une source externe : il est peuplé localement via le script `seed.py`, qui insère 40 bières réparties sur 9 catégories.

```bash
python3 seed.py
```

Le script peut être relancé sans créer de doublons (vérification par titre avant insertion).

## Lancement du serveur

```bash
python3 -m uvicorn app.main:app --reload
```

L'API est disponible sur `http://localhost:8000`.
La documentation interactive (Swagger) est disponible sur `http://localhost:8000/docs`.

La base de données SQLite (`ma_collection.db`) et les tables sont créées automatiquement au premier démarrage.

## Tester l'API dans /docs

1. `POST /auth/register` avec un email et un mot de passe pour créer un compte.
2. `POST /auth/login` avec les mêmes identifiants pour récupérer un `access_token`.
3. Cliquer sur le bouton **Authorize** en haut de la page et coller le token (sans le mot « Bearer », juste la valeur).
4. Toutes les routes `/me/*` sont alors accessibles avec cette autorisation.

## Structure du projet

```
api/
├── app/
│   ├── main.py              # assemblage de l'application (aucune route ici)
│   ├── core/                # configuration (.env) et sécurité (hash, JWT)
│   ├── db/                  # connexion à la base et gestion de session
│   ├── models/               # tables SQLModel (User, Item, CollectionEntry)
│   ├── schemas/               # schémas Pydantic d'entrée/sortie de l'API
│   ├── dependencies/           # dépendances FastAPI (auth, pagination)
│   └── routers/                # routes de l'API (auth, items, collection)
├── seed.py                  # script de peuplement du catalogue
├── requirements.txt
├── .env.example
└── .env                      # non versionné
```

## Sécurité

- Mots de passe hachés avec bcrypt (jamais stockés ni renvoyés en clair).
- Authentification par token JWT à expiration courte (30 minutes par défaut).
- CORS restreint à l'origine du serveur de développement Vite (`http://localhost:5173`).
- Vérification du propriétaire côté serveur sur chaque modification/suppression d'une entrée de collection.
- Aucune requête SQL construite par concaténation de chaînes (ORM SQLModel/SQLAlchemy uniquement).