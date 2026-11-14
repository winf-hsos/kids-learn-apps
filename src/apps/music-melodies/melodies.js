// Melodies for analysing and describing, in the notation of the music module
// (note/beats, "|" = bar line). "Kum ba yah, my Lord" is the song of the worksheet
// "Melodien analysieren und beschreiben" (3/4 with an upbeat, which the worksheet
// counts as bar 1); the others are well-known traditional children's songs.
// lines: the melody split into staff lines that fit a phone screen; every line break
// is a bar line, so a line must end with a complete bar.
// contour: how the melody moves (Melodieverlauf), in the words of the worksheet.

const MELODIES = [
  {
    id: 'kumbaya', title: 'Kum ba yah, my Lord', meter: '3/4', upbeat: true,
    lines: [
      "c'/.5 e'/.5 | g'/.75 g'/.25 g'/1 a'/.5 a'/.5 | g'/2 c'/.5 e'/.5",
      "g'/.75 g'/.25 g'/1 f'/.5 e'/.5 | d'/2 c'/.5 e'/.5",
      "g'/.75 g'/.25 g'/1 a'/.5 a'/.5 | g'/2 f'/1",
      "e'/.5 c'/1.5 d'/.5 d'/.5 | c'/3",
    ],
    contour: 'Sie geht dreimal von unten nach oben und wieder nach unten, also auf und ab.',
    // Model answer of the worksheet's solution (task 2).
    model: 'Die Melodie beginnt mit dem tiefsten Ton, dem c\'. Von dort geht sie zuerst nach oben bis zum höchsten Ton, dem a\', und danach wieder nach unten. Dieses Auf und Ab kommt noch zweimal vor: Die Melodie steigt also noch zweimal nach oben und fällt wieder nach unten. Am Ende endet sie wieder beim tiefsten Ton c\'. Die Melodie besteht größtenteils aus Tonschritten. Das bedeutet, dass sie immer zum direkt benachbarten Ton weitergeht. Zwischendurch gibt es aber auch einige Tonsprünge, bei denen ein oder mehrere Töne übersprungen werden. Außerdem kommen Tonwiederholungen vor, bei denen derselbe Ton noch einmal erklingt. Der tiefste Ton c\' kommt mehrmals vor, nämlich in den Takten 1, 3, 5, 8 und 9. Der höchste Ton a\' erklingt dagegen seltener, nämlich nur in den Takten 2 und 6.',
  },
  {
    id: 'entchen', title: 'Alle meine Entchen', meter: '4/4',
    lines: [
      "c'/1 d'/1 e'/1 f'/1 | g'/2 g'/2",
      "a'/1 a'/1 a'/1 a'/1 | g'/4",
      "a'/1 a'/1 a'/1 a'/1 | g'/4",
      "f'/1 f'/1 f'/1 f'/1 | e'/2 e'/2",
      "d'/1 d'/1 d'/1 d'/1 | c'/4",
    ],
    contour: 'Sie steigt zuerst Schritt für Schritt nach oben und fällt danach Schritt für Schritt wieder nach unten, wie ein Bogen.',
  },
  {
    id: 'haenschen', title: 'Hänschen klein', meter: '4/4',
    lines: [
      "g'/1 e'/1 e'/2 | f'/1 d'/1 d'/2",
      "c'/1 d'/1 e'/1 f'/1 | g'/1 g'/1 g'/2",
      "g'/1 e'/1 e'/2 | f'/1 d'/1 d'/2",
      "c'/1 e'/1 g'/1 g'/1 | c'/4",
    ],
    contour: 'Sie fällt zuerst stufenweise mit kleinen Sprüngen nach unten, steigt dann wieder nach oben und springt am Ende ganz nach unten zum Schlusston.',
  },
  {
    id: 'freude', title: 'Ode an die Freude', meter: '4/4',
    lines: [
      "e'/1 e'/1 f'/1 g'/1 | g'/1 f'/1 e'/1 d'/1",
      "c'/1 c'/1 d'/1 e'/1 | e'/1.5 d'/.5 d'/2",
      "e'/1 e'/1 f'/1 g'/1 | g'/1 f'/1 e'/1 d'/1",
      "c'/1 c'/1 d'/1 e'/1 | d'/1.5 c'/.5 c'/2",
    ],
    contour: 'Sie geht in kleinen Wellen auf und ab: erst etwas nach oben, dann nach unten und wieder ein Stück nach oben.',
  },
  {
    id: 'morgen', title: 'Morgen kommt der Weihnachtsmann', meter: '4/4',
    lines: [
      "c'/1 c'/1 g'/1 g'/1 | a'/1 a'/1 g'/2",
      "f'/1 f'/1 e'/1 e'/1 | d'/1 d'/1 c'/2",
    ],
    contour: 'Sie springt am Anfang nach oben und geht danach Schritt für Schritt wieder nach unten bis zum Anfangston.',
  },
];

