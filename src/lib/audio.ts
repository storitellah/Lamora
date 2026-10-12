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

import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

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
  // Voice lists load asynchronously on most browsers (Android Chrome can take
  // a second or two), so listen and also poll briefly as a backstop for
  // browsers that never fire 'voiceschanged'.
  window.speechSynthesis.addEventListener?.("voiceschanged", resolveVoices);
  let polls = 0;
  const poll = window.setInterval(() => {
    resolveVoices();
    if (voicesResolved || ++polls > 20) clearInterval(poll);
  }, 250);
}

/** Warmer, less robotic prosody — tuned slightly per gender. */
function prosody(g: VoiceGender) {
  return g === "male"
    ? { rate: 0.95, pitch: 0.98 }   // calm, grounded
    : { rate: 0.96, pitch: 1.06 };  // bright and friendly
}

/* ---- Mobile speech reliability ----------------------------------------
 *
 * Read-aloud failed "in some places" on phones and tablets. The causes, and
 * what each piece below does about them:
 *
 *  1. iOS/iPadOS only lets speech start from inside a tap. Prompts that are
 *     read automatically when a screen opens (a quiz question, a story page,
 *     the break screen) were silently dropped until something had been spoken
 *     from a tap. → `unlock()` speaks a silent utterance on the very first
 *     touch anywhere, which unlocks speech for the rest of the session.
 *  2. `cancel()` followed immediately by `speak()` drops the new utterance on
 *     iOS Safari and Android Chrome. → if something is still speaking, cancel
 *     first and start the new text a moment later; a generation counter means
 *     rapid taps only ever say the most recent thing.
 *  3. Chrome stops speaking long text after ~15 seconds and can get stuck in
 *     a paused state. → long text is split into sentences, and a keep-alive
 *     nudges `resume()` while speech is running.
 *  4. Chrome can garbage-collect an utterance mid-sentence. → we keep a
 *     reference to every utterance until it ends.
 *  5. Google's voices in desktop Chrome are network voices: offline they fail
 *     silently. → offline we only pick on-device voices, and any failed
 *     utterance is retried once with the device's default voice.
 *  6. Android's in-app WebView (the installed APK) has no Web Speech API at
 *     all. → when running as an installed app we use the native text-to-speech
 *     engine instead (see `nativeSpeak`).
 */

let unlocked = false;
/** When we last called cancel(); new speech waits until the engine settles. */
let lastCancelAt = -1e9;
const SETTLE_MS = 110;
let pendingText: string | null = null;
let generation = 0;
const live = new Set<SpeechSynthesisUtterance>();
let keepAlive: number | null = null;

function unlock() {
  if (unlocked) return;
  unlocked = true;
  // Resume Web Audio too — iOS starts every AudioContext suspended.
  ac();
  try {
    const synth = window.speechSynthesis;
    if (synth) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      synth.speak(u);
    }
  } catch { /* ignore */ }
  if (pendingText) { const t = pendingText; pendingText = null; setTimeout(() => speak(t), 120); }
}

if (typeof window !== "undefined") {
  const opts = { capture: true, passive: true } as AddEventListenerOptions;
  ["pointerdown", "touchend", "keydown"].forEach(ev => window.addEventListener(ev, unlock, opts));
  // Coming back to the app: iOS suspends audio in the background.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopSpeaking();
    else if (ctx && ctx.state !== "running") void ctx.resume().catch(() => {});
  });
}

