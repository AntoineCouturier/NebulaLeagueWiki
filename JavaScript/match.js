// match.js - Historique des Matchs (concept "Match Pulse / Replay Console")
// Pour ajouter un match : dupliquer un objet dans MATCHES ci-dessous et changer les valeurs.
// Tout le reste (ticker, cartes, frise Pulse, popup, filtres) se génère automatiquement.
//
// NOTE : CLUB_META, MATCHES, MATCH_LENGTH_SECONDS et computePlayerStats sont déclarés
// hors du DOMContentLoaded (même principe que PLAYERS dans players.js) pour rester
// la SOURCE UNIQUE DE VÉRITÉ des matchs, réutilisable par d'autres pages/scripts
// (ex: headtohead.js) sans jamais dupliquer les données de matchs ailleurs.

/* ============================================================
   0. RÉFÉRENTIEL CLUBS
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

/* ============================================================
   1. DONNÉES DES MATCHS (inchangées)
   ============================================================ */
const MATCHES = [
    /* ============================================================ MATCH 1 ============================================================*/
    {
        id: "m1",
        date: "2022-04-01",
        category: "amical",
        season: 0,
        home: "manshine",
        away: "pxg",
        scoreHome: 13,
        scoreAway: 2,
        mvp: "Antoine",
        videoUrl: null,

        scorersHome: [
            { name: "Dylan", count: 6 },
            { name: "Antoine", count: 5 },
            { name: "Theo", count: 2 }
        ],
        scorersAway: [
            { name: "Enzo", count: 1 },
            { name: "Jason", count: 1 }
        ],

        timelineHome: [
            { time: "0'43\"", scorer: "Dylan", assist: "Antoine" },
            { time: "1'21\"", scorer: "Dylan", assist: "Theo" },
            { time: "2'48\"", scorer: "Antoine", assist: "Dylan" },
            { time: "3'21\"", scorer: "Theo", assist: "Antoine" },
            { time: "4'05\"", scorer: "Dylan", assist: "Antoine" },
            { time: "4'51\"", scorer: "Antoine", assist: "Theo" },
            { time: "5'56\"", scorer: "Dylan", assist: "Antoine" },
            { time: "6'21\"", scorer: "Dylan", assist: "Antoine" },
            { time: "7'12\"", scorer: "Antoine", assist: "Theo" },
            { time: "8'45\"", scorer: "Antoine", assist: "Theo" },
            { time: "9'29\"", scorer: "Dylan", assist: "Antoine" },
            { time: "10'57\"", scorer: "Antoine", assist: "Solo Dribble 🌟" },
            { time: "11'52\"", scorer: "Theo", assist: "Antoine" }
        ],
        timelineAway: [
            { time: "7'56\"", scorer: "Enzo", assist: "Jason" },
            { time: "10'07\"", scorer: "Jason", assist: "Amar" }
        ],

        notesHome: [
            { name: "Dylan", note: 9.5, defenses: 5, dribbles: 13 },
            { name: "Antoine", note: 9.8, defenses: 11, dribbles: 24 },
            { name: "Theo", note: 9.2, defenses: 8, dribbles: 7 }
        ],
        notesAway: [
            { name: "Enzo", note: 4.3, defenses: 9, dribbles: 5 },
            { name: "Jason", note: 4.9, defenses: 4, dribbles: 8 },
            { name: "Amar", note: 3.2, defenses: 3, dribbles: 4 }
        ]
    },

    // Coller un nouveau match ici : { id:"m7", date:"...", category:"ligue", season:1, ... }
];

const MATCH_LENGTH_SECONDS = 12 * 60; // 12 minutes de match (règles.html)

