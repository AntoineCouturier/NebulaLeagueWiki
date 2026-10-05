import { readFile, writeFile, mkdir, cp, readdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { build } from 'esbuild';
import { transformData, extractSeed, characterSource } from './league-source.mjs';

const outputDirectory = resolve('dist');
if (dirname(outputDirectory) !== process.cwd()) throw Error('Dossier de compilation hors du projet.');
await mkdir(outputDirectory, { recursive: true });
for (const entry of await readdir(outputDirectory)) {
  const target = resolve(outputDirectory, entry);
  if (dirname(target) !== outputDirectory) throw Error('Fichier généré hors du dossier de compilation.');
  await rm(target, { recursive: true, force: true });
}
for (const dir of ['CSS', 'JavaScript', 'images', 'Joueurs']) await cp(dir, `dist/${dir}`, { recursive: true, filter: path => !path.endsWith('.html') });
const source = await readFile('JavaScript/nebula-data.js', 'utf8');
await writeFile('dist/JavaScript/nebula-data.js', transformData(source));
const seed = extractSeed(source);
const titlesSource=await readFile('JavaScript/titles.js','utf8');
seed.characters=JSON.parse(JSON.stringify(characterSource(titlesSource,'seed')));
await writeFile('dist/JavaScript/titles.js',characterSource(titlesSource));
const quote = text => `'${text.replaceAll("'", "''")}'`;
await mkdir('db', { recursive: true });
// Explicit import only: the build never writes to a running database.
// Wrangler's remote import manages rollback itself; D1 rejects SQL BEGIN/COMMIT.
await writeFile('db/seed.sql', Object.entries(seed).map(([key, data]) => `INSERT INTO league_data(key,data,updated_at) VALUES(${quote(key)},${quote(JSON.stringify(data))},0) ON CONFLICT(key) DO NOTHING;`).join('\n') + '\n');
async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = dir === '.' ? entry.name : `${dir}/${entry.name}`;
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(path);
    else if (entry.isDirectory() && ['Joueurs', 'Autre'].includes(entry.name) || (dir !== '.' && entry.isDirectory())) files.push(...await htmlFiles(path));
  }
  return files;
}
const files = await htmlFiles('.');
files.push('player.html');
for (const path of files) {
  let html = await readFile(path === 'player.html' ? 'Joueurs/bm/antoine.html' : path, 'utf8');
  if (path === 'player.html') html = html.replace(/\b(href|src)="([^"]+)"/g, (all, attr, value) => value.startsWith('http') || value.startsWith('#') ? all : `${attr}="${new URL(value,'https://nebula.example/Joueurs/bm/antoine.html').pathname}"`);
  const scripts = [];
  const stripped = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_, attrs, code) => {
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    scripts.push(src ? { src } : { code }); return '';
  });
  const body = stripped.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
  if (!body) throw Error(`Corps HTML introuvable : ${path}`);
  const head = stripped.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const page = JSON.stringify({ markup: body[2], scripts }).replaceAll('<', '\\u003c');
  const output = `<!doctype html><html lang="fr"><head>${head}<link rel="stylesheet" href="/CSS/auth.css"><style>#root{display:contents}</style></head><body${body[1]}><div id="root"></div><script id="nebula-page" type="application/json">${page}</script><script type="module" src="/assets/app.js"></script></body></html>`;
  await mkdir(`dist/${path.includes('/') ? path.slice(0,path.lastIndexOf('/')) : ''}`, { recursive: true });
  await writeFile(`dist/${path}`, output);
}
await build({ absWorkingDir: process.cwd(), entryPoints: ['./src/main.tsx'], bundle: true, minify: true, outfile: 'dist/assets/app.js', format: 'esm', target: 'es2022', jsx: 'automatic' });
console.log(`Nebula : ${files.length} pages React, ${seed.players.length} joueurs, ${seed.matches.length} matchs terminés. Import D1 : db/seed.sql.`);
