// App config: wires the irregular verbs into the shared engine (see src/core/engine.js).

Object.assign(TYPE_ICON, {
  vmc: TYPE_ICON.mc, formmc: TYPE_ICON.mc, vmatch: TYPE_ICON.match, vswipe: TYPE_ICON.swipe,
  past: TYPE_ICON.write, pp: TYPE_ICON.write, fill: TYPE_ICON.write, forms: TYPE_ICON.write,
});

const APP = {
  topics: TOPICS,
  art: key => ART[key] || '',
  heroArt: () => ART.book,
  heroImg: 'img/hero.webp',
  learnExtras: verbLearnExtras,
  quizTypes: VERB_QUIZ_TYPES,
  levelTypes: { vmatch: verbMatchLevel },
  // The mock test asks the missing forms (like the worksheet) and all three forms from German.
  exam: { mix: { part1: 5, part2: 5, part3: 5, part4: 5 }, types: ['fill', 'forms'], writes: 0, art: 'trophy' },
  intro: { title: 'Deine Verb-Arena', tip: 'Tipp: Fang mit Teil 1 an. Der Verbtrainer fragt alle 46 Verben gemischt ab, und am Ende zeigt dir der Probe-Vokabeltest, ob alle Formen sitzen.' },
  trainer: {
    title: 'Verbtrainer', unit: 'Verben', unitOne: 'Verb', item: trainerItem,
    intro: 'Der Trainer fragt alle 46 Verben vom Arbeitsblatt ab, mal mit Antworten zum Antippen, mal zum Eintippen der fehlenden Formen, und hört nie auf.',
    cards: () => VERB_IDS,
    label: id => `${rowText(VERB[id])} <small>${deText(VERB[id])}</small>`,
  },
  // The learner loves football, so the reward games and trivia come from the football pack.
  praise: ['Great!', 'Well done!', 'Brilliant!', 'Spot on!', 'Tor!', 'Volltreffer!', 'Perfect!', 'Top!'],
  trivia: FOOTBALL,
  games: [
    { id: 'scorer', stars: 3, name: 'Verb-Torjäger', desc: 'Schieß in das Tor mit der richtigen Antwort. 10 Schüsse, ganz ohne Ticket.' },
    { id: 'penalty', stars: 6 }, { id: 'proquiz', stars: 12 }, { id: 'kickups', stars: 18 },
    { id: 'keeper', stars: 24 }, { id: 'slalom', stars: 30 }, { id: 'blitz', stars: 38 },
  ],
  ranks: [
    { xp: 0, name: 'Newbie' },
    { xp: 150, name: 'Verb Rookie' },
    { xp: 400, name: 'Form Finder' },
    { xp: 800, name: 'Past Master' },
    { xp: 1300, name: 'Verb Pro' },
    { xp: 2000, name: 'Grammar Wizard' },
    { xp: 3000, name: 'Legend' },
  ],
};
