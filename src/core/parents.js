// Parents' view (stats, open mistakes with solutions), backup and restore of the
// progress as a code or file, and the takeover of an older app's progress.
// APP.legacy = { key, prefix, convert(old) -> state fields } names the old app's
// localStorage key and backup code prefix; its progress is taken over once.

const BACKUP_PREFIX = 'KLA1:';
const toB64 = t => { const b = new TextEncoder().encode(t); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); };
const fromB64 = b => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));

function backupCode() {
  return BACKUP_PREFIX + toB64(JSON.stringify({ app: MANIFEST.id, v: 1, saved: new Date().toISOString(), state }));
}

// Reads a backup code of this app or, through APP.legacy, of the app it replaces.
function readBackup(text) {
  text = String(text).trim();
  try {
    if (text.startsWith(BACKUP_PREFIX)) {
      const d = JSON.parse(fromB64(text.slice(BACKUP_PREFIX.length)));
      if (d.app !== MANIFEST.id) return { error: 'Dieser Code gehört zu einer anderen Lernapp.' };
      return { state: d.state, saved: d.saved };
    }
    const L = APP.legacy;
    if (L && L.prefix && text.startsWith(L.prefix)) {
      const old = L.decode ? L.decode(text) : JSON.parse(fromB64(text.slice(L.prefix.length)));
      if (!old) return { error: 'Der Code ist unvollständig. Kopiere ihn bitte noch einmal ganz.' };
      return { state: Object.assign(defaultState(), L.convert(old)), legacy: true };
    }
  } catch (e) { return { error: 'Der Code ist unvollständig. Kopiere ihn bitte noch einmal ganz.' }; }
  return { error: 'Das ist kein Spielstand-Code dieser App.' };
}

function applyState(s) {
  const fresh = defaultState();
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, fresh, s, { games: Object.assign(fresh.games, s.games), seenIntro: true });
  state.tickets = Math.min(state.tickets, TICKET_CAP);
  save();
}

// Takes over the older app's progress once, if this app has not been used yet.
(function takeOverLegacy() {
  const L = APP.legacy;
  if (!L || state.legacyDone) return;
  let raw = null;
  try { raw = localStorage.getItem(L.key); } catch (e) { return; }
  state.legacyDone = true;
  if (!raw || state.answered > 0) { save(); return; }
  try {
    applyState(Object.assign(L.convert(JSON.parse(raw)), { legacyDone: true }));
    setTimeout(() => toast('Spielstand übernommen', 'Dein Fortschritt aus der alten App ist jetzt hier.', ICON.check), 800);
  } catch (e) { save(); }
})();

