# Dockerisation - William Food Truck (Expo Web)

Ce projet est une app Expo (React Native) ciblant le web. Deux modes sont fournis:
- Dev: serveur Expo Web avec rechargement à chaud
- Prod: build statique via `expo export` servi par Nginx

Prérequis: Docker et Docker Compose installés.

## Lancer en développement (web)

```bash
docker compose up dev
```

Puis ouvrir: http://localhost:8081

Notes:
- Le serveur est démarré avec `npx expo start --web --port 8081`.
- Le code est monté dans le conteneur (bind mount) pour le hot reload.
- Si vous changez le port, modifiez aussi le mapping `ports` et la commande.

## Lancer en production (build statique)

Build + run via Compose:
```bash
docker compose up --build prod
```
Ou manuellement:
```bash
docker build -t william-food-truck-web .
docker run --rm -p 8080:80 william-food-truck-web
```

Ouvrir: http://localhost:8080/nicolas-willaume-food-truck

## Détails techniques
- Dockerfile multi-stage:
  - Etape Node: `npm ci` + `npx expo export -p web` -> sorties dans `dist/`
  - Etape Nginx: sert `dist/` (SPA fallback activé)
- `app.json` contient `experiments.baseUrl` fixé à `/nicolas-willaume-food-truck` (utile pour un déploiement sous sous-chemin, ex: GitHub Pages). Nginx gère ce préfixe.
- `.dockerignore` réduit le contexte de build.

## Dépannage
- Port déjà utilisé: changez `8081` (dev) ou `8080` (prod) dans `docker-compose.yml`.
- Expo ne recharge pas en dev: variables `CHOKIDAR_USEPOLLING`/`WATCHPACK_POLLING` sont activées; selon l’OS, vous pouvez augmenter `--poll` côté watchers mais généralement inutile.
- Build échoue: supprimez le dossier `node_modules` local si nécessaire; le conteneur exécute `npm ci` proprement.
