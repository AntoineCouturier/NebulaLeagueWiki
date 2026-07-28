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
       style      = texte tactique visible sur la page Clubs

       Pour ajouter un club, dupliquer un objet complet dans ce tableau.
       Les points et titres collectifs sont calculés depuis les matchs et
       récompenses de saisons : ils ne sont pas renseignés ici.
       ---------------------------------------------------------------------- */
    const clubs = [
        {
            key: "bastard",
            name: "Bastard München",
            shortName: "Bastard",
            logoPath: "images/clubs_icon/Bastard_Munchen.png",
            className: "bastard",
            color: "#ff323cff",
            style: "Le Bastard München utilise Antoine en pivot pendant que les deux autres attaquants se rendent disponibles pour recevoir la passe au moment décisif."
        },
        {
            key: "pxg",
            name: "PXG",
            fullName: "Paris X Gen",
            logoPath: "images/clubs_icon/PXG.png",
            className: "pxg",
            color: "#2877ffff",
            style: "Le PXG n'a pas encore de style de jeu fixe."
        },
        {
            key: "ubers",
            name: "Ubers",
            logoPath: "images/clubs_icon/Ubers.png",
            className: "ubers",
            color: "#21ff3fff",
            style: "Les Ubers n'ont pas encore de style de jeu fixe."
        },
        {
            key: "barcha",
            name: "Barcha",
            logoPath: "images/clubs_icon/Barcha.png",
            className: "barcha",
            color: "#ffd84d",
            style: "Le Barcha n'a pas encore de style de jeu fixe."
        },
        {
            key: "manshine",
            name: "Manshine City",
            logoPath: "images/clubs_icon/Manshine_City.png",
            className: "manshine",
            color: "#2fe0ffff",
            style: "Manshine City mise sur une attaque à trois, agressive et difficile à contenir pour les défenseurs adverses."
        }
    ].map(club => ({
        ...club,
        logo: assetUrl(club.logoPath),
        cls: club.className
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
       position   = CF, LW, RW, LM ou RM
       baseValue  = valeur de départ facultative ; généralement 0
       discordId  = identifiant utilisateur Discord facultatif pour synchroniser la PFP
       avatarPath = image depuis la racine du projet
       character  = personnage représenté sur sa fiche
       Ult        = true si le titre ultime du personnage est débloqué, sinon false
       technical  = les 6 notes techniques affichées sur sa player-card

       La note globale n'est pas renseignée : elle correspond automatiquement
       à la moyenne arrondie des 6 statistiques techniques.

       Après l'ajout, les listes, compteurs, valeurs et effectifs se mettent à
       jour seuls. La fiche HTML individuelle doit encore être créée en copiant
       une fiche existante dans le bon dossier.
       ---------------------------------------------------------------------- */
    const technicalStatKeys = ["defense", "passe", "dribble", "tir", "offense", "position"];

    function calculateTechnicalOverall(technical = {}) {
        const rawValues = technicalStatKeys.map(key => technical[key]);
        if (rawValues.some(value => value === null || value === undefined || value === "")) return null;

        const values = rawValues.map(Number);
        if (values.some(value => !Number.isFinite(value))) return null;
        return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
    }

    const players = [
        /* ========================== Bastard München ========================== */
        {
            name: "Antoine", club: "bastard", folder: "bm", position: "RM", baseValue: 0, discordId: "725931972802904115", avatarPath: "Joueurs/images-joueurs/anto.png", character: "Kurona", Ult: false, technical:
            {
                defense: 96,
                passe: 100,
                dribble: 95,
                tir: 84,
                offense: 93,
                position: 94
            }
        },
        {
            name: "Dylan", club: "bastard", folder: "bm", position: "RW", baseValue: 0, discordId: "469446272235995141", avatarPath: "Joueurs/images-joueurs/dylan.jpeg", character: "Kiyora", Ult: false, technical:
            {
                defense: 78,
                passe: 91,
                dribble: 89,
                tir: 84,
                offense: 83,
                position: 84
            }
        },
        {
            name: "Alessio", club: "bastard", folder: "bm", position: "CF", baseValue: 0, discordId: "748818822290604032", avatarPath: "Joueurs/images-joueurs/alessio.png", character: "Rin", Ult: false, technical:
            {
                defense: 74,
                passe: 77,
                dribble: 81,
                tir: 82,
                offense: 76,
                position: 80
            }
        },
        /* ========================== PxG ========================== */
        {
            name: "Jason", club: "pxg", folder: "pxg", position: "CF", baseValue: 0, discordId: "771124358311051284", avatarPath: "Joueurs/images-joueurs/Jason.png", character: "Shidou", Ult: false, technical:
            {
                defense: null,
                passe: null,
                dribble: null,
                tir: null,
                offense: null,
                position: null
            }
        },
        {
            name: "Enzo", club: "pxg", folder: "pxg", position: "LM", baseValue: 0, discordId: "775004632576950272", avatarPath: "Joueurs/images-joueurs/enzo.png", character: "Chigiri", Ult: false, technical:
            {
                defense: 71,
                passe: 75,
                dribble: 67,
                tir: 68,
                offense: 75,
                position: 72
            }
        },
        /* ========================== Manshine City ========================== */
        {
            name: "William", club: "manshine", folder: "manshine", position: "CF", baseValue: 0, discordId: "915917842602405888", avatarPath: "Joueurs/images-joueurs/william.png", character: "Nagi", Ult: false, technical:
            {
                defense: 77,
                passe: 79,
                dribble: 78,
                tir: 82,
                offense: 77,
                position: 84
            }
        },
        {
            name: "Imrane", club: "manshine", folder: "manshine", position: "LW", baseValue: 0, discordId: "1049719803725750302", avatarPath: "Joueurs/images-joueurs/imrane.png", character: "Reo", Ult: false, technical:
            {
                defense: 88,
                passe: 84,
                dribble: 93,
                tir: 100,
                offense: 96,
                position: 85
            }
        },
        {
            name: "Elijah", club: "manshine", folder: "manshine", position: "RW", baseValue: 0, discordId: "827952021239889940", avatarPath: "Joueurs/images-joueurs/elijah.png", character: "Shidou", Ult: false, technical:
            {
                defense: 72,
                passe: 74,
                dribble: 83,
                tir: 82,
                offense: 77,
                position: 78
            }
        },
        /* ========================== Barcha ========================== */
        {
            name: "Leandro", club: "barcha", folder: "barcha", position: "RW", baseValue: 0, discordId: "1051860042690871356", avatarPath: "Joueurs/images-joueurs/leandro.png", character: "Kaiser", Ult: false, technical:
            {
                defense: null,
                passe: null,
                dribble: null,
                tir: null,
                offense: null,
                position: null
            }
        },
        /* ========================== Retraite ========================== */
        {
            name: "Matheo", club: "retraite", folder: "retraite", position: "LM", baseValue: 0, discordId: "506800771417767938", avatarPath: "Joueurs/images-joueurs/matheo.png", character: "Lorenzo", Ult: false, technical:
            {
                defense: 82,
                passe: 80,
                dribble: 74,
                tir: 73,
                offense: 79,
                position: 82
            }
        },
        {
            name: "Theo", club: "retraite", folder: "retraite", position: "RW", baseValue: 0, discordId: "414493257775448075", avatarPath: "Joueurs/images-joueurs/theo.png", character: "Kunigami", Ult: false, technical:
            {
                defense: null,
                passe: null,
                dribble: null,
                tir: null,
                offense: null,
                position: null
            }
        },

    ].map(player => {
        const club = clubMeta[player.club] || groups[player.club];
        const profilePath = `Joueurs/${player.folder}/${player.name.toLowerCase()}.html`;
        return {
            ...player,
            technical: player.technical
                ? {
                    ...player.technical,
                    global: calculateTechnicalOverall(player.technical)
                }
                : null,
            clubName: club?.name || player.club,
            avatar: assetUrl(player.avatarPath),
            profilePath,
            href: pageUrl(profilePath)
        };
    });

    /* ----------------------------------------------------------------------
       04B. AVATARS DISCORD

       Si `discordId` est renseigné, Netlify récupère la PFP actuelle sans
       exposer le token Discord. `avatarPath` reste toujours l'image de secours.
       Les résultats sont conservés une heure dans le navigateur pour limiter
       les appels à Discord pendant la navigation entre les pages.
       ---------------------------------------------------------------------- */
    const discordAvatarCacheDuration = 60 * 60 * 1000;
    const discordAvatarCacheVersion = "v2";

    function readDiscordAvatarCache(discordId) {
        try {
            const cached = JSON.parse(localStorage.getItem(`nebula:discord-avatar:${discordAvatarCacheVersion}:${discordId}`));
            return cached?.avatarUrl && cached.expiresAt > Date.now() ? cached.avatarUrl : null;
        } catch {
            return null;
        }
    }

    function writeDiscordAvatarCache(discordId, avatarUrl) {
        try {
            localStorage.setItem(`nebula:discord-avatar:${discordAvatarCacheVersion}:${discordId}`, JSON.stringify({
                avatarUrl,
                expiresAt: Date.now() + discordAvatarCacheDuration
            }));
        } catch {
            // Le cache est facultatif : la synchronisation continue sans lui.
        }
    }

    function isDiscordAvatarUrl(value) {
        try {
            return new URL(value).hostname === "cdn.discordapp.com";
        } catch {
            return false;
        }
    }

    function applyDiscordAvatar(player, avatarUrl, fallbackAvatar) {
        if (!isDiscordAvatarUrl(avatarUrl)) return false;

        player.avatar = avatarUrl;
        document.querySelectorAll("img").forEach(image => {
            if (image.src !== fallbackAvatar && image.dataset.nebulaPlayer !== player.name) return;

            image.dataset.nebulaPlayer = player.name;
            image.addEventListener("error", () => {
                if (image.src === avatarUrl) image.src = fallbackAvatar;
            }, { once: true });
            image.src = avatarUrl;
        });
        return true;
    }

    async function syncDiscordAvatar(player) {
        const fallbackAvatar = player.avatar;
        const cachedAvatar = readDiscordAvatarCache(player.discordId);
        if (cachedAvatar && applyDiscordAvatar(player, cachedAvatar, fallbackAvatar)) {
            return player.name;
        }

        try {
            const endpoint = pageUrl(`api/discord-avatar?userId=${encodeURIComponent(player.discordId)}&v=${discordAvatarCacheVersion}`);
            const response = await fetch(endpoint, {
                headers: { Accept: "application/json" }
            });
            if (!response.ok) return null;

            const result = await response.json();
            if (!applyDiscordAvatar(player, result.avatarUrl, fallbackAvatar)) return null;

            writeDiscordAvatarCache(player.discordId, result.avatarUrl);
            return player.name;
        } catch {
            return null;
        }
    }

    async function syncDiscordAvatars() {
        const linkedPlayers = players.filter(player => /^\d{17,20}$/.test(player.discordId || ""));
        const updatedPlayers = (await Promise.all(linkedPlayers.map(syncDiscordAvatar))).filter(Boolean);

        if (updatedPlayers.length) {
            window.dispatchEvent(new CustomEvent("nebula:discord-avatars-updated", {
                detail: { players: updatedPlayers }
            }));
        }
        return updatedPlayers;
    }

    /* ----------------------------------------------------------------------
       05. MATCHS TERMINÉS

       Utilisé par :
       matchs.html, stats.html, headtohead.html, saison.html et fixtures.html.

       CHAMPS PRINCIPAUX :
       id          = identifiant unique du match
       date/time   = date AAAA-MM-JJ et heure HH:MM
       category    = amical, ligue ou ncl
       valueTier   = facultatif : third ou finale pour le calcul de valeur
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
        // EXEMPLE DE MATCH À COPIER
        //
        // Retirez les `/* */`, adaptez les valeurs et ajoutez une virgule entre
        // deux matchs. Les totaux des buteurs doivent correspondre au score.
        /* {
            id: "m1",
            date: "2026-09-02",
            time: "20:00",
            category: "ligue",
            valueTier: null,
            season: 1,
            home: "bastard",
            away: "manshine",
            scoreHome: 12,
            scoreAway: 10,
            videoUrl: null,
            scorersHome: [
                { name: "Antoine", count: 5 },
                { name: "Dylan", count: 4 },
                { name: "Alessio", count: 3 }
            ],
            scorersAway: [
                { name: "Imrane", count: 6 },
                { name: "William", count: 3 },
                { name: "Elijah", count: 1 }
            ],
            timelineHome: [
                { time: "0'14\"", scorer: "Antoine", assist: "Alessio" },
                { time: "0'33\"", scorer: "Antoine", assist: "Dylan" },
                { time: "2'00\"", scorer: "Alessio", assist: "Antoine" },
                { time: "4'12\"", scorer: "Dylan", assist: "Antoine" },
                { time: "5'26\"", scorer: "Antoine", assist: "Alessio" },
                { time: "6'16\"", scorer: "Alessio", assist: "Antoine" },
                { time: "6'49\"", scorer: "Antoine", assist: "Alessio" },
                { time: "7'11\"", scorer: "Dylan", assist: "Antoine" },
                { time: "7'40\"", scorer: "Dylan", assist: "Antoine" },
                { time: "9'05\"", scorer: "Antoine", assist: "Dylan" },
                { time: "11'12\"", scorer: "Dylan", assist: "Antoine" },
                { time: "11'50\"", scorer: "Alessio", assist: "Dylan" }
            ],
            timelineAway: [
                { time: "1'10\"", scorer: "Imrane", assist: "Elijah" },
                { time: "1'32\"", scorer: "William", assist: "Elijah" },
                { time: "2'25\"", scorer: "Imrane", assist: "Elijah" },
                { time: "2'53\"", scorer: "William", assist: "Imrane" },
                { time: "3'32\"", scorer: "Imrane", assist: "Elijah" },
                { time: "4'48\"", scorer: "Imrane", assist: "William" },
                { time: "8'03\"", scorer: "William", assist: "Elijah" },
                { time: "8'42\"", scorer: "Imrane", assist: "Elijah" },
                { time: "9'57\"", scorer: "Imrane", assist: "Elijah" },
                { time: "10'24\"", scorer: "Elijah", assist: "William" }
            ],
            notesHome: [
                { name: "Antoine", note: 9.9, defenses: 10, dribbles: 10 },
                { name: "Dylan", note: 9.3, defenses: 5, dribbles: 10 },
                { name: "Alessio", note: 8.9, defenses: 9, dribbles: 5 }
            ],
            notesAway: [
                { name: "William", note: 9.1, defenses: 3, dribbles: 6 },
                { name: "Elijah", note: 9.4, defenses: 5, dribbles: 7 },
                { name: "Imrane", note: 9.8, defenses: 3, dribbles: 6 }
            ],
        } */
    ];

    /* ----------------------------------------------------------------------
       06A. CALENDRIER — JOURNÉES DE LIGUE

       Format d'une ligne :
       ["AAAA-MM-JJ", "club_domicile", "club_exterieur"]

       L'ordre des lignes détermine automatiquement le numéro de journée.
       ---------------------------------------------------------------------- */
    const leagueSchedule = [
        /* ==================================================== SAISON 1 ==================================================== */
        /* Phase aller */
        ["2026-09-02", "bastard", "manshine"],
        ["2026-09-05", "pxg", "ubers"],
        ["2026-09-09", "bastard", "barcha"],
        ["2026-09-12", "manshine", "ubers"],
        ["2026-09-16", "bastard", "ubers"],
        ["2026-09-19", "barcha", "pxg"],
        ["2026-09-23", "bastard", "pxg"],
        ["2026-09-26", "manshine", "barcha"],
        ["2026-09-30", "pxg", "manshine"],
        ["2026-10-03", "ubers", "barcha"],

        /* Phase retour */
        ["2026-10-07", "manshine", "bastard"],
        ["2026-10-10", "ubers", "pxg"],
        ["2026-10-14", "barcha", "bastard"],
        ["2026-10-17", "ubers", "manshine"],
        ["2026-10-21", "ubers", "bastard"],
        ["2026-10-24", "pxg", "barcha"],
        ["2026-10-28", "pxg", "bastard"],
        ["2026-10-31", "barcha", "manshine"],
        ["2026-11-04", "manshine", "pxg"],
        ["2026-11-07", "barcha", "ubers"]
        /* ==================================================== SAISON 2 ==================================================== */
    ];

    /* ----------------------------------------------------------------------
       06B. CALENDRIER — PHASE FINALE NCL

       Format d'une ligne :
       ["AAAA-MM-JJ", "Nom de la phase"]

       Les quatre premiers de la Ligue sont injectés automatiquement :
       - demi-finale 01 : 1er contre 4e
       - demi-finale 02 : 2e contre 3e
       - petite finale : les deux perdants
       - finale         : les deux vainqueurs
       ---------------------------------------------------------------------- */
    const nclSchedule = [
        /* ==================================================== SAISON 1 ==================================================== */
        ["2026-11-14", "Demi-finale 01"],
        ["2026-11-18", "Demi-finale 02"],
        ["2026-11-21", "Petite finale"],
        ["2026-11-25", "Finale"]
        /* ==================================================== SAISON 2 ==================================================== */
    ];

    const nclSeasonNumber = 1;

    function buildLeagueStandings(seasonNumber) {
        const table = new Map(clubs.map(club => [club.key, {
            club: club.key,
            points: 0,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0
        }]));

        matches
            .filter(match => match.category === "ligue" && Number(match.season) === Number(seasonNumber))
            .forEach(match => {
                const home = table.get(match.home);
                const away = table.get(match.away);
                if (!home || !away) return;

                const scoreHome = Number(match.scoreHome || 0);
                const scoreAway = Number(match.scoreAway || 0);
                home.played += 1;
                away.played += 1;
                home.goalsFor += scoreHome;
                home.goalsAgainst += scoreAway;
                away.goalsFor += scoreAway;
                away.goalsAgainst += scoreHome;

                if (scoreHome > scoreAway) {
                    home.wins += 1;
                    away.losses += 1;
                    home.points += 3;
                } else if (scoreAway > scoreHome) {
                    away.wins += 1;
                    home.losses += 1;
                    away.points += 3;
                } else {
                    home.draws += 1;
                    away.draws += 1;
                    home.points += 1;
                    away.points += 1;
                }
            });

        return [...table.values()].sort((a, b) =>
            b.points - a.points
            || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)
            || b.goalsFor - a.goalsFor
            || clubMeta[a.club].name.localeCompare(clubMeta[b.club].name, "fr")
        );
    }

    const leagueSeasonIsComplete = leagueSchedule.every(([date, home, away]) =>
        matches.some(match =>
            match.category === "ligue"
            && Number(match.season) === nclSeasonNumber
            && match.date === date
            && match.home === home
            && match.away === away
        )
    );

    const nclQualifiedClubs = leagueSeasonIsComplete
        ? buildLeagueStandings(nclSeasonNumber).slice(0, 4).map(row => row.club)
        : [];

    function nclResultOn(date) {
        return matches.find(match =>
            match.category === "ncl"
            && Number(match.season) === nclSeasonNumber
            && match.date === date
        ) || null;
    }

    function nclOutcome(match) {
        if (!match || Number(match.scoreHome) === Number(match.scoreAway)) return null;
        const homeWon = Number(match.scoreHome) > Number(match.scoreAway);
        return {
            winner: homeWon ? match.home : match.away,
            loser: homeWon ? match.away : match.home
        };
    }

    const nclSemiFinalOne = nclOutcome(nclResultOn(nclSchedule[0][0]));
    const nclSemiFinalTwo = nclOutcome(nclResultOn(nclSchedule[1][0]));
    const nclSemiFinalsComplete = Boolean(nclSemiFinalOne && nclSemiFinalTwo);

    const nclBracketTeams = [
        { home: nclQualifiedClubs[0] || null, away: nclQualifiedClubs[3] || null },
        { home: nclQualifiedClubs[1] || null, away: nclQualifiedClubs[2] || null },
        {
            home: nclSemiFinalsComplete ? nclSemiFinalOne.loser : null,
            away: nclSemiFinalsComplete ? nclSemiFinalTwo.loser : null
        },
        {
            home: nclSemiFinalsComplete ? nclSemiFinalOne.winner : null,
            away: nclSemiFinalsComplete ? nclSemiFinalTwo.winner : null
        }
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
        const nclStage = match.category === "ncl"
            ? nclSchedule.find(([date]) => date === match.date)?.[1]
            : null;
        return {
            id: `archive-${match.id}`,
            sourceMatchId: match.id,
            date: match.date,
            time: match.time || "20:00",
            category: match.category,
            valueTier: match.valueTier || null,
            status: "finished",
            season: match.season,
            competitionLabel: `${match.valueTier === "finale"
                ? "Finale NCL"
                : match.category === "ncl"
                    ? "Nebula Champions League"
                    : match.category === "amical"
                        ? "Amical"
                        : "Ligue"} — Saison ${match.season}`,
            stage: nclStage || (match.valueTier === "finale" ? "Finale" : "Archive"),
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

    const scheduledLeagueFixtures = leagueSchedule.map(([date, home, away], index) => ({
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
    }));

    const scheduledNclFixtures = nclSchedule.map(([date, stage], index) => {
        const bracket = nclBracketTeams[index];
        const home = bracket?.home || null;
        const away = bracket?.away || null;
        const homeClub = home ? clubMeta[home] : null;
        const awayClub = away ? clubMeta[away] : null;

        return {
            id: `ncl-s1-${String(index + 1).padStart(2, "0")}`,
            date,
            time: "18:00",
            category: "ncl",
            valueTier: index === 2 ? "third" : index === 3 ? "finale" : null,
            status: "upcoming",
            season: nclSeasonNumber,
            competitionLabel: "Nebula Champions League — Saison 1",
            stage,
            home,
            away,
            homeTeam: homeClub?.name || "???",
            awayTeam: awayClub?.name || "???",
            homeLogo: homeClub?.logo || assetUrl("images/clubs_icon/placeholder.png"),
            awayLogo: awayClub?.logo || assetUrl("images/clubs_icon/placeholder.png"),
            scoreHome: null,
            scoreAway: null
        };
    });

    function hasCompletedResult(fixture) {
        return matches.some(match => {
            if (
                Number(match.season) !== Number(fixture.season)
                || match.date !== fixture.date
                || match.category !== fixture.category
            ) {
                return false;
            }

            // Une seule affiche NCL est prévue par date : son résultat remplace
            // toujours le créneau planifié, même si l'ordre des clubs diffère.
            if (fixture.category === "ncl") return true;

            // Pour les autres affiches encore inconnues, la date et la
            // compétition suffisent également.
            if (!fixture.home || !fixture.away) return true;
            return match.home === fixture.home && match.away === fixture.away;
        });
    }

    const fixtures = [
        ...matches.map(fixtureFromMatch),
        ...scheduledLeagueFixtures.filter(fixture => !hasCompletedResult(fixture)),
        ...scheduledNclFixtures.filter(fixture => !hasCompletedResult(fixture))
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
       reward.value    = nom exact du joueur récompensé, ou NON ATTRIBUÉ

       Quand `reward.value` correspond à un joueur, sa fiche ajoute
       automatiquement un titre comme « Ballon d’Or Saison 3 ».

       Exception : la récompense GLD (Soulier d’Or / Golden Shoe) est attribuée
       automatiquement au meilleur buteur uniquement lorsque le nombre de
       matchs de la saison atteint `expectedMatches`.
       ---------------------------------------------------------------------- */
    const emptySeasonRewards = [
        { code: "GLD", label: "Soulier d’Or", value: "NON ATTRIBUÉ" }, // Automatique
        { code: "NCL", label: "Club gagnant NCL", value: "NON ATTRIBUÉ" }, // Automatique
        { code: "PUS", label: "Prix Puskas", value: "NON ATTRIBUÉ" },
        { code: "BDO", label: "Ballon d’Or", value: "NON ATTRIBUÉ" }
    ];

    const seasons = [
        {
            id: "s1",
            number: 1,
            status: "active",
            startDate: "2026-01-10",
            endDate: null,
            expectedMatches: 20,
            rewards: emptySeasonRewards
        }

        /*
        EXEMPLE DE SAISON À COPIER

        Ajoutez une virgule après la saison précédente, puis copiez cet objet.
        Une seule saison doit normalement avoir le statut `active`.
        */

        /*
        {
            id: "s2",
            number: 2,
            status: "active",
            startDate: "2027-01-10",
            endDate: null,
            expectedMatches: 20,
            rewards: [
                { code: "PUS", label: "Prix Puskas", value: "NON ATTRIBUÉ" },
                { code: "GLD", label: "Soulier d’Or", value: "NON ATTRIBUÉ" },
                { code: "NCL", label: "Club gagnant NCL", value: "NON ATTRIBUÉ" },
                { code: "BDO", label: "Ballon d’Or", value: "NON ATTRIBUÉ" }
            ]
        }
        */
    ];

    /* ----------------------------------------------------------------------
       08B. CALCUL AUTOMATIQUE DE LA VALEUR

       La valeur finale d'un joueur est composée de sa `baseValue`, de toutes
       ses performances de matchs et des récompenses saisonnières obtenues.
       Ces règles alimentent aussi le simulateur de valeur.

       `valueTier` peut être ajouté à un match pour distinguer une petite
       finale (`third`) ou une finale NCL (`finale`). Sans ce champ, la
       catégorie du match est utilisée.
       ---------------------------------------------------------------------- */
    const marketValueTiers = [
        { key: "amical", label: "Amical", shortLabel: "AMICAL", multiplier: 0.5, victory: 2500000 },
        { key: "ligue", label: "Ligue", shortLabel: "LIGUE", multiplier: 1, victory: 5000000 },
        { key: "ncl", label: "NCL", shortLabel: "NCL", multiplier: 2, victory: 10000000 },
        { key: "third", label: "3e Place", shortLabel: "3e PLACE", multiplier: 3, victory: 15000000 },
        { key: "finale", label: "Finale NCL", shortLabel: "FINALE", multiplier: 4, victory: 20000000 }
    ];

    const marketValueActions = [
        { key: "victoire", metric: "win", code: "WIN", label: "Victoire", base: 0 },
        { key: "buts", metric: "goals", code: "GLS", label: "But", base: 1500000 },
        { key: "passes", metric: "assists", code: "AST", label: "Passe décisive", base: 1000000 },
        { key: "def", metric: "defenses", code: "DEF", label: "Défense", base: 200000 },
        { key: "dribbles", metric: "dribbles", code: "DRB", label: "Dribble", base: 200000 },
        { key: "mvp", metric: "mvp", code: "MVP", label: "MVP", base: 10000000 }
    ];

    const marketValueBonuses = [
        { code: "PUS", label: "Prix Puskas", value: 50000000 },
        { code: "NCL", label: "Trophée NCL", value: 100000000 },
        { code: "GLD", label: "Golden Shoe", value: 150000000 },
        { code: "BDO", label: "Ballon d’Or", value: 250000000, premium: true }
    ];

    function getSeasonTopScorer(seasonNumber) {
        const totals = new Map();

        matches
            .filter(match => Number(match.season) === Number(seasonNumber))
            .forEach(match => {
                [...(match.scorersHome || []), ...(match.scorersAway || [])]
                    .forEach(scorer => {
                        const goals = Number(scorer.count || 0);
                        totals.set(scorer.name, (totals.get(scorer.name) || 0) + goals);
                    });
            });

        return [...totals.entries()]
            .filter(([, goals]) => goals > 0)
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))[0]?.[0] || null;
    }

    function resolveSeasonRewards(season) {
        if (!season) return [];
        const playedMatches = matches.filter(match => (
            Number(match.season) === Number(season.number)
        )).length;
        const expectedMatches = Number(season.expectedMatches);
        const seasonIsComplete = Number.isFinite(expectedMatches)
            && expectedMatches > 0
            && playedMatches >= expectedMatches;
        const goldenShoeWinner = seasonIsComplete
            ? getSeasonTopScorer(season.number)
            : null;

        return (season.rewards || emptySeasonRewards).map(reward => (
            reward.code === "GLD"
                ? { ...reward, value: goldenShoeWinner || "NON ATTRIBUÉ" }
                : { ...reward }
        ));
    }

    function normalizeRewardOwner(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[’']/g, "")
            .toLowerCase()
            .trim();
    }

    function getPlayerTrophyCounts(playerName) {
        const counts = { PUS: 0, NCL: 0, GLD: 0, BDO: 0 };
        const normalizedPlayerName = normalizeRewardOwner(playerName);
        const player = players.find(item => normalizeRewardOwner(item.name) === normalizedPlayerName);
        if (!player) return counts;

        const club = clubMeta[player.club] || groups[player.club];
        const clubAliases = new Set([
            player.club,
            club?.key,
            club?.name,
            club?.shortName,
            club?.fullName
        ].filter(Boolean).map(normalizeRewardOwner));

        seasons.forEach(season => {
            resolveSeasonRewards(season).forEach(reward => {
                if (!Object.hasOwn(counts, reward.code)) return;
                const owner = normalizeRewardOwner(reward.value);

                if (reward.code === "NCL") {
                    if (clubAliases.has(owner)) counts.NCL += 1;
                    return;
                }

                if (owner === normalizedPlayerName) counts[reward.code] += 1;
            });
        });

        return counts;
    }

    function getPlayerMatchPerformance(match, playerName) {
        const normalizedPlayerName = normalizeRewardOwner(playerName);
        const itemContainsPlayer = item => (
            normalizeRewardOwner(item?.name) === normalizedPlayerName
            || normalizeRewardOwner(item?.scorer) === normalizedPlayerName
            || normalizeRewardOwner(item?.assist) === normalizedPlayerName
        );
        const homeCollections = [match.notesHome, match.scorersHome, match.timelineHome];
        const awayCollections = [match.notesAway, match.scorersAway, match.timelineAway];
        const playsHome = homeCollections.some(collection => (collection || []).some(itemContainsPlayer));
        const playsAway = awayCollections.some(collection => (collection || []).some(itemContainsPlayer));
        const side = playsHome ? "home" : playsAway ? "away" : null;
        if (!side) return null;

        const goals = [...(match.scorersHome || []), ...(match.scorersAway || [])]
            .filter(scorer => normalizeRewardOwner(scorer.name) === normalizedPlayerName)
            .reduce((total, scorer) => total + Number(scorer.count || 0), 0);
        const assists = [...(match.timelineHome || []), ...(match.timelineAway || [])]
            .filter(event => normalizeRewardOwner(event.assist) === normalizedPlayerName)
            .length;
        const note = [...(match.notesHome || []), ...(match.notesAway || [])]
            .find(player => normalizeRewardOwner(player.name) === normalizedPlayerName);
        const ratedPlayers = [...(match.notesHome || []), ...(match.notesAway || [])]
            .filter(player => Number.isFinite(Number(player.note)))
            .sort((a, b) => Number(b.note) - Number(a.note) || a.name.localeCompare(b.name, "fr"));
        const matchMvp = ratedPlayers[0]?.name || match.mvp;
        const homeScore = Number(match.scoreHome || 0);
        const awayScore = Number(match.scoreAway || 0);
        const draw = homeScore === awayScore;
        const won = !draw && (
            (side === "home" && homeScore > awayScore)
            || (side === "away" && awayScore > homeScore)
        );

        return {
            side,
            goals,
            assists,
            note: Number(note?.note || 0),
            defenses: Number(note?.defenses || 0),
            dribbles: Number(note?.dribbles || 0),
            mvp: normalizeRewardOwner(matchMvp) === normalizedPlayerName ? 1 : 0,
            won,
            draw,
            lost: !won && !draw
        };
    }

    function getPlayerMatchStats(playerName) {
        const totals = {
            matches: 0,
            goals: 0,
            assists: 0,
            defenses: 0,
            dribbles: 0,
            mvp: 0,
            wins: 0,
            draws: 0,
            losses: 0
        };

        matches.forEach(match => {
            const performance = getPlayerMatchPerformance(match, playerName);
            if (!performance) return;

            totals.matches += 1;
            totals.goals += performance.goals;
            totals.assists += performance.assists;
            totals.defenses += performance.defenses;
            totals.dribbles += performance.dribbles;
            totals.mvp += performance.mvp;
            totals.wins += performance.won ? 1 : 0;
            totals.draws += performance.draw ? 1 : 0;
            totals.losses += performance.lost ? 1 : 0;
        });

        return totals;
    }

    function getActiveSeason() {
        return seasons.find(season => season.status === "active") || seasons[seasons.length - 1] || null;
    }

    function getClubMatchStats(clubKey, seasonNumber = getActiveSeason()?.number) {
        const totals = {
            played: 0,
            points: 0,
            w: 0,
            d: 0,
            l: 0,
            gf: 0,
            ga: 0
        };

        matches
            .filter(match => (
                match.category === "ligue"
                &&
                (match.home === clubKey || match.away === clubKey)
                && (seasonNumber === null || seasonNumber === undefined || Number(match.season) === Number(seasonNumber))
            ))
            .forEach(match => {
                const isHome = match.home === clubKey;
                const scored = Number(isHome ? match.scoreHome : match.scoreAway) || 0;
                const conceded = Number(isHome ? match.scoreAway : match.scoreHome) || 0;

                totals.played += 1;
                totals.gf += scored;
                totals.ga += conceded;

                if (scored > conceded) {
                    totals.w += 1;
                    totals.points += 3;
                } else if (scored < conceded) {
                    totals.l += 1;
                } else {
                    totals.d += 1;
                    totals.points += 1;
                }
            });

        return totals;
    }

    function getClubTitleCount(clubKey) {
        const club = clubMeta[clubKey];
        if (!club) return 0;

        const aliases = new Set([
            normalizeRewardOwner(clubKey),
            normalizeRewardOwner(club.name),
            normalizeRewardOwner(club.fullName),
            normalizeRewardOwner(club.shortName)
        ].filter(Boolean));

        return seasons.reduce((total, season) => (
            total + resolveSeasonRewards(season).filter(reward => (
                reward.code === "NCL" && aliases.has(normalizeRewardOwner(reward.value))
            )).length
        ), 0);
    }

    function getPlayerMarketValueBreakdown(playerName) {
        const normalizedPlayerName = normalizeRewardOwner(playerName);
        const player = players.find(item => normalizeRewardOwner(item.name) === normalizedPlayerName);
        const baseValue = Number(player?.baseValue || 0);
        const actionTotals = Object.fromEntries(
            marketValueActions.map(action => [action.key, { quantity: 0, value: 0 }])
        );

        matches.forEach(match => {
            const performance = getPlayerMatchPerformance(match, playerName);
            if (!performance) return;

            const tierKey = match.valueTier || match.category;
            const tier = marketValueTiers.find(item => item.key === tierKey) || marketValueTiers[0];
            const quantities = {
                victoire: performance.won ? 1 : 0,
                buts: performance.goals,
                passes: performance.assists,
                def: performance.defenses,
                dribbles: performance.dribbles,
                mvp: performance.mvp
            };

            marketValueActions.forEach(action => {
                const quantity = Number(quantities[action.key] || 0);
                const unitValue = action.key === "victoire"
                    ? Number(tier.victory || 0)
                    : Number(action.base || 0) * Number(tier.multiplier || 1);
                actionTotals[action.key].quantity += quantity;
                actionTotals[action.key].value += quantity * unitValue;
            });
        });

        const trophyCounts = getPlayerTrophyCounts(playerName);
        const rewardTotals = marketValueBonuses.map(bonus => {
            const count = Number(trophyCounts[bonus.code] || 0);
            return {
                ...bonus,
                count,
                total: count * Number(bonus.value || 0)
            };
        });
        const matchValue = Object.values(actionTotals)
            .reduce((total, action) => total + action.value, 0);
        const rewardValue = rewardTotals.reduce((total, bonus) => total + bonus.total, 0);

        return {
            baseValue,
            matchValue,
            rewardValue,
            total: Math.round(baseValue + matchValue + rewardValue),
            actions: actionTotals,
            rewards: rewardTotals
        };
    }

    function getPlayerMarketValue(playerName) {
        return getPlayerMarketValueBreakdown(playerName).total;
    }

    function refreshPlayerValues() {
        players.forEach(player => {
            player.value = getPlayerMarketValue(player.name);
        });
        return players;
    }

    refreshPlayerValues();

    /* ----------------------------------------------------------------------
       09. POSTES

       Libellés utilisés dans les filtres et les dossiers joueurs.
       Si un nouveau code de poste est créé, il faut aussi prévoir sa position
       visuelle sur le terrain dans JavaScript/club.js.
       ---------------------------------------------------------------------- */
    const positions = {
        CF: "Attaquant Central",
        LW: "Ailier Gauche",
        RW: "Ailier Droit",
        LM: "Milieu Gauche",
        RM: "Milieu Droit"
    };

    /* ----------------------------------------------------------------------
       10A. TITRES TECHNIQUES DES FICHES JOUEURS

       Un titre est débloqué lorsqu'une note de compétence atteint le seuil
       indiqué par `requirement`. `metric` doit correspondre à une statistique
       lue par Joueurs/player-card.js.
       ---------------------------------------------------------------------- */
    const technicalTitleRules = [
        { metric: "defense", name: "Crown Messenger", threshold: 95, requirement: "Défense 95+", code: "DEF", accent: "#9dff5c", priority: 55 },
        { metric: "passe", name: "Rainbow Passes", threshold: 95, requirement: "Passe 95+", code: "PAS", accent: "#65b5ff", priority: 55 },
        { metric: "dribble", name: "Butterfly Dribbling", threshold: 95, requirement: "Dribble 95+", code: "DRI", accent: "#c879ff", priority: 55 },
        { metric: "tir", name: "Predator Eyes", threshold: 95, requirement: "Tir 95+", code: "TIR", accent: "#ff6670", priority: 55 },
        { metric: "offense", name: "God Speed", threshold: 95, requirement: "Offense 95+", code: "OFF", accent: "#ffad4d", priority: 55 },
        { metric: "position", name: "Meta-Vision", threshold: 95, requirement: "Positionnement 95+", code: "POS", accent: "#63e7ff", priority: 55 },
        { metric: "global", name: "The Machinery.", threshold: 95, requirement: "Note globale 95+", code: "OVR", accent: "#f4f7f9", priority: 75 }
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

    const valueTitleTrack = {
        metric: "value",
        code: "VAL",
        accent: "#ffd84d",
        unit: "¥",
        titles: [
            [100000000, "Riche"],
            [500000000, "Extra Riche"],
            [1000000000, "Milliardaire"]
        ]
    };

    /* ----------------------------------------------------------------------
       11. EXPORT VERS LES AUTRES PAGES

       Tout est regroupé dans `window.NEBULA_DATA`. Les scripts d'interface
       lisent ce registre mais ne doivent pas y recopier leurs propres données.

       OUTILS DISPONIBLES :
       assetUrl(path)       = URL absolue d'une image ou ressource
       pageUrl(path)        = URL absolue d'une page
       getClub(key)         = retrouver un club ou groupe
       getPlayer(name)      = retrouver un joueur par son nom
       getSeasonTopScorer(n)= retrouver le meilleur buteur d'une saison
       resolveSeasonRewards = résoudre les récompenses automatiques
       getPlayerTrophyCounts= compter les trophées d'un joueur
       getPlayerMatchPerformance = lire la performance d'un joueur sur un match
       getPlayerMatchStats   = cumuler les statistiques de matchs d'un joueur
       getClubMatchStats     = calculer le bilan du club sur une saison
       getClubTitleCount     = compter les trophées NCL du club
       getPlayerMarketValue  = calculer la valeur totale d'un joueur
       calculateTechnicalOverall = calculer automatiquement la note globale
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
        marketValueTiers,
        marketValueActions,
        marketValueBonuses,
        technicalTitleRules,
        careerTitleTracks,
        valueTitleTrack,
        calculateTechnicalOverall,
        getClub: key => clubMeta[key] || groups[key] || null,
        getPlayer: name => players.find(player => player.name === name) || null,
        getSeasonTopScorer,
        resolveSeasonRewards,
        getPlayerTrophyCounts,
        getPlayerMatchPerformance,
        getPlayerMatchStats,
        getActiveSeason,
        getClubMatchStats,
        getClubTitleCount,
        getPlayerMarketValue,
        getPlayerMarketValueBreakdown,
        refreshPlayerValues,
        syncDiscordAvatars,
        playerPageHref: player => player?.href || pageUrl("players.html"),
        clubPageHref: key => pageUrl(`club.html?club=${encodeURIComponent(key)}`)
    });

    window.NEBULA_DATA.discordAvatarReady = syncDiscordAvatars();
})();
