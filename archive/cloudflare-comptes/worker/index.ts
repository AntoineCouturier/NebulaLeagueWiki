import discordAuth from '../server/discord-auth.mjs';
import { adminApi } from '../server/admin.mjs';
interface Env {
  ASSETS: Fetcher; DB: D1Database;
  NEBULA_SITE_URL: string; DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET?: string; NEBULA_SESSION_SECRET?: string; DISCORD_BOT_TOKEN?: string;
  ADMIN_DISCORD_IDS?: string; DISCORD_GUILD_ID?: string;
}
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
async function league(env: Env) {
  const rows = await env.DB.prepare('SELECT key, data FROM league_data').all<{ key: string; data: string }>();
  const data = Object.fromEntries(rows.results.map(row => [row.key, JSON.parse(row.data)]));
  if (!['clubs', 'groups', 'players', 'matches', 'seasons', 'leagueSchedule', 'nclSchedule', 'nclQualifiedCount', 'nclSeasonNumber'].every(key => key in data)) return json({ error: 'Les données de la ligue doivent être importées.' }, 503);
  return json(data);
}
async function avatar(request: Request, env: Env) {
  const id = new URL(request.url).searchParams.get('userId') || '';
  if (!/^\d{17,20}$/.test(id)) return json({ error: 'Identifiant invalide.' }, 400);
  // Only registered players can be queried with the Nebula bot token.
  const players = await env.DB.prepare("SELECT data FROM league_data WHERE key='players'").first<{ data: string }>();
  if (!players || !JSON.parse(players.data).some((p: { discordId?: string }) => p.discordId === id)) return json({ error: 'Joueur introuvable.' }, 404);
  if (!env.DISCORD_BOT_TOKEN) return json({ error: 'Avatars Discord non configurés.' }, 503);
  const response = await fetch(`https://discord.com/api/v10/users/${id}`, { headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) return json({ error: 'Avatar indisponible.' }, response.status === 404 ? 404 : 503);
  const user = await response.json() as { id: string; avatar?: string };
  if (user.id !== id || (user.avatar && !/^[a-zA-Z0-9_]+$/.test(user.avatar))) return json({ error: 'Avatar invalide.' }, 502);
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${id}/${user.avatar}.webp?size=1024` : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id) >> 22n) % 6n)}.png`;
  return Response.json({ userId: id, avatarUrl }, { headers: { 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' } });
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith('/api/auth/')) return await discordAuth(request, env);
      if (url.pathname === '/api/admin' || url.pathname.startsWith('/api/admin/')) return await adminApi(request,env);
      if (url.pathname === '/api/league' || url.pathname === '/api/discord-avatar') {
        if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
        return url.pathname === '/api/league' ? await league(env) : await avatar(request, env);
      }
      if (url.pathname.startsWith('/api/')) return json({ error: 'Introuvable.' }, 404);
      if (url.pathname.startsWith('/Joueurs/') && /\/(?:[^/]+)(?:\.html)?$/.test(url.pathname)) {
        const rows = await env.DB.prepare("SELECT data FROM league_data WHERE key='players'").first<{data:string}>();
        const players = rows ? JSON.parse(rows.data) : [];
        const path = decodeURIComponent(url.pathname).replace(/\.html$/, '').toLowerCase();
        if (players.some((p:{folder:string;name:string}) => path === `/joueurs/${p.folder}/${p.name}`.toLowerCase())) {
          const existing=await env.ASSETS.fetch(request);
          if(existing.status!==404) return existing;
          url.pathname='/player';
          return await env.ASSETS.fetch(new Request(url,request));
        }
      }
      return await env.ASSETS.fetch(request);
    } catch { return json({ error: 'Service temporairement indisponible.' }, 503); }
  }
};
