// Quiz types of English Quest (data in data.js, checking in lang.js). Item keys are
// the item ids of the earlier app (v.lake, iv.go, g.q.3, ls.l1, ...), so its saved
// progress and wrong answers map onto them. Every type has pool(lv), the full list
// of keys of a level; a level asks lv.n of them, or all.

const sampleKeys = (lv, keys) => shuffle(keys).slice(0, lv.n || keys.length);
const quizType = (pool, item) => ({ pool, keys: lv => sampleKeys(lv, pool(lv)), item });
const idx = (key, prefix) => key.startsWith(prefix) ? +key.slice(prefix.length) : NaN;
const sent = html => `<span class="sent">${html}</span>`;

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------
const vocabX = v => `<b>${v.en}</b> ${sayBtn(v.en)} heißt <b>${v.de}</b>.${v.n ? ` <small>(${v.n})</small>` : ''}`;

// Three distractors, from the same page first, never a synonym of the right answer.
function vocabOthers(v, field) {
  const same = VOCAB.filter(o => o.g === v.g && canon(o.de) !== canon(v.de));
  const other = VOCAB.filter(o => canon(o.de) !== canon(v.de));
  const out = [];
  for (const o of [...shuffle(same), ...shuffle(other)]) {
    if (out.length >= 3) break;
    if (!out.some(d => d[field] === o[field])) out.push(o);
  }
  return out;
}
function vmcItem(lv, key, ref) {
  const v = VOCAB_BY_ID[key]; if (!v) return null;
  return mcFrom({ q: `Was heißt <b>${v.en}</b>? ${sayBtn(v.en)}`, o: [v.de, ...vocabOthers(v, 'de').map(o => o.de)], a: 0, x: vocabX(v) }, ref);
}
function vdmcItem(lv, key, ref) {
  const v = VOCAB_BY_ID[key]; if (!v) return null;
  const tag = vocabTag(v);
  return mcFrom({ q: `Wie heißt <b>${v.de}</b> auf Englisch?${tag ? `<small class="qhint">${tag}</small>` : ''}`, o: [v.en, ...vocabOthers(v, 'en').map(o => o.en)], a: 0, x: vocabX(v) }, ref);
}
// German -> English typed; synonyms with the same German meaning count, like in the old app.
function vtypeItem(lv, key, ref) {
  const v = VOCAB_BY_ID[key]; if (!v) return null;
  const tag = vocabTag(v);
  return { kind: 'type', ref, q: `<span class="de-q">${v.de}</span>${tag ? `<small>${tag}</small>` : ''}`, lead: 'Wie heißt das auf Englisch? Achte auf die Schreibweise.', x: vocabX(v),
    fields: [{ label: 'Englisch', judge: enJudge(vocabAnswers(v)), sol: v.en }] };
}
// Pairs: the level's words in fixed sets of four, never two with the same German meaning.
function pairChunks(lv) {
  if (lv._chunks) return lv._chunks;
  const chunks = []; let rest = lv.words.slice();
  while (rest.length) {
    const c = [], later = [];
    rest.forEach(id => (c.length < 4 && !c.some(o => canon(VOCAB_BY_ID[o].de) === canon(VOCAB_BY_ID[id].de)) ? c : later).push(id));
    chunks.push(c); rest = later;
  }
  // A short last set joins the one before, so no task has only one or two pairs.
  const tail = chunks[chunks.length - 1], prev = chunks[chunks.length - 2];
  if (prev && tail.length < 3 && !tail.some(id => prev.some(o => canon(VOCAB_BY_ID[o].de) === canon(VOCAB_BY_ID[id].de)))) prev.push(...chunks.pop());
  return (lv._chunks = chunks);
}
function vpairsItem(lv, key, ref) {
  const c = pairChunks(lv)[idx(key, 'p')]; if (!c) return null;
  return { kind: 'pairs', ref, q: 'Verbinde jedes englische Wort mit seiner Bedeutung.', pairs: c.map(id => [VOCAB_BY_ID[id].en, VOCAB_BY_ID[id].de]) };
}

