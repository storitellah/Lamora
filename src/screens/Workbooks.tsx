/**
 * Workbooks — the stage-aware hub.
 *
 * A child sees the sheets that belong to their Cambridge-aligned stage
 * (Pre-Primary 1/2, Grade 1/2/3), but any stage can be opened from the picker
 * so siblings can share a device and a teacher can reach ahead or revise.
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Waves, PenLine, Waypoints, Search, Shapes, Route, SpellCheck, Palette, Hash, GraduationCap
} from "lucide-react";
import { Shell, Tile, Btn } from "../components/UI";
import { sfx } from "../lib/audio";
import { useStore } from "../lib/store";
import { STAGES, stageById, StageId } from "../data/curriculum";
import { PatternsWorkbook, HandwritingWorkbook } from "./workbook/Tracing";
import JoinDots from "./workbook/JoinDots";
import { FirstLetter, FunLetters, CompleteWord } from "./workbook/LetterSheets";
import LetterMaze from "./workbook/LetterMaze";
import Colouring from "./workbook/Colouring";
import OddEven from "./workbook/OddEven";

type SheetId =
  | "patterns" | "handwriting" | "joindots" | "firstletter"
  | "funletters" | "lettermaze" | "completeword" | "colouring" | "oddeven";

const SHEETS: Record<SheetId, { name: string; sub: string; icon: React.ReactNode; subject: string }> = {
  patterns:    { name: "Patterns",          sub: "Pre-writing strokes",  icon: <Waves className="text-sky" />,      subject: "English" },
  handwriting: { name: "Handwriting",       sub: "Letters & words",      icon: <PenLine className="text-tint" />,   subject: "English" },
  joindots:    { name: "Join the Dots",     sub: "Draw letters",         icon: <Waypoints className="text-coral" />,      subject: "English" },
  firstletter: { name: "First Letters",     sub: "What does it start with?", icon: <Search className="text-mint" />, subject: "English" },
  funletters:  { name: "Fun with Letters",  sub: "BIG & small match",    icon: <Shapes className="text-sun" />,     subject: "English" },
  lettermaze:  { name: "Letter Maze",       sub: "Find the picture",     icon: <Route className="text-tint" />,     subject: "English" },
  completeword:{ name: "Complete the Word", sub: "Fill the gaps",        icon: <SpellCheck className="text-sky" />, subject: "English" },
  colouring:   { name: "Colour the Picture",sub: "Tap to fill",          icon: <Palette className="text-coral" />,  subject: "Creative" },
  oddeven:     { name: "Odd & Even",        sub: "Sort the numbers",     icon: <Hash className="text-mint" />,      subject: "Mathematics" }
};

export default function Workbooks({ onExit }: { onExit: () => void }) {
  const { stage: childStage, profile } = useStore();
  const [viewStage, setViewStage] = useState<StageId>(childStage);
  const [sheet, setSheet] = useState<SheetId | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  const back = () => setSheet(null);
  if (sheet === "patterns") return <PatternsWorkbook onBack={back} />;
  if (sheet === "handwriting") return <HandwritingWorkbook onBack={back} />;
  if (sheet === "joindots") return <JoinDots onBack={back} />;
  if (sheet === "firstletter") return <FirstLetter onBack={back} />;
  if (sheet === "funletters") return <FunLetters onBack={back} />;
  if (sheet === "lettermaze") return <LetterMaze onBack={back} />;
  if (sheet === "completeword") return <CompleteWord onBack={back} />;
  if (sheet === "colouring") return <Colouring onBack={back} />;
  if (sheet === "oddeven") return <OddEven onBack={back} />;

  const stage = stageById(viewStage);

  return (
    <Shell
      title="Workbooks ✏️"
      subtitle={`${stage.emoji} ${stage.name} — ${stage.blurb}`}
      onBack={onExit}
      wide
    >
      {/* Stage picker */}
      <div className="mb-5 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Choose a school stage">
        {STAGES.map(s => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === viewStage}
            onClick={() => { sfx.tap(); setViewStage(s.id); }}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-bold transition-colors
              ${s.id === viewStage ? "bg-tint text-white shadow-lg shadow-tint/30" : "glass text-ink"}`}
          >
            {s.emoji} {s.short}
            {s.id === childStage && <span className="ml-1 opacity-70">•</span>}
          </button>
        ))}
      </div>

      {viewStage !== childStage && profile && (
        <p className="mb-4 text-center text-sm text-ink-2">
          Showing {stage.name}. {profile.name}'s own stage is {stageById(childStage).name}.
        </p>
      )}

      {/* Sheets for this stage */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stage.workbooks.map(id => {
          const s = SHEETS[id as SheetId];
          if (!s) return null;
          return (
            <Tile key={id} icon={s.icon} label={s.name} sub={s.sub} onClick={() => setSheet(id as SheetId)} />
          );
        })}
      </div>

      {/* What this stage covers — for parents and teachers */}
      <div className="mt-8">
        <div className="text-center">
          <Btn kind="soft" onClick={() => setShowPlan(v => !v)}>
            <GraduationCap size={18} aria-hidden />
            {showPlan ? "Hide" : "What does"} {stage.short} {showPlan ? "curriculum" : "cover?"}
          </Btn>
        </div>
        {showPlan && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="glass mt-4 rounded-[1.75rem] p-6">
            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-2">
              Aligned to {stage.cambridge}
            </p>
            <p className="mb-4 text-sm text-ink-2">Typical ages {stage.ages[0]}–{stage.ages[1]}</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {stage.strands.map((st, i) => (
                <div key={i}>
                  <p className="font-bold">{st.subject}</p>
                  <p className="mb-1 text-sm text-tint">{st.strand}</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
                    {st.objectives.map((o, j) => <li key={j}>{o}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Shell>
  );
}
