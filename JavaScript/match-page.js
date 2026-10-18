// Couleurs de catégorie : jetons de la direction « salle de contrôle »
// (theme-monitor.css). Plus aucun vert acide, cyan ni violet en dur.
const MATCH_PAGE_CATEGORY_META = {
    ligue: { key: "ligue", label: "Ligue", code: "LG", accent: "var(--blue-2)", tag: "ligue" },
    ncl: { key: "ncl", label: "NCL", code: "NC", accent: "var(--blue-3)", tag: "ncl" },
    amical: { key: "amical", label: "Amical", code: "AM", accent: "var(--offline)", tag: "amical" },
    finale: { key: "finale", label: "Finale NCL", code: "FN", accent: "var(--white)", tag: "ncl" }
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

    // Pistes de la ligne des buts : domicile en bleu, extérieur en blanc
    // (la couleur du club ne reste qu'en filet de 3 px sous les noms)

    function clubColor(key) {
        return MATCH_PAGE_CLUB_COLORS[key] || "var(--blue-2)";
    }

    function pad(value) {
        return String(value).padStart(2, "0");
    }

    function categoryMeta(matchOrKey) {
        const fallback = label => ({
            key: "archive",
            label: label || "Archive",
            code: "AR",
            accent: "var(--blue-2)",
            tag: ""
        });

        if (matchOrKey && typeof matchOrKey === "object") {
            const isFinal = matchOrKey.category === "ncl"
                && String(matchOrKey.valueTier || "").toLowerCase() === "finale";
            return isFinal
                ? MATCH_PAGE_CATEGORY_META.finale
                : (MATCH_PAGE_CATEGORY_META[matchOrKey.category] || fallback(matchOrKey.category));
        }

        return MATCH_PAGE_CATEGORY_META[matchOrKey] || fallback(matchOrKey);
    }

    function categoryTag(meta) {
        return `<span class="nl-tag${meta.tag ? ` nl-tag--${meta.tag}` : ""}">${meta.code} // ${meta.label}</span>`;
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

    // 0'14" -> 00:14 (timecode de régie)
    function timecode(value) {
        const seconds = timeToSeconds(value);
        return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
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

    // Deux pistes : domicile au-dessus de la ligne de temps, extérieur en dessous
    function goalCurvePosition(event) {
        const progress = Math.max(0, Math.min(1, timeToSeconds(event.time) / MATCH_LENGTH_SECONDS));
        const x = progress * 100;
        return { x, y: event.side === "home" ? 30 : 70 };
    }

    function renderGoalCurve(match, compact = false) {
        const home = getClub(match.home);
        const away = getClub(match.away);
        const goals = combinedTimeline(match);

        const dots = goals.map((event, index) => {
            const position = goalCurvePosition(event);
            const accent = clubColor(event.clubKey);
            const assist = event.assist ? `, ${actionSupport(event.assist)}` : "";
            // Info-bulle calée sur le bord le plus proche dans le premier et le dernier tiers
            const edgeClass = position.x < 35 ? "edge-start" : position.x > 65 ? "edge-end" : "";
            return `
                <button type="button" class="match-control-button goal-curve-dot ${event.side} ${edgeClass}"
                    style="--goal-x:${position.x}%; --goal-y:${position.y}%; --goal-accent:${accent};"
                    aria-label="${timecode(event.time)}, but de ${event.scorer}${assist}">
                    <span class="goal-curve-index">${pad(index + 1)}</span>
                    <span class="goal-curve-tooltip">
                        <small>TC ${timecode(event.time)} // ${event.side === "home" ? home.name : away.name}</small>
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
                    <span>${pad(goals.length)} IMPACTS</span>
                </div>
                <div class="goal-curve-plot">
                    <span class="goal-curve-lane lane-home" aria-hidden="true">${home.shortName || home.name}</span>
                    <span class="goal-curve-lane lane-away" aria-hidden="true">${away.shortName || away.name}</span>
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
        const average = matches.length ? (totalGoals / matches.length).toFixed(1).replace(".", ",") : "0";
        const seasons = new Set(matches.map(match => match.season)).size;

        const cells = [
            [pad(matches.length), "Matchs archivés", true],
            [pad(totalGoals), "Buts tracés"],
            [average, "Buts par match"],
            [pad(seasons), "Saisons détectées"]
        ];

        heroStats.innerHTML = cells.map(([value, label, solid]) => `
            <div class="nl-stat${solid ? " nl-stat--solid" : ""}">
                <span class="nl-stat-label">${label}</span>
                <strong class="nl-stat-value">${value}</strong>
            </div>
        `).join("");
    }

    // Multiplex du héros : un écran par club (décoratif, aria-hidden)
    function renderHeroWall() {
        const wall = document.querySelector("[data-match-wall]");
        if (!wall) return;

        const clubs = Object.entries(typeof CLUB_META === "undefined" ? {} : CLUB_META).slice(0, 5);
        const tiles = clubs.map(([key, club], index) => {
            const played = matches.filter(match => match.home === key || match.away === key);
            const goals = played.reduce((sum, match) => sum + (match.home === key ? match.scoreHome : match.scoreAway), 0);
            const wins = played.filter(match => (match.home === key
                ? match.scoreHome > match.scoreAway
                : match.scoreAway > match.scoreHome)).length;
            return `
                <div class="nl-feed match-wall-feed" style="--club:${clubColor(key)}">
                    <img class="match-wall-blur" src="${club.logo}" alt="">
                    <img class="match-wall-crest" src="${club.logo}" alt="">
                    <span class="nl-feed-osd"><span><b>CAM ${pad(index + 1)}</b><span class="match-wall-name"> // ${(club.shortName || club.name.split(" ")[0]).toUpperCase()}</span></span><span class="rec">REC</span></span>
                    <span class="nl-feed-tc">${pad(played.length)} MJ · ${pad(wins)} V</span>
                    <strong class="nl-feed-figure">${pad(goals)}</strong>
                    <span class="nl-feed-caption"><small>Buts marqués</small><b>${club.shortName || club.name}</b></span>
                </div>
            `;
        });

        let camera = tiles.length;
        while (tiles.length < 6) {
            camera += 1;
            tiles.push(`
                <div class="nl-feed is-offline match-wall-feed">
                    <span class="nl-feed-mire" data-label="HORS ANTENNE"></span>
                    <span class="nl-feed-osd"><span><b>CAM ${pad(camera)}</b></span><span class="rec is-off">HORS LIGNE</span></span>
                </div>
            `);
        }

        wall.innerHTML = tiles.join("");
    }

    function nextFixture() {
        const fixtures = window.NEBULA_DATA?.fixtures || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return fixtures
            .filter(fixture => fixture.status !== "completed"
                && !Number.isFinite(Number(fixture.scoreHome ?? NaN))
                && new Date(`${fixture.date}T00:00:00`) >= today)
            .sort((a, b) => `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`))[0] || null;
    }

    function standbyTeam(key, fallbackName, fallbackLogo) {
        const clubData = key ? getClub(key) : null;
        const name = clubData?.name || fallbackName || "À déterminer";
        const logo = clubData?.logo || fallbackLogo || "";
        return `
            <span class="featured-standby-team" style="--club:${key ? clubColor(key) : "var(--offline)"}">
                ${logo ? `<img src="${logo}" alt="">` : `<i aria-hidden="true">?</i>`}
                <b>${name}</b>
            </span>
        `;
    }

    function renderFeaturedMatch() {
        if (!matches.length) {
            const next = nextFixture();
            let nextBlock = "";
            if (next) {
                const date = new Date(`${next.date}T00:00:00`);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const days = Math.round((date - today) / 86400000);
                const countdown = days === 0 ? "AUJOURD’HUI" : days === 1 ? "DEMAIN" : `J-${days}`;
                const when = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(date);
                nextBlock = `
                    <div class="featured-next">
                        <p class="featured-next-label">Prochain direct // ${next.competitionLabel || "Ligue"}${next.stage ? ` · ${next.stage}` : ""}</p>
                        <div class="featured-next-versus">
                            ${standbyTeam(next.home, next.homeTeam, next.homeLogo)}
                            <em>VS</em>
                            ${standbyTeam(next.away, next.awayTeam, next.awayLogo)}
                        </div>
                        <div class="featured-next-when">
                            <strong>${countdown}</strong>
                            <span>${when}${next.time ? ` · ${next.time}` : ""}</span>
                        </div>
                    </div>
                `;
            }

            featuredMatch.dataset.matchCategory = "standby";
            featuredMatch.innerHTML = `
                <div class="featured-standby">
                    <div class="featured-standby-mire" aria-hidden="true"></div>
                    <div class="osd featured-osd">
                        <span class="rec is-off">HORS ANTENNE</span>
                        <span>CAM 01 <b>//</b> ÉCRAN VEDETTE</span>
                        <span class="osd-hide-sm">MIRE DE TEST</span>
                    </div>
                    <div class="featured-standby-body">
                        <span class="nl-nosignal-code">SIGNAL 00</span>
                        <strong class="featured-standby-title">Pas de signal</strong>
                        <p class="featured-standby-text">Aucun match n’a encore été enregistré. Le premier score passera ici en boucle.</p>
                    </div>
                    ${nextBlock}
                </div>
            `;
            return;
        }

        const match = [...matches].sort((a, b) => b.date.localeCompare(a.date))[0];
        const home = getClub(match.home);
        const away = getClub(match.away);
        const meta = categoryMeta(match);
        const matchMvp = bestRatedPlayer(match);
        const homeWin = match.scoreHome > match.scoreAway;
        const awayWin = match.scoreAway > match.scoreHome;

        featuredMatch.style.setProperty("--home-accent", clubColor(match.home));
        featuredMatch.style.setProperty("--away-accent", clubColor(match.away));
        featuredMatch.style.setProperty("--category-accent", meta.accent);
        featuredMatch.dataset.matchCategory = meta.key;
        featuredMatch.innerHTML = `
            <div class="osd featured-topline">
                <span class="rec">REPLAY</span>
                <span class="osd-hide-sm">CAM 01 <b>//</b> DERNIER SIGNAL</span>
                ${categoryTag(meta)}
                <span class="osd-hide-sm">${shortDate(match.date)} · TERMINÉ</span>
            </div>
            <div class="featured-scoreboard">
                <div class="featured-team home${homeWin ? " winner" : ""}">
                    <img src="${home.logo}" alt="">
                    <small>Domicile</small>
                    <strong>${home.name}</strong>
                </div>
                <div class="featured-score">
                    <small>${longDate(match.date)}</small>
                    <strong><span class="is-home${homeWin ? " is-winner" : ""}">${pad(match.scoreHome)}</span><i>:</i><span class="is-away${awayWin ? " is-winner" : ""}">${pad(match.scoreAway)}</span></strong>
                    <span>MVP // ${ratedPlayerLabel(matchMvp, "NON ATTRIBUÉ")}</span>
                </div>
                <div class="featured-team away${awayWin ? " winner" : ""}">
                    <img src="${away.logo}" alt="">
                    <small>Extérieur</small>
                    <strong>${away.name}</strong>
                </div>
            </div>
            ${renderGoalCurve(match, true)}
            <div class="featured-actions">
                <button type="button" class="match-control-button featured-open nl-btn" data-open-match="${match.id}">
                    Ouvrir le dernier replay <span>↗</span>
                </button>
            </div>
        `;
    }

    function scorerList(entries) {
        if (!entries?.length) return `<span class="scorer-empty">AUCUN BUT</span>`;
        return entries.map(entry => `
            <span class="scorer-entry">
                <strong>${entry.name}</strong>
                <small>${pad(entry.count)} BUT${entry.count > 1 ? "S" : ""}</small>
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
                    <span class="match-dossier-cam"><b>REPLAY ${pad(index + 1)}</b> // ${String(match.id).toUpperCase()}</span>
                    ${categoryTag(meta)}
                    <span class="match-dossier-date">${shortDate(match.date)}</span>
                    <span class="match-dossier-status"><i></i> TERMINÉ</span>
                </div>

                <div class="match-scoreboard">
                    <div class="match-team home ${homeWin ? "winner" : ""}">
                        <img src="${home.logo}" alt="">
                        <div><small>DOMICILE</small><strong>${home.name}</strong></div>
                        <span>${pad(match.scoreHome)}</span>
                    </div>
                    <div class="match-score-separator">
                        <small>SCORE FINAL</small><i></i><strong>VS</strong>
                    </div>
                    <div class="match-team away ${awayWin ? "winner" : ""}">
                        <span>${pad(match.scoreAway)}</span>
                        <div><small>EXTÉRIEUR</small><strong>${away.name}</strong></div>
                        <img src="${away.logo}" alt="">
                    </div>
                </div>

                ${renderGoalCurve(match)}

                <div class="match-dossier-lower">
                    <div class="match-scorers home">
                        <div><small>BUTEURS // ${home.name}</small><strong>${pad(match.scoreHome)}</strong></div>
                        <div class="scorer-list">${scorerList(match.scorersHome)}</div>
                    </div>
                    <div class="match-key-data">
                        <div><small>HOMME DU MATCH</small><strong>${ratedPlayerLabel(bestRated)}</strong></div>
                        <div><small>PREMIER IMPACT</small><strong>${firstGoal ? `${timecode(firstGoal.time)} · ${firstGoal.scorer}` : "—"}</strong></div>
                        <div><small>MEILLEUR BUTEUR</small><strong>${topScorer ? `${topScorer.name} · ${plural(topScorer.goals, "BUT", "BUTS")}` : "—"}</strong></div>
                    </div>
                    <div class="match-scorers away">
                        <div><small>BUTEURS // ${away.name}</small><strong>${pad(match.scoreAway)}</strong></div>
                        <div class="scorer-list">${scorerList(match.scorersAway)}</div>
                    </div>
                </div>

                <div class="match-dossier-actions">
                    <button type="button" class="match-control-button match-replay-button nl-btn nl-btn-sm" data-open-match="${match.id}">
                        Analyser le replay <span>↗</span>
                    </button>
                    ${match.videoUrl ? `<a class="nl-btn nl-btn-ghost nl-btn-sm" href="${match.videoUrl}" target="_blank" rel="noopener">Voir la vidéo <span>▶</span></a>` : ""}
                </div>
            </article>
        `;
    }

    // Note de match -> échelle de bleus (blanc = note parfaite)
    function noteColor(note) {
        if (note >= 10) return "var(--white)";
        if (note >= 9) return "var(--blue-3)";
        if (note >= 7) return "var(--blue-2)";
        if (note >= 5) return "var(--blue)";
        if (note >= 3) return "var(--offline)";
        return "var(--dim)";
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
                    <tr class="performance-row" style="--club:${clubColor(player.clubKey)};">
                        <td class="nl-num performance-rank">${pad(index + 1)}</td>
                        <td class="performance-player"><strong class="nl-strong">${player.name}</strong><small>${getClub(player.clubKey).name}</small></td>
                        <td class="is-hl performance-note" style="--note-color:${noteColor(player.note)}"><b>${player.note.toFixed(1)}</b></td>
                        <td>${stats.buts}</td>
                        <td>${stats.passes}</td>
                        <td>${stats.defenses}</td>
                        <td class="performance-dribbles">${stats.dribbles}</td>
                    </tr>
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
                    <span class="replay-event-index">${pad(index + 1)}</span>
                    <span class="replay-event-time">${timecode(event.time)}</span>
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
        const homeWin = match.scoreHome > match.scoreAway;
        const awayWin = match.scoreAway > match.scoreHome;
        const rows = playerPerformanceRows(match);
        const events = playByPlay(match);

        detailPanel.style.setProperty("--home-accent", clubColor(match.home));
        detailPanel.style.setProperty("--away-accent", clubColor(match.away));
        detailPanel.style.setProperty("--category-accent", meta.accent);
        detailPanel.dataset.matchCategory = meta.key;
        detailPanel.innerHTML = `
            <div class="match-detail-topline osd">
                <span class="rec">REPLAY</span>
                <span>SALLE DE VISIONNAGE <b>//</b> ${String(match.id).toUpperCase()}</span>
                <span class="osd-hide-sm">${meta.label.toUpperCase()} · ${longDate(match.date)}</span>
                <button type="button" class="match-control-button match-detail-close nl-modal-close" data-close-match
                    aria-label="Fermer le replay">×</button>
            </div>

            <div class="detail-scoreboard">
                <div class="detail-team home${homeWin ? " winner" : ""}">
                    <img src="${home.logo}" alt="">
                    <small>DOMICILE</small>
                    <strong>${home.name}</strong>
                </div>
                <div class="detail-score">
                    <small id="matchDetailTitle">SCORE FINAL // ${home.name} – ${away.name}</small>
                    <strong><span class="is-home${homeWin ? " is-winner" : ""}">${pad(match.scoreHome)}</span><i>:</i><span class="is-away${awayWin ? " is-winner" : ""}">${pad(match.scoreAway)}</span></strong>
                    <span>MVP // ${ratedPlayerLabel(matchMvp, "NON ATTRIBUÉ")}</span>
                </div>
                <div class="detail-team away${awayWin ? " winner" : ""}">
                    <img src="${away.logo}" alt="">
                    <small>EXTÉRIEUR</small>
                    <strong>${away.name}</strong>
                </div>
            </div>

            <section class="detail-curve-section">
                <div class="detail-section-title"><span>CH 01</span><div><small>LECTURE TEMPORELLE</small><h3>LIGNE DU MATCH</h3></div></div>
                ${renderGoalCurve(match)}
            </section>

            <div class="detail-analysis-grid">
                <section class="detail-timeline">
                    <div class="detail-section-title"><span>CH 02</span><div><small>ACTION PAR ACTION</small><h3>FIL DU MATCH</h3></div></div>
                    <div class="replay-events">${events || `<p class="detail-empty">Aucun but enregistré.</p>`}</div>
                </section>

                <section class="detail-performances">
                    <div class="detail-section-title"><span>CH 03</span><div><small>IMPACT INDIVIDUEL</small><h3>PERFORMANCES</h3></div></div>
                    ${rows ? `
                    <div class="performance-table nl-table-wrap">
                        <table class="nl-table">
                            <thead><tr><th scope="col">#</th><th scope="col">Joueur</th><th scope="col" class="is-hl">Note</th><th scope="col">Buts</th><th scope="col">Passes</th><th scope="col">Déf.</th><th scope="col">Drib.</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>` : `<p class="detail-empty">Aucune note enregistrée pour ce match.</p>`}
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

    // État vide : quatre écrans de replay éteints + cartouche « pas de signal »
    function emptyState() {
        const archiveEmpty = !matches.length;
        const code = archiveEmpty ? "ARCHIVE 00" : "SIGNAL 00";
        const title = archiveEmpty ? "Archive vierge" : "Aucun signal trouvé";
        const text = archiveEmpty
            ? "Aucun replay pour l’instant : le premier match terminé ouvrira le registre."
            : "Modifiez la saison, la compétition ou l’équipe sélectionnée.";
        const feeds = [1, 2, 3, 4].map(number => `
            <div class="nl-feed is-offline">
                <span class="nl-feed-mire"></span>
                <span class="nl-feed-osd"><span><b>REPLAY ${pad(number)}</b><span class="osd-hide-sm"> // EN ATTENTE</span></span><span class="rec is-off">HORS LIGNE</span></span>
            </div>
        `).join("");

        return `
            <div class="match-empty-state">
                <div class="nl-wall match-empty-wall" aria-hidden="true">${feeds}</div>
                <div class="match-empty-copy">
                    <span class="nl-nosignal-code">${code}</span>
                    <strong>${title}</strong>
                    <p>${text}</p>
                </div>
            </div>
        `;
    }

    function renderResults() {
        const filtered = getFilteredMatches();
        resultCount.textContent = plural(filtered.length, "MATCH", "MATCHS");

        if (!filtered.length) {
            matchList.innerHTML = emptyState();
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
                <section class="match-season" aria-label="Saison ${pad(season)}">
                    <div class="match-season-heading">
                        <span><small>SAISON</small><b>${pad(season)}</b></span>
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
                aria-selected="${index === 0}" style="--club:${option.key === "all" ? "var(--blue-2)" : clubColor(option.key)}">
                ${option.logo ? `<img src="${option.logo}" alt="">` : `<span class="match-option-all" aria-hidden="true">${pad(options.length - 1)}</span>`}
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
                `<option value="${season}">Saison ${pad(season)}</option>`
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
    renderHeroWall();
    renderFeaturedMatch();
    renderResults();

    const requestedMatch = new URLSearchParams(window.location.search).get("match");
    if (requestedMatch) openMatchDetail(requestedMatch);
});
