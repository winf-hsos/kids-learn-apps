// Takeover of the progress of the earlier English Quest app (see APP.legacy and
// src/core/parents.js). The old app kept its state in localStorage under
// "englishQuest.<learner>.v1": xp, cards {v.*, iv.*: {b: Leitner box, r, w}},
// items {id: {r, w, s: right in a row}}, stats {answers, correct, bestCombo,
// best {story or listening id: best %}, exams [{g: grade}]}, streak {last, count},
// days {date: xp} and wrong [item ids]. Its backup codes look like
// "EQ1.<base64url of raw-deflated JSON>.<6 hex checksum>" (EQ0 without compression).

// The old key carried the learner's name, so it is looked up by its pattern.
function findLegacyKey() {
  try { return Object.keys(localStorage).find(k => /^englishQuest\.[^.]+\.v1$/.test(k)) || ''; } catch (e) { return ''; }
}

// ---------------------------------------------------------------------------
// Backup codes. The old app compressed with CompressionStream('deflate-raw'),
// which only works asynchronously, so a small synchronous inflater decodes it.
// ---------------------------------------------------------------------------
const LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
const LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
const DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

function inflateRaw(src) {
  let pos = 0, bit = 0;
  const out = [];
  const bits = n => {
    let v = 0;
    for (let i = 0; i < n; i++) {
      if (pos >= src.length) throw new Error('end of data');
      v |= ((src[pos] >> bit) & 1) << i;
      if (++bit === 8) { bit = 0; pos++; }
    }
    return v;
  };
  // Canonical Huffman table from code lengths, decoded bit by bit (as in zlib's puff.c).
  const table = lens => {
    const count = new Array(16).fill(0), offs = new Array(16).fill(0), sym = [];
    lens.forEach(l => count[l]++);
    count[0] = 0;
    for (let i = 1; i < 16; i++) offs[i] = offs[i - 1] + count[i - 1];
    lens.forEach((l, s) => { if (l) sym[offs[l]++] = s; });
    return { count, sym };
  };
  const decode = h => {
    let code = 0, first = 0, index = 0;
    for (let len = 1; len < 16; len++) {
      code |= bits(1);
      const c = h.count[len];
      if (code - c < first) return h.sym[index + (code - first)];
      index += c; first = (first + c) << 1; code <<= 1;
    }
    throw new Error('bad code');
  };
  let last;
  do {
    last = bits(1);
    const type = bits(2);
    if (type === 0) {
      if (bit) { bit = 0; pos++; }
      const len = src[pos] | (src[pos + 1] << 8);
      pos += 4;
      for (let i = 0; i < len; i++) out.push(src[pos++]);
      continue;
    }
    let lit, dist;
    if (type === 1) {
      const l = []; for (let i = 0; i < 288; i++) l.push(i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8);
      lit = table(l); dist = table(new Array(30).fill(5));
    } else if (type === 2) {
      const nlen = bits(5) + 257, ndist = bits(5) + 1, ncode = bits(4) + 4;
      const order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], cl = new Array(19).fill(0);
      for (let i = 0; i < ncode; i++) cl[order[i]] = bits(3);
      const clt = table(cl), lens = [];
      while (lens.length < nlen + ndist) {
        const s = decode(clt);
        if (s < 16) lens.push(s);
        else if (s === 16) { const p = lens[lens.length - 1]; for (let r = 3 + bits(2); r > 0; r--) lens.push(p); }
        else for (let r = s === 17 ? 3 + bits(3) : 11 + bits(7); r > 0; r--) lens.push(0);
      }
      lit = table(lens.slice(0, nlen)); dist = table(lens.slice(nlen));
    } else throw new Error('bad block');
    for (;;) {
      let s = decode(lit);
      if (s < 256) { out.push(s); continue; }
      if (s === 256) break;
      s -= 257;
      const len = LBASE[s] + bits(LEXT[s]), d = decode(dist), back = DBASE[d] + bits(DEXT[d]);
      for (let i = 0; i < len; i++) out.push(out[out.length - back]);
    }
  } while (!last);
  return Uint8Array.from(out);
}

// FNV-1a hash of the code body, the old app's checksum (first 6 hex digits).
function legacyChecksum(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 6);
}
// Finds the code anywhere in the text (the old TXT files have a header and line breaks).
function decodeLegacyCode(text) {
  const m = String(text).replace(/\s+/g, '').match(/EQ([01])\.([A-Za-z0-9_-]+)\.([0-9a-f]{6})/);
  if (!m || legacyChecksum(m[2]) !== m[3]) return null;
  let b = m[2].replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  const bytes = Uint8Array.from(atob(b), c => c.charCodeAt(0));
  const old = JSON.parse(new TextDecoder().decode(m[1] === '1' ? inflateRaw(bytes) : bytes));
  return old && typeof old.xp === 'number' ? old : null;
}