// ---------------------------------------------------------------------------
// Irregular verbs
// ---------------------------------------------------------------------------
const verbSay = v => `${v.base}. ${v.past.replace('/', ', ')}`;
const verbX = v => `${v.base} – <b>${v.past}</b> ${sayBtn(verbSay(v))} (${v.de})`;
// Wrong options: the made-up regular form (goed, tryed) and past forms of other verbs.
function verbWrong(v) {
  const wrong = [];
  const fake = v.base === 'be' ? '' : v.base.endsWith('e') ? v.base + 'd' : v.base + 'ed';
  if (fake && canon(fake) !== canon(v.past)) wrong.push(fake);
  for (const o of shuffle(VERBS)) {
    if (wrong.length >= 3) break;
    if (o.past !== v.past && !wrong.includes(o.past)) wrong.push(o.past);
  }
  return wrong;
}
function ivmcItem(lv, key, ref) {
  const v = VERB_BY_ID[key]; if (!v) return null;
  return mcFrom({ q: `Simple Past von <b>${v.base}</b>?<small class="qhint">${v.de}</small>`, o: [v.past, ...verbWrong(v)], a: 0, x: verbX(v) }, ref);
}
function ivpastItem(lv, key, ref) {
  const v = VERB_BY_ID[key]; if (!v) return null;
  return { kind: 'type', ref, q: `${v.base}${sayBtn(v.base)}<small>${v.de}</small>`, lead: 'Wie heißt das Simple Past?', x: verbX(v),
    fields: [{ label: 'Simple Past', judge: enJudge([v.past, ...v.alt]), sol: v.past }] };
}
function ivbaseItem(lv, key, ref) {
  const v = VERB_BY_ID[key.replace(/\.r$/, '')]; if (!v || !key.endsWith('.r')) return null;
  const shown = v.base === 'be' ? pick(['was', 'were']) : v.past;
  return { kind: 'type', ref, q: shown, lead: 'Wie heißt die Grundform?', x: verbX(v),
    fields: [{ label: 'Grundform', judge: enJudge([v.base, 'to ' + v.base]), sol: v.base }] };
}

// ---------------------------------------------------------------------------
// Grammar (keys g.<topic>.<index>, regular verbs g.reg.<base>)
// ---------------------------------------------------------------------------
const rangeKeys = (prefix, n, from = 0, to = n) => Array.from({ length: n }, (_, i) => prefix + i).slice(from, to);
const levelKeys = (lv, prefix, n) => rangeKeys(prefix, n, ...(lv.range || []));
const chipsPrompt = parts => `<span class="chips-q">${parts.split('|').map(p => `<span class="chip-q">${p.trim()}</span>`).join('<span class="plus">+</span>')}</span>`;
const signBadge = (ok, yes, no) => `<span class="sign ${ok ? 'yes' : 'no'}">${ok ? '✓ ' + yes : '✗ ' + no}</span>`;
const blankHtml = (s, verb) => s.replace('___', `<span class="blank">______</span> <span class="vhint">(${verb})</span>`);

