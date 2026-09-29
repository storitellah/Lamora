/**
 * Reading Gym — a levelled reading ladder for ages 5–10.
 *
 * Six drills, unlocked in order, each ending in a star. The pedagogy is
 * deliberately systematic: sounds before blending, blending before families,
 * families before whole-word sight reading, and only then sentences and a
 * short passage with comprehension.
 *
 * Everything can be heard on demand (tap 🔊), because a child who cannot yet
 * decode a word still needs a way in.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Lock, ChevronRight, Check } from "lucide-react";
import { Shell, Btn, Confetti, toast } from "../components/UI";
import { sfx, speak, haptic } from "../lib/audio";
import { useStore } from "../lib/store";
import {
  READING_DRILLS, LETTER_SOUNDS, CVC_WORDS, WORD_FAMILIES,
  SIGHT_BANDS, SENTENCES, PASSAGES
} from "../data/reading";

const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(a: T[]): T => a[rnd(a.length)];
const shuffle = <T,>(a: T[]): T[] => a.slice().sort(() => Math.random() - 0.5);

export default function ReadingGym({ onExit }: { onExit: () => void }) {
  const { profile } = useStore();
  const [drill, setDrill] = useState<string | null>(null);
  const unlocked = profile?.readingLevel ?? 1;
  const back = () => setDrill(null);

  if (drill === "sounds") return <LetterSounds onBack={back} index={0} />;
  if (drill === "blend") return <SoundItOut onBack={back} index={1} />;
  if (drill === "families") return <Families onBack={back} index={2} />;
  if (drill === "sight") return <SightSpeed onBack={back} index={3} />;
  if (drill === "sentence") return <Sentences onBack={back} index={4} />;
  if (drill === "passage") return <StoryReading onBack={back} index={5} />;

  return (
    <Shell title="Reading Gym 💪📖" subtitle="Train your reading, one step at a time" onBack={onExit} wide>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {READING_DRILLS.map((d, i) => {
          const locked = i + 1 > unlocked;
          return (
            <button
              key={d.id}
              onClick={() => {
                if (locked) { toast("Finish the step before this one first 🔒"); return; }
                sfx.tap(); setDrill(d.id);
              }}
              aria-label={`${d.name}. ${d.sub}${locked ? ". Locked" : ""}`}
              className={`glass flex min-h-36 flex-col items-center justify-center gap-2 rounded-[1.75rem] p-5 text-center
                ${locked ? "opacity-50" : ""}`}
            >
              <span className="text-4xl" aria-hidden>{locked ? <Lock className="text-ink-2" /> : d.emoji}</span>
              <span className="font-bold leading-tight">{d.name}</span>
              <span className="text-sm text-ink-2">{d.sub}</span>
              <span className="rounded-full bg-tint/10 px-2 py-0.5 text-xs font-bold text-tint">
                Step {i + 1} · {d.ages}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-ink-2">
        Steps unlock one at a time so reading builds in the right order — sounds first, stories last.
      </p>
    </Shell>
  );
}

/** Shared completion handling: award a star and unlock the next step. */
function useDrillFinish(index: number, activity: string, stars = 2) {
  const { dispatch } = useStore();
  const [celebrate, setCelebrate] = useState(false);
  const done = useRef(false);
  function finish(msg: string, after?: () => void) {
    if (done.current) return;
    done.current = true;
    sfx.win();
    dispatch({ type: "award", stars, activity });
    dispatch({ type: "readingCleared", levelIndex: index });
    setCelebrate(true);
    speak(msg);
    setTimeout(() => { setCelebrate(false); done.current = false; after?.(); }, 2000);
  }
  return { celebrate, finish };
}

/* ---------------- Step 1: Letter sounds ---------------- */

