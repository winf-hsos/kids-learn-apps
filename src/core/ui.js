// Shell UI: status bar, tab bar, learning path and the full-screen stage for levels.

let tab = 'home';

function renderStatus() {
  const ri = rankIndex(), cur = RANKS[ri], next = RANKS[ri + 1];
  const pct = next ? (state.xp - cur.xp) / (next.xp - cur.xp) * 100 : 100;
  $('#status').innerHTML = `
    ${MANIFEST.hubUrl ? `<a class="iconbtn" href="${MANIFEST.hubUrl}" aria-label="Alle Lernapps" title="Alle Lernapps">${ICON.apps}</a>` : ''}
    <div class="rank">
      <div class="rank-badge" title="Rang ${ri + 1}">${ri + 1}</div>
      <div class="rank-text"><div class="rank-name">${cur.name} · ${state.xp} XP</div><div class="xpbar"><i style="width:${pct}%"></i></div></div>
    </div>
    <div class="chips">
      <span class="chip" title="Tage in Folge gelernt">${ICON.fire}${state.streak.days || 0}</span>
      <span class="chip hide-sm" title="Sterne">${ICON.star()}${totalStars()}</span>
      <span class="chip" id="ticketChip" title="Spiel-Tickets">${ICON.ticket}${state.tickets}</span>
    </div>
    <button class="iconbtn" id="soundBtn" aria-label="Ton an/aus">${state.sound ? ICON.soundOn : ICON.soundOff}</button>`;
  $('#soundBtn').onclick = () => { state.sound = !state.sound; if (!state.sound) Sound.stopRoar(); save(); renderStatus(); Sound.click(); };
}

function renderTabs() {
  const items = [['home', 'Lernpfad', ICON.map], ['cheat', 'Spickzettel', ICON.book], ['arcade', 'Arcade', ICON.pad], ['badges', 'Erfolge', ICON.trophy]];
  $('#tabs').innerHTML = items.map(([id, l, ic]) => `<button data-tab="${id}" aria-current="${tab === id}">${ic}${l}</button>`).join('');
  $$('#tabs button').forEach(b => b.onclick = () => { tab = b.dataset.tab; Sound.click(); render(); scrollTo(0, 0); });
}

function render() {
  renderStatus(); renderTabs();
  const m = $('#main');
  if (tab === 'home') m.innerHTML = homeHtml();
  if (tab === 'cheat') m.innerHTML = cheatHtml();
  if (tab === 'arcade') m.innerHTML = arcadeHtml();
  if (tab === 'badges') m.innerHTML = badgesHtml();
  bindMain();
}

function ring(p) {
  const r = 19, c = 2 * Math.PI * r;
  return `<svg class="ring" viewBox="0 0 46 46"><circle cx="23" cy="23" r="${r}" fill="none" stroke="var(--accent-soft)" stroke-width="6"/><circle cx="23" cy="23" r="${r}" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - clamp(p, 0, 1))}" transform="rotate(-90 23 23)"/></svg>`;
}

function heroText() {
  if (!EXAM) return { headline: `Los geht's!`, sub: MANIFEST.about || '' };
  const dl = daysUntil(EXAM.date), k = EXAM.kind;
  const headline = dl > 1 ? `Noch <em>${dl} Tage</em> bis ${examArt.to} ${k}` : dl === 1 ? `<em>Morgen</em> ist ${k}` : dl === 0 ? `<em>Heute</em> ist ${k}!` : `${k} geschrieben`;
  const sub = dl >= 0 ? `${examDay}, ${shortDate(EXAM.date)} · ${MANIFEST.subject} · Thema: ${EXAM.topics}.` : 'Du kannst trotzdem weiter üben und spielen.';
  return { headline, sub };
}

