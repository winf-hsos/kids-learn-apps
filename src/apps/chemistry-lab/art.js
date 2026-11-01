// Inline SVG artwork. Line art uses currentColor so it follows the theme;
// liquids use var(--liquid). GHS pictograms keep their real white/red/black look.

const S = 'fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
const LIQ = 'fill="var(--liquid)" stroke="none"';

const ART = {
  becherglas: svg(`<path ${LIQ} d="M32 56 H68 V86 Q68 89 65 89 H35 Q32 89 32 86 Z"/>
    <path ${S} d="M26 15 L30 20 V86 Q30 91 35 91 H65 Q70 91 70 86 V18"/>
    <path ${S} stroke-width="2" d="M58 36 H66 M60 46 H66 M58 56 H66 M60 66 H66"/>`),
  erlenmeyer: svg(`<path ${LIQ} d="M30 66 H70 L77 85 Q79 89 74 89 H26 Q21 89 23 85 Z"/>
    <path ${S} d="M38 10 H62 M42 10 V40 L21 84 Q19 91 26 91 H74 Q81 91 79 84 L58 40 V10"/>
    <path ${S} stroke-width="2" d="M48 56 H56 M46 66 H54"/>`),
  rundkolben: svg(`<path ${LIQ} d="M25.6 72 A26 26 0 0 0 74.4 72 Z"/>
    <path ${S} d="M40 8 H60 M44 8 V42 A26 26 0 1 0 56 42 V8"/>`),
  reagenzglas: svg(`<path ${LIQ} d="M43.6 58 H56.4 V80 A6.4 6.4 0 0 1 43.6 80 Z"/>
    <path ${S} d="M38 10 H62 M42 10 V80 A8 8 0 0 0 58 80 V10"/>`),
  rgstaender: svg(`<path ${S} d="M10 42 H90 V52 H10 Z M10 82 H90 V90 H10 Z M14 52 V82 M86 52 V82"/>
    <path ${S} stroke-width="2.6" d="M28 22 V66 A4 4 0 0 0 36 66 V22 M58 16 V66 A4 4 0 0 0 66 66 V16"/>
    <path ${LIQ} d="M29.5 54 H34.5 V66 A2.5 2.5 0 0 1 29.5 66 Z"/>`),
  rghalter: svg(`<rect x="6" y="44" width="54" height="12" rx="4" ${S}/>
    <path ${S} d="M60 47 L94 38 M60 53 L94 62 M94 38 Q98 50 94 62"/>
    <circle cx="66" cy="50" r="5" ${S}/>`),
  messzylinder: svg(`<path ${LIQ} d="M41.5 44 H58.5 V80 H41.5 Z"/>
    <path ${S} d="M37 6 L40 10 V82 M60 8 V82 M28 82 H72 V91 H28 Z"/>
    <path ${S} stroke-width="1.8" d="M52 18 H60 M55 26 H60 M52 34 H60 M55 42 H60 M52 50 H60 M55 58 H60 M52 66 H60 M55 74 H60"/>`),
  trichter: svg(`<path ${S} d="M14 16 H86 L57 52 V92 M43 92 V52 L14 16"/>
    <path ${LIQ} d="M26 30 H74 L58 50 H42 Z"/>`),
  pipette: svg(`<ellipse cx="50" cy="20" rx="10" ry="13" fill="var(--rubber)" stroke="currentColor" stroke-width="3"/>
    <path ${S} d="M45 32 V70 L48.5 93 M55 32 V70 L51.5 93"/>
    <path ${LIQ} d="M46.5 60 H53.5 V70 L50.8 90 H49.2 L46.5 70 Z"/>`),
  spatel: svg(`<path ${S} d="M28 76 L72 24"/>
    <ellipse cx="78" cy="17" rx="10" ry="6" transform="rotate(-50 78 17)" ${S}/>
    <path ${S} d="M28 76 L17 89 L12 85 L24 72"/>`),
  pinzette: svg(`<path ${S} d="M82 10 L18 80 Q16 84 20 84 M82 10 L28 88 Q26 92 30 90"/>
    <path ${S} stroke-width="2" d="M58 34 L63 39 M52 41 L57 46"/>`),
  tiegelzange: svg(`<circle cx="86" cy="22" r="7" ${S}/><circle cx="74" cy="9" r="6" ${S}/>
    <path ${S} d="M80 26 L54 46 L20 82 Q16 88 22 88 M70 14 L54 46 L28 90 Q24 95 30 93"/>
    <circle cx="54" cy="46" r="3" fill="currentColor"/>`),
  moerser: svg(`<line x1="60" y1="50" x2="82" y2="10" stroke="currentColor" stroke-width="12" stroke-linecap="round"/>
    <line x1="60" y1="50" x2="82" y2="10" stroke="var(--card)" stroke-width="6" stroke-linecap="round"/>
    <path d="M12 48 H88 Q86 86 50 86 Q14 86 12 48 Z" fill="var(--card)" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
    <path ${S} d="M36 86 L34 93 H66 L64 86 M88 48 L95 45"/>`),
  petrischale: svg(`<path ${LIQ} d="M18 60 A32 8 0 0 0 82 60 V66 A32 8 0 0 1 18 66 Z" opacity=".6"/>
    <ellipse cx="50" cy="56" rx="36" ry="10" ${S}/>
    <path ${S} d="M14 56 V66 A36 10 0 0 0 86 66 V56"/>
    <path ${S} stroke-width="2" stroke-dasharray="4 4" d="M10 44 A40 11 0 0 1 90 44"/>`),
  uhrglas: svg(`<path ${S} d="M8 46 Q50 82 92 46"/>
    <path fill="currentColor" d="M40 60 l4 -5 4 5 z M48 61 l3 -4 3 4 z M54 60 l3 -5 4 5 z"/>`),
  abdampfschale: svg(`<path d="M10 40 H86 Q84 76 48 78 Q12 76 10 40 Z" fill="var(--card)" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
    <path ${S} d="M86 40 L95 35 M36 78 L34 86 H62 L60 78"/>
    <path ${LIQ} d="M16 50 H80 Q74 70 48 71 Q22 70 16 50 Z"/>`),
  dreifuss: svg(`<ellipse cx="50" cy="20" rx="36" ry="9" ${S}/>
    <path ${S} d="M18 25 L12 92 M82 25 L88 92 M50 29 L50 88"/>`),
  drahtnetz: svg(`<path ${S} d="M8 58 L50 36 L92 58 L50 80 Z"/>
    <path ${S} stroke-width="1.4" d="M22 51 L64 73 M36 44 L78 66 M22 65 L64 43 M36 72 L78 50"/>
    <ellipse cx="50" cy="58" rx="18" ry="9" fill="var(--paper)" stroke="currentColor" stroke-width="2"/>`),
  gasbrenner: svg(`<path fill="var(--accent)" d="M50 2 C56 10 57 16 55 22 C54 26 46 26 45 22 C43 16 44 10 50 2 Z" opacity=".85"/>
    <path ${S} d="M44 26 V60 M56 26 V60 M40 66 L44 56 H56 L60 66 Z"/>
    <path ${S} d="M47 66 V80 M53 66 V80 M22 90 Q22 82 50 82 Q78 82 78 90 Z"/>
    <path ${S} d="M56 74 H90 M20 74 H44"/>`),
  thermometer: svg(`<rect x="44" y="6" width="12" height="74" rx="6" ${S}/>
    <circle cx="50" cy="84" r="10" fill="var(--hot)" stroke="currentColor" stroke-width="3"/>
    <rect x="48" y="36" width="4" height="46" fill="var(--hot)"/>
    <path ${S} stroke-width="1.8" d="M56 20 H62 M56 32 H60 M56 44 H62 M56 56 H60 M56 68 H62"/>`),
  schutzbrille: svg(`<path d="M10 38 Q10 28 22 28 H78 Q90 28 90 38 V58 Q90 70 78 70 H62 Q56 58 50 58 Q44 58 38 70 H22 Q10 70 10 58 Z" fill="var(--lens)" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
    <path ${S} d="M10 44 H3 M90 44 H97 M24 36 L32 36"/>`),
  stopfen: svg(`<path d="M28 26 H72 L64 82 H36 Z" fill="var(--rubber)" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
    <rect x="45" y="26" width="10" height="56" fill="var(--card)" stroke="currentColor" stroke-width="2"/>`),
  mikroskop: svg(`<path ${S} d="M18 90 H82 V84 H18 Z M60 84 V48 Q60 30 46 26"/>
    <rect x="34" y="12" width="14" height="38" rx="2" transform="rotate(-12 41 31)" ${S}/>
    <path ${S} d="M36 6 L46 4"/>
    <path ${S} d="M22 62 H62 M40 54 V62"/>
    <circle cx="64" cy="54" r="5" ${S}/>`),
  waage: svg(`<rect x="10" y="54" width="80" height="34" rx="7" ${S}/>
    <ellipse cx="50" cy="48" rx="30" ry="6" ${S}/><path ${S} d="M50 54 V54"/>
    <rect x="20" y="64" width="40" height="14" rx="2" fill="var(--paper)" stroke="currentColor" stroke-width="2"/>
    <text x="40" y="75" font-size="10" text-anchor="middle" fill="currentColor" font-family="monospace">0.0 g</text>
    <circle cx="70" cy="71" r="4" ${S}/><circle cx="81" cy="71" r="4" ${S}/>`),
  stift: svg(`<path ${S} d="M20 80 L24 64 L70 18 L82 30 L36 76 Z M64 24 L76 36 M20 80 L36 76"/>
    <path ${S} stroke-width="2" d="M14 92 H86"/>`),

  // ---- safety equipment (colored like real signs) ----
  notaus: svg(`<rect x="16" y="16" width="68" height="68" rx="8" fill="#F2C230" stroke="#222" stroke-width="3"/>
    <circle cx="50" cy="50" r="22" fill="#C9302C" stroke="#222" stroke-width="3"/>
    <circle cx="50" cy="50" r="12" fill="#E2544F"/>`),
  telefon: svg(`<path d="M14 64 Q14 50 30 50 H70 Q86 50 86 64 V80 Q86 86 80 86 H20 Q14 86 14 80 Z" fill="#3A4255" stroke="#222" stroke-width="3"/>
    <path d="M18 40 Q18 22 50 22 Q82 22 82 40 L70 46 L66 36 Q50 32 34 36 L30 46 Z" fill="#3A4255" stroke="#222" stroke-width="3"/>
    <rect x="30" y="58" width="22" height="10" fill="#9FD3B5"/>
    <g fill="#ddd"><circle cx="62" cy="62" r="2.5"/><circle cx="70" cy="62" r="2.5"/><circle cx="62" cy="72" r="2.5"/><circle cx="70" cy="72" r="2.5"/></g>`),
  augendusche: svg(`<path d="M34 34 H66 V84 Q66 92 58 92 H42 Q34 92 34 84 Z" fill="#E9F3F6" stroke="#2A6F7F" stroke-width="3"/>
    <path d="M38 10 H62 L66 24 H34 Z" fill="#1F8C6E" stroke="#145C48" stroke-width="3"/>
    <rect x="42" y="24" width="16" height="10" fill="#1F8C6E"/>
    <rect x="38" y="52" width="24" height="18" fill="#fff" stroke="#2A6F7F" stroke-width="2"/>
    <path d="M42 61 Q50 54 58 61 Q50 68 42 61 Z" fill="none" stroke="#2A6F7F" stroke-width="2"/><circle cx="50" cy="61" r="2.6" fill="#2A6F7F"/>`),
  ersthilfe: svg(`<rect x="14" y="20" width="72" height="64" rx="5" fill="#F4F6F5" stroke="#555" stroke-width="3"/>
    <rect x="36" y="34" width="28" height="28" fill="#119A48"/>
    <path d="M46 38 H54 V44 H60 V52 H54 V58 H46 V52 H40 V44 H46 Z" fill="#fff"/>
    <circle cx="22" cy="52" r="2.5" fill="#555"/>`),
  feuermelder: svg(`<rect x="16" y="18" width="68" height="64" rx="5" fill="#D32F2F" stroke="#7A1414" stroke-width="3"/>
    <rect x="26" y="40" width="48" height="32" fill="#F7F1F1" stroke="#7A1414" stroke-width="2"/>
    <circle cx="50" cy="56" r="9" fill="#D32F2F"/>
    <text x="50" y="33" font-size="10" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="700">Feuerwehr</text>`),
  loescher: svg(`<rect x="34" y="28" width="32" height="64" rx="10" fill="#D32F2F" stroke="#7A1414" stroke-width="3"/>
    <rect x="40" y="48" width="20" height="18" fill="#fff" stroke="#7A1414" stroke-width="1.5"/><text x="50" y="62" font-size="13" text-anchor="middle" fill="#D32F2F" font-weight="700" font-family="sans-serif">F</text>
    <path d="M44 28 V18 H56 V28" fill="#333"/><path d="M38 14 H66" stroke="#333" stroke-width="5" stroke-linecap="round"/>
    <path d="M58 18 Q78 18 76 40 Q74 64 70 78" fill="none" stroke="#222" stroke-width="4" stroke-linecap="round"/>`),
  loeschdecke: svg(`<rect x="14" y="58" width="72" height="20" rx="9" fill="#9AA3AD" stroke="#555" stroke-width="3"/>
    <rect x="18" y="42" width="66" height="20" rx="9" fill="#B7BEC6" stroke="#555" stroke-width="3"/>
    <rect x="22" y="26" width="58" height="20" rx="9" fill="#CDD3D9" stroke="#555" stroke-width="3"/>`),
};

