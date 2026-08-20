/**
 * Reward Games hub. Finishing lessons earns stars; every N stars becomes
 * one play token. A token buys one short game session (parent-set length).
 * The gating is transparent and visible — no dark patterns.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Gamepad2, Search, Shuffle, Grid3X3, Brain, Puzzle, Timer } from "lucide-react";
import { Shell, Tile, Btn, toast, Confetti } from "../components/UI";
import { Quiz, QuizQuestion } from "../components/Quiz";
import { sfx, speak, haptic } from "../lib/audio";
import { useStore } from "../lib/store";
import { PICTURE_WORDS } from "../data/content";
import WordSearch from "./games/WordSearch";
import { SlidingPuzzle, LogicTiles, MemoryPairs } from "./games/Puzzles";
import { motion } from "framer-motion";

type GameId = "wordmatch" | "wordsearch" | "anagram" | "sliding" | "logic" | "pairs";

const GAMES: { id: GameId; name: string; sub: string; icon: React.ReactNode }[] = [
  { id: "wordmatch", name: "Word Match", sub: "Picture ↔ word", icon: <Search className="text-tint" /> },
  { id: "wordsearch", name: "Word Search", sub: "Circle the words", icon: <Grid3X3 className="text-sky" /> },
  { id: "anagram", name: "Letter Scramble", sub: "Spell the word", icon: <Shuffle className="text-coral" /> },
  { id: "sliding", name: "Picture Puzzle", sub: "Slide the tiles", icon: <Puzzle className="text-sun" /> },
  { id: "logic", name: "Logic Tiles", sub: "Crack the pattern", icon: <Brain className="text-mint" /> },
  { id: "pairs", name: "Matching Pairs", sub: "Memory game", icon: <Gamepad2 className="text-tint" /> }
];

export default function Games({ onExit }: { onExit: () => void }) {
  const { state, dispatch, profile } = useStore();
  const [game, setGame] = useState<GameId | null>(null);
  const [sessionEnd, setSessionEnd] = useState<number | null>(null);
  const [left, setLeft] = useState(0);
  const warned = useRef(false);

  const tokens = profile?.tokens ?? 0;

  // Session countdown: gentle 1-minute warning, then a friendly wrap-up.
  useEffect(() => {
    if (sessionEnd === null) return;
    const t = window.setInterval(() => {
      const ms = sessionEnd - Date.now();
      setLeft(Math.max(0, Math.ceil(ms / 1000)));
      if (ms <= 60_000 && !warned.current) {
        warned.current = true;
        toast("⏳ One more minute of play!");
      }
      if (ms <= 0) {
        clearInterval(t);
        setGame(null);
        setSessionEnd(null);
        toast("🎮 Play session finished — great job!");
        speak("Play time is over. Back to learning, or take a break!");
      }
    }, 1000);
    return () => clearInterval(t);
  }, [sessionEnd]);

  function start(id: GameId) {
    if (tokens <= 0) {
      toast(`Finish a lesson to earn a play session! 📚`);
      speak("Do some learning first to unlock play time!");
      return;
    }
    dispatch({ type: "spendToken" });
    warned.current = false;
    setSessionEnd(Date.now() + state.settings.playMinutes * 60_000);
    setGame(id);
  }

  function win() {
    // Reward games grant a single star — enough to feel great, not enough
    // to short-circuit the learning loop.
    dispatch({ type: "award", stars: 1, activity: `game-${game}` });
    setGame(null);
  }
  const backToHub = () => setGame(null);

  if (game) {
    return (
      <>
        {/* Floating session timer chip */}
        <div aria-live="polite" className="glass-heavy fixed right-4 top-20 z-40 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold">
          <Timer size={16} aria-hidden /> {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </div>
        {game === "wordmatch" && <WordMatch onBack={backToHub} />}
        {game === "wordsearch" && <WordSearch onBack={backToHub} onWin={win} />}
        {game === "anagram" && <Anagram onBack={backToHub} onWin={win} />}
        {game === "sliding" && <SlidingPuzzle onBack={backToHub} onWin={win} />}
        {game === "logic" && <LogicTiles onBack={backToHub} onWin={win} />}
        {game === "pairs" && <MemoryPairs onBack={backToHub} onWin={win} />}
      </>
    );
  }

  return (
    <Shell
      title="Play 🎮"
      subtitle={
        tokens > 0
          ? `You have ${tokens} play session${tokens > 1 ? "s" : ""} saved up — pick a game!`
          : `Earn ${state.settings.starsPerToken} ⭐ in any lesson to unlock a game session.`
      }
      onBack={onExit}
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {GAMES.map(g => (
          <Tile
            key={g.id}
            icon={g.icon}
            label={g.name}
            sub={tokens > 0 ? g.sub : "🔒 Locked"}
            locked={tokens <= 0}
            onClick={() => start(g.id)}
          />
        ))}
      </div>
    </Shell>
  );
}

