/**
 * Kid-friendly chess engine (pure logic, no UI).
 *
 * Simplified "chess club junior" rules: full piece movement, check,
 * checkmate and stalemate; pawns always promote to queens. Castling and
 * en passant are intentionally omitted to keep early lessons simple.
 *
 * Board: array of 64 (index 0 = a8 … 63 = h1), null or {t, w}.
 */

export type PieceType = "P" | "N" | "B" | "R" | "Q" | "K";
export interface Piece { t: PieceType; w: boolean }
export type Board = (Piece | null)[];

export const GLYPHS: Record<string, string> = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟"
};
export const NAMES: Record<PieceType, string> = {
  P: "pawn", N: "knight", B: "bishop", R: "rook", Q: "queen", K: "king"
};
const VALUE: Record<PieceType, number> = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };

export const glyph = (p: Piece | null) => (p ? GLYPHS[(p.w ? "w" : "b") + p.t] : "");
export const sqName = (i: number) => "abcdefgh"[i % 8] + (8 - Math.floor(i / 8));

export function emptyBoard(): Board { return Array(64).fill(null); }

export function startBoard(): Board {
  const b = emptyBoard();
  const back: PieceType[] = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  back.forEach((t, i) => { b[i] = { t, w: false }; b[56 + i] = { t, w: true }; });
  for (let i = 0; i < 8; i++) { b[8 + i] = { t: "P", w: false }; b[48 + i] = { t: "P", w: true }; }
  return b;
}

const on = (x: number, y: number) => x >= 0 && x < 8 && y >= 0 && y < 8;

/** Pseudo-legal targets for the piece at index i (no self-check filter). */
function rawMoves(b: Board, i: number): number[] {
  const p = b[i];
  if (!p) return [];
  const x = i % 8, y = Math.floor(i / 8);
  const out: number[] = [];
  const push = (nx: number, ny: number): boolean => {
    if (!on(nx, ny)) return false;
    const t = b[ny * 8 + nx];
    if (!t) { out.push(ny * 8 + nx); return true; }
    if (t.w !== p.w) out.push(ny * 8 + nx);
    return false;
  };
  const slide = (dirs: number[][]) =>
    dirs.forEach(([dx, dy]) => {
      let nx = x + dx, ny = y + dy;
      while (push(nx, ny)) { nx += dx; ny += dy; }
    });

  if (p.t === "P") {
    const dir = p.w ? -1 : 1;
    const fwd = (y + dir) * 8 + x;
    if (on(x, y + dir) && !b[fwd]) {
      out.push(fwd);
      const startRow = p.w ? 6 : 1;
      const fwd2 = (y + dir * 2) * 8 + x;
      if (y === startRow && !b[fwd2]) out.push(fwd2);
    }
    for (const dx of [-1, 1]) {
      const nx = x + dx, ny = y + dir;
      if (on(nx, ny)) {
        const t = b[ny * 8 + nx];
        if (t && t.w !== p.w) out.push(ny * 8 + nx);
      }
    }
  } else if (p.t === "N") {
    for (const [dx, dy] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]])
      push(x + dx, y + dy);
  } else if (p.t === "B") slide([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  else if (p.t === "R") slide([[1, 0], [-1, 0], [0, 1], [0, -1]]);
  else if (p.t === "Q") slide([[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
  else if (p.t === "K") {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]])
      push(x + dx, y + dy);
  }
  return out;
}

function kingIndex(b: Board, white: boolean): number {
  return b.findIndex(p => p !== null && p.t === "K" && p.w === white);
}

function attacked(b: Board, i: number, byWhite: boolean): boolean {
  for (let j = 0; j < 64; j++) {
    const p = b[j];
    if (p && p.w === byWhite && rawMoves(b, j).includes(i)) return true;
  }
  return false;
}

export function inCheck(b: Board, white: boolean): boolean {
  const k = kingIndex(b, white);
  return k >= 0 && attacked(b, k, !white);
}

export function applyMove(b: Board, from: number, to: number): Board {
  const nb = b.map(p => (p ? { ...p } : null));
  nb[to] = nb[from];
  nb[from] = null;
  const moved = nb[to];
  // Junior rule: pawns reaching the last rank always become queens.
  if (moved && moved.t === "P" && (Math.floor(to / 8) === 0 || Math.floor(to / 8) === 7)) moved.t = "Q";
  return nb;
}

export function legalMoves(b: Board, i: number): number[] {
  const p = b[i];
  if (!p) return [];
  return rawMoves(b, i).filter(to => !inCheck(applyMove(b, i, to), p.w));
}

export function allMoves(b: Board, white: boolean): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < 64; i++) {
    const p = b[i];
    if (p && p.w === white) for (const to of legalMoves(b, i)) out.push([i, to]);
  }
  return out;
}

/**
 * Friendly AI. strength 0 = beginner (mostly gentle/random with capture
 * preference), 1 = still-kid-level 1-ply evaluation, also used for hints.
 */
export function aiMove(b: Board, white: boolean, strength: 0 | 1): [number, number] | null {
  const moves = allMoves(b, white);
  if (!moves.length) return null;
  if (strength === 0 && Math.random() < 0.6) return moves[Math.floor(Math.random() * moves.length)];
  let best: [number, number][] = [];
  let bestScore = -Infinity;
  for (const [from, to] of moves) {
    let score = Math.random() * 0.5;
    const victim = b[to];
    if (victim) score += VALUE[victim.t] * 2;
    const nb = applyMove(b, from, to);
    if (inCheck(nb, !white)) score += allMoves(nb, !white).length === 0 ? 1000 : 1.5;
    const mover = b[from];
    if (mover && attacked(nb, to, !white)) score -= VALUE[mover.t];
    if (score > bestScore + 0.001) { bestScore = score; best = [[from, to]]; }
    else if (Math.abs(score - bestScore) <= 0.001) best.push([from, to]);
  }
  return best[Math.floor(Math.random() * best.length)];
}

/* ---- Mate-in-one puzzles (verified) ---- */
export interface ChessPuzzle {
  name: string;
  pieces: [string, number][]; // ["wQ", index]
  solution: [number, number];
}

export const PUZZLES: ChessPuzzle[] = [
  { name: "Back-rank surprise", pieces: [["bK", 6], ["bP", 13], ["bP", 14], ["bP", 15], ["wR", 40], ["wK", 62]], solution: [40, 0] },
  { name: "Queen's kiss", pieces: [["bK", 4], ["wQ", 39], ["wK", 19]], solution: [39, 12] },
  { name: "Rook ladder", pieces: [["bK", 3], ["wR", 15], ["wR", 8], ["wK", 60]], solution: [15, 7] },
  { name: "Knight's trick", pieces: [["bK", 0], ["bR", 1], ["bP", 8], ["bP", 9], ["wN", 25], ["wK", 60]], solution: [25, 10] }
];

export function puzzleBoard(pz: ChessPuzzle): Board {
  const b = emptyBoard();
  for (const [code, i] of pz.pieces) b[i] = { t: code[1] as PieceType, w: code[0] === "w" };
  return b;
}