function parentsHtml() {
  const acc = state.answered ? Math.round(state.correct / state.answered * 100) : 0;
  const refsByWorld = WORLDS.map(t => Object.keys(state.mistakes).filter(r => r.startsWith(t.id + '|')).length);
  const mistakes = Object.entries(state.mistakes).sort((a, b) => b[1].n - a[1].n).slice(0, 25)
    .map(([ref, m]) => ({ it: itemFromRef(ref), n: m.n, w: WORLDS.find(t => ref.startsWith(t.id + '|')) })).filter(x => x.it);
  return `${stageTop(1)}
    <h1 class="section-title">Für Eltern</h1>
    <p class="lead">Wie es läuft, was noch nicht sitzt und wie Sie den Fortschritt sichern oder auf ein anderes Gerät bringen.</p>
    <div class="statgrid">
      <div class="stat"><b>${state.answered}</b><span>Antworten gegeben</span></div>
      <div class="stat"><b>${acc} %</b><span>davon richtig</span></div>
      <div class="stat"><b>${totalStars()}/${maxStars()}</b><span>Sterne</span></div>
      <div class="stat"><b>${state.streak.days || 0}</b><span>Tage in Folge</span></div>
    </div>
    <h2 class="section-title" style="font-size:22px">Stand pro Welt</h2>
    <div class="ptable"><table><tr><th>Welt</th><th>Level geschafft</th><th>Sterne</th><th>offene Fehler</th></tr>
      ${WORLDS.map((t, ti) => `<tr><td>${t.title}</td><td>${t.levels.filter((_, l) => starsOf(ti, l) > 0).length} / ${t.levels.length}</td>
        <td>${t.levels.reduce((s, _, l) => s + starsOf(ti, l), 0)} / ${t.levels.reduce((s, lv) => s + maxStarsOf(lv), 0)}</td><td>${refsByWorld[ti]}</td></tr>`).join('')}</table></div>
    <h2 class="section-title" style="font-size:22px">Was noch nicht sitzt</h2>
    ${mistakes.length ? `<ol class="plist">${mistakes.map(x => `<li><div>${x.it.kind === 'swipe' ? x.it.t : x.it.q}</div><div class="muted">${itemSolution(x.it)} · ${x.n}× falsch${x.w ? ' · ' + x.w.title : ''}</div></li>`).join('')}</ol>`
      : '<p class="muted">Die Fehlerkiste ist leer.</p>'}
    <h2 class="section-title" style="font-size:22px">Fortschritt sichern</h2>
    <p class="muted">Der Fortschritt liegt nur in diesem Browser. Mit dem Code oder der Datei lässt er sich auf einem anderen Gerät wiederherstellen.${state.backedUp ? ` Zuletzt gesichert am ${new Date(state.backedUp).toLocaleDateString('de-DE')}.` : ''}</p>
    <div class="pbtns"><button class="btn small primary" id="bkCopy">Code kopieren</button><button class="btn small" id="bkFile">Als Datei speichern</button></div>
    <textarea class="answer pcode" id="bkCode" readonly hidden></textarea>
    <h2 class="section-title" style="font-size:22px">Wiederherstellen</h2>
    <p class="muted">Code einfügen oder Datei wählen. ${APP.legacy ? 'Auch Codes aus der alten Version der App funktionieren.' : ''}</p>
    <textarea class="answer pcode" id="rsCode" placeholder="Code hier einfügen"></textarea>
    <div class="pbtns"><button class="btn small primary" id="rsLoad">Code laden</button><label class="btn small">Datei wählen<input type="file" id="rsFile" accept=".txt,text/plain" hidden></label></div>
    <p id="rsMsg"></p>
    <div style="margin-top:30px"><button class="btn small" id="resetBtn">Fortschritt zurücksetzen</button></div>`;
}

function openParents() {
  openStage(parentsHtml());
  bindQuit();
  const marked = () => { state.backedUp = Date.now(); save(); };
  $('#bkCopy').onclick = async () => {
    const code = backupCode(), box = $('#bkCode');
    box.value = code; box.hidden = false; box.select();
    try { await navigator.clipboard.writeText(code); toast('Kopiert', 'Der Code ist in der Zwischenablage.', ICON.check); } catch (e) { toast('Bitte selbst kopieren', 'Markieren Sie den Code im Feld und kopieren Sie ihn.'); }
    marked();
  };
  $('#bkFile').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([backupCode()], { type: 'text/plain' }));
    a.download = `Spielstand ${MANIFEST.title.replace(/[^\wäöüÄÖÜß -]+/g, '')} ${todayStr()}.txt`;
    a.click(); URL.revokeObjectURL(a.href); marked();
  };
  const restore = async text => {
    const r = readBackup(text), msg = $('#rsMsg');
    if (r.error) { msg.textContent = r.error; msg.className = 'bad-text'; return; }
    const s = r.state, stars = Object.values(s.levels || {}).reduce((a, v) => a + (v.stars || 0), 0);
    const ok = await modal(`<h2>Spielstand laden?</h2><p>${r.legacy ? 'Aus der alten App: ' : ''}${s.xp} XP, ${stars} Sterne${r.saved ? `, gesichert am ${new Date(r.saved).toLocaleDateString('de-DE')}` : ''}. Der jetzige Stand auf diesem Gerät wird ersetzt.</p>`,
      [{ label: 'Laden', cls: 'go' }, { label: 'Abbrechen', cls: '' }]);
    if (ok !== 0) return;
    applyState(s); closeStage(); render(); toast('Spielstand geladen', `${s.xp} XP und ${stars} Sterne sind da.`, ICON.check);
  };
  $('#rsLoad').onclick = () => restore($('#rsCode').value);
  $('#rsFile').onchange = e => { const f = e.target.files[0]; if (f) f.text().then(restore); };
}

document.addEventListener('click', e => { if (e.target.closest('#parentsBtn')) { Sound.click(); openParents(); } });
