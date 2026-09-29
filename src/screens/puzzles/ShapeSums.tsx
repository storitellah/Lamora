/**
 * Shape Sums — the "picture arithmetic" puzzle.
 *
 * Shapes are built from line segments, so adding two shapes really does merge
 * their strokes and subtracting really does remove them. Every equation shown
 * is derived from that model (see data/shapes.ts), which means it is always
 * solvable and the answer is always a shape a child can name.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, ChevronRight } from "lucide-react";
import { Shell, Btn, Confetti, toast } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";
import {
  pickEquation, distractors, shapePaths, NamedShape, Difficulty, ShapeEquation
} from "../../data/shapes";

/** Draw a shape from its segments. `ink` lets us colour operands vs answers. */
export function ShapeGlyph({ shape, size = 84, ink = "#b3283c" }: {
  shape: NamedShape; size?: number; ink?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={shape.name}>
      {shapePaths(shape).map((d, i) => (
        <path key={i} d={d} fill="none" stroke={ink} strokeWidth={6}
          strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

const TOTAL = 6;

export default function ShapeSums({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const [diff, setDiff] = useState<Difficulty>(level === 1 ? "easy" : level === 2 ? "medium" : "hard");
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const eq: ShapeEquation = useMemo(() => pickEquation(diff), [diff, round]);
  const options = useMemo(() => {
    const opts = [eq.answer, ...distractors(eq.answer, level === 1 ? 2 : 3)];
    return opts.sort(() => Math.random() - 0.5);
  }, [eq, level]);

  function choose(s: NamedShape) {
    if (picked) return;
    setPicked(s.id);
    if (s.id === eq.answer.id) {
      sfx.correct(); haptic(14);
      speak(`Yes! That makes ${eq.answer.name}.`);
      const next = solved + 1;
      setTimeout(() => {
        if (next >= TOTAL) {
          sfx.win();
          dispatch({ type: "award", stars: 2, activity: `puzzle-shapesums-${diff}` });
          setCelebrate(true);
          setTimeout(() => { setCelebrate(false); setSolved(0); setPicked(null); setHint(null); setRound(r => r + 1); }, 2000);
        } else {
          setSolved(next); setPicked(null); setHint(null); setRound(r => r + 1);
        }
      }, 900);
    } else {
      sfx.wrong();
      setHint(eq.op === "+"
        ? `Put the lines of both shapes together — what do they make?`
        : `Take away the lines of the second shape from the first.`);
      speak("Not quite. Look at the lines carefully.");
      setTimeout(() => setPicked(null), 700);
    }
  }

  return (
    <Shell
      title="Shape Sums 🧩"
      subtitle={`Add or take away the lines — what shape do you get? (${solved + 1} of ${TOTAL})`}
      onBack={onBack}
    >
      {celebrate && <Confetti />}

      {/* Difficulty */}
      <div className="mb-4 flex justify-center gap-2">
        {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
          <Btn key={d} kind={diff === d ? "primary" : "soft"} className="!min-h-10 !px-5 !py-2 text-sm"
            onClick={() => { setDiff(d); setSolved(0); setPicked(null); setHint(null); setRound(r => r + 1); }}>
            {d === "easy" ? "🟢 Easy" : d === "medium" ? "🟡 Medium" : "🔴 Hard"}
          </Btn>
        ))}
      </div>

      {/* The equation */}
      <motion.div key={round} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[1.75rem] p-5">
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-3"
          aria-label={`${eq.a.name} ${eq.op === "+" ? "plus" : "minus"} ${eq.b.name} equals what?`}>
          <ShapeGlyph shape={eq.a} />
          <span className="text-4xl font-extrabold text-ink-2" aria-hidden>{eq.op}</span>
          <ShapeGlyph shape={eq.b} />
          <span className="text-4xl font-extrabold text-ink-2" aria-hidden>=</span>
          <span className="grid h-[84px] w-[84px] place-items-center rounded-2xl border-4 border-dashed border-tint/40 text-4xl font-extrabold text-tint">
            ?
          </span>
        </div>
        <p className="mt-3 min-h-6 text-center text-ink-2" role="status">{hint}</p>
        <div className="text-center">
          <Btn kind="ghost" onClick={() => speak(
            `What is ${eq.a.name} ${eq.op === "+" ? "plus" : "take away"} ${eq.b.name}?`
          )}>
            <Volume2 size={18} aria-hidden /> Read it to me
          </Btn>
        </div>
      </motion.div>

      {/* Answer choices */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map(o => {
          const isRight = picked === o.id && o.id === eq.answer.id;
          const isWrong = picked === o.id && o.id !== eq.answer.id;
          return (
            <motion.button
              key={o.id}
              whileTap={{ scale: 0.94 }}
              animate={isWrong ? { x: [0, -8, 8, -5, 5, 0] } : {}}
              onClick={() => choose(o)}
              aria-label={`Answer: ${o.name}`}
              className={`glass grid min-h-28 place-items-center rounded-3xl transition-colors
                ${isRight ? "!bg-mint" : ""} ${isWrong ? "!bg-coral" : ""}`}
            >
              <ShapeGlyph shape={o} size={72} ink={isRight || isWrong ? "#ffffff" : "#2f5fd0"} />
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Btn kind="ghost" onClick={() => { setPicked(null); setHint(null); setRound(r => r + 1); }}>
          Skip <ChevronRight size={18} aria-hidden />
        </Btn>
      </div>
    </Shell>
  );
}
