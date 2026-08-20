/**
 * Mini-Chess — a kid-friendly board with visual assists: tap a piece and
 * every legal move lights up; the Hint button suggests a good move.
 * Modes: mate-in-one puzzles, play vs a gentle computer, two players.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Users, Puzzle as PuzzleIcon, Lightbulb, RotateCcw } from "lucide-react";
import { Shell, Tile, Btn, toast, Confetti } from "../components/UI";
import { sfx, speak, haptic } from "../lib/audio";
import { useStore } from "../lib/store";
import {
  Board, startBoard, legalMoves, allMoves, applyMove, inCheck, aiMove,
  glyph, sqName, NAMES, PUZZLES, puzzleBoard
} from "../lib/chess";

type Mode = { name: "menu" } | { name: "play"; vsAI: boolean } | { name: "puzzle" };

export default function ChessScreen({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<Mode>({ name: "menu" });
  const back = () => setMode({ name: "menu" });

  if (mode.name === "play") return <PlayChess vsAI={mode.vsAI} onBack={back} />;
  if (mode.name === "puzzle") return <MatePuzzles onBack={back} />;

  return (
    <Shell title="Chess ♟️" subtitle="The royal game, made friendly" onBack={onExit}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Tile icon={<PuzzleIcon className="text-sun" />} label="Chess Puzzles" sub="Checkmate in one!" onClick={() => setMode({ name: "puzzle" })} />
        <Tile icon={<Bot className="text-tint" />} label="Play the Computer" sub="Friendly game" onClick={() => setMode({ name: "play", vsAI: true })} />
        <Tile icon={<Users className="text-mint" />} label="Two Players" sub="Play a friend" onClick={() => setMode({ name: "play", vsAI: false })} />
      </div>
      <p className="mt-6 text-center text-sm text-ink-2">
        Junior rules: tap a piece to see everywhere it can go. Pawns become queens at the end of the board.
      </p>
    </Shell>
  );
}

/* ---------------- Board component ---------------- */

