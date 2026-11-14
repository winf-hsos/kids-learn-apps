// Competence sheet on the start page, modeled on the self-check sheets teachers hand
// out before a test ("Das muss ich können"): one row per competence with the same
// four columns (sicher, überwiegend, teilweise, noch nicht), filled in from the stars
// of the worlds that train it. A tap on a row jumps to its first world.
//
// APP.checklist = { title, intro, items: [{ text, src, worlds: [worldId, ...], tip }] }
// Items without worlds (e.g. playing a real instrument) show their tip instead of a rating.

const CHECK_COLS = ['sicher', 'überwiegend', 'teilweise', 'noch nicht'];

function checkLevel(item) {
  const tis = (item.worlds || []).map(id => WORLDS.findIndex(t => t.id === id)).filter(ti => ti >= 0);
  if (!tis.length) return null;
  let got = 0, max = 0;
  tis.forEach(ti => WORLDS[ti].levels.forEach((lv, l) => { got += starsOf(ti, l); max += maxStarsOf(lv); }));
  const r = max ? got / max : 0;
  return { ti: tis[0], col: r >= .85 ? 0 : r >= .5 ? 1 : r > 0 ? 2 : 3, pct: Math.round(r * 100) };
}

function checklistHtml() {
  const cl = APP.checklist; if (!cl) return '';
  return `<section class="checklist">
    <div class="cl-head"><h2>${cl.title || 'Das muss ich können'}</h2>${cl.intro ? `<p>${cl.intro}</p>` : ''}</div>
    <div class="cl-cols" aria-hidden="true"><span></span>${CHECK_COLS.map(c => `<span>${c}</span>`).join('')}</div>
    ${cl.items.map((it, i) => {
      const lv = checkLevel(it);
      return `<button class="cl-row${lv ? '' : ' cl-free'}" ${lv ? `data-world="${lv.ti}"` : ''}>
        <span class="cl-text"><b>${i + 1}.</b> ${it.text}${it.src ? `<small>${it.src}</small>` : ''}${!lv && it.tip ? `<em>${it.tip}</em>` : ''}</span>
        ${CHECK_COLS.map((c, k) => `<span class="cl-box${lv && lv.col === k ? ' on c' + k : ''}" aria-label="${c}">${lv && lv.col === k ? '✓' : ''}</span>`).join('')}
      </button>`;
    }).join('')}
  </section>`;
}

document.addEventListener('click', e => {
  const row = e.target.closest('.cl-row[data-world]'); if (!row) return;
  const w = document.querySelectorAll('#main .world')[+row.dataset.world];
  if (w) { Sound.click(); w.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});
