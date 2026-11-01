// Learning content of English Quest, taken over verbatim from the learner's earlier app:
// Green Line 2, Welcome back! and Unit 1 "The new boy" (vocabulary pp. 209–217), irregular verbs,
// simple past with questions, short answers and negation. The practice texts are our own texts
// around Ty, Ryan, Lily and Sherlock, the vocabulary list holds only word and translation.

const VOCAB_GROUPS = [
  { id: "wb",  name: "Welcome back!",        pages: "S. 209–210" },
  { id: "hol", name: "Holiday words",        pages: "S. 211" },
  { id: "u1",  name: "Unit 1 – The new boy", pages: "S. 211–213" },
  { id: "s1",  name: "Station 1",            pages: "S. 213–216" },
  { id: "s2",  name: "Station 2",            pages: "S. 216" },
  { id: "s2x", name: "Station 2 – Wortkasten", pages: "S. 216" },
  { id: "s3",  name: "Station 3",            pages: "S. 217" }
];

// [English, German, group, extras]; extras: n = note (AE, BE, pl, sg, ...), alt = more accepted answers.
const VOCAB_RAW = [
  // Welcome back!, p. 209
  ["lake", "See", "wb"],
  ["cloudy", "bedeckt; bewölkt", "wb"],
  ["around", "um … herum; umher", "wb"],
  ["fire", "Feuer", "wb"],
  ["stick", "Stock; Schläger", "wb"],
  ["rock climbing", "Klettern", "wb"],
  ["arts and crafts", "Kunsthandwerk", "wb"],
  ["instead", "stattdessen", "wb"],
  ["photography contest", "Fotowettbewerb", "wb"],
  ["guy", "Typ; Kerl; (Pl.) Leute", "wb"],
  ["pyramid", "Pyramide", "wb"],
  ["mummy", "Mumie", "wb"],
  ["to joke", "scherzen; Spaß machen", "wb"],
  ["ride", "Fahrt; Ritt", "wb"],
  ["soon", "bald", "wb"],
  ["to teach", "unterrichten; lehren; beibringen", "wb"],
  ["trick", "Kunststückchen", "wb"],
  ["Guess what?", "Weißt du was?; Rate mal, was passiert ist.", "wb"],
  ["to guess", "raten; erraten; vermuten", "wb"],
  ["to give a high five", "abklatschen; einschlagen", "wb"],
  ["early", "früh", "wb"],
  ["to practise", "üben; trainieren", "wb"],
  ["coach", "Trainer/-in", "wb"],
  ["local", "örtlich; lokal", "wb"],
  // p. 210
  ["news", "Nachricht(en); Neuigkeit(en)", "wb", { n: "sg" }],
  ["message", "Botschaft; Nachricht", "wb"],
  ["postcard", "Postkarte", "wb"],
  ["fun park", "Freizeitpark", "wb"],
  ["campsite", "Zeltplatz; Campingplatz", "wb"],
  ["mountain", "Berg", "wb"],
  ["forest", "Wald", "wb"],
  ["tent", "Zelt", "wb"],
  ["north", "Norden; Nord-", "wb"],
  ["south", "Süden; Süd-", "wb"],
  ["were", "warst; wart; waren", "wb"],
  ["was", "war", "wb"],
  ["at first", "zuerst; zunächst", "wb"],
  ["only", "einzige/-r/-s", "wb"],
  ["adult", "Erwachsene/-r", "wb"],
  ["rollercoaster", "Achterbahn", "wb", { alt: ["roller coaster"] }],
  ["at all", "überhaupt", "wb"],
  ["even", "sogar; selbst", "wb"],
  ["better", "besser; lieber", "wb"],
  ["than", "als (bei Vergleichen)", "wb"],
  ["age", "Alter", "wb"],
  ["excited", "aufgeregt; begeistert", "wb"],
  // Holiday words, p. 211
  ["in a city", "in einer Stadt", "hol", { alt: ["in a town"] }],
  ["at home", "zu Hause", "hol"],
  ["at somebody's house", "im Haus von …", "hol"],
  ["in the country", "auf dem Land", "hol"],
  ["in the mountains", "in den Bergen", "hol"],
  ["in the forest", "im Wald", "hol"],
  ["at the beach", "am Strand", "hol"],
  ["by the sea", "am Meer", "hol"],
  ["on the coast", "an der Küste", "hol"],
  ["at a museum", "in einem Museum", "hol"],
  ["at a castle", "in einem Schloss", "hol"],
  ["at an arts and crafts market", "auf einem Kunsthandwerkermarkt", "hol"],
  ["at a hotel", "im Hotel", "hol"],
  ["in a swimming pool", "in einem Schwimmbad", "hol"],
  ["on a city tour", "auf einer Stadtrundfahrt", "hol"],
  ["at a fun park", "in einem Vergnügungspark", "hol"],
  ["cycling", "Radfahren", "hol"],
  ["hiking", "Wandern", "hol"],
  ["on a mountain", "auf einem Berg", "hol"],
  ["at a campsite", "auf einem Campingplatz", "hol"],
  ["in a tent", "in einem Zelt", "hol"],
  ["horse riding", "Reiten", "hol"],
  ["surfing", "Surfen", "hol"],
  ["windsurfing", "Windsurfen", "hol"],
  ["fishing", "Angeln", "hol"],
  ["on a boat ride", "auf einer Bootstour", "hol"],
  // Unit 1, pp. 211–213
  ["deaf", "gehörlos; schwerhörig; taub", "u1"],
  ["support centre", "Hilfszentrum; Betreuungszentrum; Förderzentrum", "u1", { alt: ["support center"] }],
  ["dance", "Tanz; Tanzveranstaltung", "u1"],
  ["class", "Unterricht; Unterrichtsstunde; Kurs", "u1"],
  ["against", "gegen", "u1"],
  ["to belong (to)", "gehören (zu)", "u1"],
  ["disability", "Behinderung", "u1"],
  ["support", "Unterstützung; Hilfe", "u1"],
  ["subject", "Schulfach", "u1"],
  ["drama", "Theater; Drama", "u1"],
  ["design technology", "Produktdesign", "u1"],
  ["to design", "entwerfen; gestalten", "u1"],
  ["product", "Produkt; Erzeugnis", "u1"],
  ["science", "Wissenschaft; Naturwissenschaft", "u1"],
  ["biology", "Biologie", "u1"],
  ["chemistry", "Chemie", "u1"],
  ["physics", "Physik", "u1"],
  ["humanities", "Sozialwissenschaften", "u1", { n: "pl" }],
  ["geography", "Geografie; Erdkunde", "u1"],
  ["coding", "Programmierung", "u1"],
  ["choir", "Chor", "u1"],
  ["to welcome", "willkommen heißen", "u1"],
  ["fair", "Messe; Jahrmarkt", "u1"],
  ["to raise money", "Geld sammeln", "u1"],
  ["buddy", "Kumpel", "u1", { n: "infml" }],
  ["registration", "Anwesenheitskontrolle", "u1"],
  ["maths", "Mathematik; Mathe", "u1"],
  ["RE", "Religion (Schulfach)", "u1", { alt: ["religious education"] }],
  ["French", "französisch; Französisch", "u1"],
  ["PE", "Sportunterricht", "u1", { alt: ["physical education"] }],
  ["history", "Geschichte (Schulfach)", "u1"],
  ["art", "Kunst", "u1"],
  ["music", "Musik", "u1"],
  ["computer science", "Informatik", "u1"],
  ["cooking", "Kochen", "u1"],
  ["photography", "Fotografie", "u1"],
  ["exchange", "Austausch; Austausch-", "u1"],
  ["slide", "Folie", "u1"],
  ["to be like", "sein (wie)", "u1"],
  ["comment", "Kommentar", "u1"],
  ["slide show", "Folienpräsentation", "u1", { alt: ["slideshow"] }],
  ["playground", "Schulhof; Pausenhof; Spielplatz", "u1"],
  // Station 1, pp. 213–216
  ["accent", "Akzent", "s1"],
  ["to arrive", "ankommen", "s1"],
  ["trip", "Trip; Reise; Ausflug; Fahrt", "s1", { alt: ["journey"] }],
  ["to fly", "fliegen", "s1", { n: "flew" }],
  ["bag", "Koffer; Reisetasche", "s1"],
  ["ready", "fertig; bereit", "s1"],
  ["himself", "selbst; sich (selbst)", "s1"],
  ["I'd like to …", "Ich möchte …; Ich würde gern …", "s1", { alt: ["I would like to"] }],
  ["to move (into)", "umziehen; einziehen", "s1"],
  ["to unpack", "auspacken", "s1"],
  ["American", "Amerikaner/-in; amerikanisch", "s1"],
  ["farewell", "Abschied; Abschieds-", "s1"],
  ["to promise", "versprechen", "s1"],
  ["to hate", "hassen; nicht mögen", "s1"],
  ["true", "wahr", "s1"],
  ["soccer", "Fußball", "s1", { n: "AE", alt: ["football"] }],
  ["page", "Seite", "s1"],
  ["to join", "beitreten; sich anschließen; verbinden", "s1"],
  ["this morning", "heute Morgen", "s1"],
  ["journey", "Reise; Fahrt", "s1", { alt: ["trip"] }],
  ["airport", "Flughafen", "s1"],
  ["to cry", "weinen", "s1"],
  ["to fix", "reparieren; befestigen", "s1"],
  ["to paint", "streichen", "s1"],
  ["to laugh", "lachen", "s1"],
  ["yesterday", "gestern", "s1"],
  ["event", "Ereignis; Veranstaltung", "s1"],
  ["to chat", "chatten; plaudern", "s1"],
  ["ago", "vor (zeitlich)", "s1"],
  ["to organise", "organisieren", "s1", { alt: ["to organize"] }],
  ["normal", "normal", "s1"],
  ["good luck", "(viel) Glück", "s1"],
  ["to present", "präsentieren; vorstellen", "s1"],
  ["charity", "Wohltätigkeitsorganisation; wohltätige Zwecke", "s1"],
  ["organisation", "Organisation", "s1", { alt: ["organization"] }],
  ["to collect", "sammeln", "s1"],
  ["sick", "krank; unwohl", "s1"],
  ["poor", "arm", "s1"],
  ["environment", "Umwelt; Umgebung", "s1"],
  ["international", "international", "s1"],
  ["to clap", "klatschen", "s1"],
  ["eye", "Auge", "s1"],
  ["Roll two dice.", "Würfelt mit zwei Würfeln.", "s1"],
  ["to enjoy", "genießen; sich freuen an", "s1"],
  ["backwards", "rückwärts", "s1"],
  ["to carry", "tragen", "s1"],
  ["to tidy (up)", "aufräumen; in Ordnung bringen", "s1"],
  ["rubbish", "Müll; Gerümpel", "s1"],
  ["feeling", "Gefühl", "s1"],
  ["clean", "sauber", "s1"],
  ["sale", "Verkauf; Schlussverkauf", "s1"],
  // Station 2, p. 216
  ["skill", "Fertigkeit; Geschick", "s2"],
  ["equipment", "Ausstattung; Ausrüstung", "s2"],
  ["for example", "zum Beispiel", "s2"],
  ["robot", "Roboter; Automat", "s2"],
  ["to be interested in", "interessiert sein an; sich interessieren für", "s2"],
  ["creative writing", "kreatives Schreiben", "s2"],
  ["author", "Autor/-in", "s2"],
  // Station 2, word box on p. 216
  ["eco", "Öko-", "s2x"],
  ["dying", "sterbend", "s2x"],
  ["fashion", "Mode", "s2x"],
  ["industry", "Industrie; Branche; Gewerbe", "s2x"],
  ["company", "Firma; Unternehmen; Gesellschaft", "s2x"],
  ["distance", "Distanz; Entfernung", "s2x"],
  ["flight", "Flug", "s2x"],
  ["to create", "(er)schaffen; erfinden", "s2x"],
  ["waste", "Abfall", "s2x"],
  ["reusable", "wiederverwendbar; Mehrweg-", "s2x"],
  ["energy", "Energie; Kraft", "s2x"],
  ["to waste", "verschwenden", "s2x"],
  ["shipping", "Versand; Transport", "s2x"],
  ["to transport", "transportieren", "s2x"],
  ["halfway around the world", "um die halbe Welt", "s2x"],
  ["naked", "nackt", "s2x"],
  ["still", "Standbild", "s2x"],
  ["audience", "Publikum", "s2x"],
  ["climate", "Klima", "s2x"],
  ["close-up", "Nahaufnahme", "s2x"],
  ["close", "nahe", "s2x"],
  ["shot", "(Kamera-)Einstellung", "s2x"],
  ["body language", "Körpersprache", "s2x"],
  ["confident", "selbstsicher; selbstbewusst", "s2x"],
  ["awkward", "peinlich; ungünstig; ungeschickt; unbeholfen", "s2x"],
  // Station 3, p. 217
  ["both … and …", "sowohl … als auch …", "s3", { alt: ["both and"] }],
  ["photographer", "Fotograf/-in", "s3"],
  ["by the way", "übrigens", "s3"],
  ["fall", "Herbst", "s3", { n: "AE" }],
  ["else", "andere/-r/-s; sonst noch", "s3"],
  ["performance", "Aufführung; Vorstellung", "s3"],
  ["language", "Sprache", "s3"],
  ["pants", "Hose", "s3", { n: "AE, pl" }],
  ["French fries", "Pommes frites", "s3", { n: "AE, pl" }],
  ["anyway", "trotzdem; jedenfalls; sowieso", "s3"],
  ["biscuit", "Keks", "s3", { n: "BE" }],
  ["candy", "Süßigkeiten", "s3", { n: "AE" }],
  ["cookie", "Keks", "s3", { n: "AE" }],
  ["to decide", "(sich) entscheiden", "s3"],
  ["grade", "Note; Klasse", "s3", { n: "AE" }],
  ["clever", "schlau; klug; intelligent", "s3"],
  ["smart", "schlau; klug; intelligent", "s3"],
  ["to work", "funktionieren", "s3"],
  ["during", "während", "s3", { n: "+ noun" }]
];

