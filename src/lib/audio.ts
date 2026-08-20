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

export function setAudioPrefs(nextMuted: boolean, nextVolume: number, nextVoiceGender?: "female" | "male") {
  muted = nextMuted;
  volume = nextVolume;
  if (nextVoiceGender) setVoiceGender(nextVoiceGender);
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

/* ---------------- Speech (read-aloud) ----------------
 *
 * The Web Speech API exposes whatever voices the device's OS ships, which
 * work offline. Quality varies hugely — from robotic eSpeak to Apple's
 * "Siri"/enhanced and Microsoft's "Natural"/neural voices that sound close
 * to a real person. We can't bundle our own neural TTS (that would break
 * offline-first and privacy), so "more human" here means: pick the most
 * natural installed voice, honour the parent's female/male choice, and use
 * warm, unhurried prosody instead of the default flat robot cadence.
 */

export type VoiceGender = "female" | "male";
let voiceGender: VoiceGender = "female"; // default requested by parents

// Best voice we've resolved for each gender (recomputed when voices load).
const chosen: Record<VoiceGender, SpeechSynthesisVoice | null> = { female: null, male: null };
let voicesResolved = false;

// Name tokens that reveal a voice's gender across Apple, Google, Microsoft,
// Android and eSpeak. Checked case-insensitively; female is tested first so
// "female" never trips the "male" substring.
const FEMALE_TOKENS = [
  "female", "woman", "samantha", "victoria", "vicki", "karen", "moira", "tessa",
  "fiona", "serena", "allison", "ava", "susan", "zira", "aria", "jenny", "michelle",
  "sonia", "libby", "catherine", "kate", "zoe", "amelie", "anna", "nicky", "flo",
  "google us english", "google uk english female", "eddie (female)"
];
const MALE_TOKENS = [
  "male", "\\bman\\b", "daniel", "aaron", "arthur", "fred", "alex", "tom", "oliver",
  "gordon", "david", "mark", "guy", "ryan", "george", "james", "reed", "rishi",
  "eddy", "rocko", "google uk english male", "grandpa"
];

function classifyGender(name: string): VoiceGender | "unknown" {
  const n = name.toLowerCase();
  if (/\bfemale\b/.test(n) || FEMALE_TOKENS.some(t => n.includes(t))) return "female";
  if (/\bmale\b/.test(n) || MALE_TOKENS.some(t => t.startsWith("\\") ? new RegExp(t).test(n) : n.includes(t))) return "male";
  return "unknown";
}

// Higher = more natural-sounding. These keywords mark the good voices.
function qualityScore(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let s = 0;
  if (/natural|neural/.test(n)) s += 8;
  if (/enhanced|premium/.test(n)) s += 6;
  if (/siri/.test(n)) s += 5;
  if (/google/.test(n)) s += 4;
  if (/microsoft/.test(n)) s += 2;
  if (v.lang?.toLowerCase().startsWith("en")) s += 3;
  if (v.lang === "en-US" || v.lang === "en-GB") s += 1;
  if (v.localService) s += 1; // prefer on-device so it still works offline
  return s;
}

/** Resolve the best available voice for each gender from the OS list. */
function resolveVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return; // not populated yet — 'voiceschanged' will retry
  const enFirst = voices.filter(v => v.lang?.toLowerCase().startsWith("en"));
  const pool = enFirst.length ? enFirst : voices;

  (["female", "male"] as VoiceGender[]).forEach(g => {
    const matches = pool.filter(v => classifyGender(v.name) === g);
    const ranked = (matches.length ? matches : pool)
      .slice()
      .sort((a, b) => qualityScore(b) - qualityScore(a));
    chosen[g] = ranked[0] ?? null;
  });
  voicesResolved = true;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  resolveVoices();
  // Voice lists load asynchronously on most browsers.
  window.speechSynthesis.addEventListener?.("voiceschanged", resolveVoices);
}

/** Warmer, less robotic prosody — tuned slightly per gender. */
function prosody(g: VoiceGender) {
  return g === "male"
    ? { rate: 0.95, pitch: 0.98 }   // calm, grounded
    : { rate: 0.96, pitch: 1.06 };  // bright and friendly
}

export function speak(text: string, rate?: number) {
  if (muted || typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
  try {
    if (!voicesResolved) resolveVoices();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const p = prosody(voiceGender);
    u.rate = rate ?? p.rate;
    u.pitch = p.pitch;
    u.volume = volume;
    const v = chosen[voiceGender] ?? chosen[voiceGender === "female" ? "male" : "female"];
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = "en"; }
    window.speechSynthesis.speak(u);
  } catch { /* speech is a progressive enhancement */ }
}

export function setVoiceGender(g: VoiceGender) {
  voiceGender = g;
  if (!voicesResolved) resolveVoices();
}

/** Speak a short sample so a parent can hear the selected voice. */
export function previewVoice() {
  speak("Hi! I'm your Lamora reading buddy. Let's learn and play together!");
}

/** Which genders actually have a distinct installed voice (for the UI). */
export function availableVoiceGenders(): Record<VoiceGender, boolean> {
  if (!voicesResolved) resolveVoices();
  return {
    female: !!chosen.female && classifyGender(chosen.female.name) === "female",
    male: !!chosen.male && classifyGender(chosen.male.name) === "male"
  };
}

export function stopSpeaking() {
  try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
}
