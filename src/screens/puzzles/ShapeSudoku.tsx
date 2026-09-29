/**
 * Shape Sudoku — a gentle 4×4 sudoku using pictures instead of digits.
 *
 * Each row, each column and each 2×2 box must contain all four shapes exactly
 * once. We generate a complete valid grid, then remove cells; the number
 * removed sets the difficulty. Because we start from a solved grid, every
 * puzzle is guaranteed solvable, and we can always show the answer.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Lightbulb } from "lucide-react";
import { Shell, Btn, Confetti, toast } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";

type Difficulty = "easy" | "medium" | "hard";
const SYMBOLS = ["🍎", "⭐", "🌙", "🐟"];
const N = 4;

const rnd = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T,>(a: T[]): T[] => a.slice().sort(() => Math.random() - 0.5);

/** Is `v` allowed at (r,c) given the current grid? */
function ok(g: number[], r: number, c: number, v: number): boolean {
  for (let i = 0; i < N; i++) {
    if (g[r * N + i] === v) return false;           // row
    if (g[i * N + c] === v) return false;           // column
  }
  const br = Math.floor(r / 2) * 2, bc = Math.floor(c / 2) * 2;
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++)
      if (g[(br + i) * N + (bc + j)] === v) return false; // 2x2 box
  return true;
}

/** Fill a complete valid grid by randomised backtracking. */
function solvedGrid(): number[] {
  const g = Array(N * N).fill(-1);
  (function fill(pos: number): boolean {
    if (pos === N * N) return true;
    const r = Math.floor(pos / N), c = pos % N;
    for (const v of shuffle([0, 1, 2, 3])) {
      if (ok(g, r, c, v)) {
        g[pos] = v;
        if (fill(pos + 1)) return true;
        g[pos] = -1;
      }
    }
    return false;
  })(0);
  return g;
}

export default function ShapeSudoku({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const [diff, setDiff] = useState<Difficulty>(level === 1 ? "easy" : level === 2 ? "medium" : "hard");
  const [round, setRound] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [note, setNote] = useState("Every row, column and box needs all four pictures.");

  const { solution, given } = useMemo(() => {
    const solution = solvedGrid();
    const holes = diff === "easy" ? 4 : diff === "medium" ? 7 : 9;
    const given = solution.slice();
    for (const i of shuffle([...Array(N * N).keys()]).slice(0, holes)) given[i] = -1;
    return { solution, given };
  }, [diff, round]);

  const [cells, setCells] = useState<number[]>(given);
  React.useEffect(() => { setCells(given); }, [given]);

  const [sel, setSel] = useState<number | null>(null);
  const complete = cells.every((v, i) => v === solution[i]);

  function place(v: number) {
    if (sel === null) { toast("Tap an empty square first 👆"); return; }
    if (given[sel] !== -1) return;
    if (v === solution[sel]) {
      sfx.correct(); haptic(10);
      const next = cells.slice(); next[sel] = v;
      setCells(next);
      setSel(null);
      if (next.every((x, i) => x === solution[i])) {
        sfx.win();
        dispatch({ type: "award", stars: 3, activity: `puzzle-sudoku-${diff}` });
        setCelebrate(true);
        speak("Sudoku solved! Brilliant thinking.");
        setTimeout(() => { setCelebrate(false); setRound(r => r + 1); }, 2100);
      }
    } else {
      sfx.wrong();
      const r = Math.floor(sel / N) + 1, c = (sel % N) + 1;
      setNote(`💡 Look along row ${r} and column ${c} — that picture is already there.`);
      speak("That one is already in this row or column.");
    }
  }

  function hint() {
    const empty = cells.map((v, i) => [v, i] as const).filter(([v, i]) => v === -1 && given[i] === -1);
    if (!empty.length) return;
    const [, i] = empty[rnd(empty.length)];
    const next = cells.slice(); next[i] = solution[i];
    setCells(next);
    sfx.chime();
    setNote(`💡 Filled one in for you — ${SYMBOLS[solution[i]]}`);
    if (next.every((x, k) => x === solution[k])) {
      dispatch({ type: "award", stars: 1, activity: `puzzle-sudoku-${diff}` });
      setCelebrate(true);
      setTimeout(() => { setCelebrate(false); setRound(r => r + 1); }, 2000);
    }
  }

  return (
    <Shell title="Shape Sudoku 🍎" subtitle="Fill every row, column and 2×2 box with all four pictures" onBack={onBack}>
      {celebrate && <Confetti />}

      <div className="mb-4 flex justify-center gap-2">
        {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
          <Btn key={d} kind={diff === d ? "primary" : "soft"} className="!min-h-10 !px-5 !py-2 text-sm"
            onClick={() => { setDiff(d); setSel(null); setRound(r => r + 1); }}>
            {d === "easy" ? "🟢 Easy" : d === "medium" ? "🟡 Medium" : "🔴 Hard"}
          </Btn>
        ))}
      </div>

      {/* The grid: thicker borders mark the 2×2 boxes */}
      <div className="glass mx-auto w-fit rounded-[1.75rem] p-4">
        <div className="grid grid-cols-4 gap-1" role="grid" aria-label="Shape sudoku grid">
          {cells.map((v, i) => {
            const r = Math.floor(i / N), c = i % N;
            const fixed = given[i] !== -1;
            return (
              <button
                key={i}
                role="gridcell"
                aria-label={`Row ${r + 1} column ${c + 1}: ${v === -1 ? "empty" : SYMBOLS[v]}${fixed ? ", given" : ""}`}
                onClick={() => { if (!fixed) { setSel(i); sfx.tap(); } }}
                className={`grid h-16 w-16 place-items-center rounded-xl text-3xl transition-colors sm:h-20 sm:w-20
                  ${fixed ? "bg-ink/10" : v !== -1 ? "bg-mint/25" : "bg-white/70"}
                  ${sel === i ? "ring-4 ring-tint" : ""}`}
                style={{
                  marginRight: c === 1 ? 6 : 0,
                  marginBottom: r === 1 ? 6 : 0
                }}
              >
                {v === -1 ? "" : SYMBOLS[v]}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 min-h-6 text-center text-sm text-ink-2" role="status">{note}</p>

      {/* Symbol palette */}
      <div className="mt-4 flex justify-center gap-3">
        {SYMBOLS.map((s, v) => (
          <motion.button key={s} whileTap={{ scale: 0.9 }} onClick={() => place(v)}
            aria-label={`Place ${s}`}
            className="glass grid h-16 w-16 place-items-center rounded-2xl text-3xl">
            {s}
          </motion.button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Btn kind="soft" onClick={hint}><Lightbulb size={18} aria-hidden /> Hint</Btn>
        <Btn kind="ghost" onClick={() => { setSel(null); setRound(r => r + 1); }}>
          <RotateCcw size={18} aria-hidden /> New puzzle
        </Btn>
      </div>
    </Shell>
  );
}
