// Met à jour les balises de partage (aperçus Discord, favicon, manifest) dans
// le <head> de toutes les pages. Usage : pnpm meta
// À relancer après avoir ajouté une page ou un joueur, ou modifié une note.
import { readFile, writeFile } from 'node:fs/promises';
import { loadLeagueData, listPages, applyMetaBlock } from './site-meta.mjs';

const data = await loadLeagueData();
let updated = 0;
for (const page of await listPages(data)) {
  const html = await readFile(page.file, 'utf8');
  const next = applyMetaBlock(page, html, data);
  if (next !== html) {
    await writeFile(page.file, next);
    updated++;
    console.log(`Balises mises à jour : ${page.file}${page.player ? ` (joueur ${page.player.name})` : ''}`);
  }
}
console.log(updated ? `${updated} pages mises à jour.` : 'Toutes les pages sont déjà à jour.');
