// Tab pages: cheat sheet, arcade and achievements.

function cheatHtml() {
  const when = examDay && EXAM && daysUntil(EXAM.date) >= 0 ? `für ${examDay}` : 'aus allen Welten';
  return `<h2 class="section-title">Spickzettel</h2><p class="lead">Alles Wichtige ${when} auf einen Blick. Am Abend vorher einmal durchlesen, am Morgen nochmal.</p>
  <div class="cheat">${WORLDS.map((t, ti) => `<details ${ti === 0 ? 'open' : ''}><summary><span class="sa">${artOf(t.art)}</span>${t.title}</summary>
    <div class="cbody">${t.learn.map(c => `<div><h4>${c.h}</h4>${learnBlocks(c, 'cheat')}</div>`).join('')}<div><button class="btn small primary" data-learnall="${ti}">Als Lernkarten ansehen</button></div></div></details>`).join('')}</div>`;
}

function arcadeHtml() {
  if (!GAMES.length) return `<h2 class="section-title">Arcade</h2><p class="lead">In dieser App gibt es noch keine Spiele.</p>`;
  const ts = totalStars(), next = GAMES.find(g => g.stars > ts);
  return `<h2 class="section-title">Arcade</h2><p class="lead">Hier gibt es die Belohnung fürs Lernen, und jedes Spiel kostet ein Ticket. Ein Ticket bekommst du für je ${STARS_PER_TICKET} neue Sterne, für jede komplette Welt, fürs Tagesziel${APP.exam ? ` und für ${examArt.good} Probe-${examName}` : ''}. Mehr als ${TICKET_CAP} Tickets kannst du nicht ansparen.</p>
  <div class="ticketbar">${ICON.ticket}<div><b>${state.tickets} Ticket${state.tickets === 1 ? '' : 's'}</b><p>Du hast ${ts} ${ts === 1 ? 'Stern' : 'Sterne'}. Noch ${STARS_PER_TICKET - (state.starBank || 0)} neue ${STARS_PER_TICKET - (state.starBank || 0) === 1 ? 'Stern' : 'Sterne'} bis zum nächsten Ticket. ${next ? `Nächstes Spiel ab ${next.stars} Sternen.` : 'Alle Spiele sind freigeschaltet!'}</p></div></div>
  <div class="games">${GAMES.map(g => {
    const unlocked = ts >= g.stars;
    return `<button class="game ${unlocked ? '' : 'locked'}" data-game="${g.id}"><div class="thumb">${gameThumb(g.id)}</div><div class="body"><h3>${g.name}</h3><p>${g.desc}</p>
      <div class="meta"><span>${unlocked ? g.record(state.games[g.id] || 0) : `${ICON.lock.replace('<svg', '<svg style="width:16px;height:16px;display:inline;vertical-align:-3px"')} ab ${g.stars} Sternen`}</span><span>${unlocked ? '1 Ticket' : ''}</span></div></div></button>`;
  }).join('')}</div>`;
}

function tryGame(id) {
  const g = GAMES.find(x => x.id === id);
  if (totalStars() < g.stars) { Sound.wrong(); toast('Noch gesperrt', `Sammle ${g.stars} Sterne im Lernpfad.`, ICON.lock); return; }
  if (state.tickets < 1) { Sound.wrong(); toast('Keine Tickets', `Hol dir neue Sterne im Lernpfad, für je ${STARS_PER_TICKET} gibt es ein Ticket.`, ICON.ticket); return; }
  state.tickets--; save(); renderStatus();
  openGame(id);
}

function badgesHtml() {
  const acc = state.answered ? Math.round(state.correct / state.answered * 100) : 0;
  const cols = ['var(--gold)', 'var(--accent-2)', 'var(--good-soft)', 'var(--bad-soft)'];
  return `<h2 class="section-title">Erfolge</h2><p class="lead">Deine Statistik und alle Abzeichen. Schaffst du alle ${BADGES.length}?</p>
  <div class="statgrid">
    <div class="stat"><b>${state.xp}</b><span>XP gesamt</span></div>
    <div class="stat"><b>${totalStars()}/${maxStars()}</b><span>Sterne</span></div>
    <div class="stat"><b>${acc} %</b><span>richtig beantwortet (${state.answered} Fragen)</span></div>
    <div class="stat"><b>${state.bestCombo}</b><span>beste Combo</span></div>
    ${APP.exam ? `<div class="stat"><b>${state.examBest || '–'}</b><span>beste Probe-Note</span></div>` : ''}
  </div>
  <div class="badges">${BADGES.map((b, i) => `<div class="badge ${state.badges[b.id] ? '' : 'off'}"><div class="medal">${ICON.medal(cols[i % 4], 'var(--ink)')}</div><b>${b.name}</b><span>${b.desc}</span></div>`).join('')}</div>
  <div style="margin-top:30px;display:flex;gap:10px;flex-wrap:wrap">
    <button class="btn small" id="resetBtn">Fortschritt zurücksetzen</button>
  </div>`;
}

document.addEventListener('click', async e => {
  if (e.target.id !== 'resetBtn') return;
  const r = await modal('<h2>Wirklich alles löschen?</h2><p>XP, Sterne, Tickets und Abzeichen werden auf null gesetzt.</p>', [{ label: 'Abbrechen', cls: 'primary' }, { label: 'Ja, zurücksetzen', cls: '' }]);
  if (r === 1) { Object.assign(state, defaultState()); save(); render(); }
});
