"""API tests: python -m pytest server/tests (run from the repo root)."""

import importlib
import json
import sys
import pathlib

import pytest
from fastapi.testclient import TestClient

SERVER = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVER))

W = {"X-KLA": "1"}


@pytest.fixture()
def client(tmp_path, monkeypatch):
    www = tmp_path / "www"
    (www / "apps" / "music-melodies").mkdir(parents=True)
    (www / "index.html").write_text("start", encoding="utf-8")
    (www / "apps" / "music-melodies" / "index.html").write_text("music", encoding="utf-8")
    (www / "secret.txt").write_text("no", encoding="utf-8")
    (www / "apps.json").write_text(json.dumps([
        {"id": "music-melodies", "title": "Musik", "school": "Gymnasium"},
        {"id": "peace-city-ride", "title": "Ritt", "school": "Grundschule"},
    ]), encoding="utf-8")
    monkeypatch.setenv("KLA_DB", str(tmp_path / "kla.sqlite3"))
    monkeypatch.setenv("KLA_STATIC_DIR", str(www))
    monkeypatch.setenv("KLA_DEV_PARENT", "Testelternteil")
    import kla.main
    importlib.reload(kla.main)
    return TestClient(kla.main.app)


def make_child(c, name="Tim", school="Gymnasium", code="FUCHS-47"):
    r = c.post("/lernen/api/parent/children", json={"name": name, "school": school, "code": code}, headers=W)
    assert r.status_code == 201, r.text
    return r.json()


def login(c, code="fuchs 47"):
    r = c.post("/lernen/api/login", json={"code": code, "label": "Tablet"})
    assert r.status_code == 200, r.text
    return {"Authorization": "Bearer " + r.json()["token"]}


def state(stars, **extra):
    return {"xp": 10 * sum(stars.values()), "tickets": 1, "levels": {k: {"stars": v} for k, v in stars.items()}, **extra}


def test_static_files_only_build_output(client):
    assert client.get("/lernen/").text == "start"
    assert client.get("/lernen/apps/music-melodies/").text == "music"
    assert client.get("/lernen/secret.txt").status_code == 404
    assert client.get("/lernen/apps.json").status_code == 200


def test_parent_writes_need_header(client):
    r = client.post("/lernen/api/parent/children", json={"name": "Tim", "school": "Gymnasium", "code": "FUCHS47"})
    assert r.status_code == 403


def test_login_codes_unique_and_braked(client):
    make_child(client)
    r = client.post("/lernen/api/parent/children", json={"name": "Lena", "school": "Grundschule", "code": "fuchs47"}, headers=W)
    assert r.status_code == 409
    for _ in range(10):
        assert client.post("/lernen/api/login", json={"code": "falsch"}).status_code == 401
    assert client.post("/lernen/api/login", json={"code": "FUCHS-47"}).status_code == 429


def test_me_lists_own_apps(client):
    make_child(client)
    h = login(client)
    me = client.get("/lernen/api/me", headers=h).json()
    assert me["child"]["name"] == "Tim"
    assert [a["id"] for a in me["apps"]] == ["music-melodies"]
    assert client.get("/lernen/api/me").status_code == 401


def test_sync_merges_two_devices(client):
    make_child(client)
    a, b = login(client), login(client)
    url = "/lernen/api/apps/music-melodies/state"
    s0 = client.get(url, headers=a).json()
    assert s0["state"] is None and s0["epoch"] == 1
    r1 = client.put(url, headers=a, json={"epoch": 1, "rev": s0["rev"], "state": state({"notes:1": 3})}).json()
    assert r1["status"] == "saved"
    # Device b still has the old revision and different progress: both are kept.
    r2 = client.put(url, headers=b, json={"epoch": 1, "rev": s0["rev"], "state": state({"notes:2": 2})}).json()
    assert r2["status"] == "merged"
    assert r2["state"]["levels"] == {"notes:1": {"stars": 3}, "notes:2": {"stars": 2}}


def test_playtime_only_for_marked_apps_new_stars_and_capped(client):
    child = make_child(client)
    h = login(client)
    url = "/lernen/api/apps/music-melodies/state"
    r = client.put(url, headers=h, json={"epoch": 1, "rev": 0, "state": state({"notes:1": 2})}).json()
    assert r["earned"] == 0  # app not marked yet, but the stars count as reached
    client.patch(f"/lernen/api/parent/children/{child['id']}/apps/music-melodies", json={"earnsPlaytime": True}, headers=W)
    r = client.put(url, headers=h, json={"epoch": 1, "rev": r["rev"], "state": state({"notes:1": 3, "notes:2": 3})}).json()
    assert r["earned"] == 4 and r["playtime"]["balance"] == 4
    # Replaying earns nothing.
    r = client.put(url, headers=h, json={"epoch": 1, "rev": r["rev"], "state": state({"notes:1": 3, "notes:2": 3})}).json()
    assert r["earned"] == 0
    # The daily cap holds.
    client.patch(f"/lernen/api/parent/children/{child['id']}", json={"playtimeCap": 6}, headers=W)
    big = {f"x:{i}": 3 for i in range(10)}
    r = client.put(url, headers=h, json={"epoch": 1, "rev": r["rev"], "state": state(big)}).json()
    assert r["earned"] == 2 and r["playtime"]["leftToday"] == 0
    # Parents redeem minutes, but not more than there are.
    assert client.post(f"/lernen/api/parent/children/{child['id']}/playtime", json={"minutes": -10}, headers=W).status_code == 409
    p = client.post(f"/lernen/api/parent/children/{child['id']}/playtime", json={"minutes": -5, "note": "Netflix"}, headers=W).json()
    assert p["balance"] == 1


