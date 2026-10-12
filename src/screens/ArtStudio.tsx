/**
 * Art Studio — draw and paint with a finger, a mouse, or a stylus / Apple
 * Pencil, then save the artwork as a high-resolution JPG.
 *
 * The aim is the feel of a professional illustration app (layers, pressure,
 * smoothing, shapes, fill, mirror drawing, select-and-move, pinch zoom) with
 * controls a five-year-old can use: big labelled tools, one colour palette,
 * one size slider, and undo that always works.
 *
 * All drawing state lives in refs and is painted imperatively onto canvases.
 * React state only drives the toolbars — the app re-renders every second for
 * the screen-time clock, and that must never touch the picture.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Undo2, Redo2, Layers as LayersIcon, FlipHorizontal2, ZoomIn, ZoomOut, Maximize2, Save, Trash2,
  Eye, EyeOff, Lock, Unlock, Plus, ChevronUp, ChevronDown, Pipette, PaintBucket, Brush, Eraser,
  Shapes, Smile, Move, Images, ArrowLeft, X, PenTool, Download, Sparkles
} from "lucide-react";
import { Shell, Btn, toast } from "../components/UI";
import { sfx, haptic, speak } from "../lib/audio";
import { useStore } from "../lib/store";
import {
  ArtDocData, ArtObj, BitmapObj, BrushId, Layer, ShapeId, ShapeObj, StickerObj, StrokeObj,
  BRUSHES, SHAPES, PAPERS, SIZES, SizeId, newDoc, drawSegment, drawTail, drawObj, renderLayer,
  floodFill, flatten, posterScale, hitTest, translate, serialise, deserialise, lineArtFromSvg, loadBitmap
} from "../lib/art";
import { COLOURING_PAGES } from "../data/colouringPages";
import { canvasToBlob, saveBlob, saveMessage } from "../lib/saveFile";
import { isPenSeen, markPen } from "../lib/input";
import { ArtRecord, autosaveId, deleteArt, getArt, listArt, putArt } from "../lib/gallery";

/* ---------------- Palette ---------------- */

const PALETTE = [
  "#1d1d2f", "#6e6e87", "#ffffff", "#ff3b30", "#ff8a00", "#ffcc00",
  "#34c759", "#00a676", "#30b0ff", "#0a5cff", "#5b5bd6", "#af52de",
  "#ff5fa2", "#a0522d", "#f5c6a5", "#8d5524", "#ffe3ec", "#cdeffd"
];

const STICKERS = ["⭐", "🌈", "☀️", "🌙", "☁️", "🌸", "🌻", "🌳", "🍎", "🍓", "🐶", "🐱", "🦄", "🦋", "🐠", "🐞", "🐢", "🐬", "🦖", "🚀", "🚗", "🏠", "❤️", "💖", "🎈", "🎀", "👑", "🍦", "🎨", "✨"];

type Tool = "brush" | "eraser" | "fill" | "shape" | "sticker" | "picker" | "move";
type Mirror = "off" | "x" | "xy";

const TOOLS: { id: Tool; name: string; icon: React.ReactNode; key: string }[] = [
  { id: "brush", name: "Brush", icon: <Brush size={22} aria-hidden />, key: "b" },
  { id: "eraser", name: "Eraser", icon: <Eraser size={22} aria-hidden />, key: "e" },
  { id: "fill", name: "Fill", icon: <PaintBucket size={22} aria-hidden />, key: "g" },
  { id: "shape", name: "Shapes", icon: <Shapes size={22} aria-hidden />, key: "u" },
  { id: "sticker", name: "Stickers", icon: <Smile size={22} aria-hidden />, key: "s" },
  { id: "picker", name: "Pick", icon: <Pipette size={22} aria-hidden />, key: "i" },
  { id: "move", name: "Move", icon: <Move size={22} aria-hidden />, key: "v" }
];

/* ---------------- History ---------------- */

type Op =
  | { k: "add"; layerId: number; objs: ArtObj[] }
  | { k: "move"; layerId: number; obj: ArtObj; dx: number; dy: number }
  | { k: "clear"; prev: { layerId: number; objs: ArtObj[] }[] };

/* =====================================================================
   Entry: start screen, gallery, studio
   ===================================================================== */

