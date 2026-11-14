// Worlds of the music app, one per competence of the teacher's self-check sheet.
// Never reorder worlds or levels once published, progress is stored per world id
// and level position; append new ones at the end.

const STAFF_NOTES = ["c'", "d'", "e'", "f'", "g'", "a'", "h'", "c''", "d''", "e''", "f''", "g''"];
const ALL_NOTES = ["a", "h", ...STAFF_NOTES, "a''", "h''", "c'''"];
const HIGH_LOW = ["a", "h", "c'", "d''", "e''", "f''", "g''", "a''", "h''", "c'''", "h'"];

const TOPICS = [
  {
    id: 'notes', img: 'img/notes.webp', title: 'Töne im Violinschlüssel', sub: 'Benennen und notieren, MusiX S. 36 und 37', art: 'clef', badge: 'Notenleser',
    learn: [
      { h: 'So lernst du bis Mittwoch', p: 'Die Welten folgen dem Infoblatt „Das muss ich für die Klassenarbeit können“. Oben auf der Startseite siehst du deinen Kompetenzbogen: Mit jedem Stern wandert dein Haken von „noch nicht“ Richtung „sicher“.', bullets: ['<b>Samstag:</b> Töne im Violinschlüssel (Welt 1) und Intervalle (Welt 2)', '<b>Sonntag:</b> Melodien analysieren (Welt 3) und beschreiben (Welt 4)', '<b>Montag:</b> Xylophon (Welt 5) und die Fehlerkiste', '<b>Dienstag:</b> Probe-Klassenarbeit und „Alles für die Klassenarbeit“'] },
      { h: 'Das Notensystem', p: 'Das Notensystem umfasst 5 Linien. Man zählt sie von unten nach oben, genauso die 4 Zwischenräume dazwischen. Darin notiert man Tonhöhen und Tonlängen.', bullets: ['Für Töne, die über das Notensystem hinausreichen, verwendet man <b>Hilfslinien</b>. Das sind kurze Linien, die die fünf Linien des Notensystems ergänzen.', 'Am Anfang stehen der Notenschlüssel, eventuell <b>Vorzeichen</b> und die <b>Taktart</b> (z. B. 3/4), darüber manchmal eine <b>Tempoangabe</b>. Ein <b>Taktstrich</b> trennt die Takte.'] },
      { h: 'Der Violinschlüssel', p: 'Ein Notenschlüssel „schließt“ das Notensystem auf. Der Violinschlüssel wird auch <b>G-Schlüssel</b> genannt: Er ist aus dem Buchstaben G entstanden und legt den Ton g′ auf der 2. Linie fest. Sobald eine Note festgelegt ist, bekommen alle anderen Noten automatisch ihre Namen.', staff: { notes: ["g'"], hi: [0] }, bullets: ['Weitere Schlüssel: der <b>Bassschlüssel</b> (F-Schlüssel) und der <b>Bratschenschlüssel</b> (C-Schlüssel).'] },
      { h: 'Die Stammtöne', p: 'Es gibt nur 7 verschiedene weiße Tasten auf dem Klavier. Nach dem 7. Ton geht es, wie bei den Wochentagen, wieder von vorne los. Die weißen Tasten heißen <b>Stammtöne</b>: c d e f g a h. Im Deutschen heißt der Ton <b>h</b>, nicht b.', staff: { notes: ["c'", "d'", "e'", "f'", "g'", "a'", "h'", "c''"] }, bullets: ['Die Stammtöne werden immer abwechselnd auf einer Linie und in einem Zwischenraum notiert.', 'Das <b>mittlere c</b> heißt c′ (auch c1) und sitzt auf der ersten Hilfslinie unter dem Notensystem.'] },
      { h: 'Die Oktavstriche', p: 'Von c′ bis h′ bekommen die Töne einen Strich (eingestrichene Oktave), ab c″ zwei Striche (zweigestrichene Oktave), ab c‴ drei. Unter c′ haben die Töne keinen Strich: h, a, g. Der Strich gehört zum Namen, d′ und d″ sind verschiedene Töne!', staff: { notes: ["a", "h", "c'", "c''", "d''", "g''", "a''", "c'''"] } },
      { h: 'Merkhilfe für die Linien', p: 'Diese Merkhilfe stammt nicht aus dem Unterricht, hilft aber beim schnellen Lesen:', bullets: ['<b>Linien</b> von unten: e′ g′ h′ d″ f″, merk dir „<b>E</b>s <b>G</b>eht <b>H</b>eute <b>D</b>och <b>F</b>ußball“.', '<b>Zwischenräume</b> von unten: f′ a′ c″ e″, das ergibt das Wort <b>FACE</b>.', 'Unter der untersten Linie liegt d′, darunter auf der Hilfslinie c′. Über der obersten Linie liegt g″, auf der ersten Hilfslinie darüber a″.', 'Achtung bei hohen Tönen und Tönen unter dem System: Zähl lieber einmal mehr von einem sicheren Ton aus.'] },
      { h: 'Notenhälse', p: 'Merke: Bei Notenköpfen unterhalb der mittleren Linie zeigen die Notenhälse nach oben und sitzen rechts. Bei denen ab der mittleren Linie zeigen die Notenhälse nach unten und sitzen links.', staff: { notes: ["e'", "g'", "h'", "d''"], gap: 40 } },
    ],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'nameMc', title: 'Töne im System', notes: STAFF_NOTES },
      { type: 'mix', title: 'Notensystem-Quiz', items: [
        { q: 'Wie viele Linien hat ein Notensystem?', o: ['5', '4', '6', '7'], a: 0, x: 'Das Notensystem umfasst 5 Linien und 4 Zwischenräume.' },
        { q: 'Wie wird der Violinschlüssel noch genannt?', o: ['G-Schlüssel', 'F-Schlüssel', 'C-Schlüssel', 'Bassschlüssel'], a: 0, x: 'Er ist aus dem Buchstaben G entstanden und legt den Ton g′ fest.' },
        { q: 'Welchen Ton legt der Violinschlüssel fest?', o: ['g′ auf der 2. Linie', 'c′ auf der Hilfslinie', 'f′ auf der 4. Linie', 'h′ auf der mittleren Linie'], a: 0, x: 'Der Violinschlüssel kringelt sich um die 2. Linie von unten, dort liegt g′.' },
        { q: 'Wie heißen die Stammtöne?', o: ['c d e f g a h', 'c d e f g a b', 'a b c d e f g', 'do re mi fa so la ti'], a: 0, x: 'Die weißen Tasten heißen Stammtöne. Im Deutschen heißt der siebte Ton h.' },
        { q: 'Wofür braucht man Hilfslinien?', o: ['für Töne, die über das Notensystem hinausreichen', 'um Takte voneinander zu trennen', 'für besonders laute Töne', 'für Pausen'], a: 0, x: 'Hilfslinien sind kurze Linien, die die fünf Linien des Notensystems ergänzen.' },
        { q: 'Was trennt die Takte voneinander?', o: ['der Taktstrich', 'die Taktart', 'die Hilfslinie', 'das Vorzeichen'], a: 0, x: 'Der Taktstrich ist ein senkrechter Strich durch das Notensystem.' },
        { q: 'Was gibt die 3/4 am Anfang einer Melodie an?', o: ['die Taktart', 'das Tempo', 'die Tonart', 'die Lautstärke'], a: 0, x: '3/4 ist die Taktart, der Dreivierteltakt.' },
        { q: 'Wo sitzt das mittlere c (c′)?', o: ['auf der 1. Hilfslinie unter dem Notensystem', 'auf der 1. Linie', 'im 3. Zwischenraum', 'auf der 1. Hilfslinie über dem Notensystem'], a: 0, x: 'c′ hat eine eigene kleine Hilfslinie unter dem System.' },
        { q: 'Eine Note sitzt auf der mittleren Linie. In welche Richtung zeigt ihr Hals?', o: ['nach unten, links am Kopf', 'nach oben, rechts am Kopf', 'nach oben, links am Kopf', 'Sie hat keinen Hals.'], a: 0, x: 'Ab der mittleren Linie zeigen die Notenhälse nach unten und sitzen links.' },
        { q: 'Was ist der Unterschied zwischen d′ und d″?', o: ['d″ klingt eine Oktave höher als d′.', 'Es ist derselbe Ton.', 'd″ ist doppelt so lang.', 'd″ klingt eine Oktave tiefer.'], a: 0, x: 'Die Striche geben die Oktave an: zwei Striche ist die nächsthöhere Oktave.' },
        { q: 'Welcher Schlüssel heißt auch F-Schlüssel?', o: ['der Bassschlüssel', 'der Violinschlüssel', 'der Bratschenschlüssel', 'der Notenschlüssel'], a: 0, x: 'Bassschlüssel = F-Schlüssel, Bratschenschlüssel = C-Schlüssel, Violinschlüssel = G-Schlüssel.' },
      ] },
      { type: 'nameMc', title: 'Hilfslinien und hohe Töne', notes: HIGH_LOW },
      { type: 'noteRow', title: 'Notennamen benennen', notes: ALL_NOTES, n: 5 },
      { type: 'place', title: 'Noten schreiben', notes: STAFF_NOTES, n: 8 },
      { type: 'nameType', title: 'Tonnamen eintippen', notes: ALL_NOTES, n: 12 },
      { type: 'place', title: 'Noten schreiben mit Hilfslinien', notes: ["a", "h", "c'", "a''", "h''", "c'''", "d''", "g''"], low: 'f', high: "e'''", n: 8 },
    ],
  },
  {
    id: 'intervals', img: 'img/intervals.webp', title: 'Intervalle bestimmen', sub: 'AB Intervalle, MusiX S. 40', art: 'interval', badge: 'Abstandsmesser',
    learn: [
      { h: 'Was ist ein Intervall?', p: 'Das Wort „Intervall“ kommt aus dem Lateinischen und bedeutet „Abstand“. Ein Intervall gibt den Abstand zwischen zwei Tönen an, die nacheinander oder gleichzeitig gespielt werden.', bullets: ['Laut Mail der Lehrkraft wird der Punkt zu den Intervallen vielleicht noch gestrichen, du solltest ihn aber trotzdem können.'] },
      { h: 'So zählst du', p: 'Man zählt die Töne. Dabei ist wichtig, den unteren und oberen Ton mitzuzählen! Merke: Der erste Ton wird bei der Intervallbestimmung mitgezählt.', staff: { notes: ["c'", "d'", "e'", "f'"], hi: [0, 3], above: i => i + 1 }, bullets: ['Beispiel c′ bis f′: c′ – d′ – e′ – f′ sind 4 Töne, also ein Viertonintervall = <b>Quarte</b>.', 'Häufigster Fehler: nur die Schritte zählen. Von c′ nach g′ sind es 4 Schritte, aber 5 Töne, also eine <b>Quinte</b>.'] },
      { h: 'Die acht Intervalle', p: 'Wenn du die C-Dur-Tonleiter spielst und das c′ (den Grundton) immer unten liegen lässt, ergeben sich acht Intervalle:', bullets: ['1 Ton (Einklang): <b>Prime</b>, z. B. c′–c′', '2 Töne: <b>Sekunde</b>, c′–d′', '3 Töne: <b>Terz</b>, c′–e′', '4 Töne: <b>Quarte</b>, c′–f′', '5 Töne: <b>Quinte</b>, c′–g′', '6 Töne: <b>Sexte</b>, c′–a′', '7 Töne: <b>Septime</b>, c′–h′', '8 Töne: <b>Oktave</b>, c′–c″'] },
      { h: 'Eselsbrücken', bullets: ['<b>Prime</b>: prima, Daumen hoch, beide Töne sind gleich.', '<b>Quarte</b>: wie Quartett, vier Spieler.', '<b>Quinte</b>: fünf (lateinisch quinque), <b>Sexte</b>: sechs, <b>Oktave</b>: acht wie der Oktopus mit acht Armen.', 'Abwärts zählst du genauso: g′ nach e′ sind g′ – f′ – e′, also eine Terz.'] },
    ],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'match', title: 'Namen und Töne', prompt: 'Verbinde jedes Intervall mit der Zahl der Töne.', pairs: INTERVAL_NAMES.map((n, i) => ({ a: n, b: `${i + 1} ${i ? 'Töne' : 'Ton'}${i ? '' : ' (Einklang)'}` })) },
      { type: 'ivNamed', title: 'Intervalle mit Tonnamen', notes: XYLO_BARS, n: 10 },
      { type: 'ivStaff', title: 'Intervalle über c′', notes: XYLO_BARS, base: "c'", n: 8 },
      { type: 'ivStaff', title: 'Intervalle in Noten', notes: XYLO_BARS, n: 10 },
      { type: 'ivType', title: 'Intervalle bestimmen', notes: [...XYLO_BARS, "d''", "e''"], n: 10 },
    ],
  },
  {
    id: 'analyse', img: 'img/analyse.webp', title: 'Melodien analysieren', sub: 'Tonvorrat, Tw, Ts, Tsp und Melodieverlauf', art: 'lens', badge: 'Melodie-Detektiv',
    learn: [
      { h: 'Was du bei einer Melodie bestimmst', bullets: ['den <b>höchsten</b> und den <b>tiefsten Ton</b>,', 'den <b>Tonvorrat</b>,', 'zwischen jedem Ton, ob es eine <b>Tonwiederholung (Tw)</b>, ein <b>Tonschritt (Ts)</b> oder ein <b>Tonsprung (Tsp)</b> ist,', 'den <b>Verlauf der Melodie</b>: aufwärts, abwärts oder gleichbleibend.'] },
      { h: 'Der Tonvorrat', p: 'Um zu wissen, welche Töne in einem Lied vorkommen, bestimmen wir den <b>Tonvorrat</b>. Dafür notierst du jeden Ton nur einmal, den tiefsten zuerst und dann aufsteigend.', bullets: ['Bei „Kum ba yah“ ist der Tonvorrat c′ d′ e′ f′ g′ a′. Am Xylophon brauchst du nur diese sechs Stäbe.', 'Einen Tonvorrat von 5 Tönen nennt man <b>Pentatonik</b> (von griechisch „penta“ = fünf).'], staff: { notes: ["c'", "d'", "e'", "f'", "g'", "a'"] } },
      { h: 'Tonwiederholung, Tonschritt, Tonsprung', p: 'Melodien entstehen aus der Aneinanderreihung von Tonwiederholungen, Tonschritten und Tonsprüngen. Dadurch bilden sich charakteristische Melodieverläufe, die eine Melodie einzigartig machen.', bullets: ['<b>Tonwiederholung (Tw):</b> Wiederholung von zwei identischen Tönen, z. B. e′ und e′.', '<b>Tonschritt (Ts):</b> Fortschreiten zum nächst höher oder tiefer gelegenen Stammton, z. B. e′ nach f′.', '<b>Tonsprung (Tsp):</b> Überspringen von Tönen, z. B. f′ nach a′, dabei wird g′ übersprungen.'], staff: { notes: ["e'", "e'", "f'", "a'"], above: i => ['', 'Tw', 'Ts', 'Tsp'][i] } },
      { h: 'Der Melodieverlauf', p: 'Verbinde in Gedanken die Notenköpfe mit einer Linie. So siehst du, wie die Melodie verläuft:', bullets: ['<b>aufwärts</b>: Die Töne werden höher, die Linie steigt.', '<b>abwärts</b>: Die Töne werden tiefer, die Linie fällt.', '<b>gleichbleibend</b>: Tonwiederholungen, die Linie bleibt auf einer Höhe.', 'Viele Melodien gehen auf und ab, zum Beispiel wie ein Bogen oder in Wellen.'] },
      { h: 'Beispiel vom Arbeitsblatt: Kum ba yah', p: 'Tiefster Ton c′, höchster Ton a′. Die Melodie besteht größtenteils aus Tonschritten, dazu kommen Tonsprünge (gleich am Anfang c′ – e′ – g′) und Tonwiederholungen (g′ g′ g′).', melody: 'kumbaya' },
    ],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'move', title: 'Tw, Ts oder Tsp?', n: 12 },
      { type: 'extreme', title: 'Höchster und tiefster Ton', n: 8 },
      { type: 'pool', title: 'Tonvorrat', n: 5 },
      { type: 'marks', title: 'Zwischen jedem Ton markieren', n: 6 },
      { type: 'contour', title: 'Melodieverlauf', n: 5 },
      { type: 'fact', title: 'Stimmt das?', n: 12 },
    ],
  },
  {
    id: 'describe', img: 'img/describe.webp', title: 'Melodien beschreiben', sub: 'In ganzen Sätzen wie in der Musterlösung', art: 'pencil', badge: 'Melodie-Erklärer',
    learn: [
      { h: 'Die vier Leitfragen', p: 'Eine gute Beschreibung beantwortet alle vier Fragen vom Arbeitsblatt, in ganzen Sätzen:', bullets: ['1. Wie <b>verläuft</b> die Melodie? (aufwärts, abwärts, gleichbleibend, …)', '2. Wie ist die <b>Melodiebewegung</b>? (Tonwiederholungen, -schritte und -sprünge)', '3. <b>Womit beginnt</b> die Melodie, <b>womit endet</b> sie?', '4. Wo finden sich der <b>höchste</b>, wo der <b>tiefste</b> Ton?'] },
      { h: 'Satzbausteine', bullets: ['Die Melodie beginnt mit dem tiefsten Ton, dem c′.', 'Von dort geht sie zuerst nach oben bis zum höchsten Ton, dem …, und danach wieder nach unten.', 'Die Melodie besteht größtenteils aus Tonschritten. Das bedeutet, dass sie immer zum direkt benachbarten Ton weitergeht.', 'Zwischendurch gibt es aber auch einige Tonsprünge, bei denen ein oder mehrere Töne übersprungen werden.', 'Außerdem kommen Tonwiederholungen vor, bei denen derselbe Ton noch einmal erklingt.', 'Der höchste Ton … erklingt nur in den Takten … .', 'Am Ende endet sie wieder beim tiefsten Ton.'] },
      { h: 'Oft vergessen', bullets: ['den <b>höchsten Ton</b> mit Namen und wo er vorkommt,', 'die <b>Melodiebewegung</b>: Schritte, Sprünge und Wiederholungen mit den Fachbegriffen,', 'die <b>Takte</b> statt „Zeilen“: Zähl die Takte, ein Auftakt zählt auf dem Arbeitsblatt als Takt 1,', 'Tonnamen immer mit Oktavstrich: c′, nicht nur c.'] },
      { h: 'Musterlösung zu Kum ba yah', p: MELODIES[0].model, melody: 'kumbaya' },
    ],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'startEnd', title: 'Anfang und Ende', n: 8 },
      { type: 'most', title: 'Was überwiegt?', n: 5 },
      { type: 'mix', title: 'Sätze ergänzen', items: [
        { kind: 'cloze', q: 'Ergänze die Beschreibung von „Kum ba yah“.', s: 'Die Melodie beginnt mit dem ___ Ton, dem c′. Von dort geht sie zuerst nach ___ bis zum höchsten Ton, dem a′. Die Melodie besteht größtenteils aus ___.', answers: ['tiefsten', 'oben', 'Tonschritten'], o: ['tiefsten', 'oben', 'Tonschritten', 'höchsten', 'unten', 'Tonsprüngen'], x: 'So steht es in der Musterlösung.' },
        { kind: 'cloze', q: 'Ergänze die Fachbegriffe.', s: 'Bei einer ___ erklingt derselbe Ton noch einmal. Bei einem ___ geht die Melodie zum direkt benachbarten Ton. Bei einem ___ werden ein oder mehrere Töne übersprungen.', answers: ['Tonwiederholung', 'Tonschritt', 'Tonsprung'], o: ['Tonwiederholung', 'Tonschritt', 'Tonsprung', 'Tonvorrat'], x: 'Tw, Ts und Tsp.' },
        { kind: 'cloze', q: 'Ergänze die Beschreibung von „Alle meine Entchen“.', s: 'Die Melodie beginnt mit dem tiefsten Ton, dem ___. Sie steigt zuerst Schritt für Schritt nach ___ bis zum höchsten Ton, dem ___. Tonsprünge kommen ___ vor.', answers: ['c′', 'oben', 'a′', 'nicht'], o: ['c′', 'oben', 'a′', 'nicht', 'g′', 'unten', 'oft'], x: MELODY.entchen.model },
        { kind: 'cloze', q: 'Ergänze die Beschreibung von „Morgen kommt der Weihnachtsmann“.', s: 'Am Anfang ___ die Melodie von c′ zu g′ nach oben. Danach geht sie mit ___ wieder nach unten und endet auf dem ___ Ton c′.', answers: ['springt', 'Tonschritten', 'tiefsten'], o: ['springt', 'Tonschritten', 'tiefsten', 'Tonsprüngen', 'höchsten', 'bleibt'], x: MELODY.morgen.model },
        { q: 'Welcher Satz gehört NICHT in eine Melodiebeschreibung?', o: ['Das Lied gefällt mir, weil es schön klingt.', 'Die Melodie beginnt mit dem tiefsten Ton c′.', 'Die Melodie besteht größtenteils aus Tonschritten.', 'Der höchste Ton a′ kommt in Takt 2 vor.'], a: 0, x: 'Gefragt ist eine Beschreibung mit Fachbegriffen, keine Meinung.' },
        { q: 'Welche Angabe fehlt in dieser Beschreibung? „Die Melodie beginnt mit dem tiefsten Ton c′ und endet auch dort. Sie geht auf und ab und besteht größtenteils aus Tonschritten.“', o: ['der höchste Ton', 'der Anfangston', 'der Melodieverlauf', 'die Melodiebewegung'], a: 0, x: 'Zur vierten Leitfrage gehört der höchste Ton mit Namen und den Takten, in denen er vorkommt.' },
      ] },
      { type: 'write', title: 'Klassenarbeits-Training', items: MELODIES.map(m => ({
        q: `Beschreibe die Melodie von „${m.title}“ in ganzen Sätzen. Denk an alle vier Leitfragen.${melodyCard(m)}`,
        k: [['beginnt', 'Anfang', 'startet'], ['endet', 'Ende', 'Schluss', 'hört'], ['höchste'], ['tiefste'], ['Tonschritt', 'Schritt'], m.count.Tsp ? ['Tonsprung', 'Sprung', 'Sprünge', 'springt'] : ['keine Tonsprünge', 'keine Sprünge', 'ohne Sprung'], ...(m.count.Tw ? [['Tonwiederholung', 'Wiederholung', 'wiederholt']] : []), ['oben', 'aufwärts', 'steigt', 'unten', 'abwärts', 'fällt']],
        m: m.model,
      })) },
    ],
  },
  {
    id: 'xylo', img: 'img/xylophone.webp', title: 'Am Xylophon', sub: 'Stammtonreihe, nach Noten und nach Gehör spielen', art: 'xylo', badge: 'Xylophon-Profi',
    learn: [
      { h: 'Die Mini-Prüfung', p: 'Am Tag der Klassenarbeit gibt es eine Mini-Prüfung, bei der jeder einzeln am Xylophon geprüft wird. Laut Infoblatt sollst du die Töne der Stammtonreihe am Xylophon kennen, eine einfache Melodie nachspielen, die dir vorgespielt wird, und eine einfache Melodie nach Noten spielen.' },
      { h: 'Die Stammtonreihe am Xylophon', p: 'Links liegen die langen Stäbe mit den tiefen Tönen, rechts die kurzen mit den hohen. Von links nach rechts: c′ d′ e′ f′ g′ a′ h′ c″.', xylo: true, bullets: ['Tipp: Der Stab ganz links ist c′, der ganz rechts c″, beide eine Oktave auseinander.'] },
      { h: 'So übst du hier', bullets: ['Die App spielt den Ton, den du antippst, mit Xylophon-Klang. Mach den Ton am Handy an.', 'Beim Nachspielen darfst du die Melodie so oft anhören, wie du willst.', 'Am besten übst du zusätzlich am echten Xylophon in der Schule.'] },
    ],
    levels: [
      { type: 'learn', title: 'Lernkarten' },
      { type: 'xyFind', title: 'Finde den Klangstab', n: 8 },
      { type: 'xyRow', title: 'Stammtonreihe spielen' },
      { type: 'xyRead', title: 'Nach Noten spielen', n: 6 },
      { type: 'xyEar', title: 'Nach Gehör nachspielen', n: 6 },
    ],
  },
  {
    id: 'mix', img: 'img/mix.webp', title: 'Alles für die Klassenarbeit', sub: 'Gemischte Runden aus allen Welten', art: 'trophy', badge: 'Musik-Champion',
    learn: [
      { h: 'Kurz vor der Arbeit', bullets: ['Töne mit Oktavstrich benennen: c′ ist nicht c″.', 'Bei Tönen über und unter dem System die Hilfslinien zählen.', 'Intervalle: beide Töne mitzählen. c′–g′ = 5 Töne = Quinte.', 'Tonvorrat: jeden Ton nur einmal, von tief nach hoch.', 'Tw, Ts, Tsp zwischen jedem Ton, dann den Verlauf.', 'Beschreibung: alle vier Leitfragen in ganzen Sätzen, mit Tonnamen und Takten.'] },
    ],
    levels: [
      { type: 'learn', title: 'Checkliste' },
      { type: 'nameType', title: 'Tonnamen gemischt', notes: ALL_NOTES, n: 15 },
      { type: 'ivType', title: 'Intervalle gemischt', notes: [...XYLO_BARS, "d''", "e''"], n: 10 },
      { type: 'move', title: 'Melodiebewegung gemischt', n: 12 },
      { type: 'place', title: 'Noten schreiben gemischt', notes: ALL_NOTES, low: 'f', high: "e'''", n: 10 },
      { type: 'fact', title: 'Melodie-Check', n: 14 },
    ],
  },
];