// The irregular verbs from the learner's exercise book, the only ones practised.
// [base form, simple past, German, more accepted answers]
const IRREGULAR_RAW = [
  ["feel", "felt", "(sich) fühlen"],
  ["fly", "flew", "fliegen"],
  ["give", "gave", "geben"],
  ["go", "went", "gehen; fahren"],
  ["have", "had", "haben"],
  ["take", "took", "nehmen; (mit)bringen"],
  ["think", "thought", "denken; glauben"],
  ["do", "did", "tun; machen"],
  ["forget", "forgot", "vergessen"],
  ["come", "came", "kommen"],
  ["sell", "sold", "verkaufen"],
  ["wear", "wore", "tragen (Kleidung)"],
  ["be", "was/were", "sein", ["was", "were", "was were", "were was"]],
  ["say", "said", "sagen"],
  ["eat", "ate", "essen"],
  ["sing", "sang", "singen"],
  ["win", "won", "gewinnen"],
  ["read", "read", "lesen"],
  ["see", "saw", "sehen"],
  ["want", "wanted", "wollen"],
  ["try", "tried", "versuchen; probieren"],
  ["understand", "understood", "verstehen"]
];

// A longer list only for spotting mistakes such as "didn't drove"; never asked.
const IRREGULAR_ALL = [
  ["be", "was/were", "sein", ["was", "were", "was were", "were was"]],
  ["become", "became", "werden"],
  ["begin", "began", "beginnen; anfangen"],
  ["break", "broke", "(zer)brechen; kaputt machen"],
  ["bring", "brought", "(mit)bringen"],
  ["build", "built", "bauen"],
  ["buy", "bought", "kaufen"],
  ["can", "could", "können"],
  ["catch", "caught", "fangen; erwischen"],
  ["choose", "chose", "(aus)wählen"],
  ["come", "came", "kommen"],
  ["cost", "cost", "kosten"],
  ["cut", "cut", "schneiden"],
  ["do", "did", "tun; machen"],
  ["draw", "drew", "zeichnen"],
  ["drink", "drank", "trinken"],
  ["drive", "drove", "(Auto) fahren"],
  ["eat", "ate", "essen"],
  ["fall", "fell", "fallen"],
  ["feed", "fed", "füttern"],
  ["feel", "felt", "(sich) fühlen"],
  ["find", "found", "finden"],
  ["fly", "flew", "fliegen"],
  ["forget", "forgot", "vergessen"],
  ["get", "got", "bekommen; holen; werden"],
  ["give", "gave", "geben"],
  ["go", "went", "gehen; fahren"],
  ["grow", "grew", "wachsen"],
  ["have", "had", "haben"],
  ["hear", "heard", "hören"],
  ["hide", "hid", "(sich) verstecken"],
  ["hit", "hit", "schlagen; treffen"],
  ["hold", "held", "halten"],
  ["hurt", "hurt", "wehtun; verletzen"],
  ["keep", "kept", "(be)halten"],
  ["know", "knew", "wissen; kennen"],
  ["leave", "left", "verlassen; (weg)gehen; abfahren"],
  ["lend", "lent", "(ver)leihen"],
  ["let", "let", "lassen"],
  ["lose", "lost", "verlieren"],
  ["make", "made", "machen; herstellen"],
  ["mean", "meant", "bedeuten; meinen"],
  ["meet", "met", "(sich) treffen; kennenlernen"],
  ["pay", "paid", "(be)zahlen"],
  ["put", "put", "legen; stellen; setzen"],
  ["read", "read", "lesen"],
  ["ride", "rode", "reiten; (Rad) fahren"],
  ["ring", "rang", "klingeln; anrufen"],
  ["run", "ran", "rennen; laufen"],
  ["say", "said", "sagen"],
  ["see", "saw", "sehen"],
  ["sell", "sold", "verkaufen"],
  ["send", "sent", "schicken; senden"],
  ["shine", "shone", "scheinen"],
  ["sing", "sang", "singen"],
  ["sit", "sat", "sitzen"],
  ["sleep", "slept", "schlafen"],
  ["speak", "spoke", "sprechen"],
  ["spend", "spent", "ausgeben; verbringen"],
  ["stand", "stood", "stehen"],
  ["steal", "stole", "stehlen"],
  ["swim", "swam", "schwimmen"],
  ["take", "took", "nehmen; (mit)bringen"],
  ["teach", "taught", "unterrichten; beibringen"],
  ["tell", "told", "erzählen; sagen"],
  ["think", "thought", "denken; glauben"],
  ["throw", "threw", "werfen"],
  ["understand", "understood", "verstehen"],
  ["wake (up)", "woke (up)", "aufwachen; wecken", ["woke", "woke up"]],
  ["wear", "wore", "tragen (Kleidung)"],
  ["win", "won", "gewinnen"],
  ["write", "wrote", "schreiben"]
];

