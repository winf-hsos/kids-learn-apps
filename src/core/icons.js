// Inline SVG icons for the shared UI. Colors come from the theme tokens in core.css.

const ICON = {
  star: (on = true) => `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="${on ? 'var(--gold)' : 'var(--line)'}" stroke="${on ? 'var(--gold-ink)' : 'var(--ink-soft)'}" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  ticket: `<svg viewBox="0 0 24 24"><path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z" fill="var(--gold)" stroke="var(--gold-ink)" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 7v10" stroke="var(--gold-ink)" stroke-width="1.5" stroke-dasharray="2 2"/></svg>`,
  fire: `<svg viewBox="0 0 24 24"><path d="M12 2c3 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 1 3 3 4 0-3-1-5 0-8z" fill="#FF8A3D" stroke="#B4471A" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  heart: (on = true) => `<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" fill="${on ? 'var(--bad)' : 'var(--line)'}"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  soundOn: `<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  soundOff: `<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  map: `<svg viewBox="0 0 24 24"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z M9 4v14 M15 6v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  book: `<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 19V5 M8 7h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  pad: `<svg viewBox="0 0 24 24"><path d="M7 7h10a5 5 0 0 1 4.8 6.4l-1 3.4a2.5 2.5 0 0 1-4.3.9L14.6 16H9.4l-1.9 1.7a2.5 2.5 0 0 1-4.3-.9l-1-3.4A5 5 0 0 1 7 7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 10v4M6 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="11" r="1.2" fill="currentColor"/><circle cx="18" cy="13" r="1.2" fill="currentColor"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0z M7 6H4a3 3 0 0 0 3 4 M17 6h3a3 3 0 0 1-3 4 M12 14v4 M8 20h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  lock: `<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  box: `<svg viewBox="0 0 24 24"><path d="M3 8l9-4 9 4v9l-9 4-9-4z M3 8l9 4 9-4 M12 12v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  exam: `<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 4V2.8h6V4 M8.5 10l1.5 1.5 3-3 M8.5 16h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  apps: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor"/></svg>`,
  bulb: `<svg viewBox="0 0 24 24"><path d="M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="var(--gold)" stroke="var(--gold-ink)" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  medal: (c1, c2) => `<svg viewBox="0 0 64 64"><path d="M20 4h10l4 18H24z" fill="var(--accent)"/><path d="M44 4H34l-4 18h10z" fill="var(--bad)"/><circle cx="32" cy="40" r="19" fill="${c1}" stroke="var(--ink)" stroke-width="3"/><circle cx="32" cy="40" r="12" fill="none" stroke="${c2}" stroke-width="3"/><path d="M32 32l2.4 5 5.4.6-4 3.6 1.1 5.3L32 43.8l-4.9 2.7 1.1-5.3-4-3.6 5.4-.6z" fill="${c2}"/></svg>`,
};

const TYPE_ICON = {
  learn: ICON.book,
  match: `<svg viewBox="0 0 24 24"><circle cx="6" cy="7" r="2.5" fill="currentColor"/><circle cx="18" cy="17" r="2.5" fill="currentColor"/><circle cx="6" cy="17" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="7" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 7.5l7 9" stroke="currentColor" stroke-width="2"/></svg>`,
  mc: `<svg viewBox="0 0 24 24"><path d="M9 9a3 3 0 1 1 4 2.8c-.8.3-1 1-1 1.7V15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>`,
  swipe: `<svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 21l3-3M22 21l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  sort: `<svg viewBox="0 0 24 24"><path d="M3 13h7v7H3z M14 13h7v7h-7z M9 3h6v6H9z M12 9v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  order: `<svg viewBox="0 0 24 24"><path d="M9 6h11 M9 12h11 M9 18h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="2" y="8" font-size="7" font-weight="700" fill="currentColor">1</text><text x="2" y="14" font-size="7" font-weight="700" fill="currentColor">2</text><text x="2" y="20" font-size="7" font-weight="700" fill="currentColor">3</text></svg>`,
  write: `<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19z M14 7l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  label: `<svg viewBox="0 0 24 24"><path d="M3 12V4h8l10 10-8 8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="7.5" cy="8.5" r="1.6" fill="currentColor"/></svg>`,
  sim: `<svg viewBox="0 0 24 24"><path d="M12 2c3 4 5 6 5 10a5 5 0 0 1-10 0c0-3 2-5 3-7 1 2 1 3 2 3 0-2 0-4 0-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 22h4" stroke="currentColor" stroke-width="2"/></svg>`,
  memory: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="8" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="9" width="8" height="11" rx="1.5" fill="currentColor"/></svg>`,
  imgquiz: `<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`,
  ghsquiz: `<svg viewBox="0 0 24 24"><path d="M12 2l10 10-10 10L2 12z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 7v6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.4" fill="currentColor"/></svg>`,
};
