// Boot: first render and the one-time welcome dialog.

function boot() {
  document.documentElement.lang = 'de';
  touchDaily(); save();
  render();
  if (!state.seenIntro) {
    state.seenIntro = true; save();
    const intro = APP.intro || {};
    const when = EXAM && daysUntil(EXAM.date) >= 0 ? ` für die ${EXAM.kind} am ${examDay}` : '';
    const games = GAMES.length ? `, und jeder neue Stern bringt ein Ticket für die Arcade mit ${GAMES.slice(0, 2).map(g => g.name).join(', ')} und mehr` : '';
    modal(`${APP.heroArt ? `<div style="width:110px;margin:0 auto">${APP.heroArt()}</div>` : ''}<p class="hand">Willkommen!</p><h2>${intro.title || MANIFEST.title}</h2><p>Hier trainierst du alles${when}. Für jedes Level gibt es bis zu 3 Sterne${games}.</p>${intro.tip ? `<p>${intro.tip}</p>` : ''}`,
      [{ label: "Los geht's!", cls: 'go' }]).then(() => Sound.click());
  }
}
boot();
