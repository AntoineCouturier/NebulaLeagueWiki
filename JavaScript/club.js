// club.js - Page Clubs (concept "Écran de sélection d'équipe")
// Les clubs, logos, couleurs et styles proviennent de JavaScript/nebula-data.js.
// Les effectifs sont générés automatiquement depuis PLAYERS (players.js) à partir
// du club et du poste de chaque joueur. Le centre tactique, le terrain, les compteurs,
// les liens et les valeurs se mettent ensuite à jour sans composition manuelle ici.

const CLUBS = (window.NEBULA_DATA?.clubs || []).map(club => ({
    ...club,
    standings: window.NEBULA_DATA?.getClubMatchStats?.(club.key)
        || { played: 0, points: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 },
    titles: window.NEBULA_DATA?.getClubTitleCount?.(club.key) || 0
}));
const ACTIVE_SEASON = window.NEBULA_DATA?.getActiveSeason?.() || null;

const CLUB_ROLES = ["CF", "LW", "RW", "CM"];

function buildClubRoster(clubKey) {
    const roster = Object.fromEntries(CLUB_ROLES.map(role => [role, null]));
    if (typeof PLAYERS === "undefined") return roster;

    PLAYERS
        .filter(player => player.club === clubKey)
        .forEach(player => {
            const role = String(player.position || "").toUpperCase();
            if (!CLUB_ROLES.includes(role) || roster[role]) return;

            roster[role] = {
                name: player.name,
                href: window.NEBULA_DATA.playerPageHref(player)
            };
        });

    return roster;
}

CLUBS.forEach(club => {
    club.roster = buildClubRoster(club.key);
});

// Position des 4 postes sur le mini-terrain (en % du conteneur)
const PITCH_POSITIONS = {
    CF: { top: "18%", left: "50%" },
    LW: { top: "34%", left: "16%" },
    RW: { top: "34%", left: "84%" },
    CM: { top: "74%", left: "50%" }
};

const ROLE_LABEL = { CF: "CF", LW: "LW", RW: "RW", CM: "CM" };

