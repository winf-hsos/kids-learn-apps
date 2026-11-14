// Quiz types for the irregular verbs (data in verbs.js). Item keys are verb ids;
// keys of the form "id.n" name a form index (0 infinitive, 1 simple past, 2 past
// participle): the missing form for "formmc", the given form for "fill", and for
// "vswipe" which form is shown wrong (0 = the whole row is right).

const deText = v => v.de.join(', ');
const toForm = (v, i) => i ? v.f[i] : `to ${v.f[0]}`;
const rowText = v => v.f.map((_, i) => toForm(v, i)).join(' – ');
const sayText = v => v.f.map(x => x.replace('/', ', ')).join(', ');
const sample = (lv, keys) => shuffle(keys).slice(0, lv.n || keys.length);
const formKeys = (lv, choices) => sample(lv, lv.words).map(id => `${id}.${pick(choices)}`);
const splitKey = key => { const [id, n] = key.split('.'); return [VERB[id], +n || 0]; };
// Verbs whose German meanings overlap (do/make, drive/ride) never appear as each other's wrong option.
const clash = (a, b) => VERB[a].de.some(d => VERB[b].de.includes(d));
const others = (lv, id) => shuffle(lv.words.filter(o => o !== id && !clash(o, id)));

// "to wake up" -> "waked up", the wrong regular form learners tend to write.
function regularEd(base) {
  const [w, ...rest] = base.split(' ');
  const ed = /e$/.test(w) ? `${w}d` : /[^aeiou]y$/.test(w) ? `${w.slice(0, -1)}ied` : `${w}ed`;
  return [ed, ...rest].join(' ');
}
function formAccept(v, i) {
  const out = [v.f[i], ...((v.also && v.also[i]) || [])];
  return i ? out : [...out, `to ${v.f[i]}`];
}
const isAccepted = (v, i, s) => formAccept(v, i).map(normAnswer).includes(normAnswer(s));

// Known wrong answers with a hint: the verb's own traps, then "to" before a past
// form, the other past form, the infinitive, the regular -ed form and a missing "up".
function formTraps(v, i) {
  const f = v.f[i], traps = [];
  if (v.traps && v.traps[i]) traps.push({ answers: v.traps[i][0], hint: v.traps[i][1] });
  if (i) {
    traps.push({ answers: formAccept(v, i).map(a => `to ${a}`), hint: 'Das „to“ gehört nur zum infinitive.' });
    const other = v.f[3 - i];
    if (!isAccepted(v, i, other)) traps.push({ answers: [other], hint: i === 1 ? `${other} ist das past participle, im simple past heißt es ${f}.` : `${other} ist das simple past, das past participle heißt ${f}.` });
    if (!isAccepted(v, i, v.f[0])) traps.push({ answers: [v.f[0]], hint: `${v.f[0]} ist der infinitive, gesucht ist das ${FORM_NAMES[i]}.` });
    const ed = regularEd(v.f[0]);
    if (!isAccepted(v, i, ed)) traps.push({ answers: [ed], hint: `to ${v.f[0]} ist unregelmäßig, die Form endet nicht auf -ed.` });
  }
  if (/ up$/.test(f)) { const bare = f.replace(/ up$/, ''); traps.push({ answers: [bare, `to ${bare}`], hint: `Das up gehört dazu: ${toForm(v, i)}.` }); }
  return traps;
}
const formField = (v, i) => ({ label: FORM_NAMES[i], accept: formAccept(v, i), traps: formTraps(v, i), strict: true, sol: toForm(v, i) });

