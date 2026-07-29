const VALUE_TIERS = window.NEBULA_DATA?.marketValueTiers || [];
const VALUE_ACTIONS = window.NEBULA_DATA?.marketValueActions || [];
const VALUE_BONUSES = window.NEBULA_DATA?.marketValueBonuses || [];

const MARKET_CLUB_COLORS = Object.fromEntries([
    ...(window.NEBULA_DATA?.clubs || []),
    ...Object.values(window.NEBULA_DATA?.groups || {})
].map(club => [club.key, club.color]));

function formatCredits(value) {
    return `${Math.round(value).toLocaleString("fr-FR")} ¥`;
}

function formatCompactCredits(value) {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} B ¥`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} M ¥`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} K ¥`;
    }
    return `${value} ¥`;
}

function tierGain(action, tier) {
    return action.key === "victoire" ? tier.victory : action.base * tier.multiplier;
}

document.addEventListener("DOMContentLoaded", () => {
    const ranking = document.getElementById("marketRanking");
    if (!ranking) return;

    const players = window.NEBULA_DATA?.players || [];
    const typeMatch = document.getElementById("typeMatch");
    const matchResult = document.getElementById("victoire");
    const tierSelector = document.getElementById("tierSelector");
    const ledgerHead = document.getElementById("ledgerHead");
    const ledgerBody = document.getElementById("ledgerBody");
    const bonusGrid = document.getElementById("bonusGrid");
    const simulator = document.getElementById("valueSimulator");

    function renderMarket() {
        const sortedPlayers = [...players].sort((a, b) => b.value - a.value);
        const playerMatchCounts = new Map(sortedPlayers.map(player => [
            player.name,
            Number(window.NEBULA_DATA?.getPlayerMatchStats?.(player.name)?.matches || 0)
        ]));
        const totalValue = sortedPlayers.reduce((total, player) => total + (Number(player.value) || 0), 0);
        const valuedPlayers = sortedPlayers.filter(player => (
            (Number(player.value) || 0) !== 0
            || (playerMatchCounts.get(player.name) || 0) > 0
        ));
        const leader = sortedPlayers.find(player => Number(player.value) > 0) || null;
        const maximumValue = leader?.value || 1;
        const minimumValue = Math.abs(Math.min(0, ...sortedPlayers.map(player => Number(player.value) || 0))) || 1;

        document.getElementById("marketTotal").textContent = formatCompactCredits(totalValue);
        document.getElementById("valuedProfiles").textContent = String(valuedPlayers.length).padStart(2, "0");
        document.getElementById("marketProfileCount").textContent =
            `${String(sortedPlayers.length).padStart(2, "0")} PROFIL${sortedPlayers.length > 1 ? "S" : ""}`;

        document.getElementById("marketLeaderName").textContent = leader?.name || "NON ATTRIBUÉ";
        document.getElementById("marketLeaderValue").textContent =
            leader ? formatCredits(leader.value) : "AUCUNE VALEUR";

        ranking.innerHTML = sortedPlayers.map((player, index) => {
            const accent = MARKET_CLUB_COLORS[player.club] || "#63e7ff";
            const numericValue = Number(player.value) || 0;
            const isNegative = numericValue < 0;
            const hasPlayedMatch = (playerMatchCounts.get(player.name) || 0) > 0;
            const hasMarketActivity = numericValue !== 0 || hasPlayedMatch;
            const width = numericValue > 0
                ? Math.max(4, (numericValue / maximumValue) * 100)
                : isNegative
                    ? Math.max(4, (Math.abs(numericValue) / minimumValue) * 100)
                    : 0;
            const status = isNegative ? "EN BAISSE" : hasMarketActivity ? "COTÉ" : "NON COTÉ";
            const href = window.NEBULA_DATA.playerPageHref(player);

            return `
                <a class="market-player-row${isNegative ? " is-negative" : ""}" href="${href}" style="--market-accent:${accent};">
                    <span class="market-rank">${String(index + 1).padStart(2, "0")}</span>
                    <img src="${player.avatar}" alt="" class="market-player-avatar">
                    <span class="market-player-identity">
                        <small>${player.clubName} // ${player.position}</small>
                        <strong>${player.name}</strong>
                    </span>
                    <span class="market-player-progress" aria-hidden="true"><i style="width:${width}%"></i></span>
                    <span class="market-player-value">
                        <small>${status}</small>
                        <strong>${hasMarketActivity ? formatCredits(numericValue) : "—"}</strong>
                    </span>
                    <span class="market-row-arrow">↗</span>
                </a>
            `;
        }).join("");
    }

    function renderTierSelector(activeIndex) {
        tierSelector.innerHTML = VALUE_TIERS.map((tier, index) => `
            <button type="button" class="tier-option ${index === activeIndex ? "active" : ""}"
                data-tier-index="${index}" aria-pressed="${index === activeIndex}">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <div><small>${tier.label}</small><strong>×${tier.multiplier}</strong></div>
            </button>
        `).join("");
    }

    function renderLedger(activeIndex) {
        ledgerHead.innerHTML = `
            <tr>
                <th class="ledger-action-heading">ACTION</th>
                ${VALUE_TIERS.map((tier, index) => `
                    <th class="${index === activeIndex ? "active-tier" : ""}">
                        <span>×${tier.multiplier}</span>${tier.shortLabel}
                    </th>
                `).join("")}
            </tr>
        `;

        ledgerBody.innerHTML = VALUE_ACTIONS.map(action => `
            <tr>
                <th><span>${action.code}</span>${action.label}</th>
                ${VALUE_TIERS.map((tier, index) => `
                    <td class="${index === activeIndex ? "active-tier" : ""}">${formatCredits(tierGain(action, tier))}</td>
                `).join("")}
            </tr>
        `).join("");
    }

    function renderBonuses() {
        bonusGrid.innerHTML = VALUE_BONUSES.map((bonus, index) => `
            <article class="bonus-file ${bonus.premium ? "premium" : ""}">
                <span>${String(index + 1).padStart(2, "0")} // ${bonus.code}</span>
                <strong>${bonus.label}</strong>
                <small>+${formatCredits(bonus.value)}</small>
            </article>
        `).join("");
    }

    function activeTierIndex() {
        const index = VALUE_TIERS.findIndex(tier => String(tier.multiplier) === typeMatch.value);
        return index < 0 ? 0 : index;
    }

    function updateMatchResultOptions(tier) {
        const currentResult = matchResult.value || "loss";
        const isNclResult = ["ncl", "third", "finale"].includes(tier.key);
        const nextResult = isNclResult && currentResult === "draw"
            ? "loss"
            : currentResult;

        matchResult.innerHTML = `
            <option value="loss">Non</option>
            ${isNclResult ? "" : `<option value="draw">Égalité</option>`}
            <option value="win">Oui</option>
        `;
        matchResult.value = nextResult;
    }

    function updateTierInterface() {
        const index = activeTierIndex();
        const tier = VALUE_TIERS[index];
        const percentage = (index / (VALUE_TIERS.length - 1)) * 100;

        updateMatchResultOptions(tier);
        renderTierSelector(index);
        renderLedger(index);
        document.getElementById("activeTierLabel").textContent = `${tier.shortLabel} ×${tier.multiplier}`;
        document.getElementById("meterRate").textContent = `×${tier.multiplier}`;
        document.getElementById("meterFill").style.width = `${percentage}%`;
        document.getElementById("meterDot").style.left = `${percentage}%`;
    }

    function sanitizedValue(id) {
        const input = document.getElementById(id);
        const value = Math.max(Number(input.value) || 0, Number(input.min) || 0);
        input.value = value;
        return value;
    }

    function calculValeur() {
        const tier = VALUE_TIERS[activeTierIndex()];
        const result = matchResult.value;
        const stats = {
            victoire: result === "win" ? 1 : 0,
            egalite: result === "draw" ? 1 : 0,
            defaite: result === "loss" ? 1 : 0,
            buts: sanitizedValue("buts"),
            passes: sanitizedValue("passes"),
            def: sanitizedValue("def"),
            dribbles: sanitizedValue("dribbles"),
            mvp: Number(document.getElementById("mvp").value)
        };

        const breakdown = VALUE_ACTIONS.map(action => {
            const quantity = stats[action.key];
            return {
                ...action,
                quantity,
                total: quantity * tierGain(action, tier)
            };
        });
        const total = breakdown.reduce((sum, item) => sum + item.total, 0);

        document.getElementById("resultValeur").textContent = formatCredits(total);
        document.getElementById("calculationBreakdown").innerHTML = breakdown.map(item => `
            <div class="${item.total === 0 ? "inactive" : ""}">
                <span>${item.code} <small>×${item.quantity}</small></span>
                <strong>${formatCredits(item.total)}</strong>
            </div>
        `).join("");
    }

    function selectTier(index) {
        const tier = VALUE_TIERS[index];
        if (!tier) return;
        typeMatch.value = String(tier.multiplier);
        updateTierInterface();
        calculValeur();
    }

    tierSelector.addEventListener("click", event => {
        const button = event.target.closest("[data-tier-index]");
        if (button) selectTier(Number(button.dataset.tierIndex));
    });

    typeMatch.addEventListener("change", () => {
        updateTierInterface();
        calculValeur();
    });

    simulator.addEventListener("input", calculValeur);
    simulator.addEventListener("change", calculValeur);

    document.querySelectorAll(".stepper-btn").forEach(button => {
        button.addEventListener("click", () => {
            const input = document.getElementById(button.dataset.target);
            const minimum = Number(input.min) || 0;
            const current = Number(input.value) || 0;
            input.value = button.classList.contains("stepper-plus")
                ? current + 1
                : Math.max(minimum, current - 1);
            calculValeur();
        });
    });

    document.getElementById("resetSimulator").addEventListener("click", () => {
        simulator.reset();
        updateTierInterface();
        calculValeur();
    });

    renderMarket();
    renderBonuses();
    updateTierInterface();
    calculValeur();
});
