// Outils partagés par build.mjs et meta.mjs : chargement des données de la
// ligue et balises <head> de partage (Open Graph, favicon, manifest).
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import vm from 'node:vm';

export const SITE_URL = 'https://nebula-league.nightmarefoxy26.workers.dev';
export const SITE_NAME = 'Nebula League';
export const BACKGROUND = '#05070a';

const META_START = '<!-- meta:start (généré par pnpm meta) -->';
const META_END = '<!-- meta:end -->';

// Descriptions des pages qui n'en ont pas dans leur HTML.
const PAGE_DESCRIPTIONS = {
  'club.html': 'Les clubs de la Nebula League : effectifs, terrains, palmarès et identités de jeu.',
  'fixtures.html': 'Le calendrier officiel de la Nebula League : prochaines rencontres et résultats.',
  'headtohead.html': 'Deux profils, un seul verdict : comparez les joueurs de la Nebula League en face à face.',
  'matchs.html': 'Tous les matchs archivés de la Nebula League : scores, buteurs et performances.',
  'players.html': 'Le registre des joueurs de la Nebula League : profils, postes, valeurs et formes.',
  'rules.html': 'Le protocole de compétition officiel de la Nebula League.',
  'saison.html': 'Les saisons de la Nebula League : classements, leaders et distinctions.',
  'stats.html': 'Les records de la Nebula League, par saison et par match.',
  'valeur.html': 'Le marché des valeurs de la Nebula League : cotes des joueurs et évolutions.',
  'admin.html': 'Centre de gestion local de la Nebula League.',
  'Autre/greatest_goal.html': 'Le plus beau but de l’histoire de la Nebula League.',
  'Autre/worst_goal.html': 'Le pire raté de l’histoire de la Nebula League.'
};
const DEFAULT_DESCRIPTION = 'Le hub officiel de la Nebula League : joueurs, clubs, titres, matchs, valeurs et archives.';

// Lit un fichier texte en normalisant les fins de ligne : sous Windows, git
// peut réécrire les fichiers en CRLF, ce qui ne doit pas compter comme un
// changement quand on compare avec le contenu généré.
export async function readText(path) {
  return (await readFile(path, 'utf8')).replace(/\r\n/g, '\n');
}

export async function loadLeagueData() {
  const source = await readFile('JavaScript/nebula-data.js', 'utf8');
  const window = { dispatchEvent() {} };
  vm.runInNewContext(source, {
    window, URL, CustomEvent: class {},
    document: { currentScript: { src: 'https://nebula.invalid/JavaScript/nebula-data.js' }, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem() {} },
    fetch: async () => ({ ok: false })
  }, { timeout: 5000 });
  return window.NEBULA_DATA;
}

export const solidColor = color => (/^#[0-9a-f]{6}/i.test(color || '') ? color.slice(0, 7) : '#adff2f');
export const playerSlug = player => `${player.folder}-${player.name.toLowerCase()}`;
const escapeAttr = text => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const cleanPath = file => '/' + file.replace(/\\/g, '/').replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');

// Toutes les pages HTML publiées, avec le joueur associé pour les fiches.
export async function listPages(data) {
  const pages = (await readdir('.')).filter(file => file.endsWith('.html') && file !== 'compte.html');
  for (const dir of ['Autre', ...(await readdir('Joueurs', { withFileTypes: true }))
    .filter(entry => entry.isDirectory() && entry.name !== 'demo').map(entry => join('Joueurs', entry.name))]) {
    for (const file of await readdir(dir)) if (file.endsWith('.html')) pages.push(join(dir, file).replace(/\\/g, '/'));
  }
  return pages.map(file => ({
    file,
    player: data.players.find(player => player.profilePath === file) || null
  }));
}

function readExisting(html) {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1].trim() || SITE_NAME;
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1]
    ?.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  return { title, description };
}

export function renderMetaBlock({ file, player }, html, data, indent) {
  const existing = readExisting(html);
  let title = existing.title;
  let description = existing.description || PAGE_DESCRIPTIONS[file] || DEFAULT_DESCRIPTION;
  let image = `${SITE_URL}/og/site.jpg`;
  let themeColor = BACKGROUND;

  if (player) {
    const club = data.getClub?.(player.club);
    const rating = player.technical?.global;
    title = `${player.name} — ${player.clubName || club?.name || SITE_NAME}`;
    description = [
      `Fiche officielle ${/^[aeiouyéh]/i.test(player.name) ? 'd’' : 'de '}${player.name}`,
      `${player.position} · ${player.clubName || club?.name}`,
      rating ? `Note globale ${rating}` : 'Note en cours d’évaluation',
      player.character ? `Personnage : ${player.character}` : null
    ].filter(Boolean).join(' — ') + '.';
    image = `${SITE_URL}/og/joueurs/${playerSlug(player)}.jpg`;
    themeColor = solidColor(club?.color);
  }

  const lines = [
    META_START,
    `<meta name="description" content="${escapeAttr(description)}">`,
    `<meta name="theme-color" content="${themeColor}">`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">`,
    `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`,
    `<link rel="manifest" href="/manifest.webmanifest">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:locale" content="fr_FR">`,
    `<meta property="og:type" content="${player ? 'profile' : 'website'}">`,
    `<meta property="og:title" content="${escapeAttr(title)}">`,
    `<meta property="og:description" content="${escapeAttr(description)}">`,
    `<meta property="og:url" content="${SITE_URL}${cleanPath(file)}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    META_END
  ];
  return lines.join(`\n${indent}`);
}

// Retire les anciennes balises gérées par le bloc et insère le bloc à jour.
export function applyMetaBlock(page, html, data) {
  const blockPattern = new RegExp(`([ \\t]*)${META_START.replace(/[()]/g, '\\$&')}[\\s\\S]*?${META_END}`);
  const existingBlock = html.match(blockPattern);
  if (existingBlock) {
    return html.replace(blockPattern, (_, indent) => indent + renderMetaBlock(page, html, data, indent));
  }

  const iconLine = html.match(/([ \t]*)<link rel="icon"[^>]*>/);
  if (!iconLine) throw Error(`Balise <link rel="icon"> introuvable dans ${page.file}`);
  const indent = iconLine[1];
  // Le bloc relit la description existante avant qu'on la retire.
  const block = indent + renderMetaBlock(page, html, data, indent);
  return html
    .replace(/[ \t]*<meta\s+name="theme-color"[^>]*>\r?\n/, '')
    .replace(/[ \t]*<meta\s+name="description"\s+content="[^"]*">\r?\n/, '')
    .replace(iconLine[0], block);
}
