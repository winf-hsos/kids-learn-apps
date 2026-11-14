"""Nightly backup: python -m kla.backup (from server/), keeps the newest 14 copies."""

import datetime as dt
import os
import pathlib

from . import config
from .db import Database

KEEP = 14


def main() -> None:
    settings = config.load()
    target_dir = pathlib.Path(os.environ.get("KLA_BACKUP_DIR") or pathlib.Path(settings.db_path).parent.parent / "backup")
    target = target_dir / f"kla-{dt.date.today().isoformat()}.sqlite3"
    Database(settings.db_path).backup(target)
    for old in sorted(target_dir.glob("kla-*.sqlite3"))[:-KEEP]:
        old.unlink()
    print(f"backup written: {target}")


if __name__ == "__main__":
    main()
