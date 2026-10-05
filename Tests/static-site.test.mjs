import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import worker from '../worker/index.mjs';
import ids from '../worker/player-ids.json' with {type:'json'};
test('published pages are original HTML and the registry works without React or D1',()=>{
  for(const path of ['index.html','players.html','admin.html','Joueurs/bm/antoine.html'])assert.equal(readFileSync('dist/'+path,'utf8'),readFileSync(path,'utf8'));
  assert.equal(readFileSync('dist/JavaScript/nebula-data.js','utf8'),readFileSync('JavaScript/nebula-data.js','utf8'));
  assert.equal(existsSync('dist/assets/app.js'),false);
  assert.equal(existsSync('dist/compte.html'),false);
  assert.equal(ids.length,11);
});
test('only avatars remain accessible and the token stays server side',async()=>{
  const original=globalThis.fetch;let count=0;
  globalThis.fetch=async(url,options)=>{count++;assert.equal(url,'https://discord.com/api/v10/users/'+ids[0]);assert.equal(options.headers.Authorization,'Bot test-token');return Response.json({id:ids[0],avatar:'valid_hash'})};
  const request=(path,options)=>new Request('https://nebula.example'+path,options);
  const env={DISCORD_BOT_TOKEN:'test-token',ASSETS:{fetch:async()=>new Response('HTML')}};
  try{
    for(const path of ['/api/auth/login','/api/auth/session','/api/admin','/api/admin/discord-members','/api/league'])assert.equal((await worker.fetch(request(path),env)).status,404);
    assert.equal((await worker.fetch(request('/api/discord-avatar?userId=bad'),env)).status,400);
    assert.equal((await worker.fetch(request('/api/discord-avatar?userId=111111111111111111'),env)).status,404);
    assert.equal(count,0);
    assert.equal((await worker.fetch(request('/api/discord-avatar?userId='+ids[0],{method:'POST'}),env)).status,405);
    const response=await worker.fetch(request('/api/discord-avatar?userId='+ids[0]),env);
    assert.equal(response.status,200);const body=await response.json();assert.equal(body.avatarUrl,`https://cdn.discordapp.com/avatars/${ids[0]}/valid_hash.webp?size=1024`);assert.equal(JSON.stringify(body).includes('test-token'),false);
    assert.equal(await (await worker.fetch(request('/'),env)).text(),'HTML');
    assert.equal((await worker.fetch(request('/compte'),env)).status,302);
  }finally{globalThis.fetch=original}
});
test('Discord failures preserve a safe avatar fallback',async()=>{
  const original=globalThis.fetch;const request=new Request('https://nebula.example/api/discord-avatar?userId='+ids[0]);
  try{
    assert.equal((await worker.fetch(request,{})).status,503);
    globalThis.fetch=async()=>Response.json({id:'wrong',avatar:'valid'});
    assert.equal((await worker.fetch(request,{DISCORD_BOT_TOKEN:'test'})).status,502);
    globalThis.fetch=async()=>{throw Error('private upstream error')};
    const response=await worker.fetch(request,{DISCORD_BOT_TOKEN:'test'});assert.equal(response.status,503);assert.equal((await response.text()).includes('private'),false);
  }finally{globalThis.fetch=original}
});