def test_reset_drops_old_device_state_and_stars_do_not_pay_twice(client):
    child = make_child(client)
    h = login(client)
    client.patch(f"/lernen/api/parent/children/{child['id']}/apps/music-melodies", json={"earnsPlaytime": True}, headers=W)
    url = "/lernen/api/apps/music-melodies/state"
    r = client.put(url, headers=h, json={"epoch": 1, "rev": 0, "state": state({"notes:1": 3})}).json()
    assert r["earned"] == 3
    client.post(f"/lernen/api/parent/children/{child['id']}/apps/music-melodies/reset", headers=W)
    r = client.put(url, headers=h, json={"epoch": 1, "rev": r["rev"], "state": state({"notes:1": 3})}).json()
    assert r["status"] == "reset" and r["epoch"] == 2 and r["state"] is None
    r = client.put(url, headers=h, json={"epoch": 2, "rev": r["rev"], "state": state({"notes:1": 3})}).json()
    assert r["status"] == "saved" and r["earned"] == 0


def test_tickets_arrive_as_op_and_are_acknowledged(client):
    child = make_child(client)
    h = login(client)
    client.post(f"/lernen/api/parent/children/{child['id']}/apps/music-melodies/tickets", json={"n": 2}, headers=W)
    s = client.get("/lernen/api/apps/music-melodies/state", headers=h).json()
    assert s["ops"][0]["kind"] == "tickets" and s["ops"][0]["data"] == {"n": 2}
    r = client.put("/lernen/api/apps/music-melodies/state", headers=h,
                   json={"epoch": 1, "rev": s["rev"], "state": state({}), "ackOps": [s["ops"][0]["id"]]}).json()
    assert r["ops"] == []


def test_events_day_view_exam_bonus_and_delete(client):
    child = make_child(client)
    h = login(client)
    client.patch(f"/lernen/api/parent/children/{child['id']}/apps/music-melodies", json={"earnsPlaytime": True}, headers=W)
    evs = [
        {"id": "e1", "app": "music-melodies", "ts": "2026-11-20T15:00:00+01:00", "kind": "active", "data": {"sec": 60, "mode": "learn"}},
        {"id": "e2", "app": "music-melodies", "ts": "2026-11-20T15:01:00+01:00", "kind": "active", "data": {"sec": 45, "mode": "game"}},
        {"id": "e3", "app": "music-melodies", "ts": "2026-11-20T15:02:00+01:00", "kind": "level", "data": {"title": "Töne im System", "stars": 3, "wrong": ["d''"]}},
        {"id": "e4", "app": "music-melodies", "ts": "2026-11-20T15:20:00+01:00", "kind": "exam", "data": {"grade": "2"}},
        {"id": "e5", "app": "music-melodies", "ts": "2026-11-20T15:40:00+01:00", "kind": "exam", "data": {"grade": "1"}},
    ]
    r = client.post("/lernen/api/events", headers=h, json={"events": evs}).json()
    assert r["stored"] == 5 and r["earned"] == 5  # exam bonus once per app and day
    assert client.post("/lernen/api/events", headers=h, json={"events": evs}).json()["stored"] == 0  # idempotent
    d = client.get(f"/lernen/api/parent/children/{child['id']}/day", params={"date": "2026-11-20"}).json()
    assert d["active"]["music-melodies"] == {"learn": 60, "game": 45}
    assert [e["kind"] for e in d["timeline"]] == ["level", "exam", "exam"]
    assert client.delete(f"/lernen/api/parent/children/{child['id']}/apps/music-melodies/events", headers=W).json()["deleted"] == 5


def test_revoked_device_is_signed_out(client):
    child = make_child(client)
    h = login(client)
    dev = client.get(f"/lernen/api/parent/children/{child['id']}/devices").json()[0]
    client.delete(f"/lernen/api/parent/devices/{dev['id']}", headers=W)
    assert client.get("/lernen/api/me", headers=h).status_code == 401


def test_overview(client):
    make_child(client)
    make_child(client, "Lena", "Grundschule", "EULE-12")
    o = client.get("/lernen/api/parent/overview").json()
    assert [c["name"] for c in o["children"]] == ["Tim", "Lena"]
    assert [a["id"] for a in o["children"][1]["apps"]] == ["peace-city-ride"]


def test_parent_login_through_family_page(client, monkeypatch):
    import kla.main as m
    object.__setattr__(m.settings, "dev_parent", "")
    m._parent_cache.clear()

    class Resp:
        def __init__(self, status, role):
            self.status_code, self.role = status, role

        def json(self):
            return {"user": {"name": "Elternteil", "role": self.role}}

    calls = []
    monkeypatch.setattr(m.httpx, "get", lambda url, headers, timeout: calls.append(headers["cookie"]) or Resp(200, "parent" if "p" in headers["cookie"] else "child"))
    assert client.get("/lernen/api/parent/me").status_code == 401  # no cookie at all
    assert client.get("/lernen/api/parent/me", headers={"cookie": "session=c"}).status_code == 401  # a child account
    assert client.get("/lernen/api/parent/me", headers={"cookie": "session=p"}).json() == {"name": "Elternteil"}
    assert calls == ["session=c", "session=p"]


def test_verify_and_delete_child(client):
    child = make_child(client)
    h = login(client)
    assert client.post("/lernen/api/verify", headers=h, json={"code": "fuchs47"}).json() == {"ok": True}
    assert client.post("/lernen/api/verify", headers=h, json={"code": "eule12"}).status_code == 403
    assert client.delete(f"/lernen/api/parent/children/{child['id']}", headers=W).json() == {"ok": True}
    assert client.get("/lernen/api/me", headers=h).status_code == 401
    assert client.get("/lernen/api/parent/overview").json()["children"] == []
