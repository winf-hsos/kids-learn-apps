// Engine core: app configuration, persistent state, rewards and quiz items.
//
// Every app provides two globals before this file runs:
//   MANIFEST  injected by build.py from the app's manifest.json (id, school, subject, exam, ...)
//   APP       the app's config object (topics, ranks, games, art and optional extensions)

const WORLDS = APP.topics;
const EXAM = MANIFEST.exam || null;
const DAILY_GOAL = APP.dailyGoal || 150;
const RANKS = APP.ranks || [
  { xp: 0, name: 'Neuling' }, { xp: 150, name: 'Entdecker' }, { xp: 400, name: 'Durchstarter' },
  { xp: 800, name: 'Könner' }, { xp: 1300, name: 'Profi' }, { xp: 2000, name: 'Meister' }, { xp: 3000, name: 'Legende' },
];
const GAMES = (APP.games || []).map(g => ({ ...GAME_DEFS[g.id], ...g }));
const PRAISE = APP.praise || ['Richtig!', 'Volltreffer!', 'Stark!', 'Genau so!', 'Top!', 'Wie ein Profi!', 'Sauber!', 'Klasse!'];
const examName = EXAM ? EXAM.kind : 'Prüfung';
// German articles for the exam name, from manifest exam.gender (f: die Klassenarbeit, m: der Vokabeltest).
const examArt = { f: { acc: 'die', dat: 'der', to: 'zur', good: 'eine gute' }, m: { acc: 'den', dat: 'dem', to: 'zum', good: 'einen guten' }, n: { acc: 'das', dat: 'dem', to: 'zum', good: 'ein gutes' } }[(EXAM && EXAM.gender) || 'f'];
// An exam may have no date yet; then there is no countdown.
const examDay = EXAM && EXAM.date ? weekdayOf(EXAM.date) : '';
const artOf = key => (APP.art && APP.art(key)) || '';
// A world shows its picture (t.img, a file in the app's img/ folder) or else its drawing.
const worldArt = t => t.img ? `<img class="wimg" src="${t.img}" alt="" loading="lazy">` : artOf(t.art);

// Badges: generic ones, one per world and one per reward game the app uses.
const BADGES = [
  { id: 'first', name: 'Erster Versuch', desc: 'Das erste Level geschafft' },
  ...WORLDS.map(t => ({ id: 'world_' + t.id, name: t.badge || t.title, desc: `Welt „${t.title}“ komplett` })),
  { id: 'perfect', name: 'Perfektionist', desc: 'Ein Level mit 3 Sternen' },
  { id: 'combo10', name: 'Combo x10', desc: '10 richtige Antworten hintereinander' },
  { id: 'combo25', name: 'Unaufhaltsam', desc: '25 richtige Antworten hintereinander' },
  { id: 'xp1000', name: 'Fleißig', desc: '1000 XP gesammelt' },
  { id: 'fixer', name: 'Fehlerjäger', desc: '10 Fehler aus der Fehlerkiste repariert' },
  ...(APP.exam ? [
    { id: 'exam2', name: examDay ? `Bereit für ${examDay}` : 'Gut vorbereitet', desc: `Probe-${examName} mit Note 2 oder besser` },
    { id: 'exam1', name: 'Einser-Kandidat', desc: `Probe-${examName} mit Note 1` },
  ] : []),
  ...GAMES.filter(g => g.badge).map(g => g.badge),
];

// ---------------------------------------------------------------------------
// Persistent state (one localStorage entry per app, plus a summary for the hub)
// ---------------------------------------------------------------------------
const STORE_KEY = MANIFEST.storeKey || `kla:${MANIFEST.id}`;
// Tickets reward learning but must not pile up into hours of gaming: one ticket
// per three new stars, and never more than TICKET_CAP tickets at once.
const STARS_PER_TICKET = APP.starsPerTicket || 3;
const TICKET_CAP = APP.ticketCap || 3;

function defaultState() {
  return {
    xp: 0, tickets: 1, starBank: 0, levels: {}, mistakes: {}, fixed: 0, badges: {},
    bestCombo: 0, daily: { date: '', xp: 0 }, streak: { last: '', days: 0 },
    sound: true, games: Object.fromEntries(GAMES.map(g => [g.id, 0])),
    unlockedGames: {}, examBest: null, answered: 0, correct: 0, seenIntro: false,
  };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = Object.assign(defaultState(), JSON.parse(raw));
      s.games = Object.assign(defaultState().games, s.games);
      s.tickets = Math.min(s.tickets, TICKET_CAP);
      return s;
    }
  } catch (e) { /* storage unavailable */ }
  return defaultState();
}
const state = loadState();
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    localStorage.setItem(`kla:summary:${MANIFEST.id}`, JSON.stringify({
      xp: state.xp, rank: RANKS[rankIndex()].name, stars: totalStars(), maxStars: maxStars(),
      examBest: state.examBest, streak: state.streak, updated: Date.now(),
    }));
  } catch (e) { /* ignore */ }
}

