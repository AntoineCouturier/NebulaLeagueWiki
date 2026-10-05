// Génère au build les images d'aperçu (Discord, réseaux sociaux), les icônes
// et le manifest. Les fichiers sont écrits dans dist/ uniquement.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { SITE_NAME, BACKGROUND, solidColor, playerSlug } from './site-meta.mjs';

const W = 1200;
const H = 630;
const ACID = '#adff2f';
const CYAN = '#63e7ff';
const DISPLAY = "'Arial Black', 'Arial', sans-serif";
const MONO = "'Courier New', monospace";
const LOGO = 'images/logos/nebula.png';

const escapeXml = text => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Taille de police pour qu'un texte en Arial Black tienne dans une largeur.
const fitFont = (text, maxWidth, maxSize) => Math.min(maxSize, Math.floor(maxWidth / (String(text).length * 0.82)));

function background(glowColor, glowX) {
  return `
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.035"/>
      </pattern>
      <radialGradient id="glow" cx="${glowX}" cy="0.5" r="0.6">
        <stop offset="0" stop-color="${glowColor}" stop-opacity="0.30"/>
        <stop offset="1" stop-color="${glowColor}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="bar" x1="0" x2="1">
        <stop offset="0" stop-color="${ACID}"/>
        <stop offset="1" stop-color="${CYAN}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${BACKGROUND}"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <rect y="${H - 8}" width="${W}" height="8" fill="url(#bar)"/>`;
}

async function cover(path, size) {
  return sharp(await readFile(path))
    .resize(size, size, { fit: 'cover', position: 'top' })
    .flatten({ background: BACKGROUND })
    .toBuffer();
}

async function contain(path, size) {
  return sharp(await readFile(path))
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
}

