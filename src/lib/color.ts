/**
 * Lamora colour engine — the maths behind Colour Lab.
 *
 * WHY THIS ISN'T JUST AVERAGING RGB
 * Children learn that blue + yellow = green. If you average those two in RGB
 * you get (127,127,127) — grey. Averaging teaches the wrong thing, so paint
 * mixing here happens in **RYB space** (the artist's red/yellow/blue wheel)
 * using Gosset & Chen's trilinear interpolation of the RYB cube. That gives
 * the results a child actually sees in a paint pot:
 *     blue + yellow → green      red + yellow → orange
 *     red + blue    → purple     all three    → brown
 *
 * Light is genuinely different, and that contrast is the best bit of colour
 * science for kids: light ADDS (red + green = yellow, all three = white),
 * paint SUBTRACTS. `mixLight` does true additive mixing, so the Light vs
 * Paint screen is comparing two real models, not a gimmick.
 */

export interface RGB { r: number; g: number; b: number }   // 0–255

/* ---------------- Conversions ---------------- */

export const toHex = ({ r, g, b }: RGB) =>
  "#" + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

export function fromHex(hex: string): RGB {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

/* ---------------- RYB → RGB (Gosset & Chen cube) ----------------
 * The eight corners of the RYB cube, expressed as the RGB colour an artist
 * actually gets. Everything in between is trilinear interpolation.
 */
const RYB_CORNERS: Record<string, [number, number, number]> = {
  "000": [255, 255, 255], // no pigment → white paper
  "100": [255, 39, 39],   // red
  "010": [255, 237, 45],  // yellow
  "001": [37, 94, 199],   // blue
  "110": [255, 140, 20],  // red + yellow  → orange
  "101": [146, 57, 169],  // red + blue    → purple
  "011": [38, 166, 77],   // yellow + blue → green
  "111": [86, 60, 42]     // all three     → brown
};

/** Convert an RYB triple (each 0–1) to RGB. */
export function rybToRgb(r: number, y: number, b: number): RGB {
  const lerp = (a: number, bb: number, t: number) => a + (bb - a) * t;
  const c = (key: string, i: number) => RYB_CORNERS[key][i];
  const out: number[] = [];
  for (let i = 0; i < 3; i++) {
    // interpolate along red, then yellow, then blue
    const y0 = lerp(lerp(c("000", i), c("100", i), r), lerp(c("010", i), c("110", i), r), y);
    const y1 = lerp(lerp(c("001", i), c("101", i), r), lerp(c("011", i), c("111", i), r), y);
    out.push(lerp(y0, y1, b));
  }
  return { r: out[0], g: out[1], b: out[2] };
}

/* ---------------- Paint (subtractive) mixing ---------------- */

/** A dollop of paint: which pigment, and how many drops. */
export interface Dollop { ryb: [number, number, number]; drops: number }

/** The pigments a child can pour, in RYB terms. */
export const PIGMENTS = {
  red:    { ryb: [1, 0, 0] as [number, number, number], name: "Red",    emoji: "🔴" },
  yellow: { ryb: [0, 1, 0] as [number, number, number], name: "Yellow", emoji: "🟡" },
  blue:   { ryb: [0, 0, 1] as [number, number, number], name: "Blue",   emoji: "🔵" },
  white:  { ryb: [0, 0, 0] as [number, number, number], name: "White",  emoji: "⚪" },
  black:  { ryb: [1, 1, 1] as [number, number, number], name: "Black",  emoji: "⚫" }
};
export type PigmentId = keyof typeof PIGMENTS;

/**
 * Mix paint.
 *
 * Two full-strength pigments must stay full strength: equal blue and yellow
 * gives a SATURATED green, not a pale one. So we take the *ratio* of the
 * coloured pigments and normalise it by the largest, which lands us on the
 * saturated edge of the RYB cube rather than dragging the mix toward white.
 *
 * White and black are handled separately, because that is exactly how a child
 * uses them: white to lighten (a tint), black to darken (a shade).
 */
export function mixPaint(drops: Partial<Record<PigmentId, number>>): RGB {
  const red = drops.red ?? 0, yellow = drops.yellow ?? 0, blue = drops.blue ?? 0;
  const white = drops.white ?? 0, black = drops.black ?? 0;
  const chroma = red + yellow + blue;

  // Start from the fully saturated hue that the pigment ratio describes.
  let base: RGB;
  if (chroma > 0) {
    const max = Math.max(red, yellow, blue);
    base = rybToRgb(red / max, yellow / max, blue / max);
  } else {
    base = { r: 255, g: 255, b: 255 };   // nothing but white and/or black
  }

  if (white > 0) base = tint(base, white / (white + chroma));          // lighter
  if (black > 0) base = shade(base, black / (black + chroma + white)); // darker
  return base;
}

/* ---------------- Light (additive) mixing ---------------- */

export const LIGHTS = {
  red:   { rgb: { r: 255, g: 0, b: 0 },   name: "Red light",   emoji: "🔴" },
  green: { rgb: { r: 0, g: 255, b: 0 },   name: "Green light", emoji: "🟢" },
  blue:  { rgb: { r: 0, g: 0, b: 255 },   name: "Blue light",  emoji: "🔵" }
};
export type LightId = keyof typeof LIGHTS;

/** Shine lights together — channels ADD and clip at full brightness. */
export function mixLight(on: Partial<Record<LightId, boolean>>): RGB {
  let r = 0, g = 0, b = 0;
  for (const id of Object.keys(LIGHTS) as LightId[]) {
    if (!on[id]) continue;
    const c = LIGHTS[id].rgb;
    r += c.r; g += c.g; b += c.b;
  }
  return { r: Math.min(255, r), g: Math.min(255, g), b: Math.min(255, b) };
}

/** What two lights make, in words — used for the science explanation. */
export function lightMixName(on: Partial<Record<LightId, boolean>>): string {
  const ids = (Object.keys(LIGHTS) as LightId[]).filter(i => on[i]);
  if (ids.length === 0) return "Darkness";
  if (ids.length === 3) return "White";
  if (ids.length === 1) return LIGHTS[ids[0]].name;
  const set = new Set(ids);
  if (set.has("red") && set.has("green")) return "Yellow";
  if (set.has("red") && set.has("blue")) return "Magenta (pink)";
  return "Cyan (sky blue)";
}

/* ---------------- Tints, shades and tones ---------------- */

/** Mix with white → lighter. amount 0–1. */
export const tint = (c: RGB, amount: number): RGB => ({
  r: c.r + (255 - c.r) * amount,
  g: c.g + (255 - c.g) * amount,
  b: c.b + (255 - c.b) * amount
});

/** Mix with black → darker. */
export const shade = (c: RGB, amount: number): RGB => ({
  r: c.r * (1 - amount), g: c.g * (1 - amount), b: c.b * (1 - amount)
});

/** Mix with grey → duller. */
export const tone = (c: RGB, amount: number): RGB => ({
  r: c.r + (128 - c.r) * amount,
  g: c.g + (128 - c.g) * amount,
  b: c.b + (128 - c.b) * amount
});

/* ---------------- Naming and comparing ---------------- */

/** Straight-line distance in RGB — good enough to judge "close enough". */
export function distance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

/** RGB to HSL, so naming can reason about hue, saturation and lightness. */
function toHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) / 6;
  else if (max === G) h = ((B - R) / d + 2) / 6;
  else h = ((R - G) / d + 4) / 6;
  return { h: h * 360, s, l };
}

