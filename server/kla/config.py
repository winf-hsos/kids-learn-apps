"""Runtime settings, read from environment variables (see server/README.md)."""

import os
import pathlib
from dataclasses import dataclass
from zoneinfo import ZoneInfo

REPO = pathlib.Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class Settings:
    db_path: pathlib.Path
    static_dir: pathlib.Path
    prefix: str
    family_me_url: str
    dev_parent: str
    tz: ZoneInfo


def load() -> Settings:
    get = os.environ.get
    return Settings(
        db_path=pathlib.Path(get("KLA_DB", str(REPO / "server" / "data" / "kla.sqlite3"))),
        static_dir=pathlib.Path(get("KLA_STATIC_DIR", str(REPO))),
        prefix=get("KLA_PREFIX", "/lernen").rstrip("/"),
        # The family page answers GET /api/me for a signed-in browser; parents get the dashboard.
        family_me_url=get("KLA_FAMILY_ME_URL", "http://localhost:8075/api/me"),
        # Local development only: a parent name that is signed in without the family page.
        dev_parent=get("KLA_DEV_PARENT", ""),
        tz=ZoneInfo(get("KLA_TZ", "Europe/Berlin")),
    )
