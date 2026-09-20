/**
 * Join the Dots — tap the numbered dots in order to draw a letter or numeral.
 *
 * Dots are numbered continuously across pen strokes, and a line is only drawn
 * *within* a stroke — the same "lift your pencil here" convention a printed
 * handwriting workbook uses, so the finished shape is a properly formed letter
 * rather than a scribbled outline.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, ChevronRight, Volume2 } from "lucide-react";
import { Shell, Btn, Confetti, toast } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";
import { LETTER_DOTS, NUMBER_DOTS, Stroke, wordsStartingWith } from "../../data/workbook";

const VIEW = 100; // data grid

type Kind = "letters" | "numbers";

/** Flatten strokes into numbered dots, remembering which stroke each is in. */
function buildDots(strokes: Stroke[]) {
  const dots: { x: number; y: number; stroke: number; index: number }[] = [];
  strokes.forEach((s, si) => s.forEach(([x, y]) => dots.push({ x, y, stroke: si, index: dots.length })));
  return dots;
}

export default function JoinDots({ onBack }: { onBack: () => void }) {
  const { dispatch } = useStore();
  const [kind, setKind] = useState<Kind>("letters");
  const [which, setWhich] = useState(0);
  const [progress, setProgress] = useState(0);   // how many dots joined
  const [celebrate, setCelebrate] = useState(false);

  const keys = kind === "letters" ? Object.keys(LETTER_DOTS) : Object.keys(NUMBER_DOTS);
  const key = keys[which % keys.length];
  const strokes = (kind === "letters" ? LETTER_DOTS : NUMBER_DOTS)[key];
  const dots = useMemo(() => buildDots(strokes), [strokes]);
  const finished = progress >= dots.length;

  // A picture word to celebrate with, e.g. A → 🍎 apple
  const word = kind === "letters" ? wordsStartingWith(key)[0] : null;

  function tap(i: number) {
    if (finished) return;
    if (i !== progress) {
      sfx.wrong();
      toast(`Tap dot number ${progress + 1} next 🔢`);
      return;
    }
    sfx.pop(); haptic();
    const next = progress + 1;
    setProgress(next);
    if (next >= dots.length) {
      sfx.win(); haptic(30);
      dispatch({ type: "award", stars: 1, activity: "wb-joindots" });
      setCelebrate(true);
      speak(kind === "letters"
        ? `You made the letter ${key}!${word ? ` ${key} is for ${word.word}.` : ""}`
        : `You made the number ${key}!`);
      setTimeout(() => setCelebrate(false), 2200);
    }
  }

  function nextShape() {
    setWhich(w => w + 1);
    setProgress(0);
  }

  // Lines drawn so far: only between consecutive dots inside the same stroke.
  const lines = dots.slice(1, progress).flatMap((d, idx) => {
    const prev = dots[idx];
    return d.stroke === prev.stroke ? [{ a: prev, b: d, k: `${idx}` }] : [];
  });

  return (
    <Shell
      title={`Join the dots — ${key}`}
      subtitle={finished
        ? (word ? `${key} is for ${word.word}! ${word.emoji}` : `You made ${key}!`)
        : `Tap the dots in order: 1, 2, 3 …`}
      onBack={onBack}
    >
      {celebrate && <Confetti />}

      <div className="mb-3 flex justify-center gap-2">
        {(["letters", "numbers"] as Kind[]).map(k => (
          <Btn key={k} kind={kind === k ? "primary" : "soft"} className="!min-h-10 !px-5 !py-2 text-sm"
            onClick={() => { setKind(k); setWhich(0); setProgress(0); }}>
            {k === "letters" ? "🔠 Letters" : "🔢 Numbers"}
          </Btn>
        ))}
      </div>

      <div className="glass mx-auto max-w-md rounded-[1.75rem] p-3">
        <svg viewBox={`-8 -8 ${VIEW + 16} ${VIEW + 16}`} className="w-full"
          role="img" aria-label={`Join the dots to draw ${key}. ${progress} of ${dots.length} dots joined.`}>
          {/* Faint finished shape so children can see where they're heading */}
          {strokes.map((s, si) => (
            <polyline key={"g" + si} points={s.map(p => p.join(",")).join(" ")}
              fill="none" stroke="#e6e7f5" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {/* Lines the child has joined */}
          {lines.map(l => (
            <motion.line key={l.k}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.18 }}
              x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y}
              stroke="#5b5bd6" strokeWidth={4.5} strokeLinecap="round" />
          ))}
          {/* The dots themselves */}
          {dots.map(d => {
            const doneDot = d.index < progress;
            const isNext = d.index === progress;
            return (
              <g key={d.index}>
                <circle
                  cx={d.x} cy={d.y} r={isNext ? 5.2 : 4.2}
                  className="cursor-pointer"
                  fill={doneDot ? "#5b5bd6" : isNext ? "#ffb545" : "#ffffff"}
                  stroke={doneDot ? "#5b5bd6" : "#9aa0bf"} strokeWidth={1.4}
                  onClick={() => tap(d.index)}
                  role="button"
                  aria-label={`Dot ${d.index + 1}${isNext ? ", tap this next" : ""}`}
                />
                {!doneDot && (
                  <text x={d.x} y={d.y - 6.5} textAnchor="middle" fontSize={5}
                    fill="#6e6e87" className="pointer-events-none select-none">
                    {d.index + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Btn kind="soft" onClick={() => speak(kind === "letters" ? `The letter ${key}` : `The number ${key}`)}>
          <Volume2 size={20} aria-hidden /> Hear it
        </Btn>
        <Btn kind="soft" onClick={() => setProgress(0)}><RotateCcw size={18} aria-hidden /> Start over</Btn>
        <Btn kind={finished ? "good" : "ghost"} onClick={nextShape}>
          Next <ChevronRight size={18} aria-hidden />
        </Btn>
      </div>
      <p className="mt-4 text-center text-sm text-ink-2">{progress} of {dots.length} dots joined</p>
    </Shell>
  );
}
