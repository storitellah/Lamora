/* Lamora audio: gentle synthesised feedback sounds (Web Audio API) and
   spoken words (Web Speech API). Everything runs on-device and offline —
   no audio files are downloaded and nothing is recorded. */
(function () {
  "use strict";

  let ctx = null;
  function audioCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function isMuted() {
    return window.Lamora && Lamora.settings && Lamora.settings.muted;
  }
  function volume() {
    const v = window.Lamora && Lamora.settings ? Lamora.settings.volume : 0.7;
    return typeof v === "number" ? v : 0.7;
  }

  function tone(freq, dur, type, delay, vol) {
    const ac = audioCtx();
    if (!ac || isMuted()) return;
    const t0 = ac.currentTime + (delay || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    const v = (vol || 0.22) * volume();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(v, 0.0002), t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  const Sound = {
    tap()      { tone(520, 0.09, "triangle"); },
    correct()  { tone(660, 0.12, "sine"); tone(880, 0.16, "sine", 0.1); },
    star()     { tone(660, 0.1, "triangle"); tone(880, 0.1, "triangle", 0.09); tone(1175, 0.22, "triangle", 0.18); },
    tryAgain() { tone(392, 0.18, "sine", 0, 0.15); tone(330, 0.22, "sine", 0.15, 0.13); },
    flip()     { tone(700, 0.06, "triangle", 0, 0.12); },
    win()      { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "triangle", i * 0.13)); },
    pop()      { tone(950, 0.05, "square", 0, 0.08); },
    tick()     { tone(880, 0.04, "sine", 0, 0.06); },
    chime()    { tone(1047, 0.3, "sine", 0, 0.12); tone(1319, 0.4, "sine", 0.12, 0.1); },
    note(i)    { tone([330, 392, 494, 587][i % 4], 0.32, "triangle", 0, 0.2); }
  };

  /* Speech: used for spoken instructions, letter sounds and word reading.
     speechSynthesis voices are provided by the device OS, so they work
     offline on iOS, Android, Windows and macOS. */
  function speak(text, opts) {
    if (isMuted() || !("speechSynthesis" in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.rate = (opts && opts.rate) || 0.9;
      u.pitch = (opts && opts.pitch) || 1.1;
      u.volume = volume();
      u.lang = (opts && opts.lang) || "en";
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech is optional — never break the app */ }
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }

  window.LamoraAudio = { Sound, speak, stopSpeaking };
})();
