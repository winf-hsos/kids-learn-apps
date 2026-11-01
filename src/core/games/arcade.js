// Reward mini-games: registry, shared game stage and helpers. Each game gets a
// full-screen stage and returns a cleanup function. Apps pick games and star
// thresholds in APP.games and may override name and desc there.

const GAME_DEFS = {
  runner: {
    name: 'Lab Runner', desc: 'Jump & Run durchs Labor. Springe über Flammen, sammle Schutzbrillen.',
    record: v => `Rekord: ${v} Punkte`, badge: { id: 'runner500', name: 'Laufwunder', desc: '500 Punkte im Lab Runner' },
    play: (area, hud) => runnerGame(area, hud),
  },
  penalty: {
    name: 'Elfmeter-Quiz', desc: 'Schwere Fußballfrage richtig? Dann darfst du schießen. 5 Elfer gegen den Torwart.',
    record: v => `Rekord: ${v}/5 Tore`, badge: { id: 'penalty5', name: 'Elfmeterkönig', desc: '5 von 5 Elfmetern verwandelt' },
    play: (area, hud) => penaltyGame(area, hud),
  },
  kickups: {
    name: 'Keepy-Uppy', desc: 'Halte den Ball in der Luft. Wie viele Kontakte schaffst du?',
    record: v => `Rekord: ${v} Kontakte`, badge: { id: 'kick30', name: 'Ballzauberer', desc: '30 Kontakte beim Keepy-Uppy' },
    play: (area, hud) => kickupsGame(area, hud),
  },
  proquiz: {
    name: 'Fußball-Experte', desc: '10 knallharte Fragen auf Zeit. Nur echte Experten schaffen 8.',
    record: v => `Rekord: ${v}/10`, badge: { id: 'expert8', name: 'Fußball-Experte', desc: 'Mindestens 8 von 10 im Experten-Quiz' },
    play: (area, hud) => proQuizGame(area, hud),
  },
};

function gameThumb(id) {
  const thumbs = {
    runner: svg(`<rect width="200" height="100" fill="#1B2A55"/><rect y="78" width="200" height="22" fill="#2E3F73"/><circle cx="170" cy="20" r="8" fill="#FFD27A"/>
      <path d="M120 78 C128 64 130 56 126 46 C134 54 138 64 132 78 Z" fill="#FF8A1F"/><circle cx="60" cy="44" r="8" fill="#FFD6B0"/><rect x="53" y="40" width="14" height="5" rx="2" fill="#7FD3FF"/><rect x="54" y="52" width="12" height="16" rx="3" fill="#fff"/><path d="M56 68 l-4 10 M64 68 l5 9" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`, '0 0 200 100'),
    penalty: svg(`<rect width="200" height="100" fill="#0F6B3E"/><path d="M40 20 H160 V70 H40 Z" fill="none" stroke="#fff" stroke-width="4"/><path d="M40 20 L52 30 H148 L160 20 M52 30 V70 M148 30 V70" stroke="#fff" stroke-width="1" opacity=".5"/>
      <circle cx="100" cy="86" r="8" fill="#fff" stroke="#111"/><rect x="92" y="38" width="16" height="26" rx="5" fill="#FFC21A"/><circle cx="100" cy="33" r="6" fill="#FFD6B0"/>`, '0 0 200 100'),
    kickups: svg(`<rect width="200" height="100" fill="#123B6B"/><circle cx="100" cy="36" r="14" fill="#fff" stroke="#111" stroke-width="2"/><path d="M100 26 l6 5 -2 7 h-8 l-2 -7z" fill="#111"/><path d="M80 92 Q100 70 120 92" fill="#FFD6B0"/><text x="160" y="30" fill="#FFC21A" font-size="22" font-weight="700" font-family="sans-serif">27</text>`, '0 0 200 100'),
    proquiz: svg(`<rect width="200" height="100" fill="#2A1B55"/><path d="M84 22 h32 v18 a16 16 0 0 1 -32 0 z M84 28 h-8 a8 8 0 0 0 8 12 M116 28 h8 a8 8 0 0 1 -8 12 M100 56 v12 M88 74 h24" fill="none" stroke="#FFC21A" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><text x="140" y="40" fill="#fff" font-size="24" font-weight="700" font-family="sans-serif">?</text><text x="44" y="70" fill="#fff" font-size="18" font-weight="700" font-family="sans-serif">?</text>`, '0 0 200 100'),
  };
  return thumbs[id].replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
}

