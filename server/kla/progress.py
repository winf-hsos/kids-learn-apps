"""Merging engine states from several devices and turning new stars into play minutes."""

import datetime as dt
import sqlite3
from typing import Any

EXAM_BONUS = 5        # play minutes for a mock test graded 1 or 2, once per app and day


def merge(server: Any, client: Any) -> Any:
    """Combine two engine states so that no progress is lost.

    Numbers take the larger value (stars, XP, counters), flags stay set once one side
    set them, dictionaries are merged key by key (levels, mistakes, badges, trainer
    cards), and everything else takes the client's newer value.
    """
    if isinstance(server, dict) and isinstance(client, dict):
        out = dict(server)
        for key, value in client.items():
            out[key] = merge(server[key], value) if key in server else value
        return out
    if isinstance(server, bool) and isinstance(client, bool):
        return server or client
    if isinstance(server, (int, float)) and isinstance(client, (int, float)) and not isinstance(server, bool) and not isinstance(client, bool):
        return max(server, client)
    return client


def level_stars(state: Any) -> dict[str, int]:
    levels = state.get("levels") if isinstance(state, dict) else None
    if not isinstance(levels, dict):
        return {}
    out = {}
    for key, value in levels.items():
        stars = value.get("stars") if isinstance(value, dict) else None
        if isinstance(stars, (int, float)) and not isinstance(stars, bool):
            out[str(key)] = int(stars)
    return out


def earned_today(con: sqlite3.Connection, child_id: int, day: str) -> int:
    row = con.execute(
        "SELECT COALESCE(SUM(minutes), 0) FROM playtime WHERE child_id = ? AND day = ? AND reason IN ('stars', 'exam')",
        (child_id, day),
    ).fetchone()
    return int(row[0])


def balance(con: sqlite3.Connection, child_id: int) -> int:
    return int(con.execute("SELECT COALESCE(SUM(minutes), 0) FROM playtime WHERE child_id = ?", (child_id,)).fetchone()[0])


def book(con: sqlite3.Connection, child: sqlite3.Row, app_id: str, minutes: int, reason: str, now: dt.datetime, note: str = "") -> int:
    """Add earned minutes up to the child's daily cap; returns what was actually booked."""
    day = now.date().isoformat()
    room = max(0, child["playtime_cap"] - earned_today(con, child["id"], day))
    minutes = min(minutes, room)
    if minutes > 0:
        con.execute(
            "INSERT INTO playtime (child_id, ts, day, minutes, reason, app_id, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (child["id"], now.isoformat(timespec="seconds"), day, minutes, reason, app_id, note),
        )
    return max(0, minutes)


def earns(con: sqlite3.Connection, child_id: int, app_id: str) -> bool:
    row = con.execute("SELECT earns_playtime FROM app_settings WHERE child_id = ? AND app_id = ?", (child_id, app_id)).fetchone()
    return bool(row and row[0])


def award_new_stars(con: sqlite3.Connection, child: sqlite3.Row, app_id: str, state: Any, now: dt.datetime) -> int:
    """Raise the best-ever stars per level and pay play minutes for stars reached the first time.

    The high-water mark survives a reset, so replaying levels never pays twice. Stars
    in apps that are not marked for play time only move the mark.
    """
    best = {r["level_key"]: r["stars"] for r in con.execute(
        "SELECT level_key, stars FROM stars_best WHERE child_id = ? AND app_id = ?", (child["id"], app_id))}
    new = 0
    for key, stars in level_stars(state).items():
        if stars > best.get(key, 0):
            new += stars - best.get(key, 0)
            con.execute(
                "INSERT INTO stars_best (child_id, app_id, level_key, stars) VALUES (?, ?, ?, ?) "
                "ON CONFLICT (child_id, app_id, level_key) DO UPDATE SET stars = excluded.stars",
                (child["id"], app_id, key, stars),
            )
    if not new or not earns(con, child["id"], app_id):
        return 0
    return book(con, child, app_id, new * child["playtime_per_star"], "stars", now, f"{new} neue Sterne")


def award_exam(con: sqlite3.Connection, child: sqlite3.Row, app_id: str, grade: Any, now: dt.datetime) -> int:
    if str(grade) not in ("1", "2") or not earns(con, child["id"], app_id):
        return 0
    day = now.date().isoformat()
    done = con.execute(
        "SELECT 1 FROM playtime WHERE child_id = ? AND app_id = ? AND day = ? AND reason = 'exam'", (child["id"], app_id, day)
    ).fetchone()
    if done:
        return 0
    return book(con, child, app_id, EXAM_BONUS, "exam", now, f"Probearbeit Note {grade}")
