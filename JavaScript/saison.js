// Archives des saisons — les résultats sont recalculés depuis MATCHES.
// Pour créer un nouveau cycle vide, ajoutez son identité dans JavaScript/nebula-data.js.

document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains("seasons-page")
        || typeof MATCHES === "undefined"
        || typeof computePlayerStats !== "function") return;

    const SEASON_CLUBS = window.NEBULA_DATA?.clubMeta || {};
    const SEASON_META = window.NEBULA_DATA?.seasons || [];
    const SEASON_FIXTURES = window.NEBULA_DATA?.fixtures || [];
    const EMPTY_REWARDS = SEASON_META[0]?.rewards || [];

    const switcher = document.getElementById("seasonSwitcher");
    const dossier = document.getElementById("seasonDossier");
    const history = document.getElementById("seasonHistory");
    const modal = document.getElementById("seasonModal");
    const modalContent = document.getElementById("seasonModalContent");
    if (!switcher || !dossier || !history || !modal || !modalContent) return;

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function compactDate(value) {
        if (!value) return "EN COURS";
        const [year, month, day] = value.split("-");
        return `${day}.${month}.${year}`;
    }

    function dateRange(start, end) {
        return `${compactDate(start)} — ${end ? compactDate(end) : "AUJOURD’HUI"}`;
    }

    function plural(value, singular, pluralForm = `${singular}S`) {
        return `${value} ${value > 1 ? pluralForm : singular}`;
    }

    function clubInfo(key) {
        return SEASON_CLUBS[key] || {
            name: key || "Non référencé",
            logo: "images/logos/nebula.png",
            color: "#8a99a5"
        };
    }

    function clubLink(key) {
        return `club.html?club=${encodeURIComponent(key)}`;
    }

    function playerProfile(name) {
        if (typeof PLAYERS === "undefined") return null;
        return PLAYERS.find(player => player.name === name) || null;
    }

    function playerLink(name) {
        const profile = playerProfile(name);
        if (!profile) return "players.html";
        if (window.NEBULA_DATA?.playerPageHref) return window.NEBULA_DATA.playerPageHref(profile);
        return `Joueurs/${profile.folder}/${profile.name.toLowerCase()}.html`;
    }

    function goalDifference(row) {
        return row.gf - row.ga;
    }

    function sortStandings(rows) {
        return [...rows].sort((a, b) =>
            b.pts - a.pts
            || goalDifference(b) - goalDifference(a)
            || b.gf - a.gf
            || clubInfo(a.club).name.localeCompare(clubInfo(b.club).name, "fr")
        );
    }

    function playerSide(match, name) {
        const contains = collection => (collection || []).some(item =>
            item.name === name || item.scorer === name || item.assist === name
        );
        if (contains(match.notesHome) || contains(match.scorersHome) || contains(match.timelineHome)) return "home";
        if (contains(match.notesAway) || contains(match.scorersAway) || contains(match.timelineAway)) return "away";
        return null;
    }

    function seasonCatalog() {
        const catalog = SEASON_META.map(season => ({ ...season }));
        const knownNumbers = new Set(catalog.map(season => Number(season.number)));

        [...new Set(MATCHES.map(match => Number(match.season)).filter(Number.isFinite))]
            .filter(number => !knownNumbers.has(number))
            .forEach(number => {
                const seasonMatches = MATCHES.filter(match => Number(match.season) === number);
                const dates = seasonMatches.map(match => match.date).filter(Boolean).sort();
                catalog.push({
                    id: `s${number}`,
                    number,
                    status: "finished",
                    startDate: dates[0] || null,
                    endDate: dates.at(-1) || null,
                    expectedMatches: Math.max(seasonMatches.length, 1),
                    rewards: EMPTY_REWARDS
                });
            });

        return catalog;
    }

    function buildSeasonSnapshot(meta) {
        const allMatches = MATCHES
            .filter(match => Number(match.season) === Number(meta.number))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        const leagueMatches = allMatches.filter(match => match.category === "ligue");

        const standings = new Map(Object.keys(SEASON_CLUBS).map(key => [key, {
            club: key,
            pts: 0,
            gf: 0,
            ga: 0,
            w: 0,
            d: 0,
            l: 0
        }]));
        const players = new Map();

        function ensurePlayer(name, clubKey) {
            if (!players.has(name)) {
                players.set(name, {
                    name,
                    club: clubKey,
                    goals: 0,
                    assists: 0,
                    defenses: 0,
                    dribbles: 0,
                    matches: 0
                });
            }
            const player = players.get(name);
            if (!player.club && clubKey) player.club = clubKey;
            return player;
        }

        leagueMatches.forEach(match => {
            const home = standings.get(match.home);
            const away = standings.get(match.away);
            if (home && away) {
                home.gf += Number(match.scoreHome || 0);
                home.ga += Number(match.scoreAway || 0);
                away.gf += Number(match.scoreAway || 0);
                away.ga += Number(match.scoreHome || 0);

                if (match.scoreHome > match.scoreAway) {
                    home.w += 1;
                    home.pts += 3;
                    away.l += 1;
                } else if (match.scoreAway > match.scoreHome) {
                    away.w += 1;
                    away.pts += 3;
                    home.l += 1;
                } else {
                    home.d += 1;
                    away.d += 1;
                    home.pts += 1;
                    away.pts += 1;
                }
            }

            const matchStats = computePlayerStats(match);
            Object.entries(matchStats).forEach(([name, stats]) => {
                const side = playerSide(match, name);
                const player = ensurePlayer(name, side === "home" ? match.home : side === "away" ? match.away : null);
                player.goals += Number(stats.buts || 0);
                player.assists += Number(stats.passes || 0);
                player.defenses += Number(stats.defenses || 0);
                player.dribbles += Number(stats.dribbles || 0);
                player.matches += 1;
            });
        });

        function ranking(key) {
            return [...players.values()]
                .sort((a, b) => b[key] - a[key] || b.matches - a.matches || a.name.localeCompare(b.name, "fr"))
                .map((player, index) => ({
                    ...player,
                    rank: index + 1,
                    value: player[key],
                    average: player.matches ? player[key] / player.matches : 0
                }));
        }

        const rankedStandings = sortStandings([...standings.values()]);
        const totalGoals = leagueMatches.reduce((total, match) =>
            total + Number(match.scoreHome || 0) + Number(match.scoreAway || 0), 0);
        const expectedLeagueFixtures = SEASON_FIXTURES.filter(fixture => (
            fixture.category === "ligue"
            && Number(fixture.season) === Number(meta.number)
        )).length;
        const expectedLeagueMatches = Math.max(
            expectedLeagueFixtures || Number(meta.expectedMatches) || leagueMatches.length || 1,
            leagueMatches.length,
            1
        );
        const progress = Math.min(100, Math.round((leagueMatches.length / expectedLeagueMatches) * 100));

        return {
            ...meta,
            matches: allMatches,
            leagueMatches,
            expectedLeagueMatches,
            standings: rankedStandings,
            playerCount: players.size,
            totalGoals,
            progress,
            leader: leagueMatches.length ? rankedStandings[0] : null,
            topScorers: ranking("goals"),
            topAssists: ranking("assists"),
            topContributors: [...players.values()]
                .map(player => ({
                    ...player,
                    total: player.goals + player.assists,
                    average: player.matches ? (player.goals + player.assists) / player.matches : 0
                }))
                .sort((a, b) => b.total - a.total || b.matches - a.matches || a.name.localeCompare(b.name, "fr"))
                .map((player, index) => ({ ...player, rank: index + 1 }))
        };
    }

    const seasons = seasonCatalog()
        .map(buildSeasonSnapshot)
        .sort((a, b) => Number(b.number) - Number(a.number));
    let selectedId = (seasons.find(season => season.status === "active") || seasons[0])?.id;
    let selectedCompetition = "league";

    function statusLabel(season) {
        return season.status === "active" ? "SAISON ACTIVE" : "ARCHIVE SCELLÉE";
    }

    function renderHero() {
        const active = seasons.find(season => season.status === "active") || seasons[0];
        const totalMatches = seasons.reduce((total, season) => total + season.leagueMatches.length, 0);
        const stats = [
            [seasons.length, "CYCLES INDEXÉS"],
            [Object.keys(SEASON_CLUBS).length, "CLUBS RÉFÉRENCÉS"],
            [totalMatches, "MATCHS ARCHIVÉS"]
        ];

        document.getElementById("seasonHeroStats").innerHTML = stats.map(([value, label]) => `
            <div><strong>${String(value).padStart(2, "0")}</strong><span>${label}</span></div>
        `).join("");

        if (active) {
            document.getElementById("seasonCycleNumber").textContent = String(active.number).padStart(2, "0");
            document.getElementById("seasonCycleStatus").textContent = statusLabel(active);
            document.getElementById("seasonCycleProgress").textContent = `${active.progress}% SYNCHRONISÉ`;
            document.querySelector(".season-cycle")?.style.setProperty("--cycle-progress", `${active.progress * 3.6}deg`);
        }
    }

    function renderSwitcher() {
        switcher.innerHTML = seasons.map((season, index) => {
            const selected = season.id === selectedId;
            return `
                <button class="season-control-button season-switch${selected ? " is-selected" : ""}" type="button"
                    role="tab" aria-selected="${selected}" data-season-select="${escapeHtml(season.id)}">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <div><small>${statusLabel(season)}</small><strong>SAISON ${String(season.number).padStart(2, "0")}</strong></div>
                    <em>${compactDate(season.startDate)}</em>
                    <i></i>
                </button>
            `;
        }).join("");
    }

    function renderLeaderIdentity(season) {
        if (!season.leader) {
            return `
                <div class="season-leader-empty">
                    <span>—</span>
                    <div><small>LEADER ACTUEL</small><strong>EN ATTENTE DU PREMIER RÉSULTAT</strong></div>
                </div>
            `;
        }
        const info = clubInfo(season.leader.club);
        const label = season.status === "finished" ? "CHAMPION DE L’ÉDITION" : "LEADER PROVISOIRE";
        return `
            <a class="season-leader-card" href="${clubLink(season.leader.club)}" style="--club-accent:${info.color}">
                <img src="${escapeHtml(info.logo)}" alt="">
                <div><small>${label}</small><strong>${escapeHtml(info.name)}</strong><span>${season.leader.pts} PTS · ${season.leader.gf} BUTS</span></div>
                <i>↗</i>
            </a>
        `;
    }

    function renderMetrics(season) {
        const metrics = [
            [season.leagueMatches.length, "MATCHS JOUÉS"],
            [season.totalGoals, "BUTS MARQUÉS"],
            [season.playerCount, "JOUEURS ACTIFS"],
            [Object.keys(SEASON_CLUBS).length, "CLUBS ENGAGÉS"]
        ];
        return `
            <div class="season-metric-grid">
                ${metrics.map(([value, label]) => `
                    <div><strong>${String(value).padStart(2, "0")}</strong><span>${label}</span></div>
                `).join("")}
            </div>
        `;
    }

    function renderProgress(season) {
        return `
            <div class="season-progress-module" style="--progress:${season.progress * 3.6}deg">
                <div class="season-progress-ring"><strong>${season.progress}</strong><span>%</span></div>
                <div>
                    <small>PROGRESSION DU CYCLE</small>
                    <strong>${season.leagueMatches.length} / ${season.expectedLeagueMatches} MATCHS</strong>
                    <span>${season.status === "active" ? "Synchronisation en temps réel" : "Archive terminée"}</span>
                </div>
            </div>
        `;
    }

    function renderStandingsPreview(season) {
        const maximum = Math.max(...season.standings.map(row => row.pts), 1);
        return `
            <section class="season-ranking-panel">
                <header><div><small>TABLEAU DE LIGUE</small><h3>CLASSEMENT CLUBS</h3></div><span>PTS</span></header>
                <div class="season-standing-list">
                    ${season.standings.map((row, index) => {
                        const info = clubInfo(row.club);
                        const played = row.w + row.d + row.l;
                        return `
                            <a href="${clubLink(row.club)}" class="season-standing-row${index === 0 && season.leagueMatches.length ? " is-leading" : ""}"
                                style="--club-accent:${info.color}">
                                <span>${String(index + 1).padStart(2, "0")}</span>
                                <img src="${escapeHtml(info.logo)}" alt="">
                                <div><strong>${escapeHtml(info.name)}</strong><small>${played} MJ · ${row.w}-${row.d}-${row.l}</small></div>
                                <i><b style="width:${(row.pts / maximum) * 100}%"></b></i>
                                <em>${row.pts}</em>
                            </a>
                        `;
                    }).join("")}
                </div>
            </section>
        `;
    }

    function leaderEntry(label, code, ranking, key, accent) {
        const player = ranking[0];
        return `
            <a class="season-player-leader" href="${player ? playerLink(player.name) : "players.html"}"
                style="--leader-accent:${accent}">
                <span>${code}</span>
                <div>
                    <small>${label}</small>
                    <strong>${player ? escapeHtml(player.name) : "NON ATTRIBUÉ"}</strong>
                    <em>${player ? `${player[key]} · ${escapeHtml(clubInfo(player.club).name)}` : "AUCUNE DONNÉE"}</em>
                </div>
                <i>↗</i>
            </a>
        `;
    }

    function renderLeadersPreview(season) {
        return `
            <section class="season-ranking-panel player-leaders-panel">
                <header><div><small>INDEX INDIVIDUEL</small><h3>LEADERS DE SAISON</h3></div><span>TOP</span></header>
                <div class="season-player-leaders">
                    ${leaderEntry("MEILLEUR BUTEUR", "GLS", season.topScorers, "goals", "#ff536e")}
                    ${leaderEntry("MEILLEUR PASSEUR", "AST", season.topAssists, "assists", "#58ddff")}
                    ${leaderEntry("CONTRIBUTIONS", "G+A", season.topContributors, "total", "#9bff20")}
                </div>
            </section>
        `;
    }

    function renderRewards(season) {
        const rewards = window.NEBULA_DATA?.resolveSeasonRewards
            ? window.NEBULA_DATA.resolveSeasonRewards(season)
            : (season.rewards || EMPTY_REWARDS);

        return `
            <div class="season-awards">
                ${rewards.map(reward => `
                    <div class="season-award">
                        <span>${escapeHtml(reward.code)}</span>
                        <div><small>${escapeHtml(reward.label)}</small><strong>${escapeHtml(reward.value)}</strong></div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function nclFixturesForSeason(season) {
        return SEASON_FIXTURES
            .filter(fixture => (
                fixture.category === "ncl"
                && Number(fixture.season) === Number(season.number)
            ))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    function nclMatchForFixture(season, fixture) {
        return season.matches.find(match => (
            match.category === "ncl"
            && (
                match.id === fixture.sourceMatchId
                || match.date === fixture.date
            )
        )) || null;
    }

    function buildNclSnapshot(season) {
        const fixtures = nclFixturesForSeason(season);
        const matches = season.matches
            .filter(match => match.category === "ncl")
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        const clubRows = new Map();
        const players = new Map();

        function ensureClub(key) {
            if (!key) return null;
            if (!clubRows.has(key)) {
                clubRows.set(key, {
                    club: key,
                    played: 0,
                    wins: 0,
                    losses: 0,
                    gf: 0,
                    ga: 0
                });
            }
            return clubRows.get(key);
        }

        fixtures.forEach(fixture => {
            ensureClub(fixture.home);
            ensureClub(fixture.away);
        });

        matches.forEach(match => {
            const home = ensureClub(match.home);
            const away = ensureClub(match.away);
            const scoreHome = Number(match.scoreHome || 0);
            const scoreAway = Number(match.scoreAway || 0);

            if (home && away) {
                home.played += 1;
                away.played += 1;
                home.gf += scoreHome;
                home.ga += scoreAway;
                away.gf += scoreAway;
                away.ga += scoreHome;

                if (scoreHome > scoreAway) {
                    home.wins += 1;
                    away.losses += 1;
                } else if (scoreAway > scoreHome) {
                    away.wins += 1;
                    home.losses += 1;
                }
            }

            Object.entries(computePlayerStats(match)).forEach(([name, stats]) => {
                const side = playerSide(match, name);
                if (!players.has(name)) {
                    players.set(name, {
                        name,
                        club: side === "home" ? match.home : side === "away" ? match.away : null,
                        goals: 0,
                        assists: 0,
                        defenses: 0,
                        dribbles: 0,
                        total: 0,
                        matches: 0
                    });
                }
                const player = players.get(name);
                player.goals += Number(stats.buts || 0);
                player.assists += Number(stats.passes || 0);
                player.defenses += Number(stats.defenses || 0);
                player.dribbles += Number(stats.dribbles || 0);
                player.total += Number(stats.buts || 0) + Number(stats.passes || 0);
                player.matches += 1;
            });
        });

        function ranking(key) {
            return [...players.values()]
                .sort((a, b) => b[key] - a[key] || b.matches - a.matches || a.name.localeCompare(b.name, "fr"))
                .map((player, index) => ({
                    ...player,
                    rank: index + 1,
                    value: player[key]
                }));
        }

        const standings = [...clubRows.values()].sort((a, b) =>
            b.wins - a.wins
            || (b.gf - b.ga) - (a.gf - a.ga)
            || b.gf - a.gf
            || clubInfo(a.club).name.localeCompare(clubInfo(b.club).name, "fr")
        );
        const finalFixture = fixtures.find(fixture => fixture.valueTier === "finale")
            || fixtures.find(fixture => String(fixture.stage).toLowerCase() === "finale");
        const finalMatch = finalFixture ? nclMatchForFixture(season, finalFixture) : null;
        const champion = finalMatch
            ? Number(finalMatch.scoreHome) > Number(finalMatch.scoreAway)
                ? finalMatch.home
                : finalMatch.away
            : null;
        const completed = fixtures.filter(fixture => nclMatchForFixture(season, fixture)).length;
        const expected = Math.max(fixtures.length, 4);
        const progress = Math.min(100, Math.round((completed / expected) * 100));
        const phase = champion
            ? "CHAMPION COURONNÉ"
            : completed >= 2
                ? "FINALES DÉVERROUILLÉES"
                : completed
                    ? "DEMI-FINALES EN COURS"
                    : standings.length >= 4
                        ? "TABLEAU INITIALISÉ"
                        : "QUALIFICATIONS EN ATTENTE";

        return {
            fixtures,
            matches,
            standings,
            champion,
            completed,
            expected,
            progress,
            phase,
            totalGoals: matches.reduce((total, match) =>
                total + Number(match.scoreHome || 0) + Number(match.scoreAway || 0), 0),
            topScorers: ranking("goals"),
            topAssists: ranking("assists"),
            topContributors: ranking("total"),
            topDribblers: ranking("dribbles")
        };
    }

    function renderCompetitionToggle(season) {
        const hasNcl = nclFixturesForSeason(season).length > 0;
        return `
            <div class="season-competition-toggle" role="tablist" aria-label="Compétition affichée">
                <div>
                    <small>COMPÉTITION</small>
                    <strong>${selectedCompetition === "ncl" ? "NEBULA CHAMPIONS LEAGUE" : "NEBULA LEAGUE"}</strong>
                </div>
                <button type="button" class="${selectedCompetition === "league" ? "is-active" : ""}"
                    role="tab" aria-selected="${selectedCompetition === "league"}" data-competition-view="league">
                    <span>01</span> LIGUE
                </button>
                <button type="button" class="${selectedCompetition === "ncl" ? "is-active" : ""}"
                    role="tab" aria-selected="${selectedCompetition === "ncl"}" data-competition-view="ncl"
                    ${hasNcl ? "" : "disabled"}>
                    <span>02</span> NCL
                </button>
            </div>
        `;
    }

    function renderNclMatchCard(season, fixture, extraClass = "") {
        if (!fixture) {
            return `<div class="ncl-match-card is-locked ${extraClass}"><span>CRÉNEAU VERROUILLÉ</span></div>`;
        }

        const match = nclMatchForFixture(season, fixture);
        const home = fixture.home || match?.home || null;
        const away = fixture.away || match?.away || null;
        const homeInfo = clubInfo(home);
        const awayInfo = clubInfo(away);
        const isComplete = Boolean(match);
        const stage = fixture.stage || "Phase finale";
        const isFinal = fixture.valueTier === "finale" || String(stage).toLowerCase() === "finale";

        return `
            <button type="button"
                class="ncl-match-card${isComplete ? " is-complete" : ""}${isFinal ? " is-final" : ""} ${extraClass}"
                data-open-ncl-match="${escapeHtml(fixture.id)}">
                <header>
                    <span>${escapeHtml(stage)}</span>
                    <em>${isComplete ? "TERMINÉ" : home && away ? "PROGRAMMÉ" : "VERROUILLÉ"}</em>
                </header>
                <div class="ncl-match-team">
                    <img src="${escapeHtml(homeInfo.logo)}" alt="">
                    <strong>${home ? escapeHtml(homeInfo.name) : "À DÉTERMINER"}</strong>
                    <b>${isComplete ? Number(match.scoreHome) : "—"}</b>
                </div>
                <div class="ncl-match-team">
                    <img src="${escapeHtml(awayInfo.logo)}" alt="">
                    <strong>${away ? escapeHtml(awayInfo.name) : "À DÉTERMINER"}</strong>
                    <b>${isComplete ? Number(match.scoreAway) : "—"}</b>
                </div>
                <footer><span>${compactDate(fixture.date)}</span><i>${isComplete ? "OUVRIR LE RAPPORT" : "VOIR LE CRÉNEAU"} ↗</i></footer>
            </button>
        `;
    }

    function renderNclBracket(season, ncl) {
        const [semiOne, semiTwo] = ncl.fixtures;
        const third = ncl.fixtures.find(fixture => fixture.valueTier === "third") || ncl.fixtures[2];
        const final = ncl.fixtures.find(fixture => fixture.valueTier === "finale") || ncl.fixtures[3];

        return `
            <section class="ncl-bracket-panel">
                <header>
                    <div><small>ÉLIMINATION DIRECTE</small><h3>TABLEAU NCL</h3></div>
                    <span>${String(ncl.completed).padStart(2, "0")} / ${String(ncl.expected).padStart(2, "0")} TERMINÉS</span>
                </header>
                <div class="ncl-bracket">
                    <div class="ncl-main-flow">
                        <div class="ncl-round ncl-semi-round">
                            <div class="ncl-round-label"><span>ROUND 01</span><strong>DEMI-FINALES</strong></div>
                            ${renderNclMatchCard(season, semiOne)}
                            ${renderNclMatchCard(season, semiTwo)}
                        </div>
                        <div class="ncl-convergence" aria-hidden="true">
                            <i class="ncl-wire wire-top"></i>
                            <i class="ncl-wire wire-bottom"></i>
                            <i class="ncl-wire wire-spine"></i>
                            <i class="ncl-wire wire-output"></i>
                            <span></span>
                            <b>VAINQUEURS</b>
                        </div>
                        <div class="ncl-round ncl-final-round">
                            <div class="ncl-round-label"><span>ROUND 02</span><strong>FINALE NCL</strong></div>
                            ${renderNclMatchCard(season, final)}
                        </div>
                    </div>
                    <aside class="ncl-third-branch">
                        <div class="ncl-round-label"><span>BRANCHE SECONDAIRE · PERDANTS</span><strong>PETITE FINALE</strong></div>
                        ${renderNclMatchCard(season, third, "is-third")}
                    </aside>
                </div>
            </section>
        `;
    }

    function renderNclStandingsPreview(ncl) {
        const maximum = Math.max(...ncl.standings.map(row => row.wins), 1);
        return `
            <section class="season-ranking-panel ncl-club-index">
                <header><div><small>INDEX PHASE FINALE</small><h3>PARCOURS DES CLUBS</h3></div><span>V</span></header>
                <div class="season-standing-list">
                    ${ncl.standings.length ? ncl.standings.map((row, index) => {
                        const info = clubInfo(row.club);
                        const difference = row.gf - row.ga;
                        return `
                            <a href="${clubLink(row.club)}" class="season-standing-row${ncl.champion === row.club ? " is-leading" : ""}"
                                style="--club-accent:${info.color}">
                                <span>${String(index + 1).padStart(2, "0")}</span>
                                <img src="${escapeHtml(info.logo)}" alt="">
                                <div><strong>${escapeHtml(info.name)}</strong><small>${row.played} MJ · ${row.wins} V · DIFF ${difference > 0 ? "+" : ""}${difference}</small></div>
                                <i><b style="width:${(row.wins / maximum) * 100}%"></b></i>
                                <em>${row.wins}</em>
                            </a>
                        `;
                    }).join("") : `<div class="season-no-data">Les quatre qualifiés apparaîtront à la fin de la Ligue.</div>`}
                </div>
            </section>
        `;
    }

    function renderNclLeadersPreview(ncl) {
        return `
            <section class="season-ranking-panel player-leaders-panel">
                <header><div><small>PERFORMANCES NCL</small><h3>LEADERS DE LA PHASE FINALE</h3></div><span>TOP</span></header>
                <div class="season-player-leaders">
                    ${leaderEntry("MEILLEUR BUTEUR", "GLS", ncl.topScorers, "goals", "#ff536e")}
                    ${leaderEntry("MEILLEUR PASSEUR", "AST", ncl.topAssists, "assists", "#58ddff")}
                    ${leaderEntry("CONTRIBUTIONS", "G+A", ncl.topContributors, "total", "#9bff20")}
                </div>
            </section>
        `;
    }

    function renderNclDossier(season) {
        const ncl = buildNclSnapshot(season);
        const firstDate = ncl.fixtures[0]?.date;
        const lastDate = ncl.fixtures.at(-1)?.date;
        const championInfo = ncl.champion ? clubInfo(ncl.champion) : null;

        dossier.innerHTML = `
            <article class="season-dossier ncl-dossier" data-active-season="${escapeHtml(season.id)}">
                <header class="season-dossier-head">
                    <span class="season-dossier-number">NC</span>
                    <div>
                        <p><i></i> PHASE FINALE NCL</p>
                        <h2>NCL · SAISON ${String(season.number).padStart(2, "0")}</h2>
                    </div>
                    <div class="season-dossier-date"><small>PÉRIODE DE COMPÉTITION</small><strong>${dateRange(firstDate, lastDate)}</strong></div>
                </header>

                ${renderCompetitionToggle(season)}

                <div class="ncl-overview">
                    <div class="ncl-status-card${championInfo ? " has-champion" : ""}"
                        style="${championInfo ? `--club-accent:${championInfo.color}` : ""}">
                        ${championInfo ? `<img src="${escapeHtml(championInfo.logo)}" alt="">` : `<span>NCL</span>`}
                        <div><small>${championInfo ? "CHAMPION NCL" : "ÉTAT DU TABLEAU"}</small>
                            <strong>${championInfo ? escapeHtml(championInfo.name) : ncl.phase}</strong>
                            <em>${championInfo ? "TITRE OFFICIEL ATTRIBUÉ" : "Synchronisation depuis la Ligue"}</em>
                        </div>
                    </div>
                    <div class="season-progress-module" style="--progress:${ncl.progress * 3.6}deg">
                        <div class="season-progress-ring"><strong>${ncl.progress}</strong><span>%</span></div>
                        <div><small>PROGRESSION NCL</small><strong>${ncl.completed} / ${ncl.expected} MATCHS</strong><span>${ncl.phase}</span></div>
                    </div>
                    <div class="season-metric-grid">
                        <div><strong>${String(ncl.completed).padStart(2, "0")}</strong><span>MATCHS TERMINÉS</span></div>
                        <div><strong>${String(ncl.totalGoals).padStart(2, "0")}</strong><span>BUTS MARQUÉS</span></div>
                        <div><strong>${String(ncl.standings.length).padStart(2, "0")}</strong><span>CLUBS QUALIFIÉS</span></div>
                        <div><strong>${String(ncl.matches.length ? new Set(ncl.matches.flatMap(match => [match.home, match.away])).size : 0).padStart(2, "0")}</strong><span>CLUBS ACTIFS</span></div>
                    </div>
                </div>

                ${renderNclBracket(season, ncl)}

                <div class="season-rankings ncl-rankings">
                    ${renderNclStandingsPreview(ncl)}
                    ${renderNclLeadersPreview(ncl)}
                </div>

                <footer class="season-dossier-actions">
                    <button class="season-control-button season-details-button ncl-details-button" type="button"
                        data-open-ncl-season="${escapeHtml(season.id)}">
                        OUVRIR LE DOSSIER NCL <span>↗</span>
                    </button>
                    <a href="matchs.html">CONSULTER LES MATCHS <span>→</span></a>
                    <a href="fixtures.html">VOIR LE CALENDRIER <span>→</span></a>
                </footer>
            </article>
        `;
    }

    function renderDossier() {
        const season = seasons.find(item => item.id === selectedId);
        if (!season) {
            dossier.innerHTML = `<div class="season-no-data">Aucune saison enregistrée.</div>`;
            return;
        }

        if (selectedCompetition === "ncl") {
            renderNclDossier(season);
            return;
        }

        dossier.innerHTML = `
            <article class="season-dossier" data-active-season="${escapeHtml(season.id)}">
                <header class="season-dossier-head">
                    <span class="season-dossier-number">${String(season.number).padStart(2, "0")}</span>
                    <div>
                        <p><i></i> ${statusLabel(season)}</p>
                        <h2>SAISON ${String(season.number).padStart(2, "0")}</h2>
                    </div>
                    <div class="season-dossier-date"><small>PÉRIODE OFFICIELLE</small><strong>${dateRange(season.startDate, season.endDate)}</strong></div>
                </header>

                ${renderCompetitionToggle(season)}

                <div class="season-overview">
                    ${renderLeaderIdentity(season)}
                    ${renderProgress(season)}
                    ${renderMetrics(season)}
                </div>

                <div class="season-rankings">
                    ${renderStandingsPreview(season)}
                    ${renderLeadersPreview(season)}
                </div>

                ${renderRewards(season)}

                <footer class="season-dossier-actions">
                    <button class="season-control-button season-details-button" type="button" data-open-season="${escapeHtml(season.id)}">
                        OUVRIR LE DOSSIER COMPLET <span>↗</span>
                    </button>
                    <a href="matchs.html">CONSULTER LES MATCHS <span>→</span></a>
                    <a href="fixtures.html">VOIR LE CALENDRIER <span>→</span></a>
                </footer>
            </article>
        `;
    }

    function renderHistory() {
        history.innerHTML = seasons.map((season, index) => {
            const leader = season.leader ? clubInfo(season.leader.club).name : "Non attribué";
            return `
                <button class="season-control-button season-history-row${season.id === selectedId ? " is-current" : ""}"
                    type="button" data-season-history="${escapeHtml(season.id)}">
                    <span>ARC–${String(index + 1).padStart(2, "0")}</span>
                    <div><small>${statusLabel(season)}</small><strong>SAISON ${String(season.number).padStart(2, "0")}</strong></div>
                    <div><small>PÉRIODE</small><strong>${dateRange(season.startDate, season.endDate)}</strong></div>
                    <div><small>LEADER</small><strong>${escapeHtml(leader)}</strong></div>
                    <div><small>ACTIVITÉ LIGUE</small><strong>${plural(season.leagueMatches.length, "MATCH")}</strong></div>
                    <em>${season.progress}%</em>
                </button>
            `;
        }).join("");
    }

    function standingsTable(season) {
        return `
            <div class="season-table-wrap">
                <table class="season-table">
                    <thead><tr><th>#</th><th>Club</th><th>MJ</th><th>V</th><th>N</th><th>D</th><th>BP</th><th>BC</th><th>DIFF</th><th>PTS</th></tr></thead>
                    <tbody>
                        ${season.standings.map((row, index) => {
                            const info = clubInfo(row.club);
                            const played = row.w + row.d + row.l;
                            const difference = goalDifference(row);
                            return `
                                <tr${index === 0 && season.leagueMatches.length ? ` class="is-leading"` : ""}>
                                    <td>${String(index + 1).padStart(2, "0")}</td>
                                    <td><a href="${clubLink(row.club)}"><img src="${escapeHtml(info.logo)}" alt=""><strong>${escapeHtml(info.name)}</strong></a></td>
                                    <td>${played}</td><td>${row.w}</td><td>${row.d}</td><td>${row.l}</td>
                                    <td>${row.gf}</td><td>${row.ga}</td><td>${difference > 0 ? "+" : ""}${difference}</td><td><strong>${row.pts}</strong></td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    function playerRankingTable(title, code, ranking, key, accent) {
        return `
            <section class="season-modal-ranking" style="--ranking-accent:${accent}">
                <header><span>${code}</span><h3>${title}</h3></header>
                <div>
                    ${ranking.length ? ranking.slice(0, 8).map(player => `
                        <a href="${playerLink(player.name)}">
                            <span>${String(player.rank).padStart(2, "0")}</span>
                            <div><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(clubInfo(player.club).name)} · ${player.matches} MJ</small></div>
                            <em>${player[key]}</em>
                        </a>
                    `).join("") : `<p>Aucune performance enregistrée pour cette saison.</p>`}
                </div>
            </section>
        `;
    }

    function nclStandingsTable(ncl) {
        return `
            <div class="season-table-wrap">
                <table class="season-table ncl-season-table">
                    <thead><tr><th>#</th><th>Club</th><th>MJ</th><th>V</th><th>D</th><th>BP</th><th>BC</th><th>DIFF</th><th>STATUT</th></tr></thead>
                    <tbody>
                        ${ncl.standings.length ? ncl.standings.map((row, index) => {
                            const info = clubInfo(row.club);
                            const difference = row.gf - row.ga;
                            const status = ncl.champion === row.club
                                ? "CHAMPION"
                                : row.played >= 2 && row.wins === 0
                                    ? "4E PLACE"
                                    : row.losses
                                        ? "ÉLIMINÉ"
                                        : "EN COURSE";
                            return `
                                <tr${ncl.champion === row.club ? ` class="is-leading"` : ""}>
                                    <td>${String(index + 1).padStart(2, "0")}</td>
                                    <td><a href="${clubLink(row.club)}"><img src="${escapeHtml(info.logo)}" alt=""><strong>${escapeHtml(info.name)}</strong></a></td>
                                    <td>${row.played}</td><td>${row.wins}</td><td>${row.losses}</td>
                                    <td>${row.gf}</td><td>${row.ga}</td><td>${difference > 0 ? "+" : ""}${difference}</td>
                                    <td><strong>${status}</strong></td>
                                </tr>
                            `;
                        }).join("") : `<tr><td colspan="9">QUALIFICATIONS EN ATTENTE</td></tr>`}
                    </tbody>
                </table>
            </div>
        `;
    }

    function openNclModal(seasonId) {
        const season = seasons.find(item => item.id === seasonId);
        if (!season) return;
        const ncl = buildNclSnapshot(season);
        document.getElementById("seasonModalTitle").textContent = `NCL · SAISON ${String(season.number).padStart(2, "0")}`;
        modalContent.innerHTML = `
            <section class="season-modal-section ncl-modal-bracket">
                <div class="season-modal-section-head"><span>01</span><div><small>PHASE FINALE</small><h3>ARBRE DE COMPÉTITION</h3></div></div>
                ${renderNclBracket(season, ncl)}
            </section>
            <section class="season-modal-section">
                <div class="season-modal-section-head"><span>02</span><div><small>PARCOURS COLLECTIFS</small><h3>TABLEAU NCL</h3></div></div>
                ${nclStandingsTable(ncl)}
            </section>
            <section class="season-modal-section">
                <div class="season-modal-section-head"><span>03</span><div><small>PERFORMANCES NCL</small><h3>CLASSEMENTS JOUEURS</h3></div></div>
                <div class="season-modal-rankings">
                    ${playerRankingTable("MEILLEURS BUTEURS", "GLS", ncl.topScorers, "goals", "#ff536e")}
                    ${playerRankingTable("MEILLEURS PASSEURS", "AST", ncl.topAssists, "assists", "#58ddff")}
                    ${playerRankingTable("MEILLEURS DRIBBLEURS", "DRB", ncl.topDribblers, "dribbles", "#b66cff")}
                </div>
            </section>
        `;
        modal.hidden = false;
        document.body.classList.add("season-modal-open");
        modal.querySelector(".season-modal-close")?.focus();
    }

    function scorerSummary(entries) {
        if (!entries?.length) return `<span>AUCUN BUTEUR</span>`;
        return entries.map(entry => `
            <div><strong>${escapeHtml(entry.name)}</strong><em>${String(Number(entry.count || 0)).padStart(2, "0")} BUT${Number(entry.count || 0) > 1 ? "S" : ""}</em></div>
        `).join("");
    }

    function openNclMatchModal(fixtureId) {
        const season = seasons.find(item => item.id === selectedId);
        if (!season) return;
        const fixture = nclFixturesForSeason(season).find(item => item.id === fixtureId);
        if (!fixture) return;
        const match = nclMatchForFixture(season, fixture);
        const home = match?.home || fixture.home;
        const away = match?.away || fixture.away;
        const homeInfo = clubInfo(home);
        const awayInfo = clubInfo(away);
        const stage = fixture.stage || "Phase finale";

        document.getElementById("seasonModalTitle").textContent = `${String(stage).toUpperCase()} · NCL`;

        if (!match) {
            modalContent.innerHTML = `
                <section class="ncl-match-report is-upcoming">
                    <div class="ncl-report-status"><span>${compactDate(fixture.date)}</span><strong>${home && away ? "AFFICHE PROGRAMMÉE" : "QUALIFICATION EN ATTENTE"}</strong></div>
                    <div class="ncl-report-score">
                        <div><img src="${escapeHtml(homeInfo.logo)}" alt=""><small>ÉQUIPE A</small><strong>${home ? escapeHtml(homeInfo.name) : "À DÉTERMINER"}</strong></div>
                        <span><b>—</b><em>VS</em><b>—</b></span>
                        <div><img src="${escapeHtml(awayInfo.logo)}" alt=""><small>ÉQUIPE B</small><strong>${away ? escapeHtml(awayInfo.name) : "À DÉTERMINER"}</strong></div>
                    </div>
                    <p class="ncl-report-waiting">Le rapport complet apparaîtra automatiquement dès que le résultat sera ajouté aux données de match.</p>
                    <button type="button" class="season-control-button ncl-modal-back" data-open-ncl-season="${escapeHtml(season.id)}">← RETOUR AU TABLEAU NCL</button>
                </section>
            `;
        } else {
            const matchStats = computePlayerStats(match);
            const notes = [...(match.notesHome || []), ...(match.notesAway || [])]
                .sort((a, b) => Number(b.note || 0) - Number(a.note || 0));
            const mvp = typeof computeMatchMvp === "function" ? computeMatchMvp(match) : null;

            modalContent.innerHTML = `
                <section class="ncl-match-report">
                    <div class="ncl-report-status"><span>${compactDate(match.date)}</span><strong>RAPPORT OFFICIEL · TERMINÉ</strong></div>
                    <div class="ncl-report-score">
                        <div><img src="${escapeHtml(homeInfo.logo)}" alt=""><small>DOMICILE</small><strong>${escapeHtml(homeInfo.name)}</strong></div>
                        <span><b>${Number(match.scoreHome)}</b><em>—</em><b>${Number(match.scoreAway)}</b></span>
                        <div><img src="${escapeHtml(awayInfo.logo)}" alt=""><small>EXTÉRIEUR</small><strong>${escapeHtml(awayInfo.name)}</strong></div>
                    </div>
                    <div class="ncl-report-highlights">
                        <div><small>BUTEURS · ${escapeHtml(homeInfo.name)}</small>${scorerSummary(match.scorersHome)}</div>
                        <div class="ncl-report-mvp"><small>JOUEUR DU MATCH</small><strong>${escapeHtml(mvp?.name || "NON ATTRIBUÉ")}</strong><em>${mvp?.note ? `${mvp.note} / 10` : "NOTE INDISPONIBLE"}</em></div>
                        <div><small>BUTEURS · ${escapeHtml(awayInfo.name)}</small>${scorerSummary(match.scorersAway)}</div>
                    </div>
                    <div class="season-table-wrap">
                        <table class="season-table ncl-performance-table">
                            <thead><tr><th>#</th><th>Joueur</th><th>Club</th><th>Note</th><th>Buts</th><th>Passes D.</th><th>Défenses</th><th>Dribbles</th></tr></thead>
                            <tbody>
                                ${notes.map((player, index) => {
                                    const stats = matchStats[player.name] || {};
                                    const side = playerSide(match, player.name);
                                    const clubKey = side === "home" ? match.home : match.away;
                                    return `
                                        <tr>
                                            <td>${String(index + 1).padStart(2, "0")}</td>
                                            <td><a href="${playerLink(player.name)}"><strong>${escapeHtml(player.name)}</strong></a></td>
                                            <td>${escapeHtml(clubInfo(clubKey).name)}</td>
                                            <td><strong>${Number(player.note || 0).toFixed(1)}</strong></td>
                                            <td>${Number(stats.buts || 0)}</td><td>${Number(stats.passes || 0)}</td>
                                            <td>${Number(stats.defenses || 0)}</td><td>${Number(stats.dribbles || 0)}</td>
                                        </tr>
                                    `;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" class="season-control-button ncl-modal-back" data-open-ncl-season="${escapeHtml(season.id)}">← RETOUR AU TABLEAU NCL</button>
                </section>
            `;
        }

        modal.hidden = false;
        document.body.classList.add("season-modal-open");
        modal.querySelector(".season-modal-close")?.focus();
    }

    function openModal(seasonId) {
        const season = seasons.find(item => item.id === seasonId);
        if (!season) return;
        document.getElementById("seasonModalTitle").textContent = `SAISON ${String(season.number).padStart(2, "0")}`;
        modalContent.innerHTML = `
            <section class="season-modal-section">
                <div class="season-modal-section-head"><span>01</span><div><small>CLASSEMENT OFFICIEL</small><h3>TABLEAU DE LIGUE</h3></div></div>
                ${standingsTable(season)}
            </section>
            <section class="season-modal-section">
                <div class="season-modal-section-head"><span>02</span><div><small>PERFORMANCES INDIVIDUELLES</small><h3>CLASSEMENTS JOUEURS</h3></div></div>
                <div class="season-modal-rankings">
                    ${playerRankingTable("MEILLEURS BUTEURS", "GLS", season.topScorers, "goals", "#ff536e")}
                    ${playerRankingTable("MEILLEURS PASSEURS", "AST", season.topAssists, "assists", "#58ddff")}
                    ${playerRankingTable("CONTRIBUTIONS G+A", "G+A", season.topContributors, "total", "#9bff20")}
                </div>
            </section>
        `;
        modal.hidden = false;
        document.body.classList.add("season-modal-open");
        modal.querySelector(".season-modal-close")?.focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove("season-modal-open");
    }

    function selectSeason(id, scrollToDossier = false) {
        if (!seasons.some(season => season.id === id)) return;
        selectedId = id;
        const selectedSeason = seasons.find(season => season.id === id);
        if (selectedCompetition === "ncl" && !nclFixturesForSeason(selectedSeason).length) {
            selectedCompetition = "league";
        }
        renderSwitcher();
        renderDossier();
        renderHistory();
        if (scrollToDossier) dossier.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    switcher.addEventListener("click", event => {
        const button = event.target.closest("[data-season-select]");
        if (button) selectSeason(button.dataset.seasonSelect);
    });

    history.addEventListener("click", event => {
        const button = event.target.closest("[data-season-history]");
        if (button) selectSeason(button.dataset.seasonHistory, true);
    });

    dossier.addEventListener("click", event => {
        const competitionButton = event.target.closest("[data-competition-view]");
        if (competitionButton && !competitionButton.disabled) {
            selectedCompetition = competitionButton.dataset.competitionView;
            renderDossier();
            return;
        }

        const nclMatchButton = event.target.closest("[data-open-ncl-match]");
        if (nclMatchButton) {
            openNclMatchModal(nclMatchButton.dataset.openNclMatch);
            return;
        }

        const nclSeasonButton = event.target.closest("[data-open-ncl-season]");
        if (nclSeasonButton) {
            openNclModal(nclSeasonButton.dataset.openNclSeason);
            return;
        }

        const button = event.target.closest("[data-open-season]");
        if (button) openModal(button.dataset.openSeason);
    });

    modal.addEventListener("click", event => {
        if (event.target.closest("[data-close-season-modal]")) {
            closeModal();
            return;
        }

        const nclMatchButton = event.target.closest("[data-open-ncl-match]");
        if (nclMatchButton) {
            openNclMatchModal(nclMatchButton.dataset.openNclMatch);
            return;
        }

        const nclSeasonButton = event.target.closest("[data-open-ncl-season]");
        if (nclSeasonButton) openNclModal(nclSeasonButton.dataset.openNclSeason);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    renderHero();
    renderSwitcher();
    renderDossier();
    renderHistory();
});
