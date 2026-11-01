// Small helpers shared by the engine, the games and every app.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function svg(inner, vb = '0 0 100 100') {
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
}

// Dates are plain 'YYYY-MM-DD' strings in local time.
const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayStr = () => isoDate(new Date());
function parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function daysUntil(s) { const now = new Date(); now.setHours(0, 0, 0, 0); return Math.round((parseDate(s) - now) / 864e5); }
const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const weekdayOf = s => WEEKDAYS[parseDate(s).getDay()];
function shortDate(s) { const d = parseDate(s); return `${d.getDate()}.${d.getMonth() + 1}.`; }
// A period after a solution, unless it already ends with a punctuation mark.
const endDot = t => /[.!?…]$/.test(String(t).replace(/<[^>]*>/g, '').trim()) ? '' : '.';
