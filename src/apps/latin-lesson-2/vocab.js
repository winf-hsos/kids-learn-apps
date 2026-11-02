// Vocabulary engine of the Latin app: accepted answers, quiz types, the match
// level and the vocabulary tables on learn cards. Words are looked up by id in
// NOUNS, VERBS and WORDS (content.js). Quiz prompts show Latin without length
// marks, like a test sheet might; learn cards show them as in the book.

const plain = s => s.normalize('NFD').replace(/[̄̆]/g, '').normalize('NFC');
const FORM_INDEX = { inf: 0, sg: 1, pl: 2 };
const PRONOUNS = ['er', 'sie', 'es', 'er/sie/es', 'er/sie', 'er/es', 'sie/er'];

const laOf = (id, form = 'inf') => VERBS[id] ? VERBS[id][form] : (NOUNS[id] || WORDS[id]).la;

// German translation as shown to the learner, e.g. "er/sie/es liebt, mag".
function deOf(id, form = 'inf') {
  const v = VERBS[id];
  if (!v) return (NOUNS[id] || WORDS[id]).de.join(', ');
  const list = v.de.map(t => t[FORM_INDEX[form]]).join(', ');
  return form === 'sg' ? `er/sie/es ${list}` : form === 'pl' ? `sie ${list}` : list;
}

// Plain meanings used to keep look-alike answers out of the same question.
const meaningsOf = id => VERBS[id] ? VERBS[id].de.map(t => t[0]) : (NOUNS[id] || WORDS[id]).de;
const overlaps = (a, b) => meaningsOf(a).some(m => meaningsOf(b).includes(m));

// "etw. weiter tun" also counts as "etwas weiter tun" and "weiter tun".
const variants = s => s.includes('etw.') ? [s, s.replace('etw.', 'etwas'), s.replace('etw. ', '')] : [s];
const bareForms = (v, form) => [...v.de, ...(v.alt || [])].flatMap(t => variants(t[FORM_INDEX[form]]));
function verbAnswers(v, form) {
  const bare = bareForms(v, form);
  if (form === 'inf') return bare;
  if (form === 'pl') return bare.map(s => `sie ${s}`);
  return bare.flatMap(s => PRONOUNS.map(p => `${p} ${s}`));
}

// Answer field for one verb form, with hints for the typical mix-ups of person and number.
function verbField(id, form) {
  const v = VERBS[id], la = plain(v[form]);
  const [inf0, sg0, pl0] = v.de[0];
  const traps = {
    inf: [{ answers: [...verbAnswers(v, 'sg'), ...verbAnswers(v, 'pl')], hint: `${la} ist der Infinitiv, also nur „${inf0}“.` }],
    sg: [
      { answers: bareForms(v, 'sg'), hint: `Das Pronomen gehört dazu: „er/sie/es ${sg0}“.` },
      { answers: [...bareForms(v, 'inf'), ...verbAnswers(v, 'pl')], hint: `${la} endet auf -t, das ist die 3. Person Singular: „er/sie/es ${sg0}“.` },
    ],
    pl: [
      { answers: [...bareForms(v, 'pl'), ...bareForms(v, 'inf')], hint: `${la} endet auf -nt, das ist die 3. Person Plural. Das „sie“ gehört dazu: „sie ${pl0}“.` },
      { answers: verbAnswers(v, 'sg'), hint: `Das wäre der Singular (${plain(v.sg)}). ${la} endet auf -nt: „sie ${pl0}“.` },
    ],
  }[form];
  return { label: 'Deutsch', accept: verbAnswers(v, form), traps, sol: deOf(id, form) };
}

const ARTICLES = ['', 'der ', 'die ', 'das ', 'ein ', 'eine '];
function accField(id) {
  const n = NOUNS[id];
  return {
    label: n.g.includes('Pl.') ? 'Akkusativ Plural' : 'Akkusativ Singular', accept: [n.acc], strict: true, sol: `${n.acc} (${n.g})`,
    traps: n.acc === n.la ? [] : [{ answers: [n.la], hint: 'Das ist der Nominativ. Gesucht ist die Form aus der mittleren Spalte.' }],
  };
}
function meaningField(id) {
  const e = NOUNS[id] || WORDS[id];
  const traps = e.de[0].startsWith('sie ') ? [{ answers: [e.de[0].slice(4)], hint: `Das „sie“ gehört dazu: „${e.de[0]}“.` }] : [];
  return { label: 'Deutsch', accept: e.de.flatMap(d => NOUNS[id] ? ARTICLES.map(a => a + d) : [d]), traps, sol: e.de.join(', ') };
}

