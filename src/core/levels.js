// Level engines shared by all apps. Apps add their own types through APP.levelTypes.

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------
function startLevel(t, l) {
  const lv = WORLDS[t].levels[l];
  run = { t, l, lv, mode: 'level', correct: 0, total: 0, combo: 0, xp: 0, errors: 0 };
  if (QUIZ_TYPES[lv.type]) {
    run.items = quizItems(t, l); run.total = run.items.length; run.i = 0; run.timer = lv.timer || 0;
    return quizStep();
  }
  const fn = { learn: learnLevel, match: matchLevel, sort: sortLevel, order: orderLevel, write: writeLevel, memory: memoryLevel, ...APP.levelTypes }[lv.type];
  fn();
}

function startMistakes() {
  const refs = Object.keys(state.mistakes);
  if (!refs.length) { toast('Fehlerkiste ist leer', 'Keine offenen Fehler. Weiter so!', ICON.check); return; }
  const items = shuffle(refs).slice(0, 12).map(itemFromRef).filter(Boolean);
  if (!items.length) { state.mistakes = {}; save(); render(); return; }
  run = { mode: 'mistakes', items, total: items.length, i: 0, correct: 0, combo: 0, xp: 0, title: 'Fehlerkiste' };
  quizStep();
}

// ---------------------------------------------------------------------------
// Quiz engine (mc, swipe, typed answers and the kinds in items.js), also used for the mistake box and the exam
// ---------------------------------------------------------------------------
function quizStep() {
  if (run.i >= run.items.length) {
    if (run.mode === 'exam') return examWrite(0);
    return finish(run.correct / run.total);
  }
  const it = run.items[run.i];
  const title = run.mode === 'level' ? run.lv.title : run.title;
  const top = stageTop(run.i / run.total, run.mode === 'exam' ? '' : comboHtml());
  if (it.kind === 'swipe') return swipeStep(it, title, top);
  if (it.kind === 'type') return typeStep(it, title, top);
  if (BOARD_KINDS[it.kind]) return boardStep(it, title, top);
  openStage(`${top}
    ${run.timer && run.mode === 'level' ? '<div class="timer"><i id="tbar"></i></div>' : ''}
    <div class="qtitle">${title} · ${run.i + 1}/${run.total}</div>
    ${it.fig ? `<div class="figure ${it.figClass || ''}">${it.fig}</div>` : ''}
    ${mediaHtml(it)}
    <div class="question">${it.q}</div>
    <div class="options">${it.o.map((o, i) => `<button class="opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${o}</span></button>`).join('')}</div>
    ${hintHtml(it)}`);
  bindQuit(); bindHint(it);
  let answered = false, t0 = performance.now(), raf = 0;
  const choose = i => {
    if (answered) return; answered = true; cancelAnimationFrame(raf);
    const ok = i === it.a;
    const btns = $$('.opt');
    btns.forEach(b => b.disabled = true);
    if (run.mode === 'exam') {
      if (i >= 0) btns[i].style.borderColor = 'var(--accent)';
      run.answers.push({ it, i, ok }); if (ok) run.correct++; else noteMistake(it.ref);
      Sound.click();
      return setTimeout(() => { run.i++; quizStep(); }, 350);
    }
    if (i >= 0) btns[i].classList.add(ok ? 'right' : 'wrong');
    if (!ok) btns[it.a].classList.add('right');
    const fast = run.timer && (performance.now() - t0) / 1000 < run.timer / 2;
    const xp = scoreAnswer(ok, it.ref, (ok && fast ? 5 : 0) + hintBonus());
    const title = i < 0 ? 'Zeit abgelaufen!' : ok ? pick(PRAISE) + (fast ? ' Blitzschnell!' : '') : 'Nicht ganz.';
    showSheet(ok, title, (ok ? '' : `Richtig ist: <b>${it.o[it.a]}</b>${endDot(it.o[it.a])} `) + (it.x || ''), xp, () => { run.i++; quizStep(); });
  };
  $$('.opt').forEach(b => b.onclick = () => choose(+b.dataset.i));
  onKey(e => { const n = +e.key; if (n >= 1 && n <= it.o.length) choose(n - 1); });
  if (run.timer && run.mode === 'level') {
    const bar = $('#tbar');
    const tick = () => {
      const p = (performance.now() - t0) / 1000 / run.timer;
      bar.style.transform = `scaleX(${1 - clamp(p, 0, 1)})`;
      if (p >= 1) return choose(-1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    run.cleanup = () => cancelAnimationFrame(raf);
  }
}

// Swipe cards: right = yes (it.ok true), left = no.
function swipeVerdict(it) { return `Das ist <b>${(it.ok ? it.yes : it.no).toLowerCase()}</b>.`; }

function swipeStep(it, title, top) {
  const next = run.items[run.i + 1];
  openStage(`${top}
    <div class="qtitle">${title} · ${run.i + 1}/${run.total}</div>
    <div class="question" style="font-size:18px;font-weight:400;color:var(--ink-soft)">${it.prompt} Wische oder tippe.</div>
    <div class="swipe-wrap">
      ${next && next.kind === 'swipe' ? `<div class="scard back">${next.t}</div>` : ''}
      <div class="scard" id="card"><span class="stamp l">${it.no.toUpperCase()}</span><span class="stamp r">${it.yes.toUpperCase()}</span>${it.t}</div>
    </div>
    <div class="swipe-btns"><button class="btn" style="border-color:var(--bad);color:var(--bad)" id="sL">✖ ${it.no}</button><button class="btn" style="border-color:var(--good);color:var(--good)" id="sR">✔ ${it.yes}</button></div>`);
  bindQuit();
  const card = $('#card'); let done = false;
  const decide = yes => {
    if (done) return; done = true;
    card.style.transform = `translateX(${yes ? 140 : -140}%) rotate(${yes ? 24 : -24}deg)`; card.style.opacity = 0;
    const ok = yes === it.ok;
    if (run.mode === 'exam') {
      run.answers.push({ it, i: yes, ok }); if (ok) run.correct++; else noteMistake(it.ref);
      Sound.click(); return setTimeout(() => { run.i++; quizStep(); }, 350);
    }
    const xp = scoreAnswer(ok, it.ref);
    showSheet(ok, ok ? pick(PRAISE) : 'Nicht ganz.', `${swipeVerdict(it)} ${it.x}`, xp, () => { run.i++; quizStep(); });
  };
  $('#sL').onclick = () => decide(false);
  $('#sR').onclick = () => decide(true);
  onKey(e => { if (e.key === 'ArrowLeft') decide(false); if (e.key === 'ArrowRight') decide(true); });
  let sx = null;
  card.addEventListener('pointerdown', e => { sx = e.clientX; card.setPointerCapture(e.pointerId); card.style.transition = 'none'; });
  card.addEventListener('pointermove', e => {
    if (sx === null) return; const dx = e.clientX - sx;
    card.style.transform = `translateX(${dx}px) rotate(${dx / 14}deg)`;
    $('.stamp.l', card).style.opacity = clamp(-dx / 100, 0, 1); $('.stamp.r', card).style.opacity = clamp(dx / 100, 0, 1);
  });
  card.addEventListener('pointerup', e => {
    if (sx === null) return; const dx = e.clientX - sx; sx = null; card.style.transition = '';
    if (Math.abs(dx) > 90) decide(dx > 0); else { card.style.transform = ''; $$('.stamp', card).forEach(s => s.style.opacity = 0); }
  });
}

// Typed answers: it.fields is a list of inputs, each with a label, the solution
// shown afterwards (sol) and either accepted answers (accept, traps, strict) or
// its own judge(text) -> { ok, typo, hint }. Partly right items score pts < 1.
function typeStep(it, title, top) {
  const exam = run.mode === 'exam';
  openStage(`${top}
    <div class="qtitle">${title} · ${run.i + 1}/${run.total}</div>
    ${mediaHtml(it)}
    ${it.lead ? `<div class="type-lead">${it.lead}</div>` : ''}
    <div class="type-word">${it.q}</div>
    <form class="type-form" id="tform" autocomplete="off">
      ${it.fields.map((f, i) => `<label class="tfield"><span>${f.label}</span><input id="tf${i}" type="text" ${f.numeric ? 'inputmode="numeric" pattern="[0-9]*"' : ''} autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="${i < it.fields.length - 1 ? 'next' : 'done'}"></label>`).join('')}
      ${hintHtml(it)}
      <div class="type-btns"><button class="btn primary" type="submit">${exam ? 'Weiter' : 'Prüfen'}</button><button class="btn" type="button" id="tskip">Weiß ich nicht</button></div>
    </form>`);
  bindQuit(); bindHint(it);
  const inputs = it.fields.map((_, i) => $('#tf' + i));
  inputs[0].focus({ preventScroll: true });
  inputs.forEach((inp, i) => inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && i < inputs.length - 1) { e.preventDefault(); inputs[i + 1].focus(); }
  }));
  let done = false;
  const check = skip => {
    if (done) return; done = true;
    const res = it.fields.map((f, i) => skip ? { ok: false } : f.judge ? f.judge(inputs[i].value) : judgeAnswer(inputs[i].value, f.accept, f.traps, f.strict));
    const pts = res.filter(r => r.ok).length / res.length, ok = pts === 1;
    inputs.forEach((inp, i) => { inp.readOnly = true; if (!exam) inp.classList.add(res[i].ok ? 'right' : 'wrong'); });
    $$('#tform button').forEach(b => b.disabled = true);
    if (exam) {
      run.answers.push({ it, ok, pts, given: inputs.map(x => x.value.trim()).filter(Boolean).join(' · ') });
      if (ok) run.correct++; else noteMistake(it.ref);
      Sound.click(); return setTimeout(() => { run.i++; quizStep(); }, 350);
    }
    const xp = scoreAnswer(ok, it.ref, hintBonus());
    const lines = it.fields.map((f, i) => res[i].ok && !res[i].typo ? '' :
      `${it.fields.length > 1 ? f.label + ': ' : ''}${res[i].ok ? 'Achte auf die Schreibweise:' : 'Richtig ist'} <b>${f.sol}</b>${endDot(f.sol)}${res[i].hint ? ' ' + res[i].hint : ''}`);
    showSheet(ok, ok ? pick(PRAISE) : pts > 0 ? 'Halb richtig.' : 'Nicht ganz.', [...lines, it.x].filter(Boolean).join('<br>'), xp, () => { run.i++; quizStep(); });
  };
  $('#tform').onsubmit = e => { e.preventDefault(); check(false); };
  $('#tskip').onclick = () => check(true);
}

// Case, ä/ae spellings, Latin length marks, punctuation and curly apostrophes do not count.
function normAnswer(s) {
  return norm(String(s).normalize('NFD').replace(/[\u0304\u0306]/g, '').normalize('NFC'))
    .replace(/[.,!?;:/„“"'’‘()]/g, ' ').replace(/\s+/g, ' ').trim();
}
function editDistance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
// Judges one typed answer. Several answers separated by commas count if one of
// them is right. traps are known wrong answers ({ answers, hint }) that get a
// specific hint; unless strict, one typo in a longer word is accepted.
function judgeAnswer(text, accept, traps = [], strict = false) {
  const parts = [text, ...String(text).split(/[,;]| oder /)].map(normAnswer).filter(Boolean);
  const acc = accept.map(normAnswer);
  if (parts.some(p => acc.includes(p))) return { ok: true };
  for (const tr of traps) if (parts.some(p => tr.answers.map(normAnswer).includes(p))) return { ok: false, hint: tr.hint };
  if (!strict && parts.some(p => acc.some(a => a.length >= 5 && editDistance(a, p) <= 1))) return { ok: true, typo: true };
  return { ok: false };
}

// What the learner should have answered, for result lists.
function itemSolution(it) {
  if (it.kind === 'swipe') return swipeVerdict(it);
  if (it.kind === 'type') return (t => 'Richtig: ' + t + endDot(t))(it.fields.map(f => f.sol).join(' · '));
  if (BOARD_KINDS[it.kind]) return (t => 'Richtig: ' + t + endDot(t))(BOARD_KINDS[it.kind].sol(it));
  return 'Richtig: ' + it.o[it.a] + endDot(it.o[it.a]);
}

// ---------------------------------------------------------------------------
// Finish & results
// ---------------------------------------------------------------------------
function starsFor(ratio) { return ratio >= .95 ? 3 : ratio >= .75 ? 2 : ratio >= .5 ? 1 : 0; }

async function finish(ratio) {
  if (run.cleanup) { run.cleanup(); run.cleanup = null; }
  const isLearn = run.mode === 'level' && run.lv.type === 'learn';
  const stars = run.mode === 'level' ? (isLearn ? 1 : starsFor(ratio)) : 0;
  let newStars = 0, earned = 0, prevTotal = totalStars(), wasDone = false;
  if (run.mode === 'level') {
    const k = levelKey(run.t, run.l), prev = state.levels[k] || { stars: 0 };
    wasDone = worldDone(run.t);
    newStars = Math.max(0, stars - prev.stars);
    state.levels[k] = { stars: Math.max(prev.stars, stars), best: Math.max(prev.best || 0, Math.round(ratio * 100)) };
    if (stars > 0) run.xp += 15 + stars * 10;
    state.starBank = (state.starBank || 0) + newStars;
    earned = grantTickets(Math.floor(state.starBank / STARS_PER_TICKET));
    state.starBank %= STARS_PER_TICKET;
  } else if (run.mode === 'mistakes') {
    run.xp += 10;
  }
  addXp(run.xp);
  const titles = ['Fast!', 'Geschafft!', 'Richtig gut!', 'Perfekt!'];
  const msg = isLearn ? 'Lernkarten geschafft. Jetzt wird geübt, und dabei gibt es bis zu 3 Sterne pro Level.' : run.mode === 'mistakes' ? `${run.correct} von ${run.total} Fehlern repariert.` :
    stars === 0 ? 'Für einen Stern brauchst du mindestens die Hälfte. Probier es gleich nochmal, du lernst bei jedem Versuch dazu.' :
      stars === 3 ? 'Alles richtig. Das sitzt!' : `${Math.round(ratio * 100)} % richtig.`;
  const hasNext = run.mode === 'level' && run.l + 1 < WORLDS[run.t].levels.length;
  openStage(`<div class="result">
    <p class="hand">${run.mode === 'level' ? run.lv.title : run.title}</p>
    <h1>${isLearn ? 'Gelernt!' : run.mode === 'level' ? titles[stars] : 'Repariert!'}</h1>
    ${run.mode === 'level' ? `<div class="bigstars">${(isLearn ? [0] : [0, 1, 2]).map(i => ICON.star(true).replace('<svg', `<svg data-s="${i}"`)).join('')}</div>` : '<div style="height:20px"></div>'}
    <p class="lead" style="margin:0 auto 10px">${msg}</p>
    <div class="rewards"><div class="reward">${APP.xpIcon || ICON.bolt}+${run.xp} XP</div>${earned ? `<div class="reward">${ICON.ticket}+${earned}</div>` : ''}</div>
    <div class="actions">
      ${run.mode === 'level' ? `<button class="btn" id="again">Nochmal</button>` : ''}
      ${hasNext && stars > 0 ? `<button class="btn go" id="nextLvl">Nächstes Level</button>` : ''}
      <button class="btn primary" id="toMap">Zum Lernpfad</button>
    </div></div>`);
  const svgs = $$('.bigstars svg');
  for (let i = 0; i < stars; i++) setTimeout(() => { svgs[i].classList.add('on'); Sound.tone(700 + i * 200, .15, 'triangle', .14); }, 300 + i * 350);
  if (stars >= 2 || (run.mode === 'mistakes' && run.correct)) setTimeout(() => Confetti.burst(stars === 3 ? 180 : 90), 300 + stars * 350);
  const ag = $('#again'); if (ag) ag.onclick = () => startLevel(run.t, run.l);
  const nx = $('#nextLvl'); if (nx) nx.onclick = () => startLevel(run.t, run.l + 1);
  $('#toMap').onclick = () => { closeStage(); render(); };
  onKey(e => { if (e.key === 'Enter') { e.preventDefault(); ($('#nextLvl') || $('#toMap')).click(); } });
  checkBadges(); save(); renderStatus();
  if (earned) setTimeout(() => { const c = $('#ticketChip'); if (c) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } Sound.coin(); }, 300 + stars * 350);
  await sleep(500 + stars * 350);
  if (run.mode === 'level' && !wasDone && worldDone(run.t)) {
    const got = grantTickets(1); save(); renderStatus();
    Sound.fanfare(); Confetti.burst(220);
    const r = await modal(`<div style="width:100px;margin:0 auto;color:var(--ink)">${worldArt(WORLDS[run.t])}</div><p class="hand">Welt ${run.t + 1} komplett!</p><h2>${WORLDS[run.t].title}</h2><p>Du hast alle Level dieser Welt geschafft. ${got ? 'Als Belohnung gibt es <b>+1 Spiel-Ticket</b>.' : ''}</p>`,
      GAMES.length ? [{ label: 'Ab in die Arcade', cls: 'go' }, { label: 'Weiterlernen', cls: '' }] : [{ label: 'Weiterlernen', cls: 'go' }]);
    if (r === 0 && GAMES.length) { closeStage(); tab = 'arcade'; render(); }
  }
  if (run.mode === 'level') await checkGameUnlocks(prevTotal);
}

// ---------------------------------------------------------------------------
// Learn cards. A card has a heading (h) and blocks: p, bullets, steps, list.
// APP.learnExtras(card, mode) adds app-specific blocks ({ top, bottom } HTML);
// mode is 'card' for the learn level and 'cheat' for the cheat sheet.
// ---------------------------------------------------------------------------
function learnBlocks(c, mode) {
  const ex = (APP.learnExtras && APP.learnExtras(c, mode)) || {};
  let b = '';
  if (c.p) b += `<p>${c.p}</p>`;
  if (ex.top) b += ex.top;
  if (c.bullets) b += `<ul>${c.bullets.map(x => `<li>${x}</li>`).join('')}</ul>`;
  if (c.steps) b += `<ol>${c.steps.map(x => `<li>${x}</li>`).join('')}</ol>`;
  if (c.list) b += mode === 'card'
    ? `<div class="dev-grid">${c.list.map(x => `<div class="dev"><div class="a">${artOf(x.art)}</div><b>${x.t}</b><span>${x.d}</span></div>`).join('')}</div>`
    : `<ul>${c.list.map(x => `<li><b>${x.t}</b>: ${x.d}</li>`).join('')}</ul>`;
  if (ex.bottom) b += ex.bottom;
  return b;
}
// Read-aloud: AUDIO (written by build.py from the app's audio.json, see tools/tts.py) maps
// "<world id>/<card index>" to a recorded MP3 of that learn card.
const Narrator = {
  el: null, btn: null,
  src(c) { for (const w of WORLDS) { const i = (w.learn || []).indexOf(c); if (i >= 0) return AUDIO[`${w.id}/${i}`] || null; } return null; },
  button(c) { return this.src(c) ? `<button class="btn small read-aloud" id="readaloud">${ICON.soundOn}<span>Vorlesen</span></button>` : ''; },
  bind(c) { const b = $('#readaloud'); if (b) b.onclick = () => this.el ? this.stop() : this.play(this.src(c), b); },
  play(src, b) {
    this.stop();
    this.el = new Audio(src); this.btn = b;
    this.el.onended = () => this.stop();
    this.el.play().catch(() => this.stop());
    this.mark(true);
  },
  stop() { if (this.el) { this.el.pause(); this.el = null; } this.mark(false); this.btn = null; },
  mark(on) { const b = this.btn; if (b && b.isConnected) { b.classList.toggle('on', on); b.querySelector('span').textContent = on ? 'Stopp' : 'Vorlesen'; } },
};

function learnCardHtml(c) { return `<div class="learn-card"><h2>${c.h}</h2>${learnBlocks(c, 'card')}</div>`; }

function learnLevel(cards, title) {
  cards = cards || WORLDS[run.t].learn;
  let i = 0;
  const show = () => {
    Narrator.stop();
    openStage(`${stageTop((i + 1) / cards.length)}
      <div class="learn-head"><div class="qtitle">${title || run.lv.title} · Karte ${i + 1}/${cards.length}</div>${Narrator.button(cards[i])}</div>
      <div style="margin-top:10px">${learnCardHtml(cards[i])}</div>
      <div class="dots">${cards.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="nav-row"><button class="btn" id="prev" ${i === 0 ? 'disabled' : ''}>Zurück</button><button class="btn ${i === cards.length - 1 ? 'go' : 'primary'}" id="fwd">${i === cards.length - 1 ? 'Verstanden!' : 'Weiter'}</button></div>`);
    bindQuit(); Narrator.bind(cards[i]);
    const fwd = () => { Sound.click(); if (i < cards.length - 1) { i++; show(); $('#stage').scrollTop = 0; } else { run.correct = 1; run.total = 1; run.xp = 10; finish(1); } };
    const back = () => { if (i > 0) { i--; show(); } };
    $('#fwd').onclick = fwd; $('#prev').onclick = back;
    onKey(e => { if (e.key === 'ArrowRight' || e.key === 'Enter') fwd(); if (e.key === 'ArrowLeft') back(); });
  };
  show();
}

// ---------------------------------------------------------------------------
// Match pairs
// ---------------------------------------------------------------------------
function matchLevel() {
  const pairs = run.lv.pairs.map((p, i) => ({ ...p, id: i }));
  const left = shuffle(pairs), right = shuffle(pairs);
  let sel = null, done = 0;
  run.total = pairs.length;
  openStage(`${stageTop(0, '<span id="combo"></span>')}
    <div class="qtitle">${run.lv.title}</div><div class="question">${run.lv.prompt}</div>
    <div class="match"><div class="col">${left.map(p => `<button class="mcard" data-side="a" data-id="${p.id}">${p.art ? `<span class="mart">${artOf(p.art)}</span>` : ''}<span>${p.a}</span></button>`).join('')}</div>
    <div class="col">${right.map(p => `<button class="mcard" data-side="b" data-id="${p.id}"><span>${p.b}</span></button>`).join('')}</div></div>`);
  bindQuit();
  $$('.mcard').forEach(b => b.onclick = () => {
    if (b.classList.contains('ok')) return;
    if (!sel || sel.dataset.side === b.dataset.side) {
      if (sel) sel.classList.remove('sel');
      sel = b; b.classList.add('sel'); Sound.click(); return;
    }
    const ok = sel.dataset.id === b.dataset.id;
    if (ok) {
      [sel, b].forEach(x => { x.classList.remove('sel'); x.classList.add('ok'); x.disabled = true; });
      done++; scoreAnswer(true);
      $('.progress i').style.width = `${done / pairs.length * 100}%`;
      $('#combo').innerHTML = comboHtml();
      if (done === pairs.length) setTimeout(() => finish(pairs.length / (pairs.length + run.errors)), 500);
    } else {
      run.errors++; scoreAnswer(false);
      [sel, b].forEach(x => { x.classList.remove('sel'); x.classList.add('no'); setTimeout(() => x.classList.remove('no'), 450); });
      $('#combo').innerHTML = '';
    }
    sel = null;
  });
}

// ---------------------------------------------------------------------------
// Sort into buckets
// ---------------------------------------------------------------------------
function sortLevel() {
  const items = shuffle(run.lv.items), buckets = run.lv.buckets;
  const placed = buckets.map(() => []);
  run.total = items.length; let i = 0;
  const show = () => {
    if (i >= items.length) return finish(run.correct / run.total);
    const it = items[i];
    openStage(`${stageTop(i / items.length, comboHtml())}
      <div class="qtitle">${run.lv.title} · ${i + 1}/${items.length}</div><div class="question" style="font-size:18px;font-weight:400;color:var(--ink-soft)">${run.lv.prompt}</div>
      <div class="sort-card" id="sc">${it.t}</div>
      <div class="buckets">${buckets.map((b, j) => `<button class="bucket" data-b="${j}"><span>${b}</span><span class="count">${placed[j].length}</span><span class="mini">${placed[j].slice(-4).map(x => `<span>${x}</span>`).join('')}</span></button>`).join('')}</div>`);
    bindQuit();
    const choose = j => {
      $$('.bucket').forEach(b => b.disabled = true);
      const ok = j === it.b;
      scoreAnswer(ok);
      const bi = buckets.length === 2 ? (j === 0 ? 0 : 2) : j;
      $('#sc').classList.add('fly-' + bi);
      if (ok) {
        placed[j].push(it.t);
        setTimeout(() => { i++; show(); }, 380);
      } else {
        placed[it.b].push(it.t);
        showSheet(false, 'Nicht ganz.', `„${it.t}“ gehört zu <b>${buckets[it.b]}</b>.`, 0, () => { i++; show(); });
      }
    };
    $$('.bucket').forEach(b => b.onclick = () => choose(+b.dataset.b));
    onKey(e => { const n = +e.key; if (n >= 1 && n <= buckets.length) choose(n - 1); });
  };
  show();
}

// ---------------------------------------------------------------------------
// Order (tap in sequence)
// ---------------------------------------------------------------------------
function orderLevel() {
  const items = run.lv.items, cards = shuffle(items.map((t, i) => ({ t, i })));
  let next = 0, hearts = 3;
  run.total = items.length;
  const hud = () => `<span class="hearts" id="hearts">${[0, 1, 2].map(i => ICON.heart(i < hearts)).join('')}</span>`;
  openStage(`${stageTop(0, hud())}
    <div class="qtitle">${run.lv.title}</div><div class="question">${run.lv.prompt}</div>
    <div class="order-list">${cards.map(c => `<button class="ocard" data-i="${c.i}"><span class="n"></span><span>${c.t}</span></button>`).join('')}</div>`);
  bindQuit();
  $$('.ocard').forEach(b => b.onclick = () => {
    if (b.classList.contains('placed') || hearts <= 0) return;
    if (+b.dataset.i === next) {
      b.classList.add('placed'); $('.n', b).textContent = next + 1; next++;
      scoreAnswer(true);
      $('.progress i').style.width = `${next / items.length * 100}%`;
      if (next === items.length) setTimeout(() => finish(1 - run.errors * .2), 450);
    } else {
      run.errors++; hearts--; scoreAnswer(false);
      b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 450);
      $('#hearts').outerHTML = hud();
      if (hearts <= 0) {
        const sh = $('#sheet');
        showSheet(false, 'Keine Herzen mehr', `Die richtige Reihenfolge:<br>${items.map((t, i) => `${i + 1}. ${t}`).join('<br>')}`, 0, () => finish(0));
        sh.style.maxHeight = '70vh'; sh.style.overflowY = 'auto';
      } else {
        toast('Falsche Reihenfolge', `Gesucht ist Schritt ${next + 1}.`, ICON.heart(false));
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Free-text answers. Either a keyword check (each entry of it.k is a group of
// accepted spellings, the first one is the label shown to the learner) or, with
// it.points, a checklist of key points that the learner ticks off honestly.
// ---------------------------------------------------------------------------
function keywordScore(text, groups) {
  const t = norm(' ' + text + ' ');
  const hits = groups.map(g => g.some(k => t.includes(norm(k))));
  return { hits, ratio: hits.filter(Boolean).length / groups.length };
}

function writeTask(it, header, onDone) {
  openStage(`${header}
    <div class="question">${it.q}</div>
    <textarea class="answer" id="ans" placeholder="Schreib deine Antwort hier rein, so wie in ${examArt.dat} ${examName} …"></textarea>
    <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap"><button class="btn primary" id="check">Antwort prüfen</button><button class="btn" id="skip">Ich weiß es nicht</button></div>
    <div id="fb"></div>`);
  bindQuit();
  const ans = $('#ans'); ans.focus();
  try { const d = sessionStorage.getItem('draft:' + it.q); if (d) ans.value = d; } catch (e) { }
  ans.oninput = () => { try { sessionStorage.setItem('draft:' + it.q, ans.value); } catch (e) { } };
  const check = () => {
    $('#check').disabled = true; $('#skip').disabled = true; ans.readOnly = true;
    if (it.points) return checklist();
    const ks = keywordScore(ans.value, it.k);
    $('#fb').innerHTML = `<div class="model"><h4>Musterlösung</h4><p>${it.m}</p>
      <div class="kw">${it.k.map((g, i) => `<span class="${ks.hits[i] ? 'hit' : 'miss'}">${ks.hits[i] ? '✔' : '✖'} ${g[0]}</span>`).join('')}</div>
      <p class="muted" style="font-size:14px;margin-top:8px">Du hast ${ks.hits.filter(Boolean).length} von ${it.k.length} Schlüsselbegriffen genannt. Vergleiche ehrlich mit der Musterlösung:</p></div>
      <div class="selfrate"><button class="btn go" data-r="1">Hatte ich fast alles</button><button class="btn warn" data-r=".5">Teilweise</button><button class="btn" data-r="0">Noch nicht</button></div>`;
    $$('.selfrate .btn').forEach(b => b.onclick = () => {
      try { sessionStorage.removeItem('draft:' + it.q); } catch (e) { }
      onDone((ks.ratio + +b.dataset.r) / 2, ans.value);
    });
    $('.selfrate .btn').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const checklist = () => {
    $('#fb').innerHTML = `<div class="model"><h4>Musterlösung</h4><p>${it.m}</p>
      <p class="muted" style="font-size:14px;margin:10px 0 6px">Hake ab, was in deiner Antwort vorkommt. Sei ehrlich, nur so weißt du, was noch fehlt.</p>
      <div class="points">${it.points.map((p, i) => `<label><input type="checkbox" data-p="${i}"> <span>${p}</span></label>`).join('')}</div></div>
      <div class="selfrate"><button class="btn go" id="pdone">Fertig abgehakt</button></div>`;
    $('#pdone').onclick = () => {
      try { sessionStorage.removeItem('draft:' + it.q); } catch (e) { }
      onDone($$('.points input:checked').length / it.points.length, ans.value);
    };
    $('.points').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  $('#check').onclick = check;
  $('#skip').onclick = () => { ans.value = ''; check(); };
}

function writeLevel() {
  const items = shuffle(run.lv.items); let i = 0, sum = 0;
  run.total = items.length;
  const show = () => {
    if (i >= items.length) return finish(sum / items.length);
    writeTask(items[i], `${stageTop(i / items.length)}<div class="qtitle">${run.lv.title} · ${i + 1}/${items.length} · Schreib wie in der Arbeit</div>`, score => {
      sum += score;
      const xp = 10 + Math.round(score * 20); run.xp += xp;
      if (score >= .75) { Sound.right(); run.correct++; } else Sound.click();
      showSheet(score >= .5, score >= .75 ? 'Sehr gut formuliert!' : score >= .5 ? 'Guter Anfang!' : 'Merk dir die Musterlösung.', score < .75 ? 'Tipp: Lies die Musterlösung laut vor und schreib sie einmal ab. So bleibt sie hängen.' : '', xp, () => { i++; show(); });
    });
  };
  show();
}

// ---------------------------------------------------------------------------
// Memory: find picture and name of the same thing (keys from lv.pool, see APP.entity)
// ---------------------------------------------------------------------------
function memoryLevel() {
  const keys = shuffle(run.lv.pool).slice(0, 6);
  const cards = shuffle(keys.flatMap(k => [{ k, pic: true }, { k, pic: false }]));
  let open = [], moves = 0, found = 0, lock = false;
  run.total = 6;
  openStage(`${stageTop(0, '<span class="chip" id="moves">0 Züge</span>')}
    <div class="qtitle">${run.lv.title}</div><div class="question" style="font-size:19px">Finde immer Bild und Namen, die zusammengehören.</div>
    <div class="memory">${cards.map((c, i) => `<button class="mem" data-i="${i}" aria-label="Karte"><span class="in"><span class="f">${APP.memoryBack || TYPE_ICON.memory}</span><span class="b">${c.pic ? artOf(c.k) : APP.entity(c.k).name}</span></span></button>`).join('')}</div>`);
  bindQuit();
  $$('.mem').forEach(b => b.onclick = () => {
    if (lock || b.classList.contains('open') || b.classList.contains('gone')) return;
    b.classList.add('open'); open.push(b); Sound.click();
    if (open.length < 2) return;
    moves++; $('#moves').textContent = `${moves} Züge`;
    const [a, c] = open.map(x => cards[+x.dataset.i]);
    if (a.k === c.k && a.pic !== c.pic) {
      open.forEach(x => { x.classList.add('gone'); x.classList.remove('open'); });
      open = []; found++; scoreAnswer(true);
      $('.progress i').style.width = `${found / 6 * 100}%`;
      const e = APP.entity(a.k);
      toast(e.name, e.info, `<span style="width:40px;height:40px;color:var(--paper)">${artOf(a.k)}</span>`);
      if (found === 6) setTimeout(() => finish(moves <= 10 ? 1 : moves <= 14 ? .8 : .55), 700);
    } else {
      lock = true; run.combo = 0;
      setTimeout(() => { open.forEach(x => x.classList.remove('open')); open = []; lock = false; }, 900);
    }
  });
}
