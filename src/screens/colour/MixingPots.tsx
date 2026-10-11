/**
 * Mixing Pots — free paint mixing, and the Tints & Shades ladder.
 *
 * The mixing is real: pouring drops feeds the RYB paint model in lib/color.ts,
 * so blue + yellow genuinely makes green and adding more yellow genuinely
 * shifts it yellower. Children get the recipe written out as they go, and a
 * "discoveries" shelf celebrates the classic mixes the first time they find
 * them — which turns free play into a quiet scavenger hunt.
 */
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Trash2, Droplet } from "lucide-react";
import { Shell, Btn, Confetti, toast } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";
import {
  mixPaint, nameOf, toHex, readableInk, PIGMENTS, PigmentId, RGB, tint, shade, tone
} from "../../lib/color";
import { DISCOVERIES } from "../../data/colour";

const ORDER: PigmentId[] = ["red", "yellow", "blue", "white", "black"];

/* ---------------- Mixing Pots ---------------- */

export function MixingPots({ onBack }: { onBack: () => void }) {
  const { dispatch } = useStore();
  const [drops, setDrops] = useState<Partial<Record<PigmentId, number>>>({});
  const [found, setFound] = useState<Set<string>>(new Set());
  const [celebrate, setCelebrate] = useState(false);
  const [splash, setSplash] = useState(0);

  const colour = useMemo(() => mixPaint(drops), [drops]);
  const name = nameOf(colour);
  const total = Object.values(drops).reduce<number>((s, n) => s + (n ?? 0), 0);

  function pour(id: PigmentId) {
    sfx.pop(); haptic(8);
    setSplash(s => s + 1);
    setDrops(d => {
      const next = { ...d, [id]: (d[id] ?? 0) + 1 };
      checkDiscovery(next);
      return next;
    });
  }

  /** Did this mix just reproduce one of the classic recipes? */
  function checkDiscovery(next: Partial<Record<PigmentId, number>>) {
    for (const rec of DISCOVERIES) {
      if (found.has(rec.id)) continue;
      // Compare the *ratio* of drops, so 2:2 counts the same as 1:1.
      const keys = new Set([...Object.keys(rec.drops), ...Object.keys(next)]);
      const scale = (o: Record<string, number>) => {
        const vals = Object.values(o).filter(v => v > 0);
        const min = Math.min(...vals);
        return min;
      };
      const a = rec.drops as Record<string, number>;
      const b = next as Record<string, number>;
      const sa = scale(a), sb = scale(b);
      let same = true;
      for (const k of keys) {
        const va = (a[k] ?? 0) / sa, vb = (b[k] ?? 0) / sb;
        if (Math.abs(va - vb) > 0.01) { same = false; break; }
      }
      if (same) {
        setFound(f => new Set(f).add(rec.id));
        setCelebrate(true);
        sfx.chime();
        speak(rec.note);
        toast(`${rec.emoji} ${rec.note}`);
        dispatch({ type: "award", stars: 1, activity: "colour-discovery" });
        setTimeout(() => setCelebrate(false), 1700);
        break;
      }
    }
  }

  const recipe = ORDER.filter(id => drops[id]).map(id => `${drops[id]} ${PIGMENTS[id].name.toLowerCase()}`).join(" + ");

  return (
    <Shell title="Mixing Pots 🎨" subtitle="Pour the paints and see what you make!" onBack={onBack} wide>
      {celebrate && <Confetti />}

      {/* The pot */}
      <div className="glass mx-auto max-w-md rounded-[1.75rem] p-6 text-center">
        <motion.div
          key={splash}
          initial={{ scale: 0.94 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 16 }}
          className="mx-auto grid h-44 w-44 place-items-center rounded-full shadow-inner"
          style={{ background: toHex(colour), border: "6px solid rgba(0,0,0,.08)" }}
          role="img"
          aria-label={`The pot is ${name}`}
        >
          <span className="text-2xl font-extrabold" style={{ color: readableInk(colour) }}>
            {total ? name : "Empty"}
          </span>
        </motion.div>

        <p className="mt-4 min-h-6 text-ink-2">{recipe || "Tap a paint below to pour a drop"}</p>

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Btn kind="ghost" onClick={() => speak(total ? `You made ${name}. ${recipe}` : "The pot is empty")}>
            <Volume2 size={18} aria-hidden /> What did I make?
          </Btn>
          <Btn kind="soft" onClick={() => { setDrops({}); sfx.tap(); }}>
            <Trash2 size={18} aria-hidden /> Wash the pot
          </Btn>
        </div>
      </div>

      {/* Paint pots */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {ORDER.map(id => {
          const swatch = mixPaint({ [id]: 1 });
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.9 }}
              onClick={() => pour(id)}
              aria-label={`Pour a drop of ${PIGMENTS[id].name}`}
              className="glass flex min-h-28 w-24 flex-col items-center justify-center gap-2 rounded-[1.5rem] p-3"
            >
              <span className="h-12 w-12 rounded-full shadow-inner"
                style={{ background: toHex(swatch), border: "3px solid rgba(0,0,0,.08)" }} />
              <span className="text-sm font-bold">{PIGMENTS[id].name}</span>
              {drops[id] ? (
                <span className="rounded-full bg-tint/15 px-2 text-xs font-bold text-tint">
                  {drops[id]} drop{drops[id]! > 1 ? "s" : ""}
                </span>
              ) : <span className="text-xs text-ink-2">tap to pour</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Discovery shelf */}
      <div className="glass mt-7 rounded-[1.75rem] p-5">
        <p className="mb-3 text-center font-bold">
          Colours to discover — {found.size} of {DISCOVERIES.length} found
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {DISCOVERIES.map(rec => {
            const got = found.has(rec.id);
            return (
              <div key={rec.id}
                aria-label={got ? `${rec.name} found` : "Not discovered yet"}
                className={`flex min-w-24 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-center
                  ${got ? "bg-mint/20" : "bg-ink/5"}`}>
                <span className="text-2xl" aria-hidden>{got ? rec.emoji : "❓"}</span>
                <span className="text-xs font-bold">{got ? rec.name : "???"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- Tints, Shades & Tones ---------------- */

const BASES: { name: string; drops: Partial<Record<PigmentId, number>> }[] = [
  { name: "Red", drops: { red: 1 } },
  { name: "Yellow", drops: { yellow: 1 } },
  { name: "Blue", drops: { blue: 1 } },
  { name: "Green", drops: { yellow: 1, blue: 1 } },
  { name: "Orange", drops: { red: 1, yellow: 1 } },
  { name: "Purple", drops: { red: 1, blue: 1 } }
];

export function TintsShades({ onBack }: { onBack: () => void }) {
  const { dispatch } = useStore();
  const [baseIdx, setBaseIdx] = useState(0);
  const [explored, setExplored] = useState<Set<string>>(new Set());
  const base = mixPaint(BASES[baseIdx].drops);

  /* Every ladder reads the same way left to right: the pure colour first, then
     a little more of the added paint at each step. Keeping one ascending list
     for all three rows is what makes the three ladders comparable — a child can
     see that the fourth square is always "the most added paint". */
  const steps = [0.25, 0.5, 0.75];
  const rows: { label: string; word: string; blurb: string; swatches: RGB[] }[] = [
    {
      label: "+ White", word: "Tint",
      blurb: "Adding white makes a TINT — lighter and softer.",
      swatches: steps.map(a => tint(base, a))
    },
    {
      label: "+ Grey", word: "Tone",
      blurb: "Adding grey makes a TONE — calmer and duller.",
      swatches: steps.map(a => tone(base, a))
    },
    {
      label: "+ Black", word: "Shade",
      blurb: "Adding black makes a SHADE — deeper and darker.",
      swatches: steps.map(a => shade(base, a))
    }
  ];

  function tap(word: string, blurb: string, c: RGB) {
    sfx.pop();
    speak(`${nameOf(c)}. ${blurb}`);
    const next = new Set(explored).add(word);
    setExplored(next);
    if (next.size === 3 && explored.size < 3) {
      sfx.chime();
      dispatch({ type: "award", stars: 1, activity: "colour-tints" });
      toast("⭐ You explored tints, tones and shades!");
    }
  }

  return (
    <Shell title="Tints & Shades 🌗" subtitle="Make a colour lighter, duller or darker" onBack={onBack} wide>
      {/* Base colour picker */}
      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {BASES.map((b, i) => (
          <button key={b.name} onClick={() => { setBaseIdx(i); sfx.tap(); }}
            aria-label={`Start from ${b.name}`} aria-pressed={i === baseIdx}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-bold
              ${i === baseIdx ? "ring-4 ring-tint" : ""}`}
            style={{ background: toHex(mixPaint(b.drops)), color: readableInk(mixPaint(b.drops)) }}>
            {b.name}
          </button>
        ))}
      </div>

      {rows.map(row => (
        <div key={row.word} className="glass mb-4 rounded-[1.75rem] p-5">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <p className="text-lg font-bold">{row.word}</p>
            <p className="text-sm text-ink-2">{row.label}</p>
          </div>
          <p className="mb-3 text-sm text-ink-2">{row.blurb}</p>
          <div className="flex gap-2">
            {/* pure base at one end so the change is obvious */}
            <button onClick={() => tap(row.word, row.blurb, base)}
              aria-label={`${BASES[baseIdx].name}, the pure colour`}
              className="h-16 flex-1 rounded-2xl ring-2 ring-ink/10"
              style={{ background: toHex(base) }} />
            {row.swatches.map((c, i) => (
              <button key={i} onClick={() => tap(row.word, row.blurb, c)}
                aria-label={`${nameOf(c)}, a ${row.word.toLowerCase()} of ${BASES[baseIdx].name}`}
                className="h-16 flex-1 rounded-2xl ring-2 ring-ink/10"
                style={{ background: toHex(c) }} />
            ))}
          </div>
        </div>
      ))}

      <p className="text-center text-sm text-ink-2">Tap any square to hear its name.</p>
    </Shell>
  );
}
