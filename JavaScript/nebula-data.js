/* ==========================================================================
   NEBULA LEAGUE — REGISTRE CENTRAL DES DONNÉES
   ==========================================================================

   Ce fichier contient toutes les informations partagées entre plusieurs pages.
   Quand une donnée existe ici, elle ne doit pas être recopiée dans un autre JS.

   SECTIONS :
   01. Chemins du projet
   02. Clubs
   03. Groupes hors compétition
   04. Joueurs
   05. Matchs terminés
   06. Calendrier de la ligue et de la NCL
   07. Rencontres affichées dans le calendrier
   08. Saisons
   09. Postes
   10. Titres automatiques des fiches joueurs
   11. Export vers les autres pages

   IMPORTANT :
   - Conserver les virgules entre les objets et les lignes.
   - Les identifiants `key` et `id` doivent toujours être uniques.
   - Les dates utilisent obligatoirement le format AAAA-MM-JJ.
   - Les chemins d'images partent toujours de la racine du projet.
   ========================================================================== */

(function initialiseNebulaData() {
    /* ----------------------------------------------------------------------
       01. CHEMINS DU PROJET

       Ces fonctions transforment automatiquement les chemins relatifs en URL
       correctes. Elles permettent au même fichier de fonctionner depuis une
       page principale, une fiche joueur, GitHub Pages ou Cloudflare Pages.
       Ne rien modifier ici pour ajouter une donnée.
       ---------------------------------------------------------------------- */
    const currentScript = document.currentScript;
    const projectRoot = currentScript?.src
        ? new URL("../", currentScript.src)
        : new URL("./", document.baseURI);

    const assetUrl = path => new URL(path, projectRoot).href;
    const pageUrl = path => new URL(path, projectRoot).href;

    /* ----------------------------------------------------------------------
       02. CLUBS

       Utilisé par :
       club.html, players.html, valeur.html, matchs.html, stats.html,
       headtohead.html, saison.html, fixtures.html et les fiches joueurs.

       CHAMPS D'UN CLUB :
       key        = identifiant technique sans espace, utilisé partout ailleurs
       name       = nom affiché sur le site
       shortName  = nom court facultatif
       fullName   = nom développé facultatif
       logoPath   = chemin du logo depuis la racine
       className  = classe CSS du club
       color      = couleur principale au format hexadécimal
       titles     = nombre de titres collectifs
       style      = texte tactique visible sur la page Clubs

       Pour ajouter un club, dupliquer un objet complet dans ce tableau.
       ---------------------------------------------------------------------- */
    const clubs = [
        {
            key: "bastard",
            name: "Bastard München",
            shortName: "Bastard",
            logoPath: "images/clubs_icon/Bastard_Munchen.png",
            className: "bastard",
            color: "#ff515a",
            titles: 0,
            style: "Le Bastard München utilise Antoine en pivot pendant que les deux autres attaquants se rendent disponibles pour recevoir la passe au moment décisif."
        },
        {
            key: "pxg",
            name: "PXG",
            fullName: "Paris X Gen",
            logoPath: "images/clubs_icon/PXG.png",
            className: "pxg",
            color: "#4a8dff",
            titles: 0,
            style: "Le PXG n'a pas encore de style de jeu fixe."
        },
        {
            key: "ubers",
            name: "Ubers",
            logoPath: "images/clubs_icon/Ubers.png",
            className: "ubers",
            color: "#43f58b",
            titles: 0,
            style: "Les Ubers n'ont pas encore de style de jeu fixe."
        },
        {
            key: "barcha",
            name: "Barcha",
            logoPath: "images/clubs_icon/Barcha.png",
            className: "barcha",
            color: "#ffd84d",
            titles: 0,
            style: "Le Barcha n'a pas encore de style de jeu fixe."
        },
        {
            key: "manshine",
            name: "Manshine City",
            logoPath: "images/clubs_icon/Manshine_City.png",
            className: "manshine",
            color: "#63e7ff",
            titles: 0,
            style: "Manshine City mise sur une attaque à trois, agressive et difficile à contenir pour les défenseurs adverses."
        }
    ].map(club => ({
        ...club,
        logo: assetUrl(club.logoPath),
        cls: club.className,
        standings: { points: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
    }));

    /* ----------------------------------------------------------------------
       03. GROUPES HORS COMPÉTITION

       Ces groupes servent à classer des joueurs qui ne doivent pas apparaître
       dans les classements de clubs. `retraite` est notamment utilisé par les
       filtres Joueurs, Valeurs et Records.
       ---------------------------------------------------------------------- */
    const groups = {
        retraite: {
            key: "retraite",
            name: "Retraite",
            logo: null,
            color: "#b26cff"
        }
    };

    // Index automatique des clubs par `key`. Ne pas le remplir manuellement.
    const clubMeta = Object.fromEntries(clubs.map(club => [club.key, club]));

    /* ----------------------------------------------------------------------
       04. JOUEURS

       Utilisé par :
       index.html, players.html, club.html, valeur.html, stats.html,
       headtohead.html, saison.html et les fiches individuelles.

       CHAMPS D'UN JOUEUR :
       name       = prénom/pseudo affiché, avec la casse définitive
       club       = `key` d'un club ou d'un groupe déclaré plus haut
       folder     = dossier de sa fiche dans Joueurs/
       position   = CF, LW, RW ou CM
       value      = valeur entière sans espace, par exemple 18250000
       avatarPath = image depuis la racine du projet

       Après l'ajout, les listes, compteurs, valeurs et effectifs se mettent à
       jour seuls. La fiche HTML individuelle doit encore être créée en copiant
       une fiche existante dans le bon dossier.
       ---------------------------------------------------------------------- */
    const players = [
        /* ========================== Bastard München ========================== */
        { name: "Antoine", club: "bastard", folder: "bm", position: "CM", value: 18250000, avatarPath: "Joueurs/images-joueurs/anto.png" },
        { name: "Dylan", club: "bastard", folder: "bm", position: "RW", value: 9300000, avatarPath: "Joueurs/images-joueurs/dylan.jpeg" },
        { name: "Alessio", club: "bastard", folder: "bm", position: "CF", value: 0, avatarPath: "Joueurs/images-joueurs/alessio.png" },
        /* ========================== PxG ========================== */
        { name: "Jason", club: "pxg", folder: "pxg", position: "CF", value: 2450000, avatarPath: "Joueurs/images-joueurs/Jason.png" },
        { name: "Enzo", club: "pxg", folder: "pxg", position: "CM", value: 2150000, avatarPath: "Joueurs/images-joueurs/enzo.png" },
        /* ========================== Manshine City ========================== */
        { name: "William", club: "manshine", folder: "manshine", position: "CF", value: 0, avatarPath: "Joueurs/images-joueurs/william.png" },
        { name: "Imrane", club: "manshine", folder: "manshine", position: "LW", value: 0, avatarPath: "Joueurs/images-joueurs/imrane.png" },
        { name: "Elijah", club: "manshine", folder: "manshine", position: "RW", value: 0, avatarPath: "Joueurs/images-joueurs/elijah.png" },
        /* ========================== Retraite ========================== */
        { name: "Matheo", club: "retraite", folder: "retraite", position: "CM", value: 0, avatarPath: "Joueurs/images-joueurs/matheo.png" },
        { name: "Theo", club: "retraite", folder: "retraite", position: "RW", value: 7500000, avatarPath: "Joueurs/images-joueurs/theo.png" }
    ].map(player => {
        const club = clubMeta[player.club] || groups[player.club];
        const profilePath = `Joueurs/${player.folder}/${player.name.toLowerCase()}.html`;
        return {
            ...player,
            clubName: club?.name || player.club,
            avatar: assetUrl(player.avatarPath),
            profilePath,
            href: pageUrl(profilePath)
        };
    });

    /* ----------------------------------------------------------------------
       05. MATCHS TERMINÉS

       Utilisé par :
       matchs.html, stats.html, headtohead.html, saison.html et fixtures.html.

       CHAMPS PRINCIPAUX :
       id          = identifiant unique du match
       date/time   = date AAAA-MM-JJ et heure HH:MM
       category    = amical, ligue ou ncl
       season      = numéro de saison
       home/away   = `key` des deux clubs
       scoreHome/Away = score final
       mvp         = ancien secours ; la meilleure note détermine normalement le MVP
       videoUrl    = lien vidéo facultatif

       STATISTIQUES :
       scorersHome/Away = nombre de buts par joueur
       timelineHome/Away = minute, buteur et passeur de chaque but
       notesHome/Away = note, défenses et dribbles de chaque joueur

       Ajouter un résultat ici actualise automatiquement les statistiques,
       records, comparaisons, saisons et archives du calendrier.
       ---------------------------------------------------------------------- */
    const matches = [
        /* ==================================================== MATCH 1 ==================================================== */
        {
            id: "m1",
            date: "2022-04-01",
            time: "20:00",
            category: "amical",
            season: 0,
            home: "manshine",
            away: "pxg",
            scoreHome: 13,
            scoreAway: 2,
            mvp: "Antoine",
            videoUrl: null,
            scorersHome: [
                { name: "Dylan", count: 6 },
                { name: "Antoine", count: 5 },
                { name: "Theo", count: 2 }
            ],
            scorersAway: [
                { name: "Enzo", count: 1 },
                { name: "Jason", count: 1 }
            ],
            timelineHome: [
                { time: "0'43\"", scorer: "Dylan", assist: "Antoine" },
                { time: "1'21\"", scorer: "Dylan", assist: "Theo" },
                { time: "2'48\"", scorer: "Antoine", assist: "Dylan" },
                { time: "3'21\"", scorer: "Theo", assist: "Antoine" },
                { time: "4'05\"", scorer: "Dylan", assist: "Antoine" },
                { time: "4'51\"", scorer: "Antoine", assist: "Theo" },
                { time: "5'56\"", scorer: "Dylan", assist: "Antoine" },
                { time: "6'21\"", scorer: "Dylan", assist: "Antoine" },
                { time: "7'12\"", scorer: "Antoine", assist: "Theo" },
                { time: "8'45\"", scorer: "Antoine", assist: "Theo" },
                { time: "9'29\"", scorer: "Dylan", assist: "Antoine" },
                { time: "10'57\"", scorer: "Antoine", assist: "Solo Dribble 🌟" },
                { time: "11'52\"", scorer: "Theo", assist: "Antoine" }
            ],
            timelineAway: [
                { time: "7'56\"", scorer: "Enzo", assist: "Jason" },
                { time: "10'07\"", scorer: "Jason", assist: "Amar" }
            ],
            notesHome: [
                { name: "Dylan", note: 9.5, defenses: 5, dribbles: 13 },
                { name: "Antoine", note: 9.8, defenses: 11, dribbles: 24 },
                { name: "Theo", note: 9.2, defenses: 8, dribbles: 7 }
            ],
            notesAway: [
                { name: "Enzo", note: 4.3, defenses: 9, dribbles: 5 },
                { name: "Jason", note: 4.8, defenses: 4, dribbles: 8 },
                { name: "Amar", note: 3.2, defenses: 3, dribbles: 4 }
            ]
        }
    ];

    /* ----------------------------------------------------------------------
       06A. CALENDRIER — JOURNÉES DE LIGUE

       Format d'une ligne :
       ["AAAA-MM-JJ", "club_domicile", "club_exterieur"]

       L'ordre des lignes détermine automatiquement le numéro de journée.
       ---------------------------------------------------------------------- */
    const leagueSchedule = [
        /* ==================================================== SAISON 1 ==================================================== */
        ["2026-09-02", "bastard", "manshine"],
        ["2026-09-05", "pxg", "barcha"],
        ["2026-09-09", "manshine", "ubers"],
        ["2026-09-12", "bastard", "pxg"],
        ["2026-09-16", "barcha", "manshine"],
        ["2026-09-19", "ubers", "barcha"],
        ["2026-09-23", "pxg", "bastard"],
        ["2026-09-26", "ubers", "bastard"],
        ["2026-09-30", "barcha", "bastard"],
        ["2026-10-03", "ubers", "bastard"],
        ["2026-10-07", "manshine", "bastard"],
        ["2026-10-10", "pxg", "barcha"],
        ["2026-10-14", "manshine", "ubers"],
        ["2026-10-17", "bastard", "pxg"],
        ["2026-10-21", "barcha", "manshine"],
        ["2026-10-24", "ubers", "barcha"],
        ["2026-10-28", "pxg", "bastard"],
        ["2026-10-31", "ubers", "bastard"],
        ["2026-11-04", "barcha", "bastard"],
        ["2026-11-07", "ubers", "bastard"]
        /* ==================================================== SAISON 2 ==================================================== */
    ];

    /* ----------------------------------------------------------------------
       06B. CALENDRIER — PHASE FINALE NCL

       Format d'une ligne :
       ["AAAA-MM-JJ", "Nom de la phase"]

       Les clubs restent inconnus (`???`) jusqu'à leur qualification.
       ---------------------------------------------------------------------- */
    const nclSchedule = [
        /* ==================================================== SAISON 1 ==================================================== */
        ["2026-11-14", "Demi-finale 01"],
        ["2026-11-18", "Demi-finale 02"],
        ["2026-11-21", "Petite finale"],
        ["2026-11-25", "Finale"]
        /* ==================================================== SAISON 2 ==================================================== */
    ];

    /* ----------------------------------------------------------------------
       07. RENCONTRES DU CALENDRIER

       `fixtureFromMatch` transforme automatiquement chaque résultat terminé
       en archive du calendrier. `fixtures` fusionne ensuite ces archives avec
       les journées futures de ligue et de NCL.

       Il ne faut pas ajouter une rencontre directement dans `fixtures` :
       - résultat terminé  -> tableau `matches`
       - rencontre future  -> `leagueSchedule` ou `nclSchedule`
       ---------------------------------------------------------------------- */
    const fixtureFromMatch = match => {
        const home = clubMeta[match.home];
        const away = clubMeta[match.away];
        return {
            id: `archive-${match.id}`,
            sourceMatchId: match.id,
            date: match.date,
            time: match.time || "20:00",
            category: match.category,
            status: "finished",
            season: match.season,
            competitionLabel: `${match.category === "amical" ? "Amical" : "Ligue"} — Saison ${match.season}`,
            stage: "Archive",
            home: match.home,
            away: match.away,
            homeTeam: home?.name || match.home,
            awayTeam: away?.name || match.away,
            homeLogo: home?.logo || assetUrl("images/clubs_icon/placeholder.png"),
            awayLogo: away?.logo || assetUrl("images/clubs_icon/placeholder.png"),
            scoreHome: match.scoreHome,
            scoreAway: match.scoreAway
        };
    };

    const fixtures = [
        ...matches.map(fixtureFromMatch),
        ...leagueSchedule.map(([date, home, away], index) => ({
            id: `league-s1-${String(index + 1).padStart(2, "0")}`,
            date,
            time: "18:00",
            category: "ligue",
            status: "upcoming",
            season: 1,
            competitionLabel: "Ligue — Saison 1",
            stage: `Journée ${String(index + 1).padStart(2, "0")}`,
            home,
            away,
            homeTeam: clubMeta[home].name,
            awayTeam: clubMeta[away].name,
            homeLogo: clubMeta[home].logo,
            awayLogo: clubMeta[away].logo,
            scoreHome: null,
            scoreAway: null
        })),
        ...nclSchedule.map(([date, stage], index) => ({
            id: `ncl-s1-${String(index + 1).padStart(2, "0")}`,
            date,
            time: "18:00",
            category: "ncl",
            status: "upcoming",
            season: 1,
            competitionLabel: "Nebula Champions League — Saison 1",
            stage,
            home: null,
            away: null,
            homeTeam: "???",
            awayTeam: "???",
            homeLogo: assetUrl("images/clubs_icon/placeholder.png"),
            awayLogo: assetUrl("images/clubs_icon/placeholder.png"),
            scoreHome: null,
            scoreAway: null
        }))
    ];

    /* ----------------------------------------------------------------------
       08. SAISONS

       `emptySeasonRewards` est le modèle des récompenses non attribuées.

       CHAMPS D'UNE SAISON :
       id              = identifiant unique, généralement s + numéro
       number          = numéro utilisé dans les matchs
       status          = active ou finished
       startDate       = date de début
       endDate         = date de fin, ou null si la saison continue
       expectedMatches = nombre de matchs prévu pour calculer la progression
       rewards         = récompenses affichées dans le dossier de saison
       ---------------------------------------------------------------------- */
    const emptySeasonRewards = [
        { code: "PUS", label: "Prix Puskas", value: "NON ATTRIBUÉ" },
        { code: "GLD", label: "Soulier d’Or", value: "NON ATTRIBUÉ" },
        { code: "NCL", label: "Club gagnant NCL", value: "NON ATTRIBUÉ" },
        { code: "BDO", label: "Ballon d’Or", value: "NON ATTRIBUÉ" }
    ];

    const seasons = [
        {
            id: "s0",
            number: 0,
            status: "finished",
            startDate: "2022-03-25",
            endDate: "2022-04-01",
            expectedMatches: 1,
            rewards: emptySeasonRewards
        },
        {
            id: "s1",
            number: 1,
            status: "active",
            startDate: "2026-01-10",
            endDate: null,
            expectedMatches: 20,
            rewards: emptySeasonRewards
            /* Pour ajouter des Rewards:
            rewards: [
                { code: "PUS", label: "Prix Puskas", value: "NON ATTRIBUÉ" },
                { code: "GLD", label: "Soulier d’Or", value: "NON ATTRIBUÉ" },
                { code: "NCL", label: "Club gagnant NCL", value: "NON ATTRIBUÉ" },
                { code: "BDO", label: "Ballon d’Or", value: "NON ATTRIBUÉ" }
            ]
            */
        }
    ];

    /* ----------------------------------------------------------------------
       09. POSTES

       Libellés utilisés dans les filtres et les dossiers joueurs.
       Si un nouveau code de poste est créé, il faut aussi prévoir sa position
       visuelle sur le terrain dans JavaScript/club.js.
       ---------------------------------------------------------------------- */
    const positions = {
        CF: "Attaquant central",
        LW: "Ailier gauche",
        RW: "Ailier droit",
        CM: "Milieu central"
    };

    /* ----------------------------------------------------------------------
       10A. TITRES TECHNIQUES DES FICHES JOUEURS

       Un titre est débloqué lorsqu'une note de compétence atteint le seuil
       indiqué par `requirement`. `metric` doit correspondre à une statistique
       lue par Joueurs/player-card.js.
       ---------------------------------------------------------------------- */
    const technicalTitleRules = [
        { metric: "defense", name: "Crown Messenger", requirement: "Défense 95+", code: "DEF", accent: "#9dff5c", priority: 55 },
        { metric: "passe", name: "Rainbow Passes", requirement: "Passe 95+", code: "PAS", accent: "#65b5ff", priority: 55 },
        { metric: "dribble", name: "Butterfly Dribbling", requirement: "Dribble 95+", code: "DRI", accent: "#c879ff", priority: 55 },
        { metric: "tir", name: "Predator Eyes", requirement: "Tir 95+", code: "TIR", accent: "#ff6670", priority: 55 },
        { metric: "offense", name: "God Speed", requirement: "Offense 95+", code: "OFF", accent: "#ffad4d", priority: 55 },
        { metric: "position", name: "Meta-Vision", requirement: "Positionnement 95+", code: "POS", accent: "#63e7ff", priority: 55 },
        { metric: "global", name: "The Machinery.", requirement: "Note globale 95+", code: "OVR", accent: "#f4f7f9", priority: 75 }
    ];

    /* ----------------------------------------------------------------------
       10B. TITRES DE CARRIÈRE

       Chaque piste correspond à une statistique cumulée.
       `titles` contient des couples [seuil, "Nom du titre"].
       Les alias servent à reconnaître les différents libellés historiques.
       ---------------------------------------------------------------------- */
    const careerTitleTracks = [
        {
            metric: "goals",
            aliases: ["buts", "but"],
            code: "STK",
            accent: "#ff5c66",
            unit: "buts",
            titles: [[10, "Ace Striker"], [25, "Elite Striker"], [50, "New Gen XI Striker"], [100, "World Class Striker"], [200, "World’s Greatest Striker"]]
        },
        {
            metric: "assists",
            aliases: ["assists", "passes d", "passes decisives", "passe decisive"],
            code: "PAS",
            accent: "#5aa7ff",
            unit: "passes D.",
            titles: [[10, "Ace Passer"], [25, "Elite Passer"], [50, "New Gen XI Passer"], [100, "World Class Passer"], [200, "World’s Greatest Passer"]]
        },
        {
            metric: "defensive",
            aliases: ["contribution defensive", "defensive save", "defenses", "defense", "sauvetages", "saves"],
            code: "DEF",
            accent: "#52e69a",
            unit: "sauvetages",
            titles: [[20, "Ace Defender"], [50, "Elite Defender"], [100, "New Gen XI Defender"], [200, "World Class Defender"], [400, "World’s Greatest Defender"]]
        },
        {
            metric: "dribbles",
            aliases: ["dribbles", "dribble"],
            code: "DRI",
            accent: "#c879ff",
            unit: "dribbles",
            titles: [[20, "Ace Dribbler"], [50, "Elite Dribbler"], [100, "New Gen XI Dribbler"], [200, "World Class Dribbler"], [400, "World’s Greatest Dribbler"]]
        }
    ];

    /* ----------------------------------------------------------------------
       11. EXPORT VERS LES AUTRES PAGES

       Tout est regroupé dans `window.NEBULA_DATA`. Les scripts d'interface
       lisent ce registre mais ne doivent pas y recopier leurs propres données.

       OUTILS DISPONIBLES :
       assetUrl(path)       = URL absolue d'une image ou ressource
       pageUrl(path)        = URL absolue d'une page
       getClub(key)         = retrouver un club ou groupe
       getPlayer(name)      = retrouver un joueur par son nom
       playerPageHref(obj)  = lien vers une fiche joueur
       clubPageHref(key)    = lien vers un dossier club
       ---------------------------------------------------------------------- */
    const existingData = window.NEBULA_DATA || {};
    window.NEBULA_DATA = Object.assign(existingData, {
        projectRoot: projectRoot.href,
        assetUrl,
        pageUrl,
        clubs,
        clubMeta,
        groups,
        players,
        matches,
        fixtures,
        seasons,
        positions,
        matchLengthSeconds: 12 * 60,
        technicalTitleRules,
        careerTitleTracks,
        getClub: key => clubMeta[key] || groups[key] || null,
        getPlayer: name => players.find(player => player.name === name) || null,
        playerPageHref: player => player?.href || pageUrl("players.html"),
        clubPageHref: key => pageUrl(`club.html?club=${encodeURIComponent(key)}`)
    });
})();
