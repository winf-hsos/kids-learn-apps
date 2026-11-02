// ---------------------------------------------------------------------------
// Goalkeeper reflex: the learner keeps goal and dives into the corner the ball
// flies to. Shots get faster with every save and start to curve after a while.
// Three goals against end the game.
// ---------------------------------------------------------------------------
function keeperGame(area, hud) {
  const { ctx, size, dispose } = setupCanvas(area);
  let phase = 'intro', raf = 0, last = 0, saves = 0, conceded = 0, wait = 0, popups = [];
  const shot = { t: 0, dur: 1, zone: 1, from: null, to: null, ctrl: null, dive: -1, result: '' };
  const keeper = { x: 0, y: 0, tx: 0, ty: 0, rot: 0, trot: 0 };
  const geo = () => {
    const { W, H } = size, gw = Math.min(W * .9, 560), gh = gw * .36, gx = (W - gw) / 2, gy = H * .2;
    return { W, H, gw, gh, gx, gy, spotX: W / 2, spotY: H * .84 };
  };
  const zoneX = (G, z) => G.gx + G.gw * (z + .5) / 3;
  const resetKeeper = () => { const G = geo(); keeper.tx = G.W / 2; keeper.ty = G.gy + G.gh; keeper.trot = 0; };
  const snapKeeper = () => { resetKeeper(); Object.assign(keeper, { x: keeper.tx, y: keeper.ty, rot: 0 }); };

  const nextShot = () => {
    resetKeeper();
    shot.dive = -1; shot.result = ''; shot.t = 0;
    wait = .7 + Math.random() * .9;
    phase = 'windup';
  };
  const kick = () => {
    const G = geo();
    shot.zone = Math.floor(Math.random() * 3);
    shot.from = { x: G.spotX, y: G.spotY - 14 };
    shot.to = { x: zoneX(G, shot.zone) + (Math.random() - .5) * G.gw * .16, y: G.gy + G.gh * (.2 + Math.random() * .6) };
    // From the eighth save on, some shots start towards another corner and curve back.
    const bend = saves >= 8 && Math.random() < .5 ? (Math.random() < .5 ? -1 : 1) * G.gw * .4 : 0;
    shot.ctrl = { x: (shot.from.x + shot.to.x) / 2 + bend, y: (shot.from.y + shot.to.y) / 2 };
    shot.dur = Math.max(.45, 1.15 - saves * .035);
    phase = 'flight'; Sound.kick();
  };
  const dive = z => {
    if (phase !== 'flight' || shot.dive >= 0) return;
    const G = geo();
    shot.dive = z;
    // The keeper pivots on his feet, so a side dive starts a bit inside the corner.
    keeper.tx = zoneX(G, z) + (1 - z) * G.gw * .1; keeper.ty = z === 1 ? G.gy + G.gh * .75 : G.gy + G.gh * .9;
    keeper.trot = z === 0 ? -1.15 : z === 2 ? 1.15 : 0;
  };
  const resolve = () => {
    phase = 'after';
    if (shot.dive === shot.zone) {
      saves++; shot.result = 'Gehalten!'; Sound.right();
      popups.push({ x: shot.to.x, y: shot.to.y, t: 0, txt: saves % 5 === 0 ? `${saves}!` : '+1' });
      if (saves % 5 === 0) { Sound.coin(); Confetti.burst(50, shot.to.x / innerWidth, .3); }
    } else {
      conceded++; shot.result = shot.dive < 0 ? 'Zu spät!' : 'Tor …'; Sound.tone(200, .3, 'triangle', .08);
    }
    setTimeout(() => conceded >= 3 ? finish() : nextShot(), 1100);
    hudUpdate();
  };
  const finish = () => {
    phase = 'end';
    const isNew = recordGame('keeper', saves);
    if (saves >= 15) award('keeper15');
    overlay(area, `<p class="hand" style="color:#FFC21A">${saves >= 15 ? 'Unüberwindbar!' : saves >= 8 ? 'Starke Reflexe!' : 'Weiter üben!'}</p><h2>${saves} Paraden</h2><p>${isNew ? 'Neuer Rekord!' : `Rekord: ${state.games.keeper} Paraden`}</p><button class="btn" id="kpBack" style="margin-top:12px">Zurück zur Arcade</button>`);
    if (isNew && saves >= 5) Confetti.burst(140);
    $('#kpBack').onclick = () => { closeGame(); tab = 'arcade'; render(); };
  };
  const hudUpdate = () => hud(`${saves} Paraden · ${'●'.repeat(3 - conceded)}${'○'.repeat(conceded)}`);

  const drawKeeper = G => {
    keeper.x += (keeper.tx - keeper.x) * .25; keeper.y += (keeper.ty - keeper.y) * .25; keeper.rot += (keeper.trot - keeper.rot) * .25;
    const s = G.gh / 110;
    ctx.save(); ctx.translate(keeper.x, keeper.y); ctx.rotate(keeper.rot);
    ctx.fillStyle = '#22C55E'; rrect(ctx, -15 * s, -62 * s, 30 * s, 40 * s, 8 * s); ctx.fill();
    ctx.fillStyle = '#0B4D2C'; ctx.font = `700 ${Math.round(16 * s)}px "Dela Gothic One", sans-serif`; ctx.textAlign = 'center'; ctx.fillText('1', 0, -36 * s);
    ctx.strokeStyle = '#22C55E'; ctx.lineWidth = 9 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-12 * s, -56 * s); ctx.lineTo(-36 * s, -80 * s); ctx.moveTo(12 * s, -56 * s); ctx.lineTo(36 * s, -80 * s); ctx.stroke();
    ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(-7 * s, -22 * s); ctx.lineTo(-11 * s, 0); ctx.moveTo(7 * s, -22 * s); ctx.lineTo(11 * s, 0); ctx.stroke();
    ctx.fillStyle = '#FFD6B0'; ctx.beginPath(); ctx.arc(0, -72 * s, 10 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5 * s;
    for (const gx of [-38, 38]) { ctx.beginPath(); ctx.arc(gx * s, -82 * s, 8 * s, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  };
  const ballAt = p => {
    const a = shot.from, b = shot.ctrl, c = shot.to, u = 1 - p;
    return { x: u * u * a.x + 2 * u * p * b.x + p * p * c.x, y: u * u * a.y + 2 * u * p * b.y + p * p * c.y - Math.sin(p * Math.PI) * 30 };
  };

  const loop = now => {
    const dt = Math.min(.033, (now - last) / 1000 || 0); last = now;
    const G = geo(), { W, H } = G;
    if (phase === 'windup') { wait -= dt; if (wait <= 0) kick(); }
    if (phase === 'flight') { shot.t += dt; if (shot.t >= shot.dur) resolve(); }

    const grass = ctx.createLinearGradient(0, 0, 0, H); grass.addColorStop(0, '#0B4D2C'); grass.addColorStop(1, '#13804A');
    ctx.fillStyle = grass; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.04)'; ctx.fillRect(0, H * .3 + i * H * .09, W, H * .09); }
    ctx.fillStyle = '#0A1A2E'; ctx.fillRect(0, 0, W, G.gy - 20);
    for (let i = 0; i < 160; i++) { const x = (i * 53) % W, y = 10 + ((i * 29) % Math.max(10, G.gy - 40)); ctx.fillStyle = ['#22C55E', '#fff', '#D7263D', '#FFC21A'][i % 4]; ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(x, y + Math.sin(now / 300 + i) * 1.5, 3, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3;
    ctx.strokeRect(G.gx - G.gw * .2, G.gy + G.gh, G.gw * 1.4, G.spotY - G.gy - G.gh + H * .08);
    ctx.beginPath(); ctx.arc(G.spotX, G.spotY, 4, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1;
    for (let x = G.gx; x <= G.gx + G.gw; x += 14) { ctx.beginPath(); ctx.moveTo(x, G.gy); ctx.lineTo(x, G.gy + G.gh); ctx.stroke(); }
    for (let y = G.gy; y <= G.gy + G.gh; y += 14) { ctx.beginPath(); ctx.moveTo(G.gx, y); ctx.lineTo(G.gx + G.gw, y); ctx.stroke(); }
    // Faint thirds show where a tap sends the keeper.
    if (phase === 'windup' || phase === 'flight') {
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.setLineDash([6, 8]); ctx.lineWidth = 2;
      for (const f of [1 / 3, 2 / 3]) { ctx.beginPath(); ctx.moveTo(G.gx + G.gw * f, G.gy); ctx.lineTo(G.gx + G.gw * f, G.gy + G.gh); ctx.stroke(); }
      ctx.setLineDash([]);
    }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(G.gx, G.gy + G.gh); ctx.lineTo(G.gx, G.gy); ctx.lineTo(G.gx + G.gw, G.gy); ctx.lineTo(G.gx + G.gw, G.gy + G.gh); ctx.stroke();

    const ballBehind = phase === 'after' && shot.dive !== shot.zone;
    let b = { x: G.spotX, y: G.spotY - 14 }, br = 18;
    if (phase === 'flight' || phase === 'after') { const p = clamp(shot.t / shot.dur, 0, 1); b = ballAt(p); br = 18 - 9 * p; }
    const drawBall = () => {
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(b.x, b.y + br, br, br * .35, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(b.x, b.y, br, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(b.x, b.y, br * .35, 0, 7); ctx.fill();
    };
    if (ballBehind) { drawBall(); drawKeeper(G); } else { drawKeeper(G); drawBall(); }
    // The striker runs up during the wind-up.
    if (phase === 'windup' || phase === 'intro') {
      const p = phase === 'intro' ? 0 : clamp(1 - wait / 1.6, 0, 1), s = G.gh / 110;
      const sx = G.spotX - 70 * s + 50 * s * p, sy = G.spotY + 40 * s - 30 * s * p;
      ctx.fillStyle = '#D7263D'; rrect(ctx, sx - 16 * s, sy - 50 * s, 32 * s, 40 * s, 9 * s); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.round(18 * s)}px "Dela Gothic One", sans-serif`; ctx.textAlign = 'center'; ctx.fillText('9', sx, sy - 22 * s);
      ctx.fillStyle = '#5A3A22'; ctx.beginPath(); ctx.arc(sx, sy - 60 * s, 11 * s, 0, 7); ctx.fill();
    }
    if (phase === 'after') {
      ctx.fillStyle = shot.result === 'Gehalten!' ? '#FFC21A' : '#fff'; ctx.font = `700 ${Math.round(Math.min(W * .09, 56))}px "Dela Gothic One", sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(shot.result, W / 2, H * .64);
    }
    for (const p of popups) { p.t += dt; ctx.globalAlpha = Math.max(0, 1 - p.t); ctx.fillStyle = '#FFC21A'; ctx.font = '700 22px "Dela Gothic One", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.txt, p.x, p.y - p.t * 60); }
    ctx.globalAlpha = 1; popups = popups.filter(p => p.t < 1);
    raf = requestAnimationFrame(loop);
  };

  const tap = e => {
    if (e.target.closest('.overlay')) return;
    const r = area.getBoundingClientRect(), G = geo(), x = e.clientX - r.left;
    dive(x < G.gx + G.gw / 3 ? 0 : x > G.gx + G.gw * 2 / 3 ? 2 : 1);
  };
  const key = e => {
    const z = { ArrowLeft: 0, a: 0, '1': 0, ArrowDown: 1, ArrowUp: 1, s: 1, ' ': 1, '2': 1, ArrowRight: 2, d: 2, '3': 2 }[e.key];
    if (z !== undefined && phase === 'flight') { e.preventDefault(); dive(z); }
  };
  snapKeeper(); hudUpdate();
  overlay(area, `<h2>Torwart-Reflex</h2><p>Heute stehst du im Tor. Sobald der Stürmer schießt, tippst du auf die Seite, in die der Ball fliegt: links, Mitte oder rechts. Auf dem Computer gehen auch die Pfeiltasten. Du hast nur einen Versuch pro Schuss, und mit jeder Parade werden die Schüsse schneller. Später kommen auch Bananenflanken, die eine Kurve fliegen.</p><p>Nach drei Gegentoren ist Schluss.</p><button class="btn go" id="kpGo" style="margin-top:12px">Anpfiff</button>`);
  $('#kpGo').onclick = () => { hideOverlay(area); Sound.whistle(); nextShot(); };
  area.addEventListener('pointerdown', tap); addEventListener('keydown', key);
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); area.removeEventListener('pointerdown', tap); removeEventListener('keydown', key); dispose(); };
}
