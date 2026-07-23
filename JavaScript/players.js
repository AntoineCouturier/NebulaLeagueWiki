// ============================================================
// SOURCE UNIQUE DE VÉRITÉ : liste des joueurs (nom, club, valeur...)
// Déclarée en dehors du DOMContentLoaded pour être réutilisable
// par d'autres pages (ex: club.js calcule la valeur totale d'un club
// à partir de ce même tableau, au lieu d'en garder une copie séparée).
// ============================================================
const PLAYERS = [
    /* Bastard Munchen */
    { name: "Dylan", club: "bastard", folder: "bm", clubName: "Bastard Munchen", position: "RW", value: 9300000, avatar: "Joueurs/images-joueurs/dylan.jpeg" },
    { name: "Antoine", club: "bastard", folder: "bm", clubName: "Bastard Munchen", position: "CM", value: 18250000, avatar: "Joueurs/images-joueurs/anto.png" },
    { name: "Alessio", club: "bastard", folder: "bm", clubName: "Bastard Munchen", position: "CF", value: 0, avatar: "Joueurs/images-joueurs/alessio.png" },

    /* PXG */
    { name: "Jason", club: "pxg", folder: "pxg", clubName: "PXG", position: "CF", value: 2450000, avatar: "Joueurs/images-joueurs/Jason.png" },
    { name: "Enzo", club: "pxg", folder: "pxg", clubName: "PXG", position: "CM", value: 2150000, avatar: "Joueurs/images-joueurs/enzo.png" },

    /* Manshine */
    { name: "William", club: "manshine", folder: "manshine", clubName: "Manshine City", position: "CF", value: 0, avatar: "Joueurs/images-joueurs/william.png" },
    { name: "Imrane", club: "manshine", folder: "manshine", clubName: "Manshine City", position: "LW", value: 0, avatar: "Joueurs/images-joueurs/imrane.png" },
    { name: "Elijah", club: "manshine", folder: "manshine", clubName: "Manshine City", position: "RW", value: 0, avatar: "Joueurs/images-joueurs/elijah.png" },

    /* Ubers */

    /* Barcha */

    /* Retraite */
    { name: "Matheo", club: "retraite", folder: "retraite", clubName: "Retraite", position: "CM", value: 0, avatar: "Joueurs/images-joueurs/matheo.png" },
    { name: "Theo", club: "retraite", folder: "retraite", clubName: "Retraite", position: "RW", value: 7500000, avatar: "Joueurs/images-joueurs/theo.png" }
];

// Logo de club associé à chaque valeur de filtre (utilisé pour le badge en filigrane sur la carte)
const CLUB_LOGOS = {
    bastard: "images/clubs_icon/Bastard_Munchen.png",
    pxg: "images/clubs_icon/PXG.png",
    ubers: "images/clubs_icon/Ubers.png",
    barcha: "images/clubs_icon/Barcha.png",
    manshine: "images/clubs_icon/Manshine_City.png",
    retraite: null // pas de logo pour Retraite
};

