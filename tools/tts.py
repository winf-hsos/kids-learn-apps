"""Record the learn cards of an app as MP3 files with ElevenLabs, so the app can read them aloud.

Usage:
  python tools/tts.py <app-id> --voice <voice-id> [--dry-run]

The API key comes from the environment variable ELEVENLABS_API_KEY and never
leaves this machine: the script writes plain MP3 files to src/apps/<id>/audio/
plus src/apps/<id>/audio.json, which maps "<world id>/<card index>" to a file.
build.py turns that map into the AUDIO constant and copies the files.

Each file name carries a hash of the spoken text, voice and model, so only
cards whose text changed are recorded again, and files no card uses any more
are deleted. --dry-run prints the spoken texts and the character count
(the cost in ElevenLabs credits) without calling the API.
"""
import argparse
import hashlib
import html
import json
import os
import pathlib
import re
import subprocess
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODEL = "eleven_multilingual_v2"

# Loads the app's own scripts (and its trivia packs) in a sandbox and prints its worlds' learn cards.
NODE_EXTRACT = r"""
const vm = require('vm'), fs = require('fs'), path = require('path');
const [src, appDir] = process.argv.slice(1);
const manifest = JSON.parse(fs.readFileSync(path.join(appDir, 'manifest.json'), 'utf8'));
const ctx = vm.createContext({ console });
const files = [...(manifest.packs || []).map(p => path.join(src, 'packs', p + '.js')), ...manifest.scripts.map(s => path.join(appDir, s))];
vm.runInContext('const MANIFEST = ' + JSON.stringify(manifest) + ';', ctx);
for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
vm.runInContext('globalThis.__cards = JSON.stringify(APP.topics.map(t => ({ id: t.id, learn: t.learn })))', ctx);
process.stdout.write(ctx.__cards);
"""

# Abbreviations a voice would otherwise spell out or misread.
SPOKEN = [
    (r"\bv\. ?Chr\.", "vor Christus"), (r"\bn\. ?Chr\.", "nach Christus"), (r"\bz\. ?B\.", "zum Beispiel"),
    (r"\bd\. ?h\.", "das heißt"), (r"\bu\. ?a\.", "unter anderem"), (r"\bJh\.", "Jahrhundert"), (r"\bJahrh\.", "Jahrhundert"),
    (r"\bca\.", "circa"), (r"\bbzw\.", "beziehungsweise"), (r"\busw\.", "und so weiter"), (r"\bmind\.", "mindestens"),
    (r"\blat\.", "lateinisch"), (r"\b1\.000\.000\b", "eine Million"), (r"\bAbb\.", "Abbildung"), (r"\bNr\.", "Nummer"), (r"\bS\. (?=\d)", "Seite "), (r"\bvgl\.", "vergleiche"),
]
DIGITS = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"]


def clean(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", str(text)).replace("&shy;", "").replace("­", "")
    text = html.unescape(text)
    for pattern, spoken in SPOKEN:
        text = re.sub(pattern, spoken, text)
    # Mnemonics like "7-5-3" are read digit by digit.
    text = re.sub(r"\b(\d)-(\d)-(\d)\b", lambda m: ", ".join(DIGITS[int(d)] for d in m.groups()).capitalize(), text)
    text = text.replace("→", ",").replace("↳", "")
    return re.sub(r"\s+", " ", text).strip()


def sentence(text: str) -> str:
    text = clean(text)
    return text if not text or text[-1] in ".!?…:“\"" else text + "."


def spoken_text(card: dict) -> str:
    """The text a narrator reads for one learn card, from every block the engine can show."""
    parts = [sentence(card["h"])]
    if card.get("p"):
        parts.append(sentence(card["p"]))
    if card.get("table"):
        head = card["table"]["head"]
        for row in card["table"]["rows"]:
            cells = [f"{clean(head[i])}: {clean(cell)}" if clean(head[i]) else clean(cell) for i, cell in enumerate(row)]
            parts.append(sentence(". ".join(cells)))
    for key in ("bullets", "steps"):
        parts += [sentence(x) for x in card.get(key) or []]
    parts += [sentence(f"{x['t']}: {x['d']}") for x in card.get("list") or []]
    if card.get("mindmap"):
        mm = card["mindmap"]
        parts.append(sentence(f"In der Mitte steht: {mm['root']}"))
        for branch in mm["branches"]:
            parts.append(sentence(f"Der Ast {branch['h']}"))
            parts += [sentence(leaf["t"]) for leaf in branch["leaves"]]
    return " ".join(p for p in parts if p)


def record(text: str, voice: str, key: str) -> bytes:
    body = json.dumps({"text": text, "model_id": MODEL, "language_code": "de"}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_64", data=body,
        headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"})
    try:
        return urllib.request.urlopen(req, timeout=300).read()
    except urllib.error.HTTPError as e:
        raise SystemExit(f"ElevenLabs refused the request ({e.code}): {e.read().decode()[:300]}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("app")
    ap.add_argument("--voice", required=True)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    app_dir = ROOT / "src" / "apps" / args.app
    out = subprocess.run(["node", "-e", NODE_EXTRACT, str(ROOT / "src"), str(app_dir)], capture_output=True, text=True, encoding="utf-8")
    if out.returncode:
        raise SystemExit(out.stderr)
    worlds = json.loads(out.stdout)

    audio_dir, index_path = app_dir / "audio", app_dir / "audio.json"
    jobs, index = [], {}
    for world in worlds:
        for i, card in enumerate(world["learn"]):
            text = spoken_text(card)
            digest = hashlib.sha1(f"{MODEL}|{args.voice}|{text}".encode()).hexdigest()[:10]
            name = f"{world['id']}-{i}-{digest}.mp3"
            index[f"{world['id']}/{i}"] = f"audio/{name}"
            if not (audio_dir / name).exists():
                jobs.append((name, text))

    total = sum(len(t) for _, t in jobs)
    print(f"{len(index)} cards, {len(jobs)} to record, {total} characters")
    if args.dry_run:
        for name, text in jobs:
            print(f"\n[{name}]\n{text}")
        return
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        raise SystemExit("Set ELEVENLABS_API_KEY first.")
    audio_dir.mkdir(exist_ok=True)
    for n, (name, text) in enumerate(jobs, 1):
        (audio_dir / name).write_bytes(record(text, args.voice, key))
        print(f"  {n}/{len(jobs)} {name}")
    used = set(pathlib.PurePosixPath(p).name for p in index.values())
    for old in audio_dir.glob("*.mp3"):
        if old.name not in used:
            old.unlink()
            print(f"  removed {old.name}")
    index_path.write_text(json.dumps(index, indent=1) + "\n", encoding="utf-8")
    print(f"wrote {index_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
