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
    baseValue: 0,
    avatarPath: "Joueurs/images-joueurs/prenom.png",
    character: "Personnage",
    technical: {
        defense: 0,
        passe: 0,
        dribble: 0,
        tir: 0,
        offense: 0,
        position: 0,
        global: 0
    }
}
```

Le joueur apparaîtra automatiquement dans :

- la page Joueurs ;
- l'effectif et le terrain de son club ;
- la page Valeurs ;
- les sélecteurs et compteurs qui utilisent les joueurs.

`baseValue` est une éventuelle valeur de départ. Laissez-la à `0` pour que la
valeur provienne uniquement des matchs et récompenses. La propriété `value`
utilisée par les pages est générée automatiquement au chargement.

La valeur calculée débloque uniquement le plus haut titre atteint dans cette
progression :

- `Riche` à partir de 100 000 000 ¥ ;
- `Extra Riche` à partir de 500 000 000 ¥ ;
- `Milliardaire` à partir de 1 000 000 000 ¥.

La fiche individuelle reste une page HTML. Pour un nouveau joueur, dupliquez une
fiche existante dans le bon dossier. Son identité, son club, son poste, son
personnage, sa valeur et ses statistiques techniques seront ensuite remplacés
automatiquement par les champs ci-dessus.

## Modifier ou ajouter un club

Utilisez le tableau `clubs`. Une seule entrée contient désormais :

- le nom ;
- le logo ;
- la couleur ;
- le style de jeu ;
- le nombre de titres ;
- l'identifiant utilisé par les joueurs et les matchs.

Le champ `key` doit rester court, unique et sans espace. Les points, V-N-D,
buts marqués, buts encaissés et différence sont calculés automatiquement depuis
les matchs de la saison active. Le nombre de titres du club est calculé depuis
les récompenses NCL des saisons.

## Ajouter un résultat

Ajoutez la rencontre dans le tableau `matches`. Les pages Matchs, Records,
Face à face et Saisons recalculeront leurs informations depuis ce résultat.

La base démarre volontairement avec ce tableau vide. Un exemple complet est
conservé en commentaire directement dans `nebula-data.js` : copiez l’objet,
retirez les marqueurs de commentaire puis adaptez les clubs, joueurs et scores.

Les buts et passes décisives sont lus depuis `scorersHome`, `scorersAway`,
`timelineHome` et `timelineAway`. Les notes, défenses et dribbles viennent de
`notesHome` et `notesAway`.

Le panneau `Impact en match` des player-cards est recalculé depuis ces mêmes
données : matchs joués, buts, passes, défenses, dribbles, MVP, victoires,
défaites, contributions par match et taux de victoire. Les anciennes valeurs
écrites dans le HTML servent uniquement de secours.

Les anciennes fenêtres secrètes de statistiques par saison et par match ont été
supprimées. L’historique central constitue désormais leur unique remplacement.

## Calcul automatique de la valeur

Chaque performance enregistrée dans `matches` augmente automatiquement la
valeur du joueur selon la catégorie de la rencontre :

- victoire : 2,5 M en amical, 5 M en ligue, 10 M en NCL ;
- but : base de 1,5 M ;
- passe décisive : base de 1 M ;
- défense et dribble : base de 200 000 ;
- MVP : base de 10 M.

Les actions sont multipliées par `0,5` en amical, `1` en ligue, `2` en NCL,
`3` en petite finale et `4` en finale. Les victoires possèdent directement le
montant correspondant à chaque niveau.

Les récompenses ajoutent ensuite leur bonus :

- Prix Puskas : 50 M ;
- NCL : 100 M ;
- Golden Shoe : 150 M ;
- Ballon d’Or : 250 M.

Ces montants sont centralisés dans `marketValueTiers`, `marketValueActions` et
`marketValueBonuses`. La page Valeurs et son simulateur utilisent exactement
les mêmes règles.

## Modifier le calendrier

Les vingt journées de ligue sont dans `leagueSchedule`. Chaque ligne utilise :

```js
["AAAA-MM-JJ", "club_domicile", "club_exterieur"]
```

La phase finale NCL se trouve dans `nclSchedule`. Le calendrier reconstruit
automatiquement les mois, filtres, compteurs et dossiers de rencontres.

Lorsqu’un résultat de `matches` possède la même saison, date, catégorie et
affiche qu’une rencontre programmée, il la remplace automatiquement dans le
calendrier au lieu de créer un doublon.

## Ajouter une saison

Ajoutez son identité dans le tableau `seasons`. Les résultats déjà associés à
son numéro seront automatiquement agrégés.

La saison 1 est la seule saison active enregistrée. Un modèle commenté de saison
2 est placé juste en dessous afin de pouvoir être copié lorsque ce sera utile.

Pour attribuer une récompense, remplacez `NON ATTRIBUÉ` par le nom exact du
joueur dans le tableau `rewards` de la saison :

```js
{ code: "BDO", label: "Ballon d’Or", value: "Antoine" }
```

La fiche du joueur affichera alors automatiquement, par exemple,
`Ballon d’Or Saison 3`. Une récompense laissée sur `NON ATTRIBUÉ` ne débloque
aucun titre.

Le `Soulier d’Or` (`GLD`) constitue l’unique exception : lorsque la saison passe
au statut `finished`, son gagnant est calculé automatiquement depuis les buts de
la saison. Il ne faut donc pas lui attribuer de joueur manuellement.

Les quatre compteurs du palmarès des player-cards sont également automatiques :

- `PUS`, `GLD` et `BDO` comptent les saisons attribuées au nom du joueur ;
- `NCL` compte les saisons remportées par son club actuel.

Pour la NCL, `value` peut contenir la clé du club (`bastard`) ou son nom complet
(`Bastard München`). Les anciens compteurs écrits dans les fichiers HTML des
joueurs servent uniquement de solution de secours.

## Titres des fiches joueurs

Les seuils techniques et de carrière sont centralisés dans :

- `technicalTitleRules` ;
- `careerTitleTracks`.

Les titres de carrière sont progressifs : pour une même statistique, seul le
plus haut rang atteint est conservé. Par exemple, `Elite Striker` remplace
automatiquement `Ace Striker`.

Les modules correspondants sur `title.html` lisent eux aussi ces règles. Modifier
un seuil ou un nom dans `nebula-data.js` met donc à jour à la fois la page Titres
et les player-cards.

Le catalogue des personnages de la page Titres reste dans `JavaScript/titles.js`,
car il s'agit déjà de son unique source et il n'est pas dupliqué ailleurs.
