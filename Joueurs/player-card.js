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
