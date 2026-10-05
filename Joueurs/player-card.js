/* ===================== CLUB CONFIG ===================== */
function playerCardTint(hex, alpha = 0.15) {
    const value = String(hex || "#63e7ff").replace("#", "");
    const expanded = (value.length === 3
        ? value.split("").map(character => character + character).join("")
        : value).slice(0, 6).padEnd(6, "0");
    const number = Number.parseInt(expanded, 16);
    return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
}

const CLUBS = Object.fromEntries([
    ...(window.NEBULA_DATA?.clubs || []),
    ...Object.values(window.NEBULA_DATA?.groups || {})
].map(club => [club.key, {
    name: club.name,
    logo: club.logo || '',
    borderColor: club.color,
    bgColor: playerCardTint(club.color)
}]));

const STAT_LABELS = [
    { key: 'defense', emoji: '🛡️', label: 'Defense' },
    { key: 'passe', emoji: '⭐', label: 'Passe' },
    { key: 'dribble', emoji: '🌟', label: 'Dribble' },
    { key: 'tir', emoji: '⚽', label: 'Tir' },
    { key: 'offense', emoji: '💥', label: 'Offense' },
    { key: 'position', emoji: '👋', label: 'Positionnement' }
];

const TECHNICAL_TITLE_RULES = window.NEBULA_DATA?.technicalTitleRules || [];

const CAREER_TITLE_TRACKS = window.NEBULA_DATA?.careerTitleTracks || [];
const VALUE_TITLE_TRACK = window.NEBULA_DATA?.valueTitleTrack || null;

/* ===================== NOMS DES TITRES ULTIMES =====================
   La clé correspond au champ `character` de nebula-data.js, sans espace.
   ================================================================== */
const CHARACTER_ULTIMATE_TITLES = {
    isagi: 'Heart of Blue Lock',
    gagamaru: 'The Overseer',
    nagi: 'The Fallen Genius',
    chigiri: 'The Red Panther',
    bachira: 'The Monster',
    shidou: 'The Devil',
    niko: 'The Watchtower',
    kurona: 'Planet Hotline',
    charles: 'The Imp',
    kunigami: 'The Wild Card',
    yukimiya: 'The 1-on-1 Emperor',
    aiku: 'The Snake',
    barou: 'The KING',
    sae: "Japan's Greatest Treasure",
    kiyora: "God's Unknown Plan",
    karasu: 'The Crow',
    otoya: 'Stealthy Ninja',
    ness: 'The SpellCaster',
    kaiser: 'The Blue Rose',
    lorenzo: 'The Zombie',
    rin: 'The Beast',
    reo: 'Master of All Trades',
    hugo: "The Team's Cogwheel",
    nelisagi: 'Genius of Adaptation',
    hiori: 'Ultra Sadist',
    lorenzomastery: 'The Ace Eater',
    aikumastery: 'The Final Wall',
    kaisermastery: "Emperor's Chosen One",
    rinmastery: 'The Berserker'
};

/* ===================== COULEURS DES TITRES ULTIMES =====================
   Modifier ici les trois couleurs d'un personnage :
   accentSecondary → début, accent → centre, accentTertiary → fin.
   ====================================================================== */
const CHARACTER_ULTIMATE_PALETTES = {
    isagi: { accent: '#0075faff', accentSecondary: '#7cff87ff', accentTertiary: '#f0ff98ff' },
    gagamaru: { accent: '#78caf0ff', accentSecondary: '#d3dafdff', accentTertiary: '#ffffffff' },
    nagi: { accent: '#b6dcffff', accentSecondary: '#11edf5ff', accentTertiary: '#a8a8a8ff' },
    chigiri: { accent: '#ff0080ff', accentSecondary: '#ff6d91ff', accentTertiary: '#ffffffff' },
    bachira: { accent: '#ffd900ff', accentSecondary: '#755600ff', accentTertiary: '#000000ff' },
    shidou: { accent: '#ff3f87', accentSecondary: '#d818ffff', accentTertiary: '#cd4dffff' },
    niko: { accent: '#117884', accentSecondary: '#B4E2E1', accentTertiary: '#6C9BE9' },
    kurona: { accent: '#9300c0ff', accentSecondary: '#63e7ff', accentTertiary: '#1a042eff' },
    charles: { accent: '#fada5eff', accentSecondary: '#89cff0', accentTertiary: '#feffbbff' },
    kunigami: { accent: '#ff6b35', accentSecondary: '#ffd84d', accentTertiary: '#a73500ff' },
    yukimiya: { accent: '#ff9900ff', accentSecondary: '#a200ffff', accentTertiary: '#00eeffff' },
    aiku: { accent: '#2bff00ff', accentSecondary: '#119200ff', accentTertiary: '#5e0000ff' },
    barou: { accent: '#ff0000ff', accentSecondary: '#000000ff', accentTertiary: '#6d0000ff' },
    sae: { accent: '#4df3ffff', accentSecondary: '#d300c1ff', accentTertiary: '#c670ffff' },
    kiyora: { accent: '#78caf0ff', accentSecondary: '#d3dafdff', accentTertiary: '#ff819cff' },
    karasu: { accent: '#000280ff', accentSecondary: '#000000ff', accentTertiary: '#020068ff' },
    otoya: { accent: '#c1ffbbff', accentSecondary: '#8aff80ff', accentTertiary: '#1dac00ff' },
    ness: { accent: '#FD2996', accentSecondary: '#7A365B', accentTertiary: '#FDC0FF' },
    kaiser: { accent: '#9ab5ffff', accentSecondary: '#0033dbff', accentTertiary: '#fff389ff' },
    lorenzo: { accent: '#5c00a7ff', accentSecondary: '#21ff7dff', accentTertiary: '#046d00ff' },
    rin: { accent: '#00d3baff', accentSecondary: '#336affff', accentTertiary: '#001f8dff' },
    reo: { accent: '#6200ffff', accentSecondary: '#00f7ffff', accentTertiary: '#37ff1cff' },
    hugo: { accent: '#7E1929', accentSecondary: '#E0B44B', accentTertiary: '#37375B' },
    nelisagi: { accent: '#ffffffff', accentSecondary: '#4d4c9bff', accentTertiary: '#3b39acff' },
    hiori: { accent: '#00ccffff', accentSecondary: '#00f7ffff', accentTertiary: '#ffffffff' },
    lorenzomastery: { accent: '#5c00a7ff', accentSecondary: '#fff021ff', accentTertiary: '#046d00ff' },
    aikumastery: { accent: '#1eff00ff', accentSecondary: '#9728ffff', accentTertiary: '#073800ff' },
    kaisermastery: { accent: '#e8ff80ff', accentSecondary: '#4169e1ff', accentTertiary: '#ff9191ff' },
    rinmastery: { accent: '#007488ff', accentSecondary: '#000000ff', accentTertiary: '#080080ff' },
    default: { accent: '#c879ff', accentSecondary: '#63e7ff', accentTertiary: '#ff5c8a' }
};

let radarChart = null;
let inlineRadarChart = null;
let clubData = CLUBS.bastard;
let playerName = 'Joueur';
let playerData = null;

/* ===================== UTILITIES ===================== */
function detectClub() {
    const html = document.body.innerHTML;
    for (const [key] of Object.entries(CLUBS)) {
        if (html.includes(`player-header-${key}`)) return key;
    }
    return 'bastard';
}

function getPlayerName() {
    const fileSlug = decodeURIComponent(window.location.pathname.split('/').pop() || '')
        .replace(/\.html$/i, '');
    const filePlayer = (window.NEBULA_DATA?.players || [])
        .find(player => normalizeLabel(player.name) === normalizeLabel(fileSlug));
    if (filePlayer) return filePlayer.name;

    const header = document.querySelector(
        '[class*="player-header-"] h2'
    );
    return header ? header.textContent.trim() : 'Joueur';
}

function getCentralPlayer(name) {
    const directMatch = window.NEBULA_DATA?.getPlayer?.(name);
    if (directMatch) return directMatch;
    return (window.NEBULA_DATA?.players || [])
        .find(player => normalizeLabel(player.name) === normalizeLabel(name)) || null;
}

function formatPlayerValue(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return 'NON COTÉ';
    return `${Math.round(amount).toLocaleString('fr-FR')} ¥`;
}

function syncInfoField(labelText, value) {
    if (value === undefined || value === null) return;
    const paragraph = [...document.querySelectorAll('.player-info p')]
        .find(item => normalizeLabel(item.textContent).startsWith(normalizeLabel(labelText)));
    if (!paragraph) return;

    const label = paragraph.querySelector('strong');
    paragraph.innerHTML = `${label ? label.outerHTML : `<strong>${labelText} :</strong>`} ${value}`;
}

