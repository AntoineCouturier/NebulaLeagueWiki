document.addEventListener("DOMContentLoaded", () => {
    const data = window.NEBULA_DATA || {};
    const players = data.players || [];
    const matches = data.matches || [];
    const seasons = data.seasons || [];
    const seasonSelect = document.getElementById("progressSeason");
    const selectionSlot = document.getElementById("progressSelectionSlot");
    const playerGrid = document.getElementById("progressPlayerGrid");
    const resetButton = document.getElementById("progressReset");
    const profile = document.getElementById("progressProfile");
    const chartPanel = document.getElementById("progressChartPanel");
    const timelinePanel = document.getElementById("progressTimelinePanel");
    const chart = document.getElementById("progressChart");
    const timeline = document.getElementById("progressTimeline");
    const valueModeButton = document.getElementById("progressValueMode");
    const technicalModeButton = document.getElementById("progressTechnicalMode");
    const chartEyebrow = document.getElementById("progressChartEyebrow");
    const chartTitle = document.getElementById("progressChartTitle");
    const chartCaption = document.getElementById("progressChartCaption");
    const timelineEyebrow = document.getElementById("progressTimelineEyebrow");
    const timelineTitle = document.getElementById("progressTimelineTitle");
    const timelineCaption = document.getElementById("progressTimelineCaption");
    const heroScope = document.querySelector("[data-progress-scope]");
    const heroStats = document.querySelectorAll("[data-progress-stat]");
    let selectedPlayerName = null;
    let chartMode = "value";

    if (!selectionSlot || !playerGrid || !players.length) return;

    const escapeHtml = value => String(value ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const compact = value => new Intl.NumberFormat("fr-FR", {
        notation: "compact",
        maximumFractionDigits: 2
    }).format(Number(value || 0));
    const pad = (value, length = 2) => String(value).padStart(length, "0");
    const isRetired = player => player.club === "retraite";
    // Couleurs injectées : jetons du thème uniquement (le violet « retraite » devient --offline).
    const playerClub = player => {
        if (isRetired(player)) return { name: "Retraite", color: "var(--offline)" };
        const club = data.getClub?.(player.club);
        return club
            ? { name: club.name, color: club.color || "var(--blue-2)" }
            : { name: player.club || "Sans club", color: "var(--blue-2)" };
    };
    const technicalStats = [
        { key: "defense", label: "DÉFENSE", color: "var(--blue-2)" },
        { key: "passe", label: "PASSE", color: "var(--blue-3)" },
        { key: "dribble", label: "DRIBBLE", color: "var(--paper)" },
        { key: "tir", label: "TIR", color: "var(--blue)" },
        { key: "offense", label: "OFFENSE", color: "var(--blue-3)" },
        { key: "position", label: "POSITIONNEMENT", color: "var(--blue-2)" }
    ];

    // Classement façon Blue Lock (identique à players.html) : rang selon la
    // note globale ; retraités et joueurs sans note = NON CLASSÉ.
    function overallOf(player) {
        const global = player?.technical?.global;
        if (Number.isFinite(global)) return global;
        const computed = data.calculateTechnicalOverall?.(player?.technical);
        return Number.isFinite(computed) ? computed : null;
    }
    const ranking = players
        .filter(player => !isRetired(player) && Number.isFinite(overallOf(player)))
        .sort((a, b) => overallOf(b) - overallOf(a));
    const rankOf = player => {
        const position = ranking.indexOf(player);
        return position === -1 ? 0 : position + 1;
    };
    const sourceNumber = player => pad(players.indexOf(player) + 1);

    function normalizedTechnical(technical = {}) {
        return Object.fromEntries(technicalStats.map(stat => {
            const rawValue = technical?.[stat.key];
            const value = rawValue === null || rawValue === undefined || rawValue === ""
                ? null
                : Number(rawValue);
            return [stat.key, Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null];
        }));
    }

    function technicalHistoryOf(player) {
        const finishedSeasons = seasons
            .filter(season => season.status === "finished")
            .sort((a, b) => Number(a.number) - Number(b.number));
        const historyBySeason = new Map();

        finishedSeasons.forEach(season => {
            const rawSnapshot = season.technicalSnapshots?.[player.name];
            if (!rawSnapshot) return;
            historyBySeason.set(Number(season.number), {
                id: `season-${season.number}-${player.name}`,
                capturedAt: rawSnapshot.capturedAt || rawSnapshot.date || season.endDate || "",
                date: rawSnapshot.date || season.endDate || "",
                season: Number(season.number),
                label: rawSnapshot.label || `Fin de saison ${String(season.number).padStart(2, "0")}`,
                technical: normalizedTechnical(rawSnapshot.technical || rawSnapshot.stats || rawSnapshot)
            });
        });

        (Array.isArray(player.technicalHistory) ? player.technicalHistory : []).forEach((entry, index) => {
            const seasonNumber = Number(entry.season || 0);
            const seasonIsFinished = finishedSeasons.some(season => Number(season.number) === seasonNumber);
            if (!seasonIsFinished || historyBySeason.has(seasonNumber)) return;
            historyBySeason.set(seasonNumber, {
                id: entry.id || `player-${index}`,
                capturedAt: entry.capturedAt || entry.date || "",
                date: entry.date || "",
                season: seasonNumber,
                label: entry.label || `Fin de saison ${String(seasonNumber).padStart(2, "0")}`,
                technical: normalizedTechnical(entry.technical || entry.stats || entry)
            });
        });

        const history = [...historyBySeason.values()]
            .sort((a, b) => Number(a.season) - Number(b.season));
        if (seasonSelect.value === "all") return history;
        return history.filter(entry => Number(entry.season) === Number(seasonSelect.value));
    }

    seasonSelect.innerHTML = [
        `<option value="all">Toute la carrière</option>`,
        ...seasons.slice().sort((a, b) => b.number - a.number)
            .map(season => `<option value="${season.number}">Saison ${String(season.number).padStart(2, "0")}</option>`)
    ].join("");

    const activeSeason = data.getActiveSeason?.();
    if (activeSeason) seasonSelect.value = String(activeSeason.number);

    const periodLabel = () => seasonSelect.value === "all"
        ? "Toute la carrière"
        : `Saison ${pad(seasonSelect.value)}`;

    // État vide « mire de test » commun aux panneaux.
    const noSignal = (code, title, text, extraClass = "") => `
        <div class="progress-nosignal nl-nosignal${extraClass ? ` ${extraClass}` : ""}">
            <span class="nl-nosignal-code">${code}</span>
            <strong>${title}</strong>
            <p>${text}</p>
        </div>`;

    /* ---------- Héros : relevés + oscilloscope des notes ---------- */
    function renderHero() {
        const peak = ranking[0];
        const values = {
            players: pad(players.length),
            ranked: pad(ranking.length),
            rankedNote: `${pad(ranking.length)} classés · ${pad(players.length - ranking.length)} hors classement`,
            matches: pad(matches.length),
            seasonNote: activeSeason ? `Saison ${pad(activeSeason.number)} en cours` : "Archives complètes",
            peak: peak ? String(overallOf(peak)) : "--",
            peakNote: peak ? `#001 // ${peak.name}` : "Aucun sujet classé"
        };
        heroStats.forEach(node => {
            const key = node.dataset.progressStat;
            if (key in values) node.textContent = values[key];
        });

        if (!heroScope) return;
        if (!ranking.length) {
            heroScope.innerHTML = "";
            return;
        }

        const scaleMin = 70;
        const scaleMax = 100;
        const yFor = note => 12 + ((scaleMax - Math.max(scaleMin, Math.min(scaleMax, note))) / (scaleMax - scaleMin)) * 76;
        const ascending = ranking.slice().reverse();
        const points = ascending.map((player, index) => ({
            player,
            note: overallOf(player),
            rank: rankOf(player),
            x: ascending.length > 1 ? 9 + (index / (ascending.length - 1)) * 82 : 50,
            y: yFor(overallOf(player))
        }));
        const first = points[0];
        const last = points.at(-1);
        const trace = [
            `0,${Math.min(98, first.y + 7).toFixed(2)}`,
            ...points.map(point => `${point.x.toFixed(2)},${point.y.toFixed(2)}`),
            `100,${last.y.toFixed(2)}`
        ].join(" ");
        const area = `0,100 ${trace} 100,100`;
        const ticks = [100, 90, 80, 70].map(note => `
            <span class="progress-scope-tick" style="--y:${yFor(note).toFixed(2)}%">${note}</span>`).join("");

        heroScope.innerHTML = `
            <div class="progress-scope-grid"></div>
            ${ticks}
            <svg class="progress-scope-svg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
                <polygon class="progress-scope-area" points="${area}"/>
                <polyline class="progress-scope-trace" points="${trace}"/>
            </svg>
            ${points.map(point => {
                const club = playerClub(point.player);
                return `
                <span class="progress-scope-node${point.rank === 1 ? " is-top" : ""}" style="--x:${point.x.toFixed(2)}%;--y:${point.y.toFixed(2)}%;--club:${club.color}">
                    <span class="progress-scope-label"><b>#${pad(point.rank, 3)}</b><span>${escapeHtml(point.player.name)}</span><i>${point.note}</i></span>
                    <img src="${escapeHtml(point.player.avatar)}" alt="" loading="lazy" decoding="async">
                </span>`;
            }).join("")}
            <span class="progress-scope-readout"><b>PIC</b> ${escapeHtml(last.player.name)} · ${last.note} <span>// PLANCHER ${escapeHtml(first.player.name)} · ${first.note}</span></span>`;
    }

    /* ---------- CH 01 : sortie programme + multiview ---------- */
    function rankBadge(player, rank, size = "md") {
        if (rank) {
            return `<span class="nl-rank nl-rank--${size}${rank > 1 && rank <= 3 ? " is-podium" : ""}"><small>#</small>${pad(rank, 3)}</span>`;
        }
        return `<span class="nl-nc"><b>NON CLASSÉ</b><small>${isRetired(player) ? "ARCHIVÉ // RETRAITE" : "EN ATTENTE DE NOTE"}</small></span>`;
    }

    function renderSelector() {
        const selected = players.find(player => player.name === selectedPlayerName);

        if (!selected) {
            selectionSlot.classList.add("is-empty");
            selectionSlot.style.removeProperty("--player-accent");
            selectionSlot.innerHTML = `
                <div class="progress-pgm-feed progress-pgm-empty nl-feed is-offline">
                    <span class="nl-feed-mire" data-label="PAS DE SIGNAL"></span>
                    <span class="nl-feed-osd"><span><b>PGM</b> // HORS ANTENNE</span><span class="rec is-off">EN ATTENTE</span></span>
                    <span class="nl-feed-caption"><small>Emplacement libre</small><b>Sélection requise</b><em>Choisissez une source dans le multiview.</em></span>
                </div>`;
        } else {
            const club = playerClub(selected);
            const overall = overallOf(selected);
            const rank = rankOf(selected);
            const retired = isRetired(selected);
            selectionSlot.classList.remove("is-empty");
            selectionSlot.style.setProperty("--player-accent", club.color);
            selectionSlot.innerHTML = `
                <div class="progress-pgm-feed nl-feed is-locked${retired ? " is-offline" : ""}" style="--club:${club.color}">
                    <img class="nl-feed-img progress-pgm-backdrop" src="${escapeHtml(selected.avatar)}" alt="">
                    <span class="progress-pgm-portrait">
                        <img src="${escapeHtml(selected.avatar)}" alt="${escapeHtml(selected.name)}">
                        <span class="nl-feed-lock" aria-hidden="true"></span>
                    </span>
                    <span class="nl-feed-osd"><span><b>SRC ${sourceNumber(selected)}</b> // ${escapeHtml(club.name)}</span>${retired ? '<span class="rec is-off">ARCHIVÉ</span>' : '<span class="rec">DIRECT</span>'}</span>
                    <span class="progress-pgm-rank">${rankBadge(selected, rank)}</span>
                    <span class="nl-feed-caption"><small>${escapeHtml(selected.position)} · ${escapeHtml(club.name)}</small><b>${escapeHtml(selected.name)}</b></span>
                    <span class="nl-feed-figure progress-pgm-ovr">${overall ?? "--"}<small>OVR</small></span>
                    <a class="progress-pgm-link nl-btn nl-btn-sm" href="${escapeHtml(data.playerPageHref?.(selected) || "players.html")}" aria-label="Ouvrir la fiche de ${escapeHtml(selected.name)}">Ouvrir la fiche <span>↗</span></a>
                </div>`;
        }

        const cards = players.map(player => {
            const club = playerClub(player);
            const isSelected = player.name === selectedPlayerName;
            const rank = rankOf(player);
            const retired = isRetired(player);
            const status = isSelected
                ? `<span class="progress-entity-status is-pgm">PGM</span>`
                : retired
                    ? `<span class="rec is-off">HORS LIGNE</span>`
                    : `<span class="progress-entity-status${rank ? "" : " is-nc"}">${rank ? `#${pad(rank, 3)}` : "N/C"}</span>`;
            return `
                <button type="button" class="progress-entity-card nl-feed${isSelected ? " is-selected" : ""}${retired ? " is-offline" : ""}"
                    data-progress-player="${escapeHtml(player.name)}" aria-pressed="${isSelected}"
                    aria-label="${escapeHtml(player.name)}, ${escapeHtml(club.name)}, ${rank ? `classement numéro ${rank}` : "non classé"}"
                    style="--entity-color:${club.color};--club:${club.color}">
                    <img class="nl-feed-img" src="${escapeHtml(player.avatar)}" alt="" loading="lazy" decoding="async">
                    <span class="nl-feed-lock" aria-hidden="true"></span>
                    <span class="nl-feed-osd"><span><b>SRC ${sourceNumber(player)}</b></span>${status}</span>
                    <span class="nl-feed-caption"><small>${escapeHtml(player.position)} · ${escapeHtml(club.name)}</small><b>${escapeHtml(player.name)}</b></span>
                    <i aria-hidden="true"></i>
                </button>`;
        });
        const fillers = Array.from({ length: (4 - (players.length % 4)) % 4 }, (_, index) => `
                <span class="progress-entity-filler nl-feed is-offline" aria-hidden="true">
                    <span class="nl-feed-mire" data-label="LIBRE"></span>
                    <span class="nl-feed-osd"><span><b>SRC ${pad(players.length + index + 1)}</b></span><span class="rec is-off">VIDE</span></span>
                </span>`);
        playerGrid.innerHTML = cards.concat(fillers).join("");
    }

    /* ---------- CH 02 : relevé du sujet (bande bleue) ---------- */
    function metricsGrid(cells) {
        return `<div class="progress-metrics">${cells.map(([label, value, key]) => `
            <div class="nl-stat progress-metric${key ? " is-key" : ""}"><span class="nl-stat-label">${label}</span><strong class="nl-stat-value">${value}</strong></div>`).join("")}
        </div>`;
    }

    function renderEmptyState() {
        profile.style.removeProperty("--player-accent");
        profile.innerHTML = `
            <div class="progress-band is-standby">
                <div class="progress-band-feed nl-feed is-offline">
                    <span class="nl-feed-mire" data-label="EN VEILLE"></span>
                    <span class="nl-feed-osd"><span><b>CAM 11-B</b> // RELEVÉ</span><span class="rec is-off">VEILLE</span></span>
                </div>
                <div class="progress-band-id">
                    <p class="nl-kicker"><span class="progress-band-ch">CH 02</span> Analyse en attente</p>
                    <h2 class="progress-band-name">Aucun joueur <em>sélectionné</em></h2>
                    <p class="progress-band-text">Choisissez un profil pour afficher sa progression, sa valeur et son journal de matchs.</p>
                </div>
                ${metricsGrid([
                    ["Valeur actuelle", "--", true], ["Matchs", "--"], ["Buts", "--"], ["Passes D.", "--"],
                    ["Défenses", "--"], ["Dribbles", "--"], ["Note moy.", "--"], ["MVP", "--"]
                ])}
            </div>`;
        chartPanel.hidden = true;
        timelinePanel.hidden = true;
    }

    function playerPerformances(player) {
        return matches
            .filter(match => seasonSelect.value === "all" || Number(match.season) === Number(seasonSelect.value))
            .map(match => ({ match, perf: data.getPlayerMatchPerformance?.(match, player.name) }))
            .filter(entry => entry.perf)
            .sort((a, b) => new Date(a.match.date) - new Date(b.match.date));
    }

    function totalsOf(entries) {
        return entries.reduce((totals, { perf }) => {
            totals.matches += 1;
            totals.goals += perf.goals;
            totals.assists += perf.assists;
            totals.defenses += perf.defenses;
            totals.dribbles += perf.dribbles;
            totals.mvp += perf.mvp;
            totals.note += perf.note;
            return totals;
        }, { matches: 0, goals: 0, assists: 0, defenses: 0, dribbles: 0, mvp: 0, note: 0 });
    }

    function matchValue(entry) {
        const { match, perf } = entry;
        const tier = (data.marketValueTiers || []).find(item => item.key === (match.valueTier || match.category))
            || { multiplier: 1, victory: 0 };
        const actions = Object.fromEntries((data.marketValueActions || []).map(action => [action.key, action]));
        return Math.round(
            (perf.won ? Number(tier.victory || 0) : 0)
            + (perf.lost ? Number(actions.defaite?.base || 0) * Number(tier.multiplier || 1) : 0)
            + perf.goals * Number(actions.buts?.base || 0) * Number(tier.multiplier || 1)
            + perf.assists * Number(actions.passes?.base || 0) * Number(tier.multiplier || 1)
            + perf.defenses * Number(actions.def?.base || 0) * Number(tier.multiplier || 1)
            + perf.dribbles * Number(actions.dribbles?.base || 0) * Number(tier.multiplier || 1)
            + perf.mvp * Number(actions.mvp?.base || 0) * Number(tier.multiplier || 1)
        );
    }

    function renderProfile(player, entries) {
        const totals = totalsOf(entries);
        const club = playerClub(player);
        const overall = overallOf(player);
        const rank = rankOf(player);
        const retired = isRetired(player);
        const currentValue = data.getPlayerMarketValue?.(player.name) || 0;
        const averageNote = totals.matches ? totals.note / totals.matches : 0;
        profile.style.setProperty("--player-accent", club.color);
        profile.innerHTML = `
            <div class="progress-band" style="--club:${club.color}">
                <div class="progress-band-feed nl-feed${retired ? " is-offline" : ""}">
                    <img class="nl-feed-img" src="${escapeHtml(player.avatar)}" alt="${escapeHtml(player.name)}">
                    <span class="nl-feed-osd"><span><b>CAM 11-B</b> // SRC ${sourceNumber(player)}</span>${retired ? '<span class="rec is-off">ARCHIVÉ</span>' : '<span class="rec">REC</span>'}</span>
                    <span class="nl-feed-figure">${overall ?? "--"}<small>OVR</small></span>
                </div>
                <div class="progress-band-id">
                    <p class="nl-kicker"><span class="progress-band-ch">CH 02</span> Relevé du sujet // ${escapeHtml(periodLabel())}</p>
                    <h2 class="progress-band-name">${escapeHtml(player.name)}</h2>
                    <div class="progress-band-tags">
                        <span class="nl-tag nl-tag--pos" style="--club:${club.color}">${escapeHtml(player.position)}</span>
                        <span class="nl-tag nl-tag--club" style="--club:${club.color}">${escapeHtml(club.name)}</span>
                        <span class="nl-tag${rank ? "" : " nl-tag--off"}">${rank ? `Classement #${pad(rank, 3)}` : "Non classé"}</span>
                    </div>
                    <a class="nl-btn nl-btn-light nl-btn-sm" href="${escapeHtml(data.playerPageHref?.(player) || "players.html")}">Ouvrir la fiche <span>↗</span></a>
                </div>
                ${metricsGrid([
                    ["Valeur actuelle", `${compact(currentValue)}<small>¥</small>`, true],
                    ["Matchs", pad(totals.matches)],
                    ["Buts", totals.goals],
                    ["Passes D.", totals.assists],
                    ["Défenses", totals.defenses],
                    ["Dribbles", totals.dribbles],
                    ["Note moy.", averageNote ? averageNote.toFixed(1) : "--"],
                    ["MVP", totals.mvp]
                ])}
            </div>`;
    }

    /* ---------- CH 03 : oscilloscope de valeur ---------- */
    function renderChart(player, entries) {
        if (!entries.length) {
            chart.innerHTML = noSignal(
                "SIGNAL 00",
                "Aucune trajectoire",
                "Aucune trajectoire disponible pour cette période. Elle apparaîtra après le premier match du joueur."
            );
            return;
        }

        const values = [Number(player.baseValue || 0)];
        entries.forEach(entry => values.push(values.at(-1) + matchValue(entry)));
        const pointSpacing = 68;
        const width = Math.max(1080, 48 + (values.length - 1) * pointSpacing);
        const height = 280;
        const padding = 24;
        let minValue = Math.min(...values, 0);
        let maxValue = Math.max(...values, 0);
        if (minValue === maxValue) {
            minValue -= 1;
            maxValue += 1;
        }
        const valueRange = maxValue - minValue;
        const chartHeight = height - padding * 2;
        const yForValue = value => padding + ((maxValue - value) / valueRange) * chartHeight;
        const zeroY = yForValue(0);
        const points = values.map((value, index) => {
            const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
            const y = yForValue(value);
            return { x, y, value };
        });
        const polyline = points.map(point => `${point.x},${point.y}`).join(" ");
        const area = `${points[0].x},${zeroY} ${polyline} ${points.at(-1).x},${zeroY}`;
        const horizontalGrid = [0, 0.25, 0.5, 0.75, 1].map(level => {
            const y = padding + level * chartHeight;
            return `<line class="grid" x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}"/>`;
        }).join("");
        const zeroLine = minValue < 0 && maxValue > 0
            ? `<line class="grid zero" x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}"/>`
            : "";

        chart.innerHTML = `
            <div class="progress-chart-scroll" tabindex="0" aria-label="Courbe défilable horizontalement">
                <div class="progress-chart-track" style="width:${width}px">
                    <svg class="progress-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Progression cumulée de valeur">
                        <defs><linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1"><stop class="progress-stop" offset="0" stop-opacity=".32"/><stop class="progress-stop" offset="1" stop-opacity="0"/></linearGradient></defs>
                        ${horizontalGrid}
                        ${zeroLine}
                        <polygon class="area" points="${area}"/>
                        <polyline class="path" points="${polyline}"/>
                        ${points.map((point, index) => `
                            <circle class="node" cx="${point.x}" cy="${point.y}" r="6" tabindex="0"
                                role="button" aria-pressed="false"
                                data-progress-value="${point.value}"
                                data-progress-label="${index === 0 ? "DÉPART" : `MATCH ${String(index).padStart(2, "0")}`}"
                                aria-label="${index === 0 ? "Valeur de départ" : `Valeur cumulée après le match ${index}`} : ${compact(point.value)} ¥">
                            </circle>`).join("")}
                    </svg>
                    <div class="progress-chart-labels"><span>DÉPART · ${compact(values[0])} ¥</span><span>${entries.length} MATCH${entries.length > 1 ? "S" : ""}</span><span>IMPACT · ${compact(values.at(-1))} ¥</span></div>
                </div>
            </div>
            <div class="progress-point-tooltip" role="tooltip" aria-hidden="true"></div>
            <div class="progress-scroll-hint" aria-hidden="true"><span>↔</span> FAITES DÉFILER LA TRAJECTOIRE</div>`;

        const tooltip = chart.querySelector(".progress-point-tooltip");
        const chartBounds = () => chart.getBoundingClientRect();
        let pinnedNode = null;

        function positionTooltip(node, pointerEvent = null) {
            const bounds = chartBounds();
            const nodeBounds = node.getBoundingClientRect();
            const rawX = pointerEvent?.clientX ?? nodeBounds.left + nodeBounds.width / 2;
            const rawY = pointerEvent?.clientY ?? nodeBounds.top + nodeBounds.height / 2;
            const x = Math.max(95, Math.min(bounds.width - 95, rawX - bounds.left));
            const y = Math.max(18, Math.min(bounds.height - 24, rawY - bounds.top));
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        }

        function showTooltip(node, pointerEvent = null) {
            const value = Number(node.dataset.progressValue || 0);
            tooltip.innerHTML = `
                <small>${escapeHtml(node.dataset.progressLabel || "TRAJECTOIRE")}</small>
                <strong>${compact(value)} ¥</strong>
                <span>VALEUR CUMULÉE</span>`;
            positionTooltip(node, pointerEvent);
            tooltip.classList.add("is-visible");
            tooltip.setAttribute("aria-hidden", "false");
        }

        function hideTooltip(force = false) {
            if (pinnedNode && !force) {
                showTooltip(pinnedNode);
                return;
            }
            tooltip.classList.remove("is-visible");
            tooltip.setAttribute("aria-hidden", "true");
        }

        chart.querySelectorAll(".progress-svg .node").forEach(node => {
            node.addEventListener("pointerenter", event => showTooltip(node, event));
            node.addEventListener("pointermove", event => positionTooltip(node, event));
            node.addEventListener("pointerleave", () => hideTooltip());
            node.addEventListener("focus", () => showTooltip(node));
            node.addEventListener("blur", () => hideTooltip());
            node.addEventListener("click", event => {
                event.stopPropagation();
                const shouldUnpin = pinnedNode === node;

                if (pinnedNode) {
                    pinnedNode.classList.remove("is-pinned");
                    pinnedNode.setAttribute("aria-pressed", "false");
                }

                pinnedNode = shouldUnpin ? null : node;
                if (pinnedNode) {
                    pinnedNode.classList.add("is-pinned");
                    pinnedNode.setAttribute("aria-pressed", "true");
                    showTooltip(pinnedNode);
                } else {
                    hideTooltip(true);
                }
            });
        });

        chart.addEventListener("click", event => {
            if (event.target.closest?.(".progress-svg .node") || !pinnedNode) return;
            pinnedNode.classList.remove("is-pinned");
            pinnedNode.setAttribute("aria-pressed", "false");
            pinnedNode = null;
            hideTooltip(true);
        });
    }

    function technicalSnapshotLabel(snapshot, index) {
        if (snapshot.label) return snapshot.label;
        const seasonLabel = snapshot.season
            ? `SAISON ${String(snapshot.season).padStart(2, "0")}`
            : "HORS SAISON";
        return `${seasonLabel} · RELEVÉ ${String(index + 1).padStart(2, "0")}`;
    }

    function renderTechnicalChart(player, snapshots) {
        const hasTechnicalData = snapshots.some(snapshot => (
            technicalStats.some(stat => Number.isFinite(snapshot.technical?.[stat.key]))
        ));

        if (!snapshots.length || !hasTechnicalData) {
            chart.innerHTML = noSignal(
                "DOSSIER 00",
                "Aucun relevé technique",
                "Aucun relevé technique officiel pour cette période. Un dossier apparaîtra après la clôture d’une saison."
            );
            return;
        }

        const trackWidth = Math.max(1000, snapshots.length * 500 + Math.max(0, snapshots.length - 1) * 16);
        const cards = snapshots.map((snapshot, index) => {
            const previous = snapshots[index - 1];
            const overall = data.calculateTechnicalOverall?.(snapshot.technical);
            const previousOverall = previous ? data.calculateTechnicalOverall?.(previous.technical) : null;
            const overallDelta = Number.isFinite(overall) && Number.isFinite(previousOverall)
                ? overall - previousOverall
                : null;

            return `
                <article class="progress-revision-card${index === snapshots.length - 1 ? " is-current" : ""}">
                    <div class="progress-revision-head">
                        <div>
                            <small>DOSSIER TECHNIQUE // ${String(index + 1).padStart(2, "0")}</small>
                            <h3>${escapeHtml(technicalSnapshotLabel(snapshot, index))}</h3>
                            <span>${escapeHtml(snapshot.date || "DATE NON RENSEIGNÉE")}</span>
                        </div>
                        <div class="progress-revision-overall">
                            <span>GLOBAL</span>
                            <strong>${overall ?? "N/A"}</strong>
                            <em class="${overallDelta > 0 ? "is-up" : overallDelta < 0 ? "is-down" : "is-flat"}">
                                ${overallDelta === null ? "BASE" : `${overallDelta > 0 ? "+" : ""}${overallDelta}`}
                            </em>
                        </div>
                    </div>
                    <div class="progress-revision-stats">
                        ${technicalStats.map(stat => {
                            const currentValue = snapshot.technical?.[stat.key];
                            const previousValue = previous?.technical?.[stat.key];
                            const hasCurrent = Number.isFinite(currentValue);
                            const hasPrevious = Number.isFinite(previousValue);
                            const delta = hasCurrent && hasPrevious ? currentValue - previousValue : null;
                            const stateClass = delta > 0 ? "is-up" : delta < 0 ? "is-down" : "is-flat";
                            return `
                                <div class="progress-revision-stat ${stateClass}" style="--stat-color:${stat.color}">
                                    <div><span>${stat.label}</span><em>${delta === null ? "BASE" : delta === 0 ? "STABLE" : `${delta > 0 ? "+" : ""}${delta}`}</em></div>
                                    <strong>
                                        <small>${hasPrevious ? previousValue : "—"}</small>
                                        <b>→</b>
                                        ${hasCurrent ? currentValue : "N/A"}
                                    </strong>
                                    <span class="progress-revision-meter nl-vu" style="--v:${hasCurrent ? currentValue : 0}" aria-hidden="true"></span>
                                </div>`;
                        }).join("")}
                    </div>
                </article>`;
        }).join("");

        chart.innerHTML = `
            <div class="progress-revision-summary">
                <span class="nl-tag nl-tag--ligue">${snapshots.length} DOSSIER${snapshots.length > 1 ? "S" : ""} ARCHIVÉ${snapshots.length > 1 ? "S" : ""}</span>
                <strong>Chaque carte compare ses notes au relevé précédent.</strong>
            </div>
            <div class="progress-revision-scroll" tabindex="0" aria-label="Dossiers techniques défilables horizontalement">
                <div class="progress-revision-track" style="--revision-count:${snapshots.length};--revision-width:${trackWidth}px">
                    ${cards}
                </div>
            </div>
            ${snapshots.length > 2 ? `<div class="progress-scroll-hint" aria-hidden="true"><span>↔</span> FAITES DÉFILER LES DOSSIERS</div>` : ""}`;
    }

    /* ---------- CH 04 : journal (tableau régie) ---------- */
    function renderTimeline(player, entries) {
        if (!entries.length) {
            timeline.innerHTML = noSignal(
                "JOURNAL 00",
                "Journal en attente",
                "Le journal d’impact est en attente de données : chaque match joué y ajoutera une ligne.",
                "is-compact"
            );
            return;
        }
        const club = playerClub(player);
        const rows = entries.slice().reverse().map(({ match, perf }, index) => {
            const home = data.getClub?.(match.home);
            const away = data.getClub?.(match.away);
            const valueImpact = matchValue({ match, perf });
            const result = perf.won
                ? `<span class="nl-tag nl-tag--ligue">Victoire</span>`
                : perf.draw
                    ? `<span class="nl-tag">Nul</span>`
                    : `<span class="nl-tag nl-tag--off">Défaite</span>`;
            return `
                <tr class="progress-entry" style="--club:${club.color}">
                    <td class="nl-num progress-entry-index">${String(entries.length - index).padStart(2, "0")}</td>
                    <td class="progress-entry-match"><small>SAISON ${String(match.season).padStart(2, "0")} · ${escapeHtml(match.date)}</small><strong class="nl-strong">${escapeHtml(home?.name || match.home)} <b>${match.scoreHome}–${match.scoreAway}</b> ${escapeHtml(away?.name || match.away)}</strong></td>
                    <td class="progress-entry-result">${result}</td>
                    <td class="is-hl" data-label="Note">${perf.note ? perf.note.toFixed(1) : "—"}</td>
                    <td data-label="Buts">${perf.goals}</td>
                    <td data-label="Passes">${perf.assists}</td>
                    <td data-label="Déf/Drb">${perf.defenses} / ${perf.dribbles}</td>
                    <td class="progress-entry-value${valueImpact < 0 ? " is-down" : ""}" data-label="Valeur">${valueImpact > 0 ? "+" : ""}${compact(valueImpact)} <small>¥</small></td>
                </tr>`;
        }).join("");
        timeline.innerHTML = `
            <div class="nl-table-wrap progress-table-wrap" tabindex="0" aria-label="Journal d’impact, défilable horizontalement">
                <table class="nl-table progress-table">
                    <thead><tr><th scope="col">N°</th><th scope="col">Rencontre</th><th scope="col">Résultat</th><th scope="col" class="is-hl">Note</th><th scope="col">Buts</th><th scope="col">Passes</th><th scope="col">Déf / Drb</th><th scope="col">Valeur</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    }

    function renderTechnicalTimeline(snapshots) {
        if (!snapshots.length) {
            timeline.innerHTML = noSignal(
                "RELEVÉ 00",
                "Aucun relevé",
                "Aucun relevé de fin de saison pour cette période.",
                "is-compact"
            );
            return;
        }

        const rows = snapshots.slice().reverse().map((snapshot, reverseIndex) => {
            const index = snapshots.length - reverseIndex - 1;
            const overall = data.calculateTechnicalOverall?.(snapshot.technical);
            return `
                <tr class="progress-technical-entry">
                    <td class="nl-num progress-technical-entry-index">${String(index + 1).padStart(2, "0")}</td>
                    <td class="progress-technical-entry-head"><small>${escapeHtml(snapshot.date || "DATE NON RENSEIGNÉE")}</small><strong class="nl-strong">${escapeHtml(technicalSnapshotLabel(snapshot, index))}</strong></td>
                    <td class="is-hl" data-label="Global">${overall ?? "N/A"}</td>
                    ${technicalStats.map(stat => `<td data-label="${stat.key === "position" ? "Position" : stat.label}">${snapshot.technical?.[stat.key] ?? "N/A"}</td>`).join("")}
                </tr>`;
        }).join("");
        timeline.innerHTML = `
            <div class="nl-table-wrap progress-table-wrap" tabindex="0" aria-label="Journal des révisions, défilable horizontalement">
                <table class="nl-table progress-table is-technical">
                    <thead><tr><th scope="col">N°</th><th scope="col">Relevé</th><th scope="col" class="is-hl">Global</th>${technicalStats.map(stat => `<th scope="col">${stat.key === "position" ? "Position" : stat.label}</th>`).join("")}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    }

    function updateModeInterface() {
        const technicalMode = chartMode === "technical";
        valueModeButton?.classList.toggle("is-active", !technicalMode);
        valueModeButton?.setAttribute("aria-selected", String(!technicalMode));
        technicalModeButton?.classList.toggle("is-active", technicalMode);
        technicalModeButton?.setAttribute("aria-selected", String(technicalMode));

        chartEyebrow.textContent = technicalMode ? "Évolution des notes // Dossiers officiels" : "Courbe cumulée // Valeur marchande";
        chartTitle.innerHTML = technicalMode ? "Progression <em>technique</em>" : "Trajectoire <em>de valeur</em>";
        chartCaption.textContent = technicalMode
            ? "Un dossier officiel est ajouté uniquement après la clôture d’une saison."
            : "Valeur générée par les matchs enregistrés.";
        timelineEyebrow.textContent = technicalMode ? "Journal des révisions // Fin de saison" : "Journal d’impact // Rencontres";
        timelineTitle.innerHTML = technicalMode ? "Relevé <em>par relevé</em>" : "Match <em>par match</em>";
        timelineCaption.textContent = technicalMode
            ? "Les dernières évolutions techniques apparaissent en premier."
            : "Les entrées les plus récentes apparaissent en premier.";
    }

    function render() {
        renderSelector();
        updateModeInterface();
        const player = players.find(item => item.name === selectedPlayerName);
        if (!player) {
            renderEmptyState();
            return;
        }

        chartPanel.hidden = false;
        timelinePanel.hidden = false;
        const entries = playerPerformances(player);
        const technicalSnapshots = technicalHistoryOf(player);
        renderProfile(player, entries);
        if (chartMode === "technical") {
            renderTechnicalChart(player, technicalSnapshots);
            renderTechnicalTimeline(technicalSnapshots);
        } else {
            renderChart(player, entries);
            renderTimeline(player, entries);
        }
    }

    playerGrid.addEventListener("click", event => {
        const button = event.target.closest("[data-progress-player]");
        if (!button) return;
        selectedPlayerName = selectedPlayerName === button.dataset.progressPlayer
            ? null
            : button.dataset.progressPlayer;
        render();
    });
    resetButton.addEventListener("click", () => {
        selectedPlayerName = null;
        render();
    });
    seasonSelect.addEventListener("change", render);
    valueModeButton?.addEventListener("click", () => {
        chartMode = "value";
        render();
    });
    technicalModeButton?.addEventListener("click", () => {
        chartMode = "technical";
        render();
    });
    renderHero();
    render();
    data.discordAvatarReady?.then(() => {
        renderHero();
        render();
    }).catch(() => {});
});
