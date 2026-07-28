const MATCH_PAGE_CATEGORY_META = {
    ligue: { key: "ligue", label: "Ligue", code: "LG", accent: "#59e7ff" },
    ncl: { key: "ncl", label: "NCL", code: "NC", accent: "#ff5365" },
    amical: { key: "amical", label: "Amical", code: "AM", accent: "#adff2f" },
    finale: { key: "finale", label: "Finale NCL", code: "FN", accent: "#a968ff" }
};

const MATCH_PAGE_CLUB_COLORS = Object.fromEntries(
    (window.NEBULA_DATA?.clubs || []).map(club => [club.key, club.color])
);

document.addEventListener("DOMContentLoaded", () => {
    const matchList = document.getElementById("matchList");
    if (!matchList || !document.body.classList.contains("match-control-page")) return;

    const matches = typeof MATCHES === "undefined" ? [] : MATCHES;
    const heroStats = document.getElementById("matchHeroStats");
    const featuredMatch = document.getElementById("featuredMatch");
    const resultCount = document.getElementById("matchResultCount");
    const categoryGroup = document.getElementById("categoryFilterGroup");
    const seasonFilter = document.getElementById("seasonFilter");
    const clubDropdown = document.getElementById("clubDropdown");
    const dropdownCurrent = document.getElementById("dropdownCurrent");
    const dropdownLabel = dropdownCurrent.querySelector(".dropdown-current-label");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const sortToggle = document.getElementById("sortToggle");
    const detailLayer = document.getElementById("matchDetailLayer");
    const detailPanel = document.getElementById("matchDetailPanel");

    let selectedCategory = "all";
    let selectedSeason = "all";
    let selectedClub = "all";
    let sortOrder = "desc";
    let lastFocusedElement = null;

    function getClub(key) {
        const fallback = { name: key || "???", logo: "images/logos/nebula.png", cls: key || "" };
        return typeof CLUB_META === "undefined" ? fallback : (CLUB_META[key] || fallback);
    }

    function clubColor(key) {
        return MATCH_PAGE_CLUB_COLORS[key] || "#63e7ff";
    }

    function categoryMeta(matchOrKey) {
        if (matchOrKey && typeof matchOrKey === "object") {
            const isFinal = matchOrKey.category === "ncl"
                && String(matchOrKey.valueTier || "").toLowerCase() === "finale";
            return isFinal
                ? MATCH_PAGE_CATEGORY_META.finale
                : (MATCH_PAGE_CATEGORY_META[matchOrKey.category] || {
                    key: "archive",
                    label: matchOrKey.category || "Archive",
                    code: "AR",
                    accent: "#adff2f"
                });
        }

        return MATCH_PAGE_CATEGORY_META[matchOrKey] || {
            key: "archive",
            label: matchOrKey || "Archive",
            code: "AR",
            accent: "#adff2f"
        };
    }

    function shortDate(date) {
        const [year, month, day] = String(date).split("-");
        return `${day}.${month}.${year}`;
    }

    function longDate(date) {
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(new Date(`${date}T12:00:00`));
    }

    function plural(value, singular, pluralForm = `${singular}s`) {
        return `${value} ${value === 1 ? singular : pluralForm}`;
    }

    function timeToSeconds(value) {
        const match = /(\d+)'(\d+)/.exec(value || "");
        return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
    }

    function cleanTime(value) {
        return String(value || "").replace('"', "");
    }

    function actionSupport(assist) {
        if (!assist) return "Action individuelle";
        return /solo\s*dribble/i.test(assist) ? assist : `Passe décisive : ${assist}`;
    }

    function combinedTimeline(match) {
        return [
            ...(match.timelineHome || []).map(event => ({
                ...event,
                side: "home",
                clubKey: match.home
            })),
            ...(match.timelineAway || []).map(event => ({
                ...event,
                side: "away",
                clubKey: match.away
            }))
        ].sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time));
    }

    function goalCurvePosition(event) {
        const progress = Math.max(0, Math.min(1, timeToSeconds(event.time) / MATCH_LENGTH_SECONDS));
        const x = progress * 100;
        return { x, y: 50 };
    }

    function renderGoalCurve(match, compact = false) {
        const home = getClub(match.home);
        const away = getClub(match.away);
        const goals = combinedTimeline(match);

        const dots = goals.map((event, index) => {
            const position = goalCurvePosition(event);
            const accent = clubColor(event.clubKey);
            const assist = event.assist ? `, ${actionSupport(event.assist)}` : "";
            const edgeClass = position.x < 12 ? "edge-start" : position.x > 88 ? "edge-end" : "";
            return `
                <button type="button" class="match-control-button goal-curve-dot ${event.side} ${edgeClass}"
                    style="--goal-x:${position.x}%; --goal-y:${position.y}%; --goal-accent:${accent};"
                    aria-label="${cleanTime(event.time)}, but de ${event.scorer}${assist}">
                    <span class="goal-curve-index">${String(index + 1).padStart(2, "0")}</span>
                    <span class="goal-curve-tooltip">
                        <small>${cleanTime(event.time)} // ${event.side === "home" ? home.name : away.name}</small>
                        <strong>${event.scorer}</strong>
                        <span>${actionSupport(event.assist)}</span>
                    </span>
                </button>
            `;
        }).join("");

        return `
            <div class="goal-curve ${compact ? "goal-curve-compact" : ""}">
                <div class="goal-curve-topline">
                    <span>LIGNE DES BUTS</span>
                    <span>${String(goals.length).padStart(2, "0")} IMPACTS</span>
                </div>
                <div class="goal-curve-plot">
                    <div class="goal-curve-arc" aria-hidden="true"></div>
                    <div class="goal-curve-half" aria-hidden="true"><span>MT</span></div>
                    ${dots}
                    <div class="goal-curve-time" aria-hidden="true">
                        <span>00:00</span><span>06:00</span><span>12:00</span>
                    </div>
                </div>
                <div class="goal-curve-legend">
                    <span style="--legend-accent:${clubColor(match.home)}"><i></i>${home.name}</span>
                    <span style="--legend-accent:${clubColor(match.away)}"><i></i>${away.name}</span>
                </div>
            </div>
        `;
    }

    function renderHeroStats() {
        const totalGoals = matches.reduce((sum, match) => sum + match.scoreHome + match.scoreAway, 0);
        const uniquePlayers = new Set();
        matches.forEach(match => {
            Object.keys(computePlayerStats(match)).forEach(name => uniquePlayers.add(name));
        });
        const average = matches.length ? (totalGoals / matches.length).toFixed(1).replace(".", ",") : "0";
        const seasons = new Set(matches.map(match => match.season)).size;

        heroStats.innerHTML = `
            <div><strong>${String(matches.length).padStart(2, "0")}</strong><span>Matchs archivés</span></div>
            <div><strong>${String(totalGoals).padStart(2, "0")}</strong><span>Buts tracés</span></div>
            <div><strong>${average}</strong><span>Buts par match</span></div>
            <div><strong>${String(seasons).padStart(2, "0")}</strong><span>Saisons détectées</span></div>
        `;
    }

    function renderFeaturedMatch() {
        if (!matches.length) {
            featuredMatch.innerHTML = `<div class="featured-empty">Aucun signal de match enregistré.</div>`;
            return;
        }

        const match = [...matches].sort((a, b) => b.date.localeCompare(a.date))[0];
        const home = getClub(match.home);
        const away = getClub(match.away);
        const meta = categoryMeta(match);
        const matchMvp = bestRatedPlayer(match);

        featuredMatch.style.setProperty("--home-accent", clubColor(match.home));
        featuredMatch.style.setProperty("--away-accent", clubColor(match.away));
        featuredMatch.style.setProperty("--category-accent", meta.accent);
        featuredMatch.dataset.matchCategory = meta.key;
        featuredMatch.innerHTML = `
            <div class="featured-topline">
                <span>DERNIER SIGNAL // ${meta.code}</span>
                <span><i></i> TERMINÉ</span>
            </div>
            <div class="featured-scoreboard">
                <div class="featured-team">
                    <img src="${home.logo}" alt="">
                    <strong>${home.name}</strong>
                </div>
                <div class="featured-score">
                    <small>${longDate(match.date)}</small>
                    <strong>${match.scoreHome}<i>:</i>${match.scoreAway}</strong>
                    <span>MVP // ${ratedPlayerLabel(matchMvp, "NON ATTRIBUÉ")}</span>
                </div>
                <div class="featured-team away">
                    <img src="${away.logo}" alt="">
                    <strong>${away.name}</strong>
                </div>
            </div>
            ${renderGoalCurve(match, true)}
            <button type="button" class="match-control-button featured-open" data-open-match="${match.id}">
                OUVRIR LE DERNIER REPLAY <span>↗</span>
            </button>
        `;
    }

    function scorerList(entries) {
        if (!entries?.length) return `<span class="scorer-empty">AUCUN BUT</span>`;
        return entries.map(entry => `
            <span class="scorer-entry">
                <strong>${entry.name}</strong>
                <small>${String(entry.count).padStart(2, "0")} BUT${entry.count > 1 ? "S" : ""}</small>
            </span>
        `).join("");
    }

    function bestRatedPlayer(match) {
        return typeof computeMatchMvp === "function"
            ? computeMatchMvp(match)
            : [...(match.notesHome || []), ...(match.notesAway || [])]
                .sort((a, b) => b.note - a.note)[0] || null;
    }

    function ratedPlayerLabel(player, fallback = "—") {
        if (!player) return fallback;
        return Number.isFinite(player.note) ? `${player.name} · ${player.note.toFixed(1)}` : player.name;
    }

    function bestScorer(match) {
        return Object.entries(computePlayerStats(match))
            .map(([name, stats]) => ({ name, goals: stats.buts || 0 }))
            .filter(player => player.goals > 0)
            .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, "fr"))[0] || null;
    }

    function renderMatchCard(match, index) {
        const home = getClub(match.home);
        const away = getClub(match.away);
        const meta = categoryMeta(match);
        const homeWin = match.scoreHome > match.scoreAway;
        const awayWin = match.scoreAway > match.scoreHome;
        const goals = combinedTimeline(match);
        const firstGoal = goals[0];
        const bestRated = bestRatedPlayer(match);
        const topScorer = bestScorer(match);

        return `
            <article class="match-dossier match-category-${meta.key}" style="--home-accent:${clubColor(match.home)}; --away-accent:${clubColor(match.away)}; --category-accent:${meta.accent};">
                <div class="match-dossier-topline">
                    <span>REPLAY FILE // ${String(index + 1).padStart(2, "0")}</span>
                    <span>${meta.code} — ${meta.label.toUpperCase()}</span>
                    <span>${shortDate(match.date)} <i></i> TERMINÉ</span>
                </div>

                <div class="match-scoreboard">
                    <div class="match-team home ${homeWin ? "winner" : ""}">
                        <img src="${home.logo}" alt="">
                        <div><small>DOMICILE</small><strong>${home.name}</strong></div>
                        <span>${String(match.scoreHome).padStart(2, "0")}</span>
                    </div>
                    <div class="match-score-separator">
                        <small>SCORE FINAL</small><i></i><strong>VS</strong>
                    </div>
                    <div class="match-team away ${awayWin ? "winner" : ""}">
                        <span>${String(match.scoreAway).padStart(2, "0")}</span>
                        <div><small>EXTÉRIEUR</small><strong>${away.name}</strong></div>
                        <img src="${away.logo}" alt="">
                    </div>
                </div>

                ${renderGoalCurve(match)}

                <div class="match-dossier-lower">
                    <div class="match-scorers home">
                        <div><small>BUTEURS // ${home.name}</small><strong>${String(match.scoreHome).padStart(2, "0")}</strong></div>
                        <div class="scorer-list">${scorerList(match.scorersHome)}</div>
                    </div>
                    <div class="match-key-data">
                        <div><small>HOMME DU MATCH</small><strong>${ratedPlayerLabel(bestRated)}</strong></div>
                        <div><small>PREMIER IMPACT</small><strong>${firstGoal ? `${cleanTime(firstGoal.time)} · ${firstGoal.scorer}` : "—"}</strong></div>
                        <div><small>MEILLEUR BUTEUR</small><strong>${topScorer ? `${topScorer.name} · ${plural(topScorer.goals, "BUT", "BUTS")}` : "—"}</strong></div>
                    </div>
                    <div class="match-scorers away">
                        <div><small>BUTEURS // ${away.name}</small><strong>${String(match.scoreAway).padStart(2, "0")}</strong></div>
                        <div class="scorer-list">${scorerList(match.scorersAway)}</div>
                    </div>
                </div>

                <div class="match-dossier-actions">
                    <button type="button" class="match-control-button match-replay-button" data-open-match="${match.id}">
                        ANALYSER LE REPLAY <span>↗</span>
                    </button>
                    ${match.videoUrl ? `<a href="${match.videoUrl}" target="_blank" rel="noopener">VOIR LA VIDÉO <span>▶</span></a>` : ""}
                </div>
            </article>
        `;
    }

    function noteColor(note) {
        if (note >= 10) return "#a340ffff";
        if (note >= 9) return "#63e7ff";
        if (note >= 7) return "#adff2f";
        if (note >= 5) return "#ffd84d";
        if (note >= 3) return "#ff9d4dff";
        return "#ff5d66";
    }

    function playerPerformanceRows(match) {
        const statistics = computePlayerStats(match);
        const homePlayers = (match.notesHome || []).map(player => ({ ...player, side: "home", clubKey: match.home }));
        const awayPlayers = (match.notesAway || []).map(player => ({ ...player, side: "away", clubKey: match.away }));

        return [...homePlayers, ...awayPlayers]
            .sort((a, b) => b.note - a.note)
            .map((player, index) => {
                const stats = statistics[player.name] || { buts: 0, passes: 0, defenses: 0, dribbles: 0 };
                return `
                    <div class="performance-row" style="--player-accent:${clubColor(player.clubKey)};">
                        <span class="performance-rank">${String(index + 1).padStart(2, "0")}</span>
                        <span class="performance-player">
                            <small>${getClub(player.clubKey).name}</small>
                            <strong>${player.name}</strong>
                        </span>
                        <span class="performance-note" style="--note-color:${noteColor(player.note)}">
                            <small>NOTE</small><strong>${player.note.toFixed(1)}</strong>
                        </span>
                        <span><small>BUTS</small><strong>${stats.buts}</strong></span>
                        <span><small>PASSES</small><strong>${stats.passes}</strong></span>
                        <span><small>DÉF.</small><strong>${stats.defenses}</strong></span>
                        <span class="performance-dribbles"><small>DRIB.</small><strong>${stats.dribbles}</strong></span>
                    </div>
                `;
            }).join("");
    }

    function playByPlay(match) {
        let homeScore = 0;
        let awayScore = 0;

        return combinedTimeline(match).map((event, index) => {
            if (event.side === "home") homeScore += 1;
            else awayScore += 1;
            const team = getClub(event.clubKey);
            return `
                <div class="replay-event ${event.side}" style="--event-accent:${clubColor(event.clubKey)};">
                    <span class="replay-event-index">${String(index + 1).padStart(2, "0")}</span>
                    <span class="replay-event-time">${cleanTime(event.time)}</span>
                    <span class="replay-event-dot"><i></i></span>
                    <div>
                        <small>${team.name}</small>
                        <strong>${event.scorer}</strong>
                        <span>${actionSupport(event.assist)}</span>
                    </div>
                    <span class="replay-event-score">${homeScore}<i>:</i>${awayScore}</span>
                </div>
            `;
        }).join("");
    }

    function renderMatchDetail(match) {
        const home = getClub(match.home);
        const away = getClub(match.away);
        const meta = categoryMeta(match);
        const matchMvp = bestRatedPlayer(match);

        detailPanel.style.setProperty("--home-accent", clubColor(match.home));
        detailPanel.style.setProperty("--away-accent", clubColor(match.away));
        detailPanel.style.setProperty("--category-accent", meta.accent);
        detailPanel.dataset.matchCategory = meta.key;
        detailPanel.innerHTML = `
            <div class="match-detail-topline">
                <span>NEBULA REPLAY // ${match.id.toUpperCase()}</span>
                <span>${meta.label.toUpperCase()} · ${longDate(match.date)}</span>
                <button type="button" class="match-control-button match-detail-close" data-close-match
                    aria-label="Fermer le replay">×</button>
            </div>

            <div class="detail-scoreboard">
                <div>
                    <img src="${home.logo}" alt="">
                    <small>DOMICILE</small>
                    <strong>${home.name}</strong>
                </div>
                <div>
                    <small id="matchDetailTitle">SCORE FINAL</small>
                    <strong>${match.scoreHome}<i>:</i>${match.scoreAway}</strong>
                    <span>MVP // ${ratedPlayerLabel(matchMvp, "NON ATTRIBUÉ")}</span>
                </div>
                <div>
                    <img src="${away.logo}" alt="">
                    <small>EXTÉRIEUR</small>
                    <strong>${away.name}</strong>
                </div>
            </div>

            <section class="detail-curve-section">
                <div class="detail-section-title"><span>01</span><div><small>LECTURE TEMPORELLE</small><h3>LIGNE DU MATCH</h3></div></div>
                ${renderGoalCurve(match)}
            </section>

            <div class="detail-analysis-grid">
                <section class="detail-timeline">
                    <div class="detail-section-title"><span>02</span><div><small>ACTION PAR ACTION</small><h3>FIL DU MATCH</h3></div></div>
                    <div class="replay-events">${playByPlay(match)}</div>
                </section>

                <section class="detail-performances">
                    <div class="detail-section-title"><span>03</span><div><small>IMPACT INDIVIDUEL</small><h3>PERFORMANCES</h3></div></div>
                    <div class="performance-table">${playerPerformanceRows(match)}</div>
                </section>
            </div>
        `;
    }

    function openMatchDetail(matchId) {
        const match = matches.find(item => item.id === matchId);
        if (!match) return;
        lastFocusedElement = document.activeElement;
        renderMatchDetail(match);
        detailLayer.classList.add("open");
        detailLayer.setAttribute("aria-hidden", "false");
        document.body.classList.add("match-detail-open");
        window.setTimeout(() => detailPanel.querySelector("[data-close-match]")?.focus(), 0);
    }

    function closeMatchDetail() {
        detailLayer.classList.remove("open");
        detailLayer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("match-detail-open");
        detailPanel.innerHTML = "";
        lastFocusedElement?.focus();
    }

    function getFilteredMatches() {
        return matches
            .filter(match => selectedCategory === "all" || match.category === selectedCategory)
            .filter(match => selectedSeason === "all" || String(match.season) === selectedSeason)
            .filter(match => selectedClub === "all" || match.home === selectedClub || match.away === selectedClub)
            .sort((a, b) => sortOrder === "desc"
                ? b.date.localeCompare(a.date)
                : a.date.localeCompare(b.date));
    }

    function renderResults() {
        const filtered = getFilteredMatches();
        resultCount.textContent = plural(filtered.length, "MATCH", "MATCHS");

        if (!filtered.length) {
            matchList.innerHTML = `
                <div class="match-empty-state">
                    <span>00</span>
                    <div><strong>AUCUN SIGNAL TROUVÉ</strong><p>Modifiez la saison, la compétition ou l’équipe sélectionnée.</p></div>
                </div>
            `;
            return;
        }

        const seasonGroups = new Map();
        filtered.forEach(match => {
            if (!seasonGroups.has(match.season)) seasonGroups.set(match.season, []);
            seasonGroups.get(match.season).push(match);
        });

        matchList.innerHTML = [...seasonGroups.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([season, seasonMatches]) => `
                <section class="match-season">
                    <div class="match-season-heading">
                        <span>SAISON ${String(season).padStart(2, "0")}</span>
                        <i></i>
                        <small>${plural(seasonMatches.length, "DOSSIER", "DOSSIERS")}</small>
                    </div>
                    <div class="match-season-list">
                        ${seasonMatches.map((match, index) => renderMatchCard(match, index)).join("")}
                    </div>
                </section>
            `).join("");
    }

    function buildClubMenu() {
        const options = [
            { key: "all", name: "Toutes les équipes", logo: "" },
            ...Object.entries(CLUB_META).map(([key, value]) => ({ key, name: value.name, logo: value.logo }))
        ];

        dropdownMenu.innerHTML = options.map((option, index) => `
            <button type="button" class="match-control-button match-club-option ${index === 0 ? "active" : ""}"
                data-club="${option.key}" data-label="${option.name}" role="option"
                aria-selected="${index === 0}">
                ${option.logo ? `<img src="${option.logo}" alt="">` : `<span class="match-option-all">ALL</span>`}
                <strong>${option.name}</strong>
            </button>
        `).join("");
    }

    function buildSeasonFilter() {
        const seasons = [...new Set(matches.map(match => Number(match.season)))]
            .filter(Number.isFinite)
            .sort((a, b) => b - a);

        seasonFilter.innerHTML = [
            '<option value="all">Toutes les saisons</option>',
            ...seasons.map(season => (
                `<option value="${season}">Saison ${String(season).padStart(2, "0")}</option>`
            ))
        ].join("");
    }

    categoryGroup.addEventListener("click", event => {
        const button = event.target.closest("[data-cat]");
        if (!button) return;
        selectedCategory = button.dataset.cat;
        categoryGroup.querySelectorAll("[data-cat]").forEach(item => {
            const active = item === button;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });
        renderResults();
    });

    seasonFilter.addEventListener("change", () => {
        selectedSeason = seasonFilter.value;
        renderResults();
    });

    dropdownCurrent.addEventListener("click", event => {
        event.stopPropagation();
        const open = !clubDropdown.classList.contains("open");
        clubDropdown.classList.toggle("open", open);
        dropdownCurrent.setAttribute("aria-expanded", String(open));
    });

    dropdownMenu.addEventListener("click", event => {
        const option = event.target.closest("[data-club]");
        if (!option) return;
        selectedClub = option.dataset.club;
        dropdownLabel.textContent = option.dataset.label;
        dropdownMenu.querySelectorAll("[data-club]").forEach(item => {
            const active = item === option;
            item.classList.toggle("active", active);
            item.setAttribute("aria-selected", String(active));
        });
        clubDropdown.classList.remove("open");
        dropdownCurrent.setAttribute("aria-expanded", "false");
        renderResults();
    });

    sortToggle.addEventListener("click", () => {
        sortOrder = sortOrder === "desc" ? "asc" : "desc";
        sortToggle.dataset.order = sortOrder;
        sortToggle.querySelector(".match-sort-arrow").textContent = sortOrder === "desc" ? "↓" : "↑";
        sortToggle.setAttribute("aria-label", sortOrder === "desc"
            ? "Trier les matchs du plus récent au plus ancien"
            : "Trier les matchs du plus ancien au plus récent");
        renderResults();
    });

    document.addEventListener("click", event => {
        if (!clubDropdown.contains(event.target)) {
            clubDropdown.classList.remove("open");
            dropdownCurrent.setAttribute("aria-expanded", "false");
        }
        const opener = event.target.closest("[data-open-match]");
        if (opener) openMatchDetail(opener.dataset.openMatch);
    });

    detailLayer.addEventListener("click", event => {
        if (event.target === detailLayer || event.target.closest("[data-close-match]")) {
            closeMatchDetail();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            if (detailLayer.classList.contains("open")) closeMatchDetail();
            clubDropdown.classList.remove("open");
            dropdownCurrent.setAttribute("aria-expanded", "false");
        }
    });

    buildSeasonFilter();
    buildClubMenu();
    renderHeroStats();
    renderFeaturedMatch();
    renderResults();

    const requestedMatch = new URLSearchParams(window.location.search).get("match");
    if (requestedMatch) openMatchDetail(requestedMatch);
});
