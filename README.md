# Antilles Market

Marketplace de petites annonces pensée pour les Antilles et les îles voisines.

## Objectif

Créer une plateforme moderne permettant aux particuliers et professionnels de publier, rechercher et gérer des annonces, puis de discuter directement grâce à une messagerie intégrée.

## Stack

- Next.js 16 + React 19 + TypeScript
- PostgreSQL
- Prisma ORM 7
- Redis
- Docker / Docker Compose
- Nginx en reverse proxy sur le serveur Unraid

## Fonctionnalités prévues

- Comptes utilisateurs
- Profils vendeurs
- Annonces avec photos
- Catégories et sous-catégories
- Recherche et filtres
- Filtrage par île / territoire / ville
- Favoris
- Messagerie privée
- Signalement et modération
- Administration
- Comptes professionnels
- Mise en avant d'annonces
- Notifications

## Démarrage avec Docker

1. Copier `.env.example` vers `.env`.
2. Remplacer les mots de passe et `JWT_SECRET` par des valeurs fortes.
3. Lancer :

```bash
docker compose up -d --build
```

Le site sera disponible sur `http://IP_DU_SERVEUR:3000`.

La route de contrôle est disponible sur `http://IP_DU_SERVEUR:3000/api/health`.

## Branches

- `main` : version stable
- `develop` : développement en cours

## État actuel

Le socle technique, Docker, la base de données et la première page d'accueil responsive sont en cours de construction.