function explain(id) {
  if (NOUNS[id]) { const n = NOUNS[id]; return `<b>${n.la}, ${n.acc}</b> ${n.g}: ${n.de.join(', ')}${n.note ? ` (${n.note})` : ''}.`; }
  if (VERBS[id]) { const v = VERBS[id]; return `<b>${v.inf}, ${v.sg}, ${v.pl}</b>: ${deOf(id)}.${v.ex ? ` <i>${v.ex}</i>` : ''}`; }
  const w = WORDS[id]; return `<b>${w.la}</b> (${w.kind}): ${deOf(id)}.`;
}

// Item keys are a word id, or "verbId.form" for verbs.
function wordKeys(lv) { return lv.words.flatMap(id => VERBS[id] ? (lv.forms || ['inf']).map(f => `${id}.${f}`) : [id]); }
const sample = (lv, keys) => shuffle(keys).slice(0, lv.n || keys.length);
const splitKey = key => { const [id, form = 'inf'] = key.split('.'); return { id, form }; };

function typedItem(lv, key, ref) {
  const { id, form } = splitKey(key);
  if (VERBS[id]) return { kind: 'type', q: plain(VERBS[id][form]), lead: 'Übersetze genau diese Form.', fields: [verbField(id, form)], x: explain(id), ref };
  if (NOUNS[id]) return { kind: 'type', q: plain(NOUNS[id].la), lead: 'Akkusativ und Bedeutung, wie im Test.', fields: [accField(id), meaningField(id)], x: explain(id), ref };
  if (WORDS[id]) return { kind: 'type', q: plain(WORDS[id].la), lead: 'Was heißt das?', fields: [meaningField(id)], x: explain(id), ref };
  return null;
}

function mcItem(lv, key, ref) {
  const { id, form } = splitKey(key);
  if (!VERBS[id] && !NOUNS[id] && !WORDS[id]) return null;
  const pool = shuffle(lv.words.filter(o => o !== id && !overlaps(o, id)));
  const wrong = VERBS[id]
    ? [...['inf', 'sg', 'pl'].filter(f => f !== form).map(f => deOf(id, f)), deOf(pool[0], form)]
    : pool.slice(0, 3).map(o => deOf(o));
  const lead = lv.lead ? `<div class="type-lead">${lv.lead}</div>` : '';
  return mcFrom({ q: `${lead}Was heißt <b>${plain(laOf(id, form))}</b>?`, o: [deOf(id, form), ...wrong], a: 0, x: explain(id) }, ref);
}

// Swipe keys: "verbId.shownForm.claimedVerbId.claimedForm".
function swipeKeys(lv) {
  return shuffle(lv.words).slice(0, lv.n).map((id, i) => {
    const form = pick(['inf', 'sg', 'pl']);
    if (i % 2 === 0) return `${id}.${form}.${id}.${form}`;
    const other = shuffle(lv.words.filter(o => o !== id && !overlaps(o, id)))[0];
    return Math.random() < .65 ? `${id}.${form}.${id}.${pick(['inf', 'sg', 'pl'].filter(f => f !== form))}` : `${id}.${form}.${other}.${form}`;
  });
}
function swipeItem(lv, key, ref) {
  const [id, form, cid, cform] = key.split('.');
  if (!VERBS[id] || !VERBS[cid]) return null;
  return {
    kind: 'swipe', ref, prompt: 'Stimmt die Übersetzung?', yes: 'Richtig', no: 'Falsch', ok: id === cid && form === cform,
    t: `<span class="swipe-la">${plain(VERBS[id][form])}</span><span class="swipe-de">${deOf(cid, cform)}</span>`,
    x: `${plain(VERBS[id][form])} heißt „${deOf(id, form)}“.`,
  };
}

