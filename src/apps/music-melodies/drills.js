// Quiz types of the music app, built on the music module (core/modules/music.js).
// Keys: note names ("g''"), note pairs ("c'-f'"), melody positions ("kumbaya.3"),
// melody lines ("kumbaya@1") and motifs ("m3").

const L = noteLabel;
const sample = (lv, keys) => shuffle(keys).slice(0, lv.n || keys.length);
const uniq = a => [...new Set(a)];
const stepsBetween = (a, b) => { const s = [noteStep(a), noteStep(b)].sort((x, y) => x - y); const out = []; for (let k = s[0]; k <= s[1]; k++) out.push(stepName(k)); return out; };

// Where a note sits in the staff, counted from the bottom like in class.
function positionText(name) {
  const st = noteStep(name), d = st - STEP_E1;
  if (d >= 0 && d <= 8) return d % 2 === 0 ? `auf der ${d / 2 + 1}. Linie von unten` : `im ${(d + 1) / 2}. Zwischenraum von unten`;
  if (d < 0) { const n = Math.ceil(-d / 2); return -d % 2 === 0 ? `auf der ${n}. Hilfslinie unter dem Notensystem` : n === 1 ? 'direkt unter der untersten Linie' : `unter der ${n - 1}. Hilfslinie unter dem Notensystem`; }
  const n = Math.ceil((d - 8) / 2);
  return (d - 8) % 2 === 0 ? `auf der ${n}. Hilfslinie über dem Notensystem` : n === 1 ? 'direkt über der obersten Linie' : `über der ${n - 1}. Hilfslinie über dem Notensystem`;
}
const noteX = name => `${L(name)} sitzt ${positionText(name)}.`;

// --- Notes -----------------------------------------------------------------
function wrongNotes(name, n = 3) {
  const st = noteStep(name), letter = name[0];
  const cands = [st + 7, st - 7, st + 1, st - 1, st + 2, st - 2, st + 3].filter(s => s >= noteStep('f') && s <= noteStep("e'''")).map(stepName);
  const sameLetter = cands.filter(c => c[0] === letter), rest = shuffle(cands.filter(c => c[0] !== letter));
  return uniq([...sameLetter.slice(0, 1), ...rest]).filter(c => c !== name).slice(0, n);
}
function nameMcItem(lv, name, ref) {
  return mcFrom({ q: `Wie heißt dieser Ton?${staffSvg([name], { scale: 2.2, minWidth: 110 })}`, o: [L(name), ...wrongNotes(name).map(L)], a: 0, x: noteX(name) }, ref);
}
function nameTypeItem(lv, name, ref) {
  return { kind: 'type', ref, q: staffSvg([name], { scale: 2.2, minWidth: 110 }), lead: 'Wie heißt dieser Ton? Schreib ihn mit Oktavstrichen, also zum Beispiel c\' oder c\'\'.', x: noteX(name),
    fields: [{ label: 'Tonname', judge: t => judgeNote(t, name), sol: L(name) }] };
}
// Four notes in a row, like the worksheets "Notennamen benennen".
function rowKeys(lv) {
  const out = [];
  for (let k = 0; k < (lv.n || 5); k++) out.push(shuffle(lv.notes).slice(0, 4).join(','));
  return out;
}
function rowItem(lv, key, ref) {
  const names = key.split(',');
  return { kind: 'type', ref, q: staffSvg(names, { above: i => i + 1, even: true }), lead: 'Wie heißen die vier Töne? Schreib die Oktavstriche mit.', x: names.map(noteX).join(' '),
    fields: names.map((n, i) => ({ label: `Ton ${i + 1}`, judge: t => judgeNote(t, n), sol: L(n) })) };
}
function placeItem(lv, name, ref) {
  return { kind: 'staffpick', ref, q: `Notiere den Ton <b>${L(name)}</b> im Violinschlüssel.`, note: name, low: lv.low || 'f', high: lv.high || "d'''", x: noteX(name) };
}

