/**
 * Logic puzzles for ages 5–10:
 *   WhatComesNext  — continue a visual/number sequence
 *   OddOneOut      — find the one that doesn't belong, and say why
 *   BalanceScales  — how many small shapes balance the big one? (pre-algebra)
 *   NumberPyramid  — each brick is the sum of the two below it
 *
 * All four generate their content, so they never run out, and each has an
 * easy / medium / hard band.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, RotateCcw, ChevronRight } from "lucide-react";
import { Shell, Btn, Confetti, toast } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";

export type Difficulty = "easy" | "medium" | "hard";
const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(a: T[]): T => a[rnd(a.length)];
const shuffle = <T,>(a: T[]): T[] => a.slice().sort(() => Math.random() - 0.5);

/** Shared difficulty switcher. */
function DiffBar({ diff, set }: { diff: Difficulty; set: (d: Difficulty) => void }) {
  return (
    <div className="mb-4 flex justify-center gap-2">
      {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
        <Btn key={d} kind={diff === d ? "primary" : "soft"} className="!min-h-10 !px-5 !py-2 text-sm"
          onClick={() => set(d)}>
          {d === "easy" ? "🟢 Easy" : d === "medium" ? "🟡 Medium" : "🔴 Hard"}
        </Btn>
      ))}
    </div>
  );
}

/* ---------------- What Comes Next? ---------------- */

const ICON_BANKS = [
  ["🔴", "🔵", "🟡", "🟢"],
  ["🐶", "🐱", "🐭", "🐰"],
  ["🍎", "🍌", "🍇", "🍓"],
  ["⭐", "🌙", "☀️", "☁️"],
  ["🚗", "🚌", "🚲", "✈️"]
];

interface SeqQ { seq: string[]; answer: string; opts: string[]; rule: string }

function makeSequence(diff: Difficulty): SeqQ {
  const bank = pick(ICON_BANKS);
  if (diff === "easy") {
    // Simple AB or ABC repeat
    const len = rnd(2) === 0 ? 2 : 3;
    const pat = bank.slice(0, len);
    const seq: string[] = [];
    for (let i = 0; i < len * 2 + 1; i++) seq.push(pat[i % len]);
    const answer = pat[seq.length % len];
    return { seq, answer, opts: shuffle([...new Set([answer, ...bank])]).slice(0, 3),
             rule: `The pattern repeats every ${len}: ${pat.join(" ")}` };
  }
  if (diff === "medium") {
    // AAB / ABB style growing patterns
    const [x, y] = bank;
    const styles = [
      { pat: [x, x, y], rule: `Two ${x} then one ${y}` },
      { pat: [x, y, y], rule: `One ${x} then two ${y}` }
    ];
    const st = pick(styles);
    const seq: string[] = [];
    for (let i = 0; i < 7; i++) seq.push(st.pat[i % 3]);
    return { seq, answer: st.pat[7 % 3], opts: shuffle([...new Set([st.pat[7 % 3], x, y, bank[2]])]).slice(0, 3), rule: st.rule };
  }
  // hard: number sequences (counting in steps)
  const step = pick([2, 3, 5, 10]);
  const start = rnd(10) + 1;
  const seq = [0, 1, 2, 3].map(i => String(start + step * i));
  const answer = String(start + step * 4);
  const opts = shuffle([...new Set([answer, String(start + step * 5), String(start + step * 3), String(start + step * 4 + 1)])]).slice(0, 4);
  return { seq, answer, opts, rule: `The numbers go up by ${step} each time` };
}