function ChessBoard({
  board, sel, hints, last, onTap
}: {
  board: Board;
  sel: number | null;
  hints: number[];
  last: [number, number] | null;
  onTap: (i: number) => void;
}) {
  return (
    <div
      role="grid"
      aria-label="Chess board"
      className="mx-auto grid w-full max-w-md grid-cols-8 overflow-hidden rounded-3xl shadow-lg"
    >
      {board.map((p, i) => {
        const x = i % 8, y = Math.floor(i / 8);
        const dark = (x + y) % 2 === 1;
        const isSel = sel === i;
        const isHint = hints.includes(i);
        const isLast = last !== null && (last[0] === i || last[1] === i);
        return (
          <button
            key={i}
            role="gridcell"
            aria-label={`${sqName(i)}${p ? `, ${p.w ? "white" : "black"} ${NAMES[p.t]}` : ", empty"}${isHint ? ", possible move" : ""}`}
            onClick={() => onTap(i)}
            className={`relative grid aspect-square place-items-center text-[7.5vw] leading-none sm:text-4xl
              ${dark ? "bg-[#b58f6f]" : "bg-[#f2e7cf]"}
              ${isSel ? "!bg-sun" : ""}`}
          >
            {isLast && <span aria-hidden className="absolute inset-0 ring-4 ring-inset ring-sky/70" />}
            {/* Visual assist: dots for quiet moves, rings for captures */}
            {isHint && !p && <span aria-hidden className="absolute h-1/4 w-1/4 rounded-full bg-mint/80" />}
            {isHint && p && <span aria-hidden className="absolute inset-0 ring-4 ring-inset ring-mint" />}
            <motion.span layout aria-hidden className="relative drop-shadow-sm">{glyph(p)}</motion.span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Full game ---------------- */

function PlayChess({ vsAI, onBack }: { vsAI: boolean; onBack: () => void }) {
  const { dispatch } = useStore();
  const [board, setBoard] = useState<Board>(startBoard);
  const [whiteTurn, setWhiteTurn] = useState(true);
  const [sel, setSel] = useState<number | null>(null);
  const [last, setLast] = useState<[number, number] | null>(null);
  const [thinking, setThinking] = useState(false);
  const [over, setOver] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const hints = sel !== null ? legalMoves(board, sel) : [];

  function status(): string {
    if (over) return over;
    if (thinking) return "🤖 Computer is thinking…";
    const check = inCheck(board, whiteTurn);
    return `${whiteTurn ? "⚪ White" : "⚫ Black"}${vsAI && !whiteTurn ? " (computer)" : ""} to move${check ? " — CHECK!" : ""}`;
  }

  function afterMove(nb: Board, nextWhite: boolean) {
    const moves = allMoves(nb, nextWhite);
    if (moves.length === 0) {
      if (inCheck(nb, nextWhite)) {
        const winner = nextWhite ? "Black" : "White";
        setOver(`🏆 Checkmate — ${winner} wins!`);
        speak(`Checkmate! ${winner} wins! What a game!`);
        sfx.win();
        setWon(true);
        // Winning (or finishing) a game earns stars for the active child.
        dispatch({ type: "award", stars: 3, activity: "chess-game" });
      } else {
        setOver("🤝 Stalemate — it's a draw. Great game!");
        speak("Stalemate! It's a draw. Well played!");
      }
      return true;
    }
    return false;
  }

  function doMove(from: number, to: number, b: Board, white: boolean) {
    const capture = !!b[to];
    const nb = applyMove(b, from, to);
    capture ? sfx.pop() : sfx.flip();
    haptic();
    setBoard(nb);
    setLast([from, to]);
    setSel(null);
    const nextWhite = !white;
    setWhiteTurn(nextWhite);
    if (afterMove(nb, nextWhite)) return;
    if (vsAI && nextWhite === false) {
      setThinking(true);
      setTimeout(() => {
        const m = aiMove(nb, false, 0);
        setThinking(false);
        if (m) doMove(m[0], m[1], nb, false);
      }, 850);
    }
  }

  function tap(i: number) {
    if (over || thinking) return;
    const p = board[i];
    if (sel !== null && legalMoves(board, sel).includes(i)) {
      doMove(sel, i, board, whiteTurn);
      return;
    }
    if (p && p.w === whiteTurn && (!vsAI || whiteTurn)) { setSel(i); sfx.tap(); }
    else setSel(null);
  }

  function hint() {
    const m = aiMove(board, whiteTurn, 1);
    if (m) {
      setSel(m[0]);
      const piece = board[m[0]];
      toast(`💡 Try ${piece ? NAMES[piece.t] : "piece"} ${sqName(m[0])} → ${sqName(m[1])}`);
    }
  }

  return (
    <Shell title={vsAI ? "You vs Computer 🤖" : "Two Players 🤝"} onBack={onBack} wide>
      {won && <Confetti />}
      <p aria-live="polite" className="mb-4 text-center text-lg font-bold">{status()}</p>
      <ChessBoard board={board} sel={sel} hints={hints} last={last} onTap={tap} />
      <div className="mt-5 flex justify-center gap-3">
        <Btn kind="soft" onClick={hint}><Lightbulb size={18} aria-hidden /> Hint</Btn>
        <Btn kind="soft" onClick={() => {
          setBoard(startBoard()); setWhiteTurn(true); setSel(null); setLast(null); setOver(null); setWon(false);
        }}><RotateCcw size={18} aria-hidden /> New game</Btn>
      </div>
    </Shell>
  );
}

/* ---------------- Mate-in-one puzzles ---------------- */

function MatePuzzles({ onBack }: { onBack: () => void }) {
  const { dispatch } = useStore();
  const [pi, setPi] = useState(() => Math.floor(Math.random() * PUZZLES.length));
  const pz = PUZZLES[pi % PUZZLES.length];
  const [board, setBoard] = useState<Board>(() => puzzleBoard(pz));
  const [sel, setSel] = useState<number | null>(null);
  const [solved, setSolved] = useState(0);
  const [note, setNote] = useState("White to move — find checkmate in ONE move!");
  const [celebrating, setCelebrating] = useState(false);

  const hints = sel !== null ? legalMoves(board, sel) : [];

  function loadNext() {
    const next = pi + 1;
    setPi(next);
    setBoard(puzzleBoard(PUZZLES[next % PUZZLES.length]));
    setSel(null);
    setNote("White to move — find checkmate in ONE move!");
  }

  function tap(i: number) {
    const p = board[i];
    if (p && p.w) { setSel(i); sfx.tap(); return; }
    if (sel !== null && legalMoves(board, sel).includes(i)) {
      if (sel === pz.solution[0] && i === pz.solution[1]) {
        sfx.win(); haptic(30);
        setBoard(applyMove(board, sel, i));
        setSel(null);
        setNote("Checkmate! 🏆 Brilliant!");
        setCelebrating(true);
        const nSolved = solved + 1;
        setSolved(nSolved);
        dispatch({ type: "award", stars: 2, activity: "chess-puzzle" });
        setTimeout(() => { setCelebrating(false); loadNext(); }, 1500);
      } else {
        sfx.wrong();
        setNote("Good idea — but the king can escape. Try another move!");
        setSel(null);
      }
    } else setSel(null);
  }

  return (
    <Shell title={`🧩 ${pz.name}`} subtitle={`Puzzles solved: ${solved}`} onBack={onBack} wide>
      {celebrating && <Confetti />}
      <p aria-live="polite" className="mb-4 text-center text-lg font-bold">{note}</p>
      <ChessBoard board={board} sel={sel} hints={hints} last={null} onTap={tap} />
      <div className="mt-5 flex justify-center gap-3">
        <Btn kind="soft" onClick={() => toast(`💡 Try moving the piece on ${sqName(pz.solution[0])}`)}>
          <Lightbulb size={18} aria-hidden /> Hint
        </Btn>
        <Btn kind="ghost" onClick={loadNext}>Skip puzzle</Btn>
      </div>
    </Shell>
  );
}
