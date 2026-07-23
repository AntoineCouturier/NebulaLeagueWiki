// saison.js - Historique des Saisons (version data-driven)
// Pour ajouter une nouvelle saison : dupliquer un objet dans SEASONS ci-dessous,
// changer les valeurs, et tout (timeline, carte, podium, popup) se génère tout seul.

document.addEventListener('DOMContentLoaded', function () {

    /* ============================================================
       0. RÉFÉRENTIEL CLUBS (logos + noms affichés)
       ============================================================ */
    const CLUB_META = {
        bastard: { name: "Bastard München", logo: "images/clubs_icon/Bastard_Munchen.png", cls: "bastard" },
        pxg: { name: "PXG", logo: "images/clubs_icon/PXG.png", cls: "pxg" },
        ubers: { name: "Ubers", logo: "images/clubs_icon/Ubers.png", cls: "ubers" },
        barcha: { name: "Barcha", logo: "images/clubs_icon/Barcha.png", cls: "barcha" },
        manshine: { name: "Manshine City", logo: "images/clubs_icon/Manshine_City.png", cls: "manshine" }
    };

    function club(key) {
        return CLUB_META[key] || { name: key || "???", logo: "", cls: "" };
    }

    function clubBadge(key, size = 22) {
        const c = club(key);
        if (!c.logo) return "";
        return `<img src="${c.logo}" class="club-badge" style="width:${size}px;height:${size}px" alt="" onerror="this.style.display='none'">`;
    }

    /* ============================================================
       1. DONNÉES DES SAISONS
       ============================================================ */
    const SEASONS = [
        {
            id: "s0",
            number: 0,
            status: "finished", // "active" | "finished"
            startDate: "2022-03-25",
            endDate: "2022-04-01",

            standings: [
                { club: "ubers", pts: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 },
                { club: "bastard", pts: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 },
                { club: "pxg", pts: 0, gf: 2, ga: 13, w: 0, d: 0, l: 1 },
                { club: "barcha", pts: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 },
                { club: "manshine", pts: 3, gf: 13, ga: 2, w: 1, d: 0, l: 0 }
            ],

            // ---- Top Buteurs : 1 ligne = 1 joueur. Édite les valeurs, pas besoin de garder 5 lignes,
            //      tu peux en supprimer ou en ajouter (le rang "rank" doit juste être unique).
            //      "club" = clé parmi bastard / pxg / ubers / barcha / manshine (ou null si inconnu).
            topScorers: [
                { rank: 1, name: "Dylan", club: "Manshine City", goals: 6, matches: 1, avg: 6 },
                { rank: 2, name: "Antoine", club: "Manshine City", goals: 5, matches: 1, avg: 5 },
                { rank: 3, name: "Theo", club: "Manshine City", goals: 2, matches: 1, avg: 2 },
                { rank: 4, name: "Jason", club: "PXG", goals: 1, matches: 1, avg: 1 },
                { rank: 5, name: "Enzo", club: "PXG", goals: 1, matches: 1, avg: 1 }
            ],

            // ---- Top Passeurs
            topAssists: [
                { rank: 1, name: "Antoine", club: "Manshine City", assists: 7, matches: 1, avg: 7 },
                { rank: 2, name: "Theo", club: "Manshine City", assists: 4, matches: 1, avg: 4 },
                { rank: 3, name: "Dylan", club: "Manshine City", assists: 1, matches: 1, avg: 1 },
                { rank: 4, name: "Jason", club: "PXG", assists: 1, matches: 1, avg: 1 },
                { rank: 5, name: "Amar", club: "PXG", assists: 1, matches: 1, avg: 1 }
            ],

            // ---- Top Buts + Passes Décisives cumulés
            topGA: [
                { rank: 1, name: "Antoine", club: "Manshine City", ga: 12, matches: 1, avg: 12 },
                { rank: 2, name: "Dylan", club: "Manshine City", ga: 7, matches: 1, avg: 7 },
                { rank: 3, name: "Theo", club: "Manshine City", ga: 6, matches: 1, avg: 6 },
                { rank: 4, name: "Jason", club: "PXG", ga: 2, matches: 1, avg: 2 },
                { rank: 5, name: "Enzo", club: "PXG", ga: 1, matches: 1, avg: 1 }
            ],

            rewards: {
                puskas: { icon: "🥅", label: "Prix Puskas", value: "???" },
                goldenShoe: { icon: "👟", label: "Soulier d'Or", value: "???" },
                nclClub: { icon: "🏆", label: "Club gagnant NCL", value: "???" },
                ballonOr: { icon: "🌟", label: "Ballon d'Or", value: "???" }
            }
        },
        {
            id: "s1",
            number: 1,
            status: "active", // "active" | "finished"
            startDate: "2026-01-10",
            endDate: null,

            standings: [
                { club: "ubers", pts: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 },
                { club: "bastard", pts: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 },
                { club: "pxg", pts: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 },
                { club: "barcha", pts: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 },
                { club: "manshine", pts: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 }
            ],

            // ---- Top Buteurs : 1 ligne = 1 joueur. Édite les valeurs, pas besoin de garder 5 lignes,
            //      tu peux en supprimer ou en ajouter (le rang "rank" doit juste être unique).
            //      "club" = clé parmi bastard / pxg / ubers / barcha / manshine (ou null si inconnu).
            topScorers: [
                { rank: 1, name: "???", club: null, goals: 0, matches: 0, avg: 0 },
                { rank: 2, name: "???", club: null, goals: 0, matches: 0, avg: 0 },
                { rank: 3, name: "???", club: null, goals: 0, matches: 0, avg: 0 },
                { rank: 4, name: "???", club: null, goals: 0, matches: 0, avg: 0 },
                { rank: 5, name: "???", club: null, goals: 0, matches: 0, avg: 0 }
            ],

            // ---- Top Passeurs
            topAssists: [
                { rank: 1, name: "???", club: null, assists: 0, matches: 0, avg: 0 },
                { rank: 2, name: "???", club: null, assists: 0, matches: 0, avg: 0 },
                { rank: 3, name: "???", club: null, assists: 0, matches: 0, avg: 0 },
                { rank: 4, name: "???", club: null, assists: 0, matches: 0, avg: 0 },
                { rank: 5, name: "???", club: null, assists: 0, matches: 0, avg: 0 }
            ],

            // ---- Top Buts + Passes Décisives cumulés
            topGA: [
                { rank: 1, name: "???", club: null, ga: 0, matches: 0, avg: 0 },
                { rank: 2, name: "???", club: null, ga: 0, matches: 0, avg: 0 },
                { rank: 3, name: "???", club: null, ga: 0, matches: 0, avg: 0 },
                { rank: 4, name: "???", club: null, ga: 0, matches: 0, avg: 0 },
                { rank: 5, name: "???", club: null, ga: 0, matches: 0, avg: 0 }
            ],

            rewards: {
                puskas: { icon: "🥅", label: "Prix Puskas", value: "???" },
                goldenShoe: { icon: "👟", label: "Soulier d'Or", value: "???" },
                nclClub: { icon: "🏆", label: "Club gagnant NCL", value: "???" },
                ballonOr: { icon: "🌟", label: "Ballon d'Or", value: "???" }
            }
        }

        // Coller une nouvelle saison ici : { id:"s2", number:2, status:"finished", ... }
    ];

    /* ============================================================
       2. UTILITAIRES
       ============================================================ */
    function fmtDateRange(start, end) {
        const f = (str) => {
            if (!str) return "??/??/????";
            const [y, m, d] = str.split("-");
            return `${d}/${m}/${y}`;
        };
        return `du ${f(start)} au ${end ? f(end) : "??/??/????"}`;
    }

    function diff(row) { return row.gf - row.ga; }

    function sortedStandings(standings) {
        return [...standings].sort((a, b) => b.pts - a.pts || diff(b) - diff(a) || b.gf - a.gf);
    }

    /* ============================================================
       3. PODIUM (top 3 du classement)
       ============================================================ */
    function renderPodium(standings) {
        const ranked = sortedStandings(standings).slice(0, 3);
        // Ordre visuel : 2e - 1er - 3e
        const order = [ranked[1], ranked[0], ranked[2]];
        const medalByPos = { 0: "🥈", 1: "🥇", 2: "🥉" };
        const slotClass = { 0: "podium-2", 1: "podium-1", 2: "podium-3" };

        return `
        <div class="podium">
            ${order.map((row, idx) => {
            if (!row) return `<div class="podium-slot ${slotClass[idx]} podium-empty"><span class="podium-medal">${medalByPos[idx]}</span><span class="podium-empty-label">—</span></div>`;
            const c = club(row.club);
            return `
                <div class="podium-slot ${slotClass[idx]}">
                    <span class="podium-medal">${medalByPos[idx]}</span>
                    ${c.logo ? `<img src="${c.logo}" class="podium-logo" alt="" onerror="this.style.display='none'">` : ""}
                    <span class="podium-club ${c.cls}">${c.name}</span>
                    <span class="podium-pts">${row.pts} pts</span>
                </div>`;
        }).join("")}
        </div>`;
    }

    /* ============================================================
       4. CARTE DE SAISON (fermée)
       ============================================================ */
    function renderRewardCards(rewards) {
        return `
        <div class="reward-cards">
            ${Object.values(rewards).map(r => `
                <div class="reward-card">
                    <span class="reward-icon">${r.icon}</span>
                    <span class="reward-label">${r.label}</span>
                    <span class="reward-value">${r.value}</span>
                </div>
            `).join("")}
        </div>`;
    }

    function renderSeasonCard(season) {
        const isActive = season.status === "active";
        const statusBadge = isActive
            ? `<span class="season-status-badge live">● En Cours</span>`
            : `<span class="season-status-badge finished">Terminée</span>`;

        return `
        <div class="season-card" id="card-${season.id}" data-season-id="${season.id}" data-start="${season.startDate}">
            <div class="season-card-header">
                <div class="season-card-heading">
                    ${statusBadge}
                    <h2>Saison ${season.number}</h2>
                </div>
                <span class="season-dates">${fmtDateRange(season.startDate, season.endDate)}</span>
            </div>

            ${renderPodium(season.standings)}

            ${renderRewardCards(season.rewards)}

            <button class="details-btn" data-popup="popup-${season.id}">Détails de la saison</button>
        </div>`;
    }

    /* ============================================================
       5. TIMELINE (colonne de gauche)
       ============================================================ */
    function renderTimeline(seasons) {
        const track = document.querySelector('#seasonTimeline .timeline-track');
        seasons.forEach(season => {
            const node = document.createElement('button');
            node.type = "button";
            node.className = "timeline-node" + (season.status === "active" ? " active-season" : "");
            node.dataset.target = `card-${season.id}`;
            node.innerHTML = `
                <span class="timeline-dot"></span>
                <span class="timeline-label">Saison ${season.number}</span>
                <span class="timeline-sub">${season.status === "active" ? "En cours" : "Terminée"}</span>
            `;
            node.addEventListener('click', () => {
                const target = document.getElementById(`card-${season.id}`);
                if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                    target.classList.add("pulse-highlight");
                    setTimeout(() => target.classList.remove("pulse-highlight"), 900);
                }
                document.querySelectorAll('.timeline-node').forEach(n => n.classList.remove('selected'));
                node.classList.add('selected');
            });
            document.getElementById('seasonTimeline').appendChild(node);
        });
    }

    /* ============================================================
       6. TABLEAUX DU POPUP (classement détaillé + top joueurs)
       ============================================================ */
    function renderStandingsTable(standings) {
        const ranked = sortedStandings(standings);
        const rows = ranked.map((row, i) => {
            const c = club(row.club);
            const champion = i === 0 ? " champion-row" : "";
            return `
            <tr class="${champion}">
                <td>${i + 1}</td>
                <td class="${c.cls}">${clubBadge(row.club)} ${c.name}</td>
                <td>${row.pts}</td>
                <td>${row.gf}</td>
                <td>${row.ga}</td>
                <td>${diff(row) > 0 ? "+" : ""}${diff(row)}</td>
                <td>${row.w}/${row.d}/${row.l}</td>
            </tr>`;
        }).join("");

        return `
        <table class="season-table">
            <thead>
                <tr>
                    <th>#</th><th>Équipe</th><th>Points</th><th>Buts M.</th><th>Buts E.</th><th>Diff.</th><th>V/N/D</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
    }

    function renderPlayersTable(list, statKey, statLabel) {
        const rows = list.map(p => {
            const c = p.club ? club(p.club) : null;
            const champion = p.rank === 1 ? " champion-row" : "";
            return `
            <tr class="${champion}">
                <td>${p.rank}</td>
                <td>${p.name}</td>
                <td>${c ? `${clubBadge(p.club, 18)} ${c.name}` : "???"}</td>
                <td>${p[statKey]}</td>
                <td>${p.matches}</td>
                <td>${p.avg}</td>
            </tr>`;
        }).join("");

        return `
        <table class="season-table">
            <thead>
                <tr><th>Rang</th><th>Joueur</th><th>Équipe</th><th>${statLabel}</th><th>Matchs</th><th>Moyenne</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
    }

    /* ============================================================
       7. POPUP DE SAISON
       ============================================================ */
    function renderSeasonPopup(season) {
        return `
        <div class="popup-bg" id="popup-${season.id}">
            <div class="popup-box">
                <h3>Saison ${season.number} (${fmtDateRange(season.startDate, season.endDate)})</h3>

                <div class="popup-content">

                    <div class="season-section">
                        <h4 class="leaderboard">🏅 Podium</h4>
                        ${renderPodium(season.standings)}
                    </div>

                    <div class="season-section">
                        <h4 class="leaderboard">Classement détaillé</h4>
                        ${renderStandingsTable(season.standings)}
                    </div>

                    <div class="season-section">
                        <h4 class="goal">Top Buteurs</h4>
                        ${renderPlayersTable(season.topScorers, "goals", "Buts")}
                    </div>

                    <div class="season-section">
                        <h4 class="assist">Top Passeurs</h4>
                        ${renderPlayersTable(season.topAssists, "assists", "Passes Déci")}
                    </div>

                    <div class="season-section">
                        <h4 class="goal-assist">Top Goals/Assists</h4>
                        ${renderPlayersTable(season.topGA, "ga", "G/A")}
                    </div>

                </div>

                <button class="close-btn">Fermer</button>
            </div>
        </div>`;
    }

    /* ============================================================
       8. INITIALISATION
       ============================================================ */
    const cardsContainer = document.getElementById('seasonCardsContainer');
    const popupsContainer = document.getElementById('seasonPopupsContainer');

    // Tri : saison la plus récente en premier
    const orderedSeasons = [...SEASONS].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    orderedSeasons.forEach(season => {
        cardsContainer.insertAdjacentHTML('beforeend', renderSeasonCard(season));
        popupsContainer.insertAdjacentHTML('beforeend', renderSeasonPopup(season));
    });

    renderTimeline(orderedSeasons);

    // Sélectionne la saison active dans la timeline par défaut
    const firstActiveNode = document.querySelector('.timeline-node.active-season') || document.querySelector('.timeline-node');
    if (firstActiveNode) firstActiveNode.classList.add('selected');

    /* ---------------- Gestion des popups (ouverture / fermeture) ---------------- */
    document.querySelectorAll(".details-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const popup = document.getElementById(button.dataset.popup);
            if (!popup) return;
            popup.style.display = "flex";
            const popupContent = popup.querySelector('.popup-content');
            if (popupContent) popupContent.scrollTop = 0;
        });
    });

    function closePopup(popup) {
        if (!popup) return;
        popup.style.display = "none";
    }

    document.querySelectorAll(".close-btn").forEach(btn => {
        btn.addEventListener("click", () => closePopup(btn.closest(".popup-bg")));
    });

    document.querySelectorAll(".popup-bg").forEach(p => {
        p.addEventListener("click", e => { if (e.target === p) closePopup(p); });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.popup-bg').forEach(p => {
                if (p.style.display === 'flex') closePopup(p);
            });
        }
    });

    /* ---------------- Animation d'entrée en cascade pour les cartes ---------------- */
    document.querySelectorAll('.season-card').forEach((card, i) => {
        card.style.animationDelay = `${i * 0.12}s`;
    });
});