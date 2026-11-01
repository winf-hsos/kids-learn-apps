// Start page: lists every app (APPS is injected by build.py) grouped by school (no names: the site is public),
// with exam countdown and the progress each app stored on this device.

function summaryOf(id) {
  try { return JSON.parse(localStorage.getItem(`kla:summary:${id}`)) || null; } catch (e) { return null; }
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
  const pct = s && s.maxStars ? Math.round(s.stars / s.maxStars * 100) : 0;
  const progress = s
    ? `<div class="hub-progress"><div class="xpbar"><i style="width:${pct}%"></i></div>
        <div class="hub-stats"><span>${ICON.star().replace('<svg', '<svg class="i"')}${s.stars}/${s.maxStars}</span><span>${s.xp} XP · ${s.rank}</span>${s.examBest ? `<span>Probe-Note ${s.examBest}</span>` : ''}</div></div>`
    : '<p class="hub-new">Noch nicht gestartet</p>';
  return `<a class="hub-card${a.cover ? ' with-cover' : ''}" href="${a.url}">
    ${a.cover ? `<img class="hub-cover" src="${a.cover}" alt="" loading="lazy">` : ''}
    <div class="hub-icon">${a.icon || ICON.book}</div>
    <div class="hub-body">
      <div class="hub-meta">${a.subject}${a.grade ? ' · ' + a.grade : ''}</div>
      <h3>${a.title}</h3>
      ${a.about ? `<p>${a.about}</p>` : ''}
      ${examPill(a.exam)}
      ${progress}
    </div>
    <span class="hub-go" aria-hidden="true">›</span></a>`;
}

// Upcoming exams first (soonest on top), then apps whose exam is over.
function appOrder(a, b) {
  const da = a.exam ? daysUntil(a.exam.date) : 9999, db = b.exam ? daysUntil(b.exam.date) : 9999;
  const ka = da < 0 ? 10000 - da : da, kb = db < 0 ? 10000 - db : db;
  return ka - kb;
}

function renderHub() {
  const schools = SCHOOLS.filter(s => APPS.some(a => a.school === s));
  $('#hub').innerHTML = `
    <header class="hub-head">
      <div class="eyebrow">Lernapps</div>
      <h1>Wähle deine <em>Lernapp</em></h1>
      <p class="hand">Jede App merkt sich deinen Fortschritt auf diesem Gerät.</p>
    </header>
    ${schools.map(k => `<section class="hub-group">
      <h2>${k}</h2>
      <div class="hub-grid">${APPS.filter(a => a.school === k).sort(appOrder).map(appCard).join('')}</div>
    </section>`).join('')}`;
}

renderHub();
// Progress may change in another tab; refresh when the start page becomes visible again.
document.addEventListener('visibilitychange', () => { if (!document.hidden) renderHub(); });