// ---------------------------------------------------------------------------
// Grammar
// ---------------------------------------------------------------------------

const RULE_TEXT = {
  ed:  "Normalfall: Grundform + -ed (talk → talked).",
  d:   "Endet das Verb auf -e, hängst du nur -d an (like → liked).",
  dbl: "Kurzer betonter Vokal + ein Konsonant am Ende: Konsonant verdoppeln (stop → stopped).",
  ied: "Konsonant + y am Ende: y wird zu -ied (try → tried).",
  yed: "Vokal + y am Ende: einfach -ed anhängen (play → played)."
};

// Regular verbs: [base form, simple past, spelling rule from RULE_TEXT]
const REGULAR_RAW = [
  ["talk", "talked", "ed"], ["want", "wanted", "ed"], ["ask", "asked", "ed"], ["watch", "watched", "ed"],
  ["help", "helped", "ed"], ["walk", "walked", "ed"], ["start", "started", "ed"], ["call", "called", "ed"],
  ["cook", "cooked", "ed"], ["listen", "listened", "ed"], ["unpack", "unpacked", "ed"], ["wait", "waited", "ed"],
  ["visit", "visited", "ed"], ["answer", "answered", "ed"], ["laugh", "laughed", "ed"], ["paint", "painted", "ed"],
  ["fix", "fixed", "ed"], ["jump", "jumped", "ed"], ["collect", "collected", "ed"], ["post", "posted", "ed"],
  ["like", "liked", "d"], ["move", "moved", "d"], ["love", "loved", "d"], ["promise", "promised", "d"],
  ["dance", "danced", "d"], ["arrive", "arrived", "d"], ["live", "lived", "d"], ["decide", "decided", "d"],
  ["invite", "invited", "d"], ["organise", "organised", "d"], ["practise", "practised", "d"], ["raise", "raised", "d"],
  ["hate", "hated", "d"], ["chase", "chased", "d"], ["change", "changed", "d"], ["close", "closed", "d"],
  ["plan", "planned", "dbl"], ["stop", "stopped", "dbl"], ["shop", "shopped", "dbl"], ["clap", "clapped", "dbl"],
  ["chat", "chatted", "dbl"], ["drop", "dropped", "dbl"], ["hug", "hugged", "dbl"], ["jog", "jogged", "dbl"],
  ["try", "tried", "ied"], ["cry", "cried", "ied"], ["carry", "carried", "ied"], ["tidy", "tidied", "ied"],
  ["study", "studied", "ied"], ["hurry", "hurried", "ied"], ["worry", "worried", "ied"],
  ["play", "played", "yed"], ["stay", "stayed", "yed"], ["enjoy", "enjoyed", "yed"]
];

