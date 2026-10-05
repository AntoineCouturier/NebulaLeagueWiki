# Nebula League sur Cloudflare Workers

Site publié : https://nebula-league.nightmarefoxy26.workers.dev
Base de production : `nebula-league-db`. Le binding D1 et l’origine de production
sont configurés. `NEBULA_SESSION_SECRET` est enregistré chez Cloudflare.
Le secret `DISCORD_CLIENT_SECRET` et l’adresse de retour Discord sont configurés.
La connexion réelle a été validée dans le navigateur, avec association automatique
à la fiche Antoine et création de session dans D1. `DISCORD_BOT_TOKEN` est également
configuré : les 11 avatars Discord ont été vérifiés avec succès sur l’API publiée.

Nebula utilise React et TypeScript, les CSS actuels, un Worker pour les API et
D1 pour les données partagées et les comptes. La base Project Slayer reste séparée.

## Administration

Ouvre `/admin` après connexion Discord. Seul le compte `725931972802904115`
est administrateur (`ADMIN_DISCORD_IDS`). Les API vérifient ce droit à chaque demande.
Les formulaires gèrent joueurs, clubs, personnages, titres, matchs, saisons,
calendriers et barèmes. Le score vient des buts saisis. Terminer une saison
archive les notes techniques. Chaque enregistrement conserve la version précédente ;
« Historique » permet de la restaurer. Une modification concurrente exige un rechargement.
Les nouveaux joueurs ont une fiche accessible sans créer de fichier HTML.

« Membres Discord » utilise le bot dans le serveur `1090677322157408296`.
Le bot doit être présent dans ce serveur et **Server Members Intent** doit être
activé dans le portail Discord (Bot → Privileged Gateway Intents). La liste est
privée et réservée à l’administration. Choisir un membre remplit son identifiant
sur la fiche ; sa prochaine connexion Discord retrouve automatiquement celle-ci.
Cela ne connecte jamais quelqu’un à sa place : chaque membre autorise sa connexion.
Pour une nouvelle base, appliquer les migrations et importer `db/seed.sql` avant
de déployer. Le seed ajoute les collections manquantes sans écraser les existantes.

## Aperçu local

Avec Node.js 22.13 minimum, installer avec `pnpm install` (ou `npm install`),
puis lancer `pnpm dev` (ou `npm run dev`). Aperçu : http://127.0.0.1:8787.
La commande compile les pages, crée les tables locales et importe les données
sans remplacer les entrées déjà présentes. Après modification, arrêter l’aperçu,
relancer `pnpm dev` puis recharger le navigateur.
Vérifications : `pnpm build`, `pnpm typecheck`, `pnpm test`.

## Première mise en ligne

1. Se connecter : `pnpm exec wrangler login`.
2. Créer la base indépendante : `pnpm exec wrangler d1 create nebula-league-db`.
3. Renseigner son `database_id` dans `wrangler.jsonc`, binding `DB`.
4. Exécuter `pnpm build`, `pnpm db:remote`, puis `pnpm db:seed:remote`.
5. Remplacer `NEBULA_SITE_URL` dans `wrangler.jsonc` par l’origine HTTPS finale
   de Nebula, sans chemin ni paramètres. Exemple : https://nebula-league.SOUS-DOMAINE.workers.dev.
   Le sous-domaine du compte est visible dans **Workers & Pages** sur Cloudflare.
6. Exécuter `pnpm deploy`.

Le déploiement refuse un identifiant D1 fictif ou une adresse locale.
Pour Workers Builds avec Git : construction `pnpm build`, déploiement
`pnpm exec wrangler deploy`. Appliquer les migrations et le premier import avant
la première publication. Seuls les fichiers de `dist` sont publiés.

## Discord

L’application des photos peut aussi gérer la connexion. Identifiant public déjà
configuré : **1531381492930969820**.

Dans le [Discord Developer Portal](https://discord.com/developers/applications),
ouvrir l’application, puis **OAuth2 → Redirects** et ajouter exactement
`https://ADRESSE-DE-NEBULA/api/auth/callback`.
Pour un test local, ajouter aussi `http://127.0.0.1:8787/api/auth/callback`.
Conserver les autres adresses déjà utilisées par cette application.

Dans **Worker Nebula → Settings → Variables and Secrets**, ajouter :

- `DISCORD_CLIENT_SECRET` : secret OAuth2, différent du token du bot.
- `NEBULA_SESSION_SECRET` : chaîne aléatoire d’au moins 32 caractères.
- `DISCORD_BOT_TOKEN` : token du bot existant, pour les avatars uniquement.

Alternative : `pnpm exec wrangler secret put NOM_DU_SECRET`.
Ne pas placer ces secrets dans Git, le chat, le code client ou `wrangler.jsonc`.
Pour les tests locaux, copier `.dev.vars.example` vers `.dev.vars`, saisir les
valeurs et redémarrer l’aperçu. Ce fichier est ignoré par Git.

La connexion demande seulement `identify`. Cookies HttpOnly, SameSite=Lax,
Secure en HTTPS. États OAuth à usage unique, valables dix minutes. Sessions
valables 24 heures et révocables à la déconnexion. Aucun token OAuth conservé.
Les fiches sont associées par `discordId` ; un visiteur ne peut pas s’attribuer
une fiche au choix.

## Données et transition React

`JavaScript/nebula-data.js` reste le registre du premier import et le moteur des
calculs. La compilation extrait clubs, groupes, joueurs, matchs, saisons et
réglages de calendrier vers `db/seed.sql`, sans ajouter de fausses données.
Le premier import contient 11 joueurs et zéro match terminé.

Les pages chargent D1 via `/api/league` avant les calculs. Aucun repli silencieux
vers des tableaux compilés en cas de panne. Les collections sont stockées en JSON
dans la table SQL `league_data`, comme les espaces de tournois de Project Slayer.
Comptes, sessions et états OAuth ont leurs propres tables SQL.

Le premier import ne remplace jamais une entrée existante. Modifier le registre
JS et reconstruire ne modifie donc pas une base déjà importée. Ensuite, modifier
les lignes dans D1 ou préparer une migration SQL explicite, après sauvegarde.
`/admin` enregistre maintenant les résultats et réglages directement dans D1.
Le bot a été ajouté au serveur et Server Members Intent a été activé ; la
récupération des membres a été validée depuis l’administration publiée.

Les 29 pages sont rendues par React depuis les modèles HTML existants. Les chemins
`.html`, les CSS et les scripts de calcul restent compatibles. La connexion est
un composant React natif. Les autres interactions conservent leurs scripts DOM :
leur réécriture complète en composants est une étape distincte.

Documentation : [Workers](https://developers.cloudflare.com/workers/static-assets/),
[D1](https://developers.cloudflare.com/d1/),
[OAuth2 Discord](https://docs.discord.com/developers/topics/oauth2).
