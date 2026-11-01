// Quiz types for the English vocabulary (data in words.js). Item keys are word ids,
// spelling cards use "id.variant" (0 = correct spelling, 1+ = a misspelling).

const deText = w => w.de.join('; ');
const sameEn = (a, b) => WORD[a].en === WORD[b].en;
const sample = (lv, keys) => shuffle(keys).slice(0, lv.n || keys.length);
const others = (lv, id) => shuffle(lv.words.filter(o => o !== id && !sameEn(o, id)));

// Read words aloud with the browser's English voice, from any element with data-say.
function speakEn(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text.replace(/\bsb\b/g, 'somebody').replace(/\bsth\b/g, 'something'));
  u.lang = 'en-GB'; u.rate = .9;
  const v = speechSynthesis.getVoices().find(x => /^en(-|_)GB/i.test(x.lang)) || speechSynthesis.getVoices().find(x => /^en/i.test(x.lang));
  if (v) u.voice = v;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
const sayBtn = text => `<button type="button" class="say" data-say="${esc(text)}" aria-label="Anhören">${ICON.soundOn}</button>`;
document.addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b) { e.preventDefault(); speakEn(b.dataset.say); } });

// Accepted English answers: with or without "to", without sb/sth, it's = it is.
function enAccept(w) {
  const out = new Set();
  [w.en, ...(w.alsoEn || [])].forEach(a => {
    const base = [a, a.replace(/\s*\((AE|BE)\)/, '')];
    base.forEach(b => {
      const forms = [b, b.replace(/\bsb\b/, 'somebody'), b.replace(/\bsb\b/, 'someone'), b.replace(/ sb\b/, ''), b.replace(/\bsth\b/, 'something'), b.replace(/ sth\b/, '')];
      forms.forEach(f => { out.add(f); out.add(f.replace(/^to /, '')); out.add(f.replace(/(\w)'s\b/, '$1 is')); });
    });
  });
  return [...out];
}
// Accepted German answers: abbreviations spelled out or left away, "sich" optional, nouns with article.
function deAccept(w) {
  const out = new Set();
  [...w.de, ...(w.alsoDe || [])].forEach(d => {
    const forms = [d, d.replace(/jmdn\./g, 'jemanden'), d.replace(/jmdn\. /g, ''), d.replace(/etw\./g, 'etwas'), d.replace(/etw\. /g, ''),
      d.replace(/\(sich\) /, ''), d.replace(/\((sich)\)/, '$1'), d.replace(/^sich (etw\. )?/, '')];
    forms.forEach(f => { out.add(f); if (w.g) out.add(`${w.g} ${f}`); });
  });
  return [...out];
}

function explain(w) {
  return `<b>${w.en}</b>: ${deText(w)}.${w.note ? ` ${w.note}` : ''}<br><i>${w.ex.replace('___', `<b>${w.gap}</b>`)}</i>`;
}
const dePrompt = w => `${deText(w)}${w.hint ? `<small>${w.hint}</small>` : ''}`;

// German -> English, typed and spelled exactly (no typo tolerance, the test checks spelling).
function dtypeItem(lv, id, ref) {
  const w = WORD[id]; if (!w) return null;
  return { kind: 'type', ref, q: dePrompt(w), lead: 'Wie heißt das auf Englisch? Achte auf die Schreibweise.', x: explain(w),
    fields: [{ label: 'Englisch', accept: enAccept(w), traps: w.traps || [], strict: true, sol: w.en }] };
}
// English -> German, typed; one typo is fine here.
function etypeItem(lv, id, ref) {
  const w = WORD[id]; if (!w) return null;
  return { kind: 'type', ref, q: `${w.en}${sayBtn(w.en)}`, lead: 'Was heißt das auf Deutsch? Eine Bedeutung reicht.', x: explain(w),
    fields: [{ label: 'Deutsch', accept: deAccept(w), sol: deText(w) }] };
}
function emcItem(lv, id, ref) {
  const w = WORD[id]; if (!w) return null;
  return mcFrom({ q: `Was heißt <b>${w.en}</b>? ${sayBtn(w.en)}`, o: [deText(w), ...others(lv, id).slice(0, 3).map(o => deText(WORD[o]))], a: 0, x: explain(w) }, ref);
}
function dmcItem(lv, id, ref) {
  const w = WORD[id]; if (!w) return null;
  return mcFrom({ q: `Wie heißt <b>${deText(w)}</b> auf Englisch?${w.hint ? `<small class="qhint">${w.hint}</small>` : ''}`, o: [w.en, ...others(lv, id).slice(0, 3).map(o => WORD[o].en)], a: 0, x: explain(w) }, ref);
}
function gapItem(lv, id, ref) {
  const w = WORD[id]; if (!w) return null;
  const wrong = others(lv, id).map(o => WORD[o].gap).filter(g => g.toLowerCase() !== w.gap.toLowerCase());
  return mcFrom({ q: `<span class="gap-sent">${w.ex.replace('___', '<span class="blank">______</span>')}</span>`, o: [w.gap, ...[...new Set(wrong)].slice(0, 3)], a: 0, x: explain(w) }, ref);
}
function pastItem(lv, id, ref) {
  const w = WORD[id]; if (!w || !w.past) return null;
  const [base, past] = w.past;
  return { kind: 'type', ref, q: base, lead: 'Wie heißt die Vergangenheit (simple past)?', x: `${base} – <b>${past}</b>. ${explain(w)}`,
    fields: [{ label: 'Simple past', accept: [past, ...(w.alsoPast || [])], traps: (w.traps || []).filter(t => t.answers.some(a => /ed$/.test(a))), strict: true, sol: past }] };
}
// Spelling cards: right or wrong spelling of a word, with its German meaning.
function spellKeys(lv) {
  const ids = shuffle(lv.words.filter(id => WORD[id].spell)).slice(0, lv.n || 12);
  return ids.map((id, i) => `${id}.${i % 2 ? 1 + Math.floor(Math.random() * WORD[id].spell.length) : 0}`);
}
function spellItem(lv, key, ref) {
  const [id, k] = key.split('.'), w = WORD[id]; if (!w || !w.spell) return null;
  const shown = +k ? w.spell[+k - 1] : w.en;
  if (!shown) return null;
  return { kind: 'swipe', ref, prompt: 'Ist das Wort richtig geschrieben?', yes: 'Richtig', no: 'Falsch', ok: !+k,
    t: `<span class="swipe-en">${shown}</span><span class="swipe-de">${deText(w)}</span>`,
    x: +k ? `Richtig geschrieben: <b>${w.en}</b>.` : `<b>${w.en}</b> ist richtig geschrieben.` };
}

const VOCAB_QUIZ_TYPES = {
  emc: { keys: lv => sample(lv, lv.words), item: emcItem },
  dmc: { keys: lv => sample(lv, lv.words), item: dmcItem },
  gap: { keys: lv => sample(lv, lv.words), item: gapItem },
  dtype: { keys: lv => sample(lv, lv.words), item: dtypeItem },
  etype: { keys: lv => sample(lv, lv.words), item: etypeItem },
  past: { keys: lv => sample(lv, lv.words.filter(id => WORD[id].past)), item: pastItem },
  spell: { keys: spellKeys, item: spellItem },
};

// Match level with six random pairs from the level's words.
function vocabMatchLevel() {
  const ids = shuffle(run.lv.words).reduce((acc, id) => acc.length < 6 && !acc.some(o => sameEn(o, id)) ? [...acc, id] : acc, []);
  run.lv = { ...run.lv, pairs: ids.map(id => ({ a: WORD[id].en, b: deText(WORD[id]) })) };
  matchLevel();
}

// Learn cards: card.words becomes a vocabulary table with a listen button per word.
function vocabLearnExtras(c, mode) {
  if (!c.words) return {};
  return { bottom: `<table class="vtab"><tbody>${c.words.map(id => { const w = WORD[id]; return `<tr><td class="en">${w.en}${mode === 'card' ? sayBtn(w.en) : ''}</td><td>${deText(w)}<small>${w.ex.replace('___', w.gap)}</small></td></tr>`; }).join('')}</tbody></table>` };
}
