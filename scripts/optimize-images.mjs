// Convertit les images PNG/JPEG du site en WebP et met à jour les chemins
// dans les pages, scripts et feuilles de style.
// Usage : pnpm images   (à relancer après avoir ajouté une nouvelle image)
// Les originaux restent récupérables dans l'historique git.
import { readdir, readFile, writeFile, stat, rm } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

// images/logos est volontairement exclu : nebula.png sert de favicon.
const IMAGE_DIRS = ['images/icons', 'images/clubs_icon', 'Joueurs/images-joueurs'];
const MAX_SIZE = 1024;
const SOURCE_DIRS = ['.', 'CSS', 'JavaScript', 'Joueurs', 'Autre'];
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.css', '.md']);

const kb = bytes => `${Math.round(bytes / 1024)} Ko`;
const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function listTextFiles(dir, recursive) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) files.push(...await listTextFiles(path, true));
    } else if (TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(path);
    }
  }
  return files;
}

const converted = [];
let before = 0;
let after = 0;

for (const dir of IMAGE_DIRS) {
  for (const file of await readdir(dir)) {
    const ext = extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

    const source = join(dir, file);
    const name = basename(file, extname(file));
    const target = join(dir, `${name}.webp`);
    const originalSize = (await stat(source)).size;

    // Lecture en mémoire : sous Windows, sharp verrouille sinon le fichier
    // source et empêche sa suppression.
    await sharp(await readFile(source))
      .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toFile(target);

    const newSize = (await stat(target)).size;
    await rm(source);
    before += originalSize;
    after += newSize;
    converted.push({ folder: basename(dir), file, name });
    console.log(`${source.padEnd(42)} ${kb(originalSize).padStart(7)} → ${kb(newSize)}`);
  }
}

if (!converted.length) {
  console.log('Aucune image PNG/JPEG à convertir.');
  process.exit(0);
}

// Met à jour les références, en corrigeant au passage la casse du nom de
// fichier (Cloudflare distingue majuscules et minuscules).
const textFiles = (await Promise.all(SOURCE_DIRS.map(dir => listTextFiles(dir, dir !== '.')))).flat();
let updatedFiles = 0;
for (const path of textFiles) {
  const original = await readFile(path, 'utf8');
  let content = original;
  for (const { folder, file, name } of converted) {
    const pattern = new RegExp(`(${escapeRegExp(folder)}/)${escapeRegExp(file)}`, 'gi');
    content = content.replace(pattern, `$1${name}.webp`);
  }
  if (content !== original) {
    await writeFile(path, content);
    updatedFiles++;
    console.log(`Chemins mis à jour : ${path}`);
  }
}

console.log(`\n${converted.length} images converties : ${kb(before)} → ${kb(after)} (${updatedFiles} fichiers mis à jour).`);
