// Fiche de démonstration : un joueur fictif qui débloque tous les titres.
// Chargé uniquement par Joueurs/demo/demo.html, entre nebula-data.js et
// player-card.js. Les données sont modifiées en mémoire, sur cette page
// seulement ; cette page n'est publiée qu'en local (pnpm dev), jamais en ligne.
(function () {
    const data = window.NEBULA_DATA;
    if (!data) return;

    const DEMO_NAME = 'Demo';
    const DEMO_CLUB = 'bastard';
    const DEMO_SEASON = 99;
    const club = data.getClub(DEMO_CLUB);

    // 1. Le joueur : stats techniques au maximum, titre ultime, valeur record.
    const player = {
        name: DEMO_NAME,
        club: DEMO_CLUB,
        clubName: club?.name || DEMO_CLUB,
        folder: 'demo',
        position: 'CF',
        baseValue: 1500000000,
        value: 1500000000,
        character: 'Kaiser',
        Ult: true,
        avatarPath: 'images/icons/kaiser.webp',
        avatar: data.assetUrl('images/icons/kaiser.webp'),
        profilePath: 'Joueurs/demo/demo.html',
        href: data.pageUrl('Joueurs/demo/demo.html'),
        technical: { defense: 100, passe: 100, dribble: 100, tir: 100, offense: 100, position: 100, global: 100 }
    };
    data.players.push(player);

    // 2. Carrière : de quoi atteindre le plus haut palier de chaque piste.
    const getMatchStats = data.getPlayerMatchStats;
    data.getPlayerMatchStats = (name, ...rest) => (name === DEMO_NAME
        ? { matches: 120, goals: 450, assists: 320, defenses: 480, dribbles: 520, mvp: 60, wins: 110, draws: 4, losses: 6 }
        : getMatchStats(name, ...rest));

    const getTrophyCounts = data.getPlayerTrophyCounts;
    data.getPlayerTrophyCounts = (name, ...rest) => (name === DEMO_NAME
        ? { PUS: 1, NCL: 1, GLD: 1, BDO: 1 }
        : getTrophyCounts(name, ...rest));

    // 3. Une saison fictive terminée où il remporte tout (ligue, NCL,
    //    Puskás, Soulier d'Or, Ballon d'Or) : ce qui débloque aussi le GOAT.
    const demoSeason = {
        id: 'demo',
        number: DEMO_SEASON,
        status: 'finished',
        demo: true,
        rewards: [
            { code: 'GLD', label: 'Soulier d’Or', value: DEMO_NAME },
            { code: 'NCL', label: 'Club gagnant NCL', value: club?.name || DEMO_CLUB },
            { code: 'PUS', label: 'Prix Puskas', value: DEMO_NAME },
            { code: 'BDO', label: 'Ballon d’Or', value: DEMO_NAME }
        ]
    };
    data.seasons = [...data.seasons, demoSeason];

    const resolveRewards = data.resolveSeasonRewards;
    data.resolveSeasonRewards = season => (season?.demo ? season.rewards : resolveRewards(season));

    const getClubStats = data.getClubMatchStats;
    data.getClubMatchStats = (key, seasonNumber, ...rest) => (Number(seasonNumber) === DEMO_SEASON
        ? (key === DEMO_CLUB ? { played: 10, points: 30, gf: 90, ga: 12 } : { played: 0, points: 0, gf: 0, ga: 0 })
        : getClubStats(key, seasonNumber, ...rest));

})();
