// Rendu des fiches joueurs depuis scripts/templates/joueur.html et les
// données de nebula-data.js. Partagé par players.mjs (écriture) et build.mjs
// (vérification).
import { renderMetaBlock, readText } from './site-meta.mjs';

export const GENERATED_MARKER = 'Fiche générée par `pnpm joueurs`';

const STAT_ROWS = [
  ['defense', '🛡️ Defense'],
  ['passe', '⭐ Passe'],
  ['dribble', '🌟 Dribble'],
  ['tir', '⚽ Tir'],
  ['offense', '💥 Offense'],
  ['position', '👋 Positionement']
];

// Mêmes paliers que getFIFARating dans Joueurs/player-card.js.
function grade(value) {
  if (!Number.isFinite(value)) return null;
  const tiers = [[100, 'Z'], [95, 'SSS'], [90, 'SS'], [85, 'S'], [80, 'A'], [75, 'B'], [70, 'C'], [65, 'D'], [60, 'E'], [55, 'F'], [50, 'G']];
  return tiers.find(([min]) => value >= min)?.[1] || '—';
}

const escapeHtml = text => String(text ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
const formatStat = value => {
  const rank = grade(value);
  return rank ? `${value} | <span class="${rank.toLowerCase()}">${rank}</span>` : '?? | <span>No Data</span>';
};

let templatePromise = null;
const loadTemplate = () => (templatePromise ??= readText('scripts/templates/joueur.html'));

export async function renderPlayerPage(player, data) {
  const template = await loadTemplate();
  const club = data.getClub?.(player.club) || data.groups?.[player.club] || {};
  const technical = player.technical || {};
  const fromPage = path => `../../${path}`;

  const values = {
    name: escapeHtml(player.name),
    clubKey: escapeHtml(player.club),
    clubName: escapeHtml(player.clubName || club.name || player.club),
    avatar: escapeHtml(fromPage(player.avatarPath || 'images/clubs_icon/placeholder.webp')),
    clubLogo: escapeHtml(fromPage(club.logoPath || 'images/clubs_icon/placeholder.webp')),
    position: escapeHtml(player.position),
    character: escapeHtml(player.character || '—'),
    value: `${Math.round(Number(player.value) || 0).toLocaleString('fr-FR')} ¥`,
    statRows: STAT_ROWS
      .map(([key, label]) => `            <p><strong class="stats">${label} :</strong> ${formatStat(technical[key])}</p>`)
      .join('\n'),
    global: formatStat(technical.global),
    manualTitles: (player.titles || [])
      .map(title => `                <li><strong>${escapeHtml(title)}</strong></li>`)
      .join('\n') || '                <!-- Titres manuels : champ `titles` du joueur dans nebula-data.js. -->'
  };

  let html = template.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in values ? values[key] : match));
  const indent = html.match(/([ \t]*)\{\{meta\}\}/)?.[1] || '    ';
  const page = { file: player.profilePath, player };
  return html.replace('{{meta}}', renderMetaBlock(page, html, data, indent));
}
