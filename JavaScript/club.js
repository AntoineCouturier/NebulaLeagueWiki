// club.js - Page Clubs (concept "Écran de sélection d'équipe")
// Les clubs, logos, couleurs et styles proviennent de JavaScript/nebula-data.js.
// Les effectifs sont générés automatiquement depuis PLAYERS (players.js) à partir
// du club et du poste de chaque joueur. Le centre tactique, le terrain, les compteurs,
// les liens et les valeurs se mettent ensuite à jour sans composition manuelle ici.

const CLUBS = (window.NEBULA_DATA?.clubs || []).map(club => ({
    ...club,
    standings: window.NEBULA_DATA?.getClubMatchStats?.(club.key)
        || { played: 0, points: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 },
    titles: window.NEBULA_DATA?.getClubTitleCount?.(club.key) || 0
}));
const CLUB_ROLES = ["CF", "LW", "RW", "LM", "RM"];
const CLUB_CAPACITY = CLUB_ROLES.length;

function buildClubRoster(clubKey) {
    const roster = Object.fromEntries(CLUB_ROLES.map(role => [role, null]));
    if (typeof PLAYERS === "undefined") return roster;

    PLAYERS
        .filter(player => player.club === clubKey)
        .forEach(player => {
            const role = String(player.position || "").toUpperCase();
            if (!CLUB_ROLES.includes(role) || roster[role]) return;

            roster[role] = {
                name: player.name,
                href: window.NEBULA_DATA.playerPageHref(player)
            };
        });

    return roster;
}

CLUBS.forEach(club => {
    club.roster = buildClubRoster(club.key);
});

// Position des 5 postes de la formation 3–2 sur le mini-terrain (en % du conteneur)
const PITCH_POSITIONS = {
    CF: { top: "18%", left: "50%" },
    LW: { top: "34%", left: "16%" },
    RW: { top: "34%", left: "84%" },
    LM: { top: "74%", left: "30%" },
    RM: { top: "74%", left: "70%" }
};

const ROLE_LABEL = { CF: "CF", LW: "LW", RW: "RW", LM: "LM", RM: "RM" };