function regItem(lv, key, ref) {
  const r = REGULAR_RAW.find(x => 'g.reg.' + x[0] === key); if (!r) return null;
  return { kind: 'type', ref, q: r[0], lead: 'Wie schreibt man das Simple Past?', x: `${r[0]} – <b>${r[1]}</b>. ${RULE_TEXT[r[2]]}`,
    fields: [{ label: 'Simple Past', judge: enJudge([r[1]]), sol: r[1] }] };
}
function signalX(row) { return `Signalwort „${row[3]}“, also ${row[4] === 'past' ? 'Simple Past' : 'Simple Present'}: <i>${row[0].replace('___', `<b>${row[2]}</b>`)}</i>`; }
function sigtItem(lv, key, ref) {
  const row = SIGNAL_RAW[idx(key, 'g.sig.')]; if (!row) return null;
  return mcFrom({ q: `${sent(blankHtml(row[0], row[1]))}<small class="qhint">Simple Present oder Simple Past?</small>`, o: ['Simple Past', 'Simple Present'], a: row[4] === 'past' ? 0 : 1, x: signalX(row) }, ref);
}
function sigItem(lv, key, ref) {
  const row = SIGNAL_RAW[idx(key, 'g.sig.')]; if (!row) return null;
  return { kind: 'type', ref, q: sent(blankHtml(row[0], row[1])), lead: 'Simple Present oder Simple Past? Achte auf das Signalwort und setz die richtige Form ein.', x: signalX(row),
    fields: [{ label: 'Verbform', judge: enJudge([row[2]]), sol: row[2] }] };
}
function qItem(lv, key, ref) {
  const row = QUESTIONS_RAW[idx(key, 'g.q.')]; if (!row) return null;
  return { kind: 'type', ref, q: chipsPrompt(row[0]), lead: 'Bilde eine Frage im Simple Past mit did.', x: 'Did + Person + Grundform …?',
    fields: [{ label: 'Frage', judge: enJudge([row[1]], { grammar: true, type: 'q', past: true, parts: row[0], sentence: true, question: true }), sol: row[1] }] };
}
function bqItem(lv, key, ref) {
  const row = BE_QUESTIONS_RAW[idx(key, 'g.bq.')]; if (!row) return null;
  return { kind: 'type', ref, q: chipsPrompt(row[0]), lead: 'Bilde eine Frage mit was oder were.', x: 'Was/Were + Person + …? Zu I, he, she und it gehört was, zu you, we und they gehört were.',
    fields: [{ label: 'Frage', judge: enJudge([row[1]], { grammar: true, type: 'bq', parts: row[0], sentence: true, question: true }), sol: row[1] }] };
}
function saItem(lv, key, ref) {
  const row = SHORT_RAW[idx(key, 'g.sa.')]; if (!row) return null;
  const [q, sign, ans, hint, alt] = row;
  return { kind: 'type', ref, q: `${sent(q)}<small>${signBadge(sign === '+', 'Yes', 'No')}${hint ? ` ${hint}` : ''}</small>`, lead: 'Gib die passende Kurzantwort.',
    x: 'Kurzantwort: Yes, + Pronomen + did/was/were. No, + Pronomen + didn’t/wasn’t/weren’t.',
    fields: [{ label: 'Kurzantwort', judge: enJudge([ans, ...(alt || [])], { grammar: true, type: 'sa', past: true, a: ans, sentence: true }), sol: ans }] };
}
function mcgItem(lv, key, ref) {
  const row = MC_GRAMMAR_RAW[idx(key, 'g.mc.')]; if (!row) return null;
  return mcFrom({ q: row[0], o: row[1], a: 0, x: row[2] }, ref);
}
function tyItem(lv, key, ref) {
  const row = TY_LIST_RAW[idx(key, 'g.ty.')]; if (!row) return null;
  const [sign, act, sol] = row;
  return { kind: 'type', ref, q: `${sent(act)}<small>${signBadge(sign === '+', 'gemacht', 'nicht gemacht')}</small>`, lead: 'Was hat Ty am Wochenende gemacht und was nicht? Schreib einen Satz mit Ty oder He.',
    x: sign === '+' ? 'Gemacht, also Simple Past (regelmäßig mit -ed oder unregelmäßig).' : 'Nicht gemacht, also didn’t + Grundform.',
    fields: [{ label: 'Satz', judge: enJudge(['Ty ' + sol, 'He ' + sol], { grammar: true, past: true, sentence: true }), sol: `Ty ${sol}.` }] };
}
function trItem(lv, key, ref) {
  const row = TRANSFORM_RAW[idx(key, 'g.tr.')]; if (!row) return null;
  return { kind: 'type', ref, q: sent(row[0]), lead: 'Verneine den Satz.', x: /\b(was|were)\b/.test(row[0]) ? 'Bei be wird was zu wasn’t und were zu weren’t.' : 'didn’t + Grundform, also nicht die Past-Form.',
    fields: [{ label: 'Verneint', judge: enJudge([row[1]], { grammar: true, past: true, sentence: true }), sol: row[1] }] };
}
// Sentence builder; the trap words of the old app are named in the explanation.
function ordItem(lv, key, ref) {
  const row = ORDER_RAW[idx(key, 'g.ord.')]; if (!row) return null;
  const [s, traps] = row, end = s.slice(-1);
  return { kind: 'order', ref, q: `Bring die Wörter in die richtige Reihenfolge, sodass ${end === '?' ? 'eine Frage' : 'ein Aussagesatz'} entsteht.`, items: s.slice(0, -1).split(' '),
    x: `<i>${s}</i> Vorsicht, typische Falle: ${traps.map(t => `„${t}“`).join(' und ')} gehört nicht in diesen Satz.` };
}
// Writing workshop: a free sentence with didn't about the summer holidays.
function wnegItem(lv, key, ref) {
  const idea = WRITING_IDEAS[idx(key, 'w.')]; if (!idea) return null;
  const verb = idea.split(' ')[0];
  const judge = text => {
    const r = analyzeNeg(text);
    if (!r.ok) return { ok: false, hint: r.msg };
    if (!new RegExp(`\\bdid not ${verb}\\b`).test(canon(text))) return { ok: false, hint: `Schreib, dass du das nicht gemacht hast: didn’t ${verb} …` };
    if (/^[a-z]/.test(text.trim())) return { ok: true, typo: true, hint: 'Den Satzanfang schreibst du groß.' };
    return { ok: true };
  };
  return { kind: 'type', ref, q: `${sent(idea)}<small>${signBadge(false, '', 'nicht gemacht')}</small>`, lead: 'Was hast du in den Sommerferien nicht gemacht? Schreib einen ganzen Satz mit didn’t.',
    x: 'didn’t + Grundform, für alle Personen gleich.', fields: [{ label: 'Satz', judge, sol: `I didn't ${idea}.` }] };
}

