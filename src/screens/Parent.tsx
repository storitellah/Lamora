/**
 * Parent Zone — PIN-gated dashboard. All controls that children should
 * not reach live here: audio & music, screen time, reward tuning,
 * profiles, accessibility and data management.
 */
import React, { useState } from "react";
import {
  Music, Volume2, Timer, Star, Users, Accessibility, ShieldCheck,
  Download, KeyRound, Trash2, Delete, Check, Plus
} from "lucide-react";
import { Shell, Btn, toast } from "../components/UI";
import { sfx, haptic, previewVoice } from "../lib/audio";
import { useStore, todayKey, Profile } from "../lib/store";

/* ---------------- PIN gate ---------------- */

export function ParentGate({ onPass, onBack }: { onPass: () => void; onBack: () => void }) {
  const { state, dispatch } = useStore();
  const creating = !state.settings.pin;
  const [entered, setEntered] = useState("");
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [msg, setMsg] = useState(
    creating
      ? "Grown-ups: choose a 4-digit PIN to protect the parent zone."
      : "Grown-ups only: enter your 4-digit PIN."
  );

  function submit(pin: string) {
    if (creating) {
      if (!firstPin) {
        setFirstPin(pin); setEntered("");
        setMsg("Type the same PIN again to confirm.");
      } else if (firstPin === pin) {
        dispatch({ type: "settings", patch: { pin } });
        toast("✅ PIN saved");
        onPass();
      } else {
        setFirstPin(null); setEntered("");
        setMsg("Those didn't match — let's start again.");
      }
    } else if (pin === state.settings.pin) {
      onPass();
    } else {
      sfx.wrong();
      setEntered("");
      setMsg("That's not right. Try again, grown-up!");
    }
  }

  function key(k: string) {
    sfx.tap(); haptic();
    if (k === "⌫") { setEntered(e => e.slice(0, -1)); return; }
    const next = (entered + k).slice(0, 4);
    setEntered(next);
    if (next.length === 4) setTimeout(() => submit(next), 160);
  }

  return (
    <Shell title={creating ? "Create a parent PIN" : "Parent PIN"} subtitle={msg} onBack={onBack}>
      <div aria-live="polite" className="mb-6 text-center text-3xl tracking-[0.8rem]">
        {"●".repeat(entered.length)}{"○".repeat(4 - entered.length)}
      </div>
      <div className="mx-auto grid w-fit grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) =>
          k === "" ? <span key={i} /> : (
            <button
              key={i}
              onClick={() => key(k)}
              aria-label={k === "⌫" ? "Delete digit" : k}
              className="glass grid h-18 w-18 place-items-center rounded-3xl text-2xl font-bold active:scale-95"
            >
              {k === "⌫" ? <Delete aria-hidden /> : k}
            </button>
          )
        )}
      </div>
    </Shell>
  );
}