function syncPlayerIdentityFromData(player) {
    if (!player) return;
    syncInfoField('Pseudo', player.name);
    syncInfoField('Club', player.clubName);
    syncInfoField('Position', player.position);
    syncInfoField('Personnage', player.character);
    syncInfoField('Valeur', formatPlayerValue(player.value));
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
    if (playerData?.technical) {
        return {
            defense: playerData.technical.defense ?? null,
            passe: playerData.technical.passe ?? null,
            dribble: playerData.technical.dribble ?? null,
            tir: playerData.technical.tir ?? null,
            offense: playerData.technical.offense ?? null,
            position: playerData.technical.position ?? null,
            global: playerData.technical.global ?? null,
            rankHTML: ''
        };
    }

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

    if (playerData?.technical) {
        return STAT_LABELS.map(stat => {
            const value = playerData.technical[stat.key];
            const grade = Number.isFinite(value) ? getFIFARating(value) : 'N/A';
            return {
                ...stat,
                value: Number.isFinite(value) ? value : null,
                gradeHTML: `<span class="${grade.toLowerCase()}">${grade}</span>`
            };
        });
    }

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
    const centralStats = window.NEBULA_DATA?.getPlayerMatchStats?.(playerName);
    if (centralStats) {
        return {
            Matchs: centralStats.matches,
            Buts: centralStats.goals,
            Assists: centralStats.assists,
            'Contribution défensive': centralStats.defenses,
            Dribbles: centralStats.dribbles,
            MVP: centralStats.mvp,
            Victoire: centralStats.wins,
            Défaite: centralStats.losses
        };
    }

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

function normalizeLabel(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[’']/g, '')
        .toLowerCase()
        .trim();
}

function getMatchStat(matchStats, aliases) {
    const normalizedAliases = aliases.map(normalizeLabel);
    for (const [label, value] of Object.entries(matchStats)) {
        const normalizedLabel = normalizeLabel(label);
        if (normalizedAliases.some(alias => normalizedLabel === alias || normalizedLabel.includes(alias))) {
            const number = Number(value);
            return Number.isFinite(number) ? number : 0;
        }
    }
    return 0;
}

function getCharacterUltimateKey() {
    const character = playerData?.character || parseInfoField('Personnage');
    return normalizeLabel(character).replace(/[^a-z0-9]/g, '');
}

function getCharacterUltimatePalette() {
    return CHARACTER_ULTIMATE_PALETTES[getCharacterUltimateKey()]
        || CHARACTER_ULTIMATE_PALETTES.default;
}

function getUnlockedCharacterUltimateTitles() {
    if (playerData?.Ult !== true) return [];

    const titleName = CHARACTER_ULTIMATE_TITLES[getCharacterUltimateKey()];
    if (!titleName) return [];

    const palette = getCharacterUltimatePalette();
    return [{
        name: titleName,
        requirement: `Titre ultime de ${playerData.character}`,
        code: 'ULT',
        accent: palette.accent,
        accentSecondary: palette.accentSecondary,
        accentTertiary: palette.accentTertiary,
        priority: 900,
        source: 'ultimate',
        category: 'Titre ultime de personnage'
    }];
}

function extractManualTitles() {
    const container = document.querySelector('.player-card-trophies');
    if (!container) return [];

    const titles = [];
    container.querySelectorAll(':scope > h3').forEach(h3 => {
        if (!normalizeLabel(h3.textContent).includes('titres')) return;
        const list = h3.nextElementSibling;
        if (!list || list.tagName !== 'UL') return;
        list.querySelectorAll('li').forEach(li => {
            const name = li.textContent.trim();
            if (!name) return;
            const strong = li.querySelector('strong');
            const isUltimate = li.dataset.titleType === 'ultimate';
            const ultimatePalette = isUltimate
                ? getCharacterUltimatePalette()
                : CHARACTER_ULTIMATE_PALETTES.default;
            titles.push({
                name,
                requirement: isUltimate ? 'Maîtrise ultime du personnage' : 'Titre attribué manuellement',
                code: isUltimate ? 'ULT' : 'ARC',
                accent: isUltimate ? ultimatePalette.accent : '#c879ff',
                accentSecondary: isUltimate ? ultimatePalette.accentSecondary : '#c879ff',
                accentTertiary: isUltimate ? ultimatePalette.accentTertiary : '#c879ff',
                priority: isUltimate ? 900 : 40,
                source: isUltimate ? 'ultimate' : 'manual',
                category: isUltimate ? 'Titre ultime de personnage' : 'Palmarès',
                legacyHTML: strong ? strong.outerHTML : li.innerHTML
            });
        });
    });
    return titles;
}

function getSeasonRewardTitles() {
    const data = window.NEBULA_DATA || {};
    const seasons = data.seasons || [];
    const currentPlayer = normalizeLabel(playerName);
    const currentClub = data.getClub?.(playerData?.club) || null;
    const currentClubAliases = new Set([
        playerData?.club,
        currentClub?.key,
        currentClub?.name,
        currentClub?.shortName,
        currentClub?.fullName
    ].filter(Boolean).map(normalizeLabel));
    const rewardAccents = {
        PUS: '#ff536e',
        GLD: '#ffd84d',
        NCL: '#9bff20',
        BDO: '#ffd84d',
        LIG: '#f2f5f7'
    };
    const rewardWeights = {
        PUS: 1000,
        LIG: 1100,
        NCL: 1200,
        GLD: 1300,
        BDO: 1400,
        GOAT: 1500
    };
    const rewardNames = {
        PUS: 'Prix Puskás',
        LIG: 'Champion de la Ligue',
        NCL: 'Trophée de la NCL',
        GLD: 'Golden Shoe',
        BDO: "Ballon d'Or",
        GOAT: '★ GOAT ★'
    };

    const seasonTitles = seasons.flatMap(season => {
        const rewards = data.resolveSeasonRewards
            ? data.resolveSeasonRewards(season)
            : (season.rewards || []);
        const finished = season.status === 'finished';
        const individualRewards = rewards.filter(reward => (
            reward.code !== 'NCL'
            && normalizeLabel(reward.value) === currentPlayer
        ));
        const wonNcl = finished && rewards.some(reward => (
            reward.code === 'NCL'
            && currentClubAliases.has(normalizeLabel(reward.value))
        ));
        const fallbackStandings = (data.clubs || [])
            .map(club => {
                const stats = data.getClubMatchStats?.(club.key, season.number)
                    || { played: 0, points: 0, gf: 0, ga: 0 };
                return { club: club.key, ...stats, diff: Number(stats.gf || 0) - Number(stats.ga || 0) };
            })
            .filter(row => Number(row.played) > 0)
            .sort((a, b) => (
                Number(b.points || 0) - Number(a.points || 0)
                || Number(b.diff || 0) - Number(a.diff || 0)
                || Number(b.gf || 0) - Number(a.gf || 0)
            ));
        const leagueChampionKey = fallbackStandings[0]?.club || null;
        const wonLeague = finished && currentClubAliases.has(normalizeLabel(leagueChampionKey));
        const unlockedDuringSeason = individualRewards
            .map(reward => ({
                name: rewardNames[reward.code] || reward.label,
                requirement: `Attribué lors de la Saison ${season.number}`,
                code: reward.code || 'RWD',
                accent: rewardAccents[reward.code] || '#ffd84d',
                priority: rewardWeights[reward.code] || 950,
                source: 'season',
                category: 'Récompense officielle',
                season: season.number
            }));

        if (wonLeague) {
            unlockedDuringSeason.push({
                name: rewardNames.LIG,
                requirement: `Champion de la Nebula League lors de la Saison ${season.number}`,
                code: 'LIG',
                accent: rewardAccents.LIG,
                priority: rewardWeights.LIG,
                source: 'season',
                category: 'Titre collectif',
                season: season.number
            });
        }

        if (wonNcl) {
            unlockedDuringSeason.push({
                name: rewardNames.NCL,
                requirement: `Vainqueur de la Nebula Champions League lors de la Saison ${season.number}`,
                code: 'NCL',
                accent: rewardAccents.NCL,
                priority: rewardWeights.NCL,
                source: 'season',
                category: 'Titre collectif',
                season: season.number
            });
        }

        const individualCodes = new Set(individualRewards.map(reward => reward.code));
        const isGoatSeason = wonLeague
            && wonNcl
            && individualCodes.has('PUS')
            && individualCodes.has('GLD')
            && individualCodes.has('BDO');

        if (isGoatSeason) {
            unlockedDuringSeason.push({
                name: rewardNames.GOAT,
                requirement: `Toutes les distinctions majeures remportées lors de la Saison ${season.number}`,
                code: 'GOAT',
                accent: '#ffd84d',
                accentSecondary: '#fff4b0',
                accentTertiary: '#9b6800',
                priority: rewardWeights.GOAT,
                source: 'season',
                category: 'Rang absolu',
                season: season.number
            });
        }

        return unlockedDuringSeason;
    });

    const groupedTitles = new Map();
    seasonTitles.forEach(title => {
        const key = title.code || normalizeLabel(title.name);
        const seasonNumber = Number(title.season);
        if (!groupedTitles.has(key)) {
            groupedTitles.set(key, {
                ...title,
                seasons: Number.isFinite(seasonNumber) ? [seasonNumber] : []
            });
            return;
        }

        const groupedTitle = groupedTitles.get(key);
        if (Number.isFinite(seasonNumber) && !groupedTitle.seasons.includes(seasonNumber)) {
            groupedTitle.seasons.push(seasonNumber);
        }
    });

    return Array.from(groupedTitles.values()).map(title => {
        const wonSeasons = title.seasons.sort((a, b) => a - b);
        const seasonList = wonSeasons.map(number => String(number).padStart(2, '0')).join(' · ');
        const count = wonSeasons.length;
        return {
            ...title,
            season: wonSeasons[wonSeasons.length - 1],
            requirement: `${count > 1 ? 'Saisons remportées' : 'Saison remportée'} : ${seasonList}`,
            proof: `${count > 1 ? 'Saisons remportées' : 'Saison remportée'} : ${seasonList}`
        };
    });
}

function highestUnlockedTier(track, value) {
    if (!track || !Number.isFinite(value)) return null;

    return track.titles.reduce((highest, [threshold, name], tierIndex) => (
        value >= threshold ? { threshold, name, tierIndex } : highest
    ), null);
}

function evaluatePlayerTitles(stats, matchStats, playerValue = null) {
    const unlocked = [];

    TECHNICAL_TITLE_RULES.forEach(rule => {
        const value = rule.metric === 'global'
            ? (stats.global ?? calculateGlobalAverage(stats))
            : stats[rule.metric];
        const threshold = Number(rule.threshold ?? 95);
        if (Number.isFinite(value) && value >= threshold) {
            unlocked.push({
                ...rule,
                value,
                threshold,
                source: 'automatic',
                category: 'Statistique'
            });
        }
    });

    CAREER_TITLE_TRACKS.forEach(track => {
        const value = getMatchStat(matchStats, track.aliases);
        const tier = highestUnlockedTier(track, value);
        if (!tier) return;

        unlocked.push({
            name: tier.name,
            requirement: `${tier.threshold} ${track.unit}`,
            code: track.code,
            accent: track.accent,
            priority: 20 + tier.tierIndex * 12,
            value,
            threshold: tier.threshold,
            source: 'automatic',
            category: 'Carrière',
            metric: track.metric
        });
    });

    const marketValue = Number(playerValue);
    const valueTier = highestUnlockedTier(VALUE_TITLE_TRACK, marketValue);
    if (valueTier) {
        unlocked.push({
            name: valueTier.name,
            requirement: `${formatPlayerValue(valueTier.threshold)} de valeur`,
            code: VALUE_TITLE_TRACK.code,
            accent: VALUE_TITLE_TRACK.accent,
            priority: 30 + valueTier.tierIndex * 12,
            value: marketValue,
            threshold: valueTier.threshold,
            source: 'automatic',
            category: 'Valeur',
            metric: VALUE_TITLE_TRACK.metric
        });
    }

    return unlocked.sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));
}

