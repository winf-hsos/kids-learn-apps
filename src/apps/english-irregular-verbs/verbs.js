// The 46 irregular verbs of the worksheet in its order (alphabetical, "to be" to "to write").
// f: [infinitive, simple past, past participle] as printed (without "to");
// de: German meanings (each one counts); hint: context for German prompts that
// would be ambiguous; also: extra accepted answers per form index; traps: wrong
// answers per form index with a specific hint; mcWrong: hand-picked wrong options
// per form index for multiple choice; note: shown after answering.

const VERBS = [
  { id: 'be', f: ['be', 'was/were', 'been'], de: ['sein'], also: { 1: ['was', 'were', 'were/was'] }, mcWrong: { 1: ['is/are', 'been', 'beed'] }, note: 'was gehört zu I, he, she, it, were zu you, we, they.' },
  { id: 'bring', f: ['bring', 'brought', 'brought'], de: ['bringen'], traps: { 1: [['brang', 'brung', 'braught'], 'Es heißt brought, mit ough wie bought und thought.'], 2: [['brang', 'brung', 'braught'], 'Es heißt brought, mit ough wie bought und thought.'] } },
  { id: 'buy', f: ['buy', 'bought', 'bought'], de: ['kaufen'], traps: { 1: [['buyed', 'baught', 'boughed'], 'Es heißt bought, mit ough wie brought und thought.'], 2: [['buyed', 'baught', 'boughed'], 'Es heißt bought, mit ough wie brought und thought.'] } },
  { id: 'come', f: ['come', 'came', 'come'], de: ['kommen'], traps: { 2: [['comen', 'commen'], 'Das past participle sieht aus wie der infinitive: come.'] } },
  { id: 'cost', f: ['cost', 'cost', 'cost'], de: ['kosten'], note: 'Alle drei Formen sind gleich.' },
  { id: 'do', f: ['do', 'did', 'done'], de: ['tun', 'machen'], hint: 'z. B. Hausaufgaben machen', traps: { 0: [['make', 'to make'], 'make heißt auch machen, aber im Sinne von herstellen. Gesucht ist hier do.'] } },
  { id: 'draw', f: ['draw', 'drew', 'drawn'], de: ['zeichnen'] },
  { id: 'drink', f: ['drink', 'drank', 'drunk'], de: ['trinken'], note: 'i – a – u wie bei sing, ring und swim.' },
  { id: 'drive', f: ['drive', 'drove', 'driven'], de: ['fahren'], hint: 'z. B. Auto fahren', traps: { 0: [['ride', 'to ride'], 'ride ist Rad fahren oder reiten. Auto fahren heißt drive.'], 2: [['driv', 'drivn', 'drieven'], 'Geschrieben wird es driven, mit -en am Ende.'] } },
  { id: 'eat', f: ['eat', 'ate', 'eaten'], de: ['essen'] },
  { id: 'fall', f: ['fall', 'fell', 'fallen'], de: ['fallen'] },
  { id: 'feel', f: ['feel', 'felt', 'felt'], de: ['fühlen'] },

  { id: 'find', f: ['find', 'found', 'found'], de: ['finden'] },
  { id: 'fly', f: ['fly', 'flew', 'flown'], de: ['fliegen'] },
  { id: 'get', f: ['get', 'got', 'gotten'], de: ['bekommen', 'erhalten'], alsoDe: ['kriegen'], also: { 2: ['got'] }, note: 'gotten ist amerikanisches Englisch und steht so auf dem Arbeitsblatt. Im britischen Englisch heißt das past participle got, beides zählt.' },
  { id: 'give', f: ['give', 'gave', 'given'], de: ['geben'] },
  { id: 'have', f: ['have', 'had', 'had'], de: ['haben'] },
  { id: 'hear', f: ['hear', 'heard', 'heard'], de: ['hören'], traps: { 1: [['herd', 'heared'], 'Geschrieben wird es heard: hear + d.'], 2: [['herd', 'heared'], 'Geschrieben wird es heard: hear + d.'] } },
  { id: 'know', f: ['know', 'knew', 'known'], de: ['wissen'], alsoDe: ['kennen'], traps: { 1: [['new', 'knowed'], 'Mit k am Anfang, wie bei know: knew.'], 2: [['nown', 'knowed'], 'Mit k am Anfang: known.'] } },
  { id: 'learn', f: ['learn', 'learnt/learned', 'learnt/learned'], de: ['lernen'], mcWrong: { 1: ['learn', 'lernt', 'learnen'], 2: ['learn', 'lernt', 'learnen'] }, also: { 1: ['learnt', 'learned', 'learned/learnt'], 2: ['learnt', 'learned', 'learned/learnt'] }, note: 'Beide Formen sind richtig: learnt (britisch) und learned.' },
  { id: 'make', f: ['make', 'made', 'made'], de: ['machen'], alsoDe: ['herstellen'], hint: 'im Sinne von herstellen, z. B. einen Kuchen machen', traps: { 0: [['do', 'to do'], 'do heißt auch machen, gesucht ist hier aber make: etwas herstellen.'] } },
  { id: 'meet', f: ['meet', 'met', 'met'], de: ['treffen'], traps: { 1: [['meeted', 'mett'], 'Es heißt met, mit einem e und einem t.'], 2: [['meeted', 'mett'], 'Es heißt met, mit einem e und einem t.'] } },
  { id: 'pay', f: ['pay', 'paid', 'paid'], de: ['(be)zahlen'], traps: { 1: [['payed'], 'Geschrieben wird es paid, mit ai.'], 2: [['payed'], 'Geschrieben wird es paid, mit ai.'] } },
  { id: 'read', f: ['read', 'read', 'read'], de: ['lesen'], note: 'Geschrieben bleibt read gleich, gesprochen wird die Vergangenheit aber wie „red“.' },

  { id: 'ride', f: ['ride', 'rode', 'ridden'], de: ['fahren', 'reiten'], hint: 'z. B. Rad fahren', traps: { 0: [['drive', 'to drive'], 'drive ist Auto fahren. Rad fahren und reiten heißt ride.'], 2: [['riden', 'rided'], 'Mit doppeltem d: ridden.'] } },
  { id: 'ring', f: ['ring', 'rang', 'rung'], de: ['klingeln', 'läuten'], note: 'i – a – u wie bei drink, sing und swim.' },
  { id: 'run', f: ['run', 'ran', 'run'], de: ['laufen', 'rennen'], traps: { 2: [['runned', 'runnen', 'rann'], 'Das past participle sieht aus wie der infinitive: run.'] } },
  { id: 'say', f: ['say', 'said', 'said'], de: ['sagen'], traps: { 1: [['sayed', 'sed'], 'Geschrieben wird es said, mit ai.'], 2: [['sayed', 'sed'], 'Geschrieben wird es said, mit ai.'] } },
  { id: 'see', f: ['see', 'saw', 'seen'], de: ['sehen'] },
  { id: 'sell', f: ['sell', 'sold', 'sold'], de: ['verkaufen'] },
  { id: 'send', f: ['send', 'sent', 'sent'], de: ['senden', 'verschicken'] },
  { id: 'show', f: ['show', 'showed', 'shown'], de: ['zeigen'], note: 'Das simple past showed ist regelmäßig, nur das past participle shown nicht.' },
  { id: 'sing', f: ['sing', 'sang', 'sung'], de: ['singen'], note: 'i – a – u wie bei drink, ring und swim.' },
  { id: 'sit', f: ['sit', 'sat', 'sat'], de: ['sitzen'] },
  { id: 'sleep', f: ['sleep', 'slept', 'slept'], de: ['schlafen'] },

  { id: 'speak', f: ['speak', 'spoke', 'spoken'], de: ['sprechen'] },
  { id: 'stand', f: ['stand', 'stood', 'stood'], de: ['stehen'] },
  { id: 'swim', f: ['swim', 'swam', 'swum'], de: ['schwimmen'], note: 'i – a – u wie bei drink, ring und sing.' },
  { id: 'take', f: ['take', 'took', 'taken'], de: ['nehmen'] },
  { id: 'teach', f: ['teach', 'taught', 'taught'], de: ['unterrichten', 'lehren', 'beibringen'], traps: { 1: [['teached', 'thaught', 'tought'], 'Geschrieben wird es taught, mit augh.'], 2: [['teached', 'thaught', 'tought'], 'Geschrieben wird es taught, mit augh.'] } },
  { id: 'tell', f: ['tell', 'told', 'told'], de: ['erzählen'] },
  { id: 'think', f: ['think', 'thought', 'thought'], de: ['denken'], traps: { 1: [['thougt', 'tought', 'thinked'], 'Geschrieben wird es thought: th + ought.'], 2: [['thougt', 'tought', 'thinked'], 'Geschrieben wird es thought: th + ought.'] } },
  { id: 'throw', f: ['throw', 'threw', 'thrown'], de: ['werfen'] },
  { id: 'wakeup', f: ['wake up', 'woke up', 'woken up'], de: ['aufwachen', 'aufwecken'] },
  { id: 'wear', f: ['wear', 'wore', 'worn'], de: ['anhaben', 'tragen'], hint: 'Kleidung', note: 'Auf dem Arbeitsblatt steht anhaben, oft sagt man auch tragen.' },
  { id: 'write', f: ['write', 'wrote', 'written'], de: ['schreiben'], traps: { 2: [['writen', 'witten', 'wroten', 'writed'], 'Geschrieben wird es written, mit zwei t.'] } },
];

const VERB = Object.fromEntries(VERBS.map(v => [v.id, v]));
const VERB_IDS = VERBS.map(v => v.id);
const PART = [VERBS.slice(0, 12), VERBS.slice(12, 24), VERBS.slice(24, 35), VERBS.slice(35)].map(vs => vs.map(v => v.id));
const FORM_NAMES = ['infinitive', 'simple past', 'past participle'];
