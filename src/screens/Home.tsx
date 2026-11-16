/**
 * Home — the child's dashboard.
 *
 * A greeting card shows the three things a child cares about (stars, saved
 * play sessions, time left) and suggests one world to try today. Below it,
 * the worlds are grouped by what you do there — learn, create, think & play —
 * each in its own colour.
 */
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Hourglass, Gamepad2, Trophy } from "lucide-react";
import { useStore, Screen } from "../lib/store";
import { WorldCard } from "../components/UI";
import { sfx, haptic } from "../lib/audio";
import { WORLDS, GROUPS } from "../data/worlds";

function partOfDay() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/** Circular progress toward the next play session. */
function StarRing({ value, of }: { value: number; of: number }) {
  const R = 34, C = 2 * Math.PI * R;
  const pct = Math.min(1, of ? value / of : 0);
  return (
    <span className="relative grid h-[5.5rem] w-[5.5rem] shrink-0 place-items-center" role="img" aria-label={`${value} of ${of} stars toward your next game`}>
      <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
        <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="8" />
        <motion.circle cx="40" cy="40" r={R} fill="none" stroke="#ffd166" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct) }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }} />
      </svg>
      <span className="text-center leading-none">
        <span className="block font-display text-2xl font-bold">{value}<span className="text-base text-white/70">/{of}</span></span>
        <span aria-hidden className="text-sm">⭐</span>
      </span>
    </span>
  );
}

export default function Home({ go }: { go: (s: Screen) => void }) {
  const { state, profile, remainingSeconds } = useStore();
  const per = state.settings.starsPerToken;
  const mins = Math.ceil(remainingSeconds / 60);

  // One gentle suggestion per day, the same all day so it feels intentional.
  const learnables = WORLDS.filter(w => w.group !== "me" && w.id !== "games");
  const pick = learnables[(new Date().getDate() + (profile?.name.length ?? 0)) % learnables.length];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="mx-auto w-full max-w-6xl px-4 pb-10">

      {/* ---- Greeting ---- */}
      <section className="relative overflow-hidden rounded-[2.25rem] p-6 text-white shadow-[0_24px_60px_-22px_rgba(59,43,194,.75)] sm:p-9"
        style={{ background: "linear-gradient(135deg,#7566ff 0%,#4a36d9 55%,#2f2296 100%)" }}>
        <span aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#ff6aa6]/35 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-[#2aa9f5]/35 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute right-6 top-5 hidden text-7xl opacity-90 sm:block"
          style={{ animation: "var(--animate-float)", ["--tilt" as any]: "8deg" }}>{profile?.avatar ?? "⭐"}</span>

        <div className="relative">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-white/70">{partOfDay()}</p>
          <h1 className="mt-1 text-[2.3rem] leading-[1.05] sm:text-[3.2rem]">Hello, {profile?.name ?? "friend"}! 👋</h1>
          <p className="mt-2 max-w-md text-lg text-white/85">What would you like to do today?</p>

          <div className="mt-6 flex flex-wrap items-stretch gap-3">
            <div className="flex items-center gap-4 rounded-[1.5rem] bg-white/12 p-3 pr-5 ring-1 ring-white/20 backdrop-blur-sm">
              <StarRing value={profile?.stars ?? 0} of={per} />
              <div>
                <p className="font-extrabold leading-tight">Next game</p>
                <p className="text-sm text-white/80">Earn {Math.max(0, per - (profile?.stars ?? 0))} more ⭐ by learning</p>
              </div>
            </div>
            <Stat icon={<Gamepad2 size={20} aria-hidden />} value={profile?.tokens ?? 0} label="games saved" />
            <Stat icon={<Trophy size={20} aria-hidden />} value={profile?.totalStars ?? 0} label="stars so far" />
            <Stat icon={<Hourglass size={20} aria-hidden />} value={`${mins}m`} label="left today" />
          </div>

          <button onClick={() => { sfx.tap(); haptic(); go(pick.screen); }}
            aria-label={`Today's idea: ${pick.label}`}
            className="shine group mt-5 inline-flex min-h-12 items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 text-ink shadow-[0_12px_28px_-10px_rgba(0,0,0,.45)] transition-transform active:scale-95">
            <span className="grid h-9 w-9 place-items-center rounded-full text-white [&>svg]:h-5 [&>svg]:w-5" style={{ background: pick.gradient }} aria-hidden>{pick.icon}</span>
            <span className="text-left leading-tight"><span className="block text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">Today's idea</span>
              <span className="font-extrabold">{pick.label}</span></span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden />
          </button>
        </div>
      </section>

      {/* ---- Worlds, grouped ---- */}
      {GROUPS.map((grp, gi) => {
        const worlds = WORLDS.filter(w => w.group === grp.id);
        return (
          <section key={grp.id} className="mt-9" aria-labelledby={`g-${grp.id}`}>
            <div className="mb-3.5 flex items-baseline justify-between gap-3 px-1">
              <h2 id={`g-${grp.id}`} className="text-[1.7rem] leading-none">{grp.title}</h2>
              <p className="text-right text-sm font-semibold text-ink-2">{grp.blurb}</p>
            </div>
            <div className={`grid grid-cols-2 gap-3.5 sm:gap-4 ${worlds.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
              {worlds.map((w, i) => (
                <motion.div key={w.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 + gi * 0.06 + i * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
                  className={worlds.length === 3 && i === 2 ? "max-md:col-span-2" : ""}>
                  <WorldCard label={w.label} sub={w.sub} icon={w.icon} gradient={w.gradient} onClick={() => go(w.screen)} />
                </motion.div>
              ))}
            </div>
          </section>
        );
      })}

      {/* ---- Rewards ---- */}
      <section className="mt-9">
        {WORLDS.filter(w => w.group === "me").map(w => (
          <button key={w.id} onClick={() => { sfx.tap(); haptic(); go(w.screen); }} aria-label={`${w.label}. ${w.sub}`}
            className="lift group flex w-full items-center gap-4 rounded-[1.75rem] p-5 text-left text-white shadow-[0_14px_34px_-14px_rgba(255,132,25,.7)]"
            style={{ background: w.gradient }}>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/25 ring-1 ring-white/40 [&>svg]:h-7 [&>svg]:w-7" aria-hidden>{w.icon}</span>
            <span className="flex-1"><span className="block font-display text-[1.45rem] font-bold leading-tight">{w.label}</span>
              <span className="font-semibold text-white/90">{w.sub}</span></span>
            <ArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden />
          </button>
        ))}
      </section>
    </motion.div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-[6.5rem] flex-1 flex-col justify-center rounded-[1.5rem] bg-white/12 px-4 py-3 ring-1 ring-white/20 backdrop-blur-sm sm:flex-none">
      <span className="flex items-center gap-1.5 text-white/75">{icon}</span>
      <span className="mt-1 font-display text-[1.7rem] font-bold leading-none">{value}</span>
      <span className="text-sm font-semibold text-white/80">{label}</span>
    </div>
  );
}
