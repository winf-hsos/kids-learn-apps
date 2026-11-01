// ---------------------------------------------------------------------------
// Legionärslauf: a legionary runs along the Via Appia towards Rome at sunset,
// over amphorae, milestones, palisades and broken columns, while chariots come
// the other way. Gold coins give points, a laurel wreath protects once.
// Uses the runner engine in runner.js.
// ---------------------------------------------------------------------------
const LEGION_RUN = (() => {
  const PI = Math.PI;
  // Deterministic noise so scenery tiles look the same every time they scroll by.
  const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  // Calls fn(x, i) for every tile of a layer that scrolled by `off`.
  const strip = (off, period, W, fn) => { for (let i = Math.floor(off / period) - 1; i * period - off < W + period; i++) fn(i * period - off, i); };
  const linGrad = (ctx, x0, y0, x1, y1, stops) => { const gr = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); return gr; };
  const glow = (ctx, x, y, r, inner, outer) => { const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, inner); gr.addColorStop(1, outer); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  // Arch-shaped sub-path (opening at the bottom), used with evenodd fills.
  const arch = (ctx, x, base, w, h) => { ctx.moveTo(x, base); ctx.lineTo(x, base - h + w / 2); ctx.arc(x + w / 2, base - h + w / 2, w / 2, PI, 0); ctx.lineTo(x + w, base); ctx.closePath(); };

  // --- scenery -------------------------------------------------------------
  const cloud = (ctx, x, y, w) => {
    ctx.fillStyle = 'rgba(255,196,186,.28)';
    ctx.beginPath(); ctx.ellipse(x, y, w, w * .16, 0, 0, PI * 2); ctx.ellipse(x - w * .3, y - w * .1, w * .4, w * .16, 0, 0, PI * 2); ctx.ellipse(x + w * .25, y - w * .12, w * .35, w * .15, 0, 0, PI * 2); ctx.fill();
  };
  const cypress = (ctx, x, base, w, h) => { ctx.beginPath(); ctx.ellipse(x, base - h / 2, w / 2, h / 2, 0, 0, PI * 2); ctx.fill(); };
  const colosseum = (ctx, x, base, w, h, holes) => {
    ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, base - h); ctx.quadraticCurveTo(x + w * .32, base - h - 7, x + w * .62, base - h);
    ctx.lineTo(x + w * .68, base - h * .84); ctx.lineTo(x + w * .76, base - h * .9); ctx.lineTo(x + w * .86, base - h * .66); ctx.lineTo(x + w, base - h * .6); ctx.lineTo(x + w, base); ctx.fill();
    const fill = ctx.fillStyle; ctx.fillStyle = holes; ctx.beginPath();
    const bay = (w - 12) / 14, aw = bay * .58;
    for (let r = 0; r < 3; r++) for (let a = 0; a < 14; a++) {
      const ax = x + 6 + a * bay + (bay - aw) / 2, rel = (ax - x) / w;
      if ((r === 2 && rel > .6) || (r === 1 && rel > .84)) continue;
      arch(ctx, ax, base - h * .06 - r * h * .27, aw, h * .19);
    }
    ctx.fill(); ctx.fillStyle = fill;
  };
  const temple = (ctx, x, base, w, h, holes) => {
    ctx.fillRect(x, base - h * .14, w, h * .14);
    ctx.beginPath(); ctx.moveTo(x - 3, base - h * .72); ctx.lineTo(x + w / 2, base - h); ctx.lineTo(x + w + 3, base - h * .72); ctx.fill();
    ctx.fillRect(x - 2, base - h * .76, w + 4, h * .1);
    const fill = ctx.fillStyle; ctx.fillStyle = holes;
    for (let i = 0; i < 5; i++) ctx.fillRect(x + w * .08 + i * w * .18 + w * .06, base - h * .66, w * .07, h * .52);
    ctx.fillStyle = fill;
  };
  const pantheon = (ctx, x, base, w, h) => {
    ctx.fillRect(x, base - h * .55, w, h * .55);
    ctx.beginPath(); ctx.arc(x + w / 2, base - h * .55, w * .42, PI, 0); ctx.fill();
  };
  const farCity = (ctx, x, base, i, holes) => {
    ctx.fillStyle = '#93506F';
    cypress(ctx, x + 40, base, 9, 40); cypress(ctx, x + 54, base, 7, 30);
    colosseum(ctx, x + 80, base, 200, 62, holes);
    ctx.fillStyle = '#93506F';
    temple(ctx, x + 330, base, 74, 52, holes);
    pantheon(ctx, x + 450, base, 60, 50);
    cypress(ctx, x + 530, base, 8, 36); cypress(ctx, x + 546, base, 10, 46);
    if (hash(i) > .4) { temple(ctx, x + 640, base, 50, 36, holes); }
    cypress(ctx, x + 760, base, 9, 34);
  };
  const aqueduct = (ctx, x, base) => {
    const len = 534, top = base - 150;
    ctx.fillStyle = linGrad(ctx, 0, top, 0, base, ['#B9655E', '#9A4C55', '#6E3449']);
    ctx.beginPath(); ctx.rect(x, top, len, base - top);
    for (let i = 0; i < 9; i++) arch(ctx, x + 12 + i * 58, base, 46, 80);
    for (let i = 0; i < 18; i++) arch(ctx, x + 10.5 + i * 29, base - 98, 20, 34);
    ctx.fill('evenodd');
    // sunlit edges of the water channel and the cornice between the tiers
    ctx.fillStyle = '#EBA677'; ctx.fillRect(x, top, len, 3); ctx.fillRect(x, base - 100, len, 2);
    ctx.fillStyle = 'rgba(60,20,40,.25)'; ctx.fillRect(x, top + 3, len, 4);
  };
  const umbrellaPine = (ctx, x, base, s) => {
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x - 4 * s, base - 50 * s, x + 12 * s, base - 92 * s); ctx.stroke();
    ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x + 5 * s, base - 70 * s); ctx.lineTo(x + 26 * s, base - 92 * s); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + 12 * s, base - 98 * s, 38 * s, 11 * s, 0, 0, PI * 2);
    ctx.ellipse(x - 12 * s, base - 94 * s, 20 * s, 8 * s, 0, 0, PI * 2);
    ctx.ellipse(x + 38 * s, base - 94 * s, 18 * s, 7 * s, 0, 0, PI * 2);
    ctx.ellipse(x + 16 * s, base - 106 * s, 24 * s, 7 * s, 0, 0, PI * 2);
    ctx.fill();
  };
  const tomb = (ctx, x, base) => {
    ctx.fillRect(x, base - 26, 60, 26);
    ctx.fillRect(x + 8, base - 56, 44, 30);
    for (let i = 0; i < 6; i++) ctx.fillRect(x + 8 + i * 8, base - 61, 5, 6);
  };
  const bush = (ctx, x, base, w) => { ctx.beginPath(); ctx.ellipse(x, base - w * .28, w * .5, w * .3, 0, 0, PI * 2); ctx.ellipse(x + w * .35, base - w * .2, w * .32, w * .22, 0, 0, PI * 2); ctx.fill(); };

  // --- obstacles -----------------------------------------------------------
  const amphora = (ctx, cx, by, h, rot) => {
    ctx.save(); ctx.translate(cx, by); ctx.rotate(rot);
    ctx.fillStyle = linGrad(ctx, -h * .3, 0, h * .3, 0, ['#8E3B22', '#E08451', '#A84B2A']);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-h * .4, -h * .26, -h * .32, -h * .72, -h * .1, -h * .78); ctx.lineTo(-h * .07, -h * .95);
    ctx.lineTo(h * .07, -h * .95); ctx.lineTo(h * .1, -h * .78); ctx.bezierCurveTo(h * .32, -h * .72, h * .4, -h * .26, 0, 0); ctx.fill();
    ctx.fillStyle = '#C96A3E'; ctx.fillRect(-h * .1, -h, h * .2, h * .07);
    ctx.strokeStyle = '#8E3B22'; ctx.lineWidth = 2.2; ctx.beginPath();
    ctx.moveTo(-h * .07, -h * .9); ctx.quadraticCurveTo(-h * .3, -h * .92, -h * .2, -h * .68);
    ctx.moveTo(h * .07, -h * .9); ctx.quadraticCurveTo(h * .3, -h * .92, h * .2, -h * .68); ctx.stroke();
    ctx.strokeStyle = 'rgba(70,20,10,.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-h * .25, -h * .55); ctx.quadraticCurveTo(0, -h * .5, h * .25, -h * .55); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,225,190,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-h * .17, -h * .66); ctx.quadraticCurveTo(-h * .23, -h * .42, -h * .09, -h * .2); ctx.stroke();
    ctx.restore();
  };
  const stake = (ctx, x0, y0, x1, y1) => {
    const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
    ctx.lineCap = 'butt'; ctx.lineWidth = 4.5;
    ctx.strokeStyle = '#8A5A33'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * 6, y1 - uy * 6); ctx.stroke();
    ctx.fillStyle = '#E2C08F'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * 7 - uy * 2.4, y1 - uy * 7 + ux * 2.4); ctx.lineTo(x1 - ux * 7 + uy * 2.4, y1 - uy * 7 - ux * 2.4); ctx.fill();
  };
  const horse = (ctx, x, base, ph) => {
    const c = '#6E4326', dark = '#2E1B10';
    // legs: a galloping cycle, front pair and hind pair out of phase
    ctx.lineCap = 'round'; ctx.lineWidth = 3;
    [[13, 0, '#563318'], [33, 2.2, '#563318'], [17, 1, c], [37, 3.2, c]].forEach(([lx, off, col]) => {
      const a = Math.sin(ph + off) * .7, kx = x + lx + Math.sin(a) * 7, ky = base - 15;
      ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(x + lx, base - 27); ctx.lineTo(kx, ky); ctx.lineTo(kx + Math.sin(a * 1.6) * 6, base - 3); ctx.stroke();
      ctx.fillStyle = dark; ctx.fillRect(kx + Math.sin(a * 1.6) * 6 - 2, base - 4, 4, 3);
    });
    // tail
    ctx.strokeStyle = dark; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 39, base - 34); ctx.quadraticCurveTo(x + 48, base - 34 + Math.sin(ph) * 3, x + 50, base - 22); ctx.stroke();
    // body, neck and head
    ctx.fillStyle = linGrad(ctx, 0, base - 40, 0, base - 22, ['#8A5634', c, '#4E2E18']);
    ctx.beginPath(); ctx.ellipse(x + 25, base - 31, 16, 8.5, 0, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 16, base - 37); ctx.lineTo(x + 5, base - 52); ctx.lineTo(x + 1, base - 48); ctx.lineTo(x + 10, base - 28); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 1, base - 47, 8, 3.8, -.55, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 5, base - 53); ctx.lineTo(x + 7, base - 58); ctx.lineTo(x + 8, base - 52); ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x + 6, base - 53); ctx.quadraticCurveTo(x + 11, base - 44, x + 17, base - 38); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + 1, base - 49, 1, 0, PI * 2); ctx.fill();
    // red plume on the bridle
    ctx.fillStyle = '#E0352B'; ctx.beginPath(); ctx.ellipse(x + 6, base - 58, 2, 4, -.3, 0, PI * 2); ctx.fill();
  };
  const chariot = (ctx, g, o, gr) => {
    const x = o.x, ph = g.t * 18 + o.ph;
    // dust kicked up behind the wheel
    for (let i = 0; i < 4; i++) { const k = (g.t * 3 + i * .25) % 1; ctx.fillStyle = `rgba(214,170,120,${.35 * (1 - k)})`; ctx.beginPath(); ctx.arc(x + 74 + k * 30, gr - 4 - k * 10, 4 + k * 9, 0, PI * 2); ctx.fill(); }
    horse(ctx, x, gr, ph);
    // pole and reins
    ctx.strokeStyle = '#4A2A16'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x + 28, gr - 36); ctx.lineTo(x + 54, gr - 22); ctx.stroke();
    ctx.strokeStyle = '#2E1B10'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 2, gr - 46); ctx.quadraticCurveTo(x + 30, gr - 52, x + 60, gr - 41); ctx.stroke();
    // charioteer
    ctx.fillStyle = '#E8DCC6'; rrect(ctx, x + 58, gr - 46, 10, 14, 3); ctx.fill();
    ctx.fillStyle = '#E5A87A'; ctx.beginPath(); ctx.arc(x + 62, gr - 50, 4.2, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#D9A441'; ctx.beginPath(); ctx.arc(x + 62.5, gr - 50.5, 4.6, PI, 0); ctx.fill();
    ctx.fillStyle = '#E0352B'; ctx.beginPath(); ctx.moveTo(x + 58, gr - 53); ctx.quadraticCurveTo(x + 63, gr - 60, x + 68, gr - 53); ctx.fill();
    // chariot box: curved red front with a gold rim
    ctx.fillStyle = linGrad(ctx, x + 52, 0, x + 78, 0, ['#8E1C17', '#D0362C', '#9E211B']);
    ctx.beginPath(); ctx.moveTo(x + 52, gr - 14); ctx.quadraticCurveTo(x + 50, gr - 34, x + 58, gr - 36); ctx.lineTo(x + 78, gr - 30); ctx.lineTo(x + 78, gr - 14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#F0C24B'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = '#F0C24B'; ctx.beginPath(); ctx.arc(x + 62, gr - 24, 2.4, 0, PI * 2); ctx.fill();
    // spoked wheel rolling towards the player
    const wx = x + 64, wy = gr - 12, rot = -g.t * 14;
    ctx.strokeStyle = '#3E2614'; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let s = 0; s < 6; s++) { const a = rot + s * PI / 3; ctx.moveTo(wx, wy); ctx.lineTo(wx + Math.cos(a) * 11, wy + Math.sin(a) * 11); }
    ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(wx, wy, 11.5, 0, PI * 2); ctx.stroke();
    ctx.fillStyle = '#F0C24B'; ctx.beginPath(); ctx.arc(wx, wy, 2.6, 0, PI * 2); ctx.fill();
  };

  // --- the legionary -------------------------------------------------------
  const leg = (ctx, a, col) => {
    const hx = 15, hy = 38, kx = hx + Math.sin(a) * 7, ky = hy + Math.cos(a) * 7;
    const sa = a - (a < 0 ? .9 : .15), fx = kx + Math.sin(sa) * 7, fy = Math.min(52, ky + Math.cos(sa) * 7);
    ctx.strokeStyle = col; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    // caliga: sandal with straps up the shin
    ctx.fillStyle = '#4E2C14'; rrect(ctx, fx - 2.5, fy - 2.5, 8, 3.2, 1.4); ctx.fill();
    ctx.strokeStyle = '#4E2C14'; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = .55; k < 1; k += .2) { const sx = kx + (fx - kx) * k, sy = ky + (fy - ky) * k; ctx.moveTo(sx - 2.2, sy); ctx.lineTo(sx + 2.2, sy - 1); }
    ctx.stroke();
  };
  const laurelLeaves = (ctx, cx, cy, r, from, to, n, size) => {
    for (let i = 0; i <= n; i++) {
      const a = from + (to - from) * i / n;
      ctx.fillStyle = i % 2 ? '#5E9A36' : '#94D05E';
      ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, size, size * .42, a + PI / 2 + (i % 2 ? .5 : -.5), 0, PI * 2); ctx.fill();
    }
  };
  const drawLegionary = (ctx, g, alive) => {
    const p = g.p, run = alive && p.jumps === 0, ph = g.t * 15;
    const bob = run ? -Math.abs(Math.sin(ph)) * 2.5 : 0;
    ctx.save(); ctx.translate(p.x, p.y + bob);
    if (g.shield) glow(ctx, 17, 26, 44, `rgba(255,214,90,${.38 + Math.sin(g.t * 6) * .1})`, 'rgba(255,214,90,0)');
    // pilum carried behind the body
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#7A4A26'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-1, 50); ctx.lineTo(5, 2); ctx.stroke();
    ctx.strokeStyle = '#B9C3CE'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(5, 2); ctx.lineTo(7.5, -18); ctx.stroke();
    ctx.fillStyle = '#EEF2F6'; ctx.beginPath(); ctx.moveTo(8.2, -25); ctx.lineTo(9.6, -17.6); ctx.lineTo(5.4, -18.2); ctx.fill();
    // legs
    const a1 = run ? Math.sin(ph) * .85 : .75, a2 = run ? -Math.sin(ph) * .85 : -.45;
    leg(ctx, a2, '#B97D55'); leg(ctx, a1, '#D99A6C');
    // red tunic with leather strips (pteruges)
    ctx.fillStyle = '#B3261E'; ctx.beginPath(); ctx.moveTo(9, 31); ctx.lineTo(24, 31); ctx.lineTo(26.5, 42); ctx.lineTo(6.5, 42); ctx.fill();
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#6B3F1F'; ctx.fillRect(9.4 + i * 3.4, 33, 2, 7.5); ctx.fillStyle = '#F0C24B'; ctx.fillRect(9.4 + i * 3.4, 39.5, 2, 1.6); }
    // back arm holding the pilum
    ctx.strokeStyle = '#B97D55'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(12, 20); ctx.lineTo(7, 28); ctx.lineTo(2.6, 26); ctx.stroke();
    // lorica segmentata with its iron bands and the belt
    ctx.fillStyle = linGrad(ctx, 8, 0, 25, 0, ['#7E8895', '#E6EBF0', '#9BA6B2']);
    rrect(ctx, 8, 16.5, 17, 16, 4); ctx.fill();
    ctx.strokeStyle = '#56606C'; ctx.lineWidth = 1; ctx.beginPath();
    [21, 25, 29].forEach(y => { ctx.moveTo(8.5, y); ctx.lineTo(24.5, y); }); ctx.stroke();
    ctx.fillStyle = '#AEB8C3'; ctx.beginPath(); ctx.ellipse(13.5, 18.5, 5.5, 3.2, -.2, 0, PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#6B3F1F'; ctx.fillRect(8, 30.6, 17, 2.8);
    ctx.fillStyle = '#F0C24B'; for (let i = 0; i < 4; i++) ctx.fillRect(9.5 + i * 4.2, 31.2, 1.6, 1.6);
    // head and galea with the transverse crest
    ctx.fillStyle = '#C98A60'; ctx.fillRect(16, 13, 5, 5);
    ctx.fillStyle = '#E5A87A'; ctx.beginPath(); ctx.arc(19.5, 10, 7.4, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#C98A60'; ctx.beginPath(); ctx.moveTo(26.6, 9.5); ctx.lineTo(28.6, 12.6); ctx.lineTo(26.2, 13); ctx.fill();
    ctx.fillStyle = '#2A1A14'; ctx.beginPath(); ctx.arc(23.6, 9.4, 1.1, 0, PI * 2); ctx.fill();
    const helm = linGrad(ctx, 10, 0, 28, 0, ['#A8741E', '#F2C65A', '#C08A2A']);
    ctx.fillStyle = helm;
    ctx.beginPath(); ctx.arc(18.6, 8.6, 8.8, PI, 0); ctx.fill();
    ctx.fillRect(9.2, 7.6, 19.2, 2.4);
    ctx.beginPath(); ctx.moveTo(10.6, 9); ctx.lineTo(6.6, 14.6); ctx.lineTo(11.6, 14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(16.4, 9.4); ctx.lineTo(22, 9.4); ctx.lineTo(21, 16.6); ctx.lineTo(16.8, 15.4); ctx.fill();
    ctx.strokeStyle = 'rgba(255,244,210,.8)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(18.6, 8.6, 6.6, PI * 1.15, PI * 1.45); ctx.stroke();
    const sway = run ? Math.sin(ph) * 1.2 : -1.5;
    ctx.fillStyle = '#E0352B'; ctx.beginPath(); ctx.moveTo(9.6, 1.6); ctx.quadraticCurveTo(17, -12 + sway, 28.4, -.4 + sway); ctx.quadraticCurveTo(19, -4.6, 9.6, 1.6); ctx.fill();
    ctx.strokeStyle = '#9E1F18'; ctx.lineWidth = .9; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const t = i / 5, bx = 11 + t * 16; ctx.moveTo(bx, -1 - Math.sin(t * PI) * 5); ctx.lineTo(bx + 1.2, -4.6 - Math.sin(t * PI) * 5 + sway * t); }
    ctx.stroke();
    if (g.shield) laurelLeaves(ctx, 18.6, 8.6, 9.2, PI * 1.05, PI * 1.95, 7, 2.6);
    // scutum held in front, red with gold rim, boss and wings
    ctx.save(); ctx.translate(27, 31); ctx.rotate(run ? Math.sin(ph) * .04 : -.08);
    ctx.fillStyle = linGrad(ctx, -6, 0, 6, 0, ['#8A1A15', '#D0362C', '#9A2019']);
    rrect(ctx, -6, -16, 12, 32, 4); ctx.fill();
    ctx.strokeStyle = g.shield ? '#FFE27A' : '#F0C24B'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(0, -4); ctx.moveTo(0, 4); ctx.lineTo(0, 13);
    ctx.moveTo(-1, -5); ctx.quadraticCurveTo(-4, -9, -4.5, -13); ctx.moveTo(1, -5); ctx.quadraticCurveTo(4, -9, 4.5, -13);
    ctx.moveTo(-1, 5); ctx.quadraticCurveTo(-4, 9, -4.5, 13); ctx.moveTo(1, 5); ctx.quadraticCurveTo(4, 9, 4.5, 13); ctx.stroke();
    ctx.fillStyle = linGrad(ctx, -3, -3, 3, 3, ['#FFF0B0', '#E0A21E']); ctx.beginPath(); ctx.arc(0, 0, 3.4, 0, PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  return {
    id: 'legion', title: 'Legionärslauf', badge: 'legion500', dust: '#C9A27A',
    intro: '<p>Als Legionär läufst du über die Via Appia nach Rom. Springe über Amphoren, Meilensteine, Palisaden und Säulenreste und pass auf die Streitwagen auf, die dir entgegenkommen. Goldmünzen bringen Punkte, und ein Lorbeerkranz schützt dich einmal.</p>',
    collected: n => `${n} ${n === 1 ? 'Goldmünze' : 'Goldmünzen'} gesammelt`,
    obstacles: {
      amphorae: { w: 46, h: 44 }, milestone: { w: 28, h: 58 }, palisade: { w: 64, h: 32 },
      column: { w: 36, h: 92, from: 12 }, chariot: { w: 78, h: 54, vx: 110, from: 20 },
    },
    items: { coin: '#FFD24A', power: '#9BE07A' },
    drawBg(ctx, g, V) {
      const { W, H } = V, gr = g.ground, hz = gr - 30;
      ctx.fillStyle = linGrad(ctx, 0, 0, 0, hz, ['#24184F', '#5B2A6E', '#B4507A', '#F2915A', '#FFD27F']);
      ctx.fillRect(0, 0, W, hz + 2);
      // first stars fade in at the top
      ctx.fillStyle = 'rgba(255,240,220,.7)';
      strip(g.bg * .01, 90, W, (x, i) => { const y = 8 + hash(i) * hz * .3; ctx.globalAlpha = .3 + hash(i + 2) * .5; ctx.fillRect(x + hash(i + 1) * 80, y, 1.6, 1.6); });
      ctx.globalAlpha = 1;
      // low sun that sinks slowly during a run
      const sx = W * .68, sy = hz - 64 + Math.min(44, g.t * .5);
      glow(ctx, sx, sy, 170, 'rgba(255,224,150,.7)', 'rgba(255,170,100,0)');
      ctx.fillStyle = '#FFF1C4'; ctx.beginPath(); ctx.arc(sx, sy, 30, 0, PI * 2); ctx.fill();
      strip(g.bg * .03, 520, W, (x, i) => cloud(ctx, x + hash(i + 5) * 220, 40 + hash(i) * hz * .35, 50 + hash(i + 9) * 60));
      // a few birds gliding home, flapping out of step
      ctx.strokeStyle = 'rgba(50,25,60,.75)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      strip(g.bg * .09 + g.t * 14, 300, W, (x, i) => {
        if (hash(i + 21) < .35) return;
        for (let b = 0; b < 3; b++) {
          const bx = x + hash(i + b) * 120 + b * 18, by = hz * (.25 + hash(i + 30) * .4) + b * 9, f = Math.sin(g.t * 9 + i + b * 2) * 3.5;
          ctx.beginPath(); ctx.moveTo(bx - 6, by - f); ctx.quadraticCurveTo(bx - 3, by - 2, bx, by); ctx.quadraticCurveTo(bx + 3, by - 2, bx + 6, by - f); ctx.stroke();
        }
      });
      // Rome on the horizon, then hills with cypresses
      strip(g.bg * .06, 900, W, (x, i) => farCity(ctx, x, hz + 4, i, 'rgba(255,186,130,.45)'));
      const ho = g.bg * .16, hill = wx => hz + 8 - 16 - Math.sin(wx * .004) * 14 - Math.sin(wx * .011 + 1) * 7;
      ctx.fillStyle = '#7A3D5F'; ctx.beginPath(); ctx.moveTo(0, gr);
      for (let x = 0; x <= W + 16; x += 16) ctx.lineTo(x, hill(x + ho));
      ctx.lineTo(W + 16, gr); ctx.fill();
      ctx.fillStyle = '#5E2C4C';
      strip(ho, 120, W, (x, i) => { if (hash(i) < .45) return; const cx = x + hash(i + 3) * 90; cypress(ctx, cx, hill(cx + ho) + 4, 7, 26 + hash(i + 7) * 18); });
      strip(g.bg * .3, 860, W, x => aqueduct(ctx, x + 40, gr - 4));
      // roadside: umbrella pines, tombs and bushes in silhouette
      ctx.fillStyle = '#3A2440';
      strip(g.bg * .62, 360, W, (x, i) => {
        if (hash(i) > .3) umbrellaPine(ctx, x + hash(i + 4) * 120, gr, .9 + hash(i + 6) * .35);
        if (hash(i + 8) > .72) tomb(ctx, x + 200, gr);
        bush(ctx, x + 300 * hash(i + 11), gr, 26 + hash(i + 12) * 20);
      });
      // Via Appia: curb stones and polygonal paving, lower rows scroll faster for depth
      ctx.fillStyle = '#3E2A30'; ctx.fillRect(0, gr, W, H - gr);
      const stones = ['#7A5A50', '#6C4E48', '#86645A', '#735349', '#5F4442'];
      let y = gr + 4, row = 0;
      while (y < H) {
        const rh = 18 + row * 5, per = 50 + row * 12, sp = 1 + row * .14;
        strip(g.bg * sp + row * 23, per, W, (x, i) => {
          const j = hash(i * 7 + row), wv = per - 4 - j * 6;
          ctx.fillStyle = stones[Math.floor(hash(i * 3 + row * 11) * stones.length)];
          rrect(ctx, x + j * 4, y, wv, rh, 5 + row); ctx.fill();
          ctx.fillStyle = 'rgba(255,200,150,.14)'; ctx.fillRect(x + j * 4 + 4, y + 1, wv - 8, 2);
        });
        y += rh + 3; row++;
      }
      ctx.fillStyle = '#D9A273'; ctx.fillRect(0, gr, W, 3);
      ctx.fillStyle = 'rgba(40,20,30,.35)'; ctx.fillRect(0, gr + 3, W, 2);
    },
    drawPlayer: drawLegionary,
    drawObstacle(ctx, g, o) {
      const gr = g.ground, y = gr - o.h, x = o.x;
      ctx.fillStyle = 'rgba(30,10,20,.35)'; ctx.beginPath(); ctx.ellipse(x + o.w / 2, gr + 2, o.w / 2 + 4, 4, 0, 0, PI * 2); ctx.fill();
      if (o.k === 'amphorae') {
        ctx.fillStyle = '#B98A5E'; ctx.beginPath(); ctx.ellipse(x + 23, gr, 24, 6, 0, PI, 0); ctx.fill();
        amphora(ctx, x + 31, gr - 2, 38, .16); amphora(ctx, x + 15, gr - 1, 43, -.1);
      } else if (o.k === 'milestone') {
        ctx.fillStyle = '#B5A68C'; ctx.fillRect(x, gr - 8, 28, 8);
        ctx.fillStyle = linGrad(ctx, x + 3, 0, x + 25, 0, ['#A39276', '#EEE4CE', '#B9AA8F']);
        ctx.fillRect(x + 3, y + 7, 22, o.h - 15);
        rrect(ctx, x + 1, y, 26, 8, 3); ctx.fill();
        ctx.fillStyle = '#6A5A45'; ctx.font = '700 8px Georgia, serif'; ctx.textAlign = 'center';
        ctx.fillText('MP', x + 14, y + 22); ctx.fillText('XII', x + 14, y + 32);
        ctx.fillRect(x + 7, y + 36, 14, 1);
        ctx.strokeStyle = 'rgba(90,70,50,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 19, y + 40); ctx.lineTo(x + 16, y + 46); ctx.lineTo(x + 18, y + 50); ctx.stroke();
        ctx.fillStyle = '#6E8C4A'; ctx.beginPath(); ctx.ellipse(x + 8, gr - 9, 6, 3, 0, 0, PI * 2); ctx.fill();
      } else if (o.k === 'palisade') {
        for (let i = 0; i < 3; i++) { const sx = x + 4 + i * 20; stake(ctx, sx, gr, sx + 18, y); stake(ctx, sx + 18, gr, sx, y); }
        ctx.fillStyle = linGrad(ctx, 0, gr - 19, 0, gr - 12, ['#9A6A3E', '#6B4426']); ctx.fillRect(x - 2, gr - 19, o.w + 4, 7);
        ctx.fillStyle = '#C9A46A'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 11 + i * 20, gr - 20, 4, 9);
      } else if (o.k === 'column') {
        ctx.fillStyle = '#C9BCA4'; ctx.fillRect(x, gr - 10, 36, 10);
        ctx.fillStyle = '#DCD0B9'; rrect(ctx, x + 3, gr - 16, 30, 7, 3); ctx.fill();
        ctx.fillStyle = linGrad(ctx, x + 5, 0, x + 31, 0, ['#ADA088', '#F3EBDA', '#C2B59C']);
        ctx.beginPath(); ctx.moveTo(x + 5, gr - 15); ctx.lineTo(x + 5, y + 12); ctx.lineTo(x + 11, y + 4); ctx.lineTo(x + 16, y + 10);
        ctx.lineTo(x + 22, y); ctx.lineTo(x + 27, y + 8); ctx.lineTo(x + 31, y + 5); ctx.lineTo(x + 31, gr - 15); ctx.fill();
        ctx.strokeStyle = 'rgba(120,100,80,.35)'; ctx.lineWidth = 1.2; ctx.beginPath();
        for (let fx = x + 9; fx < x + 30; fx += 4.4) { ctx.moveTo(fx, y + 14); ctx.lineTo(fx, gr - 17); }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(80,60,40,.6)'; ctx.beginPath(); ctx.moveTo(x + 22, y + 2); ctx.lineTo(x + 20, y + 22); ctx.lineTo(x + 24, y + 34); ctx.stroke();
        laurelLeaves(ctx, x + 18, y + 64, 15, PI * .6, PI * 1.4, 6, 3.2);
        ctx.fillStyle = '#CFC3AC'; ctx.save(); ctx.translate(x + 44, gr - 4); ctx.rotate(.4); ctx.fillRect(-6, -4, 12, 8); ctx.restore();
      } else if (o.k === 'chariot') {
        chariot(ctx, g, o, gr);
      }
    },
    drawItem(ctx, g, it) {
      ctx.save(); ctx.translate(it.x, it.y + Math.sin(g.t * 4 + it.x * .01) * 5);
      if (it.k === 'coin') {
        glow(ctx, 0, 0, 24, 'rgba(255,214,90,.45)', 'rgba(255,214,90,0)');
        ctx.scale(Math.max(.2, Math.abs(Math.cos(g.t * 4 + it.x * .02))), 1);
        ctx.fillStyle = linGrad(ctx, -10, -10, 10, 10, ['#FFF0A0', '#F2B92E', '#C98A12']); ctx.beginPath(); ctx.arc(0, 0, 11, 0, PI * 2); ctx.fill();
        ctx.strokeStyle = '#A8700E'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.strokeStyle = 'rgba(150,95,10,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 8, 0, PI * 2); ctx.stroke();
        // emperor's profile with a laurel
        ctx.fillStyle = '#B07A14'; ctx.beginPath(); ctx.arc(.4, -.8, 3.6, 0, PI * 2); ctx.fill(); ctx.fillRect(-1.6, 1.5, 3.6, 3.4);
        ctx.beginPath(); ctx.moveTo(3.8, -1); ctx.lineTo(5.2, .4); ctx.lineTo(3.6, .8); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(-4, -4.5, 1.8, 0, PI * 2); ctx.fill();
      } else {
        glow(ctx, 0, 0, 30, 'rgba(190,255,140,.45)', 'rgba(190,255,140,0)');
        ctx.rotate(Math.sin(g.t * 2) * .15);
        laurelLeaves(ctx, 0, 0, 11, -PI * .5 + .45, PI * .5 - .1, 6, 4.2);
        laurelLeaves(ctx, 0, 0, 11, PI * .5 + .1, PI * 1.5 - .45, 6, 4.2);
        ctx.fillStyle = '#F0C24B'; [[-6, -5], [7, 2], [-8, 4]].forEach(([bx, by]) => { ctx.beginPath(); ctx.arc(bx, by, 1.4, 0, PI * 2); ctx.fill(); });
        ctx.fillStyle = '#D9342A'; ctx.beginPath(); ctx.moveTo(0, 11); ctx.lineTo(-4, 17); ctx.lineTo(-1, 16); ctx.lineTo(0, 12); ctx.lineTo(1, 16); ctx.lineTo(4, 17); ctx.fill();
      }
      ctx.restore();
    },
  };
})();
