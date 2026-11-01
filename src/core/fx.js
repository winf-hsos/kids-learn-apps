// Feedback effects: WebAudio sounds (no files), confetti, toasts and modals.

const Sound = {
  ctx: null,
  ensure() {
    if (!state.sound) return null;
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { return null; }
    return this.ctx;
  },
  tone(f, d = .12, type = 'sine', vol = .12, when = 0, slide = 0) {
    const c = this.ensure(); if (!c) return;
    const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .02);
  },
  right() { this.tone(660, .09, 'triangle', .14); this.tone(990, .16, 'triangle', .14, .08); },
  wrong() { this.tone(200, .28, 'sawtooth', .07, 0, 120); },
  click() { this.tone(520, .04, 'square', .04); },
  coin() { this.tone(988, .07, 'square', .06); this.tone(1319, .18, 'square', .06, .07); },
  fanfare() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .22, 'triangle', .13, i * .11)); this.tone(1047, .5, 'triangle', .1, .5); },
  whistle() { this.tone(2100, .12, 'sine', .08); this.tone(2100, .35, 'sine', .08, .16); },
  kick() { this.tone(140, .12, 'sine', .25, 0, 50); },
  // Looping filtered noise, e.g. for a roaring flame or a crowd.
  noiseNode: null,
  setRoar(level) {
    const c = this.ensure();
    if (!c) return;
    if (!this.noiseNode) {
      const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
      const filt = c.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 900; filt.Q.value = .6;
      const g = c.createGain(); g.gain.value = 0;
      src.connect(filt); filt.connect(g); g.connect(c.destination); src.start();
      this.noiseNode = { src, g };
    }
    this.noiseNode.g.gain.setTargetAtTime(level, c.currentTime, .08);
  },
  stopRoar() { if (this.noiseNode) { try { this.noiseNode.src.stop(); } catch (e) { } this.noiseNode = null; } },
};

const Confetti = {
  parts: [], running: false,
  burst(n = 120, x = .5, y = .35) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = $('#confetti'); const W = cv.width = innerWidth, H = cv.height = innerHeight;
    const cols = ['#2257E6', '#FFC21A', '#D7263D', '#12995A', '#8FE3FF', '#FF8A3D'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
      this.parts.push({ x: x * W, y: y * H, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: 4 + Math.random() * 6, c: pick(cols), rot: Math.random() * 6, vr: Math.random() * .4 - .2, life: 120 + Math.random() * 60 });
    }
    if (!this.running) { this.running = true; requestAnimationFrame(() => this.tick()); }
  },
  tick() {
    const cv = $('#confetti'), g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, cv.height);
    this.parts = this.parts.filter(p => p.life > 0 && p.y < cv.height + 20);
    for (const p of this.parts) {
      p.vy += .25; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.c; g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore();
    }
    if (this.parts.length) requestAnimationFrame(() => this.tick()); else { this.running = false; g.clearRect(0, 0, cv.width, cv.height); }
  },
};

function toast(title, text, iconHtml) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${iconHtml || ICON.medal('var(--gold)', 'var(--gold-ink)')}<div><b>${title}</b><span>${text}</span></div>`;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3700);
}

const modalQueue = [];
function modal(html, buttons = [{ label: 'Weiter', cls: 'primary' }]) {
  return new Promise(resolve => {
    modalQueue.push({ html, buttons, resolve });
    if (modalQueue.length === 1) showNextModal();
  });
}
function showNextModal() {
  const m = modalQueue[0]; if (!m) return;
  const el = document.createElement('div');
  el.className = 'modal';
  el.innerHTML = `<div class="box" role="dialog" aria-modal="true">${m.html}<div class="actions" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px">${m.buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}</div></div>`;
  document.body.appendChild(el);
  $('button', el).focus();
  el.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]'); if (!b) return;
    el.remove(); modalQueue.shift(); m.resolve(+b.dataset.i); showNextModal();
  });
}