// Notes, bars and analysis of every melody, computed from the lines.
MELODIES.forEach(m => {
  m.src = m.lines.join(' | ');
  const evs = parseMelody(m.src);
  let bar = 1; m.notes = []; m.bars = [];
  evs.forEach(ev => { if (ev.bar) bar++; else if (ev.name) { m.notes.push(ev.name); m.bars.push(bar); } });
  const steps = m.notes.map(noteStep);
  m.low = stepName(Math.min(...steps)); m.high = stepName(Math.max(...steps));
  m.pool = [...new Set(steps)].sort((a, b) => a - b).map(stepName);
  m.moves = m.notes.slice(1).map((n, i) => moveKind(m.notes[i], n));
  m.count = { Tw: m.moves.filter(x => x === 'Tw').length, Ts: m.moves.filter(x => x === 'Ts').length, Tsp: m.moves.filter(x => x === 'Tsp').length };
  m.barsOf = name => [...new Set(m.notes.map((n, i) => n === name ? m.bars[i] : null).filter(Boolean))];
  if (!m.model) m.model = modelDescription(m);
});

function listBars(bars) {
  return bars.length === 1 ? `im Takt ${bars[0]}` : `in den Takten ${bars.slice(0, -1).join(', ')} und ${bars[bars.length - 1]}`;
}
// A model description in the pattern of the worksheet's solution.
function modelDescription(m) {
  const L = noteLabel, first = m.notes[0], last = m.notes[m.notes.length - 1];
  const start = first === m.low ? `dem tiefsten Ton, dem ${L(first)}` : first === m.high ? `dem höchsten Ton, dem ${L(first)}` : `dem Ton ${L(first)}`;
  const end = last === m.low ? `beim tiefsten Ton ${L(last)}` : last === m.high ? `beim höchsten Ton ${L(last)}` : `auf dem Ton ${L(last)}`;
  const order = Object.entries(m.count).sort((a, b) => b[1] - a[1]);
  const plural = { Tw: 'Tonwiederholungen', Ts: 'Tonschritten', Tsp: 'Tonsprüngen' };
  const tie = order[0][1] === order[1][1];
  const main = tie ? `zu gleichen Teilen aus ${plural[order[0][0]]} und ${plural[order[1][0]]}` : `größtenteils aus ${plural[order[0][0]]}`;
  const others = order.slice(tie ? 2 : 1).filter(([, n]) => n > 0).map(([k]) => ({ Tw: 'Tonwiederholungen, bei denen derselbe Ton noch einmal erklingt', Ts: 'Tonschritte zum direkt benachbarten Ton', Tsp: 'Tonsprünge, bei denen ein oder mehrere Töne übersprungen werden' }[k]));
  const missing = order.filter(([, n]) => n === 0).map(([k]) => MOVE_NAMES[k] + 'en');
  return `Die Melodie beginnt mit ${start}. ${m.contour} Am Ende endet sie ${end}. `
    + `Die Melodie besteht ${main}.${others.length ? ` Außerdem gibt es ${others.join(others[0].includes('bei denen') ? ', und ' : ' und ')}.` : ''}${missing.length ? ` ${missing.join(' und ')} kommen nicht vor.` : ''} `
    + `Der tiefste Ton ${L(m.low)} kommt ${listBars(m.barsOf(m.low))} vor, der höchste Ton ${L(m.high)} ${listBars(m.barsOf(m.high))}.`;
}
const MELODY = Object.fromEntries(MELODIES.map(m => [m.id, m]));
