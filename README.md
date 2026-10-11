# Ma Collection

Application web de collection personnelle sur le thème de la **bière** : on parcourt un catalogue de bières, on ajoute celles qui nous intéressent à sa collection, puis on les note, on les commente et on suit son avancement.

Projet de fin de cours (Python + React/TypeScript), réalisé en binôme :

- **Backend** (`api/`) : Martin Desbans
- **Frontend** (`web/`) : Sacha Paris

## Architecture

```
.
├── api/    API REST : FastAPI, SQLModel, SQLite (aiosqlite), authentification JWT
└── web/    Interface : React 18, TypeScript strict, Vite, React Router
```

Chaque dossier a son propre README, avec le détail de l'installation, de la configuration et de la structure du code :

- [`api/README.md`](api/README.md)
- [`web/README.md`](web/README.md)

## Prérequis

- Python 3.11 ou plus (avec le module `venv`)
- Node.js 18 ou plus et npm
- Git

## Lancer le projet en local

Il faut deux terminaux : un pour l'API, un pour le frontend. Toutes les commandes partent de la racine du dépôt.

### 1. API (terminal 1)

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate          # sous Windows : .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Générer une clé secrète et la coller dans `.env` à la place de `JWT_SECRET_KEY` :

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Peupler le catalogue (40 bières, 9 catégories), puis démarrer le serveur :

```bash
python3 seed.py
python3 -m uvicorn app.main:app --reload
```

L'API tourne sur `http://localhost:8000`. La documentation interactive est sur `http://localhost:8000/docs`.

### 2. Frontend (terminal 2)

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

Ouvrir **`http://localhost:5173`**.

> Utiliser bien `localhost` et non `127.0.0.1` : l'API n'autorise en CORS que l'origine `http://localhost:5173`, les requêtes depuis `127.0.0.1` sont bloquées par le navigateur.

### 3. Premiers pas

1. Cliquer sur **Inscription** et créer un compte (mot de passe d'au moins 8 caractères).
2. Parcourir le catalogue : recherche (avec délai de 400 ms), filtre par catégorie, défilement infini ou pagination classique.
3. Ouvrir une bière et l'ajouter à sa collection.
4. Dans **Ma collection** : filtrer par statut, trier, modifier la note et le commentaire, supprimer.
5. Dans **Statistiques** : total, répartition par statut, note moyenne.

## Tests

Frontend (vitest) :

```bash
cd web
npm test
```

Les tests couvrent le debounce, `useLocalStorage`, le client HTTP (traduction des erreurs, en-tête `Authorization`, déconnexion sur 401), les composants `StatutBadge` et `Pagination`, et la redirection des routes protégées.

## Fonctionnalités

- Inscription, connexion, déconnexion (JWT)
- Catalogue : recherche, filtre par catégorie, pagination ou défilement infini
- Collection personnelle : ajout, statut (`à découvrir`, `en cours`, `terminé`), note de 1 à 5, commentaire, suppression
- Statistiques de la collection
- Routes `/collection` et `/stats` protégées
- Thème clair / sombre
- États de chargement, d'erreur et de collection vide sur chaque écran qui appelle l'API
- Affichage lisible dès 375 px de large

## Sécurité

- Mots de passe hachés (bcrypt), jamais renvoyés en clair.
- Token JWT à expiration courte (30 minutes par défaut).
- CORS limité à `http://localhost:5173`.
- Chaque entrée de collection n'est modifiable que par son propriétaire (vérifié côté serveur).
- Le token est conservé dans le `localStorage` du navigateur : c'est simple, mais un script injecté (XSS) pourrait le lire. Une alternative plus sûre serait un cookie `httpOnly` + `Secure` posé par le serveur. Le courte durée de vie du token limite l'impact d'un vol.
- Le fichier `.env` n'est jamais versionné ; seul `.env.example` l'est.

## Contrat d'API

Le contrat complet (routes, schémas, codes d'erreur) est visible en direct sur `http://localhost:8000/docs`. Les erreurs ont toutes le même format :

```json
{ "erreur": { "code": 404, "message": "Bière introuvable" } }
```