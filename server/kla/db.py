"""SQLite storage: one connection per request, schema created on start."""

import contextlib
import json
import pathlib
import sqlite3
from typing import Any, Iterator

SCHEMA = """
CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  school TEXT NOT NULL,                 -- 'Gymnasium', 'Grundschule' or 'Kita', matches manifest "school"
  code_hash TEXT NOT NULL,
  require_code INTEGER NOT NULL DEFAULT 1,   -- ask for the code when switching to this profile
  playtime_cap INTEGER NOT NULL DEFAULT 30,  -- earned play minutes per day at most
  playtime_per_star INTEGER NOT NULL DEFAULT 1,
  game_limit INTEGER,                   -- minutes of reward games per day, NULL = no limit
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE TABLE IF NOT EXISTS app_states (
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  epoch INTEGER NOT NULL DEFAULT 1,     -- raised when parents reset the app
  rev INTEGER NOT NULL DEFAULT 0,
  state TEXT,                           -- engine state as JSON, NULL after a reset
  updated_at TEXT NOT NULL,
  PRIMARY KEY (child_id, app_id)
);
CREATE TABLE IF NOT EXISTS app_settings (
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  locked INTEGER NOT NULL DEFAULT 0,
  earns_playtime INTEGER NOT NULL DEFAULT 0,
  daily_goal INTEGER,                   -- XP per day, NULL = app default
  PRIMARY KEY (child_id, app_id)
);
CREATE TABLE IF NOT EXISTS stars_best (
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  level_key TEXT NOT NULL,
  stars INTEGER NOT NULL,
  PRIMARY KEY (child_id, app_id, level_key)
);
CREATE TABLE IF NOT EXISTS parent_ops (
  id INTEGER PRIMARY KEY,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  kind TEXT NOT NULL,                   -- 'tickets'
  data TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  applied_at TEXT
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  ts TEXT NOT NULL,
  day TEXT NOT NULL,
  kind TEXT NOT NULL,                   -- 'active', 'level', 'exam', 'trainer', 'game'
  data TEXT NOT NULL,
  UNIQUE (child_id, client_id)
);
CREATE INDEX IF NOT EXISTS events_day ON events (child_id, day);
CREATE TABLE IF NOT EXISTS playtime (
  id INTEGER PRIMARY KEY,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  ts TEXT NOT NULL,
  day TEXT NOT NULL,
  minutes INTEGER NOT NULL,             -- positive = earned or granted, negative = redeemed
  reason TEXT NOT NULL,                 -- 'stars', 'exam', 'parent'
  app_id TEXT,
  note TEXT NOT NULL DEFAULT '',
  by_parent TEXT
);
CREATE INDEX IF NOT EXISTS playtime_day ON playtime (child_id, day);
CREATE TABLE IF NOT EXISTS login_failures (
  key TEXT NOT NULL,
  ts REAL NOT NULL
);
"""


class Database:
    def __init__(self, path: pathlib.Path):
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        con = sqlite3.connect(self.path)
        con.execute("PRAGMA journal_mode = WAL")
        con.executescript(SCHEMA)
        con.close()

    @contextlib.contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        con = sqlite3.connect(self.path, timeout=10, isolation_level=None)
        con.row_factory = sqlite3.Row
        con.execute("PRAGMA foreign_keys = ON")
        try:
            con.execute("BEGIN IMMEDIATE")
            yield con
            con.execute("COMMIT")
        except BaseException:
            con.execute("ROLLBACK")
            raise
        finally:
            con.close()

    def backup(self, target: pathlib.Path) -> None:
        """Consistent copy of the live database, for the nightly backup."""
        target.parent.mkdir(parents=True, exist_ok=True)
        src = sqlite3.connect(self.path)
        dst = sqlite3.connect(target)
        with dst:
            src.backup(dst)
        src.close()
        dst.close()


def loads(text: str | None) -> Any:
    return json.loads(text) if text else None


def dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
