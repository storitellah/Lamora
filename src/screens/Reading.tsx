/**
 * Reading & Writing — phonics, letter tracing (writing practice on a
 * canvas), sight words and read-along stories.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Eraser, Check, ChevronRight, ChevronLeft, BookOpen, Pencil, Ear, Eye } from "lucide-react";
import { Shell, Tile, Btn, toast, Confetti } from "../components/UI";
import { Quiz, QuizQuestion } from "../components/Quiz";
import { sfx, speak, haptic } from "../lib/audio";
import { useStore } from "../lib/store";
import { PHONICS, SIGHT_WORDS, STORIES, PICTURE_WORDS, Story } from "../data/content";

type Mode =
  | { name: "menu" }
  | { name: "phonics" }
  | { name: "trace" }
  | { name: "sight" }
  | { name: "stories" }
  | { name: "story"; story: Story };

export default function Reading({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<Mode>({ name: "menu" });
  const back = () => setMode({ name: "menu" });

  switch (mode.name) {
    case "phonics": return <PhonicsQuiz onBack={back} />;
    case "trace": return <Tracing onBack={back} />;
    case "sight": return <SightWords onBack={back} />;
    case "stories":
      return (
        <Shell title="Stories 📖" subtitle="Pick a story — I can read it to you!" onBack={back}>
          <div className="grid grid-cols-2 gap-4">
            {STORIES.map(s => (
              <Tile key={s.id} emoji={s.emoji} label={s.title} sub={s.theme}
                onClick={() => setMode({ name: "story", story: s })} />
            ))}
          </div>
        </Shell>
      );
    case "story": return <StoryReader story={mode.story} onBack={() => setMode({ name: "stories" })} />;
    default:
      return (
        <Shell title="Reading & Writing" subtitle="Letters, sounds, words and stories" onBack={onExit}>
          <div className="grid grid-cols-2 gap-4">
            <Tile icon={<Ear className="text-tint" />} label="Phonics" sub="Letter sounds" onClick={() => setMode({ name: "phonics" })} />
            <Tile icon={<Pencil className="text-coral" />} label="Letter Tracing" sub="Practise writing" onClick={() => setMode({ name: "trace" })} />
            <Tile icon={<Eye className="text-mint" />} label="Sight Words" sub="Words to know" onClick={() => setMode({ name: "sight" })} />
            <Tile icon={<BookOpen className="text-sun" />} label="Stories" sub="Read along" onClick={() => setMode({ name: "stories" })} />
          </div>
        </Shell>
      );
  }
}

/* ---------------- Phonics quiz ---------------- */

function PhonicsQuiz({ onBack }: { onBack: () => void }) {
  const { level } = useStore();
  const questions = useMemo<QuizQuestion[]>(() => {
    const pool = level === 1 ? PHONICS.slice(0, 13) : PHONICS;
    const qs: QuizQuestion[] = [];
    const used = new Set<string>();
    while (qs.length < 5) {
      const item = pool[Math.floor(Math.random() * pool.length)];
      if (used.has(item.letter)) continue;
      used.add(item.letter);
      const opts = new Set([item.letter]);
      while (opts.size < (level === 1 ? 3 : 4))
        opts.add(pool[Math.floor(Math.random() * pool.length)].letter);
      qs.push({
        prompt: `Which letter starts “${item.word}”?`,
        speakText: `${item.word}. ${item.sound}. Which letter starts ${item.word}?`,
        visual: <span aria-hidden>{item.emoji}</span>,
        choices: [...opts],
        answer: item.letter,
        hint: `Say it slowly: ${item.word.split("").join(" – ")}`,
        explain: `${item.word} starts with ${item.letter}!`
      });
    }
    return qs;
  }, [level]);
  return <Quiz title="Phonics 🗣️" activity="reading-phonics" questions={questions} onBack={onBack} />;
}

/* ---------------- Letter tracing ---------------- */

/**
 * Writing practice: a large guide letter is painted on the canvas and the
 * child traces over it. Coverage is measured by sampling the guide's
 * pixels and checking how many have been painted over — a friendly,
 * forgiving threshold (55%) counts as done. No strokes are stored.
 */
