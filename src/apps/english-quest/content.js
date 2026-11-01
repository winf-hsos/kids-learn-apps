// Worlds of English Quest, in the order of the earlier app: vocabulary, irregular
// verbs, grammar, gap stories, listening, reading and extras. Never reorder worlds
// or levels once published, progress is stored per world id and level position;
// append new ones at the end.

const WB = vocabOf(['wb']), HOL = vocabOf(['hol']), U1 = vocabOf(['u1']);
const S1 = vocabOf(['s1']), S2 = vocabOf(['s2', 's2x']), S3 = vocabOf(['s3']);

// Learn cards with word tables of about a dozen words each.
function wordCards(ids, label) {
  const n = Math.ceil(ids.length / 12), size = Math.ceil(ids.length / n);
  return Array.from({ length: n }, (_, i) => ({ h: n > 1 ? `${label} (${i + 1}/${n})` : label, words: ids.slice(i * size, (i + 1) * size) }));
}

const VOCAB_INTRO = {
  h: 'So lernst du die Vokabeln',
  p: 'Die Wörter stehen in derselben Reihenfolge wie im Vokabelteil deines Buchs. Schau dir zuerst die Lernkarten an, und mit dem Lautsprecher hörst du, wie man ein Wort ausspricht.',
  bullets: ['Bei Verben darfst du „to“ mitschreiben, musst aber nicht.', 'Auf Englisch zählt jeder Buchstabe, so wie in der Arbeit.', 'Wörter, die du falsch hattest, landen in der Fehlerkiste und kommen dort wieder.'],
};

const RULES = {
  when: { h: 'Wann benutze ich das Simple Past?', p: 'Für Dinge, die in der Vergangenheit passiert und <b>abgeschlossen</b> sind. Typische Signalwörter sind <i>yesterday</i>, <i>last week / month / year / Friday</i>, <i>two days ago</i> und <i>in 2025</i>.', ex: ['Mrs Wilson <b>talked</b> to her class <u>yesterday</u>.'] },
  regular: { h: 'Regelmäßige Verben: + ed', table: [['Normalfall', 'talk → talk<b>ed</b>, want → want<b>ed</b>'], ['endet auf -e, dann nur -d', 'like → like<b>d</b>, move → move<b>d</b>'], ['kurzer Vokal + 1 Konsonant, dann verdoppeln', 'plan → pla<b>nned</b>, stop → sto<b>pped</b>'], ['Konsonant + y wird zu -ied', 'try → tr<b>ied</b>, cry → cr<b>ied</b>'], ['Vokal + y, dann einfach -ed', 'play → play<b>ed</b>, stay → stay<b>ed</b>']] },
  irregular: { h: 'Unregelmäßige Verben', p: 'Für sie gibt es keine Regel, deshalb lernst du sie auswendig: go → went, see → saw, take → took, have → had, think → thought …' },
  negation: { h: 'Verneinung: didn’t + Grundform', p: 'Die Verneinung ist für alle Personen gleich: I / you / he / she / it / we / they <b>didn’t</b> + Grundform. didn’t ist die Kurzform von did not.', ex: ['Ty <b>didn’t go</b> to the party.', 'Lily <b>didn’t take</b> the bus.'], bad: ['Ty didn’t went.', 'He didn’t liked it.'], good: ['Ty didn’t go.', 'He didn’t like it.'] },
  questions: { h: 'Fragen: Did + Person + Grundform …?', p: '<b>Did</b> + you / Ryan / the Austins + <b>go</b> swimming / <b>like</b> the film + yesterday?', ex: ['<b>Did</b> you <b>like</b> my pictures?', '<b>Did</b> he <b>wear</b> his school uniform?', 'Mit Fragewort: What <b>did</b> you <b>do</b>? Where <b>did</b> they <b>go</b>?'], bad: ['Did you went to the park?'], good: ['Did you go to the park?'] },
  short: { h: 'Kurzantworten', p: '<b>Yes,</b> + Pronomen + <b>did.</b> oder <b>No,</b> + Pronomen + <b>didn’t.</b> Den Namen ersetzt du durch ein Pronomen.', ex: ['Did Ryan play football? – Yes, <b>he did</b>.', 'Did Lily walk home? – No, <b>she didn’t</b>.'],
    table: [['Ryan, Ty, Josh, Sherlock', 'he'], ['Lily, Ruby, Ava, Mrs Wilson', 'she'], ['the party, the trip, it', 'it'], ['the Austins, the students', 'they'], ['you (eine Person)', 'I'], ['you guys, Karam and you', 'we']], bad: ['Yes, Ryan did.', 'Yes, he played.'] },
  be: { h: 'Sonderfall be: was / were', table: [['I / he / she / it', '<b>was</b> – <b>wasn’t</b>'], ['you / we / they', '<b>were</b> – <b>weren’t</b>']], ex: ['<b>Was</b> Ty’s farewell party a surprise? – Yes, it <b>was</b>.', '<b>Were</b> the students nervous? – No, they <b>weren’t</b>.'], bad: ['Did the trip be long?', 'It didn’t was easy.'], good: ['Was the trip long?', 'It wasn’t easy.'] },
};

