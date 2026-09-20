/**
 * Odd & Even numbers — Cambridge Primary "Number" strand (Stage 1 onwards),
 * introduced informally from PP2.
 *
 * Three ways in, because odd/even only really clicks when a child *sees* why:
 *   • Sort   — drop a number into the Odd or Even basket
 *   • Pairs  — the visual proof: pair the dots up; a leftover means odd
 *   • Hunt   — tap every even (or odd) number in a grid
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, ChevronRight } from "lucide-react";
import { Shell, Btn, Tile, Confetti, toast } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";

type Mode = "sort" | "pairs" | "hunt";

const rnd = (n: number) => Math.floor(Math.random() * n);

export default function OddEven({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const back = () => setMode(null);

  if (mode === "sort") return <Sort onBack={back} />;
  if (mode === "pairs") return <Pairs onBack={back} />;
  if (mode === "hunt") return <Hunt onBack={back} />;

  return (
    <Shell title="Odd & Even 🔢" subtitle="Numbers that pair up, and numbers with one left over" onBack={onBack}>
      <div className="grid grid-cols-2 gap-4">
        <Tile emoji="🧺" label="Sort them" sub="Odd or even basket" onClick={() => setMode("sort")} />
        <Tile emoji="👀" label="Pair them up" sub="See why it works" onClick={() => setMode("pairs")} />
        <Tile emoji="🎯" label="Number hunt" sub="Find them all" onClick={() => setMode("hunt")} />
      </div>
      <div className="glass mt-5 rounded-[1.75rem] p-5 text-center">
        <p className="text-lg font-bold">The trick 🪄</p>
        <p className="mt-1 text-ink-2">
          If a number ends in <b>0, 2, 4, 6 or 8</b> it is <b>even</b> — everything pairs up.
          If it ends in <b>1, 3, 5, 7 or 9</b> it is <b>odd</b> — there is always one left over.
        </p>
        <Btn kind="ghost" className="mt-2" onClick={() => speak(
          "If a number ends in zero, two, four, six or eight, it is even. If it ends in one, three, five, seven or nine, it is odd."
        )}><Volume2 size={18} aria-hidden /> Hear the trick</Btn>
      </div>
    </Shell>
  );
}

/* ---------------- Sort into baskets ---------------- */

