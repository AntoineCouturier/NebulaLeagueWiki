// club.js - Page Clubs (concept "Écran de sélection d'équipe")
// SOURCE UNIQUE DE VÉRITÉ des clubs : logos, effectif, style de jeu, stats de saison.
// Pour modifier un club (roster, style, points...) : édite l'objet CLUBS ci-dessous,
// tout le reste (carte, terrain visuel, modal, comptage) se régénère tout seul.
// Le tableau PLAYERS (players.js, chargé avant ce fichier) reste la seule source
// de vérité pour les VALEURS des joueurs : ce fichier ne fait que les additionner.

const CLUBS = [
    {
        key: "bastard",
        name: "Bastard München",
        logo: "images/clubs_icon/Bastard_Munchen.png",
        cls: "bastard",
        color: "var(--bastard-color)",
        titles: 0,
        roster: {
            CF: { name: "Alessio", href: "Joueurs/bm/alessio.html" },
            LW: null,
            RW: { name: "Dylan", href: "Joueurs/bm/dylan.html" },
            CM: { name: "Antoine", href: "Joueurs/bm/antoine.html" }
        },
        style: "Le Bastard Munchen utilise Antoine en pivot pendant que les 2 autres attaquants font confiance pour recevoir la passe au moment décisif.",
        standings: { points: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
    },
    {
        key: "pxg",
        name: "PXG",
        fullName: "Paris X Gen",
        logo: "images/clubs_icon/PXG.png",
        cls: "pxg",
        color: "var(--pxg-color)",
        titles: 0,
        roster: {
            CF: { name: "Jason", href: "Joueurs/pxg/jason.html" },
            LW: null,
            RW: null,
            CM: { name: "Enzo", href: "Joueurs/pxg/enzo.html" }
        },
        style: "Le PXG n'a pas encore de style de jeu fixe.",
        standings: { points: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
    },
    {
        key: "ubers",
        name: "Ubers",
        logo: "images/clubs_icon/Ubers.png",
        cls: "ubers",
        color: "var(--ubers-color)",
        titles: 0,
        roster: { CF: null, LW: null, RW: null, CM: null },
        style: "Les Ubers n'ont pas encore de style de jeu fixe.",
        standings: { points: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
    },
    {
        key: "barcha",
        name: "Barcha",
        logo: "images/clubs_icon/Barcha.png",
        cls: "barcha",
        color: "var(--barcha-color)",
        titles: 0,
        roster: { CF: null, LW: null, RW: null, CM: null },
        style: "Le Barcha n'a pas encore de style de jeu fixe.",
        standings: { points: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
    },
    {
        key: "manshine",
        name: "Manshine City",
        logo: "images/clubs_icon/Manshine_City.png",
        cls: "manshine",
        color: "var(--manshine-color)",
        titles: 0,
        roster: {
            CF: { name: "William", href: "Joueurs/manshine/william.html" },
            LW: { name: "Imrane", href: "Joueurs/manshine/imrane.html" },
            RW: { name: "Elijah", href: "Joueurs/manshine/elijah.html" },
            CM: null
        },
        style: "Le Manshine City mise sur une attaque à 3, un vrai danger pour les défenseurs adverses, avec une équipe agressive.",
        standings: { points: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
    }
];

// Position des 4 postes sur le mini-terrain (en % du conteneur)
const PITCH_POSITIONS = {
    CF: { top: "18%", left: "50%" },
    LW: { top: "34%", left: "16%" },
    RW: { top: "34%", left: "84%" },
    CM: { top: "74%", left: "50%" }
};

const ROLE_LABEL = { CF: "CF", LW: "LW", RW: "RW", CM: "CM" };

document.addEventListener("DOMContentLoaded", () => {

    const grid = document.getElementById("clubsGrid");
    const modal = document.getElementById("clubModal");
    const modalContent = document.getElementById("clubModalContent");
    if (!grid || !modal) return;

    /* ============================================================
       UTILITAIRES
       ============================================================ */
    function clubValue(key) {
        if (typeof PLAYERS === "undefined") return 0;
        return PLAYERS.filter(p => p.club === key).reduce((sum, p) => sum + p.value, 0);
    }

    function filledCount(roster) {
        return Object.values(roster).filter(Boolean).length;
    }

    function diff(s) {
        return s.gf - s.ga;
    }

    /* ============================================================
       TERRAIN VISUEL (réutilisé en mini sur la carte, en grand dans le modal)
       ============================================================ */
    function renderPitch(club, big) {
        const slots = Object.entries(club.roster).map(([role, player]) => {
            const pos = PITCH_POSITIONS[role];
            const filled = !!player;
            const nameHTML = big
                ? (filled
                    ? `<a href="${player.href}" class="${club.cls} pitch-player-name">${player.name}</a>`
                    : `<span class="pitch-player-name pitch-vacant">Poste vacant</span>`)
                : "";

            return `
            <div class="pitch-slot ${filled ? "filled" : "vacant"} ${big ? "pitch-slot-big" : ""}"
                 style="top:${pos.top}; left:${pos.left};">
                <span class="pitch-dot" style="--slot-color:${club.color};">${ROLE_LABEL[role]}</span>
                ${nameHTML}
            </div>`;
        }).join("");

        return `<div class="club-pitch ${big ? "club-pitch-big" : "club-pitch-mini"}">
            <div class="pitch-lines"></div>
            ${slots}
        </div>`;
    }

    /* ============================================================
       CARTE CLUB (grille "sélection d'équipe")
       ============================================================ */
    function renderCard(club) {
        const count = filledCount(club.roster);
        const value = clubValue(club.key).toLocaleString("en-US");
        const titleBadge = club.titles > 0
            ? `<span class="card-title-badge">🏆 ${club.titles}</span>`
            : "";

        return `
        <button type="button" class="club-card" data-club="${club.key}" style="--club-color:${club.color};">
            ${titleBadge}
            <div class="club-card-head">
                <img src="${club.logo}" alt="${club.name}" class="club-card-logo" onerror="this.style.visibility='hidden'">
                <div class="club-card-titles">
                    <span class="club-card-name ${club.cls}">${club.name}</span>
                    ${club.fullName ? `<span class="club-card-fullname">${club.fullName}</span>` : ""}
                </div>
            </div>

            ${renderPitch(club, false)}

            <div class="club-card-stats">
                <div class="ccs-item">
                    <span class="ccs-label">Effectif</span>
                    <span class="ccs-value">${count}/4</span>
                </div>
                <div class="ccs-item">
                    <span class="ccs-label">Points</span>
                    <span class="ccs-value">${club.standings.points}</span>
                </div>
                <div class="ccs-item">
                    <span class="ccs-label">Valeur</span>
                    <span class="ccs-value">${value}¥</span>
                </div>
            </div>

            <span class="club-card-cta">Voir la fiche du club →</span>
        </button>`;
    }

    /* ============================================================
       MODAL DÉTAILLÉ
       ============================================================ */
    function renderRosterList(club) {
        const rows = Object.entries(club.roster).map(([role, player]) => `
            <li class="roster-row">
                <span class="role-badge role-${role.toLowerCase()}">${role}</span>
                ${player
                ? `<a class="${club.cls}" href="${player.href}">${player.name}</a>`
                : `<span class="empty-slot">Poste vacant</span>`}
            </li>`).join("");

        return `<ul class="roster-list">${rows}</ul>`;
    }

    function renderModal(club) {
        const s = club.standings;
        const value = clubValue(club.key).toLocaleString("en-US");
        const count = filledCount(club.roster);

        modalContent.innerHTML = `
            <div class="modal-club-head">
                <img src="${club.logo}" alt="${club.name}" class="modal-club-logo" onerror="this.style.visibility='hidden'">
                <div>
                    <h2 class="modal-club-name ${club.cls}">${club.name}</h2>
                    ${club.fullName ? `<p class="modal-club-fullname">${club.fullName}</p>` : ""}
                </div>
                ${club.titles > 0 ? `<span class="modal-title-badge">🏆 ${club.titles} titre${club.titles > 1 ? "s" : ""}</span>` : ""}
            </div>

            <div class="modal-grid">
                <div class="modal-col">
                    <h4>Formation</h4>
                    ${renderPitch(club, true)}
                </div>

                <div class="modal-col">
                    <h4>Effectif (${count}/4)</h4>
                    ${renderRosterList(club)}
                    <a class="view-roster-link" href="players.html?club=${club.key}">Voir l'effectif complet →</a>

                    <h4 style="margin-top:22px;">Statistiques — Saison en cours</h4>
                    <div class="modal-stat-grid">
                        <div class="modal-stat"><span>Points</span><strong>${s.points}</strong></div>
                        <div class="modal-stat"><span>V / N / D</span><strong>${s.w}/${s.d}/${s.l}</strong></div>
                        <div class="modal-stat"><span>Buts marqués</span><strong>${s.gf}</strong></div>
                        <div class="modal-stat"><span>Buts encaissés</span><strong>${s.ga}</strong></div>
                        <div class="modal-stat"><span>Différence</span><strong>${diff(s) > 0 ? "+" : ""}${diff(s)}</strong></div>
                        <div class="modal-stat"><span>Valeur totale</span><strong>${value}¥</strong></div>
                    </div>
                </div>
            </div>

            <div class="modal-style-block">
                <h4>Style de jeu</h4>
                <blockquote class="style-quote">${club.style}</blockquote>
            </div>
        `;
    }

    function openModal(clubKey) {
        const club = CLUBS.find(c => c.key === clubKey);
        if (!club) return;
        renderModal(club);
        modal.style.display = "flex";
    }

    function closeModal() {
        modal.style.display = "none";
    }

    document.getElementById("clubModalCloseX").addEventListener("click", closeModal);
    document.getElementById("clubModalCloseBtn").addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal.style.display === "flex") closeModal();
    });

    /* ============================================================
       RENDU INITIAL
       ============================================================ */
    grid.innerHTML = CLUBS.map(renderCard).join("");

    grid.querySelectorAll(".club-card").forEach(card => {
        card.addEventListener("click", () => openModal(card.dataset.club));
    });

    // Reveal en cascade à l'affichage
    grid.querySelectorAll(".club-card").forEach((card, i) => {
        card.style.animationDelay = `${i * 0.08}s`;
    });
});
