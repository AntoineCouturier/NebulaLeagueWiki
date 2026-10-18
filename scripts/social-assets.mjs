// Génère au build les images d'aperçu (Discord, réseaux sociaux), les icônes
// et le manifest. Les fichiers sont écrits dans dist/ uniquement.
// Direction « Salle de contrôle » (CSS/theme-monitor.css) : écran de
// surveillance bleu, bandeau OSD, point REC rouge, repères de visée.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { SITE_NAME, BACKGROUND, solidColor, playerSlug } from './site-meta.mjs';

const W = 1200;
const H = 630;
const BLUE = '#1f5bff';
const BLUE_2 = '#3d7bff';
const BLUE_3 = '#8db0ff';
const REC = '#ff2b40';
const PAPER = '#f3f7ff';
const MUTED = '#8b9ac0';
const DIM = '#5f6e96';
const DISPLAY = "'Chakra Petch', 'Bahnschrift', 'Arial Narrow', sans-serif";
const MONO = "'IBM Plex Mono', Consolas, 'Courier New', monospace";
const JP = "'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif";
const LOGO = 'images/logos/nebula.png';

// Polices du site, embarquées pour que les aperçus soient identiques sur toutes
// les machines. sharp ne charge un fichier de police qu'en rendant du texte :
// on le fait une fois, et le rendu SVG retrouve ensuite la police par son nom.
const FONTS = [
  ['Chakra Petch Bold', 'ChakraPetch-Bold.ttf'],
  ['Chakra Petch Bold Italic', 'ChakraPetch-BoldItalic.ttf'],
  ['IBM Plex Mono SemiBold', 'IBMPlexMono-SemiBold.ttf']
];

async function loadFonts() {
  for (const [font, file] of FONTS) {
    await sharp({ text: { text: '.', font, fontfile: join('scripts', 'fonts', file) } }).toBuffer();
  }
}

const escapeXml = text => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Taille de police pour qu'un texte en capitales tienne dans une largeur.
const fitFont = (text, maxWidth, maxSize) => Math.min(maxSize, Math.floor(maxWidth / (String(text).length * 0.62)));

// Repères de visée aux quatre coins d'un cadre.
function brackets(x, y, w, h, color, size = 26, width = 3) {
  const s = size;
  return `<path d="M${x} ${y + s}V${y}H${x + s} M${x + w - s} ${y}H${x + w}V${y + s} M${x + w} ${y + h - s}V${y + h}H${x + w - s} M${x + s} ${y + h}H${x}V${y + h - s}"
    fill="none" stroke="${color}" stroke-width="${width}"/>`;
}

// Écran de surveillance : fond, trame, lignes de balayage, lueur, vignette,
// bandeau OSD (REC + canal) en haut, timecode et barre bleue en bas.
function screen(glowColor, glowX, channel, osdRight) {
  return `
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" fill="none" stroke="${BLUE_2}" stroke-opacity="0.07"/>
      </pattern>
      <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="1" fill="#000000" fill-opacity="0.35"/>
      </pattern>
      <radialGradient id="glow" cx="${glowX}" cy="0.45" r="0.65">
        <stop offset="0" stop-color="${glowColor}" stop-opacity="0.34"/>
        <stop offset="1" stop-color="${glowColor}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.6" stop-color="#000000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.6"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${BACKGROUND}"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <rect width="${W}" height="${H}" fill="url(#scan)"/>
    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
    <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="none" stroke="${BLUE_2}" stroke-opacity="0.22"/>
    ${brackets(20, 20, W - 40, H - 40, BLUE_2, 34, 3)}
    <circle cx="66" cy="64" r="9" fill="${REC}"/>
    <text x="84" y="72" font-family="${MONO}" font-weight="700" font-size="22" fill="${REC}" letter-spacing="2">REC</text>
    <text x="150" y="72" font-family="${MONO}" font-weight="600" font-size="20" fill="${MUTED}" letter-spacing="2">${channel}</text>
    <text x="${W - 56}" y="72" text-anchor="end" font-family="${MONO}" font-weight="600" font-size="20" fill="${MUTED}" letter-spacing="2">${osdRight}</text>
    <rect x="56" y="92" width="${W - 112}" height="1" fill="${BLUE_2}" fill-opacity="0.28"/>
    <rect y="${H - 8}" width="${W}" height="8" fill="${BLUE}"/>`;
}

