import {spawnSync} from 'node:child_process';
for(const args of [['scripts/build.mjs','--dev'],['node_modules/wrangler/bin/wrangler.js','dev','--ip','127.0.0.1','--port','8787']]) {
  const result=spawnSync(process.execPath,args,{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);
}
