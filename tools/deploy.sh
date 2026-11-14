#!/usr/bin/env bash
# Ship the committed state (HEAD) to Uberspace: the built pages and server/kla.
#   ~/kla/app      this release (index.html, apps.json, apps/, eltern/, server/)
#   ~/kla/.venv    Python environment
#   ~/kla/data     the SQLite database (never touched by a deploy)
#   ~/kla/backup   nightly copies (kla-backup.timer)
# The web backend /lernen -> port 8076 is set up once; the family page on / stays untouched.
# Usage: KLA_HOST=<ssh alias from ~/.ssh/config> tools/deploy.sh   (from Git Bash)
set -euo pipefail
HOST="${KLA_HOST:?Set KLA_HOST to the ssh alias of the Uberspace account.}"
cd "$(dirname "$0")/.."

python build.py > /dev/null
python -m pytest -q server/tests
if ! git diff --quiet HEAD --; then
  echo "Uncommitted changes (or the build changed files): commit first, the deploy ships HEAD." >&2
  exit 1
fi

git archive --format=tar HEAD index.html apps.json apps eltern server \
  | ssh "$HOST" 'set -e; rm -rf ~/kla/release.new; mkdir -p ~/kla/release.new ~/kla/data ~/kla/backup; tar -x -C ~/kla/release.new'

ssh "$HOST" bash -s <<'REMOTE'
set -euo pipefail
cd ~/kla
chmod 700 ~/kla ~/kla/data ~/kla/backup   # children's data: only this account may read it
[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r release.new/server/requirements.txt
mkdir -p ~/.config/systemd/user
cp release.new/server/deploy/kla.service release.new/server/deploy/kla-backup.service release.new/server/deploy/kla-backup.timer ~/.config/systemd/user/
systemctl --user daemon-reload
rm -rf release.old
[ -d app ] && mv app release.old
mv release.new app
systemctl --user enable --now kla-backup.timer > /dev/null
systemctl --user enable kla > /dev/null 2>&1
systemctl --user restart kla
if ! uberspace web backend list | grep -q '/lernen'; then
  uberspace web backend add /lernen PORT 8076
fi
for i in 1 2 3 4 5 6 7 8 9 10; do
  curl -fsS http://localhost:8076/lernen/api/health > /dev/null 2>&1 && break
  sleep 1
done
curl -fsS http://localhost:8076/lernen/api/health && echo
REMOTE
echo "Deployed: the start page is at /lernen/ and the parents' dashboard at /lernen/eltern/ on that host."
