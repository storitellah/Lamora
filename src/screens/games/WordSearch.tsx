/**
 * Word Search — drag (or click-then-click) across the grid to circle
 * hidden words. Selection works along straight lines only (rows, columns,
 * diagonals), exactly like a paper word search.
 */
import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Shell, Btn, Confetti, toast } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";
import { SEARCH_THEMES } from "../../data/content";

interface Placed { word: string; cells: number[] }

function buildGrid(words: string[], size: number): { grid: string[]; placed: Placed[] } {
  const grid: string[] = Array(size * size).fill("");
  const placed: Placed[] = [];
  // Right, down, and down-right — young players read these directions naturally.
  const dirs = [[1, 0], [0, 1], [1, 1]];
  for (const word of words) {
    let ok = false;
    for (let attempt = 0; attempt < 200 && !ok; attempt++) {
      const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
      const maxX = size - (dx ? word.length : 1);
      const maxY = size - (dy ? word.length : 1);
      const x0 = Math.floor(Math.random() * (maxX + 1));
      const y0 = Math.floor(Math.random() * (maxY + 1));
      const cells: number[] = [];
      let fits = true;
      for (let k = 0; k < word.length; k++) {
        const i = (y0 + dy * k) * size + (x0 + dx * k);
        if (grid[i] !== "" && grid[i] !== word[k]) { fits = false; break; }
        cells.push(i);
      }
      if (fits) {
        cells.forEach((i, k) => { grid[i] = word[k]; });
        placed.push({ word, cells });
        ok = true;
      }
    }
  }
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < grid.length; i++)
    if (grid[i] === "") grid[i] = ABC[Math.floor(Math.random() * 26)];
  return { grid, placed };
}

export default function WordSearch({ onBack, onWin }: { onBack: () => void; onWin: () => void }) {
  const { level } = useStore();
  const size = level === 1 ? 7 : 9;
  const [themeIdx] = useState(() => Math.floor(Math.random() * SEARCH_THEMES.length));
  const theme = SEARCH_THEMES[themeIdx];
  const words = useMemo(
    () => theme.words.slice(0, level === 1 ? 4 : theme.words.length),
    [theme, level]
  );
  const { grid, placed } = useMemo(() => buildGrid(words, size), [words, size]);

  const [found, setFound] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<number>>(new Set());
  const [anchor, setAnchor] = useState<number | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const dragging = useRef(false);

  /** Cells on the straight line from a to b, or null if not straight. */
  function line(a: number, b: number): number[] | null {
    const ax = a % size, ay = Math.floor(a / size);
    const bx = b % size, by = Math.floor(b / size);
    const dx = Math.sign(bx - ax), dy = Math.sign(by - ay);
    const len = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    if (!(dx === 0 || dy === 0 || Math.abs(bx - ax) === Math.abs(by - ay))) return null;
    const cells: number[] = [];
    for (let k = 0; k <= len; k++) cells.push((ay + dy * k) * size + (ax + dx * k));
    return cells;
  }

  function commit(cells: number[]) {
    const text = cells.map(i => grid[i]).join("");
    const rev = [...text].reverse().join("");
    const hit = placed.find(p => !found.has(p.word) && (p.word === text || p.word === rev));
    if (hit) {
      sfx.chime(); haptic(20);
      const nf = new Set(found); nf.add(hit.word);
      const nc = new Set(foundCells); cells.forEach(c => nc.add(c));
      setFound(nf); setFoundCells(nc);
      speak(`You found ${hit.word}!`);
      if (nf.size === words.length) setTimeout(onWin, 900);
    } else if (cells.length > 1) {
      sfx.flip();
    }
    setAnchor(null); setPath([]);
  }

  function cellFromPoint(clientX: number, clientY: number): number | null {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const d = el?.dataset?.cell;
    return d !== undefined ? parseInt(d, 10) : null;
  }

  return (
    <Shell title={`Word Search ${theme.emoji}`} subtitle={`Find: ${words.join(" · ")}`} onBack={onBack}>
      {found.size === words.length && <Confetti />}
      <div
        role="grid"
        aria-label="Word search grid. Drag across letters to select a word."
        className="no-select glass mx-auto grid w-fit gap-1 rounded-[1.75rem] p-3"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, touchAction: "none" }}
        onPointerDown={e => {
          const c = cellFromPoint(e.clientX, e.clientY);
          if (c === null) return;
          dragging.current = true;
          setAnchor(c); setPath([c]);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          if (!dragging.current || anchor === null) return;
          const c = cellFromPoint(e.clientX, e.clientY);
          if (c === null) return;
          const l = line(anchor, c);
          if (l) setPath(l);
        }}
        onPointerUp={() => { dragging.current = false; if (path.length) commit(path); }}
        onPointerCancel={() => { dragging.current = false; setAnchor(null); setPath([]); }}
      >
        {grid.map((ch, i) => {
          const inPath = path.includes(i);
          const done = foundCells.has(i);
          return (
            <button
              key={i}
              data-cell={i}
              role="gridcell"
              aria-label={ch}
              // Click-click fallback for mouse/keyboard users
              onClick={() => {
                if (anchor === null) { setAnchor(i); setPath([i]); }
                else { const l = line(anchor, i); commit(l ?? [i]); }
              }}
              className={`grid h-9 w-9 place-items-center rounded-xl text-base font-bold transition-colors sm:h-11 sm:w-11
                ${done ? "bg-mint text-white" : inPath ? "bg-tint text-white" : "bg-white/70"}`}
            >
              {ch}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {words.map(w => (
          <motion.span
            key={w}
            animate={found.has(w) ? { scale: [1, 1.15, 1] } : {}}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              found.has(w) ? "bg-mint text-white line-through" : "glass"
            }`}
          >
            {w}
          </motion.span>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Btn kind="ghost" onClick={() => {
          const missing = placed.find(p => !found.has(p.word));
          if (missing) toast(`💡 Look for “${missing.word}” — it starts at row ${Math.floor(missing.cells[0] / size) + 1}`);
        }}>💡 Hint</Btn>
      </div>
    </Shell>
  );
}
