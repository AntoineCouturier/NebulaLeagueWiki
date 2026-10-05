import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { DatabaseSync } from 'node:sqlite';
import { extractSeed, transformData } from '../scripts/league-source.mjs';
import auth from '../server/discord-auth.mjs';

const source = readFileSync('JavaScript/nebula-data.js', 'utf8');
const seed = extractSeed(source);
function registry(script, bootstrap) {
  const window = { NEBULA_BOOTSTRAP: bootstrap, dispatchEvent() {} };
  vm.runInNewContext(script, { window, URL, CustomEvent: class {}, document: { currentScript: { src: 'https://nebula.example/JavaScript/nebula-data.js' }, querySelectorAll: () => [] }, localStorage: { getItem: () => null }, fetch: async () => ({ ok: false }) });
  return window.NEBULA_DATA;
}
const plain = value => JSON.parse(JSON.stringify(value));
test('D1 bootstrap preserves original fixtures, missing ratings, values and trophies', () => {
  const before = registry(source), after = registry(transformData(source), seed);
  for (const key of ['clubs', 'players', 'matches', 'fixtures', 'seasons']) assert.deepEqual(plain(after[key]), plain(before[key]));
  assert.equal(after.players.length, 11);
  assert.equal(after.matches.length, 0);
  for (const player of before.players) {
    assert.equal(after.getPlayerMarketValue(player.name), before.getPlayerMarketValue(player.name));
    assert.deepEqual(plain(after.getPlayerTrophyCounts(player.name)), plain(before.getPlayerTrophyCounts(player.name)));
  }
});
test('migrated registry reads database changes instead of compiled player data', () => {
  const changed = structuredClone(seed);
  changed.players[0].technical.tir = 95;
  const data = registry(transformData(source), changed);
  assert.equal(data.players[0].technical.tir, 95);
  assert.equal(data.players[0].href.startsWith('https://nebula.example/Joueurs/'), true);
});
test('SQL seed imports real data and never overwrites existing database edits', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync('db/migrations/0001_accounts.sql', 'utf8'));
  const sql = readFileSync('db/seed.sql', 'utf8'); db.exec(sql);
  assert.equal(JSON.parse(db.prepare("SELECT data FROM league_data WHERE key='players'").get().data).length, 11);
  db.prepare("UPDATE league_data SET data='[]' WHERE key='matches'").run(); db.exec(sql);
  assert.equal(db.prepare("SELECT data FROM league_data WHERE key='matches'").get().data, '[]');
  db.close();
});
test('D1 OAuth consumes state once and revokes the session on logout', async () => {
  const sql = new DatabaseSync(':memory:'); sql.exec(readFileSync('db/migrations/0001_accounts.sql', 'utf8'));
  const DB = {
    prepare(query) { return { bind(...args) { return { async run() { return sql.prepare(query).run(...args); }, async first() { return sql.prepare(query).get(...args) || null; } }; } }; },
    async batch(statements) { sql.exec('BEGIN'); try { const result = []; for (const statement of statements) result.push(await statement.run()); sql.exec('COMMIT'); return result; } catch (error) { sql.exec('ROLLBACK'); throw error; } }
  };
  const env = { DB, NEBULA_SITE_URL: 'https://nebula.example', DISCORD_CLIENT_ID: '1531381492930969820', DISCORD_CLIENT_SECRET: 'test-only', NEBULA_SESSION_SECRET: 'test-only-secret-at-least-thirty-two-characters' };
  const request = (path, options) => new Request(env.NEBULA_SITE_URL + path, options);
  const cookie = (response, name) => response.headers.getSetCookie().find(value => value.startsWith(name + '='))?.split(';')[0];
  const login = await auth(request('/api/auth/login'), env);
  const state = new URL(login.headers.get('location')).searchParams.get('state');
  const callbackRequest = () => request(`/api/auth/callback?code=test&state=${state}`, { headers: { Cookie: cookie(login, 'nebula_oauth_state') } });
  const original = globalThis.fetch;
  globalThis.fetch = async url => url.endsWith('/token') ? Response.json({ access_token: 'never-persist-this', token_type: 'Bearer' }) : Response.json({ id: '725931972802904115', username: 'Antoine', avatar: null });
  try {
    const callback = await auth(callbackRequest(), env);
    const session = cookie(callback, 'nebula_session'); assert.ok(session);
    assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM discord_users').get().n, 1);
    assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM discord_sessions').get().n, 1);
    assert.equal(new URL((await auth(callbackRequest(), env)).headers.get('location')).searchParams.get('auth'), 'state');
    assert.equal((await (await auth(request('/api/auth/session', { headers: { Cookie: session } }), env)).json()).user.id, '725931972802904115');
    const options = { method: 'POST', headers: { Cookie: session, Origin: env.NEBULA_SITE_URL } };
    await auth(request('/api/auth/logout', options), env);
    assert.equal((await (await auth(request('/api/auth/session', { headers: { Cookie: session } }), env)).json()).user, null);
    assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM discord_sessions').get().n, 0);
  } finally { globalThis.fetch = original; sql.close(); }
});
