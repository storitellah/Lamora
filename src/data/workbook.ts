/**
 * Workbook content: pre-writing patterns, letter skeletons for join-the-dots,
 * and picture-word puzzles. All coordinates live on a 0–100 grid so they can
 * be scaled to any canvas size.
 */

/* ---------------- Pre-writing patterns (PP1/PP2) ----------------
 * These are the classic handwriting-readiness strokes children practise
 * before letters: straight lines, curves, zigzags, waves, loops. Each is an
 * SVG path on a 0–100 × 0–100 grid, drawn as a dashed guide to trace over.
 */

export interface PatternSheet {
  id: string;
  name: string;
  emoji: string;
  hint: string;
  /** SVG path data on a 0–100 grid. */
  d: string;
}

export const PATTERNS: PatternSheet[] = [
  { id: "vert", name: "Standing lines", emoji: "🪵", hint: "Top to bottom, like tall trees!", d: "M12 15 L12 85 M31 15 L31 85 M50 15 L50 85 M69 15 L69 85 M88 15 L88 85" },
  { id: "horiz", name: "Sleeping lines", emoji: "🛏️", hint: "Left to right, like a sleepy snake.", d: "M10 20 L90 20 M10 40 L90 40 M10 60 L90 60 M10 80 L90 80" },
  { id: "slant", name: "Slanting lines", emoji: "⛰️", hint: "Down the mountain slope!", d: "M12 85 L30 15 M32 85 L50 15 M52 85 L70 15 M72 85 L90 15" },
  { id: "zigzag", name: "Zig-zags", emoji: "⚡", hint: "Up, down, up, down — zig zag!", d: "M8 70 L23 30 L38 70 L53 30 L68 70 L83 30 L95 60" },
  { id: "wave", name: "Waves", emoji: "🌊", hint: "Ride the waves up and down.", d: "M8 50 Q20 20 32 50 Q44 80 56 50 Q68 20 80 50 Q88 70 94 55" },
  { id: "bumps", name: "Bumps", emoji: "🐫", hint: "Over the camel humps!", d: "M8 70 Q23 25 38 70 Q53 25 68 70 Q83 25 95 70" },
  { id: "loops", name: "Loops", emoji: "🎢", hint: "Round and round we go!", d: "M10 60 C18 30 30 30 32 55 C34 75 44 75 48 55 C52 32 64 32 66 57 C68 76 80 76 88 52" },
  { id: "circles", name: "Circles", emoji: "⭕", hint: "Start at the top, go all the way round.", d: "M32 50 A18 18 0 1 1 31.9 50 M82 50 A18 18 0 1 1 81.9 50" },
  { id: "spiral", name: "Spirals", emoji: "🐌", hint: "Curl in like a snail shell.", d: "M50 50 m0 0 a5 5 0 1 1 6 4 a12 12 0 1 1 -14 10 a20 20 0 1 1 24 -16 a28 28 0 1 1 -34 -6" },
  { id: "arches", name: "Arches & cups", emoji: "🌈", hint: "An arch, then a cup — over and under.", d: "M10 65 Q25 25 40 65 M45 35 Q60 75 75 35 M80 65 Q90 40 96 62" }
];

/* ---------------- Letter skeletons for join-the-dots ----------------
 * Each letter is a list of pen strokes; each stroke is a run of points the
 * child taps in order. Dots are numbered continuously across strokes, and a
 * line is only drawn *within* a stroke — exactly how a handwriting workbook
 * shows "lift your pencil here". Coordinates are on a 0–100 grid.
 */

export type Stroke = [number, number][];

export const LETTER_DOTS: Record<string, Stroke[]> = {
  A: [[[20, 90], [50, 12], [80, 90]], [[32, 58], [68, 58]]],
  B: [[[28, 12], [28, 90]], [[28, 12], [66, 22], [58, 48], [28, 50]], [[28, 50], [70, 62], [62, 84], [28, 90]]],
  C: [[[76, 26], [50, 12], [26, 32], [24, 68], [50, 88], [76, 74]]],
  D: [[[28, 12], [28, 90]], [[28, 12], [62, 22], [72, 50], [62, 80], [28, 90]]],
  E: [[[74, 14], [28, 14], [28, 50], [28, 88], [74, 88]], [[28, 50], [64, 50]]],
  F: [[[74, 14], [28, 14], [28, 50], [28, 90]], [[28, 50], [64, 50]]],
  G: [[[76, 26], [50, 12], [26, 32], [24, 68], [50, 88], [76, 72], [76, 54], [56, 54]]],
  H: [[[26, 12], [26, 90]], [[74, 12], [74, 90]], [[26, 50], [74, 50]]],
  I: [[[32, 14], [68, 14]], [[50, 14], [50, 86]], [[32, 86], [68, 86]]],
  J: [[[70, 14], [70, 68], [50, 88], [30, 74]]],
  K: [[[28, 12], [28, 90]], [[74, 12], [28, 52]], [[44, 44], [76, 90]]],
  L: [[[28, 12], [28, 88], [76, 88]]],
  M: [[[20, 90], [20, 12], [50, 56], [80, 12], [80, 90]]],
  N: [[[24, 90], [24, 12], [76, 88], [76, 12]]],
  O: [[[50, 12], [24, 34], [24, 68], [50, 88], [76, 66], [76, 34], [50, 12]]],
  P: [[[28, 90], [28, 12], [66, 20], [70, 40], [58, 54], [28, 54]]],
  Q: [[[50, 12], [24, 34], [24, 68], [50, 88], [76, 66], [76, 34], [50, 12]], [[58, 68], [84, 94]]],
  R: [[[28, 90], [28, 12], [66, 20], [70, 40], [58, 54], [28, 54]], [[48, 54], [78, 90]]],
  S: [[[76, 28], [50, 14], [28, 28], [40, 48], [62, 54], [74, 70], [50, 88], [24, 74]]],
  T: [[[18, 14], [82, 14]], [[50, 14], [50, 90]]],
  U: [[[24, 12], [24, 66], [50, 88], [76, 66], [76, 12]]],
  V: [[[20, 12], [50, 90], [80, 12]]],
  W: [[[14, 12], [32, 90], [50, 40], [68, 90], [86, 12]]],
  X: [[[22, 12], [78, 90]], [[78, 12], [22, 90]]],
  Y: [[[22, 12], [50, 50], [78, 12]], [[50, 50], [50, 90]]],
  Z: [[[22, 14], [78, 14], [22, 88], [78, 88]]]
};

