// Worlds of the English app. Never reorder worlds or levels once published,
// progress is stored per world id and level position; append new ones at the end.

const vocabLevels = words => [
  { type: 'learn', title: 'Lernkarten' },
  { type: 'emc', title: 'Was heißt das?', words, n: 10 },
  { type: 'ematch', title: 'Paare finden', words, prompt: 'Verbinde jedes englische Wort mit seiner Bedeutung.' },
  { type: 'dmc', title: 'Wie heißt das auf Englisch?', words, n: 10 },
  { type: 'gap', title: 'Lückensätze', words, n: 10 },
  { type: 'etype', title: 'Englisch → Deutsch', words, n: 10 },
  { type: 'dtype', title: 'Deutsch → Englisch', words },
];

const TOPICS = [
  {
    id: 'part1', img: 'img/part1.webp', title: 'Teil 1: to smile bis to rush', sub: 'Die ersten 13 Wörter auf S. 218', art: 'smile', badge: 'Smiley',
    learn: [
      { h: 'So lernst du für Montag', p: 'Jede Welt hat 13 Wörter in der Reihenfolge aus dem Buch. Erst die Lernkarten, dann wird geübt, am Ende tippst du die Wörter auf Englisch. Mit dem Lautsprecher hörst du, wie man ein Wort ausspricht.', bullets: ['Bei Verben darfst du „to“ mitschreiben, musst aber nicht.', 'Auf Deutsch reicht eine der Bedeutungen.', 'Auf Englisch zählt jeder Buchstabe, wie im Test.'] },
      { h: 'Wörter 1 bis 7', words: PART[0].slice(0, 7) },
      { h: 'Wörter 8 bis 13', words: PART[0].slice(7) },
    ],
    levels: vocabLevels(PART[0]),
  },
  {
    id: 'part2', img: 'img/part2.webp', title: 'Teil 2: through bis to break', sub: 'Die nächsten 13 Wörter, S. 218 und 219', art: 'bubble', badge: 'Schweigebrecher',
    learn: [
      { h: 'Wörter 14 bis 20', words: PART[1].slice(0, 7) },
      { h: 'Wörter 21 bis 26', words: PART[1].slice(7) },
    ],
    levels: vocabLevels(PART[1]),
  },
  {
    id: 'part3', img: 'img/part3.webp', title: 'Teil 3: to rub bis to roll', sub: 'Die letzten 13 Wörter, S. 219 und 220', art: 'clapper', badge: 'Movie Star',
    learn: [
      { h: 'Wörter 27 bis 33', words: PART[2].slice(0, 7) },
      { h: 'Wörter 34 bis 39', words: PART[2].slice(7) },
    ],
    levels: vocabLevels(PART[2]),
  },
  {
    id: 'mix', img: 'img/mix.webp', title: 'Alles für den Test', sub: 'Stolperfallen, Vergangenheit und alle 39 Wörter gemischt', art: 'trophy', badge: 'Vocab Champion',
    learn: [
      { h: 'Unregelmäßige Formen', p: 'Diese Verben bilden die Vergangenheit nicht mit -ed:', bullets: ['to break – <b>broke</b> (I broke my arm.)', 'to steal – <b>stole</b>', 'can – <b>could</b> (konnte)', 'to come up with – <b>came</b> up with', 'to set up – <b>set</b> up, to let sb down – <b>let</b> sb down: Hier ändert sich nichts.'] },
      { h: 'Achtung, Schreibweise', bullets: ['<b>definitely</b>: defin-ITE-ly, nicht „definately“', '<b>disappear</b> und <b>disappointed</b>: ein s, zwei p', '<b>through</b>: th am Anfang, gh am Ende', '<b>awkward</b>: aw-k-ward', '<b>rub</b> – ru<b>bb</b>ed: Nach kurzem Vokal wird verdoppelt.', '<b>realise</b> (britisch) oder <b>realize</b> (amerikanisch), beides ist richtig.'] },
      { h: 'Ein Wort, zwei Bedeutungen', bullets: ['<b>as</b> heißt „wie“ (I watched them as they came in.) und „während; indem“ (She smiled as she opened the door.).', '<b>thought</b> ist der Gedanke, aber auch die Vergangenheit von to think.', '<b>movie</b> sagt man in Amerika, in Großbritannien heißt es film.', '<b>to miss</b> heißt verpassen, kann aber auch vermissen heißen.', '<b>It’s up to you.</b> und <b>What’s the matter?</b> lernst du als ganze Sätze, mit Apostroph.'] },
    ],
    levels: [
      { type: 'learn', title: 'Stolperfallen' },
      { type: 'spell', title: 'Richtig geschrieben?', words: ALL_IDS, n: 14 },
      { type: 'past', title: 'Vergangenheit', words: ALL_IDS, n: 12 },
      { type: 'gap', title: 'Lückensätze gemischt', words: ALL_IDS, n: 15 },
      { type: 'etype', title: 'Englisch → Deutsch gemischt', words: ALL_IDS, n: 15 },
      { type: 'dtype', title: 'Deutsch → Englisch gemischt', words: ALL_IDS, n: 20 },
    ],
  },
];