export default function ArtStudio({ onExit }: { onExit: () => void }) {
  const { profile } = useStore();
  const pid = profile?.id ?? "guest";
  const [mode, setMode] = useState<"start" | "draw" | "gallery">("start");
  const [doc, setDoc] = useState<ArtDocData | null>(null);
  const [artId, setArtId] = useState<string | null>(null);
  const [hasAutosave, setHasAutosave] = useState(false);

  useEffect(() => {
    if (mode !== "start") return;
    getArt(autosaveId(pid)).then(r => setHasAutosave(!!r));
  }, [mode, pid]);

  async function startColouring(svg: string, name: string) {
    const d = newDoc("square");
    const art: BitmapObj = { t: "bitmap", id: d.nextId++, x: 0, y: 0, w: d.w, h: d.h, src: lineArtFromSvg(svg), locked: true };
    await loadBitmap(art);
    d.layers.push({ id: 3, name: "Picture", visible: true, opacity: 1, locked: true, objs: [art] });
    d.nextId = Math.max(d.nextId, 4);
    d.active = 1; // start painting on the colour layer, under the picture's lines
    d.title = name;
    setArtId(null); setDoc(d); setMode("draw");
  }

  async function resume() {
    const r = await getArt(autosaveId(pid));
    if (!r) return;
    setArtId(r.title.startsWith("id:") ? r.title.slice(3) : null);
    setDoc(await deserialise(r.doc)); setMode("draw");
  }

  if (mode === "draw" && doc) {
    return <Studio initial={doc} artId={artId} profileId={pid}
      onClose={() => { setMode("start"); setDoc(null); }}
      onSavedToGallery={id => setArtId(id)} />;
  }
  if (mode === "gallery") {
    return <Gallery profileId={pid} onBack={() => setMode("start")}
      onOpen={async r => { setArtId(r.id); setDoc(await deserialise(r.doc)); setMode("draw"); }} />;
  }

  return (
    <Shell title="Art Studio 🎨" subtitle="Draw with your finger, a stylus or an Apple Pencil" onBack={onExit} wide>
      {hasAutosave && (
        <button onClick={resume}
          className="glass mb-5 flex w-full items-center justify-between gap-3 rounded-[1.5rem] p-4 text-left">
          <span><span className="block text-lg font-bold">Keep drawing ✏️</span>
            <span className="text-sm text-ink-2">Carry on with the picture you were making</span></span>
          <span className="rounded-full bg-tint px-4 py-2 font-semibold text-white">Continue</span>
        </button>
      )}

      <h2 className="mb-3 text-lg font-bold">Start a new picture</h2>
      <div className="mb-6 grid grid-cols-3 gap-3">
        {(Object.keys(SIZES) as SizeId[]).map(s => (
          <button key={s} onClick={() => { sfx.tap(); setArtId(null); setDoc(newDoc(s)); setMode("draw"); }}
            aria-label={`New ${SIZES[s].name} picture`}
            className="glass flex flex-col items-center gap-2 rounded-[1.5rem] p-4">
            <span className="grid h-20 place-items-center">
              <span className="block rounded-md border-2 border-ink/15 bg-white shadow-sm"
                style={{ width: SIZES[s].w / 40, height: SIZES[s].h / 40 }} />
            </span>
            <span className="font-bold">{SIZES[s].name}</span>
          </button>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-bold">Colour a picture</h2>
      <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {COLOURING_PAGES.map(p => (
          <button key={p.id} onClick={() => { sfx.tap(); startColouring(p.svg, p.name); }}
            aria-label={`Colour the ${p.name}`}
            className="glass flex flex-col items-center gap-1 rounded-[1.5rem] p-3">
            <span className="text-4xl" aria-hidden>{p.icon}</span>
            <span className="text-sm font-semibold">{p.name}</span>
          </button>
        ))}
      </div>

      <Btn kind="soft" onClick={() => setMode("gallery")}><Images size={18} aria-hidden /> My Gallery</Btn>
    </Shell>
  );
}

/* ---------------- Gallery ---------------- */

function Gallery({ profileId, onBack, onOpen }: { profileId: string; onBack: () => void; onOpen: (r: ArtRecord) => void }) {
  const [items, setItems] = useState<ArtRecord[] | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const load = useCallback(() => { listArt(profileId).then(setItems); }, [profileId]);
  useEffect(load, [load]);

  async function exportJpg(r: ArtRecord) {
    const d = await deserialise(r.doc);
    const c = flatten(d, 1);
    const res = await saveBlob(await canvasToBlob(c), `${slug(r.title)}.jpg`);
    const m = saveMessage(res); if (m) toast(m);
  }

  return (
    <Shell title="My Gallery 🖼️" subtitle="Pictures you kept — they stay on this device" onBack={onBack} wide>
      {items === null ? null : items.length === 0 ? (
        <p className="glass rounded-[1.5rem] p-8 text-center text-ink-2">No pictures yet. Draw something and tap <b>Save</b> → <b>Keep in my gallery</b>!</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map(r => (
            <div key={r.id} className="glass overflow-hidden rounded-[1.5rem]">
              <button onClick={() => onOpen(r)} aria-label={`Open ${r.title}`} className="block w-full">
                <img src={r.thumb} alt={r.title} className="aspect-[4/3] w-full bg-white object-contain" />
              </button>
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="truncate px-1 text-sm font-semibold">{r.title}</span>
                <span className="flex shrink-0">
                  <button onClick={() => exportJpg(r)} aria-label={`Save ${r.title} as a JPG`} className="grid h-11 w-11 place-items-center rounded-full text-tint"><Download size={20} aria-hidden /></button>
                  <button onClick={() => setConfirm(r.id)} aria-label={`Delete ${r.title}`} className="grid h-11 w-11 place-items-center rounded-full text-coral"><Trash2 size={20} aria-hidden /></button>
                </span>
              </div>
              {confirm === r.id && (
                <div className="flex items-center justify-between gap-2 border-t border-ink/5 p-2 text-sm">
                  <span className="px-1 font-semibold">Delete it?</span>
                  <span className="flex gap-1">
                    <Btn kind="soft" className="!min-h-11 !px-3 !py-1" onClick={() => setConfirm(null)}>Keep</Btn>
                    <Btn kind="danger" className="!min-h-11 !px-3 !py-1" onClick={async () => { await deleteArt(r.id); setConfirm(null); load(); }}>Delete</Btn>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

const slug = (s: string) => (s || "my-picture").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-picture";

/* =====================================================================
   The studio
   ===================================================================== */

interface View { s: number; x: number; y: number }

function Studio({ initial, artId, profileId, onClose, onSavedToGallery }: {
  initial: ArtDocData; artId: string | null; profileId: string;
  onClose: () => void; onSavedToGallery: (id: string) => void;
}) {
  /* ---- UI state ---- */
  const [tool, setTool] = useState<Tool>("brush");
  const [brush, setBrush] = useState<BrushId>("pen");
  const [shape, setShape] = useState<ShapeId>("ellipse");
  const [sticker, setSticker] = useState("⭐");
  const [color, setColor] = useState("#5b5bd6");
  const [recent, setRecent] = useState<string[]>([]);
  const [sizes, setSizes] = useState<Record<string, number>>(() =>
    Object.fromEntries([...BRUSHES.map(b => [b.id, b.size]), ["shape", 20], ["sticker", 220]]));
  const [opacity, setOpacity] = useState<Record<string, number>>(() => Object.fromEntries(BRUSHES.map(b => [b.id, b.opacity])));
  const [filled, setFilled] = useState(false);
  const [mirror, setMirror] = useState<Mirror>("off");
  // If a pencil was already used elsewhere in the app, start with palm rejection on.
  const [penOnly, setPenOnly] = useState(isPenSeen);
  const [smooth, setSmooth] = useState(0.35);
  const [panel, setPanel] = useState<null | "layers" | "save" | "clear" | "more">(null);
  const [, setVersion] = useState(0);
  const bump = () => setVersion(v => v + 1);
  const [zoomPct, setZoomPct] = useState(100);
  const [currentArtId, setCurrentArtId] = useState(artId);

  /* ---- Imperative state ---- */
  const docRef = useRef<ArtDocData>(initial);
  const doc = docRef.current;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerCanvases = useRef(new Map<number, HTMLCanvasElement>());
  const live = useRef<HTMLCanvasElement | null>(null);
  const liveAlpha = useRef(1);
  const view = useRef<View>({ s: 1, x: 0, y: 0 });
  const undo = useRef<Op[]>([]);
  const redo = useRef<Op[]>([]);
  const dirty = useRef(true);
  const lifted = useRef<{ obj: ArtObj; layerId: number; dx: number; dy: number; sx: number; sy: number } | null>(null);
  const penSeen = useRef(isPenSeen());

  // Mirror refs for the event handlers (they must see the latest UI state).
  const S = useRef({ tool, brush, shape, sticker, color, sizes, opacity, filled, mirror, penOnly, smooth });
  S.current = { tool, brush, shape, sticker, color, sizes, opacity, filled, mirror, penOnly, smooth };

  const active = () => doc.layers.find(l => l.id === doc.active) ?? doc.layers[doc.layers.length - 1];

  /* ---- Canvases ---- */
  function layerCanvas(id: number) {
    let c = layerCanvases.current.get(id);
    if (!c) {
      c = document.createElement("canvas");
      c.width = doc.w; c.height = doc.h;
      layerCanvases.current.set(id, c);
    }
    return c;
  }
  const lctx = (id: number) => layerCanvas(id).getContext("2d")!;
  function rebuild(layer: Layer, skip?: ArtObj | null) { renderLayer(lctx(layer.id), layer, 1, skip); dirty.current = true; }

  useEffect(() => {
    live.current = document.createElement("canvas");
    live.current.width = doc.w; live.current.height = doc.h;
    doc.layers.forEach(l => rebuild(l));
    fit();
    const lc = layerCanvases.current;
    return () => {
      // Free the big canvases straight away — iPad Safari counts canvas memory strictly.
      lc.forEach(c => { c.width = c.height = 0; });
      if (live.current) live.current.width = live.current.height = 0;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- View ---- */
  function fit() {
    const w = wrapRef.current; if (!w) return;
    const cw = w.clientWidth, ch = w.clientHeight;
    const s = Math.min(cw / doc.w, ch / doc.h) * 0.94;
    view.current = { s, x: (cw - doc.w * s) / 2, y: (ch - doc.h * s) / 2 };
    setZoomPct(Math.round(s * 100)); dirty.current = true;
  }
  function zoomAt(factor: number, cx?: number, cy?: number) {
    const w = wrapRef.current; if (!w) return;
    const v = view.current;
    const px = cx ?? w.clientWidth / 2, py = cy ?? w.clientHeight / 2;
    const s = Math.min(8, Math.max(0.08, v.s * factor));
    const dx = (px - v.x) / v.s, dy = (py - v.y) / v.s;
    view.current = { s, x: px - dx * s, y: py - dy * s };
    setZoomPct(Math.round(s * 100)); dirty.current = true;
  }

  // Keep the backing store matched to the element size × device pixel ratio.
  useEffect(() => {
    const w = wrapRef.current, c = canvasRef.current; if (!w || !c) return;
    let first = true;
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(w.clientWidth * dpr); c.height = Math.round(w.clientHeight * dpr);
      if (first) { first = false; fit(); }
      dirty.current = true;
    });
    ro.observe(w);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Render loop ---- */
  useEffect(() => {
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!dirty.current) return;
      dirty.current = false;
      const c = canvasRef.current; if (!c) return;
      const ctx = c.getContext("2d")!;
      const dpr = c.width / (wrapRef.current?.clientWidth || c.width);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      const v = view.current;
      ctx.setTransform(dpr * v.s, 0, 0, dpr * v.s, dpr * v.x, dpr * v.y);
      // paper with a soft drop shadow so it reads as a sheet on a desk
      ctx.save();
      ctx.shadowColor = "rgba(29,29,47,0.18)"; ctx.shadowBlur = 24 / v.s; ctx.shadowOffsetY = 6 / v.s;
      ctx.fillStyle = doc.paper; ctx.fillRect(0, 0, doc.w, doc.h);
      ctx.restore();
      ctx.imageSmoothingQuality = "high";
      for (const layer of doc.layers) {
        if (!layer.visible) continue;
        ctx.globalAlpha = layer.opacity;
        ctx.drawImage(layerCanvas(layer.id), 0, 0);
        if (layer.id === doc.active && live.current) {
          const L = lifted.current;
          ctx.globalAlpha = layer.opacity * (L ? 1 : liveAlpha.current);
          ctx.drawImage(live.current, L ? L.dx : 0, L ? L.dy : 0);
        }
        ctx.globalAlpha = 1;
      }
      // mirror guides
      const m = S.current.mirror;
      if (m !== "off") {
        ctx.save();
        ctx.setLineDash([18 / v.s, 14 / v.s]); ctx.lineWidth = 2 / v.s; ctx.strokeStyle = "rgba(91,91,214,0.55)";
        ctx.beginPath(); ctx.moveTo(doc.w / 2, 0); ctx.lineTo(doc.w / 2, doc.h);
        if (m === "xy") { ctx.moveTo(0, doc.h / 2); ctx.lineTo(doc.w, doc.h / 2); }
        ctx.stroke(); ctx.restore();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { dirty.current = true; }, [mirror]);

  /* ---- History ---- */
  function push(op: Op) {
    undo.current.push(op);
    if (undo.current.length > 200) undo.current.shift();
    redo.current = [];
    scheduleAutosave(); bump();
  }
  function doUndo() {
    const op = undo.current.pop(); if (!op) return;
    apply(op, true); redo.current.push(op); sfx.flip(); scheduleAutosave(); bump();
  }
  function doRedo() {
    const op = redo.current.pop(); if (!op) return;
    apply(op, false); undo.current.push(op); sfx.flip(); scheduleAutosave(); bump();
  }
  function apply(op: Op, reverse: boolean) {
    if (op.k === "add") {
      const layer = doc.layers.find(l => l.id === op.layerId); if (!layer) return;
      if (reverse) layer.objs = layer.objs.filter(o => !op.objs.includes(o));
      else layer.objs.push(...op.objs);
      rebuild(layer);
    } else if (op.k === "move") {
      const layer = doc.layers.find(l => l.id === op.layerId); if (!layer) return;
      translate(op.obj, reverse ? -op.dx : op.dx, reverse ? -op.dy : op.dy);
      rebuild(layer);
    } else if (op.k === "clear") {
      for (const p of op.prev) {
        const layer = doc.layers.find(l => l.id === p.layerId); if (!layer) continue;
        layer.objs = reverse ? [...p.objs] : layer.objs.filter(o => o.t === "bitmap" && (o as BitmapObj).locked);
        rebuild(layer);
      }
    }
  }

  /* ---- Autosave (on-device only) ---- */
  const saveTimer = useRef<number | null>(null);
  function scheduleAutosave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => { saveTimer.current = null; void autosave(); }, 1500);
  }
  async function record(id: string, title: string): Promise<ArtRecord> {
    ensureSrc(doc);
    const thumb = flatten(doc, 360 / Math.max(doc.w, doc.h)).toDataURL("image/jpeg", 0.75);
    return { id, profileId, title, updated: Date.now(), thumb, doc: serialise(doc) };
  }
  async function autosave() {
    const hasContent = doc.layers.some(l => l.objs.some(o => !(o.t === "bitmap" && o.locked)));
    if (!hasContent) return;
    const r = await record(autosaveId(profileId), currentArtId ? `id:${currentArtId}` : "autosave");
    await putArt(r);
  }
  useEffect(() => () => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); void autosave(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Coordinates ---- */
  function toDoc(e: { clientX: number; clientY: number }): [number, number] {
    const r = canvasRef.current!.getBoundingClientRect();
    const v = view.current;
    return [(e.clientX - r.left - v.x) / v.s, (e.clientY - r.top - v.y) / v.s];
  }
  /** Pressure: only a pen reports real pressure; everything else draws evenly. */
  const pressureOf = (e: PointerEvent | React.PointerEvent) => (e.pointerType === "pen" ? Math.max(0.05, e.pressure || 0.5) : 0.5);

  function mirrors(x: number, y: number): [number, number][] {
    const m = S.current.mirror;
    if (m === "off") return [];
    const mx = doc.w - x, my = doc.h - y;
    return m === "x" ? [[mx, y]] : [[mx, y], [x, my], [mx, my]];
  }

  /* ---- Gesture bookkeeping ---- */
  type Stroke = { objs: StrokeObj[]; direct: boolean; last: [number, number, number]; dist: number; pointerId: number; pointerType: string; started: number };
  const stroke = useRef<Stroke | null>(null);
  const touches = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d0: number; m0: [number, number]; v0: View } | null>(null);
  const pan = useRef<{ x: number; y: number; v0: View; id: number } | null>(null);
  const shapeDraft = useRef<ShapeObj | null>(null);
  const stickerDraft = useRef<StickerObj | null>(null);
  const pickFlat = useRef<{ data: ImageData } | null>(null);
  const spaceDown = useRef(false);

  function cancelStroke() {
    const st = stroke.current; if (!st) return;
    stroke.current = null;
    if (st.direct) rebuild(active()); // segments were painted straight onto the layer
    clearLive();
  }
  function clearLive() {
    const l = live.current; if (!l) return;
    const x = l.getContext("2d")!;
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, l.width, l.height);
    liveAlpha.current = 1; dirty.current = true;
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    try { c.setPointerCapture(e.pointerId); } catch { /* ignore */ }

    // A stylus has been used: from now on fingers move and zoom, the pen draws.
    if (e.pointerType === "pen" && !penSeen.current) {
      penSeen.current = true;
      markPen();
      if (!S.current.penOnly) { setPenOnly(true); toast("✏️ Pencil found! Fingers now move and zoom — the pencil draws."); }
    }

    if (e.pointerType === "touch") {
      touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.current.size === 2) {
        // Second finger: this is a pinch, not a drawing. Undo the first finger's
        // stroke if it only just started (the usual "two fingers land" case).
        if (stroke.current && stroke.current.pointerType === "touch") cancelStroke();
        shapeDraft.current = null; stickerDraft.current = null; clearLive();
        const [a, b] = [...touches.current.values()];
        pinch.current = { d0: Math.hypot(a.x - b.x, a.y - b.y), m0: [(a.x + b.x) / 2, (a.y + b.y) / 2], v0: { ...view.current } };
        pan.current = null;
        return;
      }
      if (touches.current.size > 2) return;
      if (S.current.penOnly) { startPan(e); return; }
    }
    if (e.button === 1 || spaceDown.current || (e.pointerType === "mouse" && e.button === 2)) { startPan(e); return; }
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const [x, y] = toDoc(e);
    const s = S.current;
    const layer = active();
    const needsUnlocked = s.tool !== "picker";
    if (needsUnlocked && (layer.locked || !layer.visible)) {
      toast(layer.locked ? `🔒 The ${layer.name} layer is locked — pick another layer` : `👁️ The ${layer.name} layer is hidden`);
      setPanel("layers");
      return;
    }

    if (s.tool === "brush" || s.tool === "eraser") {
      const id = s.tool === "eraser" ? "eraser" : s.brush;
      const p = pressureOf(e);
      const base = {
        t: "stroke" as const, brush: id, color: s.color, size: s.sizes[id] ?? 14,
        opacity: id === "eraser" ? 1 : (s.opacity[id] ?? 1), seed: Math.floor(Math.random() * 1e9)
      };
      const objs: StrokeObj[] = [{ ...base, id: doc.nextId++, pts: [[x, y, p]] }];
      for (const [mx, my] of mirrors(x, y)) objs.push({ ...base, id: doc.nextId++, pts: [[mx, my, p]] });
      const direct = base.opacity >= 1 && id !== "crayon";
      liveAlpha.current = direct ? 1 : base.opacity;
      stroke.current = { objs, direct, last: [x, y, p], dist: 0, pointerId: e.pointerId, pointerType: e.pointerType, started: performance.now() };
      dirty.current = true;
      return;
    }
    if (s.tool === "shape") {
      shapeDraft.current = { t: "shape", id: 0, kind: s.shape, x1: x, y1: y, x2: x, y2: y, color: s.color, size: s.sizes.shape ?? 14, filled: s.filled, opacity: 1 };
      return;
    }
    if (s.tool === "sticker") {
      stickerDraft.current = { t: "sticker", id: 0, char: s.sticker, x, y, size: s.sizes.sticker ?? 180 };
      drawDraft();
      return;
    }
    if (s.tool === "fill") { doFill(x, y); return; }
    if (s.tool === "picker") {
      pickFlat.current = { data: flatten(doc, 1).getContext("2d")!.getImageData(0, 0, doc.w, doc.h) };
      pick(x, y);
      return;
    }
    if (s.tool === "move") {
      const hit = hitTest(layer, x, y);
      if (!hit) { startPan(e); return; }
      // Lift the object off the layer onto the live canvas so it can glide
      // around without re-rendering everything else on every frame.
      rebuild(layer, hit);
      clearLive();
      drawObj(live.current!.getContext("2d")!, hit);
      lifted.current = { obj: hit, layerId: layer.id, dx: 0, dy: 0, sx: x, sy: y };
      sfx.pop(); haptic();
      dirty.current = true;
    }
  }

  function startPan(e: React.PointerEvent) {
    pan.current = { x: e.clientX, y: e.clientY, v0: { ...view.current }, id: e.pointerId };
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.pointerType === "touch" && touches.current.has(e.pointerId)) {
      touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch.current && touches.current.size >= 2) {
        const [a, b] = [...touches.current.values()];
        const r = canvasRef.current!.getBoundingClientRect();
        const P = pinch.current;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const s = Math.min(8, Math.max(0.08, P.v0.s * (d / (P.d0 || 1))));
        const m: [number, number] = [(a.x + b.x) / 2, (a.y + b.y) / 2];
        const dx = (P.m0[0] - r.left - P.v0.x) / P.v0.s, dy = (P.m0[1] - r.top - P.v0.y) / P.v0.s;
        view.current = { s, x: m[0] - r.left - dx * s, y: m[1] - r.top - dy * s };
        setZoomPct(Math.round(s * 100));
        dirty.current = true;
        return;
      }
    }
    if (pan.current && pan.current.id === e.pointerId) {
      const P = pan.current;
      view.current = { ...P.v0, x: P.v0.x + e.clientX - P.x, y: P.v0.y + e.clientY - P.y };
      dirty.current = true;
      return;
    }

    const st = stroke.current;
    if (st && st.pointerId === e.pointerId) {
      // Apple Pencil reports up to 240 Hz; coalesced events keep every sample.
      const evs = (e.nativeEvent.getCoalescedEvents?.() ?? []);
      const list = evs.length ? evs : [e.nativeEvent];
      for (const ev of list) addPoint(st, ...toDoc(ev), pressureOf(ev));
      return;
    }
    if (shapeDraft.current) {
      const [x, y] = toDoc(e);
      const d = shapeDraft.current;
      d.x2 = x; d.y2 = y;
      if (e.shiftKey && d.kind !== "line") { // perfect square/circle with Shift
        const k = Math.max(Math.abs(x - d.x1), Math.abs(y - d.y1));
        d.x2 = d.x1 + Math.sign(x - d.x1 || 1) * k; d.y2 = d.y1 + Math.sign(y - d.y1 || 1) * k;
      }
      drawDraft();
      return;
    }
    if (stickerDraft.current) { const [x, y] = toDoc(e); stickerDraft.current.x = x; stickerDraft.current.y = y; drawDraft(); return; }
    if (pickFlat.current) { pick(...toDoc(e)); return; }
    if (lifted.current) {
      const [x, y] = toDoc(e);
      lifted.current.dx = x - lifted.current.sx; lifted.current.dy = y - lifted.current.sy;
      dirty.current = true;
    }
  }

  function addPoint(st: Stroke, rx: number, ry: number, p: number) {
    // Stabiliser: ease each new sample toward the pointer. Higher "smooth"
    // means rounder, calmer lines — helpful for small, shaky hands.
    const k = 1 - S.current.smooth * 0.75;
    const x = st.last[0] + (rx - st.last[0]) * k;
    const y = st.last[1] + (ry - st.last[1]) * k;
    const pr = st.last[2] + (p - st.last[2]) * 0.5;
    const step = Math.hypot(x - st.last[0], y - st.last[1]);
    if (step < 0.75 / view.current.s) return;
    st.last = [x, y, pr];
    st.dist += step;
    const layer = active();
    const target = st.direct ? lctx(layer.id) : live.current!.getContext("2d")!;
    const ms = mirrors(x, y);
    st.objs.forEach((o, idx) => {
      const [px, py] = idx === 0 ? [x, y] : ms[idx - 1];
      o.pts.push([px, py, pr]);
      target.save();
      if (o.brush === "eraser") target.globalCompositeOperation = "destination-out";
      drawSegment(target, o, o.pts.length - 1, st.dist);
      target.restore();
    });
    dirty.current = true;
  }

  function onUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.pointerType === "touch") {
      touches.current.delete(e.pointerId);
      if (touches.current.size < 2) pinch.current = null;
      if (pinch.current === null && touches.current.size === 0) pan.current = null;
    }
    if (pan.current && pan.current.id === e.pointerId) { pan.current = null; return; }

    const st = stroke.current;
    if (st && st.pointerId === e.pointerId) {
      stroke.current = null;
      if (e.type === "pointercancel") { if (st.direct) rebuild(active()); clearLive(); return; }
      const layer = active();
      const ctx = lctx(layer.id);
      if (st.direct) {
        st.objs.forEach(o => { ctx.save(); if (o.brush === "eraser") ctx.globalCompositeOperation = "destination-out"; drawTail(ctx, o); ctx.restore(); });
      } else {
        st.objs.forEach(o => drawObj(ctx, o));
        clearLive();
      }
      layer.objs.push(...st.objs);
      push({ k: "add", layerId: layer.id, objs: st.objs });
      dirty.current = true;
      return;
    }
    if (shapeDraft.current) {
      const d = shapeDraft.current; shapeDraft.current = null; clearLive();
      if (Math.hypot(d.x2 - d.x1, d.y2 - d.y1) < 6) { toast("Drag to draw the shape ↘️"); return; }
      const objs: ShapeObj[] = [{ ...d, id: doc.nextId++ }];
      commit(objs);
      return;
    }
    if (stickerDraft.current) {
      const d = stickerDraft.current; stickerDraft.current = null; clearLive();
      commit([{ ...d, id: doc.nextId++ }]);
      sfx.pop(); haptic();
      return;
    }
    if (pickFlat.current) {
      pickFlat.current = null;
      setRecent(r => [color, ...r.filter(c => c !== color)].slice(0, 6));
      setTool(prev => (prev === "picker" ? "brush" : prev));
      return;
    }
    if (lifted.current) {
      const L = lifted.current; lifted.current = null;
      clearLive();
      const layer = doc.layers.find(l => l.id === L.layerId)!;
      if (Math.abs(L.dx) + Math.abs(L.dy) > 0.5) {
        translate(L.obj, L.dx, L.dy);
        push({ k: "move", layerId: layer.id, obj: L.obj, dx: L.dx, dy: L.dy });
      }
      rebuild(layer);
    }
  }

  function commit(objs: ArtObj[]) {
    const layer = active();
    const ctx = lctx(layer.id);
    objs.forEach(o => drawObj(ctx, o));
    layer.objs.push(...objs);
    push({ k: "add", layerId: layer.id, objs });
    dirty.current = true;
  }

  function drawDraft() {
    clearLive();
    const x = live.current!.getContext("2d")!;
    if (shapeDraft.current) drawObj(x, shapeDraft.current);
    if (stickerDraft.current) drawObj(x, stickerDraft.current);
    dirty.current = true;
  }

  function pick(x: number, y: number) {
    const f = pickFlat.current; if (!f) return;
    const xi = Math.max(0, Math.min(doc.w - 1, Math.floor(x))), yi = Math.max(0, Math.min(doc.h - 1, Math.floor(y)));
    const i = (yi * doc.w + xi) * 4, d = f.data.data;
    setColor("#" + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, "0")).join(""));
  }

  function doFill(x: number, y: number) {
    const flat = flatten(doc, 1);
    const data = flat.getContext("2d")!.getImageData(0, 0, doc.w, doc.h);
    flat.width = flat.height = 0;
    const res = floodFill(data, x, y, S.current.color);
    if (!res) { toast("That's already this colour 🙂"); return; }
    const obj: BitmapObj = { t: "bitmap", id: doc.nextId++, x: res.x, y: res.y, w: res.w, h: res.h, src: "", img: res.canvas };
    commit([obj]);
    sfx.pop(); haptic();
    if (res.coverage > 0.6) toast("Whoosh! Big fill — tap ↩️ Undo if that was too much");
  }

  /* ---- Keyboard (Mac & Windows) ---- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); return; }
      if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); doRedo(); return; }
      if (mod && (e.key === "=" || e.key === "+")) { e.preventDefault(); zoomAt(1.25); return; }
      if (mod && e.key === "-") { e.preventDefault(); zoomAt(0.8); return; }
      if (mod && e.key === "0") { e.preventDefault(); fit(); return; }
      if (e.key === " ") { spaceDown.current = true; return; }
      if (mod) return;
      const t = TOOLS.find(t => t.key === e.key.toLowerCase());
      if (t) { setTool(t.id); return; }
      const sizeKey = S.current.tool === "eraser" ? "eraser" : S.current.tool === "brush" ? S.current.brush : S.current.tool;
      if (e.key === "]") setSizes(s => ({ ...s, [sizeKey]: Math.min(400, Math.round((s[sizeKey] ?? 14) * 1.2) + 1) }));
      if (e.key === "[") setSizes(s => ({ ...s, [sizeKey]: Math.max(2, Math.round((s[sizeKey] ?? 14) / 1.2)) }));
    };
    const up = (e: KeyboardEvent) => { if (e.key === " ") spaceDown.current = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  });

  // Trackpad pinch (ctrl+wheel) and mouse wheel zoom; two-finger scroll pans.
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = c.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 40 && e.deltaMode === 0 && !e.deltaX && Number.isInteger(e.deltaY)) {
        zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - r.left, e.clientY - r.top);
      } else {
        view.current = { ...view.current, x: view.current.x - e.deltaX, y: view.current.y - e.deltaY };
        dirty.current = true;
      }
    };
    c.addEventListener("wheel", wheel, { passive: false });
    return () => c.removeEventListener("wheel", wheel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Actions ---- */
  function chooseColor(c: string) {
    setColor(c); sfx.tap();
    if (!PALETTE.includes(c)) setRecent(r => [c, ...r.filter(x => x !== c)].slice(0, 6));
    if (tool === "eraser" || tool === "move" || tool === "picker") setTool("brush");
  }

  function clearAll() {
    const prev = doc.layers.filter(l => !l.locked).map(l => ({ layerId: l.id, objs: [...l.objs] }));
    if (!prev.some(p => p.objs.length)) { setPanel(null); return; }
    const op: Op = { k: "clear", prev };
    apply(op, false);
    push(op);
    setPanel(null);
    toast("Fresh page! (Undo brings it back)");
  }

  async function exportJpg(scale: number) {
    setPanel(null);
    toast(scale > 1 ? "Making your poster… 🖼️" : "Saving your picture… 🖼️");
    await new Promise(r => setTimeout(r, 30));
    try {
      const c = flatten(doc, scale);
      const blob = await canvasToBlob(c, "image/jpeg", 0.92);
      const w = c.width, h = c.height;
      c.width = c.height = 0;
      const name = `${slug(doc.title ?? "my-picture")}-${new Date().toISOString().slice(0, 10)}-${w}x${h}.jpg`;
      const res = await saveBlob(blob, name);
      const m = saveMessage(res); if (m) toast(m);
      if (res !== "failed" && res !== "cancelled") { sfx.win(); speak("Your picture is saved!"); }
    } catch {
      toast("That picture was too big to save on this device — try the normal size.");
    }
  }

  async function keepInGallery() {
    setPanel(null);
    const id = currentArtId ?? `art-${Date.now().toString(36)}`;
    const title = doc.title ?? `Picture ${new Date().toLocaleDateString()}`;
    doc.title = title;
    const ok = await putArt(await record(id, title));
    if (ok) {
      setCurrentArtId(id); onSavedToGallery(id);
      sfx.star(); toast("⭐ Kept in My Gallery");
    } else toast("Couldn't keep it — the device may be full.");
  }

  /* ---- Layers ---- */
  function setActive(id: number) { doc.active = id; bump(); }
  function addLayer() {
    if (doc.layers.length >= 6) { toast("That's lots of layers! (6 is the most)"); return; }
    const id = Math.max(...doc.layers.map(l => l.id)) + 1;
    const idx = doc.layers.findIndex(l => l.id === doc.active);
    doc.layers.splice(idx + 1, 0, { id, name: `Layer ${id}`, visible: true, opacity: 1, locked: false, objs: [] });
    doc.active = id; bump(); scheduleAutosave();
  }
  function deleteLayer(id: number) {
    const l = doc.layers.find(x => x.id === id)!;
    if (doc.layers.length <= 1 || l.locked) return;
    doc.layers = doc.layers.filter(x => x.id !== id);
    undo.current = undo.current.filter(op => !("layerId" in op) || op.layerId !== id);
    redo.current = [];
    layerCanvases.current.get(id)!.width = 0; layerCanvases.current.delete(id);
    if (doc.active === id) doc.active = doc.layers[doc.layers.length - 1].id;
    dirty.current = true; bump(); scheduleAutosave();
  }
  function moveLayer(id: number, dir: 1 | -1) {
    const i = doc.layers.findIndex(l => l.id === id), j = i + dir;
    if (j < 0 || j >= doc.layers.length) return;
    [doc.layers[i], doc.layers[j]] = [doc.layers[j], doc.layers[i]];
    dirty.current = true; bump(); scheduleAutosave();
  }

  /* ---- Derived UI ---- */
  const layer = active();
  const sizeKey = tool === "eraser" ? "eraser" : tool === "brush" ? brush : tool === "shape" ? "shape" : tool === "sticker" ? "sticker" : null;
  const colourLayer = doc.layers.find(l => l.name === "Colour");
  const linesLayer = doc.layers.find(l => l.name === "Lines");
  const underMode = layer === colourLayer;
  const zoomLabel = `${zoomPct}%`;

  const toolBtn = (t: typeof TOOLS[number]) => (
    <button key={t.id} onClick={() => { setTool(t.id); sfx.tap(); haptic(); }}
      aria-label={t.name} aria-pressed={tool === t.id}
      className={`flex min-h-14 min-w-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 text-[11px] font-bold transition-colors
        ${tool === t.id ? "bg-tint text-white shadow-md shadow-tint/30" : "text-ink hover:bg-ink/5"}`}>
      {t.icon}<span>{t.name}</span>
    </button>
  );

  const iconBtn = (label: string, icon: React.ReactNode, onClick: () => void, opts: { disabled?: boolean; pressed?: boolean } = {}) => (
    <button onClick={() => { if (!opts.disabled) { onClick(); } }} aria-label={label} title={label}
      aria-pressed={opts.pressed} disabled={opts.disabled}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors disabled:opacity-30
        ${opts.pressed ? "bg-tint text-white" : "bg-white/80 text-ink shadow-sm hover:bg-white"}`}>
      {icon}
    </button>
  );

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-2 pb-2 sm:px-3"
      style={{ height: "calc(100dvh - 92px)", minHeight: 460 }}>

      {/* ---- Action bar ---- */}
      <div className="glass flex items-center gap-1.5 overflow-x-auto rounded-full p-1.5 [scrollbar-width:none]">
        {iconBtn("Close the picture", <ArrowLeft size={20} aria-hidden />, () => { void autosave(); onClose(); })}
        <span className="mx-1 hidden truncate font-bold sm:block">{doc.title ?? "My picture"}</span>
        <span className="flex-1" />
        {iconBtn("Undo", <Undo2 size={20} aria-hidden />, doUndo, { disabled: !undo.current.length })}
        {iconBtn("Redo", <Redo2 size={20} aria-hidden />, doRedo, { disabled: !redo.current.length })}
        <span className="mx-0.5 h-6 w-px bg-ink/10" />
        {colourLayer && linesLayer && (
          <button onClick={() => { setActive(underMode ? linesLayer.id : colourLayer.id); sfx.tap(); toast(underMode ? "✏️ Drawing on the lines layer" : "🎨 Painting underneath the lines"); }}
            aria-pressed={underMode}
            className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-bold ${underMode ? "bg-sun text-ink" : "bg-white/80 shadow-sm"}`}>
            {underMode ? "🎨 Under lines" : "✏️ On top"}
          </button>
        )}
        {iconBtn("Layers", <LayersIcon size={20} aria-hidden />, () => setPanel(panel === "layers" ? null : "layers"), { pressed: panel === "layers" })}
        {iconBtn(mirror === "off" ? "Mirror drawing: off" : mirror === "x" ? "Mirror drawing: left and right" : "Mirror drawing: four ways",
          <FlipHorizontal2 size={20} aria-hidden />,
          () => { const n: Mirror = mirror === "off" ? "x" : mirror === "x" ? "xy" : "off"; setMirror(n); toast(n === "off" ? "Mirror off" : n === "x" ? "🪞 Mirror: left & right" : "❄️ Mirror: four ways"); },
          { pressed: mirror !== "off" })}
        <span className="mx-0.5 h-6 w-px bg-ink/10" />
        {iconBtn("Zoom out", <ZoomOut size={20} aria-hidden />, () => zoomAt(0.8))}
        <button onClick={fit} aria-label={`Zoom ${zoomLabel}. Tap to fit the page`} className="h-11 min-w-14 shrink-0 rounded-full bg-white/80 px-2 text-sm font-bold tabular-nums shadow-sm">{zoomLabel}</button>
        {iconBtn("Zoom in", <ZoomIn size={20} aria-hidden />, () => zoomAt(1.25))}
        {iconBtn("Fit the page", <Maximize2 size={20} aria-hidden />, fit)}
        <span className="mx-0.5 h-6 w-px bg-ink/10" />
        {iconBtn("More settings", <Sparkles size={20} aria-hidden />, () => setPanel(panel === "more" ? null : "more"), { pressed: panel === "more" })}
        {iconBtn("Start again", <Trash2 size={20} aria-hidden />, () => setPanel("clear"))}
        <button onClick={() => setPanel(panel === "save" ? null : "save")} aria-label="Save"
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-mint px-4 font-bold text-white shadow-md shadow-mint/30">
          <Save size={18} aria-hidden /> Save
        </button>
      </div>

      {/* ---- Tools + canvas ---- */}
      <div className="flex min-h-0 flex-1 gap-2 max-md:flex-col-reverse">
        <nav aria-label="Drawing tools"
          className="glass flex shrink-0 gap-1 overflow-auto rounded-[1.5rem] p-1.5 md:flex-col max-md:justify-between">
          {TOOLS.map(toolBtn)}
        </nav>

        <div ref={wrapRef} className="relative min-h-0 flex-1 overflow-hidden rounded-[1.5rem] bg-[#e9eaf2] shadow-inner">
          <canvas
            ref={canvasRef}
            className="draw-surface no-callout absolute inset-0 h-full w-full"
            style={{ cursor: tool === "move" ? "grab" : tool === "picker" ? "copy" : "crosshair" }}
            role="img"
            aria-label={`Drawing canvas. Tool: ${tool}. Layer: ${layer.name}.`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onContextMenu={e => e.preventDefault()}
          />
          {penOnly && (
            <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-white">
              <PenTool size={12} aria-hidden /> Pencil draws · fingers move
            </span>
          )}

          {/* ---- Floating panels ---- */}
          {panel === "layers" && (
            <Panel title="Layers" onClose={() => setPanel(null)}>
              <p className="mb-2 text-xs text-ink-2">The top of the list is the front of the picture. Tap a layer to draw on it.</p>
              <ul className="flex flex-col gap-1.5">
                {[...doc.layers].reverse().map(l => (
                  <li key={l.id} className={`flex items-center gap-1 rounded-2xl p-1.5 ${l.id === doc.active ? "bg-tint/12 ring-2 ring-tint" : "bg-white/70"}`}>
                    <button onClick={() => { l.visible = !l.visible; dirty.current = true; bump(); }} aria-label={`${l.visible ? "Hide" : "Show"} ${l.name}`} className="grid h-11 w-11 place-items-center rounded-full">
                      {l.visible ? <Eye size={18} aria-hidden /> : <EyeOff size={18} className="text-ink-2" aria-hidden />}
                    </button>
                    <button onClick={() => setActive(l.id)} className="min-h-11 flex-1 truncate text-left font-semibold" aria-label={`Draw on ${l.name}`}>
                      {l.name}{l.id === doc.active && <span className="ml-1 text-xs text-tint">✏️</span>}
                    </button>
                    <button onClick={() => { if (l.name === "Picture") { toast("The picture's lines stay safe 🔒"); return; } l.locked = !l.locked; bump(); }} aria-label={`${l.locked ? "Unlock" : "Lock"} ${l.name}`} className="grid h-11 w-9 place-items-center">
                      {l.locked ? <Lock size={16} aria-hidden /> : <Unlock size={16} className="text-ink-2" aria-hidden />}
                    </button>
                    <button onClick={() => moveLayer(l.id, 1)} aria-label={`Move ${l.name} forward`} className="grid h-11 w-8 place-items-center"><ChevronUp size={18} aria-hidden /></button>
                    <button onClick={() => moveLayer(l.id, -1)} aria-label={`Move ${l.name} back`} className="grid h-11 w-8 place-items-center"><ChevronDown size={18} aria-hidden /></button>
                  </li>
                ))}
              </ul>
              <label className="mt-3 block text-sm font-semibold">
                “{layer.name}” see-through: {Math.round(layer.opacity * 100)}%
                <input type="range" min={10} max={100} value={Math.round(layer.opacity * 100)} aria-label={`${layer.name} layer opacity`}
                  onChange={e => { layer.opacity = Number(e.target.value) / 100; dirty.current = true; bump(); }} className="mt-1 w-full accent-tint" />
              </label>
              <div className="mt-3 flex gap-2">
                <Btn kind="soft" className="flex-1 !px-3" onClick={addLayer}><Plus size={16} aria-hidden /> New layer</Btn>
                <Btn kind="ghost" className="!px-3" disabled={doc.layers.length <= 1 || layer.locked} onClick={() => deleteLayer(layer.id)} ariaLabel={`Delete ${layer.name}`}><Trash2 size={16} aria-hidden /></Btn>
              </div>
            </Panel>
          )}

          {panel === "more" && (
            <Panel title="Studio settings" onClose={() => setPanel(null)}>
              <label className="flex min-h-11 items-center justify-between gap-3 font-semibold">
                <span>✏️ Only the pencil draws<span className="block text-xs font-normal text-ink-2">Stops a resting hand making marks</span></span>
                <input type="checkbox" checked={penOnly} onChange={e => setPenOnly(e.target.checked)} className="h-6 w-6 accent-tint" aria-label="Only the pencil draws" />
              </label>
              <label className="mt-3 block font-semibold">
                〰️ Smooth lines: {Math.round(smooth * 100)}%
                <input type="range" min={0} max={90} value={Math.round(smooth * 100)} onChange={e => setSmooth(Number(e.target.value) / 100)} className="mt-1 w-full accent-tint" aria-label="Line smoothing" />
              </label>
              <p className="mt-3 font-semibold">📄 Paper</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {PAPERS.map(p => (
                  <button key={p.id} onClick={() => { doc.paper = p.id; dirty.current = true; bump(); scheduleAutosave(); }}
                    aria-label={`${p.name} paper`} aria-pressed={doc.paper === p.id}
                    className={`h-11 w-11 rounded-xl border ${doc.paper === p.id ? "ring-4 ring-tint" : "border-ink/15"}`} style={{ background: p.id }} />
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-2">On a keyboard: B brush · E eraser · G fill · U shapes · S stickers · I pick · V move · [ ] size · ⌘/Ctrl+Z undo · Space+drag to move around</p>
            </Panel>
          )}

          {panel === "save" && (
            <Panel title="Save your picture" onClose={() => setPanel(null)}>
              <div className="flex flex-col gap-2">
                <Btn kind="good" onClick={keepInGallery}><Images size={18} aria-hidden /> Keep in My Gallery</Btn>
                <Btn kind="primary" onClick={() => exportJpg(1)}><Download size={18} aria-hidden /> Save JPG ({doc.w}×{doc.h})</Btn>
                <Btn kind="soft" onClick={() => exportJpg(posterScale(doc))}>
                  🖼️ Big poster JPG ({Math.round(doc.w * posterScale(doc))}×{Math.round(doc.h * posterScale(doc))})
                </Btn>
              </div>
              <p className="mt-3 text-xs text-ink-2">Pictures are saved on this device only. Nothing is uploaded.</p>
            </Panel>
          )}

          {panel === "clear" && (
            <Panel title="Start again?" onClose={() => setPanel(null)}>
              <p className="text-sm text-ink-2">This wipes the page so you can start fresh. You can still tap Undo to bring it back.</p>
              <div className="mt-3 flex gap-2">
                <Btn kind="soft" className="flex-1" onClick={() => setPanel(null)}>Keep it</Btn>
                <Btn kind="danger" className="flex-1" onClick={clearAll}>Wipe page</Btn>
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* ---- Options bar (depends on the tool) ---- */}
      <div className="glass flex shrink-0 flex-col gap-2 rounded-[1.5rem] p-2 sm:p-3">
        {tool === "brush" && (
          <Row>
            {BRUSHES.filter(b => b.id !== "eraser").map(b => (
              <Chip key={b.id} on={brush === b.id} label={`${b.name} brush`} onClick={() => { setBrush(b.id); sfx.tap(); }}>
                <span aria-hidden className="text-lg">{b.emoji}</span> {b.name}
              </Chip>
            ))}
          </Row>
        )}
        {tool === "shape" && (
          <Row>
            {SHAPES.map(s => (
              <Chip key={s.id} on={shape === s.id} label={s.name} onClick={() => { setShape(s.id); sfx.tap(); }}>
                <span aria-hidden>{s.emoji}</span> {s.name}
              </Chip>
            ))}
            <span className="mx-1 h-6 w-px shrink-0 bg-ink/10" />
            <Chip on={!filled} label="Outline shapes" onClick={() => setFilled(false)}>◯ Outline</Chip>
            <Chip on={filled} label="Filled shapes" onClick={() => setFilled(true)}>⬤ Filled</Chip>
          </Row>
        )}
        {tool === "sticker" && (
          <Row>
            {STICKERS.map(s => (
              <button key={s} onClick={() => { setSticker(s); sfx.tap(); }} aria-label={`Sticker ${s}`} aria-pressed={sticker === s}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl ${sticker === s ? "bg-tint/15 ring-2 ring-tint" : ""}`}>{s}</button>
            ))}
          </Row>
        )}
        {(tool === "fill" || tool === "picker" || tool === "move" || tool === "eraser") && (
          <p className="px-2 text-sm font-semibold text-ink-2">
            {tool === "fill" && "🪣 Tap inside a shape to fill it with colour."}
            {tool === "picker" && "💧 Touch any colour in your picture to pick it up."}
            {tool === "move" && "✋ Drag a sticker, shape or line to move it. Drag empty paper to look around."}
            {tool === "eraser" && "🧽 Rub out mistakes on this layer."}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {tool !== "eraser" && tool !== "move" && tool !== "sticker" && (
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-1 [scrollbar-width:none]" role="group" aria-label="Colours">
              {[...recent.filter(c => !PALETTE.includes(c)), ...PALETTE].map(c => (
                <button key={c} onClick={() => chooseColor(c)} aria-label={`Colour ${c}`} aria-pressed={color === c}
                  className={`h-11 w-11 shrink-0 rounded-full border border-ink/15 transition-transform ${color === c ? "scale-110 ring-[3px] ring-tint ring-offset-2" : ""}`}
                  style={{ background: c }} />
              ))}
              <label className="relative grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-ink/15"
                style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }} aria-label="Make any colour">
                <input type="color" value={color} onChange={e => chooseColor(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Make any colour" />
              </label>
            </div>
          )}
          {sizeKey && (
            <label className="flex min-w-[11rem] flex-1 items-center gap-2 text-sm font-semibold sm:max-w-xs">
              <span className="shrink-0">Size</span>
              <input type="range" min={sizeKey === "sticker" ? 40 : 2} max={sizeKey === "sticker" ? 600 : sizeKey === "spray" ? 260 : 160}
                value={sizes[sizeKey] ?? 14} onChange={e => setSizes(s => ({ ...s, [sizeKey]: Number(e.target.value) }))}
                className="w-full accent-tint" aria-label="Size" />
              <span className="grid h-9 w-9 shrink-0 place-items-center" aria-hidden>
                <span className="rounded-full" style={{
                  background: tool === "eraser" ? "#c9cbe0" : color,
                  width: Math.max(3, Math.min(34, (sizes[sizeKey] ?? 14) * view.current.s * (sizeKey === "sticker" ? 0.3 : 1))),
                  height: Math.max(3, Math.min(34, (sizes[sizeKey] ?? 14) * view.current.s * (sizeKey === "sticker" ? 0.3 : 1)))
                }} />
              </span>
            </label>
          )}
          {tool === "brush" && (
            <label className="flex min-w-[10rem] flex-1 items-center gap-2 text-sm font-semibold sm:max-w-[14rem]">
              <span className="shrink-0">See-through</span>
              <input type="range" min={10} max={100} value={Math.round((opacity[brush] ?? 1) * 100)}
                onChange={e => setOpacity(o => ({ ...o, [brush]: Number(e.target.value) / 100 }))} className="w-full accent-tint" aria-label="Brush opacity" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Small UI pieces ---------------- */

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">{children}</div>;
}

function Chip({ on, label, onClick, children }: { on: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} aria-pressed={on}
      className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold transition-colors
        ${on ? "bg-tint text-white shadow-md shadow-tint/25" : "bg-white/80 text-ink"}`}>
      {children}
    </button>
  );
}

function Panel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div role="dialog" aria-label={title}
      className="glass-heavy absolute right-2 top-2 z-10 max-h-[calc(100%-1rem)] w-[min(22rem,calc(100%-1rem))] overflow-y-auto rounded-[1.5rem] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <button onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5"><X size={18} aria-hidden /></button>
      </div>
      {children}
    </div>
  );
}

/** Give fills a data URL before saving (done lazily — encoding is slow). */
function ensureSrc(doc: ArtDocData) {
  for (const l of doc.layers) for (const o of l.objs) {
    if (o.t === "bitmap" && !o.src && o.img instanceof HTMLCanvasElement) o.src = o.img.toDataURL("image/png");
  }
}
