// Learning content for a grade 6 Latin vocabulary test: lesson 2 of the textbook
// plus the verbs from "Salve" and lesson 1 whose infinitives lesson 2 lists.
// Source: textbook vocabulary pages 152-153. UI text is German on purpose.

// ---------------------------------------------------------------------------
// Nouns: nominative (la), the book's middle column (acc, usually accusative
// singular) with gender (g), German meanings (de) and an optional note.
// ---------------------------------------------------------------------------
const NOUNS = {
  soror:       { la: 'soror', acc: 'sorōrem', g: 'f.', de: ['Schwester'] },
  puer:        { la: 'puer', acc: 'puerum', g: 'm.', de: ['Kind', 'Junge'] },
  puella:      { la: 'puella', acc: 'puellam', g: 'f.', de: ['Mädchen'] },
  frater:      { la: 'frāter', acc: 'frātrem', g: 'm.', de: ['Bruder'] },
  vir:         { la: 'vir', acc: 'virum', g: 'm.', de: ['Mann'] },
  liberi:      { la: 'līberī', acc: 'līberōs', g: 'm. Pl.', de: ['Kinder'], note: 'kommt nur im Plural vor, deshalb steht in der Mitte der Akkusativ Plural' },
  parentes:    { la: 'parentēs', acc: 'parentēs', g: 'm. Pl.', de: ['Eltern'], note: 'nur Plural, Akkusativ wie Nominativ' },
  atrium:      { la: 'ātrium', acc: 'ātrium', g: 'n.', de: ['Atrium'], note: 'Neutrum: Akkusativ wie Nominativ' },
  peristylium: { la: 'peristȳlium', acc: 'peristȳlium', g: 'n.', de: ['Peristyl'], note: 'Neutrum: Akkusativ wie Nominativ' },
  culina:      { la: 'culīna', acc: 'culīnam', g: 'f.', de: ['Küche'] },
  otium:       { la: 'ōtium', acc: 'ōtium', g: 'n.', de: ['Ruhe', 'Freizeit'], note: 'Neutrum: Akkusativ wie Nominativ' },
  officium:    { la: 'officium', acc: 'officium', g: 'n.', de: ['Pflicht'], note: 'Neutrum: Akkusativ wie Nominativ; englisch office (Büro)' },
  labor:       { la: 'labor', acc: 'labōrem', g: 'm.', de: ['Mühe', 'Arbeit'], note: 'davon kommt das Labor' },
};

