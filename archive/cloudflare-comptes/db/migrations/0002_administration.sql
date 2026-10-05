ALTER TABLE league_data ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;
CREATE TABLE league_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection TEXT NOT NULL,
  revision INTEGER NOT NULL,
  data TEXT NOT NULL CHECK(json_valid(data)),
  actor_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(collection, revision)
);