/* ---------------- Word Match (quiz-powered) ---------------- */

function WordMatch({ onBack }: { onBack: () => void }) {
  const { level } = useStore();
  const questions = useMemo<QuizQuestion[]>(() => {
    const pool = PICTURE_WORDS.slice(0, level === 1 ? 15 : PICTURE_WORDS.length);
    const used = new Set<string>();
    const qs: QuizQuestion[] = [];
    while (qs.length < 5) {
      const item = pool[Math.floor(Math.random() * pool.length)];
      if (used.has(item.word)) continue;
      used.add(item.word);
      const opts = new Set([item.word]);
      while (opts.size < (level === 1 ? 3 : 4))
        opts.add(pool[Math.floor(Math.random() * pool.length)].word);
      qs.push({
        prompt: "Which word matches the picture?",
        speakText: "Which word matches the picture?",
        visual: <span aria-hidden>{item.emoji}</span>,
        choices: [...opts],
        answer: item.word,
        hint: `It starts with “${item.word[0]}”.`,
        explain: `It's “${item.word}”!`
      });
    }
    return qs;
  }, [level]);
  return <Quiz title="Word Match 🔍" activity="game-wordmatch" questions={questions} onBack={onBack} />;
}

/* ---------------- Letter Scramble (anagram) ---------------- */

function Anagram({ onBack, onWin }: { onBack: () => void; onWin: () => void }) {
  const { level } = useStore();
  const total = 4;
  const [round, setRound] = useState(0);
  const [item, setItem] = useState(() => pickWord(level));
  const [placed, setPlaced] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>(() => scramble(item.word));
  const [shake, setShake] = useState(false);

  function pickWord(lv: number) {
    const pool = PICTURE_WORDS.filter(w => (lv === 1 ? w.word.length <= 4 : w.word.length >= 4));
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function scramble(w: string): string[] {
    let a = w.toUpperCase().split("");
    do { a = a.slice().sort(() => Math.random() - 0.5); } while (a.join("") === w.toUpperCase() && w.length > 1);
    return a;
  }

  function tapBank(i: number) {
    sfx.pop(); haptic();
    const letter = bank[i];
    const nb = bank.slice(); nb.splice(i, 1);
    const np = [...placed, letter];
    setBank(nb); setPlaced(np);
    if (np.length === item.word.length) {
      if (np.join("") === item.word.toUpperCase()) {
        sfx.correct();
        speak(`Yes! ${item.word}!`);
        if (round + 1 >= total) { sfx.win(); setTimeout(onWin, 800); return; }
        setTimeout(() => {
          const next = pickWord(level);
          setItem(next); setPlaced([]); setBank(scramble(next.word)); setRound(r => r + 1);
        }, 900);
      } else {
        sfx.wrong();
        setShake(true);
        speak("Almost! Try a different order.");
        setTimeout(() => { setShake(false); setBank(scramble(item.word)); setPlaced([]); }, 750);
      }
    }
  }

  function undo() {
    if (!placed.length) return;
    const np = placed.slice();
    const letter = np.pop()!;
    setPlaced(np); setBank([...bank, letter]);
    sfx.flip();
  }

  return (
    <Shell title="Letter Scramble 🔤" subtitle={`Spell what you see! Round ${round + 1} of ${total}`} onBack={onBack}>
      <div className="glass rounded-[1.75rem] p-6 text-center">
        <div className="text-6xl" aria-hidden>{item.emoji}</div>
        {/* Answer slots */}
        <motion.div
          animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}}
          className="mt-5 flex justify-center gap-2"
          aria-label={`Your spelling so far: ${placed.join(" ") || "empty"}`}
        >
          {Array.from({ length: item.word.length }, (_, i) => (
            <div key={i} className={`grid h-14 w-12 place-items-center rounded-2xl text-2xl font-extrabold
              ${placed[i] ? "bg-tint text-white" : "border-2 border-dashed border-ink/20 bg-white/50"}`}>
              {placed[i] ?? ""}
            </div>
          ))}
        </motion.div>
      </div>
      {/* Letter bank */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {bank.map((l, i) => (
          <motion.button
            key={`${l}-${i}`}
            layout
            whileTap={{ scale: 0.9 }}
            onClick={() => tapBank(i)}
            aria-label={`Letter ${l}`}
            className="glass grid h-14 w-12 place-items-center rounded-2xl text-2xl font-extrabold"
          >
            {l}
          </motion.button>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-3">
        <Btn kind="soft" onClick={undo} disabled={!placed.length}>↩︎ Undo</Btn>
        <Btn kind="ghost" onClick={() => speak(item.word)}>🔊 Say the word</Btn>
      </div>
    </Shell>
  );
}
