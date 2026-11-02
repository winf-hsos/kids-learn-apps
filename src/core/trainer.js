// Endless trainer: asks every card the app lists in APP.trainer again and again,
// weak cards more often (a Leitner scheme). Each card sits in a box from 0 to 5.
// A right answer moves it up one box, multiple choice only up to box 3 and typed
// answers up to box 5; a wrong answer moves it down two boxes. The box decides
// when the card comes back and whether it is asked as multiple choice or typed.
// Every TRAINER_TICKET right answers earn a game ticket.
//
// APP.trainer = { title, unit, unitOne, intro, cards: () => ids, item: (id, typed) => quiz item, label: id => html }

const TRAINER = APP.trainer || null;
const TRAINER_TICKET = (TRAINER && TRAINER.ticketEvery) || 20;
const TRAINER_GAP = [3, 3, 5, 9, 20, 45];     // questions until a card in box b comes back
const TRAINER_TYPED = [0, .4, .7, .8, 1, 1];    // chance of a typed question per box
const TRAINER_LEVELS = [
  { id: 'top', name: 'sitzen top', sing: 'sitzt top', one: 'sitzt top', test: c => c.n > 0 && c.b >= 4 },
  { id: 'good', name: 'sitzen gut', sing: 'sitzt gut', one: 'sitzt gut', test: c => c.n > 0 && c.b >= 2 && c.b < 4 },
  { id: 'weak', name: 'brauchen mehr Wiederholung', sing: 'braucht mehr Wiederholung', one: 'üben', test: c => c.n > 0 && c.b < 2 },
  { id: 'new', name: 'noch nicht geübt', sing: 'noch nicht geübt', one: 'neu', test: c => !c.n },
];

// state.trainer.top remembers every card that ever reached the top level; it
// earns the trainer's stars (see trainerStars in engine.js). Progress from before
// it existed counts the cards that are top right now.
function trainerState() {
  if (!state.trainer) state.trainer = { step: 0, bank: 0, cards: {} };
  const ts = state.trainer;
  if (!ts.top) ts.top = Object.fromEntries(Object.entries(ts.cards).filter(([, c]) => c.n && c.b >= 4).map(([id]) => [id, 1]));
  return ts;
}
const trainerCard = id => trainerState().cards[id] || { b: 0, n: 0, due: 0 };
const trainerLevel = id => TRAINER_LEVELS.find(l => l.test(trainerCard(id)));
// "3 Vokabeln sitzen top", "1 Vokabel sitzt top"
const trainerCount = (n, l) => `${n} ${n === 1 ? TRAINER.unitOne || TRAINER.unit : TRAINER.unit} ${n === 1 ? l.sing : l.name}`;
function trainerStats() {
  const ids = TRAINER.cards(), groups = Object.fromEntries(TRAINER_LEVELS.map(l => [l.id, []]));
  ids.forEach(id => groups[trainerLevel(id).id].push(id));
  return { ids, groups, pct: k => ids.length ? Math.round(groups[k].length / ids.length * 100) : 0 };
}

// Due cards still being learned (below box 3) come first, the weakest first.
// While fewer than eight cards are being learned, a new card joins, but only every
// other time when known cards are due for a check. Then due known cards, and when
// nothing is due the card that is due soonest comes early.
function trainerPick(last) {
  const step = trainerState().step, ids = TRAINER.cards().filter(id => id !== last);
  const seen = ids.filter(id => trainerCard(id).n), fresh = ids.filter(id => !trainerCard(id).n);
  const due = seen.filter(id => trainerCard(id).due <= step).sort((a, b) => trainerCard(a).b - trainerCard(b).b || trainerCard(a).due - trainerCard(b).due);
  const learning = seen.filter(id => trainerCard(id).b < 3);
  if (due.length && trainerCard(due[0]).b < 3) return due[0];
  if (fresh.length && learning.length < 8 && (!due.length || Math.random() < .5)) return pick(fresh);
  if (due.length) return due[0];
  return seen.sort((a, b) => trainerCard(a).due - trainerCard(b).due)[0] || last;
}

function trainerAnswer(id, typed, ok) {
  const ts = trainerState(), c = { ...trainerCard(id) }, before = trainerLevel(id).id;
  ts.step++; c.n++;
  c.b = ok ? (typed ? Math.min(5, c.b + 1) : c.b < 3 ? c.b + 1 : c.b) : Math.max(0, c.b - 2);
  c.due = ts.step + (ok ? Math.round(TRAINER_GAP[c.b] * (.8 + Math.random() * .4)) : TRAINER_GAP[0]);
  ts.cards[id] = c;
  const after = trainerLevel(id).id;
  if (after === 'top' && before !== 'top') { run.newTop++; toast(`${TRAINER.label(id)}`, 'sitzt jetzt top!', ICON.star()); }
  if (after === 'top' && !ts.top[id]) {
    const prevStars = totalStars(), prevOwn = trainerStars();
    ts.top[id] = 1;
    if (trainerStars() > prevOwn) {
      save(); renderStatus(); Sound.fanfare(); Confetti.burst(120);
      toast('Neuer Stern!', `${trainerStars() * TRAINER_STAR_CARDS} ${TRAINER.unit} haben es schon auf top geschafft.`, ICON.star());
      checkGameUnlocks(prevStars);
    }
  }
  if (ok && ++ts.bank >= TRAINER_TICKET) {
    ts.bank = 0;
    const got = grantTickets(1);
    toast(got ? '+1 Spiel-Ticket' : 'Ticket-Vorrat voll', `${TRAINER_TICKET} richtige Antworten im ${TRAINER.title}.${got ? '' : ' Ab in die Arcade!'}`, ICON.ticket);
    Sound.coin();
  }
  save();
}

