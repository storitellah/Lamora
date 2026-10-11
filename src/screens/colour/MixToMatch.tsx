/**
 * Mix to Match — the colour-mixing challenge.
 *
 * A target colour appears and the child pours paints until their pot is close
 * enough. Because the scoring compares the *actual mixed colour* with the
 * target (not a stored answer), any valid route to the colour counts — a child
 * who finds a different recipe that lands on the same green is still right,
 * which is exactly how paint works.
 *
 * Levels: secondary colours → tints and shades → tertiary mixes.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Trash2, Check, Lightbulb } from "lucide-react";
import { Shell, Btn, Confetti, toast } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";
import {
  mixPaint, nameOf, toHex, readableInk, matchScore, PIGMENTS, PigmentId
} from "../../lib/color";

type Level = "easy" | "medium" | "hard";

interface Challenge { drops: Partial<Record<PigmentId, number>>; hint: string }

/** Target recipes per level. The target colour is computed from the recipe,
 *  so targets are always genuinely reachable with the pots on screen. */
const CHALLENGES: Record<Level, Challenge[]> = {
  easy: [
    { drops: { red: 1, yellow: 1 }, hint: "Two warm primaries." },
    { drops: { yellow: 1, blue: 1 }, hint: "Sunshine and sky." },
    { drops: { red: 1, blue: 1 }, hint: "A royal colour." },
    { drops: { red: 1, yellow: 1, blue: 1 }, hint: "Everything at once!" }
  ],
  medium: [
    { drops: { red: 1, white: 2 }, hint: "Start with red, then lighten it." },
    { drops: { blue: 1, white: 2 }, hint: "Sky blue — add something pale." },
    { drops: { red: 2, black: 1 }, hint: "Red, but deeper." },
    { drops: { yellow: 1, blue: 1, white: 2 }, hint: "Make green, then lighten it." },
    { drops: { blue: 1, black: 1 }, hint: "Blue, but like midnight." }
  ],
  hard: [
    { drops: { red: 2, yellow: 1 }, hint: "More red than yellow." },
    { drops: { yellow: 3, blue: 1 }, hint: "Mostly yellow, a touch of blue." },
    { drops: { blue: 3, red: 1 }, hint: "Mostly blue, a touch of red." },
    { drops: { red: 1, yellow: 2, blue: 1 }, hint: "All three, but yellow leads." },
    { drops: { red: 2, blue: 1, white: 1 }, hint: "A light purple — and lean red." }
  ]
};

const ORDER: PigmentId[] = ["red", "yellow", "blue", "white", "black"];
const PASS = 88;   // how close counts as a match

