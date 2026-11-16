/**
 * Lamora application shell: profile select → home → feature screens,
 * plus the top bar, screen-time engine, break screen and footer.
 */
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Home, Lock, Volume2, VolumeX, Hourglass, Moon } from "lucide-react";
import { useStore, Screen } from "./lib/store";
import { Btn, Shell, ToastHost, toast } from "./components/UI";
import { sfx, speak, stopSpeaking, haptic } from "./lib/audio";
import Welcome from "./screens/Welcome";
import HomeScreen from "./screens/Home";
import Reading from "./screens/Reading";
import MathScreen from "./screens/Math";
import Trivia from "./screens/Trivia";
import Games from "./screens/Games";
import ChessScreen from "./screens/ChessScreen";
import DreamCards from "./screens/DreamCards";
import Workbooks from "./screens/Workbooks";
import Puzzles from "./screens/Puzzles";
import ColourLab from "./screens/ColourLab";
import ArtStudio from "./screens/ArtStudio";
import Languages from "./screens/Languages";
import { ParentGate, ParentDashboard } from "./screens/Parent";

export default function App() {
  const { state, dispatch, profile, remainingSeconds } = useStore();
  const [screen, setScreen] = useState<Screen>({ name: "profiles" });
  const warned = useRef({ five: false, one: false });

  const go = (s: Screen) => { stopSpeaking(); setScreen(s); window.scrollTo(0, 0); };

  /* ---- Screen-time engine: 1-second ticks while a child is active ---- */
  useEffect(() => {
    const t = window.setInterval(() => {
      if (!profile || document.hidden) return;
      if (["profiles", "parent", "parent-gate", "break"].includes(screen.name)) return;
      dispatch({ type: "tickUsage", seconds: 1 });
      const rem = remainingSeconds - 1;
      if (rem <= 300 && !warned.current.five) {
        warned.current.five = true;
        toast("⏳ Five more minutes today!");
        speak("Five more minutes today!");
      }
      if (rem <= 60 && !warned.current.one) {
        warned.current.one = true;
        toast("⏳ One more minute — nearly break time!");
      }
      if (rem <= 0) go({ name: "break" });
    }, 1000);
    return () => clearInterval(t);
  });

  const showChrome = profile && screen.name !== "profiles";

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Decorative backdrop: slow colour clouds on warm paper */}
      <div className="backdrop" aria-hidden><i /><b /></div>

      {showChrome && <TopBar screen={screen} go={go} />}

      {/* Screens remount on name change (key), so each Shell plays its own
          entrance. No AnimatePresence here: exit-waiting on plain
          (non-motion) children can wedge navigation. */}
      <main id="main" className={`flex-1 ${screen.name === "profiles" ? "" : "pt-4"}`} tabIndex={-1}>
        <ScreenView key={screen.name} screen={screen} go={go} />
      </main>

      {/* Footer dedication — visible on the welcome page and home */}
      {(screen.name === "profiles" || screen.name === "home") && (
        <footer className="px-5 pb-8 pt-8 text-center">
          <p className="font-display text-lg italic text-ink-2">Made for Luna, Lara, Arica and all their friends.</p>
          <p className="mt-1 text-xs font-semibold text-ink-2/70">No ads · No tracking · Everything stays on this device</p>
        </footer>
      )}
      <ToastHost />
    </div>
  );
}

/* ---------------- Top bar ---------------- */

