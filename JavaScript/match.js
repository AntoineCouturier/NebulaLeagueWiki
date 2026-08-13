// Référentiel partagé des matchs.
// Les pages Matchs, Saisons, Records et Face à face utilisent ces alias et
// ces deux fonctions pour lire les données centralisées dans nebula-data.js.

const CLUB_META = window.NEBULA_DATA?.clubMeta || {};
const MATCHES = window.NEBULA_DATA?.matches || [];
const MATCH_LENGTH_SECONDS = window.NEBULA_DATA?.matchLengthSeconds || (12 * 60);

function club(key) {
    return CLUB_META[key] || { name: key || "???", logo: "", cls: "" };
}

// Calcule les buts, passes décisives, défenses et dribbles d'un joueur
// pour un match. Les valeurs explicites des notes priment sur la timeline.
function computePlayerStats(match) {
    const stats = {};

    function ensure(name) {
        if (!stats[name]) {
            stats[name] = { buts: 0, passes: 0, defenses: 0, dribbles: 0 };
        }
        return stats[name];
    }

    (match.scorersHome || []).forEach(({ name, count }) => {
        ensure(name).buts += Number(count) || 0;
    });
    (match.scorersAway || []).forEach(({ name, count }) => {
        ensure(name).buts += Number(count) || 0;
    });

    [...(match.timelineHome || []), ...(match.timelineAway || [])].forEach(event => {
        ensure(event.scorer);
        if (event.assist && !event.assist.includes("🌟")) {
            ensure(event.assist).passes += 1;
        }
    });

    [...(match.notesHome || []), ...(match.notesAway || [])].forEach(player => {
        const playerStats = ensure(player.name);
        if (player.buts !== undefined) playerStats.buts = Number(player.buts) || 0;
        if (player.passes !== undefined) playerStats.passes = Number(player.passes) || 0;
        if (player.defenses !== undefined) playerStats.defenses = Number(player.defenses) || 0;
        if (player.dribbles !== undefined) playerStats.dribbles = Number(player.dribbles) || 0;
    });

    return stats;
}

// Le joueur possédant la meilleure note devient automatiquement MVP.
// `match.mvp` reste un secours pour les anciennes entrées sans notes.
function computeMatchMvp(match) {
    const ratedPlayers = [...(match.notesHome || []), ...(match.notesAway || [])]
        .filter(player => Number.isFinite(player.note))
        .sort((a, b) => b.note - a.note || a.name.localeCompare(b.name, "fr"));

    return ratedPlayers[0] || (match.mvp ? { name: match.mvp, note: null } : null);
}
