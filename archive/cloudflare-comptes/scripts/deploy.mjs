import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
if (config.d1_databases[0].database_id.startsWith('00000000')) throw Error('Crée la base Nebula D1 puis renseigne son database_id dans wrangler.jsonc.');
if (!config.vars.NEBULA_SITE_URL.startsWith('https://')) throw Error('Configure NEBULA_SITE_URL avec l’adresse HTTPS de Nebula.');
for (const args of [['scripts/build.mjs'], ['node_modules/wrangler/bin/wrangler.js', 'deploy']]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
