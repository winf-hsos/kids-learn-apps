// App config: wires the chemistry content into the shared engine (see src/core/engine.js).

const APP = {
  topics: TOPICS,
  art,
  entity: key => DEVICES[key] && { name: DEVICES[key].name, info: DEVICES[key].use },
  heroArt: heroFlameSvg,
  xpIcon: TYPE_ICON.sim,
  memoryBack: TYPE_ICON.sim,
  learnExtras: chemLearnExtras,
  quizTypes: { ghsquiz: GHS_QUIZ },
  levelTypes: { label: labelLevel, sim: simLevel },
  exam: { mix: { safety: 3, rules: 4, devices: 4, burner: 4, hazards: 3 }, writes: 2, art: 'stift' },
  intro: { title: 'Dein Chemie-Labor', tip: 'Tipp: Starte mit der Welt „Sicherheit im Fachraum“.' },
  // Max loves football, so the praise and the reward games lean that way.
  praise: ['Richtig!', 'Volltreffer!', 'Stark!', 'Tor!', 'Genau so!', 'Top!', 'Wie ein Profi!', 'Traumpass!', 'Sauber!'],
  trivia: FOOTBALL,
  games: [{ id: 'runner', stars: 5 }, { id: 'penalty', stars: 12 }, { id: 'kickups', stars: 20 }, { id: 'proquiz', stars: 30 }],
  ranks: [
    { xp: 0, name: 'Laborneuling' },
    { xp: 150, name: 'Reagenzglas-Rookie' },
    { xp: 400, name: 'Spatel-Spezialist' },
    { xp: 800, name: 'Brenner-Bändiger' },
    { xp: 1300, name: 'Chemie-Kapitän' },
    { xp: 2000, name: 'Laborleiter' },
    { xp: 3000, name: 'Professor Max' },
  ],
};
