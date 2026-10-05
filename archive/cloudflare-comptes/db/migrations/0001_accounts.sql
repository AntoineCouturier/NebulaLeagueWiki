CREATE TABLE discord_users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE discord_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES discord_users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX discord_sessions_expiry ON discord_sessions(expires_at);
CREATE TABLE discord_oauth_states (
  state_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);
CREATE TABLE league_data (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK(json_valid(data)),
  updated_at INTEGER NOT NULL
);
