import { spawnSync } from 'node:child_process';
const run = args => {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
};
run(['scripts/build.mjs']);
run(['node_modules/wrangler/bin/wrangler.js', 'd1', 'migrations', 'apply', 'DB', '--local']);
run(['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'DB', '--local', '--file', 'db/seed.sql']);
run(['node_modules/wrangler/bin/wrangler.js', 'dev', '--ip', '127.0.0.1', '--port', '8787']);
