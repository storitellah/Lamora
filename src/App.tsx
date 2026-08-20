/**
 * Lamora application shell: profile select → home → feature screens,
 * plus the top bar, screen-time engine, break screen and footer.
 */
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Calculator, Globe2, Gamepad2, Crown, Sparkles, Trophy,
  Home, Lock, Volume2, VolumeX, Hourglass, Moon
} from "lucide-react";
import { useStore, Screen, todayKey } from "./lib/store";
import { Btn, Tile, Shell, ToastHost, toast } from "./components/UI";
import { sfx, speak, stopSpeaking, haptic } from "./lib/audio";
import Reading from "./screens/Reading";
import MathScreen from "./screens/Math";
import Trivia from "./screens/Trivia";
import Games from "./screens/Games";
import ChessScreen from "./screens/ChessScreen";
import DreamCards from "./screens/DreamCards";
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
      {showChrome && <TopBar screen={screen} go={go} />}

      {/* Screens remount on name change (key), so each Shell plays its own
          entrance spring. No AnimatePresence here: exit-waiting on plain
          (non-motion) children can wedge navigation. */}
      <main id="main" className="flex-1 pt-4" tabIndex={-1}>
        <ScreenView key={screen.name} screen={screen} go={go} />
      </main>

      {/* Footer attribution — visible on the profile screen and home */}
      {(screen.name === "profiles" || screen.name === "home") && (
        <footer className="pb-6 pt-10 text-center text-sm text-ink-2">
          Made for Luna, Lara, Arica and all their friends.
        </footer>
      )}
      <ToastHost />
    </div>
  );
}

/* ---------------- Top bar ---------------- */

function TopBar({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  const { state, dispatch, profile, remainingSeconds } = useStore();
  const holdTimer = useRef<number | null>(null);
  const [holding, setHolding] = useState(false);

  // Press-and-hold (3s) is the child-safe gesture for the parent zone.
  function holdStart() {
    setHolding(true);
    holdTimer.current = window.setTimeout(() => {
      setHolding(false);
      go({ name: "parent-gate" });
    }, 3000);
  }
  function holdEnd(fromClick = false) {
    setHolding(false);
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (fromClick) toast("Grown-ups: press and hold for 3 seconds 🔒");
  }

  const mins = Math.ceil(remainingSeconds / 60);

  return (
    <header className="glass-heavy sticky top-0 z-40 flex items-center justify-between gap-1.5 rounded-b-3xl px-2.5 py-2.5 sm:gap-2 sm:px-4"
      style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}>
      <button
        onClick={() => { sfx.tap(); haptic(); go({ name: "home" }); }}
        aria-label="Go to home screen"
        className="grid h-11 w-11 place-items-center rounded-full bg-white/80 shadow-sm"
      >
        <Home size={22} className="text-tint" aria-hidden />
      </button>

      {profile && (
        <button
          onClick={() => go({ name: "rewards" })}
          aria-label={`${profile.name}. ${profile.totalStars} stars. View rewards`}
          className="flex min-h-11 min-w-0 shrink items-center gap-1.5 rounded-full bg-white/80 px-3 shadow-sm sm:gap-2 sm:px-4"
        >
          <span className="text-xl" aria-hidden>{profile.avatar}</span>
          <span className="max-w-16 truncate font-bold sm:max-w-none">{profile.name}</span>
          <span className="whitespace-nowrap rounded-full bg-sun/20 px-2 py-0.5 text-sm font-bold text-ink max-[419px]:hidden">
            ⭐ {profile.totalStars}
          </span>
        </button>
      )}

      <div className="flex shrink-0 items-center gap-1">
        <span
          role="timer"
          aria-label={`${mins} minutes left today`}
          className={`flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-bold shadow-sm
            ${remainingSeconds <= 300 ? "bg-sun text-ink" : "bg-white/80"}`}
        >
          <Hourglass size={14} aria-hidden /> {mins}m
        </span>
        <button
          onClick={() => dispatch({ type: "settings", patch: { muted: !state.settings.muted } })}
          aria-label={state.settings.muted ? "Unmute sounds" : "Mute sounds"}
          aria-pressed={state.settings.muted}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/80 shadow-sm"
        >
          {state.settings.muted ? <VolumeX size={20} aria-hidden /> : <Volume2 size={20} className="text-tint" aria-hidden />}
        </button>
        <button
          onPointerDown={holdStart}
          onPointerUp={() => holdEnd(true)}
          onPointerLeave={() => holdEnd()}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go({ name: "parent-gate" }); } }}
          aria-label="Parent zone. Press and hold for three seconds."
          className={`grid h-11 w-11 place-items-center rounded-full shadow-sm transition-colors
            ${holding ? "bg-tint text-white" : "bg-white/80"}`}
        >
          <Lock size={20} aria-hidden className={holding ? "" : "text-ink-2"} />
        </button>
      </div>
    </header>
  );
}

