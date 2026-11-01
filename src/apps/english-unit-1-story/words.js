// The 39 words of the test in textbook order (Unit 1, "Story", from "to smile" to "to roll").
// en: English as in the book; de: German meanings as in the book (each one counts);
// g: article for nouns; hint: context for German prompts that would be ambiguous;
// alsoEn / alsoDe: extra accepted answers; traps: wrong answers with a specific hint;
// ex: our own example sentence (not the book's) with ___ for gap, the word as it fits there;
// past: [base, simple past] for the past-tense drill; note: shown after answering.

const WORDS = [
  { id: 'smile', en: 'to smile', de: ['lächeln'], ex: 'Say cheese and ___ for the photo!', gap: 'smile', past: ['smile', 'smiled'] },
  { id: 'preparation', en: 'preparation', de: ['Vorbereitung'], g: 'die', ex: 'The ___ for the school party took all morning.', gap: 'preparation', spell: ['preperation', 'praparation'] },
  { id: 'whisper', en: 'to whisper', de: ['flüstern'], ex: 'We have to ___ in the library.', gap: 'whisper', past: ['whisper', 'whispered'], spell: ['wisper', 'to wisper'] },
  { id: 'discuss', en: 'to discuss', de: ['diskutieren'], alsoDe: ['besprechen'], ex: 'The class wants to ___ the trip with the teacher.', gap: 'discuss', past: ['discuss', 'discussed'], spell: ['discus', 'diskuss'] },
  { id: 'stuff', en: 'stuff', de: ['Zeug'], g: 'das', ex: 'Tidy up your room, there is ___ everywhere!', gap: 'stuff', spell: ['stuf'] },
  { id: 'photobooth', en: 'photo booth', de: ['Fotobox'], g: 'die', ex: 'At the wedding we took funny pictures in the ___.', gap: 'photo booth', spell: ['foto booth', 'photo bouth'] },
  { id: 'uptoyou', en: "It's up to you.", de: ['Wie du willst.', 'Das musst du wissen.'], ex: 'Pizza or pasta tonight? – I don’t mind. ___', gap: "It's up to you.", traps: [{ answers: ['its up to you'], hint: 'Der Apostroph gehört dazu: It’s = it is.' }] },
  { id: 'miss', en: 'to miss', de: ['verpassen', 'versäumen'], alsoDe: ['vermissen'], ex: 'Hurry up or we will ___ the bus!', gap: 'miss', past: ['miss', 'missed'], note: 'to miss heißt auch „vermissen“, im Buch steht hier „verpassen; versäumen“.' },
  { id: 'stammer', en: 'to stammer', de: ['stammeln'], alsoDe: ['stottern'], ex: 'He was so nervous that he started to ___.', gap: 'stammer', past: ['stammer', 'stammered'], spell: ['stamer', 'to stamer'] },
  { id: 'realise', en: 'to realise', de: ['erkennen', 'realisieren'], alsoEn: ['to realize'], ex: 'Suddenly Mia ___ that she had forgotten her keys.', gap: 'realised', past: ['realise', 'realised'], alsoPast: ['realized'], note: 'Britisch realise, amerikanisch realize, beides ist richtig.' },
  { id: 'comeup', en: 'to come up with sth', de: ['sich etw. einfallen lassen', 'sich etw. ausdenken'], ex: 'Can you ___ a good name for our team?', gap: 'come up with', past: ['come up with', 'came up with'] },
  { id: 'thought', en: 'thought', de: ['Gedanke'], g: 'der', ex: 'A strange ___ came into my head.', gap: 'thought', spell: ['thougt', 'tought'], note: 'thought kommt von to think. Es ist auch die Vergangenheit: I thought = ich dachte.' },
  { id: 'rush', en: 'to rush', de: ['eilen', 'sich beeilen'], ex: 'The bell rang and everybody ___ out of the classroom.', gap: 'rushed', past: ['rush', 'rushed'] },

  { id: 'through', en: 'through', de: ['durch'], ex: 'The cat jumped ___ the open window.', gap: 'through', spell: ['trough', 'thrugh'], traps: [{ answers: ['trough', 'thru'], hint: 'Geschrieben wird es through, mit th und gh.' }] },
  { id: 'letdown', en: 'to let sb down', de: ['jmdn. im Stich lassen', 'jmdn. enttäuschen'], ex: 'You promised to help me, so please don’t ___!', gap: 'let me down', past: ['let down', 'let down'] },
  { id: 'definitely', en: 'definitely', de: ['bestimmt', 'definitiv', 'eindeutig'], ex: 'This is ___ the best film I have ever seen.', gap: 'definitely', spell: ['definately', 'definitly'], traps: [{ answers: ['definately', 'definitly', 'definetly'], hint: 'Merke: defin-ITE-ly, wie „finite“.' }] },
  { id: 'decision', en: 'decision', de: ['Entscheidung'], g: 'die', ex: 'It was a hard ___, but we chose the red bike.', gap: 'decision', spell: ['dicision', 'decission'], note: 'decision kommt von to decide (entscheiden).' },
  { id: 'setup', en: 'to set up', de: ['einrichten', 'aufbauen'], ex: 'Let’s ___ the tent before it gets dark.', gap: 'set up', past: ['set up', 'set up'], traps: [{ answers: ['setted up'], hint: 'set ist unregelmäßig und bleibt gleich: set – set.' }] },
  { id: 'as1', en: 'as', de: ['wie'], hint: 'wie in: Ich sah zu, wie sie hereinkamen.', ex: 'I watched the birds ___ they flew over the lake.', gap: 'as', traps: [{ answers: ['how', 'like'], hint: '„how“ und „like“ heißen auch „wie“. Gelernt hast du hier „as“: I watched them as they came in.' }] },
  { id: 'heavy', en: 'heavy', de: ['schwer', 'stark'], ex: 'This suitcase is so ___ that I can’t lift it.', gap: 'heavy', spell: ['heavey', 'hevy'] },
  { id: 'wave', en: 'to wave', de: ['winken', 'schwenken'], ex: 'Grandma ___ goodbye from the train.', gap: 'waved', past: ['wave', 'waved'] },
  { id: 'freeze', en: 'to freeze', de: ['erstarren'], alsoDe: ['frieren', 'gefrieren'], ex: 'When you hear a strange noise at night, you ___ and listen.', gap: 'freeze', note: 'Gemeint ist „vor Schreck erstarren“, sonst heißt to freeze auch „frieren“.' },
  { id: 'awkward', en: 'awkward', de: ['peinlich', 'ungünstig', 'ungeschickt', 'unbeholfen', 'unangenehm'], ex: 'Nobody laughed at my joke. It was really ___.', gap: 'awkward', spell: ['akward', 'awkword'], traps: [{ answers: ['akward', 'awkword'], hint: 'Geschrieben wird es aw-k-ward.' }] },
  { id: 'matter', en: "What's the matter?", de: ['Was ist los?', 'Was hast du?'], ex: 'You look sad. ___', gap: "What's the matter?" },
  { id: 'silence', en: 'to break the silence', de: ['das Schweigen brechen'], ex: 'Everybody was quiet until Tom ___ with a joke.', gap: 'broke the silence' },
  { id: 'break', en: 'to break', de: ['brechen', 'zerbrechen'], ex: 'Be careful, don’t ___ the glass!', gap: 'break', past: ['break', 'broke'], traps: [{ answers: ['breaked'], hint: 'break ist unregelmäßig: break – broke.' }] },

  { id: 'rub', en: 'to rub', de: ['reiben'], ex: 'He was tired and ___ his eyes.', gap: 'rubbed', past: ['rub', 'rubbed'], traps: [{ answers: ['rubed'], hint: 'Nach kurzem Vokal wird der Endbuchstabe verdoppelt: rub – rubbed.' }] },
  { id: 'explain', en: 'to explain', de: ['erklären'], ex: 'Can you ___ this maths problem to me?', gap: 'explain', past: ['explain', 'explained'], spell: ['explane', 'to explane'] },
  { id: 'stupidme', en: 'Stupid me!', de: ['Bin ich blöd!'], ex: 'I forgot my sports bag again. ___', gap: 'Stupid me!' },
  { id: 'disappear', en: 'to disappear', de: ['verschwinden'], ex: 'The magician made the rabbit ___.', gap: 'disappear', past: ['disappear', 'disappeared'], spell: ['dissapear', 'disapear'], traps: [{ answers: ['dissapear', 'disapear', 'to dissapear', 'to disapear'], hint: 'dis + appear: ein s, zwei p.' }] },
  { id: 'could', en: 'could', de: ['konnte', 'konntest', 'konntet', 'konnten'], hint: 'Vergangenheit von can', ex: 'When I was four, I ___ already swim.', gap: 'could', past: ['can', 'could'], spell: ['coud', 'culd'], traps: [{ answers: ['can'], hint: 'can ist die Gegenwart (kann), konnte heißt could.' }] },
  { id: 'disappointed', en: 'disappointed', de: ['enttäuscht'], ex: 'Our team lost the final, so we were very ___.', gap: 'disappointed', spell: ['dissapointed', 'disapointed'], traps: [{ answers: ['dissapointed', 'disapointed'], hint: 'dis + appointed: ein s, zwei p.' }] },
  { id: 'steal', en: 'to steal', de: ['stehlen'], ex: 'Somebody ___ my bike yesterday!', gap: 'stole', past: ['steal', 'stole'], traps: [{ answers: ['stealed'], hint: 'steal ist unregelmäßig: steal – stole.' }] },
  { id: 'turn', en: 'to turn', de: ['drehen', '(sich) umdrehen'], ex: 'She ___ around when she heard her name.', gap: 'turned', past: ['turn', 'turned'] },
  { id: 'eachother', en: 'each other', de: ['einander', 'sich', 'sich gegenseitig'], ex: 'The two friends hugged ___ after the match.', gap: 'each other' },
  { id: 'movie', en: 'movie', de: ['Film'], g: 'der', hint: 'amerikanisches Englisch', alsoEn: ['film'], ex: 'Let’s watch a ___ tonight, I’ll bring popcorn.', gap: 'movie', spell: ['muvie', 'moovie'], note: 'movie ist amerikanisches Englisch (AE), britisch heißt es film (BE).' },
  { id: 'oneday', en: 'one day', de: ['eines Tages'], ex: '___ I want to play for a big football club.', gap: 'One day' },
  { id: 'as2', en: 'as', de: ['während', 'indem'], hint: 'während in: Er lachte, während er ging.', ex: 'She smiled ___ she opened the present.', gap: 'as', traps: [{ answers: ['while', 'during'], hint: '„while“ heißt auch „während“, gelernt hast du hier aber „as“.' }] },
  { id: 'roll', en: 'to roll', de: ['rollen'], ex: 'The ball ___ under the car.', gap: 'rolled', past: ['roll', 'rolled'] },
];

const WORD = Object.fromEntries(WORDS.map(w => [w.id, w]));
const PART = [WORDS.slice(0, 13), WORDS.slice(13, 26), WORDS.slice(26)].map(ws => ws.map(w => w.id));
const ALL_IDS = WORDS.map(w => w.id);