// Simple present or simple past? [sentence with ___, verb, answer, signal word, tense]
const SIGNAL_RAW = [
  ["Ty ___ with his friends in New York two days ago.", "chat", "chatted", "two days ago", "past"],
  ["Karam often ___ with his mum at the weekend.", "cook", "cooks", "often", "present"],
  ["Ruby and her friends ___ football in the park yesterday.", "play", "played", "yesterday", "past"],
  ["I ___ my grandparents every month.", "visit", "visit", "every month", "present"],
  ["The TTS students ___ money at the Autumn Fair last year.", "raise", "raised", "last year", "past"],
  ["Ryan ___ his dad in the garden last weekend.", "help", "helped", "last weekend", "past"],
  ["Ryan always ___ his dad in the garden on Saturdays.", "help", "helps", "always … on Saturdays", "present"],
  ["My parents ___ my birthday party two weeks ago.", "organise", "organised", "two weeks ago", "past"],
  ["Lily ___ photos every day.", "take", "takes", "every day", "present"],
  ["Lily ___ lots of photos at the party last Friday.", "take", "took", "last Friday", "past"],
  ["The Austins ___ to London last week.", "fly", "flew", "last week", "past"],
  ["Sherlock usually ___ in the park in the morning.", "run", "runs", "usually", "present"],
  ["We ___ fish and chips yesterday evening.", "have", "had", "yesterday evening", "past"],
  ["Mrs Wilson ___ about the Autumn Fair this morning.", "talk", "talked", "this morning (vorbei)", "past"],
  ["Ty ___ to Thomas Tallis School every day.", "walk", "walks", "every day", "present"],
  ["Three days ago Josh ___ his funny hat.", "wear", "wore", "three days ago", "past"]
];

// Questions with did: [building blocks, answer]
const QUESTIONS_RAW = [
  ["Ty | have dinner at Ryan's house", "Did Ty have dinner at Ryan's house?"],
  ["you | eat my pizza", "Did you eat my pizza?"],
  ["Lily | take the bus home", "Did Lily take the bus home?"],
  ["the Austins | fly to London", "Did the Austins fly to London?"],
  ["Ryan | show Ty the library", "Did Ryan show Ty the library?"],
  ["you | enjoy your first day at TTS", "Did you enjoy your first day at TTS?"],
  ["Sherlock | do tricks at the Autumn Fair", "Did Sherlock do tricks at the Autumn Fair?"],
  ["Ava | send the party photos", "Did Ava send the party photos?"],
  ["your friends | like the farewell party", "Did your friends like the farewell party?"],
  ["Karam | go swimming | last weekend", "Did Karam go swimming last weekend?"],
  ["you | watch a film | yesterday", "Did you watch a film yesterday?"],
  ["Ruby | play a video game | two days ago", "Did Ruby play a video game two days ago?"],
  ["they | go to a party | last summer", "Did they go to a party last summer?"],
  ["Ty | try the burgers in the cafeteria", "Did Ty try the burgers in the cafeteria?"],
  ["Mrs Wilson | talk about the Autumn Fair", "Did Mrs Wilson talk about the Autumn Fair?"],
  ["you guys | miss me", "Did you guys miss me?"],
  ["Josh | wear his funny hat", "Did Josh wear his funny hat?"],
  ["the students | laugh at Ty's accent", "Did the students laugh at Ty's accent?"],
  ["Ty's parents | unpack the boxes", "Did Ty's parents unpack the boxes?"],
  ["you | listen to British hip hop", "Did you listen to British hip hop?"]
];

// Questions with was/were: [building blocks, answer]
const BE_QUESTIONS_RAW = [
  ["the trip | long", "Was the trip long?"],
  ["the students | nervous on the first day", "Were the students nervous on the first day?"],
  ["Ty's farewell party | a surprise", "Was Ty's farewell party a surprise?"],
  ["you | at home yesterday", "Were you at home yesterday?"],
  ["Lily | at the Photography Club", "Was Lily at the Photography Club?"],
  ["Ryan and Karam | in the library", "Were Ryan and Karam in the library?"]
];

