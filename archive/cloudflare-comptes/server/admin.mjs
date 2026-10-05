import { currentDiscordUser, isAdminUser } from './discord-auth.mjs';
import { schemas, normalizeCollection, validateLeague } from '../shared/admin-model.mjs';
const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
export async function adminApi(request, env) {
  const user = await currentDiscordUser(request,env);
  if (!user) return json({ error: 'Connecte-toi avec Discord.' },401);
  if (!isAdminUser(user,env)) return json({ error: 'Accès réservé aux administrateurs.' },403);
  const url=new URL(request.url), route=url.pathname.slice('/api/admin'.length);
  if(request.method!=='GET' && (request.headers.get('origin')!==env.NEBULA_SITE_URL || !request.headers.get('content-type')?.startsWith('application/json'))) return json({error:'Origine ou format non autorisé.'},403);
  if(route==='/discord-members' && request.method==='GET') {
    if(!/^\d{17,20}$/.test(env.DISCORD_GUILD_ID || '') || !env.DISCORD_BOT_TOKEN) return json({error:'Le serveur Discord doit être configuré.'},503);
    const after=url.searchParams.get('after') || ''; if(after&&!/^\d{17,20}$/.test(after)) return json({error:'Pagination invalide.'},400);
    const response=await fetch(`https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/members?limit=200${after?'&after='+after:''}`,{headers:{Authorization:`Bot ${env.DISCORD_BOT_TOKEN}`},signal:AbortSignal.timeout(10000)});
    if(!response.ok) {
      const messages={401:'Le token du bot Discord doit être remplacé dans Cloudflare.',403:'Active Server Members Intent dans le portail Discord et vérifie que le bot est dans le serveur.',404:'Discord ne trouve pas ce serveur pour le bot. Ajoute le bot Nebula au serveur et vérifie son identifiant.'};
      return json({error:messages[response.status]||'Discord ne peut pas fournir les membres pour le moment.'},503);
    }
    const rows=await response.json();
    const members=rows.filter(row=>!row.user.bot).map(row=>({id:row.user.id,name:row.nick||row.user.global_name||row.user.username,avatar:row.user.avatar?`https://cdn.discordapp.com/avatars/${row.user.id}/${row.user.avatar}.webp?size=64`:null}));
    return json({members,next:rows.length===200?rows.at(-1).user.id:null});
  }
  if(route==='/history' && request.method==='GET') {
    const key=url.searchParams.get('collection'); if(!Object.hasOwn(schemas,key)) return json({error:'Collection invalide.'},400);
    const rows=await env.DB.prepare('SELECT id, revision, actor_id, created_at FROM league_history WHERE collection=? ORDER BY id DESC LIMIT 30').bind(key).all();
    return json(rows.results);
  }
  if(route.startsWith('/history/') && request.method==='GET') {
    const id=Number(route.split('/').pop()); if(!Number.isSafeInteger(id)||id<1) return json({error:'Version invalide.'},400);
    const row=await env.DB.prepare('SELECT collection,data FROM league_history WHERE id=?').bind(id).first();
    return row?json({collection:row.collection,data:JSON.parse(row.data)}):json({error:'Version introuvable.'},404);
  }
  const rows=await env.DB.prepare('SELECT key,data,revision FROM league_data').all();
  const collections=Object.fromEntries(rows.results.map(row=>[row.key,{data:JSON.parse(row.data),revision:row.revision}]));
  if((route===''||route==='/') && request.method==='GET') return json({collections,me:{id:user.id,name:user.name},guildId:env.DISCORD_GUILD_ID||null});
  const key=route.slice(1);
  if(!Object.hasOwn(schemas,key) || !Object.hasOwn(collections,key)) return json({error:'Collection introuvable.'},404);
  if(request.method!=='PUT') return new Response(null,{status:405,headers:{Allow:'PUT'}});
  if(Number(request.headers.get('content-length'))>1000000) return json({error:'Trop de données.'},413);
  const raw=await request.text(); if(raw.length>1000000) return json({error:'Trop de données.'},413);
  let payload; try { payload=JSON.parse(raw); } catch {return json({error:'Demande invalide.'},400);}
  if(!Number.isSafeInteger(payload.revision)||payload.revision<0) return json({error:'Version invalide.'},400);
  if(collections[key].revision!==payload.revision) return json({error:'Cette liste a changé. Recharge-la avant d’enregistrer.'},409);
  const data=Object.fromEntries(Object.entries(collections).map(([key,value])=>[key,value.data]));
  let next; try { next=normalizeCollection(key,payload.data,data); validateLeague({...data,[key]:next}); } catch(error) {return json({error:error.message},400);}
  const now=Date.now();
  const totalRevision=rows.results.reduce((sum,row)=>sum+row.revision,0);
  const results=await env.DB.batch([
    env.DB.prepare('INSERT INTO league_history(collection,revision,data,actor_id,created_at) SELECT key,revision,data,?,? FROM league_data WHERE key=? AND revision=? AND (SELECT SUM(revision) FROM league_data)=?').bind(user.id,now,key,payload.revision,totalRevision),
    env.DB.prepare('UPDATE league_data SET data=?,revision=revision+1,updated_at=? WHERE key=? AND revision=? AND (SELECT SUM(revision) FROM league_data)=?').bind(JSON.stringify(next),now,key,payload.revision,totalRevision)
  ]);
  if(results[1].meta.changes!==1) return json({error:'Modification concurrente. Recharge la liste.'},409);
  return json({data:next,revision:payload.revision+1});
}
