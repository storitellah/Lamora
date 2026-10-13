/**
 * Generate the built-in European Portuguese and Kiswahili audio clips.
 *
 *   AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=westeurope npx tsx scripts/generate-language-audio.ts
 *
 * Warm, natural voices (used whenever a key is provided):
 *   European Portuguese — Microsoft Azure neural voice "pt-PT-RaquelNeural"
 *   Kiswahili            — Microsoft Azure neural voice "sw-KE-ZuriNeural"
 * Both are female, spoken a little slower than normal for young learners.
 * Override with AZURE_VOICE_PT / AZURE_VOICE_SW (e.g. sw-TZ-RehemaNeural).
 *
 * Without a key the script falls back to eSpeak NG (open source, offline,
 * accurate but robotic) so the app always has audio:
 *   apt install espeak-ng lame
 *
 * The clips are generated once, at build time, and shipped inside the app.
 * Children's devices never contact Azure or any other service.
 *
 * Output: public/audio/{pt,sw}/<id>.mp3 and public/audio/voices.json, which
 * tells the app whether the clips are natural (then preferred over a
 * device's own voice) or the robotic fallback (then used only as a last resort).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { TOPICS, DIALOGUES, LANGS, lineId, LangId } from "../src/data/languages";

const OUT = join(process.cwd(), "public", "audio");
const KEY = process.env.AZURE_SPEECH_KEY?.trim();
const REGION = process.env.AZURE_SPEECH_REGION?.trim() || "westeurope";
const ENDPOINT = process.env.AZURE_TTS_ENDPOINT || `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
const AZURE: Record<LangId, { voice: string; lang: string }> = {
  pt: { voice: process.env.AZURE_VOICE_PT || "pt-PT-RaquelNeural", lang: "pt-PT" },
  sw: { voice: process.env.AZURE_VOICE_SW || "sw-KE-ZuriNeural", lang: "sw-KE" }
};
const ESPEAK: Record<LangId, string> = { pt: "pt+f3", sw: "sw+f3" };
type Kind = "word" | "line" | "cheer";

/* ---- What to say ---- */

const jobs: { lang: LangId; id: string; text: string; kind: Kind }[] = [];
for (const topic of TOPICS) for (const it of topic.items) {
  jobs.push({ lang: "pt", id: it.id, text: it.pt, kind: "word" });
  jobs.push({ lang: "sw", id: it.id, text: it.sw, kind: "word" });
}
for (const d of DIALOGUES) d.lines.forEach((l, i) => {
  jobs.push({ lang: "pt", id: lineId(d, i), text: l.pt, kind: "line" });
  jobs.push({ lang: "sw", id: lineId(d, i), text: l.sw, kind: "line" });
});
for (const lang of ["pt", "sw"] as LangId[]) {
  LANGS[lang].cheer.forEach((c, i) => jobs.push({ lang, id: `cheer-${i}`, text: c, kind: "cheer" }));
  LANGS[lang].tryAgain.forEach((c, i) => jobs.push({ lang, id: `again-${i}`, text: c, kind: "cheer" }));
}

const plain = (t: string) => t.replace(/…/g, "").trim();
const xml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/* ---- Azure neural voices ---- */

/**
 * SSML for a warm, unhurried delivery: slower than normal speech and a touch
 * brighter in pitch. Cheers are livelier; a short lead-in pause means the
 * first sound is never clipped when a device wakes its audio output.
 */
function ssml(lang: LangId, text: string, kind: Kind) {
  const v = AZURE[lang];
  const rate = kind === "cheer" ? "-2%" : kind === "word" ? "-14%" : "-8%";
  const pitch = kind === "cheer" ? "+6%" : "+3%";
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${v.lang}">` +
    `<voice name="${v.voice}"><break time="80ms"/><prosody rate="${rate}" pitch="${pitch}">${xml(plain(text))}</prosody></voice></speak>`;
}

async function azure(lang: LangId, text: string, kind: Kind): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": KEY!,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "lamora-audio-build"
      },
      body: ssml(lang, text, kind)
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if ((res.status === 429 || res.status >= 500) && attempt < 6) { await new Promise(r => setTimeout(r, 1500 * attempt)); continue; }
    throw new Error(`Azure TTS ${res.status} for "${text}": ${(await res.text()).slice(0, 200)}`);
  }
}

/* ---- eSpeak fallback ---- */

/** eSpeak reads Swahili "ng'" as "en-g", so "ng'ombe" (cow) is given as phonemes. */
const SAY_AS: [RegExp, string][] = [[/ng'ombe/gi, "[[N'ombe]]"]];
function espeak(lang: LangId, text: string): Buffer {
  const wav = join(tmpdir(), "lamora-clip.wav"), mp3 = join(tmpdir(), "lamora-clip.mp3");
  const t = SAY_AS.reduce((s, [re, to]) => s.replace(re, to), plain(text));
  execFileSync("espeak-ng", ["-v", ESPEAK[lang], "-s", "128", "-g", "4", "-a", "160", "-w", wav, t]);
  execFileSync("lame", ["--quiet", "-m", "m", "--resample", "22.05", "-b", "40", wav, mp3]);
  return readFileSync(mp3);
}

/* ---- Run ---- */

async function main() {
  const engine = KEY ? "azure" : "espeak";
  for (const d of ["pt", "sw", "ptpt"]) rmSync(join(OUT, d), { recursive: true, force: true });
  for (const d of ["pt", "sw"]) mkdirSync(join(OUT, d), { recursive: true });

  let done = 0;
  for (const j of jobs) {
    const audio = engine === "azure" ? await azure(j.lang, j.text, j.kind) : espeak(j.lang, j.text);
    if (audio.length < 1200) throw new Error(`Suspiciously small clip for "${j.text}"`);
    writeFileSync(join(OUT, j.lang, `${j.id}.mp3`), audio);
    if (++done % 50 === 0) console.log(`  ${done}/${jobs.length}`);
  }

  const voices = {
    engine,
    natural: engine === "azure",
    pt: engine === "azure" ? `Azure neural · ${AZURE.pt.voice}` : "eSpeak NG · European Portuguese",
    sw: engine === "azure" ? `Azure neural · ${AZURE.sw.voice}` : "eSpeak NG · Kiswahili",
    generated: new Date().toISOString().slice(0, 10)
  };
  writeFileSync(join(OUT, "voices.json"), JSON.stringify(voices, null, 2) + "\n");

  let bytes = 0, files = 0;
  for (const d of ["pt", "sw"]) for (const f of readdirSync(join(OUT, d))) { bytes += statSync(join(OUT, d, f)).size; files++; }
  console.log(`${files} clips, ${(bytes / 1024).toFixed(0)} KB — ${voices.pt} / ${voices.sw}`);
  if (!KEY) console.log("No AZURE_SPEECH_KEY set: built the robotic fallback clips. See docs/VOICES.md.");
}

main().catch(e => { console.error(e.message ?? e); process.exit(1); });