function mergePlayerTitles(automaticTitles, manualTitles) {
    const merged = [];
    const seen = new Set();
    [...automaticTitles, ...manualTitles].forEach(title => {
        const key = normalizeLabel(title.name);
        if (!key || seen.has(key)) return;
        seen.add(key);
        merged.push(title);
    });
    return merged.sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));
}

function getFIFARating(value) {
    if (value >= 100) return 'Z';
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
    if (typeof window.NEBULA_DATA?.calculateTechnicalOverall === 'function') {
        return window.NEBULA_DATA.calculateTechnicalOverall(stats);
    }

    const rawValues = ['defense', 'passe', 'dribble', 'tir', 'offense', 'position']
        .map(key => stats[key]);
    if (rawValues.some(value => value === null || value === undefined || value === '')) return null;

    const values = rawValues.map(Number);
    if (values.some(value => !Number.isFinite(value))) return null;
    return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
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

// Identifiants uniques pour les dégradés et masques des illustrations.
let titleArtSequence = 0;

// Illustrations des titres (hero des fiches). Les animations CSS sont dans
// player-card.css (section « ILLUSTRATIONS ANIMÉES ») ; les trajectoires de
// ballon utilisent <animateMotion>, retiré si le visiteur réduit les animations.
function getTechnicalTitleIllustration(title) {
    const trophyIllustrations = {
        BDO: 'ballon-dor',
        GLD: 'golden-shoe',
        NCL: 'ncl-trophy',
        GOAT: 'goat'
    };
    if (title?.source === 'ultimate') return '';

    const metric = title?.category === 'Carrière' ? `career-${title.metric}`
        : title?.category === 'Valeur' ? 'value-track'
        : trophyIllustrations[title?.code] || (title?.category === 'Statistique' ? title.metric : null);
    const uid = `pc-art-${++titleArtSequence}`;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const motion = markup => (reducedMotion ? '' : markup);

    // Reflet qui balaie un trophée (dégradé + masque à la forme du trophée).
    const shine = (clipShapes, box) => `
        <defs>
            <linearGradient id="${uid}-shine" x1="0" x2="1">
                <stop offset="0" stop-color="#fff" stop-opacity="0" />
                <stop offset="0.5" stop-color="#fff" stop-opacity="0.75" />
                <stop offset="1" stop-color="#fff" stop-opacity="0" />
            </linearGradient>
            <clipPath id="${uid}-clip">${clipShapes}</clipPath>
        </defs>
        <g clip-path="url(#${uid}-clip)">
            <g transform="rotate(18 ${box.cx} ${box.cy})">
                <rect class="art-shine" x="${box.x}" y="${box.y}" width="16" height="${box.h}" fill="url(#${uid}-shine)" />
            </g>
        </g>`;

    // Petites étoiles scintillantes.
    const sparkles = points => points.map(([x, y, size], index) => `
        <path class="art-sparkle art-sparkle-${index + 1}" d="M${x} ${y - size}l${size * 0.3} ${size * 0.7} ${size * 0.7} ${size * 0.3}-${size * 0.7} ${size * 0.3}-${size * 0.3} ${size * 0.7}-${size * 0.3}-${size * 0.7}-${size * 0.7}-${size * 0.3} ${size * 0.7}-${size * 0.3}z" />`).join('');

    // ---------- Style blueprint / hologramme ----------
    // Crochets de cadrage aux quatre coins d'une zone.
    const bpFrame = (x1, y1, x2, y2, size = 5) => `
        <path class="bp-frame" d="M${x1} ${y1 + size}V${y1}h${size}M${x2 - size} ${y1}h${size}v${size}M${x2} ${y2 - size}v${size}h-${size}M${x1 + size} ${y2}h-${size}v-${size}" />`;
    // Ligne de balayage holographique qui descend sur le dessin.
    const bpScan = (width, height) => `
        <rect class="bp-scan" x="0" y="0" width="${width}" height="0.7" style="--bp-scan-height: ${height}px" />`;
    // Annotation technique en police mono.
    const bpLabel = (x, y, text, anchor = 'start') => `<text class="bp-label" x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;
    // Graduations régulières sur un cercle (lunette, cadran).
    const bpTicks = (cx, cy, inner, outer, count, offset = 0) => {
        let d = '';
        for (let i = 0; i < count; i++) {
            const angle = (offset + (i * 360) / count) * Math.PI / 180;
            const long = i % 3 === 0 ? 2 : 0;
            d += `M${(cx + Math.cos(angle) * inner).toFixed(1)} ${(cy + Math.sin(angle) * inner).toFixed(1)}L${(cx + Math.cos(angle) * (outer + long)).toFixed(1)} ${(cy + Math.sin(angle) * (outer + long)).toFixed(1)}`;
        }
        return d;
    };
    // Rayons en éventail entre deux angles (en degrés).
    const bpRays = (cx, cy, inner, outer, from, to, count) => {
        let d = '';
        for (let i = 0; i < count; i++) {
            const angle = (from + ((to - from) * i) / (count - 1)) * Math.PI / 180;
            d += `M${(cx + Math.cos(angle) * inner).toFixed(1)} ${(cy + Math.sin(angle) * inner).toFixed(1)}L${(cx + Math.cos(angle) * outer).toFixed(1)} ${(cy + Math.sin(angle) * outer).toFixed(1)}`;
        }
        return d;
    };
    // Engrenage : `teeth` dents de profondeur `depth` autour d'un rayon `radius`.
    const bpGear = (cx, cy, radius, teeth, depth) => {
        const points = [];
        for (let i = 0; i < teeth; i++) {
            const step = (Math.PI * 2) / teeth;
            const base = i * step;
            [[0, radius - depth], [0.18, radius], [0.5, radius], [0.68, radius - depth]].forEach(([fraction, r]) => {
                const angle = base + fraction * step;
                points.push(`${(cx + Math.cos(angle) * r).toFixed(1)} ${(cy + Math.sin(angle) * r).toFixed(1)}`);
            });
        }
        return `M${points.join('L')}Z`;
    };
    // Damier en perspective : renvoie les lignes et le contour d'une case.
    const bpBoard = (cols, rowsY, bottom, top) => {
        const lerp = (a, b, t) => a + (b - a) * t;
        const span = y => {
            const t = (y - rowsY[0]) / (rowsY[rowsY.length - 1] - rowsY[0]);
            return [lerp(top[0], bottom[0], t), lerp(top[1], bottom[1], t)];
        };
        const xAt = (y, col) => {
            const [left, right] = span(y);
            return lerp(left, right, col / cols);
        };
        let lines = rowsY.map(y => `M${span(y)[0].toFixed(1)} ${y}H${span(y)[1].toFixed(1)}`).join('');
        for (let col = 0; col <= cols; col++) {
            lines += `M${xAt(rowsY[0], col).toFixed(1)} ${rowsY[0]}L${xAt(rowsY[rowsY.length - 1], col).toFixed(1)} ${rowsY[rowsY.length - 1]}`;
        }
        const cell = (col, row) => {
            const y1 = rowsY[row];
            const y2 = rowsY[row + 1];
            return `M${xAt(y1, col).toFixed(1)} ${y1}L${xAt(y1, col + 1).toFixed(1)} ${y1}L${xAt(y2, col + 1).toFixed(1)} ${y2}L${xAt(y2, col).toFixed(1)} ${y2}Z`;
        };
        return { lines, cell, xAt };
    };
    // Compteur mécanique qui affiche la valeur réelle du titre (buts, ¥…).
    const bpCounter = (x, y, unit) => {
        const amount = Number(title?.value);
        const text = !Number.isFinite(amount) ? '—'
            : amount >= 1e9 ? `${(amount / 1e9).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} MD`
                : amount >= 1e6 ? `${Math.round(amount / 1e6)} M`
                    : String(Math.round(amount));
        const width = text.length * 5.6 + 8;
        return `
        <g class="bp-counter">
            <rect class="bp-fine" x="${x}" y="${y}" width="${width.toFixed(1)}" height="12" rx="1" />
            <path class="bp-fine bp-faint" d="${[...text].map((_, i) => `M${(x + 4 + (i + 1) * 5.6).toFixed(1)} ${y + 2}v8`).slice(0, -1).join('')}" />
            <text class="bp-counter-value" x="${(x + width / 2).toFixed(1)}" y="${y + 9}" text-anchor="middle">${text}</text>
            ${bpLabel(x, y + 19, unit)}
        </g>`;
    };
    // Slalom du ballon entre les cinq plots (titres de dribbles).
    const slalomPath = 'M54 56C60 46 70 46 75 56S88 66 93 56S106 46 111 56S124 66 129 56S142 46 148 54';
    // Trajectoire du dribble qui dessine les quatre ailes du papillon.
    const butterflyPath = 'M80 45C72 28 50 12 40 24C32 34 48 48 80 45C112 48 128 34 120 24C110 12 88 28 80 45C90 52 104 56 106 66C108 76 90 70 80 45C70 70 52 76 54 66C56 56 70 52 80 45Z';

    const illustrations = {
        // ---------- Titres de carrière et de valeur ----------
        'career-goals': `
            <svg class="pc-technical-title-art bp-art bp-career-goals" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(10, 3, 150, 87)}
                    <path class="bp-fill" d="M62 14h80v52H62z" />
                    <path d="M62 66V14h80v52" />
                    <path class="bp-fine bp-faint goals-net" d="M62 22h80M62 30h80M62 38h80M62 46h80M62 54h80M70 14v52m8-52v52m8-52v52m8-52v52m8-52v52m8-52v52m8-52v52m8-52v52m8-52v52" />
                    <path class="bp-fine" d="M56 66h92" />
                    ${[[70, 22], [92, 30], [118, 20], [134, 36], [80, 44], [106, 50], [126, 58], [96, 18], [72, 56], [140, 24], [112, 34], [86, 60]].map(([x, y], i) => `
                    <circle class="bp-solid goals-ball goals-ball-${i % 6}" cx="${x}" cy="${y}" r="2.4" />`).join('')}
                    ${bpCounter(16, 40, 'BUTS')}
                    ${bpLabel(17, 10, 'STK // FILETS')}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        'career-assists': `
            <svg class="pc-technical-title-art bp-art bp-career-assists" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(10, 3, 150, 87)}
                    <path class="bp-fine bp-faint" d="M138 20h14v40h-14" />
                    <path class="bp-fine bp-dash art-flow" d="M58 64 80 28 102 58 126 34 146 40" />
                    ${[[58, 64], [80, 28], [102, 58], [126, 34]].map(([x, y], i) => `
                    <circle class="glyph-ball assist-node assist-node-${i + 1}" cx="${x}" cy="${y}" r="4.6" />`).join('')}
                    ${bpLabel(54, 78, 'P1')}${bpLabel(76, 20, 'P2')}${bpLabel(98, 72, 'P3')}${bpLabel(122, 26, 'P4')}
                    ${motion(`<circle class="bp-solid assist-pulse" r="2.4"><animateMotion path="M58 64 80 28 102 58 126 34 146 40" dur="3s" repeatCount="indefinite" calcMode="linear" /></circle>`)}
                    ${bpCounter(16, 30, 'PASSES D.')}
                    ${bpLabel(17, 10, 'PAS // RELAIS')}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        'career-defensive': `
            <svg class="pc-technical-title-art bp-art bp-career-defense" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(10, 3, 150, 87)}
                    ${[0, 1, 2, 3, 4].map(row => `
                    <g class="wallrow wallrow-${row + 1}">${[0, 1, 2, 3].map(col => {
                        const x = 74 + col * 16 + (row % 2 ? 8 : 0);
                        const y = 70 - row * 11;
                        return `<rect class="bp-fill" x="${x}" y="${y}" width="15" height="10" /><rect class="bp-fine" x="${x}" y="${y}" width="15" height="10" />`;
                    }).join('')}</g>`).join('')}
                    <path class="bp-fine bp-faint" d="M72 81h76" />
                    <g class="wall-deflect">
                        <circle class="glyph-ball" cx="62" cy="36" r="4.4" />
                        ${motion('<animateTransform attributeName="transform" type="translate" values="-30 6;0 0;-24 -18;-24 -18" keyTimes="0;0.4;0.75;1" dur="2.6s" repeatCount="indefinite" />')}
                    </g>
                    <path class="bp-fine bp-dash" d="M30 44 62 36 40 18" />
                    ${bpCounter(16, 56, 'SAUVETAGES')}
                    ${bpLabel(17, 10, 'DEF // BASTION')}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        'career-dribbles': `
            <svg class="pc-technical-title-art bp-art bp-career-dribbles" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(10, 3, 150, 87)}
                    <path class="bp-fine bp-faint" d="M54 62h96" />
                    ${[66, 84, 102, 120, 138].map((x, i) => `
                    <path class="bp-fill slalom-cone slalom-cone-${i + 1}" d="M${x} 50l5 12h-10z" />
                    <path class="slalom-cone slalom-cone-${i + 1}" d="M${x} 50l5 12h-10zM${x - 3.5} 58h7" />`).join('')}
                    <path class="bp-fine bp-dash art-flow" d="${slalomPath}" />
                    <circle class="glyph-ball slalom-ball" ${reducedMotion ? 'cx="56" cy="56"' : ''} r="3.6">
                        ${motion(`<animateMotion path="${slalomPath}" dur="3.2s" repeatCount="indefinite" calcMode="linear" />`)}
                    </circle>
                    ${bpCounter(16, 24, 'DRIBBLES')}
                    ${bpLabel(17, 10, 'DRI // SLALOM')}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        'value-track': `
            <svg class="pc-technical-title-art bp-art bp-value-track" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(10, 3, 150, 87)}
                    <path class="bp-fine bp-faint" d="M70 78h80M70 78V12" />
                    <path class="bp-fine bp-dash" d="M72 70l16-10 16 4 16-18 16-8 12-20" />
                    <path class="bp-fine" d="M148 18l-1 6m1-6-6 1" />
                    ${[[84, 3], [104, 5], [124, 7]].map(([x, count], column) => `
                    <g class="coin-stack coin-stack-${column + 1}">${Array.from({ length: count }, (_, i) => `
                        <ellipse class="bp-fill" cx="${x}" cy="${76 - i * 5}" rx="8" ry="2.4" />
                        <path class="bp-fine" d="M${x - 8} ${76 - i * 5}v-2.4a8 2.4 0 0 0 16 0V${76 - i * 5}a8 2.4 0 0 1-16 0" />`).join('')}
                        <ellipse class="bp-fine" cx="${x}" cy="${76 - count * 5 + 2.6}" rx="8" ry="2.4" />
                    </g>`).join('')}
                    <g class="value-coin">
                        <circle class="bp-fill" cx="140" cy="44" r="9" />
                        <circle cx="140" cy="44" r="9" />
                        <circle class="bp-fine bp-faint" cx="140" cy="44" r="6.5" />
                        <path class="bp-fine" d="M136.5 39.5 140 44l3.5-4.5M140 44v5.5m-3 -3.5h6m-6 2h6" />
                    </g>
                    ${bpCounter(16, 44, 'VALEUR ¥')}
                    ${bpLabel(17, 10, 'VAL // FORTUNE')}
                    ${sparkles([[134, 30, 3], [152, 56, 2.5]])}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        'ballon-dor': `
            <svg class="pc-technical-title-art bp-art ballon-dor-illustration" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(44, 3, 116, 87)}
                    <g class="bdo-rays"><path class="bp-fine bp-dash" d="${bpRays(80, 34, 29, 41, 200, 340, 9)}" /></g>
                    <circle class="bp-fine bp-dash" cx="80" cy="34" r="25" />
                    <circle class="bp-fill" cx="80" cy="34" r="20" />
                    <circle cx="80" cy="34" r="20" />
                    <g class="bdo-facets">
                        <path d="M80 27l6.7 4.8-2.6 7.9h-8.2l-2.6-7.9z" />
                        <path class="bp-fine" d="M80 27V14m6.7 17.8L99 27.8m-14.9 11.9 7.7 10.5m-15.9-10.5-7.7 10.5m5.1-18.4L61 27.8" />
                        <path class="bp-fine bp-faint" d="M80 14l11 4 8 9.8-1 12.2-6.2 10.2L80 54l-11.8-3.8L62 40l-1-12.2 8-9.8z" />
                    </g>
                    <path d="M70 55h20l-4 4H74z" />
                    <path d="M75 59l-2 11h14l-2-11" />
                    <rect x="62" y="70" width="36" height="8" rx="1" />
                    <path class="bp-fine bp-faint" d="M66 74h28" />
                    <path class="bp-fine" d="M122 14v64m-3-64h6m-6 64h6" />
                    ${bpLabel(125, 48, 'H.64')}
                    ${bpLabel(6, 10, 'BDO // OR')}
                    ${bpLabel(6, 17, 'ÉCH 1:1')}
                    ${bpLabel(80, 85, 'SÉRIE 01', 'middle')}
                    ${sparkles([[52, 14, 4], [108, 18, 3.5]])}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        'golden-shoe': `
            <svg class="pc-technical-title-art bp-art bp-boot-illustration" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(30, 3, 146, 87)}
                    <path class="bp-fine" d="M52 20h66m-66-3v6m66-6v6" />
                    ${bpLabel(85, 17.5, 'L.66', 'middle')}
                    <path class="bp-fine" d="M137 28v52m-3-52h6m-6 52h6" />
                    ${bpLabel(140, 56, 'H.52')}
                    <ellipse class="bp-fine bp-dash boot-turntable" cx="85" cy="82" rx="46" ry="4" />
                    <path class="bp-fill" d="M46 64h66l10-5H56z" />
                    <path d="M46 64h66l10-5H56zM46 64v16h66V64m0 16 10-5V59" />
                    <path class="bp-fine bp-faint" d="M50 70c8-3 14 4 22 1s12-4 18 0M84 77c6-3 12-1 20-4m10-5c2 2 4 1 6-2" />
                    <rect class="bp-fine" x="54" y="67" width="50" height="9" />
                    <text class="bp-label boot-plaque" x="79" y="73.2" text-anchor="middle">MEILLEUR BUTEUR</text>
                    <g class="boot-turn">
                        <path class="bp-fill" d="M58 29c0-2 12-3 16-1l3 6c10 2 22 5 34 9 8 3 10 8 6 11l-58 1c-5 0-8-3-7-7z" />
                        <path d="M58 29c0-2 12-3 16-1l3 6c10 2 22 5 34 9 8 3 10 8 6 11l-58 1c-5 0-8-3-7-7z" />
                        <ellipse class="bp-fine" cx="66" cy="28.6" rx="8" ry="2.2" />
                        <path class="bp-fine" d="M56 55h62l-2 3H58zM64 58v2m11-2v2m24-2v2m12-2v2" />
                        <path class="bp-fine bp-faint" d="M58 38c2 6 2 9 0 12M66 50c14 1 30-1 44-5" />
                        <path class="bp-fine" d="M79 37l4-4m3 6 4-4m3 6 4-4m-14-2 7 2m0-4 7 2" />
                        ${shine('<path d="M58 29c0-2 12-3 16-1l3 6c10 2 22 5 34 9 8 3 10 8 6 11l-58 1c-5 0-8-3-7-7z" />', { x: 30, y: 0, h: 90, cx: 88, cy: 44 })}
                    </g>
                    ${bpLabel(37, 10, 'GLD // TROPHÉE')}
                    ${sparkles([[128, 34, 4], [44, 36, 3], [116, 26, 2.5]])}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        'ncl-trophy': `
            <svg class="pc-technical-title-art bp-art bp-cup-illustration" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(28, 3, 132, 87)}
                    <path class="bp-fine bp-dash" d="M80 4v83" />
                    <path class="bp-fine" d="M60 8h40m-40-3v6m40-6v6" />
                    ${bpLabel(80, 5.5, 'Ø40', 'middle')}
                    <path class="bp-fill" d="M60 16h40l-4 28c-2 12-9 18-16 18s-14-6-16-18z" />
                    <path d="M60 16h40l-4 28c-2 12-9 18-16 18s-14-6-16-18z" />
                    <ellipse class="bp-fine" cx="80" cy="16" rx="20" ry="3" />
                    <path class="bp-fine bp-faint" d="M66 26c9 4 19 4 28 0m-26 12c8 3 16 3 24 0" />
                    <path d="M61 22C47 13 34 21 38 35c3 10 13 13 22 10" />
                    <path d="M99 22c14-9 27-1 23 13-3 10-13 13-22 10" />
                    <path class="bp-fine bp-faint" d="M61 27c-9-5-17 0-15 8 2 6 8 8 14 6m40-14c9-5 17 0 15 8-2 6-8 8-14 6" />
                    <path d="M76 62v8m8-8v8M68 70h24l3 5H65zM62 75h36v7H62z" />
                    ${bpLabel(80, 80.5, 'NCL // CUP', 'middle')}
                    <ellipse class="bp-fine bp-dash" cx="80" cy="30" rx="36" ry="7" />
                    ${motion(['0s', '-1.6s', '-3.2s'].map(begin => `
                    <path class="bp-solid ncl-orbit-star" d="M0 -3l0.9 2.1 2.1 0.9-2.1 0.9L0 3l-0.9-2.1L-3 0l2.1-0.9z">
                        <animateMotion path="M44 30a36 7 0 1 0 72 0a36 7 0 1 0-72 0" dur="4.8s" begin="${begin}" repeatCount="indefinite" />
                    </path>`).join(''))}
                    ${bpLabel(6, 10, 'LIGUE // NCL')}
                    ${sparkles([[126, 18, 3.5], [36, 60, 3]])}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        goat: `
            <svg class="pc-technical-title-art bp-art bp-crown-illustration" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(22, 3, 138, 87)}
                    <g class="crown-halo">
                        <circle class="bp-fine bp-dash" cx="80" cy="44" r="34" />
                        <path class="bp-fine bp-faint" d="${bpTicks(80, 44, 34, 37, 36)}" />
                    </g>
                    <path class="bp-fine bp-dash" d="M80 4v80" />
                    <path class="bp-fill crown-glow" d="M50 60 46 32l12 13 5-21 9 17 8-23 8 23 9-17 5 21 12-13-4 28z" />
                    <path d="M50 60 46 32l12 13 5-21 9 17 8-23 8 23 9-17 5 21 12-13-4 28z" />
                    <path class="bp-fine bp-faint" d="M52 52h56M58 45l22 7 22-7" />
                    <rect x="48" y="60" width="64" height="9" rx="1" />
                    <path class="bp-fine" d="M64 64.5l3-3 3 3-3 3zm13 0 3-3 3 3-3 3zm13 0 3-3 3 3-3 3z" />
                    ${[
                        [46, 23, '<path d="M0-3.5l1 2.3 2.5.3-1.9 1.7.5 2.5L0 2.1l-2.2 1.2.5-2.5-1.9-1.7 2.5-.3z" />'],
                        [63, 15, '<path d="M-3 -2.5h2l1 2.5 3 1v1.5h-6z" />'],
                        [80, 8, '<circle r="3" /><path d="M0-1.4l1.3 1-.5 1.5h-1.6l-.5-1.5z" />'],
                        [97, 15, '<path d="M-3-3h6l-1 3.5c-.5 1.5-1.5 2-2 2s-1.5-.5-2-2zM0 2.5v1.5m-1.5 0h3" />'],
                        [114, 23, '<path d="M-2-3h4v2.5c0 2-1 3-2 3s-2-1-2-3zM-2-2h-1.5c0 2 1 3 2 3m3-3h1.5c0 2-1 3-2 3M0 2.5v1.5m-1.5 0h3" />']
                    ].map(([x, y, icon], index) => `
                    <g class="crown-trophy crown-trophy-${index + 1}" transform="translate(${x} ${y})">
                        <circle class="crown-trophy-disc" r="5.6" />
                        <g class="bp-fine">${icon}</g>
                    </g>`).join('')}
                    ${bpLabel(80, 79, 'GOAT // RANG ABSOLU', 'middle')}
                    ${bpLabel(29, 10, '5/5')}
                    ${bpLabel(131, 10, 'S.MAX', 'end')}
                    ${sparkles([[30, 48, 3.5], [130, 46, 3], [126, 70, 2.5]])}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        defense: `
            <svg class="pc-technical-title-art bp-art bp-wall-illustration" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(16, 3, 140, 87)}
                    <path class="bp-fine bp-dash" d="M100 4v83M14 46h126" />
                    <path class="bp-fine" d="M78 16v-7h6v3h6V9h6v3h6V9h6v3h6V9h6v7" />
                    <path class="bp-fill" d="M100 19l26 9v19c0 17-11 26-26 31-15-5-26-14-26-31V28z" />
                    <path class="wall-ring" d="M100 19l26 9v19c0 17-11 26-26 31-15-5-26-14-26-31V28z" />
                    <path d="M100 19l26 9v19c0 17-11 26-26 31-15-5-26-14-26-31V28z" />
                    <path class="bp-fine bp-faint" d="M100 25l20 7v15c0 13-8 20-20 24-12-4-20-11-20-24V32z" />
                    <path class="wall-crack" d="M100 29l-4 8 5 6-3 9 4 7m-1-15 8 3 3 6" />
                    <path class="bp-fine" d="M128 30h8m-8 16h8m-4-16v16" />
                    ${bpLabel(138, 40, 'ÉP.', 'end')}
                    <g class="wall-ball-track">
                        <g class="wall-ball"><circle class="glyph-ball" cx="66" cy="46" r="6.5" /><path class="bp-fine" d="M66 41.5l3.5 2.5-1.3 4.2h-4.4L62.5 44z" /></g>
                        ${motion('<animateTransform attributeName="transform" type="translate" values="-44 0;0 0;-44 0;-44 0" keyTimes="0;0.38;0.7;1" calcMode="spline" keySplines="0.5 0 1 1;0 0 0.4 1;0 0 1 1" dur="2.8s" repeatCount="indefinite" />')}
                    </g>
                    <path class="wall-impact" d="M60 37l-4-4m2 13h-6m8 9-4 4" />
                    ${bpLabel(22, 10, 'DEF // REMPART')}
                    ${bpLabel(22, 84, 'IMPACT 0.38S')}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        passe: `
            <svg class="pc-technical-title-art bp-art bp-pass-illustration" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(22, 3, 138, 87)}
                    <circle class="bp-fine bp-dash" cx="80" cy="50" r="32" />
                    <g class="pass-rose"><path class="bp-fine" d="${bpTicks(80, 50, 32, 35, 24)}" /></g>
                    <path class="bp-fine bp-faint" d="M80 14v72M44 50h72" />
                    ${bpLabel(80, 11, 'N', 'middle')}
                    <path class="bp-fine bp-faint" d="M44 74 34 40M116 74l12-30M80 16 54 24M80 16l26 8" />
                    <circle class="bp-solid pass-far" cx="34" cy="40" r="1.4" />
                    <circle class="bp-solid pass-far" cx="128" cy="44" r="1.4" />
                    <circle class="bp-solid pass-far" cx="54" cy="24" r="1.2" />
                    <circle class="bp-solid pass-far" cx="106" cy="24" r="1.2" />
                    <path class="pass-line" pathLength="1" d="M44 74 80 16 116 74z" />
                    <path class="bp-fine bp-dash art-flow" d="M44 74 80 16 116 74z" />
                    <circle class="glyph-ball pass-node pass-node-1" cx="44" cy="74" r="4.5" />
                    <circle class="glyph-ball pass-node pass-node-2" cx="80" cy="16" r="4.5" />
                    <circle class="glyph-ball pass-node pass-node-3" cx="116" cy="74" r="4.5" />
                    <circle class="bp-fine" cx="80" cy="54" r="5" />
                    <path class="bp-fine" d="M80 49v10m-5-5h10" />
                    ${motion(`<circle class="bp-solid pass-runner" r="2.4"><animateMotion path="M44 74 80 16 116 74z" dur="3.6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0.33;0.33;0.66;0.66;1;1" keyTimes="0;0.25;0.33;0.58;0.66;0.91;1" /></circle>`)}
                    ${bpLabel(29, 10, 'PAS // RELAIS')}
                    ${bpLabel(131, 84, '3 RELAIS', 'end')}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        dribble: `
            <svg class="pc-technical-title-art bp-art butterfly-illustration" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(22, 3, 138, 87)}
                    <path class="bp-fine bp-dash" d="M80 4v82M18 45h124" />
                    <circle class="bp-fine bp-dash" cx="56" cy="30" r="17" />
                    <circle class="bp-fine bp-dash" cx="104" cy="30" r="17" />
                    <path class="bp-fine bp-faint" d="M56 30l24 15 24-15" />
                    <path class="bp-fill" d="${butterflyPath}" />
                    <path class="bp-fine bp-faint" d="${butterflyPath}" />
                    <path class="bf-trace" pathLength="1" d="${butterflyPath}" />
                    <path class="bf-body" d="M80 37v17M80 37l-4-7m4 7 4-7" />
                    <g class="bf-defender bf-defender-left"><path class="bp-defender" d="M24 59l7 7m0-7-7 7" /></g>
                    <g class="bf-defender bf-defender-right"><path class="bp-defender" d="M129 59l7 7m0-7-7 7" /></g>
                    <path class="bp-fine bp-dash" d="M33 61l13-4m81 4-13-4" />
                    ${bpLabel(27, 76, 'D1', 'middle')}
                    ${bpLabel(133, 76, 'D2', 'middle')}
                    ${bpLabel(30, 10, 'DRB // ZIGZAG')}
                    ${bpLabel(124, 12, 'R17')}
                    <circle class="glyph-ball bf-ball" ${reducedMotion ? 'cx="80" cy="45"' : ''} r="3.4">
                        ${motion(`<animateMotion path="${butterflyPath}" dur="4.4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.75;1" />`)}
                    </circle>
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        tir: `
            <svg class="pc-technical-title-art bp-art predator-illustration" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(18, 3, 126, 87)}
                    <path class="bp-fine bp-dash" d="M12 46h112M72 4v84" />
                    <path class="bp-fill" d="M22 46Q72 6 122 46Q72 86 22 46z" />
                    <path d="M22 46Q72 6 122 46Q72 86 22 46z" />
                    <path class="bp-fine bp-faint" d="M31 46Q72 17 113 46Q72 75 31 46z" />
                    <g class="pd-bezel"><path class="bp-fine" d="${bpTicks(72, 46, 19.5, 22, 24)}" /></g>
                    <circle cx="72" cy="46" r="19" />
                    <circle class="bp-fine bp-dash" cx="72" cy="46" r="13" />
                    <path class="bp-fine" d="M72 27v8m0 22v8M53 46h8m22 0h8" />
                    <ellipse class="bp-solid pd-slit" cx="72" cy="46" rx="3.2" ry="11" />
                    <g class="pd-reflection"><rect class="bp-fine" x="78" y="33" width="7" height="5" /><path class="bp-fine" d="M78 35.5h7M81.5 33v5" /></g>
                    <path class="bp-fine bp-dash art-flow" d="M93 42 131 25" />
                    <rect x="131" y="18" width="23" height="17" />
                    <path class="bp-fine bp-faint" d="M131 22h23m-23 5h23m-23 5h23M137 18v17m6-17v17m6-17v17" />
                    <rect class="bp-solid pd-target" x="131" y="18" width="6" height="6" />
                    <path class="pd-lock" d="M128 21v-6h6m3 0h6v6m0 3v6h-6m-3 0h-6v-6" />
                    ${bpLabel(25, 10, 'TIR // LOCK')}
                    ${bpLabel(104, 30, '22M', 'middle')}
                    ${bpLabel(142, 44, 'LUCARNE', 'middle')}
                    ${motion(`
                    <circle class="bp-solid pd-shot" r="2.2" opacity="0">
                        <animateMotion path="M93 42 134 21" dur="2.8s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;0.55;0.72;1" />
                        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.55;0.56;0.72;0.74;1" dur="2.8s" repeatCount="indefinite" />
                    </circle>`)}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        offense: `
            <svg class="pc-technical-title-art bp-art bp-speed-illustration" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(10, 3, 150, 87)}
                    <path class="bp-fine bp-dash" d="M8 45h144" />
                    <path class="bp-fine bp-dash art-flow art-flow-fast" d="M12 28h22m-26 8h20m-14 18h18m-22 8h22" />
                    ${[46, 64, 82, 100].map((x, index) => `
                    <circle class="speed-ghost speed-ghost-${index + 1}" cx="${x}" cy="45" r="13" />`).join('')}
                    <g class="speed-ball">
                        <circle class="glyph-ball" cx="118" cy="45" r="13" />
                        <path class="bp-fine" d="M118 39l5.7 4.1-2.2 6.7h-7l-2.2-6.7z" />
                        <path class="bp-fine bp-faint" d="M118 39v-7m5.7 11.1 6.6-2.2m-8.8 8.9 4.1 5.6m-11.2-5.6-4.1 5.6m-2-11.7-6.6-2.2" />
                    </g>
                    <path class="bp-fill speed-bolt" d="M130 8l-15 27h10l-13 31 25-38h-11l13-20z" />
                    <path class="speed-bolt-line" d="M130 8l-15 27h10l-13 31 25-38h-11l13-20z" />
                    <path class="bp-fine" d="M46 74h72m-72-3v6m72-6v6" />
                    ${bpLabel(82, 82, 'Δt 0.2S', 'middle')}
                    ${bpLabel(17, 10, 'OFF // SPRINT')}
                    ${bpScan(160, 90)}
                </g>
            </svg>`,
        position: (() => {
            const board = bpBoard(6, [30, 38, 48, 61, 80], [20, 140], [50, 110]);
            const pieceX = board.xAt(54.5, 3.5);
            const corners = [[board.xAt(30, 0), 30], [board.xAt(30, 6), 30], [board.xAt(80, 0), 80], [board.xAt(80, 6), 80], [board.xAt(38, 3.5), 38], [board.xAt(80, 3.5), 80]];
            return `
            <svg class="pc-technical-title-art bp-art bp-board-illustration" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(14, 3, 146, 87)}
                    <path class="bp-fill" d="M50 30H110L140 80H20Z" />
                    <path class="bp-fine bp-faint" d="${board.lines}" />
                    <path d="M50 30H110L140 80H20Z" />
                    <path class="bp-fine bp-dash art-flow art-flow-slow" d="${corners.map(([x, y]) => `M${pieceX.toFixed(1)} 50L${x.toFixed(1)} ${y}`).join('')}" />
                    <path class="bp-solid board-cell" d="${board.cell(3, 2)}" />
                    <path class="board-cell-ring" d="${board.cell(3, 2)}" />
                    <g class="board-piece">
                        <path class="bp-fill" d="M${pieceX - 5} 54h10l-2-4h-6zM${pieceX - 3} 50l1-9h4l1 9" />
                        <path d="M${pieceX - 5} 54h10l-2-4h-6zM${pieceX - 3} 50l1-9h4l1 9M${pieceX - 3} 41h6M${pieceX} 41v-5m-2 2h4" />
                    </g>
                    <path class="bp-fine" d="M${pieceX + 8} 36h12" />
                    ${bpLabel(pieceX + 22, 37.5, 'D4')}
                    ${bpLabel(21, 10, 'POS // CASE')}
                    ${bpLabel(139, 10, 'VISION 360°', 'end')}
                    ${bpScan(160, 90)}
                </g>
            </svg>`;
        })(),
        global: `
            <svg class="pc-technical-title-art bp-art bp-engine-illustration" viewBox="0 0 260 90" aria-hidden="true" focusable="false">
                <g class="bp-body">
                    ${bpFrame(70, 3, 190, 87)}
                    <path class="bp-fine bp-dash" d="M130 2v86M60 45h140" />
                    <g class="engine-gear engine-gear-main">
                        <path class="bp-fill" d="${bpGear(130, 45, 24, 14, 3.5)}" />
                        <path d="${bpGear(130, 45, 24, 14, 3.5)}" />
                        <circle class="bp-fine bp-dash" cx="130" cy="45" r="15" />
                        <path class="bp-fine bp-faint" d="M130 30v30M115 45h30M119.4 34.4l21.2 21.2m0-21.2-21.2 21.2" />
                    </g>
                    <circle class="bp-solid engine-core" cx="130" cy="45" r="5.5" />
                    ${[['DEF', 0], ['PAS', 60], ['DRB', 120], ['TIR', 180], ['OFF', 240], ['POS', 300]].map(([code, angle], index) => {
                        const radians = angle * Math.PI / 180;
                        const x = 130 + Math.cos(radians) * 36;
                        const y = 45 + Math.sin(radians) * 36;
                        const side = Math.abs(Math.cos(radians)) > 0.9 ? Math.sign(Math.cos(radians)) * 19 : Math.sign(Math.cos(radians)) * 20;
                        const labelX = x + side;
                        const labelY = y + 2;
                        return `
                    <g class="engine-gear engine-gear-small engine-gear-${index + 1}">
                        <path d="${bpGear(x, y, 12, 8, 2.6)}" />
                        <circle class="bp-fine" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" />
                    </g>
                    ${bpLabel(labelX.toFixed(1), labelY.toFixed(1), code, 'middle')}`;
                    }).join('')}
                    ${bpLabel(8, 10, 'GLB // MOTEUR')}
                    ${bpLabel(252, 84, '6 STATS', 'end')}
                    ${bpScan(260, 90)}
                </g>
            </svg>`
    };

    return illustrations[metric] || '';
}