// --- Intervals ---------------------------------------------------------------
function ivKeys(lv) {
  const out = [], pool = lv.notes || XYLO_BARS;
  for (let k = 0; k < (lv.n || 10); k++) {
    let a, b, size;
    do { a = lv.base || pick(pool); b = pick(pool); size = intervalSize(a, b); } while (size > 8 || (lv.sizes && !lv.sizes.includes(size)));
    out.push(`${a}-${b}`);
  }
  return out;
}
const ivPair = key => key.split('-');
function ivExplain(a, b) {
  const tones = stepsBetween(a, b), size = tones.length;
  return `Zähle beide Töne mit: ${tones.map(L).join(' – ')} sind ${size} ${size === 1 ? 'Ton' : 'Töne'}, also ${INTERVAL_COUNT[size - 1]} = <b>${INTERVAL_NAMES[size - 1]}</b>.`;
}
function ivOptions(size) {
  const near = [size - 1, size + 1, size - 2, size + 2].filter(s => s >= 1 && s <= 8);
  return [INTERVAL_NAMES[size - 1], ...shuffle(near.slice(0, 2)).concat(shuffle(near.slice(2))).slice(0, 3).map(s => INTERVAL_NAMES[s - 1])];
}
function ivStaffItem(lv, key, ref) {
  const [a, b] = ivPair(key), size = intervalSize(a, b);
  return mcFrom({ q: `Welches Intervall ist das?${staffSvg([a, b], { scale: 2, minWidth: 140, gap: 46 })}`, o: ivOptions(size), a: 0, x: ivExplain(a, b) }, ref);
}
function ivNamedItem(lv, key, ref) {
  const [a, b] = ivPair(key), size = intervalSize(a, b);
  return mcFrom({ q: `Welches Intervall liegt zwischen <b>${L(a)}</b> und <b>${L(b)}</b>?`, o: ivOptions(size), a: 0, x: ivExplain(a, b) }, ref);
}
function ivTypeItem(lv, key, ref) {
  const [a, b] = ivPair(key), size = intervalSize(a, b), name = INTERVAL_NAMES[size - 1];
  return { kind: 'type', ref, q: staffSvg([a, b], { scale: 2, minWidth: 140, gap: 46, labels: true }), lead: 'Bestimme das Intervall. Zähle beide Töne mit.', x: ivExplain(a, b),
    fields: [{ label: 'Intervall', accept: [name, INTERVAL_COUNT[size - 1]], traps: INTERVAL_NAMES.filter(n => n !== name).map((n, i) => ({ answers: [n], hint: Math.abs(INTERVAL_NAMES.indexOf(n) + 1 - size) === 1 ? 'Knapp daneben: Hast du beide Töne mitgezählt, den unteren und den oberen?' : '' })).filter(t => t.hint), sol: name }] };
}

