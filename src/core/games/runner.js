// ---------------------------------------------------------------------------
// Lab Runner (jump & run). One ticket = 3 runs.
// ---------------------------------------------------------------------------
function runnerGame(area, hud) {
  const { ctx, size, dispose } = setupCanvas(area);
  let tries = 3, raf = 0, last = 0, g = null, alive = false;
  // Logical view: the world is drawn scaled up on tall screens so the runner stays readable.
  const V = { W: 0, H: 0, k: 1 };
  const view = () => { V.k = clamp(size.H / 430, 1, 1.9); V.W = size.W / V.k; V.H = size.H / V.k; };
  view();

  const newRun = () => {
    const H = V.H;
    g = { t: 0, speed: 330, dist: 0, score: 0, atoms: 0, obs: [], items: [], parts: [], next: 1.2, nextItem: 2.5, shield: false, shake: 0,
      p: { x: V.W * .18, y: 0, vy: 0, jumps: 0, w: 34, h: 52 }, ground: H * .8, bg: 0 };
    g.p.y = g.ground - g.p.h;
  };
  const jump = () => {
    if (!alive) return;
    if (g.p.jumps < 2) { g.p.vy = g.p.jumps ? -560 : -640; g.p.jumps++; Sound.tone(g.p.jumps === 1 ? 420 : 620, .1, 'square', .05, 0, 800); }
  };
  const spawnObstacle = () => {
    const kinds = g.t < 12 ? ['burner', 'beakers', 'acid'] : ['burner', 'beakers', 'acid', 'cylinder', 'burner'];
    const k = pick(kinds);
    const dims = { burner: [30, 62], beakers: [46, 40], acid: [86, 12], cylinder: [34, 96] }[k];
    g.obs.push({ k, x: V.W + 30, w: dims[0], h: dims[1] });
    const gap = clamp(1.25 - g.t * .012, .62, 1.25);
    g.next = gap + Math.random() * .8;
  };
  const spawnItem = () => {
    const goggles = !g.shield && Math.random() < .25;
    g.items.push({ k: goggles ? 'goggles' : 'atom', x: V.W + 30, y: g.ground - 80 - Math.random() * 110, r: 14 });
    g.nextItem = 1.4 + Math.random() * 2;
  };
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const end = () => {
    alive = false;
    const score = Math.floor(g.score);
    const isNew = recordGame('runner', score);
    if (score >= 500) award('runner500');
    tries--;
    Sound.tone(300, .3, 'sawtooth', .08, 0, 90);
    overlay(area, `<p class="hand" style="color:#FFC21A">${isNew ? 'Neuer Rekord!' : 'Autsch!'}</p><h2>${score} Punkte</h2><p>Rekord: ${state.games.runner} · ${g.atoms} Atome gesammelt</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">${tries > 0 ? `<button class="btn go" id="rAgain">Nochmal (${tries} übrig)</button>` : ''}<button class="btn" id="rBack">Zurück</button></div>
      ${tries <= 0 ? '<p>Für weitere Läufe brauchst du ein neues Ticket.</p>' : ''}`);
    if (isNew) Confetti.burst(100);
    const again = $('#rAgain'); if (again) again.onclick = start;
    $('#rBack').onclick = () => { closeGame(); render(); };
  };
  const start = () => { hideOverlay(area); newRun(); alive = true; last = performance.now(); Sound.whistle(); };

  // ---- drawing ----
  const drawBg = () => {
    const { W, H } = size;
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#16224A'); sky.addColorStop(1, '#24366B');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // wall tiles
    ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 1;
    const off = (g.bg * .2) % 48;
    for (let x = -off; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, g.ground); ctx.stroke(); }
    for (let y = 0; y < g.ground; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // shelves with flasks (parallax)
    const so = (g.bg * .45) % 320;
    for (let x = -so; x < W + 320; x += 320) {
      const y = g.ground - 170;
      ctx.fillStyle = '#31437C'; ctx.fillRect(x + 20, y, 200, 8);
      const cols = ['#5CE1E6', '#FFC21A', '#FF6B8A', '#7CF29A'];
      for (let i = 0; i < 4; i++) {
        const fx = x + 40 + i * 46; ctx.fillStyle = cols[i];
        ctx.globalAlpha = .55; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx + 8, y - 20); ctx.lineTo(fx + 8, y - 30); ctx.lineTo(fx + 16, y - 30); ctx.lineTo(fx + 16, y - 20); ctx.lineTo(fx + 24, y); ctx.fill(); ctx.globalAlpha = 1;
      }
    }
    // floor
    ctx.fillStyle = '#0F1836'; ctx.fillRect(0, g.ground, W, H - g.ground);
    ctx.fillStyle = '#FFC21A'; ctx.fillRect(0, g.ground, W, 4);
    const fo = g.bg % 60; ctx.fillStyle = 'rgba(255,255,255,.07)';
    for (let x = -fo; x < W; x += 60) ctx.fillRect(x, g.ground + 18, 30, 4);
  };
  const drawPlayer = () => {
    const p = g.p, run = alive && p.jumps === 0, ph = g.t * 14;
    ctx.save(); ctx.translate(p.x, p.y);
    // legs
    ctx.strokeStyle = '#1B1B2F'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    const l1 = run ? Math.sin(ph) * 9 : -4, l2 = run ? -Math.sin(ph) * 9 : 6;
    ctx.beginPath(); ctx.moveTo(12, 40); ctx.lineTo(12 + l1, 52); ctx.moveTo(22, 40); ctx.lineTo(22 + l2, 52); ctx.stroke();
    // coat
    ctx.fillStyle = '#F4F6FA'; rrect(ctx, 4, 18, 26, 26, 6); ctx.fill();
    ctx.fillStyle = '#2257E6'; ctx.fillRect(15, 20, 4, 22);
    // arm
    ctx.strokeStyle = '#F4F6FA'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(18, 24); ctx.lineTo(30, 30 + (run ? Math.cos(ph) * 5 : -6)); ctx.stroke();
    // head
    ctx.fillStyle = '#FFD6B0'; ctx.beginPath(); ctx.arc(18, 10, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5A3A22'; ctx.beginPath(); ctx.arc(16, 4, 10, Math.PI, Math.PI * 2); ctx.fill();
    // goggles
    ctx.fillStyle = g.shield ? '#7CF29A' : '#7FD3FF'; rrect(ctx, 14, 6, 17, 7, 3); ctx.fill();
    ctx.strokeStyle = '#1B1B2F'; ctx.lineWidth = 1.5; ctx.stroke();
    if (g.shield) { ctx.strokeStyle = 'rgba(124,242,154,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(17, 26, 36, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  };
  const drawObs = o => {
    const y = g.ground - o.h;
    if (o.k === 'burner') {
      ctx.fillStyle = '#9AA6BB'; ctx.fillRect(o.x + 10, y + 22, 10, o.h - 30);
      ctx.fillStyle = '#5E6A82'; ctx.fillRect(o.x, g.ground - 8, o.w, 8);
      const f = Math.sin(g.t * 30) * 3;
      ctx.fillStyle = '#FF8A1F'; ctx.beginPath(); ctx.moveTo(o.x + 6, y + 24); ctx.quadraticCurveTo(o.x + 15 + f, y - 10, o.x + 15, y - 4); ctx.quadraticCurveTo(o.x + 15 - f, y - 10, o.x + 24, y + 24); ctx.fill();
      ctx.fillStyle = '#FFD24A'; ctx.beginPath(); ctx.moveTo(o.x + 10, y + 24); ctx.quadraticCurveTo(o.x + 15, y + 4, o.x + 20, y + 24); ctx.fill();
    } else if (o.k === 'beakers') {
      ctx.fillStyle = 'rgba(200,230,255,.25)'; ctx.strokeStyle = '#CFE3FF'; ctx.lineWidth = 2;
      [[0, 0, 22, 40], [24, 12, 22, 28]].forEach(([dx, dy, w, h]) => { ctx.fillRect(o.x + dx, y + dy, w, h); ctx.strokeRect(o.x + dx, y + dy, w, h); });
      ctx.fillStyle = '#FF6B8A'; ctx.fillRect(o.x + 1, y + 20, 20, 19); ctx.fillStyle = '#5CE1E6'; ctx.fillRect(o.x + 25, y + 26, 20, 13);
    } else if (o.k === 'acid') {
      ctx.fillStyle = '#7CF29A'; ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, g.ground - 4, o.w / 2, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#B8FFC9'; for (let i = 0; i < 3; i++) { const bx = o.x + 16 + i * 26, by = g.ground - 8 - ((g.t * 40 + i * 13) % 18); ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill(); }
    } else if (o.k === 'cylinder') {
      ctx.fillStyle = '#C9302C'; rrect(ctx, o.x, y + 10, o.w, o.h - 10, 10); ctx.fill();
      ctx.fillStyle = '#333'; ctx.fillRect(o.x + 11, y, 12, 12);
      ctx.fillStyle = '#fff'; ctx.save(); ctx.translate(o.x + o.w / 2, y + 50); ctx.rotate(Math.PI / 4); ctx.fillRect(-9, -9, 18, 18); ctx.restore();
    }
  };
  const drawItem = it => {
    ctx.save(); ctx.translate(it.x, it.y + Math.sin(g.t * 4 + it.x * .01) * 5);
    if (it.k === 'atom') {
      ctx.strokeStyle = '#5CE1E6'; ctx.lineWidth = 2;
      for (let a = 0; a < 3; a++) { ctx.beginPath(); ctx.ellipse(0, 0, 15, 6, a * Math.PI / 3 + g.t, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#FFC21A'; ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#7FD3FF'; rrect(ctx, -16, -7, 32, 14, 6); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#1B1B2F'; ctx.fillRect(-2, -5, 4, 10);
    }
    ctx.restore();
  };

  const loop = now => {
    const dt = Math.min(.033, (now - last) / 1000 || 0); last = now;
    view();
    if (g) { g.ground = V.H * .8; g.p.x = V.W * .18; if (!alive && g.p.jumps === 0) g.p.y = g.ground - g.p.h; }
    if (g && alive) {
      g.t += dt; g.speed = 330 + g.t * 9; g.bg += g.speed * dt; g.score += dt * 10 + g.speed * dt * .02;
      const p = g.p;
      p.vy += 1700 * dt; p.y += p.vy * dt;
      if (p.y >= g.ground - p.h) { p.y = g.ground - p.h; p.vy = 0; p.jumps = 0; }
      g.next -= dt; if (g.next <= 0) spawnObstacle();
      g.nextItem -= dt; if (g.nextItem <= 0) spawnItem();
      const box = { x: p.x + 6, y: p.y + 4, w: p.w - 10, h: p.h - 6 };
      for (const o of g.obs) {
        o.x -= g.speed * dt;
        if (!o.hit && hit(box, { x: o.x + 4, y: g.ground - o.h + 4, w: o.w - 8, h: o.h - 4 })) {
          o.hit = true;
          if (g.shield) { g.shield = false; g.shake = .3; Sound.tone(800, .15, 'square', .06, 0, 300); }
          else { g.shake = .4; end(); break; }
        }
      }
      g.obs = g.obs.filter(o => o.x > -120);
      for (const it of g.items) {
        it.x -= g.speed * dt;
        if (!it.got && Math.hypot(it.x - (p.x + 17), it.y - (p.y + 26)) < 34) {
          it.got = true;
          if (it.k === 'atom') { g.score += 25; g.atoms++; Sound.coin(); } else { g.shield = true; Sound.tone(700, .2, 'triangle', .1, 0, 1200); }
          for (let i = 0; i < 10; i++) g.parts.push({ x: it.x, y: it.y, vx: Math.random() * 200 - 100, vy: Math.random() * -200, life: .6, c: it.k === 'atom' ? '#5CE1E6' : '#7CF29A' });
        }
      }
      g.items = g.items.filter(it => it.x > -40 && !it.got);
    }
    if (g) {
      ctx.save(); ctx.scale(V.k, V.k);
      if (g.shake > 0) { g.shake -= dt; ctx.translate((Math.random() - .5) * 10, (Math.random() - .5) * 10); }
      drawBg(); g.obs.forEach(drawObs); g.items.forEach(drawItem); drawPlayer();
      for (const pt of g.parts) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 500 * dt; pt.life -= dt; ctx.globalAlpha = Math.max(0, pt.life / .6); ctx.fillStyle = pt.c; ctx.fillRect(pt.x, pt.y, 4, 4); }
      ctx.globalAlpha = 1; g.parts = g.parts.filter(pt => pt.life > 0);
      ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = '700 22px "Dela Gothic One", sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(Math.floor(g.score), size.W - 16, 34);
      hud(`Rekord ${state.games.runner}`);
    }
    raf = requestAnimationFrame(loop);
  };
  newRun();
  overlay(area, `<h2>Lab Runner</h2><p>Lauf durchs Labor! Springe über Brenner, Bechergläser, Säurepfützen und Gasflaschen. Sammle Atome für Punkte, eine Schutzbrille schützt dich einmal.</p><p><b>Springen:</b> Leertaste, Pfeil hoch oder tippen. Zweimal drücken für einen Doppelsprung.</p><button class="btn go" id="rGo" style="margin-top:12px">Start (3 Läufe)</button>`);
  $('#rGo').onclick = start;
  const key = e => { if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); jump(); } };
  const tap = e => { if (e.target.closest('.overlay')) return; e.preventDefault(); jump(); };
  addEventListener('keydown', key); area.addEventListener('pointerdown', tap);
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); removeEventListener('keydown', key); area.removeEventListener('pointerdown', tap); dispose(); };
}