document.addEventListener("DOMContentLoaded", () => {

    // Le reste de ce fichier ne concerne que la page players.html.
    // On ne l'exécute que si ses éléments existent (ex: club.js charge aussi
    // ce fichier juste pour le tableau PLAYERS, sans avoir cette page).
    const container = document.getElementById("playersContainer");
    if (!container) return;

    const countEl = document.getElementById("playersCount");
    const clubDropdown = document.getElementById("clubDropdown");
    const dropdownCurrent = document.getElementById("dropdownCurrent");
    const dropdownLabel = dropdownCurrent.querySelector(".dropdown-current-label");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const sortToggle = document.getElementById("sortToggle");

    let selectedClub = "all";
    let sortOrder = "desc"; // desc par défaut, comme avant

    function displayPlayers(list) {
        container.innerHTML = "";

        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p class="empty-state-title">Aucun joueur pour ce club</p>
                    <p class="empty-state-sub">Reviens plus tard, l'effectif n'est pas encore complet.</p>
                </div>
            `;
            return;
        }

        list.forEach(p => {
            const card = document.createElement("a");
            card.classList.add("player-card", p.club);
            card.href = `Joueurs/${p.folder}/${p.name.toLowerCase()}.html`;

            const formattedValue = p.value.toLocaleString("en-US");
            const priceHTML = p.value === 0
                ? `<span class="price-number zero-value">${formattedValue}</span>¥💎`
                : `<span class="price-number">${formattedValue}</span>¥💎`;

            const logo = CLUB_LOGOS[p.club];
            const logoHTML = logo
                ? `<img src="${logo}" class="card-club-badge" alt="" onerror="this.style.display='none'">`
                : "";

            card.innerHTML = `
                ${logoHTML}
                <div class="avatar-wrap">
                    <img src="${p.avatar}" alt="${p.name}">
                    <span class="position-pill position-${p.position.toLowerCase()}">${p.position}</span>
                </div>
                <h3>${p.name}</h3>
                <p class="card-club-name">${p.clubName}</p>
                <p>Valeur: ${priceHTML}</p>
            `;

            container.appendChild(card);
        });
    }

    function updatePlayers() {
        let result = PLAYERS.filter(p =>
            selectedClub === "all" ? true : p.club === selectedClub
        );

        result.sort((a, b) =>
            sortOrder === "asc" ? a.value - b.value : b.value - a.value
        );

        countEl.textContent = result.length === 0
            ? ""
            : `${result.length} joueur${result.length > 1 ? "s" : ""} affiché${result.length > 1 ? "s" : ""}`;

        displayPlayers(result);
    }

    // Dropdown club : ouverture/fermeture
    dropdownCurrent.addEventListener("click", (e) => {
        e.stopPropagation();
        clubDropdown.classList.toggle("open");
    });

    // Sélection d'une option
    dropdownMenu.querySelectorAll(".dropdown-option").forEach(opt => {
        opt.addEventListener("click", () => {
            dropdownMenu.querySelectorAll(".dropdown-option").forEach(o => o.classList.remove("active"));
            opt.classList.add("active");

            selectedClub = opt.dataset.club;
            dropdownLabel.textContent = opt.dataset.label;

            // Recopie l'icône du club choisi (s'il y en a une) à côté du label du bouton
            const icon = opt.querySelector(".filter-icon");
            const existingIcon = dropdownCurrent.querySelector(".dropdown-current-icon");
            if (existingIcon) existingIcon.remove();
            if (icon) {
                const clone = icon.cloneNode(true);
                clone.classList.add("dropdown-current-icon");
                dropdownCurrent.querySelector(".dropdown-current-content").prepend(clone);
            }

            clubDropdown.classList.remove("open");
            updatePlayers();
        });
    });

    // Ferme le dropdown si on clique ailleurs sur la page
    document.addEventListener("click", (e) => {
        if (!clubDropdown.contains(e.target)) {
            clubDropdown.classList.remove("open");
        }
    });

    // Tri : un seul bouton qui inverse l'ordre à chaque clic
    sortToggle.addEventListener("click", () => {
        sortOrder = sortOrder === "desc" ? "asc" : "desc";
        sortToggle.dataset.order = sortOrder;
        sortToggle.querySelector(".sort-arrow").textContent = sortOrder === "desc" ? "↓" : "↑";
        updatePlayers();
    });

    // Arrivée depuis la page Clubs (lien "Voir l'effectif complet") : ?club=xxx
    // pré-sélectionne le club correspondant dans le dropdown au chargement.
    const urlClub = new URLSearchParams(window.location.search).get("club");
    if (urlClub) {
        const matchingOption = dropdownMenu.querySelector(`.dropdown-option[data-club="${urlClub}"]`);
        if (matchingOption) {
            dropdownMenu.querySelectorAll(".dropdown-option").forEach(o => o.classList.remove("active"));
            matchingOption.classList.add("active");
            selectedClub = matchingOption.dataset.club;
            dropdownLabel.textContent = matchingOption.dataset.label;

            const icon = matchingOption.querySelector(".filter-icon");
            if (icon) {
                const clone = icon.cloneNode(true);
                clone.classList.add("dropdown-current-icon");
                dropdownCurrent.querySelector(".dropdown-current-content").prepend(clone);
            }
        }
    }

    updatePlayers();
});