// Short answers: [question, + or -, answer, extra hint, more accepted answers]
const SHORT_RAW = [
  ["Did Ryan play football?", "+", "Yes, he did."],
  ["Did Lily feel sick?", "+", "Yes, she did."],
  ["Did the Austins stay in a hotel?", "+", "Yes, they did."],
  ["Did you go to bed early?", "-", "No, I didn't.", "antworte für dich (I)"],
  ["Did Sherlock eat Ruby's dinner?", "-", "No, he didn't.", "", ["No, it didn't."]],
  ["Did Ty and Ryan listen to hip hop?", "+", "Yes, they did."],
  ["Did Ava call you yesterday?", "+", "Yes, she did.", "antworte als Ty (I)"],
  ["Did you guys enjoy school without me?", "-", "No, we didn't.", "antworte für die Gruppe (we)"],
  ["Did your mum make pizza?", "-", "No, she didn't."],
  ["Did Josh wear his funny hat?", "-", "No, he didn't."],
  ["Did it rain yesterday?", "+", "Yes, it did."],
  ["Did Karam and you win the game?", "+", "Yes, we did."],
  ["Did Mrs Wilson send Lily home?", "+", "Yes, she did."],
  ["Did the students laugh?", "+", "Yes, they did."],
  ["Did Ty like the dance class?", "+", "Yes, he did."],
  ["Did you walk home?", "-", "No, I didn't.", "antworte für dich (I)"],
  ["Was the party a surprise?", "+", "Yes, it was."],
  ["Were the students nervous?", "-", "No, they weren't."],
  ["Was Ty excited?", "+", "Yes, he was."],
  ["Were you at home yesterday?", "-", "No, I wasn't.", "antworte für dich (I)"],
  ["Was Lily at the Photography Club?", "-", "No, she wasn't."],
  ["Were Ryan and Ruby in the kitchen?", "+", "Yes, they were."]
];

// Which form is right? [task, options (the first one is right), explanation]
const MC_GRAMMAR_RAW = [
  ["Welche Frage ist richtig?", ["Did you go to the park?", "Did you went to the park?", "Do you went to the park?", "Went you to the park?"], "Nach did kommt die Grundform: go – nicht went."],
  ["Welche Frage ist richtig?", ["Did Ryan like the film?", "Did Ryan liked the film?", "Does Ryan liked the film?", "Liked Ryan the film?"], "did + Grundform: Did Ryan like …?"],
  ["Welcher Satz ist richtig?", ["Ty didn't understand the words.", "Ty didn't understood the words.", "Ty not understood the words.", "Ty don't understood the words."], "Verneinung: didn't + Grundform (understand)."],
  ["Welcher Satz ist richtig?", ["Lily didn't take the bus.", "Lily didn't took the bus.", "Lily doesn't took the bus.", "Lily took not the bus."], "didn't + Grundform: didn't take."],
  ["Welche Kurzantwort passt? – Did Lily feel sick?", ["Yes, she did.", "Yes, she felt.", "Yes, Lily did.", "Yes, she does."], "Kurzantwort: Yes, + Pronomen + did."],
  ["Welche Kurzantwort passt? – Did the Austins fly to London?", ["Yes, they did.", "Yes, they flew.", "Yes, they do.", "Yes, the Austins did."], "Namen werden zum Pronomen: the Austins → they."],
  ["Welcher Satz ist richtig?", ["The trip wasn't easy.", "The trip didn't be easy.", "The trip didn't was easy.", "The trip weren't easy."], "Bei be verneinst du mit wasn't/weren't – ohne didn't."],
  ["Welche Frage ist richtig?", ["Were the students nervous?", "Did the students be nervous?", "Did the students were nervous?", "Was the students nervous?"], "Bei be: Was/Were + Subjekt …? Mehrzahl → Were."],
  ["Welcher Satz ist richtig?", ["We didn't have time.", "We hadn't time.", "We didn't had time.", "We don't had time."], "didn't + Grundform: didn't have."],
  ["Welche Kurzantwort passt? – Did you and Karam win?", ["No, we didn't.", "No, you didn't.", "No, I didn't.", "No, we don't."], "you and Karam → we."]
];

// Ty's weekend list: [+ done / - not done, activity, answer without subject]; the subject is Ty or He.
const TY_LIST_RAW = [
  ["+", "unpack his boxes", "unpacked his boxes"],
  ["-", "tidy up his room", "didn't tidy up his room"],
  ["-", "do his homework", "didn't do his homework"],
  ["+", "play with Sherlock in the park", "played with Sherlock in the park"],
  ["-", "buy new football boots", "didn't buy new football boots"],
  ["+", "chat with Josh and Ava", "chatted with Josh and Ava"],
  ["-", "go to bed early", "didn't go to bed early"],
  ["+", "watch an American TV show", "watched an American TV show"],
  ["-", "write a postcard to his grandpa", "didn't write a postcard to his grandpa"],
  ["-", "eat any vegetables", "didn't eat any vegetables"],
  ["+", "read a comic", "read a comic"],
  ["-", "help his mum in the kitchen", "didn't help his mum in the kitchen"],
  ["+", "try fish and chips", "tried fish and chips"],
  ["-", "learn the rules of football", "didn't learn the rules of football"]
];

// Positive to negative: [sentence, answer]
const TRANSFORM_RAW = [
  ["Ryan went to the library.", "Ryan didn't go to the library."],
  ["Lily took lots of photos.", "Lily didn't take lots of photos."],
  ["The Austins had a big house in New York.", "The Austins didn't have a big house in New York."],
  ["Karam told a funny joke.", "Karam didn't tell a funny joke."],
  ["I found the rules of football easy.", "I didn't find the rules of football easy."],
  ["We saw the comedy show.", "We didn't see the comedy show."],
  ["Sherlock ate the sandwiches.", "Sherlock didn't eat the sandwiches."],
  ["Ty felt nervous.", "Ty didn't feel nervous."],
  ["My parents bought a new car.", "My parents didn't buy a new car."],
  ["Ruby wanted a new phone.", "Ruby didn't want a new phone."],
  ["Josh wore his funny hat.", "Josh didn't wear his funny hat."],
  ["The teacher gave us homework.", "The teacher didn't give us homework."],
  ["Ty liked the burgers.", "Ty didn't like the burgers."],
  ["The trip was short.", "The trip wasn't short."],
  ["The students were bored.", "The students weren't bored."],
  ["Ryan's phone worked.", "Ryan's phone didn't work."]
];

