// Start page: the child signs in once per device with its personal code (cloud.js), picks its
// profile when several children share the device, and then sees its own apps with exam
// countdown, progress and the play-time account. APPS (all apps, injected by build.py) gives
// icons and covers; the server says which apps belong to the child and how they are set.
// Names come only from the server, the public site contains none.

const state = { sound: true };   // fx.js plays sounds only when this is on

function summaryOf(id) {
  try { return JSON.parse(localStorage.getItem(Cloud.summaryKey(id))) || null; } catch (e) { return null; }
}

function examPill(exam) {
  if (!exam) return '';
  if (!exam.date) return `<span class="pill">${exam.kind}: Termin folgt</span>`;
  const dl = daysUntil(exam.date);
  if (dl < 0) return `<span class="pill done">${exam.kind} war am ${shortDate(exam.date)}</span>`;
  const when = dl === 0 ? 'heute' : dl === 1 ? 'morgen' : `in ${dl} Tagen`;
  return `<span class="pill ${dl <= 3 ? 'soon' : ''}">${exam.kind} ${when} · ${weekdayOf(exam.date).slice(0, 2)}, ${shortDate(exam.date)}</span>`;
}

function appCard(a) {
  const s = summaryOf(a.id);
  const stars = Math.max(a.stars || 0, s ? s.stars : 0);
  const pct = s && s.maxStars ? Math.round(stars / s.maxStars * 100) : 0;
  const progress = stars || s
    ? `<div class="hub-progress">${s && s.maxStars ? `<div class="xpbar"><i style="width:${pct}%"></i></div>` : ''}
        <div class="hub-stats"><span>${ICON.star().replace('<svg', '<svg class="i"')}${stars}${s && s.maxStars ? '/' + s.maxStars : ''}</span>${s ? `<span>${s.xp} XP · ${s.rank}</span>` : ''}${s && s.examBest ? `<span>Probe-Note ${s.examBest}</span>` : ''}</div></div>`
    : '<p class="hub-new">Noch nicht gestartet</p>';
  const tags = `${a.earnsPlaytime ? `<span class="pill play">${Cloud.CLOCK}Zockzeit</span>` : ''}${a.locked ? `<span class="pill done">${ICON.lock}Gesperrt</span>` : ''}`;
  const tag = a.locked ? 'div' : 'a';
  return `<${tag} class="hub-card${a.cover ? ' with-cover' : ''}${a.locked ? ' locked' : ''}" ${a.locked ? '' : `href="${a.url}"`}>
    ${a.cover ? `<img class="hub-cover" src="${a.cover}" alt="" loading="lazy">` : ''}
    <div class="hub-icon">${a.icon || ICON.book}</div>
    <div class="hub-body">
      <div class="hub-meta">${a.subject}${a.grade ? ' · ' + a.grade : ''}</div>
      <h3>${a.title}</h3>
      ${a.about ? `<p>${a.about}</p>` : ''}
      <div class="hub-tags">${examPill(a.exam)}${tags}</div>
      ${progress}
    </div>
    ${a.locked ? '' : '<span class="hub-go" aria-hidden="true">›</span>'}</${tag}>`;
}

// Upcoming exams first (soonest on top), then apps whose exam is over.
function appOrder(a, b) {
  const da = a.exam && a.exam.date ? daysUntil(a.exam.date) : 9999, db = b.exam && b.exam.date ? daysUntil(b.exam.date) : 9999;
  const ka = da < 0 ? 10000 - da : da, kb = db < 0 ? 10000 - db : db;
  return ka - kb;
}

const head = (title, sub) => `<header class="hub-head"><div class="eyebrow">Lernapps</div><h1>${title}</h1>${sub ? `<p class="hand">${sub}</p>` : ''}</header>`;

// Code entry, for a new child on this device or to confirm a profile switch.
function codeView({ title, sub, onCode, back }) {
  $('#hub').innerHTML = `${head(title, sub)}
    <form class="hub-login" id="codeForm" autocomplete="off">
      <label for="code">Dein Code</label>
      <input id="code" class="hub-code" type="text" autocapitalize="characters" autocomplete="off" spellcheck="false" maxlength="40" required>
      <p class="hub-err" id="codeErr" role="alert"></p>
      <div class="hub-actions"><button class="btn primary" type="submit">Weiter</button>${back ? '<button class="btn" type="button" id="codeBack">Zurück</button>' : ''}</div>
    </form>`;
  const input = $('#code');
  input.focus();
  if (back) $('#codeBack').onclick = back;
  $('#codeForm').onsubmit = async e => {
    e.preventDefault();
    const btn = $('#codeForm button[type=submit]'); btn.disabled = true;
    try { await onCode(input.value.trim()); }
    catch (err) {
      $('#codeErr').textContent = err.status === 401 || err.status === 403 ? 'Diesen Code kenne ich nicht. Schau noch einmal genau hin.' : err.message;
      input.select();
    } finally { btn.disabled = false; }
  };
}

function loginView() {
  const known = Cloud.profiles().length > 0;
  codeView({
    title: known ? 'Weiteres Kind <em>anmelden</em>' : 'Melde dich <em>an</em>',
    sub: 'Gib deinen persönlichen Code ein, den du von Mama oder Papa hast. Auf diesem Gerät musst du das nur einmal machen.',
    onCode: async code => { await Cloud.login(code); renderHub(); },
    back: known ? () => pickerView() : null,
  });
}

