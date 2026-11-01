// ---------------------------------------------------------------------------
// Keepy-uppy: tap the ball to keep it in the air. One ticket = 3 tries.
// ---------------------------------------------------------------------------
function kickupsGame(area, hud) {
  const { ctx, size, dispose } = setupCanvas(area);
  let tries = 3, raf = 0, last = 0, b = null, alive = false, count = 0, popups = [];
  const reset = () => { b = { x: size.W / 2, y: size.H * .4, vx: 0, vy: 0, r: Math.min(42, size.W * .09), rot: 0, vr: 0 }; count = 0; popups = []; };
  const start = () => { hideOverlay(area); reset(); alive = true; last = performance.now(); b.vy = -700; };
  const end = () => {
    alive = false; tries--;
    const isNew = recordGame('kickups', count);
    if (count >= 30) award('kick30');
    Sound.tone(160, .3, 'sine', .15, 0, 60);
    overlay(area, `<p class="hand" style="color:#FFC21A">${isNew ? 'Neuer Rekord!' : 'Runtergefallen!'}</p><h2>${count} Kontakte</h2><p>Rekord: ${state.games.kickups}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">${tries > 0 ? `<button class="btn go" id="kAgain">Nochmal (${tries} übrig)</button>` : ''}<button class="btn" id="kBack">Zurück</button></div>`);
    if (isNew && count > 5) Confetti.burst(100);
    const a = $('#kAgain'); if (a) a.onclick = start;
    $('#kBack').onclick = () => { closeGame(); tab = 'arcade'; render(); };
  };
  const tap = e => {
    if (!alive || e.target.closest('.overlay')) return;
    const r = area.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const d = Math.hypot(x - b.x, y - b.y);
    if (d < b.r * 1.6 && y > b.y - b.r * 1.6) {
      const off = (b.x - x) / b.r;
      b.vy = -(620 + Math.min(count, 40) * 4); b.vx = off * 260 + (Math.random() - .5) * 60; b.vr = off * 8;
      count++; Sound.kick();
      popups.push({ x: b.x, y: b.y - b.r, t: 0, txt: count % 10 === 0 ? `${count}!` : '+1' });
      if (count % 10 === 0) { Sound.coin(); Confetti.burst(40, x / innerWidth, y / innerHeight); }
    }
  };
  const loop = now => {
    const dt = Math.min(.033, (now - last) / 1000 || 0); last = now;
    const { W, H } = size;
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0E2A52'); sky.addColorStop(1, '#1C4F8A');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // floodlights
    ctx.fillStyle = 'rgba(255,255,220,.08)'; ctx.beginPath(); ctx.moveTo(W * .1, 0); ctx.lineTo(W * .45, H); ctx.lineTo(W * .05, H); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W * .9, 0); ctx.lineTo(W * .95, H); ctx.lineTo(W * .55, H); ctx.fill();
    ctx.fillStyle = '#13804A'; ctx.fillRect(0, H * .9, W, H * .1);
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = `700 ${Math.round(Math.min(W, H) * .22)}px "Dela Gothic One", sans-serif`; ctx.textAlign = 'center';
    ctx.globalAlpha = .18; ctx.fillText(count, W / 2, H * .55); ctx.globalAlpha = 1;
    if (b) {
      if (alive) {
        b.vy += (1300 + Math.min(count, 50) * 8) * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
        if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * .8; } if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * .8; }
        if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * .5; }
        if (b.y > H * .9 - b.r) { b.y = H * .9 - b.r; end(); }
      }
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, b.r, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111';
      const pent = (cx, cy, r) => { ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.fill(); };
      pent(0, 0, b.r * .32);
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; pent(Math.cos(a) * b.r * .78, Math.sin(a) * b.r * .78, b.r * .2); }
      ctx.restore();
    }
    for (const p of popups) { p.t += dt; ctx.globalAlpha = Math.max(0, 1 - p.t); ctx.fillStyle = '#FFC21A'; ctx.font = '700 22px "Dela Gothic One", sans-serif'; ctx.fillText(p.txt, p.x, p.y - p.t * 60); }
    ctx.globalAlpha = 1; popups = popups.filter(p => p.t < 1);
    hud(`Rekord ${state.games.kickups}`);
    raf = requestAnimationFrame(loop);
  };
  reset();
  overlay(area, `<h2>Keepy-Uppy</h2><p>Tippe oder klicke auf den Ball, bevor er den Rasen berührt. Triffst du ihn links, fliegt er nach rechts, und umgekehrt. Es wird immer schneller!</p><button class="btn go" id="kGo" style="margin-top:12px">Start (3 Versuche)</button>`);
  $('#kGo').onclick = start;
  area.addEventListener('pointerdown', tap);
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); area.removeEventListener('pointerdown', tap); dispose(); };
}