// Sentence builder: [sentence, trap words]
const ORDER_RAW = [
  ["Did Ryan show Ty the school?", ["showed"]],
  ["Lily didn't go to the Photography Club.", ["went"]],
  ["Did the Austins stay in a hotel?", ["stayed"]],
  ["We didn't talk about the Autumn Fair.", ["talked"]],
  ["Did you try the food in the cafeteria?", ["tried"]],
  ["Sherlock didn't eat my dinner.", ["ate"]],
  ["Did Ava send the party photos?", ["sent", "does"]],
  ["Ty didn't understand the British words.", ["understood"]],
  ["Was the trip long?", ["Did"]],
  ["The students weren't bored.", ["didn't"]],
  ["Did your friends like the farewell party?", ["liked"]],
  ["I didn't see you after school.", ["saw"]],
  ["Did Karam win a prize at the fair?", ["won"]],
  ["Ruby didn't have time for lunch.", ["had"]]
];

// ---------------------------------------------------------------------------
// Gap stories
// ---------------------------------------------------------------------------
// [hint=answer|alternative]; a hint like "not go" asks for the negative (didn't go).
const STORIES = [
  {
    id: "st1", title: "Ty's first week", icon: "🏫", focus: "Regelmäßige Verben",
    intro: "Ty schreibt seinem Grandpa in New York. Setze die Verben ins Simple Past.",
    text: "Hi Grandpa!\nLast Monday I [start=started] at Thomas Tallis School. At first I was nervous, but my new classmates [help=helped] me a lot. Ryan [show=showed] me the library and we [talk=talked] about football. On Wednesday we [dance=danced] in dance class – it was fun! In the evening Mum [cook=cooked] my favourite meal and we [watch=watched] a funny film. On Friday I [try=tried] fish and chips for the first time. I [like=liked] them a lot! My new friends [plan=planned] a trip to Greenwich Park, and we [stop=stopped] at a café on the way. I [carry=carried] Sherlock's ball all day – he [love=loved] it!\nTalk soon, Ty"
  },
  {
    id: "st2", title: "Goodbye, New York!", icon: "🗽", focus: "Unregelmäßige Verben",
    intro: "Ty erzählt von seiner Abschiedsparty. Setze die Verben ins Simple Past.",
    text: "The day before we [leave=left] New York, my friends [have=had] a surprise party for me. Josh [come=came] to my house and [say=said], \"Come with me!\" We [go=went] to Ava's garden. All my friends [be=were] there. They [give=gave] me presents and [sing=sang] a song for me. We [eat=ate] pizza and cake. Ava [take=took] lots of photos. I [feel=felt] sad, but I [know=knew] they were my friends for ever. The next day we [fly=flew] to London."
  },
  {
    id: "st3", title: "Josh's boring weekend", icon: "🌧️", focus: "Positiv oder negativ",
    intro: "Josh schreibt Ty. Bei „not …“ brauchst du die Verneinung mit didn't.",
    text: "Hi Ty! My weekend [be=was] really boring. My parents [decide=decided] to visit my aunt in the country. We [not take=didn't take] the train – we [drive=drove] for four hours! When we [arrive=arrived], it [start=started] to rain. My aunt [make=made] soup for lunch, but I [not like=didn't like] it. Her internet [not work=didn't work], so I [not chat=didn't chat] with anyone. In the afternoon I [read=read] an old comic and [fall=fell] asleep on the sofa. We [not go=didn't go] to the lake because of the rain. On the way home Dad [get=got] lost. I [be=was] so happy when I [see=saw] our house again!"
  },
  {
    id: "st4", title: "The star of the show", icon: "🐶", focus: "Gemischt",
    intro: "Ryan erzählt vom Autumn Fair. Setze die Verben ins Simple Past.",
    text: "Last Saturday was the TTS Autumn Fair. Sherlock and I [not sell=didn't sell] cakes this year – we [do=did] a comedy show! First Sherlock [jump=jumped] over a chair. Then he [run=ran] around the stage and [chase=chased] his tail. The audience [laugh=laughed] and [clap=clapped]. Lily [play=played] music and Karam [wear=wore] a funny costume. Ruby [win=won] a prize in a competition. We [raise=raised] a lot of money for charity. Everyone [think=thought] Sherlock was the star of the show – and they [be=were] right!"
  },
  {
    id: "st5", title: "The language thing", icon: "🇬🇧", focus: "Gemischt + BE/AE",
    intro: "Wie Ty die britischen Wörter lernte. Setze die Verben ins Simple Past.",
    text: "When Ty [come=came] to London, he [not know=didn't know] all the British words. On his first day he [say=said] \"I like your pants!\" and everyone [laugh=laughed]. Ty [not understand=didn't understand] the problem. Later in the cafeteria he [ask=asked] for chips, and the cook [give=gave] him French fries! After school his new friends [teach=taught] him more words: sweets, not candy, and biscuits, not cookies. Ty [write=wrote] all the new words in his notebook. He [not forget=didn't forget] them!"
  },
  {
    id: "st6", title: "Back from school", icon: "💬", focus: "Fragen & Kurzantworten",
    intro: "Ty kommt nach Hause. Bilde Fragen mit did und passende Kurzantworten.",
    text: "Mum: Hi Ty! [you / have=Did you have] a nice day at school?\nTy: Yes, I [=did]. It was great.\nMum: [you / eat=Did you eat] lunch in the cafeteria?\nTy: Yes, but I [not like=didn't like] the burgers.\nMum: [Ryan / show=Did Ryan show] you the clubs page?\nTy: No, he [=didn't]. He [forget=forgot] about it.\nMum: [Lily / help=Did Lily help] you with your pictures?\nTy: Yes, she [=did]. She [be=was] really nice.\nMum: [the students / laugh=Did the students laugh] at your accent again?\nTy: No, they [=didn't]. Not today!"
  },
  {
    id: "st7", title: "I didn't see you!", icon: "📱", focus: "Fragen & Verneinung",
    intro: "Ruby und Lily chatten. Ergänze Fragen, Kurzantworten und Verneinungen.",
    text: "Ruby: Hi Lily! I [not see=didn't see] you after school today.\nLily: I [feel=felt] sick, so I [not go=didn't go] to the Photography Club.\nRuby: Oh no! [Mrs Wilson / send=Did Mrs Wilson send] you home?\nLily: Yes, she [=did].\nRuby: [you / walk=Did you walk] home?\nLily: No, I [=didn't]. I [take=took] the bus.\nRuby: [you / feel=Did you feel] better at home?\nLily: Yes, I [=did]. I [go=went] to bed for an hour.\nRuby: That's great! See you tomorrow!"
  }
];

