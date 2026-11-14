// Inline SVG artwork for the irregular verbs app (lemonade, paper plane, bicycle,
// alarm clock, trophy, open book). Line art uses currentColor so it follows the theme.

const ES = 'stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';

const ART = {
  glass: svg(`<path d="M28 18 H72 L66 88 H34 Z" fill="var(--card)" ${ES}/>
    <path d="M31 44 H69 L66 88 H34 Z" fill="var(--gold)" ${ES}/>
    <circle cx="44" cy="62" r="6" fill="none" stroke="var(--pen)" stroke-width="2.6"/><circle cx="57" cy="74" r="5" fill="none" stroke="var(--pen)" stroke-width="2.6"/>
    <path d="M56 46 L66 6" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/>`),
  plane: svg(`<path d="M10 52 L88 18 L66 84 L48 62 Z" fill="var(--card)" ${ES}/>
    <path d="M88 18 L48 62 L44 82 L56 68" fill="none" ${ES}/>
    <path d="M14 78 Q24 70 34 74" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="3 6" stroke-linecap="round"/>`),
  bike: svg(`<circle cx="26" cy="64" r="16" fill="none" ${ES}/><circle cx="74" cy="64" r="16" fill="none" ${ES}/>
    <path d="M26 64 L42 40 H66 L74 64 M42 40 L52 64 H26 M52 64 L66 40 M38 32 H48 M62 30 L66 40 L74 30" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="80" cy="26" r="5" fill="var(--gold)" ${ES} stroke-width="2.4"/>`),
  clock: svg(`<circle cx="50" cy="54" r="32" fill="var(--card)" ${ES}/>
    <circle cx="26" cy="22" r="10" fill="var(--accent)" ${ES}/><circle cx="74" cy="22" r="10" fill="var(--accent)" ${ES}/>
    <path d="M50 54 V34 M50 54 L64 62 M30 88 L36 80 M70 88 L64 80" fill="none" ${ES}/>
    <path d="M8 46 Q4 54 8 62 M92 46 Q96 54 92 62" fill="none" stroke="var(--gold)" stroke-width="3.2" stroke-linecap="round"/>`),
  trophy: svg(`<path d="M32 16 H68 V40 Q68 60 50 62 Q32 60 32 40 Z" fill="var(--gold)" ${ES}/>
    <path d="M32 24 H20 Q18 42 34 46 M68 24 H80 Q82 42 66 46" fill="none" ${ES}/>
    <path d="M50 62 V74 M36 86 H64 V78 Q64 74 60 74 H40 Q36 74 36 78 Z" fill="var(--accent)" ${ES}/>
    <path d="M44 32 L50 26 V50" fill="none" stroke="var(--pen)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`),
  book: svg(`<path d="M50 28 Q34 18 12 22 V80 Q34 76 50 86 Q66 76 88 80 V22 Q66 18 50 28 Z" fill="var(--card)" ${ES}/>
    <path d="M50 28 V86" fill="none" ${ES}/>
    <path d="M20 36 Q32 33 42 38 M20 48 Q32 45 42 50 M20 60 Q32 57 42 62 M58 38 Q68 33 80 36 M58 50 Q68 45 80 48 M58 62 Q68 57 80 60" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
    <path d="M70 6 L73 14 L81 15 L75 20 L77 28 L70 24 L63 28 L65 20 L59 15 L67 14 Z" fill="var(--gold)" ${ES} stroke-width="2.4"/>`),
};