// Made-up forms that look plausible: other vowels in the last vowel group of the first word.
function vowelSwaps(form) {
  const [w, ...rest] = form.split(' '), m = w.match(/^(.*?)([aeiou]+)([^aeiou]*)$/);
  if (!m) return [];
  return shuffle(['a', 'e', 'i', 'o', 'u', 'ou', 'ea'].filter(x => x !== m[2]).map(x => [m[1] + x + m[3], ...rest].join(' ')));
}
// Three wrong options for form i: hand-picked ones, then the other forms of the
// verb, the regular -ed form and made-up vowel changes.
function wrongForms(v, i) {
  const cands = [...((v.mcWrong && v.mcWrong[i]) || [])];
  if (i) cands.push(v.f[3 - i], regularEd(v.f[0]), ...vowelSwaps(v.f[i]), `${v.f[0]}${i === 2 ? 'en' : 's'}`);
  else cands.push(`to ${v.f[1]}`, `to ${v.f[2]}`, ...vowelSwaps(v.f[0]).map(x => `to ${x}`));
  // Short words without a vowel group (fly) fall back to verbs with the same first letter.
  cands.push(...shuffle(VERBS.filter(o => o !== v)).sort((a, b) => (b.f[0][0] === v.f[0][0]) - (a.f[0][0] === v.f[0][0])).map(o => toForm(o, i)));
  const seen = new Set();
  return cands.filter(c => {
    const n = normAnswer(c);
    if (seen.has(n) || isAccepted(v, i, c) || isAccepted(v, i, c.replace(/^to /, ''))) return false;
    seen.add(n); return true;
  }).slice(0, 3);
}

// The three forms side by side; forms not in show appear as "?".
function formsRow(v, show) {
  return `<span class="vforms">${v.f.map((_, i) => `<span class="${show.includes(i) ? '' : 'miss'}"><small>${FORM_NAMES[i]}</small><b>${show.includes(i) ? toForm(v, i).replace('/', '/<wbr>') : '?'}</b></span>`).join('')}</span>`;
}
const explain = v => `<b>${rowText(v)}</b> ${sayBtn(sayText(v))}<br>${deText(v)}.${v.note ? ` ${v.note}` : ''}`;
const dePrompt = v => `${deText(v)}${v.hint ? `<small>${v.hint}</small>` : ''}`;

// English infinitive -> German, multiple choice.
function vmcItem(lv, id, ref) {
  const v = VERB[id]; if (!v) return null;
  return mcFrom({ q: `Was heißt <b>${toForm(v, 0)}</b>? ${sayBtn(toForm(v, 0))}`, o: [deText(v), ...others(lv, id).slice(0, 3).map(o => deText(VERB[o]))], a: 0, x: explain(v) }, ref);
}
// One form is missing, multiple choice.
function formmcItem(lv, key, ref) {
  const [v, i] = splitKey(key); if (!v) return null;
  return mcFrom({ q: `Welche Form fehlt? <small class="qhint">${deText(v)}</small>${formsRow(v, [0, 1, 2].filter(k => k !== i))}`, o: [toForm(v, i), ...wrongForms(v, i)], a: 0, x: explain(v) }, ref);
}
function pastItem(lv, id, ref) {
  const v = VERB[id]; if (!v) return null;
  return { kind: 'type', ref, q: `${toForm(v, 0)}${sayBtn(toForm(v, 0))}<small>${deText(v)}</small>`, lead: 'Wie heißt das simple past?', x: explain(v), fields: [formField(v, 1)] };
}
function ppItem(lv, id, ref) {
  const v = VERB[id]; if (!v) return null;
  return { kind: 'type', ref, q: `${toForm(v, 0)}${sayBtn(toForm(v, 0))}<small>${deText(v)}</small>`, lead: 'Wie heißt das past participle?', x: explain(v), fields: [formField(v, 2)] };
}
// Like the worksheet: one form is given, the other two are typed.
function fillItem(lv, key, ref) {
  const [v, given] = splitKey(key); if (!v) return null;
  return { kind: 'type', ref, q: `${formsRow(v, [given])}<small>${deText(v)}</small>`, lead: 'Fülle die fehlenden Formen aus, wie auf dem Arbeitsblatt.', x: explain(v),
    fields: [0, 1, 2].filter(k => k !== given).map(k => formField(v, k)) };
}
// German -> all three forms typed.
function formsItem(lv, id, ref) {
  const v = VERB[id]; if (!v) return null;
  return { kind: 'type', ref, q: dePrompt(v), lead: 'Wie heißen die drei Formen auf Englisch?', x: explain(v), fields: [0, 1, 2].map(k => formField(v, k)) };
}
// Is the row right? "id.0" shows the right row, "id.1" and "id.2" a wrong simple past or past participle.
function vswipeKeys(lv) {
  return sample(lv, lv.words).map((id, k) => `${id}.${k % 2 ? 1 + Math.floor(Math.random() * 2) : 0}`);
}
function vswipeItem(lv, key, ref) {
  const [v, i] = splitKey(key); if (!v) return null;
  const wrong = i ? pick(wrongForms(v, i).filter(w => !/^to /.test(w))) : null;
  if (i && !wrong) return null;
  const forms = v.f.map((_, k) => k === i && wrong ? wrong : toForm(v, k));
  return { kind: 'swipe', ref, prompt: 'Stimmen alle drei Formen?', yes: 'Stimmt', no: 'Falsch', ok: !i,
    t: `<span class="swipe-en">${forms.join(' – ')}</span><span class="swipe-de">${deText(v)}</span>`,
    x: i ? `Falsch ist ${wrong}, richtig ist <b>${rowText(v)}</b>.` : `<b>${rowText(v)}</b> stimmt.` };
}