// ---------------------------------------------------------------------------
// Listening (read aloud by the browser's speech synthesis)
// ---------------------------------------------------------------------------
const LISTENING = [
  {
    id: "l1", title: "Ty's first day at TTS", icon: "🏫",
    lines: [["N", "Hi, I'm Ty. Last Monday was my first day at Thomas Tallis School. I was excited, but I was nervous too. My buddy Ryan met me at the gate and showed me the school. First we had maths, and then we had technology. I didn't like the maths lesson because it was very difficult. At lunchtime I went to the cafeteria with Ryan, Ruby, Lily and Karam. I asked for chips, and I got French fries! Everyone laughed. In the afternoon we had dance. Ryan hates dance, but I really enjoyed it. After school I didn't take the bus. I walked home with Ryan and his dog Sherlock."]],
    q: [
      ["Ty was only excited – he wasn't nervous.", false],
      ["Ryan showed Ty the school.", true],
      ["Ty liked the maths lesson.", false],
      ["Ty had lunch with his new friends.", true],
      ["Ty enjoyed the dance lesson.", true],
      ["Ty took the bus home.", false]
    ]
  },
  {
    id: "l2", title: "A video call with Josh", icon: "📞",
    voices: { J: "Josh", T: "Ty" },
    lines: [
      ["J", "Hey Ty! How was your weekend?"],
      ["T", "Hi Josh! It was great. On Saturday we took a bus to Canary Wharf and went shopping."],
      ["J", "Did you buy anything cool?"],
      ["T", "Yes, I did. I bought a new football shirt. A British one!"],
      ["J", "A football shirt? You mean soccer!"],
      ["T", "Ha ha. Here it's football. On Sunday I played football with Ryan and Karam in Greenwich Park."],
      ["J", "Did you win?"],
      ["T", "No, we didn't. Karam's team won. But it was fun."],
      ["J", "Did you eat pizza in the park again?"],
      ["T", "No, not this time. We had a picnic. Lily's mum made sandwiches."],
      ["J", "Cool. I miss you, man. The basketball club isn't the same without you."],
      ["T", "I miss you guys too. Say hi to Ava!"]
    ],
    q: [
      ["Ty went shopping on Saturday.", true],
      ["Ty bought a basketball shirt.", false],
      ["Ty played football on Sunday.", true],
      ["Ty's team won the game.", false],
      ["They ate pizza in the park.", false],
      ["Josh misses Ty.", true]
    ]
  },
  {
    id: "l3", title: "Ryan's lazy Sunday", icon: "🛋️",
    lines: [["N", "Ryan had a long list of things to do last Sunday, but he didn't do much. In the morning he didn't tidy up his bedroom. He stayed in bed and read a new comic. At eleven o'clock his mum called him for breakfast. After breakfast Ryan took Sherlock to the park. They played with a ball for an hour. In the afternoon Ryan didn't do his homework. He played a video game with Ty instead. In the evening he chatted with his grandma and grandpa on the phone. He didn't go to bed early. He watched a film until ten o'clock."]],
    q: [
      ["Ryan tidied up his bedroom in the morning.", false],
      ["Ryan read a comic in bed.", true],
      ["Ryan took Sherlock to the park.", true],
      ["Ryan did his homework in the afternoon.", false],
      ["Ryan played a video game with Ty.", true],
      ["Ryan went to bed early.", false]
    ]
  },
  {
    id: "l4", title: "History Day in New York", icon: "🎩",
    lines: [["N", "Ryan, did I tell you about History Day at my old school in New York? Before History Day we did special lessons about American history. My class practised a show for two weeks. We changed the show three times because our teacher had new ideas! I didn't buy a costume. My mum made one for me. On History Day I wore a big old hat and we sang songs from the nineteen-twenties. The parents thought the show was really good. We didn't sell cake, but we raised some money for a children's hospital."]],
    q: [
      ["Ty's class did special lessons before History Day.", true],
      ["They practised the show for two days.", false],
      ["Ty bought a costume.", false],
      ["Ty wore a hat.", true],
      ["The class sold cake.", false],
      ["They raised some money.", true]
    ]
  },
  {
    id: "l5", title: "Lily's day", icon: "📸",
    voices: { R: "Ruby", L: "Lily" },
    lines: [
      ["R", "Hi Lily! I didn't see you at the Photography Club yesterday."],
      ["L", "No, I felt sick, so I didn't go."],
      ["R", "Oh no! Did Mrs Wilson send you home?"],
      ["L", "Yes, she did. My mum came and took me home by car."],
      ["R", "Did you feel better at home?"],
      ["L", "Yes, I did. I went to bed for an hour, and then I felt fine. In the evening I helped Ty with his pictures."],
      ["R", "Did he like your photos?"],
      ["L", "Yes, he did. He wants to put them on his walls!"]
    ],
    q: [
      ["Lily was at the Photography Club yesterday.", false],
      ["Lily felt sick.", true],
      ["Lily walked home.", false],
      ["Lily went to bed for an hour.", true],
      ["Lily helped Ty in the evening.", true],
      ["Ty didn't like the photos.", false]
    ]
  }
];

// Dictation sentences
const DICTATION = [
  "Ty flew to London last week.",
  "We didn't stop at the café.",
  "Did you enjoy the Autumn Fair?",
  "Sherlock ran around and chased his tail.",
  "I tried to call you yesterday.",
  "Lily took lots of photos.",
  "Ryan didn't tidy up his room.",
  "The students laughed at Ty's accent.",
  "My friends gave me some presents.",
  "Did Karam win a prize?",
  "I didn't understand the British words.",
  "Ruby thought the show was funny.",
  "They planned a trip to Greenwich.",
  "Was the trip long?",
  "No, they didn't."
];

