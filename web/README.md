# Ma Collection - Frontend

Interface React/TypeScript qui consomme l'API du dossier `api/`. Univers : la bière.

## Prérequis

- Node.js 18 ou plus
- L'API doit tourner sur `http://localhost:8000` (voir `api/README.md`)

## Installation

```bash
cd web
npm install
cp .env.example .env
```

## Lancement

```bash
npm run dev
```

Ouvrir `http://localhost:5173` (pas `127.0.0.1`, sinon le CORS bloque les requêtes vers l'API).

## Build de production

```bash
npm run build
```

## Structure du code

```
src/
├── types/api.ts              types du contrat d'API, écrits à la main
├── services/                 un fichier par domaine (auth, items, collection)
│   └── apiClient.ts           seul endroit où fetch() est appelé
├── contexts/
│   ├── AuthContext.tsx         token + utilisateur courant
│   └── CollectionContext.tsx   collection perso : CRUD, filtres, tri, stats
├── hooks/
│   ├── useLocalStorage.ts      hook générique, persistance du token
│   └── useDebounce.ts          debounce ~400ms sur la recherche
├── router/ProtectedRoute.tsx   redirige vers /login si pas de token
├── components/                composants réutilisables
└── pages/                     une page par écran
```

## Notes techniques

- TypeScript en mode `strict`, aucun `any` dans le code.
- Les catégories du filtre catalogue (`constants/categories.ts`) sont codées en dur côté front, faute d'endpoint dédié côté API pour les lister. Elles correspondent aux catégories utilisées dans `api/seed.py`.
- Le token JWT est stocké dans le `localStorage` du navigateur. C'est simple mais vulnérable au XSS : un script injecté pourrait le lire. Une alternative plus sûre serait un cookie `httpOnly` + `Secure` posé par le serveur.
