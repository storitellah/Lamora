/**
 * Colour Science — swipeable fact cards with a quiz at the end.
 * Same shape as the "Did You Know?" flashcards so it feels familiar.
 */
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Shell, Btn } from "../../components/UI";
import { Quiz, QuizQuestion } from "../../components/Quiz";
import { speak } from "../../lib/audio";
import { COLOUR_FACTS } from "../../data/colour";

export default function ColourScience({ onBack }: { onBack: () => void }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [quiz, setQuiz] = useState(false);
  const f = COLOUR_FACTS[i];

  const questions = useMemo<QuizQuestion[]>(
    () => COLOUR_FACTS.filter(x => x.quiz).slice(0, 5).map(x => ({
      prompt: x.quiz!.q,
      visual: <span aria-hidden>{x.emoji}</span>,
      choices: x.quiz!.opts,
      answer: x.quiz!.a,
      hint: "Think back to the cards you just read…",
      explain: x.fact
    })),
    []
  );

  if (quiz) {
    return <Quiz title="🔬 Colour science quiz" activity="colour-science"
      questions={questions} onBack={() => setQuiz(false)} />;
  }

  const go = (d: number) => { setDir(d); setI((i + d + COLOUR_FACTS.length) % COLOUR_FACTS.length); };

  return (
    <Shell title="Colour Science 🔬" subtitle={`Card ${i + 1} of ${COLOUR_FACTS.length}`} onBack={onBack}>
      <div className="relative mx-auto max-w-md">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            initial={{ opacity: 0, x: 60 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 * dir }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
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
            <Btn kind="ghost" className="mt-3" onClick={() => speak(f.fact)}>
              <Volume2 size={20} aria-hidden /> Read to me
            </Btn>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <Btn kind="soft" onClick={() => go(-1)} ariaLabel="Previous card"><ChevronLeft aria-hidden /></Btn>
        <Btn kind="soft" onClick={() => go(1)} ariaLabel="Next card"><ChevronRight aria-hidden /></Btn>
        <Btn kind="good" onClick={() => setQuiz(true)}><Sparkles size={18} aria-hidden /> Quiz me!</Btn>
      </div>
    </Shell>
  );
}