function Tracing({ onBack }: { onBack: () => void }) {
  const { dispatch } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guidePts = useRef<[number, number][]>([]);
  const drawing = useRef(false);
  const last = useRef<[number, number] | null>(null);
  const [idx, setIdx] = useState(0);
  const [coverage, setCoverage] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const item = PHONICS[idx % PHONICS.length];

  const SIZE = 420; // logical canvas size; CSS scales it responsively

  // (Re)paint the guide letter and collect sample points along its shape.
  useEffect(() => {
    const c = canvasRef.current!;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, SIZE, SIZE);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, SIZE, SIZE);
    g.font = `bold ${SIZE * 0.72}px -apple-system, "SF Pro Rounded", "Segoe UI", Roboto, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    // Dashed outline guide the child writes over
    g.strokeStyle = "#c9c9ee";
    g.lineWidth = 3;
    g.setLineDash([10, 8]);
    g.strokeText(item.letter, SIZE / 2, SIZE / 2 + 12);
    g.setLineDash([]);
    // Sample the letter's filled area on an offscreen canvas → coverage points
    const off = document.createElement("canvas");
    off.width = off.height = SIZE;
    const og = off.getContext("2d")!;
    og.font = g.font;
    og.textAlign = "center";
    og.textBaseline = "middle";
    og.fillStyle = "#000";
    og.fillText(item.letter, SIZE / 2, SIZE / 2 + 12);
    const data = og.getImageData(0, 0, SIZE, SIZE).data;
    const pts: [number, number][] = [];
    for (let y = 0; y < SIZE; y += 10)
      for (let x = 0; x < SIZE; x += 10)
        if (data[(y * SIZE + x) * 4 + 3] > 100) pts.push([x, y]);
    guidePts.current = pts;
    setCoverage(0);
    speak(`Trace the letter ${item.letter}. ${item.sound}!`);
  }, [idx, item]);

  function pos(e: React.PointerEvent): [number, number] {
    const r = canvasRef.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE];
  }

  function measure() {
    const g = canvasRef.current!.getContext("2d")!;
    const img = g.getImageData(0, 0, SIZE, SIZE).data;
    let hit = 0;
    for (const [x, y] of guidePts.current) {
      const i = (y * SIZE + x) * 4;
      // Our ink is indigo (91,91,214) — detect any strongly-blue dark pixel.
      if (img[i] < 160 && img[i + 2] > 150) hit++;
    }
    const pct = guidePts.current.length ? hit / guidePts.current.length : 0;
    setCoverage(pct);
    return pct;
  }

  function stroke(e: React.PointerEvent) {
    if (!drawing.current) return;
    const g = canvasRef.current!.getContext("2d")!;
    const [x, y] = pos(e);
    g.strokeStyle = "#5b5bd6";
    g.lineWidth = 26;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    const l = last.current ?? [x, y];
    g.moveTo(l[0], l[1]);
    g.lineTo(x, y);
    g.stroke();
    last.current = [x, y];
  }

  function done() {
    const pct = measure();
    if (pct >= 0.55) {
      sfx.win(); haptic(30);
      dispatch({ type: "award", stars: 1, activity: "reading-trace" });
      setCelebrate(true);
      speak(`Beautiful ${item.letter}! You earned a star!`);
      setTimeout(() => { setCelebrate(false); setIdx(i => i + 1); }, 1600);
    } else {
      sfx.wrong();
      toast("Almost! Trace along the dotted letter ✏️");
      speak("Almost! Try to cover the whole dotted letter.");
    }
  }

  return (
    <Shell title={`Trace the letter ${item.letter}`} subtitle={`${item.emoji}  ${item.sound}`} onBack={onBack}>
      {celebrate && <Confetti />}
      <div className="glass mx-auto max-w-md overflow-hidden rounded-[1.75rem] p-2">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          role="img"
          aria-label={`Tracing area for the letter ${item.letter}. Draw over the dotted letter with your finger.`}
          className="draw-surface block w-full rounded-3xl"
          onPointerDown={e => {
            (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
            drawing.current = true;
            last.current = pos(e);
            stroke(e);
          }}
          onPointerMove={stroke}
          onPointerUp={() => { drawing.current = false; last.current = null; measure(); }}
          onPointerCancel={() => { drawing.current = false; last.current = null; }}
        />
      </div>
      {/* Live progress bar keeps effort visible without pass/fail pressure */}
      <div className="mx-auto mt-4 max-w-md">
        <div className="h-3 overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-tint to-sky"
            animate={{ width: `${Math.min(100, Math.round(coverage * 180))}%` }}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Btn kind="soft" onClick={() => speak(item.sound)} ariaLabel="Hear the letter sound again">
          <Volume2 size={20} aria-hidden /> Hear it
        </Btn>
        <Btn kind="soft" onClick={() => { setCoverage(0); repaint(canvasRef, item.letter, SIZE); }}>
          <Eraser size={20} aria-hidden /> Start over
        </Btn>
        <Btn kind="good" onClick={done}><Check size={20} aria-hidden /> I did it!</Btn>
        <Btn kind="ghost" onClick={() => setIdx(i => i + 1)}>Next letter <ChevronRight size={18} aria-hidden /></Btn>
      </div>
    </Shell>
  );
}

/** Clear the canvas back to the dotted guide (used by Start over). */
function repaint(ref: React.RefObject<HTMLCanvasElement | null>, letter: string, SIZE: number) {
  const c = ref.current;
  if (!c) return;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, SIZE, SIZE);
  g.font = `bold ${SIZE * 0.72}px -apple-system, "SF Pro Rounded", "Segoe UI", Roboto, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.strokeStyle = "#c9c9ee";
  g.lineWidth = 3;
  g.setLineDash([10, 8]);
  g.strokeText(letter, SIZE / 2, SIZE / 2 + 12);
  g.setLineDash([]);
}

