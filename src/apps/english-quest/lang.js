// Language helpers for English Quest: derived word and verb lists, answer checking
// for typed English (taken over from the earlier app, so the same answers count),
// grammar hints for typical simple past mistakes and the English voice.

const slugOf = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------------------------------------------------------------------------
// Checking typed English. Case, punctuation and contractions do not count
// (didn't = did not); one slip in a longer answer is "near".
// ---------------------------------------------------------------------------
function canon(input) {
  let s = String(input || '').toLowerCase();
  s = s.replace(/[’‘`´]/g, "'").replace(/[“”„«»]/g, '"');
  s = s.replace(/\.\.\.|…/g, ' ');
  s = s.replace(/\bcan't\b/g, 'cannot').replace(/\bcan not\b/g, 'cannot').replace(/\bwon't\b/g, 'will not');
  s = s.replace(/n't\b/g, ' not');
  s = s.replace(/\b(did|was|were|do|does|is|are|could|has|have)nt\b/g, '$1 not');
  s = s.replace(/\bi'm\b/g, 'i am')
    .replace(/\b(you|we|they)'re\b/g, '$1 are')
    .replace(/\b(he|she|it|that|there|what|where|who)'s\b/g, '$1 is')
    .replace(/\b(i|you|we|they|he|she)'d\b/g, '$1 would')
    .replace(/\b(i|you|we|they)'ve\b/g, '$1 have')
    .replace(/\b(i|you|we|they|he|she|it)'ll\b/g, '$1 will');
  s = s.replace(/[.,!?;:"()\/\-–]/g, ' ');
  s = s.replace(/\b30\b/g, 'thirty');
  return s.replace(/\s+/g, ' ').trim();
}

function lev(a, b) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 3;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

// 'ok', 'near' (one slip, two in long sentences), 'wrong' or 'empty'.
function judgeEn(input, answers) {
  const c = canon(input);
  if (!c) return 'empty';
  const list = answers.map(canon);
  if (list.includes(c)) return 'ok';
  let best = 99;
  for (const a of list) best = Math.min(best, lev(c, a));
  if (best === 1 && c.length >= 4) return 'near';
  if (best === 2 && c.length >= 14) return 'near';
  return 'wrong';
}

// ---------------------------------------------------------------------------
// Words and verbs. Ids are the ones of the earlier app (v.<slug>, iv.<slug>),
// so its saved progress maps onto the same words.
// ---------------------------------------------------------------------------
const VOCAB = [];
(function buildVocab() {
  const used = new Set();
  VOCAB_RAW.forEach(([en, de, g, extra = {}]) => {
    let id = 'v.' + slugOf(en);
    while (used.has(id)) id += 'x';
    used.add(id);
    VOCAB.push({ id, en, de, g, n: extra.n || '', alt: extra.alt || [] });
  });
})();
const VOCAB_BY_ID = Object.fromEntries(VOCAB.map(v => [v.id, v]));
const vocabOf = g => VOCAB.filter(v => g.includes(v.g)).map(v => v.id);
// Words with the same German meaning (clever and smart, biscuit and cookie) count for each other.
const DE_MAP = {};
VOCAB.forEach(v => { const k = canon(v.de); (DE_MAP[k] = DE_MAP[k] || []).push(v); });

function enVariants(en) {
  const out = new Set();
  const base = en.replace(/\s*(\.\.\.|…)\s*/g, ' ').trim();
  out.add(base);
  if (/\(.*?\)/.test(base)) {
    out.add(base.replace(/\(([^)]*)\)/g, '$1'));
    out.add(base.replace(/\s*\([^)]*\)/g, ''));
  }
  for (const v of Array.from(out)) if (/^to /i.test(v)) out.add(v.slice(3));
  return Array.from(out);
}
function vocabAnswers(v) {
  const list = [...enVariants(v.en), ...v.alt];
  (DE_MAP[canon(v.de)] || []).forEach(o => { if (o !== v) list.push(...enVariants(o.en), ...o.alt); });
  return list;
}
function vocabTag(v) {
  const t = [];
  if (/\bAE\b/.test(v.n)) t.push('amerikanisch');
  if (/\bBE\b/.test(v.n)) t.push('britisch');
  if (/\bpl\b/.test(v.n)) t.push('Plural');
  if (/\bsg\b/.test(v.n)) t.push('Singular');
  if (/\binfml\b/.test(v.n)) t.push('umgangssprachlich');
  return t.join(' · ');
}

const VERBS = IRREGULAR_RAW.map(([base, past, de, alt]) => ({ id: 'iv.' + slugOf(base), base, past, de, alt: alt || [] }));
const VERB_BY_ID = Object.fromEntries(VERBS.map(v => [v.id, v]));

// Past forms that point back to a base form, for hints such as "didn't went".
const PAST_ONLY = {};
[...IRREGULAR_ALL, ...IRREGULAR_RAW].forEach(([base, past]) => {
  const b = canon(base).split(' ')[0];
  canon(past).split(' ').forEach(p => { if (p !== b && p !== 'up' && p !== 'was' && p !== 'were') PAST_ONLY[p] = b; });
});
const REG_PAST = {};
REGULAR_RAW.forEach(([b, p]) => { REG_PAST[p] = b; });
const BASES = new Set([...[...IRREGULAR_ALL, ...IRREGULAR_RAW].map(v => canon(v[0]).split(' ')[0]), ...REGULAR_RAW.map(r => r[0]),
  'show', 'miss', 'need', 'tell', 'send', 'learn', 'turn', 'post', 'fix', 'wish', 'kiss', 'pass', 'touch', 'rain', 'film', 'work']);
const ED_OK = new Set(['need', 'feed', 'bleed', 'speed', 'seed', 'red', 'bed', 'shed', 'wed', 'led', 'fed', 'shred']);

function pastToBase(w) {
  if (PAST_ONLY[w]) return PAST_ONLY[w];
  if (REG_PAST[w]) return REG_PAST[w];
  if (/ed$/.test(w) && !ED_OK.has(w)) {
    if (/ied$/.test(w) && BASES.has(w.slice(0, -3) + 'y')) return w.slice(0, -3) + 'y';
    if (BASES.has(w.slice(0, -2))) return w.slice(0, -2);
    if (BASES.has(w.slice(0, -1))) return w.slice(0, -1);
    if (w.length > 5 && w[w.length - 3] === w[w.length - 4] && BASES.has(w.slice(0, -3))) return w.slice(0, -3);
  }
  return null;
}

// A hint for a wrong grammar answer; item.type is q, bq or sa, item.past marks simple past tasks.
const STORY_NAMES = ['ryan', 'lily', 'ruby', 'karam', 'ty', 'josh', 'ava', 'sherlock', 'mrs', 'wilson', 'austins', 'students', 'mum', 'dad', 'coach', "karam's"];
function grammarHint(raw, item) {
  const s = canon(raw);
  if (!s) return '';
  if (/\bdid (not )?(be|was|were)\b/.test(s)) return 'Bei be brauchst du kein did, sondern was/were oder wasn’t/weren’t.';
  if (/\b(do|does) not\b/.test(s) && item.past) return 'Das ist Simple Present, für die Vergangenheit brauchst du didn’t.';
  const parts = s.split(/\bdid\b/);
  if (parts.length > 1) {
    for (const w of parts[1].trim().split(' ').slice(0, 5)) {
      const b = pastToBase(w);
      if (b) return `Nach did/didn’t steht die Grundform, also „${b}“ statt „${w}“.`;
    }
  }
  if (item.type === 'q' && !/^did\b/.test(s)) return 'Fragen im Simple Past beginnen mit Did (außer bei be).';
  if (item.type === 'bq' && !/^(was|were)\b/.test(s)) return 'Bei be stellst du Was oder Were an den Anfang.';
  if (item.type === 'bq') {
    const subj = (item.parts || '').split('|')[0].trim().toLowerCase();
    const plural = /\band\b|students|you\b|austins|they|we\b/.test(subj);
    if (plural && /^was\b/.test(s)) return 'Bei Mehrzahl und bei you heißt es Were.';
    if (!plural && /^were\b/.test(s)) return 'Bei Einzahl (he, she, it) heißt es Was.';
  }
  if (item.type === 'sa') {
    const m = s.match(/^(yes|no) (\S+) ?(\S+)?/);
    if (m) {
      if (STORY_NAMES.includes(m[2]) || m[2] === 'the') return 'In der Kurzantwort ersetzt du den Namen durch ein Pronomen (he, she, it, we, they).';
      if (m[3] && !['did', 'was', 'were'].includes(m[3])) return 'In die Kurzantwort gehört nur did/didn’t (oder was/were), kein Vollverb.';
      const want = canon(item.a);
      if ((/^yes/.test(want) && m[1] === 'no') || (/^no/.test(want) && m[1] === 'yes')) return 'Achte auf das Zeichen: ✓ heißt Yes, ✗ heißt No.';
    }
  }
  return '';
}

// Checks a free sentence with didn't from the writing workshop.
function analyzeNeg(sentence) {
  const raw = sentence.trim(), s = canon(raw);
  if (s.split(' ').filter(Boolean).length < 3) return { ok: false, msg: 'Der Satz ist zu kurz.' };
  if (/\bdid (not )?(be|was|were)\b/.test(s)) return { ok: false, msg: 'Bei be heißt es wasn’t oder weren’t, ohne didn’t.' };
  if (/\b(do|does) not\b/.test(s)) return { ok: false, msg: 'don’t und doesn’t sind Simple Present, für die Vergangenheit brauchst du didn’t.' };
  const m = s.match(/\bdid not (\w+)/);
  if (!m) {
    if (/\b(was|were) not\b/.test(s)) return { ok: true, msg: '' };
    return { ok: false, msg: 'Hier fehlt die Verneinung mit didn’t.' };
  }
  const v = m[1], b = pastToBase(v);
  if (b) return { ok: false, msg: `Nach didn’t steht die Grundform, also „${b}“ statt „${v}“.` };
  if ((/s$/.test(v) && BASES.has(v.slice(0, -1))) || (/es$/.test(v) && BASES.has(v.slice(0, -2)))) return { ok: false, msg: 'Nach didn’t steht die Grundform ohne -s.' };
  if (/ing$/.test(v) && v.length > 5) return { ok: false, msg: 'Nach didn’t steht die Grundform ohne -ing.' };
  if (!s.slice(0, m.index).trim()) return { ok: false, msg: 'Am Satzanfang fehlt die Person, zum Beispiel I.' };
  return { ok: true, msg: '' };
}

// Builds a field judge for the core's typed answers ({ ok, typo, hint }).
// opt.grammar adds grammar hints, opt.sentence and opt.question add notes on
// capitals and the question mark, which the real test checks too.
function enJudge(answers, opt = {}) {
  return text => {
    const r = judgeEn(text, answers);
    if (r === 'ok') {
      const notes = [];
      if (opt.question && !/\?\s*$/.test(text)) notes.push('Denk in der Arbeit ans Fragezeichen.');
      if (opt.sentence && /^[a-z]/.test(text.trim())) notes.push('Den Satzanfang schreibst du groß.');
      if (/\b(did|was|were|do|does)nt\b/i.test(text)) notes.push('Vergiss den Apostroph nicht: didn’t, wasn’t, weren’t.');
      return notes.length ? { ok: true, typo: true, hint: notes.join(' ') } : { ok: true };
    }
    let hint = opt.grammar ? grammarHint(text, opt) : '';
    if (!hint && r === 'near') hint = 'Fast, da steckt nur noch ein kleiner Fehler drin.';
    return { ok: false, hint };
  };
}

// ---------------------------------------------------------------------------
// English voice: single words and sentences (data-say buttons) and the
// listening texts with two voices for dialogues.
// ---------------------------------------------------------------------------
let enVoices = [];
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const all = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
  const gb = all.filter(v => /en[-_]GB/i.test(v.lang)), us = all.filter(v => /en[-_]US/i.test(v.lang));
  enVoices = [...new Set([...gb, ...us, ...all])];
}
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.addEventListener('voiceschanged', loadVoices); }

// Speaks [[speaker, text], ...]; lines of the second speaker get another voice. Resolves
// when done or stopped (a cancelled queue does not always fire its events, so stopping
// resolves the running promise itself).
let speechDone = null;
function stopSpeech() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (speechDone) { const done = speechDone; speechDone = null; done(false); }
}
function speakLines(lines, altSpeaker) {
  stopSpeech();
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) { resolve(false); return; }
    if (!enVoices.length) loadVoices();
    const a = enVoices[0] || null;
    const b = enVoices.find(v => v !== a && a && v.lang === a.lang) || enVoices.find(v => v !== a) || a;
    const parts = [];
    lines.forEach(([who, text]) => (String(text).match(/[^.!?]+[.!?]*/g) || [text]).forEach(p => parts.push({ alt: who === altSpeaker, text: p.trim() })));
    if (!parts.length) { resolve(true); return; }
    speechDone = resolve;
    const finish = ok => { if (speechDone === resolve) speechDone = null; resolve(ok); };
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p.text);
      const v = p.alt ? b : a;
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
      u.rate = .9;
      u.pitch = p.alt ? (b === a ? 1.35 : 1.05) : 1;
      if (i === parts.length - 1) { u.onend = () => finish(true); u.onerror = () => finish(false); }
      speechSynthesis.speak(u);
    });
  });
}
const speakEn = text => speakLines([['N', String(text).replace(/…/g, '')]]);
const sayBtn = text => `<button type="button" class="say" data-say="${esc(text)}" aria-label="Anhören">${ICON.soundOn}</button>`;
document.addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b) { e.preventDefault(); speakEn(b.dataset.say); } });
