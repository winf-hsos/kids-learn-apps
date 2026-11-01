// Inline SVG artwork for the Latin app (helmet, Roman house, scroll, wax tablet,
// laurel wreath, columns). Line art uses currentColor so it follows the theme.

const LS = 'stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
const LAUREL_LEAVES = [[40, 84, -20], [30, 76, -40], [24, 64, -65], [22, 52, -85], [25, 40, -105], [31, 29, -125]];

const ART = {
  galea: svg(`<path d="M19 52.7 A33 33 0 0 1 81 52.7" fill="none" stroke="var(--accent)" stroke-width="12" stroke-linecap="round"/>
    <path d="M19 52.7 A33 33 0 0 1 81 52.7" fill="none" stroke="var(--pen)" stroke-width="2" stroke-dasharray="2 5" opacity=".6"/>
    <path d="M24 64 A26 26 0 0 1 76 64 Z" fill="var(--gold)" ${LS}/>
    <path d="M30 64 V80 Q30 86 37 84 L42 68 Z M70 64 V80 Q70 86 63 84 L58 68 Z" fill="var(--gold)" ${LS}/>
    <path d="M14 64 H86 M36 58 H64" fill="none" ${LS}/>
    <circle cx="40" cy="50" r="2" fill="currentColor"/><circle cx="50" cy="47" r="2" fill="currentColor"/><circle cx="60" cy="50" r="2" fill="currentColor"/>`),
  domus: svg(`<path d="M12 40 L50 14 L88 40 Z" fill="var(--accent)" ${LS}/>
    <path d="M16 40 H84 V47 H16 Z" fill="var(--card)" ${LS}/>
    <path d="M22 47 H29 V80 H22 Z M37 47 H44 V80 H37 Z M56 47 H63 V80 H56 Z M71 47 H78 V80 H71 Z" fill="var(--card)" ${LS}/>
    <path d="M14 80 H86 V86 H14 Z M8 86 H92 V92 H8 Z" fill="var(--card)" ${LS}/>`),
  verba: svg(`<rect x="26" y="20" width="48" height="60" fill="var(--card)" ${LS}/>
    <rect x="18" y="12" width="64" height="10" rx="5" fill="var(--gold)" ${LS}/>
    <rect x="18" y="78" width="64" height="10" rx="5" fill="var(--gold)" ${LS}/>
    <path d="M34 34 H66 M34 44 H60 M34 54 H66 M34 64 H56" fill="none" stroke="var(--pen)" stroke-width="3" stroke-linecap="round"/>`),
  tabula: svg(`<rect x="12" y="16" width="62" height="72" rx="6" fill="var(--gold)" ${LS}/>
    <rect x="20" y="24" width="46" height="56" rx="3" fill="var(--accent-soft)" ${LS} stroke-width="2.4"/>
    <path d="M27 37 H58 M27 48 H50 M27 59 H56 M27 70 H44" fill="none" stroke="var(--pen)" stroke-width="3" stroke-linecap="round"/>
    <path d="M60 90 L88 28" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    <path d="M88 28 L91 21" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/>`),
  laurus: svg(`<path d="M46 88 Q20 80 20 50 Q21 32 34 20 M54 88 Q80 80 80 50 Q79 32 66 20" fill="none" ${LS} stroke-width="2.6"/>
    ${LAUREL_LEAVES.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="3.8" transform="rotate(${r} ${x} ${y})" fill="var(--good)" ${LS} stroke-width="2"/><ellipse cx="${100 - x}" cy="${y}" rx="8" ry="3.8" transform="rotate(${-r} ${100 - x} ${y})" fill="var(--good)" ${LS} stroke-width="2"/>`).join('')}
    <path d="M42 86 L50 80 L58 86 L54 94 M46 94 L42 86" fill="var(--accent)" ${LS} stroke-width="2.4"/>`),
  columnae: svg(`<path d="M10 30 L50 10 L90 30 Z" fill="var(--accent)" ${LS}/>
    <path d="M12 30 H88 V36 H12 Z" fill="var(--card)" ${LS}/>
    ${[16, 31, 46, 61, 76].map(x => `<path d="M${x} 36 H${x + 8} V82 H${x} Z" fill="var(--card)" ${LS} stroke-width="2.6"/>`).join('')}
    <path d="M10 82 H90 V90 H10 Z" fill="var(--card)" ${LS}/>`),
};
