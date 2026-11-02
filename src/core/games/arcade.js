// Reward mini-games: registry, shared game stage and helpers. Each game gets a
// full-screen stage and returns a cleanup function. Apps pick games and star
// thresholds in APP.games and may override name and desc there.

const GAME_DEFS = {
  runner: {
    name: 'Lab Runner', desc: 'Jump & Run durchs Labor. Springe über Flammen, sammle Schutzbrillen.',
    record: v => `Rekord: ${v} Punkte`, badge: { id: 'runner500', name: 'Laufwunder', desc: '500 Punkte im Lab Runner' },
    play: (area, hud) => runnerGame(area, hud, LAB_RUNNER),
  },
  legion: {
    name: 'Legionärslauf', desc: 'Jump & Run über die Via Appia nach Rom. Spring über Amphoren und Säulen, weich Streitwagen aus und sammle Goldmünzen.',
    record: v => `Rekord: ${v} Punkte`, badge: { id: 'legion500', name: 'Eilbote des Kaisers', desc: '500 Punkte im Legionärslauf' },
    play: (area, hud) => runnerGame(area, hud, LEGION_RUN),
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
  keeper: {
    name: 'Torwart-Reflex', desc: 'Du stehst im Tor. Flieg in die richtige Ecke, bevor der Ball drin ist. Jeder Schuss wird schneller.',
    record: v => `Rekord: ${v} Paraden`, badge: { id: 'keeper15', name: 'Torwart-Titan', desc: '15 Paraden beim Torwart-Reflex' },
    play: (area, hud) => keeperGame(area, hud),
  },
  slalom: {
    name: 'Dribbel-Slalom', desc: 'Dribble übers Feld, weich Hütchen und Gegnern aus und sammle Pokale.',
    record: v => `Rekord: ${v} Punkte`, badge: { id: 'slalom1000', name: 'Dribbelkönig', desc: '1000 Punkte im Dribbel-Slalom' },
    play: (area, hud) => slalomGame(area, hud),
  },
  blitz: {
    name: 'Fußball-Blitz', desc: '60 Sekunden: Stimmt die Antwort oder nicht? Wisch schnell, jeder Fehler kostet Zeit.',
    record: v => `Rekord: ${v} richtig`, badge: { id: 'blitz20', name: 'Blitzmerker', desc: '20 richtige Antworten im Fußball-Blitz' },
    play: (area, hud) => blitzGame(area, hud),
  },
  // Free to play, because every shot is a question from the app's own levels.
  scorer: {
    name: 'Wissens-Torjäger', desc: 'Schieß in das Tor mit der richtigen Antwort. 10 Schüsse, ganz ohne Ticket.', free: true,
    record: v => `Rekord: ${v}/10 Tore`, badge: { id: 'scorer10', name: 'Torschützenkönig', desc: '10 von 10 Toren beim Torjäger' },
    play: (area, hud) => scorerGame(area, hud),
  },
};

function gameThumb(id) {
  const thumbs = {
    runner: svg(`<rect width="200" height="100" fill="#1B2A55"/><rect y="78" width="200" height="22" fill="#2E3F73"/><circle cx="170" cy="20" r="8" fill="#FFD27A"/>
      <path d="M120 78 C128 64 130 56 126 46 C134 54 138 64 132 78 Z" fill="#FF8A1F"/><circle cx="60" cy="44" r="8" fill="#FFD6B0"/><rect x="53" y="40" width="14" height="5" rx="2" fill="#7FD3FF"/><rect x="54" y="52" width="12" height="16" rx="3" fill="#fff"/><path d="M56 68 l-4 10 M64 68 l5 9" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`, '0 0 200 100'),
    legion: svg(`<defs><linearGradient id="lgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24184F"/><stop offset=".5" stop-color="#B4507A"/><stop offset="1" stop-color="#FFC27A"/></linearGradient></defs>
      <rect width="200" height="100" fill="url(#lgSky)"/><circle cx="150" cy="52" r="22" fill="#FFE0A0" opacity=".35"/><circle cx="150" cy="52" r="13" fill="#FFF1C4"/>
      <path d="M0 70 Q30 60 70 66 T140 62 T200 64 V78 H0Z" fill="#7A3D5F"/>
      <path fill="#A0525A" fill-rule="evenodd" d="M14 38 H190 V78 H14 Z ${Array.from({ length: 7 }, (_, i) => `M${22 + i * 24} 78 V62 a8 8 0 0 1 16 0 V78 Z`).join(' ')} ${Array.from({ length: 15 }, (_, i) => `M${18 + i * 11.4} 55 V48 a3.5 3.5 0 0 1 7 0 V55 Z`).join(' ')}"/><rect x="14" y="38" width="176" height="2" fill="#EBA677"/>
      <path d="M178 78 Q175 60 183 50" stroke="#3A2440" stroke-width="4" fill="none"/><ellipse cx="184" cy="48" rx="22" ry="6" fill="#3A2440"/><ellipse cx="190" cy="43" rx="12" ry="4" fill="#3A2440"/>
      <rect y="78" width="200" height="22" fill="#3E2A30"/><rect y="78" width="200" height="2.5" fill="#D9A273"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 24 + 2}" y="82" width="21" height="7" rx="3" fill="${['#7A5A50', '#6C4E48', '#86645A'][i % 3]}"/><rect x="${i * 26 - 8}" y="91" width="23" height="8" rx="3" fill="${['#735349', '#86645A', '#5F4442'][i % 3]}"/>`).join('')}
      <path d="M124 78 C112 70 116 58 121 56 V52 H127 V56 C132 58 136 70 124 78 Z" fill="#C96A3E"/><path d="M121 53 Q114 53 117 60 M127 53 Q134 53 131 60" stroke="#8E3B22" stroke-width="1.6" fill="none"/>
      <circle cx="96" cy="40" r="6" fill="#F2B92E" stroke="#A8700E" stroke-width="1.2"/>
      <g transform="translate(44 26)"><path d="M3 52 L9 6" stroke="#7A4A26" stroke-width="2.2" stroke-linecap="round"/><path d="M9 6 L11 -8" stroke="#C9D1DA" stroke-width="1.5"/>
      <path d="M15 38 l-6 7 l-3 7 M17 38 l7 6 l2 8" stroke="#D99A6C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M9 31 H24 L26.5 42 H6.5 Z" fill="#B3261E"/><rect x="8" y="16.5" width="17" height="16" rx="4" fill="#C9D1DA"/><path d="M8.5 21 H24.5 M8.5 25 H24.5 M8.5 29 H24.5" stroke="#56606C"/>
      <circle cx="19.5" cy="10" r="7.4" fill="#E5A87A"/><path d="M9.8 9.4 A8.8 8.8 0 0 1 27.4 9.4 Z M10.6 9 L6.6 14.6 L11.6 14 Z" fill="#E0AE45"/><circle cx="23.6" cy="9.4" r="1.1" fill="#2A1A14"/>
      <path d="M9.6 1.6 Q17 -12 28.4 -0.4 Q19 -4.6 9.6 1.6 Z" fill="#E0352B"/>
      <rect x="21" y="15" width="12" height="32" rx="4" fill="#C0302A" stroke="#F0C24B" stroke-width="1.6"/><circle cx="27" cy="31" r="3.2" fill="#F5D46A"/></g>`, '0 0 200 100'),
    penalty: svg(`<rect width="200" height="100" fill="#0F6B3E"/><path d="M40 20 H160 V70 H40 Z" fill="none" stroke="#fff" stroke-width="4"/><path d="M40 20 L52 30 H148 L160 20 M52 30 V70 M148 30 V70" stroke="#fff" stroke-width="1" opacity=".5"/>
      <circle cx="100" cy="86" r="8" fill="#fff" stroke="#111"/><rect x="92" y="38" width="16" height="26" rx="5" fill="#FFC21A"/><circle cx="100" cy="33" r="6" fill="#FFD6B0"/>`, '0 0 200 100'),
    kickups: svg(`<rect width="200" height="100" fill="#123B6B"/><circle cx="100" cy="36" r="14" fill="#fff" stroke="#111" stroke-width="2"/><path d="M100 26 l6 5 -2 7 h-8 l-2 -7z" fill="#111"/><path d="M80 92 Q100 70 120 92" fill="#FFD6B0"/><text x="160" y="30" fill="#FFC21A" font-size="22" font-weight="700" font-family="sans-serif">27</text>`, '0 0 200 100'),
    proquiz: svg(`<rect width="200" height="100" fill="#2A1B55"/><path d="M84 22 h32 v18 a16 16 0 0 1 -32 0 z M84 28 h-8 a8 8 0 0 0 8 12 M116 28 h8 a8 8 0 0 1 -8 12 M100 56 v12 M88 74 h24" fill="none" stroke="#FFC21A" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><text x="140" y="40" fill="#fff" font-size="24" font-weight="700" font-family="sans-serif">?</text><text x="44" y="70" fill="#fff" font-size="18" font-weight="700" font-family="sans-serif">?</text>`, '0 0 200 100'),
    keeper: svg(`<rect width="200" height="100" fill="#0F6B3E"/><rect width="200" height="16" fill="#0A1A2E"/><path d="M30 22 H170 V80 H30 Z" fill="none" stroke="#fff" stroke-width="4"/><path d="M30 22 L42 32 H158 L170 22 M42 32 V80 M158 32 V80" stroke="#fff" stroke-width="1" opacity=".5"/>
      <g transform="translate(120 66) rotate(62)"><rect x="-8" y="-34" width="16" height="24" rx="5" fill="#22C55E"/><path d="M-6 -30 L-18 -44 M6 -30 L18 -44" stroke="#22C55E" stroke-width="5" stroke-linecap="round"/><circle cx="-19" cy="-46" r="4.5" fill="#fff"/><circle cx="19" cy="-46" r="4.5" fill="#fff"/><circle cx="0" cy="-40" r="6" fill="#FFD6B0"/><path d="M-4 -10 L-6 2 M4 -10 L6 2" stroke="#111" stroke-width="5" stroke-linecap="round"/></g>
      <circle cx="152" cy="34" r="7" fill="#fff" stroke="#111"/><path d="M100 92 Q130 60 150 38" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 4" fill="none" opacity=".6"/>`, '0 0 200 100'),
    slalom: svg(`<rect width="200" height="100" fill="#11733F"/>${Array.from({ length: 5 }, (_, i) => `<rect x="${i * 40}" width="20" height="100" fill="#13804A"/>`).join('')}
      <path d="M40 92 C70 70 40 50 90 40 S120 14 160 8" stroke="#fff" stroke-width="2" stroke-dasharray="4 5" fill="none" opacity=".7"/>
      <circle cx="78" cy="62" r="7" fill="#FF7A1A"/><circle cx="78" cy="62" r="3.5" fill="#fff"/><circle cx="118" cy="40" r="7" fill="#FF7A1A"/><circle cx="118" cy="40" r="3.5" fill="#fff"/>
      <ellipse cx="60" cy="38" rx="12" ry="8" fill="#D7263D"/><circle cx="60" cy="38" r="5" fill="#2A1A14"/><ellipse cx="150" cy="58" rx="12" ry="8" fill="#7C3AED"/><circle cx="150" cy="58" r="5" fill="#2A1A14"/>
      <path d="M160 18 h12 q0 8 -6 9 q-6 -1 -6 -9z M164 27 h4 v4 h-4z M161 31 h10 v2 h-10z" fill="#F2B92E"/>
      <ellipse cx="40" cy="84" rx="13" ry="8" fill="#FFC21A"/><circle cx="40" cy="84" r="5" fill="#5A3A22"/><circle cx="42" cy="70" r="4.5" fill="#fff" stroke="#111"/>`, '0 0 200 100'),
    blitz: svg(`<rect width="200" height="100" fill="#123B6B"/><path d="M112 6 L82 54 H100 L88 94 L124 40 H104 Z" fill="#FFC21A"/>
      <g transform="rotate(-10 52 50)"><rect x="24" y="26" width="56" height="48" rx="8" fill="#fff"/><path d="M36 52 l8 8 l16 -18" stroke="#22C55E" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g transform="rotate(10 150 50)"><rect x="122" y="26" width="56" height="48" rx="8" fill="#fff"/><path d="M138 38 l24 24 M162 38 l-24 24" stroke="#D7263D" stroke-width="6" stroke-linecap="round"/></g>`, '0 0 200 100'),
    scorer: svg(`<rect width="200" height="100" fill="#0F6B3E"/>${[14, 76, 138].map((x, i) => `<rect x="${x}" y="18" width="48" height="30" fill="${i === 1 ? 'rgba(255,194,26,.3)' : 'none'}" stroke="#fff" stroke-width="3"/><rect x="${x + 6}" y="6" width="36" height="9" rx="3" fill="${i === 1 ? '#FFC21A' : '#fff'}" opacity=".9"/>`).join('')}
      <circle cx="100" cy="34" r="6" fill="#fff" stroke="#111"/><path d="M100 88 Q98 62 100 42" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 4" fill="none" opacity=".6"/><circle cx="100" cy="88" r="7" fill="#fff" stroke="#111"/>`, '0 0 200 100'),
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
// Unseen questions come first. The seen list is shared by all apps on this site,
// so a question from one app does not come back in another, and it starts over
// once the whole pool has been shown.
const TRIVIA_SEEN_KEY = 'kla:trivia-seen';
const triviaId = q => { let h = 5381; for (const ch of q.q) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0; return h.toString(36); };
function triviaQuestions(n) {
  let seen;
  try { seen = new Set(JSON.parse(localStorage.getItem(TRIVIA_SEEN_KEY)) || []); } catch (e) { seen = new Set(); }
  const fresh = shuffle(APP.trivia.filter(q => !seen.has(triviaId(q))));
  let picked = fresh.slice(0, n);
  if (picked.length < n) {
    APP.trivia.forEach(q => seen.delete(triviaId(q)));
    picked = picked.concat(shuffle(APP.trivia.filter(q => !picked.includes(q))).slice(0, n - picked.length));
  }
  picked.forEach(q => seen.add(triviaId(q)));
  try { localStorage.setItem(TRIVIA_SEEN_KEY, JSON.stringify([...seen])); } catch (e) { /* storage unavailable */ }
  return picked.map(q => { const order = shuffle([0, 1, 2, 3]); return { q: q.q, o: order.map(i => q.o[i]), a: order.indexOf(q.a), f: q.f }; });
}

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
