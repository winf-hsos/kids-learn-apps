// The street map of the app's little town: places, streets, a river with two bridges and a park,
// drawn as SVG with the place pictures. Routes run along named points and can be drawn on the map
// (dashed line from a red start arrow), and the places can be made tappable for "follow the way".

const TOWN_W = 360, TOWN_H = 300;

// Places: English name with article as used in sentences, German name and centre on the map.
const PLACES = {
  school: { en: 'school', de: 'die Schule', x: 60, y: 72 },
  post_office: { en: 'post office', de: 'die Post', x: 106, y: 72 },
  library: { en: 'library', de: 'die Bücherei', x: 60, y: 116 },
  restaurant: { en: 'restaurant', de: 'das Restaurant', x: 106, y: 116 },
  sweet_shop: { en: 'sweet shop', de: 'der Süßigkeitenladen', x: 167, y: 75 },
  cinema: { en: 'cinema', de: 'das Kino', x: 219, y: 75 },
  swimming_pool: { en: 'swimming pool', de: 'das Schwimmbad', x: 219, y: 122 },
  hospital: { en: 'hospital', de: 'das Krankenhaus', x: 60, y: 182 },
  museum: { en: 'museum', de: 'das Museum', x: 106, y: 182 },
  tims_house: { en: "Tim's house", de: 'Tims Haus', x: 60, y: 228, img: 'house', name: "Tim's house" },
  zoo: { en: 'zoo', de: 'der Zoo', x: 106, y: 228 },
  playground: { en: 'playground', de: 'der Spielplatz', x: 167, y: 228 },
  train_station: { en: 'train station', de: 'der Bahnhof', x: 219, y: 228 },
  supermarket: { en: 'supermarket', de: 'der Supermarkt', x: 271, y: 184 },
  bus_stop: { en: 'bus stop', de: 'die Bushaltestelle', x: 314, y: 184, labelTop: true },
  mias_house: { en: "Mia's house", de: 'Mias Haus', x: 276, y: 228, img: 'house', name: "Mia's house" },
};
// "the cinema", but "Tim's house" without an article.
const theP = key => PLACES[key].name || `the ${PLACES[key].en}`;
const placeImg = key => `img/${PLACES[key].img || key}.webp`;

// Points of the street network. n<column><row> are crossings, m0/m1 the ends of the park path,
// the rest are where the streets leave the map (start points of routes).
const TM_PT = {
  n00: [28, 38], n10: [138, 38], n20: [248, 38], n30: [338, 38],
  n01: [28, 148], n11: [138, 148], n21: [248, 148], n31: [338, 148],
  n02: [28, 262], n12: [138, 262], n22: [248, 262], n32: [338, 262],
  m0: [293, 38], m1: [293, 148],
  hillW: [0, 38], hillE: [360, 38], marketW: [0, 148], marketE: [360, 148], greenW: [0, 262], greenE: [360, 262],
  schoolN: [28, 0], schoolS: [28, 300], stationN: [138, 0], stationS: [138, 300],
  parkN: [248, 0], parkS: [248, 300], millN: [338, 0], millS: [338, 300],
};
const STREETS = [
  { name: 'Hill Street', pts: ['hillW', 'hillE'], label: [84, 40.5] },
  { name: 'Market Street', pts: ['marketW', 'n11'], label: [84, 150.5] },
  { name: 'Market Street', pts: ['n21', 'marketE'], label: [316, 150.5] },
  { name: 'Green Street', pts: ['greenW', 'greenE'], label: [84, 264.5] },
  { name: 'School Lane', pts: ['schoolN', 'schoolS'], label: [30.5, 205], v: true },
  { name: 'Station Road', pts: ['stationN', 'stationS'], label: [140.5, 205], v: true },
  { name: 'Park Street', pts: ['parkN', 'parkS'], label: [250.5, 205], v: true },
  { name: 'Mill Road', pts: ['millN', 'millS'], label: [340.5, 100], v: true },
];
// Trees fill the empty spots of the blocks.
const TREES = [[160, 122], [170, 182], [214, 178], [312, 228], [176, 140], [228, 160]];