const VERB_QUIZ_TYPES = {
  vmc: { keys: lv => sample(lv, lv.words), item: vmcItem },
  formmc: { keys: lv => formKeys(lv, [1, 2, 1, 2, 0]), item: formmcItem },
  past: { keys: lv => sample(lv, lv.words), item: pastItem },
  pp: { keys: lv => sample(lv, lv.words), item: ppItem },
  fill: { keys: lv => formKeys(lv, [0, 0, 1, 2]), item: fillItem },
  forms: { keys: lv => sample(lv, lv.words), item: formsItem },
  vswipe: { keys: vswipeKeys, item: vswipeItem },
};

// Match level with six random pairs of infinitive and German meaning.
function verbMatchLevel() {
  const ids = shuffle(run.lv.words).reduce((acc, id) => acc.length < 6 && !acc.some(o => clash(o, id)) ? [...acc, id] : acc, []);
  run.lv = { ...run.lv, pairs: ids.map(id => ({ a: toForm(VERB[id], 0), b: deText(VERB[id]) })) };
  matchLevel();
}

// Learn cards: card.verbs becomes a table of the three forms with a listen button per verb.
function verbLearnExtras(c, mode) {
  if (!c.verbs) return {};
  return { bottom: `<table class="vtab"><thead><tr>${FORM_NAMES.map(n => `<th>${n}</th>`).join('')}</tr></thead><tbody>${c.verbs.map(id => {
    const v = VERB[id];
    return `<tr><td class="en">${toForm(v, 0)}${mode === 'card' ? sayBtn(sayText(v)) : ''}<small>${deText(v)}</small></td><td>${v.f[1].replace('/', '/<wbr>')}</td><td>${v.f[2].replace('/', '/<wbr>')}</td></tr>`;
  }).join('')}</tbody></table>` };
}

// Endless trainer: multiple choice asks a missing form or the meaning, typed
// questions ask the missing forms like the worksheet or all three from German.
function trainerItem(id, typed) {
  const lv = { words: VERB_IDS };
  if (typed) return Math.random() < .5 ? fillItem(lv, `${id}.${pick([0, 0, 1, 2])}`, null) : formsItem(lv, id, null);
  return Math.random() < .65 ? formmcItem(lv, `${id}.${pick([1, 2])}`, null) : vmcItem(lv, id, null);
}
