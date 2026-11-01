// More answer kinds for quiz items, besides mc, swipe and type (levels.js):
//   order  { q, items: [...in the right order] }               tap the cards in order
//   pairs  { q, pairs: [[left, right], ...] }                    connect left and right
//   groups { q, groups: [name, ...], items: [[text, gi], ...] }  pick the group of each item
//   cloze  { q, s: 'text with ___', answers: [...], o: [...] }  fill the gaps with chips
//   multi  { q, o: [...], right: [index, ...] }                  tick all right options
// Every item may also have img (a picture to the question), hint ({ x, q, img }:
// a tip with its source, using it halves the XP) and x (explanation afterwards).

const BOARD_KINDS = {
  order: {
    body: it => {
      it._cards = shuffle(it.items.map((t, i) => ({ t, i })));
      return `<div class="bd-picked" id="bdPicked"></div><div class="bd-chips">${it._cards.map((c, k) => `<button class="bd-chip" data-k="${k}">${c.t}</button>`).join('')}</div>`;
    },
    bind(it, ready) {
      const picked = [];
      const paint = () => {
        $('#bdPicked').innerHTML = picked.length ? picked.map((k, n) => `<button class="bd-slot" data-n="${n}"><b>${n + 1}.</b> ${it._cards[k].t}</button>`).join('') : '<span class="muted">Tippe die Karten in der richtigen Reihenfolge an.</span>';
        $$('.bd-chip').forEach(b => b.disabled = picked.includes(+b.dataset.k));
        $$('.bd-slot').forEach(b => b.onclick = () => { picked.splice(+b.dataset.n); Sound.click(); paint(); });
        ready(picked.length === it.items.length);
      };
      $$('.bd-chip').forEach(b => b.onclick = () => { picked.push(+b.dataset.k); Sound.click(); paint(); });
      paint();
      return () => {
        const hits = picked.map((k, n) => it._cards[k].i === n);
        $$('.bd-slot').forEach((b, n) => b.classList.add(hits[n] ? 'right' : 'wrong'));
        return hits;
      };
    },
    sol: it => it.items.join(' → '),
  },
  pairs: {
    body: it => {
      it._right = shuffle(it.pairs.map((p, i) => ({ t: p[1], i })));
      return `<div class="bd-pairs"><div class="col">${it.pairs.map((p, i) => `<button class="bd-l" data-i="${i}"><span class="tag"></span>${p[0]}</button>`).join('')}</div>
        <div class="col">${it._right.map((r, k) => `<button class="bd-r" data-k="${k}"><span class="tag"></span>${r.t}</button>`).join('')}</div></div>`;
    },
    bind(it, ready) {
      const link = {}; let sel = null;
      const paint = () => {
        $$('.bd-l').forEach(b => { const i = +b.dataset.i; b.classList.toggle('sel', sel === i); $('.tag', b).textContent = link[i] !== undefined ? i + 1 : ''; });
        $$('.bd-r').forEach(b => { const k = +b.dataset.k, i = Object.keys(link).find(x => link[x] === k); $('.tag', b).textContent = i !== undefined ? +i + 1 : ''; });
        ready(Object.keys(link).length === it.pairs.length);
      };
      $$('.bd-l').forEach(b => b.onclick = () => { sel = +b.dataset.i; delete link[sel]; Sound.click(); paint(); });
      $$('.bd-r').forEach(b => b.onclick = () => {
        if (sel === null) { toast('Erst links antippen', 'Wähle zuerst ein Feld in der linken Spalte.'); return; }
        const k = +b.dataset.k;
        Object.keys(link).forEach(x => { if (link[x] === k) delete link[x]; });
        link[sel] = k; sel = null; Sound.click(); paint();
      });
      paint();
      return () => {
        const hits = it.pairs.map((_, i) => it._right[link[i]].i === i);
        $$('.bd-l').forEach((b, i) => b.classList.add(hits[i] ? 'right' : 'wrong'));
        return hits;
      };
    },
    sol: it => it.pairs.map(p => `${p[0]} – ${p[1]}`).join(' · '),
  },
  groups: {
    body: it => {
      it._items = shuffle(it.items);
      return `<div class="bd-groups">${it._items.map((x, n) => `<div class="bd-grow"><span>${x[0]}</span><div class="seg">${it.groups.map((g, gi) => `<button data-n="${n}" data-g="${gi}">${g}</button>`).join('')}</div></div>`).join('')}</div>`;
    },
    bind(it, ready) {
      const pick = {};
      $$('.bd-grow .seg button').forEach(b => b.onclick = () => {
        pick[b.dataset.n] = +b.dataset.g; Sound.click();
        $$(`.bd-grow .seg button[data-n="${b.dataset.n}"]`).forEach(x => x.classList.toggle('on', x === b));
        ready(Object.keys(pick).length === it.items.length);
      });
      return () => {
        const hits = it._items.map((x, n) => pick[n] === x[1]);
        $$('.bd-grow').forEach((r, n) => r.classList.add(hits[n] ? 'right' : 'wrong'));
        return hits;
      };
    },
    sol: it => it.groups.map((g, gi) => `${g}: ${it.items.filter(x => x[1] === gi).map(x => x[0]).join(', ')}`).join(' · '),
  },
  cloze: {
    body: it => {
      it._chips = shuffle(it.o || it.answers);
      const parts = it.s.split('___');
      return `<div class="bd-cloze">${parts.map((p, n) => p + (n < parts.length - 1 ? `<button class="bd-gap" data-n="${n}">…</button>` : '')).join('')}</div>
        <div class="bd-chips">${it._chips.map((c, k) => `<button class="bd-chip" data-k="${k}">${c}</button>`).join('')}</div>`;
    },
    bind(it, ready) {
      const fill = it.answers.map(() => null);
      const paint = () => {
        $$('.bd-gap').forEach((g, n) => { g.textContent = fill[n] === null ? '…' : it._chips[fill[n]]; g.classList.toggle('filled', fill[n] !== null); });
        $$('.bd-chip').forEach(b => b.disabled = fill.includes(+b.dataset.k));
        ready(fill.every(x => x !== null));
      };
      $$('.bd-chip').forEach(b => b.onclick = () => { const n = fill.indexOf(null); if (n >= 0) { fill[n] = +b.dataset.k; Sound.click(); paint(); } });
      $$('.bd-gap').forEach(g => g.onclick = () => { fill[+g.dataset.n] = null; paint(); });
      paint();
      return () => {
        const hits = fill.map((k, n) => normAnswer(it._chips[k]) === normAnswer(it.answers[n]));
        $$('.bd-gap').forEach((g, n) => g.classList.add(hits[n] ? 'right' : 'wrong'));
        return hits;
      };
    },
    sol: it => it.answers.join(', '),
  },
  multi: {
    body: it => {
      it._order = shuffle(it.o.map((_, i) => i));
      return `<p class="muted" style="margin:0 0 8px">Tippe alle richtigen Antworten an.</p><div class="options">${it._order.map(i => `<button class="opt bd-multi" data-i="${i}"><kbd>✓</kbd><span>${it.o[i]}</span></button>`).join('')}</div>`;
    },
    bind(it, ready) {
      const on = new Set();
      $$('.bd-multi').forEach(b => b.onclick = () => {
        const i = +b.dataset.i; on.has(i) ? on.delete(i) : on.add(i);
        b.classList.toggle('on', on.has(i)); Sound.click(); ready(on.size > 0);
      });
      return () => {
        const hits = it.o.map((_, i) => on.has(i) === it.right.includes(i));
        $$('.bd-multi').forEach(b => { const i = +b.dataset.i; if (it.right.includes(i)) b.classList.add(on.has(i) ? 'right' : 'missed'); else if (on.has(i)) b.classList.add('wrong'); });
        return hits;
      };
    },
    sol: it => it.right.map(i => it.o[i]).join(' · '),
  },
};

