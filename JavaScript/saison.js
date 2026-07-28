// Archives des saisons — les résultats sont recalculés depuis MATCHES.
// Pour créer un nouveau cycle vide, ajoutez son identité dans JavaScript/nebula-data.js.

document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains("seasons-page")
        || typeof MATCHES === "undefined"
        || typeof computePlayerStats !== "function") return;

    const SEASON_CLUBS = window.NEBULA_DATA?.clubMeta || {};
    const SEASON_META = window.NEBULA_DATA?.seasons || [];
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
        const matches = MATCHES
            .filter(match => Number(match.season) === Number(meta.number))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

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

        matches.forEach(match => {
            const home = standings.get(match.home);
            const away = standings.get(match.away);
            if (match.category === "ligue" && home && away) {
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
        const totalGoals = matches.reduce((total, match) =>
            total + Number(match.scoreHome || 0) + Number(match.scoreAway || 0), 0);
        const expectedMatches = Math.max(Number(meta.expectedMatches || matches.length || 1), 1);
        const progress = Math.min(100, Math.round((matches.length / expectedMatches) * 100));

        return {
            ...meta,
            matches,
            standings: rankedStandings,
            playerCount: players.size,
            totalGoals,
            progress,
            leader: matches.length ? rankedStandings[0] : null,
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

    function statusLabel(season) {
        return season.status === "active" ? "SAISON ACTIVE" : "ARCHIVE SCELLÉE";
    }

    function renderHero() {
        const active = seasons.find(season => season.status === "active") || seasons[0];
        const totalMatches = seasons.reduce((total, season) => total + season.matches.length, 0);
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
            [season.matches.length, "MATCHS JOUÉS"],
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
                    <strong>${season.matches.length} / ${season.expectedMatches} MATCHS</strong>
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
                            <a href="${clubLink(row.club)}" class="season-standing-row${index === 0 && season.matches.length ? " is-leading" : ""}"
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

    function renderDossier() {
        const season = seasons.find(item => item.id === selectedId);
        if (!season) {
            dossier.innerHTML = `<div class="season-no-data">Aucune saison enregistrée.</div>`;
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
                    <div><small>ACTIVITÉ</small><strong>${plural(season.matches.length, "MATCH")}</strong></div>
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
                                <tr${index === 0 && season.matches.length ? ` class="is-leading"` : ""}>
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
        const button = event.target.closest("[data-open-season]");
        if (button) openModal(button.dataset.openSeason);
    });

    modal.addEventListener("click", event => {
        if (event.target.closest("[data-close-season-modal]")) closeModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    renderHero();
    renderSwitcher();
    renderDossier();
    renderHistory();
});
