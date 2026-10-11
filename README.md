# Ma Collection
 
Application web de collection personnelle sur le thème de la **bière** : on parcourt un catalogue de bières, on ajoute celles qui nous intéressent à sa collection, puis on les note, on les commente et on suit son avancement.
 
Projet de fin de cours (Python + React/TypeScript), réalisé en binôme :
 
- **Backend** (`api/`) : Martin Desbans
- **Frontend** (`web/`) : Sacha Paris
## Architecture
 
```
.
├── api/                 API REST : FastAPI, SQLModel, SQLite (aiosqlite), authentification JWT
├── web/                 Interface : React 18, TypeScript strict, Vite, React Router
└── docker-compose.yml   lance l'API et le site ensemble
```
 
Chaque dossier a son propre README, avec le détail de l'installation, de la configuration et de la structure du code :
 
- [`api/README.md`](api/README.md)
- [`web/README.md`](web/README.md)
## Prérequis
 
Pour un lancement local :
 
- Python 3.11 ou plus (avec le module `venv`)
- Node.js 18 ou plus et npm
- Git
Pour un lancement avec Docker : Docker avec le plugin Compose (seuls Git et Docker sont alors nécessaires).
 
## Récupérer le projet
 
```bash
git clone https://github.com/0xR1c4rd/T-R-A-N-S-V-E-R-S-A-L.git
cd T-R-A-N-S-V-E-R-S-A-L
```
 
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
 
Générer une clé secrète :
 
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```
 
Ouvrir le fichier `api/.env` et coller la valeur générée à la place de `JWT_SECRET_KEY`. Tant que cette valeur n'est pas remplacée, l'API refuse de démarrer.
 
Peupler le catalogue (40 bières, 9 catégories), puis démarrer le serveur :
 
```bash
python3 seed.py
python3 -m uvicorn app.main:app --reload
```
 
L'API tourne sur `http://localhost:8000`. La documentation interactive est sur `http://localhost:8000/docs`. Le script `seed.py` peut être relancé sans créer de doublons.
 
### 2. Frontend (terminal 2)
 
```bash
cd web
npm install
cp .env.example .env
npm run dev
```
 
Ouvrir **`http://localhost:5173`**.
 
> Utiliser bien `localhost` et non `127.0.0.1` : l'API n'autorise en CORS que l'origine `http://localhost:5173`, les requêtes depuis `127.0.0.1` sont bloquées par le navigateur.
 
## Lancer le projet avec Docker
 
Depuis la racine du dépôt :
 
```bash
cp api/.env.example api/.env
python3 -c "import secrets; print(secrets.token_hex(32))"
```
 
Coller la valeur générée dans `api/.env` à la place de `JWT_SECRET_KEY`, puis :
 
```bash
docker compose up --build
```
 
- Le site est sur `http://localhost:5173`.
- L'API est sur `http://localhost:8000` (documentation sur `/docs`).
- Le catalogue est peuplé automatiquement au démarrage de l'API.
- La base SQLite est conservée dans un volume Docker : les comptes et collections survivent à un redémarrage.
Arrêter : `Ctrl+C`, puis `docker compose down`. Pour supprimer aussi la base de données : `docker compose down -v`.
 
> Les ports 8000 et 5173 doivent être libres : arrêter les serveurs lancés en local avant de démarrer Docker.
 
## Premiers pas
 
1. Cliquer sur **Inscription** et créer un compte (mot de passe d'au moins 8 caractères).
2. Parcourir le catalogue : recherche (avec un délai de 400 ms), filtre par catégorie, défilement infini ou pagination classique.
3. Ouvrir une bière et l'ajouter à sa collection.
4. Dans **Ma collection** : filtrer par statut, trier, modifier la note et le commentaire, supprimer.
5. Dans **Statistiques** : total, répartition par statut, note moyenne.
## Tests
 
API (pytest) :
 
```bash
cd api
source .venv/bin/activate
pip install -r requirements-dev.txt
python3 -m pytest
```
 
Frontend (vitest) :
 
```bash
cd web
npm test
```
 
Les tests de l'API couvrent l'authentification, le catalogue, la collection et la sécurité. Ceux du frontend couvrent le debounce, `useLocalStorage`, le client HTTP (traduction des erreurs, en-tête `Authorization`, déconnexion sur 401), les composants `StatutBadge` et `Pagination`, et la redirection des routes protégées.
 
## Fonctionnalités
 
- Inscription, connexion, déconnexion (JWT)
- Catalogue : recherche, filtre par catégorie, pagination ou défilement infini
- Fiche détaillée d'une bière
- Collection personnelle : ajout, statut (`à découvrir`, `en cours`, `terminé`), note de 1 à 5, commentaire, suppression
- Filtre par statut et tri par date ou par note
- Statistiques de la collection
- Routes `/collection` et `/stats` protégées
- États de chargement, d'erreur et de liste vide sur chaque écran qui appelle l'API
- Affichage lisible dès 375 px de large
## Bonus réalisés
 
- Tests : pytest (API) et vitest (frontend)
- Défilement infini, avec bascule vers la pagination classique
- Thème clair / sombre
- Conteneurisation Docker
## Sécurité
 
- Mots de passe hachés (bcrypt), jamais renvoyés en clair.
- Token JWT à expiration courte (30 minutes par défaut).
- CORS limité à `http://localhost:5173`.
- Chaque entrée de collection n'est modifiable que par son propriétaire (vérifié côté serveur).
- La clé de signature du JWT vient d'un fichier `.env` non versionné ; seul `.env.example` est dans le dépôt.
- Le token est conservé dans le `localStorage` du navigateur : c'est simple, mais un script injecté (XSS) pourrait le lire. Une alternative plus sûre serait un cookie `httpOnly` + `Secure` posé par le serveur. La courte durée de vie du token limite l'impact d'un vol.
## Contrat d'API
 
Le contrat complet (routes, schémas, codes d'erreur) est visible en direct sur `http://localhost:8000/docs`. Toutes les erreurs ont le même format :
 
```json
{ "erreur": { "code": 404, "message": "Item introuvable" } }
```
 
## Dépannage
 
| Problème | Cause probable | Solution |
|---|---|---|
| « Impossible de joindre le serveur » | Site ouvert sur `127.0.0.1`, ou API éteinte | Ouvrir `http://localhost:5173` et vérifier que l'API tourne |
| L'API refuse de démarrer (clé manquante) | `JWT_SECRET_KEY` non remplacée dans `api/.env` | Générer une clé et la coller dans `api/.env` |
| `Address already in use` | Port 8000 ou 5173 déjà occupé | Arrêter l'ancien serveur (ou `docker compose down`) |
| `venv` introuvable sous Ubuntu | Module absent | `sudo apt install python3-venv` |