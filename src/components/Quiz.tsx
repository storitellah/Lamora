/**
 * Shared quiz engine — gentle, tap-to-reveal multiple choice.
 *
 * Pedagogy: a wrong answer never punishes. First miss → spoken hint and
 * another try; second miss → the answer is revealed kindly with a short
 * explanation, then we move on. Stars reward effort, not perfection.
 */
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { Shell, Pips, Btn, Confetti } from "./UI";
import { sfx, speak, haptic } from "../lib/audio";
import { useStore } from "../lib/store";

export interface QuizQuestion {
  prompt: string;
  speakText?: string;
  visual?: React.ReactNode;   // emoji row, manipulatives, image…
  choices: string[];
  answer: string;
  hint?: string;
  explain?: string;
  keepOrder?: boolean;
}

export interface QuizProps {
  title: string;
  activity: string;           // progress key, e.g. "math-add-t2"
  questions: QuizQuestion[];
  maxStars?: number;
  onBack: () => void;
  onAgain?: () => void;
  againLabel?: string;
}

function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function Quiz({ title, activity, questions, maxStars = 3, onBack, onAgain, againLabel }: QuizProps) {
  const { dispatch } = useStore();
  const [qi, setQi] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [finished, setFinished] = useState<null | { stars: number }>(null);
  const [wrongPick, setWrongPick] = useState<string | null>(null);

  const q = questions[qi];
  // Shuffle once per question index so re-renders keep the layout stable.
  const options = useMemo(
    () => (q.keepOrder ? q.choices : shuffle(q.choices)),
    [qi] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function next(correctFirst: boolean) {
    const nCorrect = firstTryCorrect + (correctFirst ? 1 : 0);
    if (qi + 1 < questions.length) {
      setFirstTryCorrect(nCorrect);
      setQi(qi + 1);
      setAttempts(0);
      setFeedback(null);
      setLocked(false);
      setRevealed(false);
      setWrongPick(null);
    } else {
      const stars = Math.max(1, Math.round((nCorrect / questions.length) * maxStars));
      dispatch({ type: "award", stars, activity });
      sfx.win();
      speak(nCorrect === questions.length ? "Perfect! Amazing work!" : "Great effort! You earned " + stars + " stars.");
      setFinished({ stars });
    }
  }

  function pick(choice: string) {
    if (locked) return;
    if (choice === q.answer) {
      sfx.correct(); haptic(15);
      setLocked(true);
      setFeedback("✅ " + (q.explain ?? "Well done!"));
      speak(q.explain ?? "Well done!");
      setTimeout(() => next(attempts === 0), 1100);
    } else {
      sfx.wrong();
      setWrongPick(choice);
      setTimeout(() => setWrongPick(null), 650);
      if (attempts === 0) {
        setAttempts(1);
        setFeedback("💡 " + (q.hint ?? "Good try! Have another go."));
        speak(q.hint ?? "Good try! Have another go.");
      } else {
        // Reveal kindly on second miss.
        setLocked(true);
        setRevealed(true);
        setFeedback(`🌈 The answer is ${q.answer}. ${q.explain ?? "You'll get it next time!"}`);
        speak(`The answer is ${q.answer}. ${q.explain ?? "You'll get it next time!"}`);
        setTimeout(() => next(false), 2000);
      }
    }
  }

  if (finished) {
    return (
      <Shell title={firstTryCorrect === questions.length ? "Perfect! 🏆" : "Great effort! 🎉"} onBack={onBack}>
        <Confetti />
        <div className="glass rounded-[1.75rem] p-8 text-center">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="text-6xl" aria-hidden
          >
            {firstTryCorrect === questions.length ? "🏆" : "🎉"}
          </motion.div>
          <p className="mt-3 text-2xl font-bold">+{finished.stars} ⭐</p>
          <p className="mt-1 text-ink-2">
            {firstTryCorrect} of {questions.length} first try. You're getting better every day!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {onAgain && <Btn onClick={onAgain}>{againLabel ?? "Play again"}</Btn>}
            <Btn kind="soft" onClick={onBack}>Done</Btn>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title={title} onBack={onBack}>
      <Pips total={questions.length} done={qi} current={qi} />
      <AnimatePresence mode="wait">
        <motion.div
          key={qi}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="glass mb-5 rounded-[1.75rem] p-6 text-center">
            {q.visual && <div className="mb-3 text-4xl leading-relaxed break-words">{q.visual}</div>}
            <p className="text-2xl font-bold">
              {q.prompt}{" "}
              <button
                onClick={() => speak(q.speakText ?? q.prompt)}
                aria-label="Hear the question"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full align-middle text-tint"
              >
                <Volume2 aria-hidden />
              </button>
            </p>
            <p className="mt-2 min-h-6 text-ink-2" role="status">{feedback}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {options.map(c => {
              const isAnswer = c === q.answer;
              const state = revealed && isAnswer ? "revealed" : wrongPick === c ? "wrong" : locked && isAnswer ? "correct" : "idle";
              return (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.95 }}
                  animate={state === "wrong" ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                  onClick={() => pick(c)}
                  disabled={locked}
                  className={`glass min-h-20 rounded-3xl p-4 text-2xl font-bold break-words transition-colors
                    ${state === "correct" || state === "revealed" ? "!bg-mint !text-white" : ""}
                    ${state === "wrong" ? "!bg-coral !text-white" : ""}`}
                >
                  {c}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}
