/**
 * Lamora UI kit — a small set of tactile, storybook-flavoured primitives.
 * Every interactive element is ≥44×44pt, has a visible focus state and a
 * springy press animation (disabled automatically in reduced-motion).
 */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { sfx, haptic } from "../lib/audio";

/* ---------------- Buttons ---------------- */

const press = { whileTap: { scale: 0.95 }, whileHover: { scale: 1.025 } };
const spring = { type: "spring" as const, stiffness: 520, damping: 28 };

export function Btn({
  children, onClick, kind = "primary", className = "", ariaLabel, disabled
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: "primary" | "soft" | "ghost" | "danger" | "good";
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  // Filled buttons get a top-lit gradient and a coloured shadow, so they read
  // as physical, pressable objects rather than flat rectangles.
  const kinds: Record<string, string> = {
    primary: "bg-gradient-to-b from-[#6f5cff] to-tint text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_10px_24px_-8px_rgba(90,71,240,.65)]",
    good: "bg-gradient-to-b from-[#2fd3a0] to-mint text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_10px_24px_-8px_rgba(18,184,134,.6)]",
    danger: "bg-gradient-to-b from-[#ff7c88] to-coral text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_10px_24px_-8px_rgba(255,92,108,.6)]",
    soft: "glass text-ink",
    ghost: "bg-transparent text-tint hover:bg-tint/8"
  };
  return (
    <motion.button
      {...press}
      transition={spring}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => { if (disabled) return; sfx.tap(); haptic(); onClick?.(); }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3
        text-base font-extrabold tracking-[-0.01em] disabled:opacity-40 ${kinds[kind]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

/* ---------------- Big menu tile ---------------- */

export function Tile({
  emoji, icon, label, sub, onClick, locked, tintClass = "from-tint/15 to-sky/15"
}: {
  emoji?: string;
  icon?: React.ReactNode;
  label: string;
  sub?: string;
  onClick: () => void;
  locked?: boolean;
  tintClass?: string;
}) {
  return (
    <motion.button
      {...press}
      transition={spring}
      onClick={() => { sfx.tap(); haptic(); onClick(); }}
      aria-label={label + (sub ? ". " + sub : "") + (locked ? ". Locked" : "")}
      className={`glass lift group relative flex min-h-[9rem] flex-col items-center justify-center gap-2 overflow-hidden
        rounded-[1.75rem] p-5 text-center ${locked ? "opacity-55 saturate-50" : ""}`}
    >
      <span
        aria-hidden
        className={`grid h-16 w-16 place-items-center rounded-[1.35rem] bg-gradient-to-br text-3xl
          ring-1 ring-ink/5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${tintClass}`}
      >
        {icon ?? emoji}
      </span>
      <span className="text-[1.05rem] font-extrabold leading-tight tracking-[-0.01em]">{label}</span>
      {sub && <span className="text-sm leading-snug text-ink-2">{sub}</span>}
    </motion.button>
  );
}

/* ---------------- World card (home + welcome) ---------------- */

/**
 * A saturated, full-colour card for one learning pathway. Each pathway owns
 * a gradient "world"; the oversized ghost icon and soft highlight give the
 * card depth without any images.
 */
export function WorldCard({
  label, sub, icon, gradient, onClick, size = "md", badge
}: {
  label: string;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
  onClick?: () => void;
  size?: "md" | "lg";
  badge?: string;
}) {
  const Tag: any = onClick ? motion.button : motion.div;
  return (
    <Tag
      {...(onClick ? { ...press, onClick: () => { sfx.tap(); haptic(); onClick(); }, "aria-label": label + (sub ? ". " + sub : "") } : {})}
      transition={spring}
      className={`lift group relative flex w-full flex-col justify-between overflow-hidden rounded-[1.75rem] p-5 text-left text-white
        shadow-[0_14px_34px_-14px_rgba(23,21,59,.55)] ${size === "lg" ? "min-h-[12.5rem] sm:p-6" : "min-h-[9.5rem]"}`}
      style={{ background: gradient }}
    >
      {/* soft top-left light + big ghost icon for depth */}
      <span aria-hidden className="pointer-events-none absolute -left-10 -top-16 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-7 -right-5 opacity-20 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110 [&>svg]:h-32 [&>svg]:w-32 [&>svg]:stroke-[1.4]">
        {icon}
      </span>
      <span aria-hidden className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/22 ring-1 ring-white/40 backdrop-blur-sm [&>svg]:h-6 [&>svg]:w-6 [&>svg]:stroke-[2.4]">
        {icon}
      </span>
      <span className="relative mt-4 block">
        {badge && <span className="mb-1.5 inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-[0.1em]">{badge}</span>}
        <span className={`block font-display font-bold leading-[1.05] ${size === "lg" ? "text-[1.7rem]" : "text-[1.3rem]"}`}>{label}</span>
        {sub && <span className="mt-1 block text-[0.9rem] font-semibold leading-snug text-white/85">{sub}</span>}
      </span>
    </Tag>
  );
}

/* ---------------- Screen shell (header + back) ---------------- */

export function Shell({
  title, subtitle, onBack, children, wide
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.2, 0.8, 0.2, 1] }}
      className={`mx-auto w-full ${wide ? "max-w-5xl" : "max-w-2xl"} px-4 pb-12`}
    >
      {onBack && (
        <div className="mb-2">
          <Btn kind="soft" onClick={onBack} ariaLabel="Go back" className="!px-4 !py-2">
            <ArrowLeft size={20} aria-hidden /> Back
          </Btn>
        </div>
      )}
      <h1 className="text-center text-[2.1rem] leading-[1.08] sm:text-[2.5rem]">{title}</h1>
      {subtitle && <p className="mx-auto mt-2 mb-6 max-w-xl text-center text-[1.02rem] text-ink-2">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      {children}
    </motion.div>
  );
}

/* ---------------- Progress pips ---------------- */

export function Pips({ total, done, current }: { total: number; done: number; current?: number }) {
  return (
    <div className="my-4 flex justify-center gap-2" role="img"
      aria-label={`Question ${(current ?? done) + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          layout
          className={`h-3.5 w-3.5 rounded-full ${
            i < done ? "bg-sun" : i === current ? "scale-125 bg-tint" : "bg-ink/15"
          }`}
        />
      ))}
    </div>
  );
}

/* ---------------- Confetti celebration ---------------- */

/** Lightweight DOM confetti — ~40 motion divs, auto-cleans. */
export function Confetti() {
  const colors = ["#ffb545", "#5b5bd6", "#38b6f5", "#2bbd8e", "#ff6b6b", "#c78bfa"];
  const bits = Array.from({ length: 40 }, (_, i) => ({
    x: Math.random() * 100, delay: Math.random() * 0.4, c: colors[i % colors.length],
    rot: Math.random() * 360, dur: 1.6 + Math.random()
  }));
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {bits.map((b, i) => (
        <motion.div
          key={i}
          initial={{ x: `${b.x}vw`, y: "-5vh", rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: b.rot + 720, opacity: [1, 1, 0.6] }}
          transition={{ duration: b.dur, delay: b.delay, ease: "easeIn" }}
          style={{ background: b.c }}
          className="absolute h-3 w-2 rounded-sm"
        />
      ))}
    </div>
  );
}

/* ---------------- Toast ---------------- */

type ToastListener = (msg: string) => void;
let toastListener: ToastListener | null = null;
export function toast(msg: string) { toastListener?.(msg); }

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let t: number;
    toastListener = (m) => {
      setMsg(m);
      clearTimeout(t);
      t = window.setTimeout(() => setMsg(null), 2400);
    };
    return () => { toastListener = null; };
  }, []);
  if (!msg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      className="fixed bottom-6 left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full bg-ink px-6 py-3
        text-center text-base font-bold text-white shadow-[0_18px_40px_-10px_rgba(23,21,59,.6)]"
    >
      {msg}
    </motion.div>
  );
}
