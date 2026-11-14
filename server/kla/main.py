"""HTTP API of the learning platform and the static apps, all below KLA_PREFIX (default /lernen).

Children authenticate with a device token (Authorization: Bearer ...) that they get once
for their personal code. Parents are whoever the family page (same domain) reports as a
signed-in parent; their writes need the header X-KLA: 1 so other sites cannot forge them.
"""

import datetime as dt
import hashlib
import json
import time
from typing import Any

import httpx
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from . import config, progress, security
from .db import Database, dumps, loads

settings = config.load()
db = Database(settings.db_path)
app = FastAPI(title="kids-learn-apps", docs_url=None, redoc_url=None, openapi_url=None)
api = APIRouter(prefix=f"{settings.prefix}/api")

SCHOOLS = ("Gymnasium", "Grundschule", "Kita")


def now() -> dt.datetime:
    return dt.datetime.now(settings.tz)


def today() -> str:
    return now().date().isoformat()


def app_catalog() -> list[dict[str, Any]]:
    """Apps as written by build.py (apps.json next to the start page)."""
    path = settings.static_dir / "apps.json"
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []


# ---------------------------------------------------------------------------
# Children: code login and device tokens
# ---------------------------------------------------------------------------
class LoginIn(BaseModel):
    code: str = Field(min_length=1, max_length=64)
    label: str = Field(default="", max_length=80)


def child_public(child: Any) -> dict[str, Any]:
    return {"id": child["id"], "name": child["name"], "school": child["school"], "requireCode": bool(child["require_code"])}


def find_child_by_code(con, code: str):
    for child in con.execute("SELECT * FROM children"):
        if security.check_code(code, child["code_hash"]):
            return child
    return None


@api.post("/login")
def login(body: LoginIn, request: Request) -> dict[str, Any]:
    key = f"ip:{request.client.host if request.client else '?'}"
    with db.connect() as con:
        if security.too_many_failures(con, key):
            raise HTTPException(429, "Zu viele falsche Codes. Warte eine Viertelstunde.")
        child = find_child_by_code(con, body.code)
        if not child:
            # Recorded and committed before the error, so the brake counts it.
            security.note_failure(con, key)
    if not child:
        raise HTTPException(401, "Diesen Code kenne ich nicht.")
    with db.connect() as con:
        token, token_hash = security.new_token()
        stamp = now().isoformat(timespec="seconds")
        con.execute(
            "INSERT INTO devices (child_id, token_hash, label, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?)",
            (child["id"], token_hash, body.label, stamp, stamp),
        )
        return {"token": token, "child": child_public(child)}