// Shows every child of the family once one child is signed in on this device. A child not yet
// signed in here logs in with its code; the others switch with their code (or without, if the
// parents switched that off in the dashboard).
function pickerView(family = Cloud.familyCached()) {
  const ps = Cloud.profiles(), known = new Set(ps.map(p => p.id));
  const others = family.filter(c => !known.has(c.id));
  const tile = (c, isNew) => `<button class="hub-profile" data-id="${c.id}"${isNew ? ' data-new="1"' : ''}><span class="hub-avatar">${esc(c.name.slice(0, 1))}</span><b>${esc(c.name)}</b><small>${esc(c.school)}</small></button>`;
  $('#hub').innerHTML = `${head('Wer lernt <em>jetzt</em>?', 'Tippe auf deinen Namen.')}
    <div class="hub-profiles">${[...ps.map(p => tile(p, false)), ...others.map(c => tile(c, true))].join('')}
      <button class="hub-profile add" id="addKid"><span class="hub-avatar">+</span><b>Weiteres Kind</b><small>mit Code anmelden</small></button></div>`;
  $$('.hub-profile[data-id]').forEach(b => b.onclick = () => {
    if (b.dataset.new) {
      const c = others.find(x => x.id === +b.dataset.id);
      return codeView({
        title: `Hallo <em>${esc(c.name)}</em>`, sub: 'Gib deinen Code ein. Auf diesem Gerät musst du dich damit einmal anmelden.',
        onCode: async code => { await Cloud.login(code, c.id); renderHub(); },
        back: () => pickerView(),
      });
    }
    const p = ps.find(x => x.id === +b.dataset.id);
    if (!p.requireCode) { Cloud.setActive(p.id); return renderHub(); }
    codeView({
      title: `Hallo <em>${esc(p.name)}</em>`, sub: 'Gib zur Sicherheit deinen Code ein.',
      onCode: async code => { await Cloud.api('verify', { method: 'POST', body: { code } }, p.token); Cloud.setActive(p.id); renderHub(); },
      back: () => pickerView(),
    });
  });
  $('#addKid').onclick = () => loginView();
  // Ask the server for the current family once per picker and redraw if it changed.
  if (!pickerView.asked) {
    pickerView.asked = true;
    Cloud.family().then(f => {
      pickerView.asked = false;
      if (JSON.stringify(f) !== JSON.stringify(family) && !Cloud.profile() && $('.hub-profiles')) pickerView(f);
    });
  }
}

async function homeView(p) {
  if (!$('#hub .hub-group')) $('#hub').innerHTML = head(`Hallo <em>${esc(p.name)}</em>`, 'Einen Moment, ich hole deine Apps …');
  let me;
  try { me = await Cloud.api('me'); }
  catch (e) {
    if (e.status === 401) { Cloud.removeProfile(p.id); return renderHub(); }
    $('#hub').innerHTML = `${head(`Hallo <em>${esc(p.name)}</em>`, '')}<p class="hub-err">${esc(e.message)} Versuch es gleich noch einmal.</p>
      <div class="hub-actions"><button class="btn primary" id="retry">Nochmal versuchen</button><button class="btn" id="switch">Profil wechseln</button></div>`;
    $('#retry').onclick = () => renderHub();
    $('#switch').onclick = () => { Cloud.setActive(null); renderHub(); };
    return;
  }
  Cloud.saveProfile({ ...p, ...me.child });   // the name or the code setting may have changed
  const byId = Object.fromEntries(APPS.map(a => [a.id, a]));
  const apps = me.apps.filter(a => byId[a.id]).map(a => ({ ...byId[a.id], ...a, url: byId[a.id].url, cover: byId[a.id].cover })).sort(appOrder);
  const pt = me.playtime, earns = apps.some(a => a.earnsPlaytime);
  const play = earns || pt.balance
    ? `<section class="hub-play"><div class="hub-play-icon">${Cloud.CLOCK}</div><div><b>${pt.balance} Min Zockzeit</b> auf deinem Konto
        <span>${!earns ? 'Gerade sammelt keine App Zockzeit.' : pt.leftToday ? `Heute kannst du noch ${pt.leftToday} von ${pt.cap} Minuten verdienen, mit neuen Sternen in den Apps mit dem Zockzeit-Zeichen.` : `Für heute hast du alle ${pt.cap} Minuten geholt, stark!`}</span></div></section>`
    : '';
  $('#hub').innerHTML = `
    <header class="hub-head">
      <div class="eyebrow">Lernapps · ${esc(me.child.school)}</div>
      <h1>Hallo <em>${esc(me.child.name)}</em></h1>
      <p class="hand">Such dir eine App aus. Dein Fortschritt wird gespeichert, egal auf welchem Gerät du lernst.</p>
      <div class="hub-actions"><button class="btn small" id="switch">Profil wechseln</button></div>
    </header>
    ${play}
    <section class="hub-group"><div class="hub-grid">${apps.length ? apps.map(appCard).join('') : '<p class="hub-new">Für dich gibt es noch keine App.</p>'}</div></section>
    <p class="hub-foot"><button class="linkbtn" id="signout">${esc(me.child.name)} auf diesem Gerät abmelden</button></p>`;
  $('#switch').onclick = () => { Cloud.setActive(null); renderHub(); };
  $('#signout').onclick = async () => {
    const r = await modal(`<h2>Abmelden?</h2><p>Danach brauchst du auf diesem Gerät wieder deinen Code. Dein Fortschritt bleibt gespeichert.</p>`, [{ label: 'Abmelden', cls: 'warn' }, { label: 'Abbrechen', cls: '' }]);
    if (r === 0) { Cloud.removeProfile(p.id); renderHub(); }
  };
}

function renderHub() {
  const p = Cloud.profile();
  if (p) return homeView(p);
  return Cloud.profiles().length ? pickerView() : loginView();
}

renderHub();
// Play time and progress change while learning in another tab; refresh when the page comes back.
document.addEventListener('visibilitychange', () => { if (!document.hidden && Cloud.profile() && !$('#codeForm')) renderHub(); });
