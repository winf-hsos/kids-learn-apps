// ---------------------------------------------------------------------------
// Football expert quiz: 10 hard questions with a 15 s timer.
// ---------------------------------------------------------------------------
function proQuizGame(area, hud) {
  area.style.background = 'radial-gradient(ellipse at top, #2A1B55, #0B1020 70%)';
  const qs = triviaQuestions(10);
  let i = 0, right = 0, points = 0, streak = 0, unbind = null;
  const ask = () => {
    if (i >= qs.length) return done();
    hud(`${points} Punkte`);
    const box = questionBox(qs[i], i, qs.length, (ok, secs) => {
      if (ok) { right++; streak++; const p = 100 + Math.max(0, Math.round((15 - secs) * 10)) + (streak >= 3 ? 50 : 0); points += p; $('#fqFact', area).insertAdjacentHTML('afterbegin', `<b style="color:#FFC21A">+${p} Punkte${streak >= 3 ? ` · Serie x${streak}` : ''}</b><br>`); }
      else streak = 0;
      hud(`${points} Punkte`);
      $('#fqNext', area).innerHTML = `<button class="btn go" id="fqGo">${i + 1 < qs.length ? 'Nächste Frage' : 'Ergebnis'}</button>`;
      $('#fqGo').onclick = () => { i++; ask(); };
      $('#fqGo').focus();
    }, 15);
    overlay(area, box.html);
    unbind = box.bind(area);
  };
  const done = () => {
    const isNew = recordGame('proquiz', right);
    if (right >= 8) award('expert8');
    const verdict = right >= 9 ? 'Fußball-Professor!' : right >= 7 ? 'Echter Experte!' : right >= 5 ? 'Starke Leistung!' : 'Die Fragen waren aber auch fies!';
    overlay(area, `<p class="hand" style="color:#FFC21A">${verdict}</p><h2>${right} von 10 richtig</h2><p>${points} Punkte · ${isNew ? 'Neuer Rekord!' : `Rekord: ${state.games.proquiz}/10`}</p><button class="btn" id="qBack" style="margin-top:12px">Zurück zur Arcade</button>`);
    if (right >= 7) Confetti.burst(160);
    $('#qBack').onclick = () => { closeGame(); tab = 'arcade'; render(); };
  };
  overlay(area, `<h2>Fußball-Experte</h2><p>10 knallharte Fragen über Bundesliga, WM und Champions League. Du hast 15 Sekunden pro Frage. Schnelle Antworten und Serien geben Extrapunkte.</p><button class="btn go" id="qGo" style="margin-top:12px">Los!</button>`);
  $('#qGo').onclick = () => { Sound.whistle(); ask(); };
  return () => { if (unbind) unbind(); };
}
