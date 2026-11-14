// App config: wires the music worlds into the shared engine (see src/core/engine.js)
// and the music module (src/core/modules/music.js).

Object.assign(TYPE_ICON, {
  nameMc: TYPE_ICON.mc, nameType: TYPE_ICON.write, noteRow: TYPE_ICON.write, place: TYPE_ICON.label,
  ivStaff: TYPE_ICON.mc, ivNamed: TYPE_ICON.mc, ivType: TYPE_ICON.write,
  move: TYPE_ICON.mc, marks: TYPE_ICON.write, extreme: TYPE_ICON.mc, pool: TYPE_ICON.sort, contour: TYPE_ICON.mc,
  startEnd: TYPE_ICON.mc, most: TYPE_ICON.mc, fact: TYPE_ICON.swipe,
  xyFind: ICON.soundOn, xyRow: ICON.soundOn, xyRead: ICON.soundOn, xyEar: ICON.soundOn,
});

const APP = {
  topics: TOPICS,
  art: key => ART[key] || '',
  heroArt: () => ART.clef,
  heroImg: 'img/hero.webp',
  learnExtras: musicLearnExtras,
  quizTypes: MUSIC_QUIZ_TYPES,
  boardKinds: MUSIC_BOARD_KINDS,
  // The teacher's self-check sheet, filled in from the stars of the linked worlds.
  checklist: {
    title: 'Das muss ich für die Klassenarbeit können',
    intro: 'Dein Kompetenzbogen vom Infoblatt. Die Haken setzt die App nach deinen Sternen, tipp eine Zeile an, um zur passenden Welt zu springen.',
    items: [
      { text: 'Ich kann notierte Intervalle bestimmen.', src: 'AB Intervalle – Grobbestimmung, MusiX S. 40', worlds: ['intervals'] },
      { text: 'Ich kann notierte Töne im Violinschlüssel benennen und notieren.', src: 'MusiX S. 36 und 37, AB Notennamen, AB Notenrätsel', worlds: ['notes'] },
      { text: 'Ich kann eine einfache Melodie analysieren.', src: 'Tonvorrat, Tonwiederholung, -schritt, -sprung, Melodieverlauf', worlds: ['analyse'] },
      { text: 'Ich kann eine Melodie beschreiben.', src: 'AB Melodien analysieren und beschreiben', worlds: ['describe'] },
      { text: 'Ich kenne die Töne der Stammtonreihe am Xylophon.', src: 'Mini-Prüfung am Xylophon', worlds: ['xylo'] },
      { text: 'Ich kann eine einfache Melodie nachspielen, die mir vorgespielt wurde.', src: 'Mini-Prüfung am Xylophon', tip: 'Übe in der Welt „Am Xylophon“ das Nachspielen nach Gehör.' },
      { text: 'Ich kann eine einfache Melodie nach Noten spielen.', src: 'Mini-Prüfung am Xylophon', tip: 'Übe in der Welt „Am Xylophon“ das Spielen nach Noten.' },
    ],
  },
  // The mock test covers the written part; the xylophone is tested separately at school.
  exam: {
    mix: { notes: 5, intervals: 4, analyse: 5, describe: 3 },
    types: ['nameMc', 'noteRow', 'place', 'nameType', 'ivStaff', 'ivNamed', 'ivType', 'move', 'extreme', 'pool', 'marks', 'fact', 'startEnd', 'most', 'mix'],
    writes: 1, art: 'trophy',
  },
  intro: { title: 'Dein Musik-Fahrplan', tip: 'Tipp: Oben siehst du den Kompetenzbogen vom Infoblatt. Arbeite die Welten der Reihe nach durch, der Notentrainer fragt zwischendurch Töne und Intervalle gemischt ab, und am Ende zeigt dir die Probe-Klassenarbeit, ob alles sitzt.' },
  trainer: {
    title: 'Notentrainer', unit: 'Karten', unitOne: 'Karte', item: trainerItem,
    intro: 'Der Trainer fragt alle Töne von a bis c‴ und alle acht Intervalle ab, mal zum Antippen, mal zum Eintippen, und hört nie auf.',
    cards: () => [...TRAINER_NOTES, ...INTERVAL_NAMES.map((_, i) => `iv:${i + 1}`)],
    label: id => id.startsWith('iv:') ? `${INTERVAL_NAMES[+id.slice(3) - 1]} <small>${INTERVAL_COUNT[+id.slice(3) - 1]}</small>` : `${noteLabel(id)} <small>${positionText(id)}</small>`,
  },
  // The learner loves football, so the reward games and trivia come from the football pack.
  praise: ['Super!', 'Klasse!', 'Volltreffer!', 'Tor!', 'Stark!', 'Genau!', 'Perfekt!', 'Top!'],
  trivia: FOOTBALL,
  games: [
    { id: 'scorer', stars: 3, name: 'Noten-Torjäger', desc: 'Schieß in das Tor mit der richtigen Antwort. 10 Schüsse, ganz ohne Ticket.' },
    { id: 'penalty', stars: 6 }, { id: 'proquiz', stars: 12 }, { id: 'kickups', stars: 18 },
    { id: 'keeper', stars: 24 }, { id: 'slalom', stars: 30 }, { id: 'blitz', stars: 38 },
  ],
  ranks: [
    { xp: 0, name: 'Notenneuling' },
    { xp: 150, name: 'Notenleser' },
    { xp: 400, name: 'Intervall-Zähler' },
    { xp: 800, name: 'Melodie-Detektiv' },
    { xp: 1300, name: 'Xylophon-Profi' },
    { xp: 2000, name: 'Musik-Experte' },
    { xp: 3000, name: 'Maestro' },
  ],
};
