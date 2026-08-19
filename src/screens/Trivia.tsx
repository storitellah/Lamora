/**
 * "Did You Know?" — swipeable flashcards of world curiosities, with an
 * optional mini-quiz after browsing a category.
 */
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Shell, Tile, Btn } from "../components/UI";
import { Quiz, QuizQuestion } from "../components/Quiz";
import { speak } from "../lib/audio";
import { TRIVIA, FactCategory } from "../data/content";

export default function Trivia({ onExit }: { onExit: () => void }) {
  const [cat, setCat] = useState<FactCategory | null>(null);
  const [quiz, setQuiz] = useState(false);

  if (cat && quiz) return <CategoryQuiz cat={cat} onBack={() => setQuiz(false)} />;
  if (cat) return <Cards cat={cat} onBack={() => setCat(null)} onQuiz={() => setQuiz(true)} />;

  return (
    <Shell title="Did You Know? 🌍" subtitle="Amazing true things about our world!" onBack={onExit}>
      <div className="grid grid-cols-2 gap-4">
        {TRIVIA.map(c => (
          <Tile key={c.id} emoji={c.emoji} label={c.name} sub={`${c.facts.length} cards`} onClick={() => setCat(c)} />
        ))}
      </div>
    </Shell>
  );
}

function Cards({ cat, onBack, onQuiz }: { cat: FactCategory; onBack: () => void; onQuiz: () => void }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const f = cat.facts[i];

  function go(d: number) {
    setDir(d);
    setI((i + d + cat.facts.length) % cat.facts.length);
  }

  return (
    <Shell title={`${cat.emoji} ${cat.name}`} subtitle={`Card ${i + 1} of ${cat.facts.length}`} onBack={onBack}>
      <div className="relative mx-auto max-w-md">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            initial={{ opacity: 0, x: 60 * dir, rotate: 3 * dir }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: -60 * dir, rotate: -3 * dir }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            // Swipe left/right to browse — natural on touch, ignored by mouse users
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) go(1);
              else if (info.offset.x > 70) go(-1);
            }}
            className="glass-heavy min-h-72 cursor-grab rounded-[2rem] p-8 text-center active:cursor-grabbing"
          >
            <div className="text-6xl" aria-hidden>{f.emoji}</div>
            <h2 className="mt-3 text-2xl font-extrabold">{f.title}</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink/90">{f.fact}</p>
            <Btn kind="ghost" onClick={() => speak(f.fact)} ariaLabel="Read this card aloud" className="mt-3">
              <Volume2 size={20} aria-hidden /> Read to me
            </Btn>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-5 flex items-center justify-center gap-3">
        <Btn kind="soft" onClick={() => go(-1)} ariaLabel="Previous card"><ChevronLeft aria-hidden /></Btn>
        <Btn kind="soft" onClick={() => go(1)} ariaLabel="Next card"><ChevronRight aria-hidden /></Btn>
        <Btn kind="good" onClick={onQuiz}><Sparkles size={18} aria-hidden /> Quiz me!</Btn>
      </div>
    </Shell>
  );
}

function CategoryQuiz({ cat, onBack }: { cat: FactCategory; onBack: () => void }) {
  const questions = useMemo<QuizQuestion[]>(() => {
    const withQuiz = cat.facts.filter(f => f.quiz);
    return withQuiz.slice(0, 4).map(f => ({
      prompt: f.quiz!.q,
      visual: <span aria-hidden>{f.emoji}</span>,
      choices: f.quiz!.opts,
      answer: f.quiz!.a,
      hint: "Think back to the cards you just read…",
      explain: f.fact
    }));
  }, [cat]);
  return (
    <Quiz
      title={`${cat.emoji} ${cat.name} quiz`}
      activity={`trivia-${cat.id}`}
      questions={questions}
      onBack={onBack}
    />
  );
}
