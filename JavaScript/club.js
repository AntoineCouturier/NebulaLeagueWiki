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

    // Lettre de zone de surveillance : A, B, C… (une par club)
    function zoneLetter(index) {
        return String.fromCharCode(65 + (index % 26));
    }

    function clubZone(club) {
        return zoneLetter(CLUBS.indexOf(club));
    }

    function pad(value) {
        return String(value).padStart(2, "0");
    }

    function playerByName(name) {
        if (typeof PLAYERS === "undefined") return null;
        return PLAYERS.find(item => item.name.toLowerCase() === String(name || "").toLowerCase()) || null;
    }

    // Classement ego : joueurs actifs ayant une note globale, triés par note
    // (même règle que players.js et player-card.js).
    const EGO_RANKING = (typeof PLAYERS === "undefined" ? [] : PLAYERS)
        .filter(player => player.club !== "retraite" && Number.isFinite(player.technical?.global))
        .sort((a, b) => b.technical.global - a.technical.global)
        .map(player => player.name);

    function egoRank(name) {
        const index = EGO_RANKING.indexOf(name);
        return index === -1 ? null : index + 1;
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
        { key: "goals", code: "GLS", label: "Meilleur buteur", unit: value => value === 1 ? "BUT" : "BUTS" },
        { key: "assists", code: "AST", label: "Meilleur passeur", unit: value => value === 1 ? "PASSE D." : "PASSES D." },
        { key: "defenses", code: "DEF", label: "Meilleur défenseur", unit: () => "DÉF." },
        { key: "dribbles", code: "DRB", label: "Meilleur dribbleur", unit: value => value === 1 ? "DRIBBLE" : "DRIBBLES" },
        { key: "mvp", code: "MVP", label: "Plus de MVP", unit: () => "MVP" }
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

    /* ============================================================
       LEADERS HISTORIQUES : un mur de cinq caméras
       (flux du joueur leader, ou mire « pas de signal »)
       ============================================================ */
    function renderClubAllTime(club) {
        if (!allTimeStage) return;
        const leaders = clubAllTimeLeaders(club);
        allTimeStage.style.setProperty("--club-color", club.color);
        allTimeStage.innerHTML = `
            <div class="club-alltime-grid nl-wall">
                ${leaders.map((category, index) => {
                    const player = category.leader?.player;
                    const value = category.leader?.value || 0;
                    const cam = `<b>CAM ${pad(index + 1)}</b> // ${category.code}`;
                    if (!player) {
                        return `
                        <article class="club-alltime-card nl-feed is-offline">
                            <span class="nl-feed-mire" data-label="PAS DE SIGNAL"></span>
                            <span class="nl-feed-osd"><span>${cam}</span><span class="rec is-off"><span class="feed-state">HORS LIGNE</span></span></span>
                            <strong class="nl-feed-figure club-alltime-value">00<small>${category.unit(0)}</small></strong>
                            <span class="nl-feed-caption"><small>${category.label}</small><b>Non attribué</b><em>Aucune donnée</em></span>
                        </article>`;
                    }
                    const href = window.NEBULA_DATA.playerPageHref(player);
                    return `
                        <article class="club-alltime-card nl-feed is-live">
                            <img class="nl-feed-img" src="${player.avatar}" alt="" loading="lazy" decoding="async">
                            <span class="nl-feed-osd"><span>${cam}</span><span class="rec"><span class="feed-state">REC</span></span></span>
                            <strong class="nl-feed-figure club-alltime-value">${value.toLocaleString("fr-FR")}<small>${category.unit(value)}</small></strong>
                            <span class="nl-feed-caption"><small>${category.label}</small><b><a href="${href}">${player.name}</a></b><em>${player.position} // ${club.name}</em></span>
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
        const player = playerByName(name);
        if (!player) return name || "NON ATTRIBUÉ";
        return `<a href="${window.NEBULA_DATA.playerPageHref(player)}">${player.name}</a>`;
    }

    /* ============================================================
       ÉCRAN PROGRAMME : vue aérienne de la formation
       Chaque poste occupé est un petit flux portrait ; un poste vacant
       est une mire de test.
       ============================================================ */
    function renderPitch(club, big) {
        const slots = Object.entries(club.roster).map(([role, player]) => {
            const pos = PITCH_POSITIONS[role];
            const place = `top:${pos.top}; left:${pos.left};`;
            if (player) {
                const avatar = playerByName(player.name)?.avatar || "images/logos/nebula.png";
                return `
            <a class="pitch-slot filled ${big ? "pitch-slot-big" : ""}" href="${player.href}" style="${place}"
               aria-label="${player.name}, poste ${ROLE_LABEL[role]}">
                <span class="pitch-dot" style="--slot-color:${club.color};">
                    <img src="${avatar}" alt="" loading="lazy" decoding="async">
                    <span>${ROLE_LABEL[role]}</span>
                </span>
                ${big ? `<span class="${club.cls} pitch-player-name">${player.name}</span>` : ""}
            </a>`;
            }
            return `
            <div class="pitch-slot vacant ${big ? "pitch-slot-big" : ""}" style="${place}">
                <span class="pitch-dot"><span>${ROLE_LABEL[role]}</span></span>
                ${big ? `<span class="pitch-player-name pitch-vacant">Poste vacant</span>` : ""}
            </div>`;
        }).join("");

        return `<div class="club-pitch ${big ? "club-pitch-big" : "club-pitch-mini"}">
            <div class="pitch-lines" aria-hidden="true"><i></i></div>
            ${slots}
        </div>`;
    }

    /* ============================================================
       PRÉVISUALISATION : un écran par club (+ zones libres en mire)
       ============================================================ */
    function renderClubTabs(activeKey) {
        const screens = CLUBS.map((club, index) => {
            const count = filledCount(club.roster);
            const active = club.key === activeKey;
            return `
                <button type="button" class="club-tab nl-zone ${active ? "active" : ""}" data-select-club="${club.key}"
                    style="--club-color:${club.color};" aria-pressed="${active}"
                    aria-label="${club.name}, ${count} joueurs sur ${CLUB_CAPACITY}">
                    <span class="zone-osd"><span><b>CAM ${clubIndex(club)}</b><span class="zone-osd-zone"> // ZONE ${zoneLetter(index)}</span></span><span class="rec ${active ? "" : "is-off"}"><span class="zone-state">${active ? "PGM" : "PRV"}</span></span></span>
                    <span class="zone-crest"><img src="${club.logo}" alt="" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'"></span>
                    <span class="nl-feed-lock" aria-hidden="true"></span>
                    <span class="zone-caption"><small>${count}/${CLUB_CAPACITY} joueurs</small><strong>${club.name}</strong></span>
                    <b class="zone-count" aria-hidden="true">${count}</b>
                </button>
            `;
        });
        // Zones libres : complète la dernière rangée (3 écrans) par des mires
        const freeZones = CLUBS.length % 3 === 0 ? 0 : 3 - (CLUBS.length % 3);
        for (let index = 0; index < freeZones; index += 1) {
            const position = CLUBS.length + index;
            screens.push(`
                <div class="club-tab-empty nl-zone is-offline" aria-hidden="true">
                    <span class="nl-feed-mire" data-label="PAS DE SIGNAL"></span>
                    <span class="zone-osd"><span><b>CAM ${pad(position + 1)}</b><span class="zone-osd-zone"> // ZONE ${zoneLetter(position)}</span></span><span class="rec is-off"><span class="zone-state">LIBRE</span></span></span>
                    <span class="zone-caption"><small>Emplacement libre</small><strong>Aucun club</strong></span>
                </div>
            `);
        }
        tabs.innerHTML = screens.join("");
    }

    function renderStage(club) {
        const count = filledCount(club.roster);
        const openSlots = CLUB_CAPACITY - count;
        const rawValue = clubValue(club.key);
        const value = formatValue(rawValue);
        const s = club.standings;
        const zone = clubZone(club);
        const activeSeason = window.NEBULA_DATA?.getActiveSeason?.()?.number;

        stageField.style.setProperty("--club-color", club.color);
        stageDossier.style.setProperty("--club-color", club.color);
        stageField.innerHTML = `
            <div class="stage-field-topline osd">
                <span><b>PGM</b> // ZONE ${zone} — ${club.name}</span>
                <span class="osd-hide-sm">FORMATION // 3–2</span>
                <span class="rec">DIRECT</span>
            </div>
            <div class="stage-field-screen">
                <img class="stage-field-crest" src="${club.logo}" alt="" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'">
                ${renderPitch(club, true)}
                <span class="stage-field-count"><span><b>${count}</b>/${CLUB_CAPACITY}</span><small>postes occupés</small></span>
                <span class="stage-field-meter" style="--filled:${count}; --total:${CLUB_CAPACITY};" aria-hidden="true"></span>
                <span class="stage-field-zone" aria-hidden="true"><small>Zone</small>${zone}</span>
            </div>
            <div class="stage-field-footer">
                <span><i></i> Joueur enregistré</span>
                <span><i></i> Poste vacant</span>
                <span class="stage-field-tc">VUE AÉRIENNE // CAM ${clubIndex(club)}</span>
            </div>
        `;

        stageDossier.innerHTML = `
            <div class="stage-dossier-topline osd">
                <span><b>DOSSIER // ${clubIndex(club)}</b> — ZONE ${zone}</span>
                <span class="jp osd-hide-sm">クラブ</span>
                <span class="stage-sync"><i></i> SYNCHRONISÉ</span>
            </div>
            <div class="stage-dossier-body">
                <div class="stage-club-crest nl-feed is-locked">
                    <img class="stage-crest-img" src="${club.logo}" alt="${club.name}" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'">
                    <span class="nl-feed-lock" aria-hidden="true"></span>
                    <span class="nl-feed-osd"><span><b>CAM ${clubIndex(club)}</b> // EMBLÈME</span><span class="rec">REC</span></span>
                    <span class="stage-crest-zone" aria-hidden="true">${zone}</span>
                </div>
                <div class="stage-club-identity">
                    <p class="nl-kicker"><span class="nl-ch">ZONE ${zone}</span> ${club.fullName || "Club de la Nebula League"}</p>
                    <h3>${club.name}</h3>
                    <blockquote><small>Transcription // Style de jeu</small>${club.style}</blockquote>
                    <div class="stage-actions">
                        <a class="nl-btn" href="players.html?club=${club.key}">Voir les joueurs <span>→</span></a>
                        <a class="nl-btn nl-btn-ghost" href="headtohead.html">Comparer <span>⇄</span></a>
                    </div>
                </div>
            </div>
            <div class="stage-data-grid nl-stats">
                <div class="nl-stat nl-stat--solid">
                    <span class="nl-stat-label">Joueurs</span>
                    <strong class="nl-stat-value">${pad(count)}<small>/${pad(CLUB_CAPACITY)}</small></strong>
                    <div class="nl-vu ${count === CLUB_CAPACITY ? "nl-vu--max" : ""}" style="--v:${Math.round(count / CLUB_CAPACITY * 100)}" role="meter"
                        aria-label="Effectif" aria-valuemin="0" aria-valuemax="${CLUB_CAPACITY}" aria-valuenow="${count}"></div>
                </div>
                <div class="nl-stat">
                    <span class="nl-stat-label">Postes libres</span>
                    <strong class="nl-stat-value">${pad(openSlots)}</strong>
                    <span class="nl-stat-note">${openSlots ? "Recrutement ouvert" : "Effectif complet"}</span>
                </div>
                <div class="nl-stat">
                    <span class="nl-stat-label">Points</span>
                    <strong class="nl-stat-value">${pad(s.points)}</strong>
                    <span class="nl-stat-note">${s.played ? `${s.w}V ${s.d}N ${s.l}D` : `Saison ${pad(activeSeason || 1)} // aucun match`}</span>
                </div>
                <div class="nl-stat stage-value">
                    <span class="nl-stat-label">Valeur</span>
                    <strong class="nl-stat-value">${value}<small>¥</small></strong>
                    <span class="nl-stat-note">${rawValue ? "Cumul de l’effectif" : "Non coté"}</span>
                </div>
            </div>
            <div class="stage-roster">
                <p class="stage-roster-head"><span class="nl-ch">CH 01-B</span> Composition active <b>// ${count}/${CLUB_CAPACITY}</b></p>
                ${renderRosterList(club)}
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
            const stateTag = state === "SAISON ACTIVE" ? "nl-tag--ligue" : state === "EN ATTENTE" ? "nl-tag--amical" : "nl-tag--off";
            const rank = standing.rank
                ? `<span class="nl-rank nl-rank--md ${standing.rank > 1 && standing.rank <= 3 ? "is-podium" : ""}"><small>#</small>${String(standing.rank).padStart(3, "0")}</span>`
                : `<span class="nl-nc"><b>Non classé</b><small>En attente de match</small></span>`;
            return `
                <article class="club-season-card">
                    <div class="club-season-topline">
                        <small>Saison</small>
                        <b>${pad(seasonNumber)}</b>
                        <span class="nl-tag ${stateTag}">${state}</span>
                    </div>
                    <div class="club-season-rank">
                        <small>Classement ligue</small>
                        ${rank}
                        <span>${standing.points} PTS · ${standing.w}V ${standing.d}N ${standing.l}D</span>
                    </div>
                    <div class="club-season-data">
                        <div><small>Matchs</small><strong>${pad(matches.length)}</strong></div>
                        <div><small>Diff.</small><strong>${standing.diff > 0 ? "+" : ""}${standing.diff}</strong></div>
                        <div class="${nclResult === "CHAMPION NCL" ? "is-ncl-champion" : ""}"><small>Parcours NCL</small><strong>${nclResult}</strong></div>
                    </div>
                    <div class="club-season-leaders">
                        <div><small>Meilleure note</small><strong>${leaders.bestRated ? playerLink(leaders.bestRated.name) : "NON ATTRIBUÉ"}</strong><span>${leaders.bestRated ? leaders.bestRated.average.toFixed(1) : "—"}</span></div>
                        <div><small>Meilleur buteur</small><strong>${leaders.topScorer ? playerLink(leaders.topScorer.name) : "NON ATTRIBUÉ"}</strong><span>${leaders.topScorer?.goals || 0} GLS</span></div>
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
                <li class="club-history-match result-${result.toLowerCase()}" style="--club:${opponent?.color || "var(--offline)"}">
                    <span>${result}</span>
                    <div><small>${matchDateLabel(match.date)} · ${String(match.category).toUpperCase()}</small><strong>${opponent?.name || opponentKey}</strong></div>
                    <b>${scored}–${conceded}</b>
                </li>
            `;
        }).join("");

        historyStage.style.setProperty("--club-color", club.color);
        historyStage.innerHTML = `
            <div class="club-history-summary nl-stats">
                <div class="nl-stat nl-stat--solid club-history-club"><span class="nl-stat-label">Club analysé</span><strong class="nl-stat-value">${club.name}</strong><span class="nl-stat-note">Zone ${clubZone(club)} // dossier ${clubIndex(club)}</span></div>
                <div class="nl-stat"><span class="nl-stat-label">Saisons indexées</span><strong class="nl-stat-value">${pad(seasons.length)}</strong></div>
                <div class="nl-stat"><span class="nl-stat-label">Matchs archivés</span><strong class="nl-stat-value">${pad(clubMatches.length)}</strong></div>
                <div class="nl-stat"><span class="nl-stat-label">Trophées NCL</span><strong class="nl-stat-value">${pad(club.titles)}</strong></div>
            </div>
            <div class="club-history-grid">
                <div class="club-season-list">
                    ${seasonCards || '<div class="club-history-empty nl-nosignal"><span class="nl-nosignal-code">SIGNAL 00</span><strong>Aucune saison indexée</strong><p>Les bandes de saison apparaîtront ici dès l’ouverture du premier cycle.</p></div>'}
                </div>
                <aside class="club-recent-panel mon">
                    <div class="osd"><span><b>CAM 07</b> // DERNIERS SIGNAUX</span><span class="rec ${recentMatches ? "" : "is-off"}">${recentMatches ? "REC" : "HORS LIGNE"}</span></div>
                    <div class="club-recent-heading"><small>5 derniers matchs</small><strong>Forme du club</strong></div>
                    ${recentMatches
                        ? `<ul>${recentMatches}</ul>`
                        : `<div class="club-history-empty nl-nosignal"><span class="nl-nosignal-code">SIGNAL 00</span><strong>Aucun match archivé</strong><p>Les cinq derniers résultats de ${club.name} s’afficheront ici dès sa première rencontre.</p></div>`}
                </aside>
            </div>
        `;
    }

    /* ============================================================
       COMPOSITION DU CLUB : tableau « régie »
       ============================================================ */
    function renderRosterList(club) {
        const rows = Object.entries(club.roster).map(([role, player]) => {
            const roleTag = `<span class="role-badge nl-tag nl-tag--pos role-${role.toLowerCase()}" style="--club:${club.color}">${role}</span>`;
            if (!player) {
                return `
                <tr class="roster-row is-vacant">
                    <td>${roleTag}</td>
                    <td class="roster-vacant" colspan="4"><span class="empty-slot">Poste vacant</span><small>PAS DE SIGNAL // RECRUTEMENT OUVERT</small></td>
                </tr>`;
            }
            const data = playerByName(player.name);
            const rating = data?.technical?.global;
            const hasRating = Number.isFinite(rating);
            const rank = egoRank(player.name);
            return `
                <tr class="roster-row" style="--club:${club.color}">
                    <td>${roleTag}</td>
                    <td class="nl-strong"><a class="${club.cls}" href="${player.href}">${player.name}</a></td>
                    <td class="is-hl">${hasRating ? rating : "—"}</td>
                    <td class="roster-rank">${rank ? `<span class="nl-rank nl-rank--sm ${rank > 1 && rank <= 3 ? "is-podium" : ""}"><small>#</small>${String(rank).padStart(3, "0")}</span>` : `<span class="nl-tag nl-tag--off">Non classé</span>`}</td>
                    <td class="roster-value">${data?.value ? `${formatValue(data.value)} ¥` : "NON COTÉ"}</td>
                </tr>`;
        }).join("");

        return `<div class="nl-table-wrap roster-wrap"><table class="nl-table roster-list">
            <thead><tr><th scope="col">Poste</th><th scope="col">Joueur</th><th scope="col" class="is-hl">Note</th><th scope="col">Rang ego</th><th scope="col" class="roster-value">Valeur</th></tr></thead>
            <tbody>${rows}</tbody>
        </table></div>`;
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
        // Le rendu remplace les écrans : on rend le focus à l'écran choisi
        tabs.querySelector(`[data-select-club="${button.dataset.selectClub}"]`)?.focus({ preventScroll: true });
    });

    const requestedClub = new URLSearchParams(window.location.search).get("club");
    const initialClub = CLUBS.some(club => club.key === requestedClub) ? requestedClub : CLUBS[0].key;
    selectClub(initialClub);
});
