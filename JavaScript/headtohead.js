// headtohead.js - Page "Face à Face"
// Ne contient AUCUNE donnée de match : tout est calculé à partir de MATCHES
// et CLUB_META, déclarés globalement dans match.js (chargé avant ce fichier).
// Si tu ajoutes un match dans match.js, cette page se met à jour toute seule.

document.addEventListener('DOMContentLoaded', function () {

    const selectGrid = document.getElementById('h2hSelectGrid');
    const hint = document.getElementById('h2hHint');
    const emptyState = document.getElementById('h2hEmptyState');
    const results = document.getElementById('h2hResults');

    if (!selectGrid || typeof CLUB_META === 'undefined' || typeof MATCHES === 'undefined') return;

    let selection = []; // ordre = ["a-key", "b-key"], max 2 (FIFO)

    /* ============================================================
       1. GRILLE DE SÉLECTION DES ÉQUIPES
       ============================================================ */
    function renderTiles() {
        selectGrid.innerHTML = '';
        Object.keys(CLUB_META).forEach(key => {
            const c = club(key);
            const tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'h2h-tile';
            tile.dataset.club = key;
            tile.style.setProperty('--tile-color', `var(--${key}-color)`);
            tile.style.setProperty('--tile-glow', `var(--${key}-glow)`);

            const idx = selection.indexOf(key);
            if (idx === 0) { tile.classList.add('picked-a'); }
            if (idx === 1) { tile.classList.add('picked-b'); }

            tile.innerHTML = `
                <span class="h2h-tile-badge">${idx === 0 ? 'A' : idx === 1 ? 'B' : ''}</span>
                <img src="${c.logo}" alt="${c.name}" onerror="this.style.visibility='hidden'">
                <span class="h2h-tile-name">${c.name}</span>
            `;

            tile.addEventListener('click', () => handleTileClick(key));
            selectGrid.appendChild(tile);
        });
    }

    function handleTileClick(key) {
        const idx = selection.indexOf(key);
        if (idx !== -1) {
            // Déjà sélectionnée : on la retire
            selection.splice(idx, 1);
        } else if (selection.length < 2) {
            selection.push(key);
        } else {
            // Les 2 emplacements sont pris : on fait tourner la file (A sort, B devient A, nouveau devient B)
            selection.shift();
            selection.push(key);
        }
        update();
    }

    /* ============================================================
       2. CALCUL DU BILAN (rien n'est stocké, tout est recalculé)
       ============================================================ */
    function computeHeadToHead(a, b) {
        const list = MATCHES.filter(m =>
            (m.home === a && m.away === b) || (m.home === b && m.away === a)
        ).sort((x, y) => new Date(y.date) - new Date(x.date));

        let winsA = 0, winsB = 0, draws = 0, goalsA = 0, goalsB = 0;
        const scorers = {}; // name -> { count, passes, side: 'a' | 'b' }

        function ensureScorer(name, side) {
            scorers[name] = scorers[name] || { count: 0, passes: 0, side };
            return scorers[name];
        }

        list.forEach(m => {
            const aIsHome = m.home === a;
            const scoreA = aIsHome ? m.scoreHome : m.scoreAway;
            const scoreB = aIsHome ? m.scoreAway : m.scoreHome;
            goalsA += scoreA;
            goalsB += scoreB;

            if (scoreA > scoreB) winsA++;
            else if (scoreB > scoreA) winsB++;
            else draws++;

            const scorersA = aIsHome ? m.scorersHome : m.scorersAway;
            const scorersB = aIsHome ? m.scorersAway : m.scorersHome;

            (scorersA || []).forEach(s => { ensureScorer(s.name, 'a').count += s.count; });
            (scorersB || []).forEach(s => { ensureScorer(s.name, 'b').count += s.count; });

            // Passes décisives : déduites de la timeline (comme computePlayerStats dans match.js),
            // nécessaires pour départager 2 buteurs à égalité de buts.
            const timelineA = aIsHome ? m.timelineHome : m.timelineAway;
            const timelineB = aIsHome ? m.timelineAway : m.timelineHome;

            (timelineA || []).forEach(ev => {
                if (ev.assist && !ev.assist.includes('🌟')) ensureScorer(ev.assist, 'a').passes += 1;
            });
            (timelineB || []).forEach(ev => {
                if (ev.assist && !ev.assist.includes('🌟')) ensureScorer(ev.assist, 'b').passes += 1;
            });
        });

        function pickTopScorer(side) {
            let top = null;
            Object.entries(scorers).forEach(([name, info]) => {
                if (info.side !== side || info.count === 0) return;
                if (!top
                    || info.count > top.count
                    || (info.count === top.count && info.passes > top.passes)) {
                    top = { name, count: info.count, passes: info.passes };
                }
            });
            return top;
        }

        const topScorerA = pickTopScorer('a');
        const topScorerB = pickTopScorer('b');

        return { list, winsA, winsB, draws, goalsA, goalsB, topScorerA, topScorerB };
    }

    /* ============================================================
       3. RENDU DES RÉSULTATS
       ============================================================ */
    function renderMatchRow(m, a, b) {
        const aIsHome = m.home === a;
        const teamA = club(a), teamB = club(b);
        const scoreA = aIsHome ? m.scoreHome : m.scoreAway;
        const scoreB = aIsHome ? m.scoreAway : m.scoreHome;
        const [y, mo, d] = m.date.split('-');
        const catLabel = { ligue: 'Ligue', ncl: 'NCL', amical: 'Amical' }[m.category] || m.category;

        return `
        <div class="h2h-match-row">
            <div class="h2h-match-meta">
                <span>${d}/${mo}/${y}</span>
                <span>${catLabel}</span>
            </div>
            <div class="h2h-match-teams">
                <span class="${teamA.cls}">${teamA.name}</span>
                <span class="h2h-match-score">${scoreA} - ${scoreB}</span>
                <span class="${teamB.cls}">${teamB.name}</span>
            </div>
        </div>`;
    }

    function update() {
        renderTiles();

        if (selection.length === 0) {
            hint.innerHTML = 'Sélectionne ta <strong>première</strong> équipe.';
        } else if (selection.length === 1) {
            hint.innerHTML = `Sélectionne l'équipe <strong>adverse</strong>.`;
        }

        if (selection.length < 2) {
            emptyState.style.display = 'block';
            results.classList.remove('visible');
            return;
        }

        emptyState.style.display = 'none';

        const [a, b] = selection;
        const teamA = club(a), teamB = club(b);
        const h2h = computeHeadToHead(a, b);

        hint.innerHTML = `<strong>${teamA.name}</strong> vs <strong>${teamB.name}</strong> — clique une équipe pour changer.`;

        results.style.setProperty('--colorA', `var(--${a}-color)`);
        results.style.setProperty('--colorB', `var(--${b}-color)`);

        document.getElementById('h2hHeaderA').innerHTML = `
            <img src="${teamA.logo}" alt="${teamA.name}" onerror="this.style.visibility='hidden'">
            <span class="h2h-clash-team-name ${teamA.cls}">${teamA.name}</span>`;
        document.getElementById('h2hHeaderB').innerHTML = `
            <img src="${teamB.logo}" alt="${teamB.name}" onerror="this.style.visibility='hidden'">
            <span class="h2h-clash-team-name ${teamB.cls}">${teamB.name}</span>`;

        const total = h2h.list.length;
        document.getElementById('h2hRecordLabelA').textContent = `${h2h.winsA} Victoire${h2h.winsA > 1 ? 's' : ''}`;
        document.getElementById('h2hRecordLabelDraw').textContent = `${h2h.draws} Nul${h2h.draws > 1 ? 's' : ''}`;
        document.getElementById('h2hRecordLabelB').textContent = `${h2h.winsB} Victoire${h2h.winsB > 1 ? 's' : ''}`;

        const pct = n => total > 0 ? (n / total) * 100 : 0;
        document.getElementById('h2hFillA').style.width = pct(h2h.winsA) + '%';
        document.getElementById('h2hFillDraw').style.width = pct(h2h.draws) + '%';
        document.getElementById('h2hFillB').style.width = pct(h2h.winsB) + '%';

        const topScorerAText = h2h.topScorerA ? `${h2h.topScorerA.name} (${h2h.topScorerA.count})` : '—';
        const topScorerBText = h2h.topScorerB ? `${h2h.topScorerB.name} (${h2h.topScorerB.count})` : '—';

        document.getElementById('h2hStatColumns').innerHTML = `
            <div class="h2h-stat-col col-a">
                <div class="h2h-stat-row"><span class="h2h-stat-label">Confrontations</span><span class="h2h-stat-value">${total}</span></div>
                <div class="h2h-stat-row"><span class="h2h-stat-label">Buts marqués</span><span class="h2h-stat-value">${h2h.goalsA}</span></div>
                <div class="h2h-stat-row"><span class="h2h-stat-label">Buts encaissés</span><span class="h2h-stat-value">${h2h.goalsB}</span></div>
                <div class="h2h-stat-row"><span class="h2h-stat-label">Meilleur buteur du duel</span><span class="h2h-stat-value">${topScorerAText}</span></div>
            </div>
            <div class="h2h-stat-col col-b">
                <div class="h2h-stat-row"><span class="h2h-stat-label">Confrontations</span><span class="h2h-stat-value">${total}</span></div>
                <div class="h2h-stat-row"><span class="h2h-stat-label">Buts marqués</span><span class="h2h-stat-value">${h2h.goalsB}</span></div>
                <div class="h2h-stat-row"><span class="h2h-stat-label">Buts encaissés</span><span class="h2h-stat-value">${h2h.goalsA}</span></div>
                <div class="h2h-stat-row"><span class="h2h-stat-label">Meilleur buteur du duel</span><span class="h2h-stat-value">${topScorerBText}</span></div>
            </div>
        `;

        const historyList = document.getElementById('h2hHistoryList');
        if (total === 0) {
            historyList.innerHTML = `<div class="h2h-empty-history">Ces deux équipes ne se sont encore jamais affrontées.</div>`;
        } else {
            historyList.innerHTML = h2h.list.map(m => renderMatchRow(m, a, b)).join('');
        }

        results.classList.add('visible');
    }

    renderTiles();
    update();
});