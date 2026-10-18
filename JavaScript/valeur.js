const VALUE_TIERS = window.NEBULA_DATA?.marketValueTiers || [];
const VALUE_ACTIONS = window.NEBULA_DATA?.marketValueActions || [];
const VALUE_BONUSES = window.NEBULA_DATA?.marketValueBonuses || [];

const MARKET_CLUB_COLORS = Object.fromEntries([
    ...(window.NEBULA_DATA?.clubs || []),
    ...Object.values(window.NEBULA_DATA?.groups || {})
].map(club => [club.key, club.color]));

// Couleur d'identité d'un club (filet fin). Les retraités passent en gris
// archive ; à défaut, le bleu signal du thème (jamais de couleur codée en dur).
function marketAccent(clubKey) {
    if (clubKey === "retraite") return "var(--offline)";
    return MARKET_CLUB_COLORS[clubKey] || "var(--blue-2)";
}

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

// Version signée (les cotes peuvent baisser sous zéro)
function formatSignedCompact(value) {
    return value < 0 ? `-${formatCompactCredits(Math.abs(value))}` : formatCompactCredits(value);
}

// « 50 M ¥ » → { figure: "50", unit: "M ¥" } : chiffre en grand, unité en petit
function splitCompact(value) {
    const [figure, ...unit] = formatCompactCredits(value).split(" ");
    return { figure, unit: unit.join(" ") };
}