/* ===================== HERO BUILD ===================== */
function buildHero(club, stats, titles) {
    const main = document.querySelector('.player-card-main');
    if (!main || main.classList.contains('pc-enhanced')) return;

    const headerEl = main.querySelector('[class*="player-header-"]');
    const avatar = headerEl?.querySelector('img');
    const clubLogoEl = main.querySelector('[class*="player-club-logo-"] img');

    const ovr = stats.global ?? calculateGlobalAverage(stats) ?? '??';
    const rankEl = main.querySelector('.player-card-fifa-stats') || document.querySelector('.player-card-fifa-stats');
    let rankHTML = Number.isFinite(ovr) ? getFIFARating(ovr) : '';
    if (!playerData?.technical && rankEl) {
        const globalP = [...rankEl.querySelectorAll('p')].find(p => p.textContent.includes('Global'));
        if (globalP) {
            const span = globalP.querySelector('span');
            rankHTML = span ? span.textContent.trim() : getFIFARating(typeof ovr === 'number' ? ovr : 0);
        }
    }
    const displayedRank = rankHTML || (typeof ovr === 'number' ? getFIFARating(ovr) : 'N/A');
    const rankClass = displayedRank === 'Z' ? 'z' : '';

    const featuredTitle = titles[0];
    const featuredTitleIllustration = getTechnicalTitleIllustration(featuredTitle);
    const featuredStyle = featuredTitle
        ? ` style="--title-accent:${featuredTitle.accent};--title-accent-secondary:${featuredTitle.accentSecondary || featuredTitle.accent};--title-accent-tertiary:${featuredTitle.accentTertiary || featuredTitle.accent}"`
        : '';
    const featuredSourceClass = featuredTitle?.source ? ` ${featuredTitle.source}` : '';
    const clubLabel = clubData.name || parseInfoField('Club');
    const profileCode = playerName.replace(/\s+/g, '-').toUpperCase();

    const hero = document.createElement('div');
    hero.className = 'pc-hero pc-dossier';
    hero.innerHTML = `
        <div class="pc-hero-grid" aria-hidden="true"></div>
        <div class="pc-hero-topline">
            <span>NL // PLAYER DOSSIER // ${profileCode}</span>
            <span class="pc-profile-status"><i></i> PROFIL ACTIF</span>
        </div>
        <div class="pc-hero-portrait">
            <span class="pc-portrait-number">${String(typeof ovr === 'number' ? ovr : '00').padStart(2, '0')}</span>
            <img class="pc-hero-avatar" src="${playerData?.avatar || avatar?.src || ''}" alt="${playerName}" style="view-transition-name: player-portrait-${String(playerName).toLowerCase().replace(/[^a-z0-9]/g, '')}">
            <span class="pc-portrait-scan" aria-hidden="true"></span>
        </div>
        <div class="pc-hero-identity">
            <p class="pc-hero-eyebrow"><span>${parseInfoField('Position')}</span> ${clubLabel}</p>
            <h2 class="pc-hero-name">${playerName}</h2>
            <p class="pc-hero-alias">${parseInfoField('Pseudo')} // ${parseInfoField('Position')}</p>
            <div class="pc-signature-title${featuredTitle ? ' unlocked' : ''}${featuredTitleIllustration ? ' has-technical-illustration' : ''}${featuredSourceClass}"${featuredStyle}>
                ${featuredTitleIllustration}
                <small>${featuredTitle ? 'TITRE ACTIF // SYNCHRONISÉ' : 'TITRE ACTIF // NON ATTRIBUÉ'}</small>
                <strong>${featuredTitle ? featuredTitle.name : 'AUCUN SEUIL ATTEINT'}</strong>
                ${featuredTitle ? `<span>${featuredTitle.requirement}</span>` : '<span>Continuez votre progression</span>'}
                ${titles.length > 1 ? `<div class="pc-title-switcher"><button type="button" data-title-shift="-1" aria-label="Titre précédent">←</button><span>01 / ${String(titles.length).padStart(2, '0')}</span><button type="button" data-title-shift="1" aria-label="Titre suivant">→</button></div>` : ''}
            </div>
        </div>
        <div class="pc-hero-rating">
            <div class="pc-ovr-readout">
                <span class="pc-ovr-label">NOTE GLOBALE</span>
                <strong class="pc-ovr-value">${ovr}</strong>
                <span class="pc-ovr-rank ${rankClass}">${displayedRank}</span>
            </div>
            ${(clubData.logo || clubLogoEl) ? `<img class="pc-hero-club-logo" src="${clubData.logo || clubLogoEl.src}" alt="${clubLabel}">` : ''}
        </div>
        <div class="pc-hero-meta">
            <div class="pc-meta-chip">
                <span class="pc-meta-label">01 // PSEUDO</span>
                <span class="pc-meta-value">${parseInfoField('Pseudo')}</span>
            </div>
            <div class="pc-meta-chip">
                <span class="pc-meta-label">02 // CLUB</span>
                <span class="pc-meta-value club-accent">${parseInfoField('Club')}</span>
            </div>
            <div class="pc-meta-chip">
                <span class="pc-meta-label">03 // PERSONNAGE</span>
                <span class="pc-meta-value">${parseInfoField('Personnage')}</span>
            </div>
            <div class="pc-meta-chip">
                <span class="pc-meta-label">04 // VALEUR</span>
                <span class="pc-meta-value">${playerData ? formatPlayerValue(playerData.value) : parseInfoField('Valeur')}</span>
            </div>
        </div>
    `;

    main.parentNode.insertBefore(hero, main);

    const signatureTitle = hero.querySelector('.pc-signature-title');
    let featuredTitleIndex = 0;
    const renderFeaturedTitle = () => {
        const title = titles[featuredTitleIndex];
        const illustration = getTechnicalTitleIllustration(title);
        const sourceClass = title?.source ? ` ${title.source}` : '';
        signatureTitle.className = `pc-signature-title${title ? ' unlocked' : ''}${illustration ? ' has-technical-illustration' : ''}${titles.length > 1 ? ' has-title-switcher' : ''}${sourceClass}`;

        ['--title-accent', '--title-accent-secondary', '--title-accent-tertiary'].forEach(property => signatureTitle.style.removeProperty(property));
        if (title) {
            signatureTitle.style.setProperty('--title-accent', title.accent);
            signatureTitle.style.setProperty('--title-accent-secondary', title.accentSecondary || title.accent);
            signatureTitle.style.setProperty('--title-accent-tertiary', title.accentTertiary || title.accent);
        }

        signatureTitle.innerHTML = `
            ${illustration}
            <small>${title ? 'TITRE ACTIF // SYNCHRONISÉ' : 'TITRE ACTIF // NON ATTRIBUÉ'}</small>
            <strong>${title ? title.name : 'AUCUN SEUIL ATTEINT'}</strong>
            ${title ? `<span>${title.requirement}</span>` : '<span>Continuez votre progression</span>'}
            ${titles.length > 1 ? `
                <div class="pc-title-switcher" aria-label="Parcourir les titres débloqués">
                    <button type="button" data-title-shift="-1" aria-label="Titre précédent">←</button>
                    <span>${String(featuredTitleIndex + 1).padStart(2, '0')} / ${String(titles.length).padStart(2, '0')}</span>
                    <button type="button" data-title-shift="1" aria-label="Titre suivant">→</button>
                </div>
            ` : ''}
        `;
    };

    signatureTitle?.addEventListener('click', event => {
        const control = event.target.closest('[data-title-shift]');
        if (!control || titles.length < 2) return;
        featuredTitleIndex = (featuredTitleIndex + Number(control.dataset.titleShift) + titles.length) % titles.length;
        renderFeaturedTitle();
    });
    if (signatureTitle) renderFeaturedTitle();

    main.classList.add('pc-enhanced');
}

