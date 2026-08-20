/**
 * Dream Cards — premium, collectible keepsake cards. Completely unbranded:
 * no app name, watermark or logo appears anywhere on the exported card, so
 * it stays a timeless family keepsake.
 *
 * PRIVACY: photos are read with FileReader and drawn onto a local canvas
 * only. Nothing is uploaded, analysed or stored — the image lives in
 * memory while this screen is open and is gone when you leave (unless the
 * family exports the finished card themselves).
 */
import React, { useEffect, useRef, useState } from "react";
import { Camera, Upload, Trash2, Download, Printer, ShieldCheck } from "lucide-react";
import { Shell, Tile, Btn, toast } from "../components/UI";
import { speak, sfx } from "../lib/audio";
import { useStore } from "../lib/store";
import { PROFESSIONS, Profession } from "../data/content";

export default function DreamCards({ onExit }: { onExit: () => void }) {
  const [pro, setPro] = useState<Profession | null>(null);
  if (pro) return <CardBuilder pro={pro} onBack={() => setPro(null)} />;
  return (
    <Shell title="Dream Cards ✨" subtitle="When I grow up… make a keepsake card!" onBack={onExit} wide>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {PROFESSIONS.map(p => (
          <Tile key={p.id} emoji={p.emoji} label={p.name} onClick={() => setPro(p)} />
        ))}
      </div>
    </Shell>
  );
}

/* ---------------- Card builder ---------------- */

// Export at 2× the design size for crisp prints (600×840 pt design → 1200×1680 px).
const W = 600, H = 840, SCALE = 2;

