/**
 * Colour the Picture — tap-to-fill line art.
 *
 * Each page is inline SVG whose regions carry a `data-fill` attribute. We
 * attach listeners to those regions after mount, so tapping (or pressing Enter
 * on) a region floods it with the chosen colour. Undo is a simple stack of
 * (region, previousColour) pairs. Everything stays on the device; export
 * rasterises the SVG to a PNG the family can keep or print.
 */
import React, { useEffect, useRef, useState } from "react";
import { Undo2, Download, Eraser, ChevronRight } from "lucide-react";
import { Shell, Btn, toast } from "../../components/UI";
import { sfx, speak, haptic } from "../../lib/audio";
import { useStore } from "../../lib/store";
import { COLOURING_PAGES, ColouringPage } from "../../data/colouringPages";

const PALETTE = [
  "#d63031", "#e17055", "#fdcb6e", "#ffeaa7", "#00b894", "#55efc4",
  "#0984e3", "#74b9ff", "#6c5ce7", "#a29bfe", "#e84393", "#fd79a8",
  "#a0522d", "#2d3436", "#ffffff"
];

export default function Colouring({ onBack }: { onBack: () => void }) {
  const [page, setPage] = useState<ColouringPage | null>(null);
  if (page) return <ColourPage page={page} onBack={() => setPage(null)} onNext={() => {
    const i = COLOURING_PAGES.indexOf(page);
    setPage(COLOURING_PAGES[(i + 1) % COLOURING_PAGES.length]);
  }} />;

  return (
    <Shell title="Colour the Picture 🖍️" subtitle="Pick a picture, choose a colour, then tap to fill!" onBack={onBack} wide>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {COLOURING_PAGES.map(p => (
          <button key={p.id} onClick={() => { sfx.tap(); setPage(p); }}
            className="glass flex min-h-32 flex-col items-center justify-center gap-2 rounded-[1.75rem] p-4">
            <span className="text-4xl" aria-hidden>{p.icon}</span>
            <span className="text-center text-sm font-bold leading-tight">{p.name}</span>
          </button>
        ))}
      </div>
    </Shell>
  );
}

function ColourPage({ page, onBack, onNext }: { page: ColouringPage; onBack: () => void; onNext: () => void }) {
  const { dispatch } = useStore();
  const hostRef = useRef<HTMLDivElement>(null);
  const [colour, setColour] = useState(PALETTE[0]);
  const undoStack = useRef<{ el: SVGElement; prev: string }[]>([]);
  const [filledCount, setFilledCount] = useState(0);
  const awarded = useRef(false);
  // Keep the live colour in a ref so listeners attached once always see it.
  const colourRef = useRef(colour);
  colourRef.current = colour;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = page.svg;
    const svg = host.querySelector("svg");
    svg?.setAttribute("class", "w-full h-auto block");
    svg?.setAttribute("aria-label", `${page.name} colouring page`);

    const regions = Array.from(host.querySelectorAll<SVGElement>("[data-fill]"));
    regions.forEach((el, i) => {
      el.style.cursor = "pointer";
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `Colour area ${i + 1}`);
      const fill = () => {
        const prev = el.getAttribute("fill") ?? "#fff";
        if (prev === colourRef.current) return;
        undoStack.current.push({ el, prev });
        el.setAttribute("fill", colourRef.current);
        sfx.pop(); haptic(6);
        setFilledCount(c => {
          const n = c + 1;
          // A gentle reward once they've really coloured something in.
          if (n >= 5 && !awarded.current) {
            awarded.current = true;
            dispatch({ type: "award", stars: 1, activity: "wb-colouring" });
            speak("What a beautiful picture! You earned a star.");
          }
          return n;
        });
      };
      el.addEventListener("click", fill);
      el.addEventListener("keydown", e => {
        const ke = e as unknown as KeyboardEvent;
        if (ke.key === "Enter" || ke.key === " ") { ke.preventDefault(); fill(); }
      });
    });

    undoStack.current = [];
    setFilledCount(0);
    awarded.current = false;
  }, [page, dispatch]);

  function undo() {
    const last = undoStack.current.pop();
    if (!last) return;
    last.el.setAttribute("fill", last.prev);
    sfx.flip();
  }

  function clearAll() {
    hostRef.current?.querySelectorAll<SVGElement>("[data-fill]").forEach(el => el.setAttribute("fill", "#fff"));
    undoStack.current = [];
    sfx.tap();
  }

  /** Rasterise the inline SVG to a PNG download — no network, no upload. */
  function exportPNG() {
    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1000; canvas.height = 1000;
      const g = canvas.getContext("2d")!;
      g.fillStyle = "#fff";
      g.fillRect(0, 0, 1000, 1000);
      g.drawImage(img, 0, 0, 1000, 1000);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${page.id}-colouring.png`;
      a.click();
      toast("Saved as a picture 🎉");
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  }

  return (
    <Shell title={`${page.icon} ${page.name}`} subtitle="Tap a colour, then tap the picture" onBack={onBack}>
      {/* Palette */}
      <div className="glass mb-4 flex flex-wrap justify-center gap-2 rounded-[1.75rem] p-3"
        role="toolbar" aria-label="Colour palette">
        {PALETTE.map(c => (
          <button key={c} onClick={() => { setColour(c); sfx.tap(); }}
            aria-label={`Colour ${c}`} aria-pressed={colour === c}
            className={`h-11 w-11 rounded-full border-4 transition-transform
              ${colour === c ? "scale-110 border-ink" : "border-white"}`}
            style={{ background: c, boxShadow: "0 2px 6px rgba(0,0,0,.18)" }} />
        ))}
      </div>

      <div className="glass mx-auto max-w-lg rounded-[1.75rem] p-3">
        <div ref={hostRef} />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Btn kind="soft" onClick={undo}><Undo2 size={18} aria-hidden /> Undo</Btn>
        <Btn kind="soft" onClick={clearAll}><Eraser size={18} aria-hidden /> Clear</Btn>
        <Btn onClick={exportPNG}><Download size={18} aria-hidden /> Save picture</Btn>
        <Btn kind="ghost" onClick={onNext}>Next picture <ChevronRight size={18} aria-hidden /></Btn>
      </div>
    </Shell>
  );
}
