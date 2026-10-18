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
    const heroIndex = document.querySelector("[data-dream-hero-index]");
    const heroFilled = document.querySelector("[data-dream-hero-filled]");
    const heroMode = document.querySelector("[data-dream-osd-mode]");
    const pitchMode = document.querySelector("[data-dream-pitch-mode]");
    const formulaTerms = document.querySelector("[data-dream-formula-terms]");
    const captainLabel = document.querySelector("[data-dream-captain]");
    let mode = "season";

    const roles = ["CF", "LW", "RW", "LM", "RM"];
    const roleLabels = {
        CF: "Avant-centre",
        LW: "Ailier gauche",
        RW: "Ailier droit",
        LM: "Milieu gauche",
        RM: "Milieu droit"
    };
    // Vue tactique : demi-terrain offensif, but en haut (pourcentages du terrain)
    const positions = {
        CF: { top: 23, left: 50 },
        LW: { top: 47, left: 17 },
        RW: { top: 47, left: 83 },
        LM: { top: 77, left: 33 },
        RM: { top: 77, left: 67 }
    };
    // Liaisons tactiques dessinées entre les cinq postes
    const links = [["CF", "LW"], ["CF", "RW"], ["LW", "LM"], ["RW", "RM"], ["LM", "RM"], ["CF", "LM"], ["CF", "RM"]];
    const matchTerms = [
        ["×10", "Note moyenne"],
        ["×4", "Buts"],
        ["×3", "Passes"],
        ["×0,35", "Défenses"],
        ["×0,25", "Dribbles"],
        ["×8", "MVP"],
        ["×2", "Victoires"]
    ];
    const technicalTerms = [
        ["1/6", "Défense"],
        ["1/6", "Passe"],
        ["1/6", "Dribble"],
        ["1/6", "Tir"],
        ["1/6", "Offense"],
        ["1/6", "Position"]
    ];

    if (!pitch) return;

    const escapeHtml = value => String(value ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const pad = (value, size = 2) => String(value).padStart(size, "0");
    const clubOf = player => data.getClub?.(player.club) || { name: player.club, color: "var(--blue-2)", logo: "" };
    const clubShort = club => club.shortName || club.name || "";
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

    // Unité affichée à côté d'un indice : note technique ou indice de match
    const scoreUnit = () => (mode === "technical" ? "OVR" : "IDX");

    function periodLabel() {
        const seasonCode = `S${pad(seasonSelect.value || 1)}`;
        if (mode === "technical") return "NOTE TECHNIQUE";
        if (mode === "all") return "HISTORIQUE // TOUTES SAISONS";
        if (mode === "day") return `DERNIÈRE JOURNÉE // ${seasonCode}`;
        return `SAISON ${pad(seasonSelect.value || 1)}`;
    }

    function captainOf(selection) {
        return selection.filter(entry => entry.player)
            .reduce((best, entry) => (!best || entry.score > best.score ? entry : best), null);
    }

    function renderLinks(selection) {
        const filled = new Set(selection.filter(entry => entry.player).map(entry => entry.role));
        return `<svg class="dream-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            ${links.map(([from, to]) => {
                const a = positions[from];
                const b = positions[to];
                const live = filled.has(from) && filled.has(to);
                return `<line class="${live ? "is-live" : "is-cut"}" x1="${a.left}" y1="${a.top}" x2="${b.left}" y2="${b.top}" vector-effect="non-scaling-stroke"></line>`;
            }).join("")}
        </svg>`;
    }

    function renderPitch(selection) {
        const captain = captainOf(selection);
        const tiles = selection.map((entry, index) => {
            const pos = positions[entry.role];
            const place = `top:${pos.top}%;left:${pos.left}%`;
            const cam = `CAM ${pad(index + 21)}`;
            if (!entry.player) {
                return `
                <div class="dream-player nl-feed is-offline is-vacant" style="${place}" data-role="${entry.role}">
                    <span class="nl-feed-mire" data-label="VACANT" aria-hidden="true"></span>
                    <span class="nl-feed-osd"><span><b>${entry.role}</b></span><span class="rec is-off">HORS LIGNE</span></span>
                    <span class="nl-feed-caption"><small>${roleLabels[entry.role]}</small><b>Poste vacant</b></span>
                </div>`;
            }
            const club = clubOf(entry.player);
            const isCaptain = entry === captain;
            return `
                <a class="dream-player nl-feed${isCaptain ? " is-locked is-captain" : ""}" href="${escapeHtml(data.playerPageHref?.(entry.player) || "players.html")}" style="${place};--club:${escapeHtml(club.color)}" data-role="${entry.role}" aria-label="${escapeHtml(`${roleLabels[entry.role]} : ${entry.player.name}, ${club.name}, ${Math.round(entry.score)} ${scoreUnit()}${isCaptain ? ", capitaine" : ""}`)}">
                    <img class="nl-feed-img" src="${escapeHtml(entry.player.avatar)}" alt="">
                    <span class="nl-feed-lock" aria-hidden="true"></span>
                    <span class="nl-feed-osd">
                        <span class="dream-player-role">${club.logo ? `<img src="${escapeHtml(club.logo)}" alt="">` : ""}<b>${entry.role}</b></span>
                        ${isCaptain ? `<span class="dream-player-cap">CAP</span>` : `<span class="dream-player-cam">${cam}</span>`}
                    </span>
                    <span class="nl-feed-figure dream-player-score">${Math.round(entry.score)}</span>
                    <span class="nl-feed-caption"><small>${roleLabels[entry.role]}</small><b>${escapeHtml(entry.player.name)}</b></span>
                    <span class="dream-club-bar" aria-hidden="true"></span>
                </a>`;
        }).join("");
        const empty = selection.some(entry => entry.player) ? "" : `
            <div class="dream-pitch-alert">
                <span class="nl-nosignal-code">SIGNAL 00</span>
                <strong>Aucune donnée sur cette période</strong>
                <p>Aucun match enregistré : passez sur le canal Technique pour une sélection sur fiches.</p>
            </div>`;
        pitch.innerHTML = renderLinks(selection) + tiles + empty;
        pitch.classList.toggle("is-empty", Boolean(empty));
    }

    function renderDossier(selection) {
        const selected = selection.filter(entry => entry.player);
        const captain = captainOf(selection);
        const best = Math.max(1, ...selected.map(entry => entry.score));
        const index = selected.length ? Math.round(selected.reduce((sum, entry) => sum + entry.score, 0) / selected.length) : null;
        const indexMeter = index === null ? 0 : Math.min(100, index);
        dossier.innerHTML = `
            <div class="dream-dossier-screen">
                <div class="osd dream-dossier-osd">
                    <span><span class="rec${selected.length ? "" : " is-off"}">${selected.length ? "REC" : "VEILLE"}</span> CAM 12-B <b>//</b> FICHE</span>
                    <span><b>${pad(selected.length)}</b>/05 POSTES</span>
                </div>
                <div class="dream-dossier-title">
                    <small>Composition synchronisée</small>
                    <h2>Best five</h2>
                    <p>${escapeHtml(periodLabel())}</p>
                </div>
                <ol class="dream-dossier-list">
                    ${selection.map(entry => {
                        if (!entry.player) {
                            return `<li><div class="dream-dossier-row is-vacant">
                                <span class="dream-dossier-pos">${entry.role}</span>
                                <span class="dream-dossier-crest" aria-hidden="true"></span>
                                <span class="dream-dossier-id"><strong>Poste vacant</strong><small>${roleLabels[entry.role]} // Non attribué</small></span>
                                <span class="dream-dossier-score"><b>—</b><span class="nl-vu" style="--v:0" aria-hidden="true"></span></span>
                            </div></li>`;
                        }
                        const club = clubOf(entry.player);
                        const score = Math.round(entry.score);
                        const isCaptain = entry === captain;
                        return `<li><a class="dream-dossier-row${isCaptain ? " is-captain" : ""}" href="${escapeHtml(data.playerPageHref?.(entry.player) || "players.html")}" style="--club:${escapeHtml(club.color)}">
                            <span class="dream-dossier-pos">${entry.role}</span>
                            ${club.logo ? `<img class="dream-dossier-crest" src="${escapeHtml(club.logo)}" alt="">` : `<span class="dream-dossier-crest" aria-hidden="true"></span>`}
                            <span class="dream-dossier-id"><strong>${escapeHtml(entry.player.name)}${isCaptain ? ` <em>CAP</em>` : ""}</strong><small>${escapeHtml(clubShort(club))} // ${escapeHtml(entry.detail)}</small></span>
                            <span class="dream-dossier-score"><b>${score}</b><span class="nl-vu" style="--v:${Math.round((entry.score / best) * 100)}" aria-hidden="true"></span></span>
                        </a></li>`;
                    }).join("")}
                </ol>
                <div class="dream-dossier-index${index === null ? " is-empty" : ""}">
                    <div class="dream-dossier-index-copy">
                        <small>Indice collectif</small>
                        <p>${index === null ? "En attente de données" : `Moyenne des ${pad(selected.length)} titulaires`}</p>
                    </div>
                    <strong>${index === null ? "—" : index}<small>${scoreUnit()}</small></strong>
                    <span class="nl-vu nl-vu--max" style="--v:${indexMeter}" role="meter" aria-label="Indice collectif" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${indexMeter}"></span>
                </div>
            </div>`;
        return { index, filled: selected.length, captain };
    }

    function renderBench(ranked, selection) {
        const selectedNames = new Set(selection.filter(entry => entry.player).map(entry => entry.player.name));
        const substitutes = ranked.filter(entry => !selectedNames.has(entry.player.name)).slice(0, 3);
        if (!substitutes.length) {
            bench.innerHTML = `
                <div class="nl-nosignal dream-bench-empty">
                    <span class="nl-nosignal-code">BANC 00</span>
                    <strong>Aucun remplaçant éligible</strong>
                    <p>Aucun remplaçant éligible pour cette sélection.</p>
                </div>`;
            return;
        }
        const filled = substitutes.map((entry, index) => {
            const club = clubOf(entry.player);
            const sub = mode === "technical" ? roleLabels[entry.player.position] || entry.player.position : entry.detail;
            return `
                <a class="dream-bench-player nl-feed" href="${escapeHtml(data.playerPageHref?.(entry.player) || "players.html")}" style="--club:${escapeHtml(club.color)}">
                    <img class="nl-feed-img" src="${escapeHtml(entry.player.avatar)}" alt="">
                    <span class="nl-feed-lock" aria-hidden="true"></span>
                    <span class="nl-feed-osd"><span>CAM ${pad(index + 31)} <b>//</b> OPTION ${pad(index + 1)}</span><span class="dream-bench-pos">${escapeHtml(entry.player.position)}</span></span>
                    <span class="nl-feed-figure">${Math.round(entry.score)}<small>${scoreUnit()}</small></span>
                    <span class="nl-feed-caption"><small>${escapeHtml(clubShort(club))} // ${escapeHtml(sub)}</small><b>${escapeHtml(entry.player.name)}</b></span>
                    <span class="dream-club-bar" aria-hidden="true"></span>
                </a>`;
        });
        const missing = Array.from({ length: 3 - substitutes.length }, (_, offset) => {
            const index = substitutes.length + offset;
            return `
                <div class="dream-bench-player nl-feed is-offline">
                    <span class="nl-feed-mire" data-label="PAS DE SIGNAL" aria-hidden="true"></span>
                    <span class="nl-feed-osd"><span>CAM ${pad(index + 31)} <b>//</b> OPTION ${pad(index + 1)}</span><span class="rec is-off">HORS LIGNE</span></span>
                    <span class="nl-feed-caption"><small>Option ${pad(index + 1)} // Aucun profil</small><b>Non disponible</b></span>
                </div>`;
        });
        bench.innerHTML = filled.concat(missing).join("");
    }

    function renderFormulaTerms() {
        if (!formulaTerms) return;
        const terms = mode === "technical" ? technicalTerms : matchTerms;
        formulaTerms.innerHTML = terms.map(([value, label]) => `<li><b>${value}</b><span>${label}</span></li>`).join("");
    }

    function render() {
        const ranked = ranking();
        const selection = selectFive(ranked);
        renderPitch(selection);
        const summary = renderDossier(selection);
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
        renderFormulaTerms();
        if (heroIndex) heroIndex.innerHTML = summary.index === null ? "—" : `${summary.index}<small>${scoreUnit()}</small>`;
        if (heroFilled) heroFilled.innerHTML = `${pad(summary.filled)}<small>/05</small>`;
        if (heroMode) heroMode.innerHTML = `MÉTHODE <b>${escapeHtml(methodLabel.textContent)}</b>`;
        if (pitchMode) pitchMode.textContent = periodLabel();
        if (captainLabel) {
            captainLabel.textContent = summary.captain
                ? `${summary.captain.player.name} · ${summary.captain.role} · ${Math.round(summary.captain.score)} ${scoreUnit()}`
                : "Aucun titulaire";
        }
    }

    function syncModeButtons() {
        document.querySelectorAll("[data-dream-mode]").forEach(button => {
            const active = button.dataset.dreamMode === mode;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    }

    document.getElementById("dreamModes").addEventListener("click", event => {
        const button = event.target.closest("[data-dream-mode]");
        if (!button) return;
        mode = button.dataset.dreamMode;
        syncModeButtons();
        render();
    });
    seasonSelect.addEventListener("change", render);

    if (!matches.some(match => Number(match.season) === Number(seasonSelect.value))) {
        mode = "technical";
    }
    syncModeButtons();

    render();
    data.discordAvatarReady?.then(render).catch(() => {});
});