/* ---------------- Screen router ---------------- */

function ScreenView({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  const home = () => go({ name: "home" });
  switch (screen.name) {
    case "profiles": return <ProfileSelect go={go} />;
    case "home": return <HomeScreen go={go} />;
    case "reading": return <Reading onExit={home} />;
    case "math": return <MathScreen onExit={home} />;
    case "trivia": return <Trivia onExit={home} />;
    case "games": return <Games onExit={home} />;
    case "chess": return <ChessScreen onExit={home} />;
    case "dreamcards": return <DreamCards onExit={home} />;
    case "rewards": return <Rewards go={go} />;
    case "parent-gate": return <ParentGate onPass={() => go({ name: "parent" })} onBack={home} />;
    case "parent": return <ParentDashboard onExit={home} />;
    case "break": return <BreakScreen go={go} />;
    default: return <HomeScreen go={go} />;
  }
}

/* ---------------- Profile select ---------------- */

function ProfileSelect({ go }: { go: (s: Screen) => void }) {
  const { state, dispatch, remainingSeconds } = useStore();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-2xl px-4 pt-[8vh] text-center"
    >
      {/* Brand mark (in-app only — exported keepsakes carry no branding) */}
      <img src="/icons/icon-192.png" alt="" aria-hidden className="mx-auto h-24 w-24 rounded-[1.6rem] shadow-lg" />
      <h1 className="mt-4 bg-gradient-to-r from-tint to-sky bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
        Lamora
      </h1>
      <p className="mt-2 text-lg text-ink-2">Learn, play and grow — who is playing today?</p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {state.profiles.map(p => (
          <motion.button
            key={p.id}
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -4 }}
            onClick={() => {
              sfx.chime(); haptic(15);
              dispatch({ type: "select", id: p.id });
              const used = p.usage[todayKey()] ?? 0;
              if (state.settings.dailyLimitMin * 60 - used <= 0) go({ name: "break" });
              else { go({ name: "home" }); speak(`Hello ${p.name}! Let's learn and play!`); }
            }}
            aria-label={`Play as ${p.name}`}
            className="glass flex w-40 flex-col items-center gap-2 rounded-[1.75rem] p-6"
          >
            <span className="text-5xl" aria-hidden>{p.avatar}</span>
            <span className="text-xl font-bold">{p.name}</span>
            <span className="text-sm text-ink-2">⭐ {p.totalStars}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-8">
        <Btn kind="ghost" onClick={() => go({ name: "parent-gate" })}>
          <Lock size={16} aria-hidden /> Parent zone
        </Btn>
      </div>
    </motion.div>
  );
}

/* ---------------- Home ---------------- */

function HomeScreen({ go }: { go: (s: Screen) => void }) {
  const { profile } = useStore();
  const tiles: { icon: React.ReactNode; label: string; sub: string; screen: Screen; tint: string }[] = [
    { icon: <BookOpen className="text-tint" />, label: "Reading & Writing", sub: "Letters, words & stories", screen: { name: "reading" }, tint: "from-tint/15 to-tint/5" },
    { icon: <Calculator className="text-mint" />, label: "Maths Journey", sub: "Count, add & multiply", screen: { name: "math" }, tint: "from-mint/15 to-mint/5" },
    { icon: <Globe2 className="text-sky" />, label: "Did You Know?", sub: "World curiosities", screen: { name: "trivia" }, tint: "from-sky/15 to-sky/5" },
    { icon: <Gamepad2 className="text-coral" />, label: "Play", sub: "Reward games", screen: { name: "games" }, tint: "from-coral/15 to-coral/5" },
    { icon: <Crown className="text-sun" />, label: "Chess", sub: "Puzzles & play", screen: { name: "chess" }, tint: "from-sun/15 to-sun/5" },
    { icon: <Sparkles className="text-tint" />, label: "Dream Cards", sub: "When I grow up…", screen: { name: "dreamcards" }, tint: "from-tint/15 to-sky/10" },
    { icon: <Trophy className="text-sun" />, label: "My Rewards", sub: "See your progress", screen: { name: "rewards" }, tint: "from-sun/15 to-coral/5" }
  ];
  return (
    <Shell title={`Hello, ${profile?.name ?? "friend"}! 👋`} subtitle="What would you like to do today?" wide>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map(t => (
          <Tile key={t.label} icon={t.icon} label={t.label} sub={t.sub} tintClass={t.tint} onClick={() => go(t.screen)} />
        ))}
      </div>
    </Shell>
  );
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
            <div className="text-3xl font-extrabold text-tint">{value}</div>
            <div className="mt-1 text-sm text-ink-2">{label}</div>
          </div>
        ))}
      </div>
      <div className="glass mt-5 rounded-3xl p-5">
        <p className="mb-2 font-semibold">Next play session</p>
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
      <div className="glass rounded-[1.75rem] p-10 text-center">
        <Moon size={56} className="mx-auto text-tint" aria-hidden />
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
