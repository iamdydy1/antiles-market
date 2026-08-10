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

## Fonctionnalités déjà développées sur `develop`

- Identité visuelle bleu marine + orange, responsive mobile
- Inscription, connexion et déconnexion
- Mots de passe hashés et sessions en cookie HttpOnly
- Espace utilisateur protégé
- Modèles PostgreSQL pour utilisateurs, annonces, favoris, conversations, messages et signalements
- Catalogue de départ : 23 territoires / îles et 12 grandes catégories
- Dépôt d'annonce authentifié
- Prix et devise adaptés au territoire
- Jusqu'à 8 photos par annonce (JPG, PNG, WebP)
- Stockage des photos dans le volume Docker `/app/uploads`
- Fiche d'annonce avec vendeur, territoire, catégorie et galerie
- Route de santé `/api/health`
- CI GitHub pour contrôler la compilation

## Fonctionnalités à poursuivre

- Recherche et filtres avancés
- Localisation par ville
- Favoris fonctionnels
- Messagerie privée en temps réel
- Gestion complète des annonces depuis le compte
- Signalement et modération
- Administration
- Comptes professionnels
- Mise en avant d'annonces
- Notifications

## Démarrage avec Docker

1. Copier `.env.example` vers `.env`.
2. Remplacer `POSTGRES_PASSWORD` et `AUTH_SECRET` par des valeurs fortes et uniques.
3. Initialiser la base puis charger le catalogue avec Prisma.
4. Lancer la stack Docker.

```bash
docker compose up -d --build
```

Le site sera disponible sur `http://IP_DU_SERVEUR:3000`.

La route de contrôle est disponible sur `http://IP_DU_SERVEUR:3000/api/health`.

## Branches

- `main` : version stable
- `develop` : développement en cours

La Pull Request de développement reste en brouillon jusqu'à ce que la V1 soit suffisamment stable pour être fusionnée dans `main`.