// ---------------------------------------------------------------------------
// Verbs: infinitive, 3rd person singular and plural, conjugation class and the
// German meanings as [infinitive, 3rd sg., 3rd pl.] (pronouns are added later).
// alt holds extra answers that are accepted but not shown.
// ---------------------------------------------------------------------------
const VERBS = {
  amare:      { inf: 'amāre', sg: 'amat', pl: 'amant', conj: 'a', de: [['lieben', 'liebt', 'lieben'], ['mögen', 'mag', 'mögen']] },
  respondere: { inf: 'respondēre', sg: 'respondet', pl: 'respondent', conj: 'e', de: [['antworten', 'antwortet', 'antworten']] },
  conspicere: { inf: 'cōnspicere', sg: 'cōnspicit', pl: 'cōnspiciunt', conj: 'mixed', de: [['erblicken', 'erblickt', 'erblicken'], ['sehen', 'sieht', 'sehen']] },
  fugere:     { inf: 'fugere', sg: 'fugit', pl: 'fugiunt', conj: 'mixed', de: [['fliehen', 'flieht', 'fliehen'], ['meiden', 'meidet', 'meiden']] },
  capere:     { inf: 'capere', sg: 'capit', pl: 'capiunt', conj: 'mixed', de: [['fangen', 'fängt', 'fangen'], ['ergreifen', 'ergreift', 'ergreifen']] },
  debere:     { inf: 'dēbēre', sg: 'dēbet', pl: 'dēbent', conj: 'e', de: [['müssen', 'muss', 'müssen']], ex: 'Servī labōrāre dēbent. Sklaven müssen arbeiten.' },
  nondebere:  { inf: 'nōn dēbēre', sg: 'nōn dēbet', pl: 'nōn dēbent', conj: 'e', noConj: true, de: [['nicht dürfen', 'darf nicht', 'dürfen nicht']] },
  cupere:     { inf: 'cupere', sg: 'cupit', pl: 'cupiunt', conj: 'mixed', de: [['wollen', 'will', 'wollen'], ['wünschen', 'wünscht', 'wünschen'], ['mögen', 'mag', 'mögen']], ex: 'Lūdere cupiunt. Sie möchten spielen.' },
  explere:    { inf: 'explēre', sg: 'explet', pl: 'explent', conj: 'e', de: [['erfüllen', 'erfüllt', 'erfüllen']] },
  dicere:     { inf: 'dīcere', sg: 'dīcit', pl: 'dīcunt', conj: 'cons', de: [['sagen', 'sagt', 'sagen']] },
  incipere:   { inf: 'incipere', sg: 'incipit', pl: 'incipiunt', conj: 'mixed', de: [['anfangen', 'fängt an', 'fangen an'], ['beginnen', 'beginnt', 'beginnen']], ex: 'Līberī rīdēre incipiunt. Die Kinder fangen an zu lachen.' },
  placere:    { inf: 'placēre', sg: 'placet', pl: 'placent', conj: 'e', de: [['gefallen', 'gefällt', 'gefallen'], ['Spaß machen', 'macht Spaß', 'machen Spaß']] },
  pergere:    { inf: 'pergere', sg: 'pergit', pl: 'pergunt', conj: 'cons', de: [['etw. weiter tun', 'tut etw. weiter', 'tun etw. weiter'], ['fortsetzen', 'setzt fort', 'setzen fort']], alt: [['weitermachen', 'macht weiter', 'machen weiter']], ex: 'Līberī lūdere pergunt. Die Kinder spielen weiter.' },
  // From "Salve"
  esse:       { inf: 'esse', sg: 'est', pl: 'sunt', conj: 'irr', noConj: true, de: [['sein', 'ist', 'sind']] },
  clamare:    { inf: 'clāmāre', sg: 'clāmat', pl: 'clāmant', conj: 'a', de: [['rufen', 'ruft', 'rufen']] },
  venire:     { inf: 'venīre', sg: 'venit', pl: 'veniunt', conj: 'i', de: [['kommen', 'kommt', 'kommen']] },
  laborare:   { inf: 'labōrāre', sg: 'labōrat', pl: 'labōrant', conj: 'a', de: [['arbeiten', 'arbeitet', 'arbeiten']] },
  ludere:     { inf: 'lūdere', sg: 'lūdit', pl: 'lūdunt', conj: 'cons', de: [['spielen', 'spielt', 'spielen']] },
  cantare:    { inf: 'cantāre', sg: 'cantat', pl: 'cantant', conj: 'a', de: [['singen', 'singt', 'singen']] },
  gaudere:    { inf: 'gaudēre', sg: 'gaudet', pl: 'gaudent', conj: 'e', de: [['sich freuen', 'freut sich', 'freuen sich']] },
  currere:    { inf: 'currere', sg: 'currit', pl: 'currunt', conj: 'cons', de: [['laufen', 'läuft', 'laufen']] },
  // From lesson 1
  exspectare: { inf: 'exspectāre', sg: 'exspectat', pl: 'exspectant', conj: 'a', de: [['erwarten', 'erwartet', 'erwarten']] },
  audire:     { inf: 'audīre', sg: 'audit', pl: 'audiunt', conj: 'i', de: [['hören', 'hört', 'hören']] },
  rogare:     { inf: 'rogāre', sg: 'rogat', pl: 'rogant', conj: 'a', de: [['fragen', 'fragt', 'fragen']] },
  quaerere:   { inf: 'quaerere', sg: 'quaerit', pl: 'quaerunt', conj: 'cons', de: [['suchen', 'sucht', 'suchen']] },
  videre:     { inf: 'vidēre', sg: 'videt', pl: 'vident', conj: 'e', de: [['sehen', 'sieht', 'sehen']] },
  intrare:    { inf: 'intrāre', sg: 'intrat', pl: 'intrant', conj: 'a', de: [['betreten', 'betritt', 'betreten']] },
  ridere:     { inf: 'rīdēre', sg: 'rīdet', pl: 'rīdent', conj: 'e', de: [['lachen', 'lacht', 'lachen']] },
  tenere:     { inf: 'tenēre', sg: 'tenet', pl: 'tenent', conj: 'e', de: [['halten', 'hält', 'halten']] },
};

