// App config: wires the Latin vocabulary into the shared engine (see src/core/engine.js).

Object.assign(TYPE_ICON, {
  vmc: TYPE_ICON.mc, vmatch: TYPE_ICON.match, vswipe: TYPE_ICON.swipe,
  vacc: TYPE_ICON.write, vtest: TYPE_ICON.write, plform: TYPE_ICON.write, conj: TYPE_ICON.sort,
  vnom: TYPE_ICON.write, numform: TYPE_ICON.write, debet: TYPE_ICON.mc,
});

const APP = {
  topics: TOPICS,
  art: key => ART[key] || '',
  heroArt: () => ART.galea,
  heroImg: 'img/hero.webp',
  learnExtras: vocabLearnExtras,
  quizTypes: VOCAB_QUIZ_TYPES,
  levelTypes: { vmatch: vocabMatchLevel },
  // The mock test only asks typed answers and conjugation classes, like the real test.
  exam: { mix: { nouns: 6, verbs2: 7, words: 3, verbs1: 5, conj: 4 }, types: ['vtest', 'conj'], writes: 0, art: 'tabula' },
  intro: { title: 'Deine Latein-Arena', tip: 'Tipp: Fang mit „Familie und Haus“ an, und am Ende zeigt dir der Probe-Vokabeltest, ob alles sitzt.' },
  // A Roman runner opens the reward games; the learner loves football, so the other games and trivia come from the football pack.
  praise: ['Optime!', 'Bene!', 'Recte!', 'Euge!', 'Tor!', 'Volltreffer!', 'Stark!', 'Genau so!'],
  trivia: FOOTBALL,
  games: [{ id: 'legion', stars: 5 }, { id: 'penalty', stars: 12 }, { id: 'proquiz', stars: 16 }, { id: 'kickups', stars: 20 }],
  ranks: [
    { xp: 0, name: 'Rekrut' },
    { xp: 150, name: 'Legionär' },
    { xp: 400, name: 'Zenturio' },
    { xp: 800, name: 'Tribun' },
    { xp: 1300, name: 'Senator' },
    { xp: 2000, name: 'Konsul' },
    { xp: 3000, name: 'Imperator' },
  ],
};