function pad2(value) {
    return String(value).padStart(2, "0");
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

    // Mur des cotations du héros : un flux caméra par joueur, sa cote incrustée.
    function renderWall(sortedPlayers, isListed) {
        const wall = document.querySelector("[data-market-wall]");
        if (!wall) return;
        const tiles = sortedPlayers.map(player => {
            const value = Number(player.value) || 0;
            const listed = isListed(player);
            const retired = player.club === "retraite";
            const trend = value > 0 ? "▲" : value < 0 ? "▼" : "■";
            return `
                <span class="nl-feed market-wall-feed${retired ? " is-offline" : ""}${listed ? " is-listed" : ""}${value < 0 ? " is-negative" : ""}">
                    <img class="nl-feed-img" src="${player.avatar}" alt="">
                    <span class="nl-feed-osd"><span><b>CAM ${pad2(players.indexOf(player) + 1)}</b></span>${retired ? '<span class="rec is-off">HORS LIGNE</span>' : '<span class="rec">REC</span>'}</span>
                    <span class="market-wall-price"><small>${player.name}</small><b>${listed ? `${trend} ${formatSignedCompact(value)}` : "NON COTÉ"}</b></span>
                </span>
            `;
        });
        tiles.push(`
            <span class="nl-feed market-wall-feed is-offline is-free">
                <span class="nl-feed-mire" data-label="INDEX // S01"></span>
                <span class="nl-feed-osd"><span><b>CAM ${pad2(players.length + 1)}</b></span><span class="rec is-off">LIBRE</span></span>
            </span>
        `);
        wall.innerHTML = tiles.join("");
    }

    // Bandeau défilant des cotes (décoratif, doublé pour une boucle continue)
    function renderTicker(sortedPlayers, isListed) {
        const track = document.querySelector("[data-market-ticker]");
        if (!track) return;
        const items = sortedPlayers.map(player => {
            const value = Number(player.value) || 0;
            const listed = isListed(player);
            const trend = value > 0 ? "▲" : value < 0 ? "▼" : "■";
            return `
                <span class="ticker-item${listed ? "" : " is-unlisted"}">
                    <b>${player.name}</b><i>${player.clubName}</i><em>${listed ? `${trend} ${formatSignedCompact(value)}` : "NON COTÉ"}</em>
                </span>
            `;
        }).join("");
        track.innerHTML = items + items;
    }

    function renderMarket() {
        const sortedPlayers = [...players].sort((a, b) => b.value - a.value);
        const playerMatchCounts = new Map(sortedPlayers.map(player => [
            player.name,
            Number(window.NEBULA_DATA?.getPlayerMatchStats?.(player.name)?.matches || 0)
        ]));
        const isListed = player => (Number(player.value) || 0) !== 0 || (playerMatchCounts.get(player.name) || 0) > 0;
        const totalValue = sortedPlayers.reduce((total, player) => total + (Number(player.value) || 0), 0);
        const valuedPlayers = sortedPlayers.filter(isListed);
        const leader = sortedPlayers.find(player => Number(player.value) > 0) || null;
        const maximumValue = leader?.value || 1;
        const minimumValue = Math.abs(Math.min(0, ...sortedPlayers.map(player => Number(player.value) || 0))) || 1;

        document.getElementById("marketTotal").textContent = formatSignedCompact(totalValue);
        document.getElementById("valuedProfiles").textContent = String(valuedPlayers.length).padStart(2, "0");
        document.getElementById("marketProfileCount").textContent =
            `${String(sortedPlayers.length).padStart(2, "0")} PROFIL${sortedPlayers.length > 1 ? "S" : ""}`;

        document.getElementById("marketLeaderName").textContent = leader?.name || "NON ATTRIBUÉ";
        document.getElementById("marketLeaderValue").textContent =
            leader ? formatCredits(leader.value) : "AUCUNE VALEUR";
        const signal = document.querySelector(".market-signal");
        const signalRec = signal?.querySelector("[data-market-signal-rec]");
        signal?.classList.toggle("is-offline", !leader);
        if (signalRec) {
            signalRec.textContent = leader ? "DIRECT" : "EN ATTENTE";
            signalRec.classList.toggle("is-off", !leader);
        }

        renderWall(sortedPlayers, isListed);
        renderTicker(sortedPlayers, isListed);

        // Rang de marché : seuls les profils cotés sont numérotés.
        let listedRank = 0;
        const rows = sortedPlayers.map(player => {
            const accent = marketAccent(player.club);
            const numericValue = Number(player.value) || 0;
            const isNegative = numericValue < 0;
            const hasMarketActivity = isListed(player);
            const width = numericValue > 0
                ? Math.max(4, (numericValue / maximumValue) * 100)
                : isNegative
                    ? Math.max(4, (Math.abs(numericValue) / minimumValue) * 100)
                    : 0;
            const status = isNegative ? "EN BAISSE" : hasMarketActivity ? "COTÉ" : "NON COTÉ";
            const statusTone = isNegative ? "nl-tag--off" : hasMarketActivity ? "nl-tag--ligue" : "nl-tag--amical";
            const href = window.NEBULA_DATA.playerPageHref(player);
            const retired = player.club === "retraite";
            const rank = hasMarketActivity ? pad2(++listedRank) : "--";
            const classes = [
                "market-player-row",
                isNegative ? "is-negative" : "",
                hasMarketActivity ? "" : "is-unlisted",
                retired ? "is-retired" : ""
            ].filter(Boolean).join(" ");

            return `
                <a class="${classes}" href="${href}" style="--market-accent:${accent}; --club:${accent};">
                    <span class="market-rank">${rank}</span>
                    <span class="market-player-feed"><img src="${player.avatar}" alt="" class="market-player-avatar"><i aria-hidden="true">CAM ${pad2(players.indexOf(player) + 1)}</i></span>
                    <span class="market-player-identity">
                        <small>${player.clubName} // ${player.position}</small>
                        <strong>${player.name}</strong>
                    </span>
                    <span class="market-player-progress nl-vu" style="--v:${Math.round(width)}" aria-hidden="true"></span>
                    <span class="market-player-value">
                        <small class="nl-tag ${statusTone}">${status}</small>
                        <strong>${hasMarketActivity ? formatCredits(numericValue) : "—"}</strong>
                    </span>
                    <span class="market-row-arrow" aria-hidden="true">↗</span>
                </a>
            `;
        });

        const closedNotice = valuedPlayers.length ? "" : `
            <div class="market-closed">
                <span class="nl-nosignal-code">COTATION 00</span>
                <strong>Cotations suspendues</strong>
                <p>Aucun match joué pour l’instant : les ${sortedPlayers.length} profils attendent leur première cote.</p>
            </div>
        `;
        ranking.innerHTML = closedNotice + rows.join("");
    }

    function renderTierSelector(activeIndex) {
        tierSelector.innerHTML = VALUE_TIERS.map((tier, index) => `
            <button type="button" class="tier-option nl-channel ${index === activeIndex ? "active" : ""}"
                data-tier-index="${index}" aria-pressed="${index === activeIndex}">
                <span class="nl-channel-num">CH ${pad2(index + 1)}</span>
                <span class="tier-copy"><small>${tier.label}</small><strong>×${tier.multiplier}</strong></span>
            </button>
        `).join("");
    }

    function renderLedger(activeIndex) {
        ledgerHead.innerHTML = `
            <tr>
                <th class="ledger-action-heading" scope="col">Action</th>
                ${VALUE_TIERS.map((tier, index) => `
                    <th scope="col" class="${index === activeIndex ? "active-tier is-hl" : ""}">
                        <span>×${tier.multiplier}</span>${tier.shortLabel}
                    </th>
                `).join("")}
            </tr>
        `;

        ledgerBody.innerHTML = VALUE_ACTIONS.map(action => `
            <tr>
                <th scope="row"><span>${action.code}</span>${action.label}</th>
                ${VALUE_TIERS.map((tier, index) => {
                    const gain = tierGain(action, tier);
                    const tone = gain < 0 ? " is-loss" : gain === 0 ? " is-zero" : "";
                    return `<td class="${index === activeIndex ? "active-tier is-hl" : ""}${tone}">${gain > 0 ? "+" : ""}${formatCredits(gain)}</td>`;
                }).join("")}
            </tr>
        `).join("");
    }

    function renderBonuses() {
        bonusGrid.innerHTML = VALUE_BONUSES.map((bonus, index) => {
            const { figure, unit } = splitCompact(bonus.value);
            return `
                <article class="bonus-file nl-stat${bonus.premium ? " premium nl-stat--solid" : ""}">
                    <span class="nl-stat-label">${pad2(index + 1)} // ${bonus.code}</span>
                    <strong class="nl-stat-value">+${figure}<small>${unit}</small></strong>
                    <span class="nl-stat-note"><b>${bonus.label}</b> <span class="bonus-amount">+${formatCredits(bonus.value)}</span></span>
                </article>
            `;
        }).join("");
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
                // « || 0 » : une défaite non jouée vaut 0, pas « -0 ¥ »
                total: quantity * tierGain(action, tier) || 0
            };
        });
        const total = breakdown.reduce((sum, item) => sum + item.total, 0);

        const resultBlock = document.querySelector(".value-result");
        const trend = document.querySelector("[data-value-trend]");
        resultBlock?.classList.toggle("is-negative", total < 0);
        resultBlock?.classList.toggle("is-positive", total > 0);
        if (trend) {
            trend.textContent = total > 0
                ? "VARIATION // HAUSSE ▲"
                : total < 0 ? "VARIATION // BAISSE ▼" : "VARIATION // STABLE ■";
        }

        document.getElementById("resultValeur").textContent = `${total > 0 ? "+" : ""}${formatCredits(total)}`;
        document.getElementById("calculationBreakdown").innerHTML = breakdown.map(item => `
            <div class="${item.total === 0 ? "inactive" : ""}${item.total < 0 ? " is-loss" : ""}">
                <span><b>${item.code}</b> ${item.label} <small>×${item.quantity}</small></span>
                <strong>${item.total > 0 ? "+" : ""}${formatCredits(item.total)}</strong>
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