function TopBar({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  const { state, dispatch, profile, remainingSeconds } = useStore();
  const mins = Math.ceil(remainingSeconds / 60);

  const chip = "grid h-11 w-11 place-items-center rounded-full bg-white shadow-[0_1px_2px_rgba(23,21,59,.08),0_4px_12px_-4px_rgba(23,21,59,.18)] ring-1 ring-ink/5";
  return (
    <header className="sticky top-0 z-40 px-2.5 pb-1 sm:px-4"
      style={{ paddingTop: "max(0.6rem, env(safe-area-inset-top))" }}>
      <div className="glass-heavy mx-auto flex max-w-6xl items-center justify-between gap-1.5 rounded-full p-1.5 sm:gap-2">
        <button
          onClick={() => { sfx.tap(); haptic(); go({ name: "home" }); }}
          aria-label="Go to home screen"
          aria-current={screen.name === "home" ? "page" : undefined}
          className={chip}
        >
          <Home size={21} className="text-tint" strokeWidth={2.4} aria-hidden />
        </button>

        {profile && (
          <button
            onClick={() => go({ name: "rewards" })}
            aria-label={`${profile.name}. ${profile.totalStars} stars. View rewards`}
            className="flex min-h-11 min-w-0 shrink items-center gap-1.5 rounded-full bg-white px-3 shadow-[0_1px_2px_rgba(23,21,59,.08),0_4px_12px_-4px_rgba(23,21,59,.18)] ring-1 ring-ink/5 sm:gap-2 sm:px-4"
          >
            <span className="text-xl" aria-hidden>{profile.avatar}</span>
            <span className="max-w-16 truncate font-extrabold sm:max-w-none">{profile.name}</span>
            <span className="whitespace-nowrap rounded-full bg-sun/25 px-2 py-0.5 text-sm font-extrabold text-ink max-[419px]:hidden">
              ⭐ {profile.totalStars}
            </span>
          </button>
        )}

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <span
            role="timer"
            aria-label={`${mins} minutes left today`}
            className={`flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-extrabold tabular-nums ring-1 ring-ink/5
              ${remainingSeconds <= 300 ? "bg-sun text-ink" : "bg-white"}`}
          >
            <Hourglass size={14} aria-hidden /> {mins}m
          </span>
          <button
            onClick={() => dispatch({ type: "settings", patch: { muted: !state.settings.muted } })}
            aria-label={state.settings.muted ? "Unmute sounds" : "Mute sounds"}
            aria-pressed={state.settings.muted}
            className={chip}
          >
            {state.settings.muted ? <VolumeX size={20} aria-hidden /> : <Volume2 size={20} className="text-tint" aria-hidden />}
          </button>
          <HoldLock onUnlock={() => go({ name: "parent-gate" })} />
        </div>
      </div>
    </header>
  );
}

/* ---------------- Parent lock (press and hold) ---------------- */

const HOLD_MS = 2000;

/**
 * Press-and-hold lock for the parent zone. The hold is a speed bump for small
 * children; the PIN behind it is the real protection.
 *
 * Why the earlier version only "sometimes" worked on tablets:
 *  - a finger drifting a couple of pixels made the browser start a scroll,
 *    which fires `pointercancel` and abandons the press;
 *  - the finger leaving the 44px button fired `pointerleave` and reset it;
 *  - iOS and Android open a long-press callout / context menu at ~500ms,
 *    which steals the gesture.
 * So: `touch-action: none` (no scroll can start here), pointer capture (the
 * press stays ours even if the finger slides off), and the callout and
 * context menu are suppressed. A ring fills up so grown-ups can see it working.
 */
function HoldLock({ onUnlock }: { onUnlock: () => void }) {
  const [progress, setProgress] = useState(0);
  const start = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const done = useRef(false);

  const stop = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    start.current = null;
  };
  useEffect(() => stop, []);

  function tick() {
    if (start.current == null) return;
    const p = Math.min(1, (performance.now() - start.current) / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      done.current = true;
      stop();
      haptic(30);
      sfx.chime();
      onUnlock();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }

  function down(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* old browsers */ }
    done.current = false;
    start.current = performance.now();
    haptic(8);
    raf.current = requestAnimationFrame(tick);
  }

  function up() {
    if (done.current || start.current == null) return;
    const held = performance.now() - start.current;
    stop();
    setProgress(0);
    if (held < 600) toast("Grown-ups: press and hold the lock for 2 seconds 🔒");
  }

  const R = 19, C = 2 * Math.PI * R;
  return (
    <button
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onContextMenu={e => e.preventDefault()}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onUnlock(); } }}
      aria-label="Parent zone. Press and hold for two seconds."
      className="no-callout relative grid h-11 w-11 place-items-center rounded-full bg-white shadow-[0_1px_2px_rgba(23,21,59,.08),0_4px_12px_-4px_rgba(23,21,59,.18)] ring-1 ring-ink/5"
      style={{ touchAction: "none" }}
    >
      <svg className="pointer-events-none absolute inset-0 -rotate-90" viewBox="0 0 44 44" aria-hidden>
        <circle cx="22" cy="22" r={R} fill="none" stroke="var(--color-tint)" strokeWidth="3.5"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
          opacity={progress > 0 ? 1 : 0} />
      </svg>
      <Lock size={20} aria-hidden className={progress > 0 ? "text-tint" : "text-ink-2"} />
    </button>
  );
}

/* ---------------- Screen router ---------------- */