// GHS pictograms: white diamond, red border, black symbol.
const GHS_SYMBOL = {
  GHS01: `<circle cx="44" cy="60" r="11" fill="#111"/><path d="M52 50 L60 42" stroke="#111" stroke-width="3"/>
    <g stroke="#111" stroke-width="3" stroke-linecap="round"><path d="M62 38 L70 30 M66 44 L76 42 M58 34 L60 24 M70 52 L78 56 M50 30 L46 24"/></g>
    <g fill="#111"><rect x="34" y="34" width="5" height="5" transform="rotate(20 36 36)"/><rect x="66" y="64" width="6" height="4"/><rect x="28" y="46" width="4" height="4"/></g>`,
  GHS02: `<path d="M50 28 C60 40 66 46 64 58 C62 68 56 71 50 71 C43 71 36 67 36 58 C36 50 42 46 45 38 C47 44 49 47 52 50 C53 43 53 36 50 28 Z" fill="#111"/><rect x="34" y="73" width="32" height="4" fill="#111"/>`,
  GHS03: `<circle cx="50" cy="62" r="10" fill="none" stroke="#111" stroke-width="5"/><path d="M50 26 C57 34 60 40 58 47 C57 52 53 54 50 54 C46 54 42 51 42 46 C42 40 46 37 47 32 C49 37 50 39 52 41 C52 36 52 31 50 26 Z" fill="#111"/><rect x="34" y="75" width="32" height="4" fill="#111"/>`,
  GHS04: `<g transform="rotate(-25 50 55)"><rect x="26" y="49" width="44" height="14" rx="7" fill="#111"/><rect x="68" y="52" width="8" height="8" fill="#111"/><rect x="75" y="50" width="4" height="12" fill="#111"/></g>`,
  GHS05: `<g fill="#111"><rect x="32" y="26" width="8" height="18" transform="rotate(30 36 35)"/><rect x="58" y="26" width="8" height="18" transform="rotate(-30 62 35)"/>
    <circle cx="40" cy="50" r="2.3"/><circle cx="42" cy="56" r="2"/><circle cx="60" cy="50" r="2.3"/><circle cx="58" cy="56" r="2"/>
    <path d="M28 66 H46 V72 L42 70 L38 74 L34 70 L28 72 Z"/><path d="M54 62 H70 Q74 62 74 66 V74 H54 Z"/><rect x="26" y="76" width="50" height="3"/></g>`,
  GHS06: `<g fill="#111"><circle cx="50" cy="42" r="12"/><rect x="43" y="50" width="14" height="8" rx="2"/></g>
    <g fill="#fff"><circle cx="45" cy="42" r="3.4"/><circle cx="55" cy="42" r="3.4"/></g>
    <g stroke="#111" stroke-width="5" stroke-linecap="round"><path d="M32 60 L68 76 M68 60 L32 76"/></g>`,
  GHS07: `<rect x="45.5" y="28" width="9" height="30" rx="3" fill="#111"/><circle cx="50" cy="67" r="5" fill="#111"/>`,
  GHS08: `<circle cx="50" cy="34" r="8" fill="#111"/><path d="M30 76 Q30 46 50 44 Q70 46 70 76 Z" fill="#111"/>
    <path d="M50 52 L53 59 L61 60 L55 65 L57 72 L50 68 L43 72 L45 65 L39 60 L47 59 Z" fill="#fff"/>`,
  GHS09: `<g stroke="#111" stroke-width="3" stroke-linecap="round" fill="none"><path d="M36 74 V36 M36 46 L28 38 M36 52 L44 42 M36 40 L42 32"/></g>
    <path d="M50 70 Q60 62 70 70 Q60 77 50 70 Z" fill="#111"/><path d="M70 70 L77 65 V75 Z" fill="#111"/><rect x="26" y="76" width="50" height="3" fill="#111"/>`,
};