function LetterSounds({ onBack, index }: { onBack: () => void; index: number }) {
  const { level } = useStore();
  const TOTAL = 6;
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const { celebrate, finish } = useDrillFinish(index, "reading-sounds");

  const q = useMemo(() => {
    const item = pick(LETTER_SOUNDS);
    const opts = new Set([item.letter]);
    while (opts.size < (level === 1 ? 3 : 4)) opts.add(pick(LETTER_SOUNDS).letter);
    return { item, opts: shuffle([...opts]) };
  }, [n, level]);

  useEffect(() => { speak(`Which letter says ${q.item.sound}?`); }, [q]);

  function choose(l: string) {
    setPicked(l);
    if (l === q.item.letter) {
      sfx.correct(); haptic(12);
      speak(`${q.item.letter} says ${q.item.sound}, like ${q.item.word}.`);
      setTimeout(() => {
        if (n + 1 >= TOTAL) finish("Super listening! Step one complete.", onBack);
        else { setN(n + 1); setPicked(null); }
      }, 1000);
    } else {
      sfx.wrong();
      speak(`Listen again. ${q.item.sound}.`);
      setTimeout(() => setPicked(null), 700);
    }
  }

  return (
    <Shell title="Letter Sounds 🔤" subtitle={`Which letter makes this sound? (${n + 1} of ${TOTAL})`} onBack={onBack}>
      {celebrate && <Confetti />}
      <div className="glass rounded-[1.75rem] p-8 text-center">
        <p className="text-5xl font-extrabold text-tint">“{q.item.sound}”</p>
        <Btn kind="ghost" className="mt-3" onClick={() => speak(q.item.sound)}>
          <Volume2 size={20} aria-hidden /> Hear it again
        </Btn>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {q.opts.map(l => (
          <motion.button key={l} whileTap={{ scale: 0.93 }} onClick={() => choose(l)}
            aria-label={`Letter ${l}`}
            className={`glass min-h-24 rounded-3xl text-4xl font-extrabold
              ${picked === l && l === q.item.letter ? "!bg-mint !text-white" : ""}
              ${picked === l && l !== q.item.letter ? "!bg-coral !text-white" : ""}`}>
            {l}
          </motion.button>
        ))}
      </div>
    </Shell>
  );
}

/* ---------------- Step 2: Sound it out (blending) ---------------- */

function SoundItOut({ onBack, index }: { onBack: () => void; index: number }) {
  const TOTAL = 5;
  const [n, setN] = useState(0);
  const [revealed, setRevealed] = useState(0);   // how many phonemes shown
  const [picked, setPicked] = useState<string | null>(null);
  const { celebrate, finish } = useDrillFinish(index, "reading-blend");

  const q = useMemo(() => {
    const item = pick(CVC_WORDS);
    const opts = new Set([item.word]);
    while (opts.size < 3) opts.add(pick(CVC_WORDS).word);
    return { item, opts: shuffle([...opts]) };
  }, [n]);

  useEffect(() => { setRevealed(0); setPicked(null); }, [q]);

  /** Say each sound in turn, then blend them. */
  function soundOut() {
    q.item.parts.forEach((p, i) => {
      setTimeout(() => { setRevealed(i + 1); speak(p); }, i * 750);
    });
    setTimeout(() => speak(q.item.word), q.item.parts.length * 750 + 250);
  }

  function choose(w: string) {
    setPicked(w);
    if (w === q.item.word) {
      sfx.correct(); haptic(12);
      speak(`${q.item.word}! Well blended.`);
      setTimeout(() => {
        if (n + 1 >= TOTAL) finish("Brilliant blending! Step two complete.", onBack);
        else setN(n + 1);
      }, 1000);
    } else {
      sfx.wrong();
      speak("Try sounding it out again.");
      setTimeout(() => setPicked(null), 700);
    }
  }

  return (
    <Shell title="Sound It Out 🗣️" subtitle={`Blend the sounds to read the word (${n + 1} of ${TOTAL})`} onBack={onBack}>
      {celebrate && <Confetti />}
      <div className="glass rounded-[1.75rem] p-7 text-center">
        <div className="flex justify-center gap-3">
          {q.item.parts.map((p, i) => (
            <motion.span key={i}
              animate={{ scale: revealed > i ? 1.1 : 1, opacity: revealed > i ? 1 : 0.28 }}
              className="grid h-20 w-16 place-items-center rounded-2xl bg-tint/10 text-4xl font-extrabold text-tint">
              {p}
            </motion.span>
          ))}
        </div>
        <Btn className="mt-5" onClick={soundOut}>
          <Volume2 size={20} aria-hidden /> Sound it out
        </Btn>
      </div>
      <p className="mt-5 text-center font-bold text-ink-2">Which word is it?</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {q.opts.map(w => (
          <motion.button key={w} whileTap={{ scale: 0.93 }} onClick={() => choose(w)}
            aria-label={`Word ${w}`}
            className={`glass min-h-20 rounded-3xl text-2xl font-extrabold
              ${picked === w && w === q.item.word ? "!bg-mint !text-white" : ""}
              ${picked === w && w !== q.item.word ? "!bg-coral !text-white" : ""}`}>
            {w}
          </motion.button>
        ))}
      </div>
    </Shell>
  );
}

/* ---------------- Step 3: Word families ---------------- */