let gameCleanup = null;

function openGame(id) {
  closeGame();
  const g = GAMES.find(x => x.id === id);
  const st = document.createElement('div');
  st.className = 'game-stage'; st.id = 'gameStage';
  st.innerHTML = `<div class="game-bar"><button class="iconbtn" id="gQuit" aria-label="Spiel beenden">${ICON.close}</button><span class="ttl">${g.name}</span><span class="chip" id="gHud" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.25);color:#fff"></span></div><div class="game-area" id="gArea"></div>`;
  document.body.appendChild(st);
  document.body.style.overflow = 'hidden';
  $('#gQuit').onclick = () => { closeGame(); render(); };
  const area = $('#gArea');
  const hud = html => { $('#gHud').innerHTML = html; };
  gameCleanup = GAME_DEFS[id].play(area, hud);
}
function closeGame() {
  if (gameCleanup) { try { gameCleanup(); } catch (e) { } gameCleanup = null; }
  const st = $('#gameStage'); if (st) st.remove();
  document.body.style.overflow = '';
}

function setupCanvas(area) {
  const cv = document.createElement('canvas'); area.appendChild(cv);
  const ctx = cv.getContext('2d');
  const size = { W: 0, H: 0 };
  const fit = () => {
    const r = area.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    size.W = r.width; size.H = r.height;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();
  addEventListener('resize', fit);
  return { cv, ctx, size, dispose: () => removeEventListener('resize', fit) };
}

function overlay(area, html) {
  let o = $('.overlay', area);
  if (!o) { o = document.createElement('div'); o.className = 'overlay'; area.appendChild(o); }
  o.innerHTML = `<div class="box">${html}</div>`;
  o.hidden = false;
  return o;
}
function hideOverlay(area) { const o = $('.overlay', area); if (o) o.hidden = true; }

function recordGame(key, value) {
  const isNew = value > (state.games[key] || 0);
  if (isNew) state.games[key] = value;
  save();
  return isNew;
}

function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

// Trivia questions come from the app's pack (APP.trivia), answers shuffled.
function triviaQuestions(n) { return shuffle(APP.trivia).slice(0, n).map(q => { const order = shuffle([0, 1, 2, 3]); return { q: q.q, o: order.map(i => q.o[i]), a: order.indexOf(q.a), f: q.f }; }); }

function questionBox(q, idx, total, onAnswer, timeLimit) {
  return { html: `<div class="fq"><div class="qtitle" style="color:#9DAED2">Frage ${idx + 1}/${total}</div>${timeLimit ? '<div class="timer"><i id="fqT"></i></div>' : ''}<div class="question">${q.q}</div>
    <div class="options">${q.o.map((o, i) => `<button class="opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${o}</span></button>`).join('')}</div><div class="fact" id="fqFact"></div><div id="fqNext" style="margin-top:12px"></div></div>`,
    bind(root) {
      let done = false, raf = 0; const t0 = performance.now();
      const choose = i => {
        if (done) return; done = true; cancelAnimationFrame(raf); removeEventListener('keydown', key);
        const ok = i === q.a, bs = $$('.opt', root);
        bs.forEach(b => b.disabled = true);
        if (i >= 0) bs[i].classList.add(ok ? 'right' : 'wrong');
        bs[q.a].classList.add('right');
        ok ? Sound.right() : Sound.wrong();
        $('#fqFact', root).innerHTML = `${i < 0 ? '<b>Zeit abgelaufen!</b> ' : ''}${q.f}`;
        onAnswer(ok, (performance.now() - t0) / 1000);
      };
      const key = e => { const n = +e.key; if (n >= 1 && n <= 4) choose(n - 1); };
      addEventListener('keydown', key);
      $$('.opt', root).forEach(b => b.onclick = () => choose(+b.dataset.i));
      if (timeLimit) {
        const bar = $('#fqT', root);
        const tick = () => { const p = (performance.now() - t0) / 1000 / timeLimit; bar.style.transform = `scaleX(${1 - clamp(p, 0, 1)})`; if (p >= 1) return choose(-1); raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick);
      }
      return () => { cancelAnimationFrame(raf); removeEventListener('keydown', key); };
    } };
}