async function cover(path, size) {
  return sharp(await readFile(path))
    .resize(size, size, { fit: 'cover', position: 'top' })
    .flatten({ background: BACKGROUND })
    .toBuffer();
}

// Flux caméra du mur : image en niveaux de gris teintée en bleu.
async function feed(path, size) {
  const grey = await sharp(await readFile(path))
    .resize(size, size, { fit: 'cover', position: 'top' })
    .flatten({ background: BACKGROUND })
    .grayscale()
    .linear(0.82, 0)
    .png()
    .toBuffer();
  return sharp(grey).toColourspace('srgb').tint(BLUE_2).toBuffer();
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
  const nameSize = fitFont(name, 600, 120);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${screen(BLUE, 0.22, `CAM ${escapeXml(player.position || '--')} <tspan fill="${BLUE_3}">//</tspan> DOSSIER JOUEUR`, 'NEBULA LEAGUE')}
    <rect x="60" y="124" width="420" height="420" fill="${BACKGROUND}"/>
    <rect x="60" y="124" width="420" height="420" fill="url(#scan)"/>
    ${brackets(52, 116, 436, 436, BLUE_2, 30, 3)}
    <rect x="530" y="138" width="10" height="26" fill="${accent}"/>
    <text x="554" y="160" font-family="${MONO}" font-weight="700" font-size="24" fill="${accent}" letter-spacing="3">${escapeXml(clubName)}</text>
    <text x="526" y="${178 + nameSize}" font-family="${DISPLAY}" font-weight="700" font-size="${nameSize}" fill="${PAPER}">${escapeXml(name)}</text>
    <text x="530" y="366" font-family="${MONO}" font-weight="600" font-size="22" fill="${MUTED}" letter-spacing="2">POSTE <tspan fill="${PAPER}">${escapeXml(player.position)}</tspan><tspan dx="34">PERSONNAGE</tspan> <tspan fill="${PAPER}">${escapeXml((player.character || '—').toUpperCase())}</tspan></text>
    <rect x="530" y="398" width="250" height="146" fill="${BLUE_2}" fill-opacity="0.08" stroke="${BLUE_2}" stroke-width="2"/>
    <text x="552" y="430" font-family="${MONO}" font-weight="600" font-size="16" fill="${MUTED}" letter-spacing="2">NOTE GLOBALE</text>
    <text x="550" y="520" font-family="${DISPLAY}" font-weight="700" font-size="80" fill="${rating ? PAPER : DIM}">${rating ?? '--'}</text>
    <text x="${W - 60}" y="${H - 34}" text-anchor="end" font-family="${JP}" font-weight="700" font-size="20" fill="${BLUE_3}" fill-opacity="0.7">ブルーロック</text>
  </svg>`;

  const layers = [];
  if (player.avatarPath) layers.push({ input: await cover(player.avatarPath, 420), left: 60, top: 124 });
  if (club?.logoPath) layers.push({ input: await contain(club.logoPath, 140), left: 820, top: 400 });
  // Les lignes de balayage et l'OSD passent par-dessus l'avatar.
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000000" fill-opacity="0.22"/></pattern></defs>
    <rect x="60" y="124" width="420" height="420" fill="url(#scan)"/>
    <rect x="60" y="500" width="420" height="44" fill="${BACKGROUND}" fill-opacity="0.72"/>
    <circle cx="80" cy="522" r="6" fill="${REC}"/>
    <text x="96" y="529" font-family="${MONO}" font-weight="600" font-size="16" fill="${PAPER}" letter-spacing="2">SUJET SOUS SURVEILLANCE</text>
  </svg>`;
  layers.push({ input: Buffer.from(overlay), left: 0, top: 0 });
  return sharp(Buffer.from(svg)).composite(layers).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}

// Mur principal : les quatre joueurs les mieux notés, comme sur l'accueil.
const WALL = { x: 770, y: 140, tile: 172, gap: 6 };