const levelKey = (t, l) => `${WORLDS[t].id}:${l}`;
const starsOf = (t, l) => (state.levels[levelKey(t, l)] || {}).stars || 0;
// The trainer (src/core/trainer.js) adds one star per TRAINER_STAR_CARDS cards that have
// reached its top level at least once, so these stars are never lost again.
const TRAINER_STAR_CARDS = 5;
const trainerStars = () => APP.trainer && state.trainer ? Math.floor(Object.keys(state.trainer.top || {}).length / TRAINER_STAR_CARDS) : 0;
const trainerMaxStars = () => APP.trainer ? Math.floor(APP.trainer.cards().length / TRAINER_STAR_CARDS) : 0;
const totalStars = () => Object.values(state.levels).reduce((s, v) => s + (v.stars || 0), 0) + trainerStars();
const maxStarsOf = lv => lv.type === 'learn' ? 1 : 3;
const maxStars = () => WORLDS.reduce((s, t) => s + t.levels.reduce((a, lv) => a + maxStarsOf(lv), 0), 0) + trainerMaxStars();
// A level opens once the one before has a star; levels that already have stars (e.g. from a takeover) stay open.
const isUnlocked = (t, l) => l === 0 || starsOf(t, l) > 0 || starsOf(t, l - 1) > 0;
const worldDone = t => WORLDS[t].levels.every((_, l) => starsOf(t, l) > 0);
function rankIndex(xp = state.xp) { let r = 0; RANKS.forEach((k, i) => { if (xp >= k.xp) r = i; }); return r; }

// ---------------------------------------------------------------------------
// Rewards
// ---------------------------------------------------------------------------
function touchDaily() {
  const t = todayStr();
  if (state.daily.date !== t) state.daily = { date: t, xp: 0 };
  if (state.streak.last !== t) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    state.streak.days = state.streak.last === isoDate(y) ? state.streak.days + 1 : 1;
    state.streak.last = t;
  }
}

// Adds tickets up to the cap and returns how many were actually added.
function grantTickets(n) {
  const before = state.tickets;
  state.tickets = Math.min(TICKET_CAP, state.tickets + n);
  return state.tickets - before;
}
const ticketNote = n => n ? `+${n} Spiel-Ticket${n === 1 ? '' : 's'}` : `Dein Ticket-Vorrat ist voll (${TICKET_CAP}), also ab in die Arcade`;

function addXp(n) {
  if (n <= 0) return;
  const before = rankIndex();
  touchDaily();
  const wasBelow = state.daily.xp < DAILY_GOAL;
  state.xp += n; state.daily.xp += n;
  if (wasBelow && state.daily.xp >= DAILY_GOAL) {
    const got = grantTickets(1);
    toast('Tagesziel geschafft!', `${DAILY_GOAL} XP heute. ${ticketNote(got)}`, ICON.ticket);
    Sound.coin();
  }
  const after = rankIndex();
  if (after > before) {
    setTimeout(() => {
      Sound.fanfare(); Confetti.burst(160);
      modal(`<div style="width:90px;margin:0 auto">${ICON.medal('var(--accent)', '#fff')}</div><p class="hand">Neuer Rang!</p><h2>${RANKS[after].name}</h2><p>Du hast ${RANKS[after].xp} XP geknackt. Weiter so!</p>`);
    }, 600);
  }
  checkBadges(); save(); renderStatus();
}

function award(id) {
  if (state.badges[id]) return;
  const b = BADGES.find(x => x.id === id); if (!b) return;
  state.badges[id] = Date.now();
  toast(`Abzeichen: ${b.name}`, b.desc);
  Sound.coin(); save();
}

function checkBadges() {
  if (Object.keys(state.levels).length) award('first');
  WORLDS.forEach((t, i) => { if (worldDone(i)) award('world_' + t.id); });
  if (Object.values(state.levels).some(v => v.stars === 3)) award('perfect');
  if (state.bestCombo >= 10) award('combo10');
  if (state.bestCombo >= 25) award('combo25');
  if (state.xp >= 1000) award('xp1000');
  if (state.fixed >= 10) award('fixer');
}

