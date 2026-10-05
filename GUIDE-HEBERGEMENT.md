# Nebula League — HTML/CSS/JavaScript sur Cloudflare

Site : https://nebula-league.nightmarefoxy26.workers.dev

Les pages HTML, styles CSS et scripts JavaScript sont publiés directement.
Les données se modifient dans `JavaScript/nebula-data.js`, et les personnages dans
`JavaScript/titles.js`. Le centre local `admin.html` d’origine produit des brouillons
à recopier dans le registre ; il n’enregistre rien dans une base distante.

La seule API du Worker est `/api/discord-avatar?userId=...`. Elle utilise le secret
Cloudflare `DISCORD_BOT_TOKEN` et accepte uniquement les identifiants des joueurs
du registre. Les identifiants autorisés sont actualisés pendant la compilation.
Les pages conservent leur image de secours si Discord est indisponible.

Il n’y a plus de connexion Discord, de gestion des membres, d’administration en
ligne, de bundle React ni de dépendance à D1 pour le site publié.

## Utilisation

- `pnpm build` : copie le site dans `dist` et actualise les identifiants d’avatars.
- `pnpm dev` : lance le site avec l’API locale sur `http://127.0.0.1:8787`.
- `pnpm test` : vérifie la version statique et l’API d’avatars.
- `pnpm deploy` : compile puis publie sur Cloudflare.

Pour les avatars en local, renseigner `DISCORD_BOT_TOKEN` dans `.dev.vars`.
En production, ce secret reste dans Cloudflare. Ne jamais le placer dans le code
client, Git ou le chat.

La migration précédente est conservée dans `archive/cloudflare-comptes`, hors
publication. La base D1 distante est conservée sans binding au site actuel.