function ghsSvg(code) {
  return svg(`<rect x="19" y="19" width="62" height="62" transform="rotate(45 50 50)" fill="#fff" stroke="#D7263D" stroke-width="6" stroke-linejoin="round"/>${GHS_SYMBOL[code]}`);
}

function art(key) {
  if (GHS_SYMBOL[key]) return ghsSvg(key);
  return ART[key] || '';
}

// Large Teclu burner drawing used for the labeling level and learn cards.
// Hotspot positions are in the 0 0 300 360 coordinate space.
const BURNER_PARTS = [
  { id: 'rohr', name: 'Brennerrohr', x: 168, y: 130, lx: 262, ly: 110 },
  { id: 'luft', name: 'Luftregulierung', x: 178, y: 234, lx: 262, ly: 186 },
  { id: 'duese', name: 'Gasdüse', x: 156, y: 262, lx: 262, ly: 224 },
  { id: 'anschluss', name: 'Gasanschluss mit Schlauch', x: 214, y: 291, lx: 262, ly: 262 },
  { id: 'gasschraube', name: 'Gasregulierschraube', x: 64, y: 291, lx: 32, ly: 246 },
  { id: 'fuss', name: 'Brennerfuß', x: 108, y: 322, lx: 32, ly: 322 },
];

function burnerSvg(opts = {}) {
  const numbered = opts.numbered;
  const parts = BURNER_PARTS.map((p, i) => {
    if (!numbered) return '';
    return `<line x1="${p.x}" y1="${p.y}" x2="${p.lx}" y2="${p.ly}" stroke="var(--ink-soft)" stroke-width="1.6" stroke-dasharray="3 3"/>
      <g class="hot" data-part="${p.id}" tabindex="0" role="button" aria-label="Nummer ${i + 1}">
        <circle cx="${p.lx}" cy="${p.ly}" r="15" fill="var(--card)" stroke="var(--accent)" stroke-width="3"/>
        <text x="${p.lx}" y="${p.ly + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="var(--accent)">${i + 1}</text>
      </g>`;
  }).join('');
  return svg(`
    <defs><linearGradient id="metal" x1="0" x2="1"><stop offset="0" stop-color="var(--metal-a)"/><stop offset=".5" stop-color="var(--metal-b)"/><stop offset="1" stop-color="var(--metal-a)"/></linearGradient></defs>
    ${opts.flame ? `<path d="M150 10 C166 34 170 52 165 72 C162 86 138 86 135 72 C130 52 134 34 150 10 Z" fill="var(--accent)" opacity=".85"/><path d="M150 44 C156 54 157 62 155 70 C153 76 147 76 145 70 C143 62 144 54 150 44 Z" fill="var(--accent-2)"/>` : ''}
    <rect x="132" y="80" width="36" height="140" fill="url(#metal)" stroke="var(--ink)" stroke-width="3"/>
    <path d="M132 218 L116 246 H184 L168 218 Z" fill="url(#metal)" stroke="var(--ink)" stroke-width="3"/>
    <path d="M118 236 H182" stroke="var(--ink)" stroke-width="2" stroke-dasharray="6 5"/>
    <path d="M100 232 Q110 226 120 236 M200 232 Q190 226 180 236" fill="none" stroke="var(--accent)" stroke-width="2.4" marker-end=""/>
    <text x="96" y="226" font-size="11" fill="var(--accent)" text-anchor="end">Luft</text>
    <path d="M142 246 L145 276 H155 L158 246" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.4" stroke-dasharray="4 3"/>
    <rect x="128" y="276" width="44" height="30" fill="url(#metal)" stroke="var(--ink)" stroke-width="3"/>
    <rect x="72" y="284" width="56" height="14" fill="url(#metal)" stroke="var(--ink)" stroke-width="3"/>
    <rect x="56" y="276" width="18" height="30" rx="3" fill="var(--ink)" />
    <path d="M60 282 V300 M66 282 V300" stroke="var(--paper)" stroke-width="1.6"/>
    <rect x="172" y="285" width="58" height="12" fill="url(#metal)" stroke="var(--ink)" stroke-width="3"/>
    <path d="M186 285 V297 M198 285 V297 M210 285 V297" stroke="var(--ink)" stroke-width="2"/>
    <path d="M230 291 Q262 291 270 320 Q276 344 296 346" fill="none" stroke="var(--rubber)" stroke-width="10" stroke-linecap="round"/>
    <path d="M120 306 L92 332 H208 L180 306 Z" fill="url(#metal)" stroke="var(--ink)" stroke-width="3"/>
    <rect x="84" y="332" width="132" height="10" rx="4" fill="var(--ink)"/>
    ${parts}`, '0 0 300 360');
}
