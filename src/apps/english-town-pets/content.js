// Worlds of the English app for year 4: places in town, where things are, directions on a street map
// and pets. Words and sentence patterns follow the workbook pages of the class (chapter "In town")
// and the pets unit of the same course. Never reorder worlds or levels once published; progress is
// stored per world id and level position.

// Every picture word: English, German. Places use the pictures of the map, pets their own.
const WORDS = {
  zoo: ['zoo', 'der Zoo'], library: ['library', 'die Bücherei'], hospital: ['hospital', 'das Krankenhaus'],
  cinema: ['cinema', 'das Kino'], bus_stop: ['bus stop', 'die Bushaltestelle'], museum: ['museum', 'das Museum'],
  post_office: ['post office', 'die Post'], restaurant: ['restaurant', 'das Restaurant'], sweet_shop: ['sweet shop', 'der Süßigkeitenladen'],
  supermarket: ['supermarket', 'der Supermarkt'], playground: ['playground', 'der Spielplatz'], train_station: ['train station', 'der Bahnhof'],
  swimming_pool: ['swimming pool', 'das Schwimmbad'], school: ['school', 'die Schule'], park: ['park', 'der Park'], bridge: ['bridge', 'die Brücke'],
  dog: ['dog', 'der Hund'], cat: ['cat', 'die Katze'], rabbit: ['rabbit', 'das Kaninchen'], guinea_pig: ['guinea pig', 'das Meerschweinchen'],
  hamster: ['hamster', 'der Hamster'], budgie: ['budgie', 'der Wellensittich'], fish: ['fish', 'der Fisch'], tortoise: ['tortoise', 'die Schildkröte'],
  snake: ['snake', 'die Schlange'], spider: ['spider', 'die Spinne'], pony: ['pony', 'das Pony'], mouse: ['mouse', 'die Maus'], rat: ['rat', 'die Ratte'],
};
const PLACE_WORDS = ['zoo', 'library', 'hospital', 'cinema', 'bus_stop', 'museum', 'post_office', 'restaurant', 'sweet_shop', 'supermarket', 'playground', 'train_station', 'swimming_pool', 'school', 'park', 'bridge'];
// The twelve pets of the workbook (p. 4). The quiz order stays as first published; the learn cards use the book's order.
const PET_WORDS = ['dog', 'cat', 'rabbit', 'guinea_pig', 'hamster', 'budgie', 'fish', 'tortoise', 'snake', 'spider', 'pony', 'mouse'];
const BOOK_PETS = ['hamster', 'cat', 'spider', 'fish', 'dog', 'guinea_pig', 'pony', 'rabbit', 'tortoise', 'mouse', 'snake', 'budgie'];
const en = k => WORDS[k][0], de = k => WORDS[k][1];
const article = w => /^[aeiou]/.test(w) ? 'an' : 'a';

// Typed spelling: picture shown, English word typed (with or without "a"/"the").
const spellItem = k => ({
  kind: 'type', img: `img/${k}.webp`, imgAlt: de(k), q: `${de(k)}`, lead: 'Wie heißt das auf Englisch?',
  fields: [{ label: 'English', accept: [en(k), `a ${en(k)}`, `an ${en(k)}`, `the ${en(k)}`], sol: en(k) }],
  x: `${en(k)}: ${de(k)}.`,
});
// German to English with similar words as distractors.
const transItem = (k, pool, extra = []) => ({
  q: `Was heißt „${de(k)}“ auf Englisch?`,
  o: [en(k), ...shuffle([...extra, ...pool.filter(x => x !== k).map(en)]).slice(0, 3)], a: 0, x: `${de(k)} heißt <b>${en(k)}</b>.`,
});

const mapFig = o => `<div class="tm-wrap">${townSvg(o)}</div>`;
const say = t => `${t} ${sayBtn(t)}`;

