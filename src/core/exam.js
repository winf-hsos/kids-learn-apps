// Mock exam: quiz items mixed from several worlds plus write tasks, graded at the end.
// APP.exam = { mix: { worldId: count, ... }, writes: n, art: artKey, types: [levelType, ...] }
// types optionally limits the quiz items to levels of these types.

function startExam() {
  const cfg = APP.exam, refs0 = allRefs();
  const ids = Object.keys(cfg.mix);
  const refs = shuffle(ids.flatMap(id => {
    const ti = WORLDS.findIndex(t => t.id === id);
    return shuffle(refs0.filter(r => r.t === ti && (!cfg.types || cfg.types.includes(r.type)))).slice(0, cfg.mix[id]).map(r => r.ref);
  }));
  const writes = shuffle(WORLDS.filter(t => ids.includes(t.id)).flatMap(t => t.levels.filter(lv => lv.type === 'write').flatMap(lv => lv.items))).slice(0, cfg.writes || 0);
  run = { mode: 'exam', items: refs.map(itemFromRef).filter(Boolean), writes, i: 0, correct: 0, combo: 0, xp: 0, answers: [], started: Date.now(), title: `Probe-${examName}` };
  run.total = run.items.length + run.writes.length;
  openStage(`<div class="result" style="padding-top:40px">
    <div style="width:120px;margin:0 auto;color:var(--ink)">${cfg.art ? artOf(cfg.art) : ICON.exam}</div>
    <h1>Probe-${examName}</h1>
    <p class="lead" style="margin:12px auto">${run.items.length} Aufgaben${writes.length ? ` und ${writes.length} Schreibaufgaben` : ''} aus allen Themen. Wie in der echten Arbeit gibt es erst am Ende die Auswertung, mit Note.</p>
    <div class="actions"><button class="btn warn" id="go">Los geht's</button><button class="btn" id="back">Zurück</button></div></div>`);
  $('#go').onclick = () => quizStep();
  $('#back').onclick = () => { closeStage(); render(); };
}

function examWrite(k) {
  if (k >= run.writes.length) return examResult();
  const it = run.writes[k];
  writeTask(it, `${stageTop((run.items.length + k) / run.total)}<div class="qtitle">Probe-${examName} · Schreibaufgabe ${k + 1}/${run.writes.length} · 3 Punkte</div>`, (score, text) => {
    run.answers.push({ write: true, it, score, text });
    examWrite(k + 1);
  });
}

// German school grades from the percentage of points.
function gradeFor(pct) { return pct >= 92 ? '1' : pct >= 81 ? '2' : pct >= 67 ? '3' : pct >= 50 ? '4' : pct >= 30 ? '5' : '6'; }

async function examResult() {
  const mcPts = run.answers.filter(a => !a.write).reduce((s, a) => s + (a.pts ?? (a.ok ? 1 : 0)), 0);
  const wPts = run.answers.filter(a => a.write).reduce((s, a) => s + a.score * 3, 0);
  const max = run.items.length + run.writes.length * 3;
  const pts = Math.round((mcPts + wPts) * 2) / 2, pct = Math.round(pts / max * 100), grade = gradeFor(pct);
  const mins = Math.max(1, Math.round((Date.now() - run.started) / 60000));
  const xp = 40 + Math.round(mcPts * 5 + wPts * 5);
  addXp(xp);
  if (!state.examBest || +grade < +state.examBest) state.examBest = grade;
  if (+grade <= 2) award('exam2');
  if (grade === '1') award('exam1');
  if (+grade <= 2) grantTickets(1);
  save();
  const wrong = run.answers.filter(a => !a.write && !a.ok);
  const ready = examDay && EXAM && daysUntil(EXAM.date) >= 0 ? `Du bist bereit für ${examDay}.` : 'Du bist bestens vorbereitet.';
  const [headline, advice] = { 1: ['Sehr gut!', ready], 2: ['Gut!', 'Schau dir die Fehler unten noch einmal an.'], 3: ['Befriedigend', 'Die Fehlerkiste hilft dir, die Lücken zu schließen.'], 4: ['Ausreichend', 'Übe die Welten nochmal, in denen du Fehler hattest.'], 5: ['Da geht noch was', 'Mach die Lernkarten nochmal und probiere es dann erneut.'], 6: ['Kein Problem, dafür ist die Probe da', 'Starte am besten mit den Lernkarten.'] }[grade];
  openStage(`<div class="result">
    <p class="hand">Probe-${examName} · ${mins} Min.</p>
    <div class="grade">${grade}</div>
    <h1>${headline}</h1>
    <p class="lead" style="margin:10px auto">${String(pts).replace('.', ',')} von ${max} Punkten (${pct} %). ${advice}</p>
    <div class="rewards"><div class="reward">+${xp} XP</div>${+grade <= 2 ? `<div class="reward">${ICON.ticket}+2</div>` : ''}</div>
    <div class="actions"><button class="btn primary" id="toMap">Zum Lernpfad</button><button class="btn" id="again">Neue Probe</button></div>
    ${wrong.length ? `<h2 class="section-title" style="text-align:left">Das solltest du dir nochmal anschauen</h2>
      <div class="options" style="text-align:left">${wrong.map(a => `<div class="opt" style="display:block;cursor:default"><b>${a.it.kind === 'swipe' ? a.it.t : a.it.q}</b><br>
      <span class="muted">${a.given ? `Deine Antwort: ${esc(a.given)}. ` : ''}${itemSolution(a.it)} ${a.it.x || ''}</span></div>`).join('')}</div>
      <p class="muted">Diese Fragen liegen jetzt in deiner Fehlerkiste.</p>` : ''}
  </div>`);
  $('#toMap').onclick = () => { closeStage(); render(); };
  $('#again').onclick = () => startExam();
  if (+grade <= 2) { Sound.fanfare(); Confetti.burst(220); } else Sound.tone(500, .2);
}
