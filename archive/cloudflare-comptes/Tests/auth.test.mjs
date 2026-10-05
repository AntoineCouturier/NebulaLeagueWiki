import test from 'node:test';
import assert from 'node:assert/strict';
import auth from '../server/discord-auth.mjs';

const env = {
    NEBULA_SITE_URL: 'https://nebula.example',
    DISCORD_CLIENT_ID: '123456789012345678',
    DISCORD_CLIENT_SECRET: 'test-only-discord-secret',
    NEBULA_SESSION_SECRET: 'test-only-signing-secret-at-least-32-characters'
};
const req = (path, options) => new Request(env.NEBULA_SITE_URL + path, options);
const valueOf = (response, name) => response.headers.getSetCookie().find(value => value.startsWith(name + '='))?.split(';')[0];

test('unconfigured hosting does not advertise a working login', async () => {
    assert.deepEqual(await (await auth(req('/api/auth/session'), {})).json(), { available: false, user: null });
});
test('login requests identify only and sets a protected state cookie', async () => {
    const response = await auth(req('/api/auth/login'), env);
    const target = new URL(response.headers.get('location'));
    assert.equal(target.origin, 'https://discord.com');
    assert.equal(target.searchParams.get('scope'), 'identify');
    assert.equal(target.searchParams.get('redirect_uri'), env.NEBULA_SITE_URL + '/api/auth/callback');
    assert.match(response.headers.get('set-cookie'), /HttpOnly; SameSite=Lax/);
    assert.match(response.headers.get('set-cookie'), /Secure/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('missing or tampered state fails before calling Discord', async () => {
    const response = await auth(req('/api/auth/callback?code=example&state=forged', { headers: { Cookie: 'nebula_oauth_state=forged' } }), env);
    assert.equal(new URL(response.headers.get('location')).searchParams.get('auth'), 'state');
});
test('OAuth callback creates a session, tampering is rejected and logout clears it', async () => {
    const login = await auth(req('/api/auth/login'), env);
    const state = new URL(login.headers.get('location')).searchParams.get('state');
    const stateCookie = valueOf(login, 'nebula_oauth_state');
    const originalFetch = globalThis.fetch;
    const calls = [];
    globalThis.fetch = async (url, options) => {
        calls.push({ url, options });
        return url.endsWith('/token')
            ? Response.json({ access_token: 'private-test-access-token', token_type: 'Bearer', refresh_token: 'private-test-refresh-token' })
            : Response.json({ id: '725931972802904115', global_name: 'Test joueur', username: 'test', avatar: null });
    };
    let callback;
    try {
        callback = await auth(req('/api/auth/callback?code=example&state=' + state, { headers: { Cookie: stateCookie } }), env);
    } finally { globalThis.fetch = originalFetch; }
    assert.equal(calls.length, 2);
    assert.equal(calls[1].options.headers.Authorization, 'Bearer private-test-access-token');
    const sessionCookie = valueOf(callback, 'nebula_session');
    assert.ok(sessionCookie);
    assert.ok(!callback.headers.get('set-cookie').includes('private-test'));
    const sessionResponse = await auth(req('/api/auth/session', { headers: { Cookie: sessionCookie } }), env);
    assert.equal((await sessionResponse.json()).user.id, '725931972802904115');
    const [name, raw] = sessionCookie.split('=');
    const tampered = name + '=' + (raw[0] === 'a' ? 'b' : 'a') + raw.slice(1);
    assert.equal((await (await auth(req('/api/auth/session', { headers: { Cookie: tampered } }), env)).json()).user, null);
    assert.equal((await auth(req('/api/auth/logout', { method: 'POST', headers: { Origin: 'https://other.example' } }), env)).status, 403);
    const logout = await auth(req('/api/auth/logout', { method: 'POST', headers: { Origin: env.NEBULA_SITE_URL } }), env);
    assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
    assert.equal((await logout.json()).user, null);
});
test('OAuth cancellation, wrong methods and noncanonical hosts are handled', async () => {
    const login = await auth(req('/api/auth/login'), env);
    const state = new URL(login.headers.get('location')).searchParams.get('state');
    const response = await auth(req('/api/auth/callback?error=access_denied&state=' + state, { headers: { Cookie: valueOf(login, 'nebula_oauth_state') } }), env);
    assert.equal(new URL(response.headers.get('location')).searchParams.get('auth'), 'cancelled');
    assert.equal((await auth(req('/api/auth/logout'), env)).status, 405);
    assert.equal((await auth(new Request('https://other.example/api/auth/login'), env)).status, 403);
});
