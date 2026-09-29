/**
 * Shape algebra for the "Shape Sums" puzzle.
 *
 * Every shape is modelled as a SET OF LINE SEGMENTS on a 0–100 grid. That
 * makes the puzzle genuinely arithmetic rather than hand-faked:
 *
 *     A + B  =  union of their segments
 *     A − B  =  A's segments with B's removed
 *
 * So "two vertical lines + two horizontal lines = square" and
 * "circle + small circle = circle-in-circle" fall out of the model, and every
 * puzzle we show is *derived and verified*, never hard-coded.
 *
 * We only ever show equations where the two operands AND the answer are all
 * recognisable named shapes, so nothing looks like random scribble.
 */

export interface Segment { id: string; d: string }

/* ---------------- The segment vocabulary ---------------- */

const SEG: Record<string, string> = {
  // square edges
  t:  "M20 20 H80",
  b:  "M20 80 H80",
  l:  "M20 20 V80",
  r:  "M80 20 V80",
  // middle lines (make a cross / window)
  mv: "M50 20 V80",
  mh: "M20 50 H80",
  // diagonals
  d1: "M20 20 L80 80",
  d2: "M80 20 L20 80",
  // circles
  circ:  "M80 50 A30 30 0 1 1 79.99 49.5",
  scirc: "M62 50 A12 12 0 1 1 61.99 49.7",
  // inner square edges
  st: "M35 35 H65",
  sb: "M35 65 H65",
  sl: "M35 35 V65",
  sr: "M65 35 V65",
  // diamond edges (upper pair = chevron up, lower pair = chevron down)
  dul: "M50 15 L20 50",
  dur: "M50 15 L80 50",
  ddl: "M20 50 L50 85",
  ddr: "M80 50 L50 85",
  // half-circle arcs
  arcL: "M50 20 A30 30 0 0 0 50 80",
  arcR: "M50 20 A30 30 0 0 1 50 80"
};

export type SegId = keyof typeof SEG;

export interface NamedShape {
  id: string;
  name: string;
  segs: SegId[];
}

/* ---------------- Recognisable shapes ---------------- */

export const SHAPES: NamedShape[] = [
  { id: "line",        name: "a line",              segs: ["d1"] },
  { id: "twoVert",     name: "two standing lines",  segs: ["l", "r"] },
  { id: "twoHoriz",    name: "two sleeping lines",  segs: ["t", "b"] },
  { id: "corner",      name: "a corner",            segs: ["l", "b"] },
  { id: "cross",       name: "a cross",             segs: ["mv", "mh"] },
  { id: "x",           name: "an X",                segs: ["d1", "d2"] },
  { id: "square",      name: "a square",            segs: ["t", "r", "b", "l"] },
  { id: "smallSquare", name: "a small square",      segs: ["st", "sr", "sb", "sl"] },
  { id: "circle",      name: "a circle",            segs: ["circ"] },
  { id: "smallCircle", name: "a small circle",      segs: ["scirc"] },
  { id: "arcLeft",     name: "a left arc",          segs: ["arcL"] },
  { id: "arcRight",    name: "a right arc",         segs: ["arcR"] },
  { id: "chevUp",      name: "a roof",              segs: ["dul", "dur"] },
  { id: "chevDown",    name: "a valley",            segs: ["ddl", "ddr"] },
  { id: "diamond",     name: "a diamond",           segs: ["dul", "dur", "ddl", "ddr"] },
  { id: "circleDot",   name: "a circle in a circle", segs: ["circ", "scirc"] },
  { id: "squareInSq",  name: "a square in a square", segs: ["t", "r", "b", "l", "st", "sr", "sb", "sl"] },
  { id: "window",      name: "a window",            segs: ["t", "r", "b", "l", "mv", "mh"] },
  { id: "circleX",     name: "a circle with an X",  segs: ["circ", "d1", "d2"] },
  { id: "squareX",     name: "a square with an X",  segs: ["t", "r", "b", "l", "d1", "d2"] },
  { id: "circleCross", name: "a circle with a cross", segs: ["circ", "mv", "mh"] },
  { id: "squareCircle",name: "a circle in a square", segs: ["t", "r", "b", "l", "scirc"] },
  { id: "diamondSq",   name: "a diamond in a square", segs: ["t", "r", "b", "l", "dul", "dur", "ddl", "ddr"] },
  { id: "hourglass",   name: "an hourglass",        segs: ["t", "b", "d1", "d2"] },
  { id: "flag",        name: "a flag",              segs: ["l", "t", "mh", "mv"] },
  { id: "tee",         name: "a letter T",          segs: ["t", "mv"] },
  { id: "uShape",      name: "a cup",               segs: ["l", "b", "r"] },
  { id: "nShape",      name: "a bridge",            segs: ["l", "t", "r"] },
  { id: "hShape",      name: "a letter H",          segs: ["l", "r", "mh"] },
  { id: "iBeam",       name: "a letter I",          segs: ["t", "b", "mv"] },
  { id: "star",        name: "a star",              segs: ["mv", "mh", "d1", "d2"] },
  { id: "squareStar",  name: "a star in a square",  segs: ["t", "r", "b", "l", "mv", "mh", "d1", "d2"] },
  { id: "arrowUp",     name: "an arrow",            segs: ["mv", "dul", "dur"] },
  { id: "circleStar",  name: "a star in a circle",  segs: ["circ", "mv", "mh", "d1", "d2"] }
];