/* ---------------- Sight words ---------------- */

function SightWords({ onBack }: { onBack: () => void }) {
  const { level } = useStore();
  const questions = useMemo<QuizQuestion[]>(() => {
    const pool = SIGHT_WORDS[level];
    const qs: QuizQuestion[] = [];
    const used = new Set<string>();
    while (qs.length < 5 && used.size < pool.length) {
      const w = pool[Math.floor(Math.random() * pool.length)];
      if (used.has(w)) continue;
      used.add(w);
      const opts = new Set([w]);
      while (opts.size < 4) opts.add(pool[Math.floor(Math.random() * pool.length)]);
      qs.push({
        prompt: `Tap the word “${w}”`,
        speakText: `Find the word: ${w}`,
        choices: [...opts],
        answer: w,
        hint: `It starts with the letter ${w[0]}.`,
        explain: `That says “${w}”. Great reading!`
      });
    }
    return qs;
  }, [level]);
  return <Quiz title="Sight Words 👀" activity="reading-sight" questions={questions} onBack={onBack} />;
}

/* ---------------- Read-along story ---------------- */

function StoryReader({ story, onBack }: { story: Story; onBack: () => void }) {
  const [page, setPage] = useState(0);
  const [quiz, setQuiz] = useState(false);
  const p = story.pages[page];

  useEffect(() => { speak(p.text); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (quiz) {
    return (
      <Quiz
        title={`${story.emoji} Story quiz`}
        activity={`story-${story.id}`}
        maxStars={2}
        questions={[{
          prompt: story.quiz.q,
          visual: <span aria-hidden>{story.emoji}</span>,
          choices: story.quiz.opts,
          answer: story.quiz.a,
          hint: "Think back to the story…",
          explain: story.lesson
        }]}
        onBack={onBack}
        onAgain={() => { setQuiz(false); setPage(0); }}
        againLabel="Read again"
      />
    );
  }

  return (
    <Shell title={`${story.emoji} ${story.title}`} onBack={onBack}>
      <motion.div
        key={page}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass rounded-[1.75rem] p-7 text-center"
      >
        <div className="text-6xl" role="img" aria-label="Story picture">{p.art}</div>
        <p className="mt-4 text-xl leading-relaxed">{p.text}</p>
        <Btn kind="ghost" onClick={() => speak(p.text)} ariaLabel="Read this page aloud" className="mt-2">
          <Volume2 size={20} aria-hidden /> Read to me
        </Btn>
      </motion.div>
      <div className="mt-5 flex items-center justify-center gap-3">
        <Btn kind="soft" disabled={page === 0} onClick={() => setPage(p0 => p0 - 1)} ariaLabel="Previous page">
          <ChevronLeft aria-hidden />
        </Btn>
        <span className="text-ink-2">{page + 1} / {story.pages.length}</span>
        {page < story.pages.length - 1
          ? <Btn onClick={() => setPage(p0 => p0 + 1)} ariaLabel="Next page"><ChevronRight aria-hidden /></Btn>
          : <Btn kind="good" onClick={() => setQuiz(true)}>⭐ Story quiz</Btn>}
      </div>
    </Shell>
  );
}
