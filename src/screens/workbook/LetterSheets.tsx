/**
 * Letter activity sheets:
 *   FirstLetter  — look at a picture, then WRITE its first letter (tracing)
 *                  or TAP it, depending on the stage.
 *   FunLetters   — match capital to small letters (memory-pair style).
 *   CompleteWord — look at a picture and fill the missing letters.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Eraser, ChevronRight, PenLine, Hand } from "lucide-react";
import { Shell, Btn, Confetti, toast } from "../../components/UI";
import TraceSheet from "../../components/TraceSheet";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";
import { PIC_WORDS, SHORT_WORDS, PicWord } from "../../data/workbook";

const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

/* ---------------- First letter of the picture ---------------- */

export function FirstLetter({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  // Little ones tap the letter; from PP2 upward they write it.
  const [mode, setMode] = useState<"tap" | "write">(level === 1 ? "tap" : "write");
  const [item, setItem] = useState<PicWord>(() => pick(PIC_WORDS));
  const [resetKey, setResetKey] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  const answer = item.word[0].toUpperCase();
  const options = useMemo(() => {
    const set = new Set([answer]);
    while (set.size < (level === 1 ? 3 : 4)) set.add(pick(ABC));
    return [...set].sort(() => Math.random() - 0.5);
  }, [item, level, answer]);

  function win() {
    sfx.win(); haptic(30);
    dispatch({ type: "award", stars: 1, activity: "wb-firstletter" });
    setCelebrate(true);
    speak(`Yes! ${item.word} starts with ${answer}.`);
    setTimeout(() => {
      setCelebrate(false);
      setItem(pick(PIC_WORDS));
      setPicked(null);
      setResetKey(k => k + 1);
    }, 1600);
  }

  return (
    <Shell
      title="What letter does it start with?"
      subtitle={mode === "write" ? `Write the first letter of “${item.word}”` : `Tap the first letter of “${item.word}”`}
      onBack={onBack}
    >
      {celebrate && <Confetti />}

      <div className="glass mb-4 rounded-[1.75rem] p-6 text-center">
        <div className="text-7xl" aria-hidden>{item.emoji}</div>
        <p className="mt-2 text-2xl font-bold">
          {item.word}
          <button onClick={() => speak(item.word)} aria-label={`Hear the word ${item.word}`}
            className="ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full align-middle text-tint">
            <Volume2 aria-hidden />
          </button>
        </p>
      </div>

      {/* Mode switch — parents/teachers can pick tapping or writing */}
      <div className="mb-4 flex justify-center gap-2">
        <Btn kind={mode === "tap" ? "primary" : "soft"} className="!min-h-10 !px-5 !py-2 text-sm"
          onClick={() => setMode("tap")}><Hand size={16} aria-hidden /> Tap it</Btn>
        <Btn kind={mode === "write" ? "primary" : "soft"} className="!min-h-10 !px-5 !py-2 text-sm"
          onClick={() => { setMode("write"); setResetKey(k => k + 1); }}><PenLine size={16} aria-hidden /> Write it</Btn>
      </div>

      {mode === "tap" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {options.map(o => (
            <motion.button
              key={o}
              whileTap={{ scale: 0.94 }}
              animate={picked === o && o !== answer ? { x: [0, -8, 8, -5, 5, 0] } : {}}
              onClick={() => {
                setPicked(o);
                if (o === answer) win();
                else { sfx.wrong(); speak(`Listen again. ${item.word}.`); toast("Listen to the first sound 👂"); }
              }}
              className={`glass min-h-20 rounded-3xl text-3xl font-extrabold
                ${picked === o && o === answer ? "!bg-mint !text-white" : ""}
                ${picked === o && o !== answer ? "!bg-coral !text-white" : ""}`}
              aria-label={`Letter ${o}`}
            >
              {o}
            </motion.button>
          ))}
        </div>
      ) : (
        <>
          <TraceSheet
            guide={{ kind: "glyph", char: answer }}
            onComplete={win}
            threshold={0.5}
            resetKey={resetKey}
            label={`Write the letter ${answer}`}
          />
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Btn kind="soft" onClick={() => setResetKey(k => k + 1)}><Eraser size={20} aria-hidden /> Start over</Btn>
            <Btn kind="ghost" onClick={() => { setItem(pick(PIC_WORDS)); setResetKey(k => k + 1); }}>
              New picture <ChevronRight size={18} aria-hidden />
            </Btn>
          </div>
        </>
      )}
    </Shell>
  );
}

/* ---------------- Fun with letters: capital ↔ small matching ---------------- */

