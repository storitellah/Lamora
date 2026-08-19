/**
 * Lamora audio engine — 100% on-device.
 *
 * - Sound effects are synthesised with the Web Audio API (no files).
 * - Background music is a gentle generative loop (soft marimba-ish plucks
 *   over a slow chord cycle) so it never repeats a "track" and costs 0 KB.
 * - Speech uses the OS voices via the Web Speech API, which works offline
 *   on iOS, Android, Windows and macOS.
 * - Haptics: a tiny vibration on supported devices makes taps feel tactile.
 */

let ctx: AudioContext | null = null;
let musicTimer: number | null = null;
let musicGain: GainNode | null = null;

let muted = false;
let volume = 0.7;

export function setAudioPrefs(nextMuted: boolean, nextVolume: number) {
  muted = nextMuted;
  volume = nextVolume;
  if (musicGain) musicGain.gain.value = muted ? 0 : volume * 0.16;
  if (muted) stopSpeaking();
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", delay = 0, vol = 0.2) {
  const a = ac();
  if (!a || muted) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  const v = vol * volume;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(Math.max(v, 0.0002), t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  tap: () => tone(520, 0.08, "triangle"),
  pop: () => tone(940, 0.05, "square", 0, 0.07),
  flip: () => tone(700, 0.06, "triangle", 0, 0.1),
  correct: () => { tone(660, 0.12); tone(880, 0.16, "sine", 0.1); },
  wrong: () => { tone(392, 0.16, "sine", 0, 0.12); tone(330, 0.2, "sine", 0.13, 0.1); },
  star: () => { tone(660, 0.1, "triangle"); tone(880, 0.1, "triangle", 0.09); tone(1175, 0.22, "triangle", 0.18); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "triangle", i * 0.12)),
  chime: () => { tone(1047, 0.3, "sine", 0, 0.12); tone(1319, 0.4, "sine", 0.12, 0.1); },
  tick: () => tone(880, 0.04, "sine", 0, 0.05)
};

/** Small haptic bump on devices that support it (Android Chrome mostly). */
export function haptic(ms = 8) {
  try { navigator.vibrate?.(ms); } catch { /* unsupported — fine */ }
}

/* ---------------- Generative background music ---------------- */

// A calm I–vi–IV–V cycle in C major; notes picked from the active chord.
const CHORDS = [
  [261.63, 329.63, 392.0, 523.25],   // C
  [220.0, 261.63, 329.63, 440.0],    // Am
  [174.61, 220.0, 261.63, 349.23],   // F
  [196.0, 246.94, 293.66, 392.0]     // G
];

export function startMusic() {
  const a = ac();
  if (!a || musicTimer !== null) return;
  musicGain = a.createGain();
  musicGain.gain.value = muted ? 0 : volume * 0.16;
  musicGain.connect(a.destination);

  let step = 0;
  const play = () => {
    const chord = CHORDS[Math.floor(step / 8) % CHORDS.length];
    // Soft pluck: short triangle with a fast decay, occasionally an octave up.
    const base = chord[Math.floor(Math.random() * chord.length)];
    const freq = Math.random() < 0.25 ? base * 2 : base;
    if (!muted && musicGain && a) {
      const t0 = a.currentTime;
      const osc = a.createOscillator();
      const g = a.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.9, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
      osc.connect(g).connect(musicGain);
      osc.start(t0);
      osc.stop(t0 + 1);
    }
    step++;
  };
  musicTimer = window.setInterval(play, 620);
}

export function stopMusic() {
  if (musicTimer !== null) { clearInterval(musicTimer); musicTimer = null; }
  musicGain?.disconnect();
  musicGain = null;
}

/* ---------------- Speech (read-aloud) ---------------- */

export function speak(text: string, rate = 0.92) {
  if (muted || !("speechSynthesis" in window) || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = 1.08;
    u.volume = volume;
    window.speechSynthesis.speak(u);
  } catch { /* speech is a progressive enhancement */ }
}

export function stopSpeaking() {
  try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
}
