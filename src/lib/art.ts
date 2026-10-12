/**
 * Art Studio engine — a small vector-first painting model.
 *
 * Every mark is stored as an *object* (a stroke with its points and pressure,
 * a shape, a sticker, a fill) rather than as pixels. That is what makes the
 * studio feel like a grown-up illustration app while staying light:
 *  - undo/redo is just removing/re-adding an object, never a 17 MB snapshot;
 *  - objects can be selected and moved after they are drawn;
 *  - the picture can be re-rendered at a larger size for a crisp export.
 *
 * Fills are the one raster object: a flood fill is computed against the
 * finished picture, so it is stored as a small bitmap cropped to its bounds.
 *
 * Randomness (crayon grain, spray dots) comes from a seeded generator, so a
 * stroke re-renders identically after an undo, a move, or an export.
 */

export type Pt = [number, number, number]; // x, y, pressure 0–1

export type BrushId = "pen" | "pencil" | "crayon" | "marker" | "spray" | "rainbow" | "eraser";
export type ShapeId = "line" | "rect" | "ellipse" | "triangle" | "star" | "heart";

export interface StrokeObj { t: "stroke"; id: number; brush: BrushId; color: string; size: number; opacity: number; seed: number; pts: Pt[] }
export interface ShapeObj { t: "shape"; id: number; kind: ShapeId; x1: number; y1: number; x2: number; y2: number; color: string; size: number; filled: boolean; opacity: number }
export interface StickerObj { t: "sticker"; id: number; char: string; x: number; y: number; size: number }
export interface BitmapObj { t: "bitmap"; id: number; x: number; y: number; w: number; h: number; src: string; img?: CanvasImageSource; /** line art is not movable */ locked?: boolean }
export type ArtObj = StrokeObj | ShapeObj | StickerObj | BitmapObj;

export interface Layer { id: number; name: string; visible: boolean; opacity: number; locked: boolean; objs: ArtObj[] }

export interface ArtDocData {
  w: number; h: number;
  paper: string;
  layers: Layer[];
  active: number; // layer id
  nextId: number;
  title?: string;
}

export const PAPERS = [
  { id: "#ffffff", name: "White" },
  { id: "#fbf6ea", name: "Cream" },
  { id: "#e9dcc4", name: "Kraft" },
  { id: "#22262e", name: "Chalkboard" },
  { id: "#e7f2ff", name: "Sky" }
];

export const SIZES = {
  landscape: { w: 2400, h: 1800, name: "Landscape" },
  portrait: { w: 1800, h: 2400, name: "Portrait" },
  square: { w: 2048, h: 2048, name: "Square" }
} as const;
export type SizeId = keyof typeof SIZES;

/* ---------------- Document ---------------- */

export function newDoc(size: SizeId = "landscape", paper = "#ffffff"): ArtDocData {
  const { w, h } = SIZES[size];
  return {
    w, h, paper, nextId: 3, active: 2,
    layers: [
      { id: 1, name: "Colour", visible: true, opacity: 1, locked: false, objs: [] },
      { id: 2, name: "Lines", visible: true, opacity: 1, locked: false, objs: [] }
    ]
  };
}

/** Deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- Brushes ---------------- */

export const BRUSHES: { id: BrushId; name: string; emoji: string; size: number; opacity: number }[] = [
  { id: "pen", name: "Pen", emoji: "✒️", size: 24, opacity: 1 },
  { id: "pencil", name: "Pencil", emoji: "✏️", size: 12, opacity: 0.9 },
  { id: "crayon", name: "Crayon", emoji: "🖍️", size: 44, opacity: 0.95 },
  { id: "marker", name: "Marker", emoji: "🖊️", size: 56, opacity: 0.55 },
  { id: "spray", name: "Spray", emoji: "💨", size: 110, opacity: 1 },
  { id: "rainbow", name: "Rainbow", emoji: "🌈", size: 36, opacity: 1 },
  { id: "eraser", name: "Eraser", emoji: "🧽", size: 70, opacity: 1 }
];