const tmXY = p => Array.isArray(p) ? p : TM_PT[p];
const tmPath = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${tmXY(p)[0]} ${tmXY(p)[1]}`).join(' ');

// A route: start point (edge of the map), the corners in between, the place it ends at and the text.
// Every text has been checked against the drawing: left and right as seen by the walker.
const ROUTES = {
  r1: { pts: ['hillE', 'n20', [248, 228]], goal: 'mias_house', text: ['Go straight on.', 'Turn left at the cinema.', 'Go past the swimming pool and the supermarket.', "Mia's house is on your left.", "It's opposite the train station."] },
  r2: { pts: ['marketE', 'm1', 'm0', [167, 38]], goal: 'sweet_shop', text: ['Go straight on.', 'Turn right and go through the park.', 'Turn left.', 'Go past the cinema and go across the bridge.', 'The sweet shop is on your left.'] },
  r3: { pts: ['greenW', 'n12', [138, 72]], goal: 'post_office', text: ['Go straight on.', 'Turn left at the zoo.', 'Go past the museum and the restaurant.', 'The post office is on your left.', "It's opposite the sweet shop."] },
  r4: { pts: ['stationS', 'n11', [60, 148]], goal: 'library', text: ['Go straight on.', 'Turn left at the museum.', 'The library is on your right.', "It's opposite the hospital."] },
  r5: { pts: ['greenW', 'n22', [248, 184]], goal: 'supermarket', text: ['Go straight on.', 'Go across the bridge.', 'Turn left at the train station.', 'The supermarket is on your right.'] },
  r6: { pts: ['millN', 'n31', [276, 148]], goal: 'supermarket', text: ['Go straight on.', 'Turn right at the bus stop.', 'The supermarket is on your left.', "It's opposite the park."] },
  r7: { pts: ['schoolN', 'n01', [106, 148]], goal: 'museum', text: ['Go straight on.', 'Turn left at the library.', 'Go past the hospital.', 'The museum is on your right.', "It's opposite the restaurant."] },
  r8: { pts: ['greenE', 'n12', [138, 182]], goal: 'museum', text: ['Go straight on and go across the bridge.', 'Turn right at the playground.', 'Go past the zoo.', 'The museum is on your left.'] },
  r9: { pts: ['stationN', 'n12', [276, 262]], goal: 'mias_house', text: ['Go straight on.', 'Turn left at the playground.', 'Go across the bridge.', 'Go past the train station.', "Mia's house is on your left."] },
  r10: { pts: ['parkS', [248, 75]], goal: 'cinema', text: ['Go straight on.', 'Go past the train station and the supermarket.', 'Go past the swimming pool.', 'The cinema is on your left.', "It's opposite the park."] },
  r11: { pts: ['hillW', 'n10', [138, 116]], goal: 'restaurant', text: ['Go straight on.', 'Turn right at the post office.', 'The restaurant is on your right.', "It's next to the library."] },
  r12: { pts: ['schoolS', 'n02', [219, 262]], goal: 'train_station', text: ['Go straight on.', "Turn right at Tim's house.", 'Go past the zoo and the playground.', 'Go across the bridge.', 'The train station is on your left.'] },
};
const routeText = r => ROUTES[r].text.join(' ');

// The start arrow points from outside into the map at the first point of the route.
function startArrow(r) {
  const [a, b] = [tmXY(ROUTES[r].pts[0]), tmXY(ROUTES[r].pts[1])];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), dx = (b[0] - a[0]) / len, dy = (b[1] - a[1]) / len;
  const tip = [a[0] + dx * 26, a[1] + dy * 26], nx = -dy, ny = dx;
  const p = (s, w) => `${tip[0] - dx * s + nx * w} ${tip[1] - dy * s + ny * w}`;
  return `<path class="tm-start" d="M${tip[0]} ${tip[1]} L${p(14, 9)} L${p(14, 4)} L${p(30, 4)} L${p(30, -4)} L${p(14, -4)} L${p(14, -9)} Z"/>`;
}

// Draws the town. Options: route (id, drawn as a dashed line), start (id, only the start arrow),
// goal (place key, ringed with a star), mark (place keys to ring), tap (places become buttons),
// hideLabels (no names under the pictures, for the picture quiz).
function townSvg(o = {}) {
  const street = s => `<path d="${tmPath(s.pts)}" class="tm-road"/>`;
  const streetLine = s => `<path d="${tmPath(s.pts)}" class="tm-line"/>`;
  const sname = s => s.v
    ? `<text class="tm-sname" transform="translate(${s.label[0]} ${s.label[1]}) rotate(-90)" text-anchor="middle">${s.name}</text>`
    : `<text class="tm-sname" x="${s.label[0]}" y="${s.label[1]}" text-anchor="middle">${s.name}</text>`;
  const place = k => {
    const p = PLACES[k], ring = k === o.goal || (o.mark || []).includes(k);
    return `<g class="tm-place${o.tap ? ' tm-tap' : ''}" data-place="${k}"${o.tap ? ` role="button" tabindex="0" aria-label="${p.en}"` : ''}>
      <rect class="tm-hit" x="${p.x - 22}" y="${p.y - 21}" width="44" height="42" rx="8"/>
      ${ring ? `<circle class="tm-ring" cx="${p.x}" cy="${p.y - 3}" r="21"/>` : ''}
      <image href="${placeImg(k)}" x="${p.x - 17}" y="${p.y - 20}" width="34" height="30"/>
      ${o.hideLabels ? '' : `<text class="tm-label" x="${p.x}" y="${p.labelTop ? p.y - 22 : p.y + 18}" text-anchor="middle">${p.name || p.en}</text>`}
      ${k === o.goal ? `<path class="tm-star" d="${tmStar(p.x + 15, p.y - 17, 7)}"/>` : ''}</g>`;
  };
  const route = o.route ? `<path d="${tmPath(ROUTES[o.route].pts)}" class="tm-route" marker-end="url(#tmArrow)"/>` : '';
  const arrow = o.route || o.start ? startArrow(o.route || o.start) : '';
  return `<svg class="town" viewBox="0 0 ${TOWN_W} ${TOWN_H}" role="img" aria-label="Stadtplan">
    <defs><marker id="tmArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" class="tm-arrowhead"/></marker></defs>
    <rect class="tm-ground" width="${TOWN_W}" height="${TOWN_H}" rx="10"/>
    <rect class="tm-park" x="254" y="44" width="78" height="98" rx="8"/>
    <path class="tm-path" d="M293 44 C285 70 301 96 293 142"/>
    ${[[268, 62], [318, 66], [270, 118], [318, 126]].map(([x, y]) => tmTree(x, y, 8)).join('')}
    <path class="tm-river" d="M186 0 C190 60 184 120 192 160 C198 200 186 250 190 300 L206 300 C202 250 214 200 208 160 C200 120 206 60 202 0 Z"/>
    ${STREETS.map(street).join('')}${STREETS.map(streetLine).join('')}
    ${[38, 262].map(y => `<path class="tm-bridge" d="M178 ${y - 8.5} H214 M178 ${y + 8.5} H214"/>`).join('')}
    ${STREETS.map(sname).join('')}
    <text class="tm-sname tm-pname" x="316" y="100" text-anchor="middle">park</text>
    <text class="tm-sname tm-rname" transform="translate(199 205) rotate(-90)" text-anchor="middle">river</text>
    ${TREES.map(([x, y]) => tmTree(x, y, 7)).join('')}
    ${route}
    ${Object.keys(PLACES).map(place).join('')}
    ${arrow}
  </svg>`;
}
function tmTree(x, y, r) {
  return `<g class="tm-tree"><rect x="${x - 1.5}" y="${y}" width="3" height="${r}" rx="1"/><circle cx="${x}" cy="${y - r * .2}" r="${r}"/></g>`;
}
function tmStar(cx, cy, r) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * .45 : r;
    return `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ') + 'Z';
}