// ---------------------------------------------------------------------------
// Small words: adverbs, a question word, a greeting and the form sunt.
// ---------------------------------------------------------------------------
const WORDS = {
  iterum:   { la: 'iterum', kind: 'Adv.', de: ['wieder'] },
  itaque:   { la: 'itaque', kind: 'Adv.', de: ['deshalb'] },
  adhuc:    { la: 'adhūc', kind: 'Adv.', de: ['bis jetzt', 'noch'] },
  statim:   { la: 'statim', kind: 'Adv.', de: ['sofort'] },
  semper:   { la: 'semper', kind: 'Adv.', de: ['immer'] },
  cur:      { la: 'cūr?', kind: 'Fragewort', de: ['warum?'] },
  salvete:  { la: 'Salvēte!', kind: 'Gruß an mehrere', de: ['Seid gegrüßt!'] },
  sunt:     { la: 'sunt', kind: 'Form von esse', de: ['sie sind'] },
};

const CONJ = {
  a:     { name: 'a-Konjugation', rule: 'Infinitiv auf -āre, 3. Pl. auf -ant' },
  e:     { name: 'e-Konjugation', rule: 'Infinitiv auf -ēre mit langem ē, 3. Pl. auf -ent' },
  i:     { name: 'i-Konjugation', rule: 'Infinitiv auf -īre, 3. Pl. auf -iunt' },
  cons:  { name: 'konsonantische Konjugation', rule: 'Infinitiv auf -ere mit kurzem e, 3. Pl. auf -unt' },
  mixed: { name: 'gemischte Konjugation', rule: 'Infinitiv auf -ere mit kurzem e, aber 3. Pl. auf -iunt (im Buch in Klammern)' },
};
const CONJ_ORDER = ['a', 'e', 'i', 'cons', 'mixed'];

const NOUN_IDS = Object.keys(NOUNS);
const L2_VERBS = ['amare', 'respondere', 'conspicere', 'fugere', 'capere', 'debere', 'nondebere', 'cupere', 'explere', 'dicere', 'incipere', 'placere', 'pergere'];
const OLD_VERBS = ['esse', 'clamare', 'venire', 'laborare', 'ludere', 'cantare', 'gaudere', 'currere', 'exspectare', 'audire', 'rogare', 'quaerere', 'videre', 'intrare', 'ridere', 'tenere'];
const WORD_IDS = Object.keys(WORDS);
const CONJ_VERBS = [...L2_VERBS, ...OLD_VERBS].filter(id => !VERBS[id].noConj);

// ---------------------------------------------------------------------------
// Sentences in the style of the workbook (pages 8-11): subjects in singular and
// plural with their German translation, and infinitive phrases for dēbēre.
// ---------------------------------------------------------------------------
const SUBJECTS = [
  { sg: 'Aulus', sgDe: 'Aulus', pl: 'Aulus et Cornēlia', plDe: 'Aulus und Cornelia' },
  { sg: 'Dēlia', sgDe: 'Delia', pl: 'Dēlia et Crispīna', plDe: 'Delia und Crispina' },
  { sg: 'Syrus', sgDe: 'Syrus', pl: 'Syrus et Modestus', plDe: 'Syrus und Modestus' },
  { sg: 'Puer', sgDe: 'Der Junge', pl: 'Puer et puella', plDe: 'Der Junge und das Mädchen' },
  { sg: 'Frāter', sgDe: 'Der Bruder', pl: 'Frāter et soror', plDe: 'Der Bruder und die Schwester' },
  { sg: 'Māter', sgDe: 'Die Mutter', pl: 'Parentēs', plDe: 'Die Eltern' },
  { sg: 'Puella', sgDe: 'Das Mädchen', pl: 'Līberī', plDe: 'Die Kinder' },
];
// Verbs that make a sentence without an object.
const SENTENCE_VERBS = ['ludere', 'ridere', 'laborare', 'venire', 'currere', 'clamare', 'cantare', 'gaudere', 'respondere', 'incipere', 'fugere', 'audire', 'quaerere', 'dicere'];
const DUTIES = [
  { la: 'officium explēre', de: 'die Pflicht erfüllen' },
  { la: 'labōrem pergere', de: 'die Arbeit fortsetzen' },
  { la: 'culīnam intrāre', de: 'die Küche betreten' },
  { la: 'ātrium intrāre', de: 'das Atrium betreten' },
  { la: 'statim venīre', de: 'sofort kommen' },
  { la: 'semper respondēre', de: 'immer antworten' },
  { la: 'labōrāre', de: 'arbeiten' },
  { la: 'frātrem exspectāre', de: 'den Bruder erwarten' },
  { la: 'sorōrem quaerere', de: 'die Schwester suchen' },
  { la: 'parentēs rogāre', de: 'die Eltern fragen' },
];

