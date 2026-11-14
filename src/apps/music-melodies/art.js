// Inline SVG artwork for the music app (treble clef on a staff, interval steps,
// magnifier over notes, pencil, xylophone, trophy). Line art uses currentColor so it
// follows the theme.

const MS = 'stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
const STAFF5 = y0 => [0, 1, 2, 3, 4].map(i => `<path d="M8 ${y0 + i * 9} H92" stroke="currentColor" stroke-width="1.8" opacity=".55"/>`).join('');

const ART = {
  clef: svg(`${STAFF5(28)}
    <path d="M44 92 Q36 92 38 84 Q42 78 48 84 M48 84 L40 18 Q40 6 48 8 Q56 12 48 30 L34 50 Q26 62 34 72 Q42 80 54 74 Q62 68 58 58 Q54 50 46 54 Q40 58 44 64"
      fill="none" stroke="var(--accent)" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="76" cy="55" rx="7" ry="5" transform="rotate(-20 76 55)" fill="var(--gold)" ${MS} stroke-width="2.4"/>
    <path d="M82.5 53 V22" ${MS} stroke-width="2.6"/>`),
  interval: svg(`<path d="M10 84 H30 V68 H46 V52 H62 V36 H78 V20 H92" fill="none" ${MS}/>
    <ellipse cx="20" cy="76" rx="7" ry="5" fill="var(--accent)" ${MS} stroke-width="2.4"/>
    <ellipse cx="85" cy="12" rx="7" ry="5" fill="var(--gold)" ${MS} stroke-width="2.4"/>
    <path d="M22 60 Q40 24 78 14" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="4 6" stroke-linecap="round"/>
    <text x="54" y="80" font-family="var(--f-display)" font-size="20" fill="currentColor">1…8</text>`),
  lens: svg(`${STAFF5(18)}
    <ellipse cx="20" cy="49" rx="6" ry="4.5" fill="currentColor"/><ellipse cx="36" cy="40" rx="6" ry="4.5" fill="currentColor"/><ellipse cx="52" cy="40" rx="6" ry="4.5" fill="currentColor"/>
    <circle cx="58" cy="58" r="20" fill="var(--card)" fill-opacity=".55" ${MS}/>
    <path d="M44 66 L52 56 L60 60 L70 48" fill="none" stroke="var(--accent)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M72 72 L88 88" ${MS} stroke-width="6"/>`),
  pencil: svg(`<rect x="10" y="14" width="56" height="72" rx="6" fill="var(--card)" ${MS}/>
    <path d="M20 30 H56 M20 42 H56 M20 54 H48 M20 66 H52" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
    <path d="M60 80 L64 66 L88 22 L96 26 L72 70 Z" fill="var(--gold)" ${MS}/>
    <path d="M60 80 L64 66 L72 70 Z" fill="currentColor"/>`),
  xylo: svg(`${["#E5484D", "#F2994A", "#F2C94C", "#6FCF97", "#2D9CDB", "#7B61FF", "#BB6BD9", "#E5484D"].map((c, i) => `<rect x="${8 + i * 11}" y="${18 + i * 3}" width="9" height="${64 - i * 6}" rx="3" fill="${c}" ${MS} stroke-width="2.2"/>`).join('')}
    <path d="M6 30 L96 50 M6 74 L96 66" stroke="currentColor" stroke-width="2.4" opacity=".6"/>
    <path d="M58 6 L76 32" ${MS} stroke-width="3"/><circle cx="78" cy="35" r="5" fill="var(--accent)" ${MS} stroke-width="2.2"/>`),
  trophy: svg(`<path d="M32 16 H68 V40 Q68 60 50 62 Q32 60 32 40 Z" fill="var(--gold)" ${MS}/>
    <path d="M32 24 H20 Q18 42 34 46 M68 24 H80 Q82 42 66 46" fill="none" ${MS}/>
    <path d="M50 62 V74 M36 86 H64 V78 Q64 74 60 74 H40 Q36 74 36 78 Z" fill="var(--accent)" ${MS}/>
    <ellipse cx="46" cy="44" rx="5" ry="3.8" transform="rotate(-20 46 44)" fill="var(--pen)"/><path d="M50.5 42.5 V24 L58 28" fill="none" stroke="var(--pen)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`),
};