// Picture to the question; a tap opens it large.
function mediaHtml(it) {
  return it.img ? `<figure class="qimg"><img src="${it.img}" alt="${esc(it.imgAlt || 'Bild zur Frage')}" data-zoom></figure>` : '';
}
function hintHtml(it) {
  return it.hint && run.mode !== 'exam' ? `<div class="hint-row"><button class="btn small" id="hintBtn" type="button">${ICON.bulb} Tipp</button><div class="hint" id="hint" hidden></div></div>` : '';
}
function bindHint(it) {
  run.hinted = false;
  const b = $('#hintBtn'); if (!b) return;
  b.onclick = () => {
    run.hinted = true; b.disabled = true; Sound.click();
    const h = $('#hint'), t = it.hint;
    h.innerHTML = `<p>${t.x}</p>${t.q ? `<p class="src">Aus: ${t.q}</p>` : ''}${t.img ? `<img src="${t.img}" alt="Bild zum Tipp" data-zoom>` : ''}`;
    h.hidden = false; h.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
}
// A hint halves the reward but keeps the answer correct.
const hintBonus = () => run.hinted ? -5 : 0;

document.addEventListener('click', e => {
  const img = e.target.closest('[data-zoom]'); if (!img) return;
  const z = document.createElement('div');
  z.className = 'zoom'; z.innerHTML = `<img src="${img.src}" alt="${esc(img.alt)}"><button class="btn" type="button">Schließen</button>`;
  z.onclick = () => z.remove();
  document.body.appendChild(z);
});

function boardStep(it, title, top) {
  const kind = BOARD_KINDS[it.kind], exam = run.mode === 'exam';
  openStage(`${top}
    <div class="qtitle">${title} · ${run.i + 1}/${run.total}</div>
    ${mediaHtml(it)}
    <div class="question">${it.q}</div>
    ${kind.body(it)}
    ${hintHtml(it)}
    <div class="type-btns"><button class="btn primary" id="bdCheck" disabled>${exam ? 'Weiter' : 'Prüfen'}</button><button class="btn" id="bdSkip">Weiß ich nicht</button></div>`);
  bindQuit(); bindHint(it);
  let done = false;
  const evaluate = kind.bind(it, ok => { $('#bdCheck').disabled = !ok; });
  const check = skip => {
    if (done) return; done = true;
    const hits = skip ? [false] : evaluate();
    const pts = hits.filter(Boolean).length / hits.length, ok = pts === 1;
    $$('#stage button:not(#quit)').forEach(b => { if (!b.closest('.sheet')) b.disabled = true; });
    if (exam) {
      run.answers.push({ it, ok, pts }); if (ok) run.correct++; else noteMistake(it.ref);
      Sound.click(); return setTimeout(() => { run.i++; quizStep(); }, 350);
    }
    const xp = scoreAnswer(ok, it.ref, hintBonus());
    showSheet(ok, ok ? pick(PRAISE) : pts >= .5 ? 'Fast!' : 'Nicht ganz.', [ok ? '' : `Richtig ist: <b>${kind.sol(it)}</b>${endDot(kind.sol(it))}`, it.x].filter(Boolean).join('<br>'), xp, () => { run.i++; quizStep(); });
  };
  $('#bdCheck').onclick = () => check(false);
  $('#bdSkip').onclick = () => check(true);
}
