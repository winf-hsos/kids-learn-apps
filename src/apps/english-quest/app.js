// App config: wires English Quest into the shared engine (see src/core/engine.js).

const HEADPHONES = '<svg viewBox="0 0 24 24"><path d="M4 15v-3a8 8 0 0 1 16 0v3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><rect x="3" y="14" width="5" height="7" rx="2" fill="currentColor"/><rect x="16" y="14" width="5" height="7" rx="2" fill="currentColor"/></svg>';
Object.assign(TYPE_ICON, {
  vmc: TYPE_ICON.mc, vdmc: TYPE_ICON.mc, ivmc: TYPE_ICON.mc, ivblitz: ICON.bolt, sigt: TYPE_ICON.mc, mcg: TYPE_ICON.mc, rd: TYPE_ICON.mc, beq: TYPE_ICON.mc,
  vtype: TYPE_ICON.write, ivpast: TYPE_ICON.write, ivbase: TYPE_ICON.write, reg: TYPE_ICON.write, sig: TYPE_ICON.write, q: TYPE_ICON.write, bq: TYPE_ICON.write,
  sa: TYPE_ICON.write, ty: TYPE_ICON.write, tr: TYPE_ICON.write, wneg: TYPE_ICON.write, story: TYPE_ICON.write, besp: TYPE_ICON.write, dice: TYPE_ICON.write,
  vpairs: TYPE_ICON.match, ord: TYPE_ICON.order, tf: HEADPHONES, tfset: HEADPHONES, dict: HEADPHONES,
});

// Learn cards: words, verbs, the British and American word list, rule tables,
// example sentences and wrong and right forms, each with listen buttons on the cards.
function eqLearnExtras(c, mode) {
  const say = t => mode === 'card' ? sayBtn(t) : '';
  const plain = h => h.replace(/<[^>]+>/g, '');
  let top = '', bottom = '';
  if (c.ex) top += c.ex.map(x => `<p class="ex">${x}${say(plain(x))}</p>`).join('');
  if (c.table) top += `<table class="rtab"><tbody>${c.table.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  if (c.bad) top += `<div class="badgood">${c.bad.map(x => `<span class="bad-ex">✗ ${x}</span>`).join('')}${(c.good || []).map(x => `<span class="good-ex">✓ ${x}</span>`).join('')}</div>`;
  if (c.words) bottom += `<table class="vtab"><tbody>${c.words.map(id => { const v = VOCAB_BY_ID[id]; return `<tr><td class="en">${v.en}${say(v.en)}</td><td>${v.de}${v.n ? `<small>${v.n}</small>` : ''}</td></tr>`; }).join('')}</tbody></table>`;
  if (c.verbs) bottom += `<table class="vtab verbs"><tbody>${c.verbs.map(id => { const v = VERB_BY_ID[id]; return `<tr><td class="en">${v.base}</td><td class="en past">${v.past}${say(verbSay(v))}</td><td>${v.de}</td></tr>`; }).join('')}</tbody></table>`;
  if (c.beae) bottom += `<table class="vtab"><tbody><tr><th>britisch</th><th>amerikanisch</th><th></th></tr>${BEAE.map(([be, ae, de]) => `<tr><td class="en">${be}${say(be)}</td><td class="en">${ae}${say(ae)}</td><td>${de}</td></tr>`).join('')}</tbody></table>`;
  return { top, bottom };
}

const APP = {
  topics: TOPICS,
  art: key => ART[key] || '',
  heroArt: () => ART.glass,
  heroImg: 'img/hero.webp',
  learnExtras: eqLearnExtras,
  quizTypes: EQ_QUIZ_TYPES,
  // The mock test follows the old one: a listening text, questions and short answers,
  // negation and error spotting, a few story sentences, vocabulary and irregular verbs.
  exam: {
    mix: { listening: 1, grammar2: 8, grammar3: 9, stories: 3, vocab1: 3, vocab2: 3, vocab3: 2, verbs: 4 },
    types: ['tfset', 'q', 'sa', 'mcg', 'ty', 'tr', 'story', 'vtype', 'ivpast'], writes: 0, art: 'file',
  },
  intro: { title: 'Willkommen bei English Quest', tip: 'Tipp: Fang mit den Vokabeln an und nimm dir dann die Grammatik vor. Am Ende zeigt dir die Probe-Englischarbeit, was schon sitzt.' },
  // The learner loves football, so the reward games and trivia come from the football pack.
  praise: ['Great!', 'Well done!', 'Brilliant!', 'Elementary!', 'Case closed!', 'Spot on!', 'Volltreffer!', 'Top!'],
  trivia: FOOTBALL,
  games: [{ id: 'penalty', stars: 6 }, { id: 'proquiz', stars: 15 }, { id: 'kickups', stars: 25 }],
  // The ranks of the old app with the same XP steps, so the learner keeps the rank.
  ranks: [
    { xp: 0, name: 'New Kid' },
    { xp: 100, name: 'Year 7 Rookie' },
    { xp: 250, name: 'TTS Student' },
    { xp: 500, name: 'Club Member' },
    { xp: 800, name: 'Best Buddy' },
    { xp: 1200, name: 'Autumn Fair Helper' },
    { xp: 1700, name: 'Comedy Show Star' },
    { xp: 2300, name: 'Heathrow Pilot' },
    { xp: 3000, name: 'Greenwich Legend' },
    { xp: 4000, name: 'Simple Past Master' },
    { xp: 5500, name: 'Sherlock Genius' },
  ],
  // Progress of the earlier English Quest app. Its backup codes start with "EQ" and its
  // saved TXT files with "English Quest", so the prefix is just "E"; decode finds the code.
  legacy: { key: findLegacyKey(), prefix: 'E', decode: decodeLegacyCode, convert: convertLegacy },
};