// ---------------------------------------------------------------------------
// Worlds. Learn cards list words through `vocab` (rendered by vocabLearnExtras).
// Never reorder worlds or levels: progress is stored per world id and position.
// ---------------------------------------------------------------------------
const TOPICS = [
  {
    id: 'nouns', title: 'Familie und Haus', sub: 'Die Nomen aus Lektion 2, immer mit Akkusativ', art: 'domus', badge: 'Hausherr',
    learn: [
      { h: 'So lernst du Nomen', p: 'Im Test steht das lateinische Nomen. Du schreibst die Bedeutung <b>und</b> den Akkusativ Singular dazu, also die mittlere Spalte aus dem Buch.', bullets: ['soror → sorōrem, Schwester', 'Bei Neutra (n.) sieht der Akkusativ aus wie der Nominativ: ātrium → ātrium.', 'līberī und parentēs gibt es nur im Plural.'] },
      { h: 'Familie', vocab: ['soror', 'frater', 'puer', 'puella', 'vir', 'liberi', 'parentes'] },
      { h: 'Haus und Alltag', vocab: ['atrium', 'peristylium', 'culina', 'otium', 'officium', 'labor'], p: 'Das Atrium ist die Eingangshalle eines römischen Hauses, das Peristyl der Garten mit Säulengang dahinter.' },
    ],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'vmc', title: 'Was heißt das?', words: NOUN_IDS, n: 10 },
      { type: 'vmatch', title: 'Paare finden', words: NOUN_IDS, prompt: 'Verbinde jedes lateinische Wort mit seiner Bedeutung.' },
      { type: 'vacc', title: 'Akkusativ-Training', words: NOUN_IDS, n: 10 },
      { type: 'vtest', title: 'Wie im Test', words: NOUN_IDS, n: 10 },
      { type: 'vnom', title: 'Akkusativ erkennen', words: NOUN_IDS.filter(id => NOUNS[id].acc !== NOUNS[id].la) },
    ],
  },
  {
    id: 'verbs2', title: 'Verben aus Lektion 2', sub: 'Infinitiv, er/sie/es und sie: jede Form genau übersetzen', art: 'verba', badge: 'Verben-Profi',
    learn: [
      { h: 'So übersetzt du Verbformen', p: 'Im Test steht der Infinitiv, die 3. Person Singular oder die 3. Person Plural. Genau diese Form übersetzt du:', bullets: ['<b>amāre</b>: lieben (Infinitiv auf -re)', '<b>amat</b>: er/sie/es liebt (Endung -t), nicht „lieben“', '<b>amant</b>: sie lieben (Endung -nt)'] },
      { h: 'Mögen, wollen, müssen', vocab: ['amare', 'cupere', 'placere', 'debere', 'nondebere'] },
      { h: 'Sehen, fangen, fliehen', vocab: ['conspicere', 'capere', 'fugere'] },
      { h: 'Reden und tun', vocab: ['respondere', 'dicere', 'incipere', 'pergere', 'explere'] },
    ],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'vmc', title: 'Was heißt das?', words: L2_VERBS, forms: ['inf'], n: 10 },
      { type: 'vmatch', title: 'Paare finden', words: L2_VERBS, prompt: 'Verbinde jeden Infinitiv mit seiner Bedeutung.' },
      { type: 'vmc', title: 'Wer tut es?', words: L2_VERBS, forms: ['sg', 'pl'], n: 12, lead: 'Achte auf die Endung: -t heißt er/sie/es, -nt heißt sie.' },
      { type: 'vswipe', title: 'Passt das?', words: L2_VERBS, n: 12 },
      { type: 'vtest', title: 'Wie im Test', words: L2_VERBS, forms: ['inf', 'sg', 'pl'], n: 12 },
    ],
  },
  {
    id: 'words', title: 'Kleine Wörter', sub: 'Adverbien, cūr?, Salvēte! und sunt', art: 'tabula', badge: 'Wortjäger',
    learn: [
      { h: 'Kleine Wörter', p: 'Diese Wörter ändern ihre Form nie. Im Test reicht die Bedeutung.', vocab: WORD_IDS },
    ],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'vmc', title: 'Was heißt das?', words: WORD_IDS, n: 8 },
      { type: 'vmatch', title: 'Paare finden', words: WORD_IDS, prompt: 'Verbinde jedes Wort mit seiner Bedeutung.' },
      { type: 'vtest', title: 'Wie im Test', words: WORD_IDS, n: 8 },
    ],
  },
  {
    id: 'verbs1', title: 'Verben aus Salve und Lektion 1', sub: 'Die Wiederholung: jetzt mit Infinitiv', art: 'laurus', badge: 'Wiederholer',
    learn: [
      { h: 'Infinitive aus „Salve“', p: 'Diese Verben kennst du schon. Neu ist der Infinitiv in der ersten Spalte.', vocab: ['esse', 'clamare', 'venire', 'laborare', 'ludere', 'cantare', 'gaudere', 'currere'] },
      { h: 'Infinitive aus Lektion 1', vocab: ['exspectare', 'audire', 'rogare', 'quaerere', 'videre', 'intrare', 'ridere', 'tenere'] },
    ],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'vmc', title: 'Was heißt das?', words: OLD_VERBS, forms: ['inf'], n: 10 },
      { type: 'vmc', title: 'Wer tut es?', words: OLD_VERBS, forms: ['sg', 'pl'], n: 12, lead: 'Achte auf die Endung: -t heißt er/sie/es, -nt heißt sie.' },
      { type: 'vswipe', title: 'Passt das?', words: OLD_VERBS, n: 12 },
      { type: 'vtest', title: 'Wie im Test', words: OLD_VERBS, forms: ['inf', 'sg', 'pl'], n: 12 },
    ],
  },
  {
    id: 'conj', title: 'Konjugationsklassen', sub: 'Jedes Verb seiner Klasse zuordnen', art: 'columnae', badge: 'Baumeister',
    learn: [
      { h: 'Fünf Klassen', p: 'Woran du die Klasse erkennst:', conj: CONJ_ORDER },
      { h: '-ēre oder -ere?', p: 'Im Test stehen keine Hinweise wie „Pl.: capiunt“ und vielleicht auch keine Längenstriche. Diese Gruppen musst du deshalb auswendig wissen:', conjList: ['e', 'cons', 'mixed'] },
      { h: 'Die übrigen', p: 'Bei -āre und -īre ist es leicht. esse ist unregelmäßig und gehört zu keiner Klasse.', conjList: ['a', 'i'] },
    ],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'sort', title: 'Lektion 2 sortieren', prompt: 'Zu welcher Konjugation gehört das Verb?', buckets: CONJ_ORDER.map(k => CONJ[k].name), items: L2_VERBS.filter(id => !VERBS[id].noConj).map(id => ({ t: plain(VERBS[id].inf), b: CONJ_ORDER.indexOf(VERBS[id].conj) })) },
      { type: 'sort', title: 'Salve und L1 sortieren', prompt: 'Zu welcher Konjugation gehört das Verb?', buckets: CONJ_ORDER.map(k => CONJ[k].name), items: OLD_VERBS.filter(id => !VERBS[id].noConj).map(id => ({ t: plain(VERBS[id].inf), b: CONJ_ORDER.indexOf(VERBS[id].conj) })) },
      { type: 'conj', title: 'Welche Klasse?', words: CONJ_VERBS, n: 12 },
      { type: 'plform', title: '3. Person Plural bilden', words: CONJ_VERBS, n: 10 },
    ],
  },
  {
    id: 'sentences', title: 'Verben im Satz', sub: 'Aus dem Arbeitsheft: aus eins mach zwei, dēbet oder dēbent', art: 'verba', badge: 'Satzbauer',
    learn: [
      { h: 'Einer oder mehrere?', p: 'Das Prädikat richtet sich nach dem Subjekt. Steht ein Subjekt da, endet das Verb auf -t, sind es mehrere (auch mit et verbunden), endet es auf -nt.', bullets: ['Aulus lūdit. Aulus spielt.', 'Aulus et Cornēlia lūdunt. Aulus und Cornelia spielen.', 'Bei der gemischten und der i-Konjugation kommt im Plural ein -i- dazu: Dēlia incipit, Dēlia et Crispīna incipiunt.'] },
      { h: 'dēbet oder dēbent', p: 'dēbēre steht mit einem Infinitiv. Der Infinitiv ist zwar ein Verb, aber kein Prädikat; das Prädikat ist dēbet oder dēbent.', bullets: ['Syrus labōrāre dēbet. Syrus muss arbeiten.', 'Servī labōrāre dēbent. Sklaven müssen arbeiten.', 'Puer clāmāre nōn dēbet. Der Junge darf nicht rufen.'] },
    ],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'numform', title: 'Aus Eins mach Zwei', words: SENTENCE_VERBS, dir: 'pl', n: 10 },
      { type: 'numform', title: 'Aus Zwei mach Eins', words: SENTENCE_VERBS, dir: 'sg', n: 10 },
      { type: 'debet', title: 'dēbet oder dēbent?', n: 10 },
    ],
  },
];