export function WhatComesNext({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const [diff, setDiff] = useState<Difficulty>(level === 1 ? "easy" : level === 2 ? "medium" : "hard");
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(0);
  const [note, setNote] = useState("What comes next?");
  const q = useMemo(() => makeSequence(diff), [diff, round]);
  const [celebrate, setCelebrate] = useState(false);
  const TOTAL = 5;

  function choose(o: string) {
    if (o === q.answer) {
      sfx.correct(); haptic(12);
      const next = solved + 1;
      if (next >= TOTAL) {
        sfx.win();
        dispatch({ type: "award", stars: 2, activity: `puzzle-next-${diff}` });
        setCelebrate(true);
        speak("You cracked every pattern!");
        setTimeout(() => { setCelebrate(false); setSolved(0); setRound(r => r + 1); setNote("What comes next?"); }, 1900);
      } else { setSolved(next); setRound(r => r + 1); setNote("What comes next?"); }
    } else {
      sfx.wrong();
      setNote("💡 " + q.rule);
      speak(q.rule);
    }
  }

  return (
    <Shell title="What Comes Next? ➡️" subtitle={`Puzzle ${solved + 1} of ${TOTAL}`} onBack={onBack}>
      {celebrate && <Confetti />}
      <DiffBar diff={diff} set={d => { setDiff(d); setSolved(0); setRound(r => r + 1); }} />
      <motion.div key={round} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="glass rounded-[1.75rem] p-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 text-4xl"
          aria-label={`Sequence: ${q.seq.join(", ")}, then what?`}>
          {q.seq.map((s, i) => <span key={i}>{s}</span>)}
          <span className="grid h-14 w-14 place-items-center rounded-2xl border-4 border-dashed border-tint/40 text-3xl text-tint">?</span>
        </div>
        <p className="mt-3 min-h-6 text-ink-2" role="status">{note}</p>
      </motion.div>
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {q.opts.map(o => (
          <motion.button key={o} whileTap={{ scale: 0.92 }} onClick={() => choose(o)}
            aria-label={`Choose ${o}`} className="glass min-h-20 rounded-3xl text-4xl font-extrabold">
            {o}
          </motion.button>
        ))}
      </div>
    </Shell>
  );
}

/* ---------------- Odd One Out ---------------- */

interface OddGroup { name: string; items: string[]; odd: string; why: string }

const ODD_GROUPS: OddGroup[] = [
  { name: "animals", items: ["🐶", "🐱", "🐰", "🐴"], odd: "🚗", why: "A car is not an animal." },
  { name: "fruit", items: ["🍎", "🍌", "🍇", "🍊"], odd: "🥕", why: "A carrot is a vegetable, not a fruit." },
  { name: "things that fly", items: ["🦅", "✈️", "🦋", "🚁"], odd: "🐟", why: "A fish swims — it cannot fly." },
  { name: "things in the sea", items: ["🐙", "🐬", "🦈", "🐚"], odd: "🦒", why: "A giraffe lives on land." },
  { name: "round things", items: ["⚽", "🏀", "🌕", "🍩"], odd: "📕", why: "A book is not round." },
  { name: "hot things", items: ["🔥", "☀️", "🌋", "♨️"], odd: "❄️", why: "A snowflake is cold." },
  { name: "vehicles", items: ["🚗", "🚌", "🚲", "🚂"], odd: "🌳", why: "A tree does not move." },
  { name: "yellow things", items: ["🍋", "🌻", "🧀", "⭐"], odd: "🍆", why: "An aubergine is purple." }
];

export function OddOneOut({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const [diff, setDiff] = useState<Difficulty>(level === 1 ? "easy" : "medium");
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(0);
  const [note, setNote] = useState("Which one does not belong?");
  const [celebrate, setCelebrate] = useState(false);
  const TOTAL = 5;

  const q = useMemo(() => {
    const g = pick(ODD_GROUPS);
    // easy shows 3 same + 1 odd; harder shows more to compare
    const n = diff === "easy" ? 2 : diff === "medium" ? 3 : 4;
    const items = shuffle([...shuffle(g.items).slice(0, n), g.odd]);
    return { ...g, shown: items };
  }, [diff, round]);

  function choose(o: string) {
    if (o === q.odd) {
      sfx.correct(); haptic(12);
      speak(q.why);
      const next = solved + 1;
      if (next >= TOTAL) {
        sfx.win();
        dispatch({ type: "award", stars: 2, activity: `puzzle-odd-${diff}` });
        setCelebrate(true);
        setTimeout(() => { setCelebrate(false); setSolved(0); setRound(r => r + 1); setNote("Which one does not belong?"); }, 1900);
      } else {
        setNote("✅ " + q.why);
        setTimeout(() => { setSolved(next); setRound(r => r + 1); setNote("Which one does not belong?"); }, 1100);
      }
    } else {
      sfx.wrong();
      setNote(`💡 Look for the one that is not ${q.name}.`);
      speak(`Look for the one that is not ${q.name}.`);
    }
  }

  return (
    <Shell title="Odd One Out 🔍" subtitle={`Puzzle ${solved + 1} of ${TOTAL}`} onBack={onBack}>
      {celebrate && <Confetti />}
      <DiffBar diff={diff} set={d => { setDiff(d); setSolved(0); setRound(r => r + 1); }} />
      <div className="glass rounded-[1.75rem] p-5 text-center">
        <p className="text-lg font-bold" role="status">{note}</p>
      </div>
      <motion.div key={round} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {q.shown.map((s, i) => (
          <motion.button key={i} whileTap={{ scale: 0.92 }} onClick={() => choose(s)}
            aria-label={`Choose ${s}`} className="glass min-h-24 rounded-3xl text-5xl">
            {s}
          </motion.button>
        ))}
      </motion.div>
    </Shell>
  );
}

/* ---------------- Balance Scales ---------------- */

/**
 * Pre-algebra without the algebra: if one 🍉 balances three 🍏, how many 🍏
 * balance two 🍉? Children reason multiplicatively with pictures.
 */
export function BalanceScales({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const [diff, setDiff] = useState<Difficulty>(level === 1 ? "easy" : level === 2 ? "medium" : "hard");
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(0);
  const [note, setNote] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const TOTAL = 5;

  const q = useMemo(() => {
    const [big, small] = pick([["🍉", "🍏"], ["🐘", "🐭"], ["📦", "🧱"], ["🎃", "🍬"]]);
    const ratio = diff === "easy" ? 2 + rnd(2) : diff === "medium" ? 2 + rnd(4) : 3 + rnd(5);
    const count = diff === "easy" ? 2 : 2 + rnd(2);       // how many big ones on the left
    const answer = ratio * count;
    const opts = shuffle([...new Set([answer, answer + ratio, Math.max(1, answer - ratio), answer + 1])]).slice(0, 4);
    return { big, small, ratio, count, answer, opts };
  }, [diff, round]);

  function choose(v: number) {
    if (v === q.answer) {
      sfx.correct(); haptic(12);
      speak(`Yes! ${q.count} times ${q.ratio} is ${q.answer}.`);
      const next = solved + 1;
      if (next >= TOTAL) {
        sfx.win();
        dispatch({ type: "award", stars: 2, activity: `puzzle-balance-${diff}` });
        setCelebrate(true);
        setTimeout(() => { setCelebrate(false); setSolved(0); setRound(r => r + 1); setNote(""); }, 1900);
      } else { setSolved(next); setRound(r => r + 1); setNote(""); }
    } else {
      sfx.wrong();
      setNote(`💡 One ${q.big} needs ${q.ratio} ${q.small}. So ${q.count} of them need ${q.ratio} + ${q.ratio}${q.count > 2 ? " + …" : ""}`);
      speak(`One ${q.big === "🍉" ? "melon" : "big one"} needs ${q.ratio}. Count them up.`);
    }
  }

  return (
    <Shell title="Balance the Scales ⚖️" subtitle={`Puzzle ${solved + 1} of ${TOTAL}`} onBack={onBack}>
      {celebrate && <Confetti />}
      <DiffBar diff={diff} set={d => { setDiff(d); setSolved(0); setRound(r => r + 1); }} />

      <motion.div key={round} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[1.75rem] p-6">
        {/* The rule */}
        <div className="flex items-center justify-center gap-3 text-3xl"
          aria-label={`One ${q.big} balances ${q.ratio} ${q.small}`}>
          <span>{q.big}</span>
          <span className="text-2xl font-extrabold text-ink-2">=</span>
          <span>{Array.from({ length: q.ratio }, () => q.small).join("")}</span>
        </div>
        <div className="my-4 h-px bg-ink/10" />
        {/* The question */}
        <div className="flex items-center justify-center gap-3 text-3xl"
          aria-label={`How many ${q.small} balance ${q.count} ${q.big}?`}>
          <span>{Array.from({ length: q.count }, () => q.big).join("")}</span>
          <span className="text-2xl font-extrabold text-ink-2">=</span>
          <span className="grid h-14 w-14 place-items-center rounded-2xl border-4 border-dashed border-tint/40 text-2xl font-extrabold text-tint">?</span>
          <span>{q.small}</span>
        </div>
        <p className="mt-3 min-h-6 text-center text-sm text-ink-2" role="status">{note}</p>
      </motion.div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {q.opts.map(o => (
          <motion.button key={o} whileTap={{ scale: 0.92 }} onClick={() => choose(o)}
            aria-label={`Answer ${o}`} className="glass min-h-20 rounded-3xl text-3xl font-extrabold">
            {o}
          </motion.button>
        ))}
      </div>
    </Shell>
  );
}

/* ---------------- Number Pyramid ---------------- */

/**
 * Each brick is the sum of the two directly below it. We build the pyramid
 * bottom-up (so it's always consistent), then blank out some bricks.
 */
export function NumberPyramid({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const [diff, setDiff] = useState<Difficulty>(level === 1 ? "easy" : level === 2 ? "medium" : "hard");
  const [round, setRound] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [note, setNote] = useState("Each brick is the two below it added together.");

  const { rows, blanks } = useMemo(() => {
    const size = diff === "easy" ? 3 : diff === "medium" ? 4 : 4;
    const maxBase = diff === "easy" ? 5 : diff === "medium" ? 9 : 15;
    const base = Array.from({ length: size }, () => 1 + rnd(maxBase));
    const rows: number[][] = [base];
    while (rows[rows.length - 1].length > 1) {
      const prev = rows[rows.length - 1];
      rows.push(prev.slice(0, -1).map((v, i) => v + prev[i + 1]));
    }
    // Blank out cells above the base (never the whole base row)
    const candidates: [number, number][] = [];
    rows.forEach((r, ri) => r.forEach((_, ci) => { if (ri > 0) candidates.push([ri, ci]); }));
    const n = diff === "easy" ? 1 : diff === "medium" ? 2 : 3;
    const blanks = shuffle(candidates).slice(0, Math.min(n, candidates.length));
    return { rows, blanks };
  }, [diff, round]);

  const [filled, setFilled] = useState<Record<string, number>>({});
  React.useEffect(() => { setFilled({}); }, [round, diff]);

  const key = (r: number, c: number) => `${r}:${c}`;
  const isBlank = (r: number, c: number) => blanks.some(([br, bc]) => br === r && bc === c);
  const remaining = blanks.filter(([r, c]) => filled[key(r, c)] === undefined);
  const target = remaining[0];

  // Options for the current blank
  const opts = useMemo(() => {
    if (!target) return [];
    const [r, c] = target;
    const v = rows[r][c];
    const set = new Set([v]);
    while (set.size < 4) set.add(Math.max(1, v + rnd(9) - 4));
    return shuffle([...set]);
  }, [target, rows]);

  function choose(v: number) {
    if (!target) return;
    const [r, c] = target;
    if (v === rows[r][c]) {
      sfx.correct(); haptic(12);
      const nf = { ...filled, [key(r, c)]: v };
      setFilled(nf);
      if (blanks.every(([br, bc]) => nf[key(br, bc)] !== undefined)) {
        sfx.win();
        dispatch({ type: "award", stars: 2, activity: `puzzle-pyramid-${diff}` });
        setCelebrate(true);
        speak("Pyramid complete!");
        setTimeout(() => { setCelebrate(false); setRound(x => x + 1); }, 1800);
      }
    } else {
      sfx.wrong();
      const [r2, c2] = target;
      setNote(`💡 Add the two bricks under it: ${rows[r2 - 1][c2]} + ${rows[r2 - 1][c2 + 1]}`);
      speak(`Add the two bricks underneath.`);
    }
  }

  return (
    <Shell title="Number Pyramid 🔺" subtitle="Each brick = the two bricks below, added together" onBack={onBack}>
      {celebrate && <Confetti />}
      <DiffBar diff={diff} set={d => { setDiff(d); setRound(r => r + 1); }} />

      <div className="glass rounded-[1.75rem] p-5">
        <div className="flex flex-col-reverse items-center gap-2">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-2">
              {row.map((v, ci) => {
                const blank = isBlank(ri, ci);
                const shown = blank ? filled[key(ri, ci)] : v;
                const isTarget = target && target[0] === ri && target[1] === ci;
                return (
                  <div key={ci}
                    aria-label={blank && shown === undefined ? "empty brick" : `brick ${shown}`}
                    className={`grid h-14 w-16 place-items-center rounded-2xl text-xl font-extrabold
                      ${shown === undefined
                        ? isTarget ? "border-4 border-dashed border-tint bg-tint/10 text-tint" : "border-4 border-dashed border-ink/20 bg-white/40"
                        : blank ? "bg-mint text-white" : "bg-white/80 text-ink"}`}>
                    {shown ?? "?"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-3 min-h-6 text-center text-sm text-ink-2" role="status">{note}</p>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {opts.map(o => (
          <motion.button key={o} whileTap={{ scale: 0.92 }} onClick={() => choose(o)}
            aria-label={`Answer ${o}`} className="glass min-h-20 rounded-3xl text-2xl font-extrabold">
            {o}
          </motion.button>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Btn kind="ghost" onClick={() => setRound(r => r + 1)}>
          <RotateCcw size={18} aria-hidden /> New pyramid
        </Btn>
      </div>
    </Shell>
  );
}