// ---------------------------------------------------------------------------
// Gap stories: every sentence with gaps is one item (keys st.<story>.<n>), the
// sentence before it is shown for context.
// ---------------------------------------------------------------------------
function parseGaps(text) {
  const segs = [], re = /\[([^\]=]*)=([^\]]+)\]/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) segs.push({ t: text.slice(last, m.index) });
    segs.push({ hint: m[1].trim(), answers: m[2].split('|').map(s => s.trim()) });
    last = re.lastIndex;
  }
  if (last < text.length) segs.push({ t: text.slice(last) });
  return segs;
}
// Sentences of a story; dialogue lines ("Mum: ...") stay whole, gaps are never split.
function storyUnits(st) {
  const units = [];
  st.text.split('\n').forEach(line => {
    if (/^[A-Z][a-z]+: /.test(line)) { units.push(line); return; }
    let buf = '', depth = 0;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]; buf += ch;
      if (ch === '[') depth++;
      else if (ch === ']') depth--;
      else if (!depth && /[.!?]/.test(ch) && line[i + 1] === ' ') { units.push(buf.trim()); buf = ''; }
    }
    if (buf.trim()) units.push(buf.trim());
  });
  return units;
}
const solved = segs => segs.map(s => s.t !== undefined ? s.t : `<b>${s.answers[0]}</b>`).join('');
const STORY_ITEMS = {};
STORIES.forEach(st => {
  const units = storyUnits(st).map(parseGaps);
  STORY_ITEMS[st.id] = units.map((segs, u) => ({ segs, prev: u ? solved(units[u - 1]) : '' })).filter(x => x.segs.some(s => s.t === undefined));
});
const STORY_BY_ID = Object.fromEntries(STORIES.map(s => [s.id, s]));
function storyItem(lv, key, ref) {
  const m = key.match(/^st\.(\w+)\.(\d+)$/); if (!m) return null;
  const st = STORY_BY_ID[m[1]], u = (STORY_ITEMS[m[1]] || [])[+m[2]]; if (!u) return null;
  let n = 0;
  const gaps = u.segs.filter(s => s.t === undefined);
  const html = u.segs.map(s => s.t !== undefined ? s.t : `<span class="blank">(${++n})</span>${s.hint ? ` <span class="vhint">(${s.hint})</span>` : ''}`).join('');
  return { kind: 'type', ref, lead: `<b>${st.title}</b> · ${st.intro}`, q: `${u.prev ? `<span class="ctx">${u.prev}</span>` : ''}${sent(html)}`, x: `<i>${solved(u.segs)}</i>`,
    fields: gaps.map((g, i) => ({ label: `(${i + 1})${g.hint ? ' ' + g.hint : ''}`, judge: enJudge(g.answers), sol: g.answers[0] })) };
}