// ---------------------------------------------------------------------------
// Directions: the turn of each route as a left-or-right question, keyword groups for the write tasks
// ---------------------------------------------------------------------------
const swapLR = s => s.replace(/\b(left|right)\b/, m => m === 'left' ? 'right' : 'left');
function turnItem(r) {
  const t = ROUTES[r].text.find(s => /^Turn (left|right)/.test(s));
  return {
    fig: mapFig({ route: r }), q: 'Wie geht es an der Kreuzung weiter? Achte darauf, in welche Richtung du läufst.',
    o: [t, swapLR(t), 'Go straight on.'], a: 0,
    x: `Stell dir vor, du läufst selbst den Weg entlang. Dann heißt es: <b>${t}</b>`,
  };
}
// Keyword groups for a written route: one group per instruction (the first spelling is shown).
// No apostrophes, because tablets type curly ones.
function routeKeys(r) {
  const groups = [['straight on']];
  ROUTES[r].text.forEach(s => {
    s = s.replace(/\.$/, '');
    let m;
    if ((m = s.match(/^Turn (left|right) at (.+)$/))) { const x = m[2].replace(/^the /, '').replace(/'.*$/, ''), at = /^[A-Z]/.test(x) ? 'at' : 'at the'; groups.push([`turn ${m[1]} ${at} ${x}`, `${m[1]} at the ${x}`, `${m[1]} at ${x}`]); }
    else if ((m = s.match(/^Turn (left|right)( and go through the park)?$/))) { groups.push([`turn ${m[1]}`]); if (m[2]) groups.push(['through the park']); }
    if (/across the bridge/.test(s)) groups.push(['across the bridge']);
    if ((m = s.match(/^Go past (.+?)( and (.+))?$/))) groups.push([`past ${m[1]}`, `past ${m[1].replace(/^the /, '')}`]);
    if ((m = s.match(/on your (left|right)$/))) groups.push([`on your ${m[1]}`, `on the ${m[1]}`]);
    if ((m = s.match(/(opposite|next to) (.+)$/))) groups.push([`${m[1]} ${m[2].replace(/'/g, '').replace(/^the /, 'the ')}`, `${m[1]} ${m[2].replace(/'/g, '').replace(/^the /, '')}`]);
  });
  return groups;
}
const writeRoute = (r, from) => ({
  q: `${mapFig({ route: r, goal: ROUTES[r].goal })}Beschreibe auf Englisch den Weg vom roten Pfeil ${from} bis zum Stern (${PLACES[ROUTES[r].goal].en}). Schreib Satz für Satz, so wie in der Arbeit.`,
  m: routeText(r), k: routeKeys(r),
});

// Cloze texts for the routes (chips include some wrong words).
const ROUTE_CLOZE = [
  { r: 'r1', s: "Go straight ___. Turn ___ at the cinema. Go ___ the swimming pool and the supermarket. Mia's house is on your ___. It's ___ the train station.", answers: ['on', 'left', 'past', 'left', 'opposite'], o: ['on', 'left', 'left', 'past', 'opposite', 'right', 'across'] },
  { r: 'r3', s: "Go straight on. Turn ___ at the zoo. Go past the ___ and the restaurant. The post office is on your ___. It's opposite the ___.", answers: ['left', 'museum', 'left', 'sweet shop'], o: ['left', 'left', 'museum', 'sweet shop', 'right', 'library'] },
  { r: 'r6', s: "Go straight on. Turn ___ at the bus stop. The ___ is on your left. It's opposite the ___.", answers: ['right', 'supermarket', 'park'], o: ['right', 'supermarket', 'park', 'left', 'cinema'] },
  { r: 'r7', s: "Go straight on. Turn left at the ___. Go ___ the hospital. The museum is on your ___. It's opposite the restaurant.", answers: ['library', 'past', 'right'], o: ['library', 'past', 'right', 'left', 'across', 'school'] },
  { r: 'r2', s: 'Go straight on. Turn right and go ___ the park. Turn ___. Go past the cinema and go ___ the bridge. The sweet shop is on your left.', answers: ['through', 'left', 'across'], o: ['through', 'left', 'across', 'right', 'opposite'] },
  { r: 'r10', s: "Go straight on. Go ___ the train station and the supermarket. Go past the swimming pool. The cinema is on your ___. It's ___ the park.", answers: ['past', 'left', 'opposite'], o: ['past', 'left', 'opposite', 'right', 'through'] },
];
const clozeItem = c => ({ kind: 'cloze', q: `${mapFig({ route: c.r, goal: ROUTES[c.r].goal })}<span class="tm-q">Fill in the gaps.</span>`, s: c.s, answers: c.answers, o: c.o, x: `Der ganze Weg: ${routeText(c.r)}` });

// Typed words in the instructions.
const ROUTE_TYPE = [
  { r: 'r1', q: 'Turn ___ at the cinema.', a: 'left' },
  { r: 'r6', q: 'Turn ___ at the bus stop.', a: 'right' },
  { r: 'r5', q: 'Go ___ the bridge.', a: 'across' },
  { r: 'r2', q: 'Turn right and go ___ the park.', a: 'through' },
  { r: 'r7', q: 'Go ___ the hospital.', a: 'past' },
  { r: 'r4', q: "The library is on your right. It's ___ the hospital.", a: 'opposite' },
  { r: 'r8', q: 'Turn right at the ___.', a: 'playground' },
  { r: 'r9', q: 'Go ___ on. Turn left at the playground.', a: 'straight' },
  { r: 'r11', q: 'Turn right at the post office. The restaurant is on your ___.', a: 'right' },
  { r: 'r12', q: "Turn right at Tim's ___.", a: 'house' },
];
const typeRouteItem = c => ({
  kind: 'type', lead: mapFig({ route: c.r, goal: ROUTES[c.r].goal }), q: c.q,
  fields: [{ label: 'Fehlendes Wort', accept: [c.a], sol: c.a }], x: `Der ganze Weg: ${routeText(c.r)}`,
});

// Arrows for the phrase cards and the first quiz.
const DIR_ARROW = {
  straight: 'M50 88 V24 M34 40 L50 22 L66 40',
  left: 'M58 88 V52 Q58 40 46 40 H22 M36 26 L20 40 L36 54',
  right: 'M42 88 V52 Q42 40 54 40 H78 M64 26 L80 40 L64 54',
  past: 'M30 88 V18 M16 32 L30 16 L44 32',
  across: 'M14 50 H86 M72 36 L88 50 L72 64',
};
function arrowArt(kind) {
  const extra = {
    past: '<rect x="54" y="38" width="30" height="26" rx="4" fill="var(--accent-soft)" stroke="currentColor" stroke-width="3"/>',
    across: '<path d="M8 30 H92 V70 H8 Z" fill="#5BA8E0" opacity=".45"/><path d="M8 40 H92 M8 60 H92" stroke="currentColor" stroke-width="3"/>',
  }[kind] || '';
  return svg(`${extra}<path d="${DIR_ARROW[kind]}" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`);
}
const PHRASES = [
  { k: 'straight', en: 'Go straight on.', de: 'Geh geradeaus.' },
  { k: 'left', en: 'Turn left.', de: 'Bieg links ab.' },
  { k: 'right', en: 'Turn right.', de: 'Bieg rechts ab.' },
  { k: 'past', en: 'Go past the cinema.', de: 'Geh am Kino vorbei.' },
  { k: 'across', en: 'Go across the bridge.', de: 'Geh über die Brücke.' },
];

// ---------------------------------------------------------------------------
// Where is it? Small scenes for the prepositions, made from the pictures
// ---------------------------------------------------------------------------
const pic = (k, x, y, w) => `<image href="img/${k}.webp" x="${x}" y="${y}" width="${w}" height="${w}"/>`;
function prepScene(kind, a, b, c) {
  const road = '<rect x="0" y="54" width="200" height="22" fill="var(--tm-road)"/><path d="M0 65 H200" stroke="var(--tm-line)" stroke-width="2" stroke-dasharray="8 7"/>';
  const s = {
    next: `${pic(b, 30, 25, 70)}${pic(a, 100, 25, 70)}`,
    between: `${pic(b, 2, 30, 64)}${pic(a, 68, 30, 64)}${pic(c, 134, 30, 64)}`,
    behind: `${pic(a, 80, 8, 50)}${pic(b, 45, 30, 100)}`,
    front: `${pic(b, 40, 4, 100)}${pic(a, 82, 62, 62)}`,
    opposite: `${road}${pic(a, 70, 0, 54)}${pic(b, 70, 76, 54)}`,
  }[kind];
  return `<svg viewBox="0 0 200 130" class="prep-scene" aria-hidden="true">${s}</svg>`;
}
const PREPS = [
  { k: 'next', en: 'next to', de: 'neben', ex: ['cat', 'dog'], s: 'The cat is next to the dog.' },
  { k: 'between', en: 'between', de: 'zwischen', ex: ['rabbit', 'dog', 'cat'], s: 'The rabbit is between the dog and the cat.' },
  { k: 'opposite', en: 'opposite', de: 'gegenüber', ex: ['cinema', 'zoo'], s: 'The cinema is opposite the zoo.' },
  { k: 'behind', en: 'behind', de: 'hinter', ex: ['pony', 'house'], s: 'The pony is behind the house.' },
  { k: 'front', en: 'in front of', de: 'vor', ex: ['dog', 'house'], s: 'The dog is in front of the house.' },
];
const prepFig = (kind, a, b, c) => `<div class="prep-fig">${prepScene(kind, a, b, c)}</div>`;
const PREP_ITEMS = [
  ['next', 'hamster', 'rabbit', null, 'The hamster is ___ the rabbit.'],
  ['between', 'cat', 'snake', 'tortoise', 'The cat is ___ the snake and the tortoise.'],
  ['behind', 'spider', 'house', null, 'The spider is ___ the house.'],
  ['front', 'pony', 'house', null, 'The pony is ___ the house.'],
  ['opposite', 'museum', 'hospital', null, 'The museum is ___ the hospital.'],
  ['between', 'bus_stop', 'library', 'cinema', 'The bus stop is ___ the library and the cinema.'],
  ['front', 'budgie', 'house', null, 'The budgie is ___ the house.'],
  ['opposite', 'sweet_shop', 'zoo', null, 'The sweet shop is ___ the zoo.'],
  ['behind', 'guinea_pig', 'house', null, 'The guinea pig is ___ the house.'],
  ['next', 'school', 'supermarket', null, 'The school is ___ the supermarket.'],
].map(([k, a, b, c, q]) => {
  const right = PREPS.find(p => p.k === k).en;
  return { fig: prepFig(k, a, b, c), q, o: [right, ...PREPS.filter(p => p.k !== k).map(p => p.en).slice(0, 3)], a: 0, x: `Richtig: ${q.replace('___', `<b>${right}</b>`)}` };
});

// Questions about the map.
const WHERE_ITEMS = [
  { q: "Where's the museum?", o: ["It's opposite the restaurant.", "It's behind the restaurant.", "It's opposite the cinema."], x: 'Das Museum liegt an der Market Street, auf der anderen Straßenseite steht das Restaurant.' },
  { q: "Where's the library?", o: ["It's next to the restaurant.", "It's next to the zoo.", "It's opposite the sweet shop."], x: 'Die Bücherei steht direkt neben dem Restaurant.' },
  { q: "Where's the zoo?", o: ["It's opposite the playground.", "It's next to the museum.", "It's opposite the hospital."], x: 'Der Zoo und der Spielplatz liegen sich an der Station Road gegenüber.' },
  { q: "Where's the bus stop?", o: ["It's next to the supermarket.", "It's opposite the school.", "It's between the zoo and the museum."], x: 'Die Bushaltestelle steht neben dem Supermarkt, gegenüber vom Park.' },
  { q: "Where's the post office?", o: ["It's next to the school.", "It's opposite the hospital.", "It's next to the bus stop."], x: 'Die Post steht neben der Schule und gegenüber vom Süßigkeitenladen.' },
  { q: "Where's the train station?", o: ["It's opposite Mia's house.", "It's next to the park.", "It's opposite the library."], x: "Der Bahnhof und Mia's house liegen sich an der Park Street gegenüber." },
  { q: "Where's the hospital?", o: ["It's opposite the library.", "It's next to the cinema.", "It's opposite the playground."], x: 'Das Krankenhaus liegt der Bücherei gegenüber, auf der anderen Seite der Market Street.' },
  { q: "Where's the cinema?", o: ["It's in Park Street.", "It's in Green Street.", "It's in School Lane."], x: 'Das Kino steht an der Park Street, gegenüber vom Park.' },
  { q: "Where's the swimming pool?", o: ["It's next to the cinema.", "It's next to the zoo.", "It's opposite the museum."], x: 'Das Schwimmbad steht neben dem Kino.' },
  { q: "Where's the castle?", o: ["Sorry, I don't know.", "It's next to the zoo.", "It's opposite the park."], x: 'Auf dem Plan gibt es keine Burg. Dann sagst du höflich: Sorry, I don\'t know.' },
].map(it => ({ ...it, a: 0, fig: mapFig({}) }));
const TRUE_FALSE = [
  ['The library is opposite the hospital.', true], ['The zoo is next to the museum.', false],
  ['The supermarket is next to the bus stop.', true], ['The cinema is opposite the park.', true],
  ['The school is next to the post office.', true], ['The sweet shop is opposite the hospital.', false],
  ["Tim's house is next to the zoo.", true], ['The train station is in Market Street.', false],
  ['The swimming pool is opposite the playground.', false], ['The museum is opposite the restaurant.', true],
].map(([t, ok]) => ({ fig: mapFig({}), q: t, o: ['True', 'False'], a: ok ? 0 : 1, x: ok ? 'Das stimmt, schau auf dem Plan nach.' : 'Das stimmt nicht, schau noch einmal genau auf den Plan.' }));
const WHERE_CLOZE = [
  { s: 'The post office is ___ the school. It is ___ the sweet shop.', answers: ['next to', 'opposite'], o: ['next to', 'opposite', 'behind'] },
  { s: 'The museum is ___ the hospital and opposite the ___.', answers: ['next to', 'restaurant'], o: ['next to', 'restaurant', 'between', 'cinema'] },
  { s: 'The zoo is ___ Green Street. It is opposite the ___.', answers: ['in', 'playground'], o: ['in', 'playground', 'on', 'park'] },
  { s: 'The cinema is next to the ___. It is opposite the ___.', answers: ['swimming pool', 'park'], o: ['swimming pool', 'park', 'zoo', 'library'] },
  { s: "Mia's house is ___ the train station. It is ___ the supermarket.", answers: ['opposite', 'next to'], o: ['opposite', 'next to', 'between'] },
].map(c => ({ kind: 'cloze', q: `${mapFig({})}<span class="tm-q">Fill in the gaps.</span>`, ...c }));

// ---------------------------------------------------------------------------
// Pets
// ---------------------------------------------------------------------------
const PET_TEXTS = [
  {
    text: "Hi, I'm Lily. I've got a dog. His name is Rocky. He's brown and white. He's four years old. Rocky likes the park.",
    qs: [["What pet has Lily got?", ['a dog', 'a cat', 'a pony']], ["What colour is Rocky?", ['brown and white', 'black and white', 'grey']], ['How old is Rocky?', ['four', 'two', 'six']], ['What does Rocky like?', ['the park', 'carrots', 'the zoo']]],
  },
  {
    text: "This is Ben. He has got a guinea pig. Its name is Coco. Coco is one year old. She is brown and white and she likes carrots.",
    qs: [['What pet has Ben got?', ['a guinea pig', 'a hamster', 'a rabbit']], ["What's its name?", ['Coco', 'Ben', 'Rocky']], ['What does Coco like?', ['carrots', 'apples', 'the park']]],
  },
  {
    text: "This is Emma. She hasn't got a pet. But her friend Sam has got a snake. It's green and it's six years old.",
    qs: [['Has Emma got a pet?', ["No, she hasn't.", 'Yes, she has.', 'Yes, a snake.']], ['What colour is the snake?', ['green', 'yellow', 'black']], ['How old is the snake?', ['six', 'five', 'one']]],
  },
  {
    text: "I've got a cat. My cat's name is Lucky. He's two years old. He's white and grey and he has got black ears. I love Lucky!",
    qs: [['What colour is Lucky?', ['white and grey', 'brown', 'black and white']], ['How old is Lucky?', ['two', 'three', 'twelve']], ['What colour are his ears?', ['black', 'white', 'grey']]],
  },
];
const READING = PET_TEXTS.flatMap(t => t.qs.map(([q, o]) => ({ fig: `<div class="pet-text">${say(t.text)}</div>`, q, o, a: 0 })));

const GRAMMAR = [
  { kind: 'cloze', q: 'I, he or she? Fill in the gaps.', s: "I ___ got a rabbit. My brother ___ got a hamster. My sister ___ got a pony.", answers: ['have', 'has', 'has'], o: ['have', 'has', 'has', 'is'], x: "I have got (I've got), aber he has got und she has got." },
  { kind: 'cloze', q: 'Fill in the gaps.', s: "___ you got a pet? – Yes, I ___. I've got a budgie.", answers: ['Have', 'have'], o: ['Have', 'have', 'Has', 'am'], x: 'Have you got a pet? – Yes, I have. / No, I haven\'t.' },
  { kind: 'cloze', q: 'Fill in the gaps.', s: "Tom ___ got a dog. He ___ got a cat.", answers: ['has', "hasn't"], o: ['has', "hasn't", 'have', "haven't"], x: "Tom has got a dog. He hasn't got a cat." },
  { q: 'Have you got a pet? Was antwortest du, wenn du keins hast?', o: ["No, I haven't.", "No, I hasn't.", "No, I don't got."], a: 0, x: "Kurze Antwort: Yes, I have. / No, I haven't." },
  { q: 'Welcher Satz ist richtig?', o: ['She has got a cat.', 'She have got a cat.', 'She got has a cat.'], a: 0, x: 'Bei he und she heißt es has got.' },
  { q: 'Welcher Satz ist richtig?', o: ["I've got a tortoise.", "I's got a tortoise.", 'I has got a tortoise.'], a: 0, x: "I've got ist die Kurzform von I have got." },
  { q: 'Du willst fragen, welche Farbe das Tier hat.', o: ['What colour is it?', 'How old is it?', "What's its name?"], a: 0 },
  { q: 'Du willst fragen, wie alt das Tier ist.', o: ['How old is it?', 'What colour is it?', 'What is it?'], a: 0 },
  { q: "What's its name?", o: ["It's Rex.", "It's three years old.", "It's brown."], a: 0, x: 'Gefragt ist nach dem Namen.' },
  { q: 'What colour is it?', o: ["It's black and white.", "It's a rabbit.", "It's two years old."], a: 0, x: 'Gefragt ist nach der Farbe.' },
  { kind: 'groups', q: 'Was sagst du bei I, was bei he oder she?', groups: ['I …', 'he / she …'], items: [['have got', 0], ['has got', 1], ["haven't got", 0], ["hasn't got", 1], ["'ve got", 0], ["'s got", 1]] },
  { kind: 'order', q: 'Bring die Wörter in die richtige Reihenfolge.', items: ['Have', 'you', 'got', 'a', 'pet?'] },
];
const COLOUR_ITEMS = [
  ['schwarz', 'black'], ['weiß', 'white'], ['braun', 'brown'], ['grau', 'grey'], ['gelb', 'yellow'], ['grün', 'green'], ['rot', 'red'], ['orange', 'orange'],
].map(([d, e]) => ({ kind: 'type', q: d, lead: 'Welche Farbe ist das auf Englisch?', fields: [{ label: 'English', accept: [e, ...(e === 'grey' ? ['gray'] : [])], sol: e }] }));

const PET_WRITE = [
  { pet: 'rabbit', name: 'Snowy', colour: 'white', age: 'three', likes: 'carrots' },
  { pet: 'dog', name: 'Bello', colour: 'brown and white', age: 'five', likes: 'the park' },
  { pet: 'hamster', name: 'Nugget', colour: 'brown', age: 'one', likes: 'apples' },
].map(f => ({
  q: `<div class="factfile"><img src="img/${f.pet}.webp" alt=""><dl><dt>pet</dt><dd>${f.pet}</dd><dt>name</dt><dd>${f.name}</dd><dt>colour</dt><dd>${f.colour}</dd><dt>How old?</dt><dd>${f.age}</dd><dt>likes</dt><dd>${f.likes}</dd></dl></div>Das ist dein Haustier. Schreib auf Englisch über dein Tier, so wie in der Arbeit: Was ist es, wie heißt es, welche Farbe hat es, wie alt ist es und was mag es?`,
  m: `I've got ${article(f.pet)} ${f.pet}. Its name is ${f.name}. It's ${f.colour}. It's ${f.age} ${f.age === 'one' ? 'year' : 'years'} old. It likes ${f.likes}.`,
  k: [['ve got', 'have got'], [f.pet], [f.name.toLowerCase()], [f.colour], [`${f.age} year`], [`likes ${f.likes}`, `like ${f.likes}`]],
}));

// ---------------------------------------------------------------------------
// From the workbook pages 4 to 7
// ---------------------------------------------------------------------------
const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen'];

const WORKBOOK_PETS = [
  {
    kind: 'cloze', q: 'Read and complete. (Arbeitsheft S. 7, Übung 8)',
    s: "Have you got a pet, Jordan? – Yes, I ___. What is it? – It's a ___. What ___ is it? – It's brown and green. How old is it? – It's ___. ___ its name? – It's Tom. Are tortoises your favourite ___? – Yes, they are. What about you, Mila? – I ___ a pet.",
    answers: ['have', 'tortoise', 'colour', 'four', "What's", 'pet', "haven't got"], o: ['have', 'tortoise', 'colour', 'four', "What's", 'pet', "haven't got"],
    x: "Kurze Antwort: Yes, I have. Und wer kein Tier hat, sagt: I haven't got a pet.",
  },
  {
    kind: 'cloze', q: 'Make the sentences. (Arbeitsheft S. 6, Übung 7)',
    s: "Mona is on the ___ of the good people. Alto, Beta and Cota ___ the Wildlife Park with Mona. Spike lets the animals go free! But the ___ are clever. Wiza ___ Mona's family. That's a big problem. Alto, Beta, Cota and Mona ___ Fruit Island! The children ___ Spike. Wiza is very, very angry.",
    answers: ['planet', 'go to', 'children', 'has got', 'go to', 'help'], o: ['planet', 'go to', 'go to', 'children', 'has got', 'help'],
  },
  {
    kind: 'pairs', q: 'Have you got a pet? Finde die passende Antwort.', pairs: [
      ['Have you got a pet?', 'Yes, I have.'], ['What is it?', "It's a tortoise."], ['What colour is it?', "It's brown and green."],
      ['How old is it?', "It's four."], ["What's its name?", "It's Tom."], ['Are tortoises your favourite pet?', 'Yes, they are.'],
    ],
  },
  { q: 'Mila hat kein Haustier. Was sagt sie?', o: ["I haven't got a pet.", "I hasn't got a pet.", "I have got not a pet."], a: 0, x: "I haven't got a pet. Bei he und she hieße es: She hasn't got a pet." },
  { kind: 'order', q: 'Bring die Wörter in die richtige Reihenfolge.', items: ['Are', 'tortoises', 'your', 'favourite', 'pet?'] },
  { kind: 'cloze', q: 'Fill in the gaps.', s: "In my pet zoo there ___ two rabbits. ___ brown and pink.", answers: ['are', "They're"], o: ['are', "They're", 'is', "It's"], x: 'Bei mehreren Tieren: there are und they are (they\'re).' },
];

// The four children of exercise 3 (p. 5), as ticked in the workbook.
const KIDS = [
  { name: 'Hannah', he: 'She', pet: 'pony', colour: 'black and white', age: 'five' },
  { name: 'Joshua', he: 'He', pet: 'dog', colour: 'brown and white', age: 'twelve' },
  { name: 'Laura', he: 'She', pet: 'rabbit', colour: 'grey', age: 'two' },
  { name: 'Alex', he: 'He', pet: 'spider', colour: 'black', age: 'one' },
];
const yearsOld = age => `${age} ${age === 'one' ? 'year' : 'years'} old`;
const kidsTable = `<table class="kids-tab"><thead><tr><th></th>${KIDS.map(k => `<th>${k.name}</th>`).join('')}</tr></thead><tbody>
  <tr><th>pet</th>${KIDS.map(k => `<td><img src="img/${k.pet}.webp" alt="">${k.pet}</td>`).join('')}</tr>
  <tr><th>colour</th>${KIDS.map(k => `<td>${k.colour}</td>`).join('')}</tr>
  <tr><th>age</th>${KIDS.map(k => `<td>${yearsOld(k.age).replace(' old', '')}</td>`).join('')}</tr></tbody></table>`;
const KIDS_ITEMS = [
  ...KIDS.map(k => ({ q: `What has ${k.name} got?`, o: [`${k.he} has got a ${k.pet}.`, ...shuffle(KIDS.filter(x => x !== k)).slice(0, 2).map(x => `${k.he} has got a ${x.pet}.`)], a: 0 })),
  ...KIDS.map(k => ({ q: `How old is ${k.name}'s ${k.pet}?`, o: [`It's ${yearsOld(k.age)}.`, ...KIDS.filter(x => x !== k).slice(0, 2).map(x => `It's ${yearsOld(x.age)}.`)], a: 0 })),
  { q: "What colour is Joshua's dog?", o: ["It's brown and white.", "It's black and white.", "It's grey."], a: 0 },
  { q: 'Who has got a spider?', o: ['Alex', 'Laura', 'Hannah'], a: 0 },
].map(it => ({ ...it, fig: kidsTable }));

const AGE_ITEMS = [
  ...[1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14].map(n => ({ kind: 'type', lead: 'Schreib die Zahl auf Englisch.', q: String(n), fields: [{ label: 'English', accept: [NUMBERS[n - 1]], sol: NUMBERS[n - 1] }] })),
  { q: "Alex's spider is one ___ old.", o: ['year', 'years'], a: 0, x: 'Bei one heißt es year, ohne s.' },
  { q: "Joshua's dog is twelve ___ old.", o: ['years', 'year'], a: 0, x: 'Ab zwei heißt es years.' },
  { kind: 'cloze', q: 'Fill in the gaps.', s: "How old is it? – It's ___ years old. My hamster is ___ year old.", answers: ['eleven', 'one'], o: ['eleven', 'one', 'twelve', 'two'] },
];

const KIDS_WRITE = [
  ...KIDS.map(k => ({
    q: `<div class="figure wide">${kidsTable}</div>Look at the table. Write about ${k.name}. (Arbeitsheft S. 5, Übung 4: „… has got …“)`,
    m: `${k.name} has got a ${k.pet}. It's ${k.colour}. It's ${yearsOld(k.age)}.`,
    k: [['has got'], [k.pet], [k.colour], [yearsOld(k.age).replace(' old', '')]],
  })),
  {
    q: 'Read. Think about your pet or a pet you want. Answer. (Arbeitsheft S. 7, Übung 9)<br>1 What is it? 2 What colour is it? 3 How old is it? 4 What\'s its name?',
    m: "It's a dog. It's brown and white. It's three years old. Its name is Bello.",
    points: ["What is it? – It's a …", "What colour is it? – It's …", "How old is it? – It's … years old.", "What's its name? – It's … / Its name is …"],
  },
];

// ---------------------------------------------------------------------------
// Worlds
// ---------------------------------------------------------------------------
const placePairs = keys => keys.map(k => ({ a: en(k), b: de(k), art: k }));

const TOPICS = [
  {
    id: 'town', img: 'img/town.webp', title: 'Places in town', sub: 'Die Orte in der Stadt: zoo, library, cinema …', art: 'cinema', badge: 'Town Explorer',
    learn: [
      { h: 'Places in town (1)', p: 'Diese Orte kennst du aus deinem Arbeitsheft. Tipp auf den Lautsprecher, dann hörst du, wie man das Wort ausspricht.', words: PLACE_WORDS.slice(0, 8) },
      { h: 'Places in town (2)', p: 'Und noch mehr Orte, dazu die Schule, der Park und die Brücke.', words: PLACE_WORDS.slice(8) },
      {
        h: 'Has this town got …?', p: 'So fragst du, ob es in einer Stadt etwas gibt, und so antwortest du:',
        bullets: [say('Has this town got a zoo?') + ' – ' + say('Yes, it has.'), say('Has this town got a castle?') + ' – ' + say("No, it hasn't."), say('Yes, it has got three.') + ' (Es gibt sogar drei davon.)'],
      },
    ],
    levels: [
      { type: 'learn', title: 'Die Orte' },
      { type: 'imgquiz', title: 'What place is it?', pool: PLACE_WORDS, prompt: 'What place is it?' },
      { type: 'match', title: 'Englisch – Deutsch (1)', prompt: 'Verbinde das englische Wort mit dem deutschen.', pairs: placePairs(PLACE_WORDS.slice(0, 8)) },
      { type: 'memory', title: 'Orte-Memory', pool: PLACE_WORDS },
      { type: 'match', title: 'Englisch – Deutsch (2)', prompt: 'Verbinde das englische Wort mit dem deutschen.', pairs: placePairs(PLACE_WORDS.slice(8)) },
      { type: 'mc', title: 'Was heißt …?', items: PLACE_WORDS.map(k => transItem(k, PLACE_WORDS, k === 'library' ? ['bookshop'] : [])) },
      { type: 'mix', title: 'Schreib das Wort', items: PLACE_WORDS.map(spellItem) },
      {
        type: 'mix', title: 'Has this town got …?', items: [
          {
            kind: 'pairs', q: 'Read and find the pairs. Match.', pairs: [
              ['Has this town got a sweet shop?', "Yes, it has. But don't go there – sugar isn't good for you."],
              ['Has this town got a zoo?', 'Yes, it has. You can see a baby panda there now.'],
              ['Has this town got a library?', "No, it hasn't, but there's a great bookshop."],
              ['Has this town got a playground?', "No, it hasn't. But it has got a nice park to play."],
              ['Has this town got a restaurant?', 'Yes, it has got three. They are all very good.'],
            ],
          },
          ...[['zoo', true], ['castle', false], ['cinema', true], ['bakery', false], ['swimming pool', true], ['toy shop', false], ['hospital', true], ['lake', false]].map(([w, yes]) => ({
            q: `${mapFig({})}<span class="tm-q">Look at the map. Has this town got ${article(w)} ${w}?</span>`, o: ['Yes, it has.', "No, it hasn't."], a: yes ? 0 : 1,
          })),
        ],
      },
    ],
  },
  {
    id: 'where', img: 'img/where.webp', title: 'Where is it?', sub: 'next to, opposite, between, behind, in front of', art: 'map', badge: 'Map Reader',
    learn: [
      { h: 'Wo ist was?', p: 'Mit diesen Wörtern sagst du, wo etwas ist.', preps: ['next', 'between', 'opposite'] },
      { h: 'Hinter und vor', p: 'Auch diese beiden brauchst du oft.', preps: ['behind', 'front'] },
      {
        h: "Where's the …?", p: 'So fragst du nach dem Weg und so antwortest du mit dem Stadtplan:', map: true,
        bullets: [say("Where's the cinema?") + ' – ' + say("It's in Park Street. It's opposite the park."), say("Where's the zoo?") + ' – ' + say("It's next to Tim's house."), say("Where's the castle?") + ' – ' + say("Sorry, I don't know.")],
      },
    ],
    levels: [
      { type: 'learn', title: 'Die Wörter' },
      { type: 'fig', title: 'Welches Wort passt?', items: PREP_ITEMS },
      { type: 'fig', title: "Where's the …?", items: WHERE_ITEMS },
      { type: 'fig', title: 'True or false?', items: TRUE_FALSE },
      { type: 'mix', title: 'Lückentexte zum Plan', items: WHERE_CLOZE },
      {
        type: 'swrite', title: 'Sätze über die Stadt', items: [
          { q: `${mapFig({ mark: ['zoo'] })}Where's the zoo? Schreib zwei Sätze auf Englisch.`, m: "The zoo is in Green Street. It's next to Tim's house and opposite the playground.", k: [['green street'], ['next to tim'], ['opposite the playground', 'opposite playground']] },
          { q: `${mapFig({ mark: ['cinema'] })}Where's the cinema? Schreib zwei Sätze auf Englisch.`, m: "The cinema is in Park Street. It's next to the swimming pool and opposite the park.", k: [['park street'], ['next to the swimming pool', 'next to swimming pool'], ['opposite the park', 'opposite park']] },
          { q: `${mapFig({ mark: ['library'] })}Where's the library? Schreib zwei Sätze auf Englisch.`, m: "The library is in Market Street. It's next to the restaurant and opposite the hospital.", k: [['market street'], ['next to the restaurant', 'next to restaurant'], ['opposite the hospital', 'opposite hospital']] },
        ],
      },
    ],
  },
  {
    id: 'ways', img: 'img/ways.webp', title: 'Directions', sub: 'Den Weg auf dem Stadtplan beschreiben', art: 'arrow', badge: 'Way Finder',
    learn: [
      { h: 'So sagst du den Weg', p: 'Diese Sätze brauchst du für jede Wegbeschreibung.', phrases: true },
      { h: 'Noch mehr Wege', bullets: [say('Turn left at the cinema.') + ' (am Kino links abbiegen)', say('Go through the park.') + ' (durch den Park gehen)', say("It's on your left.") + ' (Es ist auf der linken Seite.)', say("It's on your right.") + ' (Es ist auf der rechten Seite.)', say("It's opposite the zoo.") + ' (Es ist gegenüber vom Zoo.)'] },
      {
        h: 'Links oder rechts?', p: 'Auf dem Plan ist links nicht immer links. Stell dir vor, du läufst selbst den Weg entlang, oder lege den Finger auf den Pfeil und dreh das Blatt, bis der Pfeil von dir weg zeigt.',
        bullets: ['Läufst du auf dem Plan nach unten, sind links und rechts vertauscht.', 'Merktrick: Streck beide Hände aus, Daumen und Zeigefinger der linken Hand bilden ein L wie left.'],
      },
      { h: 'Ein Weg auf dem Plan', p: 'Der rote Pfeil ist der Start, der Stern das Ziel. So klingt der Weg:', route: 'r1' },
      {
        h: 'So schreibst du eine Wegbeschreibung',
        steps: ['Fang am roten Pfeil an: <i>Go straight on.</i>', 'An jeder Kreuzung, an der du abbiegst: <i>Turn left at the …</i> oder <i>Turn right at the …</i>', 'Unterwegs: <i>Go past the …</i>, <i>Go across the bridge.</i> oder <i>Go through the park.</i>', 'Am Ziel: <i>The … is on your left/right.</i>', 'Wenn du magst, noch: <i>It\'s opposite/next to the …</i>'],
      },
      {
        h: 'Eine Nachricht an einen Freund', p: 'So kann eine kurze Nachricht mit dem Weg zu deinem Haus aussehen:',
        bullets: ['Hi Sam,', 'this is how you get to my house.', 'Go straight on. Turn right at the post office. …', "My house is next to the zoo.", 'See you soon, Tim'],
      },
    ],
    levels: [
      { type: 'learn', title: 'Die Sätze' },
      { type: 'fig', title: 'Welcher Pfeil?', items: PHRASES.map(p => ({ fig: arrowArt(p.k), q: 'Was zeigt der Pfeil?', o: [p.en, ...PHRASES.filter(x => x.k !== p.k).map(x => x.en).slice(0, 3)], a: 0 })) },
      { type: 'mix', title: 'Folge dem Weg (1)', items: ['r1', 'r3', 'r4', 'r6', 'r7', 'r10'].map(r => ({ kind: 'maptap', route: r, q: `<span class="tm-dir">${say(routeText(r))}</span>` })) },
      { type: 'fig', title: 'Links oder rechts?', items: ['r1', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r11', 'r12'].map(turnItem) },
      { type: 'mix', title: 'Lückentexte zum Weg', items: ROUTE_CLOZE.map(clozeItem) },
      { type: 'mix', title: 'Sätze ordnen', items: ['r2', 'r5', 'r8', 'r9', 'r12'].map(r => ({ kind: 'order', q: `${mapFig({ route: r, goal: ROUTES[r].goal })}<span class="tm-q">Bring die Sätze in die richtige Reihenfolge.</span>`, items: ROUTES[r].text })) },
      { type: 'mix', title: 'Wörter schreiben', items: ROUTE_TYPE.map(typeRouteItem) },
      { type: 'mix', title: 'Folge dem Weg (2)', items: ['r2', 'r5', 'r8', 'r9', 'r11', 'r12'].map(r => ({ kind: 'maptap', route: r, q: `<span class="tm-dir">${say(routeText(r))}</span>` })) },
      {
        type: 'mix', title: 'Aus deinem Arbeitsheft', items: [{
          kind: 'cloze', q: 'Look, read and complete. (Arbeitsheft S. 11, Übung 9)',
          s: "Go ___ the park. Turn ___ at the cinema. Go past the ___ and go straight on. Go ___ the bridge. Then ___ right after the museum and right again. Stuart's house is ___ the museum.",
          answers: ['through', 'right', 'supermarket', 'across', 'turn', 'opposite'], o: ['through', 'right', 'supermarket', 'across', 'turn', 'opposite'],
          x: 'Durch den Park (through), am Kino rechts (right), am Supermarkt vorbei, über die Brücke (across), dann rechts abbiegen (turn), und das Haus liegt gegenüber vom Museum (opposite).',
        }],
      },
      { type: 'write', title: 'Den Weg beschreiben', items: [writeRoute('r1', 'oben rechts'), writeRoute('r4', 'unten'), writeRoute('r5', 'links unten'), writeRoute('r6', 'oben rechts'), writeRoute('r7', 'oben links'), writeRoute('r9', 'oben')] },
      {
        type: 'write', title: 'Nachricht an einen Freund', items: [
          { q: `${mapFig({ route: 'r12', goal: 'train_station' })}Dein Freund kommt mit dem Zug. Schreib ihm eine kurze Nachricht auf Englisch, wie er vom roten Pfeil zum Bahnhof kommt. Fang mit „Hi …“ an und hör mit „See you soon“ auf.`, m: `Hi Sam, this is how you get to the train station. ${routeText('r12')} See you soon, Tim`, k: [[' hi'], ...routeKeys('r12'), ['see you soon']] },
          { q: `${mapFig({ route: 'r9', goal: 'mias_house' })}Du wohnst in Mia's house (Stern). Schreib deiner Freundin eine Nachricht auf Englisch, wie sie vom roten Pfeil zu dir kommt.`, m: `Hi Lena, this is how you get to my house. ${routeText('r9')} See you soon, Mia`, k: [[' hi'], ...routeKeys('r9'), ['see you soon']] },
          { q: `${mapFig({ route: 'r3', goal: 'post_office' })}Ihr trefft euch an der Post. Schreib deinem Freund eine Nachricht auf Englisch, wie er vom roten Pfeil dorthin kommt.`, m: `Hi Ben, this is how you get to the post office. ${routeText('r3')} See you soon, Tim`, k: [[' hi'], ...routeKeys('r3'), ['see you soon']] },
        ],
      },
    ],
  },
  {
    id: 'pets', img: 'img/pets.webp', title: 'Pets', sub: 'Haustiere, Farben und „I\'ve got …“', art: 'dog', badge: 'Pet Friend',
    learn: [
      { h: 'Pets (1)', p: 'Diese zwölf Tiere stehen in deinem Arbeitsheft auf S. 4. Tipp auf den Lautsprecher, dann hörst du das Wort.', words: BOOK_PETS.slice(0, 6) },
      { h: 'Pets (2)', p: 'Und die anderen sechs:', words: BOOK_PETS.slice(6) },
      { h: 'Colours', p: 'So sagst du, welche Farbe ein Tier hat:', bullets: [say("It's black.") + ' schwarz', say("It's white.") + ' weiß', say("It's brown.") + ' braun', say("It's grey.") + ' grau', say("It's red.") + ' rot', say("It's yellow and green.") + ' gelb und grün', say("It's brown and white.") + ' braun und weiß', say("It's black and white.") + ' schwarz und weiß'] },
      {
        h: "I've got … / He has got …", p: 'Bei <b>I</b> sagst du <i>have got</i>, bei <b>he</b> und <b>she</b> sagst du <i>has got</i>.',
        bullets: [say("I've got a mouse."), say('He has got a pony.'), say('She has got a cat.'), say("Emma hasn't got a pet."), say('Have you got a pet?') + ' – ' + say('Yes, I have.') + ' / ' + say("No, I haven't.")],
      },
      {
        h: 'Fragen zum Haustier', p: 'Mit diesen Fragen erfährst du alles über ein Tier:',
        bullets: [say('What is it?') + ' – ' + say("It's a rabbit."), say('What colour is it?') + ' – ' + say("It's white."), say('How old is it?') + ' – ' + say("It's three years old."), say("What's its name?") + ' – ' + say("It's Snowy."), say('What does it like?') + ' – ' + say('It likes carrots.')],
      },
      {
        h: 'How old is it?', p: 'Die Zahlen von 1 bis 14 brauchst du für das Alter. Achtung: <i>one year</i> ohne s, ab zwei <i>years</i>.',
        bullets: [NUMBERS.slice(0, 7).map((n, i) => `${i + 1} ${say(n)}`).join(' · '), NUMBERS.slice(7).map((n, i) => `${i + 8} ${say(n)}`).join(' · '), say("It's one year old."), say("It's twelve years old.")],
      },
      {
        h: 'Favourite pet und pet zoo', p: 'Auch das steht in deinem Arbeitsheft:',
        bullets: [say('Are tortoises your favourite pet?') + ' – ' + say('Yes, they are.'), say("What about you? – I haven't got a pet."), say('In my pet zoo there are two rabbits.') + ' ' + say("They're brown and pink.")],
      },
    ],
    levels: [
      { type: 'learn', title: 'Haustiere' },
      { type: 'imgquiz', title: 'What pet is it?', pool: PET_WORDS, prompt: 'What pet is it?' },
      { type: 'match', title: 'Englisch – Deutsch (1)', prompt: 'Verbinde das englische Wort mit dem deutschen.', pairs: placePairs(PET_WORDS.slice(0, 7)) },
      { type: 'memory', title: 'Tier-Memory', pool: PET_WORDS },
      { type: 'match', title: 'Englisch – Deutsch (2)', prompt: 'Verbinde das englische Wort mit dem deutschen.', pairs: placePairs(PET_WORDS.slice(7)) },
      { type: 'mc', title: 'Was heißt …?', items: PET_WORDS.map(k => transItem(k, PET_WORDS)) },
      { type: 'mix', title: 'Schreib das Tier', items: PET_WORDS.map(spellItem) },
      { type: 'mix', title: 'Colours', items: COLOUR_ITEMS },
      { type: 'mix', title: "I've got … / has got", items: GRAMMAR },
      { type: 'fig', title: 'Lesen: Haustiere', items: READING },
      { type: 'swrite', title: 'Schreib über ein Haustier', items: PET_WRITE },
      // Added from the workbook pages 4 to 7 (new levels only at the end of the world).
      { type: 'mix', title: 'Aus deinem Arbeitsheft', items: WORKBOOK_PETS },
      { type: 'fig', title: 'Hannah, Joshua, Laura, Alex', items: KIDS_ITEMS },
      { type: 'mix', title: 'How old is it?', items: AGE_ITEMS },
      { type: 'swrite', title: '… has got …', items: KIDS_WRITE },
    ],
  },
];
