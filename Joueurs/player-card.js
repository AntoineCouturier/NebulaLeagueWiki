/* ===================== CLUB CONFIG ===================== */
const CLUBS = {
    bastard: { name: 'Bastard Munchen', borderColor: '#ff0000', bgColor: 'rgba(255, 0, 0, 0.15)' },
    pxg: { name: 'PXG', borderColor: '#1a2bff', bgColor: 'rgba(26, 43, 255, 0.15)' },
    ubers: { name: 'Ubers', borderColor: '#1eff00', bgColor: 'rgba(30, 255, 0, 0.12)' },
    barcha: { name: 'Barcha', borderColor: '#ffd700', bgColor: 'rgba(255, 215, 0, 0.12)' },
    manshine: { name: 'Manshine City', borderColor: '#00d5ff', bgColor: 'rgba(0, 213, 255, 0.15)' },
    retraite: { name: 'Retraite', borderColor: '#c840ff', bgColor: 'rgba(200, 64, 255, 0.15)' }
};

const STAT_LABELS = [
    { key: 'defense', emoji: '🛡️', label: 'Defense' },
    { key: 'passe', emoji: '⭐', label: 'Passe' },
    { key: 'dribble', emoji: '🌟', label: 'Dribble' },
    { key: 'tir', emoji: '⚽', label: 'Tir' },
    { key: 'offense', emoji: '💥', label: 'Offense' },
    { key: 'position', emoji: '👋', label: 'Positionnement' }
];

let radarChart = null;
let inlineRadarChart = null;
let clubData = CLUBS.bastard;
let playerName = 'Joueur';

/* ===================== UTILITIES ===================== */
function detectClub() {
    const html = document.body.innerHTML;
    for (const [key] of Object.entries(CLUBS)) {
        if (html.includes(`player-header-${key}`)) return key;
    }
    return 'bastard';
}

function getPlayerName() {
    const header = document.querySelector(
        '[class*="player-header-"] h2'
    );
    return header ? header.textContent.trim() : 'Joueur';
}

function parseInfoField(label) {
    const items = document.querySelectorAll('.player-info p');
    for (const p of items) {
        if (p.textContent.includes(label)) {
            return p.textContent.split(':').slice(1).join(':').trim();
        }
    }
    return '—';
}

function extractStatsFromHTML() {
    const container = document.querySelector('.player-card-fifa-stats');
    const text = container ? container.textContent : '';

    const patterns = {
        defense: /Defense.*?(\d+|\?\?)/,
        passe: /Passe.*?(\d+|\?\?)/,
        dribble: /Dribble.*?(\d+|\?\?)/,
        tir: /Tir.*?(\d+|\?\?)/,
        offense: /Offense.*?(\d+|\?\?)/,
        position: /Positionement.*?(\d+|\?\?)/
    };

    const stats = {};
    for (const [key, regex] of Object.entries(patterns)) {
        const match = text.match(regex);
        const raw = match ? match[1] : '??';
        stats[key] = raw === '??' ? null : parseInt(raw, 10);
    }

    const globalMatch = text.match(/Global.*?(\d+|\?\?)/);
    stats.global = globalMatch && globalMatch[1] !== '??'
        ? parseInt(globalMatch[1], 10)
        : null;

    const rankMatch = text.match(/Global.*?\|.*?(<span[^>]*>[^<]+<\/span>|Rang\s*\w+)/);
    stats.rankHTML = rankMatch ? rankMatch[1] : '';

    return stats;
}

function extractGradeFromParagraph(p) {
    const span = p.querySelector('span');
    return span ? span.outerHTML : '';
}

function parseStatParagraphs() {
    const container = document.querySelector('.player-card-fifa-stats');
    if (!container) return [];

    const statMap = {
        Defense: 'defense',
        Passe: 'passe',
        Dribble: 'dribble',
        Tir: 'tir',
        Offense: 'offense',
        Positionement: 'position'
    };

    const result = [];
    container.querySelectorAll('p').forEach(p => {
        const text = p.textContent;
        if (text.includes('Global')) return;

        for (const [label, key] of Object.entries(statMap)) {
            if (text.includes(label)) {
                const valueMatch = text.match(/(\d+|\?\?)/);
                result.push({
                    key,
                    label: STAT_LABELS.find(s => s.key === key)?.label || label,
                    emoji: STAT_LABELS.find(s => s.key === key)?.emoji || '',
                    value: valueMatch && valueMatch[1] !== '??' ? parseInt(valueMatch[1], 10) : null,
                    gradeHTML: extractGradeFromParagraph(p)
                });
            }
        }
    });
    return result;
}

