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
    let selectedPlayerName = null;

    if (!selectionSlot || !playerGrid || !players.length) return;

    const escapeHtml = value => String(value ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const compact = value => new Intl.NumberFormat("fr-FR", {
        notation: "compact",
        maximumFractionDigits: 2
    }).format(Number(value || 0));
    const playerClub = player => data.getClub?.(player.club) || { name: player.club, color: "#52dcff" };

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
        const max = Math.max(...values, 1);
        const width = 1200;
        const height = 280;
        const padding = 24;
        const points = values.map((value, index) => {
            const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
            const y = height - padding - (value / max) * (height - padding * 2);
            return { x, y, value };
        });
        const polyline = points.map(point => `${point.x},${point.y}`).join(" ");
        const area = `${padding},${height - padding} ${polyline} ${width - padding},${height - padding}`;
        const horizontalGrid = [0.25, 0.5, 0.75, 1].map(level => {
            const y = height - padding - level * (height - padding * 2);
            return `<line class="grid" x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}"/>`;
        }).join("");

        chart.innerHTML = `
            <svg class="progress-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Progression cumulée de valeur">
                <defs><linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#52dcff" stop-opacity=".25"/><stop offset="1" stop-color="#52dcff" stop-opacity="0"/></linearGradient></defs>
                ${horizontalGrid}
                <polygon class="area" points="${area}"/>
                <polyline class="path" points="${polyline}"/>
                ${points.map(point => `<circle class="node" cx="${point.x}" cy="${point.y}" r="5"><title>${compact(point.value)} ¥</title></circle>`).join("")}
            </svg>
            <div class="progress-chart-labels"><span>DÉPART · ${compact(values[0])} ¥</span><span>${entries.length} MATCH${entries.length > 1 ? "S" : ""}</span><span>IMPACT · ${compact(values.at(-1))} ¥</span></div>`;
    }

    function renderTimeline(player, entries) {
        if (!entries.length) {
            timeline.innerHTML = `<div class="legacy-empty">LE JOURNAL D’IMPACT EST EN ATTENTE DE DONNÉES.</div>`;
            return;
        }
        timeline.innerHTML = entries.slice().reverse().map(({ match, perf }, index) => {
            const home = data.getClub?.(match.home);
            const away = data.getClub?.(match.away);
            return `
                <article class="progress-entry">
                    <span class="progress-entry-index">${String(entries.length - index).padStart(2, "0")}</span>
                    <div class="progress-entry-match"><small>SAISON ${String(match.season).padStart(2, "0")} · ${escapeHtml(match.date)}</small><strong>${escapeHtml(home?.name || match.home)} ${match.scoreHome}–${match.scoreAway} ${escapeHtml(away?.name || match.away)}</strong></div>
                    <div class="progress-entry-stat"><span>NOTE</span><strong>${perf.note ? perf.note.toFixed(1) : "—"}</strong></div>
                    <div class="progress-entry-stat"><span>BUTS</span><strong>${perf.goals}</strong></div>
                    <div class="progress-entry-stat"><span>PASSES</span><strong>${perf.assists}</strong></div>
                    <div class="progress-entry-stat"><span>DEF / DRB</span><strong>${perf.defenses} / ${perf.dribbles}</strong></div>
                    <div class="progress-entry-stat"><span>VALEUR</span><strong>+${compact(matchValue({ match, perf }))}</strong></div>
                </article>`;
        }).join("");
    }

    function render() {
        renderSelector();
        const player = players.find(item => item.name === selectedPlayerName);
        if (!player) {
            renderEmptyState();
            return;
        }

        chartPanel.hidden = false;
        timelinePanel.hidden = false;
        const entries = playerPerformances(player);
        renderProfile(player, entries);
        renderChart(player, entries);
        renderTimeline(player, entries);
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
    render();
    data.discordAvatarReady?.then(render).catch(() => {});
});
