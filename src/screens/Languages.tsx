/**
 * Languages — Portuguese and Kiswahili for young children.
 *
 * Built around three things that help small children pick up a language:
 *  - a picture for every word, so meaning comes from the image, not English;
 *  - hearing it, every time (tap 🔊, or it plays when the card appears);
 *  - saying it out loud — the app asks, and celebrates when they try.
 *
 * Each topic has three ways to play: Learn (picture cards), Listen & find
 * (hear a word, tap its picture) and Match (pair pictures with words).
 * Conversations put greetings together in tiny scenes to act out.
 */
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronLeft, ChevronRight, RotateCcw, Mic, Play } from "lucide-react";
import { Shell, Btn, Confetti, toast } from "../components/UI";
import { sfx, haptic, sayIn, preloadClips } from "../lib/audio";
import { useStore } from "../lib/store";
import { LANGS, TOPICS, DIALOGUES, LangId, LangItem, LangTopic, Dialogue, word, lineId } from "../data/languages";
import { allRecordings, cachedRecording, recKey } from "../lib/voiceRecordings";

/* ---------------- Audio helper ---------------- */

/** Folder for bundled clips: Brazilian vs European Portuguese, or Kiswahili. */
export const clipDir = (lang: LangId, variant: "br" | "pt") => (lang === "sw" ? "sw" : variant === "pt" ? "ptpt" : "pt");
export const voiceTags = (lang: LangId, variant: "br" | "pt") =>
  lang === "sw" ? LANGS.sw.voiceLangs : variant === "pt" ? ["pt-PT", "pt"] : ["pt-BR", "pt"];

function useSay(lang: LangId) {
  const { state } = useStore();
  const variant = state.settings.ptVariant ?? "br";
  const dir = clipDir(lang, variant);
  return {
    variant,
    // Recordings are looked up at the moment of speaking (not from React
    // state), so a word said as a screen opens already uses the family voice.
    say: (id: string, text: string) => sayIn({
      text: text.replace(/…/g, ""),
      langs: voiceTags(lang, variant),
      clip: `/audio/${dir}/${id}.mp3`,
      recording: cachedRecording(recKey(dir, id))
    }),
    preload: (ids: string[]) => preloadClips(ids.map(id => `/audio/${dir}/${id}.mp3`))
  };
}

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/* ---------------- Entry ---------------- */

type View =
  | { k: "pick" }
  | { k: "home"; lang: LangId }
  | { k: "topic"; lang: LangId; topic: LangTopic }
  | { k: "talk"; lang: LangId; dialogue?: Dialogue };