function conjItem(lv, id, ref) {
  const v = VERBS[id]; if (!v || v.noConj) return null;
  return { kind: 'mc', q: `Zu welcher Konjugation gehört <b>${plain(v.inf)}</b>?`, o: CONJ_ORDER.map(k => CONJ[k].name), a: CONJ_ORDER.indexOf(v.conj), x: `<b>${v.inf}, ${v.sg}, ${v.pl}</b>: ${CONJ[v.conj].rule}.`, ref };
}
function plformItem(lv, id, ref) {
  const v = VERBS[id]; if (!v || v.noConj) return null;
  return { kind: 'type', q: plain(v.inf), lead: 'Bilde die 3. Person Plural.', fields: [{ label: '3. Person Plural', accept: [v.pl], strict: true, sol: v.pl }], x: `${CONJ[v.conj].name}: ${CONJ[v.conj].rule}.`, ref };
}

// Acc -> nominative and meaning (workbook 1a shows accusative forms like frātrem).
function nomItem(lv, id, ref) {
  const n = NOUNS[id]; if (!n) return null;
  return { kind: 'type', q: plain(n.acc), lead: 'Das ist ein Akkusativ. Wie heißt das Wort im Nominativ, und was bedeutet es?', ref, x: explain(id),
    fields: [{ label: 'Nominativ', accept: [n.la], strict: true, sol: n.la }, meaningField(id)] };
}

// Sentence keys: "verbId.subjectIndex"; lv.dir is the number to form ('pl' or 'sg').
function numformItem(lv, key, ref) {
  const [id, si] = key.split('.'), v = VERBS[id], s = SUBJECTS[+si];
  if (!v || !s) return null;
  const to = lv.dir, from = to === 'pl' ? 'sg' : 'pl', de = v.de[0][FORM_INDEX[to]];
  return {
    kind: 'type', ref, lead: to === 'pl' ? 'Aus eins mach zwei: Setze das Verb in die 3. Person Plural.' : 'Aus zwei mach eins: Setze das Verb in die 3. Person Singular.',
    q: `<span class="sent">${plain(s[from])} ${plain(v[from])}.</span><span class="sent gap">${plain(s[to])} …</span>`,
    fields: [{ label: to === 'pl' ? '3. Person Plural' : '3. Person Singular', accept: [v[to]], strict: true, sol: v[to] }],
    x: `${s[to]} ${v[to]}: ${s[to + 'De']} ${de}. <i>${CONJ[v.conj].name}: ${CONJ[v.conj].rule}.</i>`,
  };
}
function numformKeys(lv) {
  return shuffle(lv.words).slice(0, lv.n).map(id => `${id}.${Math.floor(Math.random() * SUBJECTS.length)}`);
}

// dēbet/dēbent keys: "dutyIndex.subjectIndex.number.negated".
function debetKeys(lv) {
  return shuffle(DUTIES).slice(0, lv.n).map(d => `${DUTIES.indexOf(d)}.${Math.floor(Math.random() * SUBJECTS.length)}.${pick(['sg', 'pl'])}.${Math.random() < .25 ? 1 : 0}`);
}
function debetItem(lv, key, ref) {
  const [di, si, num, neg] = key.split('.'), d = DUTIES[+di], s = SUBJECTS[+si];
  if (!d || !s) return null;
  const pl = num === 'pl', not = neg === '1';
  const modal = not ? (pl ? 'dürfen nicht' : 'darf nicht') : (pl ? 'müssen' : 'muss');
  return {
    kind: 'mc', ref, q: `<div class="type-lead">Ein Subjekt oder mehrere?</div>${plain(s[num])} ${plain(d.la)} ${not ? 'non ' : ''}___`,
    o: [`${not ? 'nōn ' : ''}dēbet`, `${not ? 'nōn ' : ''}dēbent`], a: pl ? 1 : 0,
    x: `<b>${s[num]} ${d.la} ${not ? 'nōn ' : ''}${pl ? 'dēbent' : 'dēbet'}.</b> ${s[num + 'De']} ${modal} ${d.de}.`,
  };
}