function Families({ onBack, index }: { onBack: () => void; index: number }) {
  const TOTAL = 4;
  const [n, setN] = useState(0);
  const [found, setFound] = useState<Set<string>>(new Set());
  const { celebrate, finish } = useDrillFinish(index, "reading-families");

  const q = useMemo(() => {
    const fam = pick(WORD_FAMILIES);
    const others = shuffle(WORD_FAMILIES.filter(f => f.rime !== fam.rime))
      .flatMap(f => f.words).slice(0, 4);
    return { fam, tiles: shuffle([...fam.words, ...others]) };
  }, [n]);

  useEffect(() => { setFound(new Set()); speak(`Find all the words that end in ${q.fam.rime}`); }, [q]);

  function tap(w: string) {
    const belongs = q.fam.words.some(x => x.word === w);
    if (!belongs) { sfx.wrong(); toast(`${w} does not end in ${q.fam.rime}`); speak(`${w} does not end in ${q.fam.rime}`); return; }
    if (found.has(w)) return;
    sfx.correct(); haptic(10);
    speak(w);
    const nf = new Set(found); nf.add(w);
    setFound(nf);
    if (nf.size === q.fam.words.length) {
      setTimeout(() => {
        if (n + 1 >= TOTAL) finish("You know your word families! Step three complete.", onBack);
        else setN(n + 1);
      }, 800);
    }
  }

  return (
    <Shell title="Word Families 👨‍👩‍👧"
      subtitle={`Tap every word that ends in “${q.fam.rime}” (${n + 1} of ${TOTAL})`} onBack={onBack}>
      {celebrate && <Confetti />}
      <div className="glass rounded-[1.75rem] p-5 text-center">
        <p className="text-4xl font-extrabold text-tint">{q.fam.rime}</p>
        <p className="mt-1 text-ink-2">Found {found.size} of {q.fam.words.length}</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {q.tiles.map(t => (
          <motion.button key={t.word} whileTap={{ scale: 0.93 }} onClick={() => tap(t.word)}
            aria-label={`Word ${t.word}`}
            className={`glass flex min-h-24 flex-col items-center justify-center gap-1 rounded-3xl
              ${found.has(t.word) ? "!bg-mint !text-white" : ""}`}>
            <span className="text-2xl" aria-hidden>{t.emoji}</span>
            <span className="text-xl font-extrabold">{t.word}</span>
          </motion.button>
        ))}
      </div>
    </Shell>
  );
}

/* ---------------- Step 4: Sight word speed ---------------- */

function SightSpeed({ onBack, index }: { onBack: () => void; index: number }) {
  const { level } = useStore();
  const band = SIGHT_BANDS[Math.min(level, SIGHT_BANDS.length - 1)];
  const TOTAL = 8;
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const { celebrate, finish } = useDrillFinish(index, "reading-sight");

  const q = useMemo(() => {
    const target = pick(band);
    const opts = new Set([target]);
    while (opts.size < 4) opts.add(pick(band));
    return { target, opts: shuffle([...opts]) };
  }, [n, band]);

  useEffect(() => { speak(`Find the word: ${q.target}`); }, [q]);

  function choose(w: string) {
    setPicked(w);
    if (w === q.target) {
      sfx.correct(); haptic(10);
      setTimeout(() => {
        if (n + 1 >= TOTAL) finish("Speedy reading! Step four complete.", onBack);
        else { setN(n + 1); setPicked(null); }
      }, 550);
    } else {
      sfx.wrong();
      speak(`Look for ${q.target}. It starts with ${q.target[0]}.`);
      setTimeout(() => setPicked(null), 650);
    }
  }

  return (
    <Shell title="Sight Words ⚡" subtitle={`Find the word — as fast as you can! (${n + 1} of ${TOTAL})`} onBack={onBack}>
      {celebrate && <Confetti />}
      <div className="glass rounded-[1.75rem] p-8 text-center">
        <p className="text-5xl font-extrabold text-tint">{q.target}</p>
        <Btn kind="ghost" className="mt-3" onClick={() => speak(q.target)}>
          <Volume2 size={20} aria-hidden /> Hear it
        </Btn>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {q.opts.map(w => (
          <motion.button key={w} whileTap={{ scale: 0.93 }} onClick={() => choose(w)}
            aria-label={`Word ${w}`}
            className={`glass min-h-20 rounded-3xl text-2xl font-extrabold
              ${picked === w && w === q.target ? "!bg-mint !text-white" : ""}
              ${picked === w && w !== q.target ? "!bg-coral !text-white" : ""}`}>
            {w}
          </motion.button>
        ))}
      </div>
    </Shell>
  );
}

