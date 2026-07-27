// Face à Face — toutes les comparaisons sont calculées depuis PLAYERS et MATCHES.
// Ajouter un joueur ou un match aux sources principales met automatiquement ce laboratoire à jour.

document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains("h2h-page")
        || typeof PLAYERS === "undefined"
        || typeof CLUB_META === "undefined"
        || typeof MATCHES === "undefined") return;

    const entityGrid = document.getElementById("h2hEntityGrid");
    const slotA = document.getElementById("h2hSlotA");
    const slotB = document.getElementById("h2hSlotB");
    const results = document.getElementById("h2hResults");
    const empty = document.getElementById("h2hEmpty");
    if (!entityGrid || !slotA || !slotB || !results || !empty) return;

    const CLUB_COLORS = Object.fromEntries(
        (window.NEBULA_DATA?.clubs || []).map(club => [club.key, club.color])
    );

    const POSITION_LABELS = window.NEBULA_DATA?.positions || {};

    const METRIC_COLORS = {
        neutral: "#a8b1bc",
        value: "#ffd84d",
        goals: "#ff536e",
        assists: "#58ddff",
        defenses: "#45f595",
        dribbles: "#b26cff",
        rating: "#9bff20"
    };

    const selections = {
        clubs: [],
        players: []
    };

    let mode = "clubs";

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function formatDate(value) {
        if (!value) return "DATE INCONNUE";
        const [year, month, day] = value.split("-");
        return `${day}/${month}/${year}`;
    }

    function formatNumber(value, digits = 0) {
        return Number(value || 0).toLocaleString("fr-FR", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }

    function formatCompactValue(value) {
        const number = Number(value || 0);
        if (number >= 1_000_000_000) {
            return `${(number / 1_000_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} B ¥`;
        }
        if (number >= 1_000_000) {
            return `${(number / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} M ¥`;
        }
        if (number >= 1_000) {
            return `${(number / 1_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} K ¥`;
        }
        return `${formatNumber(number)} ¥`;
    }

    function getClub(key) {
        const item = CLUB_META[key] || { name: key, logo: "", cls: key };
        return {
            key,
            name: item.name,
            logo: item.logo,
            color: CLUB_COLORS[key] || "#9bff20"
        };
    }

    function getPlayer(name) {
        return PLAYERS.find(player => player.name === name) || null;
    }

    function getPlayerHref(player) {
        if (!player) return "players.html";
        if (window.NEBULA_DATA?.playerPageHref) return window.NEBULA_DATA.playerPageHref(player);
        return `Joueurs/${player.folder}/${player.name.toLowerCase()}.html`;
    }

    function getPlayerAccent(player) {
        return CLUB_COLORS[player?.club] || "#b26cff";
    }

    function matchPlayerSide(match, playerName) {
        const inCollection = collection => (collection || []).some(item =>
            item.name === playerName || item.scorer === playerName || item.assist === playerName
        );
        if (inCollection(match.notesHome) || inCollection(match.scorersHome) || inCollection(match.timelineHome)) {
            return "home";
        }
        if (inCollection(match.notesAway) || inCollection(match.scorersAway) || inCollection(match.timelineAway)) {
            return "away";
        }
        return null;
    }

    function playerNote(match, playerName) {
        const entry = [...(match.notesHome || []), ...(match.notesAway || [])]
            .find(item => item.name === playerName);
        return Number.isFinite(entry?.note) ? entry.note : null;
    }

    function buildPlayerAggregates() {
        const aggregates = new Map(PLAYERS.map(player => [player.name, {
            profile: player,
            matches: 0,
            buts: 0,
            passes: 0,
            defenses: 0,
            dribbles: 0,
            mvps: 0,
            ratingTotal: 0,
            ratingCount: 0
        }]));

        MATCHES.forEach(match => {
            const matchStats = computePlayerStats(match);

            Object.entries(matchStats).forEach(([name, stats]) => {
                const aggregate = aggregates.get(name);
                if (!aggregate) return;
                aggregate.matches += 1;
                aggregate.buts += Number(stats.buts || 0);
                aggregate.passes += Number(stats.passes || 0);
                aggregate.defenses += Number(stats.defenses || 0);
                aggregate.dribbles += Number(stats.dribbles || 0);
            });

            [...(match.notesHome || []), ...(match.notesAway || [])].forEach(entry => {
                const aggregate = aggregates.get(entry.name);
                if (!aggregate || !Number.isFinite(entry.note)) return;
                aggregate.ratingTotal += entry.note;
                aggregate.ratingCount += 1;
            });

            const mvp = typeof computeMatchMvp === "function" ? computeMatchMvp(match) : null;
            if (mvp && aggregates.has(mvp.name)) aggregates.get(mvp.name).mvps += 1;
        });

        aggregates.forEach(aggregate => {
            aggregate.rating = aggregate.ratingCount
                ? aggregate.ratingTotal / aggregate.ratingCount
                : 0;
            aggregate.goalsPerMatch = aggregate.matches
                ? aggregate.buts / aggregate.matches
                : 0;
        });

        return aggregates;
    }

    function buildClubAggregates() {
        const aggregates = new Map(Object.keys(CLUB_META).map(key => [key, {
            ...getClub(key),
            players: PLAYERS.filter(player => player.club === key),
            value: PLAYERS.filter(player => player.club === key)
                .reduce((total, player) => total + Number(player.value || 0), 0),
            matches: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0
        }]));

        MATCHES.forEach(match => {
            const home = aggregates.get(match.home);
            const away = aggregates.get(match.away);
            if (!home || !away) return;

            home.matches += 1;
            away.matches += 1;
            home.goalsFor += Number(match.scoreHome || 0);
            home.goalsAgainst += Number(match.scoreAway || 0);
            away.goalsFor += Number(match.scoreAway || 0);
            away.goalsAgainst += Number(match.scoreHome || 0);

            if (match.scoreHome > match.scoreAway) {
                home.wins += 1;
                away.losses += 1;
            } else if (match.scoreAway > match.scoreHome) {
                away.wins += 1;
                home.losses += 1;
            } else {
                home.draws += 1;
                away.draws += 1;
            }
        });

        aggregates.forEach(aggregate => {
            aggregate.goalDifference = aggregate.goalsFor - aggregate.goalsAgainst;
            aggregate.winRate = aggregate.matches ? (aggregate.wins / aggregate.matches) * 100 : 0;
        });
        return aggregates;
    }

    const playerAggregates = buildPlayerAggregates();
    const clubAggregates = buildClubAggregates();

    function computeClubDirect(aKey, bKey) {
        const matches = MATCHES
            .filter(match =>
                (match.home === aKey && match.away === bKey)
                || (match.home === bKey && match.away === aKey)
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const direct = {
            matches,
            a: { wins: 0, goals: 0 },
            b: { wins: 0, goals: 0 },
            draws: 0
        };

        matches.forEach(match => {
            const aIsHome = match.home === aKey;
            const scoreA = aIsHome ? match.scoreHome : match.scoreAway;
            const scoreB = aIsHome ? match.scoreAway : match.scoreHome;
            direct.a.goals += scoreA;
            direct.b.goals += scoreB;
            if (scoreA > scoreB) direct.a.wins += 1;
            else if (scoreB > scoreA) direct.b.wins += 1;
            else direct.draws += 1;
        });

        return direct;
    }

    function getEntities() {
        if (mode === "clubs") {
            return Object.keys(CLUB_META).map(key => {
                const clubData = getClub(key);
                return {
                    id: key,
                    name: clubData.name,
                    subtitle: `${clubAggregates.get(key)?.players.length || 0} joueurs`,
                    image: clubData.logo,
                    color: clubData.color
                };
            });
        }

        return PLAYERS.map(player => ({
            id: player.name,
            name: player.name,
            subtitle: `${player.position} · ${player.clubName}`,
            image: player.avatar,
            color: getPlayerAccent(player)
        }));
    }

    function participantData(id) {
        if (!id) return null;
        if (mode === "clubs") return clubAggregates.get(id) || null;
        return playerAggregates.get(id) || null;
    }

    function participantIdentity(id) {
        if (!id) return null;
        if (mode === "clubs") {
            const clubData = getClub(id);
            return {
                id,
                name: clubData.name,
                subtitle: `${clubAggregates.get(id)?.players.length || 0} joueurs enregistrés`,
                meta: `${clubAggregates.get(id)?.matches || 0} match(s) archivé(s)`,
                image: clubData.logo,
                color: clubData.color,
                href: `club.html?club=${encodeURIComponent(id)}`
            };
        }

        const player = getPlayer(id);
        const aggregate = playerAggregates.get(id);
        if (!player || !aggregate) return null;
        return {
            id,
            name: player.name,
            subtitle: `${POSITION_LABELS[player.position] || player.position} · ${player.clubName}`,
            meta: formatCompactValue(player.value),
            image: player.avatar,
            color: getPlayerAccent(player),
            href: getPlayerHref(player)
        };
    }

    function renderHeroStats() {
        const stats = [
            [Object.keys(CLUB_META).length, "CLUBS INDEXÉS"],
            [PLAYERS.length, "JOUEURS INDEXÉS"],
            [MATCHES.length, "MATCHS ANALYSÉS"]
        ];
        document.getElementById("h2hHeroStats").innerHTML = stats.map(([value, label]) => `
            <div><strong>${String(value).padStart(2, "0")}</strong><span>${label}</span></div>
        `).join("");
    }

    function renderMode() {
        document.querySelectorAll(".h2h-mode-tab").forEach(button => {
            const active = button.dataset.mode === mode;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-selected", String(active));
        });
        document.getElementById("h2hModeLabel").textContent = mode === "clubs" ? "CLUBS" : "JOUEURS";
        document.getElementById("h2hRadarMode").textContent = mode === "clubs" ? "MODE CLUBS" : "MODE JOUEURS";
    }

    function renderSlot(target, id, side) {
        const identity = participantIdentity(id);
        if (!identity) {
            target.style.removeProperty("--entity-color");
            target.classList.add("is-empty");
            target.innerHTML = `
            <span class="h2h-slot-code">PARTICIPANT ${side}</span>
                <div class="h2h-slot-placeholder" data-side="${side}" aria-hidden="true"></div>
                <div><small>EMPLACEMENT LIBRE</small><strong>SÉLECTION REQUISE</strong></div>
            `;
            return;
        }

        target.classList.remove("is-empty");
        target.style.setProperty("--entity-color", identity.color);
        target.innerHTML = `
            <span class="h2h-slot-code">PARTICIPANT ${side}</span>
            <img src="${escapeHtml(identity.image)}" alt="" onerror="this.style.opacity='.15'">
            <div>
                <small>${escapeHtml(identity.subtitle)}</small>
                <strong>${escapeHtml(identity.name)}</strong>
                <span>${escapeHtml(identity.meta)}</span>
            </div>
            <a href="${escapeHtml(identity.href)}" aria-label="Ouvrir le profil de ${escapeHtml(identity.name)}">↗</a>
        `;
    }

    function renderSlots() {
        const selection = selections[mode];
        renderSlot(slotA, selection[0], "A");
        renderSlot(slotB, selection[1], "B");
    }

    function renderEntities() {
        const selection = selections[mode];
        entityGrid.innerHTML = getEntities().map(entity => {
            const index = selection.indexOf(entity.id);
            return `
                <button class="h2h-control-button h2h-entity-card${index >= 0 ? ` is-selected side-${index === 0 ? "a" : "b"}` : ""}"
                    type="button" data-entity="${escapeHtml(entity.id)}" style="--entity-color:${entity.color}">
                    <span class="h2h-entity-index">${index >= 0 ? (index === 0 ? "A" : "B") : "—"}</span>
                    <img src="${escapeHtml(entity.image)}" alt="" onerror="this.style.opacity='.15'">
                    <span class="h2h-entity-copy">
                        <strong>${escapeHtml(entity.name)}</strong>
                        <small>${escapeHtml(entity.subtitle)}</small>
                    </span>
                    <i></i>
                </button>
            `;
        }).join("");
    }

    function makeMetric(label, aValue, bValue, options = {}) {
        return {
            label,
            aValue: Number(aValue || 0),
            bValue: Number(bValue || 0),
            color: METRIC_COLORS[options.color || "neutral"],
            format: options.format || (value => formatNumber(value)),
            precision: options.precision || 0,
            context: options.context || ""
        };
    }

    function buildMetrics(aId, bId) {
        if (mode === "players") {
            const a = participantData(aId);
            const b = participantData(bId);
            return [
                makeMetric("Valeur actuelle", a.profile.value, b.profile.value, { color: "value", format: formatCompactValue }),
                makeMetric("Matchs joués", a.matches, b.matches),
                makeMetric("Buts", a.buts, b.buts, { color: "goals" }),
                makeMetric("Passes décisives", a.passes, b.passes, { color: "assists" }),
                makeMetric("Défenses", a.defenses, b.defenses, { color: "defenses" }),
                makeMetric("Dribbles", a.dribbles, b.dribbles, { color: "dribbles" }),
                makeMetric("Homme du match", a.mvps, b.mvps, { color: "rating" }),
                makeMetric("Note moyenne", a.rating, b.rating, {
                    color: "rating",
                    precision: 1,
                    format: value => formatNumber(value, 1)
                }),
                makeMetric("Buts / match", a.goalsPerMatch, b.goalsPerMatch, {
                    color: "goals",
                    precision: 2,
                    format: value => formatNumber(value, 2)
                })
            ];
        }

        const a = participantData(aId);
        const b = participantData(bId);
        const direct = computeClubDirect(aId, bId);
        return [
            makeMetric("Valeur de l'effectif", a.value, b.value, { color: "value", format: formatCompactValue }),
            makeMetric("Joueurs enregistrés", a.players.length, b.players.length),
            makeMetric("Matchs joués", a.matches, b.matches),
            makeMetric("Victoires globales", a.wins, b.wins, { color: "rating" }),
            makeMetric("Taux de victoire", a.winRate, b.winRate, {
                color: "rating",
                precision: 1,
                format: value => `${formatNumber(value, 1)} %`
            }),
            makeMetric("Buts marqués", a.goalsFor, b.goalsFor, { color: "goals" }),
            makeMetric("Différence de buts", a.goalDifference, b.goalDifference, {
                color: "assists",
                format: value => `${value > 0 ? "+" : ""}${formatNumber(value)}`
            }),
            makeMetric("Victoires directes", direct.a.wins, direct.b.wins, {
                color: "defenses",
                context: `${direct.matches.length} confrontation(s)`
            }),
            makeMetric("Buts en face à face", direct.a.goals, direct.b.goals, { color: "goals" })
        ];
    }

    function metricResult(metrics) {
        return metrics.reduce((score, metric) => {
            if (metric.aValue > metric.bValue) score.a += 1;
            else if (metric.bValue > metric.aValue) score.b += 1;
            else score.ties += 1;
            return score;
        }, { a: 0, b: 0, ties: 0 });
    }

    function renderDuelHeader(aId, bId) {
        const a = participantIdentity(aId);
        const b = participantIdentity(bId);
        document.getElementById("h2hDuelHeader").innerHTML = `
            <a class="h2h-duelist duelist-a" href="${escapeHtml(a.href)}" style="--entity-color:${a.color}">
                <img src="${escapeHtml(a.image)}" alt="" onerror="this.style.opacity='.15'">
                <span><small>${escapeHtml(a.subtitle)}</small><strong>${escapeHtml(a.name)}</strong><em>${escapeHtml(a.meta)}</em></span>
            </a>
            <div class="h2h-duel-core"><span>DATA LINK</span><strong>VS</strong><small>SYNCHRONISÉ</small></div>
            <a class="h2h-duelist duelist-b" href="${escapeHtml(b.href)}" style="--entity-color:${b.color}">
                <img src="${escapeHtml(b.image)}" alt="" onerror="this.style.opacity='.15'">
                <span><small>${escapeHtml(b.subtitle)}</small><strong>${escapeHtml(b.name)}</strong><em>${escapeHtml(b.meta)}</em></span>
            </a>
        `;
    }

    function renderMetrics(metrics) {
        document.getElementById("h2hMetricGrid").innerHTML = metrics.map((metric, index) => {
            const magnitude = Math.max(Math.abs(metric.aValue), Math.abs(metric.bValue), 1);
            const aWidth = Math.max(metric.aValue === 0 ? 0 : 4, (Math.abs(metric.aValue) / magnitude) * 100);
            const bWidth = Math.max(metric.bValue === 0 ? 0 : 4, (Math.abs(metric.bValue) / magnitude) * 100);
            const winner = metric.aValue === metric.bValue ? "tie" : metric.aValue > metric.bValue ? "a" : "b";
            return `
                <div class="h2h-metric-row" style="--metric-color:${metric.color}">
                    <span class="h2h-metric-rank">${String(index + 1).padStart(2, "0")}</span>
                    <strong class="h2h-metric-value value-a${winner === "a" ? " is-best" : ""}">${escapeHtml(metric.format(metric.aValue))}</strong>
                    <div class="h2h-metric-track track-a"><i style="width:${aWidth}%"></i></div>
                    <div class="h2h-metric-label">
                        <span>${escapeHtml(metric.label)}</span>
                        ${metric.context ? `<small>${escapeHtml(metric.context)}</small>` : ""}
                    </div>
                    <div class="h2h-metric-track track-b"><i style="width:${bWidth}%"></i></div>
                    <strong class="h2h-metric-value value-b${winner === "b" ? " is-best" : ""}">${escapeHtml(metric.format(metric.bValue))}</strong>
                </div>
            `;
        }).join("");
    }

    function renderVerdict(aId, bId, metrics) {
        const score = metricResult(metrics);
        const a = participantIdentity(aId);
        const b = participantIdentity(bId);
        let label = "ÉQUILIBRE PARFAIT";
        let leader = "AUCUN AVANTAGE";
        if (score.a > score.b) {
            label = `AVANTAGE ${a.name}`;
            leader = "PARTICIPANT A";
        } else if (score.b > score.a) {
            label = `AVANTAGE ${b.name}`;
            leader = "PARTICIPANT B";
        }
        document.getElementById("h2hVerdict").innerHTML = `
            <span>${escapeHtml(leader)}</span>
            <strong>${escapeHtml(label)}</strong>
            <em>${score.a} — ${score.b}${score.ties ? ` · ${score.ties} égalité${score.ties > 1 ? "s" : ""}` : ""}</em>
        `;
    }

    function renderClubHistory(aId, bId) {
        const direct = computeClubDirect(aId, bId);
        const a = participantIdentity(aId);
        const b = participantIdentity(bId);
        document.getElementById("h2hHistoryKicker").textContent = "CONFRONTATIONS DIRECTES";
        document.getElementById("h2hHistoryTitle").textContent = "HISTORIQUE DU DUEL";
        document.getElementById("h2hHistoryCount").textContent =
            `${String(direct.matches.length).padStart(2, "0")} MATCH${direct.matches.length > 1 ? "S" : ""}`;

        if (!direct.matches.length) {
            document.getElementById("h2hHistoryList").innerHTML = `
                <div class="h2h-no-history">Aucune confrontation enregistrée entre ces deux clubs.</div>
            `;
            return;
        }

        document.getElementById("h2hHistoryList").innerHTML = direct.matches.map((match, index) => {
            const aIsHome = match.home === aId;
            const scoreA = aIsHome ? match.scoreHome : match.scoreAway;
            const scoreB = aIsHome ? match.scoreAway : match.scoreHome;
            const winner = scoreA === scoreB ? "MATCH NUL" : scoreA > scoreB ? a.name : b.name;
            return `
                <article class="h2h-history-row">
                    <span class="h2h-history-id">DUEL–${String(index + 1).padStart(2, "0")}</span>
                    <div><small>${formatDate(match.date)} · ${escapeHtml(match.category || "MATCH")}</small><strong>${escapeHtml(winner)}</strong></div>
                    <div class="h2h-history-score">
                        <span>${escapeHtml(a.name)}</span><strong>${scoreA} : ${scoreB}</strong><span>${escapeHtml(b.name)}</span>
                    </div>
                    <em>${scoreA === scoreB ? "NUL" : "VAINQUEUR"} ↗</em>
                </article>
            `;
        }).join("");
    }

    function renderPlayerHistory(aId, bId) {
        const shared = MATCHES
            .filter(match => matchPlayerSide(match, aId) && matchPlayerSide(match, bId))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        document.getElementById("h2hHistoryKicker").textContent = "ARCHIVES COMMUNES";
        document.getElementById("h2hHistoryTitle").textContent = "MATCHS PARTAGÉS";
        document.getElementById("h2hHistoryCount").textContent =
            `${String(shared.length).padStart(2, "0")} MATCH${shared.length > 1 ? "S" : ""}`;

        if (!shared.length) {
            document.getElementById("h2hHistoryList").innerHTML = `
                <div class="h2h-no-history">Ces deux joueurs n'apparaissent encore dans aucun match commun.</div>
            `;
            return;
        }

        document.getElementById("h2hHistoryList").innerHTML = shared.map((match, index) => {
            const stats = computePlayerStats(match);
            const aStats = stats[aId] || { buts: 0, passes: 0, defenses: 0, dribbles: 0 };
            const bStats = stats[bId] || { buts: 0, passes: 0, defenses: 0, dribbles: 0 };
            const noteA = playerNote(match, aId);
            const noteB = playerNote(match, bId);
            return `
                <article class="h2h-history-row player-history">
                    <span class="h2h-history-id">LOG–${String(index + 1).padStart(2, "0")}</span>
                    <div>
                        <small>${formatDate(match.date)} · ${escapeHtml(club(match.home).name)} ${match.scoreHome}–${match.scoreAway} ${escapeHtml(club(match.away).name)}</small>
                        <strong>${escapeHtml(aId)} <i>${noteA === null ? "—" : formatNumber(noteA, 1)}</i></strong>
                    </div>
                    <div class="h2h-history-player-stats">
                        <span><b>${aStats.buts}</b> BUTS</span>
                        <span><b>${aStats.passes}</b> PAS.</span>
                        <span><b>${aStats.defenses}</b> DEF.</span>
                        <span><b>${aStats.dribbles}</b> DRI.</span>
                    </div>
                    <div class="h2h-history-player-stats side-b">
                        <span><b>${bStats.buts}</b> BUTS</span>
                        <span><b>${bStats.passes}</b> PAS.</span>
                        <span><b>${bStats.defenses}</b> DEF.</span>
                        <span><b>${bStats.dribbles}</b> DRI.</span>
                    </div>
                    <div><strong>${escapeHtml(bId)} <i>${noteB === null ? "—" : formatNumber(noteB, 1)}</i></strong></div>
                </article>
            `;
        }).join("");
    }

    function renderResults() {
        const [aId, bId] = selections[mode];
        const complete = Boolean(aId && bId);
        empty.hidden = complete;
        results.hidden = !complete;
        if (!complete) return;

        const metrics = buildMetrics(aId, bId);
        renderDuelHeader(aId, bId);
        renderMetrics(metrics);
        renderVerdict(aId, bId, metrics);
        if (mode === "clubs") renderClubHistory(aId, bId);
        else renderPlayerHistory(aId, bId);
    }

    function updateHint() {
        const count = selections[mode].length;
        const noun = mode === "clubs" ? "club" : "joueur";
        const text = count === 0
            ? `Sélectionnez un premier ${noun}, puis son adversaire.`
            : count === 1
                ? `Le participant A est prêt. Sélectionnez le second ${noun}.`
                : `Le duel est synchronisé. Cliquez sur un autre ${noun} pour remplacer le participant A.`;
        document.getElementById("h2hSelectionHint").textContent = text;
    }

    function renderAll() {
        renderMode();
        renderSlots();
        renderEntities();
        renderResults();
        updateHint();
    }

    document.getElementById("h2hModeTabs").addEventListener("click", event => {
        const button = event.target.closest("[data-mode]");
        if (!button || button.dataset.mode === mode) return;
        mode = button.dataset.mode;
        renderAll();
    });

    entityGrid.addEventListener("click", event => {
        const button = event.target.closest("[data-entity]");
        if (!button) return;
        const id = button.dataset.entity;
        const selection = selections[mode];
        const currentIndex = selection.indexOf(id);

        if (currentIndex >= 0) selection.splice(currentIndex, 1);
        else if (selection.length < 2) selection.push(id);
        else {
            selection.shift();
            selection.push(id);
        }
        renderAll();
    });

    document.getElementById("h2hSwap").addEventListener("click", () => {
        if (selections[mode].length === 2) selections[mode].reverse();
        renderAll();
    });

    document.getElementById("h2hReset").addEventListener("click", () => {
        selections[mode] = [];
        renderAll();
    });

    renderHeroStats();
    renderAll();
});
