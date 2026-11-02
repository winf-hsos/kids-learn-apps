// ---------------------------------------------------------------------------
// Dribble slalom: a top-down run up the pitch. Steer past cones and defenders,
// pick up trophies for bonus points. It gets faster all the time. One ticket = 3 runs.
// ---------------------------------------------------------------------------
function slalomGame(area, hud) {
  const { ctx, size, dispose } = setupCanvas(area);
  const LANES = 5, PR = 15;
  let tries = 3, raf = 0, last = 0, alive = false, g = null, keys = { l: false, r: false };
  const field = () => { const fw = Math.min(size.W, 520); return { fw, fx: (size.W - fw) / 2 }; };
  const reset = () => {
    const { fw, fx } = field();
    g = { x: fx + fw / 2, tx: null, y: size.H * .78, speed: 230, dist: 0, bonus: 0, scroll: 0, next: 120, things: [], popups: [], t: 0 };
  };
  const score = () => Math.floor(g.dist / 10) + g.bonus;

  // A new row of obstacles always leaves at least two neighbouring lanes free.
  const spawnRow = () => {
    const { fw, fx } = field(), lw = fw / LANES;
    const free = Math.floor(Math.random() * (LANES - 1));
    const busy = shuffle([...Array(LANES).keys()].filter(i => i !== free && i !== free + 1)).slice(0, 1 + Math.floor(Math.random() * Math.min(3, 1 + g.dist / 3000)));
    for (const lane of busy) {
      const x = fx + lw * (lane + .5);
      if (Math.random() < .45) g.things.push({ kind: 'cone', x, y: -30, r: 11 });
      else g.things.push({ kind: 'def', x, y: -30, r: 17, vx: g.dist > 1500 && Math.random() < .5 ? (Math.random() < .5 ? -1 : 1) * (40 + Math.random() * 50) : 0, home: x, lw, shirt: pick(['#D7263D', '#7C3AED', '#0EA5E9']) });
    }
    if (Math.random() < .35) g.things.push({ kind: 'cup', x: fx + lw * (free + (Math.random() < .5 ? .5 : 1.5)), y: -30, r: 13 });
    g.next = Math.max(95, 190 - g.dist / 80) + Math.random() * 60;
  };

  const start = () => { hideOverlay(area); reset(); alive = true; last = performance.now(); Sound.whistle(); };
  const end = () => {
    alive = false; tries--;
    const s = score(), isNew = recordGame('slalom', s);
    if (s >= 1000) award('slalom1000');
    Sound.tone(160, .3, 'sine', .15, 0, 60);
    overlay(area, `<p class="hand" style="color:#FFC21A">${isNew ? 'Neuer Rekord!' : 'Ball verloren!'}</p><h2>${s} Punkte</h2><p>Rekord: ${state.games.slalom}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">${tries > 0 ? `<button class="btn go" id="slAgain">Nochmal (${tries} übrig)</button>` : ''}<button class="btn" id="slBack">Zurück</button></div>
      ${tries <= 0 ? '<p>Für weitere Läufe brauchst du ein neues Ticket.</p>' : ''}`);
    if (isNew && s > 200) Confetti.burst(100);
    const a = $('#slAgain'); if (a) a.onclick = start;
    $('#slBack').onclick = () => { closeGame(); tab = 'arcade'; render(); };
  };

  const drawPlayer = (x, y, t) => {
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x + 3, y + 4, PR * 1.2, PR * .8, 0, 0, 7); ctx.fill();
    const sway = Math.sin(t * 14) * 3;
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(x - 6, y + 6 + sway, 4, 6, 0, 0, 7); ctx.ellipse(x + 6, y + 6 - sway, 4, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFC21A'; ctx.beginPath(); ctx.ellipse(x, y, PR * 1.15, PR * .7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#5A3A22'; ctx.beginPath(); ctx.arc(x, y - 1, PR * .5, 0, 7); ctx.fill();
    const bx = x + Math.sin(t * 7) * 4, by = y - PR - 10 - Math.abs(Math.sin(t * 9)) * 4;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, 7, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(bx, by, 2.5, 0, 7); ctx.fill();
  };
  const drawThing = o => {
    if (o.kind === 'cone') {
      ctx.fillStyle = '#FF7A1A'; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(o.x, o.y, o.r * .55, 0, 7); ctx.fill();
      ctx.fillStyle = '#FF7A1A'; ctx.beginPath(); ctx.arc(o.x, o.y, o.r * .3, 0, 7); ctx.fill();
    } else if (o.kind === 'def') {
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(o.x + 3, o.y + 4, o.r * 1.2, o.r * .8, 0, 0, 7); ctx.fill();
      ctx.fillStyle = o.shirt; ctx.beginPath(); ctx.ellipse(o.x, o.y, o.r * 1.15, o.r * .72, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#2A1A14'; ctx.beginPath(); ctx.arc(o.x, o.y + 1, o.r * .48, 0, 7); ctx.fill();
    } else {
      const bob = Math.sin(g.t * 5 + o.x) * 2;
      ctx.fillStyle = '#F2B92E'; ctx.strokeStyle = '#A8700E'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(o.x - 9, o.y - 9 + bob); ctx.lineTo(o.x + 9, o.y - 9 + bob); ctx.quadraticCurveTo(o.x + 9, o.y + 3 + bob, o.x, o.y + 4 + bob); ctx.quadraticCurveTo(o.x - 9, o.y + 3 + bob, o.x - 9, o.y - 9 + bob); ctx.fill(); ctx.stroke();
      ctx.fillRect(o.x - 2, o.y + 4 + bob, 4, 5); ctx.fillRect(o.x - 6, o.y + 9 + bob, 12, 3);
    }
  };

  const loop = now => {
    const dt = Math.min(.033, (now - last) / 1000 || 0); last = now;
    const { W, H } = size, { fw, fx } = field();
    if (!g) reset();
    g.t += dt;
    if (alive) {
      g.speed = Math.min(620, 230 + g.dist / 25);
      const dy = g.speed * dt; g.dist += dy; g.scroll = (g.scroll + dy) % 80; g.next -= dy;
      if (g.next <= 0) spawnRow();
      const steer = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
      if (steer) { g.tx = null; g.x += steer * (260 + g.speed * .45) * dt; }
      else if (g.tx !== null) g.x += clamp(g.tx - g.x, -900 * dt, 900 * dt);
      g.x = clamp(g.x, fx + PR + 4, fx + fw - PR - 4);
      for (const o of g.things) {
        o.y += dy;
        if (o.vx) { o.x += o.vx * dt; if (Math.abs(o.x - o.home) > o.lw * .9) { o.x = o.home + Math.sign(o.x - o.home) * o.lw * .9; o.vx = -o.vx; } }
        if (Math.hypot(o.x - g.x, o.y - g.y) < o.r + PR * .85) {
          if (o.kind === 'cup') { o.gone = true; g.bonus += 50; Sound.coin(); g.popups.push({ x: o.x, y: o.y, t: 0, txt: '+50' }); }
          else { alive = false; setTimeout(end, 500); break; }
        }
      }
      g.things = g.things.filter(o => !o.gone && o.y < H + 40);
    }
    ctx.fillStyle = '#0B3A22'; ctx.fillRect(0, 0, W, H);
    for (let y = -80 + g.scroll; y < H; y += 80) { ctx.fillStyle = '#13804A'; ctx.fillRect(fx, y, fw, 40); ctx.fillStyle = '#11733F'; ctx.fillRect(fx, y + 40, fw, 40); }
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx + 2, 0); ctx.lineTo(fx + 2, H); ctx.moveTo(fx + fw - 2, 0); ctx.lineTo(fx + fw - 2, H); ctx.stroke();
    g.things.forEach(drawThing);
    drawPlayer(g.x, g.y, alive ? g.t : 0);
    for (const p of g.popups) { p.t += dt; ctx.globalAlpha = Math.max(0, 1 - p.t); ctx.fillStyle = '#FFC21A'; ctx.font = '700 20px "Dela Gothic One", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.txt, p.x, p.y - p.t * 50); }
    ctx.globalAlpha = 1; g.popups = g.popups.filter(p => p.t < 1);
    hud(`${score()} Punkte · Rekord ${state.games.slalom}`);
    raf = requestAnimationFrame(loop);
  };

  const point = e => {
    if (!alive || e.target.closest('.overlay')) return;
    if (e.type === 'pointermove' && e.pointerType !== 'mouse' && !e.buttons) return;
    g.tx = e.clientX - area.getBoundingClientRect().left;
  };
  const key = (e, down) => {
    if (['ArrowLeft', 'a'].includes(e.key)) { keys.l = down; e.preventDefault(); }
    if (['ArrowRight', 'd'].includes(e.key)) { keys.r = down; e.preventDefault(); }
  };
  const kd = e => key(e, true), ku = e => key(e, false);
  reset();
  overlay(area, `<h2>Dribbel-Slalom</h2><p>Du dribbelst übers Feld. Weiche Hütchen und Gegenspielern aus und sammle Pokale für 50 Extrapunkte. Zum Lenken ziehst du den Finger nach links oder rechts, am Computer gehen auch Maus und Pfeiltasten. Es wird immer schneller, und später laufen die Gegner dir in den Weg.</p><button class="btn go" id="slGo" style="margin-top:12px">Start (3 Läufe)</button>`);
  $('#slGo').onclick = start;
  area.addEventListener('pointerdown', point); area.addEventListener('pointermove', point);
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); area.removeEventListener('pointerdown', point); area.removeEventListener('pointermove', point); removeEventListener('keydown', kd); removeEventListener('keyup', ku); dispose(); };
}
