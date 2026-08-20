/**
 * Puzzles — a sliding-tile picture puzzle for early learners and a
 * "logic tiles" pattern-completion challenge for older children.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Shell, Btn, Confetti, toast } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";

/* ---------------- Sliding tile puzzle ---------------- */

/** Emoji "pictures": each 3×3 board spells a simple scene tile-by-tile. */
const SCENES = [
  ["🌅", "🌤️", "🐦", "🌊", "⛵", "🌊", "🐠", "🐙", "🦀"],
  ["🌳", "🌈", "🌳", "🦊", "🍄", "🐰", "🌼", "🌿", "🌼"],
  ["⭐", "🌙", "⭐", "🛸", "🚀", "🪐", "🌍", "☄️", "🌟"]
];

function shuffledOrder(): number[] {
  // Start solved (8 = blank), then do many random legal moves — this
  // guarantees the puzzle is always solvable.
  const order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  let blank = 8;
  for (let k = 0; k < 120; k++) {
    const x = blank % 3, y = Math.floor(blank / 3);
    const opts = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
      .filter(([nx, ny]) => nx >= 0 && nx < 3 && ny >= 0 && ny < 3)
      .map(([nx, ny]) => ny * 3 + nx);
    const pick = opts[Math.floor(Math.random() * opts.length)];
    [order[blank], order[pick]] = [order[pick], order[blank]];
    blank = pick;
  }
  return order;
}

export function SlidingPuzzle({ onBack, onWin }: { onBack: () => void; onWin: () => void }) {
  const [scene] = useState(() => SCENES[Math.floor(Math.random() * SCENES.length)]);
  const [order, setOrder] = useState<number[]>(shuffledOrder);
  const [moves, setMoves] = useState(0);
  const solved = order.every((v, i) => v === i);

  function tap(pos: number) {
    if (solved) return;
    const blank = order.indexOf(8);
    const bx = blank % 3, by = Math.floor(blank / 3);
    const px = pos % 3, py = Math.floor(pos / 3);
    // A tile slides only if it's orthogonally next to the blank.
    if (Math.abs(bx - px) + Math.abs(by - py) !== 1) { sfx.flip(); return; }
    const next = order.slice();
    [next[blank], next[pos]] = [next[pos], next[blank]];
    setOrder(next);
    setMoves(m => m + 1);
    sfx.pop(); haptic();
    if (next.every((v, i) => v === i)) {
      sfx.win();
      speak("You solved the puzzle! Brilliant!");
      setTimeout(onWin, 1200);
    }
  }

  return (
    <Shell title="Picture Puzzle 🧩" subtitle="Slide the tiles next to the empty space to fix the picture!" onBack={onBack}>
      {solved && <Confetti />}
      <div className="glass mx-auto grid w-fit grid-cols-3 gap-2 rounded-[1.75rem] p-4">
        {order.map((tileId, pos) =>
          tileId === 8 && !solved ? (
            <div key="blank" aria-label="Empty space" className="h-20 w-20 rounded-2xl bg-ink/5 sm:h-24 sm:w-24" />
          ) : (
            <motion.button
              key={tileId}
              layout
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              onClick={() => tap(pos)}
              aria-label={`Tile ${tileId + 1}`}
              className="grid h-20 w-20 place-items-center rounded-2xl bg-white text-4xl shadow-sm sm:h-24 sm:w-24"
            >
              {scene[tileId]}
            </motion.button>
          )
        )}
      </div>
      <p className="mt-3 text-center text-ink-2">Moves: {moves}</p>
      {/* Goal picture keeps the target visible — less frustration for age 5 */}
      <div className="mx-auto mt-3 grid w-fit grid-cols-3 gap-0.5 opacity-70" aria-label="Goal picture">
        {scene.map((e, i) => <span key={i} className="text-lg">{e}</span>)}
      </div>
    </Shell>
  );
}

/* ---------------- Logic tiles ---------------- */

interface LogicQ { seq: string[]; answer: string; opts: string[]; rule: string }

function makeLogicQ(hard: boolean): LogicQ {
  const banks = [
    ["🔴", "🔵", "🟡", "🟢"],
    ["🐟", "🐙", "🦀", "🐬"],
    ["⭐", "🌙", "☀️", "☁️"],
    ["🍎", "🍌", "🍇", "🍓"]
  ];
  const items = banks[Math.floor(Math.random() * banks.length)];
  const patLen = hard ? 3 : 2;
  const pattern = items.slice(0, patLen);
  const reps = hard ? 2 : 3;
  const seq: string[] = [];
  for (let i = 0; i < patLen * reps + (hard ? 2 : 1); i++) seq.push(pattern[i % patLen]);
  const answer = pattern[seq.length % patLen];
  return {
    seq,
    answer,
    opts: [...new Set([answer, ...items])].slice(0, hard ? 4 : 3),
    rule: `The pattern repeats every ${patLen}: ${pattern.join(" ")}`
  };
}

