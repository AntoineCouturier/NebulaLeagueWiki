import { readFile, writeFile, mkdir, cp, readdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { loadLeagueData, listPages, applyMetaBlock, readText } from './site-meta.mjs';
import { generateSocialAssets } from './social-assets.mjs';
import { renderPlayerPage } from './player-pages.mjs';
// Les fiches Joueurs/<dossier>/<prénom>.html ne sont plus dans le dépôt : elles
// sont créées ici, dans dist/, pour chaque joueur de nebula-data.js. Une vieille
// copie locale éventuelle n'est donc jamais publiée.
const isGeneratedProfile = path => /Joueurs[/\\](?!demo[/\\])[^/\\]+[/\\][^/\\]+\.html$/.test(path);
const outputDirectory = resolve('dist');
// La fiche de démonstration (Joueurs/demo) n'est publiée qu'avec pnpm dev.
const includeDemo = process.argv.includes('--dev');
if (dirname(outputDirectory) !== process.cwd()) throw Error('Dossier de compilation hors du projet.');
await mkdir(outputDirectory, { recursive: true });
for (const entry of await readdir(outputDirectory)) {
  const target = resolve(outputDirectory, entry);
  if (dirname(target) !== outputDirectory) throw Error('Fichier hors du dossier de compilation.');
  await rm(target, { recursive: true, force: true });
}
// Publish the original pages directly, without React or database imports.
for (const dir of ['CSS', 'JavaScript', 'images', 'Joueurs']) {
  await cp(dir, `dist/${dir}`, { recursive: true, filter: path => !/[/\\](auth|manager)\.css$/.test(path) && (includeDemo || !/Joueurs[/\\]demo/.test(path)) && !isGeneratedProfile(path) });
}
for (const file of await readdir('.')) if (file.endsWith('.html') && file !== 'compte.html') await cp(file, `dist/${file}`);
// The same local registry controls both player pages and permitted avatar IDs.
const data = await loadLeagueData();
const ids = [...new Set(data.players.map(player=>player.discordId).filter(id=>/^\d{17,20}$/.test(id)))];
await mkdir('worker', { recursive: true });
await writeFile('worker/player-ids.json', JSON.stringify(ids,null,2)+'\n');
// Images d'aperçu Discord, icônes et manifest.
const previews = await generateSocialAssets(outputDirectory, data);
// Les balises de partage vivent dans les pages sources : on signale celles à régénérer.
const stalePages = [];
for (const page of await listPages(data)) {
  const html = await readText(page.file);
  if (applyMetaBlock(page, html, data) !== html) stalePages.push(page.file);
}
// Une fiche par joueur, depuis scripts/templates/joueur.html : ajouter un
// joueur dans nebula-data.js suffit, l'URL Joueurs/<folder>/<prénom> reste la même.
for (const player of data.players) {
  const target = resolve(outputDirectory, player.profilePath);
  if (!target.startsWith(outputDirectory)) throw Error(`Fiche hors du dossier de compilation : ${player.profilePath}`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, await renderPlayerPage(player, data));
}
console.log(`Site HTML/CSS/JS prêt. Fiches joueurs : ${data.players.length}. Avatars Discord : ${ids.length} joueurs. Aperçus : ${previews} fiches.`);
if (stalePages.length) console.warn(`⚠ Balises de partage à mettre à jour (lancez pnpm meta) : ${stalePages.join(', ')}`);