/* ===================== STAT BARS ===================== */
function buildStatBars(statRows) {
    const container = document.querySelector('.player-card-fifa-stats');
    if (!container || container.querySelector('.pc-stat-bars')) return;

    const bars = document.createElement('div');
    bars.className = 'pc-stat-bars';
    bars.innerHTML = '<div class="pc-panel-heading"><span>01</span><div><small>ANALYSE INDIVIDUELLE</small><h3>STATS TECHNIQUES</h3></div></div>';

    statRows.forEach((row, index) => {
        // Échelle 50–100 (comme le radar) au lieu de 0–100
        const pct = row.value !== null
            ? Math.max(0, Math.min(100, ((row.value - 40) / 60) * 100))
            : 0;
        const displayVal = row.value !== null ? row.value : '??';
        bars.innerHTML += `
            <div class="pc-stat-row" data-stat="${row.key}" data-value="${pct}">
                <div class="pc-stat-header">
                    <span class="pc-stat-name"><small>${String(index + 1).padStart(2, '0')}</small>${row.label}</span>
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
    const matchs = getMatchStat(matchStats, ['matchs', 'match']);
    const buts = getMatchStat(matchStats, ['buts', 'but']);
    const assists = getMatchStat(matchStats, ['assists', 'passes d', 'passes decisives']);
    const wins = getMatchStat(matchStats, ['victoire', 'victoires']);
    const winRate = matchs > 0 ? Math.round((wins / matchs) * 100) : 0;
    const contributions = matchs > 0 ? ((buts + assists) / matchs).toFixed(1) : '0.0';

    return [
        { icon: 'GLS', value: buts, label: 'Buts' },
        { icon: 'AST', value: assists, label: 'Passes D.' },
        { icon: 'G+A', value: contributions, label: 'Par match' },
        { icon: 'WIN', value: winRate + '%', label: 'Win rate' }
    ];
}

function buildMatchPanel(matchStats) {
    const container = document.querySelector('.player-card-match-stats');
    if (!container || container.querySelector('.pc-match-panel')) return;

    const kpis = buildKPIs(matchStats);

    const panel = document.createElement('div');
    panel.className = 'pc-match-panel pc-dossier-panel';

    let kpiHTML = '<div class="pc-panel-heading"><span>02</span><div><small>DONNÉES CUMULÉES</small><h3>IMPACT EN MATCH</h3></div></div><div class="pc-kpi-grid">';
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
        ${kpiHTML}
        ${gridHTML}
        <div class="pc-match-actions">
            <button class="pc-btn pc-btn-ghost" id="copyStatsBtn">COPIER LES DONNÉES <span>+</span></button>
        </div>
    `;

    container.insertBefore(panel, container.firstChild);
    container.classList.add('pc-enhanced');

    panel.querySelector('#copyStatsBtn')?.addEventListener('click', copyStatsToClipboard);
}

/* ===================== ACTIONS DU DOSSIER ===================== */
// Comparer (page Face à face), partager le lien et télécharger la carte
// d'aperçu générée au build (dist/og/joueurs).
function buildHeroActions() {
    const hero = document.querySelector('.pc-hero');
    if (!hero || hero.querySelector('.pc-hero-actions') || !playerData) return;

    const data = window.NEBULA_DATA;
    const slug = `${playerData.folder}-${playerData.name.toLowerCase()}`;
    const cardUrl = data.assetUrl(`og/joueurs/${slug}.jpg`);
    const compareUrl = data.pageUrl(`headtohead.html?joueur=${encodeURIComponent(playerData.name)}`);

    const actions = document.createElement('div');
    actions.className = 'pc-hero-actions';
    actions.innerHTML = `
        <a class="pc-action" href="${compareUrl}"><span>⇄</span> Comparer</a>
        <button class="pc-action" type="button" data-share><span>↗</span> Partager</button>
        <a class="pc-action" href="${cardUrl}" download="nebula-${slug}.jpg"><span>↓</span> Carte</a>
    `;
    hero.appendChild(actions);

    actions.querySelector('[data-share]').addEventListener('click', async () => {
        const url = window.location.href.split(/[?#]/)[0].replace(/\.html$/, '');
        if (navigator.share) {
            try {
                await navigator.share({ title: `${playerData.name} — Nebula League`, url });
            } catch {
                // Partage annulé par l'utilisateur.
            }
            return;
        }
        try {
            await navigator.clipboard.writeText(url);
            showToast('Lien du dossier copié');
        } catch {
            showToast(url);
        }
    });
}

/* ===================== COURBE DE VALEUR ===================== */
let valueChart = null;

function buildValueHistoryPanel() {
    const container = document.querySelector('.player-card-match-stats');
    if (!container || container.querySelector('.pc-value-panel') || !playerData) return;

    const history = window.NEBULA_DATA?.getPlayerMarketValueHistory?.(playerData.name) || [];
    const panel = document.createElement('div');
    panel.className = 'pc-value-panel pc-dossier-panel';
    panel.innerHTML = `
        <div class="pc-panel-heading"><span>03</span><div><small>MARCHÉ // ${history.length - 1} MATCH${history.length > 2 ? 'S' : ''}</small><h3>ÉVOLUTION DE LA VALEUR</h3></div></div>
        ${history.length > 1
            ? '<div class="pc-value-chart"><canvas id="valueHistoryChart" aria-label="Courbe de la valeur du joueur"></canvas></div>'
            : `<div class="pc-value-empty"><strong>${formatPlayerValue(history[0]?.total ?? playerData.value)}</strong><p>La courbe apparaîtra après le premier match joué.</p></div>`}
    `;
    container.appendChild(panel);
}

function createValueChart() {
    const canvas = document.getElementById('valueHistoryChart');
    if (!canvas || valueChart || typeof Chart === 'undefined') return;

    const history = window.NEBULA_DATA.getPlayerMarketValueHistory(playerData.name);
    const color = (clubData.borderColor || '#adff2f').slice(0, 7);
    const compact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });

    valueChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: history.map(point => point.label),
            datasets: [{
                data: history.map(point => point.total),
                borderColor: color,
                backgroundColor: playerCardTint(color, 0.12),
                pointBackgroundColor: color,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                fill: true,
                tension: 0.25
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: items => {
                            const point = history[items[0].dataIndex];
                            return point.date ? `${point.label} · ${point.date}` : point.label;
                        },
                        label: item => {
                            const point = history[item.dataIndex];
                            const delta = point.delta ? ` (${point.delta > 0 ? '+' : ''}${formatPlayerValue(point.delta)})` : '';
                            return `${formatPlayerValue(point.total)}${delta}`;
                        }
                    }
                }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#89939e', font: { family: 'Courier New', size: 10 } } },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#89939e', font: { family: 'Courier New', size: 10 }, callback: value => `${compact.format(value)} ¥` }
                }
            }
        }
    });
}

