import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.ts';
test('new player profiles use the full dynamic template and unknown players stay unavailable',async()=>{
  const seen=[];
  const env={DB:{prepare(){return {async first(){return {data:JSON.stringify([{name:'Nouveau',folder:'nouveaux'}])}}}}},ASSETS:{async fetch(request){seen.push(new URL(request.url).pathname);return new URL(request.url).pathname==='/player'?new Response('dynamic profile'):new Response('missing',{status:404})}}};
  const response=await worker.fetch(new Request('https://nebula.example/Joueurs/nouveaux/nouveau'),env);
  assert.equal(response.status,200);assert.equal(await response.text(),'dynamic profile');assert.deepEqual(seen,['/Joueurs/nouveaux/nouveau','/player']);
  assert.equal((await worker.fetch(new Request('https://nebula.example/Joueurs/nouveaux/inconnu'),env)).status,404);
});
