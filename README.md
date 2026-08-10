# Antilles Market

Marketplace de petites annonces pensée pour les Antilles et les îles voisines.

## Stack
Next.js 16, React 19, TypeScript, PostgreSQL, Prisma 7, Redis, Docker Compose.

## V1 de test disponible sur `develop`
- Comptes, connexion/déconnexion, sessions HttpOnly
- Annonces, prix/devise, jusqu'à 8 photos
- 23 territoires, villes/communes de départ et sous-catégories
- Recherche par mot-clé, île, ville, catégorie et prix
- Favoris et profils vendeurs publics
- Messagerie privée intégrée
- Gestion vendeur : modifier, réserver, vendre, archiver, republier, retirer
- Signalements, modération, administration utilisateurs, rôles et statistiques
- Rate limiting Redis sur connexion/inscription et headers HTTP de sécurité
- Healthcheck `/api/health`

## Test sur Unraid
Le compose lance lui-même PostgreSQL et Redis : vous n'avez pas besoin de les installer séparément.

```bash
cd /mnt/user/appdata
git clone -b develop https://github.com/iamdydy1/antiles-market.git
cd antiles-market
cp .env.example .env
nano .env
```

Dans `.env`, remplacez au minimum `YOUR_UNRAID_IP`, `CHANGE_THIS_DATABASE_PASSWORD` (aux deux endroits) et `CHANGE_THIS_TO_A_LONG_RANDOM_SECRET`.

Puis :
```bash
docker compose up -d --build
```

Le conteneur `antiles-market-setup` crée/synchronise les tables et charge automatiquement le catalogue au premier lancement. Quand il termine avec le code 0, c'est normal. Le site est ensuite disponible sur `http://IP_UNRAID:3000` et son contrôle de santé sur `http://IP_UNRAID:3000/api/health`.

Commandes utiles :
```bash
docker compose ps
docker compose logs -f app
docker compose logs setup
docker compose down
```

Les données persistent dans `/mnt/user/appdata/antilles-market/` (PostgreSQL, Redis et uploads).

## Important avant ouverture Internet
Cette branche est une V1 de test local/LAN. Avant une ouverture publique : HTTPS + domaine/Nginx, e-mails de vérification/récupération, politique de sauvegarde, tests de sécurité supplémentaires, CGU/confidentialité et monitoring.

## Branches
- `main` : stable
- `develop` : développement/test
