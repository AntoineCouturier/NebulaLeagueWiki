// Web API OAuth handler. Workers persist users, revocable sessions and one-use states in D1.
const encoder = new TextEncoder();
const SESSION = 'nebula_session';
const STATE = 'nebula_oauth_state';
const SESSION_SECONDS = 24 * 60 * 60;
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
const json = (body, status = 200) => Response.json(body, { status, headers });

function settings(env) {
    try {
        const site = new URL(env.NEBULA_SITE_URL);
        const local = ['localhost', '127.0.0.1', '[::1]'].includes(site.hostname);
        if (site.username || site.password || site.pathname !== '/' || site.search || site.hash) return null;
        if (site.protocol !== 'https:' && !(local && site.protocol === 'http:')) return null;
        if (!/^\d{17,20}$/.test(env.DISCORD_CLIENT_ID || '') || !env.DISCORD_CLIENT_SECRET || (env.NEBULA_SESSION_SECRET || '').length < 32) return null;
        return { origin: site.origin, secure: site.protocol === 'https:', clientId: env.DISCORD_CLIENT_ID, clientSecret: env.DISCORD_CLIENT_SECRET, secret: env.NEBULA_SESSION_SECRET };
    } catch { return null; }
}

function base64(bytes) {
    return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
function unbase64(value) {
    return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
}
async function key(secret) {
    return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function hash(value) {
    const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(value));
    return base64(new Uint8Array(bytes));
}
async function sign(payload, cfg, purpose) {
    const body = base64(encoder.encode(JSON.stringify(payload)));
    const signature = await crypto.subtle.sign('HMAC', await key(cfg.secret), encoder.encode(`${purpose}.${body}`));
    return `${body}.${base64(new Uint8Array(signature))}`;
}
async function verify(value, cfg, purpose) {
    try {
        if (!value || value.length > 4096) return null;
        const parts = value.split('.');
        if (parts.length !== 2) return null;
        if (!await crypto.subtle.verify('HMAC', await key(cfg.secret), unbase64(parts[1]), encoder.encode(`${purpose}.${parts[0]}`))) return null;
        const payload = JSON.parse(new TextDecoder().decode(unbase64(parts[0])));
        if (payload.v !== 1 || !Number.isFinite(payload.exp) || payload.exp <= Date.now()) return null;
        return payload;
    } catch { return null; }
}
function readCookie(request, name) {
    const entry = (request.headers.get('cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(`${name}=`));
    return entry ? entry.slice(name.length + 1) : '';
}
function cookie(name, value, cfg, age) {
    return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${cfg.secure ? '; Secure' : ''}`;
}
function redirect(location, cookies = []) {
    const responseHeaders = new Headers({ ...headers, Location: location });
    cookies.forEach(value => responseHeaders.append('Set-Cookie', value));
    return new Response(null, { status: 303, headers: responseHeaders });
}
function avatar(user) {
    return user.avatar && /^[a-zA-Z0-9_]+$/.test(user.avatar)
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=128`
        : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(user.id) >> 22n) % 6n)}.png`;
}

export const isAdminUser = (user, env) => !!user && (env.ADMIN_DISCORD_IDS || '').split(',').map(id => id.trim()).includes(user.id);
export async function currentDiscordUser(request, env) {
    const cfg = settings(env);
    if (!cfg || new URL(request.url).origin !== cfg.origin || !env.DB) return null;
    const raw = readCookie(request, SESSION);
    const session = await verify(raw, cfg, 'session');
    if (!session?.user || !/^\d{17,20}$/.test(session.user.id || '')) return null;
    const stored = await env.DB.prepare('SELECT token_hash FROM discord_sessions WHERE token_hash = ? AND user_id = ? AND expires_at > ?').bind(await hash(raw), session.user.id, Date.now()).first();
    return stored ? session.user : null;
}

export default async function discordAuth(request, env) {
    const url = new URL(request.url);
    const route = url.pathname.split('/').pop();
    const allowed = route === 'logout' ? 'POST' : 'GET';
    if (!['login', 'callback', 'session', 'logout'].includes(route)) return json({ error: 'Introuvable.' }, 404);
    if (request.method !== allowed) return new Response(null, { status: 405, headers: { ...headers, Allow: allowed } });
    const cfg = settings(env);
    if (!cfg) {
        if (route === 'session') return json({ available: false, user: null });
        return redirect('/compte.html?auth=unavailable');
    }
    if (url.origin !== cfg.origin) return json({ error: 'Adresse du site non autorisée.' }, 403);
    const account = new URL('/compte.html', cfg.origin);
    const fail = error => {
        account.searchParams.set('auth', error);
        return redirect(account.href, [cookie(STATE, '', cfg, 0)]);
    };
    if (route === 'session') {
        const session = await verify(readCookie(request, SESSION), cfg, 'session');
        const user = session?.user;
        if (!user || !/^\d{17,20}$/.test(user.id || '')) return json({ available: true, user: null });
        if (env.DB && !await env.DB.prepare('SELECT token_hash FROM discord_sessions WHERE token_hash = ? AND expires_at > ?').bind(await hash(readCookie(request, SESSION)), Date.now()).first()) return json({ available: true, user: null });
        return json({ available: true, user: { id: user.id, name: user.name, avatar: user.avatar }, admin: isAdminUser(user, env) });
    }
    if (route === 'logout') {
        if (request.headers.get('origin') !== cfg.origin) return json({ error: 'Origine non autorisée.' }, 403);
        if (env.DB) await env.DB.prepare('DELETE FROM discord_sessions WHERE token_hash = ?').bind(await hash(readCookie(request, SESSION))).run();
        const response = json({ user: null });
        response.headers.append('Set-Cookie', cookie(SESSION, '', cfg, 0));
        response.headers.append('Set-Cookie', cookie(STATE, '', cfg, 0));
        return response;
    }
    if (route === 'login') {
        const state = base64(crypto.getRandomValues(new Uint8Array(32)));
        const stateCookie = await sign({ v: 1, state, exp: Date.now() + 600000 }, cfg, 'oauth');
        if (env.DB) await env.DB.batch([
            env.DB.prepare('DELETE FROM discord_oauth_states WHERE expires_at <= ?').bind(Date.now()),
            env.DB.prepare('DELETE FROM discord_sessions WHERE expires_at <= ?').bind(Date.now()),
            env.DB.prepare('INSERT INTO discord_oauth_states (state_hash, expires_at) VALUES (?, ?)').bind(await hash(state), Date.now() + 600000)
        ]);
        const target = new URL('https://discord.com/oauth2/authorize');
        target.search = new URLSearchParams({ client_id: cfg.clientId, redirect_uri: `${cfg.origin}/api/auth/callback`, response_type: 'code', scope: 'identify', state }).toString();
        return redirect(target.href, [cookie(STATE, stateCookie, cfg, 600)]);
    }
    const pending = await verify(readCookie(request, STATE), cfg, 'oauth');
    if (!pending || !pending.state || pending.state !== url.searchParams.get('state')) return fail('state');
    if (env.DB && !await env.DB.prepare('DELETE FROM discord_oauth_states WHERE state_hash = ? AND expires_at > ? RETURNING state_hash').bind(await hash(pending.state), Date.now()).first()) return fail('state');
    if (url.searchParams.has('error')) return fail('cancelled');
    const code = url.searchParams.get('code');
    if (!code || code.length > 2048) return fail('discord');
    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ client_id: cfg.clientId, client_secret: cfg.clientSecret, grant_type: 'authorization_code', code, redirect_uri: `${cfg.origin}/api/auth/callback` }),
            signal: AbortSignal.timeout(10000)
        });
        if (!tokenResponse.ok) return fail('discord');
        const token = await tokenResponse.json();
        if (!token.access_token || token.token_type?.toLowerCase() !== 'bearer') return fail('discord');
        const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(10000)
        });
        if (!userResponse.ok) return fail('discord');
        const user = await userResponse.json();
        if (!/^\d{17,20}$/.test(user.id || '')) return fail('discord');
        const identity = { id: user.id, name: String(user.global_name || user.username || 'Membre Discord').slice(0, 80), avatar: avatar(user) };
        const expires = Date.now() + SESSION_SECONDS * 1000;
        const session = await sign({ v: 1, exp: expires, nonce: base64(crypto.getRandomValues(new Uint8Array(32))), user: identity }, cfg, 'session');
        if (env.DB) await env.DB.batch([
            env.DB.prepare('INSERT INTO discord_users (id, display_name, avatar, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name, avatar=excluded.avatar, updated_at=excluded.updated_at').bind(identity.id, identity.name, identity.avatar, Date.now()),
            env.DB.prepare('INSERT INTO discord_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(await hash(session), identity.id, expires)
        ]);
        // OAuth access and refresh tokens are never sent to the browser or saved.
        return redirect(account.href, [cookie(STATE, '', cfg, 0), cookie(SESSION, session, cfg, SESSION_SECONDS)]);
    } catch { return fail('discord'); }
}
