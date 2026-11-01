// Inline SVG artwork for the English app (smiley, speech bubbles, film clapper,
// trophy, open book). Line art uses currentColor so it follows the theme.

const ES = 'stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';

const ART = {
  smile: svg(`<circle cx="50" cy="50" r="36" fill="var(--gold)" ${ES}/>
    <circle cx="38" cy="42" r="4" fill="currentColor"/><circle cx="62" cy="42" r="4" fill="currentColor"/>
    <path d="M32 58 Q50 76 68 58" fill="none" ${ES}/>
    <circle cx="28" cy="58" r="5" fill="var(--accent)" opacity=".35"/><circle cx="72" cy="58" r="5" fill="var(--accent)" opacity=".35"/>`),
  bubble: svg(`<path d="M10 22 H62 Q68 22 68 28 V52 Q68 58 62 58 H30 L18 70 V58 H16 Q10 58 10 52 V28 Q10 22 16 22 Z" fill="var(--accent-soft)" ${ES}/>
    <path d="M22 36 H56 M22 46 H46" fill="none" stroke="var(--pen)" stroke-width="3" stroke-linecap="round"/>
    <path d="M40 48 H84 Q90 48 90 54 V74 Q90 80 84 80 H82 V90 L72 80 H46 Q40 80 40 74 V54 Q40 48 46 48 Z" fill="var(--card)" ${ES}/>
    <circle cx="54" cy="64" r="3" fill="currentColor"/><circle cx="65" cy="64" r="3" fill="currentColor"/><circle cx="76" cy="64" r="3" fill="currentColor"/>`),
  clapper: svg(`<rect x="14" y="40" width="72" height="46" rx="4" fill="var(--card)" ${ES}/>
    <path d="M14 40 L80 22 L84 34 L18 52 Z" fill="currentColor"/>
    <path d="M26 37 L34 45 M42 32 L50 40 M58 28 L66 36" stroke="var(--card)" stroke-width="4"/>
    <path d="M26 60 H74 M26 72 H58" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>`),
  trophy: svg(`<path d="M32 16 H68 V40 Q68 60 50 62 Q32 60 32 40 Z" fill="var(--gold)" ${ES}/>
    <path d="M32 24 H20 Q18 42 34 46 M68 24 H80 Q82 42 66 46" fill="none" ${ES}/>
    <path d="M50 62 V74 M36 86 H64 V78 Q64 74 60 74 H40 Q36 74 36 78 Z" fill="var(--accent)" ${ES}/>
    <path d="M44 32 L50 26 V50" fill="none" stroke="var(--pen)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`),
  book: svg(`<path d="M50 28 Q34 18 12 22 V80 Q34 76 50 86 Q66 76 88 80 V22 Q66 18 50 28 Z" fill="var(--card)" ${ES}/>
    <path d="M50 28 V86" fill="none" ${ES}/>
    <path d="M20 36 Q32 33 42 38 M20 48 Q32 45 42 50 M20 60 Q32 57 42 62" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
    <text x="69" y="58" text-anchor="middle" font-family="'Dela Gothic One', sans-serif" font-size="20" fill="var(--pen)">ABC</text>
    <path d="M70 6 L73 14 L81 15 L75 20 L77 28 L70 24 L63 28 L65 20 L59 15 L67 14 Z" fill="var(--gold)" ${ES} stroke-width="2.4"/>`),
};
