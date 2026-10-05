import playerIds from './player-ids.json' with {type:'json'};
const allowedIds=new Set(playerIds);
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if(url.pathname==='/compte'||url.pathname==='/compte.html')return Response.redirect(new URL('/',request.url),302);
    if(url.pathname==='/api/discord-avatar') {
      if(request.method!=='GET')return new Response(null,{status:405,headers:{Allow:'GET'}});
      const id=url.searchParams.get('userId')||'';
      if(!/^\d{17,20}$/.test(id))return json({error:'Identifiant invalide.'},400);
      if(!allowedIds.has(id))return json({error:'Joueur introuvable.'},404);
      if(!env.DISCORD_BOT_TOKEN)return json({error:'Avatars Discord non configurés.'},503);
      try {
        const response=await fetch(`https://discord.com/api/v10/users/${id}`,{headers:{Authorization:`Bot ${env.DISCORD_BOT_TOKEN}`},signal:AbortSignal.timeout(10000)});
        if(!response.ok)return json({error:'Avatar indisponible.'},response.status===404?404:503);
        const user=await response.json();
        if(user.id!==id||(user.avatar&&!/^[a-zA-Z0-9_]+$/.test(user.avatar)))return json({error:'Avatar invalide.'},502);
        const avatarUrl=user.avatar?`https://cdn.discordapp.com/avatars/${id}/${user.avatar}.webp?size=1024`:`https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id)>>22n)%6n)}.png`;
        return Response.json({userId:id,avatarUrl},{headers:{'Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
      } catch{return json({error:'Avatar indisponible.'},503);}
    }
    if(url.pathname.startsWith('/api/'))return json({error:'Introuvable.'},404);
    return env.ASSETS.fetch(request);
  }
};
