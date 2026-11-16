/**
 * Welcome — the front door of Lamora, designed like a product landing page.
 *
 * It has two audiences at once. A child needs exactly one thing, and gets it
 * first and biggest: "Who's playing today?". A grown-up who scrolls gets the
 * story — what is inside, why it is safe, and how to install it.
 */
import React from "react";
import { motion } from "framer-motion";
import {
  Lock, ShieldCheck, WifiOff, EyeOff, BadgeX, Timer, GraduationCap, HeartHandshake,
  Tablet, Smartphone, MonitorSmartphone, ArrowDown
} from "lucide-react";
import { useStore, Screen, todayKey } from "../lib/store";
import { Btn, WorldCard, toast } from "../components/UI";
import { sfx, speak, haptic } from "../lib/audio";
import { WORLDS } from "../data/worlds";

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.07 * i, ease: [0.2, 0.8, 0.2, 1] as const } })
};

/** Decorative pieces that float around the hero. Hidden from assistive tech. */
const FLOATERS: { e: string; cls: string; tilt: string; slow?: boolean }[] = [
  { e: "🚀", cls: "left-[4%] top-[14%] text-6xl", tilt: "-12deg" },
  { e: "🎨", cls: "right-[6%] top-[10%] text-6xl", tilt: "10deg", slow: true },
  { e: "🦋", cls: "left-[10%] top-[58%] text-5xl", tilt: "8deg", slow: true },
  { e: "⭐", cls: "right-[12%] top-[52%] text-5xl", tilt: "-8deg" },
  { e: "📚", cls: "left-[22%] top-[84%] text-5xl", tilt: "-6deg" },
  { e: "🧩", cls: "right-[24%] top-[86%] text-5xl", tilt: "12deg", slow: true }
];

const AVATAR_RINGS = [
  "from-[#7566ff] to-[#2aa9f5]", "from-[#ff6aa6] to-[#ffbe3b]", "from-[#22cfa0] to-[#1c74dd]",
  "from-[#c06bf5] to-[#ff6aa6]", "from-[#ffbe3b] to-[#ff5c6c]", "from-[#3dbcff] to-[#7566ff]"
];