export default function Languages({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<View>({ k: "pick" });
  // Load any family recordings while the child is still choosing a language.
  useEffect(() => { void allRecordings(); }, []);
  if (view.k === "home") return <LangHome lang={view.lang} onBack={() => setView({ k: "pick" })}
    onTopic={t => setView({ k: "topic", lang: view.lang, topic: t })} onTalk={() => setView({ k: "talk", lang: view.lang })} />;
  if (view.k === "topic") return <TopicView lang={view.lang} topic={view.topic} onBack={() => setView({ k: "home", lang: view.lang })} />;
  if (view.k === "talk") return view.dialogue
    ? <DialogueView lang={view.lang} d={view.dialogue} onBack={() => setView({ k: "talk", lang: view.lang })} />
    : <DialogueList lang={view.lang} onBack={() => setView({ k: "home", lang: view.lang })} onOpen={d => setView({ k: "talk", lang: view.lang, dialogue: d })} />;
  return <LangPick onExit={onExit} onPick={l => setView({ k: "home", lang: l })} />;
}

const TOTAL = TOPICS.reduce((n, t) => n + t.items.length, 0);

function LangPick({ onExit, onPick }: { onExit: () => void; onPick: (l: LangId) => void }) {
  const { profile } = useStore();
  const card = (l: LangId, bg: string, hello: string, sub: string) => {
    const learned = profile?.langWords?.[l]?.length ?? 0;
    return (
      <motion.button whileTap={{ scale: 0.97 }} onClick={() => { sfx.chime(); haptic(); onPick(l); }}
        aria-label={`Learn ${LANGS[l].name}. ${learned} of ${TOTAL} words learned.`}
        className={`relative overflow-hidden rounded-[2rem] p-6 text-left text-white shadow-xl ${bg}`}>
        <div className="text-5xl" aria-hidden>{LANGS[l].flag}</div>
        <div className="mt-3 text-3xl font-extrabold">{LANGS[l].native}</div>
        <div className="text-white/85">{LANGS[l].name !== LANGS[l].native ? `${LANGS[l].name} · ` : ""}{sub}</div>
        <div className="mt-4 inline-flex rounded-full bg-white/25 px-4 py-1.5 text-lg font-bold">“{hello}”</div>
        <div className="mt-5">
          <div className="h-3 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${(learned / TOTAL) * 100}%` }} />
          </div>
          <div className="mt-1 text-sm font-semibold text-white/90">{learned} of {TOTAL} words learned</div>
        </div>
      </motion.button>
    );
  };
  return (
    <Shell title="Languages 🌍" subtitle="Learn to say hello to the world!" onBack={onExit} wide>
      <div className="grid gap-5 sm:grid-cols-2">
        {card("pt", "bg-gradient-to-br from-[#1aa260] to-[#0a7a8a]", "Olá!", "Brazil · Portugal · Mozambique")}
        {card("sw", "bg-gradient-to-br from-[#e0622a] to-[#a8327a]", "Jambo!", "Kenya · Tanzania · Uganda")}
      </div>
      <p className="mt-6 text-center text-ink-2">Tap 🔊 to hear every word — then say it out loud!</p>
    </Shell>
  );
}

/* ---------------- Language home ---------------- */

function LangHome({ lang, onBack, onTopic, onTalk }: { lang: LangId; onBack: () => void; onTopic: (t: LangTopic) => void; onTalk: () => void }) {
  const { profile } = useStore();
  const { say } = useSay(lang);
  const learned = new Set(profile?.langWords?.[lang] ?? []);
  const L = LANGS[lang];
  useEffect(() => { say("hello", lang === "sw" ? "Jambo" : "Olá"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Shell title={`${L.native} ${L.flag}`} subtitle={`${learned.size} of ${TOTAL} words learned — keep going!`} onBack={onBack} wide>
      <button onClick={() => say("hello", lang === "sw" ? "Jambo" : "Olá")}
        className="glass mx-auto mb-6 flex items-center gap-4 rounded-[2rem] px-6 py-4" aria-label={`Hear ${L.greeting}`}>
        <span className="text-5xl" aria-hidden>👋</span>
        <span className="text-left">
          <span className="block text-3xl font-extrabold">{L.greeting}</span>
          <span className="text-ink-2">means “Hello!”</span>
        </span>
        <Volume2 className="text-tint" aria-hidden />
      </button>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {TOPICS.map(t => {
          const n = t.items.filter(i => learned.has(i.id)).length;
          const done = n === t.items.length;
          return (
            <motion.button key={t.id} whileTap={{ scale: 0.96 }} onClick={() => { sfx.tap(); onTopic(t); }}
              aria-label={`${t.en}. ${n} of ${t.items.length} learned.`}
              className="glass flex flex-col items-center gap-1 rounded-[1.75rem] p-4 text-center">
              <span className="text-5xl" aria-hidden>{t.emoji}</span>
              <span className="mt-1 text-lg font-bold leading-tight">{lang === "sw" ? t.sw : t.pt}</span>
              <span className="text-sm text-ink-2">{t.en}</span>
              <span className={`mt-1 rounded-full px-3 py-0.5 text-xs font-bold ${done ? "bg-mint text-white" : "bg-ink/5 text-ink-2"}`}>
                {done ? "⭐ All learned!" : `${n} / ${t.items.length}`}
              </span>
            </motion.button>
          );
        })}
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => { sfx.tap(); onTalk(); }}
          className="glass flex flex-col items-center gap-1 rounded-[1.75rem] p-4 text-center" aria-label="Conversations">
          <span className="text-5xl" aria-hidden>💬</span>
          <span className="mt-1 text-lg font-bold leading-tight">{lang === "sw" ? "Mazungumzo" : "Conversas"}</span>
          <span className="text-sm text-ink-2">Little conversations</span>
        </motion.button>
      </div>
    </Shell>
  );
}

/* ---------------- Topic: three ways to play ---------------- */

type Mode = "learn" | "listen" | "match";

function TopicView({ lang, topic, onBack }: { lang: LangId; topic: LangTopic; onBack: () => void }) {
  const [mode, setMode] = useState<Mode>("learn");
  const { preload } = useSay(lang);
  useEffect(() => { preload([...topic.items.map(i => i.id), ...LANGS[lang].cheer.map((_, i) => `cheer-${i}`), ...LANGS[lang].tryAgain.map((_, i) => `again-${i}`)]); }, [topic]); // eslint-disable-line react-hooks/exhaustive-deps
  const tabs: [Mode, string][] = [["learn", "📖 Learn"], ["listen", "👂 Listen & find"], ["match", "🧩 Match"]];
  return (
    <Shell title={`${topic.emoji} ${lang === "sw" ? topic.sw : topic.pt}`} subtitle={topic.en} onBack={onBack}>
      <div className="mb-5 flex flex-wrap justify-center gap-2" role="tablist">
        {tabs.map(([m, label]) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => { setMode(m); sfx.tap(); }}
            className={`min-h-11 rounded-full px-4 text-sm font-bold ${mode === m ? "bg-tint text-white shadow-md shadow-tint/30" : "glass"}`}>
            {label}
          </button>
        ))}
      </div>
      {mode === "learn" && <LearnCards key={topic.id} lang={lang} topic={topic} onDone={() => setMode("listen")} />}
      {mode === "listen" && <ListenFind key={topic.id + "l"} lang={lang} topic={topic} />}
      {mode === "match" && <MatchPairs key={topic.id + "m"} lang={lang} topic={topic} />}
    </Shell>
  );
}

