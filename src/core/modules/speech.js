// Optional core module (manifest "modules": ["speech"]): reads English words aloud
// with the browser's voice from any element with data-say, plus a small listen button.

function speakEn(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text.replace(/\bsb\b/g, 'somebody').replace(/\bsth\b/g, 'something'));
  u.lang = 'en-GB'; u.rate = .9;
  const v = speechSynthesis.getVoices().find(x => /^en(-|_)GB/i.test(x.lang)) || speechSynthesis.getVoices().find(x => /^en/i.test(x.lang));
  if (v) u.voice = v;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
const sayBtn = text => `<button type="button" class="say" data-say="${esc(text)}" aria-label="Anhören">${ICON.soundOn}</button>`;
document.addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b) { e.preventDefault(); speakEn(b.dataset.say); } });