function parseMatchStats() {
    const container = document.querySelector('.player-card-match-stats');
    if (!container) return {};

    const stats = {};
    container.querySelectorAll('p').forEach(p => {
        const text = p.textContent;
        const match = text.match(/^([^:]+):\s*(.+)$/);
        if (match) {
            const key = match[1].trim();
            const val = parseInt(match[2].trim(), 10);
            stats[key] = isNaN(val) ? match[2].trim() : val;
        }
    });
    return stats;
}

function getFIFARating(value) {
    if (value >= 95) return 'SSS';
    if (value >= 90) return 'SS';
    if (value >= 85) return 'S';
    if (value >= 80) return 'A';
    if (value >= 75) return 'B';
    if (value >= 70) return 'C';
    if (value >= 65) return 'D';
    if (value >= 60) return 'E';
    if (value >= 55) return 'F';
    if (value >= 50) return 'G';
    return '—';
}

function calculateGlobalAverage(stats) {
    const values = Object.entries(stats)
        .filter(([k]) => ['defense', 'passe', 'dribble', 'tir', 'offense', 'position'].includes(k))
        .map(([, v]) => v)
        .filter(v => v !== null && !isNaN(v));
    if (!values.length) return null;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function showToast(message) {
    let toast = document.querySelector('.pc-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'pc-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ===================== HERO BUILD ===================== */
function buildHero(club, stats) {
    const main = document.querySelector('.player-card-main');
    if (!main || main.classList.contains('pc-enhanced')) return;

    const headerEl = main.querySelector('[class*="player-header-"]');
    const avatar = headerEl?.querySelector('img');
    const clubLogoEl = main.querySelector('[class*="player-club-logo-"] img');

    const ovr = stats.global ?? calculateGlobalAverage(stats) ?? '??';
    const rankEl = main.querySelector('.player-card-fifa-stats') || document.querySelector('.player-card-fifa-stats');
    let rankHTML = '';
    if (rankEl) {
        const globalP = [...rankEl.querySelectorAll('p')].find(p => p.textContent.includes('Global'));
        if (globalP) {
            const span = globalP.querySelector('span');
            rankHTML = span ? span.textContent.trim() : getFIFARating(typeof ovr === 'number' ? ovr : 0);
        }
    }

    const hero = document.createElement('div');
    hero.className = 'pc-hero';
    hero.innerHTML = `
        <div class="pc-hero-glow"></div>
        <div class="pc-hero-rating">
            <div class="pc-ovr-badge">
                <span class="pc-ovr-value">${ovr}</span>
                <span class="pc-ovr-label">OVR</span>
            </div>
            <span class="pc-ovr-rank">${rankHTML || (typeof ovr === 'number' ? getFIFARating(ovr) : 'N/A')}</span>
        </div>
        <div class="pc-hero-visual">
            <img class="pc-hero-avatar" src="${avatar?.src || ''}" alt="${playerName}">
            <div>
                <h2 class="pc-hero-name">${playerName}</h2>
                <span class="pc-hero-position">${parseInfoField('Position')}</span>
            </div>
            ${clubLogoEl ? `<img class="pc-hero-club-logo" src="${clubLogoEl.src}" alt="Club">` : ''}
        </div>
        <div class="pc-hero-meta">
            <div class="pc-meta-chip">
                <span class="pc-meta-label">Pseudo</span>
                <span class="pc-meta-value">${parseInfoField('Pseudo')}</span>
            </div>
            <div class="pc-meta-chip">
                <span class="pc-meta-label">Club</span>
                <span class="pc-meta-value club-accent">${parseInfoField('Club')}</span>
            </div>
            <div class="pc-meta-chip">
                <span class="pc-meta-label">Personnage</span>
                <span class="pc-meta-value">${parseInfoField('Personnage')}</span>
            </div>
            <div class="pc-meta-chip">
                <span class="pc-meta-label">Valeur</span>
                <span class="pc-meta-value">${parseInfoField('Valeur')}</span>
            </div>
        </div>
    `;

    main.parentNode.insertBefore(hero, main);
    main.classList.add('pc-enhanced');
}

/* ===================== STAT BARS ===================== */
function buildStatBars(statRows) {
    const container = document.querySelector('.player-card-fifa-stats');
    if (!container || container.querySelector('.pc-stat-bars')) return;

    const bars = document.createElement('div');
    bars.className = 'pc-stat-bars';
    bars.innerHTML = '<h3>Stats techniques</h3>';

    statRows.forEach(row => {
        // Échelle 50–100 (comme le radar) au lieu de 0–100
        const pct = row.value !== null
            ? Math.max(0, Math.min(100, ((row.value - 40) / 60) * 100))
            : 0;
        const displayVal = row.value !== null ? row.value : '??';
        bars.innerHTML += `
            <div class="pc-stat-row" data-value="${pct}">
                <div class="pc-stat-header">
                    <span class="pc-stat-name">${row.emoji} ${row.label}</span>
                    <span class="pc-stat-value">${displayVal} <span class="pc-stat-grade">${row.gradeHTML}</span></span>
                </div>
                <div class="pc-stat-bar-track">
                    <div class="pc-stat-bar-fill" style="width:0%"></div>
                </div>
            </div>
        `;
    });

    container.insertBefore(bars, container.firstChild);
    container.classList.add('pc-enhanced');
}

function animateStatBars() {
    document.querySelectorAll('.pc-stat-row').forEach((row, i) => {
        const fill = row.querySelector('.pc-stat-bar-fill');
        const value = row.dataset.value;
        setTimeout(() => {
            if (fill) fill.style.width = value + '%';
        }, 100 + i * 100);
    });
}

/* ===================== KPI CARDS ===================== */
function buildKPIs(matchStats) {
    const matchs = matchStats['Matchs'] || 0;
    const buts = matchStats['Buts'] || 0;
    const assists = matchStats['Assists'] || 0;
    const wins = matchStats['Victoire'] || 0;
    const loses = matchStats['Défaite'] || 0;
    const totalGames = wins + loses;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
    const contributions = matchs > 0 ? ((buts + assists) / matchs).toFixed(1) : '0.0';

    return [
        { icon: '⚽', value: buts, label: 'Buts' },
        { icon: '🎯', value: assists, label: 'Assists' },
        { icon: '📈', value: contributions, label: 'G+A / Match' },
        { icon: '🏆', value: winRate + '%', label: 'Win Rate' }
    ];
}

function buildMatchPanel(matchStats) {
    const container = document.querySelector('.player-card-match-stats');
    if (!container || container.querySelector('.pc-match-panel')) return;

    const kpis = buildKPIs(matchStats);

    const panel = document.createElement('div');
    panel.className = 'pc-match-panel';

    let kpiHTML = '<div class="pc-kpi-grid">';
    kpis.forEach(k => {
        kpiHTML += `
            <div class="pc-kpi">
                <div class="pc-kpi-icon">${k.icon}</div>
                <div class="pc-kpi-value">${k.value}</div>
                <div class="pc-kpi-label">${k.label}</div>
            </div>
        `;
    });
    kpiHTML += '</div>';

    let gridHTML = '<div class="pc-match-grid">';
    for (const [label, value] of Object.entries(matchStats)) {
        gridHTML += `
            <div class="pc-match-stat">
                <span class="pc-match-stat-label">${label}</span>
                <span class="pc-match-stat-value">${value}</span>
            </div>
        `;
    }
    gridHTML += '</div>';

    panel.innerHTML = `
        <h3>Stats de matchs</h3>
        ${kpiHTML}
        ${gridHTML}
        <div class="pc-match-actions">
            <button class="pc-btn pc-btn-primary" id="openSeasonPopupClone">📅 Stats par saison</button>
            <button class="pc-btn pc-btn-ghost" id="copyStatsBtn">📋 Copier les stats</button>
        </div>
    `;

    container.insertBefore(panel, container.firstChild);
    container.classList.add('pc-enhanced');

    panel.querySelector('#openSeasonPopupClone')?.addEventListener('click', () => {
        document.getElementById('openSeasonPopup')?.click();
    });

    panel.querySelector('#copyStatsBtn')?.addEventListener('click', copyStatsToClipboard);
}

function copyStatsToClipboard() {
    const stats = extractStatsFromHTML();
    const matchStats = parseMatchStats();
    const lines = [
        `⚡ ${playerName} — Nebula League`,
        `OVR: ${stats.global ?? '??'}`,
        '',
        '📊 Stats techniques:',
        ...STAT_LABELS.map(s => `  ${s.label}: ${stats[s.key] ?? '??'}`),
        '',
        '⚽ Stats matchs:',
        ...Object.entries(matchStats).map(([k, v]) => `  ${k}: ${v}`)
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        showToast('Stats copiées dans le presse-papier !');
    }).catch(() => {
        showToast('Impossible de copier — permissions refusées');
    });
}

/* ===================== TROPHIES PANEL ===================== */
function buildTrophiesPanel() {
    const container = document.querySelector('.player-card-trophies');
    if (!container || container.querySelector('.pc-trophies-panel')) return;

    const trophyIcons = {
        'Prix Puskas': '🥅',
        'NCL Cup': '🏆',
        'Golden Shoe': '👟',
        'Ballon d\'Or': '🌟',
        "Ballon d'Or": '🌟'
    };

    const panel = document.createElement('div');
    panel.className = 'pc-trophies-panel';

    let trophyHTML = '<div class="pc-trophy-grid">';
    container.querySelectorAll('h3').forEach((h3, idx) => {
        if (!h3.textContent.includes('Troph')) return;
        const ul = h3.nextElementSibling;
        if (!ul) return;
        ul.querySelectorAll('li').forEach(li => {
            const strong = li.querySelector('strong');
            const name = strong ? strong.textContent.replace(':', '').trim() : li.textContent;
            const countMatch = li.textContent.match(/:\s*(\d+)/);
            const count = countMatch ? countMatch[1] : '0';
            const icon = Object.entries(trophyIcons).find(([k]) => name.includes(k))?.[1] || '🏅';
            trophyHTML += `
                <div class="pc-trophy-item">
                    <span class="pc-trophy-icon">${icon}</span>
                    <div class="pc-trophy-info">
                        <strong>${name}</strong>
                        <span class="pc-trophy-count">${count}</span>
                    </div>
                </div>
            `;
        });
    });
    trophyHTML += '</div>';

    let titlesHTML = '<h3>Titres débloqués</h3><ul class="pc-titles-list">';
    let hasTitles = false;
    container.querySelectorAll('h3').forEach(h3 => {
        if (!h3.textContent.includes('Titres') || h3.textContent.includes('Troph')) return;
        const ul = h3.nextElementSibling;
        if (!ul) return;
        ul.querySelectorAll('li').forEach(li => {
            if (li.textContent.trim()) {
                hasTitles = true;
                titlesHTML += `<li>${li.innerHTML}</li>`;
            }
        });
    });
    if (!hasTitles) titlesHTML += '<li class="pc-titles-empty">Aucun titre débloqué pour l\'instant</li>';
    titlesHTML += '</ul>';

    panel.innerHTML = trophyHTML + titlesHTML;
    container.insertBefore(panel, container.firstChild);
    container.classList.add('pc-enhanced');
}

/* ===================== TABS ===================== */
function buildTabs() {
    const wrapper = document.querySelector('.player-card-wrapper');
    if (!wrapper || wrapper.querySelector('.pc-tabs')) return;

    const fifaStats = wrapper.querySelector('.player-card-fifa-stats');
    const matchStats = wrapper.querySelector('.player-card-match-stats');
    const trophies = wrapper.querySelector('.player-card-trophies');
    if (!fifaStats || !matchStats || !trophies) return;

    const tabs = document.createElement('div');
    tabs.className = 'pc-tabs';
    tabs.innerHTML = `
        <button class="pc-tab-btn active" data-tab="technique">📊 Technique</button>
        <button class="pc-tab-btn" data-tab="matchs">⚽ Matchs</button>
        <button class="pc-tab-btn" data-tab="palmares">🏆 Palmarès</button>
    `;

    const panels = document.createElement('div');
    panels.className = 'pc-tab-panels';

    const panelTech = document.createElement('div');
    panelTech.className = 'pc-tab-panel active';
    panelTech.dataset.tab = 'technique';

    const statsGrid = document.createElement('div');
    statsGrid.className = 'pc-stats-grid';

    const radarInline = document.createElement('div');
    radarInline.className = 'pc-radar-inline';
    radarInline.innerHTML = `
        <h3>Radar des compétences</h3>
        <div class="pc-radar-inline-canvas"><canvas id="inlineRadarChart"></canvas></div>
        <div class="pc-stats-actions">
            <button class="pc-btn pc-btn-primary" id="openRadarPopupClone">🔍 Agrandir le radar</button>
        </div>
    `;

    statsGrid.appendChild(fifaStats);
    statsGrid.appendChild(radarInline);
    panelTech.appendChild(statsGrid);

    const panelMatch = document.createElement('div');
    panelMatch.className = 'pc-tab-panel';
    panelMatch.dataset.tab = 'matchs';
    panelMatch.appendChild(matchStats);

    const panelPalmares = document.createElement('div');
    panelPalmares.className = 'pc-tab-panel';
    panelPalmares.dataset.tab = 'palmares';
    panelPalmares.appendChild(trophies);

    panels.appendChild(panelTech);
    panels.appendChild(panelMatch);
    panels.appendChild(panelPalmares);

    const hero = wrapper.querySelector('.pc-hero');
    if (hero) {
        hero.after(tabs);
    } else {
        wrapper.prepend(tabs);
    }
    tabs.after(panels);

    tabs.querySelectorAll('.pc-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.querySelectorAll('.pc-tab-btn').forEach(b => b.classList.remove('active'));
            panels.querySelectorAll('.pc-tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            panels.querySelector(`.pc-tab-panel[data-tab="${btn.dataset.tab}"]`)?.classList.add('active');

            if (btn.dataset.tab === 'technique') {
                animateStatBars();
                setTimeout(createInlineRadarChart, 50);
            }
        });
    });

    document.getElementById('openRadarPopupClone')?.addEventListener('click', () => {
        document.getElementById('openRadarPopup')?.click();
    });
}