function homeHtml() {
  touchDaily();
  const { headline, sub } = heroText();
  const nMist = Object.keys(state.mistakes).length;
  const done = WORLDS.reduce((s, t, ti) => s + t.levels.filter((_, l) => starsOf(ti, l) > 0).length, 0);
  const all = WORLDS.reduce((s, t) => s + t.levels.length, 0);
  return `
  <section class="hero">
    <div class="countdown">
      <div class="eyebrow">${MANIFEST.subject}${MANIFEST.grade ? ' ' + MANIFEST.grade : ''}</div>
      <h1>${headline}</h1>
      <p>${sub} <span class="hand">Du hast schon ${done} von ${all} Leveln geschafft.</span></p>
    </div>
    ${APP.heroArt ? `<div class="herobox" aria-hidden="true">${APP.heroArt()}</div>` : ''}
  </section>
  <div class="goalrow">
    <div class="tile">${ring(state.daily.xp / DAILY_GOAL)}<div><b>Tagesziel</b><span>${Math.min(state.daily.xp, DAILY_GOAL)} / ${DAILY_GOAL} XP heute</span></div></div>
    <button class="tile" data-act="mistakes"><div class="ico" style="background:var(--bad-soft);color:var(--bad)">${ICON.box}</div><div><b>Fehlerkiste</b><span>${nMist ? `${nMist} Fragen zum Reparieren` : 'Leer. Stark!'}</span></div></button>
    ${APP.exam ? `<button class="tile exam" data-act="exam"><div class="ico" style="background:var(--card);color:var(--ink)">${ICON.exam}</div><div><b>Probe-${examName}</b><span>${state.examBest ? `Beste Note: ${state.examBest}` : examDay ? `Teste dich wie am ${examDay}` : 'Teste dich wie in der echten Arbeit'}</span></div></button>` : ''}
  </div>
  ${WORLDS.map((t, ti) => worldHtml(t, ti)).join('')}
  ${GAMES.length ? `<p class="muted" style="text-align:center;margin-top:30px;font-size:14px">Je ${STARS_PER_TICKET} neue Sterne geben ein Spiel-Ticket für die Arcade. Ab ${GAMES[0].stars} Sternen wartet das erste Spiel.</p>` : ''}`;
}

function worldHtml(t, ti) {
  const got = t.levels.reduce((s, _, l) => s + starsOf(ti, l), 0), max = t.levels.reduce((a, lv) => a + maxStarsOf(lv), 0);
  const n = t.levels.length, cols = n <= 6 ? n : Math.ceil(n / 2), colsSm = n % 3 === 1 && n > 3 ? 4 : 3;
  let nextFound = false;
  const nodes = t.levels.map((lv, l) => {
    const st = starsOf(ti, l), unlocked = isUnlocked(ti, l);
    let cls = st ? 'done' : unlocked ? '' : 'locked';
    if (!st && unlocked && !nextFound) { cls = 'next'; nextFound = true; }
    return `<button class="node ${cls}" data-level="${ti}:${l}" ${unlocked ? '' : 'aria-disabled="true"'}>
      <span class="bubble">${unlocked ? (TYPE_ICON[lv.type] || TYPE_ICON.mc) : ICON.lock}</span>
      <span class="stars">${(lv.type === 'learn' ? [0] : [0, 1, 2]).map(i => ICON.star(i < st)).join('')}</span>
      <span class="lbl">${lv.title}</span></button>`;
  }).join('');
  return `<section class="world">
    <div class="world-head"><div class="world-art">${artOf(t.art)}</div>
      <div style="min-width:0"><span class="world-num">Welt ${ti + 1}</span><h2>${t.title}</h2><p>${t.sub}</p></div>
      <div class="world-prog">${got}/${max} ${ICON.star().replace('<svg', '<svg style="width:16px;height:16px;display:inline;vertical-align:-2px"')}<small>${worldDone(ti) ? 'komplett' : ''}</small></div></div>
    <div class="path" style="--cols:${cols};--cols-sm:${colsSm}">${nodes}</div></section>`;
}