// ---------------------------------------------------------------------------
// Listening: statements as true/false cards (tf, keys ls.<text>.<n>) and whole
// texts with all statements like in the test (tfset, keys ls.<text>).
// ---------------------------------------------------------------------------
const LISTEN_BY_ID = Object.fromEntries(LISTENING.map(L => [L.id, L]));
const playerHtml = (id, limit = 0) => `<span class="player"><button type="button" class="btn small listen" data-listen="${id}" data-limit="${limit}">${ICON.soundOn}<span>Hörtext abspielen</span></button><span class="plays" data-plays="${id}"></span></span>`;
const transcriptBtn = id => `<button type="button" class="btn small" data-transcript="${id}">Hörtext lesen</button>`;
function tfItem(lv, key, ref) {
  const m = key.match(/^ls\.(\w+)\.(\d+)$/); if (!m) return null;
  const L = LISTEN_BY_ID[m[1]], row = L && L.q[+m[2]]; if (!row) return null;
  return { kind: 'swipe', ref, ok: row[1], yes: 'true', no: 'false', t: `<span class="tf-st">${row[0]}</span>`,
    prompt: `${playerHtml(L.id)}<span class="tf-ask">Hör dir „${L.title}“ an. Stimmt die Aussage, also true, oder ist sie false?</span>`, x: transcriptBtn(L.id) };
}
function tfsetItem(lv, key, ref) {
  const L = LISTEN_BY_ID[key.replace(/^ls\./, '')]; if (!L || !/^ls\./.test(key)) return null;
  return { kind: 'groups', ref, q: `${playerHtml(L.id, 2)}<span class="tf-ask">„${L.title}“: Du hörst den Text höchstens zweimal, wie in der Arbeit. Sind die Aussagen true oder false?</span>`,
    groups: ['true', 'false'], items: L.q.map(([s, t]) => [s, t ? 0 : 1]), x: transcriptBtn(L.id) };
}
function dictItem(lv, key, ref) {
  const t = DICTATION[idx(key, 'dc.')]; if (!t) return null;
  return { kind: 'type', ref, q: `<button type="button" class="btn listen" data-say="${esc(t)}">${ICON.soundOn}<span>Satz anhören</span></button>`, lead: 'Hör genau zu und schreib den Satz auf. Du kannst ihn so oft anhören, wie du willst.',
    x: '', fields: [{ label: 'Satz', judge: enJudge([t], { sentence: true, question: /\?$/.test(t) }), sol: t }] };
}

