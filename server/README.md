# Server

Backend of the learning apps, running on Uberspace below `/lernen` next to the family page on the same domain. It serves the built apps (`index.html`, `apps.json`, `apps/`, `eltern/` from `build.py`) and an API for:

- **Children:**
  - log in once per device with their personal code (`POST /api/login`), which gives a device token;
  - re-check the code when switching profiles on a shared device (`POST /api/verify`);
  - see their apps, play-time account and limits (`GET /api/me`).
- **Progress sync:**
  - `GET` and `PUT /api/apps/<id>/state` hold the engine state per child and app;
  - when two devices or a parent action collide, the server merges the states (larger numbers win, dictionaries are merged) and returns the merged state;
  - a parent reset raises the state's epoch, so older device states are dropped.
- **Day log:** `POST /api/events` (kinds `active`, `level`, `exam`, `trainer`, `game`) stores events with idempotent client ids.
- **Play time:**
  - In apps the parents mark, every star reached for the first time earns minutes, and a mock test graded 1 or 2 gives a bonus once per app and day.
  - A daily cap per child applies.
  - The best-ever stars survive resets, so replaying never pays twice.
  - Parents redeem minutes in the dashboard.
- **Parents** (`/api/parent/...`):
  - **Login:** whoever the family page reports as signed in with role `parent` (the server calls its `GET /api/me` with the browser's cookie); writes need the header `X-KLA: 1`.
  - **Children:** create them and manage codes, devices, limits and play time.
  - **Apps:** per app settings (locked, earns play time, daily goal), tickets, reset, deleting the day log.
  - **Views:** the overview and the day view.

## Settings (environment)

| Variable | Default | Meaning |
|---|---|---|
| `KLA_DB` | `server/data/kla.sqlite3` | SQLite database |
| `KLA_STATIC_DIR` | repo root | folder with the build output |
| `KLA_PREFIX` | `/lernen` | URL prefix |
| `KLA_FAMILY_ME_URL` | `http://localhost:8075/api/me` | who is signed in on the family page |
| `KLA_DEV_PARENT` | empty | local development only: treat every request as this parent |
| `KLA_TZ` | `Europe/Berlin` | time zone for days |

## Local run and tests

```
pip install -r server/requirements.txt
cd server && KLA_DB=/tmp/kla-test.sqlite3 KLA_STATIC_DIR=.. KLA_DEV_PARENT=Dev python -m uvicorn kla.main:app --port 8076
python -m pytest server/tests
```

Then open `http://localhost:8076/lernen/eltern/`, create a test child and sign in with its code on `http://localhost:8076/lernen/`.

## Deploy

`KLA_HOST=<ssh alias> tools/deploy.sh` builds, runs the tests, refuses uncommitted changes and ships HEAD (`index.html`, `apps.json`, `apps/`, `eltern/`, `server/`) to the account:

| Path | Content |
|---|---|
| `~/kla/app` | the current release (the previous one stays in `~/kla/release.old`) |
| `~/kla/.venv` | Python environment |
| `~/kla/data/kla.sqlite3` | the database, never touched by a deploy |
| `~/kla/backup` | nightly copies from `kla-backup.timer` (03:30, the newest 14 are kept) |

The systemd user units come from `server/deploy/`: `kla.service` runs uvicorn on port 8076, and the web backend `/lernen -> PORT 8076` is added on the first deploy. The family page on `/` (its own service and backend) is not touched.

Children's data lives only in the database on the server, never in this repository.
