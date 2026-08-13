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
    let selectedPlayerName = null;
    let chartMode = "value";

    if (!selectionSlot || !playerGrid || !players.length) return;

    const escapeHtml = value => String(value ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const compact = value => new Intl.NumberFormat("fr-FR", {
        notation: "compact",
        maximumFractionDigits: 2
    }).format(Number(value || 0));
    const playerClub = player => data.getClub?.(player.club) || { name: player.club, color: "#52dcff" };
    const technicalStats = [
        { key: "defense", label: "DÉFENSE", color: "#a8ff25" },
        { key: "passe", label: "PASSE", color: "#52dcff" },
        { key: "dribble", label: "DRIBBLE", color: "#c46cff" },
        { key: "tir", label: "TIR", color: "#ff5368" },
        { key: "offense", label: "OFFENSE", color: "#ffd454" },
        { key: "position", label: "POSITIONNEMENT", color: "#66edf2" }
    ];
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

    function renderSelector() {
        const selected = players.find(player => player.name === selectedPlayerName);

        if (!selected) {
            selectionSlot.classList.add("is-empty");
            selectionSlot.style.removeProperty("--player-accent");
            selectionSlot.innerHTML = `
                <span class="progress-slot-code">PROFIL ANALYSÉ</span>
                <div class="progress-slot-placeholder" aria-hidden="true"></div>
                <div><small>EMPLACEMENT LIBRE</small><strong>SÉLECTION REQUISE</strong><span>Choisissez un joueur dans l’index ci-dessous.</span></div>`;
        } else {
            const club = playerClub(selected);
            const overall = data.calculateTechnicalOverall?.(selected.technical);
            selectionSlot.classList.remove("is-empty");
            selectionSlot.style.setProperty("--player-accent", club.color);
            selectionSlot.innerHTML = `
                <span class="progress-slot-code">PROFIL ANALYSÉ</span>
                <img src="${escapeHtml(selected.avatar)}" alt="">
                <div><small>${escapeHtml(club.name)} · ${escapeHtml(selected.position)}</small><strong>${escapeHtml(selected.name)}</strong><span>NOTE GLOBALE ${overall ?? "—"} · DOSSIER SYNCHRONISÉ</span></div>
                <a href="${escapeHtml(data.playerPageHref?.(selected) || "players.html")}" aria-label="Ouvrir la fiche de ${escapeHtml(selected.name)}">↗</a>`;
        }

        playerGrid.innerHTML = players.map((player, index) => {
            const club = playerClub(player);
            const isSelected = player.name === selectedPlayerName;
            return `
                <button type="button" class="progress-entity-card${isSelected ? " is-selected" : ""}"
                    data-progress-player="${escapeHtml(player.name)}" style="--entity-color:${club.color}">
                    <span>${isSelected ? "✓" : String(index + 1).padStart(2, "0")}</span>
                    <img src="${escapeHtml(player.avatar)}" alt="">
                    <div><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(club.name)} · ${escapeHtml(player.position)}</small></div>
                    <i></i>
                </button>`;
        }).join("");
    }

    function renderEmptyState() {
        profile.style.removeProperty("--player-accent");
        profile.innerHTML = `
            <div class="progress-analysis-empty">
                <span>02</span>
                <div><small>ANALYSE EN ATTENTE</small><h2>AUCUN JOUEUR SÉLECTIONNÉ</h2><p>Choisissez un profil pour afficher sa progression, sa valeur et son journal de matchs.</p></div>
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
        const overall = data.calculateTechnicalOverall?.(player.technical);
        const currentValue = data.getPlayerMarketValue?.(player.name) || 0;
        const averageNote = totals.matches ? totals.note / totals.matches : 0;
        profile.style.setProperty("--player-accent", club.color);
        profile.innerHTML = `
            <div class="progress-identity">
                <div class="progress-avatar">
                    <img src="${escapeHtml(player.avatar)}" alt="${escapeHtml(player.name)}">
                    <span>${overall ?? "—"}</span>
                </div>
                <div class="progress-summary">
                    <div class="progress-summary-head">
                        <div><small>01 // ${escapeHtml(club.name)} · ${escapeHtml(player.position)}</small><h2>${escapeHtml(player.name)}</h2></div>
                        <a href="${escapeHtml(data.playerPageHref?.(player) || "players.html")}">OUVRIR LA FICHE ↗</a>
                    </div>
                    <div class="progress-metrics">
                        <div style="--metric-accent:${club.color}"><span>VALEUR ACTUELLE</span><strong>${compact(currentValue)} ¥</strong></div>
                        <div><span>MATCHS</span><strong>${String(totals.matches).padStart(2, "0")}</strong></div>
                        <div style="--metric-accent:#ff5368"><span>BUTS</span><strong>${totals.goals}</strong></div>
                        <div style="--metric-accent:#52dcff"><span>PASSES D.</span><strong>${totals.assists}</strong></div>
                        <div style="--metric-accent:#a8ff25"><span>DÉFENSES</span><strong>${totals.defenses}</strong></div>
                        <div style="--metric-accent:#c46cff"><span>DRIBBLES</span><strong>${totals.dribbles}</strong></div>
                        <div style="--metric-accent:#ffd454"><span>NOTE MOY.</span><strong>${averageNote ? averageNote.toFixed(1) : "—"}</strong></div>
                        <div><span>MVP</span><strong>${totals.mvp}</strong></div>
                    </div>
                </div>
            </div>`;
    }

    function renderChart(player, entries) {
        if (!entries.length) {
            chart.innerHTML = `<div class="legacy-empty">AUCUNE TRAJECTOIRE DISPONIBLE POUR CETTE PÉRIODE.<br>ELLE APPARAÎTRA APRÈS LE PREMIER MATCH DU JOUEUR.</div>`;
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
                        <defs><linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#52dcff" stop-opacity=".25"/><stop offset="1" stop-color="#52dcff" stop-opacity="0"/></linearGradient></defs>
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
            chart.innerHTML = `<div class="legacy-empty">AUCUN RELEVÉ TECHNIQUE OFFICIEL POUR CETTE PÉRIODE.<br>UN DOSSIER APPARAÎTRA APRÈS LA CLÔTURE D’UNE SAISON.</div>`;
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
                    <header class="progress-revision-head">
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
                    </header>
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
                                    <span class="progress-revision-meter"><i style="width:${hasCurrent ? currentValue : 0}%"></i></span>
                                </div>`;
                        }).join("")}
                    </div>
                </article>`;
        }).join("");

        chart.innerHTML = `
            <div class="progress-revision-summary">
                <span>${snapshots.length} DOSSIER${snapshots.length > 1 ? "S" : ""} ARCHIVÉ${snapshots.length > 1 ? "S" : ""}</span>
                <strong>Chaque carte compare ses notes au relevé précédent.</strong>
            </div>
            <div class="progress-revision-scroll" tabindex="0" aria-label="Dossiers techniques défilables horizontalement">
                <div class="progress-revision-track" style="width:${trackWidth}px;grid-template-columns:repeat(${snapshots.length}, minmax(0, 1fr))">
                    ${cards}
                </div>
            </div>
            ${snapshots.length > 2 ? `<div class="progress-scroll-hint" aria-hidden="true"><span>↔</span> FAITES DÉFILER LES DOSSIERS</div>` : ""}`;
    }

    function renderTimeline(player, entries) {
        if (!entries.length) {
            timeline.innerHTML = `<div class="legacy-empty">LE JOURNAL D’IMPACT EST EN ATTENTE DE DONNÉES.</div>`;
            return;
        }
        timeline.innerHTML = entries.slice().reverse().map(({ match, perf }, index) => {
            const home = data.getClub?.(match.home);
            const away = data.getClub?.(match.away);
            const valueImpact = matchValue({ match, perf });
            return `
                <article class="progress-entry">
                    <span class="progress-entry-index">${String(entries.length - index).padStart(2, "0")}</span>
                    <div class="progress-entry-match"><small>SAISON ${String(match.season).padStart(2, "0")} · ${escapeHtml(match.date)}</small><strong>${escapeHtml(home?.name || match.home)} ${match.scoreHome}–${match.scoreAway} ${escapeHtml(away?.name || match.away)}</strong></div>
                    <div class="progress-entry-stat"><span>NOTE</span><strong>${perf.note ? perf.note.toFixed(1) : "—"}</strong></div>
                    <div class="progress-entry-stat"><span>BUTS</span><strong>${perf.goals}</strong></div>
                    <div class="progress-entry-stat"><span>PASSES</span><strong>${perf.assists}</strong></div>
                    <div class="progress-entry-stat"><span>DEF / DRB</span><strong>${perf.defenses} / ${perf.dribbles}</strong></div>
                    <div class="progress-entry-stat"><span>VALEUR</span><strong>${valueImpact > 0 ? "+" : ""}${compact(valueImpact)}</strong></div>
                </article>`;
        }).join("");
    }

    function renderTechnicalTimeline(snapshots) {
        if (!snapshots.length) {
            timeline.innerHTML = `<div class="legacy-empty">AUCUN RELEVÉ DE FIN DE SAISON POUR CETTE PÉRIODE.</div>`;
            return;
        }

        timeline.innerHTML = snapshots.slice().reverse().map((snapshot, reverseIndex) => {
            const index = snapshots.length - reverseIndex - 1;
            const overall = data.calculateTechnicalOverall?.(snapshot.technical);
            return `
                <article class="progress-technical-entry">
                    <span class="progress-technical-entry-index">${String(index + 1).padStart(2, "0")}</span>
                    <div class="progress-technical-entry-head">
                        <small>${escapeHtml(snapshot.date || "DATE NON RENSEIGNÉE")}</small>
                        <strong>${escapeHtml(technicalSnapshotLabel(snapshot, index))}</strong>
                    </div>
                    <div class="progress-technical-entry-stat" style="--stat-color:#f2f5f7"><span>GLOBAL</span><strong>${overall ?? "N/A"}</strong></div>
                    ${technicalStats.map(stat => `
                        <div class="progress-technical-entry-stat" style="--stat-color:${stat.color}">
                            <span>${stat.label}</span><strong>${snapshot.technical?.[stat.key] ?? "N/A"}</strong>
                        </div>`).join("")}
                </article>`;
        }).join("");
    }

    function updateModeInterface() {
        const technicalMode = chartMode === "technical";
        valueModeButton?.classList.toggle("is-active", !technicalMode);
        valueModeButton?.setAttribute("aria-selected", String(!technicalMode));
        technicalModeButton?.classList.toggle("is-active", technicalMode);
        technicalModeButton?.setAttribute("aria-selected", String(technicalMode));

        chartEyebrow.textContent = technicalMode ? "ÉVOLUTION DES NOTES" : "COURBE CUMULÉE";
        chartTitle.textContent = technicalMode ? "PROGRESSION TECHNIQUE" : "TRAJECTOIRE DE VALEUR";
        chartCaption.textContent = technicalMode
            ? "Un dossier officiel est ajouté uniquement après la clôture d’une saison."
            : "Valeur générée par les matchs enregistrés.";
        timelineEyebrow.textContent = technicalMode ? "JOURNAL DES RÉVISIONS" : "JOURNAL D’IMPACT";
        timelineTitle.textContent = technicalMode ? "RELEVÉ PAR RELEVÉ" : "MATCH PAR MATCH";
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
    render();
    data.discordAvatarReady?.then(render).catch(() => {});
});
