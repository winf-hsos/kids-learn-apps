// App config: wires the question catalogue of "Ritt zur Friedensstadt" into the shared engine
// (see src/core/engine.js) and takes over the progress of the first version of the app.

const lfTag = q => q.lf ? '<span class="lf">Leitfrage</span> ' : '';
TYPE_ICON.ritt = TYPE_ICON.mc;

// One catalogue question as a quiz item of the shared engine.
function rittItem(lv, id, ref) {
  const qq = QUESTION[id]; if (!qq) return null;
  const base = { ref, img: pic(qq.b), x: qq.e ? `<b>Merke:</b> ${qq.e}` : '', hint: qq.t ? { x: qq.t.x, q: qq.t.q, img: pic(qq.t.b) } : null };
  const q = lfTag(qq) + qq.f;
  switch (qq.typ) {
    case 'mc': return mcFrom({ q, o: qq.o, a: 0, x: base.x }, ref, { img: base.img, hint: base.hint });
    case 'jahr': return { ...base, kind: 'type', q, fields: [{ label: 'Jahreszahl', accept: [String(qq.a)], strict: true, numeric: true, sol: String(qq.a) }] };
    case 'wort': return { ...base, kind: 'type', q, fields: [{ label: 'Antwort', accept: qq.a, sol: qq.a[0] }] };
    case 'reihe': return { ...base, kind: 'order', q, items: qq.o };
    case 'paare': return { ...base, kind: 'pairs', q, pairs: qq.p };
    case 'gruppen': return { ...base, kind: 'groups', q, groups: qq.g, items: qq.i };
    case 'luecke': return { ...base, kind: 'cloze', q, s: qq.s, answers: qq.a, o: qq.o };
    case 'mehrfach': return { ...base, kind: 'multi', q, o: qq.o, right: qq.r };
  }
  return null;
}

// The first version stored per question {n, r, w, box, last, tipp} plus Taler and the days played.
// Taler become XP (3 Taler per right answer there, about 10 XP here), a level gets the stars its share
// of questions answered right the last time would earn, and questions last answered wrong go into the
// mistake box.
function convertLegacy(old) {
  const stats = old.fragen || {}, s = { xp: Math.round((old.taler || 0) * 4), levels: {}, mistakes: {}, answered: 0, correct: 0 };
  Object.values(stats).forEach(v => { s.answered += v.n || 0; s.correct += v.r || 0; });
  const placed = new Set();
  TOPICS.forEach(t => t.levels.forEach((lv, l) => {
    if (lv.type !== 'ritt') return;
    const right = lv.ids.filter(id => stats[id] && stats[id].last === true).length, stars = starsFor(right / lv.ids.length);
    if (stars) s.levels[`${t.id}:${l}`] = { stars, best: Math.round(right / lv.ids.length * 100) };
    lv.ids.forEach(id => { if (stats[id] && stats[id].last === false && !placed.has(id)) { placed.add(id); s.mistakes[`${t.id}|${l}|${id}`] = { n: stats[id].w || 1 }; } });
  }));
  // A station already practised counts as read, so its learn cards do not block the way.
  TOPICS.forEach(t => { if (t.levels.some((_, l) => s.levels[`${t.id}:${l}`])) s.levels[`${t.id}:0`] = { stars: 1, best: 100 }; });
  const days = (old.tage || []).slice().sort();
  if (days.length) {
    let n = 1;
    for (let i = days.length - 1; i > 0 && daysUntil(days[i - 1]) === daysUntil(days[i]) - 1; i--) n++;
    s.streak = { last: days[days.length - 1], days: n };
  }
  s.sound = old.ton !== false;
  return s;
}

const APP = {
  topics: TOPICS,
  art: key => ART[key] || '',
  heroArt: () => ART.horse,
  heroImg: 'img/hero.webp',
  quizTypes: { ritt: { keys: lv => lv.ids, item: rittItem } },
  // The mock test mixes questions from every station with two guiding questions to explain (from the probe world).
  exam: { mix: { furt: 2, gruendung: 2, stadtteile: 3, stadtleben: 1, reformation: 2, krieg: 2, frieden: 2, steckenpferd: 2, probe: 0 }, writes: 2, art: 'scroll' },
  intro: { title: 'Ritt zur Friedensstadt', tip: 'Reite Station für Station durch die Geschichte Osnabrücks. Wenn du nicht weiterweißt, hilft dir der Tipp mit einem Satz aus deinen Lesetexten.' },
  games: [{ id: 'kickups', stars: 6 }, { id: 'penalty', stars: 15 }],
  // The penalty game asks the app's own multiple-choice questions, so even the reward repeats the lessons.
  trivia: RITT.fragen.filter(q => q.typ === 'mc' && !q.b).map(q => ({ q: q.f, o: q.o, a: 0, f: q.e || '' })),
  praise: ['Richtig!', 'Super geritten!', 'Klasse!', 'Genau so!', 'Stark!', 'Volltreffer!', 'Prima!', 'Hü hott, richtig!'],
  ranks: [
    { xp: 0, name: 'Neuling' }, { xp: 120, name: 'Marktbesucher' }, { xp: 360, name: 'Bürger' }, { xp: 720, name: 'Ratsherr' },
    { xp: 1200, name: 'Reitender Bote' }, { xp: 1800, name: 'Gesandter' }, { xp: 2600, name: 'Friedensmacher' },
  ],
  legacy: {
    key: 'ritt-friedensstadt-v1', prefix: 'RITT1:',
    decode: code => { const d = JSON.parse(fromB64(code.slice('RITT1:'.length))); return d && d.stand; },
    convert: convertLegacy,
  },
};