const VOCAB_QUIZ_TYPES = {
  vmc: { keys: lv => sample(lv, wordKeys(lv)), item: mcItem },
  vacc: { keys: lv => sample(lv, lv.words), item: (lv, id, ref) => NOUNS[id] ? { kind: 'type', q: plain(NOUNS[id].la), lead: 'Wie lautet der Akkusativ?', fields: [accField(id)], x: explain(id), ref } : null },
  vtest: { keys: lv => sample(lv, wordKeys(lv)), item: typedItem },
  vswipe: { keys: swipeKeys, item: swipeItem },
  conj: { keys: lv => sample(lv, lv.words), item: conjItem },
  plform: { keys: lv => sample(lv, lv.words), item: plformItem },
  vnom: { keys: lv => sample(lv, lv.words), item: nomItem },
  numform: { keys: numformKeys, item: numformItem },
  debet: { keys: debetKeys, item: debetItem },
};

// Vocabulary trainer (src/core/trainer.js): Latin to German, as multiple choice
// or typed, verbs in a random form. Wrong options come from the same word class.
function trainerItem(id, typed) {
  const lv = { words: NOUNS[id] ? NOUN_IDS : VERBS[id] ? Object.keys(VERBS) : WORD_IDS };
  const key = VERBS[id] ? `${id}.${pick(['inf', 'sg', 'pl'])}` : id;
  if (!typed) return mcItem(lv, key, null);
  if (NOUNS[id]) return { kind: 'type', q: plain(NOUNS[id].la), lead: 'Was heißt das?', fields: [meaningField(id)], x: explain(id), ref: null };
  return typedItem(lv, key, null);
}

// Match level with six random pairs from the level's words.
function vocabMatchLevel() {
  const ids = shuffle(run.lv.words).reduce((acc, id) => acc.length < 6 && !acc.some(o => overlaps(o, id)) ? [...acc, id] : acc, []);
  run.lv = { ...run.lv, pairs: ids.map(id => ({ a: plain(laOf(id)), b: deOf(id) })) };
  matchLevel();
}

// ---------------------------------------------------------------------------
// Learn cards: vocabulary tables (card.vocab) and conjugation overviews
// (card.conj with rules, card.conjList with all verbs of some classes).
// ---------------------------------------------------------------------------
const CONJ_EXAMPLE = { a: 'amare', e: 'respondere', i: 'venire', cons: 'dicere', mixed: 'capere' };

function vocabRow(id) {
  if (NOUNS[id]) { const n = NOUNS[id]; return `<tr><td class="la">${n.la}</td><td>${n.acc} <i>${n.g}</i></td><td>${n.de.join(', ')}${n.note ? `<small>${n.note}</small>` : ''}</td></tr>`; }
  if (VERBS[id]) { const v = VERBS[id]; return `<tr><td class="la">${v.inf}</td><td>${v.sg}<br>${v.pl}</td><td>${deOf(id)}<small>${deOf(id, 'sg')}<br>${deOf(id, 'pl')}</small></td></tr>`; }
  const w = WORDS[id]; return `<tr><td class="la">${w.la}</td><td><i>${w.kind}</i></td><td>${deOf(id)}</td></tr>`;
}
const verbsOf = k => CONJ_VERBS.filter(id => VERBS[id].conj === k);

function vocabLearnExtras(c) {
  let html = '';
  if (c.vocab) html += `<table class="vtab"><tbody>${c.vocab.map(vocabRow).join('')}</tbody></table>`;
  if (c.conj) html += `<div class="conj-rules">${c.conj.map(k => { const v = VERBS[CONJ_EXAMPLE[k]]; return `<div class="conj-rule"><b>${CONJ[k].name}</b><span>${CONJ[k].rule}</span><span class="la">${v.inf}, ${v.sg}, ${v.pl}</span></div>`; }).join('')}</div>`;
  if (c.conjList) html += `<div class="conj-rules">${c.conjList.map(k => `<div class="conj-rule"><b>${CONJ[k].name}</b><span class="la">${verbsOf(k).map(id => `${VERBS[id].inf} (${VERBS[id].pl})`).join(', ')}</span></div>`).join('')}</div>`;
  return { bottom: html };
}