export function LogicTiles({ onBack, onWin }: { onBack: () => void; onWin: () => void }) {
  const { level } = useStore();
  const hard = level >= 2;
  const total = 5;
  const [round, setRound] = useState(0);
  const [q, setQ] = useState<LogicQ>(() => makeLogicQ(hard));
  const [note, setNote] = useState("What comes next?");

  function pick(o: string) {
    if (o === q.answer) {
      sfx.correct(); haptic(15);
      if (round + 1 >= total) { sfx.win(); setTimeout(onWin, 700); return; }
      setRound(r => r + 1);
      setQ(makeLogicQ(hard));
      setNote("What comes next?");
    } else {
      sfx.wrong();
      setNote("💡 " + q.rule);
      speak(q.rule);
    }
  }

  return (
    <Shell title="Logic Tiles 🎛️" subtitle={`Round ${round + 1} of ${total}`} onBack={onBack}>
      <div className="glass rounded-[1.75rem] p-6 text-center">
        <div className="text-4xl tracking-wider">{q.seq.join(" ")} <span className="opacity-40">❓</span></div>
        <p className="mt-3 min-h-6 text-ink-2" role="status">{note}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {q.opts.map(o => (
          <motion.button
            key={o}
            whileTap={{ scale: 0.92 }}
            onClick={() => pick(o)}
            className="glass min-h-20 rounded-3xl text-4xl"
            aria-label={`Choose ${o}`}
          >
            {o}
          </motion.button>
        ))}
      </div>
    </Shell>
  );
}

/* ---------------- Memory pairs ---------------- */

const FACES = ["🐬", "🦄", "🐉", "🦖", "🌈", "🚀", "🐼", "🦊", "🐸", "🦋", "🌻", "🍓"];

export function MemoryPairs({ onBack, onWin }: { onBack: () => void; onWin: () => void }) {
  const { level } = useStore();
  const nPairs = level === 1 ? 4 : level === 2 ? 6 : 8;
  const deck = useMemo(() => {
    const faces = [...FACES].sort(() => Math.random() - 0.5).slice(0, nPairs);
    return [...faces, ...faces].sort(() => Math.random() - 0.5);
  }, [nPairs]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);

  function tap(i: number) {
    if (flipped.length === 2 || flipped.includes(i) || matched.has(i)) return;
    sfx.flip();
    const nf = [...flipped, i];
    setFlipped(nf);
    if (nf.length === 2) {
      setMoves(m => m + 1);
      if (deck[nf[0]] === deck[nf[1]]) {
        sfx.correct(); haptic(15);
        const nm = new Set(matched); nm.add(nf[0]); nm.add(nf[1]);
        setTimeout(() => { setMatched(nm); setFlipped([]); }, 350);
        if (nm.size === deck.length) { sfx.win(); setTimeout(onWin, 1000); }
      } else {
        setTimeout(() => setFlipped([]), 850);
      }
    }
  }

  return (
    <Shell title="Matching Pairs 🃏" subtitle={`Find all ${nPairs} pairs! Moves: ${moves}`} onBack={onBack}>
      {matched.size === deck.length && <Confetti />}
      <div className="mx-auto grid w-fit grid-cols-4 gap-2.5">
        {deck.map((face, i) => {
          const up = flipped.includes(i) || matched.has(i);
          return (
            <motion.button
              key={i}
              onClick={() => tap(i)}
              whileTap={{ scale: 0.92 }}
              aria-label={up ? face : "Face-down card"}
              className="h-18 w-18 [perspective:600px] sm:h-20 sm:w-20"
            >
              <motion.div
                animate={{ rotateY: up ? 180 : 0 }}
                transition={{ duration: 0.35 }}
                className="relative h-full w-full [transform-style:preserve-3d]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-tint to-sky shadow-sm [backface-visibility:hidden]" />
                <div className={`absolute inset-0 grid place-items-center rounded-2xl text-3xl shadow-sm
                  [backface-visibility:hidden] [transform:rotateY(180deg)]
                  ${matched.has(i) ? "bg-mint" : "bg-white"}`}>
                  {face}
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </Shell>
  );
}
