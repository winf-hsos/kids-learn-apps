// Cloud: the children signed in on this device and the connection to the server (server/kla).
//
// Loaded on the start page and before the engine in every app. A device can know several
// children (profiles: id, name, school, device token); one of them is active. Every app keeps
// its state per child in localStorage (kla:p<child>:<app>) and syncs it with the server; the
// server merges states from several devices and may send a parent's reset or tickets back.
// Events for the parents' day view (active time, levels, mock tests, games) wait in a queue
// until the server has them, so learning without network loses nothing.

const Cloud = (() => {
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };
  // The site root (/lernen/), seen from the start page, an app (apps/<id>/) or the dashboard (eltern/).
  const ROOT = location.pathname.replace(/(apps\/[^/]+\/|eltern\/).*$/, '').replace(/[^/]*$/, '');
  const inApp = () => typeof MANIFEST !== 'undefined' && !!MANIFEST.id;

  // ----- profiles ---------------------------------------------------------------
  const profiles = () => ls.get('kla:profiles', []);
  const profile = () => { const id = ls.get('kla:active', null); return profiles().find(p => p.id === id) || null; };
  function saveProfile(p) { ls.set('kla:profiles', [...profiles().filter(x => x.id !== p.id), p].sort((a, b) => a.id - b.id)); }
  function setActive(id) { if (id === null) ls.del('kla:active'); else ls.set('kla:active', id); }
  function removeProfile(id) {
    ls.set('kla:profiles', profiles().filter(p => p.id !== id));
    if (ls.get('kla:active', null) === id) ls.del('kla:active');
  }

  // ----- server calls -------------------------------------------------------------
  async function api(path, opts = {}, token = (profile() || {}).token) {
    let r;
    try {
      r = await fetch(ROOT + 'api/' + path, {
        method: opts.method || 'GET', keepalive: !!opts.keepalive,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    } catch (e) { throw Object.assign(new Error('Keine Verbindung zum Server.'), { status: 0 }); }
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(data.detail || 'Da ist etwas schiefgegangen.'), { status: r.status });
    return data;
  }
  // With child, the code must belong to that child (picked by name on the start page).
  async function login(code, child = null) {
    const label = /iPad|iPhone|Android|Windows|Mac/.exec(navigator.userAgent)?.[0] || 'Gerät';
    const r = await api('login', { method: 'POST', body: { code, label, ...(child ? { child } : {}) } }, null);
    const p = { ...r.child, token: r.token };
    saveProfile(p); setActive(p.id);
    return p;
  }
  // All children of the family, asked with the token of a child signed in here; the last answer
  // is kept so the picker also works offline.
  const familyCached = () => ls.get('kla:family', []);
  async function family() {
    const p = profiles()[0]; if (!p) return [];
    try { const r = await api('family', {}, p.token); ls.set('kla:family', r.children); return r.children; }
    catch (e) { return familyCached(); }
  }
  // A revoked device: forget the child here and go back to the start page.
  function signedOut() {
    const p = profile(); if (p) removeProfile(p.id);
    if (inApp()) location.replace(ROOT);
  }

  // ----- what the server told us (play time, limits, the app's settings) ------------
  const info = { playtime: null, limits: null, settings: null };
  function takeInfo(r) {
    if (r.playtime) info.playtime = r.playtime;
    if (r.limits) info.limits = { ...r.limits, at: Date.now() };
    if (r.settings) info.settings = r.settings;
    if (r.earned > 0 && typeof toast === 'function') {
      const p = info.playtime || {};
      toast(`+${r.earned} Min Zockzeit`, p.leftToday === 0 ? 'Für heute hast du alle Zockzeit-Minuten geholt.' : `Auf deinem Konto: ${p.balance} Min`, CLOCK);
      if (typeof Sound !== 'undefined') Sound.coin();
    }
    if (inApp() && typeof renderStatus === 'function') renderStatus();
  }
  const CLOCK = '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 9v4l3 2M9 2h6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  function chipHtml() {
    const p = info.playtime;
    if (!p || (!p.balance && !(info.settings && info.settings.earnsPlaytime))) return '';
    return `<span class="chip" title="Zockzeit auf deinem Konto">${CLOCK}${p.balance} Min</span>`;
  }

  // ----- the app's state ------------------------------------------------------------
  const metaKey = () => `kla:p${profile().id}:${MANIFEST.id}:meta`;
  const meta = () => ls.get(metaKey(), { epoch: 0, rev: 0, dirty: false, applied: [] });
  const setMeta = m => ls.set(metaKey(), m);
  const storeKey = base => profile() ? `kla:p${profile().id}:${MANIFEST.id}` : base;
  const summaryKey = id => profile() ? `kla:p${profile().id}:summary:${id}` : `kla:summary:${id}`;
  let quiet = false, version = 0, timer = 0, busy = false, again = false;

  // The engine calls this after every local save.
  function saved() {
    if (quiet || !inApp() || !profile()) return;
    version++;
    const m = meta(); if (!m.dirty) { m.dirty = true; setMeta(m); }
    clearTimeout(timer); timer = setTimeout(push, 1500);
  }
  // Replace the engine state with the server's (after a merge, a reset or on another device).
  function adopt(next) {
    const keep = { seenIntro: state.seenIntro, sound: state.sound };
    for (const k of Object.keys(state)) delete state[k];
    Object.assign(state, defaultState(), next || keep);
    state.games = Object.assign(defaultState().games, state.games);
    quiet = true; try { save(); } finally { quiet = false; }
    if (!$('#stage') && !inGame()) render(); else renderStatus();
  }
  function applySettings() {
    const s = info.settings || {};
    DAILY_GOAL = s.dailyGoal || APP.dailyGoal || 150;
    if (s.locked) showLock();
    else if ($('#cloudLock')) $('#cloudLock').remove();
  }
  function applyOps(ops, m) {
    for (const op of ops || []) {
      if (m.applied.includes(op.id)) continue;
      if (op.kind === 'tickets') {
        state.tickets += op.data.n;
        toast(`+${op.data.n} Spiel-Ticket${op.data.n === 1 ? '' : 's'}`, 'Ein Geschenk von Mama oder Papa.', ICON.ticket);
      }
      m.applied.push(op.id);
    }
  }
  function fromServer(r, mode) {
    const m = meta();
    takeInfo(r);
    if (mode === 'pull') {
      // First contact on this device: keep what was learned offline (the next push merges it).
      if (!m.epoch) { m.epoch = r.epoch; if (m.dirty) m.rev = 0; else { adopt(r.state); m.rev = r.rev; } }
      else if (r.epoch !== m.epoch) { adopt(r.state); m.epoch = r.epoch; m.rev = r.rev; m.dirty = false; m.applied = []; }
      else if (r.rev > m.rev && !m.dirty) { adopt(r.state); m.rev = r.rev; }
    }
    const before = m.applied.length;
    applyOps(r.ops, m);
    setMeta(m);
    if (m.applied.length > before) { save(); renderStatus(); }
    applySettings();
    if (meta().dirty) push();
  }
  async function pull() {
    try { fromServer(await api(`apps/${MANIFEST.id}/state`), 'pull'); }
    catch (e) { if (e.status === 401) signedOut(); }
  }
  async function push() {
    if (busy) { again = true; return; }
    const m = meta(); if (!m.dirty && !m.applied.length) return;
    if (!m.epoch) return pull();   // never synced: learn the epoch first
    busy = true; again = false;
    const sent = version;
    try {
      const r = await api(`apps/${MANIFEST.id}/state`, { method: 'PUT', body: { epoch: m.epoch, rev: m.rev, state, ackOps: m.applied } });
      const m2 = meta();
      if (r.status === 'reset') { adopt(r.state); m2.epoch = r.epoch; m2.applied = []; }
      else if (r.status === 'merged') adopt(r.state);
      m2.rev = r.rev;
      m2.applied = m2.applied.filter(id => !m.applied.includes(id) && (r.ops || []).some(o => o.id === id));
      if (version === sent) m2.dirty = false;
      setMeta(m2);
      fromServer(r, 'push');
    } catch (e) {
      if (e.status === 401) signedOut();
      else setTimeout(push, 30000);   // offline: try again later, the state stays marked as dirty
    } finally {
      busy = false;
      if (again) push();
    }
  }

  // ----- events for the day view ----------------------------------------------------
  const queueKey = () => `kla:p${profile().id}:queue`;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  function event(kind, data) {
    if (!profile() || !inApp()) return;
    const q = ls.get(queueKey(), []);
    q.push({ id: uid(), app: MANIFEST.id, ts: new Date().toISOString(), kind, data });
    ls.set(queueKey(), q.slice(-3000));
    clearTimeout(event.t); event.t = setTimeout(flush, kind === 'active' ? 5000 : 1000);
  }
  let flushing = false;
  async function flush(keepalive = false) {
    if (flushing || !profile()) return;
    const q = ls.get(queueKey(), []); if (!q.length) return;
    const batch = q.slice(0, 200), ids = new Set(batch.map(e => e.id));
    flushing = true;
    try {
      const r = await api('events', { method: 'POST', body: { events: batch }, keepalive });
      ls.set(queueKey(), ls.get(queueKey(), []).filter(e => !ids.has(e.id)));
      takeInfo(r);
      if (q.length > batch.length) setTimeout(flush, 500);
    } catch (e) { if (e.status === 401) signedOut(); }
    finally { flushing = false; }
  }
  // Short texts of the wrongly answered questions, for the parents.
  const plain = s => String(s || '').replace(/<svg[\s\S]*?<\/svg>/g, ' [Bild] ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
  function wrongOf(answers) {
    return (answers || []).filter(a => !a.ok && !a.write).slice(0, 12).map(a => {
      const it = a.it || {};
      const q = plain(it.kind === 'swipe' ? it.t : it.q || it.lead || it.prompt);
      return a.given ? `${q} (Antwort: ${plain(a.given)})` : q;
    });
  }

  // ----- active time, the game limit and the lock -------------------------------------
  let lastInput = Date.now(), lastTick = Date.now();
  const bucket = { learn: 0, game: 0 };
  const inGame = () => !!document.getElementById('gameStage');
  function tick() {
    const now = Date.now(), dt = Math.min(15, (now - lastTick) / 1000); lastTick = now;
    if (document.hidden || now - lastInput > 60000) return;
    const mode = inGame() ? 'game' : 'learn';
    bucket[mode] += dt;
    const L = info.limits;
    if (mode === 'game' && L && L.gameSecLeft != null) {
      L.gameSecLeft -= dt;
      if (L.gameSecLeft <= 0) { closeGame(); render(); modal(`${CLOCK.replace('<svg', '<svg style="width:64px;margin:0 auto;display:block"')}<h2>Spielzeit für heute ist um</h2><p>Mama und Papa haben die Spielzeit in den Lernapps begrenzt. Morgen geht es weiter, lernen kannst du natürlich trotzdem.</p>`); }
    }
  }
  function dumpActive() {
    for (const mode of ['learn', 'game']) {
      if (bucket[mode] >= 5) event('active', { sec: Math.round(bucket[mode]), mode });
      bucket[mode] = 0;
    }
  }
  function mayPlay() {
    const L = info.limits;
    if (!L || L.gameSecLeft == null || L.gameSecLeft > 0) return true;
    modal(`<h2>Spielzeit für heute ist um</h2><p>Mama und Papa haben die Spielzeit in den Lernapps begrenzt. Morgen kannst du wieder spielen.</p>`);
    return false;
  }
  let gameStart = 0, gameId = '';
  function gameStarted(id) { gameStart = Date.now(); gameId = id; }
  function gameEnded() {
    if (!gameStart) return;
    const sec = Math.round((Date.now() - gameStart) / 1000); gameStart = 0;
    if (sec >= 3) event('game', { id: gameId, name: (GAMES.find(g => g.id === gameId) || {}).name || gameId, sec });
  }
  function showLock() {
    if ($('#cloudLock')) return;
    const d = document.createElement('div');
    d.id = 'cloudLock'; d.className = 'cloud-lock';
    d.innerHTML = `<div class="cloud-lock-box">${ICON.lock}<h2>Diese App ist gerade gesperrt</h2><p>Mama oder Papa haben sie im Eltern-Dashboard gesperrt.</p><a class="btn primary" href="${ROOT}">Zu meinen Apps</a></div>`;
    document.body.appendChild(d);
  }

  // Called by the engine before it loads the state: without a signed-in child, go sign in.
  function requireProfile() {
    if (profile()) return true;
    location.replace(ROOT);
    return false;
  }
  function start() {
    if (!inApp() || !profile()) return;
    ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(t => addEventListener(t, () => { lastInput = Date.now(); }, { passive: true, capture: true }));
    setInterval(tick, 5000);
    setInterval(() => { dumpActive(); flush(); }, 60000);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { dumpActive(); flush(true); if (meta().dirty) push(); }
      else { lastTick = Date.now(); pull(); }
    });
    pull();
    flush();
  }

  return {
    ROOT, profiles, profile, setActive, removeProfile, saveProfile, login, family, familyCached, api, requireProfile, start,
    storeKey, summaryKey, saved, event, wrongOf, mayPlay, gameStarted, gameEnded, chipHtml, info, CLOCK,
  };
})();
