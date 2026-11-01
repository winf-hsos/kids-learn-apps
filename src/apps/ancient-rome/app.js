// App config: wires the history content into the shared engine (see src/core/engine.js).
// Content comes from the teacher's checklist, worksheets, the student's notebook and textbook
// pages 106-115. UI text is German on purpose. Quiz items use a: 0 for the right option,
// the engine shuffles the options. Never reorder worlds or levels once published.

const TOPICS = [W_FOUNDING, W_HOUSING, W_LEISURE, W_WORK, W_FAMILIA, W_REPUBLIC, W_SOURCES, W_JUDGEMENT];

// Comparison tables on learn cards: { head: [...], rows: [[...], ...] }.
function tableHtml(t) {
  return `<table class="ctab"><tr>${t.head.map(h => `<th>${h}</th>`).join('')}</tr>${t.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
}

// Mind maps on learn cards: { root, branches: [{ h, leaves: [{ t }] }] }, drawn as a tree that fits a phone.
function mindmapHtml(m) {
  return `<div class="mmap"><div class="mmap-root">${m.root}</div>${m.branches.map((b, i) => `<div class="mmap-branch b${i}"><div class="mmap-h">${b.h}</div><ul>${b.leaves.map(l => `<li>${l.t}</li>`).join('')}</ul></div>`).join('')}</div>`;
}

const APP = {
  topics: TOPICS,
  art: key => ART[key] || '',
  heroArt: () => ART.temple,
  heroImg: 'img/hero.webp',
  learnExtras: c => c.table ? { top: tableHtml(c.table) } : c.mindmap ? { bottom: mindmapHtml(c.mindmap) } : {},
  // The mock test mixes questions from every topic of the checklist with two written tasks.
  exam: { mix: { gruendung: 4, wohnen: 2, freizeit: 3, arbeit: 2, familia: 3, republik: 4, quellen: 2, urteil: 1 }, writes: 2, art: 'tablet' },
  intro: { title: 'Zeitreise ins alte Rom', tip: 'Tipp: Arbeite die Welten der Reihe nach durch, sie folgen der Checkliste für die Klassenarbeit. Am Ende zeigt dir die Probe-Klassenarbeit, ob alles sitzt.' },
  // The learner loves football, so the praise and the reward games lean that way, with a Roman runner first.
  praise: ['Optime!', 'Richtig!', 'Volltreffer!', 'Stark!', 'Genau so!', 'Wie ein Konsul!', 'Tor!', 'Sauber!'],
  trivia: FOOTBALL,
  games: [{ id: 'legion', stars: 5 }, { id: 'penalty', stars: 12 }, { id: 'proquiz', stars: 18 }, { id: 'kickups', stars: 24 }],
  ranks: [
    { xp: 0, name: 'Tourist im Forum' },
    { xp: 150, name: 'Plebejer' },
    { xp: 400, name: 'Quästor' },
    { xp: 800, name: 'Ädil' },
    { xp: 1300, name: 'Prätor' },
    { xp: 2000, name: 'Konsul' },
    { xp: 3000, name: 'Senator mit Purpurstreifen' },
  ],
};
