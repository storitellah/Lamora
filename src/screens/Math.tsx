/**
 * Progressive Mathematics — number tiers from 1–10 up to 100+, with
 * addition, subtraction, multiplication and division, plus interactive
 * visual counters (manipulatives) so younger children can *see* a sum.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, X, Divide, Lock } from "lucide-react";
import { Shell, Tile, toast } from "../components/UI";
import { Quiz, QuizQuestion } from "../components/Quiz";
import { useStore } from "../lib/store";

interface Tier { id: string; label: string; lo: number; hi: number; emoji: string }

const TIERS: Tier[] = [
  { id: "t1", label: "1 – 10", lo: 1, hi: 10, emoji: "🐣" },
  { id: "t2", label: "10 – 20", lo: 10, hi: 20, emoji: "🐥" },
  { id: "t3", label: "20 – 30", lo: 20, hi: 30, emoji: "🦊" },
  { id: "t4", label: "30 – 40", lo: 30, hi: 40, emoji: "🦉" },
  { id: "t5", label: "40 – 100", lo: 40, hi: 100, emoji: "🦅" },
  { id: "t6", label: "100 +", lo: 100, hi: 500, emoji: "🐉" }
];

type Op = "add" | "sub" | "mul" | "div";
const OPS: { id: Op; name: string; icon: React.ReactNode; color: string }[] = [
  { id: "add", name: "Adding", icon: <Plus />, color: "text-mint" },
  { id: "sub", name: "Taking away", icon: <Minus />, color: "text-sky" },
  { id: "mul", name: "Times", icon: <X />, color: "text-sun" },
  { id: "div", name: "Sharing", icon: <Divide />, color: "text-coral" }
];

const rnd = (n: number) => Math.floor(Math.random() * n);
const range = (a: number, b: number) => a + rnd(b - a + 1);

function distractors(answer: number, spread: number, count: number): number[] {
  const set = new Set([answer]);
  let guard = 0;
  while (set.size < count + 1 && guard++ < 80) {
    const d = answer + rnd(spread * 2 + 1) - spread;
    if (d >= 0 && d !== answer) set.add(d);
  }
  return [...set];
}

/**
 * Manipulatives: rows of tappable dots representing each operand.
 * Tapping a dot pops it with a tick sound — children count by touching,
 * exactly like counters on a table. Only shown when numbers are small
 * enough to count (≤ 20 total).
 */
