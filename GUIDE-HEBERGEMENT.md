# Héberger gratuitement la Nebula League

## Option recommandée : Cloudflare Pages avec GitHub

Le projet possède déjà un dépôt GitHub configuré :

`AntoineCouturier/NebulaLeagueWiki`

Cloudflare Pages convient au site parce qu'il est entièrement statique
(HTML, CSS et JavaScript).

### Première mise en ligne

1. Envoyez la dernière version du projet sur GitHub.
2. Créez un compte gratuit sur Cloudflare.
3. Ouvrez **Workers & Pages**.
4. Choisissez **Create application**, puis **Pages**.
5. Sélectionnez **Import an existing Git repository**.
6. Autorisez GitHub et choisissez `NebulaLeagueWiki`.
7. Utilisez les réglages suivants :

   - branche de production : `master` ;
   - framework : `None` ;
   - commande de construction : `exit 0` ;
   - dossier de sortie : `.`.

8. Lancez le déploiement.

Cloudflare fournira une adresse du type :

`https://nom-du-projet.pages.dev`

Chaque nouvelle modification envoyée sur la branche `master` déclenchera
ensuite automatiquement une nouvelle mise en ligne.

Documentation officielle :

- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/platform/limits/

## Option sans GitHub

Cloudflare Pages accepte aussi un dossier ou une archive par glisser-déposer :

1. Ouvrez **Workers & Pages**.
2. Choisissez **Create application**.
3. Choisissez **Drag and drop your files**.
4. Déposez une copie du projet sans le dossier `.git`.
5. Déployez le site.

Cette méthode oblige à renvoyer manuellement le dossier après chaque
modification. Un projet créé en import direct ne peut pas être converti ensuite
en projet connecté à Git sans en recréer un.

Documentation officielle :

- https://developers.cloudflare.com/pages/get-started/direct-upload/

## Alternative : GitHub Pages

GitHub Pages peut également publier le site directement depuis le dépôt.
Avec un compte GitHub gratuit, le dépôt doit être public. Cloudflare Pages est
donc plus flexible si le code doit rester privé.

Documentation officielle :

- https://docs.github.com/en/pages/getting-started-with-github-pages

## Si le projet passe en PHP

Cloudflare Pages et GitHub Pages n'exécutent pas PHP. Tant que le projet reste
en HTML, CSS et JavaScript, l'hébergement ci-dessus suffit. Si une version PHP
devient réellement nécessaire, il faudra choisir un hébergeur compatible PHP
ou déplacer la logique dynamique vers des fonctions côté serveur.
