// Les identités, clubs, valeurs, images et liens sont centralisés dans nebula-data.js.
const PLAYERS = window.NEBULA_DATA?.players || [];

// Logo de club associé à chaque valeur de filtre (utilisé pour le badge en filigrane sur la carte)
const CLUB_LOGOS = Object.fromEntries([
    ...(window.NEBULA_DATA?.clubs || []),
    ...Object.values(window.NEBULA_DATA?.groups || {})
].map(club => [club.key, club.logo]));

const CLUB_ACCENTS = Object.fromEntries([
    ...(window.NEBULA_DATA?.clubs || []),
    ...Object.values(window.NEBULA_DATA?.groups || {})
].map(club => [club.key, club.color]));

const POSITION_LABELS = window.NEBULA_DATA?.positions || {};

document.addEventListener("DOMContentLoaded", () => {
    // Le reste de ce fichier ne concerne que players.html. club.html charge aussi
    // ce script, mais uniquement pour accéder à la source de données PLAYERS.
    const container = document.getElementById("playersContainer");
    if (!container) return;

    const countEl = document.getElementById("playersCount");
    const clubDropdown = document.getElementById("clubDropdown");
    const dropdownCurrent = document.getElementById("dropdownCurrent");
    const dropdownLabel = dropdownCurrent.querySelector(".dropdown-current-label");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const sortToggle = document.getElementById("sortToggle");
    const searchInput = document.getElementById("playerSearch");
    const positionFilters = document.getElementById("positionFilters");
    const resetFilters = document.getElementById("resetFilters");

    let selectedClub = "all";
    let selectedPosition = "all";
    let searchTerm = "";
    let sortOrder = "desc";

    function formatValue(value) {
        return value.toLocaleString("fr-FR");
    }

    function compactValue(value) {
        if (value >= 1000000000) {
            return `${(value / 1000000000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} B`;
        }
        if (value >= 1000000) {
            return `${(value / 1000000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} K`;
        }
        return String(value);
    }

    function normalize(value) {
        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function setClubFilter(option) {
        dropdownMenu.querySelectorAll(".dropdown-option").forEach(item => {
            const active = item === option;
            item.classList.toggle("active", active);
            item.setAttribute("aria-selected", String(active));
        });

        selectedClub = option.dataset.club;
        dropdownLabel.textContent = option.dataset.label;

        const currentIcon = dropdownCurrent.querySelector(".dropdown-current-icon");
        if (currentIcon) currentIcon.remove();

        const optionIcon = option.querySelector(".filter-icon");
        if (optionIcon) {
            const icon = optionIcon.cloneNode(true);
            icon.classList.add("dropdown-current-icon");
            dropdownCurrent.querySelector(".dropdown-current-content").prepend(icon);
        }
    }

    function closeClubDropdown() {
        clubDropdown.classList.remove("open");
        dropdownCurrent.setAttribute("aria-expanded", "false");
    }

    function displayPlayers(list) {
        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-inner">
                        <span class="empty-state-code">SCAN // 00 RESULT</span>
                        <p class="empty-state-title">AUCUN PROFIL DÉTECTÉ</p>
                        <p class="empty-state-sub">Aucun joueur ne correspond à cette combinaison. Modifiez les filtres
                            ou réinitialisez la console de sélection.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = list.map((player, index) => {
            const logo = CLUB_LOGOS[player.club];
            const accent = CLUB_ACCENTS[player.club] || "#63e7ff";
            const playerNumber = String(PLAYERS.indexOf(player) + 1).padStart(2, "0");
            const status = player.club === "retraite" ? "RETRAITE" : "ACTIF";
            const value = player.value === 0 ? "NON COTÉ" : `${formatValue(player.value)} ¥`;
            const role = POSITION_LABELS[player.position] || player.position;

            return `
                <a class="player-card ${player.club}" href="${window.NEBULA_DATA.playerPageHref(player)}"
                    style="--club-accent:${accent}; animation-delay:${Math.min(index, 8) * 0.055}s"
                    aria-label="Ouvrir le profil de ${player.name}">
                    <div class="player-file-topline">
                        <span>PLAYER FILE // ${playerNumber}</span>
                        <span class="player-file-status"><i></i>${status}</span>
                    </div>
                    <div class="player-card-visual">
                        <img class="player-avatar" src="${player.avatar}" alt="${player.name}">
                        ${logo ? `<img src="${logo}" class="card-club-badge" alt="" onerror="this.style.display='none'">` : ""}
                        <span class="position-pill">${player.position}</span>
                        <span class="player-index" aria-hidden="true">${playerNumber}</span>
                    </div>
                    <div class="player-card-body">
                        <span class="player-card-club">${player.clubName}</span>
                        <h3>${player.name}</h3>
                        <div class="player-card-data">
                            <div><small>POSTE</small><strong>${role}</strong></div>
                            <div><small>VALEUR DE MARCHÉ</small><strong class="market-value">${value}</strong></div>
                        </div>
                        <span class="player-card-cta">OUVRIR LE DOSSIER <i>↗</i></span>
                    </div>
                </a>
            `;
        }).join("");
    }

    function updatePlayers() {
        const normalizedSearch = normalize(searchTerm);
        const result = PLAYERS
            .filter(player => selectedClub === "all" || player.club === selectedClub)
            .filter(player => selectedPosition === "all" || player.position === selectedPosition)
            .filter(player => {
                if (!normalizedSearch) return true;
                return normalize(`${player.name} ${player.clubName} ${player.position}`).includes(normalizedSearch);
            })
            .sort((a, b) => sortOrder === "asc" ? a.value - b.value : b.value - a.value);

        countEl.textContent = `${String(result.length).padStart(2, "0")} PROFIL${result.length > 1 ? "S" : ""} AFFICHÉ${result.length > 1 ? "S" : ""}`;
        displayPlayers(result);
    }

    function resetAllFilters() {
        const allClubs = dropdownMenu.querySelector('[data-club="all"]');
        setClubFilter(allClubs);
        selectedPosition = "all";
        searchTerm = "";
        searchInput.value = "";
        sortOrder = "desc";
        sortToggle.dataset.order = sortOrder;
        sortToggle.querySelector(".sort-arrow").textContent = "↓";
        sortToggle.setAttribute("aria-label", "Trier par valeur décroissante");

        positionFilters.querySelectorAll("button").forEach(button => {
            const active = button.dataset.position === "all";
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        updatePlayers();
    }

    // Données de synthèse de l'en-tête.
    const totalValue = PLAYERS.reduce((total, player) => total + player.value, 0);
    const featuredPlayer = [...PLAYERS]
        .sort((a, b) => b.value - a.value)
        .find(player => Number(player.value) > 0) || null;
    document.getElementById("playersTotal").textContent = String(PLAYERS.length).padStart(2, "0");
    document.getElementById("playersValue").textContent = `${compactValue(totalValue)} ¥`;
    if (featuredPlayer) {
        document.getElementById("featuredPlayerName").textContent = featuredPlayer.name;
        document.getElementById("featuredPlayerValue").textContent = `${formatValue(featuredPlayer.value)} ¥`;
    } else {
        document.getElementById("featuredPlayerName").textContent = "NON ATTRIBUÉ";
        document.getElementById("featuredPlayerValue").textContent = "AUCUNE VALEUR";
    }

    dropdownCurrent.addEventListener("click", event => {
        event.stopPropagation();
        const open = !clubDropdown.classList.contains("open");
        clubDropdown.classList.toggle("open", open);
        dropdownCurrent.setAttribute("aria-expanded", String(open));
    });

    dropdownMenu.querySelectorAll(".dropdown-option").forEach(option => {
        option.addEventListener("click", () => {
            setClubFilter(option);
            closeClubDropdown();
            updatePlayers();
        });
    });

    document.addEventListener("click", event => {
        if (!clubDropdown.contains(event.target)) closeClubDropdown();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeClubDropdown();
    });

    positionFilters.addEventListener("click", event => {
        const button = event.target.closest("[data-position]");
        if (!button) return;

        selectedPosition = button.dataset.position;
        positionFilters.querySelectorAll("button").forEach(item => {
            const active = item === button;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });
        updatePlayers();
    });

    searchInput.addEventListener("input", () => {
        searchTerm = searchInput.value;
        updatePlayers();
    });

    sortToggle.addEventListener("click", () => {
        sortOrder = sortOrder === "desc" ? "asc" : "desc";
        sortToggle.dataset.order = sortOrder;
        sortToggle.querySelector(".sort-arrow").textContent = sortOrder === "desc" ? "↓" : "↑";
        sortToggle.setAttribute(
            "aria-label",
            sortOrder === "desc" ? "Trier par valeur décroissante" : "Trier par valeur croissante"
        );
        updatePlayers();
    });

    resetFilters.addEventListener("click", resetAllFilters);

    // Un lien players.html?club=xxx pré-sélectionne toujours l'effectif demandé.
    const urlClub = new URLSearchParams(window.location.search).get("club");
    if (urlClub) {
        const matchingOption = dropdownMenu.querySelector(`.dropdown-option[data-club="${urlClub}"]`);
        if (matchingOption) setClubFilter(matchingOption);
    }

    updatePlayers();
});
