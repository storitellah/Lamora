/**
 * Lamora UI kit — small set of tactile, Apple-flavoured primitives.
 * Every interactive element is ≥44×44pt, has a visible focus state and a
 * springy press animation (disabled automatically in reduced-motion).
 */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { sfx, haptic } from "../lib/audio";

/* ---------------- Buttons ---------------- */

const press = { whileTap: { scale: 0.94 }, whileHover: { scale: 1.02 } };
const spring = { type: "spring" as const, stiffness: 500, damping: 30 };

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
  const kinds: Record<string, string> = {
    primary: "bg-tint text-white shadow-lg shadow-tint/30",
    good: "bg-mint text-white shadow-lg shadow-mint/30",
    danger: "bg-coral text-white shadow-lg shadow-coral/30",
    soft: "glass text-ink",
    ghost: "bg-transparent text-tint"
  };
  return (
    <motion.button
      {...press}
      transition={spring}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => { if (disabled) return; sfx.tap(); haptic(); onClick?.(); }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3
        text-base font-semibold disabled:opacity-40 ${kinds[kind]} ${className}`}
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
      className={`glass flex min-h-[8.5rem] flex-col items-center justify-center gap-2 rounded-[1.75rem]
        p-5 text-center ${locked ? "opacity-50" : ""}`}
    >
      <span
        aria-hidden
        className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br text-3xl ${tintClass}`}
      >
        {icon ?? emoji}
      </span>
      <span className="text-[1.05rem] font-bold leading-tight">{label}</span>
      {sub && <span className="text-sm text-ink-2">{sub}</span>}
    </motion.button>
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className={`mx-auto w-full ${wide ? "max-w-5xl" : "max-w-2xl"} px-4 pb-10`}
    >
      {onBack && (
        <div className="mb-3">
          <Btn kind="soft" onClick={onBack} ariaLabel="Go back" className="!px-4">
            <ArrowLeft size={20} aria-hidden /> Back
          </Btn>
        </div>
      )}
      <h1 className="text-center text-3xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 mb-5 text-center text-ink-2">{subtitle}</p>}
      {!subtitle && <div className="mb-5" />}
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
      className="glass-heavy fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3
        text-center text-base font-semibold"
    >
      {msg}
    </motion.div>
  );
}
