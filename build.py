"""Bundle the start page and every learning app into single HTML files.

Usage: python build.py

Each app lives in src/apps/<id>/ with a manifest.json, its scripts and an
optional styles.css, icon.svg and img/ folder. The build writes
  apps/<id>/index.html   the app: shared core + trivia packs + app files
  apps/<id>/img/         the app's images, copied as they are
  index.html             the start page listing all apps
A manifest may name extra Google Fonts ("fonts") and a cover image for the
start page ("cover", a path inside the app folder such as "img/hero.webp").
Both are plain, dependency-free pages that GitHub Pages serves as they are.
"""
import json
import pathlib
import shutil
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
CORE = SRC / "core"

# Shared scripts before and after the app's own files. The app defines APP,
# which the engine reads when it loads; games/arcade.js must come before the
# engine because the engine builds its game list from GAME_DEFS.
CORE_BEFORE = ["util.js", "icons.js", "fx.js"]
CORE_AFTER = [
    "games/arcade.js", "engine.js", "ui.js", "levels.js", "exam.js", "pages.js",
    "games/runner.js", "games/legion.js", "games/penalty.js", "games/kickups.js", "games/quiz.js", "boot.js",
]
# Apps are grouped by school on the start page; kids' names never appear on the public site.
SCHOOLS = ["Gymnasium", "Grundschule", "Kita"]
BASE_FONTS = ["Atkinson Hyperlegible:wght@400;700", "Dela Gothic One", "Gochi Hand", "Patrick Hand"]


def fonts(extra=()) -> str:
    families = "&".join("family=" + f.replace(" ", "+") for f in [*BASE_FONTS, *extra])
    return (
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        f'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{families}&display=swap">'
    )


def read(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8")


def favicon(icon_svg: str) -> str:
    return '<link rel="icon" href="data:image/svg+xml,' + urllib.parse.quote(icon_svg.strip()) + '">'


def page(title: str, icon: str, css: str, body: str, js: str, extra_fonts: list[str] = ()) -> str:
    if "</script" in js:
        raise SystemExit(f"{title}: a script contains '</script', which would break the page.")
    return (
        '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        f"<title>{title}</title>\n{favicon(icon) if icon else ''}\n{fonts(extra_fonts)}\n"
        f"<style>\n{css}\n</style>\n</head>\n<body>\n{body}\n<script>\n{js}\n</script>\n</body>\n</html>\n"
    )


def load_apps() -> list[dict]:
    apps = []
    for folder in sorted(p for p in (SRC / "apps").iterdir() if p.is_dir()):
        manifest = json.loads(read(folder / "manifest.json"))
        if manifest.get("school") not in SCHOOLS:
            raise SystemExit(f"{folder}: school must be one of {SCHOOLS} (no names, the site is public).")
        if manifest["id"] != folder.name:
            raise SystemExit(f"{folder}: manifest id must match the folder name.")
        icon = folder / "icon.svg"
        apps.append({"dir": folder, "manifest": manifest, "icon": read(icon) if icon.exists() else ""})
    return apps


def build_app(app: dict) -> None:
    m, folder = app["manifest"], app["dir"]
    injected = dict(m, hubUrl="../../")
    for key in ("scripts", "fonts"):
        injected.pop(key, None)
    parts = [read(CORE / f) for f in CORE_BEFORE]
    parts += [read(SRC / "packs" / f"{p}.js") for p in m.get("packs", [])]
    parts.append("const MANIFEST = " + json.dumps(injected, ensure_ascii=False) + ";")
    parts += [read(folder / f) for f in m["scripts"]]
    parts += [read(CORE / f) for f in CORE_AFTER]
    css = read(CORE / "core.css")
    if (folder / "styles.css").exists():
        css += "\n" + read(folder / "styles.css")
    body = read(CORE / "shell.html")
    html = page(m["title"], app["icon"], css, body, "\n\n".join(parts), m.get("fonts", []))
    out = ROOT / "apps" / m["id"] / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    if (folder / "img").is_dir():
        shutil.copytree(folder / "img", out.parent / "img", dirs_exist_ok=True)
    out.write_text(html, encoding="utf-8", newline="\n")
    print(f"wrote {out.relative_to(ROOT)} ({len(html) // 1024} KB)")


def build_hub(apps: list[dict]) -> None:
    listing = []
    for app in apps:
        m = {k: v for k, v in app["manifest"].items() if k not in ("scripts", "packs", "fonts")}
        if m.get("cover"):
            m["cover"] = f"apps/{m['id']}/{m['cover']}"
        listing.append(dict(m, url=f"apps/{m['id']}/", icon=app["icon"].strip()))
    js = "\n\n".join([
        read(CORE / "util.js"),
        read(CORE / "icons.js"),
        "const SCHOOLS = " + json.dumps(SCHOOLS) + ";",
        "const APPS = " + json.dumps(listing, ensure_ascii=False) + ";",
        read(SRC / "hub" / "hub.js"),
    ])
    css = read(CORE / "core.css") + "\n" + read(SRC / "hub" / "hub.css")
    html = page("Lernapps", read(SRC / "hub" / "icon.svg"), css, '<div class="app hub" id="hub"></div>', js)
    (ROOT / "index.html").write_text(html, encoding="utf-8", newline="\n")
    print(f"wrote index.html ({len(html) // 1024} KB, {len(apps)} apps)")


def main() -> None:
    apps = load_apps()
    for app in apps:
        build_app(app)
    build_hub(apps)


if __name__ == "__main__":
    main()
