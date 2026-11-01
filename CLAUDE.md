# Kids Learn Apps: notes for Claude

Claude builds and maintains all learning apps for Nicolas' kids in this repo. Each app prepares one kid for one concrete school test.

This repo holds only code and is public. Everything private lives in Nicolas' Google Drive under `G:\Meine Ablage\02 - Gemeinsame Unterlagen\Apps\`: the scans of notebooks, textbooks and worksheets, their transcriptions, and `STATUS.md` with the kids, all apps (including older ones not yet moved here), upcoming tests and open questions. **Read that folder's `CLAUDE.md` and `STATUS.md` before working on an app**, and update `STATUS.md` when you finish. The user skill `lernapp` describes the whole workflow from scan to published app.

## Rules

- **Never commit source scans or photos** (PDFs, images of notebooks or textbook pages). The repo is public, the textbooks are copyrighted and the notebooks are private. Only the learning content written into `content.js` goes into the repo. `.gitignore` blocks PDFs, but check images too.
- **Public repo, little personal data:** no surnames, school names, photos or addresses. First names and teachers' names are an open question (see `STATUS.md`); until it is settled, add no new ones beyond what an app already shows.
- **Content follows the kid's material exactly** (terms, order of steps, definitions as taught in class), because the grade depends on it. When the material is ambiguous, ask Nicolas instead of guessing.
- **Code is English, UI is German.** No stakkato sentence chains in UI text (see the global CLAUDE.md).
- **Never change a published app's `storeKey`** or the ids of its worlds and levels' positions: the kids' progress is keyed on them. Append new levels at the end of a world. The chemistry app keeps its legacy key `max-chemie-ka-v1` so Max's progress from the old single-app repo carries over (same origin `winf-hsos.github.io`).
- **Same stack for every app:** vanilla JS in global scripts concatenated by `build.py`, no frameworks, no npm. Shared behavior goes into `src/core/`, never copied into an app. If an app needs something new that others could use (a level type, a game, a trivia pack), build it in core, packs or games and switch it on through `APP`.
- **Built files are committed:** run `python build.py` before every commit, because GitHub Pages serves `index.html` and `apps/*/index.html` from the main branch.

## The kids

Who the kids are, their grades and what they like is recorded in `STATUS.md` in the Drive folder, not here, because this repo is public. Pick reward games, ranks and a trivia pack that fit the kid (new packs go into `src/packs/`). Whether apps should show the kid's name publicly is still an open question there; follow what `STATUS.md` says.

## Architecture

- `build.py` writes one single-file page per app (`apps/<id>/index.html`) and the start page (`index.html`). Script order per app: `core/util.js`, `core/icons.js`, `core/fx.js`, trivia packs, `MANIFEST` (from `manifest.json`), the app's `scripts`, then the rest of core (games registry, engine, UI, levels, exam, pages, games, boot).
- `MANIFEST` holds the facts the start page also needs: `id`, `title`, `kid`, `subject`, `grade`, `about`, `storeKey`, `exam` (`kind`, `date`, `teacher`, `topics`) and `packs`.
- `APP` (in the app's `app.js`) configures the engine: `topics` (worlds with `id`, `title`, `sub`, `art`, `badge`, `learn` cards and `levels`), `art(key)`, `entity(key)` for picture quiz and memory, `ranks`, `games` with star thresholds, `trivia`, `praise`, `exam` (mix of quiz items per world and number of write tasks) and optional extensions: `levelTypes`, `quizTypes`, `learnExtras`, `heroArt`, `xpIcon`, `memoryBack`, `intro`.
- Theme tokens live in `core/core.css` (`--accent`, `--gold`, `--good`, `--bad`, ...). An app can override them in its `styles.css` to get its own color.
- The start page reads `kla:summary:<id>` from `localStorage`, which the engine writes on every save.

## Testing a change

Serve the repo root (`python -m http.server`) and check in the browser: the start page, every level type of the changed app, the mock exam, the mistake box and each reward game, at phone width (375 px) and in light and dark mode, with no console errors.