async function checkGameUnlocks(prevStars) {
  const now = totalStars();
  for (const g of GAMES) {
    if (prevStars < g.stars && now >= g.stars && !state.unlockedGames[g.id]) {
      state.unlockedGames[g.id] = true; const got = grantTickets(1); save();
      Sound.fanfare(); Confetti.burst(150);
      const r = await modal(`<div class="thumb">${gameThumb(g.id)}</div><p class="hand">Meilenstein: ${g.stars} Sterne!</p><h2>${g.name} freigeschaltet</h2><p>${g.desc}</p>${got ? '<p><b>+1 Spiel-Ticket</b> als Belohnung.</p>' : ''}`,
        [{ label: 'Jetzt spielen', cls: 'go' }, { label: 'Später', cls: '' }]);
      if (r === 0) { closeStage(); openGame(g.id); return true; }
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Quiz items. Every single-step question becomes {kind:'mc'|'swipe', ...}.
// A quiz type knows its item keys and builds one item per key; refs have the
// form 'worldId|levelIndex|key' and are what the mistake box stores.
// ---------------------------------------------------------------------------
function mcFrom(it, ref, extra = {}) {
  const order = shuffle(it.o.map((_, i) => i));
  return { kind: 'mc', q: it.q, o: order.map(i => it.o[i]), a: order.indexOf(it.a), x: it.x, ref, ...extra };
}
function swipeFrom(lv, it, ref) {
  return { kind: 'swipe', ...it, ref, prompt: lv.prompt || 'Richtig oder falsch?', yes: lv.yes || 'Richtig', no: lv.no || 'Falsch' };
}
// Picture quiz over the app's named things (APP.entity gives name and info, APP.art the drawing).
function imgItem(key, pool, ref, prompt) {
  const e = APP.entity(key);
  const others = shuffle(pool.filter(k => k !== key)).slice(0, 3).map(k => APP.entity(k).name);
  return mcFrom({ q: prompt || 'Wie heißt das?', o: [e.name, ...others], a: 0, x: `${e.name}: ${e.info}.` }, ref, { fig: artOf(key) });
}

const QUIZ_TYPES = Object.assign({
  mc: { keys: lv => lv.items.map((_, i) => i), item: (lv, k, ref) => lv.items[+k] ? mcFrom(lv.items[+k], ref) : null },
  swipe: { keys: lv => lv.items.map((_, i) => i), item: (lv, k, ref) => lv.items[+k] ? swipeFrom(lv, lv.items[+k], ref) : null },
  imgquiz: { keys: lv => lv.pool, item: (lv, k, ref) => APP.entity(k) ? imgItem(k, lv.pool, ref, lv.prompt) : null },
  // Mixed rounds: each item names its own kind (mc when none is given, or type, order, pairs, groups, cloze, multi).
  mix: { keys: lv => lv.items.map((_, i) => i), item: (lv, k, ref) => mixItem(lv.items[+k], ref) },
}, APP.quizTypes || {});
TYPE_ICON.mix = TYPE_ICON.mix || TYPE_ICON.mc;

function mixItem(it, ref) {
  if (!it) return null;
  return !it.kind || it.kind === 'mc' ? mcFrom(it, ref, { img: it.img, hint: it.hint }) : { ...it, ref };
}

function itemFromRef(ref) {
  const [tid, l, key] = ref.split('|');
  const t = WORLDS.findIndex(x => x.id === tid); if (t < 0) return null;
  const lv = WORLDS[t].levels[+l]; if (!lv || !QUIZ_TYPES[lv.type]) return null;
  return QUIZ_TYPES[lv.type].item(lv, key, ref);
}
function quizItems(t, l) {
  const lv = WORLDS[t].levels[l], id = WORLDS[t].id, qt = QUIZ_TYPES[lv.type];
  return shuffle(qt.keys(lv)).map(k => qt.item(lv, k, `${id}|${l}|${k}`)).filter(Boolean);
}
function allRefs() {
  const refs = [];
  WORLDS.forEach((t, ti) => t.levels.forEach((lv, l) => {
    const qt = QUIZ_TYPES[lv.type];
    if (qt) qt.keys(lv).forEach(k => refs.push({ t: ti, type: lv.type, ref: `${t.id}|${l}|${k}` }));
  }));
  return refs;
}

function noteMistake(ref) { if (!ref) return; const m = state.mistakes[ref] || { n: 0 }; m.n++; state.mistakes[ref] = m; }
function noteFixed(ref) { if (ref && state.mistakes[ref]) { delete state.mistakes[ref]; state.fixed++; } }