function copyStatsToClipboard() {
    const stats = extractStatsFromHTML();
    const matchStats = parseMatchStats();
    const titles = mergePlayerTitles(
        [
            ...evaluatePlayerTitles(stats, matchStats, playerData?.value),
            ...getSeasonRewardTitles(),
            ...getUnlockedCharacterUltimateTitles()
        ],
        extractManualTitles()
    );
    const lines = [
        `${playerName} — Nebula League`,
        `OVR: ${stats.global ?? '??'}`,
        '',
        'Stats techniques:',
        ...STAT_LABELS.map(s => `  ${s.label}: ${stats[s.key] ?? '??'}`),
        '',
        'Stats matchs:',
        ...Object.entries(matchStats).map(([k, v]) => `  ${k}: ${v}`),
        '',
        'Titres:',
        ...(titles.length ? titles.map(title => `  ${title.name}`) : ['  Aucun titre'])
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        showToast('Stats copiées dans le presse-papier !');
    }).catch(() => {
        showToast('Impossible de copier — permissions refusées');
    });
}

/* ===================== TROPHIES PANEL ===================== */
function buildTrophiesPanel(titles) {
    let container = document.querySelector('.player-card-trophies');
    if (!container) {
        const wrapper = document.querySelector('.player-card-wrapper');
        if (!wrapper) return;

        container = document.createElement('div');
        container.className = 'player-card-trophies';
        wrapper.appendChild(container);
    }
    if (container.querySelector('.pc-trophies-panel')) return;

    const trophyDefinitions = [
        { code: 'PUS', name: 'Prix Puskas' },
        { code: 'NCL', name: 'NCL Cup' },
        { code: 'GLD', name: 'Golden Shoe' },
        { code: 'BDO', name: "Ballon d'Or" }
    ];

    const panel = document.createElement('div');
    panel.className = 'pc-trophies-panel pc-dossier-panel';

    let trophyHTML = '<div class="pc-panel-heading"><span>03</span><div><small>ARCHIVES OFFICIELLES</small><h3>PALMARÈS & TITRES</h3></div></div><div class="pc-trophy-grid">';

    const automaticCounts = window.NEBULA_DATA?.getPlayerTrophyCounts?.(playerName);
    if (automaticCounts) {
        trophyDefinitions.forEach(trophy => {
            const count = Number(automaticCounts[trophy.code] || 0);
            trophyHTML += `
                <div class="pc-trophy-item">
                    <span class="pc-trophy-icon">${trophy.code}</span>
                    <div class="pc-trophy-info">
                        <strong>${trophy.name}</strong>
                        <span><b class="pc-trophy-count">${count}</b> OBTENU${count === 1 ? '' : 'S'}</span>
                    </div>
                </div>
            `;
        });
    } else {
        container.querySelectorAll(':scope > h3').forEach(h3 => {
            if (!h3.textContent.includes('Troph')) return;
            const ul = h3.nextElementSibling;
            if (!ul) return;
            ul.querySelectorAll('li').forEach(li => {
                const strong = li.querySelector('strong');
                const name = strong ? strong.textContent.replace(':', '').trim() : li.textContent;
                const countMatch = li.textContent.match(/:\s*(\d+)/);
                const count = countMatch ? Number(countMatch[1]) : 0;
                const icon = trophyDefinitions.find(trophy => name.includes(trophy.name))?.code || '🏅';
                trophyHTML += `
                    <div class="pc-trophy-item">
                        <span class="pc-trophy-icon">${icon}</span>
                        <div class="pc-trophy-info">
                            <strong>${name}</strong>
                            <span><b class="pc-trophy-count">${count}</b> OBTENU${count === 1 ? '' : 'S'}</span>
                        </div>
                    </div>
                `;
            });
        });
    }
    trophyHTML += '</div>';

    let titlesHTML = `
        <div class="pc-title-system">
            <div class="pc-title-system-heading">
                <div><small>SYNCHRONISATION AUTOMATIQUE</small><h3>TITRES DÉBLOQUÉS</h3></div>
                <strong>${String(titles.length).padStart(2, '0')}</strong>
            </div>
            <ul class="pc-titles-list">
    `;

    titles.forEach((title, index) => {
        const sourceLabel = title.source === 'automatic'
            ? 'AUTO'
            : title.source === 'season'
                ? title.seasons?.length > 1
                    ? 'PALMARÈS CUMULÉ'
                    : `SAISON ${String(title.season).padStart(2, '0')}`
                : title.source === 'ultimate'
                    ? 'ULTIME'
                    : 'ARCHIVE';
        const titleStyle = `--title-accent:${title.accent};--title-accent-secondary:${title.accentSecondary || title.accent};--title-accent-tertiary:${title.accentTertiary || title.accent}`;
        const proof = title.proof || (title.metric === 'value' && Number.isFinite(title.value) && Number.isFinite(title.threshold)
            ? `${formatPlayerValue(title.value)} / ${formatPlayerValue(title.threshold)}`
            : Number.isFinite(title.value) && Number.isFinite(title.threshold)
                ? `${title.value} / ${title.threshold}`
                : title.requirement);
        titlesHTML += `
            <li class="pc-title-card ${title.source}" style="${titleStyle}">
                <span class="pc-title-index">${String(index + 1).padStart(2, '0')}</span>
                <span class="pc-title-code">${title.code}</span>
                <div>
                    <small>${sourceLabel} // ${title.category || 'Palmarès'}</small>
                    <strong>${title.name}</strong>
                    ${title.source === 'season' ? '' : `<span>${title.requirement}</span>`}
                </div>
                <b>${proof}</b>
            </li>
        `;
    });

    if (!titles.length) {
        titlesHTML += `
            <li class="pc-titles-empty">
                <span>00</span>
                <div><strong>AUCUN TITRE DÉBLOQUÉ</strong><small>Les titres apparaîtront ici dès qu’un seuil sera atteint.</small></div>
            </li>
        `;
    }
    titlesHTML += '</ul></div>';

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
        <button class="pc-tab-btn active" data-tab="technique"><span>01</span> Technique</button>
        <button class="pc-tab-btn" data-tab="matchs"><span>02</span> Matchs</button>
        <button class="pc-tab-btn" data-tab="palmares"><span>03</span> Palmarès</button>
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
        <div class="pc-panel-heading"><div><small>LECTURE HEXAGONALE</small><h3>RADAR DES COMPÉTENCES</h3></div></div>
        <div class="pc-radar-inline-canvas"><canvas id="inlineRadarChart"></canvas></div>
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
            if (btn.dataset.tab === 'matchs') setTimeout(createValueChart, 50);
        });
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
                    display: false,
                    min: 50,
                    max: 100,
                    stepSize: 10
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
    const hasTechnicalData = STAT_LABELS.some(stat => Number.isFinite(stats[stat.key]));
    const data = hasTechnicalData
        ? STAT_LABELS.map(stat => Number.isFinite(stats[stat.key]) ? stats[stat.key] : 50)
        : STAT_LABELS.map(() => null);

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
                backgroundColor: hasTechnicalData ? clubData.bgColor : 'transparent',
                borderColor: hasTechnicalData ? clubData.borderColor : 'transparent',
                pointBackgroundColor: clubData.borderColor,
                pointBorderColor: '#fff',
                pointBorderWidth: hasTechnicalData ? 2 : 0,
                pointRadius: hasTechnicalData ? 5 : 0,
                pointHoverRadius: hasTechnicalData ? 7 : 0,
                borderWidth: hasTechnicalData ? 2.5 : 0
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