// --- Melodies ----------------------------------------------------------------
// Where note i of a melody is: its line and its index in that line.
function melodyPos(m, i) {
  let k = i;
  for (let li = 0; li < m.lines.length; li++) { const n = melodyNotes(m.lines[li]).length; if (k < n) return { li, k }; k -= n; }
  return null;
}
// All lines of a melody share one width (like a printed score), so the notes have the same size.
const MELODY_GAP = 30;
const svgWidth = s => +s.match(/viewBox="0 0 ([\d.]+)/)[1];
function melodyCard(m, opts = {}) {
  const lineOpts = li => ({ gap: MELODY_GAP, meter: li === 0 ? m.meter : null, end: li === m.lines.length - 1, close: true, ...(opts.line ? opts.line(li) : {}) });
  const width = Math.max(...m.lines.map((ln, li) => svgWidth(staffSvg(ln, lineOpts(li)))));
  return `<div class="melody-card"><div class="mc-head"><b>${m.title}</b>${melodyBtn(m.src)}</div>${m.lines.map((ln, li) => staffSvg(ln, { ...lineOpts(li), minWidth: width })).join('')}</div>`;
}
const lineCard = (m, li, opts = {}) => `<div class="melody-card one"><div class="mc-head"><b>${m.title}</b>${melodyBtn(m.lines[li], 'Zeile anhören')}</div>${staffSvg(m.lines[li], { gap: MELODY_GAP, meter: li === 0 ? m.meter : null, ...opts })}</div>`;

function moveKeys(lv) {
  const ms = (lv.melodies || MELODY_IDS).map(id => MELODY[id]);
  const out = [];
  for (let k = 0; k < (lv.n || 10); k++) {
    const m = pick(ms); let i;
    do { i = Math.floor(Math.random() * (m.notes.length - 1)); } while (melodyPos(m, i).li !== melodyPos(m, i + 1).li);
    out.push(`${m.id}.${i}`);
  }
  return out;
}
function moveItem(lv, key, ref) {
  const [id, n] = key.split('.'), m = MELODY[id], i = +n; if (!m) return null;
  const p = melodyPos(m, i), kind = m.moves[i], a = m.notes[i], b = m.notes[i + 1];
  const why = { Tw: `${L(a)} und ${L(b)} sind derselbe Ton.`, Ts: `${L(b)} ist der direkte Nachbarton von ${L(a)}.`, Tsp: `Von ${L(a)} nach ${L(b)} werden Töne übersprungen (${stepsBetween(a, b).slice(1, -1).map(L).join(', ')}).` }[kind];
  return mcFrom({ q: `Was liegt zwischen den beiden markierten Tönen?${lineCard(m, p.li, { cls: k => k === p.k || k === p.k + 1 ? 'hi' : '' })}`,
    o: ['Tonwiederholung (Tw)', 'Tonschritt (Ts)', 'Tonsprung (Tsp)'], a: ['Tw', 'Ts', 'Tsp'].indexOf(kind), x: `<b>${MOVE_NAMES[kind]}</b>: ${why}` }, ref);
}
// Like task 1d of the worksheet: mark every step of a line as Tw, Ts or Tsp.
function marksKeys(lv) { return sample(lv, (lv.melodies || MELODY_IDS).flatMap(id => MELODY[id].lines.map((_, li) => `${id}@${li}`))); }
function marksItem(lv, key, ref) {
  const [id, li] = key.split('@'), m = MELODY[id]; if (!m) return null;
  const notes = melodyNotes(m.lines[+li]).slice(0, 6);
  const moves = notes.slice(1).map((nn, i) => moveKind(notes[i], nn));
  return { kind: 'type', ref, q: lineCard(m, +li, { above: i => i < 6 ? i + 1 : '' }), lead: 'Was liegt zwischen den Tönen? Schreib Tw, Ts oder Tsp.', x: `${notes.map(L).join(' – ')}: ${moves.join(', ')}.`,
    fields: moves.map((mv, i) => ({ label: `Ton ${i + 1} → ${i + 2}`, accept: [mv, MOVE_NAMES[mv]], traps: [], strict: false, sol: `${mv} (${MOVE_NAMES[mv]})` })) };
}
function extremeItem(lv, key, ref) {
  const [id, which] = key.split('.'), m = MELODY[id]; if (!m) return null;
  const right = which === 'high' ? m.high : m.low;
  const others = shuffle(m.pool.filter(n => n !== right)).slice(0, 3);
  while (others.length < 3) others.push(stepName(noteStep(right) + (which === 'high' ? -others.length - 1 : others.length + 1)));
  return mcFrom({ q: `Welcher ist der <b>${which === 'high' ? 'höchste' : 'tiefste'}</b> Ton der Melodie?${melodyCard(m, { line: () => ({ cls: () => '' }) })}`, o: [L(right), ...others.map(L)], a: 0,
    x: `Der ${which === 'high' ? 'höchste' : 'tiefste'} Ton ist ${L(right)}, er kommt ${listBars(m.barsOf(right))} vor.` }, ref);
}
function poolItem(lv, id, ref) {
  const m = MELODY[id]; if (!m) return null;
  const all = uniq([...XYLO_BARS, ...m.pool]).sort((a, b) => noteStep(a) - noteStep(b));
  return { kind: 'multi', ref, q: `Welche Töne gehören zum <b>Tonvorrat</b> der Melodie?${melodyCard(m)}`, o: all.map(L), right: all.map((n, i) => m.pool.includes(n) ? i : -1).filter(i => i >= 0),
    x: `Der Tonvorrat sind alle Töne, die in der Melodie vorkommen, jeder nur einmal und von tief nach hoch: ${m.pool.map(L).join(' – ')}.` };
}
function contourItem(lv, id, ref) {
  const m = MELODY[id]; if (!m) return null;
  return mcFrom({ q: `Wie verläuft die Melodie?${melodyCard(m)}`, o: [m.contour, ...shuffle(MELODIES.filter(o => o !== m)).slice(0, 3).map(o => o.contour)], a: 0, x: m.contour }, ref);
}
function startEndItem(lv, key, ref) {
  const [id, which] = key.split('.'), m = MELODY[id]; if (!m) return null;
  const right = which === 'start' ? m.notes[0] : m.notes[m.notes.length - 1];
  const others = shuffle(uniq([...m.pool, ...XYLO_BARS]).filter(n => n !== right)).slice(0, 3);
  return mcFrom({ q: `${which === 'start' ? 'Mit welchem Ton beginnt' : 'Mit welchem Ton endet'} die Melodie?${melodyCard(m)}`, o: [L(right), ...others.map(L)], a: 0,
    x: `Sie ${which === 'start' ? 'beginnt' : 'endet'} mit ${L(right)}${right === m.low ? ', dem tiefsten Ton' : right === m.high ? ', dem höchsten Ton' : ''}.` }, ref);
}
function mostItem(lv, id, ref) {
  const m = MELODY[id]; if (!m) return null;
  const order = Object.entries(m.count).sort((a, b) => b[1] - a[1]);
  if (order[0][1] === order[1][1]) return null;
  return mcFrom({ q: `Woraus besteht die Melodie größtenteils?${melodyCard(m)}`, o: ['aus Tonwiederholungen', 'aus Tonschritten', 'aus Tonsprüngen'], a: ['Tw', 'Ts', 'Tsp'].indexOf(order[0][0]),
    x: `Gezählt: ${m.count.Ts} Tonschritte, ${m.count.Tw} Tonwiederholungen und ${m.count.Tsp} Tonsprünge.` }, ref);
}
// True or false statements about a melody, computed from its analysis.
function factsOf(m) {
  const wrongHigh = stepName(noteStep(m.high) + 1), wrongLow = m.pool[1];
  return [
    [`Der höchste Ton ist ${L(m.high)}.`, true], [`Der höchste Ton ist ${L(wrongHigh)}.`, false],
    [`Der tiefste Ton ist ${L(m.low)}.`, true], [`Der tiefste Ton ist ${L(wrongLow)}.`, false],
    [`Die Melodie beginnt mit ${L(m.notes[0])}.`, true], [`Die Melodie endet mit ${L(m.notes[m.notes.length - 1])}.`, true],
    ['In der Melodie gibt es Tonsprünge.', m.count.Tsp > 0], ['In der Melodie gibt es Tonwiederholungen.', m.count.Tw > 0],
    [`Der Tonvorrat besteht aus ${m.pool.length} Tönen.`, true], [`Der Tonvorrat besteht aus ${m.pool.length + 1} Tönen.`, false],
  ];
}
function factKeys(lv) { return sample(lv, (lv.melodies || MELODY_IDS).flatMap(id => factsOf(MELODY[id]).map((_, k) => `${id}.${k}`))); }
function factItem(lv, key, ref) {
  const [id, k] = key.split('.'), m = MELODY[id]; if (!m) return null;
  const [t, ok] = factsOf(m)[+k];
  return { kind: 'swipe', ref, prompt: `Stimmt das für „${m.title}“?`, yes: 'Stimmt', no: 'Falsch', ok, t: `${t}<div class="swipe-staff">${staffSvg(m.lines[0], { meter: m.meter })}</div>`,
    x: `Tiefster Ton ${L(m.low)}, höchster Ton ${L(m.high)}, Tonvorrat ${m.pool.map(L).join(' ')}, ${m.count.Ts} Tonschritte, ${m.count.Tw} Tonwiederholungen, ${m.count.Tsp} Tonsprünge.` };
}

// --- Xylophone ---------------------------------------------------------------
function xyFindItem(lv, name, ref) {
  return { kind: 'xylo', ref, q: `Tippe den Klangstab für <b>${L(name)}</b> an.`, notes: [name], labels: false, reveal: true, x: `Die Stammtonreihe liegt von links nach rechts: ${XYLO_BARS.map(L).join(' – ')}. Links sind die langen, tiefen Stäbe.` };
}
// Motifs within the xylophone's range for reading and playing by ear.
const MOTIFS = [
  "c'/1 d'/1 e'/2", "c'/1 e'/1 g'/2", "g'/1 f'/1 e'/1 d'/1 c'/2", "c'/1 c'/1 g'/1 g'/1", "e'/1 d'/1 c'/2", "c'/1 d'/1 e'/1 f'/1 g'/2",
  "g'/1 e'/1 e'/2", "f'/1 d'/1 d'/2", "a'/1 a'/1 g'/2", "e'/1 e'/1 f'/1 g'/1", "c''/1 h'/1 a'/1 g'/2", "g'/1 a'/1 g'/1 f'/1 e'/1 c'/1",
  "c'/1 g'/1 c''/2", "e'/1 g'/1 a'/1 g'/1", "d'/1 e'/1 f'/1 d'/1 c'/2", "c''/1 g'/1 e'/1 c'/2",
];
const xyMotifKeys = lv => sample(lv, MOTIFS.map((_, i) => `m${i}`));
function xyReadItem(lv, key, ref) {
  const src = MOTIFS[+key.slice(1)]; if (!src) return null;
  return { kind: 'xylo', ref, q: 'Spiele die Noten auf dem Xylophon.', show: src, notes: melodyNotes(src), labels: true, x: `Die Töne heißen ${melodyNotes(src).map(L).join(' – ')}.` };
}
function xyEarItem(lv, key, ref) {
  const src = MOTIFS[+key.slice(1)]; if (!src) return null;
  const notes = melodyNotes(src);
  return { kind: 'xylo', ref, q: `Hör dir die Melodie an und spiel sie nach. Sie beginnt mit <b>${L(notes[0])}</b>.`, listen: src, notes, labels: true, x: `Die Melodie war ${notes.map(L).join(' – ')}.` };
}
function xyRowItem(lv, key, ref) {
  return { kind: 'xylo', ref, q: 'Spiele die Stammtonreihe von <b>c′</b> bis <b>c″</b> aufwärts, ohne Beschriftung.', notes: XYLO_BARS, labels: false, reveal: true, x: `Stammtonreihe: ${XYLO_BARS.map(L).join(' – ')}.` };
}

const MELODY_IDS = MELODIES.map(m => m.id);
const MUSIC_QUIZ_TYPES = {
  nameMc: { keys: lv => sample(lv, lv.notes), item: nameMcItem },
  nameType: { keys: lv => sample(lv, lv.notes), item: nameTypeItem },
  noteRow: { keys: rowKeys, item: rowItem },
  place: { keys: lv => sample(lv, lv.notes), item: placeItem },
  ivStaff: { keys: ivKeys, item: ivStaffItem },
  ivNamed: { keys: ivKeys, item: ivNamedItem },
  ivType: { keys: ivKeys, item: ivTypeItem },
  move: { keys: moveKeys, item: moveItem },
  marks: { keys: marksKeys, item: marksItem },
  extreme: { keys: lv => sample(lv, (lv.melodies || MELODY_IDS).flatMap(id => [`${id}.high`, `${id}.low`])), item: extremeItem },
  pool: { keys: lv => sample(lv, lv.melodies || MELODY_IDS), item: poolItem },
  contour: { keys: lv => sample(lv, lv.melodies || MELODY_IDS), item: contourItem },
  startEnd: { keys: lv => sample(lv, (lv.melodies || MELODY_IDS).flatMap(id => [`${id}.start`, `${id}.end`])), item: startEndItem },
  // Only melodies where one kind of step clearly dominates.
  most: { keys: lv => sample(lv, (lv.melodies || MELODY_IDS).filter(id => { const c = Object.values(MELODY[id].count).sort((a, b) => b - a); return c[0] > c[1]; })), item: mostItem },
  fact: { keys: factKeys, item: factItem },
  xyFind: { keys: lv => sample(lv, lv.notes || XYLO_BARS), item: xyFindItem },
  xyRow: { keys: () => ['row'], item: xyRowItem },
  xyRead: { keys: xyMotifKeys, item: xyReadItem },
  xyEar: { keys: xyMotifKeys, item: xyEarItem },
};

// Learn cards: card.staff shows notes with names, card.melody a whole melody with a listen button.
function musicLearnExtras(c) {
  const out = {};
  if (c.staff) out.top = `<div class="learn-staff">${staffSvg(c.staff.notes, { labels: true, even: true, gap: c.staff.gap || 30, cls: c.staff.hi ? i => c.staff.hi.includes(i) ? 'hi' : '' : null, above: c.staff.above })}</div>`;
  if (c.melody) out.bottom = melodyCard(MELODY[c.melody]);
  if (c.xylo) out.bottom = (out.bottom || '') + xyloHtml(XYLO_BARS, true);
  return out;
}

// Endless trainer over note names and intervals.
const TRAINER_NOTES = ["a", "h", "c'", "d'", "e'", "f'", "g'", "a'", "h'", "c''", "d''", "e''", "f''", "g''", "a''", "h''", "c'''"];
function trainerItem(id, typed) {
  if (id.startsWith('iv:')) {
    const size = +id.slice(3); let a, b;
    do { a = pick(XYLO_BARS); b = pick(XYLO_BARS); } while (intervalSize(a, b) !== size);
    const key = `${a}-${b}`;
    return typed ? ivTypeItem({}, key, null) : (Math.random() < .5 ? ivStaffItem : ivNamedItem)({}, key, null);
  }
  return typed ? nameTypeItem({}, id, null) : nameMcItem({}, id, null);
}
