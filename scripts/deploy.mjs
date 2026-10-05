import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
for (const args of [['scripts/build.mjs'], ['node_modules/wrangler/bin/wrangler.js', 'deploy']]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
