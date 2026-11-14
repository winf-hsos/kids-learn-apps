// Optional core module (manifest "modules": ["music"]): notes in the treble clef,
// intervals, melodies and a playable xylophone for music apps.
//
// Notes are named as German school books write them: h a g ... (small octave),
// c' d' ... h' (one-line), c'' ... (two-line). Internally a note is a diatonic
// step (c' = 28, d' = 29, ... c'' = 35). Melodies are strings like
// "c'/.5 e'/.5 | g'/1.5 g'/.5 | c'/3": note/beats, "|" for a bar line, "r/1" for a rest.
// Needs the font "Noto Music" (manifest "fonts") for the clef.

const NOTE_LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'h'];
const INTERVAL_NAMES = ['Prime', 'Sekunde', 'Terz', 'Quarte', 'Quinte', 'Sexte', 'Septime', 'Oktave'];
const INTERVAL_COUNT = ['Einklang', 'Zweitonintervall', 'Dreitonintervall', 'Viertonintervall', 'Fünftonintervall', 'Sechstonintervall', 'Siebentonintervall', 'Achttonintervall'];
const STEP_E1 = 30;                          // e' sits on the bottom staff line

function noteStep(name) {
  const m = String(name).trim().match(/^([a-hA-H])('*)$/);
  if (!m) return null;
  const letter = m[1].toLowerCase(), marks = m[2].length;
  return (3 + marks) * 7 + NOTE_LETTERS.indexOf(letter);
}
function stepName(step) {
  const oct = Math.floor(step / 7), letter = NOTE_LETTERS[step % 7];
  return letter + "'".repeat(Math.max(0, oct - 3));
}
// Display form with a typographic prime: c′, d″ reads better than c', d''.
const noteLabel = name => String(name).replace(/''/g, '″').replace(/'/g, '′');
function stepFreq(step) {
  const oct = Math.floor(step / 7), semis = [0, 2, 4, 5, 7, 9, 11][step % 7];
  const midi = 12 * (oct + 1) + semis;
  return 440 * Math.pow(2, (midi - 69) / 12);
}
// Interval between two notes, counting both notes like the worksheet: c'–f' = c' d' e' f' = 4 = Quarte.
const intervalSize = (a, b) => Math.abs(noteStep(a) - noteStep(b)) + 1;
const intervalName = (a, b) => INTERVAL_NAMES[intervalSize(a, b) - 1] || `${intervalSize(a, b)}-Ton-Intervall`;
// Melody movement between two notes: Tonwiederholung, Tonschritt or Tonsprung.
function moveKind(a, b) {
  const d = Math.abs(noteStep(a) - noteStep(b));
  return d === 0 ? 'Tw' : d === 1 ? 'Ts' : 'Tsp';
}
const MOVE_NAMES = { Tw: 'Tonwiederholung', Ts: 'Tonschritt', Tsp: 'Tonsprung' };

// Judges a typed note name; c', c’, c1, c¹ all mean the same, but the octave counts.
function noteAnswerKey(text) {
  const t = String(text).trim().toLowerCase().replace(/[’‘´`′]/g, "'").replace(/″/g, "''").replace(/\s+/g, '');
  let m = t.match(/^([a-h])('*)$/); if (m) return m[1] + m[2];
  m = t.match(/^([a-h])([1-4¹²³])$/); if (m) return m[1] + "'".repeat({ '1': 1, '2': 2, '3': 3, '4': 4, '¹': 1, '²': 2, '³': 3 }[m[2]]);
  return null;
}
function judgeNote(text, name) {
  const key = noteAnswerKey(text), raw = String(text).trim().toLowerCase();
  if (key === name) return { ok: true };
  if (key && key[0] === name[0]) return { ok: false, hint: `Der Buchstabe stimmt, aber die Oktave nicht: Es ist ${noteLabel(name)}, nicht ${noteLabel(key)}.` };
  if (raw[0] === 'b' && name[0] === 'h') return { ok: false, hint: 'Im Deutschen heißt der Ton h, nicht b.' };
  return { ok: false };
}

function parseMelody(src) {
  return String(src).trim().split(/\s+/).map(tok => {
    if (tok === '|') return { bar: true };
    const [n, d] = tok.split('/');
    return n === 'r' ? { rest: true, beats: +d || 1 } : { name: n, step: noteStep(n), beats: +d || 1 };
  });
}
const melodyNotes = src => parseMelody(src).filter(e => e.name).map(e => e.name);

// ---------------------------------------------------------------------------
// Staff drawing (SVG). opts: labels (names under the notes), marks (text between
// neighbouring notes, e.g. Tw/Ts/Tsp), color (index -> css color), meter ("3/4"),
// gap (horizontal space per note), hollow (whole notes for single tones), above
// (index -> text over a note, e.g. its number), even (same space for every note), end (final bar line).
// ---------------------------------------------------------------------------
const STAFF_TOP = 35, STAFF_GAP = 10;
const stepY = step => STAFF_TOP + 4 * STAFF_GAP - (step - STEP_E1) * STAFF_GAP / 2;

function ledgerLines(step, x) {
  const out = [];
  for (let s = STEP_E1 - 2; s >= step; s -= 2) out.push(s);
  for (let s = STEP_E1 + 10; s <= step; s += 2) out.push(s);
  return out.map(s => `<line x1="${x - 10}" x2="${x + 10}" y1="${stepY(s)}" y2="${stepY(s)}" class="st-line"/>`).join('');
}
function noteGlyph(ev, x, cls) {
  const y = stepY(ev.step), b = ev.beats;
  const hollow = b >= 2, stem = b < 4, flags = b <= .25 ? 2 : b < 1 ? 1 : 0, dotted = [3, 1.5, .75].includes(b);
  const up = ev.step < 34;                                      // below the middle line (h'): stem up
  let s = ledgerLines(ev.step, x);
  s += `<ellipse cx="${x}" cy="${y}" rx="6.3" ry="4.6" transform="rotate(-20 ${x} ${y})" class="st-head ${hollow ? 'hollow' : ''} ${cls || ''}"/>`;
  if (stem) {
    const sx = up ? x + 5.6 : x - 5.6, sy = up ? y - 33 : y + 33;
    s += `<line x1="${sx}" x2="${sx}" y1="${y + (up ? -1 : 1)}" y2="${sy}" class="st-stem ${cls || ''}"/>`;
    for (let f = 0; f < flags; f++) {
      const fy = sy + (up ? 1 : -1) * f * 7;
      s += `<path d="M${sx} ${fy} q 9 ${up ? 8 : -8} 7 ${up ? 18 : -18}" class="st-flag ${cls || ''}"/>`;
    }
  }
  if (dotted) s += `<circle cx="${x + 10}" cy="${y - ((ev.step - STEP_E1) % 2 === 0 ? 3 : 0)}" r="1.8" class="st-dot ${cls || ''}"/>`;
  return s;
}
function staffSvg(src, opts = {}) {
  const evs = Array.isArray(src) ? src.map(n => ({ name: n, step: noteStep(n), beats: opts.hollow === false ? 1 : 4 })) : parseMelody(src);
  const gap = opts.gap || 36, left = opts.meter ? 76 : 60;
  let x = left, body = '', idx = 0, prev = null;
  const xs = [];
  evs.forEach(ev => {
    if (ev.bar) { body += `<line x1="${x - gap / 2 + 6}" x2="${x - gap / 2 + 6}" y1="${STAFF_TOP}" y2="${STAFF_TOP + 40}" class="st-line"/>`; x += 6; return; }
    if (ev.rest) { body += `<rect x="${x - 6}" y="${STAFF_TOP + 16}" width="12" height="5" class="st-rest"/>`; x += gap; return; }
    const cls = opts.cls ? opts.cls(idx) : '';
    body += noteGlyph(ev, x, cls);
    if (opts.above) { const t = opts.above(idx); if (t !== '' && t != null) body += `<text x="${x}" y="${Math.min(STAFF_TOP - 12, stepY(ev.step) - 12)}" class="st-num">${t}</text>`; }
    if (opts.labels) body += `<text x="${x}" y="${Math.max(stepY(ev.step) + 26, 112)}" class="st-label ${cls}">${noteLabel(ev.name)}</text>`;
    if (opts.marks && prev) {
      const m = opts.marks(idx - 1, idx);
      if (m) body += `<text x="${(prev.x + x) / 2}" y="${Math.min(stepY(prev.ev.step), stepY(ev.step), STAFF_TOP) - 12}" class="st-mark">${m}</text>`;
    }
    xs.push(x); prev = { ev, x }; idx++; x += gap * (opts.even ? 1 : Math.max(.8, Math.min(1.6, .75 + ev.beats * .35)));
  });
  const w = Math.max(x + 10, opts.minWidth || 0);
  const lines = [0, 1, 2, 3, 4].map(i => `<line x1="4" x2="${w - 4}" y1="${STAFF_TOP + i * STAFF_GAP}" y2="${STAFF_TOP + i * STAFF_GAP}" class="st-line"/>`).join('');
  const meter = opts.meter ? opts.meter.split('/').map((d, i) => `<text x="52" y="${STAFF_TOP + 18 + i * 20}" class="st-meter">${d}</text>`).join('') : '';
  const end = opts.end ? `<line x1="${w - 9}" x2="${w - 9}" y1="${STAFF_TOP}" y2="${STAFF_TOP + 40}" class="st-line"/><line x1="${w - 5}" x2="${w - 5}" y1="${STAFF_TOP}" y2="${STAFF_TOP + 40}" class="st-line" style="stroke-width:3"/>`
    : opts.close ? `<line x1="${w - 4}" x2="${w - 4}" y1="${STAFF_TOP}" y2="${STAFF_TOP + 40}" class="st-line"/>` : '';
  return `<svg class="staff" viewBox="0 0 ${w} 120" style="max-width:${Math.round(w * (opts.scale || 1.5))}px" role="img" aria-label="Notenzeile">${lines}<text x="6" y="${STAFF_TOP + 32}" class="st-clef">𝄞</text>${meter}${body}${end}</svg>`;
}

// ---------------------------------------------------------------------------
// Sound: a soft xylophone tone, independent of the effect sounds' mute switch,
// because here the tone is the content.
// ---------------------------------------------------------------------------
const Xylo = {
  ctx: null,
  ensure() {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { return null; }
    return this.ctx;
  },
  hit(step, when = 0, len = .9) {
    const c = this.ensure(); if (!c) return;
    const t = c.currentTime + when, f = stepFreq(step);
    [[1, .32, 'sine'], [4, .05, 'sine'], [2.76, .04, 'triangle']].forEach(([mul, vol, type]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f * mul, t);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + len / (mul > 1 ? 3 : 1));
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + len + .05);
    });
  },
  timer: null,
  // Plays a melody string or a list of note names; onNote(i) marks the note being played.
  play(src, onNote, bpm = 92) {
    this.stop();
    const evs = (Array.isArray(src) ? src.map(n => ({ name: n, step: noteStep(n), beats: 1 })) : parseMelody(src)).filter(e => !e.bar);
    const beat = 60 / bpm; let t = .05, i = 0; const marks = [];
    evs.forEach(ev => {
      if (!ev.rest) { this.hit(ev.step, t, Math.min(1.4, ev.beats * beat + .3)); const k = i++; marks.push(setTimeout(() => onNote && onNote(k), t * 1000)); }
      t += ev.beats * beat;
    });
    marks.push(setTimeout(() => onNote && onNote(-1), t * 1000));
    this.timer = marks;
    return t;
  },
  stop() { (this.timer || []).forEach(clearTimeout); this.timer = null; },
};

// ---------------------------------------------------------------------------
// Board kinds for the shared engine (APP.boardKinds = MUSIC_BOARD_KINDS).
// ---------------------------------------------------------------------------
const XYLO_BARS = ["c'", "d'", "e'", "f'", "g'", "a'", "h'", "c''"];

function xyloHtml(bars, labels) {
  return `<div class="xylo" role="group" aria-label="Xylophon">${bars.map((n, i) => `<button type="button" class="xbar" data-n="${n}" style="--h:${100 - i * (40 / Math.max(1, bars.length - 1))}%" aria-label="Klangstab ${labels ? noteLabel(n) : i + 1}"><span>${labels ? noteLabel(n) : ''}</span></button>`).join('')}</div>`;
}

const MUSIC_BOARD_KINDS = {
  // Place a note on the staff: { q, note, low, high } (low/high limit the range, default g to c''').
  staffpick: {
    body: it => `<div class="staffpick"><div id="spStaff">${staffSvg([], { minWidth: 150, scale: 2.2 })}</div><p class="muted sp-tip">Tippe auf eine Linie oder in einen Zwischenraum. Du kannst die Note verschieben, bis sie richtig sitzt.</p></div>`,
    bind(it, ready) {
      const lo = noteStep(it.low || 'g'), hi = noteStep(it.high || "c'''");
      let placed = null;
      const paint = () => {
        $('#spStaff').innerHTML = staffSvg(placed === null ? [] : [stepName(placed)], { minWidth: 150, scale: 2.2, cls: () => 'placed' });
        $('#spStaff svg').addEventListener('pointerdown', pick);
        ready(placed !== null);
      };
      const pick = e => {
        const svg = $('#spStaff svg'), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        placed = Math.max(lo, Math.min(hi, Math.round((stepY(STEP_E1) - p.y) / (STAFF_GAP / 2)) + STEP_E1));
        Xylo.hit(placed); paint();
      };
      paint();
      return () => {
        const ok = placed === noteStep(it.note);
        $('#spStaff').innerHTML = staffSvg(ok ? [it.note] : [stepName(placed), it.note], { minWidth: 150, scale: 2.2, labels: true, cls: i => ok ? 'good' : i === 0 ? 'bad' : 'good' });
        return [ok];
      };
    },
    sol: it => noteLabel(it.note),
  },
  // Play notes on the xylophone: { q, notes: [...], bars?, labels?, listen?: melody string, show?: melody string }.
  xylo: {
    body: it => `${it.show ? `<div class="xy-score">${staffSvg(it.show, { labels: false })}</div>` : ''}
      ${it.listen ? `<div class="xy-listen"><button type="button" class="btn small" id="xyPlay">${ICON.soundOn}<span>Melodie anhören</span></button></div>` : ''}
      <div class="xy-picked" id="xyPicked"></div>${xyloHtml(it.bars || XYLO_BARS, it.labels)}
      <div class="xy-tools"><button type="button" class="btn small" id="xyUndo">Letzten Ton löschen</button></div>`,
    bind(it, ready) {
      const played = [];
      const paint = () => {
        $('#xyPicked').innerHTML = `${it.notes.map((_, i) => `<span class="${i < played.length ? 'on' : ''}">${i < played.length ? (it.labels || it.reveal ? noteLabel(played[i]) : '♪') : i + 1}</span>`).join('')}`;
        ready(played.length === it.notes.length);
      };
      $$('.xbar').forEach(b => b.onclick = () => {
        Xylo.hit(noteStep(b.dataset.n), 0, 1);
        b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
        if (played.length < it.notes.length) { played.push(b.dataset.n); paint(); }
      });
      $('#xyUndo').onclick = () => { played.pop(); paint(); };
      if (it.listen) $('#xyPlay').onclick = () => Xylo.play(it.listen);
      paint();
      return () => {
        const hits = it.notes.map((n, i) => played[i] === n);
        $$('#xyPicked span').forEach((s, i) => { s.classList.add(hits[i] ? 'right' : 'wrong'); s.textContent = noteLabel(it.notes[i]); });
        Xylo.stop();
        return hits;
      };
    },
    sol: it => it.notes.map(noteLabel).join(' – '),
  },
};

// Plays the melody of any element with data-melody (e.g. a listen button on a learn card).
document.addEventListener('click', e => {
  const b = e.target.closest('[data-melody]'); if (!b) return;
  e.preventDefault();
  const card = b.closest('.melody-card');
  const heads = card ? [...card.querySelectorAll('.staff .st-head')] : [];
  Xylo.play(b.dataset.melody, i => heads.forEach((h, k) => h.classList.toggle('playing', k === i)), +b.dataset.bpm || 92);
});
const melodyBtn = (src, label = 'Anhören') => `<button type="button" class="btn small listen" data-melody="${esc(src)}">${ICON.soundOn}<span>${label}</span></button>`;
