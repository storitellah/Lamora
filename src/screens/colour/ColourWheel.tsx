/**
 * Colour Wheel — the artist's twelve-part wheel, drawn as real SVG segments.
 *
 * Tapping a slice tells a child how that colour is mixed, whether it is a
 * primary, secondary or tertiary, and shows its COMPLEMENTARY colour (the one
 * directly opposite). A warm/cool toggle shades the two halves of the wheel,
 * which is the clearest way to show that idea without any words.
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Flame, Snowflake, ArrowLeftRight } from "lucide-react";
import { Shell, Btn } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";
import { WHEEL } from "../../data/colour";
import { fromHex, readableInk } from "../../lib/color";

const R_OUT = 46, R_IN = 20, CX = 50, CY = 50;

/** SVG path for one wheel segment. */
function slicePath(i: number, n: number): string {
  const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
  const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
  const p = (r: number, a: number) => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  const [x0, y0] = p(R_OUT, a0), [x1, y1] = p(R_OUT, a1);
  const [x2, y2] = p(R_IN, a1), [x3, y3] = p(R_IN, a0);
  return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3} Z`;
}

export default function ColourWheel({ onBack }: { onBack: () => void }) {
  const { dispatch } = useStore();
  const [sel, setSel] = useState<number | null>(null);
  const [mode, setMode] = useState<"all" | "temp" | "comp">("all");
  const [seen, setSeen] = useState<Set<number>>(new Set());

  const slice = sel === null ? null : WHEEL[sel];
  const opposite = sel === null ? null : WHEEL[(sel + 6) % WHEEL.length];

  function tap(i: number) {
    sfx.tap(); haptic(6);
    setSel(i);
    const s = WHEEL[i];
    speak(`${s.name}. ${s.recipe}.`);
    const next = new Set(seen).add(i);
    setSeen(next);
    if (next.size === WHEEL.length && seen.size < WHEEL.length) {
      dispatch({ type: "award", stars: 2, activity: "colour-wheel" });
    }
  }

  return (
    <Shell title="Colour Wheel 🎡" subtitle="Tap a colour to learn how it is made" onBack={onBack} wide>
      {/* View modes */}
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        <Btn kind={mode === "all" ? "primary" : "soft"} className="!min-h-10 !px-4 !py-2 text-sm"
          onClick={() => setMode("all")}>🎨 All colours</Btn>
        <Btn kind={mode === "temp" ? "primary" : "soft"} className="!min-h-10 !px-4 !py-2 text-sm"
          onClick={() => { setMode("temp"); speak("Warm colours are reds, oranges and yellows. Cool colours are greens, blues and purples."); }}>
          <Flame size={15} aria-hidden /> Warm &amp; cool
        </Btn>
        <Btn kind={mode === "comp" ? "primary" : "soft"} className="!min-h-10 !px-4 !py-2 text-sm"
          onClick={() => { setMode("comp"); speak("Colours opposite each other on the wheel are called complementary. Side by side, they make each other pop."); }}>
          <ArrowLeftRight size={15} aria-hidden /> Opposites
        </Btn>
      </div>

      <div className="mx-auto max-w-md">
        <svg viewBox="0 0 100 100" className="w-full" role="group" aria-label="Colour wheel with twelve colours">
          {WHEEL.map((s, i) => {
            const isSel = sel === i;
            const isOpp = mode === "comp" && sel !== null && i === (sel + 6) % WHEEL.length;
            // In warm/cool mode we fade the half that isn't being talked about.
            const dim = mode === "temp" ? (s.warm ? 1 : 0.28) : 1;
            return (
              <motion.path
                key={s.name}
                d={slicePath(i, WHEEL.length)}
                fill={s.hex}
                opacity={dim}
                stroke={isSel ? "#1d1d2f" : isOpp ? "#1d1d2f" : "#ffffff"}
                strokeWidth={isSel || isOpp ? 2 : 0.8}
                strokeDasharray={isOpp ? "3 2" : undefined}
                animate={{ scale: isSel ? 1.06 : 1 }}
                style={{ transformOrigin: "50px 50px", cursor: "pointer" }}
                onClick={() => tap(i)}
                role="button"
                aria-label={`${s.name}, ${s.kind}. ${s.recipe}`}
              />
            );
          })}
          {/* Hub shows the current pick */}
          <circle cx={CX} cy={CY} r={R_IN - 2} fill={slice ? slice.hex : "#ffffff"} stroke="#ffffff" strokeWidth={1.5} />
          {slice && (
            <text x={CX} y={CY + 1.4} textAnchor="middle" fontSize={5.2} fontWeight="700"
              fill={readableInk(fromHex(slice.hex))}>
              {slice.name.length > 11 ? slice.name.split("-")[0] : slice.name}
            </text>
          )}
        </svg>
      </div>

      {/* Explanation card */}
      <div className="glass mt-5 rounded-[1.75rem] p-5 text-center">
        {slice ? (
          <>
            <p className="text-xl font-extrabold">{slice.name}</p>
            <p className="mt-1 inline-block rounded-full bg-tint/12 px-3 py-0.5 text-sm font-bold text-tint">
              {slice.kind === "primary" ? "Primary — a starting colour"
                : slice.kind === "secondary" ? "Secondary — two primaries"
                : "Tertiary — a primary + a secondary"}
            </p>
            <p className="mt-3 text-lg">{slice.recipe}</p>
            <p className="mt-2 text-sm text-ink-2">
              {slice.warm ? "🔥 A warm colour" : "❄️ A cool colour"}
              {opposite && <> · opposite is <b>{opposite.name}</b></>}
            </p>
            {opposite && mode === "comp" && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="h-12 w-20 rounded-xl" style={{ background: slice.hex }} />
                <span className="h-12 w-20 rounded-xl" style={{ background: opposite.hex }} />
              </div>
            )}
            <Btn kind="ghost" className="mt-2" onClick={() => speak(`${slice.name}. ${slice.recipe}`)}>
              <Volume2 size={18} aria-hidden /> Say it again
            </Btn>
          </>
        ) : (
          <p className="text-ink-2">Tap any colour on the wheel to find out how it is mixed.</p>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-ink-2">
        Explored {seen.size} of {WHEEL.length} colours
      </p>
    </Shell>
  );
}