// Board kind "maptap": read (or hear) the way, then tap the place where you arrive.
const MAP_BOARD = {
  maptap: {
    body: it => `<div class="tm-wrap">${townSvg({ start: it.route, tap: true })}</div><p class="muted tm-note">Tippe auf dem Plan auf das Ziel.</p>`,
    bind(it, ready) {
      let picked = null;
      $$('.tm-tap').forEach(g => {
        const choose = () => {
          picked = g.dataset.place; Sound.click();
          $$('.tm-tap').forEach(x => x.classList.toggle('on', x === g));
          ready(true);
        };
        g.addEventListener('click', choose);
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
      });
      return () => {
        const ok = picked === ROUTES[it.route].goal;
        // Afterwards the way is drawn, so a wrong turn can be seen on the map.
        const first = $('.tm-wrap .tm-place');
        if (first && run.mode !== 'exam') first.insertAdjacentHTML('beforebegin', `<path d="${tmPath(ROUTES[it.route].pts)}" class="tm-route" marker-end="url(#tmArrow)"/>`);
        $$('.tm-tap').forEach(x => {
          if (x.dataset.place === ROUTES[it.route].goal) x.classList.add('right');
          else if (x.dataset.place === picked) x.classList.add('wrong');
          x.style.pointerEvents = 'none';
        });
        return [ok];
      };
    },
    sol: it => theP(ROUTES[it.route].goal),
  },
};
