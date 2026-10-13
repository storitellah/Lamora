/**
 * Generate the built-in Portuguese and Kiswahili audio clips.
 *
 *   npx tsx scripts/generate-language-audio.ts
 *
 * Needs (Ubuntu/Debian): apt install espeak-ng lame
 *
 * These clips are the always-available fallback: the app prefers a grown-up's
 * own recording, then a natural voice installed on the device, then these.
 * They are made with open-source synthesis (eSpeak NG), entirely on
 * the build machine — no cloud service, so they can ship inside the app and
 * play offline on every device, including iPads that have no Swahili voice.
 *
 * Output: public/audio/{pt,ptpt,sw}/<id>.mp3 (mono, 22 kHz, ~40 kbps).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, rmSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { TOPICS, DIALOGUES, LANGS, lineId } from "../src/data/languages";

const OUT = join(process.cwd(), "public", "audio");
const VOICES = {
  // MBROLA's Portuguese voices sound smoother but drop sounds a learner
  // needs (pt1 has no open "ó" — "Olá" loses its O; br4 silences the r in
  // "verde", "porta"), so eSpeak NG's complete phoneme sets are used.
  pt: { voice: "pt-br+f3", speed: "128", label: "Brazilian Portuguese (eSpeak NG, female variant)" },
  ptpt: { voice: "pt+f3", speed: "128", label: "European Portuguese (eSpeak NG, female variant)" },
  sw: { voice: "sw+f3", speed: "128", label: "Kiswahili (eSpeak NG, female variant)" }
} as const;
type Out = keyof typeof VOICES;

/**
 * Spelling → sound fixes. eSpeak reads Swahili "ng'" (the single sound in
 * "singer") as the letters "en-g", so "ng'ombe" (cow) is given as phonemes.
 */
const SAY_AS: [RegExp, string][] = [[/ng'ombe/gi, "[[N'ombe]]"]];
const clean = (t: string) => SAY_AS.reduce((s, [re, to]) => s.replace(re, to), t.replace(/…/g, "")).trim();
const jobs: { out: Out; id: string; text: string }[] = [];

for (const topic of TOPICS) for (const it of topic.items) {
  jobs.push({ out: "pt", id: it.id, text: it.pt });
  jobs.push({ out: "ptpt", id: it.id, text: it.ptPT ?? it.pt });
  jobs.push({ out: "sw", id: it.id, text: it.sw });
}
for (const d of DIALOGUES) d.lines.forEach((l, i) => {
  jobs.push({ out: "pt", id: lineId(d, i), text: l.pt });
  jobs.push({ out: "ptpt", id: lineId(d, i), text: l.ptPT ?? l.pt });
  jobs.push({ out: "sw", id: lineId(d, i), text: l.sw });
});
LANGS.pt.cheer.forEach((c, i) => { jobs.push({ out: "pt", id: `cheer-${i}`, text: c }); jobs.push({ out: "ptpt", id: `cheer-${i}`, text: c }); });
LANGS.sw.cheer.forEach((c, i) => jobs.push({ out: "sw", id: `cheer-${i}`, text: c }));
LANGS.pt.tryAgain.forEach((c, i) => { jobs.push({ out: "pt", id: `again-${i}`, text: c }); jobs.push({ out: "ptpt", id: `again-${i}`, text: c }); });
LANGS.sw.tryAgain.forEach((c, i) => jobs.push({ out: "sw", id: `again-${i}`, text: c }));

for (const o of Object.keys(VOICES)) { rmSync(join(OUT, o), { recursive: true, force: true }); mkdirSync(join(OUT, o), { recursive: true }); }
const wav = join(tmpdir(), "lamora-clip.wav");

for (const j of jobs) {
  const v = VOICES[j.out];
  const mp3 = join(OUT, j.out, `${j.id}.mp3`);
  // -g adds a little space between words; -a keeps volume consistent.
  execFileSync("espeak-ng", ["-v", v.voice, "-s", v.speed, "-g", "4", "-a", "160", "-w", wav, clean(j.text)]);
  execFileSync("lame", ["--quiet", "-m", "m", "--resample", "22.05", "-b", "40", wav, mp3]);
}
if (existsSync(wav)) rmSync(wav);

let bytes = 0, files = 0;
for (const o of Object.keys(VOICES)) for (const f of readdirSync(join(OUT, o))) { bytes += statSync(join(OUT, o, f)).size; files++; }
console.log(`${files} clips, ${(bytes / 1024).toFixed(0)} KB`);
for (const [k, v] of Object.entries(VOICES)) console.log(`  ${k}: ${v.label}`);