document.addEventListener("DOMContentLoaded", () => {

    const tabs = document.getElementById("clubTabs");
    const stageField = document.getElementById("clubStageField");
    const stageDossier = document.getElementById("clubStageDossier");
    const modal = document.getElementById("clubModal");
    const modalContent = document.getElementById("clubModalContent");
    if (!tabs || !stageField || !stageDossier || !modal) return;

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

    function clubIndex(club) {
        return String(CLUBS.indexOf(club) + 1).padStart(2, "0");
    }

    function formatValue(value) {
        if (value >= 1000000000) {
            return `${(value / 1000000000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} B`;
        }
        if (value >= 1000000) {
            return `${(value / 1000000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} K`;
        }
        return value.toLocaleString("fr-FR");
    }

    /* ============================================================
       TERRAIN VISUEL (centre tactique et modal)
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
                <span class="pitch-dot" style="--slot-color:${club.color};"><span>${ROLE_LABEL[role]}</span></span>
                ${nameHTML}
            </div>`;
        }).join("");

        return `<div class="club-pitch ${big ? "club-pitch-big" : "club-pitch-mini"}">
            <div class="pitch-lines"></div>
            ${slots}
        </div>`;
    }

    function renderClubTabs(activeKey) {
        tabs.innerHTML = CLUBS.map(club => {
            const count = filledCount(club.roster);
            const active = club.key === activeKey;
            return `
                <button type="button" class="club-tab ${active ? "active" : ""}" data-select-club="${club.key}"
                    style="--club-color:${club.color};" aria-pressed="${active}">
                    <span>${clubIndex(club)}</span>
                    <img src="${club.logo}" alt="" onerror="this.style.visibility='hidden'">
                    <div><strong>${club.name}</strong><small>${count}/4 JOUEURS</small></div>
                </button>
            `;
        }).join("");
    }

    function renderStage(club) {
        const count = filledCount(club.roster);
        const openSlots = 4 - count;
        const value = formatValue(clubValue(club.key));
        const s = club.standings;

        stageField.style.setProperty("--club-color", club.color);
        stageDossier.style.setProperty("--club-color", club.color);
        stageField.innerHTML = `
            <div class="stage-field-topline">
                <span>FORMATION // 3–0–1</span>
                <span>${count}/4 POSTES OCCUPÉS</span>
            </div>
            ${renderPitch(club, true)}
            <div class="stage-field-footer">
                <span><i></i> JOUEUR ENREGISTRÉ</span>
                <span><i></i> POSTE VACANT</span>
            </div>
        `;

        stageDossier.innerHTML = `
            <div class="stage-dossier-topline">
                <span>DOSSIER // ${clubIndex(club)}</span>
                <span class="stage-sync"><i></i> SYNCHRONISÉ</span>
            </div>
            <div class="stage-club-identity">
                <img src="${club.logo}" alt="${club.name}" onerror="this.style.visibility='hidden'">
                <div><small>${club.fullName || "NEBULA LEAGUE CLUB"}</small><h3>${club.name}</h3></div>
            </div>
            <blockquote>${club.style}</blockquote>
            <div class="stage-data-grid">
                <div><small>JOUEURS</small><strong>${count}<span>/04</span></strong></div>
                <div><small>POSTES LIBRES</small><strong>${openSlots}</strong></div>
                <div><small>POINTS</small><strong>${s.points}</strong></div>
                <div class="stage-value"><small>VALEUR</small><strong>${value}<span>¥</span></strong></div>
            </div>
            <div class="stage-roster">
                <small>COMPOSITION ACTIVE</small>
                ${renderRosterList(club)}
            </div>
            <div class="stage-actions">
                <a href="players.html?club=${club.key}">VOIR LES JOUEURS <span>→</span></a>
            </div>
        `;
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
        const value = formatValue(clubValue(club.key));
        const count = filledCount(club.roster);

        modalContent.innerHTML = `
            <div class="modal-file-topline">
                <span>CLUB DOSSIER // ${clubIndex(club)}</span>
                <span><i></i> ARCHIVE ACTIVE</span>
            </div>
            <div class="modal-club-head">
                <img src="${club.logo}" alt="${club.name}" class="modal-club-logo" onerror="this.style.visibility='hidden'">
                <div>
                    <small>${club.fullName || "NEBULA LEAGUE CLUB"}</small>
                    <h2 class="modal-club-name ${club.cls}">${club.name}</h2>
                </div>
                ${club.titles > 0 ? `<span class="modal-title-badge">${club.titles} TITRE${club.titles > 1 ? "S" : ""}</span>` : ""}
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

                    <h4 style="margin-top:22px;">Statistiques — Saison ${ACTIVE_SEASON?.number ?? "en cours"}</h4>
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

    let lastFocusedElement = null;

    function syncClubUrl(clubKey) {
        const url = new URL(window.location.href);
        if (clubKey) {
            url.searchParams.set("club", clubKey);
        } else {
            url.searchParams.delete("club");
        }
        window.history.replaceState({}, "", url);
    }

    function openModal(clubKey, updateUrl = true) {
        const club = CLUBS.find(c => c.key === clubKey);
        if (!club) return;

        selectClub(club.key);
        lastFocusedElement = document.activeElement;
        renderModal(club);
        modal.style.setProperty("--club-color", club.color);
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("club-modal-open");
        if (updateUrl) syncClubUrl(club.key);

        requestAnimationFrame(() => {
            document.getElementById("clubModalCloseX").focus();
        });
    }

    function closeModal() {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("club-modal-open");
        syncClubUrl(null);

        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
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
    const totalSlots = CLUBS.length * Object.keys(PITCH_POSITIONS).length;
    const registeredPlayers = typeof PLAYERS === "undefined"
        ? 0
        : PLAYERS.filter(player => CLUBS.some(club => club.key === player.club)).length;
    const occupiedSlots = CLUBS.reduce((total, club) => total + filledCount(club.roster), 0);
    document.getElementById("clubCount").textContent = String(CLUBS.length).padStart(2, "0");
    document.getElementById("registeredCount").textContent = String(registeredPlayers).padStart(2, "0");
    document.getElementById("openSlotCount").textContent = String(totalSlots - occupiedSlots).padStart(2, "0");

    function selectClub(clubKey) {
        const club = CLUBS.find(item => item.key === clubKey) || CLUBS[0];
        renderClubTabs(club.key);
        renderStage(club);
    }

    tabs.addEventListener("click", event => {
        const button = event.target.closest("[data-select-club]");
        if (!button) return;
        selectClub(button.dataset.selectClub);
    });

    const requestedClub = new URLSearchParams(window.location.search).get("club");
    const initialClub = CLUBS.some(club => club.key === requestedClub) ? requestedClub : CLUBS[0].key;
    selectClub(initialClub);
    if (requestedClub && requestedClub === initialClub) {
        openModal(requestedClub, false);
    }
});