/** Split into sentence-sized chunks so Chrome never hits its ~15s cut-off. */
function chunks(text: string): string[] {
  const parts = text.match(/[^.!?…]+[.!?…]*["')\]]*\s*/g) ?? [text];
  const out: string[] = [];
  for (const p of parts) {
    const t = p.trim();
    if (!t) continue;
    if (out.length && (out[out.length - 1] + " " + t).length < 160) out[out.length - 1] += " " + t;
    else out.push(t);
  }
  return out.length ? out : [text];
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!voicesResolved) resolveVoices();
  const v = chosen[voiceGender] ?? chosen[voiceGender === "female" ? "male" : "female"];
  // Offline, a network voice would just fail — use an on-device one instead.
  if (v && !v.localService && typeof navigator !== "undefined" && navigator.onLine === false) {
    const local = window.speechSynthesis.getVoices()
      .filter(x => x.localService && x.lang?.toLowerCase().startsWith("en"))
      .sort((a, b) => {
        const ga = classifyGender(a.name) === voiceGender ? 10 : 0;
        const gb = classifyGender(b.name) === voiceGender ? 10 : 0;
        return gb + qualityScore(b) - (ga + qualityScore(a));
      });
    return local[0] ?? null;
  }
  return v;
}

function webSpeak(text: string, rate: number | undefined, gen: number) {
  const synth = window.speechSynthesis;
  const p = prosody(voiceGender);
  const voice = pickVoice();
  const list = chunks(text);

  const sayChunk = (i: number, useVoice: SpeechSynthesisVoice | null, retried: boolean) => {
    if (gen !== generation || i >= list.length) { if (i >= list.length) stopKeepAlive(); return; }
    const u = new SpeechSynthesisUtterance(list[i]);
    u.rate = rate ?? p.rate;
    u.pitch = p.pitch;
    u.volume = volume;
    if (useVoice) { u.voice = useVoice; u.lang = useVoice.lang; }
    else u.lang = navigator.language?.toLowerCase().startsWith("en") ? navigator.language : "en-GB";
    live.add(u);
    u.onend = () => { live.delete(u); sayChunk(i + 1, useVoice, retried); };
    u.onerror = (e: SpeechSynthesisErrorEvent) => {
      live.delete(u);
      if (e.error === "interrupted" || e.error === "canceled") return; // we did that
      // Voice failed (offline network voice, missing language pack…):
      // retry this chunk once with the device default.
      if (!retried && useVoice) sayChunk(i, null, true);
      else sayChunk(i + 1, useVoice, retried);
    };
    synth.speak(u);
  };

  sayChunk(0, voice, false);
  startKeepAlive();
}

function startKeepAlive() {
  if (keepAlive !== null) return;
  keepAlive = window.setInterval(() => {
    const synth = window.speechSynthesis;
    if (!synth.speaking) { stopKeepAlive(); return; }
    if (synth.paused) synth.resume();
  }, 4000);
}
function stopKeepAlive() {
  if (keepAlive !== null) { clearInterval(keepAlive); keepAlive = null; }
}

/* ---- Native text-to-speech (installed Android / iOS app) ---- */

type NativeTTS = {
  speak(o: { text: string; lang?: string; rate?: number; pitch?: number; volume?: number; voice?: number; category?: string }): Promise<void>;
  stop(): Promise<void>;
  getSupportedVoices(): Promise<{ voices: { name: string; lang: string; voiceURI?: string }[] }>;
};
function nativeTTS(): NativeTTS | null {
  return Capacitor.isNativePlatform() ? (TextToSpeech as unknown as NativeTTS) : null;
}
let nativeVoiceIdx: Record<VoiceGender, number | undefined> | null = null;
async function resolveNativeVoices(tts: NativeTTS) {
  if (nativeVoiceIdx) return nativeVoiceIdx;
  nativeVoiceIdx = { female: undefined, male: undefined };
  try {
    const { voices } = await tts.getSupportedVoices();
    (["female", "male"] as VoiceGender[]).forEach(g => {
      let best = -1, bestScore = -Infinity;
      voices.forEach((v, i) => {
        if (!v.lang?.toLowerCase().replace("_", "-").startsWith("en")) return;
        const n = (v.name + " " + (v.voiceURI ?? "")).toLowerCase();
        let s = classifyGender(n) === g ? 20 : 0;
        if (/enhanced|premium|neural|natural|siri/.test(n)) s += 6;
        if (/network/.test(n)) s -= 10;          // Android: needs internet
        if (/en[-_]gb/.test(v.lang.toLowerCase())) s += 1;
        if (s > bestScore) { bestScore = s; best = i; }
      });
      nativeVoiceIdx![g] = best >= 0 ? best : undefined;
    });
  } catch { /* use engine default */ }
  return nativeVoiceIdx;
}
async function nativeSpeak(tts: NativeTTS, text: string, rate: number | undefined, gen: number) {
  const p = prosody(voiceGender);
  const idx = (await resolveNativeVoices(tts))[voiceGender];
  try { await tts.stop(); } catch { /* nothing playing */ }
  if (gen !== generation) return;
  try {
    // Android's TextToSpeech rate 1.0 is normal speed, same scale as the web.
    await tts.speak({ text, lang: "en-GB", rate: rate ?? p.rate, pitch: p.pitch, volume, voice: idx, category: "playback" });
  } catch {
    try { await tts.speak({ text, lang: "en-US", rate: rate ?? p.rate, pitch: p.pitch, volume }); } catch { /* no engine */ }
  }
}

/** Read text aloud with the parent's chosen voice. Safe to call anywhere. */
export function speak(text: string, rate?: number) {
  if (muted || typeof window === "undefined" || !text) return;
  const gen = ++generation;

  const tts = nativeTTS();
  if (tts) { void nativeSpeak(tts, text, rate, gen); return; }

  if (!("speechSynthesis" in window)) return;
  try {
    const synth = window.speechSynthesis;
    if (!unlocked) {
      // Not unlocked yet (no tap so far): remember it and say it on first tap.
      pendingText = text;
      // Desktop browsers don't need the unlock, so try anyway.
      if (!/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) || !("ontouchend" in document)) {
        pendingText = null;
        webSpeak(text, rate, gen);
      }
      return;
    }
    // Every screen change calls stopSpeaking() (a cancel) and the new screen
    // usually speaks in the same instant — exactly the cancel→speak race that
    // iOS and Android drop. So if a cancel is recent, or something is still
    // talking, cancel and wait for the engine to settle before speaking.
    if (synth.speaking || synth.pending) { synth.cancel(); live.clear(); lastCancelAt = performance.now(); }
    const wait = SETTLE_MS - (performance.now() - lastCancelAt);
    if (wait > 0) {
      setTimeout(() => { if (gen === generation) { if (synth.paused) synth.resume(); webSpeak(text, rate, gen); } }, wait);
    } else {
      if (synth.paused) synth.resume();
      webSpeak(text, rate, gen);
    }
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
  generation++;
  pendingText = null;
  stopKeepAlive();
  live.clear();
  try { if (window.speechSynthesis) { window.speechSynthesis.cancel(); lastCancelAt = performance.now(); } } catch { /* noop */ }
  const tts = typeof window !== "undefined" ? nativeTTS() : null;
  if (tts) void tts.stop().catch(() => {});
}