/* ===================== RADAR CHARTS ===================== */
function getChartOptions(borderColor, playerLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: { display: true, color: 'rgba(255, 255, 255, 0.12)' },
                grid: { color: 'rgba(255, 255, 255, 0.08)' },
                pointLabels: {
                    color: '#ffffff',
                    font: { size: 11, weight: 'bold' },
                    padding: 12
                },
                ticks: {
                    display: true,
                    color: '#666',
                    backdropColor: 'rgba(0, 0, 0, 0.5)',
                    min: 50,
                    max: 100,
                    stepSize: 10,
                    callback: v => (v === 50 || v === 100) ? v : ''
                },
                suggestedMin: 50,
                suggestedMax: 100
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(14, 14, 18, 0.95)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: borderColor,
                borderWidth: 2,
                padding: 12,
                callbacks: {
                    label(ctx) {
                        return `${playerLabel}: ${ctx.raw} (${getFIFARating(ctx.raw)})`;
                    }
                }
            }
        },
        animation: { duration: 1000, easing: 'easeOutQuart' }
    };
}

function createRadarChart(canvasId, chartRef) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return null;

    const stats = extractStatsFromHTML();
    const data = STAT_LABELS.map(s => stats[s.key] ?? 50);

    if (chartRef === 'inline' && inlineRadarChart) {
        inlineRadarChart.destroy();
        inlineRadarChart = null;
    }
    if (chartRef === 'popup' && radarChart) {
        radarChart.destroy();
        radarChart = null;
    }

    const chart = new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: {
            labels: STAT_LABELS.map(s => s.label.toUpperCase()),
            datasets: [{
                label: playerName,
                data,
                backgroundColor: clubData.bgColor,
                borderColor: clubData.borderColor,
                pointBackgroundColor: clubData.borderColor,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2.5
            }]
        },
        options: getChartOptions(clubData.borderColor, playerName)
    });

    if (chartRef === 'inline') inlineRadarChart = chart;
    else radarChart = chart;

    return chart;
}

