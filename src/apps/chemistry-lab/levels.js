// Chemistry-only level types and artwork helpers: GHS quiz, burner labeling,
// burner simulator, the three flame types and the hero flame.

function heroFlameSvg() {
  return svg(`<defs><linearGradient id="hf1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2E6BFF"/><stop offset=".7" stop-color="#7FB2FF"/><stop offset="1" stop-color="#C9E4FF" stop-opacity=".2"/></linearGradient></defs>
    <g class="flicker"><path d="M50 18 C64 40 68 58 62 78 C59 88 41 88 38 78 C32 58 36 40 50 18 Z" fill="url(#hf1)"/>
    <path d="M50 52 C55 62 56 70 54 78 C52 82 48 82 46 78 C44 70 45 62 50 52 Z" fill="#A8ECFF"/></g>
    <rect x="44" y="86" width="12" height="40" fill="#9AA6BB"/><path d="M40 126 L44 118 H56 L60 126 Z" fill="#9AA6BB"/><rect x="28" y="126" width="44" height="8" rx="3" fill="#5E6A82"/>`, '0 0 100 140');
}

function flameShape(type) {
  if (type === 0) return `<path class="flicker" d="M50 20 C66 50 70 80 60 110 C56 122 44 122 40 110 C30 80 34 50 50 20 Z" fill="url(#fy)"/>`;
  if (type === 1) return `<path class="flicker" d="M50 34 C60 60 62 88 58 112 C55 121 45 121 42 112 C38 88 40 60 50 34 Z" fill="#3B6BFF" opacity=".75"/><path d="M50 84 C54 94 55 104 53 112 C52 116 48 116 47 112 C45 104 46 94 50 84 Z" fill="#7FB2FF" opacity=".7"/>`;
  return `<path class="flicker" d="M50 52 C58 72 60 94 57 112 C55 120 45 120 43 112 C40 94 42 72 50 52 Z" fill="#5C8DFF" opacity=".8"/><path d="M50 82 C55 92 56 102 54 112 C53 116 47 116 46 112 C44 102 45 92 50 82 Z" fill="#A8ECFF"/>`;
}
function flames3Html() {
  const lbl = ['leuchtend<br>bis ca. 900 °C', 'nicht leuchtend<br>bis ca. 1100 °C', 'rauschend<br>bis ca. 1500 °C'];
  return `<div class="flames3">${[0, 1, 2].map(i => `<div>${svg(`<defs><linearGradient id="fy" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3B6BFF"/><stop offset=".15" stop-color="#FF8A1F"/><stop offset=".6" stop-color="#FFD24A"/><stop offset="1" stop-color="#FFF3B0" stop-opacity=".4"/></linearGradient></defs>${flameShape(i)}<rect x="43" y="116" width="14" height="24" fill="#9AA6BB"/>`, '0 0 100 140')}<div>${lbl[i]}</div></div>`).join('')}</div>`;
}

function ghsGridHtml() {
  return `<div class="ghs-grid">${Object.keys(GHS).map(k => `<div class="ghs-item">${ghsSvg(k)}<b>${k} ${GHS[k].name}</b>${GHS[k].cls}</div>`).join('')}</div>`;
}

// Extra learn-card blocks: burner drawing, flame types and the GHS grid.
function chemLearnExtras(c, mode) {
  const burner = c.burner ? `<div style="max-width:${mode === 'card' ? 260 : 220}px;${mode === 'card' ? 'margin:14px auto 0;' : ''}color:var(--ink)">${burnerSvg({ flame: true })}</div>` : '';
  const flames = c.flames ? flames3Html() : '';
  const ghs = c.ghs ? ghsGridHtml() : '';
  return mode === 'card' ? { top: burner + flames, bottom: ghs } : { top: flames, bottom: ghs + burner };
}

