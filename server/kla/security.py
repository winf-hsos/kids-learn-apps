"""Child codes, device tokens and the brake on wrong codes."""

import hashlib
import hmac
import re
import secrets
import time
import sqlite3

MAX_FAILURES = 10          # wrong codes per key ...
FAILURE_WINDOW = 15 * 60   # ... within this many seconds


def normalize_code(code: str) -> str:
    """Codes are compared without case, spaces or dashes, so 'fuchs-47' equals 'FUCHS 47'."""
    return re.sub(r"[^0-9A-ZÄÖÜ]", "", code.upper())


def hash_code(code: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(normalize_code(code).encode(), salt=salt, n=2**14, r=8, p=1, dklen=32)
    return f"scrypt${salt.hex()}${digest.hex()}"


def check_code(code: str, stored: str) -> bool:
    try:
        _, salt, digest = stored.split("$")
    except ValueError:
        return False
    test = hashlib.scrypt(normalize_code(code).encode(), salt=bytes.fromhex(salt), n=2**14, r=8, p=1, dklen=32)
    return hmac.compare_digest(test.hex(), digest)


def new_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    return token, hash_token(token)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def too_many_failures(con: sqlite3.Connection, key: str) -> bool:
    since = time.time() - FAILURE_WINDOW
    con.execute("DELETE FROM login_failures WHERE ts < ?", (since,))
    n = con.execute("SELECT COUNT(*) FROM login_failures WHERE key = ?", (key,)).fetchone()[0]
    return n >= MAX_FAILURES


def note_failure(con: sqlite3.Connection, key: str) -> None:
    con.execute("INSERT INTO login_failures (key, ts) VALUES (?, ?)", (key, time.time()))
