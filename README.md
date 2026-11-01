# Kids Learn Apps

Gamified study apps for our kids, built for specific school tests and published with GitHub Pages. The UI is German.

**Live:** https://winf-hsos.github.io/kids-learn-apps/

| App | School | Subject | Link |
| --- | --- | --- | --- |
| Latein-Arena: Klasse 6 – Lektion 2 | Gymnasium | Latin, grade 6 (vocabulary of lesson 2 with accusative and verb forms, conjugation classes) | [apps/latin-lesson-2](https://winf-hsos.github.io/kids-learn-apps/apps/latin-lesson-2/) |
| Chemie-Labor | Gymnasium | Chemistry, grade 6 (lab safety, lab equipment, Bunsen burner, hazardous substances) | [apps/chemistry-lab](https://winf-hsos.github.io/kids-learn-apps/apps/chemistry-lab/) |

## How the apps work

All apps share one engine and one look, so every new app gets the same gamification for free:

- **Learning path** with worlds and levels, up to 3 stars per level, XP, ranks and a daily XP goal with a streak
- **Level types:** learn cards, multiple choice (optionally timed), swipe cards, matching, sorting, ordering, memory, picture quiz, typed short answers (vocabulary, with hints for typical mix-ups) and written answers with keyword feedback; apps can add their own types (the chemistry app adds a burner simulator, a labeling task and a GHS pictogram quiz)
- **Mistake box** that collects wrong answers for repetition, and a **mock exam** with a German school grade
- **Arcade:** tickets earned for new stars, finished worlds, the daily goal and good mock exams unlock reward games (jump & run, penalty-shootout quiz, keepy-uppy, expert trivia quiz)
- **Start page** listing all apps by school (Gymnasium, Grundschule, Kita), with exam countdown and the progress stored on the device

Progress lives in the browser's `localStorage`, one entry per app plus a small summary the start page reads.

## Project layout

```
index.html                 start page (built)
apps/<id>/index.html       one built single-file app per folder
build.py                   bundles everything; run after every change
tools/tts.py               records the learn cards as MP3s for the read-aloud button
src/
  core/                    shared engine, UI, level types, exam, games and styles
    games/                 reward games (arcade.js holds the registry)
  packs/                   trivia packs for the quiz games (football.js)
  hub/                     start page script, styles and icon
  apps/<id>/
    manifest.json          school, subject, exam date, store key, packs, script order
    app.js                 APP config: topics, ranks, games and extensions
    content.js, ...        learning content, artwork and app-specific level types
    styles.css, icon.svg   optional extra styles and the start page icon
    audio/, audio.json     optional recorded learn cards (from tools/tts.py)
```

## Build

```bash
python build.py
```

The pages are plain HTML, CSS and JavaScript without dependencies; only the fonts load from Google Fonts. To try them locally, serve the folder, for example with `python -m http.server`.

## Read-aloud

Learn cards can be read aloud by a narrator voice. The recordings are made once on the maintainer's machine with ElevenLabs, so no API key ever reaches the browser:

```bash
python tools/tts.py <app-id> --voice <voice-id> --dry-run   # spoken texts and credit cost
python tools/tts.py <app-id> --voice <voice-id>             # needs ELEVENLABS_API_KEY
python build.py
```

The tool records only cards whose text changed and removes files that no card uses any more.

## Adding an app

1. Create `src/apps/<id>/` with `manifest.json`, the content scripts and `app.js` (copy the chemistry app as a template).
2. List the scripts in load order under `scripts` in the manifest; `app.js` comes last and defines `APP`.
3. Run `python build.py`; the start page picks the new app up automatically.