function startTrainer() {
  run = {
    mode: 'trainer', endless: true, items: [], i: 0, total: 0, correct: 0, combo: 0, xp: 0, asked: 0, newTop: 0, title: TRAINER.title,
    // Called by quizStep whenever the next question is needed.
    next() {
      const last = run.items.length ? run.items[run.items.length - 1].card : null;
      const id = trainerPick(last), typed = Math.random() < TRAINER_TYPED[trainerCard(id).b];
      const it = TRAINER.item(id, typed);
      run.items.push({ ...it, card: id, ref: null });
      run.title = `${TRAINER.title} · ${trainerLevel(id).one}`;
    },
    progress: () => trainerStats().pct('top') / 100,
    extra: () => `<span class="chip trainer-chip">${ICON.ticket}${trainerState().bank}/${TRAINER_TICKET}</span>`,
    onAnswer(ok, xp) { run.asked++; trainerAnswer(run.items[run.i].card, run.items[run.i].kind === 'type', ok); addXp(xp); },
    onQuit: () => trainerOverview(),
  };
  quizStep();
}

function trainerBar(st) {
  return `<div class="tr-bar">${TRAINER_LEVELS.map(l => st.groups[l.id].length ? `<i class="tr-${l.id}" style="flex:${st.groups[l.id].length}"></i>` : '').join('')}</div>`;
}

// Overview with the share of cards per level; after a round it also sums up the round.
function trainerOverview() {
  const last = run && run.mode === 'trainer' ? run : null;
  run = null;
  const st = trainerStats(), ts = trainerState();
  const round = last && last.asked ? `<p class="lead tr-round">In dieser Runde: ${last.asked} ${last.asked === 1 ? 'Frage' : 'Fragen'}, ${last.correct} richtig${last.newTop ? `, und ${trainerCount(last.newTop, TRAINER_LEVELS[0]).replace(/ top$/, ' jetzt top')}` : ''}.</p>` : '';
  openStage(`${stageTop(st.pct('top') / 100)}
    <div class="trainer">
      <p class="hand">${TRAINER.title}</p>
      <h1>${st.pct('top')} % ${st.groups.top.length === 1 ? 'sitzt' : 'sitzen'} top</h1>
      ${round}
      ${trainerBar(st)}
      <div class="tr-legend">${TRAINER_LEVELS.map(l => `<div><i class="tr-${l.id}"></i><b>${st.groups[l.id].length}</b><span>${st.groups[l.id].length === 1 ? l.sing : l.name}</span><em>${st.pct(l.id)} %</em></div>`).join('')}</div>
      <p class="tr-stars">${ICON.star()}<span><b>${trainerStars()} von ${trainerMaxStars()} Sternen</b> aus dem Trainer. Für je ${TRAINER_STAR_CARDS} ${TRAINER.unit}, die top sitzen, gibt es einen Stern, und den behältst du.</span></p>
      <p class="tr-how">${TRAINER.intro || ''} Was noch nicht sitzt, kommt öfter dran. Top sitzt ein Wort erst, wenn du es mehrmals richtig eingetippt hast. Für je ${TRAINER_TICKET} richtige Antworten gibt es ein Spiel-Ticket, noch ${TRAINER_TICKET - ts.bank} bis zum nächsten.</p>
      <div class="actions"><button class="btn go" id="trGo">${ts.step ? 'Weiter trainieren' : 'Training starten'}</button><button class="btn" id="trBack">Zum Lernpfad</button></div>
      ${TRAINER_LEVELS.filter(l => st.groups[l.id].length).map(l => `<details class="tr-list"><summary><i class="tr-${l.id}"></i>${trainerCount(st.groups[l.id].length, l)}</summary>
        <div class="tr-words">${st.groups[l.id].map(id => `<span>${TRAINER.label(id)}</span>`).join('')}</div></details>`).join('')}
    </div>`);
  bindQuit();
  $('#trGo').onclick = () => { Sound.click(); startTrainer(); };
  $('#trBack').onclick = () => { closeStage(); render(); };
  onKey(e => { if (e.key === 'Enter') { e.preventDefault(); startTrainer(); } });
  if (last && last.newTop) Confetti.burst(90);
}

function trainerTileHtml() {
  if (!TRAINER) return '';
  const st = trainerStats();
  return `<button class="trainer-tile" data-act="trainer">
    <div class="tt-head"><b>${TRAINER.title}</b><span>${st.groups.new.length === st.ids.length ? 'noch nicht gestartet' : `${st.pct('top')} % top · ${st.pct('good')} % gut · ${st.groups.weak.length} zum Üben`}</span></div>
    ${trainerBar(st)}
    <span class="tt-go">Alle ${st.ids.length} ${TRAINER.unit} üben, so lange du willst. Je ${TRAINER_STAR_CARDS} ${TRAINER.unit}, die top sitzen, geben einen Stern (${trainerStars()}/${trainerMaxStars()}), und je ${TRAINER_TICKET} richtige Antworten ein Ticket.</span></button>`;
}