// ---------------------------------------------------------------------------
// GHS pictogram quiz: name or hazard class of a random pictogram
// ---------------------------------------------------------------------------
function ghsItem(code, ref) {
  const others = shuffle(Object.keys(GHS).filter(k => k !== code)).slice(0, 3);
  const asName = Math.random() < .5;
  const o = asName ? [GHS[code].name, ...others.map(k => GHS[k].name)] : [GHS[code].cls, ...others.map(k => GHS[k].cls)];
  return mcFrom({ q: asName ? 'Wie heißt dieses Gefahrenpiktogramm?' : 'Wovor warnt dieses Piktogramm?', o, a: 0, x: `${code} „${GHS[code].name}“: ${GHS[code].cls}.` }, ref, { fig: ghsSvg(code), figClass: 'ghs' });
}
const GHS_QUIZ = { keys: () => Object.keys(GHS), item: (lv, code, ref) => GHS[code] ? ghsItem(code, ref) : null };

// ---------------------------------------------------------------------------
// Label the burner
// ---------------------------------------------------------------------------
function labelLevel() {
  const parts = BURNER_PARTS.map((p, i) => ({ ...p, n: i + 1 }));
  const chips = shuffle(parts);
  let selChip = null, selHot = null, done = 0;
  run.total = parts.length;
  openStage(`${stageTop(0)}
    <div class="qtitle">${run.lv.title}</div><div class="question" style="font-size:19px">Tippe einen Namen an und dann die passende Nummer am Brenner.</div>
    <div class="label-wrap"><div class="label-svg">${burnerSvg({ numbered: true, flame: true })}</div>
    <div class="label-chips">${chips.map(c => `<button class="label-chip" data-id="${c.id}">${c.name}</button>`).join('')}</div></div>`);
  bindQuit();
  const tryMatch = () => {
    if (!selChip || !selHot) return;
    const ok = selChip.dataset.id === selHot.dataset.part;
    if (ok) {
      const p = parts.find(x => x.id === selChip.dataset.id);
      selChip.classList.add('ok'); selChip.innerHTML = `<span class="num">${p.n}</span>${p.name}`; selChip.disabled = true;
      selHot.classList.add('ok'); selHot.classList.remove('target');
      done++; scoreAnswer(true);
      $('.progress i').style.width = `${done / parts.length * 100}%`;
      if (done === parts.length) setTimeout(() => finish(parts.length / (parts.length + run.errors)), 500);
    } else {
      run.errors++; scoreAnswer(false);
      selChip.classList.add('no'); const c = selChip; setTimeout(() => c.classList.remove('no'), 450);
      selHot.classList.remove('target');
      toast('Passt nicht', `„${selChip.textContent}“ ist eine andere Nummer.`, ICON.close);
    }
    selChip.classList.remove('sel'); selChip = null; selHot = null;
  };
  $$('.label-chip').forEach(b => b.onclick = () => {
    if (b.classList.contains('ok')) return;
    $$('.label-chip').forEach(x => x.classList.remove('sel'));
    selChip = b; b.classList.add('sel'); Sound.click(); tryMatch();
  });
  $$('.label-svg .hot').forEach(h => {
    const act = () => {
      if (h.classList.contains('ok')) return;
      $$('.label-svg .hot').forEach(x => x.classList.remove('target'));
      selHot = h; h.classList.add('target'); Sound.click(); tryMatch();
    };
    h.addEventListener('click', act);
    h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
  });
}

