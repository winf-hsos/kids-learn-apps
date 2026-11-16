// App config: wires the town map, the directions and the pets into the shared engine (see src/core/engine.js).

Object.assign(TYPE_ICON, { fig: TYPE_ICON.mc, swrite: TYPE_ICON.write, maptap: ICON.map });

// Learn card blocks of this app: word tiles with pictures, preposition scenes, phrase arrows and the map.
function townLearnExtras(c, mode) {
  const card = mode === 'card';
  if (c.words) return {
    bottom: card
      ? `<div class="wtiles">${c.words.map(k => `<div class="wtile"><img src="img/${k}.webp" alt=""><b>${en(k)} ${sayBtn(en(k))}</b><span>${de(k)}</span></div>`).join('')}</div>`
      : `<ul>${c.words.map(k => `<li><b>${en(k)}</b>: ${de(k)}</li>`).join('')}</ul>`,
  };
  if (c.preps) return {
    bottom: c.preps.map(k => { const p = PREPS.find(x => x.k === k); return `<div class="prep-row">${card ? prepScene(k, ...p.ex) : ''}<div><b>${p.en}</b> = ${p.de}<br><i>${card ? say(p.s) : p.s}</i></div></div>`; }).join(''),
  };
  if (c.phrases) return {
    bottom: PHRASES.map(p => `<div class="prep-row">${card ? `<span class="arrow-art">${arrowArt(p.k)}</span>` : ''}<div><b>${card ? say(p.en) : p.en}</b><br>${p.de}</div></div>`).join(''),
  };
  if (c.map && card) return { top: mapFig({}) };
  if (c.route) return { bottom: `${card ? mapFig({ route: c.route, goal: ROUTES[c.route].goal }) : ''}<p class="tm-dir">${card ? say(routeText(c.route)) : routeText(c.route)}</p>` };
  return {};
}

const APP = {
  topics: TOPICS,
  art: key => WORDS[key] ? `<img class="pic" src="img/${key}.webp" alt="">` : key === 'arrow' ? arrowArt('right') : key === 'map' ? ART.map : '',
  entity: key => WORDS[key] ? { name: en(key), info: de(key) } : null,
  heroArt: () => ART.map,
  heroImg: 'img/hero.webp',
  learnExtras: townLearnExtras,
  // Multiple choice with a picture above the question: the map, a preposition scene, an arrow or a text to read.
  quizTypes: { fig: { keys: lv => lv.items.map((_, i) => i), item: (lv, k, ref) => lv.items[+k] ? mcFrom(lv.items[+k], ref, { fig: lv.items[+k].fig, figClass: 'wide' }) : null } },
  // Short write tasks outside the directions world, so the mock test only asks for written directions.
  levelTypes: { swrite: writeLevel },
  boardKinds: MAP_BOARD,
  exam: { mix: { town: 4, where: 5, ways: 7, pets: 6 }, writes: 2, art: 'map' },
  // All levels are open from the start, so the learner can jump to any topic before the test.
  openLevels: true,
  intro: { title: 'Englisch: In town & Pets', tip: 'Fang mit den Orten an. Am wichtigsten für den Test ist die Welt „Directions“, denn dort übst du, mit dem Stadtplan einen Weg zu beschreiben.' },
  // The learner loves football, so the reward games and trivia come from the football pack.
  praise: ['Great!', 'Well done!', 'Super!', 'Tor!', 'Brilliant!', 'Yes!', 'Perfect!', 'Top!'],
  trivia: FOOTBALL,
  games: [
    { id: 'scorer', stars: 3, name: 'English-Torjäger', desc: 'Schieß in das Tor mit der richtigen Antwort. 10 Schüsse, ganz ohne Ticket.' },
    { id: 'penalty', stars: 5 }, { id: 'kickups', stars: 10 }, { id: 'keeper', stars: 16 },
    { id: 'proquiz', stars: 22 }, { id: 'slalom', stars: 28 }, { id: 'blitz', stars: 35 },
  ],
  ranks: [
    { xp: 0, name: 'New in Town' },
    { xp: 120, name: 'Explorer' },
    { xp: 350, name: 'Map Reader' },
    { xp: 700, name: 'Way Finder' },
    { xp: 1150, name: 'Town Guide' },
    { xp: 1800, name: 'Pet Expert' },
    { xp: 2600, name: 'English Star' },
  ],
};
