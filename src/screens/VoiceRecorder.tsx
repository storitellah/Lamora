/**
 * Parent Zone: record the language words in a real family voice.
 *
 * The microphone is used only here, only while a grown-up holds a word's
 * record button, and it is switched off the moment recording stops.
 * Recordings are stored on this device (IndexedDB) and never uploaded.
 */
import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Trash2, ChevronDown } from "lucide-react";
import { Shell, toast } from "../components/UI";
import { sfx, playClip, stopSpeaking } from "../lib/audio";
import { TOPICS, LANGS, LangId, word } from "../data/languages";
import { allRecordings, deleteRecording, recKey, saveRecording } from "../lib/voiceRecordings";
import { clipDir } from "./Languages";

const MAX_MS = 5000;

function pickMime(): string | undefined {
  const MR = (window as any).MediaRecorder;
  if (!MR?.isTypeSupported) return undefined;
  return ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].find(t => MR.isTypeSupported(t));
}

export function VoiceRecorder({ variant, onBack }: { variant: "br" | "pt"; onBack: () => void }) {
  const [lang, setLang] = useState<LangId>("sw");
  const [open, setOpen] = useState<string>("greet");
  const [recs, setRecs] = useState<Map<string, Blob>>(new Map());
  const [busy, setBusy] = useState<string | null>(null);
  const rec = useRef<{ mr: MediaRecorder; stream: MediaStream; timer: number } | null>(null);
  const dir = clipDir(lang, variant);
  const supported = typeof window !== "undefined" && "MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia;

  const refresh = async () => setRecs(new Map(await allRecordings()));
  useEffect(() => { void refresh(); return () => stopRec(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function stopRec() {
    const r = rec.current; if (!r) return;
    clearTimeout(r.timer);
    if (r.mr.state !== "inactive") r.mr.stop();
  }

  async function start(id: string) {
    if (rec.current) { stopRec(); return; }
    stopSpeaking();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mime = pickMime();
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop()); // microphone off straight away
        rec.current = null; setBusy(null);
        const blob = new Blob(chunks, { type: mr.mimeType || mime || "audio/webm" });
        if (blob.size < 800) { toast("That was very short — try again"); return; }
        await saveRecording(recKey(dir, id), blob);
        await refresh();
        sfx.star(); toast("✅ Saved — the children will hear your voice");
        void playClip(blob);
      };
      mr.start();
      rec.current = { mr, stream, timer: window.setTimeout(stopRec, MAX_MS) };
      setBusy(id);
    } catch {
      toast("The microphone isn't available. Check the device's permission for Lamora.");
    }
  }

  return (
    <Shell title="Record words 🎙️" subtitle="Say each word clearly — children will hear your voice" onBack={() => { stopRec(); onBack(); }} wide>
      {!supported && <p className="glass mb-4 rounded-2xl p-4 text-sm">This browser can't record audio. Try Safari on iPad, or Chrome.</p>}
      <div className="mb-4 flex justify-center gap-2" role="tablist">
        {(["sw", "pt"] as LangId[]).map(l => (
          <button key={l} role="tab" aria-selected={lang === l} onClick={() => setLang(l)}
            className={`min-h-11 rounded-full px-5 font-bold ${lang === l ? "bg-tint text-white" : "glass"}`}>
            {LANGS[l].flag} {LANGS[l].native}{l === "pt" ? ` (${variant === "pt" ? "Portugal" : "Brazil"})` : ""}
          </button>
        ))}
      </div>
      <p className="mb-4 text-center text-xs text-ink-2">Tap ● to record (up to 5 seconds), tap ■ to stop. The microphone switches off as soon as you stop.</p>

      <div className="flex flex-col gap-3">
        {TOPICS.map(t => {
          const count = t.items.filter(i => recs.has(recKey(dir, i.id))).length;
          return (
            <section key={t.id} className="glass rounded-[1.5rem]">
              <button onClick={() => setOpen(open === t.id ? "" : t.id)} aria-expanded={open === t.id}
                className="flex min-h-14 w-full items-center justify-between gap-3 px-5 text-left">
                <span className="font-bold">{t.emoji} {t.en}</span>
                <span className="flex items-center gap-2 text-sm text-ink-2">{count}/{t.items.length} recorded
                  <ChevronDown size={18} className={open === t.id ? "rotate-180" : ""} aria-hidden /></span>
              </button>
              {open === t.id && (
                <ul className="border-t border-ink/5 px-3 pb-2">
                  {t.items.map(it => {
                    const key = recKey(dir, it.id), has = recs.has(key), live = busy === it.id;
                    const w = word(it, lang, variant);
                    return (
                      <li key={it.id} className="flex items-center gap-2 border-b border-ink/5 py-2 last:border-0">
                        <span className="w-10 text-center text-2xl" aria-hidden>{it.emoji}</span>
                        <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{w}</span>
                          <span className="text-xs text-ink-2">{it.en}{has ? " · 🎙️ your voice" : ""}</span></span>
                        <button onClick={() => void playClip(has ? recs.get(key)! : `/audio/${dir}/${it.id}.mp3`)}
                          aria-label={`Play ${w}`} className="grid h-11 w-11 place-items-center rounded-full bg-white/80 text-tint"><Play size={18} aria-hidden /></button>
                        <button onClick={() => start(it.id)} disabled={!supported || (!!busy && !live)}
                          aria-label={live ? `Stop recording ${w}` : `Record ${w}`}
                          className={`grid h-11 w-11 place-items-center rounded-full text-white disabled:opacity-30 ${live ? "animate-pulse bg-coral" : "bg-coral/85"}`}>
                          {live ? <Square size={16} aria-hidden /> : <Mic size={18} aria-hidden />}
                        </button>
                        <button onClick={async () => { await deleteRecording(key); await refresh(); }} disabled={!has}
                          aria-label={`Delete your recording of ${w}`} className="grid h-11 w-11 place-items-center rounded-full text-ink-2 disabled:opacity-20"><Trash2 size={18} aria-hidden /></button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