function CardBuilder({ pro, onBack }: { pro: Profession; onBack: () => void }) {
  const { profile } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [name, setName] = useState(profile?.name ?? "");
  const [dream, setDream] = useState(pro.dream);
  const [skills, setSkills] = useState(pro.skills);

  // hue-derived palette keeps every profession's card unique but cohesive
  const hue = pro.hue;

  useEffect(() => { draw(); }, [photo, name, dream, skills]); // eslint-disable-line react-hooks/exhaustive-deps

  function loadFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => { setPhoto(img); sfx.chime(); };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function draw() {
    const c = canvasRef.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    g.save();
    g.scale(SCALE, SCALE);

    /* Background: soft duo-tone gradient in the profession's hue */
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, `hsl(${hue} 70% 92%)`);
    bg.addColorStop(1, `hsl(${(hue + 40) % 360} 60% 86%)`);
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    /* Subtle oversized emblem watermark of the profession (not a brand) */
    g.globalAlpha = 0.07;
    g.font = "300px serif";
    g.textAlign = "center";
    g.fillText(pro.emoji, W / 2, H - 60);
    g.globalAlpha = 1;

    /* Card face */
    roundRect(g, 30, 30, W - 60, H - 60, 34);
    g.fillStyle = "rgba(255,255,255,0.92)";
    g.fill();
    g.strokeStyle = `hsl(${hue} 45% 70%)`;
    g.lineWidth = 2;
    g.stroke();

    /* Fine inner keyline — the "collectible" premium detail */
    roundRect(g, 44, 44, W - 88, H - 88, 26);
    g.strokeStyle = `hsl(${hue} 40% 82%)`;
    g.lineWidth = 1;
    g.stroke();

    /* Header */
    g.fillStyle = `hsl(${hue} 45% 38%)`;
    g.font = "600 15px -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif";
    g.textAlign = "center";
    g.letterSpacing = "6px";
    g.fillText("WHEN I GROW UP", W / 2, 92);
    g.letterSpacing = "0px";

    /* Photo (or emblem) in a ringed circle */
    const cx = W / 2, cy = 240, r = 110;
    g.save();
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fillStyle = `hsl(${hue} 55% 94%)`;
    g.fill();
    g.clip();
    if (photo) {
      const s = Math.max((r * 2) / photo.width, (r * 2) / photo.height);
      g.drawImage(photo, cx - (photo.width * s) / 2, cy - (photo.height * s) / 2, photo.width * s, photo.height * s);
    } else {
      g.font = "110px serif";
      g.fillText(pro.emoji, cx, cy + 40);
    }
    g.restore();
    // Double ring
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2);
    g.strokeStyle = `hsl(${hue} 50% 55%)`; g.lineWidth = 5; g.stroke();
    g.beginPath(); g.arc(cx, cy, r + 9, 0, Math.PI * 2);
    g.strokeStyle = `hsl(${hue} 45% 78%)`; g.lineWidth = 1.5; g.stroke();

    /* Name + role */
    g.fillStyle = "#22223a";
    g.font = "700 44px -apple-system, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
    g.fillText(clip(name || "My Name", 18), W / 2, 430);
    g.fillStyle = `hsl(${hue} 50% 42%)`;
    g.font = "600 27px -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif";
    g.fillText(`Future ${pro.name}  ${pro.emoji}`, W / 2, 472);

    /* Divider */
    g.strokeStyle = `hsl(${hue} 40% 80%)`;
    g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(150, 505); g.lineTo(W - 150, 505); g.stroke();

    /* Details */
    detail(g, "SKILLS I WILL LEARN", clip(skills, 44), 560, hue);
    detail(g, "MY FAVOURITE TOOL", pro.tool, 640, hue);
    detail(g, "MY DREAM", `“${clip(dream, 46)}”`, 720, hue, true);

    g.restore();
  }

  function detail(g: CanvasRenderingContext2D, label: string, value: string, y: number, hue: number, italic = false) {
    g.fillStyle = `hsl(${hue} 30% 55%)`;
    g.font = "600 12px -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif";
    g.letterSpacing = "3px";
    g.fillText(label, W / 2, y);
    g.letterSpacing = "0px";
    g.fillStyle = "#3a3a55";
    g.font = `${italic ? "italic " : ""}400 21px -apple-system, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif`;
    g.fillText(value, W / 2, y + 30);
  }

  function clip(s: string, n: number) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function exportPNG() {
    const a = document.createElement("a");
    a.href = canvasRef.current!.toDataURL("image/png");
    a.download = `dream-card-${(name || "me").toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
    toast("Card saved as a high-resolution PNG 🎉");
    sfx.chime();
  }

  /** PDF export: open the card in a print window — every platform's print
   *  dialog offers "Save as PDF", which keeps us dependency-free. */
  function exportPDF() {
    const url = canvasRef.current!.toDataURL("image/png");
    const w = window.open("", "_blank");
    if (!w) { toast("Please allow pop-ups to export a PDF"); return; }
    w.document.write(
      `<html><head><title>Dream Card</title><style>
        body{margin:0;display:grid;place-items:center;min-height:100vh}
        img{width:105mm;height:147mm;object-fit:contain}
      </style></head><body><img src="${url}" onload="setTimeout(()=>{window.print()},200)"></body></html>`
    );
    w.document.close();
  }

  return (
    <Shell title={`${pro.emoji} Future ${pro.name}`} onBack={onBack} wide>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live preview */}
        <div className="mx-auto w-full max-w-sm">
          <canvas
            ref={canvasRef}
            width={W * SCALE}
            height={H * SCALE}
            role="img"
            aria-label="Dream card preview"
            className="w-full rounded-3xl shadow-xl"
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block font-semibold">Name or nickname</span>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              className="glass w-full rounded-2xl px-4 py-3 text-lg"
              aria-label="Name on the card"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">Skills to learn</span>
            <input value={skills} onChange={e => setSkills(e.target.value)} maxLength={50}
              className="glass w-full rounded-2xl px-4 py-3" aria-label="Skills on the card" />
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">My dream</span>
            <input value={dream} onChange={e => setDream(e.target.value)} maxLength={52}
              className="glass w-full rounded-2xl px-4 py-3" aria-label="Dream sentence on the card" />
          </label>

          {/* Photo: camera capture on phones/tablets, file picker on desktop */}
          <div className="flex flex-wrap gap-3">
            <PhotoButton capture onPick={loadFile}><Camera size={18} aria-hidden /> Take photo</PhotoButton>
            <PhotoButton onPick={loadFile}><Upload size={18} aria-hidden /> Upload photo</PhotoButton>
            {photo && (
              <Btn kind="soft" onClick={() => { setPhoto(null); toast("Photo removed"); }}>
                <Trash2 size={18} aria-hidden /> Remove
              </Btn>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Btn onClick={exportPNG}><Download size={18} aria-hidden /> Save PNG</Btn>
            <Btn kind="soft" onClick={exportPDF}><Printer size={18} aria-hidden /> Print / PDF</Btn>
          </div>

          <p className="flex items-start gap-2 text-sm text-ink-2">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-mint" aria-hidden />
            Photos never leave this device. They are not uploaded, analysed or saved —
            the picture is only drawn onto this card, and it's gone when you leave
            unless you export the card yourself.
          </p>
        </div>
      </div>
    </Shell>
  );
}

/** Hidden-input photo picker. `capture` asks the OS for the camera. */
function PhotoButton({ capture, onPick, children }: {
  capture?: boolean;
  onPick: (f: File | undefined) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        {...(capture ? { capture: "user" as const } : {})}
        className="hidden"
        onChange={e => onPick(e.target.files?.[0])}
      />
      <Btn kind="soft" onClick={() => ref.current?.click()}>{children}</Btn>
    </>
  );
}