// ---------------------------------------------------------------------------
// Reading, British vs. American English and the dice sentences
// ---------------------------------------------------------------------------
function rdItem(lv, key, ref) {
  const r = READING[idx(key, 'rd.')]; if (!r) return null;
  return mcFrom({ q: `<span class="en-q">${r.q}</span><small class="qhint">${READING_TEXTS[r.p]} (Buch S. ${r.p})</small>`, o: r.o, a: 0, x: `Das steht im Text auf S. ${r.p}.` }, ref);
}
function beqItem(lv, key, ref) {
  const m = key.match(/^be\.(ae|be)\.(\d+)$/); if (!m) return null;
  const row = BEAE[+m[2]]; if (!row) return null;
  const [be, ae, de] = row, toAe = m[1] === 'ae', col = toAe ? 1 : 0;
  const wrong = shuffle(BEAE.filter(x => x !== row).map(x => x[col])).slice(0, 3);
  return mcFrom({ q: toAe ? `Was sagt man in Amerika statt <b>${be}</b>?` : `Was sagt man in Großbritannien statt <b>${ae}</b>?`, o: [row[col], ...wrong], a: 0,
    x: `Britisch <b>${be}</b>, amerikanisch <b>${ae}</b>, auf Deutsch ${de}.` }, ref);
}
function bespItem(lv, key, ref) {
  const row = SPELLING[idx(key, 'be.sp.')]; if (!row) return null;
  return { kind: 'type', ref, q: `${row[0]}<small>amerikanische Schreibweise</small>`, lead: 'Schreib das Wort so, wie man es in Großbritannien schreibt.', x: `Amerikanisch ${row[0]}, britisch <b>${row[1]}</b>.`,
    fields: [{ label: 'Britisch', judge: enJudge([row[1]]), sol: row[1] }] };
}
function diceItem(lv, key, ref) {
  const m = key.match(/^dice\.(a|c)\.(\d+)$/); if (!m) return null;
  const row = (m[1] === 'a' ? DICE_ACT : DICE_COM)[+m[2]]; if (!row) return null;
  return { kind: 'type', ref, q: sent(row[0]), lead: m[1] === 'a' ? 'Something funny for money: Was hast du für den guten Zweck gemacht? Schreib einen Satz im Simple Past mit I.' : 'Und wie war es? Schreib deinen Kommentar im Simple Past mit I.',
    x: '', fields: [{ label: 'Satz', judge: enJudge([row[1], row[1].replace(/^I /, '')], { sentence: true }), sol: row[1] }] };
}

