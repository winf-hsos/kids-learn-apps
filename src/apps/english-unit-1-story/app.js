// App config: wires the English vocabulary into the shared engine (see src/core/engine.js).

Object.assign(TYPE_ICON, {
  emc: TYPE_ICON.mc, dmc: TYPE_ICON.mc, gap: TYPE_ICON.mc, ematch: TYPE_ICON.match,
  dtype: TYPE_ICON.write, etype: TYPE_ICON.write, past: TYPE_ICON.write, spell: TYPE_ICON.swipe,
});

const APP = {
  topics: TOPICS,
  art: key => ART[key] || '',
  heroArt: () => ART.book,
  heroImg: 'img/hero.webp',
  learnExtras: vocabLearnExtras,
  quizTypes: VOCAB_QUIZ_TYPES,
  levelTypes: { ematch: vocabMatchLevel },
  // The mock test asks typed answers in both directions from all three parts.
  exam: { mix: { part1: 7, part2: 7, part3: 6 }, types: ['dtype', 'etype'], writes: 0, art: 'trophy' },
  intro: { title: 'Deine Vokabel-Arena', tip: 'Tipp: Fang mit Teil 1 an. Am Ende zeigt dir der Probe-Vokabeltest, ob alle 39 Wörter sitzen.' },
  // The learner loves football, so the reward games and trivia come from the football pack.
  praise: ['Great!', 'Well done!', 'Brilliant!', 'Spot on!', 'Tor!', 'Volltreffer!', 'Perfect!', 'Top!'],
  trivia: FOOTBALL,
  games: [{ id: 'penalty', stars: 5 }, { id: 'proquiz', stars: 10 }, { id: 'kickups', stars: 18 }],
  ranks: [
    { xp: 0, name: 'Newbie' },
    { xp: 150, name: 'Word Rookie' },
    { xp: 400, name: 'Word Hunter' },
    { xp: 800, name: 'Spelling Star' },
    { xp: 1300, name: 'Vocab Pro' },
    { xp: 2000, name: 'Word Wizard' },
    { xp: 3000, name: 'Legend' },
  ],
};