function createInlineRadarChart() {
    createRadarChart('inlineRadarChart', 'inline');
}

function createUniversalRadarChart() {
    createRadarChart('skillsRadarChart', 'popup');
}

function closeRadarPopup() {
    const popup = document.getElementById('popupRadar');
    if (popup) popup.style.display = 'none';
    if (radarChart) {
        radarChart.destroy();
        radarChart = null;
    }
}

/* ===================== POPUPS (season + match) ===================== */
function initSeasonPopup() {
    const popup = document.getElementById('popupSeason');
    const openBtn = document.getElementById('openSeasonPopup');
    const closeBtn = document.getElementById('closeSeasonPopup');
    const seasonSelect = document.getElementById('seasonSelect');
    const seasonStatsDisplay = document.getElementById('seasonStatsDisplay');

    if (!popup || !openBtn) return;

    function getStatsForSeason(season) {
        const elem = document.querySelector(`.season[data-season="${season}"]`);
        if (!elem) return null;
        return {
            matchs: elem.dataset.matchs,
            buts: elem.dataset.buts,
            assists: elem.dataset.assists,
            saves: elem.dataset.saves,
            dribbles: elem.dataset.dribbles,
            mvp: elem.dataset.mvp,
            win: elem.dataset.win,
            lose: elem.dataset.lose
        };
    }

    function updateSeasonStats(season) {
        const s = getStatsForSeason(season);
        if (!s) return;
        seasonStatsDisplay.innerHTML = `
            <p><strong>Matchs :</strong> ${s.matchs}</p>
            <p><strong>Buts :</strong> ${s.buts}</p>
            <p><strong>Assists :</strong> ${s.assists}</p>
            <p><strong>Defensive Save :</strong> ${s.saves}</p>
            <p><strong>Dribbles :</strong> ${s.dribbles}</p>
            <p><strong>MVP :</strong> ${s.mvp}</p>
            <p><strong>Victoire :</strong> ${s.win}</p>
            <p><strong>Défaite :</strong> ${s.lose}</p>
        `;
    }

    openBtn.onclick = () => {
        popup.style.display = 'flex';
        updateSeasonStats(seasonSelect.value);
    };

    closeBtn.onclick = () => { popup.style.display = 'none'; };
    window.addEventListener('click', e => {
        if (e.target === popup) popup.style.display = 'none';
    });
    seasonSelect.onchange = () => updateSeasonStats(seasonSelect.value);
}