/* ---------------- Step 5: Sentences ---------------- */

function Sentences({ onBack, index }: { onBack: () => void; index: number }) {
  const TOTAL = 4;
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const { celebrate, finish } = useDrillFinish(index, "reading-sentence");
  const q = useMemo(() => pick(SENTENCES), [n]);

  function choose(o: string) {
    setPicked(o);
    if (o === q.a) {
      sfx.correct(); haptic(12);
      speak("That's right!");
      setTimeout(() => {
        if (n + 1 >= TOTAL) finish("Great reading! Step five complete.", onBack);
        else { setN(n + 1); setPicked(null); }
      }, 900);
    } else {
      sfx.wrong();
      speak("Read the sentence again.");
      setTimeout(() => setPicked(null), 700);
    }
  }

  return (
    <Shell title="Read the Sentence 📄" subtitle={`Read, then answer (${n + 1} of ${TOTAL})`} onBack={onBack}>
      {celebrate && <Confetti />}
      <div className="glass rounded-[1.75rem] p-7 text-center">
        <div className="text-5xl" aria-hidden>{q.emoji}</div>
        <p className="mt-4 text-2xl font-bold leading-relaxed">{q.text}</p>
        <Btn kind="ghost" className="mt-2" onClick={() => speak(q.text)}>
          <Volume2 size={20} aria-hidden /> Read it to me
        </Btn>
        <p className="mt-4 text-lg font-bold text-tint">{q.q}</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {q.opts.map(o => (
          <motion.button key={o} whileTap={{ scale: 0.95 }} onClick={() => choose(o)}
            aria-label={`Answer ${o}`}
            className={`glass min-h-20 rounded-3xl p-4 text-lg font-bold
              ${picked === o && o === q.a ? "!bg-mint !text-white" : ""}
              ${picked === o && o !== q.a ? "!bg-coral !text-white" : ""}`}>
            {o}
          </motion.button>
        ))}
      </div>
    </Shell>
  );
}

/* ---------------- Step 6: Story reading ---------------- */

function StoryReading({ onBack, index }: { onBack: () => void; index: number }) {
  const [story] = useState(() => pick(PASSAGES));
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [reading, setReading] = useState(true);
  const { celebrate, finish } = useDrillFinish(index, "reading-passage", 3);
  const q = story.questions[qi];

  function choose(o: string) {
    setPicked(o);
    if (o === q.a) {
      sfx.correct(); haptic(12);
      setTimeout(() => {
        if (qi + 1 >= story.questions.length) finish("You read a whole story! Reading Gym complete.", onBack);
        else { setQi(qi + 1); setPicked(null); }
      }, 900);
    } else {
      sfx.wrong();
      speak("Look back at the story.");
      setTimeout(() => setPicked(null), 700);
    }
  }

  if (reading) {
    return (
      <Shell title={`${story.emoji} ${story.title}`} subtitle="Read the story, then answer the questions" onBack={onBack}>
        <div className="glass rounded-[1.75rem] p-7">
          {story.lines.map((l, i) => (
            <p key={i} className="mb-2 text-xl leading-relaxed">{l}</p>
          ))}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Btn kind="soft" onClick={() => speak(story.lines.join(" "))}>
              <Volume2 size={20} aria-hidden /> Read it to me
            </Btn>
            <Btn kind="good" onClick={() => setReading(false)}>
              <Check size={18} aria-hidden /> I've read it
            </Btn>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title={`${story.emoji} ${story.title}`} subtitle={`Question ${qi + 1} of ${story.questions.length}`} onBack={onBack}>
      {celebrate && <Confetti />}
      <div className="glass rounded-[1.75rem] p-6 text-center">
        <p className="text-xl font-bold">{q.q}</p>
        <Btn kind="ghost" className="mt-2" onClick={() => setReading(true)}>
          Read the story again
        </Btn>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {q.opts.map(o => (
          <motion.button key={o} whileTap={{ scale: 0.95 }} onClick={() => choose(o)}
            aria-label={`Answer ${o}`}
            className={`glass min-h-20 rounded-3xl p-4 text-lg font-bold
              ${picked === o && o === q.a ? "!bg-mint !text-white" : ""}
              ${picked === o && o !== q.a ? "!bg-coral !text-white" : ""}`}>
            {o}
          </motion.button>
        ))}
      </div>
    </Shell>
  );
}
