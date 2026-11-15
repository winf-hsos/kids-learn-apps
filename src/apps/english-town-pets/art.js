// Drawings for the welcome dialog and the mock test: a folded street map with a route and a pin.

const ART = {
  map: svg(`<path d="M10 22 L36 12 L64 22 L90 12 V78 L64 88 L36 78 L10 88 Z" fill="var(--card)" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M36 12 V78 M64 22 V88" stroke="currentColor" stroke-width="2" opacity=".35"/>
    <path d="M44 14 C48 40 40 60 46 84" stroke="#5BA8E0" stroke-width="6" fill="none" opacity=".7"/>
    <path d="M16 70 L30 70 L30 46 L58 46 L58 30 L76 30" fill="none" stroke="var(--accent)" stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round"/>
    <path d="M76 16 C68 16 64 22 64 27 C64 34 76 44 76 44 C76 44 88 34 88 27 C88 22 84 16 76 16 Z" fill="var(--accent)" stroke="currentColor" stroke-width="2.6"/>
    <circle cx="76" cy="27" r="4" fill="var(--card)"/>`),
};
