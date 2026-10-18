# Nebula League — refonte « Salle de contrôle Blue Lock »

Refonte appliquée le 18 octobre 2026. Elle reprend les illustrations de titres partagées ajoutées le 16 octobre (`CSS/title-art.css`, `JavaScript/title-art.js`) : la page Titres et les fiches joueurs affichent les mêmes dessins, en bleu.

Le site devient la salle de surveillance d'Ego Jinpachi : chaque page est un mur d'écrans, avec des flux caméra, des bandeaux OSD, un voyant REC rouge, des codes temporels, des rangs géants `#001` et quelques katakana. Les données, les identifiants, les attributs `data-*` et la structure des pages ne changent pas : seul l'habillage change.

## Ce qui change partout

- **Palette** : fond encre marine et bleu électrique Blue Lock. Le vert acide, le cyan et le violet de l'ancien site ont disparu. Le rouge ne sert plus qu'au REC, au DIRECT et aux alertes. Les joueurs retraités et les archives passent en gris « hors ligne ». Les couleurs de clubs restent, mais seulement en fin liseré d'identité.
- **Typographie** : Chakra Petch pour les titres et les chiffres, IBM Plex Sans pour le texte, IBM Plex Mono pour les bandeaux techniques. Orbitron et Inter ne s'affichent plus, et aucun texte ne descend sous 11 px.
- **En-tête** : il porte un bandeau OSD (NL-CTRL // SALLE DE CONTRÔLE, sujets sous surveillance, horloge en direct). Le menu est regroupé en canaux numérotés (Accueil, Ligue, Effectifs, Compétition, Règles) avec des menus déroulants, un bouton Rechercher (Ctrl+K ou « / ») et une pastille « SAISON 01 ». Sur mobile, l'en-tête est compact : recherche, REC et menu plein écran.
- **Héros** : chaque page ouvre sur un écran. Selon la page, c'est un mur de caméras, un flux plein cadre, une mire ou une bande bleue, toujours avec un bandeau « REC // CAM nn ». Le numéro de canal (CH 01 à CH 12) reprend celui de l'écran correspondant sur le mur de l'accueil.
- **Sections** : chaque section a un en-tête numéroté (bloc « CH 01 » et grand titre), et des bandes bleues pleine largeur rythment la lecture. Les filtres prennent la forme de consoles, les onglets celle de canaux (« EN DIRECT » sur l'onglet actif). Toute liste vide affiche une mire « PAS DE SIGNAL » au lieu d'un blanc.
- **Pied de page** : il est commun à toutes les pages, avec des accès rapides et un lien « Retour en haut ».
- **Animations** : les blocs apparaissent au défilement. Tout est visible d'emblée si l'utilisateur a choisi de réduire les animations.

## Page par page

- **Accueil** (`index.html`) : un mur de caméras des joueurs encadre le titre géant « NEBULA LEAGUE » et le slogan « Ton ego est sous surveillance ». En dessous viennent les chiffres clés, « Le direct de la ligue » (prochain match, compte à rebours, joueur n° 1) et « Toute la ligue, un seul mur » : les 12 rubriques du site présentées comme 12 écrans. La page se termine sur une bande bleue « Ton ego. Ta trace. #001 ».
- **Joueurs** (`players.html`) : le héros est un panneau bleu accompagné du line-up des cinq premiers (#001 à #005). Les filtres forment une « console de sélection ». Chaque joueur devient un écran caméra avec son rang ; les retraités sont marqués « NON CLASSÉ ».
- **Fiches joueurs** (`Joueurs/…`, 11 fiches) : le portrait est filmé (« SUJET VERROUILLÉ », zoom, signal), avec un rang géant `#001` et la note globale. L'en-tête montre le titre actif et une bande d'identité (pseudo, club, personnage, valeur). Les onglets Technique, Matchs et Palmarès sont des canaux ; les stats s'affichent en VU-mètres, avec un radar. Les retraités passent en gris, « NON CLASSÉ // ARCHIVÉ ».
- **Clubs** (`club.html`) : « Choisissez votre club » ouvre sur un tableau tactique (formation, postes occupés ou vacants). Les clubs se choisissent sur une rangée de caméras CAM 01 à 06. Suivent le Centre tactique, les Leaders historiques (bande bleue) et l'Historique du club.
- **Matchs** (`matchs.html`) : le héros est une mosaïque des six clubs, sous le titre « Chaque but laisse une trace ». Viennent ensuite l'écran « Le dernier direct » (mire « PAS DE SIGNAL » tant qu'aucun match n'est joué), la console de filtres et les replays. La fiche d'un match s'ouvre comme un écran de replay, avec la courbe des buts.
- **Saison** (`saison.html`) : l'écran « Cycle maître » affiche un grand « 01 », les caméras des clubs et le compte à rebours J-80. On y trouve aussi le sélecteur de saison, le classement des clubs, les leaders, une bande « Distinctions » et le « Journal des éditions ».
- **Calendrier** (`fixtures.html`) : « Le temps de la ligue » présente la prochaine diffusion, domicile contre extérieur, avec un compte à rebours jours/heures/minutes. Le calendrier offre deux vues (mois ou chronologie), la fiche d'une rencontre s'ouvre en fenêtre, et une bande montre les phases de la saison.
- **Records** (`stats.html`) : un écran « record en direct » propose des canaux Buts, Passes, Défense, Dribble et Valeur. Suivent les compteurs, les détenteurs de records en caméras, l'archive des clubs, les classements joueurs et le « Coffre des records ».
- **Règles** (`rules.html`) : un chronomètre officiel affiche 06:00 + 06:00 = 12:00. On trouve ensuite le format du match, le protocole fair-play (bande bleue), le parcours NCL en tableau final et la référence rapide. La page se clôt sur une bande « Jouez pour gagner… ».
- **Valeurs** (`valeur.html`) : un mur de portraits accompagne « Vos perfs deviennent valeurs » et la cote maximale. La page présente ensuite le tableau du marché, un bandeau défilant des cotes, le protocole des gains (+50 à +250) et un simulateur de valeur en console.
- **Titres** (`title.html`) : le héros est un mur de 29 profils. La section Titres globaux regroupe protocoles, parcours de carrière et « Héritage de la ligue ». Le codex « Choisissez votre arme » propose des filtres de rareté et affiche le dossier du personnage choisi.
- **Face à face** (`headtohead.html`) : deux caméras A et B en recherche de cible, séparées par une colonne bleue « VS », avec un mode clubs ou joueurs. Viennent ensuite « Configurer le duel » et la matrice de performance, qui affiche une mire tant que les deux profils ne sont pas choisis.
- **Équipes idéales** (`dream-team.html`) : un flux plein cadre accompagne la formation 3-2 et l'indice collectif. On trouve ensuite « Le cinq sous surveillance » (terrain et Best Five), le « Banc d'élite » et la « Formule de sélection » sur une bande bleue.
- **Progression** (`progression.html`) : la courbe des joueurs s'affiche comme un oscilloscope. La page propose le choix d'une trajectoire (multivue de caméras), le relevé du sujet sur une bande bleue, la trajectoire de valeur et le journal match par match.
- **Admin** (`admin.html`) : une mire de test accompagne « Centre de gestion local » et le registre chargé. Le « Dossier du match » s'organise en consoles : tableau de score, fiche technique, buts, notes et bloc à copier. Le fonctionnement ne change pas : la page ne modifie toujours aucun fichier.

## Dernière passe de contrôle

- **Bandeaux OSD des héros** : ils ont été harmonisés sur Calendrier, Équipes idéales et Progression, dans le même ordre que partout (REC, CAM nn, info, katakana, info).
- **Restes de violet** : ils ont été retirés de l'en-tête (bordure et ombre), et les anciennes variables acide et cyan pointent maintenant vers les bleus.
- **Titres** : deux conditions du dossier personnage restaient invisibles sur grand écran. Elles s'affichent désormais.
- **Matchs (mobile)** : le libellé « HORS LIGNE » était coupé sur la mire vide. Seul le voyant reste affiché.
- **Fiche des retraités** : le logo « retraite », presque invisible (un disque noir sur fond sombre), reçoit désormais un halo qui le rend lisible.
- **Autres ajustements** : sur téléphone, l'image du héros de l'accueil est atténuée et les titres de section sont un peu plus petits. Une mire compacte a été ajoutée au kit.

## Contrôles effectués

- Les 15 pages et 3 fiches (BM, PXG, retraité) ont été testées à 1440 px et à 390 px, une fois avec les données actuelles et une fois avec un match d'exemple injecté.
- Aucune erreur JavaScript et aucun défilement horizontal. Les erreurs 404 des avatars Discord viennent de l'environnement de test et ont été ignorées.
- Fonctions testées :
  - menus déroulants, menu mobile, palette Ctrl+K ;
  - recherche, filtres et tri des joueurs, onglets des fiches ;
  - filtres et fenêtres des matchs et du calendrier ;
  - sélecteur de saison, simulateur de valeur, sélecteurs du face-à-face, onglets des titres.
- Animations d'apparition : tous les blocs finissent visibles.
- Fichiers :
  - les fins de ligne (CRLF ou LF) de chaque fichier sont conservées ;
  - les blocs `<!-- meta:start --> … <!-- meta:end -->` sont identiques à la base ;
  - `JavaScript/nebula-data.js` n'a pas été touché ;
  - les 11 fiches sont identiques à la sortie du générateur (`mkdir -p Autre && node scripts/players.mjs`, qui répond « Toutes les fiches sont à jour »).

## Points connus

- Il n'y a encore aucun match dans les données : beaucoup d'écrans affichent donc des mires ou des compteurs à 00. L'état « avec matchs » a été vérifié avec un match d'exemple.
- Les couleurs de clubs (rouge Bastard, vert Ubers, jaune Barcha, cyan Manshine) restent en liseré. Le liseré rouge de Bastard peut se lire comme une alerte.
- `CSS/style.css` et `CSS/legacy-pages.css` ne sont plus chargés par aucune page. On peut les supprimer plus tard.
- Les `<head>` des pages chargent encore l'ancien lien Google Fonts (Orbitron, Inter, JetBrains Mono). Ces polices ne s'affichent plus, car `theme-monitor.css` les redirige vers Chakra Petch et IBM Plex. Le lien peut être retiré pour alléger le chargement.
- Sur mobile, les noms de clubs longs sont abrégés (« … ») dans certains tableaux (Valeurs, Records, Saison). Sur Règles, entre 1281 et 1440 px, le sous-titre du canal actif est abrégé de la même façon.
- Les champs date de l'admin suivent la langue du navigateur.
- Les palettes de titres de `Joueurs/player-card.js` (`CHARACTER_ULTIMATE_PALETTES`) restent dans le code comme données, mais l'affichage les ramène sur les bleus.

## Liste technique des fichiers (base -> monitor)

Calculée par comparaison octet par octet du site du 10 octobre et de la refonte, sans compter ce fichier ni la fusion du 18 octobre avec les illustrations de titres : 2 nouveaux fichiers, 62 fichiers modifiés, 0 fichiers supprimés. Les colonnes +/- donnent les lignes ajoutées et retirées, fins de ligne ignorées.

### Nouveaux fichiers

| Fichier | Fin de ligne | Rôle |
|---|---|---|
| `CSS/theme-monitor.css` | CRLF | Nouvelle couche commune « salle de contrôle » (jetons, polices, kit `nl-*`, couche `nl-force`), chargée en dernier sur toutes les pages. |
| `ROLLOUT.md` | CRLF | Guide de déploiement de la direction (en anglais, pour les prochains développements). |

### Modifiés — Pages

| Fichier | + | - | Note |
|---|---:|---:|---|
| `admin.html` | 237 | 117 |  |
| `club.html` | 94 | 46 |  |
| `dream-team.html` | 192 | 47 |  |
| `fixtures.html` | 189 | 110 |  |
| `headtohead.html` | 115 | 81 |  |
| `index.html` | 243 | 318 |  |
| `matchs.html` | 111 | 55 |  |
| `players.html` | 92 | 82 |  |
| `progression.html` | 178 | 61 |  |
| `rules.html` | 303 | 194 |  |
| `saison.html` | 88 | 46 |  |
| `stats.html` | 200 | 102 |  |
| `title.html` | 282 | 206 |  |
| `valeur.html` | 206 | 122 |  |

### Modifiés — Feuilles de style

| Fichier | + | - | Note |
|---|---:|---:|---|
| `CSS/admin.css` | 1205 | 612 |  |
| `CSS/club.css` | 1758 | 1687 |  |
| `CSS/colors.css` | 4 | 2 | `--acid` et `--cyan` historiques remappés sur les bleus du thème. |
| `CSS/dream-team.css` | 1424 | 440 |  |
| `CSS/fixtures.css` | 2000 | 2243 |  |
| `CSS/global-theme.css` | 40 | 44 | Bordure et ombre du header passées du violet au bleu ; règles de largeur inutilisées retirées. |
| `CSS/headtohead.css` | 1668 | 1578 |  |
| `CSS/home.css` | 966 | 2102 |  |
| `CSS/legacy-pages.css` | 4 | 4 | Plus chargée par aucune page ; seulement recolorée (cyan -> bleu) au cas où. |
| `CSS/match.css` | 1929 | 1905 |  |
| `CSS/players.css` | 1084 | 1263 |  |
| `CSS/progression.css` | 1622 | 458 |  |
| `CSS/responsive.css` | 9 | 339 | Blocs « pages historiques » retirés ; h1/h2 ne se coupent plus en plein mot ; tableaux à 11 px minimum. |
| `CSS/rules.css` | 1917 | 1398 |  |
| `CSS/saison.css` | 2085 | 2541 |  |
| `CSS/stats.css` | 1485 | 1395 |  |
| `CSS/title.css` | 2312 | 2767 |  |
| `CSS/valeur.css` | 1463 | 1238 |  |

### Modifiés — JavaScript

| Fichier | + | - | Note |
|---|---:|---:|---|
| `JavaScript/admin.js` | 49 | 13 |  |
| `JavaScript/club.js` | 223 | 94 |  |
| `JavaScript/dream-team.js` | 200 | 32 |  |
| `JavaScript/fixtures.js` | 109 | 80 |  |
| `JavaScript/hamburger.js` | 44 | 1 | Bandeau OSD de l'en-tête, horloge en direct et pastille « SAISON » injectés. |
| `JavaScript/headtohead.js` | 135 | 63 |  |
| `JavaScript/home-feed.js` | 68 | 8 | Fil d'activité de l'accueil (derniers résultats, prochaine rencontre, leaders) rendu en écrans. |
| `JavaScript/match-page.js` | 269 | 107 |  |
| `JavaScript/players.js` | 66 | 29 |  |
| `JavaScript/progression.js` | 289 | 85 |  |
| `JavaScript/reveal.js` | 24 | 10 | Apparitions au défilement (`nl-pending`), désactivables par `data-reveal="off"`. |
| `JavaScript/rules.js` | 22 | 5 |  |
| `JavaScript/saison.js` | 395 | 215 |  |
| `JavaScript/stats.js` | 199 | 95 |  |
| `JavaScript/titles.js` | 110 | 27 |  |
| `JavaScript/valeur.js` | 146 | 38 |  |

### Modifiés — Fiches joueurs (modèle, style et script communs, puis les 11 fiches générées)

| Fichier | + | - | Note |
|---|---:|---:|---|
| `Joueurs/barcha/leandro.html` | 28 | 2 |  |
| `Joueurs/bm/alessio.html` | 28 | 2 |  |
| `Joueurs/bm/antoine.html` | 28 | 2 |  |
| `Joueurs/bm/dylan.html` | 28 | 2 |  |
| `Joueurs/manshine/elijah.html` | 28 | 2 |  |
| `Joueurs/manshine/imrane.html` | 28 | 2 |  |
| `Joueurs/manshine/william.html` | 28 | 2 |  |
| `Joueurs/player-card.css` | 2055 | 1984 | Fiche joueur refaite (caméra, rang géant, VU-mètres, radar SVG). |
| `Joueurs/player-card.js` | 122 | 33 | Rendu de la fiche : rang `#001` / NON CLASSÉ, titres ramenés sur l'échelle bleue (`monitorTitleAccents()`). |
| `Joueurs/pxg/enzo.html` | 28 | 2 |  |
| `Joueurs/pxg/jason.html` | 28 | 2 |  |
| `Joueurs/retraite/matheo.html` | 28 | 2 |  |
| `Joueurs/retraite/theo.html` | 28 | 2 |  |
| `scripts/templates/joueur.html` | 28 | 2 | Modèle des fiches : `theme-monitor.css`, `nl-migrated`, ancre `#top`, pied de page `nl-footer`. |

Pages HTML : la feuille `CSS/theme-monitor.css` est ajoutée en dernier, le lien vers `CSS/style.css` est retiré là où il existait, la classe `nl-migrated` est posée sur `body`, et le contenu visuel est restructuré autour du kit `nl-*`. Les identifiants et les attributs `data-*` lus par le JavaScript sont conservés. Les fiches joueurs n'ont pas été retouchées à la main : elles sortent du générateur.