function ScreenView({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  const home = () => go({ name: "home" });
  switch (screen.name) {
    case "profiles": return <Welcome go={go} />;
    case "home": return <HomeScreen go={go} />;
    case "reading": return <Reading onExit={home} />;
    case "math": return <MathScreen onExit={home} />;
    case "trivia": return <Trivia onExit={home} />;
    case "games": return <Games onExit={home} />;
    case "chess": return <ChessScreen onExit={home} />;
    case "dreamcards": return <DreamCards onExit={home} />;
    case "workbooks": return <Workbooks onExit={home} />;
    case "puzzles": return <Puzzles onExit={home} />;
    case "colourlab": return <ColourLab onExit={home} />;
    case "art": return <ArtStudio onExit={home} />;
    case "languages": return <Languages onExit={home} />;
    case "rewards": return <Rewards go={go} />;
    case "parent-gate": return <ParentGate onPass={() => go({ name: "parent" })} onBack={home} />;
    case "parent": return <ParentDashboard onExit={home} />;
    case "break": return <BreakScreen go={go} />;
    default: return <HomeScreen go={go} />;
  }
}

/* ---------------- Rewards ---------------- */

function Rewards({ go }: { go: (s: Screen) => void }) {
  const { state, profile } = useStore();
  if (!profile) return null;
  const activities = Object.values(profile.done).reduce((a, b) => a + b, 0);
  const per = state.settings.starsPerToken;
  const stats: [string, string | number][] = [
    ["⭐ Stars earned", profile.totalStars],
    ["🎮 Play sessions saved", profile.tokens],
    ["✅ Activities finished", activities],
    ["📖 Reading & stories", sumBy(profile.done, ["reading", "story"])],
    ["🔢 Maths practised", sumBy(profile.done, ["math"])],
    ["♟️ Chess wins & puzzles", sumBy(profile.done, ["chess"])]
  ];
  return (
    <Shell title="My Rewards 🏆" subtitle="Look how much you've learned!" onBack={() => go({ name: "home" })}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="glass rounded-3xl p-5 text-center">
            <div className="font-display text-[2.4rem] font-bold leading-none text-tint">{value}</div>
            <div className="mt-2 text-sm font-semibold text-ink-2">{label}</div>
          </div>
        ))}
      </div>
      <div className="glass mt-5 rounded-3xl p-5">
        <p className="mb-2 font-extrabold">Next play session</p>
        <div className="h-4 overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sun to-coral"
            animate={{ width: `${Math.round((profile.stars / per) * 100)}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
        <p className="mt-2 text-sm text-ink-2">{profile.stars} of {per} ⭐ — keep learning to unlock a game!</p>
      </div>
    </Shell>
  );
}

function sumBy(done: Record<string, number>, prefixes: string[]): number {
  return Object.entries(done)
    .filter(([k]) => prefixes.some(p => k.startsWith(p)))
    .reduce((a, [, n]) => a + n, 0);
}

/* ---------------- Break screen ---------------- */

const BREAK_IDEAS = [
  ["🐱", "Stretch up tall like a cat!"],
  ["🔵", "Find something blue in your room!"],
  ["💧", "Drink a glass of water!"],
  ["🪟", "Look out of the window — what can you see?"],
  ["🌬️", "Take five slow, deep breaths."],
  ["✏️", "Draw something on real paper!"],
  ["💚", "Help someone at home with a little job!"]
];

function BreakScreen({ go }: { go: (s: Screen) => void }) {
  const [idea] = useState(() => BREAK_IDEAS[Math.floor(Math.random() * BREAK_IDEAS.length)]);
  useEffect(() => { speak("Time for a break! " + idea[1]); }, [idea]);
  return (
    <Shell title="Time for a break! 🌙">
      <div className="glass-heavy rounded-[2rem] p-10 text-center">
        <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-[#7566ff] to-[#3b2bc2] text-white shadow-[0_18px_40px_-14px_rgba(59,43,194,.8)]" style={{ animation: "var(--animate-float-slow)" }}>
          <Moon size={46} aria-hidden />
        </span>
        <p className="mt-4 text-lg">You did some wonderful learning today. See you soon!</p>
        <p className="mt-4 text-2xl font-bold">{idea[0]} {idea[1]}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn kind="soft" onClick={() => go({ name: "profiles" })}>👋 Switch profile</Btn>
          <Btn onClick={() => go({ name: "parent-gate" })}><Lock size={16} aria-hidden /> Parent: add time</Btn>
        </div>
      </div>
    </Shell>
  );
}
