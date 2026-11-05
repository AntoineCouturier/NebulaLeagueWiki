// Rendu des fiches joueurs depuis Joueurs/modele/joueur.html et les
// données de nebula-data.js. Appelé par build.mjs, qui écrit une fiche par
// joueur dans dist/ (aussi pour pnpm dev).
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { renderMetaBlock, readText } from './site-meta.mjs';

// Valeurs de la fiche : partagées avec le navigateur (JavaScript/player-profile.js).
let profilePromise = null;
const loadProfile = () => (profilePromise ??= readFile('JavaScript/player-profile.js', 'utf8').then(source => {
  const window = {};
  vm.runInNewContext(source, { window }, { timeout: 5000 });
  return window.NEBULA_PLAYER_PROFILE;
}));

let templatePromise = null;
const loadTemplate = () => (templatePromise ??= readText('Joueurs/modele/joueur.html'));

export async function renderPlayerPage(player, data) {
  const template = await loadTemplate();
  const { profileValues, fillTemplate } = await loadProfile();
  let html = fillTemplate(template, profileValues(player, data));
  const indent = html.match(/([ \t]*)<!-- \{\{meta\}\} -->/)?.[1] || '    ';
  const page = { file: player.profilePath, player };
  return html.replace('<!-- {{meta}} -->', renderMetaBlock(page, html, data, indent));
}