function Counters({ groups, colors }: { groups: number[]; colors: string[] }) {
  const total = groups.reduce((a, b) => a + b, 0);
  if (total > 20 || total === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-4" aria-label={`Counters showing ${groups.join(" and ")}`}>
      {groups.map((n, gi) => (
        <div key={gi} className="flex max-w-40 flex-wrap justify-center gap-1.5">
          {Array.from({ length: n }, (_, i) => (
            <motion.button
              key={i}
              aria-label="counter"
              whileTap={{ scale: 1.5 }}
              transition={{ type: "spring", stiffness: 500, damping: 12 }}
              className={`h-7 w-7 rounded-full ${colors[gi % colors.length]} shadow-sm`}
              onClick={e => {
                // Visual "counted" state helps children keep track.
                (e.currentTarget as HTMLElement).style.opacity = "0.35";
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function buildQuestion(op: Op, tier: Tier): QuizQuestion {
  const { lo, hi } = tier;
  if (op === "add") {
    const a = range(Math.max(1, Math.floor(lo / 2)), Math.floor(hi / 2));
    const b = range(1, Math.ceil(hi / 2));
    return {
      prompt: `${a} + ${b} = ?`,
      speakText: `What is ${a} plus ${b}?`,
      visual: <Counters groups={[a, b]} colors={["bg-tint", "bg-sky"]} />,
      choices: distractors(a + b, Math.max(2, Math.floor(hi / 8)), 3).map(String),
      answer: String(a + b),
      hint: `Count on from ${Math.max(a, b)}.`,
      explain: `${a} plus ${b} makes ${a + b}.`
    };
  }
  if (op === "sub") {
    const a = range(Math.max(3, lo), hi);
    const b = range(1, Math.min(a - 1, Math.ceil(hi / 2)));
    return {
      prompt: `${a} − ${b} = ?`,
      speakText: `What is ${a} take away ${b}?`,
      visual: <Counters groups={[a]} colors={["bg-coral"]} />,
      choices: distractors(a - b, Math.max(2, Math.floor(hi / 8)), 3).map(String),
      answer: String(a - b),
      hint: `Start at ${a} and count back ${b}. Tap ${b} counters to take them away!`,
      explain: `${a} take away ${b} leaves ${a - b}.`
    };
  }
  if (op === "mul") {
    // Keep factors small; the tier scales the table being practised.
    const table = Math.min(12, Math.max(2, Math.floor(hi / 10) + 1));
    const a = range(2, table);
    const b = range(2, Math.min(10, Math.max(3, Math.floor(hi / 6))));
    return {
      prompt: `${a} × ${b} = ?`,
      speakText: `What is ${a} times ${b}?`,
      visual: <Counters groups={Array.from({ length: Math.min(a, 4) }, () => b)} colors={["bg-sun", "bg-mint", "bg-sky", "bg-tint"]} />,
      choices: distractors(a * b, a + 2, 3).map(String),
      answer: String(a * b),
      hint: `${a} groups of ${b} — count them group by group.`,
      explain: `${a} groups of ${b} make ${a * b}.`
    };
  }
  // Division — always exact, framed as fair sharing.
  const share = range(2, Math.min(9, Math.max(3, Math.floor(tier.hi / 8))));
  const each = range(1, Math.min(9, Math.max(3, Math.floor(tier.hi / share))));
  const totalN = share * each;
  return {
    prompt: `${totalN} ÷ ${share} = ?`,
    speakText: `Share ${totalN} between ${share}. How many each?`,
    visual: <Counters groups={[totalN]} colors={["bg-mint"]} />,
    choices: distractors(each, 3, 3).map(String),
    answer: String(each),
    hint: `Deal them out into ${share} equal groups.`,
    explain: `${totalN} shared between ${share} is ${each} each.`
  };
}

export default function MathScreen({ onExit }: { onExit: () => void }) {
  const { level, profile } = useStore();
  const [tier, setTier] = useState<Tier | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [session, setSession] = useState(0); // bump to regenerate questions

  // Progressive unlock: higher tiers open with age OR with practice
  // (completing any math activity 3+ times unlocks the next tier).
  const mathDone = profile ? Object.entries(profile.done)
    .filter(([k]) => k.startsWith("math-"))
    .reduce((a, [, n]) => a + n, 0) : 0;
  const unlockedTiers = Math.min(TIERS.length, level * 2 + Math.floor(mathDone / 3));

  const questions = useMemo(
    () => (tier && op ? Array.from({ length: 5 }, () => buildQuestion(op, tier)) : []),
    [tier, op, session]
  );

  if (tier && op) {
    const meta = OPS.find(o => o.id === op)!;
    return (
      <Quiz
        title={`${meta.name} ${tier.label}`}
        activity={`math-${op}-${tier.id}`}
        questions={questions}
        onBack={() => setOp(null)}
        onAgain={() => setSession(s => s + 1)}
        againLabel={`More ${meta.name.toLowerCase()}`}
      />
    );
  }

  if (tier) {
    // Younger children start with + and −; × and ÷ open from level 2
    // or once the child has practised into tier 3+.
    const opsOpen = level >= 2 || TIERS.indexOf(tier) >= 2 ? 4 : 2;
    return (
      <Shell title={`Numbers ${tier.label}`} subtitle="Pick what to practise" onBack={() => setTier(null)}>
        <div className="grid grid-cols-2 gap-4">
          {OPS.map((o, i) => (
            <Tile
              key={o.id}
              icon={<span className={o.color}>{o.icon}</span>}
              label={o.name}
              locked={i >= opsOpen}
              onClick={() => {
                if (i >= opsOpen) { toast("Keep practising to unlock this! 🔒"); return; }
                setSession(s => s + 1);
                setOp(o.id);
              }}
            />
          ))}
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Maths Journey" subtitle="Climb the number mountain, one step at a time!" onBack={onExit}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {TIERS.map((t, i) => (
          <Tile
            key={t.id}
            emoji={i < unlockedTiers ? t.emoji : undefined}
            icon={i >= unlockedTiers ? <Lock className="text-ink-2" /> : undefined}
            label={t.label}
            sub={i < unlockedTiers ? "Ready!" : "Practise to unlock"}
            locked={i >= unlockedTiers}
            onClick={() => {
              if (i >= unlockedTiers) { toast("Finish more lessons to unlock this level! 🏔️"); return; }
              setTier(t);
            }}
          />
        ))}
      </div>
    </Shell>
  );
}