export const NUMBER_DOTS: Record<string, Stroke[]> = {
  "1": [[[34, 26], [52, 12], [52, 88]], [[32, 88], [72, 88]]],
  "2": [[[26, 28], [50, 12], [72, 28], [62, 50], [26, 88], [76, 88]]],
  "3": [[[26, 22], [50, 12], [70, 28], [52, 48]], [[52, 48], [74, 64], [58, 88], [26, 80]]],
  "4": [[[62, 12], [22, 62], [78, 62]], [[62, 30], [62, 90]]],
  "5": [[[72, 14], [30, 14], [28, 46], [56, 44], [74, 62], [58, 88], [26, 80]]],
  "6": [[[68, 16], [40, 28], [28, 58], [30, 80], [54, 90], [72, 74], [60, 54], [30, 60]]],
  "7": [[[22, 14], [78, 14], [44, 90]]],
  "8": [[[50, 12], [30, 26], [50, 46], [70, 26], [50, 12]], [[50, 46], [26, 66], [50, 88], [74, 66], [50, 46]]],
  "9": [[[68, 44], [44, 52], [30, 34], [48, 14], [70, 28], [68, 60], [54, 88]]],
  "0": [[[50, 12], [26, 34], [26, 68], [50, 88], [74, 68], [74, 34], [50, 12]]]
};

/* ---------------- Picture words ----------------
 * Used by "first letter", "complete the word", "letter maze" and word games.
 * Kept to concrete, picturable nouns a 4–8 year old knows.
 */

export interface PicWord { word: string; emoji: string }

export const PIC_WORDS: PicWord[] = [
  { word: "apple", emoji: "🍎" }, { word: "ant", emoji: "🐜" }, { word: "ball", emoji: "⚽" },
  { word: "bus", emoji: "🚌" }, { word: "cat", emoji: "🐱" }, { word: "cake", emoji: "🍰" },
  { word: "dog", emoji: "🐶" }, { word: "duck", emoji: "🦆" }, { word: "egg", emoji: "🥚" },
  { word: "fish", emoji: "🐟" }, { word: "frog", emoji: "🐸" }, { word: "goat", emoji: "🐐" },
  { word: "hat", emoji: "🎩" }, { word: "house", emoji: "🏠" }, { word: "igloo", emoji: "🧊" },
  { word: "jam", emoji: "🍓" }, { word: "kite", emoji: "🪁" }, { word: "key", emoji: "🔑" },
  { word: "lion", emoji: "🦁" }, { word: "leaf", emoji: "🍃" }, { word: "moon", emoji: "🌙" },
  { word: "mouse", emoji: "🐭" }, { word: "nest", emoji: "🪺" }, { word: "nose", emoji: "👃" },
  { word: "orange", emoji: "🍊" }, { word: "owl", emoji: "🦉" }, { word: "pig", emoji: "🐷" },
  { word: "pen", emoji: "🖊️" }, { word: "queen", emoji: "👑" }, { word: "rain", emoji: "🌧️" },
  { word: "rabbit", emoji: "🐰" }, { word: "sun", emoji: "☀️" }, { word: "star", emoji: "⭐" },
  { word: "tree", emoji: "🌳" }, { word: "train", emoji: "🚂" }, { word: "umbrella", emoji: "☂️" },
  { word: "van", emoji: "🚐" }, { word: "violin", emoji: "🎻" }, { word: "whale", emoji: "🐳" },
  { word: "web", emoji: "🕸️" }, { word: "box", emoji: "📦" }, { word: "fox", emoji: "🦊" },
  { word: "yacht", emoji: "⛵" }, { word: "yo-yo", emoji: "🪀" }, { word: "zebra", emoji: "🦓" },
  { word: "zip", emoji: "🤐" }
];

/** Short, decodable words (CVC-ish) for early "complete the word" sheets. */
export const SHORT_WORDS: PicWord[] = PIC_WORDS.filter(w => w.word.length <= 4 && !w.word.includes("-"));

/** Pick every word starting with a given letter. */
export function wordsStartingWith(letter: string): PicWord[] {
  const l = letter.toLowerCase();
  return PIC_WORDS.filter(w => w.word[0].toLowerCase() === l);
}