/* ---------------- Dashboard ---------------- */

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-[1.75rem] p-6">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">{icon} {title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/5 py-3 last:border-0">
      <span className="font-semibold">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => { sfx.tap(); onChange(!on); }}
      className={`relative h-9 w-16 rounded-full transition-colors ${on ? "bg-mint" : "bg-ink/20"}`}
    >
      <span className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${on ? "left-8" : "left-1"}`} />
    </button>
  );
}

function Select({ value, onChange, options, label }: {
  value: string; onChange: (v: string) => void; options: [string, string][]; label: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={label}
      className="glass min-h-11 rounded-2xl px-4 py-2 font-semibold"
    >
      {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
    </select>
  );
}

export function ParentDashboard({ onExit }: { onExit: () => void }) {
  const { state, dispatch, profile } = useStore();
  const s = state.settings;
  const set = (patch: Partial<typeof s>) => dispatch({ type: "settings", patch });

  return (
    <Shell title="Parent Dashboard 🔒" subtitle="Everything stays on this device. Nothing is uploaded, ever." onBack={onExit} wide>
      <div className="grid gap-5 lg:grid-cols-2">

        <Section icon={<Music className="text-tint" aria-hidden />} title="Sound & music">
          <Row label="All sounds & speech">
            <Toggle on={!s.muted} onChange={v => set({ muted: !v })} label="Sounds and speech" />
          </Row>
          <Row label="Background music">
            <Toggle on={s.musicOn} onChange={v => set({ musicOn: v })} label="Background music" />
          </Row>
          <Row label="Volume">
            <Select value={String(s.volume)} onChange={v => set({ volume: parseFloat(v) })} label="Volume"
              options={[["0.3", "Quiet"], ["0.7", "Medium"], ["1", "Loud"]]} />
          </Row>
          <Row label="Reading voice">
            <div className="flex items-center gap-2">
              <Select
                value={s.voiceGender}
                onChange={v => {
                  set({ voiceGender: v as "female" | "male" });
                  // Let it apply, then play a sample in the new voice.
                  setTimeout(previewVoice, 60);
                }}
                label="Reading voice"
                options={[["female", "👩 Female"], ["male", "👨 Male"]]}
              />
              <Btn kind="soft" className="!min-h-11 !px-4" ariaLabel="Hear the reading voice" onClick={previewVoice}>
                ▶︎ Test
              </Btn>
            </div>
          </Row>
          <p className="pt-1 text-sm text-ink-2">
            Voices come from this device. The most natural one for your choice is used automatically;
            some devices may only offer one.
          </p>
        </Section>

        <Section icon={<Timer className="text-coral" aria-hidden />} title="Screen time">
          <Row label="Daily limit">
            <Select value={String(s.dailyLimitMin)} onChange={v => set({ dailyLimitMin: parseInt(v, 10) })} label="Daily limit"
              options={[["15", "15 min"], ["20", "20 min"], ["30", "30 min"], ["45", "45 min"], ["60", "1 hour"], ["90", "90 min"], ["120", "2 hours"]]} />
          </Row>
          <Row label="Game session length">
            <Select value={String(s.playMinutes)} onChange={v => set({ playMinutes: parseInt(v, 10) })} label="Game session length"
              options={[["3", "3 min"], ["5", "5 min"], ["8", "8 min"], ["10", "10 min"]]} />
          </Row>
          {profile && (
            <Row label={`Used today (${profile.name}): ${Math.round((profile.usage[todayKey()] ?? 0) / 60)} min`}>
              <Btn kind="soft" className="!min-h-10 !px-4 !py-2 text-sm" onClick={() => {
                dispatch({ type: "resetToday" });
                toast("Today's timer reset");
              }}>Reset today</Btn>
            </Row>
          )}
        </Section>

        <Section icon={<Star className="text-sun" aria-hidden />} title="Rewards">
          <Row label="Stars needed per game session">
            <Select value={String(s.starsPerToken)} onChange={v => set({ starsPerToken: parseInt(v, 10) })} label="Stars per game session"
              options={[["3", "3 ⭐"], ["5", "5 ⭐"], ["8", "8 ⭐"], ["10", "10 ⭐"]]} />
          </Row>
          {state.profiles.map(p => (
            <Row key={p.id} label={`${p.avatar} ${p.name} — ${p.totalStars} ⭐, ${p.tokens} 🎮`}>
              <Btn kind="danger" className="!min-h-10 !px-4 !py-2 text-sm" onClick={() => {
                if (confirm(`Reset all rewards and progress for ${p.name}?`))
                  dispatch({ type: "resetRewards", id: p.id });
              }}>Reset</Btn>
            </Row>
          ))}
        </Section>

        <Section icon={<Users className="text-sky" aria-hidden />} title="Child profiles">
          {state.profiles.map(p => <ProfileRow key={p.id} p={p} />)}
          <div className="pt-3">
            <Btn kind="soft" onClick={() => dispatch({ type: "addProfile" })}>
              <Plus size={18} aria-hidden /> Add profile
            </Btn>
          </div>
        </Section>

        <Section icon={<Accessibility className="text-mint" aria-hidden />} title="Accessibility">
          <Row label="Reduced motion">
            <Toggle on={s.reducedMotion} onChange={v => set({ reducedMotion: v })} label="Reduced motion" />
          </Row>
          <p className="pt-2 text-sm text-ink-2">
            Lamora also follows your device's reduce-motion setting automatically.
            All buttons are large, labelled for screen readers and keyboard-friendly.
          </p>
        </Section>

        <Section icon={<ShieldCheck className="text-tint" aria-hidden />} title="Data & privacy">
          <p className="mb-3 text-sm text-ink-2">
            Profiles, stars and settings live only in this browser. There are no
            accounts, no analytics and no uploads — photos included.
          </p>
          <div className="flex flex-wrap gap-3">
            <Btn kind="soft" onClick={() => exportSummary(state.profiles)}>
              <Download size={18} aria-hidden /> Export progress
            </Btn>
            <Btn kind="soft" onClick={() => {
              if (confirm("Change the parent PIN? You'll set a new one now.")) {
                dispatch({ type: "settings", patch: { pin: null } });
                toast("Enter a new PIN next time you open the parent zone");
              }
            }}>
              <KeyRound size={18} aria-hidden /> Change PIN
            </Btn>
            <Btn kind="danger" onClick={() => {
              if (confirm("Delete ALL Lamora data on this device? Every profile and setting will be removed.") &&
                  confirm("Are you completely sure? This cannot be undone.")) {
                dispatch({ type: "wipe" });
                localStorage.clear();
                location.reload();
              }
            }}>
              <Trash2 size={18} aria-hidden /> Delete all data
            </Btn>
          </div>
        </Section>
      </div>

      <div className="mt-8 text-center">
        <Btn kind="good" onClick={onExit}><Check size={18} aria-hidden /> Done</Btn>
      </div>
    </Shell>
  );
}

function ProfileRow({ p }: { p: Profile }) {
  const { state, dispatch } = useStore();
  const AVATARS = ["🌙", "🦋", "🌸", "🦄", "🐬", "🐉", "🦖", "🐼", "🦊", "⭐", "🐙", "🌈"];
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-ink/5 py-3 last:border-0">
      <select
        value={p.avatar}
        aria-label={`Avatar for ${p.name}`}
        onChange={e => dispatch({ type: "profile", id: p.id, patch: { avatar: e.target.value } })}
        className="glass min-h-11 rounded-2xl px-2 py-2 text-xl"
      >
        {AVATARS.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <input
        defaultValue={p.name}
        maxLength={14}
        aria-label="Profile name"
        onBlur={e => dispatch({ type: "profile", id: p.id, patch: { name: e.target.value.trim() || p.name } })}
        className="glass min-h-11 w-32 rounded-2xl px-3 py-2 font-semibold"
      />
      <select
        value={p.age}
        aria-label={`Age for ${p.name}`}
        onChange={e => dispatch({ type: "profile", id: p.id, patch: { age: parseInt(e.target.value, 10) } })}
        className="glass min-h-11 rounded-2xl px-3 py-2 font-semibold"
      >
        {[5, 6, 7, 8, 9, 10].map(a => <option key={a} value={a}>Age {a}</option>)}
      </select>
      <Btn kind="danger" className="!min-h-10 !px-4 !py-2 text-sm" onClick={() => {
        if (state.profiles.length <= 1) { toast("Keep at least one profile"); return; }
        if (confirm(`Delete ${p.name}'s profile and all their local data?`))
          dispatch({ type: "removeProfile", id: p.id });
      }}>Delete</Btn>
    </div>
  );
}

function exportSummary(profiles: Profile[]) {
  let txt = `Progress Summary — ${new Date().toLocaleDateString()}\n\n`;
  for (const p of profiles) {
    const mins = Object.values(p.usage).reduce((a, b) => a + b, 0) / 60;
    txt += `${p.name} (age ${p.age})\n`;
    txt += `  Stars earned: ${p.totalStars}\n`;
    txt += `  Play sessions saved: ${p.tokens}\n`;
    txt += `  Activities completed: ${Object.values(p.done).reduce((a, b) => a + b, 0)}\n`;
    for (const [k, n] of Object.entries(p.done)) txt += `    ${k}: ${n}×\n`;
    txt += `  Screen time recorded: ${Math.round(mins)} minutes\n\n`;
  }
  const blob = new Blob([txt], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "progress-summary.txt";
  a.click();
  toast("Summary downloaded 📄");
}
