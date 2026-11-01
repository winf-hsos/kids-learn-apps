// ---------------------------------------------------------------------------
// Penalty quiz: answer a hard football question, then shoot.
// ---------------------------------------------------------------------------
function penaltyGame(area, hud) {
  const { ctx, size, dispose } = setupCanvas(area);
  const qs = triviaQuestions(5);
  let round = 0, goals = 0, results = [], phase = 'intro', raf = 0, unbind = null;
  const shot = { t: 0, from: null, to: null, dur: .6, result: '', target: null };
  const keeper = { x: 0, tx: 0, y: 0, ty: 0, dive: 0 };
  const geo = () => {
    const { W, H } = size, gw = Math.min(W * .78, 560), gh = gw * .33, gx = (W - gw) / 2, gy = H * .22;
    return { W, H, gw, gh, gx, gy, spotX: W / 2, spotY: H * .86 };
  };
  const resetKeeper = () => { const G = geo(); keeper.x = keeper.tx = G.W / 2; keeper.y = keeper.ty = G.gy + G.gh; keeper.dive = 0; };
  resetKeeper();

  const draw = () => {
    const G = geo(); const { W, H } = G;
    const grass = ctx.createLinearGradient(0, 0, 0, H); grass.addColorStop(0, '#0B4D2C'); grass.addColorStop(1, '#13804A');
    ctx.fillStyle = grass; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.04)'; ctx.fillRect(0, H * .3 + i * H * .09, W, H * .09); }
    // crowd
    ctx.fillStyle = '#0A1A2E'; ctx.fillRect(0, 0, W, G.gy - 20);
    for (let i = 0; i < 160; i++) { const x = (i * 53) % W, y = 10 + ((i * 29) % Math.max(10, G.gy - 40)); ctx.fillStyle = ['#2257E6', '#FFC21A', '#D7263D', '#fff'][i % 4]; ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(x, y + Math.sin(Date.now() / 300 + i) * 1.5, 3, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    // box lines
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3;
    ctx.strokeRect(G.gx - G.gw * .25, G.gy + G.gh, G.gw * 1.5, G.spotY - G.gy - G.gh + H * .08);
    ctx.beginPath(); ctx.arc(G.spotX, G.spotY, 4, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    // net
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1;
    for (let x = G.gx; x <= G.gx + G.gw; x += 14) { ctx.beginPath(); ctx.moveTo(x, G.gy); ctx.lineTo(x, G.gy + G.gh); ctx.stroke(); }
    for (let y = G.gy; y <= G.gy + G.gh; y += 14) { ctx.beginPath(); ctx.moveTo(G.gx, y); ctx.lineTo(G.gx + G.gw, y); ctx.stroke(); }
    // posts
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(G.gx, G.gy + G.gh); ctx.lineTo(G.gx, G.gy); ctx.lineTo(G.gx + G.gw, G.gy); ctx.lineTo(G.gx + G.gw, G.gy + G.gh); ctx.stroke();
    // aim hint
    if (phase === 'aim') {
      ctx.fillStyle = 'rgba(255,194,26,.12)'; ctx.fillRect(G.gx, G.gy, G.gw, G.gh);
      ctx.fillStyle = '#FFC21A'; ctx.font = '700 18px "Atkinson Hyperlegible", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Tippe ins Tor, wohin du schießen willst!', W / 2, G.gy - 12);
    }
    // keeper
    keeper.x += (keeper.tx - keeper.x) * .18; keeper.y += (keeper.ty - keeper.y) * .18;
    ctx.save(); ctx.translate(keeper.x, keeper.y); ctx.rotate(keeper.dive);
    const s = G.gh / 110;
    ctx.fillStyle = '#FFC21A'; rrect(ctx, -14 * s, -62 * s, 28 * s, 40 * s, 8 * s); ctx.fill();
    ctx.strokeStyle = '#FFC21A'; ctx.lineWidth = 9 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-12 * s, -56 * s); ctx.lineTo(-34 * s, -78 * s); ctx.moveTo(12 * s, -56 * s); ctx.lineTo(34 * s, -78 * s); ctx.stroke();
    ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(-7 * s, -22 * s); ctx.lineTo(-10 * s, 0); ctx.moveTo(7 * s, -22 * s); ctx.lineTo(10 * s, 0); ctx.stroke();
    ctx.fillStyle = '#FFD6B0'; ctx.beginPath(); ctx.arc(0, -72 * s, 10 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-36 * s, -80 * s, 6 * s, 0, 7); ctx.arc(36 * s, -80 * s, 6 * s, 0, 7); ctx.fill();
    ctx.restore();
    // ball
    let bx = G.spotX, by = G.spotY - 14, br = 16;
    if (phase === 'shot' || phase === 'after') {
      const p = clamp(shot.t / shot.dur, 0, 1), e = 1 - Math.pow(1 - p, 2);
      bx = shot.from.x + (shot.to.x - shot.from.x) * e;
      by = shot.from.y + (shot.to.y - shot.from.y) * e - Math.sin(p * Math.PI) * 40;
      br = 16 - 8 * e;
    }
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(bx, by + br, br, br * .35, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(bx, by, br * .35, 0, 7); ctx.fill();
    // scoreboard dots
    ctx.textAlign = 'left';
    for (let i = 0; i < 5; i++) {
      const x = 22 + i * 26, y = H - 24;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, 7);
      ctx.fillStyle = results[i] === undefined ? 'rgba(255,255,255,.2)' : results[i] ? '#34D08C' : '#FF5D70'; ctx.fill();
    }
    if (phase === 'after' && shot.result) {
      ctx.fillStyle = shot.result === 'TOR!' ? '#FFC21A' : '#fff'; ctx.font = `700 ${Math.round(W * .09)}px "Dela Gothic One", sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(shot.result, W / 2, H * .62);
    }
  };

  const loop = now => {
    if (phase === 'shot') { shot.t += 1 / 60; if (shot.t >= shot.dur) { phase = 'after'; afterShot(); } }
    draw(); hud(`${goals} Tore`);
    raf = requestAnimationFrame(loop);
  };

  const ask = () => {
    if (round >= 5) return finishGame();
    resetKeeper(); phase = 'question';
    const box = questionBox(qs[round], round, 5, ok => {
      const nx = $('#fqNext', area);
      nx.innerHTML = `<button class="btn ${ok ? 'go' : ''}" id="fqGo">${ok ? 'Zum Elfmeter!' : 'Schuss geht daneben …'}</button>`;
      $('#fqGo').onclick = () => { hideOverlay(area); ok ? (phase = 'aim') : autoMiss(); };
    });
    overlay(area, box.html);
    unbind = box.bind(area);
  };
  const shoot = (tx, ty, forceMiss) => {
    const G = geo();
    shot.from = { x: G.spotX, y: G.spotY - 14 }; shot.to = { x: tx, y: ty }; shot.t = 0; shot.dur = .55;
    const third = x => x < G.gx + G.gw / 3 ? 0 : x > G.gx + G.gw * 2 / 3 ? 2 : 1;
    const kd = Math.floor(Math.random() * 3);
    const kx = [G.gx + G.gw * .2, G.W / 2, G.gx + G.gw * .8][kd];
    keeper.tx = kx; keeper.ty = kd === 1 ? G.gy + G.gh * .82 : G.gy + G.gh * .9; keeper.dive = kd === 0 ? -1.1 : kd === 2 ? 1.1 : 0;
    const corner = (tx - G.gx < G.gw * .12 || G.gx + G.gw - tx < G.gw * .12) && ty - G.gy < G.gh * .3;
    if (forceMiss) shot.result = pick(['Pfosten!', 'Drüber!', 'Vorbei!']);
    else if (third(tx) === kd && !(corner && Math.random() < .6)) shot.result = 'Gehalten!';
    else shot.result = 'TOR!';
    phase = 'shot'; Sound.kick();
  };
  const autoMiss = () => {
    const G = geo(); const side = Math.random() < .5;
    shoot(side ? G.gx - 30 : G.gx + G.gw + 30, G.gy + G.gh * .2, true);
  };
  const afterShot = () => {
    const ok = shot.result === 'TOR!';
    results[round] = ok; if (ok) { goals++; Sound.fanfare(); Confetti.burst(60, .5, .3); } else Sound.tone(200, .3, 'triangle', .08);
    round++;
    setTimeout(ask, 1300);
  };
  const finishGame = () => {
    phase = 'end';
    const isNew = recordGame('penalty', goals);
    if (goals === 5) award('penalty5');
    overlay(area, `<p class="hand" style="color:#FFC21A">${goals >= 4 ? 'Weltklasse!' : goals >= 2 ? 'Ordentlich!' : 'Nächstes Mal!'}</p><h2>${goals} von 5 Elfmetern</h2><p>${isNew ? 'Neuer Rekord!' : `Rekord: ${state.games.penalty}/5`}</p><button class="btn" id="pBack" style="margin-top:12px">Zurück zur Arcade</button>`);
    if (goals >= 4) Confetti.burst(160);
    $('#pBack').onclick = () => { closeGame(); tab = 'arcade'; render(); };
  };
  const aim = e => {
    if (phase !== 'aim' || e.target.closest('.overlay')) return;
    const r = area.getBoundingClientRect(), G = geo();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (x < G.gx - 20 || x > G.gx + G.gw + 20 || y < G.gy - 30 || y > G.gy + G.gh + 10) return;
    const outside = x < G.gx + 4 || x > G.gx + G.gw - 4 || y < G.gy + 4;
    shoot(x, y, outside);
  };
  area.addEventListener('pointerdown', aim);
  overlay(area, `<h2>Elfmeter-Quiz</h2><p>5 Elfmeter. Vor jedem Schuss kommt eine schwere Fußballfrage. Nur wer richtig antwortet, darf schießen. Dann tippst du ins Tor, wohin der Ball soll. Ecken sind schwerer zu halten, aber zu nah am Pfosten geht er vorbei!</p><button class="btn go" id="pGo" style="margin-top:12px">Anpfiff</button>`);
  $('#pGo').onclick = () => { Sound.whistle(); ask(); };
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); if (unbind) unbind(); area.removeEventListener('pointerdown', aim); dispose(); };
}