// ---------------------------------------------------------------------------
// Reading comprehension on the textbook texts (pp. 15, 20, 22); the first option is right
// ---------------------------------------------------------------------------
const READING = [
  { p: 15, q: "How did Ty feel on his first day at TTS?", o: ["Excited and nervous.", "Bored.", "Angry and tired.", "Only happy."] },
  { p: 15, q: "When did the Austins leave New York?", o: ["On Monday.", "On Tuesday.", "On Friday.", "On Sunday."] },
  { p: 15, q: "When did they arrive at Heathrow?", o: ["On Tuesday morning.", "On Monday evening.", "On Friday morning.", "On Sunday night."] },
  { p: 15, q: "How did they get from Heathrow to Paddington Station?", o: ["They took the Heathrow Express.", "They took a taxi.", "They walked.", "They took a bus."] },
  { p: 15, q: "Why did the family stay in a hotel?", o: ["Their house wasn't ready until Friday.", "They didn't like their new house.", "The hotel was cheap.", "Their bags were lost."] },
  { p: 15, q: "Where do Lily's mum and sister live?", o: ["In Stonebridge, North London.", "In Greenwich.", "In New York.", "In South London."] },
  { p: 15, q: "What did Ty's friends do at the farewell party?", o: ["They came and gave him presents.", "They sang a song in the gym.", "They took a bus to the airport.", "They didn't come."] },
  { p: 15, q: "What did Ryan forget to tell Ty about?", o: ["The clubs page on the TTS website.", "The dance lesson.", "The cafeteria.", "His dog Sherlock."] },
  { p: 15, q: "What did Ryan, Ruby, Lily and Karam do at the last Autumn Fair?", o: ["A comedy show.", "A cake sale.", "A football match.", "A photography contest."] },
  { p: 15, q: "Which sports does Ty like?", o: ["Basketball and soccer (football).", "Tennis and swimming.", "Only basketball.", "Rugby and cricket."] },
  { p: 15, q: "Why does Karam think Ryan is strange?", o: ["Ryan thinks his old friends are boring now.", "Ryan hates football.", "Ryan wants to move to America.", "Ryan didn't come to school."] },
  { p: 20, q: "When does Tallis Live meet?", o: ["Every Friday after school.", "Every Monday in the library.", "On Tuesdays at lunchtime.", "Every morning before school."] },
  { p: 20, q: "What can you do at Tallis Live?", o: ["Make videos and podcasts.", "Build robots.", "Write stories.", "Play football."] },
  { p: 20, q: "Which club is for Years 7, 8 and 9?", o: ["The Coding and Robot Club.", "Tallis Live.", "The Creative Writing Club.", "The Drama Club."] },
  { p: 20, q: "Who is the teacher of the Coding and Robot Club?", o: ["Mrs Evans.", "Mr Roberts.", "Mrs Thomas.", "Mrs Wilson."] },
  { p: 20, q: "Where does the Creative Writing Club meet?", o: ["In the library.", "In Room 1115.", "In the gym.", "In the cafeteria."] },
  { p: 20, q: "What is the best thing about the Creative Writing Club?", o: ["You can meet real authors from Britain and America.", "You can use special cameras.", "You can work with robots.", "You don't need to write."] },
  { p: 22, q: "What did Ava promise Ty?", o: ["To send him all the party pictures.", "To visit him in London.", "To call him every day.", "To send him American candy."] },
  { p: 22, q: "What didn't Josh wear at the party?", o: ["His funny hat.", "His football shirt.", "His school uniform.", "His new shoes."] },
  { p: 22, q: "Who is helping Ty with his pictures?", o: ["Lily.", "Ruby.", "Ava.", "Karam."] },
  { p: 22, q: "Why do students sell things or do performances at the Autumn Fair?", o: ["To raise money for charity.", "To buy new books for the library.", "To win a school prize.", "To pay for a school trip."] },
  { p: 22, q: "Why did the students laugh when Ty said \"I like your pants!\"?", o: ["In British English, pants are what you wear under your trousers.", "Ty's accent was very strange.", "The students didn't wear pants.", "Ty said it in French."] },
  { p: 22, q: "What did Ty get when he asked for chips in the cafeteria?", o: ["French fries.", "Crisps.", "Biscuits.", "Candy."] },
  { p: 22, q: "Which year is Ty in now?", o: ["Year 8.", "Year 7.", "Year 6.", "Year 9."] },
  { p: 22, q: "What is the name of Ty's dog in New York?", o: ["Luna.", "Sherlock.", "Lucy.", "Buddy."] },
  { p: 22, q: "Why is Ryan happy about Ty?", o: ["Ty is into football and hip hop too.", "Ty has a dog.", "Ty is good at maths.", "Ty can speak French."] }
];

// ---------------------------------------------------------------------------
// British vs. American English: [British, American, German] and spellings [American, British]
// ---------------------------------------------------------------------------
const BEAE = [
  ["biscuit", "cookie", "Keks"],
  ["clever", "smart", "schlau"],
  ["football", "soccer", "Fußball"],
  ["sweets", "candy", "Süßigkeiten"],
  ["trousers", "pants", "Hose"],
  ["chips", "French fries", "Pommes frites"],
  ["autumn", "fall", "Herbst"]
];
const SPELLING = [
  ["color", "colour"], ["neighbor", "neighbour"], ["favorite", "favourite"], ["center", "centre"], ["mom", "mum"]
];

// Dice game "Something funny for money": [activity or comment, sentence in the simple past]
const DICE_ACT = [
  ["turn off my phone for the day", "I turned off my phone for the day."],
  ["go everywhere in my pyjamas", "I went everywhere in my pyjamas."],
  ["walk backwards for 30 minutes", "I walked backwards for 30 minutes."],
  ["carry a friend's school bag", "I carried a friend's school bag."],
  ["try not to laugh all day", "I tried not to laugh all day."],
  ["speak in a funny voice", "I spoke in a funny voice."]
];
const DICE_COM = [
  ["have lots of fun", "I had lots of fun."],
  ["find that difficult", "I found that difficult."],
  ["feel great", "I felt great."],
  ["do my best", "I did my best."],
  ["enjoy the day", "I enjoyed the day."],
  ["raise lots of money", "I raised lots of money."]
];

// Ideas from the old writing workshop: what did you not do in the summer holidays?
const WRITING_IDEAS = ['get up early', 'do homework', 'go to school', 'wear a school uniform', 'go to bed at 8', 'tidy up my room', 'play football', 'watch TV', 'see my teacher', 'eat vegetables'];

// Titles of the textbook texts for the reading questions.
const READING_TEXTS = { 15: 'We only arrived last week!', 20: 'This is our club!', 22: "Sorry I didn't post last week!" };
