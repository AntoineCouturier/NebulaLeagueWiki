document.addEventListener("DOMContentLoaded", () => {
    const data = window.NEBULA_DATA || {};
    const players = data.players || [];
    const clubs = data.clubs || [];
    const matches = data.matches || [];
    const playerGrid = document.getElementById("hallPlayers");
    const clubGrid = document.getElementById("hallClubs");

    if (!playerGrid || !clubGrid) return;

    const escapeHtml = value => String(value ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const compact = value => new Intl.NumberFormat("fr-FR", {
        notation: "compact",
        maximumFractionDigits: 2
    }).format(Number(value || 0));
    const clubOf = player => data.getClub?.(player.club) || { name: player.club, color: "#52dcff" };

    function valueEarned(match, performance) {
        const tier = (data.marketValueTiers || []).find(item => item.key === (match.valueTier || match.category))
            || { multiplier: 1, victory: 0 };
        const actions = Object.fromEntries((data.marketValueActions || []).map(action => [action.key, action]));
        const multiplier = Number(tier.multiplier || 1);

        return Math.round(
            (performance.won ? Number(tier.victory || 0) : 0)
            + performance.goals * Number(actions.buts?.base || 0) * multiplier
            + performance.assists * Number(actions.passes?.base || 0) * multiplier
            + performance.defenses * Number(actions.def?.base || 0) * multiplier
            + performance.dribbles * Number(actions.dribbles?.base || 0) * multiplier
            + performance.mvp * Number(actions.mvp?.base || 0) * multiplier
        );
    }

    const performances = matches.flatMap(match => players.flatMap(player => {
        const performance = data.getPlayerMatchPerformance?.(match, player.name);
        if (!performance) return [];
        return [{
            player,
            club: clubOf(player),
            match,
            performance,
            valueEarned: valueEarned(match, performance)
        }];
    }));

    function singleMatchLeader(metric) {
        const ranked = performances.slice().sort((a, b) =>
            Number(metric(b) || 0) - Number(metric(a) || 0)
            || Number(b.performance.note || 0) - Number(a.performance.note || 0)
            || a.player.name.localeCompare(b.player.name, "fr")
        );
        if (!ranked.length) return null;
        const metricValue = Number(metric(ranked[0]) || 0);
        return metricValue > 0 ? { ...ranked[0], metricValue } : null;
    }

    function matchLabel(item) {
        const home = data.getClub?.(item.match.home);
        const away = data.getClub?.(item.match.away);
        return `${home?.shortName || home?.name || item.match.home} ${item.match.scoreHome}–${item.match.scoreAway} ${away?.shortName || away?.name || item.match.away}`;
    }

    function recordCard(label, code, metric, formatter, accent) {
        const item = singleMatchLeader(metric);
        if (!item) {
            return `
                <article class="hall-player hall-player-empty" style="--card-accent:${accent}">
                    <div class="legacy-empty"><span>${escapeHtml(code)} // ${escapeHtml(label)}</span><br>NON ATTRIBUÉ</div>
                </article>`;
        }

        return `
            <a class="hall-player" href="${escapeHtml(data.playerPageHref?.(item.player) || "players.html")}" style="--card-accent:${accent}">
                <div class="hall-player-image"><img src="${escapeHtml(item.player.avatar)}" alt="${escapeHtml(item.player.name)}"></div>
                <div class="hall-player-body">
                    <span>${escapeHtml(code)} // ${escapeHtml(label)}</span>
                    <h3>${escapeHtml(item.player.name)}</h3>
                    <small>${escapeHtml(item.club.name)} · ${escapeHtml(matchLabel(item))}</small>
                    <div class="hall-player-value"><span>EXPLOIT EN UN MATCH</span><strong>${escapeHtml(formatter(item.metricValue))}</strong></div>
                </div>
            </a>`;
    }

    function renderPlayers() {
        playerGrid.innerHTML = [
            recordCard("PLUS DE BUTS EN UN MATCH", "GLS", item => item.performance.goals, value => `${value} BUTS`, "#ff5368"),
            recordCard("PLUS DE PASSES D. EN UN MATCH", "AST", item => item.performance.assists, value => `${value} PASSES`, "#52dcff"),
            recordCard("PLUS DE DÉFENSES EN UN MATCH", "DEF", item => item.performance.defenses, value => `${value} DÉF.`, "#48ef9a"),
            recordCard("PLUS DE DRIBBLES EN UN MATCH", "DRB", item => item.performance.dribbles, value => `${value} DRB.`, "#c46cff"),
            recordCard("PLUS DE VALEUR EN UN MATCH", "VAL", item => item.valueEarned, value => `${compact(value)} ¥`, "#ffd454")
        ].join("");
    }

    function renderClubs() {
        const clubRows = clubs.map(club => ({
            club,
            titles: data.getClubTitleCount?.(club.key) || 0,
            stats: data.getClubMatchStats?.(club.key, null) || {}
        })).sort((a, b) =>
            b.titles - a.titles
            || Number(b.stats.points || 0) - Number(a.stats.points || 0)
            || a.club.name.localeCompare(b.club.name, "fr")
        );

        clubGrid.innerHTML = clubRows.map((row, index) => `
            <a class="hall-club" href="${escapeHtml(data.clubPageHref?.(row.club.key) || "club.html")}" style="--club-accent:${row.club.color}">
                <img src="${escapeHtml(row.club.logo)}" alt="">
                <div>
                    <small>RANG ${String(index + 1).padStart(2, "0")} · ${row.titles} NCL</small>
                    <h3>${escapeHtml(row.club.name)}</h3>
                    <strong>${row.stats.points || 0} PTS · ${row.stats.w || 0} VICTOIRES</strong>
                </div>
            </a>`).join("");
    }

    function render() {
        renderPlayers();
        renderClubs();
    }

    render();
    data.discordAvatarReady?.then(render).catch(() => {});
});
