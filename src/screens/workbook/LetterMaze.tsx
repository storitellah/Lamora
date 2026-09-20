/**
 * Letter Maze — find your way through the maze to the picture that starts
 * with the given letter. Three objects sit at dead-ends; only one begins with
 * the target sound, so the child must both navigate *and* listen.
 *
 * The maze is generated with randomised depth-first search, which always
 * produces a "perfect" maze — exactly one path between any two cells, so it is
 * never unsolvable and never frustrating.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, ChevronRight, Volume2 } from "lucide-react";
import { Shell, Btn, Confetti, toast } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";
import { PIC_WORDS, PicWord, wordsStartingWith } from "../../data/workbook";

interface Cell { walls: [boolean, boolean, boolean, boolean]; seen: boolean } // N,E,S,W

function generate(size: number): Cell[] {
  const cells: Cell[] = Array.from({ length: size * size }, () => ({
    walls: [true, true, true, true], seen: false
  }));
  const at = (x: number, y: number) => cells[y * size + x];
  const stack: [number, number][] = [[0, 0]];
  at(0, 0).seen = true;
  // [dx, dy, wallFromCurrent, wallFromNeighbour]
  const DIRS: [number, number, number, number][] = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]];

  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const options = DIRS.filter(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      return nx >= 0 && ny >= 0 && nx < size && ny < size && !at(nx, ny).seen;
    });
    if (!options.length) { stack.pop(); continue; }
    const [dx, dy, w, opp] = options[Math.floor(Math.random() * options.length)];
    const nx = x + dx, ny = y + dy;
    at(x, y).walls[w] = false;
    at(nx, ny).walls[opp] = false;
    at(nx, ny).seen = true;
    stack.push([nx, ny]);
  }
  return cells;
}

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

export default function LetterMaze({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const size = level === 1 ? 6 : level === 2 ? 8 : 9;
  const [round, setRound] = useState(0);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [celebrate, setCelebrate] = useState(false);

  const { cells, target, goals } = useMemo(() => {
    const cells = generate(size);
    // Choose a target letter that actually has picture words.
    const letters = "ABCDFGHKLMNPRSTVWZ".split("").filter(l => wordsStartingWith(l).length > 0);
    const letter = pick(letters);
    const correct = pick(wordsStartingWith(letter));
    const decoys: PicWord[] = [];
    while (decoys.length < 2) {
      const w = pick(PIC_WORDS);
      if (w.word[0].toUpperCase() !== letter && !decoys.includes(w)) decoys.push(w);
    }
    // Spread the three goals into far corners so the maze must be travelled.
    const spots: [number, number][] = ([
      [size - 1, size - 1], [size - 1, 0], [0, size - 1]
    ] as [number, number][]).sort(() => Math.random() - 0.5);
    const goals = [correct, ...decoys].map((w, i) => ({
      word: w, at: spots[i], correct: w === correct
    }));
    return { cells, target: letter, goals };
  }, [size, round]);

  const at = (x: number, y: number) => cells[y * size + x];

  function move(dx: number, dy: number) {
    const [x, y] = pos;
    const wall = dy === -1 ? 0 : dx === 1 ? 1 : dy === 1 ? 2 : 3;
    if (at(x, y).walls[wall]) { sfx.tap(); return; }          // bumped a wall
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= size || ny >= size) return;
    setPos([nx, ny]);
    sfx.pop(); haptic(6);

    const goal = goals.find(g => g.at[0] === nx && g.at[1] === ny);
    if (goal) {
      if (goal.correct) {
        sfx.win(); haptic(30);
        dispatch({ type: "award", stars: 2, activity: "wb-lettermaze" });
        setCelebrate(true);
        speak(`You found it! ${goal.word.word} starts with ${target}.`);
        setTimeout(() => { setCelebrate(false); setRound(r => r + 1); setPos([0, 0]); }, 2200);
      } else {
        sfx.wrong();
        speak(`${goal.word.word} starts with ${goal.word.word[0].toUpperCase()}. Keep looking for ${target}.`);
        toast(`That's ${goal.word.word} — try another path!`);
      }
    }
  }

  // Keyboard support for desktop/tablet-with-keyboard users.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0]
      };
      if (map[e.key]) { e.preventDefault(); move(...map[e.key]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <Shell
      title={`Find something that starts with ${target}`}
      subtitle="Move through the maze — tap a square next to you, or use the arrows"
      onBack={onBack}
      wide
    >
      {celebrate && <Confetti />}

      <div className="glass mx-auto max-w-lg rounded-[1.75rem] p-3">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          role="application" aria-label={`Maze, ${size} by ${size}. Find the picture starting with ${target}.`}>
          {cells.map((c, i) => {
            const x = i % size, y = Math.floor(i / size);
            const isPlayer = pos[0] === x && pos[1] === y;
            const goal = goals.find(g => g.at[0] === x && g.at[1] === y);
            const adjacent = Math.abs(pos[0] - x) + Math.abs(pos[1] - y) === 1;
            return (
              <button
                key={i}
                onClick={() => adjacent && move(x - pos[0], y - pos[1])}
                aria-label={
                  isPlayer ? "You are here"
                    : goal ? `Picture: ${goal.word.word}`
                    : adjacent ? "Move here" : "Maze path"
                }
                className="grid aspect-square place-items-center bg-white/70 text-[5vw] leading-none sm:text-2xl"
                style={{
                  borderTop: c.walls[0] ? "3px solid #6e6e87" : "3px solid transparent",
                  borderRight: c.walls[1] ? "3px solid #6e6e87" : "3px solid transparent",
                  borderBottom: c.walls[2] ? "3px solid #6e6e87" : "3px solid transparent",
                  borderLeft: c.walls[3] ? "3px solid #6e6e87" : "3px solid transparent"
                }}
              >
                {isPlayer
                  ? <motion.span layoutId="runner" aria-hidden>🙂</motion.span>
                  : goal ? <span aria-hidden>{goal.word.emoji}</span>
                  : adjacent ? <span aria-hidden className="h-2 w-2 rounded-full bg-tint/25" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Big arrow pad — essential on phones where maze squares are small */}
      <div className="mt-5 flex flex-col items-center gap-2">
        <Btn kind="soft" ariaLabel="Move up" onClick={() => move(0, -1)} className="!px-7">▲</Btn>
        <div className="flex gap-2">
          <Btn kind="soft" ariaLabel="Move left" onClick={() => move(-1, 0)} className="!px-7">◀</Btn>
          <Btn kind="soft" ariaLabel="Move down" onClick={() => move(0, 1)} className="!px-7">▼</Btn>
          <Btn kind="soft" ariaLabel="Move right" onClick={() => move(1, 0)} className="!px-7">▶</Btn>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Btn kind="soft" onClick={() => speak(`Find something that starts with the letter ${target}`)}>
          <Volume2 size={18} aria-hidden /> Hear it
        </Btn>
        <Btn kind="soft" onClick={() => setPos([0, 0])}><RotateCcw size={18} aria-hidden /> Back to start</Btn>
        <Btn kind="ghost" onClick={() => { setRound(r => r + 1); setPos([0, 0]); }}>
          New maze <ChevronRight size={18} aria-hidden />
        </Btn>
      </div>
    </Shell>
  );
}