// ---------------------------------------------------------------------------
// Burner simulator
// ---------------------------------------------------------------------------
function simLevel() {
  const TASKS = [
    { id: 'light', t: 'Anzünden: Gashahn am Tisch auf, Gas am Brenner auf, Luftzufuhr zu, dann anzünden.' },
    { id: 'lum', t: 'Stelle die leuchtende Flamme ein (gelb, rußt) und halte sie.' },
    { id: 'work', t: 'Stelle die nicht leuchtende Flamme ein (Arbeitsflamme) und halte sie.' },
    { id: 'roar', t: 'Stelle die rauschende Flamme ein (sehr heiß) und halte sie.' },
    { id: 'flash', t: 'Test: Drehe bei rauschender Flamme das Gas am Brenner fast ganz zu. Was passiert?' },
    { id: 'off', t: 'Zünde neu an, stelle eine blaue Flamme ein und mache den Brenner dann richtig aus: Luftzufuhr zu, Gas am Brenner zu, zuletzt Gashahn am Tisch zu.' },
  ];
  const s = { valve: false, gas: 0, air: .5, lit: false, flash: false, task: 0, hold: 0, unlitT: 0, warned: false, last: performance.now(), offStep: -1, done: false };
  run.total = TASKS.length;
  openStage(`${stageTop(0)}
    <div class="qtitle">${run.lv.title}</div><div class="question" style="font-size:19px">Bediene den Brenner wie im Chemieraum. Löse die Aufgaben der Reihe nach.</div>
    <div class="sim">
      <div class="sim-view" id="simview">
        <div class="sim-readout"><span id="ftype">aus</span><span class="temp" id="ftemp">–</span></div>
        <svg viewBox="0 0 200 300" id="simsvg">
          <defs>
            <linearGradient id="gy" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3B6BFF"/><stop offset=".12" stop-color="#FF8A1F"/><stop offset=".55" stop-color="#FFD24A"/><stop offset="1" stop-color="#FFF3B0" stop-opacity=".3"/></linearGradient>
            <linearGradient id="gb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2E5BFF"/><stop offset="1" stop-color="#8DB6FF" stop-opacity=".25"/></linearGradient>
            <linearGradient id="tube" x1="0" x2="1"><stop offset="0" stop-color="#5E6A82"/><stop offset=".5" stop-color="#C5CEDD"/><stop offset="1" stop-color="#5E6A82"/></linearGradient>
          </defs>
          <g id="soot"></g>
          <path id="fy" fill="url(#gy)"/><path id="fb" fill="url(#gb)"/><path id="fi" fill="#A8ECFF"/>
          <rect id="tubeR" x="88" y="190" width="24" height="64" fill="url(#tube)"/>
          <path d="M84 254 L88 240 H112 L116 254 Z" fill="#8A95AA"/>
          <rect x="84" y="250" width="32" height="8" fill="#6B778E" id="airring"/>
          <circle id="fl" cx="100" cy="258" r="0" fill="#FF8A1F"/>
          <rect x="90" y="258" width="20" height="18" fill="#7D889E"/>
          <path d="M70 276 H130 L140 290 H60 Z" fill="#5E6A82"/>
          <rect x="116" y="262" width="40" height="7" fill="#7D889E"/><path d="M156 265 Q180 265 188 290" stroke="#C2563A" stroke-width="7" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
      <div>
        <div class="ctrl" style="display:grid;gap:12px">
          <button class="btn small" id="valve">Gashahn am Tisch: <b id="vs">zu</b></button>
          <div><label for="gas">Gas am Brenner (Gasregulierschraube) <span id="gv">0 %</span></label><input type="range" id="gas" min="0" max="100" value="0"></div>
          <div><label for="air">Luftzufuhr (Luftregulierung) <span id="av">50 %</span></label><input type="range" id="air" min="0" max="100" value="50"></div>
          <button class="btn warn small" id="ignite">Gasanzünder: anzünden</button>
        </div>
        <div class="tasks" id="tasks"></div>
      </div>
    </div>`);
  bindQuit();
  const el = id => document.getElementById(id);
  const renderTasks = () => {
    el('tasks').innerHTML = TASKS.map((t, i) => `<div class="task ${i < s.task ? 'done' : i === s.task ? 'active' : ''}"><span class="box">${i < s.task ? ICON.check.replace('<svg', '<svg style="width:16px;height:16px"') : ''}</span><div style="flex:1">${t.t}${i === s.task && ['lum', 'work', 'roar'].includes(t.id) ? '<div class="hold"><i id="holdbar"></i></div>' : ''}</div></div>`).join('');
    $('.progress i').style.width = `${s.task / TASKS.length * 100}%`;
  };
  const complete = () => {
    s.task++; s.hold = 0; scoreAnswer(true); renderTasks();
    if (s.task >= TASKS.length && !s.done) { s.done = true; setTimeout(() => finish(clamp(1 - run.errors * .15, 0, 1)), 700); }
  };
  const mistake = (title, text) => { run.errors++; scoreAnswer(false); toast(title, text, ICON.close); };
  const flowing = () => s.valve && s.gas > .02;
  const type = () => s.air < .25 ? 0 : s.air < .7 ? 1 : 2;

  el('valve').onclick = () => {
    Sound.click();
    const tk = TASKS[s.task];
    const closingForOff = s.valve && tk && tk.id === 'off' && s.offStep >= 0;
    s.valve = !s.valve;
    if (!s.valve) s.lit = false;
    el('vs').textContent = s.valve ? 'auf' : 'zu';
    if (closingForOff) {
      if (s.offStep < 2) mistake('Falsche Reihenfolge', 'Erst Luftzufuhr, dann Gas am Brenner, zuletzt der Gashahn am Tisch.');
      complete();
    }
  };
  el('gas').oninput = e => { s.gas = e.target.value / 100; el('gv').textContent = `${e.target.value} %`; };
  el('air').oninput = e => { s.air = e.target.value / 100; el('av').textContent = `${e.target.value} %`; };
  el('ignite').onclick = () => {
    if (s.lit) return;
    if (!flowing()) { toast('Kein Gas', 'Öffne zuerst den Gashahn am Tisch und die Gasregulierschraube.', ICON.close); Sound.wrong(); return; }
    if (s.air > .12) { mistake('Luftzufuhr zu!', 'Beim Anzünden muss die Luftzufuhr geschlossen sein.'); return; }
    s.lit = true; s.unlitT = 0; Sound.tone(300, .2, 'sawtooth', .05, 0, 900);
    if (s.task === 0) complete();
  };

  function flashChoice(correctViaValve) {
    if (correctViaValve) {
      Sound.right(); toast('Richtig reagiert!', 'Gaszufuhr am Tisch sofort geschlossen. Erst nach dem Abkühlen neu anzünden.', ICON.check);
      if (TASKS[s.task].id === 'flash') complete();
    }
  }
  const flashModal = async () => {
    await sleep(1100);
    const opts = shuffle([{ t: 'Sofort die Gaszufuhr am Tisch schließen', ok: true }, { t: 'In das Brennerrohr pusten', ok: false }, { t: 'Die Luftzufuhr weiter öffnen', ok: false }, { t: 'Das heiße Rohr anfassen und den Brenner wegtragen', ok: false }]);
    let solved = false;
    while (!solved) {
      const r = await modal(`<p class="hand" style="color:var(--bad)">Achtung!</p><h2>Die Flamme ist zurückgeschlagen!</h2><p>Sie brennt jetzt unten an der Gasdüse, das Brennerrohr wird glühend heiß. Was tust du?</p>`, opts.map(o => ({ label: o.t, cls: '' })));
      if (opts[r].ok) { solved = true; s.flash = false; s.valve = false; s.lit = false; el('vs').textContent = 'zu'; flashChoice(true); }
      else mistake('Gefährlich!', 'Das wäre falsch. Denk an die Gaszufuhr am Tisch.');
    }
  };

  let raf = 0, t = 0;
  const g = { fy: el('fy'), fb: el('fb'), fi: el('fi'), soot: el('soot'), ft: el('ftype'), fte: el('ftemp'), fl: el('fl'), tube: el('tubeR') };
  const fpath = (w, h, wob) => {
    const cx = 100, by = 190;
    return `M${cx - w / 2} ${by} C${cx - w / 2} ${by - h * .35} ${cx - w * .18 + wob} ${by - h * .72} ${cx + wob * 1.5} ${by - h} C${cx + w * .18 + wob} ${by - h * .72} ${cx + w / 2} ${by - h * .35} ${cx + w / 2} ${by} Z`;
  };
  const soot = [];
  const frame = now => {
    const dt = Math.min(.05, (now - s.last) / 1000); s.last = now; t += dt;
    // turning-off sequence (checked before the flame state is updated)
    const tkOff = TASKS[s.task];
    if (tkOff && tkOff.id === 'off') {
      if (s.offStep === -1 && s.lit && type() >= 1 && s.gas > .3) s.offStep = 0;
      if (s.offStep === 0 && s.lit && s.air <= .03) s.offStep = 1;
      if (s.offStep === 0 && s.lit && s.gas === 0) { mistake('Erst die Luft!', 'Beim Ausmachen zuerst die Luftzufuhr schließen.'); s.offStep = 2; }
      if (s.offStep === 1 && s.gas === 0) s.offStep = 2;
    }
    if (s.lit && !flowing()) s.lit = false;
    // unlit gas warning
    if (flowing() && !s.lit && !s.flash) { s.unlitT += dt; if (s.unlitT > 4 && !s.warned) { s.warned = true; mistake('Gas strömt aus!', 'Gas nie unbemerkt ausströmen lassen: sofort anzünden oder zudrehen.'); } }
    else s.unlitT = 0;
    // flashback trigger
    if (s.lit && !s.flash && s.air > .55 && s.gas < .12 && s.gas > 0) {
      s.flash = true; Sound.tone(120, .4, 'sawtooth', .1);
      flashModal();
    }
    const on = s.lit && !s.flash;
    const lum = on ? clamp(1 - s.air / .3, 0, 1) : 0;
    const inner = on ? clamp((s.air - .4) / .3, 0, 1) : 0;
    const gH = .35 + .65 * s.gas;
    const wobY = Math.sin(t * 9) * 4 + Math.sin(t * 23) * 2, wobB = Math.sin(t * 30) * (1 + 1.5 * inner);
    g.fy.setAttribute('d', fpath(36, 165 * gH, wobY)); g.fy.style.opacity = lum;
    const hb = (130 - 45 * s.air) * gH;
    g.fb.setAttribute('d', fpath(28 - 6 * inner, hb, wobB)); g.fb.style.opacity = on ? (1 - lum) * .9 : 0;
    g.fi.setAttribute('d', fpath(15, hb * .36, wobB * .4)); g.fi.style.opacity = inner * (1 - lum);
    g.fl.setAttribute('r', s.flash ? 7 + Math.sin(t * 20) * 2 : 0);
    g.tube.style.fill = s.flash ? '#E0423C' : 'url(#tube)';
    // soot particles
    if (on && lum > .6 && Math.random() < .5) soot.push({ x: 100 + (Math.random() - .5) * 10, y: 190 - 150 * gH, vy: -20 - Math.random() * 20, life: 1.6 });
    for (const p of soot) { p.y += p.vy * dt; p.x += Math.sin(t * 3 + p.y) * .3; p.life -= dt; }
    while (soot.length && soot[0].life <= 0) soot.shift();
    g.soot.innerHTML = soot.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.2" fill="#2B2B2B" opacity="${clamp(p.life, 0, .8).toFixed(2)}"/>`).join('');
    // readout
    const names = ['leuchtende Flamme', 'nicht leuchtende Flamme', 'rauschende Flamme'];
    g.ft.textContent = s.flash ? 'Rückschlag!' : on ? names[type()] : flowing() ? 'Gas strömt aus …' : 'aus';
    g.fte.textContent = on ? `${Math.round((850 + 650 * s.air) / 10) * 10} °C` : '–';
    Sound.setRoar(on ? clamp((s.air - .6) * .5, 0, .18) * (.4 + s.gas) : 0);
    // hold tasks
    const tk = TASKS[s.task];
    if (tk && on) {
      const want = { lum: 0, work: 1, roar: 2 }[tk.id];
      if (want !== undefined && type() === want && s.gas > .3) {
        s.hold += dt; const hb2 = el('holdbar'); if (hb2) hb2.style.width = `${clamp(s.hold / 1.5, 0, 1) * 100}%`;
        if (s.hold >= 1.5) complete();
      } else if (want !== undefined) { s.hold = 0; const hb2 = el('holdbar'); if (hb2) hb2.style.width = '0'; }
    }
    raf = requestAnimationFrame(frame);
  };
  renderTasks();
  raf = requestAnimationFrame(frame);
  run.cleanup = () => { cancelAnimationFrame(raf); Sound.stopRoar(); };
}
