/**
 * Puzzles — the thinking-games hub.
 *
 * Shape Sums is the headline puzzle (picture arithmetic); Maze Adventure has
 * its own 16-level progression. Everything here is generated rather than
 * hand-authored, so children never run out, and each puzzle has easy/medium/
 * hard bands so one screen serves a 5-year-old and a 10-year-old.
 */
import React, { useState } from "react";
import { Shapes, ArrowRight, Search, Scale, Triangle, Grid3X3, Waypoints } from "lucide-react";
import { Shell, Tile } from "../components/UI";
import ShapeSums from "./puzzles/ShapeSums";
import { WhatComesNext, OddOneOut, BalanceScales, NumberPyramid } from "./puzzles/LogicPuzzles";
import ShapeSudoku from "./puzzles/ShapeSudoku";
import MazeAdventure from "./puzzles/MazeAdventure";

type PuzzleId = "shapesums" | "maze" | "next" | "odd" | "balance" | "pyramid" | "sudoku";

const PUZZLES: { id: PuzzleId; name: string; sub: string; icon: React.ReactNode }[] = [
  { id: "shapesums", name: "Shape Sums",    sub: "Add & take away shapes", icon: <Shapes className="text-coral" /> },
  { id: "maze",      name: "Maze Adventure",sub: "16 levels",              icon: <Waypoints className="text-tint" /> },
  { id: "next",      name: "What Comes Next?", sub: "Finish the pattern",  icon: <ArrowRight className="text-sky" /> },
  { id: "odd",       name: "Odd One Out",   sub: "Spot the stranger",      icon: <Search className="text-mint" /> },
  { id: "balance",   name: "Balance Scales",sub: "Make it equal",          icon: <Scale className="text-sun" /> },
  { id: "pyramid",   name: "Number Pyramid",sub: "Add your way up",        icon: <Triangle className="text-coral" /> },
  { id: "sudoku",    name: "Shape Sudoku",  sub: "Fill the grid",          icon: <Grid3X3 className="text-tint" /> }
];

export default function Puzzles({ onExit }: { onExit: () => void }) {
  const [open, setOpen] = useState<PuzzleId | null>(null);
  const back = () => setOpen(null);

  if (open === "shapesums") return <ShapeSums onBack={back} />;
  if (open === "maze") return <MazeAdventure onBack={back} />;
  if (open === "next") return <WhatComesNext onBack={back} />;
  if (open === "odd") return <OddOneOut onBack={back} />;
  if (open === "balance") return <BalanceScales onBack={back} />;
  if (open === "pyramid") return <NumberPyramid onBack={back} />;
  if (open === "sudoku") return <ShapeSudoku onBack={back} />;

  return (
    <Shell title="Puzzles 🧩" subtitle="Brain teasers that grow with you — easy to hard" onBack={onExit} wide>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {PUZZLES.map(p => (
          <Tile key={p.id} icon={p.icon} label={p.name} sub={p.sub} onClick={() => setOpen(p.id)} />
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-ink-2">
        Every puzzle has 🟢 easy, 🟡 medium and 🔴 hard — tap the level that feels right today.
      </p>
    </Shell>
  );
}