// Calcule Buts / Passes D / Defenses / Dribbles par joueur pour un match donné.
// Buts + Passes D sont déduits automatiquement de scorersHome/Away + timelineHome/Away.
// Defenses + Dribbles se lisent directement sur les entrées notesHome/notesAway.
// Global (hors DOMContentLoaded) pour être réutilisable par d'autres scripts (headtohead.js).
function computePlayerStats(m) {
    const stats = {};
    function ensure(name) {
        if (!stats[name]) stats[name] = { buts: 0, passes: 0, defenses: 0, dribbles: 0 };
        return stats[name];
    }

    (m.scorersHome || []).forEach(s => { ensure(s.name).buts += s.count; });
    (m.scorersAway || []).forEach(s => { ensure(s.name).buts += s.count; });

    [...(m.timelineHome || []), ...(m.timelineAway || [])].forEach(ev => {
        ensure(ev.scorer);
        if (ev.assist && !ev.assist.includes('🌟')) {
            ensure(ev.assist).passes += 1;
        }
    });

    [...(m.notesHome || []), ...(m.notesAway || [])].forEach(p => {
        const s = ensure(p.name);
        if (p.buts !== undefined) s.buts = p.buts;
        if (p.passes !== undefined) s.passes = p.passes;
        if (p.defenses !== undefined) s.defenses = p.defenses;
        if (p.dribbles !== undefined) s.dribbles = p.dribbles;
    });

    return stats;
}

