/**
 * TraceSheet — the shared handwriting/pattern tracing surface.
 *
 * A guide is drawn as a dashed outline and the child draws over it with a
 * finger, stylus or mouse. Completion is measured by *coverage*: we sample
 * the guide's own pixels on an offscreen canvas, then count how many of those
 * sample points the child has inked over. That is far kinder than comparing
 * stroke paths — a wobbly 4-year-old line still counts, which is exactly what
 * a real handwriting workbook rewards.
 *
 * Two guide kinds are supported so one component serves every workbook:
 *   • { kind: "glyph" } — a letter/number drawn from the system font
 *   • { kind: "path"  } — SVG path data on a 0–100 grid (pre-writing patterns)
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export type Guide =
  | { kind: "glyph"; char: string }
  | { kind: "path"; d: string };

const SIZE = 460;            // logical canvas units; CSS scales it responsively
const INK = "#5b5bd6";       // must stay distinguishable from the grey guide
const GUIDE = "#c9c9ee";

/** Scale a 0–100 grid path into canvas units. */
function scaledPath(d: string): Path2D {
  const p = new Path2D();
  const m = new DOMMatrix();
  // 10% margin so strokes near the edge are still comfortable to draw.
  m.a = m.d = (SIZE * 0.8) / 100;
  m.e = m.f = SIZE * 0.1;
  p.addPath(new Path2D(d), m);
  return p;
}

function glyphFont() {
  return `bold ${SIZE * 0.66}px ui-rounded, "SF Pro Rounded", -apple-system, "Segoe UI", Roboto, sans-serif`;
}

export interface TraceSheetProps {
  guide: Guide;
  /** Called when coverage crosses the pass threshold. */
  onComplete: () => void;
  /** 0–1; default 0.5 is deliberately forgiving for little hands. */
  threshold?: number;
  penWidth?: number;
  label: string;
  /** Bump this to wipe the sheet and redraw the guide ("start over"). */
  resetKey?: number;
}

export default function TraceSheet({
  guide, onComplete, threshold = 0.5, penWidth = 26, label, resetKey = 0
}: TraceSheetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const samples = useRef<[number, number][]>([]);
  const drawing = useRef(false);
  const last = useRef<[number, number] | null>(null);
  const done = useRef(false);
  const [coverage, setCoverage] = useState(0);

  /* The parent re-renders roughly once a second (the screen-time engine ticks
     the store), which would recreate an inline `guide` object each time. We
     therefore key the reset on the guide's *content*, not its identity, and
     read the live guide through a ref — otherwise the canvas would wipe the
     child's work mid-stroke. */
  const guideKey = guide.kind === "glyph" ? `g:${guide.char}` : `p:${guide.d}`;
  const guideRef = useRef(guide);
  guideRef.current = guide;

  /** Paint the dashed guide and collect the sample points to score against. */
  const reset = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const guide = guideRef.current;
    const g = c.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, SIZE, SIZE);

    // Faint ruled baseline helps children place letters (a real workbook cue).
    g.strokeStyle = "#eef0fa";
    g.lineWidth = 2;
    [0.25, 0.5, 0.75].forEach(f => {
      g.beginPath();
      g.setLineDash(f === 0.5 ? [6, 8] : []);
      g.moveTo(SIZE * 0.06, SIZE * f);
      g.lineTo(SIZE * 0.94, SIZE * f);
      g.stroke();
    });
    g.setLineDash([]);

    // The dashed guide the child follows.
    g.strokeStyle = GUIDE;
    g.lineWidth = 4;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.setLineDash([11, 9]);
    if (guide.kind === "glyph") {
      g.font = glyphFont();
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.strokeText(guide.char, SIZE / 2, SIZE / 2 + SIZE * 0.03);
    } else {
      g.stroke(scaledPath(guide.d));
    }
    g.setLineDash([]);

    // Sample the guide's *solid* form offscreen to get scoring points.
    const off = document.createElement("canvas");
    off.width = off.height = SIZE;
    const og = off.getContext("2d")!;
    og.fillStyle = "#000";
    og.strokeStyle = "#000";
    og.lineCap = "round";
    og.lineJoin = "round";
    if (guide.kind === "glyph") {
      og.font = glyphFont();
      og.textAlign = "center";
      og.textBaseline = "middle";
      og.fillText(guide.char, SIZE / 2, SIZE / 2 + SIZE * 0.03);
    } else {
      og.lineWidth = 14;
      og.stroke(scaledPath(guide.d));
    }
    const data = og.getImageData(0, 0, SIZE, SIZE).data;
    const pts: [number, number][] = [];
    for (let y = 0; y < SIZE; y += 8)
      for (let x = 0; x < SIZE; x += 8)
        if (data[(y * SIZE + x) * 4 + 3] > 100) pts.push([x, y]);
    samples.current = pts;

    done.current = false;
    setCoverage(0);
  }, [guideKey, resetKey]);

  useEffect(reset, [reset]);

  function pos(e: React.PointerEvent): [number, number] {
    const r = canvasRef.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE];
  }

  /** Count guide sample points the child has inked over. */
  function measure() {
    const g = canvasRef.current!.getContext("2d")!;
    const img = g.getImageData(0, 0, SIZE, SIZE).data;
    let hit = 0;
    for (const [x, y] of samples.current) {
      const i = (y * SIZE + x) * 4;
      // Our ink is indigo: dark red channel, strong blue channel.
      if (img[i] < 170 && img[i + 2] > 150) hit++;
    }
    const pct = samples.current.length ? hit / samples.current.length : 0;
    setCoverage(pct);
    if (!done.current && pct >= threshold) {
      done.current = true;
      onComplete();
    }
    return pct;
  }

  function stroke(e: React.PointerEvent) {
    if (!drawing.current) return;
    e.preventDefault();
    const g = canvasRef.current!.getContext("2d")!;
    const [x, y] = pos(e);
    g.strokeStyle = INK;
    g.lineWidth = penWidth;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    const l = last.current ?? [x, y];
    g.moveTo(l[0], l[1]);
    g.lineTo(x, y);
    g.stroke();
    last.current = [x, y];
  }

  return (
    <div>
      <div className="glass mx-auto max-w-md overflow-hidden rounded-[1.75rem] p-2">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          role="img"
          aria-label={label}
          className="draw-surface block w-full rounded-3xl"
          onPointerDown={e => {
            (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
            drawing.current = true;
            last.current = pos(e);
            stroke(e);
          }}
          onPointerMove={stroke}
          onPointerUp={() => { drawing.current = false; last.current = null; measure(); }}
          onPointerCancel={() => { drawing.current = false; last.current = null; }}
        />
      </div>
      {/* Effort bar — grows as they trace, never scolds. */}
      <div className="mx-auto mt-3 max-w-md" role="progressbar"
        aria-valuenow={Math.round(coverage * 100)} aria-valuemin={0} aria-valuemax={100}
        aria-label="How much of the shape you have traced">
        <div className="h-3 overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-tint to-sky"
            animate={{ width: `${Math.min(100, Math.round((coverage / threshold) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
