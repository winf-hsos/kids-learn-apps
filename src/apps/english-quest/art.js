// Inline SVG artwork for English Quest (magnifying glass, case file, book, headphones,
// lightning bolt). The worlds have pictures; these drawings appear in the welcome
// dialog, the mock test and the learn cards. Line art uses currentColor so it follows the theme.

const QS = 'stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';

const ART = {
  glass: svg(`<circle cx="42" cy="42" r="26" fill="var(--accent-soft)" ${QS}/>
    <path d="M30 34 Q34 26 44 25" fill="none" stroke="var(--card)" stroke-width="4" stroke-linecap="round"/>
    <path d="M61 61 L84 84" stroke="currentColor" stroke-width="11" stroke-linecap="round"/>
    <path d="M61 61 L84 84" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/>
    <g fill="var(--pen)"><ellipse cx="42" cy="48" rx="7" ry="6"/><circle cx="32" cy="38" r="3.4"/><circle cx="39" cy="33" r="3.4"/><circle cx="46" cy="33" r="3.4"/><circle cx="53" cy="38" r="3.4"/></g>`),
  file: svg(`<path d="M14 26 H40 L46 32 H86 V82 Q86 86 82 86 H18 Q14 86 14 82 Z" fill="var(--gold)" ${QS}/>
    <path d="M14 40 H86" fill="none" ${QS}/>
    <rect x="26" y="50" width="34" height="22" rx="2" fill="var(--card)" ${QS} stroke-width="2.6"/>
    <path d="M31 57 H55 M31 64 H48" stroke="var(--pen)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="72" cy="62" r="8" fill="var(--accent)" ${QS} stroke-width="2.6"/>
    <path d="M68 62 L71 65 L77 58" fill="none" stroke="var(--card)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`),
  book: svg(`<path d="M50 28 Q34 18 12 22 V80 Q34 76 50 86 Q66 76 88 80 V22 Q66 18 50 28 Z" fill="var(--card)" ${QS}/>
    <path d="M50 28 V86" fill="none" ${QS}/>
    <path d="M20 36 Q32 33 42 38 M20 48 Q32 45 42 50 M20 60 Q32 57 42 62" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
    <g fill="var(--pen)"><ellipse cx="69" cy="56" rx="7" ry="6"/><circle cx="60" cy="47" r="3"/><circle cx="66" cy="42" r="3"/><circle cx="73" cy="42" r="3"/><circle cx="79" cy="47" r="3"/></g>`),
  phones: svg(`<path d="M22 60 V48 Q22 20 50 20 Q78 20 78 48 V60" fill="none" ${QS} stroke-width="6"/>
    <rect x="14" y="54" width="18" height="28" rx="7" fill="var(--accent)" ${QS}/>
    <rect x="68" y="54" width="18" height="28" rx="7" fill="var(--accent)" ${QS}/>
    <path d="M6 62 Q2 68 6 74 M94 62 Q98 68 94 74" fill="none" stroke="var(--gold)" stroke-width="3.4" stroke-linecap="round"/>`),
  bolt: svg(`<circle cx="50" cy="54" r="34" fill="var(--card)" ${QS}/>
    <path d="M44 6 H56 M50 6 V20" ${QS} fill="none"/>
    <path d="M56 28 L36 58 H50 L44 82 L66 48 H52 Z" fill="var(--gold)" ${QS}/>`),
};
