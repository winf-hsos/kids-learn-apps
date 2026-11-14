// Worlds of the irregular verbs app. Never reorder worlds or levels once published,
// progress is stored per world id and level position; append new ones at the end.

const verbLevels = words => [
  { type: 'learn', title: 'Lernkarten' },
  { type: 'vmc', title: 'Was heißt das?', words },
  { type: 'vmatch', title: 'Paare finden', words, prompt: 'Verbinde jedes englische Verb mit seiner Bedeutung.' },
  { type: 'formmc', title: 'Fehlende Form', words },
  { type: 'past', title: 'Simple past eintippen', words },
  { type: 'pp', title: 'Past participle eintippen', words },
  { type: 'fill', title: 'Wie auf dem Arbeitsblatt', words },
  { type: 'forms', title: 'Deutsch → alle drei Formen', words },
];

const TOPICS = [
  {
    id: 'part1', img: 'img/part1.webp', title: 'Teil 1: to be bis to feel', sub: 'Die ersten 12 Verben vom Arbeitsblatt', art: 'glass', badge: 'Drink Master',
    learn: [
      { h: 'So lernst du für Dienstag', p: 'Auf dem Arbeitsblatt stehen 46 unregelmäßige Verben mit ihren drei Formen: infinitive, simple past und past participle. Jede Welt übt ein Viertel davon in der Reihenfolge vom Blatt, erst mit Antworten zum Antippen und dann zum Eintippen, bis du alle Formen richtig schreiben kannst.', bullets: ['Beim infinitive darfst du „to“ mitschreiben, musst aber nicht.', 'Vor simple past und past participle steht kein „to“.', 'Bei den englischen Formen zählt jeder Buchstabe, wie im Test.', 'Mit dem Lautsprecher hörst du alle drei Formen.'] },
      { h: 'Verben 1 bis 6', verbs: PART[0].slice(0, 6) },
      { h: 'Verben 7 bis 12', verbs: PART[0].slice(6) },
    ],
    levels: verbLevels(PART[0]),
  },
  {
    id: 'part2', img: 'img/part2.webp', title: 'Teil 2: to find bis to read', sub: 'Die Verben 13 bis 24', art: 'plane', badge: 'High Flyer',
    learn: [
      { h: 'Verben 13 bis 18', verbs: PART[1].slice(0, 6) },
      { h: 'Verben 19 bis 24', verbs: PART[1].slice(6) },
    ],
    levels: verbLevels(PART[1]),
  },
  {
    id: 'part3', img: 'img/part3.webp', title: 'Teil 3: to ride bis to sleep', sub: 'Die Verben 25 bis 35', art: 'bike', badge: 'Bike Rider',
    learn: [
      { h: 'Verben 25 bis 30', verbs: PART[2].slice(0, 6) },
      { h: 'Verben 31 bis 35', verbs: PART[2].slice(6) },
    ],
    levels: verbLevels(PART[2]),
  },
  {
    id: 'part4', img: 'img/part4.webp', title: 'Teil 4: to speak bis to write', sub: 'Die letzten 11 Verben', art: 'clock', badge: 'Early Bird',
    learn: [
      { h: 'Verben 36 bis 41', verbs: PART[3].slice(0, 6) },
      { h: 'Verben 42 bis 46', verbs: PART[3].slice(6) },
    ],
    levels: verbLevels(PART[3]),
  },
  {
    id: 'mix', img: 'img/mix.webp', title: 'Alles für den Test', sub: 'Stolperfallen, Muster und alle 46 Verben gemischt', art: 'trophy', badge: 'Verb Champion',
    learn: [
      { h: 'Stolperfallen', p: 'Bei diesen Formen passieren die meisten Fehler:', bullets: [
        'to draw – <b>drew</b> – drawn: drawn ist das past participle, im simple past heißt es drew.',
        'to know – <b>knew</b> – known: Nur der infinitive bekommt ein „to“, also nicht „to knew“.',
        'to wake up – woke up – <b>woken up</b>: Das past participle endet auf -en.',
        'to write – wrote – <b>written</b> mit zwei t, und to ride – rode – <b>ridden</b> mit zwei d.',
        'to drive – drove – <b>driven</b>, mit -en am Ende.',
        'to get – got – <b>gotten</b>: So steht es auf dem Arbeitsblatt (amerikanisch). Britisch sagt man auch got, beides zählt.',
        'to be – <b>was/were</b> – been: was für I, he, she, it und were für you, we, they.',
        'to learn – <b>learnt/learned</b>: Beide Formen sind richtig.',
        'Auto fahren heißt <b>drive</b>, Rad fahren und reiten heißt <b>ride</b>. Hausaufgaben machen heißt <b>do</b>, einen Kuchen machen <b>make</b>.',
      ] },
      { h: 'Muster, die beim Merken helfen', bullets: [
        '<b>Alle drei gleich:</b> cost – cost – cost und read – read – read (gesprochen wird die Vergangenheit wie „red“).',
        '<b>i – a – u:</b> drink – drank – drunk, ring – rang – rung, sing – sang – sung, swim – swam – swum.',
        '<b>-ought und -aught:</b> bring – brought, buy – bought, think – thought, teach – taught, jeweils zweimal gleich.',
        '<b>-ew und -own:</b> fly – flew – flown, know – knew – known, throw – threw – thrown, draw – drew – drawn.',
        '<b>simple past und past participle gleich:</b> feel – felt, find – found, have – had, hear – heard, make – made, meet – met, pay – paid, say – said, sell – sold, send – sent, sit – sat, sleep – slept, stand – stood, tell – told.',
        '<b>past participle auf -en:</b> eat – ate – eaten, fall – fell – fallen, give – gave – given, see – saw – seen, take – took – taken, speak – spoke – spoken, write – wrote – written, drive – drove – driven, ride – rode – ridden.',
        '<b>past participle wie der infinitive:</b> come – came – come, run – ran – run.',
        '<b>Einzelgänger:</b> be – was/were – been, do – did – done, get – got – gotten, wear – wore – worn, show – showed – shown, wake up – woke up – woken up.',
      ] },
      { h: 'Aus dem Kasten auf dem Arbeitsblatt', p: 'Unten auf dem Blatt stehen acht Paare aus Gegenwart und Vergangenheit: know – knew, draw – drew, win – won, find – found, tell – told, take – took, sell – sold und drink – drank. Nur win – won (gewinnen) kommt in der Tabelle nicht vor.' },
    ],
    levels: [
      { type: 'learn', title: 'Stolperfallen und Muster' },
      { type: 'vswipe', title: 'Stimmen die Formen?', words: VERB_IDS, n: 14 },
      { type: 'formmc', title: 'Fehlende Form gemischt', words: VERB_IDS, n: 15 },
      { type: 'fill', title: 'Arbeitsblatt gemischt', words: VERB_IDS, n: 15 },
      { type: 'forms', title: 'Alle drei Formen gemischt', words: VERB_IDS, n: 20 },
    ],
  },
];