/** Width multiplier from pen pressure. Mouse/touch report a flat 0.5. */
function pw(brush: BrushId, p: number) {
  if (brush === "pen") return 0.25 + 1.5 * p;           // expressive ink
  if (brush === "pencil") return 0.6 + 0.8 * p;
  if (brush === "rainbow") return 0.5 + p;
  return 0.75 + 0.5 * p;                                // gentle for the rest
}

const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];

/** Distance travelled up to point i — drives rainbow hue so it re-renders identically. */
function travelled(s: StrokeObj, i: number) {
  let d = 0;
  for (let k = 1; k <= i; k++) d += Math.hypot(s.pts[k][0] - s.pts[k - 1][0], s.pts[k][1] - s.pts[k - 1][1]);
  return d;
}

/**
 * Draw the part of a stroke that ends at point i. Calling this for i = 1..n
 * draws the whole stroke; calling it as points arrive draws it live. Both
 * paths use the same code, so what you see while drawing is what you keep.
 *
 * Strokes are drawn opaque here; the caller applies the stroke's opacity
 * once for the whole stroke, so overlapping segments don't build up dark
 * blotches in a translucent marker line.
 */
export function drawSegment(ctx: CanvasRenderingContext2D, s: StrokeObj, i: number, dist?: number) {
  const P = s.pts;
  if (i <= 0 || i >= P.length) return;
  const a = P[i - 1], b = P[i];
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (s.brush === "spray") {
    const r = rng(s.seed + i * 7919);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.min(160, Math.max(16, Math.round(s.size * 0.9 + len * 0.6)));
    ctx.fillStyle = s.color;
    const rad = (s.size / 2) * (0.6 + b[2] * 0.8);
    for (let k = 0; k < n; k++) {
      const t = r();
      const ang = r() * Math.PI * 2, rr = Math.sqrt(r()) * rad;
      const x = a[0] + (b[0] - a[0]) * t + Math.cos(ang) * rr;
      const y = a[1] + (b[1] - a[1]) * t + Math.sin(ang) * rr;
      // droplet size scales with the nozzle so spray reads at any zoom
      const d = Math.max(1.5, s.size * 0.035) * (0.6 + r() * 0.9);
      ctx.fillRect(x, y, d, d);
    }
    return;
  }

  if (s.brush === "crayon") {
    // Waxy: a slightly thinner core line, then grain dots knocked out of it
    // and scattered round the edge, like wax catching paper texture.
    const r = rng(s.seed + i * 104729);
    const w = s.size * pw("crayon", b[2]);
    ctx.strokeStyle = s.color;
    ctx.lineWidth = w * 0.72;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.round(len * 0.9 + 4);
    ctx.fillStyle = s.color;
    for (let k = 0; k < n; k++) {
      const t = r();
      const off = (r() - 0.5) * w;
      const nx = -(b[1] - a[1]) / (len || 1), ny = (b[0] - a[0]) / (len || 1);
      const x = a[0] + (b[0] - a[0]) * t + nx * off, y = a[1] + (b[1] - a[1]) * t + ny * off;
      ctx.fillRect(x, y, 1.6 + r() * 1.6, 1.6 + r() * 1.6);
    }
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (let k = 0; k < n * 0.35; k++) {
      const t = r();
      const off = (r() - 0.5) * w * 0.7;
      const nx = -(b[1] - a[1]) / (len || 1), ny = (b[0] - a[0]) / (len || 1);
      ctx.fillRect(a[0] + (b[0] - a[0]) * t + nx * off, a[1] + (b[1] - a[1]) * t + ny * off, 1.5, 1.5);
    }
    ctx.restore();
    return;
  }

  // Smooth inked brushes: quadratic curves through segment midpoints.
  const start = i === 1 ? a : mid(P[i - 2], a);
  const end = mid(a, b);
  const w = s.size * pw(s.brush, (a[2] + b[2]) / 2);
  if (s.brush === "rainbow") {
    const d = dist ?? travelled(s, i);
    ctx.strokeStyle = `hsl(${(s.seed % 360 + d * 0.35) % 360} 90% 55%)`;
  } else {
    ctx.strokeStyle = s.brush === "eraser" ? "#000" : s.color;
  }
  ctx.lineWidth = Math.max(1, w);
  ctx.beginPath();
  ctx.moveTo(start[0], start[1]);
  ctx.quadraticCurveTo(a[0], a[1], end[0], end[1]);
  ctx.stroke();
  if (s.brush === "pencil") {
    // Graphite grain: a few light flecks along the line.
    const r = rng(s.seed + i * 31);
    ctx.fillStyle = s.color;
    for (let k = 0; k < 3; k++) {
      const t = r();
      ctx.fillRect(a[0] + (b[0] - a[0]) * t + (r() - 0.5) * w * 1.4, a[1] + (b[1] - a[1]) * t + (r() - 0.5) * w * 1.4, 1, 1);
    }
  }
}