export default function MixToMatch({ onBack }: { onBack: () => void }) {
  const { dispatch, level: age } = useStore();
  const [lvl, setLvl] = useState<Level>(age === 1 ? "easy" : age === 2 ? "medium" : "hard");
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(0);
  const [drops, setDrops] = useState<Partial<Record<PigmentId, number>>>({});
  const [showHint, setShowHint] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const TOTAL = 4;

  const challenge = useMemo(() => {
    const pool = CHALLENGES[lvl];
    return pool[(round + solved) % pool.length];
  }, [lvl, round, solved]);

  const target = useMemo(() => mixPaint(challenge.drops), [challenge]);
  const mine = useMemo(() => mixPaint(drops), [drops]);
  const score = matchScore(mine, target);
  const poured = Object.values(drops).reduce<number>((s, n) => s + (n ?? 0), 0);

  function pour(id: PigmentId) {
    sfx.pop(); haptic(6);
    setDrops(d => ({ ...d, [id]: (d[id] ?? 0) + 1 }));
  }

  function check() {
    if (!poured) { toast("Pour some paint first! 🎨"); return; }
    if (score >= PASS) {
      sfx.win(); haptic(25);
      speak(`That's it — ${nameOf(target)}!`);
      const next = solved + 1;
      if (next >= TOTAL) {
        dispatch({ type: "award", stars: lvl === "easy" ? 2 : 3, activity: `colour-match-${lvl}` });
        setCelebrate(true);
        setTimeout(() => { setCelebrate(false); setSolved(0); setDrops({}); setShowHint(false); setRound(r => r + 1); }, 2100);
      } else {
        setSolved(next); setDrops({}); setShowHint(false);
      }
    } else {
      sfx.wrong();
      const warmer = score > 60;
      toast(warmer ? `So close — ${score}% there!` : `${score}% — keep mixing!`);
      speak(warmer ? "Very close! Adjust it a little." : "Not yet. Try a different mix.");
    }
  }

  return (
    <Shell
      title="Mix to Match 🎯"
      subtitle={`Make this colour! (${solved + 1} of ${TOTAL})`}
      onBack={onBack}
      wide
    >
      {celebrate && <Confetti />}

      <div className="mb-4 flex justify-center gap-2">
        {(["easy", "medium", "hard"] as Level[]).map(l => (
          <Btn key={l} kind={lvl === l ? "primary" : "soft"} className="!min-h-10 !px-5 !py-2 text-sm"
            onClick={() => { setLvl(l); setSolved(0); setDrops({}); setShowHint(false); setRound(r => r + 1); }}>
            {l === "easy" ? "🟢 Easy" : l === "medium" ? "🟡 Medium" : "🔴 Hard"}
          </Btn>
        ))}
      </div>

      {/* Target vs mine */}
      <div className="glass rounded-[1.75rem] p-5">
        <div className="flex items-center justify-center gap-5">
          <div className="text-center">
            <p className="mb-2 text-sm font-bold text-ink-2">Make this</p>
            <div className="grid h-32 w-32 place-items-center rounded-3xl"
              style={{ background: toHex(target), border: "4px solid rgba(0,0,0,.08)" }}
              role="img" aria-label={`Target colour: ${nameOf(target)}`}>
              <span className="text-lg font-extrabold" style={{ color: readableInk(target) }}>
                {nameOf(target)}
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="mb-2 text-sm font-bold text-ink-2">Your pot</p>
            <motion.div
              animate={{ background: toHex(mine) }}
              className="grid h-32 w-32 place-items-center rounded-3xl"
              style={{ background: toHex(mine), border: "4px solid rgba(0,0,0,.08)" }}
              role="img" aria-label={`Your colour: ${poured ? nameOf(mine) : "empty"}`}>
              <span className="text-lg font-extrabold" style={{ color: readableInk(mine) }}>
                {poured ? nameOf(mine) : "Empty"}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Closeness meter — encouraging, never a fail state */}
        {poured > 0 && (
          <div className="mx-auto mt-4 max-w-sm">
            <div className="h-3 overflow-hidden rounded-full bg-ink/10">
              <motion.div className="h-full rounded-full"
                animate={{ width: `${score}%` }}
                style={{ background: score >= PASS ? "#2bbd8e" : score > 60 ? "#ffb545" : "#ff6b6b" }} />
            </div>
            <p className="mt-1 text-center text-sm text-ink-2" role="status">{score}% match</p>
          </div>
        )}
      </div>

      {/* Pots */}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {ORDER.map(id => (
          <motion.button key={id} whileTap={{ scale: 0.9 }} onClick={() => pour(id)}
            aria-label={`Pour ${PIGMENTS[id].name}`}
            className="glass flex min-h-24 w-20 flex-col items-center justify-center gap-1 rounded-[1.4rem] p-2">
            <span className="h-10 w-10 rounded-full"
              style={{ background: toHex(mixPaint({ [id]: 1 })), border: "3px solid rgba(0,0,0,.08)" }} />
            <span className="text-xs font-bold">{PIGMENTS[id].name}</span>
            {drops[id] ? <span className="text-xs text-tint">×{drops[id]}</span> : null}
          </motion.button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Btn kind="good" onClick={check}><Check size={18} aria-hidden /> Check my colour</Btn>
        <Btn kind="soft" onClick={() => { setDrops({}); sfx.tap(); }}>
          <Trash2 size={18} aria-hidden /> Empty pot
        </Btn>
        <Btn kind="soft" onClick={() => { setShowHint(true); speak(challenge.hint); }}>
          <Lightbulb size={18} aria-hidden /> Hint
        </Btn>
        <Btn kind="ghost" onClick={() => speak(`Make ${nameOf(target)}`)}>
          <Volume2 size={18} aria-hidden /> Say the colour
        </Btn>
      </div>

      {showHint && <p className="mt-4 text-center text-ink-2">💡 {challenge.hint}</p>}
    </Shell>
  );
}