function initRadarPopup() {
    const popupRadar = document.getElementById('popupRadar');
    const openRadarBtn = document.getElementById('openRadarPopup');
    const closeRadarBtn = document.getElementById('closeRadarPopup');

    if (!openRadarBtn || !popupRadar) return;

    const stats = extractStatsFromHTML();
    const globalValue = stats.global ?? calculateGlobalAverage(stats);
    const popupTitle = popupRadar.querySelector('h2');
    const popupReadout = popupRadar.querySelector('.radar-info strong');
    if (popupTitle) popupTitle.textContent = `Graphique Radar - ${playerName}`;
    if (popupReadout) {
        popupReadout.textContent = Number.isFinite(globalValue)
            ? `Note Globale : ${globalValue} | ${getFIFARating(globalValue)}`
            : 'Note Globale : N/A';
    }

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

    playerName = getPlayerName();
    playerData = getCentralPlayer(playerName);
    if (playerData?.name) document.title = `Carte Joueur - ${playerData.name}`;
    const clubKey = playerData?.club || detectClub();
    clubData = CLUBS[clubKey] || CLUBS.bastard;
    syncPlayerIdentityFromData(playerData);

    const wrapper = document.querySelector('.player-card-wrapper');
    if (wrapper) wrapper.dataset.club = clubKey;

    const stats = extractStatsFromHTML();
    const statRows = parseStatParagraphs();
    const matchStats = parseMatchStats();
    const manualTitles = extractManualTitles();
    const automaticTitles = evaluatePlayerTitles(stats, matchStats, playerData?.value);
    const seasonRewardTitles = getSeasonRewardTitles();
    const characterUltimateTitles = getUnlockedCharacterUltimateTitles();
    const unlockedTitles = mergePlayerTitles(
        [...automaticTitles, ...seasonRewardTitles, ...characterUltimateTitles],
        manualTitles
    );

    buildHero(clubKey, stats, unlockedTitles);
    buildHeroActions();
    buildStatBars(statRows);
    buildMatchPanel(matchStats);
    buildValueHistoryPanel();
    buildTrophiesPanel(unlockedTitles);
    buildTabs();

    setTimeout(() => {
        animateStatBars();
        createInlineRadarChart();
    }, 300);

    initRadarPopup();
}

window.NEBULA_TITLE_ENGINE = {
    technicalRules: TECHNICAL_TITLE_RULES,
    careerTracks: CAREER_TITLE_TRACKS,
    valueTrack: VALUE_TITLE_TRACK,
    evaluate: evaluatePlayerTitles
};

document.addEventListener('DOMContentLoaded', initPlayerCard);