export function FunLetters({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const pairCount = level === 1 ? 4 : 6;

  const [round, setRound] = useState(0);
  const deck = useMemo(() => {
    const letters = [...ABC].sort(() => Math.random() - 0.5).slice(0, pairCount);
    const cards = letters.flatMap(l => [
      { id: l + "-U", letter: l, face: l },
      { id: l + "-L", letter: l, face: l.toLowerCase() }
    ]);
    return cards.sort(() => Math.random() - 0.5);
  }, [pairCount, round]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [celebrate, setCelebrate] = useState(false);

  function tap(i: number) {
    if (flipped.length === 2 || flipped.includes(i) || matched.has(deck[i].id)) return;
    sfx.flip();
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next.map(n => deck[n]);
      if (a.letter === b.letter && a.id !== b.id) {
        sfx.correct(); haptic(15);
        speak(`${a.letter} and ${a.letter.toLowerCase()} — a matching pair!`);
        const nm = new Set(matched); nm.add(a.id); nm.add(b.id);
        setTimeout(() => {
          setMatched(nm); setFlipped([]);
          if (nm.size === deck.length) {
            sfx.win();
            dispatch({ type: "award", stars: 2, activity: "wb-funletters" });
            setCelebrate(true);
            setTimeout(() => { setCelebrate(false); setRound(r => r + 1); setMatched(new Set()); }, 2000);
          }
        }, 350);
      } else {
        setTimeout(() => setFlipped([]), 850);
      }
    }
  }

  return (
    <Shell title="Fun with Letters 🔠" subtitle="Match each BIG letter to its small letter" onBack={onBack}>
      {celebrate && <Confetti />}
      <div className="mx-auto grid w-fit grid-cols-4 gap-2.5">
        {deck.map((c, i) => {
          const up = flipped.includes(i) || matched.has(c.id);
          return (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => tap(i)}
              aria-label={up ? `Letter ${c.face}` : "Face-down letter card"}
              className="h-18 w-18 [perspective:600px] sm:h-20 sm:w-20"
            >
              <motion.div animate={{ rotateY: up ? 180 : 0 }} transition={{ duration: 0.35 }}
                className="relative h-full w-full [transform-style:preserve-3d]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-tint to-sky shadow-sm [backface-visibility:hidden]" />
                <div className={`absolute inset-0 grid place-items-center rounded-2xl text-3xl font-extrabold shadow-sm
                  [backface-visibility:hidden] [transform:rotateY(180deg)]
                  ${matched.has(c.id) ? "bg-mint text-white" : "bg-white"}`}>
                  {c.face}
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-5 text-center text-ink-2">
        {matched.size / 2} of {deck.length / 2} pairs found
      </p>
    </Shell>
  );
}

/* ---------------- Complete the word ---------------- */

export function CompleteWord({ onBack }: { onBack: () => void }) {
  const { dispatch, level } = useStore();
  const pool = level === 1 ? SHORT_WORDS : PIC_WORDS.filter(w => !w.word.includes("-"));

  const [item, setItem] = useState<PicWord>(() => pick(pool));
  const [celebrate, setCelebrate] = useState(false);

  // Hide 1 letter for the youngest, 2 from Grade 1 up.
  const blanks = useMemo(() => {
    const n = level === 1 ? 1 : Math.min(2, item.word.length - 1);
    const idxs = new Set<number>();
    while (idxs.size < n) idxs.add(Math.floor(Math.random() * item.word.length));
    return idxs;
  }, [item, level]);

  const [filled, setFilled] = useState<Record<number, string>>({});
  const remaining = [...blanks].filter(i => !filled[i]);

  // Letter bank: the missing letters plus a few decoys.
  const bank = useMemo(() => {
    const need = [...blanks].map(i => item.word[i].toUpperCase());
    const set = new Set(need);
    while (set.size < need.length + (level === 1 ? 2 : 3)) set.add(pick(ABC));
    return [...set].sort(() => Math.random() - 0.5);
  }, [item, blanks, level]);

  function tapLetter(L: string) {
    const target = remaining[0];
    if (target === undefined) return;
    if (item.word[target].toUpperCase() === L) {
      sfx.correct(); haptic(12);
      const nf = { ...filled, [target]: L };
      setFilled(nf);
      if ([...blanks].every(i => nf[i])) {
        sfx.win();
        dispatch({ type: "award", stars: 1, activity: "wb-completeword" });
        speak(`${item.word}! Well done.`);
        setCelebrate(true);
        setTimeout(() => {
          setCelebrate(false);
          setItem(pick(pool));
          setFilled({});
        }, 1700);
      }
    } else {
      sfx.wrong();
      speak(`Listen: ${item.word}.`);
      toast("Say the word slowly and listen 👂");
    }
  }

  return (
    <Shell title="Complete the word" subtitle="Look at the picture, then fill in the missing letters" onBack={onBack}>
      {celebrate && <Confetti />}
      <div className="glass rounded-[1.75rem] p-6 text-center">
        <div className="text-7xl" aria-hidden>{item.emoji}</div>
        <div className="mt-5 flex flex-wrap justify-center gap-2"
          aria-label={`The word ${item.word} with missing letters`}>
          {item.word.split("").map((ch, i) => {
            const isBlank = blanks.has(i);
            const shown = isBlank ? filled[i] : ch.toUpperCase();
            return (
              <div key={i}
                className={`grid h-14 w-12 place-items-center rounded-2xl text-2xl font-extrabold
                  ${!isBlank ? "bg-white/70 text-ink"
                    : shown ? "bg-mint text-white"
                    : "border-2 border-dashed border-ink/25 bg-white/40"}`}>
                {shown ?? ""}
              </div>
            );
          })}
        </div>
        <Btn kind="ghost" className="mt-3" onClick={() => speak(item.word)}>
          <Volume2 size={18} aria-hidden /> Hear the word
        </Btn>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {bank.map(L => (
          <motion.button key={L} whileTap={{ scale: 0.9 }} onClick={() => tapLetter(L)}
            aria-label={`Letter ${L}`}
            className="glass grid h-14 w-12 place-items-center rounded-2xl text-2xl font-extrabold">
            {L}
          </motion.button>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Btn kind="ghost" onClick={() => { setItem(pick(pool)); setFilled({}); }}>
          New picture <ChevronRight size={18} aria-hidden />
        </Btn>
      </div>
    </Shell>
  );
}