function initMatchPopup() {
    const popupMatch = document.getElementById('popupMatch');
    const closeMatchBtn = document.getElementById('closeMatchPopup');
    const matchSelect = document.getElementById('matchSelect');
    const matchStatsDisplay = document.getElementById('matchStatsDisplay');

    if (!popupMatch) return;

    function getStatsForMatch(match) {
        const elem = document.querySelector(`.match[data-match="${match}"]`);
        if (!elem) return null;
        return {
            title: elem.dataset.title,
            buts: elem.dataset.buts,
            pass: elem.dataset.pass,
            saves: elem.dataset.saves,
            dribbles: elem.dataset.dribbles
        };
    }

    function updateMatchStats(match) {
        const s = getStatsForMatch(match);
        if (!s) return;
        matchStatsDisplay.innerHTML = `
            <h3 style="margin-top:5px;">${s.title}</h3>
            <p><strong>Buts :</strong> ${s.buts}</p>
            <p><strong>Passes D :</strong> ${s.pass}</p>
            <p><strong>Defenses :</strong> ${s.saves}</p>
            <p><strong>Dribbles :</strong> ${s.dribbles}</p>
        `;
    }

    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
            popupMatch.style.display = 'flex';
            updateMatchStats(matchSelect.value);
        }
    });

    closeMatchBtn.onclick = () => { popupMatch.style.display = 'none'; };
    window.addEventListener('click', e => {
        if (e.target === popupMatch) popupMatch.style.display = 'none';
    });
    matchSelect.onchange = () => updateMatchStats(matchSelect.value);
}

