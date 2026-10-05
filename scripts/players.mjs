// Génère une fiche HTML par joueur depuis scripts/templates/joueur.html.
// Usage : pnpm joueurs   (après avoir ajouté, modifié ou transféré un joueur)
// Les fiches générées dont le joueur n'existe plus (transfert de dossier,
// suppression) sont retirées ; les autres pages de Joueurs/ ne sont pas touchées.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { loadLeagueData, listPages } from './site-meta.mjs';
import { renderPlayerPage, GENERATED_MARKER } from './player-pages.mjs';

const data = await loadLeagueData();
let written = 0;

for (const player of data.players) {
  const html = await renderPlayerPage(player, data);
  const current = await readFile(player.profilePath, 'utf8').catch(() => null);
  if (current === html) continue;
  await mkdir(dirname(player.profilePath), { recursive: true });
  await writeFile(player.profilePath, html);
  written++;
  console.log(`${current === null ? 'Fiche créée' : 'Fiche mise à jour'} : ${player.profilePath}`);
}

for (const page of await listPages(data)) {
  if (page.player || !page.file.startsWith('Joueurs/')) continue;
  const html = await readFile(page.file, 'utf8');
  if (!html.includes(GENERATED_MARKER)) continue;
  await rm(page.file);
  console.log(`Fiche orpheline supprimée : ${page.file}`);
}

console.log(written ? `${written} fiches écrites.` : 'Toutes les fiches sont à jour.');
