import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import auth from '../server/discord-auth.mjs';
import {adminApi} from '../server/admin.mjs';
import {normalizeCollection,validateLeague} from '../shared/admin-model.mjs';

function database() {
  const sql=new DatabaseSync(':memory:');
  for(const file of ['db/migrations/0001_accounts.sql','db/migrations/0002_administration.sql','db/seed.sql'])sql.exec(readFileSync(file,'utf8'));
  const DB={prepare(query){const statement=(args=[])=>({bind(...values){return statement(values)},async run(){return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}}},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}}});return statement()},async batch(statements){sql.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());sql.exec('COMMIT');return results}catch(error){sql.exec('ROLLBACK');throw error}}};
  return {sql,DB,data:()=>Object.fromEntries(sql.prepare('SELECT key,data FROM league_data').all().map(row=>[row.key,JSON.parse(row.data)]))};
}
test('admin authorization, CSRF, validation, revisions, history and private Discord directory',async()=>{
  const {sql,DB,data}=database();
  const env={DB,NEBULA_SITE_URL:'https://nebula.example',DISCORD_CLIENT_ID:'1531381492930969820',DISCORD_CLIENT_SECRET:'test-only',NEBULA_SESSION_SECRET:'test-only-secret-at-least-thirty-two-characters',ADMIN_DISCORD_IDS:'725931972802904115',DISCORD_GUILD_ID:'1090677322157408296',DISCORD_BOT_TOKEN:'test-only'};
  const request=(path,options)=>new Request(env.NEBULA_SITE_URL+path,options);
  const cookie=(response,name)=>response.headers.getSetCookie().find(value=>value.startsWith(name+'='))?.split(';')[0];
  const originalFetch=globalThis.fetch;
  let userId=env.ADMIN_DISCORD_IDS;
  globalThis.fetch=async url=>url.endsWith('/token')?Response.json({access_token:'not-persisted',token_type:'Bearer'}):url.includes('/members?')?Response.json([{user:{id:userId,username:'Antoine'}},{user:{id:'1531381492930969820',username:'bot',bot:true}}]):Response.json({id:userId,username:'Antoine',avatar:null});
  async function login(){const start=await auth(request('/api/auth/login'),env);const state=new URL(start.headers.get('location')).searchParams.get('state');return cookie(await auth(request(`/api/auth/callback?code=test&state=${state}`,{headers:{Cookie:cookie(start,'nebula_oauth_state')}}),env),'nebula_session')}
  try{
    validateLeague(data());
    assert.equal((await adminApi(request('/api/admin'),env)).status,401);
    userId='111111111111111111';const member=await login();
    assert.equal((await adminApi(request('/api/admin',{headers:{Cookie:member}}),env)).status,403);
    userId=env.ADMIN_DISCORD_IDS;const session=await login();
    const headers={Cookie:session,Origin:env.NEBULA_SITE_URL,'Content-Type':'application/json'};
    const put=(payload,extra={})=>adminApi(request('/api/admin/players',{method:'PUT',headers:{...headers,...extra},body:JSON.stringify(payload)}),env);
    const body={revision:0,data:data().players};
    assert.equal((await put(body,{Origin:'https://evil.example'})).status,403);
    const invalid=structuredClone(body);invalid.data[0].avatarPath='https://example.com/"onerror="bad';
    assert.equal((await put(invalid)).status,400);
    const duplicate=structuredClone(body);duplicate.data[1].discordId=duplicate.data[0].discordId;
    assert.equal((await put(duplicate)).status,400);
    body.data[0].technical.tir=95;
    assert.equal((await put(body)).status,200);
    assert.equal(data().players[0].technical.tir,95);
    assert.equal((await put(body)).status,409);
    const history=await (await adminApi(request('/api/admin/history?collection=players',{headers}),env)).json();
    assert.equal(history.length,1);assert.equal(history[0].actor_id,env.ADMIN_DISCORD_IDS);
    const backup=await (await adminApi(request('/api/admin/history/'+history[0].id,{headers}),env)).json();
    assert.equal((await put({revision:1,data:backup.data})).status,200);
    assert.notEqual(data().players[0].technical.tir,95);
    const directory=await (await adminApi(request('/api/admin/discord-members',{headers}),env)).json();
    assert.equal(directory.members.length,1);assert.equal(directory.members[0].id,userId);
    assert.equal((await adminApi(request('/api/admin/history?collection=__proto__',{headers}),env)).status,400);
    await auth(request('/api/auth/logout',{method:'POST',headers}),env);
    assert.equal((await adminApi(request('/api/admin',{headers}),env)).status,401);
  }finally{globalThis.fetch=originalFetch;sql.close()}
});
test('match normalization and season closure preserve results and frozen ratings',()=>{
  const {sql,data}=database();try{
    const league=data();const [home,away]=league.clubs;
    const match={id:'test',date:'2026-10-03',time:'20:00',category:'ligue',season:league.seasons[0].number,home:home.key,away:away.key,timelineHome:[{time:'1:23',scorer:league.players[0].name,assist:''}],timelineAway:[],notesHome:[],notesAway:[]};
    const normalized=normalizeCollection('matches',[match],league);validateLeague({...league,matches:normalized});
    assert.equal(normalized[0].scoreHome,1);assert.equal(normalized[0].timelineHome[0].time,"1'23\"");assert.equal(normalized[0].scorersHome[0].count,1);
    const bad=structuredClone(normalized);bad[0].timelineHome[0].time="12'01\"";assert.throws(()=>validateLeague({...league,matches:bad}),/Temps/);
    const closed=normalizeCollection('seasons',league.seasons.map(s=>({...s,status:'finished'})),league);
    const snapshot=structuredClone(closed[0].technicalSnapshots);
    league.seasons=closed;league.players[0].technical.tir=100;
    assert.deepEqual(normalizeCollection('seasons',closed,league)[0].technicalSnapshots,snapshot);
  }finally{sql.close()}
});
