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

Le fichier `.env` contient `VITE_API_URL`, l'adresse de l'API (par défaut `http://localhost:8000`).

## Lancement

```bash
npm run dev
```

Ouvrir `http://localhost:5173` (pas `127.0.0.1`, sinon le CORS bloque les requêtes vers l'API).

## Tests

```bash
npm test
```

Lance vitest : tests unitaires des hooks (`useDebounce`, `useLocalStorage`), du client HTTP (traduction des erreurs, en-tête `Authorization`, déconnexion sur 401), des composants `StatutBadge` et `Pagination` et de `ProtectedRoute`. Les fichiers de test sont à côté du code qu'ils testent (`*.test.ts` / `*.test.tsx`).

## Build de production

```bash
npm run build
```

## Fonctionnalités

- Inscription, connexion et déconnexion
- Catalogue avec recherche (debounce de 400 ms) et filtre par catégorie
- Deux modes d'affichage du catalogue au choix, mémorisé dans le navigateur : défilement infini ou pagination classique
- Fiche d'une bière et ajout à sa collection
- Collection personnelle : filtre par statut, tri par date ou par note, modification de la note et du commentaire, suppression
- Statistiques de la collection
- Routes `/collection` et `/stats` protégées
- Thème clair / sombre, mémorisé dans le navigateur (par défaut, celui du système)
- États de chargement, d'erreur et de liste vide sur chaque écran qui appelle l'API
- Affichage lisible dès 375 px de large

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
│   ├── useLocalStorage.ts      hook générique, persistance du token et des préférences
│   ├── useDebounce.ts          debounce ~400 ms sur la recherche
│   ├── useInfiniteScroll.ts    chargement de la page suivante en bas de liste
│   └── useTheme.ts             thème clair / sombre
├── router/ProtectedRoute.tsx   redirige vers /login si pas de token
├── constants/categories.ts    liste des catégories du filtre
├── components/                composants réutilisables
└── pages/                     une page par écran
```

## Notes techniques

- TypeScript en mode `strict`, aucun `any` dans le code.
- Le client HTTP (`apiClient.ts`) ajoute l'en-tête `Authorization`, et transforme le format d'erreur de l'API `{ "erreur": { "code", "message" } }` en erreur typée (`ApiError`) que les écrans affichent telle quelle.
- Si l'API répond 401 alors qu'un token était envoyé (token expiré en cours de session), le client déclenche la déconnexion : l'utilisateur est renvoyé vers `/login`.
- À la déconnexion, la collection et les statistiques en mémoire sont vidées, pour qu'un autre compte ne voie jamais les données du précédent.
- Les requêtes de la liste de la collection et des statistiques ont chacune leur propre état de chargement et d'erreur.
- La recherche du catalogue ignore les réponses périmées : si l'utilisateur change de recherche avant la fin d'une requête, l'ancien résultat est écarté.
- Les catégories du filtre catalogue (`constants/categories.ts`) sont codées en dur côté front, faute d'endpoint dédié côté API pour les lister. Elles correspondent aux catégories utilisées dans `api/seed.py`.
- Le token JWT est stocké dans le `localStorage` du navigateur. C'est simple mais vulnérable au XSS : un script injecté pourrait le lire. Une alternative plus sûre serait un cookie `httpOnly` + `Secure` posé par le serveur. La durée de vie courte du token limite l'impact d'un vol.