export const shapeById = (id: string) => SHAPES.find(s => s.id === id)!;

/** Render a shape's segments as SVG path data strings. */
export function shapePaths(shape: NamedShape): string[] {
  return shape.segs.map(s => SEG[s]);
}

/* ---------------- Set helpers ---------------- */

const setOf = (s: NamedShape) => new Set<string>(s.segs as string[]);
const sameSet = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every(x => b.has(x));
const disjoint = (a: Set<string>, b: Set<string>) => ![...a].some(x => b.has(x));
const subset = (small: Set<string>, big: Set<string>) => [...small].every(x => big.has(x));

function findShapeForSet(set: Set<string>): NamedShape | null {
  return SHAPES.find(s => sameSet(setOf(s), set)) ?? null;
}

/* ---------------- Equation discovery ----------------
 * Computed once at module load: every pair of named shapes whose union (or
 * difference) is ALSO a named shape. This is what guarantees each puzzle is
 * both solvable and made of shapes a child can recognise.
 */

export interface ShapeEquation {
  a: NamedShape;
  b: NamedShape;
  op: "+" | "−";
  answer: NamedShape;
  /** Total segments in the answer — our difficulty proxy. */
  weight: number;
}

function buildEquations(): ShapeEquation[] {
  const out: ShapeEquation[] = [];
  for (const a of SHAPES) {
    for (const b of SHAPES) {
      if (a.id === b.id) continue;
      const A = setOf(a), B = setOf(b);

      // Addition: the parts must not overlap, and must combine into a shape.
      if (disjoint(A, B)) {
        const union = new Set([...A, ...B]);
        const ans = findShapeForSet(union);
        // Skip a + b = a (nothing happened) and keep each pair once.
        if (ans && ans.id !== a.id && ans.id !== b.id && a.id < b.id) {
          out.push({ a, b, op: "+", answer: ans, weight: ans.segs.length });
        }
      }

      // Subtraction: b must be fully inside a.
      if (subset(B, A) && B.size < A.size) {
        const diff = new Set([...A].filter(x => !B.has(x)));
        const ans = findShapeForSet(diff);
        if (ans) out.push({ a, b, op: "−", answer: ans, weight: a.segs.length });
      }
    }
  }
  return out;
}

export const EQUATIONS: ShapeEquation[] = buildEquations();

/* ---------------- Puzzle generation ---------------- */

export type Difficulty = "easy" | "medium" | "hard";

const rnd = (n: number) => Math.floor(Math.random() * n);

/* Split the discovered equations into three even difficulty bands by weight,
   so "easy" always has plenty of puzzles no matter how the vocabulary grows. */
const BY_WEIGHT = [...EQUATIONS].sort((x, y) => x.weight - y.weight);
const third = Math.ceil(BY_WEIGHT.length / 3);
export const BANDS: Record<Difficulty, ShapeEquation[]> = {
  easy: BY_WEIGHT.slice(0, third),
  medium: BY_WEIGHT.slice(third, third * 2),
  hard: BY_WEIGHT.slice(third * 2)
};

/** Pick an equation suited to the difficulty band. */
export function pickEquation(diff: Difficulty): ShapeEquation {
  const pool = BANDS[diff].length ? BANDS[diff] : EQUATIONS;
  return pool[rnd(pool.length)];
}

/**
 * Wrong answers that are *plausible*: prefer shapes close in segment count to
 * the real answer, so the child has to look properly rather than count strokes.
 */
export function distractors(answer: NamedShape, count: number): NamedShape[] {
  const others = SHAPES.filter(s => s.id !== answer.id);
  others.sort((x, y) =>
    Math.abs(x.segs.length - answer.segs.length) - Math.abs(y.segs.length - answer.segs.length)
    || Math.random() - 0.5
  );
  return others.slice(0, Math.max(count, 0));
}
