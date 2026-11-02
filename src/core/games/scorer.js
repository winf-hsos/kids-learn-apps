// ---------------------------------------------------------------------------
// Knowledge scorer: ten shots, each at one of three goals labelled with answers.
// The questions are the app's own multiple-choice items from all worlds, open
// mistakes first, so the game is practice too. Wrong answers go to the mistake box.
// ---------------------------------------------------------------------------
function scorerQuestions(n) {
  // Answers longer than a short phrase do not fit on a goal.
  const short = o => String(o).replace(/<[^>]+>/g, '').length <= 70;
  const items = allRefs().map(r => itemFromRef(r.ref)).filter(it => it && it.kind === 'mc' && !it.fig && !it.img && it.o.length >= 3 && it.o.every(short));
  const open = shuffle(items.filter(it => state.mistakes[it.ref])).slice(0, Math.ceil(n / 2));
  const rest = shuffle(items.filter(it => !open.includes(it)));
  return shuffle([...open, ...rest.slice(0, n - open.length)]).map(it => {
    const wrong = shuffle(it.o.filter((_, i) => i !== it.a)).slice(0, 2), o = shuffle([it.o[it.a], ...wrong]);
    return { q: it.q, o, a: o.indexOf(it.o[it.a]), x: it.x, ref: it.ref };
  });
}

// Labels with long words or many words get goals stacked on top of each other on phones.
const longLabel = o => { const t = String(o).replace(/<[^>]+>/g, ''); return t.length > 34 || t.split(/[\s/-]+/).some(w => w.length > 11); };

function scorerGame(area, hud) {
  const SHOTS = 10, TIME = 12;
  const qs = scorerQuestions(SHOTS);
  let i = 0, goals = 0, results = [], raf = 0, t0 = 0, done = true;
  const box = document.createElement('div'); box.className = 'scorer'; area.appendChild(box);
  const el = id => $('#' + id, box);
  if (!qs.length) { overlay(area, `<h2>Keine Fragen</h2><p>In dieser App gibt es noch keine Auswahlfragen für dieses Spiel.</p><button class="btn" id="scBack">Zurück</button>`); $('#scBack').onclick = () => { closeGame(); tab = 'arcade'; render(); }; return () => {}; }

  const dots = () => `${Array.from({ length: qs.length }, (_, k) => `<i class="${results[k] === undefined ? '' : results[k] ? 'hit' : 'miss'}"></i>`).join('')}`;
  const ask = () => {
    if (i >= qs.length) return finish();
    const q = qs[i];
    box.innerHTML = `<div class="timer"><i id="scT"></i></div><div class="scorer-q">${q.q}</div>
      <div class="scorer-goals ${q.o.some(longLabel) ? 'stack' : ''}">${q.o.map((o, k) => `<button class="sgoal" data-k="${k}"><span class="sgoal-keeper"></span><span class="sgoal-txt">${o}</span></button>`).join('')}</div>
      <div class="scorer-pitch"><span class="sball" id="scBall"></span></div>
      <div class="scorer-fact" id="scF"></div><div id="scNext" class="scorer-next"></div><div class="scorer-dots">${dots()}</div>`;
    $$('.sgoal', box).forEach(b => b.onclick = () => shoot(+b.dataset.k));
    hud(`${goals} ${goals === 1 ? 'Tor' : 'Tore'} · Schuss ${i + 1}/${qs.length}`);
    done = false; t0 = performance.now(); raf = requestAnimationFrame(tick);
  };
  const tick = now => {
    const p = (now - t0) / 1000 / TIME, bar = el('scT');
    if (!bar || done) return;
    bar.style.transform = `scaleX(${1 - clamp(p, 0, 1)})`;
    if (p >= 1) return shoot(-1);
    raf = requestAnimationFrame(tick);
  };
  const shoot = k => {
    if (done) return; done = true; cancelAnimationFrame(raf);
    const q = qs[i], ok = k === q.a, gs = $$('.sgoal', box), ball = el('scBall');
    gs.forEach(b => b.disabled = true);
    if (k >= 0) {
      const g = gs[k].getBoundingClientRect(), b = ball.getBoundingClientRect();
      ball.style.transform = `translate(${g.left + g.width / 2 - b.left - b.width / 2}px, ${g.top + g.height * .55 - b.top - b.height / 2}px) scale(.6)`;
      Sound.kick();
    }
    results[i] = ok;
    setTimeout(() => {
      if (k >= 0) { gs[k].classList.add(ok ? 'goal' : 'saved'); ball.classList.add('gone'); }
      if (!ok) gs[q.a].classList.add('answer');
      if (ok) { goals++; Sound.fanfare(); Confetti.burst(50, .5, .3); }
      else { Sound.tone(200, .3, 'triangle', .08); noteMistake(q.ref); save(); }
      el('scF').innerHTML = `<b>${ok ? 'TOR!' : k < 0 ? 'Zeit abgelaufen!' : 'Gehalten!'}</b> ${q.x || ''}`;
      el('scNext').innerHTML = `<button class="btn ${ok ? 'go' : ''}" id="scGo">${i + 1 < qs.length ? 'Nächster Schuss' : 'Ergebnis'}</button>`;
      $('.scorer-dots', box).innerHTML = dots();
      hud(`${goals} ${goals === 1 ? 'Tor' : 'Tore'} · Schuss ${i + 1}/${qs.length}`);
      $('#scGo').onclick = () => { i++; ask(); };
      $('#scGo').focus();
    }, k >= 0 ? 420 : 0);
  };
  const finish = () => {
    const isNew = recordGame('scorer', goals);
    if (goals === qs.length) award('scorer10');
    overlay(area, `<p class="hand" style="color:#FFC21A">${goals >= 9 ? 'Torschützenkönig!' : goals >= 6 ? 'Starke Quote!' : 'Weiter trainieren!'}</p><h2>${goals} von ${qs.length} Toren</h2><p>${isNew ? 'Neuer Rekord!' : `Rekord: ${state.games.scorer}/${qs.length}`}${goals < qs.length ? ' · Die Fehlschüsse liegen jetzt in deiner Fehlerkiste.' : ''}</p><button class="btn" id="scBack" style="margin-top:12px">Zurück zur Arcade</button>`);
    if (goals >= 8) Confetti.burst(160);
    $('#scBack').onclick = () => { closeGame(); tab = 'arcade'; render(); };
  };
  const key = e => { const n = +e.key; if (!done && n >= 1 && n <= 3) shoot(n - 1); };
  addEventListener('keydown', key);
  hud(`0 Tore`);
  overlay(area, `<h2>${GAMES.find(g => g.id === 'scorer').name}</h2><p>10 Schüsse, und über jedem der drei Tore steht eine Antwort. Schieß in das Tor mit der richtigen Antwort, dann ist der Ball drin. Bei der falschen Antwort hält der Torwart. Du hast 12 Sekunden pro Schuss. Dieses Spiel kostet kein Ticket.</p><button class="btn go" id="scGo0" style="margin-top:12px">Anstoß</button>`);
  $('#scGo0').onclick = () => { hideOverlay(area); Sound.whistle(); ask(); };
  return () => { cancelAnimationFrame(raf); done = true; removeEventListener('keydown', key); };
}
