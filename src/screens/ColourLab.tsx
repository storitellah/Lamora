/**
 * Colour Lab — where children learn how colours are made.
 *
 * Six rooms, from free play to real science. The mixing underneath is a
 * proper subtractive (RYB) paint model and a proper additive (RGB) light
 * model, so what a child discovers here matches what happens in a real paint
 * pot and under real torches.
 */
import React, { useState } from "react";
import { Palette, CircleDashed, Target, Lightbulb, Contrast, Microscope } from "lucide-react";
import { Shell, Tile } from "../components/UI";
import { MixingPots, TintsShades } from "./colour/MixingPots";
import ColourWheel from "./colour/ColourWheel";
import LightVsPaint from "./colour/LightVsPaint";
import MixToMatch from "./colour/MixToMatch";
import ColourScience from "./colour/ColourScience";

type RoomId = "pots" | "wheel" | "match" | "light" | "tints" | "science";

const ROOMS: { id: RoomId; name: string; sub: string; icon: React.ReactNode }[] = [
  { id: "pots",    name: "Mixing Pots",   sub: "Pour and discover",     icon: <Palette className="text-coral" /> },
  { id: "wheel",   name: "Colour Wheel",  sub: "How colours are made",  icon: <CircleDashed className="text-tint" /> },
  { id: "match",   name: "Mix to Match",  sub: "Make this colour!",     icon: <Target className="text-mint" /> },
  { id: "light",   name: "Light vs Paint",sub: "They mix differently!", icon: <Lightbulb className="text-sun" /> },
  { id: "tints",   name: "Tints & Shades",sub: "Lighter and darker",    icon: <Contrast className="text-sky" /> },
  { id: "science", name: "Colour Science",sub: "Why things look coloured", icon: <Microscope className="text-tint" /> }
];

export default function ColourLab({ onExit }: { onExit: () => void }) {
  const [room, setRoom] = useState<RoomId | null>(null);
  const back = () => setRoom(null);

  if (room === "pots") return <MixingPots onBack={back} />;
  if (room === "wheel") return <ColourWheel onBack={back} />;
  if (room === "match") return <MixToMatch onBack={back} />;
  if (room === "light") return <LightVsPaint onBack={back} />;
  if (room === "tints") return <TintsShades onBack={back} />;
  if (room === "science") return <ColourScience onBack={back} />;

  return (
    <Shell title="Colour Lab 🧪🎨" subtitle="Mix colours, and find out how colour really works" onBack={onExit} wide>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {ROOMS.map(r => (
          <Tile key={r.id} icon={r.icon} label={r.name} sub={r.sub} onClick={() => setRoom(r.id)} />
        ))}
      </div>

      {/* The one idea worth putting on the front door */}
      <div className="glass mt-6 rounded-[1.75rem] p-6 text-center">
        <p className="text-lg font-bold">The three starting colours 🔴🟡🔵</p>
        <p className="mt-2 text-ink-2">
          Red, yellow and blue are called <b>primary</b> colours — you cannot make them by mixing
          anything else. Mix any two and you get a <b>secondary</b> colour: orange, green or purple.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-bold">
          <span className="rounded-full px-3 py-1 text-white" style={{ background: "#ff2727" }}>Red</span>
          <span>+</span>
          <span className="rounded-full px-3 py-1" style={{ background: "#ffed2d" }}>Yellow</span>
          <span>=</span>
          <span className="rounded-full px-3 py-1 text-white" style={{ background: "#ff8c14" }}>Orange</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm font-bold">
          <span className="rounded-full px-3 py-1" style={{ background: "#ffed2d" }}>Yellow</span>
          <span>+</span>
          <span className="rounded-full px-3 py-1 text-white" style={{ background: "#255ec7" }}>Blue</span>
          <span>=</span>
          <span className="rounded-full px-3 py-1 text-white" style={{ background: "#26a64d" }}>Green</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm font-bold">
          <span className="rounded-full px-3 py-1 text-white" style={{ background: "#ff2727" }}>Red</span>
          <span>+</span>
          <span className="rounded-full px-3 py-1 text-white" style={{ background: "#255ec7" }}>Blue</span>
          <span>=</span>
          <span className="rounded-full px-3 py-1 text-white" style={{ background: "#9239a9" }}>Purple</span>
        </div>
      </div>
    </Shell>
  );
}