// ---------------------------------------------------------------------------
// Registry. Levels name their content: words (vocabulary ids), verbs, rules,
// range ([from, to] of a data list), text (one listening text) or page.
// ---------------------------------------------------------------------------
const EQ_QUIZ_TYPES = {
  vmc: quizType(lv => lv.words, vmcItem),
  vdmc: quizType(lv => lv.words, vdmcItem),
  vtype: quizType(lv => lv.words, vtypeItem),
  vpairs: quizType(lv => pairChunks(lv).map((_, i) => 'p' + i), vpairsItem),
  ivmc: quizType(lv => VERBS.map(v => v.id), ivmcItem),
  ivblitz: quizType(lv => VERBS.map(v => v.id), ivmcItem),
  ivpast: quizType(lv => VERBS.slice(...(lv.range || [])).map(v => v.id), ivpastItem),
  ivbase: quizType(lv => VERBS.map(v => v.id + '.r'), ivbaseItem),
  reg: quizType(lv => REGULAR_RAW.filter(r => lv.rules.includes(r[2])).map(r => 'g.reg.' + r[0]), regItem),
  sigt: quizType(lv => levelKeys(lv, 'g.sig.', SIGNAL_RAW.length), sigtItem),
  sig: quizType(lv => levelKeys(lv, 'g.sig.', SIGNAL_RAW.length), sigItem),
  q: quizType(lv => levelKeys(lv, 'g.q.', QUESTIONS_RAW.length), qItem),
  bq: quizType(lv => levelKeys(lv, 'g.bq.', BE_QUESTIONS_RAW.length), bqItem),
  sa: quizType(lv => levelKeys(lv, 'g.sa.', SHORT_RAW.length), saItem),
  mcg: quizType(lv => levelKeys(lv, 'g.mc.', MC_GRAMMAR_RAW.length), mcgItem),
  ty: quizType(lv => levelKeys(lv, 'g.ty.', TY_LIST_RAW.length), tyItem),
  tr: quizType(lv => levelKeys(lv, 'g.tr.', TRANSFORM_RAW.length), trItem),
  ord: quizType(lv => levelKeys(lv, 'g.ord.', ORDER_RAW.length), ordItem),
  wneg: quizType(() => rangeKeys('w.', WRITING_IDEAS.length), wnegItem),
  story: quizType(lv => STORY_ITEMS[lv.story].map((_, i) => `st.${lv.story}.${i}`), storyItem),
  tf: quizType(lv => LISTEN_BY_ID[lv.text].q.map((_, i) => `ls.${lv.text}.${i}`), tfItem),
  tfset: quizType(() => LISTENING.map(L => 'ls.' + L.id), tfsetItem),
  dict: quizType(() => rangeKeys('dc.', DICTATION.length), dictItem),
  rd: quizType(lv => READING.map((r, i) => (!lv.page || r.p === lv.page) ? 'rd.' + i : null).filter(Boolean), rdItem),
  beq: quizType(() => BEAE.flatMap((_, i) => ['be.ae.' + i, 'be.be.' + i]), beqItem),
  besp: quizType(() => rangeKeys('be.sp.', SPELLING.length), bespItem),
  dice: quizType(() => [...rangeKeys('dice.a.', DICE_ACT.length), ...rangeKeys('dice.c.', DICE_COM.length)], diceItem),
};

// ---------------------------------------------------------------------------
// Listening player: plays a text with two voices, counts the plays (whole texts
// like in the test only twice) and shows the transcript afterwards.
// ---------------------------------------------------------------------------
let listenRun = null, listenPlays = {}, listening = '';
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-listen]'); if (!b) return;
  e.preventDefault();
  const id = b.dataset.listen, L = LISTEN_BY_ID[id];
  if (!('speechSynthesis' in window)) { toast('Keine Sprachausgabe', 'Dieser Browser kann nicht vorlesen. Tippe nach der Antwort auf „Hörtext lesen“.'); return; }
  if (listening === id) { stopSpeech(); return; }
  if (run !== listenRun) { listenRun = run; listenPlays = {}; }
  const n = listenPlays[id] || 0, limit = +b.dataset.limit || 0;
  if (limit && n >= limit) { toast('Schon zweimal gehört', 'Wie in der Arbeit hörst du den Text nur zweimal.'); return; }
  listenPlays[id] = n + 1; listening = id;
  const label = () => { const p = $(`[data-plays="${id}"]`); if (p) p.textContent = `${listenPlays[id]}× gehört${limit ? ` von ${limit}` : ''}`; };
  const face = playing => { const btn = $(`[data-listen="${id}"]`); if (btn) { btn.classList.toggle('playing', playing); $('span', btn).textContent = playing ? 'Stopp' : 'Nochmal abspielen'; } };
  label(); face(true);
  await speakLines(L.lines, L.voices ? Object.keys(L.voices)[1] : null);
  if (listening === id) listening = ''; face(false);
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-transcript]'); if (!b) return;
  const L = LISTEN_BY_ID[b.dataset.transcript];
  modal(`<p class="hand">Hörtext</p><h2>${L.title}</h2><div class="transcript">${L.lines.map(([w, t]) => `<p>${L.voices ? `<b>${L.voices[w]}:</b> ` : ''}${t}</p>`).join('')}</div>`, [{ label: 'Schließen', cls: 'primary' }]);
});
// Leaving a level stops the voice.
document.addEventListener('click', e => { if (e.target.closest('#quit, #toMap, #nextLvl, #again')) stopSpeech(); }, true);