function Sort({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const max = level === 1 ? 20 : level === 2 ? 100 : 500;
  const total = 6;
  const [done, setDone] = useState(0);
  const [n, setN] = useState(() => 1 + rnd(max));
  const [flash, setFlash] = useState<"even" | "odd" | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  function choose(kind: "even" | "odd") {
    const correct = (n % 2 === 0) === (kind === "even");
    if (correct) {
      sfx.correct(); haptic(12);
      setFlash(kind);
      const next = done + 1;
      setTimeout(() => {
        setFlash(null);
        if (next >= total) {
          sfx.win();
          dispatch({ type: "award", stars: 2, activity: "wb-oddeven-sort" });
          setCelebrate(true);
          speak("Brilliant sorting!");
          setTimeout(() => { setCelebrate(false); setDone(0); setN(1 + rnd(max)); }, 1800);
        } else {
          setDone(next);
          setN(1 + rnd(max));
        }
      }, 450);
    } else {
      sfx.wrong();
      const last = n % 10;
      speak(`${n} ends in ${last}, so it is ${n % 2 === 0 ? "even" : "odd"}.`);
      toast(`Look at the last digit: ${last}`);
    }
  }

  return (
    <Shell title="Odd or even?" subtitle={`Number ${done + 1} of ${total}`} onBack={onBack}>
      {celebrate && <Confetti />}
      <motion.div key={n} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass mx-auto max-w-xs rounded-[1.75rem] p-10 text-center">
        <div className="text-7xl font-extrabold text-tint">{n}</div>
      </motion.div>
      <div className="mt-6 flex justify-center gap-4">
        <motion.button whileTap={{ scale: 0.94 }} onClick={() => choose("even")}
          className={`glass min-h-28 w-36 rounded-[1.75rem] text-xl font-bold ${flash === "even" ? "!bg-mint !text-white" : ""}`}>
          <div className="text-3xl" aria-hidden>🧺</div> Even
        </motion.button>
        <motion.button whileTap={{ scale: 0.94 }} onClick={() => choose("odd")}
          className={`glass min-h-28 w-36 rounded-[1.75rem] text-xl font-bold ${flash === "odd" ? "!bg-mint !text-white" : ""}`}>
          <div className="text-3xl" aria-hidden>🧺</div> Odd
        </motion.button>
      </div>
    </Shell>
  );
}

/* ---------------- Pair them up (the visual proof) ---------------- */

function Pairs({ onBack }: { onBack: () => void }) {
  const { dispatch } = useStore();
  const [n, setN] = useState(() => 3 + rnd(10));
  const [revealed, setRevealed] = useState(false);
  const isEven = n % 2 === 0;

  function reveal() {
    setRevealed(true);
    sfx.chime();
    dispatch({ type: "award", stars: 1, activity: "wb-oddeven-pairs" });
    speak(isEven
      ? `${n} dots pair up perfectly with none left over, so ${n} is even.`
      : `${n} dots pair up but one is left over, so ${n} is odd.`);
  }

  const pairs = Math.floor(n / 2);
  const leftover = n % 2;

  return (
    <Shell title="Pair them up" subtitle={`Can all ${n} dots find a partner?`} onBack={onBack}>
      <div className="glass rounded-[1.75rem] p-6">
        <div className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: pairs }, (_, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
              className="flex gap-1 rounded-full bg-tint/10 p-2" aria-label="a pair">
              <span className="h-7 w-7 rounded-full bg-tint" />
              <span className="h-7 w-7 rounded-full bg-tint" />
            </motion.div>
          ))}
          {leftover === 1 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: pairs * 0.05 }}
              className={`flex gap-1 rounded-full p-2 ${revealed ? "bg-coral/20 ring-2 ring-coral" : "bg-ink/5"}`}
              aria-label="one dot with no partner">
              <span className="h-7 w-7 rounded-full bg-coral" />
            </motion.div>
          )}
        </div>

        <p className="mt-5 text-center text-lg" aria-live="polite">
          {revealed
            ? isEven
              ? <><b>{n} is even</b> — every dot found a partner. 🎉</>
              : <><b>{n} is odd</b> — one dot has no partner. 👀</>
            : "Look carefully… does every dot have a partner?"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {!revealed
          ? <Btn onClick={reveal}>Show me!</Btn>
          : <Btn kind="good" onClick={() => { setN(3 + rnd(10)); setRevealed(false); }}>
              Try another <ChevronRight size={18} aria-hidden />
            </Btn>}
      </div>
    </Shell>
  );
}

/* ---------------- Number hunt ---------------- */

function Hunt({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const [round, setRound] = useState(0);
  const want: "even" | "odd" = round % 2 === 0 ? "even" : "odd";
  const max = level === 1 ? 20 : 60;

  const numbers = useMemo(
    () => Array.from({ length: 12 }, () => 1 + rnd(max)),
    [round, max]
  );
  const [found, setFound] = useState<Set<number>>(new Set());
  const targets = numbers.map((v, i) => ({ v, i })).filter(({ v }) => (v % 2 === 0) === (want === "even"));
  const [celebrate, setCelebrate] = useState(false);

  function tap(i: number, v: number) {
    if (found.has(i)) return;
    const isTarget = (v % 2 === 0) === (want === "even");
    if (!isTarget) {
      sfx.wrong();
      toast(`${v} is ${v % 2 === 0 ? "even" : "odd"} — look at the last digit!`);
      return;
    }
    sfx.correct(); haptic(10);
    const nf = new Set(found); nf.add(i);
    setFound(nf);
    if (nf.size === targets.length) {
      sfx.win();
      dispatch({ type: "award", stars: 2, activity: "wb-oddeven-hunt" });
      setCelebrate(true);
      speak(`You found every ${want} number!`);
      setTimeout(() => { setCelebrate(false); setRound(r => r + 1); setFound(new Set()); }, 1800);
    }
  }

  return (
    <Shell title={`Tap every ${want} number`} subtitle={`Found ${found.size} of ${targets.length}`} onBack={onBack}>
      {celebrate && <Confetti />}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {numbers.map((v, i) => (
          <motion.button key={i} whileTap={{ scale: 0.93 }} onClick={() => tap(i, v)}
            aria-label={`Number ${v}`}
            className={`glass min-h-20 rounded-3xl text-3xl font-extrabold
              ${found.has(i) ? "!bg-mint !text-white" : ""}`}>
            {v}
          </motion.button>
        ))}
      </div>
    </Shell>
  );
}