function initRadarPopup() {
    const popupRadar = document.getElementById('popupRadar');
    const openRadarBtn = document.getElementById('openRadarPopup');
    const closeRadarBtn = document.getElementById('closeRadarPopup');

    if (!openRadarBtn || !popupRadar) return;

    openRadarBtn.onclick = () => {
        popupRadar.style.display = 'flex';
        setTimeout(createUniversalRadarChart, 80);
    };

    if (closeRadarBtn) closeRadarBtn.onclick = closeRadarPopup;
    window.addEventListener('click', e => {
        if (e.target === popupRadar) closeRadarPopup();
    });
}

/* ===================== MAIN INIT ===================== */
function initPlayerCard() {
    document.body.classList.add('player-card-page');

    const clubKey = detectClub();
    clubData = CLUBS[clubKey] || CLUBS.bastard;
    playerName = getPlayerName();

    const wrapper = document.querySelector('.player-card-wrapper');
    if (wrapper) wrapper.dataset.club = clubKey;

    const stats = extractStatsFromHTML();
    const statRows = parseStatParagraphs();
    const matchStats = parseMatchStats();

    buildHero(clubKey, stats);
    buildStatBars(statRows);
    buildMatchPanel(matchStats);
    buildTrophiesPanel();
    buildTabs();

    setTimeout(() => {
        animateStatBars();
        createInlineRadarChart();
    }, 300);

    initSeasonPopup();
    initMatchPopup();
    initRadarPopup();
}

document.addEventListener('DOMContentLoaded', initPlayerCard);