// ---------------------------------------------------------------------------
// Conversion into the core state
// ---------------------------------------------------------------------------
// How well the old app knew one item key, from 0 to 1. Words and verbs count from
// their Leitner box (box 3 = right twice, "gemeistert" in the old app), grammar and
// other items from the right answers in a row (2 = mastered), reading questions
// once right, and stories and listening texts from their best result if it was 80 % or more.
function legacyScore(old, lv, key) {
  const card = id => { const c = old.cards[id]; return !c ? 0 : c.b >= 3 ? 1 : c.b === 2 ? .5 : 0; };
  const item = id => { const s = (old.items[id] || {}).s || 0; return s >= 2 ? 1 : s === 1 ? .5 : 0; };
  const text = id => { const best = old.stats.best[id] || 0; return best >= 80 ? best / 100 : 0; };
  if (lv.type === 'vpairs') { const c = pairChunks(lv)[+key.slice(1)] || []; return c.length ? Math.min(...c.map(card)) : 0; }
  if (/^v\./.test(key)) return card(key);
  if (/^iv\./.test(key)) return card(key.replace(/\.r$/, ''));
  if (/^rd\./.test(key)) return (old.items[key] || {}).s >= 1 ? 1 : 0;
  if (/^(st|ls)\./.test(key)) return text(key.split('.').slice(0, 2).join('.'));
  if (/^(g|be|dc)\./.test(key)) return item(key);
  return 0;
}

// Stars, conservatively: the mean score of all items of a level gives 3 stars from
// 95 %, 2 from 80 % and 1 from 60 %. Stars only run along the path from its start, so
// a world never has a starred level behind a locked one; a learn level gets its star
// when the level after it qualifies. Levels the old app did not track (pairs of
// British and American words, the writing workshop, dice sentences) start empty.
function legacyLevels(old) {
  const levels = {};
  WORLDS.forEach(t => {
    const got = t.levels.map(lv => {
      const qt = EQ_QUIZ_TYPES[lv.type];
      if (!qt) return { stars: 0 };
      const keys = qt.pool(lv);
      const ratio = keys.reduce((s, k) => s + legacyScore(old, lv, k), 0) / keys.length;
      return { stars: ratio >= .95 ? 3 : ratio >= .8 ? 2 : ratio >= .6 ? 1 : 0, best: Math.round(ratio * 100) };
    });
    for (let l = 0; l < t.levels.length; l++) {
      const g = t.levels[l].type === 'learn' ? { stars: got[l + 1] && got[l + 1].stars ? 1 : 0, best: 100 } : got[l];
      if (!g.stars) break;
      levels[`${t.id}:${l}`] = g;
    }
  });
  return levels;
}

// The old wrong list becomes the mistake box, each id in the level that asks it the
// way the old training did (vocabulary typed German to English, and so on).
// Whole gap stories have no single sentence to point to and stay out.
const LEGACY_MISTAKE_TYPES = ['vtype', 'ivpast', 'ivbase', 'reg', 'sig', 'q', 'bq', 'sa', 'mcg', 'ty', 'tr', 'ord', 'tfset', 'dict', 'rd', 'beq', 'besp'];
function legacyMistakes(old) {
  const where = {};
  WORLDS.forEach((t, ti) => t.levels.forEach((lv, l) => {
    const qt = EQ_QUIZ_TYPES[lv.type], rank = LEGACY_MISTAKE_TYPES.indexOf(lv.type);
    if (!qt || rank < 0) return;
    qt.pool(lv).forEach(k => { if (!where[k] || where[k].rank > rank) where[k] = { rank, ref: `${t.id}|${l}|${k}` }; });
  }));
  const mistakes = {};
  (old.wrong || []).forEach(id => {
    if (!where[id]) return;
    const rec = old.items[id] || old.cards[id.replace(/\.r$/, '')] || {};
    mistakes[where[id].ref] = { n: Math.max(1, rec.w || 1) };
  });
  return mistakes;
}

function convertLegacy(raw) {
  const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  const old = { ...obj(raw), cards: obj(raw && raw.cards), items: obj(raw && raw.items), days: obj(raw && raw.days), streak: obj(raw && raw.streak), badges: obj(raw && raw.badges) };
  old.stats = { answers: 0, correct: 0, bestCombo: 0, exams: [], ...obj(raw && raw.stats) };
  old.stats.best = obj(old.stats.best);
  old.wrong = Array.isArray(old.wrong) ? old.wrong : [];
  const num = v => Math.max(0, Math.round(+v || 0));
  const answered = num(old.stats.answers), grades = (Array.isArray(old.stats.exams) ? old.stats.exams : []).map(e => +e.g).filter(g => g >= 1 && g <= 6);
  const examBest = grades.length ? String(Math.min(...grades)) : null;
  const levels = legacyLevels(old), stars = Object.values(levels).reduce((s, v) => s + v.stars, 0);
  const today = todayStr(), now = Date.now(), badges = {};
  if (num(old.stats.bestCombo) >= 10 || old.badges.combo10) badges.combo10 = now;
  if (num(old.stats.bestCombo) >= 25 || old.badges.combo25) badges.combo25 = now;
  if (examBest && +examBest <= 2) badges.exam2 = now;
  if (examBest === '1') badges.exam1 = now;
  return {
    xp: num(old.xp), answered, correct: Math.min(num(old.stats.correct), answered), bestCombo: num(old.stats.bestCombo),
    streak: { last: typeof old.streak.last === 'string' ? old.streak.last : '', days: num(old.streak.count) },
    daily: { date: today, xp: num(old.days[today]) },
    examBest, badges, levels, mistakes: legacyMistakes(old),
    tickets: Math.min(TICKET_CAP, 1 + Math.floor(stars / STARS_PER_TICKET)),
    sound: !(old.settings && old.settings.sound === false),
  };
}
