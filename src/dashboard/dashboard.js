// Parents' dashboard (eltern/): progress, the day view, play time and all settings per child.
// Parents are recognised by the family page's login on the same domain (server/kla asks it with
// the browser's cookie); there is no separate password here. All names come from the server.

const state = { sound: false };   // fx.js reads this
const ROOT = location.pathname.replace(/eltern\/.*$/, '');
const CATALOG = Object.fromEntries(APPS.map(a => [a.id, a]));
const ui = { childId: null, day: todayStr(), data: null };

async function api(path, opts = {}) {
  let r;
  try {
    r = await fetch(ROOT + 'api/parent/' + path, {
      method: opts.method || 'GET', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-KLA': '1' },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch (e) { throw Object.assign(new Error('Keine Verbindung zum Server.'), { status: 0 }); }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const d = data.detail;
    throw Object.assign(new Error(Array.isArray(d) ? 'Bitte die Eingaben prüfen.' : d || 'Da ist etwas schiefgegangen.'), { status: r.status });
  }
  return data;
}
// Runs a change, reports errors as a toast and reloads the view on success.
async function act(fn, done) {
  try { const r = await fn(); if (done) toast(done, ''); await load(); return r; }
  catch (e) { if (e.status === 401) return signedOutView(); toast('Hat nicht geklappt', e.message); }
}

const mins = sec => { const m = Math.round((sec || 0) / 60); return m < 60 ? `${m} Min` : `${Math.floor(m / 60)} Std ${String(m % 60).padStart(2, '0')} Min`; };
const time = ts => new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const when = ts => {
  if (!ts) return 'nie';
  const d = new Date(ts), days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 864e5);
  return `${days === 0 ? 'heute' : days === 1 ? 'gestern' : d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' })}, ${time(ts)}`;
};
const stars = n => '★'.repeat(n) + '☆'.repeat(Math.max(0, 3 - n));
const appTitle = id => (CATALOG[id] || {}).title || id;
// Upcoming exams first (soonest on top), then apps without a date, then past exams.
function appOrder(a, b) {
  const key = x => { const d = x.exam && x.exam.date ? daysUntil(x.exam.date) : 9999; return d < 0 ? 10000 - d : d; };
  return key(a) - key(b);
}

// A small form in a dialog; resolves with the field values or null.
function ask(title, text, fields, okLabel = 'Speichern') {
  return new Promise(resolve => {
    const el = document.createElement('div');
    el.className = 'modal';
    el.innerHTML = `<form class="box dash-ask" role="dialog" aria-modal="true"><h2>${title}</h2>${text ? `<p>${text}</p>` : ''}
      ${fields.map(f => `<label>${f.label}${f.options
        ? `<select name="${f.name}">${f.options.map(o => `<option${o === f.value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`
        : `<input name="${f.name}" type="${f.type || 'text'}" value="${esc(f.value ?? '')}" ${f.attrs || ''}>`}</label>`).join('')}
      <div class="actions"><button class="btn primary" type="submit">${okLabel}</button><button class="btn" type="button" data-cancel>Abbrechen</button></div></form>`;
    document.body.appendChild(el);
    const form = $('form', el);
    (form.elements[0] || form).focus();
    $('[data-cancel]', el).onclick = () => { el.remove(); resolve(null); };
    form.onsubmit = e => {
      e.preventDefault();
      const v = Object.fromEntries(fields.map(f => [f.name, form.elements[f.name].value.trim()]));
      el.remove(); resolve(v);
    };
  });
}
const confirmIt = async (html, label = 'Ja, weiter') => (await modal(html, [{ label, cls: 'warn' }, { label: 'Abbrechen' }])) === 0;

// ----- views ---------------------------------------------------------------------------
const root = () => $('#dash');

function signedOutView() {
  root().innerHTML = `<header class="dash-head"><div class="eyebrow">Lernapps</div><h1>Eltern-<em>Dashboard</em></h1></header>
    <section class="dash-card"><p>Das Dashboard ist nur für Eltern. Melde dich zuerst auf der Familienseite an und öffne diese Seite danach noch einmal.</p>
    <div class="dash-row"><a class="btn primary" href="/">Zur Familienseite</a><button class="btn" id="again">Nochmal prüfen</button></div></section>`;
  $('#again').onclick = () => load();
}

async function load() {
  let data;
  try { data = await api('overview'); }
  catch (e) {
    if (e.status === 401) return signedOutView();
    root().innerHTML = `<section class="dash-card"><p class="dash-err">${esc(e.message)}</p><button class="btn" onclick="load()">Nochmal versuchen</button></section>`;
    return;
  }
  ui.data = data;
  if (!data.children.some(c => c.id === ui.childId)) ui.childId = data.children.length ? data.children[0].id : null;
  render();
}

function render() {
  const { data } = ui, child = data.children.find(c => c.id === ui.childId);
  root().innerHTML = `
    <header class="dash-head"><div class="eyebrow">Lernapps · angemeldet als ${esc(data.parent)}</div><h1>Eltern-<em>Dashboard</em></h1></header>
    <nav class="dash-kids">${data.children.map(c => `<button class="dash-kid" data-id="${c.id}" aria-current="${c.id === ui.childId}">${esc(c.name)}<small>${esc(c.school)}</small></button>`).join('')}
      <button class="dash-kid add" id="addChild">+ Kind</button></nav>
    ${child ? childView(child) : '<section class="dash-card"><p>Noch kein Kind angelegt. Leg die Kinder mit Namen, Schulart und persönlichem Code an, dann können sie sich auf der Startseite anmelden.</p></section>'}`;
  $$('.dash-kid[data-id]').forEach(b => b.onclick = () => { ui.childId = +b.dataset.id; ui.day = todayStr(); render(); });
  $('#addChild').onclick = addChild;
  if (child) wireChild(child);
}

function childView(c) {
  const p = c.playtime;
  return `
    <section class="dash-tiles">
      <div class="dash-tile"><span>Heute gelernt</span><b>${mins(c.activity.learn)}</b></div>
      <div class="dash-tile"><span>Heute gespielt</span><b>${mins(c.activity.game)}</b>${c.gameLimit != null ? `<small>Grenze ${c.gameLimit} Min</small>` : ''}</div>
      <div class="dash-tile play"><span>Zockzeit-Konto</span><b>${p.balance} Min</b><small>heute verdient ${p.earnedToday} von ${p.cap}</small></div>
    </section>
    <div class="dash-row"><button class="btn warn" id="redeem">Zockzeit einlösen</button><button class="btn" id="grant">Minuten schenken</button></div>

    <section class="dash-card">
      <div class="dash-cardhead"><h2>Tag</h2>
        <div class="dash-daypick"><button class="iconbtn" id="dayPrev" aria-label="Tag davor">‹</button><input type="date" id="day" value="${ui.day}" max="${todayStr()}"><button class="iconbtn" id="dayNext" aria-label="Tag danach" ${ui.day >= todayStr() ? 'disabled' : ''}>›</button></div></div>
      <div id="dayView"><p class="dash-muted">Lade …</p></div>
    </section>

    <section class="dash-card">
      <h2>Apps</h2>
      <div class="dash-apps">${c.apps.length ? c.apps.slice().sort(appOrder).map(a => appRow(c, a)).join('') :'<p class="dash-muted">Für diese Schulart gibt es noch keine App.</p>'}</div>
    </section>

    <section class="dash-card">
      <h2>Zockzeit-Verlauf</h2>
      <div id="ptLog"><p class="dash-muted">Lade …</p></div>
    </section>

    <section class="dash-card">
      <h2>Einstellungen für ${esc(c.name)}</h2>
      <dl class="dash-settings">
        <dt>Name und Schulart</dt><dd>${esc(c.name)}, ${esc(c.school)} <button class="linkbtn" data-set="name">ändern</button></dd>
        <dt>Code</dt><dd>${c.requireCode ? 'wird beim Profilwechsel abgefragt' : 'nur bei der ersten Anmeldung auf einem Gerät'} <button class="linkbtn" data-set="code">neuer Code</button> <button class="linkbtn" data-set="require">${c.requireCode ? 'nicht mehr abfragen' : 'beim Wechsel abfragen'}</button></dd>
        <dt>Zockzeit</dt><dd>${c.playtimePerStar} Min pro neuem Stern, höchstens ${c.playtimeCap} Min am Tag <button class="linkbtn" data-set="playtime">ändern</button></dd>
        <dt>Spiele in den Apps</dt><dd>${c.gameLimit == null ? 'ohne Grenze' : `höchstens ${c.gameLimit} Min am Tag`} <button class="linkbtn" data-set="games">ändern</button></dd>
      </dl>
      <h3>Angemeldete Geräte</h3>
      <div id="devices"><p class="dash-muted">Lade …</p></div>
      <div class="dash-row"><button class="btn small" id="delChild">${esc(c.name)} löschen</button></div>
    </section>`;
}

function appRow(c, a) {
  const cat = CATALOG[a.id] || {};
  const today = a.learnSecToday || a.gameSecToday ? `heute ${mins(a.learnSecToday)} gelernt${a.gameSecToday ? `, ${mins(a.gameSecToday)} gespielt` : ''}` : 'heute nicht geöffnet';
  return `<div class="dash-app" data-app="${a.id}">
    <div class="dash-app-top"><div class="dash-app-icon">${cat.icon || ''}</div>
      <div><b>${esc(a.title)}</b><small>${esc(a.subject || '')}${a.exam && a.exam.date ? ` · ${esc(a.exam.kind)} am ${shortDate(a.exam.date)}` : ''}</small>
      <small>${a.stars} Sterne · ${a.xp} XP${a.examBest ? ` · Probe-Note ${esc(a.examBest)}` : ''}${a.mistakes ? ` · ${a.mistakes} in der Fehlerkiste` : ''}</small>
      <small>${today} · zuletzt gespeichert ${when(a.updatedAt)}</small></div></div>
    <div class="dash-toggles">
      <label class="dash-switch"><input type="checkbox" data-toggle="earnsPlaytime" ${a.earnsPlaytime ? 'checked' : ''}><span>Zockzeit sammeln</span></label>
      <label class="dash-switch"><input type="checkbox" data-toggle="locked" ${a.locked ? 'checked' : ''}><span>Gesperrt</span></label>
    </div>
    <div class="dash-row small">
      <button class="btn small" data-op="tickets">Tickets schenken</button>
      <button class="btn small" data-op="goal">Tagesziel${a.dailyGoal ? ` (${a.dailyGoal} XP)` : ''}</button>
      <button class="btn small" data-op="reset">Zurücksetzen</button>
      <button class="btn small" data-op="log">Protokoll löschen</button>
    </div></div>`;
}

function wireChild(c) {
  const base = `children/${c.id}`;
  $('#redeem').onclick = async () => {
    const v = await ask('Zockzeit einlösen', `${esc(c.name)} hat ${c.playtime.balance} Minuten auf dem Konto.`, [
      { name: 'minutes', label: 'Minuten', type: 'number', value: Math.min(30, c.playtime.balance), attrs: 'min="1" max="600" required' },
      { name: 'note', label: 'Wofür (frei)', value: '', attrs: 'maxlength="120" placeholder="z. B. Switch"' }], 'Einlösen');
    if (v) act(() => api(`${base}/playtime`, { method: 'POST', body: { minutes: -Math.abs(+v.minutes), note: v.note } }), `${v.minutes} Minuten eingelöst`);
  };
  $('#grant').onclick = async () => {
    const v = await ask('Minuten schenken', 'Die Minuten kommen direkt aufs Konto und zählen nicht zur Tagesgrenze.', [
      { name: 'minutes', label: 'Minuten', type: 'number', value: 10, attrs: 'min="1" max="600" required' },
      { name: 'note', label: 'Anlass (frei)', value: '', attrs: 'maxlength="120"' }], 'Schenken');
    if (v) act(() => api(`${base}/playtime`, { method: 'POST', body: { minutes: Math.abs(+v.minutes), note: v.note } }), `${v.minutes} Minuten geschenkt`);
  };
  const go = d => { ui.day = d; render(); };
  const shift = n => { const d = parseDate(ui.day); d.setDate(d.getDate() + n); return isoDate(d); };
  $('#day').onchange = e => e.target.value && go(e.target.value);
  $('#dayPrev').onclick = () => go(shift(-1));
  $('#dayNext').onclick = () => go(shift(1));
  loadDay(c);
  loadPlaytime(c);
  loadDevices(c);

  $$('.dash-app').forEach(row => {
    const app = row.dataset.app, a = c.apps.find(x => x.id === app), url = `${base}/apps/${app}`;
    $$('[data-toggle]', row).forEach(t => t.onchange = () => act(() => api(url, { method: 'PATCH', body: { [t.dataset.toggle]: t.checked } })));
    $('[data-op=tickets]', row).onclick = async () => {
      const v = await ask('Tickets schenken', `Spiel-Tickets für ${esc(a.title)}. Sie kommen an, sobald die App das nächste Mal online ist.`,
        [{ name: 'n', label: 'Anzahl', type: 'number', value: 1, attrs: 'min="1" max="20" required' }], 'Schenken');
      if (v) act(() => api(`${url}/tickets`, { method: 'POST', body: { n: +v.n } }), `${v.n} Ticket${+v.n === 1 ? '' : 's'} unterwegs`);
    };
    $('[data-op=goal]', row).onclick = async () => {
      const v = await ask('Tagesziel', 'XP pro Tag, bis der Tagesring voll ist. Leer lassen für den Standard der App.',
        [{ name: 'goal', label: 'XP am Tag', type: 'number', value: a.dailyGoal || '', attrs: 'min="10" max="5000"' }]);
      if (v) act(() => api(url, { method: 'PATCH', body: v.goal ? { dailyGoal: +v.goal } : { clearDailyGoal: true } }), 'Tagesziel gespeichert');
    };
    $('[data-op=reset]', row).onclick = async () => {
      if (await confirmIt(`<h2>Zurücksetzen?</h2><p>Der ganze Fortschritt von ${esc(c.name)} in ${esc(a.title)} wird gelöscht, auch auf allen Geräten. Das Protokoll und die Zockzeit bleiben, und Sterne, die schon einmal Minuten gebracht haben, bringen kein zweites Mal.</p>`, 'Zurücksetzen'))
        act(() => api(`${url}/reset`, { method: 'POST' }), 'Zurückgesetzt');
    };
    $('[data-op=log]', row).onclick = async () => {
      if (await confirmIt(`<h2>Protokoll löschen?</h2><p>Alle Tageseinträge von ${esc(c.name)} in ${esc(a.title)} werden endgültig gelöscht. Der Fortschritt in der App bleibt.</p>`, 'Löschen'))
        act(async () => { const r = await api(`${url}/events`, { method: 'DELETE' }); toast(`${r.deleted} Einträge gelöscht`, ''); });
    };
  });

  $$('[data-set]').forEach(b => b.onclick = async () => {
    const k = b.dataset.set;
    let body = null;
    if (k === 'name') {
      const v = await ask('Name und Schulart', 'Die Schulart bestimmt, welche Apps das Kind sieht.', [
        { name: 'name', label: 'Name', value: c.name, attrs: 'maxlength="40" required' },
        { name: 'school', label: 'Schulart', value: c.school, options: SCHOOLS }]);
      if (v) body = v;
    } else if (k === 'code') {
      const v = await ask('Neuer Code', 'Mindestens 4 Buchstaben oder Ziffern, Groß- und Kleinschreibung und Leerzeichen zählen nicht. Angemeldete Geräte bleiben angemeldet.', [
        { name: 'code', label: 'Code', value: '', attrs: 'minlength="4" maxlength="40" required autocomplete="off"' }]);
      if (v) body = v;
    } else if (k === 'require') body = { requireCode: !c.requireCode };
    else if (k === 'playtime') {
      const v = await ask('Zockzeit', 'Minuten gibt es nur in Apps mit „Zockzeit sammeln“, für jeden Stern, der zum ersten Mal erreicht wird, und für eine Probearbeit mit Note 1 oder 2 einmal am Tag 5 Minuten.', [
        { name: 'per', label: 'Minuten pro neuem Stern', type: 'number', value: c.playtimePerStar, attrs: 'min="0" max="10" required' },
        { name: 'cap', label: 'Höchstens Minuten am Tag', type: 'number', value: c.playtimeCap, attrs: 'min="0" max="600" required' }]);
      if (v) body = { playtimePerStar: +v.per, playtimeCap: +v.cap };
    } else if (k === 'games') {
      const v = await ask('Spiele in den Apps', 'Wie lange am Tag die Belohnungsspiele in allen Apps zusammen laufen dürfen. Leer lassen für keine Grenze.', [
        { name: 'limit', label: 'Minuten am Tag', type: 'number', value: c.gameLimit ?? '', attrs: 'min="0" max="600"' }]);
      if (v) body = v.limit === '' ? { clearGameLimit: true } : { gameLimit: +v.limit };
    }
    if (body) act(() => api(base, { method: 'PATCH', body }), 'Gespeichert');
  });

  $('#delChild').onclick = async () => {
    if (await confirmIt(`<h2>${esc(c.name)} löschen?</h2><p>Das Kind wird mit allen Geräten, dem Fortschritt in allen Apps, dem Protokoll und dem Zockzeit-Konto endgültig gelöscht.</p>`, 'Endgültig löschen'))
      act(() => api(base, { method: 'DELETE' }), `${c.name} gelöscht`);
  };
}

// The day: active time per app, then per app the levels (summarised), mock tests and games.
async function loadDay(c) {
  const box = $('#dayView');
  let d;
  try { d = await api(`children/${c.id}/day?date=${ui.day}`); } catch (e) { box.innerHTML = `<p class="dash-err">${esc(e.message)}</p>`; return; }
  if (!box.isConnected) return;
  const apps = [...new Set([...Object.keys(d.active), ...d.timeline.map(e => e.app)])];
  const pt = d.playtime.filter(p => p.reason !== 'parent').reduce((s, p) => s + p.minutes, 0);
  if (!apps.length) { box.innerHTML = `<p class="dash-muted">${ui.day === todayStr() ? 'Heute' : 'An diesem Tag'} hat ${esc(c.name)} keine Lernapp benutzt.</p>`; return; }
  const total = Object.values(d.active).reduce((s, a) => ({ learn: s.learn + a.learn, game: s.game + a.game }), { learn: 0, game: 0 });
  box.innerHTML = `<p class="dash-sum">${mins(total.learn)} gelernt, ${mins(total.game)} gespielt${pt ? `, ${pt} Min Zockzeit verdient` : ''}.</p>` +
    apps.map(app => dayApp(app, d.active[app] || { learn: 0, game: 0 }, d.timeline.filter(e => e.app === app), d.playtime.filter(p => p.app_id === app))).join('');
}

function dayApp(app, act, evs, play) {
  const levels = new Map(), exams = [], games = new Map(), other = [];
  for (const e of evs) {
    const x = e.data || {};
    if (e.kind === 'level') {
      const key = `${x.world || ''}|${x.title}|${x.type}`;
      const g = levels.get(key) || { ...x, first: e.ts, runs: 0, best: 0, wrong: new Set(), last: x };
      g.runs++; g.best = Math.max(g.best, x.stars || 0); g.last = x; (x.wrong || []).forEach(w => g.wrong.add(w));
      g.isNew = g.isNew || (x.stars || 0) > (x.prev ?? 3);
      levels.set(key, g);
    } else if (e.kind === 'exam') exams.push(e);
    else if (e.kind === 'game') { const g = games.get(x.name) || { sec: 0, n: 0 }; g.sec += x.sec || 0; g.n++; games.set(x.name, g); }
    else other.push(e);
  }
  const wrongList = w => w.length ? `<details><summary>${w.length} falsch</summary><ul>${w.map(t => `<li>${esc(t)}</li>`).join('')}</ul></details>` : '';
  const earned = play.reduce((s, p) => s + p.minutes, 0);
  return `<div class="dash-day">
    <h3>${esc(appTitle(app))}</h3>
    <p class="dash-muted">${mins(act.learn)} gelernt${act.game ? `, ${mins(act.game)} gespielt` : ''}${earned ? `, ${earned} Min Zockzeit verdient` : ''}</p>
    <ul class="dash-tl">
      ${[...levels.values()].map(g => `<li><time>${time(g.first)}</time><div><b>${esc(g.title)}</b>${g.world && g.world !== g.title ? ` <small>${esc(g.world)}</small>` : ''}
        <span class="dash-stars" title="beste Sterne">${g.type === 'level' || g.world ? stars(g.best) : ''}</span>${g.isNew ? '<span class="dash-new">neu</span>' : ''}
        <small>${g.runs}× gespielt, zuletzt ${g.last.right ?? '?'} von ${g.last.total ?? '?'} richtig</small>${wrongList([...g.wrong])}</div></li>`).join('')}
      ${exams.map(e => `<li><time>${time(e.ts)}</time><div><b>Probearbeit: Note ${esc(e.data.grade)}</b> <small>${e.data.pts ?? ''}${e.data.max ? ` von ${e.data.max} Punkten` : ''}${e.data.pct != null ? `, ${e.data.pct} %` : ''}</small>${wrongList(e.data.wrong || [])}</div></li>`).join('')}
      ${games.size ? `<li><time>Spiele</time><div>${[...games.entries()].map(([n, g]) => `${esc(n)} ${mins(g.sec)}${g.n > 1 ? ` (${g.n}×)` : ''}`).join(', ')}</div></li>` : ''}
      ${other.map(e => `<li><time>${time(e.ts)}</time><div>${esc(e.kind)}: ${esc(JSON.stringify(e.data).slice(0, 120))}</div></li>`).join('')}
    </ul></div>`;
}

async function loadPlaytime(c) {
  const box = $('#ptLog');
  let rows;
  try { rows = await api(`children/${c.id}/playtime?limit=30`); } catch (e) { box.innerHTML = `<p class="dash-err">${esc(e.message)}</p>`; return; }
  if (!box.isConnected) return;
  const why = r => r.reason === 'stars' ? `neue Sterne in ${esc(appTitle(r.app_id))}` : r.reason === 'exam' ? `Probearbeit in ${esc(appTitle(r.app_id))}` : r.minutes < 0 ? `eingelöst von ${esc(r.by_parent || '?')}` : `geschenkt von ${esc(r.by_parent || '?')}`;
  box.innerHTML = rows.length
    ? `<ul class="dash-pt">${rows.map(r => `<li><span class="${r.minutes < 0 ? 'neg' : 'pos'}">${r.minutes > 0 ? '+' : ''}${r.minutes} Min</span><span>${why(r)}${r.note ? ` · ${esc(r.note)}` : ''}</span><time>${when(r.ts)}</time></li>`).join('')}</ul>`
    : '<p class="dash-muted">Noch keine Zockzeit verdient oder eingelöst.</p>';
}

async function loadDevices(c) {
  const box = $('#devices');
  let rows;
  try { rows = await api(`children/${c.id}/devices`); } catch (e) { box.innerHTML = `<p class="dash-err">${esc(e.message)}</p>`; return; }
  if (!box.isConnected) return;
  box.innerHTML = rows.length
    ? `<ul class="dash-devices">${rows.map(d => `<li><span><b>${esc(d.label || 'Gerät')}</b><small>angemeldet ${when(d.createdAt)}, zuletzt aktiv ${when(d.lastSeenAt)}</small></span><button class="btn small" data-dev="${d.id}">Abmelden</button></li>`).join('')}</ul>`
    : '<p class="dash-muted">Auf keinem Gerät angemeldet.</p>';
  $$('[data-dev]', box).forEach(b => b.onclick = async () => {
    if (await confirmIt(`<h2>Gerät abmelden?</h2><p>${esc(c.name)} braucht auf diesem Gerät danach wieder den Code. Der Fortschritt bleibt erhalten.</p>`, 'Abmelden'))
      act(() => api(`devices/${b.dataset.dev}`, { method: 'DELETE' }), 'Gerät abgemeldet');
  });
}

async function addChild() {
  const v = await ask('Kind anlegen', 'Mit dem Code meldet sich das Kind einmal pro Gerät auf der Startseite an. Jedes Kind braucht einen eigenen Code.', [
    { name: 'name', label: 'Name', value: '', attrs: 'maxlength="40" required' },
    { name: 'school', label: 'Schulart', value: SCHOOLS[0], options: SCHOOLS },
    { name: 'code', label: 'Persönlicher Code', value: '', attrs: 'minlength="4" maxlength="40" required autocomplete="off"' }], 'Anlegen');
  if (!v) return;
  const r = await act(() => api('children', { method: 'POST', body: v }), `${v.name} angelegt`);
  if (r) { ui.childId = r.id; render(); }
}

load();
document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('.modal')) load(); });
