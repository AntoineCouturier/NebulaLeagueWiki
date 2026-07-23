// match.js - Historique des Matchs (version data-driven)
// Pour ajouter un match : dupliquer un objet dans MATCHES ci-dessous et changer les valeurs.
// Tout le reste (carte, stat-cards, filtres, popup) se génère automatiquement.

document.addEventListener('DOMContentLoaded', function () {

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
       1. DONNÉES DES MATCHS
       ============================================================
       category : "ligue" | "ncl" | "amical"
       season   : numéro de saison (sert juste à regrouper les cartes) */
    const MATCHES = [
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
            videoUrl: "https://www.youtube.com/watch?v=IUGts4iKlz4",

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
                { name: "Dylan", note: 9.5 },
                { name: "Antoine", note: 10.0 },
                { name: "Theo", note: 8.0 }
            ],
            notesAway: [
                { name: "Enzo", note: 4.5 },
                { name: "Jason", note: 5.0 },
                { name: "Amar", note: 3.5 }
            ]
        }

        // Coller un nouveau match ici : { id:"m2", date:"...", category:"ligue", season:1, ... }
    ];

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
        if (note <= 9) return '#0dff00';
        if (note <= 9.5) return '#00ff9d';
        return '#00a6ff';
    }

    /* ============================================================
       3. BANDEAU STAT-CARDS
       ============================================================ */
    function renderStatCards(matches) {
        const container = document.getElementById('matchesStatCards');
        if (!matches.length) { container.innerHTML = ""; return; }

        const total = matches.length;

        const biggest = [...matches].sort((a, b) =>
            Math.abs(b.scoreHome - b.scoreAway) - Math.abs(a.scoreHome - a.scoreAway)
        )[0];
        const biggestDiff = Math.abs(biggest.scoreHome - biggest.scoreAway);
        const biggestWinner = biggest.scoreHome > biggest.scoreAway ? club(biggest.home) : club(biggest.away);

        const last = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const goalsTotal = matches.reduce((sum, m) => sum + m.scoreHome + m.scoreAway, 0);
        const avgGoals = (goalsTotal / total).toFixed(1);

        container.innerHTML = `
            <div class="stat-card">
                <h4>Matchs Joués</h4>
                <p>${total}</p>
            </div>
            <div class="stat-card">
                <h4>Plus Large Victoire</h4>
                <p>${biggestWinner.name} (+${biggestDiff})</p>
            </div>
            <div class="stat-card">
                <h4>Dernier Match</h4>
                <p>${club(last.home).name} ${last.scoreHome}-${last.scoreAway} ${club(last.away).name}</p>
            </div>
            <div class="stat-card">
                <h4>Moyenne de Buts / Match</h4>
                <p>${avgGoals}</p>
            </div>
        `;
    }

    /* ============================================================
       4. DROPDOWN CLUB (généré depuis CLUB_META)
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
       5. FILTRES CATÉGORIE + TRI
       ============================================================ */
    let selectedCat = "all";
    let sortOrder = "desc"; // desc = plus récent d'abord

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
       6. RENDU D'UNE CARTE DE MATCH
       ============================================================ */
    function renderMatchCard(m) {
        const home = club(m.home);
        const away = club(m.away);
        const homeWin = m.scoreHome > m.scoreAway;
        const awayWin = m.scoreAway > m.scoreHome;

        const scorersLine = (list) => list.map(s => `${s.name}${s.count > 1 ? ` (x${s.count})` : ''}`).join(', ');

        return `
        <div class="match-card ${m.category}-card" data-cat="${m.category}" data-club-home="${m.home}" data-club-away="${m.away}" data-date="${m.date}">
            <div class="match-card-top">
                <span class="fx-badge-cat ${m.category}">${CAT_LABEL[m.category]}</span>
                <span class="match-date">📅 ${fmtDate(m.date)}</span>
            </div>

            <div class="match-header">
                <div class="team ${homeWin ? 'winner' : ''}">
                    <img src="${home.logo}" class="team-logo" alt="${home.name}">
                    <span class="${home.cls}">${home.name}</span>
                </div>

                <div class="score-block">
                    <span class="score-${m.category}">${m.scoreHome} - ${m.scoreAway}</span>
                </div>

                <div class="team ${awayWin ? 'winner' : ''}">
                    <img src="${away.logo}" class="team-logo" alt="${away.name}">
                    <span class="${away.cls}">${away.name}</span>
                </div>
            </div>

            <div class="match-details">
                <div class="buteurs">
                    <ul class="buteurs-left">${m.scorersHome.map(s => `<li>${s.name}${s.count > 1 ? ` (x${s.count})` : ''}</li>`).join('')}</ul>
                    <ul class="buteurs-right">${m.scorersAway.map(s => `<li>${s.name}${s.count > 1 ? ` (x${s.count})` : ''}</li>`).join('')}</ul>
                </div>
                <p><strong>🏅 MVP :</strong> ${m.mvp}</p>
            </div>

            <div class="card-buttons">
                <button class="details-btn ${m.category}" data-popup="popup-${m.id}">Détails du match</button>
                ${m.videoUrl ? `<button class="video-btn" onclick="window.open('${m.videoUrl}', '_blank')">Vidéo du match ▶</button>` : ''}
            </div>
        </div>`;
    }

    /* ============================================================
       7. POPUP DE MATCH
       ============================================================ */
    function renderNotesTeam(title, notes) {
        return `
        <div class="notes-team">
            <h5 class="note-titre">${title}</h5>
            ${notes.map(n => `
                <div class="note-item">
                    <span class="note-name">${n.name}: ${n.note.toFixed(1)}</span>
                    <div class="note-bar" data-note="${n.note}"></div>
                </div>
            `).join('')}
        </div>`;
    }

    function renderMatchPopup(m) {
        const home = club(m.home);
        const away = club(m.away);

        return `
        <div class="popup-bg" id="popup-${m.id}">
            <div class="popup-box ${m.category}-box">
                <h3>${home.name} - ${away.name} (${fmtDate(m.date)})</h3>

                <div class="modal-header-teams">
                    <div class="modal-team-block">
                        <img src="${home.logo}" alt="${home.name}" class="modal-team-logo">
                        <span class="modal-team-title ${home.cls}">${home.name}</span>
                    </div>
                    <div class="modal-score-big">${m.scoreHome} - ${m.scoreAway}</div>
                    <div class="modal-team-block">
                        <img src="${away.logo}" alt="${away.name}" class="modal-team-logo">
                        <span class="modal-team-title ${away.cls}">${away.name}</span>
                    </div>
                </div>

                <p class="match-mvp-line"><strong>🏅 MVP du match :</strong> <span class="mvp-highlight">${m.mvp}</span></p>

                <div class="details-container">
                    <div class="team-details ${m.category}-details">
                        <h4>${home.name}</h4>
                        <ul>
                            ${m.timelineHome.map(t => `<li><strong>${t.time}</strong> — ${t.scorer} ⚽ | ${t.assist} 👟</li>`).join('')}
                        </ul>
                    </div>
                    <div class="team-details ${m.category}-details">
                        <h4>${away.name}</h4>
                        <ul>
                            ${m.timelineAway.map(t => `<li><strong>${t.time}</strong> — ${t.scorer} ⚽ | ${t.assist} 👟</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="notes-section ${m.category}-section">
                    <h4>Notes des Joueurs</h4>
                    <div class="notes-columns">
                        ${renderNotesTeam(home.name, m.notesHome)}
                        ${renderNotesTeam(away.name, m.notesAway)}
                    </div>
                </div>

                <button class="close-btn">Fermer</button>
            </div>
        </div>`;
    }

    /* ============================================================
       8. FILTRAGE + REGROUPEMENT PAR SAISON + RENDU
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

                popup.querySelectorAll('.note-bar').forEach(bar => {
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
            });
        });

        document.querySelectorAll(".close-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                btn.closest(".popup-bg").style.display = "none";
            });
        });

        document.querySelectorAll(".popup-bg").forEach(p => {
            p.addEventListener("click", e => { if (e.target === p) p.style.display = "none"; });
        });
    }

    function render() {
        const filtered = getFiltered();
        renderStatCards(MATCHES);

        matchList.innerHTML = "";
        popupsContainer.innerHTML = "";

        if (filtered.length === 0) {
            matchList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚽</div>
                    <p class="empty-state-title">Aucun match ne correspond à ces filtres</p>
                    <p class="empty-state-sub">Essaie une autre catégorie ou une autre équipe.</p>
                </div>`;
            return;
        }

        groupBySeason(filtered).forEach(group => {
            const heading = document.createElement('div');
            heading.className = 'season-section-header';
            heading.innerHTML = `<span>Saison ${group.season}</span>`;
            matchList.appendChild(heading);

            const grid = document.createElement('div');
            grid.className = 'match-season-grid';
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
       9. INIT
       ============================================================ */
    render();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.popup-bg').forEach(p => {
                if (p.style.display === 'flex') p.style.display = 'none';
            });
        }
    });
});