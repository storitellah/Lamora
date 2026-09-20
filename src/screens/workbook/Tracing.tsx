/**
 * Patterns & Handwriting workbooks.
 *
 * Patterns  — pre-writing strokes (lines, curves, zig-zags, loops). These are
 *             the Cambridge Early Years "controlled marks" objectives and the
 *             physical foundation for letter formation.
 * Handwriting — letters (capital + lower case), numerals and short words,
 *             matching the Cambridge Primary "Handwriting & presentation"
 *             sub-strand from Stage 1 onwards.
 */
import React, { useMemo, useState } from "react";
import { Volume2, Eraser, Check, ChevronRight } from "lucide-react";
import { Shell, Btn, Confetti, toast } from "../../components/UI";
import TraceSheet, { Guide } from "../../components/TraceSheet";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";
import { PATTERNS } from "../../data/workbook";
import { PHONICS } from "../../data/content";

/* ---------------- Pre-writing patterns ---------------- */

export function PatternsWorkbook({ onBack }: { onBack: () => void }) {
  const { dispatch } = useStore();
  const [i, setI] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const sheet = PATTERNS[i % PATTERNS.length];

  function complete() {
    sfx.win(); haptic(30);
    dispatch({ type: "award", stars: 1, activity: "wb-patterns" });
    setCelebrate(true);
    speak(`Lovely ${sheet.name}! You earned a star.`);
    setTimeout(() => { setCelebrate(false); setI(n => n + 1); setResetKey(k => k + 1); }, 1500);
  }

  return (
    <Shell title={`${sheet.emoji} ${sheet.name}`} subtitle={sheet.hint} onBack={onBack}>
      {celebrate && <Confetti />}
      <TraceSheet
        guide={{ kind: "path", d: sheet.d } as Guide}
        onComplete={complete}
        threshold={0.45}
        penWidth={22}
        resetKey={resetKey}
        label={`Trace the ${sheet.name} pattern with your finger`}
      />
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Btn kind="soft" onClick={() => speak(sheet.hint)}><Volume2 size={20} aria-hidden /> Hear it</Btn>
        <Btn kind="soft" onClick={() => setResetKey(k => k + 1)}><Eraser size={20} aria-hidden /> Start over</Btn>
        <Btn kind="ghost" onClick={() => { setI(n => n + 1); setResetKey(k => k + 1); }}>
          Next pattern <ChevronRight size={18} aria-hidden />
        </Btn>
      </div>
      <p className="mt-5 text-center text-sm text-ink-2">
        Sheet {(i % PATTERNS.length) + 1} of {PATTERNS.length} · trace over the dots, any direction is fine
      </p>
    </Shell>
  );
}

/* ---------------- Handwriting ---------------- */

type Mode = "capitals" | "lower" | "numbers" | "words";

const MODES: { id: Mode; name: string; emoji: string }[] = [
  { id: "capitals", name: "Capital letters", emoji: "🔠" },
  { id: "lower", name: "Small letters", emoji: "🔡" },
  { id: "numbers", name: "Numbers", emoji: "🔢" },
  { id: "words", name: "Short words", emoji: "📝" }
];

const WORDS = ["cat", "dog", "sun", "hat", "bus", "pen", "cup", "fish", "star", "tree"];

export function HandwritingWorkbook({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const [mode, setMode] = useState<Mode | null>(null);
  const [i, setI] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  const items = useMemo(() => {
    if (mode === "capitals") return PHONICS.map(p => p.letter);
    if (mode === "lower") return PHONICS.map(p => p.letter.toLowerCase());
    if (mode === "numbers") return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    if (mode === "words") return WORDS;
    return [];
  }, [mode]);

  if (!mode) {
    return (
      <Shell title="Handwriting ✍️" subtitle="What shall we practise writing today?" onBack={onBack}>
        <div className="grid grid-cols-2 gap-4">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { sfx.tap(); setMode(m.id); setI(0); setResetKey(k => k + 1); }}
              className="glass flex min-h-32 flex-col items-center justify-center gap-2 rounded-[1.75rem] p-5"
            >
              <span className="text-4xl" aria-hidden>{m.emoji}</span>
              <span className="font-bold">{m.name}</span>
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  const item = items[i % items.length];
  // A word is traced as a whole; letters/numbers get the big single glyph.
  const isWord = item.length > 1;
  const phonic = PHONICS.find(p => p.letter.toLowerCase() === item.toLowerCase());

  function complete() {
    sfx.win(); haptic(30);
    dispatch({ type: "award", stars: 1, activity: `wb-handwriting-${mode}` });
    setCelebrate(true);
    speak(`Beautiful ${isWord ? item : "letter " + item}! You earned a star.`);
    setTimeout(() => { setCelebrate(false); setI(n => n + 1); setResetKey(k => k + 1); }, 1500);
  }

  return (
    <Shell
      title={isWord ? `Write “${item}”` : `Write ${item}`}
      subtitle={phonic ? `${phonic.emoji}  ${phonic.sound}` : "Trace over the dotted shape"}
      onBack={() => setMode(null)}
    >
      {celebrate && <Confetti />}
      <TraceSheet
        guide={{ kind: "glyph", char: item }}
        onComplete={complete}
        // Words are wider and thinner on screen, so ask for a little less.
        threshold={isWord ? 0.38 : 0.5}
        penWidth={isWord ? 16 : level === 1 ? 30 : 24}
        resetKey={resetKey}
        label={`Tracing area for ${item}. Draw over the dotted shape.`}
      />
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Btn kind="soft" onClick={() => speak(phonic ? phonic.sound : item)}>
          <Volume2 size={20} aria-hidden /> Hear it
        </Btn>
        <Btn kind="soft" onClick={() => setResetKey(k => k + 1)}><Eraser size={20} aria-hidden /> Start over</Btn>
        <Btn kind="good" onClick={() => {
          // A gentle "I'm done" for children whose stroke didn't quite register.
          toast("Nice writing! ⭐");
          complete();
        }}><Check size={20} aria-hidden /> I did it!</Btn>
        <Btn kind="ghost" onClick={() => { setI(n => n + 1); setResetKey(k => k + 1); }}>
          Next <ChevronRight size={18} aria-hidden />
        </Btn>
      </div>
      <p className="mt-5 text-center text-sm text-ink-2">
        {(i % items.length) + 1} of {items.length}
      </p>
    </Shell>
  );
}