const TOPICS = [
  {
    id: 'vocab1', img: 'img/vocab1.webp', title: 'Vokabeln: Welcome back!', sub: 'S. 209–211 mit den Holiday words', art: 'book', badge: 'Weltenbummler',
    learn: [VOCAB_INTRO, ...wordCards(WB, 'Welcome back!, S. 209–210'), ...wordCards(HOL, 'Holiday words, S. 211')],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'vmc', title: 'Was heißt das?', words: WB, n: 10 },
      { type: 'vpairs', title: 'Paare finden', words: WB, n: 6 },
      { type: 'vdmc', title: 'Wie heißt das auf Englisch?', words: WB, n: 10 },
      { type: 'vtype', title: 'Deutsch → Englisch, S. 209', words: WB.slice(0, 24), n: 12 },
      { type: 'vtype', title: 'Deutsch → Englisch, S. 210', words: WB.slice(24), n: 12 },
      { type: 'vmc', title: 'Holiday words', words: HOL, n: 10 },
      { type: 'vtype', title: 'Holiday words schreiben', words: HOL, n: 12 },
    ],
  },
  {
    id: 'vocab2', img: 'img/vocab2.webp', title: 'Vokabeln: Unit 1 – The new boy', sub: 'S. 211–213 mit den Schulfächern', art: 'book', badge: 'Stundenplan-Profi',
    learn: [VOCAB_INTRO, ...wordCards(U1, 'Unit 1, S. 211–213')],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'vmc', title: 'Was heißt das?', words: U1, n: 10 },
      { type: 'vpairs', title: 'Paare finden', words: U1, n: 6 },
      { type: 'vdmc', title: 'Wie heißt das auf Englisch?', words: U1, n: 10 },
      { type: 'vtype', title: 'Deutsch → Englisch, Teil 1', words: U1.slice(0, 20), n: 12 },
      { type: 'vtype', title: 'Deutsch → Englisch, Teil 2', words: U1.slice(20), n: 12 },
    ],
  },
  {
    id: 'vocab3', img: 'img/vocab3.webp', title: 'Vokabeln: Stations 1–3', sub: 'S. 213–217, von accent bis during', art: 'book', badge: 'Station Master',
    learn: [VOCAB_INTRO, ...wordCards(S1, 'Station 1, S. 213–216'), ...wordCards(S2, 'Station 2 und Wortkasten, S. 216'), ...wordCards(S3, 'Station 3, S. 217')],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'vmc', title: 'Station 1: Was heißt das?', words: S1, n: 10 },
      { type: 'vtype', title: 'Station 1 schreiben, Teil 1', words: S1.slice(0, 25), n: 12 },
      { type: 'vtype', title: 'Station 1 schreiben, Teil 2', words: S1.slice(25), n: 12 },
      { type: 'vmc', title: 'Station 2: Was heißt das?', words: S2, n: 10 },
      { type: 'vtype', title: 'Station 2 schreiben', words: S2, n: 12 },
      { type: 'vmc', title: 'Station 3: Was heißt das?', words: S3, n: 10 },
      { type: 'vtype', title: 'Station 3 schreiben', words: S3, n: 12 },
      { type: 'vdmc', title: 'Alle Stations gemischt', words: [...S1, ...S2, ...S3], n: 12 },
    ],
  },
  {
    id: 'verbs', img: 'img/verbs.webp', title: 'Unregelmäßige Verben', sub: 'Die 22 Verben aus deinem Heft, von feel bis understand', art: 'bolt', badge: 'Verb-König',
    learn: [
      { h: 'Unregelmäßige Verben', p: 'Für unregelmäßige Formen gibt es keine Regel, du musst sie auswendig lernen. <b>want</b> und <b>try</b> sind regelmäßig, aber achte auf die Schreibung: tr<b>ied</b>.', verbs: VERBS.slice(0, 11).map(v => v.id) },
      { h: 'Verben 12 bis 22', verbs: VERBS.slice(11).map(v => v.id) },
    ],
    levels: [
      { type: 'learn', title: 'Verbliste' },
      { type: 'ivmc', title: 'Simple Past auswählen', n: 10 },
      { type: 'ivpast', title: 'Simple Past bilden, Teil 1', range: [0, 11] },
      { type: 'ivpast', title: 'Simple Past bilden, Teil 2', range: [11, 22] },
      { type: 'ivbase', title: 'Grundform finden', n: 11 },
      { type: 'ivblitz', title: 'Verb-Blitz', n: 12, timer: 6 },
    ],
  },
  {
    id: 'grammar1', img: 'img/grammar1.webp', title: 'Grammatik: Simple Past bilden', sub: 'Regelmäßige Formen und Signalwörter', art: 'file', badge: 'Zeitreisender',
    learn: [RULES.when, RULES.regular, RULES.irregular],
    levels: [
      { type: 'learn', title: 'Regeln' },
      { type: 'reg', title: 'Regelmäßig: -ed und -d', rules: ['ed', 'd'], n: 10 },
      { type: 'reg', title: 'Verdoppeln und -ied', rules: ['dbl', 'ied', 'yed'], n: 10 },
      { type: 'sigt', title: 'Present oder Past?', n: 10 },
      { type: 'sig', title: 'Signalwörter: die richtige Form', n: 10 },
    ],
  },
  {
    id: 'grammar2', img: 'img/grammar2.webp', title: 'Grammatik: Fragen und Kurzantworten', sub: 'Fragen mit did und was/were und die passenden Kurzantworten', art: 'glass', badge: 'Fragenprofi',
    learn: [RULES.questions, RULES.short, RULES.be],
    levels: [
      { type: 'learn', title: 'Regeln' },
      { type: 'q', title: 'Fragen mit did, Teil 1', range: [0, 10] },
      { type: 'q', title: 'Fragen mit did, Teil 2', range: [10, 20] },
      { type: 'bq', title: 'Fragen mit was/were' },
      { type: 'sa', title: 'Kurzantworten mit did', range: [0, 16], n: 10 },
      { type: 'sa', title: 'Kurzantworten mit was/were', range: [16, 22] },
    ],
  },
  {
    id: 'grammar3', img: 'img/grammar3.webp', title: 'Grammatik: Verneinung und Fehler-Detektiv', sub: 'didn’t + Grundform, typische Fehler und der Satzbauer', art: 'glass', badge: 'Fehler-Detektiv',
    learn: [RULES.negation, { h: 'Typische Fehler', p: 'Nach did und didn’t steht immer die Grundform, und bei be brauchst du kein did.', bad: ['Did you went to the park?', 'Ty didn’t understood the words.', 'The trip didn’t be easy.', 'Yes, she felt.'], good: ['Did you go to the park?', 'Ty didn’t understand the words.', 'The trip wasn’t easy.', 'Yes, she did.'] }],
    levels: [
      { type: 'learn', title: 'Regeln' },
      { type: 'mcg', title: 'Fehler-Detektiv' },
      { type: 'ord', title: 'Satzbauer', n: 10 },
      { type: 'tr', title: 'Positiv → Negativ', n: 10 },
      { type: 'ty', title: 'Ty’s Wochenende', n: 10 },
      { type: 'wneg', title: 'Schreibwerkstatt' },
    ],
  },
  {
    id: 'stories', img: 'img/stories.webp', title: 'Lückentexte', sub: 'Sieben Geschichten rund um Ty, Ryan, Lily und Sherlock', art: 'book', badge: 'Geschichtenerzähler',
    learn: [{ h: 'So funktionieren die Lückentexte', p: 'Jede Geschichte ist ein Level, und jeder Satz mit Lücken ist eine Aufgabe. In Klammern steht das Verb in der Grundform, das du ins Simple Past setzt.',
      bullets: ['Steht „not …“ in der Klammer, brauchst du die Verneinung mit didn’t: (not go) wird zu didn’t go.', 'Steht zum Beispiel „you / have“ in der Klammer, bildest du eine Frage: Did you have …?', 'Steht gar nichts dabei, fehlt das Hilfsverb einer Kurzantwort, also did oder didn’t.', 'Der Satz davor steht grau darüber, damit du weißt, worum es gerade geht.'] }],
    levels: [{ type: 'learn', title: 'So geht’s' }, ...STORIES.map(st => ({ type: 'story', title: st.title, story: st.id }))],
  },
  {
    id: 'listening', img: 'img/listening.webp', title: 'Hören', sub: 'Fünf Hörtexte und ein Diktat, vorgelesen von deinem Browser', art: 'phones', badge: 'Gute Ohren',
    learn: [{ h: 'So übst du Hören', p: 'Die Texte liest dir die Sprachausgabe deines Browsers vor, Dialoge mit zwei Stimmen.',
      bullets: ['Lies zuerst die Aussage, dann drück auf Abspielen.', 'In den ersten Leveln darfst du so oft hören, wie du willst. Im Hörtest am Ende hörst du jeden Text nur zweimal, so wie in der Arbeit.', 'Nach jeder Antwort kannst du den Hörtext auch lesen.', 'Hörst du nichts, dann prüf den Ton und probier Chrome, Edge oder Safari.'] }],
    levels: [
      { type: 'learn', title: 'So geht’s' },
      ...LISTENING.map(L => ({ type: 'tf', title: L.title, text: L.id })),
      { type: 'dict', title: 'Hör-Diktat', n: 8 },
      { type: 'tfset', title: 'Hörtest wie in der Arbeit' },
    ],
  },
  {
    id: 'reading', img: 'img/reading.webp', title: 'Text-Check', sub: 'Fragen zu den Buchtexten auf S. 15, 20 und 22', art: 'book', badge: 'Bücherwurm',
    learn: [{ h: 'So geht der Text-Check', p: 'Lies die Texte im Schülerbuch noch einmal und beantworte dann die Fragen. Du darfst auch nachschauen, denn so lernst du den Inhalt am besten.',
      list: Object.entries(READING_TEXTS).map(([p, t]) => ({ art: 'book', t: `S. ${p}`, d: t })) }],
    levels: [
      { type: 'learn', title: 'So geht’s' },
      { type: 'rd', title: `S. 15: ${READING_TEXTS[15]}`, page: 15 },
      { type: 'rd', title: `S. 20: ${READING_TEXTS[20]}`, page: 20 },
      { type: 'rd', title: `S. 22: ${READING_TEXTS[22]}`, page: 22 },
      { type: 'rd', title: 'Alle Texte gemischt', n: 10 },
    ],
  },
  {
    id: 'extras', img: 'img/extras.webp', title: 'British vs. American', sub: 'biscuit oder cookie? Dazu Sätze aus dem Würfelspiel', art: 'file', badge: 'Transatlantiker',
    learn: [{ h: 'British vs. American English', p: 'In Großbritannien und in Amerika sagt man manches anders. Ty kommt aus New York und lernt in London die britischen Wörter.', beae: true },
      { h: 'Andere Schreibweise', p: 'Manche Wörter schreibt man in Amerika ohne u oder mit -er am Ende, in Großbritannien mit u oder mit -re.', table: SPELLING.map(([us, gb]) => [`amerikanisch ${us}`, `britisch <b>${gb}</b>`]) }],
    levels: [
      { type: 'learn', title: 'Wortliste' },
      { type: 'match', title: 'Paare finden', prompt: 'Verbinde jedes britische Wort mit dem amerikanischen Wort, das dasselbe bedeutet.', pairs: BEAE.map(([be, ae]) => ({ a: be, b: ae })) },
      { type: 'beq', title: 'British oder American?', n: 10 },
      { type: 'besp', title: 'Britisch schreiben' },
      { type: 'dice', title: 'Würfel-Sätze', n: 10 },
    ],
  },
];