function bindMain() {
  $$('#main [data-level]').forEach(b => b.onclick = () => {
    const [t, l] = b.dataset.level.split(':').map(Number);
    if (!isUnlocked(t, l)) { Sound.wrong(); toast('Noch gesperrt', 'Schaffe zuerst das Level davor.', ICON.lock); return; }
    Sound.click(); startLevel(t, l);
  });
  const mist = $('#main [data-act="mistakes"]'); if (mist) mist.onclick = () => startMistakes();
  const ex = $('#main [data-act="exam"]'); if (ex) ex.onclick = () => startExam();
  $$('#main [data-game]').forEach(b => b.onclick = () => tryGame(b.dataset.game));
  $$('#main [data-learnall]').forEach(b => b.onclick = () => startLevel(+b.dataset.learnall, 0));
}

// ---------------------------------------------------------------------------
// Stage (full-screen level view) and the feedback sheet
// ---------------------------------------------------------------------------
let run = null;
let keyHandler = null;

function openStage(inner) {
  closeStage();
  const st = document.createElement('div');
  st.className = 'stage'; st.id = 'stage';
  st.innerHTML = `<div class="stage-inner">${inner}</div><div class="sheet" id="sheet"><div class="sheet-inner"></div></div>`;
  document.body.appendChild(st);
  document.body.style.overflow = 'hidden';
  return st;
}
function closeStage() {
  const st = $('#stage'); if (st) st.remove();
  document.body.style.overflow = '';
  if (keyHandler) { removeEventListener('keydown', keyHandler); keyHandler = null; }
  if (run && run.cleanup) run.cleanup();
  Sound.stopRoar();
}
function onKey(fn) {
  if (keyHandler) removeEventListener('keydown', keyHandler);
  keyHandler = e => { if (!$('.modal') && e.target.tagName !== 'TEXTAREA') fn(e); };
  addEventListener('keydown', keyHandler);
}

function stageTop(progress, extra = '') {
  return `<div class="stage-top"><button class="iconbtn" id="quit" aria-label="Level verlassen">${ICON.close}</button>
    <div class="progress"><i style="width:${progress * 100}%"></i></div>${extra}</div>`;
}
function bindQuit() { $('#quit').onclick = () => { closeStage(); render(); }; }
function comboHtml() { return run && run.combo >= 3 ? `<span class="combo ${run.combo >= 6 ? 'hot' : ''}">Combo x${run.combo}</span>` : ''; }

function showSheet(ok, title, text, xp, onNext) {
  const sh = $('#sheet');
  sh.className = 'sheet show ' + (ok ? 'ok' : 'bad');
  $('.sheet-inner', sh).innerHTML = `<div class="txt"><h3>${title}</h3>${text ? `<p>${text}</p>` : ''}${xp ? `<p class="xp">+${xp} XP</p>` : ''}</div><button class="btn ${ok ? 'go' : 'primary'}" id="nextBtn">Weiter</button>`;
  const go = () => { sh.className = 'sheet'; onNext(); };
  $('#nextBtn').onclick = go;
  $('#nextBtn').focus({ preventScroll: true });
  onKey(e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
}

// Single answer bookkeeping; returns XP earned.
function scoreAnswer(ok, ref, bonus = 0) {
  state.answered++;
  if (ok) {
    state.correct++;
    run.correct++; run.combo++;
    state.bestCombo = Math.max(state.bestCombo, run.combo);
    if (run.mode === 'mistakes') noteFixed(ref);
    const xp = 10 + (run.combo >= 6 ? 10 : run.combo >= 3 ? 5 : 0) + bonus;
    run.xp += xp;
    Sound.right();
    if (run.combo === 5 || run.combo === 10 || run.combo === 15) Confetti.burst(50, .5, .2);
    return xp;
  }
  run.combo = 0;
  noteMistake(ref);
  Sound.wrong();
  return 0;
}