export default function Welcome({ go }: { go: (s: Screen) => void }) {
  const { state, dispatch } = useStore();

  function play(id: string) {
    const p = state.profiles.find(x => x.id === id)!;
    sfx.chime(); haptic(15);
    dispatch({ type: "select", id });
    const used = p.usage[todayKey()] ?? 0;
    if (state.settings.dailyLimitMin * 60 - used <= 0) go({ name: "break" });
    else { go({ name: "home" }); speak(`Hello ${p.name}! Let's learn and play!`); }
  }

  const toTop = () => { window.scrollTo({ top: 0, behavior: "smooth" }); toast("First, tap who's playing 👆"); };

  return (
    <div className="overflow-x-clip">
      {/* ---- Nav ---- */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-5" aria-label="Lamora"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <span className="flex items-center gap-2.5">
          {/* Brand mark (in-app only — exported keepsakes carry no branding) */}
          <img src="/icons/icon-192.png" alt="" aria-hidden className="h-10 w-10 rounded-[0.8rem] shadow-md" />
          <span className="font-display text-2xl font-bold tracking-tight">Lamora</span>
        </span>
        <Btn kind="soft" className="!px-4 !py-2 text-sm" onClick={() => go({ name: "parent-gate" })}>
          <Lock size={15} aria-hidden /> Parent zone
        </Btn>
      </nav>

      {/* ---- Hero ---- */}
      <header className="relative mx-auto max-w-6xl px-5 pb-10 pt-10 text-center sm:pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
          {FLOATERS.map(f => (
            <span key={f.e} className={`absolute drop-shadow-[0_14px_18px_rgba(23,21,59,.18)] ${f.cls}`}
              style={{ ["--tilt" as any]: f.tilt, animation: f.slow ? "var(--animate-float-slow)" : "var(--animate-float)" }}>
              {f.e}
            </span>
          ))}
        </div>

        <motion.p variants={rise} initial="hidden" animate="show" className="eyebrow">Learn · Play · Grow — ages 4 to 10</motion.p>
        <motion.h1 variants={rise} custom={1} initial="hidden" animate="show"
          className="mx-auto mt-3 max-w-3xl text-[2.7rem] leading-[1.02] sm:text-[4.2rem]">
          Big adventures for{" "}
          <span className="relative whitespace-nowrap">
            <span className="bg-gradient-to-r from-tint via-plum to-coral bg-clip-text text-transparent">little minds.</span>
            <svg aria-hidden viewBox="0 0 300 14" className="absolute -bottom-2 left-0 w-full" preserveAspectRatio="none">
              <motion.path d="M3 9 C 60 2, 110 13, 160 7 S 260 3, 297 8" fill="none" stroke="#ffb224" strokeWidth="5" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }} />
            </svg>
          </span>
        </motion.h1>
        <motion.p variants={rise} custom={2} initial="hidden" animate="show"
          className="mx-auto mt-5 max-w-xl text-lg text-ink-2">
          Reading, maths, languages, art and puzzles in one calm, beautiful place — with no ads, no accounts and nothing to buy.
        </motion.p>

        {/* ---- Profile picker: the one thing a child needs ---- */}
        <motion.section variants={rise} custom={3} initial="hidden" animate="show" aria-labelledby="who"
          className="glass-heavy relative mx-auto mt-9 max-w-3xl rounded-[2.25rem] p-6 sm:p-8">
          <h2 id="who" className="text-2xl sm:text-[1.9rem]">Who's playing today?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4 sm:gap-6">
            {state.profiles.map((p, i) => (
              <motion.button key={p.id} whileTap={{ scale: 0.93 }} whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 420, damping: 20 }}
                onClick={() => play(p.id)} aria-label={`Play as ${p.name}`}
                className="group flex w-[7.2rem] flex-col items-center gap-2 sm:w-32">
                <span className={`grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br p-[5px] shadow-[0_14px_30px_-10px_rgba(23,21,59,.45)] sm:h-28 sm:w-28 ${AVATAR_RINGS[i % AVATAR_RINGS.length]}`}>
                  <span className="grid h-full w-full place-items-center rounded-full bg-white text-5xl transition-transform duration-300 group-hover:scale-110 sm:text-6xl" aria-hidden>
                    {p.avatar}
                  </span>
                </span>
                <span className="text-lg font-extrabold leading-tight">{p.name}</span>
                <span className="rounded-full bg-sun/20 px-2.5 py-0.5 text-sm font-extrabold">⭐ {p.totalStars}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ---- Trust strip ---- */}
        <motion.ul variants={rise} custom={4} initial="hidden" animate="show"
          className="mx-auto mt-7 flex max-w-3xl flex-wrap justify-center gap-2.5 text-sm font-bold text-ink-2">
          {[[BadgeX, "No ads"], [EyeOff, "No tracking"], [ShieldCheck, "No accounts"], [WifiOff, "Works offline"]].map(([Icon, t]: any) => (
            <li key={t} className="flex items-center gap-1.5 rounded-full border border-ink/8 bg-white/70 px-3.5 py-1.5">
              <Icon size={15} className="text-mint" aria-hidden /> {t}
            </li>
          ))}
        </motion.ul>

        <a href="#worlds" className="mt-8 inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-ink-2 hover:text-tint">
          Grown-ups: see what's inside <ArrowDown size={15} aria-hidden />
        </a>
      </header>

      {/* ---- Worlds ---- */}
      <section id="worlds" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-12" aria-labelledby="worlds-h">
        <Reveal>
          <p className="eyebrow text-center">What's inside</p>
          <h2 id="worlds-h" className="mx-auto mt-2 max-w-2xl text-center text-[2rem] leading-[1.08] sm:text-[2.7rem]">Twelve worlds. One calm place.</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-2">
            Every world is a different colour, so children find their way by sight long before they can read the labels.
          </p>
        </Reveal>
        <div className="mt-9 grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {WORLDS.map((w, i) => (
            <Reveal key={w.id} i={i % 4}>
              <WorldCard label={w.label} sub={w.sub} icon={w.icon} gradient={w.gradient} onClick={toTop} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- For grown-ups ---- */}
      <section className="mx-auto max-w-6xl px-5 py-12" aria-labelledby="grownups-h">
        <Reveal>
          <p className="eyebrow text-center">For grown-ups</p>
          <h2 id="grownups-h" className="mx-auto mt-2 max-w-2xl text-center text-[2rem] leading-[1.08] sm:text-[2.7rem]">Screen time you can feel good about.</h2>
        </Reveal>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {[
            { Icon: ShieldCheck, c: "text-mint bg-mint/12", t: "Private by design", d: "Everything — progress, drawings, photos — stays on this device. There is no server, no login and no analytics. Nothing can leak, because nothing is collected." },
            { Icon: Timer, c: "text-coral bg-coral/12", t: "You set the limits", d: "A daily screen-time cap, short reward-game sessions earned by learning, and a PIN-protected parent zone. When time is up, Lamora suggests something to do away from the screen." },
            { Icon: GraduationCap, c: "text-tint bg-tint/12", t: "Follows a real curriculum", d: "Workbooks map to the Cambridge Early Years and Primary frameworks, from Pre-Primary 1 to Grade 3, so what happens at home matches what happens at school." }
          ].map((f, i) => (
            <Reveal key={f.t} i={i}>
              <article className="glass lift h-full rounded-[1.75rem] p-7">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${f.c}`}><f.Icon size={24} aria-hidden /></span>
                <h3 className="mt-4 font-display text-[1.45rem] font-bold leading-tight tracking-tight">{f.t}</h3>
                <p className="mt-2 text-ink-2">{f.d}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <dl className="mt-4 grid grid-cols-2 gap-4 overflow-hidden rounded-[1.75rem] bg-ink p-7 text-white md:grid-cols-4">
            {[["0", "adverts, ever"], ["0", "accounts or sign-ups"], ["100%", "works offline"], ["12", "worlds to explore"]].map(([n, l]) => (
              <div key={l} className="text-center">
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-[2.6rem] font-bold leading-none text-[#ffd166]">{n}</dd>
                <dd className="mt-1.5 text-sm font-semibold text-white/75">{l}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* ---- Kind by design + install ---- */}
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-2">
        <Reveal>
          <article className="relative h-full overflow-hidden rounded-[2rem] p-8 text-white" style={{ background: "linear-gradient(140deg,#7566ff,#3b2bc2)" }}>
            <span aria-hidden className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
            <HeartHandshake size={30} aria-hidden />
            <h3 className="mt-4 font-display text-[1.9rem] font-bold leading-[1.08] tracking-tight">Kind by design.</h3>
            <p className="mt-3 text-white/85">
              A wrong answer gets a hint and another try — never a buzzer, never shame. Learning earns play, openly, with no tricks and nothing to buy.
            </p>
          </article>
        </Reveal>
        <Reveal i={1}>
          <article className="glass h-full rounded-[2rem] p-8">
            <MonitorSmartphone size={30} className="text-tint" aria-hidden />
            <h3 className="mt-4 font-display text-[1.9rem] font-bold leading-[1.08] tracking-tight">Take it anywhere.</h3>
            <ul className="mt-4 space-y-3 text-ink-2">
              <li className="flex gap-3"><Tablet size={20} className="mt-0.5 shrink-0 text-tint" aria-hidden /><span><b className="text-ink">iPad & iPhone:</b> in Safari tap Share, then <i>Add to Home Screen</i>.</span></li>
              <li className="flex gap-3"><Smartphone size={20} className="mt-0.5 shrink-0 text-tint" aria-hidden /><span><b className="text-ink">Android:</b> install the Lamora app, or Chrome menu → <i>Install app</i>.</span></li>
              <li className="flex gap-3"><MonitorSmartphone size={20} className="mt-0.5 shrink-0 text-tint" aria-hidden /><span><b className="text-ink">Mac & Windows:</b> use the install button in the address bar.</span></li>
            </ul>
            <p className="mt-4 text-sm font-semibold text-ink-2">After the first visit it works with no internet at all — perfect for flights and car rides.</p>
          </article>
        </Reveal>
      </section>

      <div className="px-5 pb-4 pt-6 text-center">
        <Btn className="shine !px-8 !py-4 text-lg" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Choose who's playing</Btn>
      </div>
    </div>
  );
}

/** Fade-and-rise when a block scrolls into view (once). */
function Reveal({ children, i = 0 }: { children: React.ReactNode; i?: number }) {
  return (
    <motion.div variants={rise} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="h-full">
      {children}
    </motion.div>
  );
}