/** Hue buckets in degrees, with the everyday word a child would use. */
const HUES: [number, number, string][] = [
  [0, 15, "red"], [15, 45, "orange"], [45, 68, "yellow"],
  [68, 160, "green"], [160, 200, "turquoise"], [200, 255, "blue"],
  [255, 292, "purple"], [292, 345, "pink"], [345, 361, "red"]
];

/**
 * The closest everyday name for a colour, so the app can say it aloud.
 * Classifying by hue/saturation/lightness beats nearest-RGB matching, which
 * used to call a perfectly good purple "grey".
 */
export function nameOf(c: RGB): string {
  const { h, s, l } = toHsl(c);

  if (s < 0.12) {                       // almost no colour left
    if (l > 0.92) return "White";
    if (l > 0.65) return "Light grey";
    if (l > 0.3) return "Grey";
    return "Black";
  }
  if (l > 0.95) return "White";
  if (l < 0.08) return "Black";

  let hue = "red";
  for (const [lo, hi, name] of HUES) if (h >= lo && h < hi) { hue = name; break; }

  // Muted warm colours read as brown — which is what a child calls them.
  if ((hue === "orange" || hue === "red" || hue === "yellow") && s < 0.55 && l < 0.62) return "Brown";
  if (hue === "orange" && l < 0.32) return "Brown";

  if (hue === "red" && l > 0.72) return "Pink";
  if (l > 0.78) return "Light " + hue;
  if (l < 0.3) return "Dark " + hue;
  return hue.charAt(0).toUpperCase() + hue.slice(1);
}

/** 0–100 "how close did you get?" score for the matching game. */
export function matchScore(a: RGB, b: RGB): number {
  const maxD = Math.sqrt(3 * 255 ** 2);
  return Math.max(0, Math.round((1 - distance(a, b) / maxD) * 100));
}

/** Readable text colour for a swatch background. */
export const readableInk = (c: RGB) =>
  (c.r * 299 + c.g * 587 + c.b * 114) / 1000 > 150 ? "#1d1d2f" : "#ffffff";
