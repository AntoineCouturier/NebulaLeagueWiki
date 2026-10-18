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
            color: "var(--offline)"
        };
    }

    function pad(value, size = 2) {
        return String(value).padStart(size, "0");
    }

    // Jours restants avant le premier match de Ligue du cycle (null si le
    // cycle a commencé ou si la date est passée).
    function kickoffCountdown(season) {
        if (!season || season.leagueMatches.length || season.status !== "active") return null;
        const firstDate = SEASON_FIXTURES
            .filter(fixture => fixture.category === "ligue" && Number(fixture.season) === Number(season.number) && fixture.date)
            .map(fixture => fixture.date)
            .sort()[0] || season.startDate;
        if (!firstDate) return null;
        const [year, month, day] = firstDate.split("-").map(Number);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = Math.round((new Date(year, month - 1, day) - today) / 86400000);
        if (days < 0) return null;
        return {
            days,
            date: firstDate,
            label: days === 0 ? "AUJOURD’HUI" : days === 1 ? "DEMAIN" : `J-${days}`
        };
    }

    // Écran « pas de signal » réutilisable (états vides)
    function noSignal(code, title, text, extraClass = "") {
        return `
            <div class="nl-nosignal ${extraClass}">
                <span class="nl-nosignal-code">${code}</span>
                <strong>${title}</strong>
                ${text ? `<p>${text}</p>` : ""}
            </div>
        `;
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

        const seasonClubKeys = Object.values(SEASON_CLUBS)
            .filter(club => Number(club.introducedSeason || 1) <= Number(meta.number))
            .map(club => club.key);
        const standings = new Map(seasonClubKeys.map(key => [key, {
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
            <div class="season-hero-stat"><span>${label}</span><strong>${String(value).padStart(2, "0")}</strong></div>
        `).join("");

        if (active) {
            const cycle = document.querySelector(".season-cycle");
            document.getElementById("seasonCycleNumber").textContent = String(active.number).padStart(2, "0");
            document.getElementById("seasonCycleStatus").textContent = statusLabel(active);
            document.getElementById("seasonCycleProgress").textContent = `${active.progress}% SYNCHRONISÉ`;
            cycle?.style.setProperty("--cycle-progress", `${active.progress * 3.6}deg`);
            cycle?.querySelector(".nl-vu")?.style.setProperty("--v", active.progress);
        }

        renderHeroWall(active);
    }

    // Multivue du héros : un flux par club engagé, le compte à rebours du
    // coup d'envoi et l'écran du cycle suivant (décoratif, liens vers les clubs).
    function renderHeroWall(active) {
        const wall = document.querySelector("[data-season-wall]");
        if (!wall) return;
        const started = Boolean(active?.leagueMatches.length);
        const countdown = kickoffCountdown(active);
        const clubs = Object.values(SEASON_CLUBS);

        const feeds = clubs.map((info, index) => {
            const rank = active ? active.standings.findIndex(row => row.club === info.key) : -1;
            const row = rank >= 0 ? active.standings[rank] : null;
            return `
                <a class="nl-feed season-club-feed" href="${clubLink(info.key)}" style="--club:${info.color}"
                    aria-label="${escapeHtml(info.name)}, dossier du club">
                    <img class="nl-feed-img" src="${escapeHtml(info.logo)}" alt="">
                    <span class="nl-feed-lock" aria-hidden="true"></span>
                    <span class="nl-feed-osd" aria-hidden="true"><span><b>CAM ${pad(index + 2)}</b></span><span class="rec">REC</span></span>
                    ${started && row ? `<strong class="nl-feed-figure" aria-hidden="true">${row.pts}<small>PTS</small></strong>` : ""}
                    <span class="nl-feed-caption" aria-hidden="true">
                        <small>${started && row ? `#${pad(rank + 1)} // ${row.w}-${row.d}-${row.l}` : "ENGAGÉ"}</small>
                        <b>${escapeHtml(info.shortName || info.name)}</b>
                    </span>
                    <span class="season-club-bar" aria-hidden="true"></span>
                </a>
            `;
        });

        const signal = countdown
            ? `<strong>${countdown.label}</strong><span>COUP D’ENVOI · ${compactDate(countdown.date)}</span>`
            : `<strong>${pad(active?.leagueMatches.length || 0)}<small>/${active?.expectedLeagueMatches || 0}</small></strong><span>MATCHS DE LIGUE JOUÉS</span>`;

        wall.innerHTML = `
            ${feeds.join("")}
            <div class="season-wall-signal" aria-hidden="true">
                <span class="season-wall-signal-osd"><b>CAM ${pad(clubs.length + 2)}</b> // ${countdown ? "DÉCOMPTE" : "COMPTEUR"}</span>
                ${signal}
            </div>
            <div class="nl-feed is-offline season-wall-mire" aria-hidden="true">
                <span class="nl-feed-mire" data-label="PAS DE SIGNAL"></span>
                <span class="nl-feed-osd"><span><b>CAM ${pad(clubs.length + 3)}</b> // CYCLE ${pad(Number(active?.number || 0) + 1)}</span><span class="rec is-off">HORS LIGNE</span></span>
                <span class="nl-feed-caption"><small>PROCHAIN CYCLE // EN ATTENTE</small></span>
            </div>
        `;
    }

    function renderSwitcher() {
        const latest = seasons[0];
        switcher.innerHTML = seasons.map((season, index) => {
            const selected = season.id === selectedId;
            return `
                <button class="season-control-button season-switch nl-channel${selected ? " is-selected" : ""}" type="button"
                    role="tab" aria-selected="${selected}" data-season-select="${escapeHtml(season.id)}">
                    <span class="nl-channel-num">CH ${pad(index + 1)}</span>
                    <span class="season-switch-label"><small>${statusLabel(season)} // ${compactDate(season.startDate)}</small><strong>Saison ${pad(season.number)}</strong></span>
                </button>
            `;
        }).join("") + (latest?.status === "active" ? `
            <div class="season-switch season-switch-slot" aria-hidden="true">
                <span class="nl-channel-num">CH ${pad(seasons.length + 1)}</span>
                <span class="season-switch-label"><small>HORS ANTENNE // À VENIR</small><strong>Saison ${pad(Number(latest.number) + 1)}</strong></span>
            </div>
        ` : "");
    }

    // Écran « CAM 02 » : le club en tête, filmé ; sinon une mire d'attente.
    function renderLeaderIdentity(season) {
        if (!season.leader) {
            return `
                <div class="season-leader-empty season-screen">
                    <div class="osd"><span><b>CAM 02</b> // LEADER ACTUEL</span><span class="rec is-off">HORS LIGNE</span></div>
                    ${noSignal("SIGNAL 00", "En attente du premier résultat", "Le leader du cycle apparaîtra ici dès la première journée de Ligue.")}
                </div>
            `;
        }
        const info = clubInfo(season.leader.club);
        const label = season.status === "finished" ? "CHAMPION DE L’ÉDITION" : "LEADER PROVISOIRE";
        return `
            <a class="season-leader-card nl-feed is-locked" href="${clubLink(season.leader.club)}" style="--club:${info.color}">
                <img class="nl-feed-img" src="${escapeHtml(info.logo)}" alt="">
                <span class="nl-feed-lock" aria-hidden="true"></span>
                <span class="nl-feed-osd"><span><b>CAM 02</b> // ${label}</span><span class="rec">DIRECT</span></span>
                <strong class="nl-feed-figure">${season.leader.pts}<small>PTS</small></strong>
                <span class="nl-feed-caption"><small>#001 // ${season.leader.gf} BUTS · ${season.leader.w}-${season.leader.d}-${season.leader.l}</small><b>${escapeHtml(info.name)}</b></span>
            </a>
        `;
    }

    function renderMetrics(season) {
        const metrics = [
            [season.leagueMatches.length, "Matchs joués"],
            [season.totalGoals, "Buts marqués"],
            [season.playerCount, "Joueurs actifs"],
            [season.standings.length, "Clubs engagés"]
        ];
        return metricGrid(metrics);
    }

    function metricGrid(metrics) {
        return `
            <div class="season-metric-grid nl-stats">
                ${metrics.map(([value, label], index) => `
                    <div class="nl-stat${index === metrics.length - 1 ? " nl-stat--solid" : ""}">
                        <span class="nl-stat-label">${label}</span>
                        <strong class="nl-stat-value">${pad(value)}</strong>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // Écran « CAM 03 » : compteur géant + vumètre segmenté
    function progressScreen(label, done, expected, progress, note) {
        return `
            <div class="season-progress-module season-screen" style="--progress:${progress * 3.6}deg">
                <div class="osd"><span><b>CAM 03</b> // ${label}</span><span>${progress}%</span></div>
                <div class="season-progress-body">
                    <strong class="season-progress-count">${pad(done)}<small>/${pad(expected)} matchs</small></strong>
                    <div class="nl-vu${progress >= 100 ? " nl-vu--max" : ""}" style="--v:${progress}" role="meter" aria-label="${label}"
                        aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"></div>
                    <p class="season-progress-note">${note}</p>
                </div>
            </div>
        `;
    }

    function renderProgress(season) {
        const countdown = kickoffCountdown(season);
        const note = countdown
            ? `<b>${countdown.label}</b> Coup d’envoi le ${compactDate(countdown.date)}`
            : season.status === "active" ? "<b>EN DIRECT</b> Synchronisation en temps réel" : "<b>ARCHIVE</b> Cycle terminé";
        return progressScreen("PROGRESSION DU CYCLE", season.leagueMatches.length, season.expectedLeagueMatches, season.progress, note);
    }

    function renderStandingsPreview(season) {
        return `
            <section class="season-ranking-panel season-standings-panel">
                <div class="season-panel-head">
                    <p class="nl-kicker"><span class="nl-ch">CAM 06</span> Tableau de ligue</p>
                    <h3>Classement clubs</h3>
                </div>
                <div class="season-table-wrap nl-table-wrap">
                    <table class="season-table season-standing-list nl-table">
                        <thead><tr><th>#</th><th>Club</th><th>MJ</th><th>V-N-D</th><th>Diff</th><th class="is-hl">Pts</th></tr></thead>
                        <tbody>
                            ${season.standings.map((row, index) => {
                                const info = clubInfo(row.club);
                                const played = row.w + row.d + row.l;
                                const difference = goalDifference(row);
                                return `
                                    <tr class="season-standing-row${index === 0 && season.leagueMatches.length ? " is-leading" : ""}" style="--club:${info.color}">
                                        <td class="nl-num">${pad(index + 1)}</td>
                                        <td class="nl-strong"><a href="${clubLink(row.club)}"><img src="${escapeHtml(info.logo)}" alt="">${escapeHtml(info.name)}</a></td>
                                        <td>${played}</td>
                                        <td>${row.w}-${row.d}-${row.l}</td>
                                        <td>${difference > 0 ? "+" : ""}${difference}</td>
                                        <td class="is-hl">${row.pts}</td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            </section>
        `;
    }

    // Un flux caméra par leader individuel ; sans donnée, une mire.
    function leaderEntry(label, code, ranking, key, accent, cam = 7) {
        const player = ranking[0];
        const profile = player ? playerProfile(player.name) : null;
        if (!player) {
            return `
                <a class="season-player-leader nl-feed is-offline" href="players.html" style="--leader-accent:${accent}">
                    <span class="nl-feed-mire" data-label="PAS DE SIGNAL"></span>
                    <span class="nl-feed-osd"><span><b>CAM ${pad(cam)}</b></span><span class="rec is-off">HORS LIGNE</span></span>
                    <span class="nl-feed-caption"><small>${code} // ${label}</small><b>Non attribué</b></span>
                </a>
            `;
        }
        return `
            <a class="season-player-leader nl-feed" href="${playerLink(player.name)}" style="--leader-accent:${accent}">
                ${profile?.avatar ? `<img class="nl-feed-img" src="${escapeHtml(profile.avatar)}" alt="">` : ""}
                <span class="nl-feed-lock" aria-hidden="true"></span>
                <span class="nl-feed-osd"><span><b>CAM ${pad(cam)}</b> // ${code}</span><span class="rec">REC</span></span>
                <strong class="nl-feed-figure">${player[key]}</strong>
                <span class="nl-feed-caption"><small>${label}</small><b>${escapeHtml(player.name)}</b></span>
            </a>
        `;
    }

    function renderLeadersPreview(season) {
        return `
            <section class="season-ranking-panel player-leaders-panel">
                <div class="season-panel-head">
                    <p class="nl-kicker"><span class="nl-ch">CAM 07-09</span> Index individuel</p>
                    <h3>Leaders de saison</h3>
                </div>
                <div class="season-player-leaders">
                    ${leaderEntry("Meilleur buteur", "GLS", season.topScorers, "goals", "var(--blue-2)", 7)}
                    ${leaderEntry("Meilleur passeur", "AST", season.topAssists, "assists", "var(--blue-3)", 8)}
                    ${leaderEntry("Contributions", "G+A", season.topContributors, "total", "var(--white)", 9)}
                </div>
            </section>
        `;
    }

    // Palmarès : une bande bleue pleine, bord à bord, avec un cachet par distinction
    function renderRewards(season) {
        const rewards = window.NEBULA_DATA?.resolveSeasonRewards
            ? window.NEBULA_DATA.resolveSeasonRewards(season)
            : (season.rewards || EMPTY_REWARDS);
        const pending = value => /non attribu/i.test(String(value || "")) || !value;

        return `
            <div class="season-awards nl-band nl-bleed">
                <div class="season-awards-inner">
                    <div class="season-awards-head">
                        <p class="nl-kicker"><span class="nl-ch">CH 01-D</span> Palmarès // Cycle ${pad(season.number)}</p>
                        <h3>Distinctions <em>du cycle</em></h3>
                        <p>Remises en fin de saison, d’après les résultats enregistrés.</p>
                    </div>
                    <div class="season-award-grid">
                        ${rewards.map((reward, index) => `
                            <div class="season-award${pending(reward.value) ? " is-pending" : ""}">
                                <span class="season-award-code"><small>${pad(index + 1)}</small>${escapeHtml(reward.code)}</span>
                                <span class="season-award-label">${escapeHtml(reward.label)}</span>
                                ${pending(reward.value)
                                    ? `<span class="nl-nc"><b>Non attribué</b><small>EN JEU // CYCLE ${pad(season.number)}</small></span>`
                                    : `<strong class="season-award-value">${escapeHtml(reward.value)}</strong>`}
                            </div>
                        `).join("")}
                    </div>
                </div>
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
        const expected = Math.max(fixtures.length, 1);
        const progress = Math.min(100, Math.round((completed / expected) * 100));
        const hasQuarterFinals = fixtures.some(fixture => /quart/i.test(String(fixture.stage || "")));
        const phase = champion
            ? "CHAMPION COURONNÉ"
            : completed >= expected - 2
                ? "FINALES DÉVERROUILLÉES"
                : hasQuarterFinals && completed >= 4
                    ? "DEMI-FINALES EN COURS"
                    : completed
                    ? "DEMI-FINALES EN COURS"
                    : standings.length >= (hasQuarterFinals ? 8 : 4)
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
            hasQuarterFinals,
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
                <div class="season-competition-label">
                    <small>Flux // Compétition</small>
                    <strong>${selectedCompetition === "ncl" ? "Nebula Champions League" : "Nebula League"}</strong>
                </div>
                <button type="button" class="season-competition-button nl-channel${selectedCompetition === "league" ? " is-active" : ""}"
                    role="tab" aria-selected="${selectedCompetition === "league"}" data-competition-view="league">
                    <span class="nl-channel-num">CH A</span> Ligue
                </button>
                <button type="button" class="season-competition-button nl-channel${selectedCompetition === "ncl" ? " is-active" : ""}"
                    role="tab" aria-selected="${selectedCompetition === "ncl"}" data-competition-view="ncl"
                    ${hasNcl ? "" : "disabled"}>
                    <span class="nl-channel-num">CH B</span> NCL
                </button>
            </div>
        `;
    }

    function renderNclMatchCard(season, fixture, extraClass = "") {
        if (!fixture) {
            return `<div class="ncl-match-card is-locked ${extraClass}"><span class="ncl-match-osd"><span>CRÉNEAU VERROUILLÉ</span><em>HORS LIGNE</em></span></div>`;
        }

        const match = nclMatchForFixture(season, fixture);
        const home = fixture.home || match?.home || null;
        const away = fixture.away || match?.away || null;
        const homeInfo = clubInfo(home);
        const awayInfo = clubInfo(away);
        const isComplete = Boolean(match);
        const stage = fixture.stage || "Phase finale";
        const isFinal = fixture.valueTier === "finale" || String(stage).toLowerCase() === "finale";

        const homeWins = isComplete && Number(match.scoreHome) > Number(match.scoreAway);
        const awayWins = isComplete && Number(match.scoreAway) > Number(match.scoreHome);

        return `
            <button type="button"
                class="season-control-button ncl-match-card${isComplete ? " is-complete" : ""}${isFinal ? " is-final" : ""}${home && away ? "" : " is-pending"} ${extraClass}"
                data-open-ncl-match="${escapeHtml(fixture.id)}">
                <span class="ncl-match-osd">
                    <span>${escapeHtml(stage)}</span>
                    <em>${isComplete ? "TERMINÉ" : home && away ? "PROGRAMMÉ" : "VERROUILLÉ"}</em>
                </span>
                <span class="ncl-match-team${homeWins ? " is-winner" : ""}${home ? "" : " is-unknown"}" style="--club:${home ? homeInfo.color : "var(--offline)"}">
                    <img src="${escapeHtml(homeInfo.logo)}" alt="">
                    <strong>${home ? escapeHtml(homeInfo.name) : "À déterminer"}</strong>
                    <b>${isComplete ? Number(match.scoreHome) : "—"}</b>
                </span>
                <span class="ncl-match-team${awayWins ? " is-winner" : ""}${away ? "" : " is-unknown"}" style="--club:${away ? awayInfo.color : "var(--offline)"}">
                    <img src="${escapeHtml(awayInfo.logo)}" alt="">
                    <strong>${away ? escapeHtml(awayInfo.name) : "À déterminer"}</strong>
                    <b>${isComplete ? Number(match.scoreAway) : "—"}</b>
                </span>
                <span class="ncl-match-foot"><span>${compactDate(fixture.date)}</span><i>${isComplete ? "Ouvrir le rapport" : "Voir le créneau"} ↗</i></span>
            </button>
        `;
    }

    function renderNclBracket(season, ncl) {
        const quarters = ncl.fixtures.filter(fixture => /quart/i.test(String(fixture.stage || "")));
        const semis = ncl.fixtures.filter(fixture => /demi/i.test(String(fixture.stage || "")));
        const third = ncl.fixtures.find(fixture => fixture.valueTier === "third");
        const final = ncl.fixtures.find(fixture => fixture.valueTier === "finale")
            || ncl.fixtures.find(fixture => /^finale$/i.test(String(fixture.stage || "")));

        if (quarters.length) {
            return `
                <section class="ncl-bracket-panel is-eight-team">
                    <div class="ncl-bracket-head osd">
                        <span><b>CAM 10</b> // ÉLIMINATION DIRECTE · TOP 08 // TABLEAU NCL</span>
                        <span>${String(ncl.completed).padStart(2, "0")} / ${String(ncl.expected).padStart(2, "0")} TERMINÉS</span>
                    </div>
                    <div class="ncl-bracket ncl-expanded-bracket">
                        <div class="ncl-expanded-flow">
                            <div class="ncl-round ncl-quarter-round">
                                <div class="ncl-round-label"><span>ROUND 01</span><strong>QUARTS DE FINALE</strong></div>
                                <div class="ncl-stage-slots ncl-quarter-slots">
                                    ${quarters.map(fixture => renderNclMatchCard(season, fixture)).join("")}
                                </div>
                            </div>
                            <div class="ncl-stage-bridge ncl-quarter-bridge" aria-hidden="true">
                                <i class="is-upper"></i>
                                <i class="is-lower"></i>
                                <span class="is-upper"></span>
                                <span class="is-lower"></span>
                                <b class="is-upper">VAINQUEUR 01</b>
                                <b class="is-lower">VAINQUEUR 02</b>
                            </div>
                            <div class="ncl-round ncl-semi-round">
                                <div class="ncl-round-label"><span>ROUND 02</span><strong>DEMI-FINALES</strong></div>
                                <div class="ncl-stage-slots ncl-semi-slots">
                                    ${semis.map(fixture => renderNclMatchCard(season, fixture)).join("")}
                                </div>
                            </div>
                            <div class="ncl-stage-bridge ncl-semi-bridge" aria-hidden="true"><i></i><span></span><b>VAINQUEURS</b></div>
                            <div class="ncl-round ncl-final-round">
                                <div class="ncl-round-label"><span>ROUND 03</span><strong>FINALE NCL</strong></div>
                                <div class="ncl-stage-slots ncl-final-slot">${renderNclMatchCard(season, final)}</div>
                            </div>
                        </div>
                        <aside class="ncl-third-branch">
                            <div class="ncl-round-label"><span>BRANCHE SECONDAIRE · PERDANTS DES DEMIES</span><strong>PETITE FINALE</strong></div>
                            ${renderNclMatchCard(season, third, "is-third")}
                        </aside>
                    </div>
                </section>
            `;
        }

        const [semiOne, semiTwo] = semis.length ? semis : ncl.fixtures;

        return `
            <section class="ncl-bracket-panel">
                <div class="ncl-bracket-head osd">
                    <span><b>CAM 10</b> // ÉLIMINATION DIRECTE // TABLEAU NCL</span>
                    <span>${String(ncl.completed).padStart(2, "0")} / ${String(ncl.expected).padStart(2, "0")} TERMINÉS</span>
                </div>
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
        return `
            <section class="season-ranking-panel season-standings-panel ncl-club-index">
                <div class="season-panel-head">
                    <p class="nl-kicker"><span class="nl-ch">CAM 06</span> Index phase finale</p>
                    <h3>Parcours des clubs</h3>
                </div>
                ${ncl.standings.length ? `
                    <div class="season-table-wrap nl-table-wrap">
                        <table class="season-table season-standing-list nl-table">
                            <thead><tr><th>#</th><th>Club</th><th>MJ</th><th>Diff</th><th class="is-hl">V</th></tr></thead>
                            <tbody>
                                ${ncl.standings.map((row, index) => {
                                    const info = clubInfo(row.club);
                                    const difference = row.gf - row.ga;
                                    return `
                                        <tr class="season-standing-row${ncl.champion === row.club ? " is-leading" : ""}" style="--club:${info.color}">
                                            <td class="nl-num">${pad(index + 1)}</td>
                                            <td class="nl-strong"><a href="${clubLink(row.club)}"><img src="${escapeHtml(info.logo)}" alt="">${escapeHtml(info.name)}</a></td>
                                            <td>${row.played}</td>
                                            <td>${difference > 0 ? "+" : ""}${difference}</td>
                                            <td class="is-hl">${row.wins}</td>
                                        </tr>
                                    `;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>
                ` : noSignal("QUALIF. 00", "Tableau en attente", "Les qualifiés apparaîtront à la fin de la Ligue.", "season-no-data")}
            </section>
        `;
    }

    function renderNclLeadersPreview(ncl) {
        return `
            <section class="season-ranking-panel player-leaders-panel">
                <div class="season-panel-head">
                    <p class="nl-kicker"><span class="nl-ch">CAM 07-09</span> Performances NCL</p>
                    <h3>Leaders de la phase finale</h3>
                </div>
                <div class="season-player-leaders">
                    ${leaderEntry("Meilleur buteur", "GLS", ncl.topScorers, "goals", "var(--blue-2)", 7)}
                    ${leaderEntry("Meilleur passeur", "AST", ncl.topAssists, "assists", "var(--blue-3)", 8)}
                    ${leaderEntry("Contributions", "G+A", ncl.topContributors, "total", "var(--white)", 9)}
                </div>
            </section>
        `;
    }

    // Bandeau de titre du dossier (numéro géant + statut + période)
    function dossierHead(number, status, live, title, dateLabel, dates, numberLabel = "CYCLE") {
        return `
            <div class="season-dossier-head">
                <span class="season-dossier-number"><small>${numberLabel}</small>${number}</span>
                <div class="season-dossier-title">
                    <p><span class="rec${live ? "" : " is-off"}">${live ? "DIRECT" : "ARCHIVE"}</span> ${status}</p>
                    <h2>${title}</h2>
                </div>
                <div class="season-dossier-date"><small>${dateLabel}</small><strong>${dates}</strong></div>
            </div>
        `;
    }

    function dossierActions(button) {
        return `
            <div class="season-dossier-actions">
                ${button}
                <a class="nl-btn nl-btn-ghost" href="matchs.html">Consulter les matchs <span>→</span></a>
                <a class="nl-btn nl-btn-ghost" href="fixtures.html">Voir le calendrier <span>→</span></a>
            </div>
        `;
    }

    function renderNclDossier(season) {
        const ncl = buildNclSnapshot(season);
        const firstDate = ncl.fixtures[0]?.date;
        const lastDate = ncl.fixtures.at(-1)?.date;
        const championInfo = ncl.champion ? clubInfo(ncl.champion) : null;
        const activeClubs = ncl.matches.length ? new Set(ncl.matches.flatMap(match => [match.home, match.away])).size : 0;

        dossier.innerHTML = `
            <article class="season-dossier ncl-dossier" data-active-season="${escapeHtml(season.id)}">
                ${dossierHead("NCL", "Phase finale NCL", season.status === "active",
                    `NCL · Saison ${pad(season.number)}`, "Période de compétition", dateRange(firstDate, lastDate), "PHASE")}

                ${renderCompetitionToggle(season)}

                <div class="season-overview ncl-overview">
                    ${championInfo ? `
                        <a class="ncl-status-card has-champion nl-feed is-locked" href="${clubLink(ncl.champion)}" style="--club:${championInfo.color}">
                            <img class="nl-feed-img" src="${escapeHtml(championInfo.logo)}" alt="">
                            <span class="nl-feed-lock" aria-hidden="true"></span>
                            <span class="nl-feed-osd"><span><b>CAM 02</b> // CHAMPION NCL</span><span class="rec">DIRECT</span></span>
                            <span class="nl-feed-caption"><small>Titre officiel attribué</small><b>${escapeHtml(championInfo.name)}</b></span>
                        </a>
                    ` : `
                        <div class="ncl-status-card season-leader-empty season-screen">
                            <div class="osd"><span><b>CAM 02</b> // ÉTAT DU TABLEAU</span><span class="rec is-off">HORS LIGNE</span></div>
                            ${noSignal("NCL 00", ncl.phase, "Synchronisation depuis la Ligue : les affiches se rempliront automatiquement.")}
                        </div>
                    `}
                    ${progressScreen("PROGRESSION NCL", ncl.completed, ncl.expected, ncl.progress, `<b>PHASE</b> ${ncl.phase}`)}
                    ${metricGrid([
                        [ncl.completed, "Matchs terminés"],
                        [ncl.totalGoals, "Buts marqués"],
                        [activeClubs, "Clubs actifs"],
                        [ncl.standings.length, "Clubs qualifiés"]
                    ])}
                </div>

                ${renderNclBracket(season, ncl)}

                <div class="season-rankings ncl-rankings">
                    ${renderNclStandingsPreview(ncl)}
                    ${renderNclLeadersPreview(ncl)}
                </div>

                ${dossierActions(`
                    <button class="season-control-button season-details-button ncl-details-button nl-btn" type="button"
                        data-open-ncl-season="${escapeHtml(season.id)}">
                        Ouvrir le dossier NCL <span>↗</span>
                    </button>
                `)}
            </article>
        `;
    }

    function renderDossier() {
        const season = seasons.find(item => item.id === selectedId);
        if (!season) {
            dossier.innerHTML = noSignal("SIGNAL 00", "Aucune saison enregistrée", "Ajoutez un cycle dans les données de la ligue pour ouvrir son dossier.", "season-no-data");
            return;
        }

        if (selectedCompetition === "ncl") {
            renderNclDossier(season);
            return;
        }

        dossier.innerHTML = `
            <article class="season-dossier" data-active-season="${escapeHtml(season.id)}">
                ${dossierHead(pad(season.number), statusLabel(season), season.status === "active",
                    `Saison ${pad(season.number)}`, "Période officielle", dateRange(season.startDate, season.endDate))}

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

                ${dossierActions(`
                    <button class="season-control-button season-details-button nl-btn" type="button" data-open-season="${escapeHtml(season.id)}">
                        Ouvrir le dossier complet <span>↗</span>
                    </button>
                `)}
            </article>
        `;
    }

    // Journal : une bande d'archive par cycle (code, numéro géant, relevés, vumètre)
    function renderHistory() {
        history.innerHTML = seasons.map((season, index) => {
            const leader = season.leader ? clubInfo(season.leader.club).name : "Non attribué";
            const live = season.status === "active";
            return `
                <button class="season-control-button season-history-row${season.id === selectedId ? " is-current" : ""}${live ? " is-live" : ""}"
                    type="button" data-season-history="${escapeHtml(season.id)}">
                    <span class="season-history-code"><span class="rec${live ? "" : " is-off"}">${live ? "REC" : "ARC"}</span>ARC–${pad(index + 1)}</span>
                    <span class="season-history-number"><small>Saison</small>${pad(season.number)}</span>
                    <span class="season-history-cell"><small>Statut</small><strong>${statusLabel(season)}</strong></span>
                    <span class="season-history-cell"><small>Période</small><strong>${dateRange(season.startDate, season.endDate)}</strong></span>
                    <span class="season-history-cell"><small>Leader</small><strong>${escapeHtml(leader)}</strong></span>
                    <span class="season-history-cell"><small>Activité ligue</small><strong>${plural(season.leagueMatches.length, "MATCH")}</strong></span>
                    <span class="season-history-progress"><em>${season.progress}%</em><span class="nl-vu" style="--v:${season.progress}"></span></span>
                </button>
            `;
        }).join("");
    }

    function standingsTable(season) {
        return `
            <div class="season-table-wrap nl-table-wrap">
                <table class="season-table nl-table">
                    <thead><tr><th>#</th><th>Club</th><th>MJ</th><th>V</th><th>N</th><th>D</th><th>BP</th><th>BC</th><th>Diff</th><th class="is-hl">Pts</th></tr></thead>
                    <tbody>
                        ${season.standings.map((row, index) => {
                            const info = clubInfo(row.club);
                            const played = row.w + row.d + row.l;
                            const difference = goalDifference(row);
                            return `
                                <tr class="${index === 0 && season.leagueMatches.length ? "is-leading" : ""}" style="--club:${info.color}">
                                    <td class="nl-num">${pad(index + 1)}</td>
                                    <td class="nl-strong"><a href="${clubLink(row.club)}"><img src="${escapeHtml(info.logo)}" alt="">${escapeHtml(info.name)}</a></td>
                                    <td>${played}</td><td>${row.w}</td><td>${row.d}</td><td>${row.l}</td>
                                    <td>${row.gf}</td><td>${row.ga}</td><td>${difference > 0 ? "+" : ""}${difference}</td><td class="is-hl">${row.pts}</td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    function playerRankingTable(title, code, ranking, key, accent) {
        const maximum = Math.max(...ranking.slice(0, 8).map(player => Number(player[key]) || 0), 1);
        return `
            <section class="season-modal-ranking" style="--ranking-accent:${accent}">
                <div class="season-modal-ranking-head osd"><span><b>${code}</b> // ${title}</span></div>
                <div class="season-modal-ranking-list">
                    ${ranking.length ? ranking.slice(0, 8).map(player => `
                        <a href="${playerLink(player.name)}">
                            <span class="season-modal-rank">${pad(player.rank)}</span>
                            <span class="season-modal-name"><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(clubInfo(player.club).name)} · ${player.matches} MJ</small></span>
                            <em>${player[key]}</em>
                            <span class="nl-vu" style="--v:${Math.round(((Number(player[key]) || 0) / maximum) * 100)}"></span>
                        </a>
                    `).join("") : noSignal("SIGNAL 00", "Aucune donnée", "Aucune performance enregistrée pour cette saison.", "season-mini-nosignal")}
                </div>
            </section>
        `;
    }

    function nclStandingsTable(ncl) {
        if (!ncl.standings.length) {
            return noSignal("QUALIF. 00", "Qualifications en attente", "Le tableau NCL se remplira à la fin de la Ligue.", "season-mini-nosignal");
        }
        return `
            <div class="season-table-wrap nl-table-wrap">
                <table class="season-table ncl-season-table nl-table">
                    <thead><tr><th>#</th><th>Club</th><th>MJ</th><th>V</th><th>D</th><th>BP</th><th>BC</th><th>Diff</th><th class="is-hl">Statut</th></tr></thead>
                    <tbody>
                        ${ncl.standings.map((row, index) => {
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
                                <tr class="${ncl.champion === row.club ? "is-leading" : ""}" style="--club:${info.color}">
                                    <td class="nl-num">${pad(index + 1)}</td>
                                    <td class="nl-strong"><a href="${clubLink(row.club)}"><img src="${escapeHtml(info.logo)}" alt="">${escapeHtml(info.name)}</a></td>
                                    <td>${row.played}</td><td>${row.wins}</td><td>${row.losses}</td>
                                    <td>${row.gf}</td><td>${row.ga}</td><td>${difference > 0 ? "+" : ""}${difference}</td>
                                    <td class="is-hl">${status}</td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    function modalSectionHead(number, kicker, title) {
        return `<div class="season-modal-section-head"><span class="season-modal-chno"><small>CH</small>${number}</span><div><small>${kicker}</small><h3>${title}</h3></div></div>`;
    }

    function openNclModal(seasonId) {
        const season = seasons.find(item => item.id === seasonId);
        if (!season) return;
        const ncl = buildNclSnapshot(season);
        document.getElementById("seasonModalTitle").textContent = `NCL · SAISON ${String(season.number).padStart(2, "0")}`;
        modalContent.innerHTML = `
            <section class="season-modal-section ncl-modal-bracket">
                ${modalSectionHead("01", "Phase finale", "Arbre de compétition")}
                ${renderNclBracket(season, ncl)}
            </section>
            <section class="season-modal-section">
                ${modalSectionHead("02", "Parcours collectifs", "Tableau NCL")}
                ${nclStandingsTable(ncl)}
            </section>
            <section class="season-modal-section">
                ${modalSectionHead("03", "Performances NCL", "Classements joueurs")}
                <div class="season-modal-rankings">
                    ${playerRankingTable("MEILLEURS BUTEURS", "GLS", ncl.topScorers, "goals", "var(--blue-2)")}
                    ${playerRankingTable("MEILLEURS PASSEURS", "AST", ncl.topAssists, "assists", "var(--blue-3)")}
                    ${playerRankingTable("MEILLEURS DRIBBLEURS", "DRB", ncl.topDribblers, "dribbles", "var(--offline)")}
                </div>
            </section>
        `;
        modal.hidden = false;
        document.body.classList.add("season-modal-open");
        modal.querySelector(".season-modal-close")?.focus();
    }

    function openNclMatchPage(fixtureId) {
        const season = seasons.find(item => item.id === selectedId);
        const fixture = season ? nclFixturesForSeason(season).find(item => item.id === fixtureId) : null;
        const match = fixture ? nclMatchForFixture(season, fixture) : null;
        const target = new URL("matchs.html", window.location.href);
        if (match?.id) target.searchParams.set("match", match.id);
        window.location.href = target.href;
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
                ${modalSectionHead("01", "Classement officiel", "Tableau de ligue")}
                ${standingsTable(season)}
            </section>
            <section class="season-modal-section">
                ${modalSectionHead("02", "Performances individuelles", "Classements joueurs")}
                <div class="season-modal-rankings">
                    ${playerRankingTable("MEILLEURS BUTEURS", "GLS", season.topScorers, "goals", "var(--blue-2)")}
                    ${playerRankingTable("MEILLEURS PASSEURS", "AST", season.topAssists, "assists", "var(--blue-3)")}
                    ${playerRankingTable("CONTRIBUTIONS G+A", "G+A", season.topContributors, "total", "var(--white)")}
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
            openNclMatchPage(nclMatchButton.dataset.openNclMatch);
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
            openNclMatchPage(nclMatchButton.dataset.openNclMatch);
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