async function renderPlayerCard(player, club) {
  const accent = solidColor(club?.color);
  const clubName = (player.clubName || club?.name || '').toUpperCase();
  const rating = player.technical?.global;
  const name = player.name.toUpperCase();
  const nameSize = fitFont(name, 620, 118);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${background(accent, 0.25)}
    <text x="60" y="62" font-family="${MONO}" font-weight="700" font-size="18" fill="#89939e" letter-spacing="2">NL // PLAYER DOSSIER</text>
    <circle cx="${W - 360}" cy="56" r="6" fill="${ACID}"/>
    <text x="${W - 60}" y="64" text-anchor="end" font-family="${DISPLAY}" font-size="22" fill="#ffffff" letter-spacing="3">NEBULA LEAGUE</text>
    <rect x="60" y="88" width="${W - 120}" height="1" fill="#ffffff" fill-opacity="0.11"/>
    <rect x="59" y="119" width="422" height="422" fill="none" stroke="${accent}" stroke-width="2"/>
    <rect x="530" y="150" width="10" height="22" fill="${accent}"/>
    <text x="552" y="170" font-family="${MONO}" font-weight="700" font-size="24" fill="${accent}" letter-spacing="3">${escapeXml(clubName)}</text>
    <text x="526" y="${190 + nameSize}" font-family="${DISPLAY}" font-size="${nameSize}" fill="#f4f7f9">${escapeXml(name)}</text>
    <text x="530" y="370" font-family="${MONO}" font-weight="700" font-size="22" fill="#89939e" letter-spacing="2">POSTE <tspan fill="#f4f7f9">${escapeXml(player.position)}</tspan><tspan dx="34">PERSONNAGE</tspan> <tspan fill="#f4f7f9">${escapeXml((player.character || '—').toUpperCase())}</tspan></text>
    <rect x="530" y="400" width="240" height="140" fill="#0d1117" stroke="${accent}" stroke-width="2"/>
    <text x="552" y="432" font-family="${MONO}" font-weight="700" font-size="16" fill="#89939e" letter-spacing="2">NOTE GLOBALE</text>
    <text x="552" y="518" font-family="${DISPLAY}" font-size="76" fill="${rating ? "#ffffff" : "#4a525c"}">${rating ?? "--"}</text>
  </svg>`;

  const layers = [];
  if (player.avatarPath) layers.push({ input: await cover(player.avatarPath, 420), left: 60, top: 120 });
  if (club?.logoPath) layers.push({ input: await contain(club.logoPath, 140), left: 800, top: 400 });
  return sharp(Buffer.from(svg)).composite(layers).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}

async function renderSiteCard(data) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${background('#6f00ff', 0.78)}
    <rect x="70" y="128" width="46" height="2" fill="${ACID}"/>
    <text x="130" y="136" font-family="${MONO}" font-weight="700" font-size="20" fill="${ACID}" letter-spacing="2">NL—00 <tspan fill="#89939e">COMPÉTITION PRIVÉE // AZURE LATCH</tspan></text>
    <text x="64" y="300" font-family="${DISPLAY}" font-size="150" fill="#f4f7f9">NEBULA</text>
    <text x="64" y="440" font-family="${DISPLAY}" font-size="150" fill="none" stroke="#9aa3ad" stroke-width="2">LEAGUE</text>
    <rect x="70" y="482" width="3" height="56" fill="${ACID}"/>
    <text x="90" y="505" font-family="Arial, sans-serif" font-size="24" fill="#c3cad1">${data.players.length} joueurs · ${data.clubs.length} clubs · titres, matchs et valeurs</text>
    <text x="90" y="536" font-family="Arial, sans-serif" font-size="24" fill="#89939e">Le hub officiel de la ligue.</text>
    <ellipse cx="935" cy="300" rx="215" ry="70" fill="none" stroke="${CYAN}" stroke-opacity="0.35" transform="rotate(-24 935 300)"/>
    <ellipse cx="935" cy="300" rx="190" ry="190" fill="none" stroke="#ffffff" stroke-opacity="0.08"/>
    <circle cx="1105" cy="205" r="7" fill="${ACID}"/>
  </svg>`;
  return sharp(Buffer.from(svg))
    .composite([{ input: await contain(LOGO, 240), left: 815, top: 180 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}

// Icône carrée : logo centré sur fond sombre (padding en proportion).
async function squareIcon(size, padding, transparent = false) {
  const inner = Math.round(size * (1 - padding * 2));
  return sharp({
    create: { width: size, height: size, channels: 4, background: transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : BACKGROUND }
  })
    .composite([{ input: await contain(LOGO, inner), gravity: 'centre' }])
    .png()
    .toBuffer();
}

// Fichier .ico contenant une seule image PNG (format accepté par les navigateurs).
function pngToIco(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

export async function generateSocialAssets(outDir, data) {
  await mkdir(join(outDir, 'og', 'joueurs'), { recursive: true });
  await mkdir(join(outDir, 'icons'), { recursive: true });

  await writeFile(join(outDir, 'og', 'site.jpg'), await renderSiteCard(data));
  for (const player of data.players) {
    const club = data.getClub?.(player.club);
    await writeFile(join(outDir, 'og', 'joueurs', `${playerSlug(player)}.jpg`), await renderPlayerCard(player, club));
  }

  const favicon = await squareIcon(32, 0, true);
  await writeFile(join(outDir, 'icons', 'favicon-32.png'), favicon);
  await writeFile(join(outDir, 'favicon.ico'), pngToIco(favicon, 32));
  await writeFile(join(outDir, 'icons', 'apple-touch-icon.png'), await squareIcon(180, 0.12));
  await writeFile(join(outDir, 'icons', 'icon-192.png'), await squareIcon(192, 0.12));
  await writeFile(join(outDir, 'icons', 'icon-512.png'), await squareIcon(512, 0.12));
  await writeFile(join(outDir, 'icons', 'icon-maskable-512.png'), await squareIcon(512, 0.22));

  await writeFile(join(outDir, 'manifest.webmanifest'), JSON.stringify({
    name: SITE_NAME,
    short_name: 'Nebula',
    description: 'Le hub officiel de la Nebula League.',
    lang: 'fr',
    start_url: '/',
    display: 'standalone',
    background_color: BACKGROUND,
    theme_color: BACKGROUND,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }, null, 2));

  return data.players.length;
}
