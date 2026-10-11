/**
 * Light vs Paint — the headline piece of colour science.
 *
 * Two mixers side by side, both real:
 *   • Lights ADD   — red + green = yellow, all three = white
 *   • Paints SUBTRACT — red + yellow = orange, all three = brown
 *
 * Children flip the same three switches on each side and watch them disagree.
 * That contrast is the whole lesson, and because both models are computed
 * properly (lib/color.ts) rather than faked, the results hold up.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Lightbulb, Palette } from "lucide-react";
import { Shell, Btn, Confetti } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";
import {
  mixLight, lightMixName, mixPaint, nameOf, toHex, readableInk, LightId, PigmentId
} from "../../lib/color";

const CHANNELS: { light: LightId; paint: PigmentId; label: string }[] = [
  { light: "red", paint: "red", label: "Red" },
  { light: "green", paint: "yellow", label: "Green / Yellow" },
  { light: "blue", paint: "blue", label: "Blue" }
];

export default function LightVsPaint({ onBack }: { onBack: () => void }) {
  const { dispatch } = useStore();
  const [on, setOn] = useState<Record<string, boolean>>({ red: false, green: false, blue: false });
  const [tried, setTried] = useState<Set<string>>(new Set());
  const [celebrate, setCelebrate] = useState(false);

  const lightOn = { red: on.red, green: on.green, blue: on.blue } as Partial<Record<LightId, boolean>>;
  const lightColour = useMemo(() => mixLight(lightOn), [on.red, on.green, on.blue]);
  // The paint side uses the artist's primaries: red, yellow, blue.
  const paintDrops = useMemo(() => {
    const d: Partial<Record<PigmentId, number>> = {};
    if (on.red) d.red = 1;
    if (on.green) d.yellow = 1;
    if (on.blue) d.blue = 1;
    return d;
  }, [on.red, on.green, on.blue]);
  const paintColour = useMemo(() => mixPaint(paintDrops), [paintDrops]);
  const anyOn = on.red || on.green || on.blue;

  function toggle(key: string) {
    sfx.tap(); haptic(8);
    const next = { ...on, [key]: !on[key] };
    setOn(next);
    const sig = (["red", "green", "blue"] as const).filter(k => next[k]).join("+") || "none";
    const seen = new Set(tried).add(sig);
    setTried(seen);
    // Reward once they've tried a handful of combinations.
    if (seen.size >= 5 && tried.size < 5) {
      sfx.chime();
      dispatch({ type: "award", stars: 2, activity: "colour-lightvspaint" });
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1700);
    }
  }

  function explain() {
    if (!anyOn) { speak("Switch some colours on to compare light and paint."); return; }
    speak(
      `With light you get ${lightMixName(lightOn)}, because light adds up and gets brighter. ` +
      `With paint you get ${nameOf(paintColour)}, because paint takes light away and gets darker.`
    );
  }

  return (
    <Shell
      title="Light vs Paint 💡🎨"
      subtitle="The same three colours — but light and paint mix in opposite ways!"
      onBack={onBack}
      wide
    >
      {celebrate && <Confetti />}

      {/* Switches */}
      <div className="glass mb-5 rounded-[1.75rem] p-5">
        <p className="mb-3 text-center font-bold">Switch the colours on and off</p>
        <div className="flex flex-wrap justify-center gap-3">
          {CHANNELS.map(ch => (
            <motion.button
              key={ch.light}
              whileTap={{ scale: 0.93 }}
              onClick={() => toggle(ch.light)}
              role="switch"
              aria-checked={!!on[ch.light]}
              aria-label={`${ch.label} ${on[ch.light] ? "on" : "off"}`}
              className={`min-h-16 min-w-32 rounded-2xl px-5 text-lg font-bold transition-all
                ${on[ch.light] ? "text-white shadow-lg" : "glass text-ink-2"}`}
              style={on[ch.light]
                ? { background: ch.light === "red" ? "#e23b3b" : ch.light === "green" ? "#2aa84a" : "#2f6ad0" }
                : undefined}
            >
              {on[ch.light] ? "● " : "○ "}{ch.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* The two results */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* LIGHT */}
        <div className="glass rounded-[1.75rem] p-5 text-center">
          <p className="flex items-center justify-center gap-2 text-lg font-bold">
            <Lightbulb size={20} className="text-sun" aria-hidden /> Light
          </p>
          <p className="mb-3 text-sm text-ink-2">Shining torches onto a wall</p>
          <motion.div
            animate={{ background: toHex(lightColour) }}
            className="mx-auto grid h-40 w-40 place-items-center rounded-full"
            style={{
              background: toHex(lightColour),
              boxShadow: anyOn ? `0 0 60px ${toHex(lightColour)}` : "none",
              border: "4px solid rgba(0,0,0,.08)"
            }}
            role="img"
            aria-label={`Light mix: ${lightMixName(lightOn)}`}
          >
            <span className="text-xl font-extrabold" style={{ color: readableInk(lightColour) }}>
              {lightMixName(lightOn)}
            </span>
          </motion.div>
          <p className="mt-3 text-sm font-bold text-tint">Light ADDS — more colours, brighter</p>
        </div>

        {/* PAINT */}
        <div className="glass rounded-[1.75rem] p-5 text-center">
          <p className="flex items-center justify-center gap-2 text-lg font-bold">
            <Palette size={20} className="text-coral" aria-hidden /> Paint
          </p>
          <p className="mb-3 text-sm text-ink-2">Stirring paints in a pot</p>
          <motion.div
            animate={{ background: toHex(paintColour) }}
            className="mx-auto grid h-40 w-40 place-items-center rounded-full"
            style={{ background: toHex(paintColour), border: "4px solid rgba(0,0,0,.08)" }}
            role="img"
            aria-label={`Paint mix: ${anyOn ? nameOf(paintColour) : "empty"}`}
          >
            <span className="text-xl font-extrabold" style={{ color: readableInk(paintColour) }}>
              {anyOn ? nameOf(paintColour) : "Empty"}
            </span>
          </motion.div>
          <p className="mt-3 text-sm font-bold text-coral">Paint TAKES AWAY — more colours, darker</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="glass mt-5 rounded-[1.75rem] p-5 text-center">
        <p className="text-lg">
          {!anyOn
            ? "Everything is off. Light with nothing on is darkness; paint with nothing in it is white paper."
            : on.red && on.green && on.blue
              ? "All three! Light makes pure WHITE, but paint makes muddy BROWN. Opposite results from the same three colours."
              : "Notice how the two circles disagree — that is the big secret of colour science."}
        </p>
        <Btn kind="ghost" className="mt-2" onClick={explain}>
          <Volume2 size={18} aria-hidden /> Explain it to me
        </Btn>
      </div>

      <p className="mt-4 text-center text-sm text-ink-2">
        Tried {tried.size} combinations — try switching all three on!
      </p>
    </Shell>
  );
}
