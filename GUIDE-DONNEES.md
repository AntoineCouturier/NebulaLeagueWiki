# Données de la Nebula League

Les données communes du site sont regroupées dans :

`JavaScript/nebula-data.js`

Les pages récupèrent ensuite ces informations automatiquement. Il ne faut plus
recopier les mêmes clubs, couleurs, joueurs ou rencontres dans plusieurs scripts.

## Ajouter un joueur

Ajoutez une entrée dans le tableau `players` :

```js
{
    name: "Prénom",
    club: "bastard",
    folder: "bm",
    position: "CF",
    value: 0,
    avatarPath: "Joueurs/images-joueurs/prenom.png"
}
```

Le joueur apparaîtra automatiquement dans :

- la page Joueurs ;
- l'effectif et le terrain de son club ;
- la page Valeurs ;
- les sélecteurs et compteurs qui utilisent les joueurs.

La fiche individuelle reste une page HTML. Pour un nouveau joueur, dupliquez une
fiche existante dans le bon dossier et adaptez son contenu.

## Modifier ou ajouter un club

Utilisez le tableau `clubs`. Une seule entrée contient désormais :

- le nom ;
- le logo ;
- la couleur ;
- le style de jeu ;
- le nombre de titres ;
- l'identifiant utilisé par les joueurs et les matchs.

Le champ `key` doit rester court, unique et sans espace.

## Ajouter un résultat

Ajoutez la rencontre dans le tableau `matches`. Les pages Matchs, Records,
Face à face et Saisons recalculeront leurs informations depuis ce résultat.

Les buts et passes décisives sont lus depuis `scorersHome`, `scorersAway`,
`timelineHome` et `timelineAway`. Les notes, défenses et dribbles viennent de
`notesHome` et `notesAway`.

## Modifier le calendrier

Les vingt journées de ligue sont dans `leagueSchedule`. Chaque ligne utilise :

```js
["AAAA-MM-JJ", "club_domicile", "club_exterieur"]
```

La phase finale NCL se trouve dans `nclSchedule`. Le calendrier reconstruit
automatiquement les mois, filtres, compteurs et dossiers de rencontres.

## Ajouter une saison

Ajoutez son identité dans le tableau `seasons`. Les résultats déjà associés à
son numéro seront automatiquement agrégés.

## Titres des fiches joueurs

Les seuils techniques et de carrière sont centralisés dans :

- `technicalTitleRules` ;
- `careerTitleTracks`.

Le catalogue des personnages de la page Titres reste dans `JavaScript/titles.js`,
car il s'agit déjà de son unique source et il n'est pas dupliqué ailleurs.