def current_child(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Bitte melde dich mit deinem Code an.")
    with db.connect() as con:
        row = con.execute(
            "SELECT c.*, d.id AS device_id FROM devices d JOIN children c ON c.id = d.child_id "
            "WHERE d.token_hash = ? AND d.revoked_at IS NULL",
            (security.hash_token(authorization[7:]),),
        ).fetchone()
        if not row:
            raise HTTPException(401, "Dieses Gerät ist abgemeldet. Bitte melde dich neu an.")
        con.execute("UPDATE devices SET last_seen_at = ? WHERE id = ?", (now().isoformat(timespec="seconds"), row["device_id"]))
        return row


class VerifyIn(BaseModel):
    code: str = Field(min_length=1, max_length=64)


@api.post("/verify")
def verify(body: VerifyIn, request: Request, child=Depends(current_child)) -> dict[str, bool]:
    """Checks the code when a child switches to its profile on a shared device."""
    key = f"ip:{request.client.host if request.client else '?'}"
    with db.connect() as con:
        if security.too_many_failures(con, key):
            raise HTTPException(429, "Zu viele falsche Codes. Warte eine Viertelstunde.")
        ok = security.check_code(body.code, child["code_hash"])
        if not ok:
            security.note_failure(con, key)
    if not ok:
        # 403, not 401: the device token is fine, only the code was wrong.
        raise HTTPException(403, "Der Code stimmt nicht.")
    return {"ok": True}


def activity_today(con, child_id: int, app_id: str | None = None) -> dict[str, int]:
    """Seconds of active learning and of reward games today."""
    sql = "SELECT data FROM events WHERE child_id = ? AND day = ? AND kind = 'active'"
    args: list[Any] = [child_id, today()]
    if app_id:
        sql += " AND app_id = ?"
        args.append(app_id)
    out = {"learn": 0, "game": 0}
    for (data,) in con.execute(sql, args):
        d = loads(data) or {}
        mode = "game" if d.get("mode") == "game" else "learn"
        out[mode] += int(d.get("sec") or 0)
    return out


def playtime_info(con, child) -> dict[str, Any]:
    earned = progress.earned_today(con, child["id"], today())
    return {"balance": progress.balance(con, child["id"]), "earnedToday": earned, "cap": child["playtime_cap"],
            "leftToday": max(0, child["playtime_cap"] - earned)}


def app_settings(con, child_id: int, app_id: str) -> dict[str, Any]:
    row = con.execute("SELECT * FROM app_settings WHERE child_id = ? AND app_id = ?", (child_id, app_id)).fetchone()
    return {"locked": bool(row and row["locked"]), "earnsPlaytime": bool(row and row["earns_playtime"]),
            "dailyGoal": row["daily_goal"] if row else None}


def limits(con, child) -> dict[str, Any]:
    games = activity_today(con, child["id"])["game"]
    limit = child["game_limit"]
    return {"gameLimitMin": limit, "gameSecToday": games, "gameSecLeft": None if limit is None else max(0, limit * 60 - games)}


@api.get("/me")
def me(child=Depends(current_child)) -> dict[str, Any]:
    with db.connect() as con:
        apps = []
        for a in app_catalog():
            if a.get("school") != child["school"]:
                continue
            st = con.execute("SELECT state FROM app_states WHERE child_id = ? AND app_id = ?", (child["id"], a["id"])).fetchone()
            stars = sum(progress.level_stars(loads(st["state"]) if st else None).values())
            apps.append({**a, **app_settings(con, child["id"], a["id"]), "stars": stars})
        return {"child": child_public(child), "apps": apps, "playtime": playtime_info(con, child), "limits": limits(con, child)}


def pending_ops(con, child_id: int, app_id: str) -> list[dict[str, Any]]:
    return [{"id": r["id"], "kind": r["kind"], "data": loads(r["data"])} for r in con.execute(
        "SELECT * FROM parent_ops WHERE child_id = ? AND app_id = ? AND applied_at IS NULL ORDER BY id", (child_id, app_id))]


def state_row(con, child_id: int, app_id: str):
    row = con.execute("SELECT * FROM app_states WHERE child_id = ? AND app_id = ?", (child_id, app_id)).fetchone()
    if row:
        return row
    con.execute("INSERT INTO app_states (child_id, app_id, updated_at) VALUES (?, ?, ?)", (child_id, app_id, now().isoformat(timespec="seconds")))
    return con.execute("SELECT * FROM app_states WHERE child_id = ? AND app_id = ?", (child_id, app_id)).fetchone()


def app_payload(con, child, app_id: str, row) -> dict[str, Any]:
    return {"epoch": row["epoch"], "rev": row["rev"], "settings": app_settings(con, child["id"], app_id),
            "ops": pending_ops(con, child["id"], app_id), "playtime": playtime_info(con, child), "limits": limits(con, child)}


@api.get("/apps/{app_id}/state")
def get_state(app_id: str, child=Depends(current_child)) -> dict[str, Any]:
    with db.connect() as con:
        row = state_row(con, child["id"], app_id)
        return {**app_payload(con, child, app_id, row), "state": loads(row["state"])}


class StateIn(BaseModel):
    epoch: int
    rev: int
    state: dict[str, Any]
    ackOps: list[int] = []


@api.put("/apps/{app_id}/state")
def put_state(app_id: str, body: StateIn, child=Depends(current_child)) -> dict[str, Any]:
    """Saves a device's state. If the server moved on meanwhile (another device, a parent
    action), both are merged and the merged state comes back for the device to adopt.
    A state from before a reset is dropped and the device gets the fresh one."""
    with db.connect() as con:
        if len(dumps(body.state)) > 2_000_000:
            raise HTTPException(413, "Spielstand zu groß.")
        for op_id in body.ackOps:
            con.execute("UPDATE parent_ops SET applied_at = ? WHERE id = ? AND child_id = ? AND applied_at IS NULL",
                        (now().isoformat(timespec="seconds"), op_id, child["id"]))
        row = state_row(con, child["id"], app_id)
        if body.epoch != row["epoch"]:
            return {**app_payload(con, child, app_id, row), "status": "reset", "state": loads(row["state"]), "earned": 0}
        server_state = loads(row["state"])
        if body.rev == row["rev"] or server_state is None:
            merged, status = body.state, "saved"
        else:
            merged, status = progress.merge(server_state, body.state), "merged"
        con.execute("UPDATE app_states SET state = ?, rev = rev + 1, updated_at = ? WHERE child_id = ? AND app_id = ?",
                    (dumps(merged), now().isoformat(timespec="seconds"), child["id"], app_id))
        earned = progress.award_new_stars(con, child, app_id, merged, now())
        row = state_row(con, child["id"], app_id)
        return {**app_payload(con, child, app_id, row), "status": status, "state": merged if status == "merged" else None, "earned": earned}


class EventIn(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    app: str = Field(min_length=1, max_length=64)
    ts: str
    kind: str = Field(pattern="^(active|level|exam|trainer|game)$")
    data: dict[str, Any] = {}


class EventsIn(BaseModel):
    events: list[EventIn] = Field(max_length=500)


@api.post("/events")
def post_events(body: EventsIn, child=Depends(current_child)) -> dict[str, Any]:
    stored, earned = 0, 0
    with db.connect() as con:
        for ev in body.events:
            try:
                ts = dt.datetime.fromisoformat(ev.ts.replace("Z", "+00:00")).astimezone(settings.tz)
            except ValueError:
                ts = now()
            cur = con.execute(
                "INSERT OR IGNORE INTO events (child_id, app_id, client_id, ts, day, kind, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (child["id"], ev.app, ev.id, ts.isoformat(timespec="seconds"), ts.date().isoformat(), ev.kind, dumps(ev.data)),
            )
            if cur.rowcount:
                stored += 1
                if ev.kind == "exam":
                    earned += progress.award_exam(con, child, ev.app, ev.data.get("grade"), ts)
        return {"stored": stored, "earned": earned, "playtime": playtime_info(con, child), "limits": limits(con, child)}


# ---------------------------------------------------------------------------
# Parents: signed in through the family page
# ---------------------------------------------------------------------------
_parent_cache: dict[str, tuple[float, str | None]] = {}


def current_parent(request: Request) -> str:
    if settings.dev_parent:
        return settings.dev_parent
    cookie = request.headers.get("cookie", "")
    if not cookie:
        raise HTTPException(401, "Bitte melde dich auf der Familienseite an.")
    key = hashlib.sha256(cookie.encode()).hexdigest()
    hit = _parent_cache.get(key)
    if hit and hit[0] > time.time():
        name = hit[1]
    else:
        name = None
        try:
            r = httpx.get(settings.family_me_url, headers={"cookie": cookie}, timeout=5)
            if r.status_code == 200:
                user = r.json().get("user") or {}
                if user.get("role") == "parent":
                    name = user.get("name") or "Elternteil"
        except (httpx.HTTPError, ValueError):
            raise HTTPException(503, "Die Familienseite antwortet gerade nicht.")
        _parent_cache[key] = (time.time() + 60, name)
    if not name:
        raise HTTPException(401, "Nur für Eltern: Bitte melde dich auf der Familienseite an.")
    return name


def parent_write(request: Request, parent: str = Depends(current_parent)) -> str:
    if request.headers.get("x-kla") != "1":
        raise HTTPException(403, "Fehlender Schutz-Header.")
    return parent


def get_child(con, child_id: int):
    child = con.execute("SELECT * FROM children WHERE id = ?", (child_id,)).fetchone()
    if not child:
        raise HTTPException(404, "Kind nicht gefunden.")
    return child


def code_taken(con, code: str, except_id: int | None = None) -> bool:
    other = find_child_by_code(con, code)
    return bool(other and other["id"] != except_id)


def child_admin(con, child) -> dict[str, Any]:
    return {**child_public(child), "playtimeCap": child["playtime_cap"], "playtimePerStar": child["playtime_per_star"],
            "gameLimit": child["game_limit"], "playtime": playtime_info(con, child), "activity": activity_today(con, child["id"])}


@api.get("/parent/me")
def parent_me(parent: str = Depends(current_parent)) -> dict[str, Any]:
    return {"name": parent}


@api.get("/parent/overview")
def overview(parent: str = Depends(current_parent)) -> dict[str, Any]:
    catalog = app_catalog()
    with db.connect() as con:
        children = []
        for child in con.execute("SELECT * FROM children ORDER BY id").fetchall():
            apps = []
            for a in catalog:
                row = con.execute("SELECT * FROM app_states WHERE child_id = ? AND app_id = ?", (child["id"], a["id"])).fetchone()
                state = loads(row["state"]) if row else None
                if a.get("school") != child["school"] and state is None:
                    continue
                act = activity_today(con, child["id"], a["id"])
                apps.append({**a, **app_settings(con, child["id"], a["id"]), "stars": sum(progress.level_stars(state).values()),
                             "xp": (state or {}).get("xp", 0), "mistakes": len((state or {}).get("mistakes") or {}),
                             "examBest": (state or {}).get("examBest"), "updatedAt": row["updated_at"] if row and state else None,
                             "learnSecToday": act["learn"], "gameSecToday": act["game"]})
            children.append({**child_admin(con, child), "apps": apps})
        return {"parent": parent, "today": today(), "children": children}


class ChildIn(BaseModel):
    name: str = Field(min_length=1, max_length=40)
    school: str
    code: str = Field(min_length=4, max_length=64)


@api.post("/parent/children", status_code=201)
def create_child(body: ChildIn, parent: str = Depends(parent_write)) -> dict[str, Any]:
    if body.school not in SCHOOLS:
        raise HTTPException(422, "Unbekannte Schulart.")
    if len(security.normalize_code(body.code)) < 4:
        raise HTTPException(422, "Der Code braucht mindestens 4 Buchstaben oder Ziffern.")
    with db.connect() as con:
        if con.execute("SELECT 1 FROM children WHERE name = ?", (body.name.strip(),)).fetchone():
            raise HTTPException(409, "Ein Kind mit diesem Namen gibt es schon.")
        if code_taken(con, body.code):
            raise HTTPException(409, "Diesen Code hat schon ein anderes Kind.")
        cur = con.execute("INSERT INTO children (name, school, code_hash, created_at) VALUES (?, ?, ?, ?)",
                          (body.name.strip(), body.school, security.hash_code(body.code), now().isoformat(timespec="seconds")))
        return child_admin(con, get_child(con, cur.lastrowid))


class ChildPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=40)
    school: str | None = None
    code: str | None = Field(default=None, min_length=4, max_length=64)
    requireCode: bool | None = None
    playtimeCap: int | None = Field(default=None, ge=0, le=600)
    playtimePerStar: int | None = Field(default=None, ge=0, le=10)
    gameLimit: int | None = Field(default=None, ge=0, le=600)
    clearGameLimit: bool = False


@api.patch("/parent/children/{child_id}")
def patch_child(child_id: int, body: ChildPatch, parent: str = Depends(parent_write)) -> dict[str, Any]:
    with db.connect() as con:
        get_child(con, child_id)
        if body.school is not None and body.school not in SCHOOLS:
            raise HTTPException(422, "Unbekannte Schulart.")
        if body.code is not None:
            if len(security.normalize_code(body.code)) < 4:
                raise HTTPException(422, "Der Code braucht mindestens 4 Buchstaben oder Ziffern.")
            if code_taken(con, body.code, child_id):
                raise HTTPException(409, "Diesen Code hat schon ein anderes Kind.")
            con.execute("UPDATE children SET code_hash = ? WHERE id = ?", (security.hash_code(body.code), child_id))
        fields = {"name": body.name, "school": body.school, "require_code": None if body.requireCode is None else int(body.requireCode),
                  "playtime_cap": body.playtimeCap, "playtime_per_star": body.playtimePerStar, "game_limit": body.gameLimit}
        for col, value in fields.items():
            if value is not None:
                con.execute(f"UPDATE children SET {col} = ? WHERE id = ?", (value, child_id))
        if body.clearGameLimit:
            con.execute("UPDATE children SET game_limit = NULL WHERE id = ?", (child_id,))
        return child_admin(con, get_child(con, child_id))


@api.delete("/parent/children/{child_id}")
def delete_child(child_id: int, parent: str = Depends(parent_write)) -> dict[str, bool]:
    """Removes a child with all its devices, progress, day log and play time."""
    with db.connect() as con:
        get_child(con, child_id)
        con.execute("DELETE FROM children WHERE id = ?", (child_id,))
    return {"ok": True}


@api.get("/parent/children/{child_id}/devices")
def devices(child_id: int, parent: str = Depends(current_parent)) -> list[dict[str, Any]]:
    with db.connect() as con:
        get_child(con, child_id)
        return [{"id": r["id"], "label": r["label"], "createdAt": r["created_at"], "lastSeenAt": r["last_seen_at"]}
                for r in con.execute("SELECT * FROM devices WHERE child_id = ? AND revoked_at IS NULL ORDER BY last_seen_at DESC", (child_id,))]


@api.delete("/parent/devices/{device_id}")
def revoke_device(device_id: int, parent: str = Depends(parent_write)) -> dict[str, bool]:
    with db.connect() as con:
        con.execute("UPDATE devices SET revoked_at = ? WHERE id = ?", (now().isoformat(timespec="seconds"), device_id))
    return {"ok": True}


class AppPatch(BaseModel):
    locked: bool | None = None
    earnsPlaytime: bool | None = None
    dailyGoal: int | None = Field(default=None, ge=10, le=5000)
    clearDailyGoal: bool = False


@api.patch("/parent/children/{child_id}/apps/{app_id}")
def patch_app(child_id: int, app_id: str, body: AppPatch, parent: str = Depends(parent_write)) -> dict[str, Any]:
    with db.connect() as con:
        get_child(con, child_id)
        con.execute("INSERT OR IGNORE INTO app_settings (child_id, app_id) VALUES (?, ?)", (child_id, app_id))
        for col, value in {"locked": body.locked, "earns_playtime": body.earnsPlaytime, "daily_goal": body.dailyGoal}.items():
            if value is not None:
                con.execute(f"UPDATE app_settings SET {col} = ? WHERE child_id = ? AND app_id = ?", (int(value), child_id, app_id))
        if body.clearDailyGoal:
            con.execute("UPDATE app_settings SET daily_goal = NULL WHERE child_id = ? AND app_id = ?", (child_id, app_id))
        return app_settings(con, child_id, app_id)


class TicketsIn(BaseModel):
    n: int = Field(ge=1, le=20)


@api.post("/parent/children/{child_id}/apps/{app_id}/tickets")
def give_tickets(child_id: int, app_id: str, body: TicketsIn, parent: str = Depends(parent_write)) -> dict[str, bool]:
    """Tickets reach the app as an order that the device books on its next sync."""
    with db.connect() as con:
        get_child(con, child_id)
        con.execute("INSERT INTO parent_ops (child_id, app_id, kind, data, created_by, created_at) VALUES (?, ?, 'tickets', ?, ?, ?)",
                    (child_id, app_id, dumps({"n": body.n}), parent, now().isoformat(timespec="seconds")))
    return {"ok": True}


@api.post("/parent/children/{child_id}/apps/{app_id}/reset")
def reset_app(child_id: int, app_id: str, parent: str = Depends(parent_write)) -> dict[str, Any]:
    with db.connect() as con:
        get_child(con, child_id)
        state_row(con, child_id, app_id)
        con.execute("UPDATE app_states SET epoch = epoch + 1, rev = 0, state = NULL, updated_at = ? WHERE child_id = ? AND app_id = ?",
                    (now().isoformat(timespec="seconds"), child_id, app_id))
        con.execute("UPDATE parent_ops SET applied_at = ? WHERE child_id = ? AND app_id = ? AND applied_at IS NULL",
                    (now().isoformat(timespec="seconds"), child_id, app_id))
        row = state_row(con, child_id, app_id)
        return {"epoch": row["epoch"]}


@api.delete("/parent/children/{child_id}/apps/{app_id}/events")
def delete_events(child_id: int, app_id: str, parent: str = Depends(parent_write)) -> dict[str, int]:
    with db.connect() as con:
        get_child(con, child_id)
        n = con.execute("DELETE FROM events WHERE child_id = ? AND app_id = ?", (child_id, app_id)).rowcount
        return {"deleted": n}


@api.get("/parent/children/{child_id}/day")
def day_view(child_id: int, date: str | None = None, parent: str = Depends(current_parent)) -> dict[str, Any]:
    """One day of a child: active time per app and mode, and the events in order."""
    day = date or today()
    titles = {a["id"]: a.get("title", a["id"]) for a in app_catalog()}
    with db.connect() as con:
        child = get_child(con, child_id)
        events = [{"ts": r["ts"], "app": r["app_id"], "appTitle": titles.get(r["app_id"], r["app_id"]), "kind": r["kind"], "data": loads(r["data"])}
                  for r in con.execute("SELECT * FROM events WHERE child_id = ? AND day = ? ORDER BY ts, id", (child_id, day))]
        per_app: dict[str, dict[str, int]] = {}
        for ev in events:
            if ev["kind"] == "active":
                slot = per_app.setdefault(ev["app"], {"learn": 0, "game": 0})
                slot["game" if ev["data"].get("mode") == "game" else "learn"] += int(ev["data"].get("sec") or 0)
        play = [dict(r) for r in con.execute(
            "SELECT ts, minutes, reason, app_id, note, by_parent FROM playtime WHERE child_id = ? AND day = ? ORDER BY ts", (child_id, day))]
        return {"child": child_public(child), "day": day, "active": per_app,
                "timeline": [e for e in events if e["kind"] != "active"], "playtime": play}


class PlaytimeIn(BaseModel):
    minutes: int = Field(ge=-600, le=600)
    note: str = Field(default="", max_length=120)


@api.post("/parent/children/{child_id}/playtime")
def adjust_playtime(child_id: int, body: PlaytimeIn, parent: str = Depends(parent_write)) -> dict[str, Any]:
    """Redeem (negative) or grant (positive) play minutes by hand."""
    if body.minutes == 0:
        raise HTTPException(422, "Bitte eine Minutenzahl angeben.")
    with db.connect() as con:
        child = get_child(con, child_id)
        if body.minutes < 0 and progress.balance(con, child_id) + body.minutes < 0:
            raise HTTPException(409, "So viele Minuten sind nicht auf dem Konto.")
        stamp = now()
        con.execute("INSERT INTO playtime (child_id, ts, day, minutes, reason, note, by_parent) VALUES (?, ?, ?, ?, 'parent', ?, ?)",
                    (child_id, stamp.isoformat(timespec="seconds"), stamp.date().isoformat(), body.minutes, body.note, parent))
        return playtime_info(con, child)


@api.get("/parent/children/{child_id}/playtime")
def playtime_log(child_id: int, limit: int = 50, parent: str = Depends(current_parent)) -> list[dict[str, Any]]:
    with db.connect() as con:
        get_child(con, child_id)
        return [dict(r) for r in con.execute(
            "SELECT ts, minutes, reason, app_id, note, by_parent FROM playtime WHERE child_id = ? ORDER BY ts DESC, id DESC LIMIT ?",
            (child_id, max(1, min(limit, 500))))]


@api.get("/health")
def health() -> dict[str, bool]:
    with db.connect() as con:
        con.execute("SELECT 1")
    return {"ok": True}


app.include_router(api)


@app.get(settings.prefix, include_in_schema=False)
def prefix_slash() -> RedirectResponse:
    return RedirectResponse(f"{settings.prefix}/")


class PublicFiles(StaticFiles):
    """Serves only the build output (start page, apps, dashboard), never anything else
    that may sit in the same folder, such as the database or the sources."""

    ALLOWED = ("index.html", "apps.json", "apps/", "eltern/")

    def get_path(self, scope) -> str:
        path = super().get_path(scope)
        rel = path.replace("\\", "/")
        if rel not in (".", "apps", "eltern") and not rel.startswith(self.ALLOWED):
            raise HTTPException(404)
        return path


app.mount(settings.prefix, PublicFiles(directory=settings.static_dir, html=True, check_dir=False), name="static")
