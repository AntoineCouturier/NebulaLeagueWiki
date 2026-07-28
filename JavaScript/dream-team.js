document.addEventListener("DOMContentLoaded", () => {
    const data = window.NEBULA_DATA || {};
    const players = (data.players || []).filter(player => (data.clubs || []).some(club => club.key === player.club));
    const matches = data.matches || [];
    const seasons = data.seasons || [];
    const pitch = document.getElementById("dreamPitch");
    const dossier = document.getElementById("dreamDossier");
    const bench = document.getElementById("dreamBench");
    const seasonSelect = document.getElementById("dreamSeason");
    const methodLabel = document.getElementById("dreamMethodLabel");
    const formula = document.getElementById("dreamFormula");
    let mode = "season";

    const roles = ["CF", "LW", "RW", "LM", "RM"];
    const positions = {
        CF: { top: 17, left: 50 },
        LW: { top: 39, left: 20 },
        RW: { top: 39, left: 80 },
        LM: { top: 73, left: 31 },
        RM: { top: 73, left: 69 }
    };

    if (!pitch) return;

    const escapeHtml = value => String(value ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const clubOf = player => data.getClub?.(player.club) || { name: player.club, color: "#52dcff", logo: "" };
    seasonSelect.innerHTML = seasons.slice().sort((a, b) => b.number - a.number)
        .map(season => `<option value="${season.number}">Saison ${String(season.number).padStart(2, "0")}</option>`).join("");
    const activeSeason = data.getActiveSeason?.();
    if (activeSeason) seasonSelect.value = String(activeSeason.number);

    function matchScore(player) {
        const seasonMatches = matches.filter(match => Number(match.season) === Number(seasonSelect.value));
        const latestDate = seasonMatches.map(match => match.date).filter(Boolean).sort().at(-1);
        const selectedMatches = mode === "all"
            ? matches
            : mode === "day"
                ? seasonMatches.filter(match => match.date === latestDate)
                : seasonMatches;
        const performances = selectedMatches
            .map(match => data.getPlayerMatchPerformance?.(match, player.name))
            .filter(Boolean);
        if (!performances.length) return null;
        const totals = performances.reduce((sum, perf) => ({
            goals: sum.goals + perf.goals,
            assists: sum.assists + perf.assists,
            defenses: sum.defenses + perf.defenses,
            dribbles: sum.dribbles + perf.dribbles,
            mvp: sum.mvp + perf.mvp,
            wins: sum.wins + (perf.won ? 1 : 0),
            notes: sum.notes + perf.note
        }), { goals: 0, assists: 0, defenses: 0, dribbles: 0, mvp: 0, wins: 0, notes: 0 });
        const average = totals.notes / performances.length;
        return {
            score: average * 10 + totals.goals * 4 + totals.assists * 3 + totals.defenses * 0.35
                + totals.dribbles * 0.25 + totals.mvp * 8 + totals.wins * 2,
            detail: `${performances.length} MJ · ${average.toFixed(1)} MOY.`,
            totals
        };
    }

    function technicalScore(player) {
        const overall = data.calculateTechnicalOverall?.(player.technical);
        if (!Number.isFinite(overall)) return null;
        return { score: overall, detail: `OVR ${overall}`, totals: null };
    }

    function ranking() {
        return players.flatMap(player => {
            const result = mode === "technical" ? technicalScore(player) : matchScore(player);
            return result ? [{ player, ...result }] : [];
        }).sort((a, b) => b.score - a.score || a.player.name.localeCompare(b.player.name, "fr"));
    }

    function selectFive(ranked) {
        return roles.map(role => {
            const entry = ranked.find(item => item.player.position === role);
            return entry ? { role, ...entry } : { role, player: null, score: 0, detail: "EN ATTENTE" };
        });
    }

    function renderPitch(selection) {
        pitch.innerHTML = selection.map(entry => {
            const pos = positions[entry.role];
            if (!entry.player) {
                return `<div class="dream-player" style="top:${pos.top}%;left:${pos.left}%;--player-accent:#45545f"><div><small>${entry.role}</small><strong>POSTE VACANT</strong><span>DONNÉES EN ATTENTE</span></div></div>`;
            }
            const club = clubOf(entry.player);
            return `
                <a class="dream-player" href="${escapeHtml(data.playerPageHref?.(entry.player) || "players.html")}" style="top:${pos.top}%;left:${pos.left}%;--player-accent:${club.color}">
                    <img src="${escapeHtml(entry.player.avatar)}" alt="">
                    <div><small>${entry.role} · ${escapeHtml(club.name)}</small><strong>${escapeHtml(entry.player.name)}</strong><span>${escapeHtml(entry.detail)}</span></div>
                </a>`;
        }).join("");
    }

    function renderDossier(selection) {
        const selected = selection.filter(entry => entry.player);
        dossier.innerHTML = `
            <div class="dream-dossier-title"><small>COMPOSITION SYNCHRONISÉE</small><h2>BEST FIVE</h2></div>
            ${selection.map(entry => {
                const club = entry.player ? clubOf(entry.player) : { logo: "", color: "#45545f" };
                return `<div class="dream-dossier-row" style="--row-accent:${club.color}">
                    ${club.logo ? `<img src="${escapeHtml(club.logo)}" alt="">` : `<span></span>`}
                    <div><small>${entry.role} // ${entry.player ? escapeHtml(club.name) : "NON ATTRIBUÉ"}</small><strong>${escapeHtml(entry.player?.name || "POSTE VACANT")}</strong></div>
                    <span>${entry.player ? Math.round(entry.score) : "—"}</span>
                </div>`;
            }).join("")}
            <div class="dream-dossier-title"><small>INDICE COLLECTIF</small><h2>${selected.length ? Math.round(selected.reduce((sum, entry) => sum + entry.score, 0) / selected.length) : "—"}</h2></div>`;
    }

    function renderBench(ranked, selection) {
        const selectedNames = new Set(selection.filter(entry => entry.player).map(entry => entry.player.name));
        const substitutes = ranked.filter(entry => !selectedNames.has(entry.player.name)).slice(0, 3);
        bench.innerHTML = substitutes.length ? substitutes.map((entry, index) => {
            const club = clubOf(entry.player);
            return `
                <a class="dream-bench-player" href="${escapeHtml(data.playerPageHref?.(entry.player) || "players.html")}" style="--bench-accent:${club.color}">
                    <img src="${escapeHtml(entry.player.avatar)}" alt="">
                    <div><small>OPTION ${String(index + 1).padStart(2, "0")} · ${entry.player.position}</small><strong>${escapeHtml(entry.player.name)}</strong><span>${escapeHtml(entry.detail)}</span></div>
                </a>`;
        }).join("") : `<div class="legacy-empty">AUCUN REMPLAÇANT ÉLIGIBLE POUR CETTE SÉLECTION.</div>`;
    }

    function render() {
        const ranked = ranking();
        const selection = selectFive(ranked);
        renderPitch(selection);
        renderDossier(selection);
        renderBench(ranked, selection);
        seasonSelect.disabled = !["season", "day"].includes(mode);
        methodLabel.textContent = mode === "technical"
            ? "NOTE TECHNIQUE"
            : mode === "all"
                ? "IMPACT HISTORIQUE"
                : mode === "day"
                    ? "DERNIÈRE JOURNÉE"
                    : "IMPACT EN MATCH";
        formula.textContent = mode === "technical"
            ? "La note globale moyenne des six statistiques techniques détermine le classement à chaque poste."
            : "Indice = note moyenne × 10, buts × 4, passes × 3, défenses × 0,35, dribbles × 0,25, MVP × 8 et victoires × 2.";
    }

    document.getElementById("dreamModes").addEventListener("click", event => {
        const button = event.target.closest("[data-dream-mode]");
        if (!button) return;
        mode = button.dataset.dreamMode;
        document.querySelectorAll("[data-dream-mode]").forEach(item => item.classList.toggle("is-active", item === button));
        render();
    });
    seasonSelect.addEventListener("change", render);

    if (!matches.some(match => Number(match.season) === Number(seasonSelect.value))) {
        mode = "technical";
        document.querySelectorAll("[data-dream-mode]").forEach(button => (
            button.classList.toggle("is-active", button.dataset.dreamMode === "technical")
        ));
    }

    render();
    data.discordAvatarReady?.then(render).catch(() => {});
});
