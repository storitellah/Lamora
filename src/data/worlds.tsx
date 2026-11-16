/**
 * The twelve "worlds" of Lamora — one per learning pathway. Each owns a
 * colour gradient that is used consistently on the welcome page and on the
 * child's home screen, so children learn to find things by colour long
 * before they can read the labels.
 */
import React from "react";
import {
  BookOpen, Calculator, Globe2, Gamepad2, Crown, Sparkles, Trophy,
  NotebookPen, Puzzle, Palette, Brush, Languages
} from "lucide-react";
import type { Screen } from "../lib/store";

export interface World {
  id: string;
  label: string;
  sub: string;
  screen: Screen;
  icon: React.ReactNode;
  gradient: string;
  group: "learn" | "create" | "play" | "me";
}

const g = (a: string, b: string) => `linear-gradient(140deg, ${a} 0%, ${b} 100%)`;

export const WORLDS: World[] = [
  { id: "reading", label: "Reading & Writing", sub: "Letters, words & stories", screen: { name: "reading" }, icon: <BookOpen />, gradient: g("#7566ff", "#3b2bc2"), group: "learn" },
  { id: "math", label: "Maths Journey", sub: "Count, add & multiply", screen: { name: "math" }, icon: <Calculator />, gradient: g("#22cfa0", "#078a78"), group: "learn" },
  { id: "workbooks", label: "Workbooks", sub: "Write, trace & colour", screen: { name: "workbooks" }, icon: <NotebookPen />, gradient: g("#ff8a5c", "#f2386f"), group: "learn" },
  { id: "languages", label: "Languages", sub: "Português & Kiswahili", screen: { name: "languages" }, icon: <Languages />, gradient: g("#1cc4b0", "#1c74dd"), group: "learn" },

  { id: "art", label: "Art Studio", sub: "Draw, paint & save", screen: { name: "art" }, icon: <Brush />, gradient: g("#ff6aa6", "#a544dc"), group: "create" },
  { id: "colourlab", label: "Colour Lab", sub: "Mix & learn colours", screen: { name: "colourlab" }, icon: <Palette />, gradient: g("#ffbe3b", "#ff5c6c"), group: "create" },
  { id: "dreamcards", label: "Dream Cards", sub: "When I grow up…", screen: { name: "dreamcards" }, icon: <Sparkles />, gradient: g("#9a88ff", "#2aa9f5"), group: "create" },

  { id: "puzzles", label: "Puzzles", sub: "Shapes, mazes & logic", screen: { name: "puzzles" }, icon: <Puzzle />, gradient: g("#c06bf5", "#6a35d4"), group: "play" },
  { id: "chess", label: "Chess", sub: "Puzzles & play", screen: { name: "chess" }, icon: <Crown />, gradient: g("#4a4680", "#1b1942"), group: "play" },
  { id: "trivia", label: "Did You Know?", sub: "World curiosities", screen: { name: "trivia" }, icon: <Globe2 />, gradient: g("#3dbcff", "#2560e6"), group: "play" },
  { id: "games", label: "Play", sub: "Reward games", screen: { name: "games" }, icon: <Gamepad2 />, gradient: g("#ff7a6b", "#dd2f6a"), group: "play" },

  { id: "rewards", label: "My Rewards", sub: "See your progress", screen: { name: "rewards" }, icon: <Trophy />, gradient: g("#ffc83d", "#ff8419"), group: "me" }
];

export const GROUPS: { id: World["group"]; title: string; blurb: string }[] = [
  { id: "learn", title: "Learn", blurb: "Words, numbers and new languages" },
  { id: "create", title: "Create", blurb: "Make something that's all yours" },
  { id: "play", title: "Think & play", blurb: "Puzzles, wonders and games" }
];
