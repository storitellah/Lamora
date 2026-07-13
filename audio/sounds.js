/* Lamora sound engine.
   All audio is generated on the device with the Web Audio API and the browser's
   built-in speech voices, so everything works offline and nothing is downloaded
   or uploaded. */
(function () {
  'use strict';

  let ctx = null;
  let musicTimer = null;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type, vol) {
    const ac = audio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ac.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(vol || 0.18, ac.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime + start);
    osc.stop(ac.currentTime + start + dur + 0.05);
  }

  const SFX = {
    tap()     { tone(520, 0, 0.08, 'triangle', 0.12); },
    correct() { tone(523, 0, 0.12, 'triangle'); tone(659, 0.1, 0.12, 'triangle'); tone(784, 0.2, 0.2, 'triangle'); },
    wrong()   { tone(330, 0, 0.18, 'sine', 0.1); tone(262, 0.15, 0.25, 'sine', 0.1); },
    star()    { tone(784, 0, 0.1, 'triangle'); tone(988, 0.09, 0.1, 'triangle'); tone(1175, 0.18, 0.22, 'triangle'); },
    win()     { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.22, 'triangle')); },
    flip()    { tone(440, 0, 0.06, 'square', 0.06); },
    pop()     { tone(880, 0, 0.07, 'sine', 0.14); },
    ding()    { tone(1047, 0, 0.3, 'sine', 0.12); },
    move()    { tone(240, 0, 0.07, 'triangle', 0.12); },
    note(n)   { tone([262, 330, 392, 523][n % 4], 0, 0.35, 'triangle', 0.16); }
  };

  /* Gentle looping background "music": a slow, soft arpeggio. */
  const MELODY = [262, 330, 392, 330, 294, 370, 440, 370];
  function startMusic() {
    stopMusic();
    let i = 0;
    musicTimer = setInterval(() => {
      tone(MELODY[i % MELODY.length], 0, 0.9, 'sine', 0.035);
      i++;
    }, 1000);
  }
  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  function speak(text, opts) {
    opts = opts || {};
    try {
      if (!('speechSynthesis' in window) || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.rate = opts.rate || 0.92;
      u.pitch = opts.pitch || 1.05;
      u.lang = opts.lang || 'en-US';
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech is optional — never break the app */ }
  }

  function stopSpeech() {
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  }

  window.LamoraSounds = { SFX, speak, stopSpeech, startMusic, stopMusic, unlock: audio };
})();
