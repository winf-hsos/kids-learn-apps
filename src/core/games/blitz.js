// ---------------------------------------------------------------------------
// Football blitz: 60 seconds of true-or-false. Each card shows a trivia question
// with one answer, which is the right one half of the time. A wrong call costs
// five seconds.
// ---------------------------------------------------------------------------
function blitzGame(area, hud) {
  const TIME = 60, PENALTY = 5;
  let queue = [], card = null, right = 0, streak = 0, best = 0, penalty = 0, t0 = 0, raf = 0, busy = false, running = false;
  const box = document.createElement('div'); box.className = 'blitz'; area.appendChild(box);
  box.innerHTML = `<div class="timer"><i id="blT"></i></div><div class="blitz-score" id="blS"></div>
    <div class="blitz-card" id="blCard"><div class="blitz-q" id="blQ"></div><div class="blitz-a" id="blA"></div><div class="blitz-note" id="blN"></div></div>
    <div class="blitz-btns"><button class="btn blitz-no" id="blNo">← Falsch</button><button class="btn go" id="blYes">Stimmt →</button></div>`;
  const el = id => $('#' + id, box);

  const nextCard = () => {
    if (queue.length < 2) queue = queue.concat(triviaQuestions(10));
    const q = queue.shift(), truth = Math.random() < .5;
    card = { q, truth, shown: truth ? q.o[q.a] : pick(q.o.filter((_, i) => i !== q.a)) };
    el('blQ').innerHTML = q.q; el('blA').innerHTML = card.shown; el('blN').innerHTML = '';
    el('blCard').className = 'blitz-card'; el('blCard').style.transform = '';
    busy = false;
  };
  const answer = yes => {
    if (!running || busy || !card) return;
    busy = true;
    const ok = yes === card.truth, c = el('blCard');
    c.style.transform = '';
    c.classList.add(ok ? 'right' : 'wrong');
    if (ok) { right++; streak++; best = Math.max(best, streak); Sound.right(); if (streak % 5 === 0) { Sound.coin(); Confetti.burst(30, .5, .4); } setTimeout(nextCard, 260); }
    else {
      streak = 0; penalty += PENALTY; Sound.wrong();
      el('blN').innerHTML = `<b>−${PENALTY} Sekunden.</b> ${card.truth ? 'Die Antwort stimmt.' : `Richtig wäre: ${card.q.o[card.q.a]}`}`;
      setTimeout(nextCard, 1500);
    }
    el('blS').innerHTML = scoreLine();
  };
  const scoreLine = () => `<b>${right}</b> richtig${streak >= 3 ? ` · Serie ${streak}` : ''}`;

  const loop = now => {
    const left = TIME - (now - t0) / 1000 - penalty;
    el('blT').style.transform = `scaleX(${clamp(left / TIME, 0, 1)})`;
    hud(`${Math.max(0, Math.ceil(left))} s`);
    if (left <= 0) return finish();
    raf = requestAnimationFrame(loop);
  };
  const finish = () => {
    running = false;
    const isNew = recordGame('blitz', right);
    if (right >= 20) award('blitz20');
    overlay(area, `<p class="hand" style="color:#FFC21A">${right >= 20 ? 'Blitzschnell!' : right >= 12 ? 'Starke Runde!' : 'Abpfiff!'}</p><h2>${right} richtig</h2><p>Längste Serie: ${best} · ${isNew ? 'Neuer Rekord!' : `Rekord: ${state.games.blitz}`}</p><button class="btn" id="blBack" style="margin-top:12px">Zurück zur Arcade</button>`);
    if (isNew && right >= 10) Confetti.burst(140);
    $('#blBack').onclick = () => { closeGame(); tab = 'arcade'; render(); };
  };

  // Cards can also be swiped: right for true, left for false.
  let drag = null;
  const down = e => { if (running && !busy) { drag = { x: e.clientX, dx: 0 }; el('blCard').setPointerCapture(e.pointerId); } };
  const move = e => { if (!drag) return; drag.dx = e.clientX - drag.x; el('blCard').style.transform = `translateX(${drag.dx}px) rotate(${drag.dx / 20}deg)`; };
  const up = () => { if (!drag) return; const dx = drag.dx; drag = null; if (Math.abs(dx) > 70) answer(dx > 0); else el('blCard').style.transform = ''; };
  const key = e => { if (e.key === 'ArrowLeft') { e.preventDefault(); answer(false); } if (e.key === 'ArrowRight') { e.preventDefault(); answer(true); } };
  const c = el('blCard');
  c.addEventListener('pointerdown', down); c.addEventListener('pointermove', move); c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  el('blNo').onclick = () => answer(false); el('blYes').onclick = () => answer(true);
  addEventListener('keydown', key);

  el('blS').innerHTML = scoreLine(); hud(`${TIME} s`);
  overlay(area, `<h2>Fußball-Blitz</h2><p>Du hast 60 Sekunden. Auf jeder Karte steht eine Fußballfrage mit einer Antwort, und du entscheidest blitzschnell, ob die Antwort stimmt. Wische nach rechts oder tippe auf „Stimmt“, wenn sie richtig ist, sonst nach links auf „Falsch“. Jeder Fehler kostet 5 Sekunden.</p><button class="btn go" id="blGo" style="margin-top:12px">Los!</button>`);
  $('#blGo').onclick = () => { hideOverlay(area); Sound.whistle(); nextCard(); running = true; t0 = performance.now(); raf = requestAnimationFrame(loop); };
  return () => { cancelAnimationFrame(raf); removeEventListener('keydown', key); };
}