function Cheer({ lang, text }: { lang: LangId; text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 top-1/3 z-50 mx-auto w-fit rounded-[2rem] bg-white px-8 py-5 text-center shadow-2xl" role="status">
          <div className="text-4xl font-extrabold text-mint">{text}</div>
          <div className="text-ink-2">{lang === "sw" ? "means “Well done!”" : "means “Well done!”"}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Picture cards: see it, hear it, say it. */
function LearnCards({ lang, topic, onDone }: { lang: LangId; topic: LangTopic; onDone: () => void }) {
  const { dispatch, profile } = useStore();
  const { say, variant } = useSay(lang);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [cheer, setCheer] = useState<string | null>(null);
  const it = topic.items[i];
  const w = word(it, lang, variant);
  const learned = new Set(profile?.langWords?.[lang] ?? []);
  const sayHint = lang === "sw" ? it.swSay : it.ptSay;
  const note = it.note?.[lang];

  // Hear each word as its card appears.
  useEffect(() => { const t = setTimeout(() => say(it.id, w), 250); return () => clearTimeout(t); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (d: number) => { setDir(d); setI((i + d + topic.items.length) % topic.items.length); sfx.flip(); };

  function saidIt() {
    haptic(20); sfx.star();
    const k = Math.floor(Math.random() * LANGS[lang].cheer.length);
    setCheer(LANGS[lang].cheer[k]);
    say(`cheer-${k}`, LANGS[lang].cheer[k]);
    setTimeout(() => setCheer(null), 1300);
    if (!learned.has(it.id)) dispatch({ type: "langLearned", lang, ids: [it.id] });
    const allNow = topic.items.every(x => x.id === it.id || learned.has(x.id));
    if (allNow && !topic.items.every(x => learned.has(x.id))) {
      dispatch({ type: "award", stars: 1, activity: `lang-${lang}-${topic.id}` });
      toast(`⭐ You learned every ${topic.en.toLowerCase()} word!`);
    }
    setTimeout(() => { if (i < topic.items.length - 1) go(1); }, 1100);
  }

  return (
    <div>
      <Cheer lang={lang} text={cheer} />
      <div className="relative mx-auto max-w-md">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={it.id}
            initial={{ opacity: 0, x: 50 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 * dir }}
            transition={{ duration: 0.22 }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5}
            onDragEnd={(_, info) => { if (info.offset.x < -70) go(1); else if (info.offset.x > 70) go(-1); }}
            className="glass-heavy rounded-[2rem] p-6 text-center">
            <button onClick={() => say(it.id, w)} aria-label={`Picture of ${it.en}. Tap to hear it in ${LANGS[lang].name}.`}
              className="mx-auto grid h-44 w-44 place-items-center rounded-[2rem] bg-gradient-to-br from-sky/15 to-tint/10 text-[6.5rem] leading-none">
              <span aria-hidden>{it.emoji}</span>
            </button>
            <div className="mt-4 text-4xl font-extrabold tracking-tight" lang={lang === "sw" ? "sw" : variant === "pt" ? "pt-PT" : "pt-BR"}>{w}</div>
            {sayHint && <div className="mt-1 text-sm font-semibold text-tint">say it like: <span className="font-mono">{sayHint}</span></div>}
            <div className="mt-1 text-lg text-ink-2">{it.en}</div>
            {learned.has(it.id) && <div className="mt-1 text-sm font-bold text-mint">⭐ learned</div>}
            {note && <p className="mx-auto mt-3 max-w-xs rounded-2xl bg-sun/15 px-4 py-2 text-sm">💡 {note}</p>}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Btn kind="soft" onClick={() => say(it.id, w)} ariaLabel={`Hear ${w}`}><Volume2 size={20} aria-hidden /> Hear it</Btn>
              <Btn kind="good" onClick={saidIt}><Mic size={18} aria-hidden /> I said it!</Btn>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <Btn kind="soft" onClick={() => go(-1)} ariaLabel="Previous word"><ChevronLeft aria-hidden /></Btn>
        <span className="min-w-16 text-center font-semibold text-ink-2">{i + 1} / {topic.items.length}</span>
        <Btn kind="soft" onClick={() => go(1)} ariaLabel="Next word"><ChevronRight aria-hidden /></Btn>
      </div>
      {i === topic.items.length - 1 && (
        <div className="mt-4 text-center"><Btn kind="primary" onClick={onDone}>👂 Now play Listen & find</Btn></div>
      )}
    </div>
  );
}

/** Hear a word, tap the matching picture. */
function ListenFind({ lang, topic }: { lang: LangId; topic: LangTopic }) {
  const { dispatch } = useStore();
  const { say, variant } = useSay(lang);
  const ROUNDS = Math.min(6, topic.items.length);
  const [order, setOrder] = useState(() => shuffle(topic.items).slice(0, ROUNDS));
  const [r, setR] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [right, setRight] = useState<string | null>(null);
  const [cheer, setCheer] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const target = order[r];
  const options = useMemo(() => target ? shuffle([target, ...shuffle(topic.items.filter(x => x.id !== target.id)).slice(0, 3)]) : [], [target]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (target && !finished) { const t = setTimeout(() => say(target.id, word(target, lang, variant)), 350); return () => clearTimeout(t); } }, [r, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  function choose(it: LangItem) {
    if (right || finished) return;
    if (it.id === target.id) {
      sfx.correct(); haptic(15);
      setRight(it.id);
      const first = wrong.size === 0;
      if (first) setScore(s => s + 1);
      dispatch({ type: "langLearned", lang, ids: [it.id] });
      const k = Math.floor(Math.random() * LANGS[lang].cheer.length);
      setCheer(LANGS[lang].cheer[k]); say(`cheer-${k}`, LANGS[lang].cheer[k]);
      setTimeout(() => {
        setCheer(null); setRight(null); setWrong(new Set());
        if (r + 1 >= ROUNDS) {
          setFinished(true);
          const total = score + (first ? 1 : 0);
          if (total >= Math.ceil(ROUNDS * 0.6)) { dispatch({ type: "award", stars: 1, activity: `lang-${lang}-listen` }); sfx.win(); }
        } else setR(r + 1);
      }, 1300);
    } else {
      sfx.wrong();
      setWrong(new Set(wrong).add(it.id));
      const k = Math.floor(Math.random() * LANGS[lang].tryAgain.length);
      say(`again-${k}`, LANGS[lang].tryAgain[k]);
      setTimeout(() => say(target.id, word(target, lang, variant)), 1500);
    }
  }

  if (finished) {
    return (
      <div className="glass rounded-[2rem] p-8 text-center">
        {score >= Math.ceil(ROUNDS * 0.6) && <Confetti />}
        <div className="text-6xl" aria-hidden>{score === ROUNDS ? "🏆" : "🌟"}</div>
        <p className="mt-3 text-2xl font-extrabold">{score} of {ROUNDS} first time!</p>
        <p className="text-ink-2">{score === ROUNDS ? "Perfect listening!" : "Great listening — play again to get even better."}</p>
        <Btn className="mt-5" onClick={() => { setOrder(shuffle(topic.items).slice(0, ROUNDS)); setR(0); setScore(0); setFinished(false); }}>
          <RotateCcw size={18} aria-hidden /> Play again
        </Btn>
      </div>
    );
  }

  return (
    <div>
      <Cheer lang={lang} text={cheer} />
      <div className="mb-4 text-center">
        <button onClick={() => say(target.id, word(target, lang, variant))} aria-label="Hear the word again"
          className="mx-auto flex items-center gap-3 rounded-full bg-tint px-7 py-4 text-xl font-bold text-white shadow-lg shadow-tint/30">
          <Volume2 aria-hidden /> Listen!
        </button>
        <p className="mt-2 text-ink-2">Which picture is it? · {r + 1} of {ROUNDS}</p>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
        {options.map(o => (
          <motion.button key={o.id} whileTap={{ scale: 0.95 }} onClick={() => choose(o)}
            aria-label={o.en}
            animate={wrong.has(o.id) ? { x: [0, -8, 8, -5, 0] } : {}}
            className={`grid aspect-square place-items-center rounded-[1.75rem] text-[4.5rem] leading-none transition-colors
              ${right === o.id ? "bg-mint/25 ring-4 ring-mint" : wrong.has(o.id) ? "bg-ink/5 opacity-40" : "glass"}`}>
            <span aria-hidden>{o.emoji}</span>
          </motion.button>
        ))}
      </div>
      {right && <p className="mt-4 text-center text-2xl font-extrabold">{word(target, lang, variant)} <span className="text-base font-normal text-ink-2">= {target.en}</span></p>}
    </div>
  );
}

/** Pair each picture with its word. */
function MatchPairs({ lang, topic }: { lang: LangId; topic: LangTopic }) {
  const { dispatch } = useStore();
  const { say, variant } = useSay(lang);
  const N = Math.min(5, topic.items.length);
  const [round, setRound] = useState(0);
  const items = useMemo(() => shuffle(topic.items).slice(0, N), [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const words = useMemo(() => shuffle(items), [items]);
  const [pic, setPic] = useState<string | null>(null);
  const [wd, setWd] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [miss, setMiss] = useState<string | null>(null);
  const finished = done.size === N;

  useEffect(() => { setDone(new Set()); setPic(null); setWd(null); }, [items]);

  function attempt(p: string | null, w: string | null) {
    if (!p || !w) return;
    if (p === w) {
      const it = items.find(x => x.id === p)!;
      sfx.correct(); haptic(12);
      say(it.id, word(it, lang, variant));
      const next = new Set(done).add(p);
      setDone(next);
      dispatch({ type: "langLearned", lang, ids: [p] });
      if (next.size === N) {
        setTimeout(() => { sfx.win(); const k = Math.floor(Math.random() * LANGS[lang].cheer.length); say(`cheer-${k}`, LANGS[lang].cheer[k]); }, 900);
        dispatch({ type: "award", stars: 1, activity: `lang-${lang}-match` });
      }
    } else {
      sfx.wrong(); setMiss(w); setTimeout(() => setMiss(null), 500);
    }
    setPic(null); setWd(null);
  }

  return (
    <div>
      {finished && <Confetti />}
      <p className="mb-4 text-center text-ink-2">Tap a picture, then tap its word.</p>
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {items.map(it => (
            <button key={it.id} disabled={done.has(it.id)} aria-label={`Picture: ${it.en}`} aria-pressed={pic === it.id}
              onClick={() => { sfx.tap(); setPic(it.id); attempt(it.id, wd); }}
              className={`grid h-20 place-items-center rounded-2xl text-5xl transition-all
                ${done.has(it.id) ? "bg-mint/20 opacity-60" : pic === it.id ? "bg-tint/15 ring-4 ring-tint" : "glass"}`}>
              <span aria-hidden>{it.emoji}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {words.map(it => (
            <motion.button key={it.id} disabled={done.has(it.id)} aria-pressed={wd === it.id}
              animate={miss === it.id ? { x: [0, -8, 8, -4, 0] } : {}}
              onClick={() => { setWd(it.id); say(it.id, word(it, lang, variant)); attempt(pic, it.id); }}
              className={`h-20 rounded-2xl px-3 text-lg font-bold leading-tight transition-all
                ${done.has(it.id) ? "bg-mint/20 text-mint" : wd === it.id ? "bg-tint/15 ring-4 ring-tint" : "glass"}`}>
              {word(it, lang, variant)}
            </motion.button>
          ))}
        </div>
      </div>
      {finished && (
        <div className="mt-5 text-center">
          <p className="text-2xl font-extrabold text-mint">{pick(LANGS[lang].cheer)} ⭐</p>
          <Btn className="mt-3" onClick={() => setRound(r => r + 1)}><RotateCcw size={18} aria-hidden /> New words</Btn>
        </div>
      )}
    </div>
  );
}

/* ---------------- Conversations ---------------- */

function DialogueList({ lang, onBack, onOpen }: { lang: LangId; onBack: () => void; onOpen: (d: Dialogue) => void }) {
  return (
    <Shell title={lang === "sw" ? "Mazungumzo 💬" : "Conversas 💬"} subtitle="Little conversations to act out together" onBack={onBack}>
      <div className="flex flex-col gap-3">
        {DIALOGUES.map(d => (
          <button key={d.id} onClick={() => { sfx.tap(); onOpen(d); }}
            className="glass flex items-center gap-4 rounded-[1.75rem] p-4 text-left">
            <span className="text-4xl" aria-hidden>{d.emoji}</span>
            <span><span className="block text-lg font-bold">{d.title}</span>
              <span className="text-sm text-ink-2">{d.lines.length} lines</span></span>
          </button>
        ))}
      </div>
    </Shell>
  );
}

function DialogueView({ lang, d, onBack }: { lang: LangId; d: Dialogue; onBack: () => void }) {
  const { dispatch } = useStore();
  const { say, variant, preload } = useSay(lang);
  const [shown, setShown] = useState(1);
  const [english, setEnglish] = useState(true);
  const [playing, setPlaying] = useState<number | null>(null);
  const chars = Array.from(d.emoji.match(/\p{Extended_Pictographic}(\p{Emoji_Modifier})?/gu) ?? ["👧🏽", "👩🏾"]);
  const text = (i: number) => (lang === "sw" ? d.lines[i].sw : variant === "pt" ? d.lines[i].ptPT ?? d.lines[i].pt : d.lines[i].pt);

  useEffect(() => { preload(d.lines.map((_, i) => lineId(d, i))); const t = setTimeout(() => play(0), 300); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function play(i: number) { setPlaying(i); say(lineId(d, i), text(i)); setTimeout(() => setPlaying(p => (p === i ? null : p)), 1800); }
  function next() {
    if (shown >= d.lines.length) return;
    const n = shown + 1; setShown(n); play(n - 1);
    if (n === d.lines.length) { dispatch({ type: "award", stars: 1, activity: `lang-${lang}-talk-${d.id}` }); setTimeout(() => sfx.win(), 1500); }
  }

  return (
    <Shell title={`${d.emoji} ${d.title}`} subtitle="Tap a bubble to hear it. You say the pink lines!" onBack={onBack}>
      <div className="glass mx-auto flex max-w-lg flex-col gap-3 rounded-[2rem] p-4">
        {d.lines.slice(0, shown).map((l, i) => {
          const mine = l.who === "a";
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-2 ${mine ? "flex-row" : "flex-row-reverse"}`}>
              <span className="text-4xl" aria-hidden>{mine ? chars[0] : chars[1] ?? "👩🏾"}</span>
              <button onClick={() => play(i)} aria-label={`Hear: ${text(i)}`}
                className={`max-w-[75%] rounded-3xl px-4 py-3 text-left shadow-sm transition-transform
                  ${mine ? "rounded-bl-md bg-coral/15" : "rounded-br-md bg-sky/15"} ${playing === i ? "scale-[1.03] ring-2 ring-tint" : ""}`}>
                <span className="block text-xl font-bold">{text(i)} <Volume2 size={16} className="inline text-tint" aria-hidden /></span>
                {english && <span className="block text-sm text-ink-2">{l.en}</span>}
              </button>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {shown < d.lines.length
          ? <Btn onClick={next}><ChevronRight size={18} aria-hidden /> Next line</Btn>
          : <Btn kind="good" onClick={() => { setShown(1); play(0); }}><Play size={18} aria-hidden /> Act it out again</Btn>}
        <Btn kind="soft" onClick={() => setEnglish(e => !e)}>{english ? "Hide English" : "Show English"}</Btn>
      </div>
    </Shell>
  );
}
