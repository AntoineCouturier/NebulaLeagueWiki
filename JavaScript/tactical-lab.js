document.addEventListener("DOMContentLoaded", () => {
    const data = window.NEBULA_DATA || {};
    const clubs = data.clubs || [];
    const players = (data.players || []).filter(player => clubs.some(club => club.key === player.club));
    const roles = ["CF", "LW", "RW", "LM", "RM"];
    const storageKey = "nebula:tactical-lab:v1";

    const dom = {
        page: document.querySelector(".tactical-page"),
        slots: document.getElementById("labSlots"),
        playerGrid: document.getElementById("labPlayerGrid"),
        count: document.getElementById("labCount"),
        overall: document.getElementById("labOverall"),
        status: document.getElementById("labStatus"),
        metrics: document.getElementById("labMetrics"),
        identity: document.getElementById("labIdentity"),
        identityCopy: document.getElementById("labIdentityCopy"),
        value: document.getElementById("labValue"),
        insights: document.getElementById("labInsights"),
        activeRole: document.getElementById("labActiveRole"),
        planLabel: document.getElementById("labPlanLabel"),
        planTabs: document.getElementById("labPlanTabs"),
        roleFilters: document.getElementById("labRoleFilters"),
        optimize: document.getElementById("labOptimize"),
        reset: document.getElementById("labReset")
    };

    if (!dom.slots || !dom.playerGrid) return;

    const planProfiles = {
        balanced: {
            label: "ÉQUILIBRÉ",
            identity: "ARCHITECTURE ÉQUILIBRÉE",
            color: "#f1f5f7",
            copy: "La structure recherche une réponse stable dans chaque phase du jeu.",
            multipliers: { attack: 1, creation: 1, defense: 1, dribble: 1, position: 1 }
        },
        possession: {
            label: "POSSESSION",
            identity: "CONTRÔLE ORBITAL",
            color: "#b56bff",
            copy: "Le dribble est favorisé pour conserver le ballon et absorber la pression.",
            multipliers: { attack: 1, creation: 0.8, defense: 1, dribble: 1.5, position: 0.8 }
        },
        defensive: {
            label: "DÉFENSIF",
            identity: "BLOC DE CONFINEMENT",
            color: "#a7ff22",
            copy: "Le bloc renforce sa protection et conserve une structure stable sans ballon.",
            multipliers: { attack: 0.8, creation: 1, defense: 1.5, dribble: 0.8, position: 1 }
        },
        percussion: {
            label: "PERCUTEUR",
            identity: "RUPTURE FRONTALE",
            color: "#ff5d66",
            copy: "Le cinq cherche la rupture immédiate par l’attaque et les projections verticales.",
            multipliers: { attack: 1.5, creation: 0.8, defense: 0.8, dribble: 1, position: 1 }
        },
        tikitaka: {
            label: "TIKI TAKA",
            identity: "CIRCUIT COURT",
            color: "#52dcff",
            copy: "Les passes courtes et les déplacements coordonnés structurent chaque offensive.",
            multipliers: { attack: 1, creation: 1.5, defense: 0.8, dribble: 0.8, position: 1 }
        }
    };

    const roleProfiles = {
        CF: { tir: 2, offense: 2, position: 1.5, dribble: 1, passe: 0.6, defense: 0.2 },
        LW: { tir: 1.25, offense: 1.65, position: 1.15, dribble: 1.8, passe: 1, defense: 0.35 },
        RW: { tir: 1.25, offense: 1.65, position: 1.15, dribble: 1.8, passe: 1, defense: 0.35 },
        LM: { tir: 0.75, offense: 1, position: 1.6, dribble: 1.15, passe: 1.8, defense: 1.1 },
        RM: { tir: 0.75, offense: 1, position: 1.6, dribble: 1.15, passe: 1.8, defense: 1.1 }
    };

    const outOfPositionPenalties = {
        RM: { LM: 2, RW: 4, LW: 6, CF: 8 },
        LM: { RM: 2, LW: 4, RW: 6, CF: 8 },
        LW: { RW: 2, CF: 4, LM: 6, RM: 8 },
        RW: { LW: 2, CF: 4, RM: 6, LM: 8 },
        CF: { LW: 2, RW: 2, RM: 8, LM: 8 }
    };

    const metricDefinitions = [
        { key: "attack", label: "ATTAQUE", color: "#ff5d66", tooltip: "Moyenne des statistiques Tir et Offense." },
        { key: "creation", label: "CRÉATION", color: "#52dcff", tooltip: "Moyenne de la statistique Passe." },
        { key: "defense", label: "DÉFENSE", color: "#a7ff22", tooltip: "Moyenne de la statistique Défense." },
        { key: "dribble", label: "DRIBBLE", color: "#b56bff", tooltip: "Moyenne de la statistique Dribble." },
        { key: "position", label: "STRUCTURE", color: "#ffd45b", tooltip: "Moyenne de la statistique Positionnement." },
        { key: "chemistry", label: "SYNCHRO", color: "#f1f5f7", tooltip: "Complétude du cinq et respect des postes naturels. N’influence pas la note générale." }
    ];

    let plan = "balanced";
    let filter = "all";
    let activeRole = "CF";
    let selection = Object.fromEntries(roles.map(role => [role, null]));

    const escapeHtml = value => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const clubOf = player => data.getClub?.(player.club)
        || clubs.find(club => club.key === player.club)
        || { name: player.club, color: "#52dcff", logo: "" };

    const playerByName = name => players.find(player => player.name === name) || null;
    const stat = (player, key) => {
        const value = Number(player?.technical?.[key]);
        return Number.isFinite(value) ? value : null;
    };

    function positionPenalty(naturalRole, assignedRole) {
        if (!naturalRole || !assignedRole || naturalRole === assignedRole) return 0;
        return outOfPositionPenalties[naturalRole]?.[assignedRole] ?? 8;
    }

    function adjustedStat(player, key, assignedRole) {
        const value = stat(player, key);
        if (value === null) return null;
        return Math.max(0, value - positionPenalty(player.position, assignedRole));
    }

    function weightedScore(player, weights, assignedRole) {
        const entries = Object.entries(weights)
            .map(([key, weight]) => ({ value: adjustedStat(player, key, assignedRole), weight }))
            .filter(item => item.value !== null);
        if (!entries.length) return null;
        const weightTotal = entries.reduce((sum, item) => sum + item.weight, 0);
        return entries.reduce((sum, item) => sum + item.value * item.weight, 0) / weightTotal;
    }

    function playerMetricSet(player, assignedRole) {
        return {
            attack: average([
                adjustedStat(player, "tir", assignedRole),
                adjustedStat(player, "offense", assignedRole)
            ]),
            creation: average([adjustedStat(player, "passe", assignedRole)]),
            defense: average([adjustedStat(player, "defense", assignedRole)]),
            dribble: average([adjustedStat(player, "dribble", assignedRole)]),
            position: average([adjustedStat(player, "position", assignedRole)])
        };
    }

    function planPlayerScore(player, assignedRole) {
        const metrics = playerMetricSet(player, assignedRole);
        const multipliers = planProfiles[plan].multipliers;
        const available = Object.keys(multipliers).filter(key => Number.isFinite(metrics[key]));
        if (!available.length) return null;
        return available.reduce((sum, key) => sum + metrics[key] * multipliers[key], 0) / available.length;
    }

    function fitScore(player, role) {
        if (!player) return null;
        const roleScore = weightedScore(player, roleProfiles[role], role);
        const planScore = planPlayerScore(player, role);
        if (roleScore === null || planScore === null) return null;
        return Math.round(roleScore * 0.62 + planScore * 0.38);
    }

    function selectedEntries() {
        return roles.flatMap(role => {
            const player = playerByName(selection[role]);
            return player ? [{ role, player, score: fitScore(player, role) }] : [];
        });
    }

    function average(values) {
        const valid = values.filter(value => Number.isFinite(value));
        return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
    }

    function formatValue(value) {
        const amount = Number(value || 0);
        const absolute = Math.abs(amount);
        if (absolute >= 1000000000) {
            return `${(amount / 1000000000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} B ¥`;
        }
        if (absolute >= 1000000) {
            return `${(amount / 1000000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M ¥`;
        }
        return `${Math.round(amount).toLocaleString("fr-FR")} ¥`;
    }

    function saveState() {
        try {
            localStorage.setItem(storageKey, JSON.stringify({ plan, selection }));
        } catch {
            // La sauvegarde locale reste facultative.
        }
    }

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey));
            if (saved && planProfiles[saved.plan]) plan = saved.plan;
            roles.forEach(role => {
                const name = saved?.selection?.[role];
                if (playerByName(name)) selection[role] = name;
            });
        } catch {
            // Une sauvegarde invalide est simplement ignorée.
        }
    }

    function nextEmptyRole(currentRole) {
        const currentIndex = roles.indexOf(currentRole);
        for (let offset = 1; offset <= roles.length; offset += 1) {
            const candidate = roles[(currentIndex + offset) % roles.length];
            if (!selection[candidate]) return candidate;
        }
        return currentRole;
    }

    function renderSlots() {
        dom.slots.innerHTML = roles.map(role => {
            const player = playerByName(selection[role]);
            const club = player ? clubOf(player) : { name: "NON ATTRIBUÉ", color: "#52616b" };
            const score = player ? fitScore(player, role) : null;
            const positionLabel = player
                ? player.position === role
                    ? "POSTE NATUREL"
                    : `HORS POSTE · ${player.position} · -${positionPenalty(player.position, role)}`
                : "CLIQUER POUR CIBLER";

            return `
                <article class="lab-slot${activeRole === role ? " is-active" : ""}" data-role="${role}"
                    style="--slot-accent:${escapeHtml(club.color)}">
                    <button class="lab-slot-target" type="button" data-select-role="${role}"
                        aria-label="Sélectionner le poste ${role}">
                        ${player
                            ? `<img src="${escapeHtml(player.avatar)}" alt="">`
                            : `<span class="lab-slot-placeholder"><span>${role}</span></span>`}
                        <span>
                            <small>${role} // ${escapeHtml(club.name)}</small>
                            <strong>${escapeHtml(player?.name || "EMPLACEMENT LIBRE")}</strong>
                            <span>${positionLabel}${score !== null ? ` · ${score}` : ""}</span>
                        </span>
                    </button>
                    ${player ? `<button class="lab-slot-remove" type="button" data-remove-role="${role}"
                        aria-label="Retirer ${escapeHtml(player.name)}">×</button>` : ""}
                </article>`;
        }).join("");

        dom.activeRole.textContent = activeRole;
    }

    function renderPlayers() {
        const selectedNames = new Set(Object.values(selection).filter(Boolean));
        const filtered = players.filter(player => filter === "all" || player.position === filter);

        dom.playerGrid.innerHTML = filtered.length ? filtered.map(player => {
            const club = clubOf(player);
            const overall = data.calculateTechnicalOverall?.(player.technical);
            const assignedRole = roles.find(role => selection[role] === player.name);
            const targetScore = fitScore(player, activeRole);
            return `
                <button class="lab-player-card${assignedRole ? " is-selected" : ""}" type="button"
                    data-player="${escapeHtml(player.name)}" style="--player-accent:${escapeHtml(club.color)}">
                    <img src="${escapeHtml(player.avatar)}" alt="">
                    <span>
                        <small>${escapeHtml(club.name)} · ${player.position}</small>
                        <strong>${escapeHtml(player.name)}</strong>
                        <span>${assignedRole ? `CONNECTÉ EN ${assignedRole}` : `PROJECTION ${activeRole} · ${targetScore ?? "—"}`}</span>
                    </span>
                    <b>${overall ?? "—"}</b>
                </button>`;
        }).join("") : `<div class="lab-player-empty">AUCUN PROFIL DISPONIBLE POUR CE FILTRE.</div>`;

        dom.count.textContent = `${String(selectedNames.size).padStart(2, "0")} / 05`;
    }

    function teamMetrics(entries) {
        const attack = average(entries.flatMap(({ player, role }) => [
            adjustedStat(player, "tir", role),
            adjustedStat(player, "offense", role)
        ]));
        const creation = average(entries.map(({ player, role }) => adjustedStat(player, "passe", role)));
        const defense = average(entries.map(({ player, role }) => adjustedStat(player, "defense", role)));
        const dribble = average(entries.map(({ player, role }) => adjustedStat(player, "dribble", role)));
        const position = average(entries.map(({ player, role }) => adjustedStat(player, "position", role)));
        const wrongPositions = entries.filter(entry => entry.player.position !== entry.role).length;
        const chemistry = Math.max(0, 100 - (roles.length - entries.length) * 18 - wrongPositions * 12);
        return { attack, creation, defense, dribble, position, chemistry };
    }

    function renderAnalysis() {
        const entries = selectedEntries();
        const metrics = teamMetrics(entries);
        const multipliers = planProfiles[plan].multipliers;
        const adjustedMetrics = Object.fromEntries(metricDefinitions.map(metric => {
            const rawValue = metrics[metric.key];
            const multiplier = metric.key === "chemistry" ? 1 : multipliers[metric.key];
            return [metric.key, Number.isFinite(rawValue) ? Math.round(rawValue * multiplier) : null];
        }));
        const weightedMetricKeys = Object.keys(multipliers).filter(key => Number.isFinite(metrics[key]));
        const overall = weightedMetricKeys.length
            ? Math.round(weightedMetricKeys.reduce((sum, key) => (
                sum + metrics[key] * multipliers[key]
            ), 0) / weightedMetricKeys.length)
            : null;
        const wrongPositions = entries.filter(entry => entry.player.position !== entry.role);
        const totalValue = entries.reduce((sum, entry) => (
            sum + Number(data.getPlayerMarketValue?.(entry.player.name) || entry.player.value || 0)
        ), 0);
        const metricRanking = ["attack", "creation", "defense", "dribble"]
            .map(key => ({ key, value: adjustedMetrics[key] }))
            .filter(item => Number.isFinite(item.value))
            .sort((a, b) => b.value - a.value);
        const strongest = metricRanking[0];
        const weakest = metricRanking.at(-1);
        const metricLabel = key => metricDefinitions.find(metric => metric.key === key)?.label || "—";
        const uniqueClubs = new Set(entries.map(entry => entry.player.club)).size;

        dom.overall.textContent = overall ?? "—";
        dom.status.textContent = entries.length < 5
            ? `COMPOSITION INCOMPLÈTE · ${entries.length}/5`
            : wrongPositions.length
                ? `${wrongPositions.length} AJUSTEMENT${wrongPositions.length > 1 ? "S" : ""} DE POSTE`
                : "SYSTÈME SYNCHRONISÉ";
        dom.value.textContent = formatValue(totalValue);
        dom.identity.textContent = entries.length ? planProfiles[plan].identity : "EN ATTENTE";
        dom.identityCopy.textContent = entries.length
            ? planProfiles[plan].copy
            : "Ajoutez des joueurs pour générer une lecture tactique.";

        dom.metrics.innerHTML = metricDefinitions.map(metric => {
            const rawValue = metrics[metric.key];
            const value = adjustedMetrics[metric.key];
            const multiplier = metric.key === "chemistry" ? null : multipliers[metric.key];
            const formattedRawValue = Number.isInteger(rawValue)
                ? rawValue
                : Math.round(rawValue * 10) / 10;
            const adjustmentCopy = multiplier === null || rawValue === null
                ? metric.tooltip
                : `${metric.tooltip} Base ${formattedRawValue} × ${multiplier} = ${value}.`;
            return `<div class="lab-metric" tabindex="0" data-tooltip="${escapeHtml(adjustmentCopy)}"
                style="--metric-accent:${metric.color};--metric-value:${Math.min(value ?? 0, 100)}%">
                <span>${metric.label}${multiplier !== null ? `<b>×${multiplier}</b>` : ""}</span>
                <strong>${value ?? "—"}</strong><i></i>
            </div>`;
        }).join("");

        dom.insights.innerHTML = [
            ["FORCE PRINCIPALE", strongest ? `${metricLabel(strongest.key)} · ${strongest.value}` : "EN ATTENTE"],
            ["ZONE À RENFORCER", weakest ? `${metricLabel(weakest.key)} · ${weakest.value}` : "EN ATTENTE"],
            ["POSTES NATURELS", `${entries.length - wrongPositions.length} / ${entries.length || 0}`],
            ["CLUBS REPRÉSENTÉS", String(uniqueClubs).padStart(2, "0")]
        ].map(([label, value]) => `<div class="lab-insight"><small>${label}</small><strong>${value}</strong></div>`).join("");
    }

    function renderPlan() {
        const profile = planProfiles[plan];
        dom.page.style.setProperty("--lab-plan", profile.color);
        dom.planLabel.textContent = profile.label;
        dom.planTabs.querySelectorAll("[data-plan]").forEach(button => {
            const active = button.dataset.plan === plan;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    }

    function renderFilters() {
        dom.roleFilters.querySelectorAll("[data-filter]").forEach(button => {
            const active = button.dataset.filter === filter;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    }

    function renderAll() {
        renderPlan();
        renderSlots();
        renderPlayers();
        renderAnalysis();
        renderFilters();
    }

    function assignPlayer(name) {
        roles.forEach(role => {
            if (selection[role] === name) selection[role] = null;
        });
        selection[activeRole] = name;
        activeRole = nextEmptyRole(activeRole);
        saveState();
        renderAll();
    }

    function optimizeSelection() {
        let states = new Map([[
            0n,
            { score: 0, naturalPositions: 0, playerNames: [] }
        ]]);

        roles.forEach(role => {
            const nextStates = new Map();

            states.forEach((state, usedMask) => {
                players.forEach((player, playerIndex) => {
                    const playerBit = 1n << BigInt(playerIndex);
                    if ((usedMask & playerBit) !== 0n) return;

                    const score = planPlayerScore(player, role);
                    if (!Number.isFinite(score)) return;

                    const nextMask = usedMask | playerBit;
                    const candidate = {
                        score: state.score + score,
                        naturalPositions: state.naturalPositions + Number(player.position === role),
                        playerNames: [...state.playerNames, player.name]
                    };
                    const current = nextStates.get(nextMask);
                    const candidateIsBetter = !current
                        || candidate.score > current.score
                        || (
                            candidate.score === current.score
                            && candidate.naturalPositions > current.naturalPositions
                        );

                    if (candidateIsBetter) nextStates.set(nextMask, candidate);
                });
            });

            states = nextStates;
        });

        const bestComposition = [...states.values()].reduce((best, candidate) => {
            if (!best || candidate.score > best.score) return candidate;
            if (
                candidate.score === best.score
                && candidate.naturalPositions > best.naturalPositions
            ) return candidate;
            return best;
        }, null);

        selection = Object.fromEntries(roles.map((role, index) => [
            role,
            bestComposition?.playerNames[index] || null
        ]));
        activeRole = roles.find(role => !selection[role]) || "CF";
        saveState();
        renderAll();
    }

    dom.slots.addEventListener("click", event => {
        const remove = event.target.closest("[data-remove-role]");
        if (remove) {
            const role = remove.dataset.removeRole;
            selection[role] = null;
            activeRole = role;
            saveState();
            renderAll();
            return;
        }

        const target = event.target.closest("[data-select-role]");
        if (!target) return;
        activeRole = target.dataset.selectRole;
        renderSlots();
        renderPlayers();
    });

    dom.playerGrid.addEventListener("click", event => {
        const card = event.target.closest("[data-player]");
        if (card) assignPlayer(card.dataset.player);
    });

    dom.planTabs.addEventListener("click", event => {
        const button = event.target.closest("[data-plan]");
        if (!button || !planProfiles[button.dataset.plan]) return;
        plan = button.dataset.plan;
        saveState();
        renderAll();
    });

    dom.roleFilters.addEventListener("click", event => {
        const button = event.target.closest("[data-filter]");
        if (!button) return;
        filter = button.dataset.filter;
        renderPlayers();
        renderFilters();
    });

    dom.optimize.addEventListener("click", optimizeSelection);
    dom.reset.addEventListener("click", () => {
        selection = Object.fromEntries(roles.map(role => [role, null]));
        activeRole = "CF";
        filter = "all";
        plan = "balanced";
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // La composition visuelle est tout de même remise à zéro.
        }
        renderAll();
    });

    loadState();
    renderAll();
    data.discordAvatarReady?.then(renderAll).catch(() => {});
});