/** The last little piece from the final midpoint to the final point, plus single taps. */
export function drawTail(ctx: CanvasRenderingContext2D, s: StrokeObj) {
  const P = s.pts;
  if (s.brush === "spray" || s.brush === "crayon") {
    if (P.length === 1) { s.pts = [P[0], [P[0][0] + 0.5, P[0][1] + 0.5, P[0][2]]]; drawSegment(ctx, s, 1); s.pts = P; }
    return;
  }
  ctx.lineCap = "round";
  const last = P[P.length - 1];
  if (s.brush === "rainbow") ctx.strokeStyle = ctx.fillStyle = `hsl(${(s.seed % 360 + travelled(s, P.length - 1) * 0.35) % 360} 90% 55%)`;
  else ctx.strokeStyle = ctx.fillStyle = s.brush === "eraser" ? "#000" : s.color;
  if (P.length === 1) {
    ctx.beginPath();
    ctx.arc(last[0], last[1], Math.max(1, (s.size * pw(s.brush, last[2])) / 2), 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const m = mid(P[P.length - 2], last);
  ctx.lineWidth = Math.max(1, s.size * pw(s.brush, last[2]));
  ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.lineTo(last[0], last[1]); ctx.stroke();
}

/* ---------------- Shapes ---------------- */

export const SHAPES: { id: ShapeId; name: string; emoji: string }[] = [
  { id: "line", name: "Line", emoji: "📏" },
  { id: "rect", name: "Square", emoji: "⬛" },
  { id: "ellipse", name: "Circle", emoji: "⚫" },
  { id: "triangle", name: "Triangle", emoji: "🔺" },
  { id: "star", name: "Star", emoji: "⭐" },
  { id: "heart", name: "Heart", emoji: "❤️" }
];

export function shapePath(o: ShapeObj): Path2D {
  const p = new Path2D();
  const x = Math.min(o.x1, o.x2), y = Math.min(o.y1, o.y2);
  const w = Math.abs(o.x2 - o.x1), h = Math.abs(o.y2 - o.y1);
  const cx = x + w / 2, cy = y + h / 2;
  switch (o.kind) {
    case "line": p.moveTo(o.x1, o.y1); p.lineTo(o.x2, o.y2); break;
    case "rect": p.rect(x, y, w, h); break;
    case "ellipse": p.ellipse(cx, cy, Math.max(1, w / 2), Math.max(1, h / 2), 0, 0, Math.PI * 2); break;
    case "triangle": p.moveTo(cx, y); p.lineTo(x + w, y + h); p.lineTo(x, y + h); p.closePath(); break;
    case "star": {
      for (let k = 0; k < 10; k++) {
        const ang = -Math.PI / 2 + (k * Math.PI) / 5;
        const r = k % 2 === 0 ? 1 : 0.42;
        const px = cx + Math.cos(ang) * (w / 2) * r, py = cy + Math.sin(ang) * (h / 2) * r * 1.05 + h * 0.03;
        k === 0 ? p.moveTo(px, py) : p.lineTo(px, py);
      }
      p.closePath();
      break;
    }
    case "heart": {
      p.moveTo(cx, y + h * 0.95);
      p.bezierCurveTo(x - w * 0.15, y + h * 0.55, x + w * 0.05, y - h * 0.1, cx, y + h * 0.27);
      p.bezierCurveTo(x + w * 0.95, y - h * 0.1, x + w * 1.15, y + h * 0.55, cx, y + h * 0.95);
      p.closePath();
      break;
    }
  }
  return p;
}

/* ---------------- Rendering ---------------- */

const scratch = { c: null as HTMLCanvasElement | null };
function scratchCanvas(w: number, h: number) {
  if (!scratch.c) scratch.c = document.createElement("canvas");
  const c = scratch.c;
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  // Callers clear only the area they used, so the scratch canvas is always
  // left transparent and never needs a full-size clear here.
  const x = c.getContext("2d")!;
  x.setTransform(1, 0, 0, 1, 0, 0);
  return { c, x };
}

/** Draw one object onto a layer canvas (already scaled to document units). */
export function drawObj(ctx: CanvasRenderingContext2D, o: ArtObj, scale = 1) {
  if (o.t === "stroke") {
    const paint = (x: CanvasRenderingContext2D) => {
      let d = 0;
      for (let i = 1; i < o.pts.length; i++) {
        d += Math.hypot(o.pts[i][0] - o.pts[i - 1][0], o.pts[i][1] - o.pts[i - 1][1]);
        drawSegment(x, o, i, d);
      }
      drawTail(x, o);
    };
    // Fully opaque strokes go straight onto the layer (the common, fast path).
    if (o.opacity >= 1 && o.brush !== "crayon") {
      ctx.save();
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      if (o.brush === "eraser") ctx.globalCompositeOperation = "destination-out";
      paint(ctx);
      ctx.restore();
      return;
    }
    // Translucent strokes (and crayon, whose grain knocks pixels out) are
    // painted opaque on a scratch canvas and composited once, limited to the
    // stroke's own bounds so re-rendering a busy layer stays quick.
    const { c, x } = scratchCanvas(ctx.canvas.width, ctx.canvas.height);
    const b = bbox(o);
    const bx = Math.max(0, Math.floor(b.x * scale)), by = Math.max(0, Math.floor(b.y * scale));
    const bw = Math.min(c.width - bx, Math.ceil(b.w * scale) + 2), bh = Math.min(c.height - by, Math.ceil(b.h * scale) + 2);
    if (bw <= 0 || bh <= 0) return;
    x.setTransform(scale, 0, 0, scale, 0, 0);
    paint(x);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = o.opacity;
    if (o.brush === "eraser") ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(c, bx, by, bw, bh, bx, by, bw, bh);
    ctx.restore();
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(bx, by, bw, bh);
    return;
  }
  ctx.save();
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  if (o.t === "shape") {
    const path = shapePath(o);
    ctx.globalAlpha = o.opacity;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (o.filled && o.kind !== "line") { ctx.fillStyle = o.color; ctx.fill(path); }
    else { ctx.strokeStyle = o.color; ctx.lineWidth = o.size; ctx.stroke(path); }
  } else if (o.t === "sticker") {
    ctx.font = `${o.size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(o.char, o.x, o.y);
  } else if (o.t === "bitmap" && o.img) {
    ctx.drawImage(o.img, o.x, o.y, o.w, o.h);
  }
  ctx.restore();
}

/** Rebuild a whole layer from its objects. */
export function renderLayer(ctx: CanvasRenderingContext2D, layer: Layer, scale = 1, skip?: ArtObj | null) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const o of layer.objs) if (o !== skip) drawObj(ctx, o, scale);
}

/** Bounding box of an object in document units (for selecting and moving). */
export function bbox(o: ArtObj): { x: number; y: number; w: number; h: number } {
  if (o.t === "stroke") {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of o.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const pad = o.size;
    return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
  }
  if (o.t === "shape") {
    const pad = o.size;
    return { x: Math.min(o.x1, o.x2) - pad, y: Math.min(o.y1, o.y2) - pad, w: Math.abs(o.x2 - o.x1) + pad * 2, h: Math.abs(o.y2 - o.y1) + pad * 2 };
  }
  if (o.t === "sticker") return { x: o.x - o.size * 0.6, y: o.y - o.size * 0.6, w: o.size * 1.2, h: o.size * 1.2 };
  return { x: o.x, y: o.y, w: o.w, h: o.h };
}

export function translate(o: ArtObj, dx: number, dy: number) {
  if (o.t === "stroke") o.pts = o.pts.map(([x, y, p]) => [x + dx, y + dy, p] as Pt);
  else if (o.t === "shape") { o.x1 += dx; o.x2 += dx; o.y1 += dy; o.y2 += dy; }
  else { o.x += dx; o.y += dy; }
}

/** Topmost movable object on a layer under a point (strokes hit by distance to the line). */
export function hitTest(layer: Layer, x: number, y: number): ArtObj | null {
  for (let i = layer.objs.length - 1; i >= 0; i--) {
    const o = layer.objs[i];
    if (o.t === "bitmap") continue; // fills and line art aren't picked up
    const b = bbox(o);
    if (x < b.x || x > b.x + b.w || y < b.y || y > b.y + b.h) continue;
    if (o.t !== "stroke") return o;
    if (o.brush === "eraser") continue;
    const tol = Math.max(18, o.size);
    for (let k = 0; k < o.pts.length; k++) {
      const a = o.pts[Math.max(0, k - 1)], c = o.pts[k];
      if (segDist(x, y, a[0], a[1], c[0], c[1]) < tol) return o;
    }
  }
  return null;
}

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/* ---------------- Flood fill ---------------- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Scanline flood fill against the flattened picture. Returns a bitmap object
 * cropped to the filled area, or null if the tap landed on the same colour.
 *
 * The mask is grown by two pixels so the fill tucks under anti-aliased line
 * edges — otherwise every coloured shape has a thin pale halo inside its
 * outline, which children notice immediately.
 */
export function floodFill(flat: ImageData, sx: number, sy: number, color: string, tolerance = 48): { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number; coverage: number } | null {
  const { width: W, height: H, data } = flat;
  sx = Math.floor(sx); sy = Math.floor(sy);
  if (sx < 0 || sy < 0 || sx >= W || sy >= H) return null;
  const i0 = (sy * W + sx) * 4;
  const r0 = data[i0], g0 = data[i0 + 1], b0 = data[i0 + 2];
  const [fr, fg, fb] = hexToRgb(color);
  if (Math.abs(fr - r0) + Math.abs(fg - g0) + Math.abs(fb - b0) < 12) return null;

  const tol2 = tolerance * tolerance * 3;
  const match = (p: number) => {
    const dr = data[p] - r0, dg = data[p + 1] - g0, db = data[p + 2] - b0;
    return dr * dr + dg * dg + db * db <= tol2;
  };
  const mask = new Uint8Array(W * H);
  const stack: number[] = [sx, sy];
  let minX = sx, maxX = sx, minY = sy, maxY = sy, count = 0;
  while (stack.length) {
    const y = stack.pop()!, x0 = stack.pop()!;
    let x = x0;
    let row = y * W;
    while (x >= 0 && !mask[row + x] && match((row + x) * 4)) x--;
    x++;
    let up = false, down = false;
    while (x < W && !mask[row + x] && match((row + x) * 4)) {
      mask[row + x] = 1; count++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (y > 0) {
        const m = mask[row - W + x] === 0 && match((row - W + x) * 4);
        if (m && !up) { stack.push(x, y - 1); up = true; } else if (!m) up = false;
      }
      if (y < H - 1) {
        const m = mask[row + W + x] === 0 && match((row + W + x) * 4);
        if (m && !down) { stack.push(x, y + 1); down = true; } else if (!m) down = false;
      }
      x++;
    }
  }
  if (!count) return null;

  const GROW = 2;
  minX = Math.max(0, minX - GROW); minY = Math.max(0, minY - GROW);
  maxX = Math.min(W - 1, maxX + GROW); maxY = Math.min(H - 1, maxY + GROW);
  const w = maxX - minX + 1, h = maxY - minY + 1;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const cx = canvas.getContext("2d")!;
  const out = cx.createImageData(w, h);
  const o = out.data;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      // dilate: a pixel is filled if any pixel within GROW is in the mask
      let hit = mask[y * W + x] === 1;
      for (let dy = -GROW; !hit && dy <= GROW; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= H) continue;
        for (let dx = -GROW; dx <= GROW; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= W) continue;
          if (mask[yy * W + xx]) { hit = true; break; }
        }
      }
      if (hit) {
        const k = ((y - minY) * w + (x - minX)) * 4;
        o[k] = fr; o[k + 1] = fg; o[k + 2] = fb; o[k + 3] = 255;
      }
    }
  }
  cx.putImageData(out, 0, 0);
  return { canvas, x: minX, y: minY, w, h, coverage: count / (W * H) };
}

/* ---------------- Flatten / export ---------------- */

/**
 * Render the whole picture (paper + visible layers) at `scale` × document
 * size. Used for the fill bucket's boundary map, the eyedropper, thumbnails
 * and the high-resolution JPG export.
 */
export function flatten(doc: ArtDocData, scale = 1, extra?: { layerId: number; draw: (ctx: CanvasRenderingContext2D) => void }): HTMLCanvasElement {
  const W = Math.round(doc.w * scale), H = Math.round(doc.h * scale);
  const out = document.createElement("canvas");
  out.width = W; out.height = H;
  const o = out.getContext("2d")!;
  o.fillStyle = doc.paper;
  o.fillRect(0, 0, W, H);
  const tmp = document.createElement("canvas");
  tmp.width = W; tmp.height = H;
  const t = tmp.getContext("2d")!;
  for (const layer of doc.layers) {
    if (!layer.visible) continue;
    renderLayer(t, layer, scale);
    if (extra && extra.layerId === layer.id) extra.draw(t);
    o.globalAlpha = layer.opacity;
    o.drawImage(tmp, 0, 0);
    o.globalAlpha = 1;
  }
  tmp.width = tmp.height = 0; // release memory early (iPad Safari is strict)
  return out;
}

/** Largest export that stays under iOS Safari's ~16.7 MP canvas limit. */
export function posterScale(doc: ArtDocData) {
  return Math.min(2, Math.sqrt(12_000_000 / (doc.w * doc.h)));
}

/* ---------------- Serialising ---------------- */

export function serialise(doc: ArtDocData): string {
  return JSON.stringify(doc, (k, v) => (k === "img" ? undefined : v));
}

/** Rehydrate a saved picture, decoding its bitmap objects. */
export async function deserialise(json: string): Promise<ArtDocData> {
  const doc = JSON.parse(json) as ArtDocData;
  await Promise.all(doc.layers.flatMap(l => l.objs.filter(o => o.t === "bitmap").map(o => loadBitmap(o as BitmapObj))));
  return doc;
}

export function loadBitmap(o: BitmapObj): Promise<void> {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => { o.img = img; res(); };
    img.onerror = () => res();
    img.src = o.src;
  });
}

/** Turn one of the colouring-book SVGs into transparent line art. */
export function lineArtFromSvg(svg: string): string {
  // The colouring-book SVGs are written for inline HTML, where a bare
  // attribute like `data-fill` is fine. As a standalone image the SVG is
  // parsed as strict XML, which rejects valueless attributes — so give them
  // one, or the picture silently fails to load.
  const clear = svg
    .replace(/\s(data-[a-z-]+)(?=[\s/>])/g, ' $1=""')
    .replace(/fill="#fff(fff)?"/gi, 'fill="none"')
    .replace(/<svg /, '<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" ');
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(clear);
}
