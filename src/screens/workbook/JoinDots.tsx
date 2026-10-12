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

/**
 * A "stop" is one tappable place on the page. Letters like B, D, O and 8
 * return to a point they have already visited, so two (or more) numbered dots
 * can sit on the same spot. Drawn separately, their numbers stacked into an
 * unreadable blob and the later dot sat on top and swallowed the tap — tapping
 * "1" on B registered as "3" and the child was stuck. Coincident dots are now
 * merged into one stop that carries every number ("1 · 3").
 */
type Stop = { x: number; y: number; indices: number[]; lx: number; ly: number; hitR: number };

const MERGE = 6;     // dots closer than this are the same place on the page
const LABEL_D = 8.5; // label distance from its dot

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function buildStops(strokes: Stroke[], dots: ReturnType<typeof buildDots>): Stop[] {
  const stops: Stop[] = [];
  for (const d of dots) {
    const s = stops.find(s => Math.hypot(s.x - d.x, s.y - d.y) < MERGE);
    if (s) s.indices.push(d.index);
    else stops.push({ x: d.x, y: d.y, indices: [d.index], lx: d.x, ly: d.y - LABEL_D, hitR: 7 });
  }
  const segs = strokes.flatMap(s => s.slice(1).map((p, i) => [s[i], p] as const));
  // Place each label in whichever of 8 directions is furthest from every other
  // dot, every pen line, and every label placed so far.
  const placed: [number, number][] = [];
  for (const s of stops) {
    let best = { score: -Infinity, x: s.lx, y: s.ly };
    for (let k = 0; k < 8; k++) {
      const a = -Math.PI / 2 + (k * Math.PI) / 4;  // start straight up
      const x = s.x + Math.cos(a) * LABEL_D, y = s.y + Math.sin(a) * LABEL_D;
      let score = Infinity;
      for (const o of stops) if (o !== s) score = Math.min(score, Math.hypot(o.x - x, o.y - y));
      for (const [p, q] of segs) score = Math.min(score, segDist(x, y, p[0], p[1], q[0], q[1]) + 1.5);
      for (const [px, py] of placed) score = Math.min(score, Math.hypot(px - x, py - y) * 0.9);
      if (x < -5 || x > VIEW + 5 || y < -4 || y > VIEW + 6) score -= 20; // keep on the page
      score -= k * 0.01; // tie-break: prefer "above"
      if (score > best.score) best = { score, x, y };
    }
    s.lx = best.x; s.ly = best.y;
    placed.push([best.x, best.y]);
    // Big finger-sized hit area, but never so big it overlaps a neighbour.
    const nearest = Math.min(...stops.filter(o => o !== s).map(o => Math.hypot(o.x - s.x, o.y - s.y)), 99);
    s.hitR = Math.max(4.5, Math.min(8, nearest / 2 - 0.3));
  }
  return stops;
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
  const stops = useMemo(() => buildStops(strokes, dots), [strokes, dots]);
  const finished = progress >= dots.length;

  // A picture word to celebrate with, e.g. A → 🍎 apple
  const word = kind === "letters" ? wordsStartingWith(key)[0] : null;

  /** A stop can hold several numbers; it is "right" if it holds the next one. */
  function tap(stop: Stop) {
    if (finished) return;
    if (!stop.indices.includes(progress)) {
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
  // Endpoints snap to their stop, so merged dots join up exactly.
  const at = (i: number) => stops.find(s => s.indices.includes(i))!;
  const lines = dots.slice(1, progress).flatMap((d, idx) => {
    const prev = dots[idx];
    return d.stroke === prev.stroke ? [{ a: at(prev.index), b: at(d.index), k: `${idx}` }] : [];
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
          <Btn key={k} kind={kind === k ? "primary" : "soft"} className="!min-h-11 !px-5 !py-2 text-sm"
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
          {/* The dots themselves — one per stop, with a finger-sized hit area */}
          {stops.map((st, si) => {
            const doneAll = st.indices.every(i => i < progress);
            const isNext = st.indices.includes(progress);
            const visited = st.indices.some(i => i < progress);
            const label = st.indices.map(i => i + 1).join(" · ");
            return (
              <g key={si} onClick={() => tap(st)} className="cursor-pointer" role="button"
                aria-label={`Dot ${label}${isNext ? ", tap this next" : ""}`}>
                <circle cx={st.x} cy={st.y} r={st.hitR} fill="transparent" />
                <circle cx={st.x} cy={st.y} r={isNext ? 5.2 : 4.2}
                  fill={isNext ? "#ffb545" : visited ? "#5b5bd6" : "#ffffff"}
                  stroke={visited ? "#5b5bd6" : "#9aa0bf"} strokeWidth={1.4} />
                {!doneAll && (
                  <text x={st.lx} y={st.ly} textAnchor="middle" dominantBaseline="central"
                    fontSize={st.indices.length > 1 ? 4.6 : 5.4} fontWeight={700}
                    fill={isNext ? "#1d1d2f" : "#6e6e87"} stroke="#ffffff" strokeWidth={1.6}
                    paintOrder="stroke" className="pointer-events-none select-none">
                    {label}
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