async function renderSiteCard(data) {
  const players = String(data.players.length).padStart(2, '0');
  const featured = data.players
    .filter(player => player.avatarPath)
    .sort((a, b) => (b.technical?.global ?? 0) - (a.technical?.global ?? 0))
    .slice(0, 4)
    .map((player, index) => ({
      player,
      left: WALL.x + (index % 2) * (WALL.tile + WALL.gap),
      top: WALL.y + Math.floor(index / 2) * (WALL.tile + WALL.gap)
    }));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${screen(BLUE, 0.78, `CAM 00 <tspan fill="${BLUE_3}">//</tspan> SALLE DE CONTRÔLE`, `MUR PRINCIPAL — ${players} SUJETS`)}
    <text x="64" y="160" font-family="${MONO}" font-weight="600" font-size="20" fill="${BLUE_3}" letter-spacing="2">CH 00 <tspan fill="${MUTED}">LIGUE PRIVÉE // AZURE LATCH</tspan></text>
    <text x="58" y="310" font-family="${DISPLAY}" font-weight="700" font-size="158" fill="${PAPER}" letter-spacing="-3">NEBULA</text>
    <text x="54" y="452" font-family="${DISPLAY}" font-weight="700" font-style="italic" font-size="158" fill="${BLUE_2}" letter-spacing="-3">LEAGUE</text>
    <rect x="64" y="482" width="504" height="44" fill="${BLUE}"/>
    <text x="80" y="513" font-family="${DISPLAY}" font-weight="700" font-size="26" fill="${PAPER}" letter-spacing="1">TON EGO EST SOUS SURVEILLANCE.</text>
    <text x="66" y="562" font-family="${MONO}" font-weight="600" font-size="18" fill="${MUTED}" letter-spacing="2">${data.players.length} JOUEURS · ${data.clubs.length} CLUBS · UN SEUL CLASSEMENT</text>
    <rect x="770" y="140" width="350" height="350" fill="${BLUE_2}" fill-opacity="0.05" stroke="${BLUE_2}" stroke-opacity="0.35"/>
    ${brackets(762, 132, 366, 366, BLUE_2, 30, 3)}
    <text x="1120" y="540" text-anchor="end" font-family="${JP}" font-weight="700" font-size="22" fill="${BLUE_3}" fill-opacity="0.75">ブルーロック 監視中</text>
  </svg>`;

  // Lignes de balayage, canal, point REC, nom et note par-dessus chaque flux.
  const T = WALL.tile;
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000000" fill-opacity="0.28"/></pattern></defs>
    ${featured.map(({ player, left: x, top: y }, index) => `
    <rect x="${x}" y="${y}" width="${T}" height="${T}" fill="url(#scan)"/>
    <rect x="${x}" y="${y}" width="${T}" height="26" fill="${BACKGROUND}" fill-opacity="0.6"/>
    <text x="${x + 8}" y="${y + 18}" font-family="${MONO}" font-weight="600" font-size="12" fill="${PAPER}" letter-spacing="1.5">CAM 0${index + 1}</text>
    <circle cx="${x + T - 13}" cy="${y + 13}" r="4.5" fill="${REC}"/>
    <rect x="${x}" y="${y + T - 40}" width="${T}" height="40" fill="${BACKGROUND}" fill-opacity="0.55"/>
    <rect x="${x}" y="${y + T - 30}" width="${Math.round(player.name.length * 11.5 + 18)}" height="30" fill="${BLUE}"/>
    <text x="${x + 9}" y="${y + T - 9}" font-family="${DISPLAY}" font-weight="700" font-size="18" fill="${PAPER}">${escapeXml(player.name.toUpperCase())}</text>
    <text x="${x + T - 8}" y="${y + T - 8}" text-anchor="end" font-family="${DISPLAY}" font-weight="700" font-style="italic" font-size="34" fill="${PAPER}">${player.technical?.global ?? '--'}</text>`).join('')}
  </svg>`;

  const layers = await Promise.all(featured.map(async ({ player, left, top }) => ({ input: await feed(player.avatarPath, T), left, top })));
  layers.push({ input: Buffer.from(overlay), left: 0, top: 0 });
  return sharp(Buffer.from(svg))
    .composite(layers)
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
  await loadFonts();

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
