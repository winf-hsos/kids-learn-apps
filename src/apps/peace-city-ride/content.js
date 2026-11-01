// Worlds of "Ritt zur Friedensstadt", built from the question catalogue in data.js: one world per
// station in the order of the lessons, then the years and the mock-test questions. Never reorder
// worlds or levels once published; progress is stored per world id and level position.

// The pictures are cut from the class material and stay out of this public repo; they are
// loaded from the first version of the app.
const PIC_BASE = 'https://winf-hsos.github.io/ritt-zur-friedensstadt/';
const pic = p => p ? PIC_BASE + p : undefined;

const QUESTION = Object.fromEntries(RITT.fragen.map(q => [q.id, q]));
const questionsOf = st => RITT.fragen.filter(q => q.st === st);
const chunk = (list, size) => {
  const n = Math.ceil(list.length / size), per = Math.ceil(list.length / n);
  return Array.from({ length: n }, (_, i) => list.slice(i * per, (i + 1) * per));
};

// Learn cards: what to remember from each station, taken from the explanations of its questions.
function stationCards(st) {
  const notes = questionsOf(st.id).filter(q => q.e && q.typ !== 'erklaer');
  const lead = notes.filter(q => q.lf), rest = notes.filter(q => !q.lf);
  return [
    { h: st.name, p: `${st.zeit}: ${st.kurz}.`, bullets: lead.slice(0, 6).map(q => q.e) },
    ...chunk([...lead.slice(6), ...rest], 6).filter(c => c.length).map((c, i) => ({ h: `Gut zu wissen ${i + 1}`, bullets: c.map(q => q.e) })),
  ];
}

const STATION_ART = { furt: 'ford', gruendung: 'crown', stadtteile: 'towers', stadtleben: 'house', reformation: 'theses', krieg: 'sword', frieden: 'dove', steckenpferd: 'horse' };

const TOPICS = [
  ...RITT.stationen.map(st => {
    const qs = questionsOf(st.id), lead = qs.filter(q => q.lf);
    return {
      id: st.id, img: `img/${st.id}.webp`, title: st.name, sub: `${st.zeit} · ${st.kurz}${st.extra ? ' (Zusatz)' : ''}`, art: STATION_ART[st.id], badge: st.name,
      learn: stationCards(st),
      levels: [
        { type: 'learn', title: 'Das Wichtigste' },
        ...chunk(qs, 8).map((c, i) => ({ type: 'ritt', title: `Runde ${i + 1}`, ids: c.map(q => q.id) })),
        ...(lead.length >= 3 ? [{ type: 'ritt', title: 'Leitfragen', ids: lead.map(q => q.id) }] : []),
      ],
    };
  }),
  {
    id: 'zeit', img: 'img/zeit.webp', title: 'Jahreszahlen-Profi', sub: 'Alle Jahreszahlen und die richtige Reihenfolge', art: 'hourglass', badge: 'Zeitreisender',
    learn: [{ h: 'Die wichtigsten Jahreszahlen', bullets: ['um 780: Karl der Große lässt an der Furt eine Bischofskirche bauen (Domburg).', 'um 1000: Binnenburg mit der Marienkirche', 'um 1200: Butenburg mit der Katharinenkirche', 'um 1300: Neustadt mit der Johanniskirche, 1306 vereinigt mit der Altstadt', '1517: Luthers 95 Thesen, Beginn der Reformation', '1618 bis 1648: der Dreißigjährige Krieg', '25. Oktober 1648: Der Westfälische Friede wird in Osnabrück verkündet.', '1948: zum ersten Mal Steckenpferdreiten'] }],
    levels: [
      { type: 'learn', title: 'Zeitleiste' },
      ...chunk(RITT.fragen.filter(q => q.st === 'zeit' || q.typ === 'jahr'), 8).map((c, i) => ({ type: 'ritt', title: `Jahreszahlen ${i + 1}`, ids: c.map(q => q.id) })),
      { type: 'ritt', title: 'Reihenfolgen', ids: RITT.fragen.filter(q => q.typ === 'reihe' && q.st !== 'stadtleben').map(q => q.id) },
    ],
  },
  {
    id: 'probe', img: 'img/probe.webp', title: 'Probearbeit: Leitfragen erklären', sub: 'Die zwölf Leitfragen-Blöcke frei beantworten und selbst abhaken', art: 'scroll', badge: 'Friedensmacher',
    learn: [{ h: 'So übst du die Probearbeit', p: 'Hier schreibst du die Antworten selbst auf, so wie in der Arbeit. Danach siehst du die Musterantwort und hakst ehrlich ab, was du schon genannt hast. Was fehlt, liest du dir in der Musterantwort noch einmal durch.' }],
    levels: [
      { type: 'learn', title: 'So geht es' },
      ...chunk(questionsOf('probe'), 4).map((c, i) => ({ type: 'write', title: `Leitfragen ${i * 4 + 1} bis ${i * 4 + c.length}`, items: c.map(q => ({ q: q.f, points: q.k, m: q.m })) })),
    ],
  },
];
