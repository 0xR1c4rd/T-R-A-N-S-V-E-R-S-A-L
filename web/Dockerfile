# ---- Étape 1 : compilation de l'application (Node) ----
FROM node:20-alpine AS build
WORKDIR /app

# On copie d'abord les fichiers de dépendances : tant qu'ils ne changent pas,
# Docker réutilise le cache et ne relance pas npm ci.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# L'adresse de l'API est figée dans le JavaScript au moment du build :
# c'est le navigateur de l'utilisateur qui appelle l'API, pas le conteneur.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Étape 2 : service des fichiers statiques (nginx) ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80