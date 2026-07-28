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
const CLUB_ROLES = ["CF", "LW", "RW", "LM", "RM"];
const CLUB_CAPACITY = CLUB_ROLES.length;

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

// Position des 5 postes de la formation 3–2 sur le mini-terrain (en % du conteneur)
const PITCH_POSITIONS = {
    CF: { top: "18%", left: "50%" },
    LW: { top: "34%", left: "16%" },
    RW: { top: "34%", left: "84%" },
    LM: { top: "74%", left: "30%" },
    RM: { top: "74%", left: "70%" }
};

const ROLE_LABEL = { CF: "CF", LW: "LW", RW: "RW", LM: "LM", RM: "RM" };

document.addEventListener("DOMContentLoaded", () => {

    const tabs = document.getElementById("clubTabs");
    const stageField = document.getElementById("clubStageField");
    const stageDossier = document.getElementById("clubStageDossier");
    if (!tabs || !stageField || !stageDossier) return;

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
       TERRAIN VISUEL DU CENTRE TACTIQUE
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
                    <div><strong>${club.name}</strong><small>${count}/${CLUB_CAPACITY} JOUEURS</small></div>
                </button>
            `;
        }).join("");
    }

    function renderStage(club) {
        const count = filledCount(club.roster);
        const openSlots = CLUB_CAPACITY - count;
        const value = formatValue(clubValue(club.key));
        const s = club.standings;

        stageField.style.setProperty("--club-color", club.color);
        stageDossier.style.setProperty("--club-color", club.color);
        stageField.innerHTML = `
            <div class="stage-field-topline">
                <span>FORMATION // 3–2</span>
                <span>${count}/${CLUB_CAPACITY} POSTES OCCUPÉS</span>
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
                <div><small>JOUEURS</small><strong>${count}<span>/${String(CLUB_CAPACITY).padStart(2, "0")}</span></strong></div>
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
       COMPOSITION DU CLUB
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
});