document.addEventListener('DOMContentLoaded', function () {

    /* ============================================================
       2. UTILITAIRES
       ============================================================ */
    function fmtDate(str) {
        const [y, m, d] = str.split("-");
        return `${d}/${m}/${y}`;
    }

    const CAT_LABEL = { ligue: "Ligue", ncl: "NCL", amical: "Amical" };

    function noteColor(note) {
        if (note <= 2) return '#c70000';
        if (note <= 2.5) return '#ff2a00';
        if (note <= 3) return '#ff3c00';
        if (note <= 3.5) return '#fb7100';
        if (note <= 4) return '#ffa600';
        if (note <= 4.5) return '#ffbf00';
        if (note <= 5) return '#cbb705';
        if (note <= 5.5) return '#ffe600';
        if (note <= 6) return '#f2ff00';
        if (note <= 6.5) return '#fffc34';
        if (note <= 7) return '#c8ff00';
        if (note <= 7.5) return '#aaff00';
        if (note <= 8) return '#91ff00';
        if (note <= 8.5) return '#59ff00';
        if (note <= 9) return '#00ff9d';
        if (note <= 9.5) return '#00ffd5ff';
        if (note <= 9.9) return '#0066ffff';
        return '#3700ffff';
    }

    // "10'57\"" -> 657 (secondes)
    function timeToSeconds(str) {
        const match = /(\d+)'(\d+)/.exec(str);
        if (!match) return 0;
        return Number(match[1]) * 60 + Number(match[2]);
    }

    function timeToPct(str) {
        const s = timeToSeconds(str);
        return Math.max(0, Math.min(100, (s / MATCH_LENGTH_SECONDS) * 100));
    }

    /* ============================================================
       SOUS-POPUP STATS JOUEUR (clic / survol sur une ligne de notes)
       ============================================================ */
    function ensurePlayerStatPopup() {
        let el = document.getElementById('playerStatPopup');
        if (!el) {
            el = document.createElement('div');
            el.id = 'playerStatPopup';
            el.className = 'player-stat-popup';
            document.body.appendChild(el);
        }
        return el;
    }

    function showPlayerStatPopup(triggerEl, name, currentMatch) {
        const popupEl = ensurePlayerStatPopup();
        const s = computePlayerStats(currentMatch)[name] || { buts: 0, passes: 0, defenses: 0, dribbles: 0 };

        popupEl.innerHTML = `
            <div class="player-stat-popup-name">${name}</div>
            <ul class="player-stat-popup-list">
                <li><span>⚽ Buts</span><strong>${s.buts}</strong></li>
                <li><span>👟 Passes D</span><strong>${s.passes}</strong></li>
                <li><span>🛡️ Defenses</span><strong>${s.defenses}</strong></li>
                <li><span>🌀 Dribbles</span><strong>${s.dribbles}</strong></li>
            </ul>`;

        const rect = triggerEl.getBoundingClientRect();
        popupEl.style.top = `${window.scrollY + rect.bottom + 8}px`;
        popupEl.style.left = `${window.scrollX + rect.left}px`;
        popupEl.classList.add('visible');
    }

    function hidePlayerStatPopup() {
        const el = document.getElementById('playerStatPopup');
        if (el) el.classList.remove('visible');
    }

    /* ============================================================
       3. FRISE "PULSE" (signature visuelle)
       ============================================================ */
    function renderPulse(m, big) {
        function dotColor(clubKey) {
            return `var(--${clubKey}-color, #b41cff)`;
        }

        const homeDots = (m.timelineHome || []).map(ev => ({ ...ev, side: 'home', clubKey: m.home }));
        const awayDots = (m.timelineAway || []).map(ev => ({ ...ev, side: 'away', clubKey: m.away }));
        const allDots = [...homeDots, ...awayDots];

        const dotsHTML = allDots.map(ev => {
            const pct = timeToPct(ev.time);
            const color = dotColor(ev.clubKey);

            // Empêche le tooltip de déborder de l'écran près des bords de la frise
            let tipStyle = 'left:50%; transform:translateX(-50%) translateY(-6px);';
            if (pct < 12) {
                tipStyle = 'left:0; transform:translateY(-6px);';
            } else if (pct > 88) {
                tipStyle = 'left:auto; right:0; transform:translateY(-6px);';
            }

            return `
            <div class="mp-pulse-dot ${ev.side}" style="left:${pct}%; background:${color}; box-shadow:0 0 8px ${color};" tabindex="0">
                <span class="mp-pulse-tooltip" style="${tipStyle} border-color:${color};">${ev.time.replace('"', '')} — ${ev.scorer} ⚽${ev.assist ? ` · ${ev.assist}${ev.assist.includes('🌟') ? '' : ' 👟'}` : ''}</span>
            </div>
        `;
        }).join('');

        return `
    <div class="mp-pulse">
        <div class="mp-pulse-ruler"></div>
        <div class="mp-pulse-half"></div>
        ${dotsHTML}
    </div>
    <div class="mp-pulse-labels">
        <span>0'</span><span>6' (MT)</span><span>12'</span>
    </div>`;
    }

    /* ============================================================
       4. TICKER DE RÉSULTATS
       ============================================================ */
    function renderTicker(matches) {
        const wrap = document.getElementById('mpTicker');
        if (!wrap) return;

        if (!matches.length) { wrap.innerHTML = ""; return; }

        const sorted = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        const itemHTML = (m) => {
            const home = club(m.home), away = club(m.away);
            return `
            <div class="mp-ticker-item">
                <span class="${home.cls}">${home.name}</span>
                <span class="mp-t-score">${m.scoreHome} - ${m.scoreAway}</span>
                <span class="${away.cls}">${away.name}</span>
                <span class="mp-ticker-dot"></span>
            </div>`;
        };

        const enoughToScroll = sorted.length >= 3;
        const items = enoughToScroll ? [...sorted, ...sorted] : sorted;

        wrap.innerHTML = `
        <div class="mp-ticker">
            <div class="mp-ticker-track ${enoughToScroll ? '' : 'mp-static'}">
                ${items.map(itemHTML).join('')}
            </div>
        </div>`;
    }

    /* ============================================================
       5. BANDEAU STAT-CHIPS
       ============================================================ */
    function renderStatCards(matches) {
        const container = document.getElementById('matchesStatCards');
        if (!matches.length) { container.innerHTML = ""; return; }

        const total = matches.length;

        const biggest = [...matches].sort((a, b) =>
            Math.abs(b.scoreHome - b.scoreAway) - Math.abs(a.scoreHome - a.scoreAway)
        )[0];
        const biggestHome = club(biggest.home);
        const biggestAway = club(biggest.away);

        const last = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const goalsTotal = matches.reduce((sum, m) => sum + m.scoreHome + m.scoreAway, 0);
        const avgGoals = (goalsTotal / total).toFixed(1);

        container.innerHTML = `
            <div class="mp-chip" data-stat="played" data-icon="🎮">
                <span class="mp-chip-label">Matchs Joués</span>
                <span class="mp-chip-value">${total}</span>
            </div>
            <div class="mp-chip" data-stat="biggest" data-icon="💥">
                <span class="mp-chip-label">Plus Large Victoire</span>
                <span class="mp-chip-value">${biggestHome.name} ${biggest.scoreHome}-${biggest.scoreAway} ${biggestAway.name}</span>
            </div>
            <div class="mp-chip" data-stat="last" data-icon="📅">
                <span class="mp-chip-label">Dernier Match</span>
                <span class="mp-chip-value">${club(last.home).name} ${last.scoreHome}-${last.scoreAway} ${club(last.away).name}</span>
            </div>
            <div class="mp-chip" data-stat="avg" data-icon="⚽">
                <span class="mp-chip-label">Moyenne de Buts / Match</span>
                <span class="mp-chip-value">${avgGoals}</span>
            </div>
        `;
    }

    /* ============================================================
       6. DROPDOWN CLUB
       ============================================================ */
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownCurrent = document.getElementById('dropdownCurrent');
    const dropdownLabel = dropdownCurrent.querySelector('.dropdown-current-label');
    const clubDropdown = document.getElementById('clubDropdown');

    function buildClubDropdown() {
        let html = `<li class="dropdown-option active" data-club="all">Toutes les équipes</li>`;
        Object.entries(CLUB_META).forEach(([key, c]) => {
            html += `<li class="dropdown-option" data-club="${key}">
                <img src="${c.logo}" class="filter-icon" onerror="this.style.display='none'">
                ${c.name}
            </li>`;
        });
        dropdownMenu.innerHTML = html;
    }
    buildClubDropdown();

    let selectedClub = "all";

    dropdownCurrent.addEventListener('click', (e) => {
        e.stopPropagation();
        clubDropdown.classList.toggle('open');
    });

    dropdownMenu.addEventListener('click', (e) => {
        const opt = e.target.closest('.dropdown-option');
        if (!opt) return;
        dropdownMenu.querySelectorAll('.dropdown-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedClub = opt.dataset.club;
        dropdownLabel.textContent = opt.textContent.trim();
        clubDropdown.classList.remove('open');
        applyFilters();
    });

    document.addEventListener('click', (e) => {
        if (!clubDropdown.contains(e.target)) clubDropdown.classList.remove('open');
    });

    /* ============================================================
       7. FILTRES CATÉGORIE + TRI
       ============================================================ */
    let selectedCat = "all";
    let sortOrder = "desc";

    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCat = btn.dataset.cat;
            applyFilters();
        });
    });

    const sortToggle = document.getElementById('sortToggle');
    sortToggle.addEventListener('click', () => {
        sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        sortToggle.dataset.order = sortOrder;
        sortToggle.querySelector('.sort-arrow').textContent = sortOrder === 'desc' ? '↓' : '↑';
        applyFilters();
    });

    /* ============================================================
       8. RENDU D'UNE CARTE DE MATCH
       ============================================================ */
    function renderMatchCard(m) {
        const home = club(m.home);
        const away = club(m.away);
        const homeWin = m.scoreHome > m.scoreAway;
        const awayWin = m.scoreAway > m.scoreHome;

        const scorerChips = (list) => list.map(s =>
            `<span class="mp-scorer-chip">${s.name}${s.count > 1 ? ` (x${s.count})` : ''} ⚽</span>`
        ).join('');

        return `
    <div class="mp-card ${m.category}" data-cat="${m.category}" data-club-home="${m.home}" data-club-away="${m.away}" data-date="${m.date}">
        <div class="mp-card-top">
            <span class="mp-badge">${CAT_LABEL[m.category]}</span>
            <span class="mp-date mono">📅 ${fmtDate(m.date)}</span>
        </div>

        <div class="mp-scoreline">
            <div class="mp-team ${homeWin ? 'winner' : ''}">
                <img src="${home.logo}" class="mp-team-logo" alt="${home.name}">
                <span class="mp-team-name ${home.cls}">${home.name}</span>
            </div>

            <div class="mp-score-center">
                <div class="mp-score-box">${m.scoreHome} - ${m.scoreAway}</div>
                <span class="mp-motm">🏅 ${m.mvp}</span>
            </div>

            <div class="mp-team away ${awayWin ? 'winner' : ''}">
                <img src="${away.logo}" class="mp-team-logo" alt="${away.name}">
                <span class="mp-team-name ${away.cls}">${away.name}</span>
            </div>
        </div>

        ${renderPulse(m)}

        <div class="mp-summary-row">
            <div class="mp-scorers-side home">
                <div class="mp-side-title ${home.cls}">${home.name}</div>
                <div class="mp-scorer-chips">${scorerChips(m.scorersHome)}</div>
            </div>
            <div class="mp-scorers-side away">
                <div class="mp-side-title ${away.cls}">${away.name}</div>
                <div class="mp-scorer-chips">${scorerChips(m.scorersAway)}</div>
            </div>
        </div>

        <div class="mp-buttons">
            <button class="mp-btn replay details-btn" data-popup="popup-${m.id}">Voir les Stats</button>
            ${m.videoUrl ? `<button class="mp-btn video" onclick="window.open('${m.videoUrl}', '_blank')">Vidéo ▶</button>` : ''}
        </div>
    </div>`;
    }

    /* ============================================================
       9. POPUP "CONSOLE REPLAY"
       ============================================================ */
    function renderNotesTeam(title, notes) {
        return `
        <div class="mp-rating-team">
            <h5>${title}</h5>
            ${notes.map(n => `
                <div class="mp-rating-row player-stat-trigger" data-player="${n.name}">
                    <span class="mp-rating-name mono">${n.name} · ${n.note.toFixed(1)}</span>
                    <div class="mp-rating-bar" data-note="${n.note}"></div>
                </div>
            `).join('')}
        </div>`;
    }

    function renderPlayByPlay(title, timeline) {
        return `
        <div class="mp-pbp-col">
            <h4>${title}</h4>
            ${timeline.map(t => `
                <div class="mp-pbp-event">
                    <span class="mp-pbp-time">${t.time.replace('"', '')}</span>
                    <span>${t.scorer} ⚽${t.assist ? ` · ${t.assist}${t.assist.includes('🌟') ? '' : ' 👟'}` : ''}</span>
                </div>
            `).join('')}
        </div>`;
    }

    function renderMatchPopup(m) {
        const home = club(m.home);
        const away = club(m.away);

        return `
        <div class="popup-bg" id="popup-${m.id}">
            <div class="popup-box mp-console ${m.category}" style="--cat-color: var(--${m.category}-color);">
                <h3>${home.name} - ${away.name} (${fmtDate(m.date)})</h3>

                <div class="mp-console-header">
                    <div class="mp-console-team">
                        <img src="${home.logo}" alt="${home.name}" class="mp-console-logo">
                        <span class="mp-console-name ${home.cls}">${home.name}</span>
                    </div>
                    <div class="mp-console-score">${m.scoreHome} - ${m.scoreAway}</div>
                    <div class="mp-console-team">
                        <img src="${away.logo}" alt="${away.name}" class="mp-console-logo">
                        <span class="mp-console-name ${away.cls}">${away.name}</span>
                    </div>
                </div>

                <div class="mp-console-pulse-wrap">
                    ${renderPulse(m, true)}
                </div>

                <div class="mp-mvp-banner">🏅 MVP du match : <strong>${m.mvp}</strong></div>

                <div class="mp-playbyplay">
                    ${renderPlayByPlay(home.name, m.timelineHome)}
                    ${renderPlayByPlay(away.name, m.timelineAway)}
                </div>

                <div class="mp-ratings-title">Notes des Joueurs</div>
                <div class="mp-ratings-columns">
                    ${renderNotesTeam(home.name, m.notesHome)}
                    ${renderNotesTeam(away.name, m.notesAway)}
                </div>

                <button class="close-btn">Fermer</button>
            </div>
        </div>`;
    }

    /* ============================================================
       10. FILTRAGE + REGROUPEMENT PAR SAISON + RENDU
       ============================================================ */
    const matchList = document.getElementById('matchList');
    const popupsContainer = document.getElementById('matchPopupsContainer');

    function getFiltered() {
        let list = MATCHES.filter(m => {
            if (selectedCat !== 'all' && m.category !== selectedCat) return false;
            if (selectedClub !== 'all' && m.home !== selectedClub && m.away !== selectedClub) return false;
            return true;
        });
        list.sort((a, b) => sortOrder === 'desc'
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date));
        return list;
    }

    function groupBySeason(list) {
        const groups = {};
        list.forEach(m => {
            if (!groups[m.season]) groups[m.season] = [];
            groups[m.season].push(m);
        });
        return Object.keys(groups)
            .map(Number)
            .sort((a, b) => b - a)
            .map(num => ({ season: num, matches: groups[num] }));
    }

    function attachPopupHandlers() {
        document.querySelectorAll(".details-btn").forEach(button => {
            button.addEventListener("click", () => {
                const popup = document.getElementById(button.dataset.popup);
                if (!popup) return;
                popup.style.display = "flex";

                const matchId = button.dataset.popup.replace('popup-', '');
                const currentMatch = MATCHES.find(mm => mm.id === matchId);

                popup.querySelectorAll('.mp-rating-bar').forEach(bar => {
                    if (bar.dataset.filled) return;
                    const note = parseFloat(bar.dataset.note);
                    const fill = document.createElement('div');
                    fill.style.width = `${note * 10}%`;
                    fill.style.height = '100%';
                    fill.style.backgroundColor = noteColor(note);
                    fill.style.borderRadius = '4px';
                    bar.appendChild(fill);
                    bar.dataset.filled = "1";
                });

                // Sous-popup stats détaillées : clic ou survol sur une ligne joueur
                popup.querySelectorAll('.player-stat-trigger').forEach(row => {
                    if (row.dataset.statBound) return;
                    row.dataset.statBound = "1";
                    row.addEventListener('mouseenter', () => showPlayerStatPopup(row, row.dataset.player, currentMatch));
                    row.addEventListener('mouseleave', hidePlayerStatPopup);
                    row.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showPlayerStatPopup(row, row.dataset.player, currentMatch);
                    });
                });

                // Surligne le premier événement du play-by-play au survol de la frise
                popup.querySelectorAll('.mp-pulse-dot').forEach((dot, i) => {
                    dot.addEventListener('mouseenter', () => {
                        popup.querySelectorAll('.mp-pbp-event').forEach(ev => ev.classList.remove('mp-highlight'));
                    });
                });
            });
        });

        document.querySelectorAll(".close-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                btn.closest(".popup-bg").style.display = "none";
                hidePlayerStatPopup();
            });
        });

        document.querySelectorAll(".popup-bg").forEach(p => {
            p.addEventListener("click", e => {
                if (e.target === p) { p.style.display = "none"; hidePlayerStatPopup(); }
            });
        });
    }

    function render() {
        const filtered = getFiltered();
        renderTicker(MATCHES);
        renderStatCards(MATCHES);

        matchList.innerHTML = "";
        popupsContainer.innerHTML = "";

        if (filtered.length === 0) {
            matchList.innerHTML = `
                <div class="mp-empty">
                    <div class="mp-empty-icon">⚽</div>
                    <p class="mp-empty-title">Aucun match ne correspond à ces filtres</p>
                    <p>Essaie une autre catégorie ou une autre équipe.</p>
                </div>`;
            return;
        }

        groupBySeason(filtered).forEach(group => {
            const heading = document.createElement('div');
            heading.className = 'mp-season-header';
            heading.innerHTML = `<span>Saison ${group.season}</span>`;
            matchList.appendChild(heading);

            const grid = document.createElement('div');
            grid.className = 'mp-season-grid';
            grid.innerHTML = group.matches.map(renderMatchCard).join('');
            matchList.appendChild(grid);

            group.matches.forEach(m => {
                popupsContainer.insertAdjacentHTML('beforeend', renderMatchPopup(m));
            });
        });

        attachPopupHandlers();
    }

    function applyFilters() {
        render();
    }

    /* ============================================================
       11. INIT
       ============================================================ */
    render();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.popup-bg').forEach(p => {
                if (p.style.display === 'flex') p.style.display = 'none';
            });
            hidePlayerStatPopup();
        }
    });
});