document.addEventListener("DOMContentLoaded", () => {

    const tabs = document.getElementById("clubTabs");
    const stageField = document.getElementById("clubStageField");
    const stageDossier = document.getElementById("clubStageDossier");
    const allTimeStage = document.getElementById("clubAllTimeStage");
    const historyStage = document.getElementById("clubHistoryStage");
    if (!tabs || !stageField || !stageDossier) return;

    /* ============================================================
       UTILITAIRES
       ============================================================ */
    function clubValue(key) {
        if (typeof PLAYERS === "undefined") return 0;
        return PLAYERS.filter(p => p.club === key).reduce((sum, p) => sum + p.value, 0);
    }

    function filledCount(roster) {
        return Object.values(roster).filter(Boolean).length;
    }

    function clubIndex(club) {
        return String(CLUBS.indexOf(club) + 1).padStart(2, "0");
    }

    function formatValue(value) {
        if (value >= 1000000000) {
            return `${(value / 1000000000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} B`;
        }
        if (value >= 1000000) {
            return `${(value / 1000000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} K`;
        }
        return value.toLocaleString("fr-FR");
    }

    function seasonNumbers() {
        return [...new Set([
            ...(window.NEBULA_DATA?.seasons || []).map(season => Number(season.number)),
            ...(window.NEBULA_DATA?.matches || []).map(match => Number(match.season))
        ])].filter(Number.isFinite).sort((a, b) => b - a);
    }

    function matchDateLabel(value) {
        if (!value) return "DATE INCONNUE";
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(new Date(`${value}T12:00:00`)).replace(".", "").toUpperCase();
    }

    function clubSeasonStanding(clubKey, seasonNumber) {
        const table = CLUBS.map(item => {
            const stats = window.NEBULA_DATA?.getClubMatchStats?.(item.key, seasonNumber)
                || { played: 0, points: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
            return { key: item.key, ...stats, diff: stats.gf - stats.ga };
        }).sort((a, b) => b.points - a.points || b.diff - a.diff || b.gf - a.gf);
        const record = table.find(item => item.key === clubKey);
        return {
            ...(record || { played: 0, points: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, diff: 0 }),
            rank: record?.played ? table.indexOf(record) + 1 : null
        };
    }

    function clubSeasonLeaders(club, seasonMatches) {
        const leaders = new Map();
        function ensure(name) {
            if (!leaders.has(name)) leaders.set(name, { name, goals: 0, notes: 0, rated: 0 });
            return leaders.get(name);
        }

        seasonMatches.forEach(match => {
            const isHome = match.home === club.key;
            (isHome ? match.scorersHome : match.scorersAway || []).forEach(scorer => {
                ensure(scorer.name).goals += Number(scorer.count || 0);
            });
            (isHome ? match.notesHome : match.notesAway || []).forEach(note => {
                const record = ensure(note.name);
                if (!Number.isFinite(Number(note.note))) return;
                record.notes += Number(note.note);
                record.rated += 1;
            });
        });

        const entries = [...leaders.values()];
        const bestRated = entries
            .filter(player => player.rated)
            .sort((a, b) => (b.notes / b.rated) - (a.notes / a.rated) || b.goals - a.goals)[0] || null;
        const topScorer = [...entries].sort((a, b) => b.goals - a.goals || b.rated - a.rated)[0] || null;
        return {
            bestRated: bestRated ? { ...bestRated, average: bestRated.notes / bestRated.rated } : null,
            topScorer: topScorer?.goals ? topScorer : null
        };
    }

    const ALL_TIME_CATEGORIES = [
        { key: "goals", code: "GLS", label: "MEILLEUR BUTEUR", color: "#ff5368", unit: value => value === 1 ? "BUT" : "BUTS" },
        { key: "assists", code: "AST", label: "MEILLEUR PASSEUR", color: "#52dcff", unit: value => value === 1 ? "PASSE D." : "PASSES D." },
        { key: "defenses", code: "DEF", label: "MEILLEUR DÉFENSEUR", color: "#43f58b", unit: () => "DÉF." },
        { key: "dribbles", code: "DRB", label: "MEILLEUR DRIBBLEUR", color: "#c879ff", unit: value => value === 1 ? "DRIBBLE" : "DRIBBLES" },
        { key: "mvp", code: "MVP", label: "PLUS DE MVP", color: "#ffd84d", unit: () => "MVP" }
    ];

    function clubAllTimeLeaders(club) {
        const clubPlayers = (typeof PLAYERS === "undefined" ? [] : PLAYERS)
            .filter(player => player.club === club.key)
            .map(player => ({
                player,
                stats: window.NEBULA_DATA?.getPlayerMatchStats?.(player.name) || {}
            }));

        return ALL_TIME_CATEGORIES.map(category => {
            const ranked = clubPlayers
                .map(entry => ({
                    ...entry,
                    value: Number(entry.stats[category.key] || 0),
                    matches: Number(entry.stats.matches || 0)
                }))
                .sort((a, b) => b.value - a.value || b.matches - a.matches || a.player.name.localeCompare(b.player.name, "fr"));
            const leader = ranked[0]?.value > 0 ? ranked[0] : null;
            return { ...category, leader };
        });
    }

    function renderClubAllTime(club) {
        if (!allTimeStage) return;
        const leaders = clubAllTimeLeaders(club);
        allTimeStage.style.setProperty("--club-color", club.color);
        allTimeStage.innerHTML = `
            <div class="club-alltime-grid">
                ${leaders.map((category, index) => {
                    const player = category.leader?.player;
                    const value = category.leader?.value || 0;
                    const avatar = player?.avatar || "images/logos/nebula.png";
                    const href = player ? window.NEBULA_DATA.playerPageHref(player) : "#";
                    return `
                        <article class="club-alltime-card" style="--leader-color:${category.color}">
                            <div class="club-alltime-topline"><span>${category.code}</span><small>${String(index + 1).padStart(2, "0")}</small></div>
                            <div class="club-alltime-player">
                                <img src="${avatar}" alt="" loading="lazy" decoding="async">
                                <div><small>${category.label}</small>
                                    ${player ? `<a href="${href}">${player.name}</a><span>${player.position} // ${club.name}</span>` : "<strong>NON ATTRIBUÉ</strong><span>AUCUNE DONNÉE</span>"}
                                </div>
                            </div>
                            <div class="club-alltime-value"><strong>${value.toLocaleString("fr-FR")}</strong><span>${category.unit(value)}</span></div>
                        </article>`;
                }).join("")}
            </div>`;
    }

    function clubNclResult(club, seasonMatches) {
        const nclMatches = seasonMatches.filter(match => match.category === "ncl");
        if (!nclMatches.length) return "NON QUALIFIÉ";
        const final = nclMatches.find(match => String(match.valueTier || "").toLowerCase() === "finale");
        if (final && (final.home === club.key || final.away === club.key)) {
            const isHome = final.home === club.key;
            const won = isHome ? final.scoreHome > final.scoreAway : final.scoreAway > final.scoreHome;
            return won ? "CHAMPION NCL" : "FINALISTE NCL";
        }
        const third = nclMatches.find(match => String(match.valueTier || "").toLowerCase() === "third");
        if (third && (third.home === club.key || third.away === club.key)) {
            const isHome = third.home === club.key;
            const won = isHome ? third.scoreHome > third.scoreAway : third.scoreAway > third.scoreHome;
            return won ? "TROISIÈME PLACE" : "QUATRIÈME PLACE";
        }
        return "DEMI-FINALISTE";
    }

    function playerLink(name) {
        const player = typeof PLAYERS === "undefined"
            ? null
            : PLAYERS.find(item => item.name.toLowerCase() === String(name || "").toLowerCase());
        if (!player) return name || "NON ATTRIBUÉ";
        return `<a href="${window.NEBULA_DATA.playerPageHref(player)}">${player.name}</a>`;
    }

    /* ============================================================
       TERRAIN VISUEL DU CENTRE TACTIQUE
       ============================================================ */
    function renderPitch(club, big) {
        const slots = Object.entries(club.roster).map(([role, player]) => {
            const pos = PITCH_POSITIONS[role];
            const filled = !!player;
            const nameHTML = big
                ? (filled
                    ? `<a href="${player.href}" class="${club.cls} pitch-player-name">${player.name}</a>`
                    : `<span class="pitch-player-name pitch-vacant">Poste vacant</span>`)
                : "";

            return `
            <div class="pitch-slot ${filled ? "filled" : "vacant"} ${big ? "pitch-slot-big" : ""}"
                 style="top:${pos.top}; left:${pos.left};">
                <span class="pitch-dot" style="--slot-color:${club.color};"><span>${ROLE_LABEL[role]}</span></span>
                ${nameHTML}
            </div>`;
        }).join("");

        return `<div class="club-pitch ${big ? "club-pitch-big" : "club-pitch-mini"}">
            <div class="pitch-lines"></div>
            ${slots}
        </div>`;
    }

    function renderClubTabs(activeKey) {
        tabs.innerHTML = CLUBS.map(club => {
            const count = filledCount(club.roster);
            const active = club.key === activeKey;
            return `
                <button type="button" class="club-tab ${active ? "active" : ""}" data-select-club="${club.key}"
                    style="--club-color:${club.color};" aria-pressed="${active}">
                    <span>${clubIndex(club)}</span>
                    <img src="${club.logo}" alt="" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'">
                    <div><strong>${club.name}</strong><small>${count}/${CLUB_CAPACITY} JOUEURS</small></div>
                </button>
            `;
        }).join("");
    }

    function renderStage(club) {
        const count = filledCount(club.roster);
        const openSlots = CLUB_CAPACITY - count;
        const value = formatValue(clubValue(club.key));
        const s = club.standings;

        stageField.style.setProperty("--club-color", club.color);
        stageDossier.style.setProperty("--club-color", club.color);
        stageField.innerHTML = `
            <div class="stage-field-topline">
                <span>FORMATION // 3–2</span>
                <span>${count}/${CLUB_CAPACITY} POSTES OCCUPÉS</span>
            </div>
            ${renderPitch(club, true)}
            <div class="stage-field-footer">
                <span><i></i> JOUEUR ENREGISTRÉ</span>
                <span><i></i> POSTE VACANT</span>
            </div>
        `;

        stageDossier.innerHTML = `
            <div class="stage-dossier-topline">
                <span>DOSSIER // ${clubIndex(club)}</span>
                <span class="stage-sync"><i></i> SYNCHRONISÉ</span>
            </div>
            <div class="stage-club-identity">
                <img src="${club.logo}" alt="${club.name}" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'">
                <div><small>${club.fullName || "NEBULA LEAGUE CLUB"}</small><h3>${club.name}</h3></div>
            </div>
            <blockquote>${club.style}</blockquote>
            <div class="stage-data-grid">
                <div><small>JOUEURS</small><strong>${count}<span>/${String(CLUB_CAPACITY).padStart(2, "0")}</span></strong></div>
                <div><small>POSTES LIBRES</small><strong>${openSlots}</strong></div>
                <div><small>POINTS</small><strong>${s.points}</strong></div>
                <div class="stage-value"><small>VALEUR</small><strong>${value}<span>¥</span></strong></div>
            </div>
            <div class="stage-roster">
                <small>COMPOSITION ACTIVE</small>
                ${renderRosterList(club)}
            </div>
            <div class="stage-actions">
                <a href="players.html?club=${club.key}">VOIR LES JOUEURS <span>→</span></a>
            </div>
        `;
    }

    function renderClubHistory(club) {
        if (!historyStage) return;
        const allMatches = window.NEBULA_DATA?.matches || [];
        const seasons = seasonNumbers();
        const clubMatches = allMatches
            .filter(match => match.home === club.key || match.away === club.key)
            .sort((a, b) => String(b.date).localeCompare(String(a.date)));
        const seasonCards = seasons.map(seasonNumber => {
            const matches = clubMatches.filter(match => Number(match.season) === seasonNumber);
            const standing = clubSeasonStanding(club.key, seasonNumber);
            const leaders = clubSeasonLeaders(club, matches);
            const nclResult = clubNclResult(club, matches);
            const completedSeason = window.NEBULA_DATA?.seasons?.find(item => Number(item.number) === seasonNumber);
            const state = !matches.length
                ? "EN ATTENTE"
                : completedSeason?.status === "active"
                    ? "SAISON ACTIVE"
                    : "ARCHIVE FERMÉE";
            return `
                <article class="club-season-card">
                    <div class="club-season-topline">
                        <span>S${String(seasonNumber).padStart(2, "0")}</span>
                        <small>${state}</small>
                    </div>
                    <div class="club-season-rank">
                        <small>CLASSEMENT LIGUE</small>
                        <strong>${standing.rank ? `#${String(standing.rank).padStart(2, "0")}` : "—"}</strong>
                        <span>${standing.points} PTS · ${standing.w}V ${standing.d}N ${standing.l}D</span>
                    </div>
                    <div class="club-season-data">
                        <div><small>MATCHS</small><strong>${matches.length}</strong></div>
                        <div><small>DIFF.</small><strong>${standing.diff > 0 ? "+" : ""}${standing.diff}</strong></div>
                        <div class="${nclResult === "CHAMPION NCL" ? "is-ncl-champion" : ""}"><small>PARCOURS NCL</small><strong>${nclResult}</strong></div>
                    </div>
                    <div class="club-season-leaders">
                        <div><small>MEILLEURE NOTE</small><strong>${leaders.bestRated ? playerLink(leaders.bestRated.name) : "NON ATTRIBUÉ"}</strong><span>${leaders.bestRated ? leaders.bestRated.average.toFixed(1) : "—"}</span></div>
                        <div><small>MEILLEUR BUTEUR</small><strong>${leaders.topScorer ? playerLink(leaders.topScorer.name) : "NON ATTRIBUÉ"}</strong><span>${leaders.topScorer?.goals || 0} GLS</span></div>
                    </div>
                </article>
            `;
        }).join("");

        const recentMatches = clubMatches.slice(0, 5).map(match => {
            const isHome = match.home === club.key;
            const opponentKey = isHome ? match.away : match.home;
            const opponent = CLUBS.find(item => item.key === opponentKey);
            const scored = Number(isHome ? match.scoreHome : match.scoreAway);
            const conceded = Number(isHome ? match.scoreAway : match.scoreHome);
            const result = scored > conceded ? "V" : scored < conceded ? "D" : "N";
            return `
                <li class="club-history-match result-${result.toLowerCase()}">
                    <span>${result}</span>
                    <div><small>${matchDateLabel(match.date)} · ${String(match.category).toUpperCase()}</small><strong>${opponent?.name || opponentKey}</strong></div>
                    <b>${scored}–${conceded}</b>
                </li>
            `;
        }).join("");

        historyStage.style.setProperty("--club-color", club.color);
        historyStage.innerHTML = `
            <div class="club-history-summary">
                <div><small>CLUB ANALYSÉ</small><strong>${club.name}</strong></div>
                <div><small>SAISONS INDEXÉES</small><strong>${seasons.length}</strong></div>
                <div><small>MATCHS ARCHIVÉS</small><strong>${clubMatches.length}</strong></div>
                <div><small>TROPHÉES NCL</small><strong>${club.titles}</strong></div>
            </div>
            <div class="club-history-grid">
                <div class="club-season-list">
                    ${seasonCards || '<div class="club-history-empty">AUCUNE SAISON INDEXÉE</div>'}
                </div>
                <aside class="club-recent-panel">
                    <div class="club-recent-heading"><small>DERNIERS SIGNAUX</small><strong>FORME DU CLUB</strong></div>
                    <ul>${recentMatches || '<li class="club-history-empty">AUCUN MATCH ARCHIVÉ</li>'}</ul>
                </aside>
            </div>
        `;
    }

    /* ============================================================
       COMPOSITION DU CLUB
       ============================================================ */
    function renderRosterList(club) {
        const rows = Object.entries(club.roster).map(([role, player]) => `
            <li class="roster-row">
                <span class="role-badge role-${role.toLowerCase()}">${role}</span>
                ${player
                ? `<a class="${club.cls}" href="${player.href}">${player.name}</a>`
                : `<span class="empty-slot">Poste vacant</span>`}
            </li>`).join("");

        return `<ul class="roster-list">${rows}</ul>`;
    }

    /* ============================================================
       RENDU INITIAL
       ============================================================ */
    const totalSlots = CLUBS.length * Object.keys(PITCH_POSITIONS).length;
    const registeredPlayers = typeof PLAYERS === "undefined"
        ? 0
        : PLAYERS.filter(player => CLUBS.some(club => club.key === player.club)).length;
    const occupiedSlots = CLUBS.reduce((total, club) => total + filledCount(club.roster), 0);
    document.getElementById("clubCount").textContent = String(CLUBS.length).padStart(2, "0");
    document.getElementById("registeredCount").textContent = String(registeredPlayers).padStart(2, "0");
    document.getElementById("openSlotCount").textContent = String(totalSlots - occupiedSlots).padStart(2, "0");

    function selectClub(clubKey) {
        const club = CLUBS.find(item => item.key === clubKey) || CLUBS[0];
        renderClubTabs(club.key);
        renderStage(club);
        renderClubAllTime(club);
        renderClubHistory(club);
    }

    tabs.addEventListener("click", event => {
        const button = event.target.closest("[data-select-club]");
        if (!button) return;
        selectClub(button.dataset.selectClub);
    });

    const requestedClub = new URLSearchParams(window.location.search).get("club");
    const initialClub = CLUBS.some(club => club.key === requestedClub) ? requestedClub : CLUBS[0].key;
    selectClub(initialClub);
});
