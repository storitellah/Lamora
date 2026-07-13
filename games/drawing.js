/* Lamora drawing studio — free drawing with pencil, crayon, marker, brush,
   eraser, shapes, stickers, undo/redo, local save and PNG export.
   Everything happens on a canvas on this device. */
(function () {
  "use strict";

  const COLORS = ["#2d3452", "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#1abc9c", "#3498db", "#9b59b6", "#e84393", "#8d6e63", "#ffffff"];
  const TOOLS = [
    { id: "pencil", emoji: "✏️", size: 3, alpha: 1 },
    { id: "crayon", emoji: "🖍️", size: 9, alpha: 0.65 },
    { id: "marker", emoji: "🖊️", size: 14, alpha: 0.9 },
    { id: "brush",  emoji: "🖌️", size: 22, alpha: 0.5 },
    { id: "eraser", emoji: "🧽", size: 26, alpha: 1 }
  ];
  const SHAPES = ["⬜", "⚪", "⭐", "❤️"];
  const BACKGROUNDS = [
    ["None", null],
    ["Sky", ["#bde8ff", "#e8fbff"]],
    ["Sunset", ["#ffd3a5", "#fd6585"]],
    ["Meadow", ["#d4fc79", "#96e6a1"]],
    ["Ocean", ["#a1c4fd", "#c2e9fb"]],
    ["Night", ["#30336b", "#130f40"]]
  ];

  const SAVE_KEY = "lamora-drawings-v1";

  function open(ctx) {
    let tool = TOOLS[0], color = COLORS[0], drawing = false, last = null;
    const undoStack = [], redoStack = [];
    let stickerMode = null, shapeMode = null;

    ctx.root.appendChild(ctx.backRow());
    ctx.root.appendChild(ctx.title("Drawing Studio 🎨", "Draw with your finger, a stylus or the mouse!"));

    /* Toolbar: tools */
    const bar = ctx.el("div", { class: "studio-toolbar", role: "toolbar", "aria-label": "Drawing tools" });
    const toolBtns = {};
    TOOLS.forEach(t => {
      const b = ctx.el("button", {
        class: "tool-btn" + (t === tool ? " active" : ""), "aria-label": t.id,
        onclick: () => {
          tool = t; stickerMode = null; shapeMode = null;
          Object.values(toolBtns).forEach(x => x.classList.remove("active"));
          b.classList.add("active");
          ctx.Sound.tap();
        }
      }, [t.emoji]);
      toolBtns[t.id] = b;
      bar.appendChild(b);
    });

    /* Shapes */
    SHAPES.forEach(s => {
      bar.appendChild(ctx.el("button", {
        class: "tool-btn", "aria-label": "Stamp shape " + s,
        onclick: () => { shapeMode = s; stickerMode = null; ctx.Sound.tap(); ctx.toast("Tap the canvas to stamp " + s); }
      }, [s]));
    });

    /* Sticker picker (child's earned stickers) */
    bar.appendChild(ctx.el("button", {
      class: "tool-btn", "aria-label": "Add a sticker",
      onclick: () => {
        const st = ctx.profile().stickers;
        stickerMode = st[Math.floor(Math.random() * st.length)];
        shapeMode = null;
        ctx.toast("Tap the canvas to place " + stickerMode + " (tap again for more!)");
        ctx.Sound.pop();
      }
    }, ["✨"]));

    /* Undo / redo / clear */
    bar.appendChild(ctx.el("button", { class: "tool-btn", "aria-label": "Undo", onclick: () => { undo(); } }, ["↩️"]));
    bar.appendChild(ctx.el("button", { class: "tool-btn", "aria-label": "Redo", onclick: () => { redo(); } }, ["↪️"]));
    bar.appendChild(ctx.el("button", {
      class: "tool-btn", "aria-label": "Clear canvas",
      onclick: () => { if (confirm("Clear your drawing?")) { snapshot(); paintBackground(currentBg); ctx.Sound.tap(); } }
    }, ["🗑️"]));
    ctx.root.appendChild(bar);

    /* Colours */
    const pal = ctx.el("div", { class: "studio-toolbar palette", role: "toolbar", "aria-label": "Colours" });
    COLORS.forEach(c => {
      const sw = ctx.el("button", {
        class: "swatch" + (c === color ? " active" : ""), style: "background:" + c,
        "aria-label": "Colour " + c,
        onclick: () => {
          color = c;
          pal.querySelectorAll(".swatch").forEach(x => x.classList.remove("active"));
          sw.classList.add("active");
          ctx.Sound.pop();
        }
      });
      pal.appendChild(sw);
    });
    ctx.root.appendChild(pal);

    /* Backgrounds */
    const bgBar = ctx.el("div", { class: "studio-toolbar", role: "toolbar", "aria-label": "Backgrounds" });
    let currentBg = null;
    BACKGROUNDS.forEach(([name, grad]) => {
      bgBar.appendChild(ctx.el("button", {
        class: "btn btn-ghost btn-small", onclick: () => { snapshot(); currentBg = grad; paintBackground(grad, true); ctx.Sound.tap(); }
      }, [name]));
    });
    ctx.root.appendChild(bgBar);

    /* Canvas */
    const wrapEl = ctx.el("div", { class: "draw-canvas-wrap" });
    const canvas = ctx.el("canvas", { width: "800", height: "600", "aria-label": "Drawing canvas", role: "img" });
    wrapEl.appendChild(canvas);
    ctx.root.appendChild(wrapEl);
    const g = canvas.getContext("2d");
    g.lineCap = "round"; g.lineJoin = "round";
    paintBackground(null);

    function paintBackground(grad, keepArt) {
      if (!keepArt) { /* full clear */ }
      if (grad) {
        const lg = g.createLinearGradient(0, 0, 0, canvas.height);
        lg.addColorStop(0, grad[0]); lg.addColorStop(1, grad[1]);
        g.globalAlpha = 1; g.fillStyle = lg;
      } else {
        g.globalAlpha = 1; g.fillStyle = "#ffffff";
      }
      g.fillRect(0, 0, canvas.width, canvas.height);
    }

    function pos(e) {
      const r = canvas.getBoundingClientRect();
      return [
        (e.clientX - r.left) * (canvas.width / r.width),
        (e.clientY - r.top) * (canvas.height / r.height)
      ];
    }

    function snapshot() {
      undoStack.push(g.getImageData(0, 0, canvas.width, canvas.height));
      if (undoStack.length > 20) undoStack.shift();
      redoStack.length = 0;
    }
    function undo() {
      if (!undoStack.length) return;
      redoStack.push(g.getImageData(0, 0, canvas.width, canvas.height));
      g.putImageData(undoStack.pop(), 0, 0);
      ctx.Sound.flip();
    }
    function redo() {
      if (!redoStack.length) return;
      undoStack.push(g.getImageData(0, 0, canvas.width, canvas.height));
      g.putImageData(redoStack.pop(), 0, 0);
      ctx.Sound.flip();
    }

    canvas.addEventListener("pointerdown", e => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      snapshot();
      const [x, y] = pos(e);
      if (stickerMode) {
        g.globalAlpha = 1;
        g.font = "64px serif";
        g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(stickerMode, x, y);
        ctx.Sound.pop();
        return;
      }
      if (shapeMode) {
        g.globalAlpha = 1;
        drawShape(shapeMode, x, y);
        ctx.Sound.pop();
        return;
      }
      drawing = true; last = [x, y];
      dot(x, y);
    });
    canvas.addEventListener("pointermove", e => {
      if (!drawing) return;
      e.preventDefault();
      const [x, y] = pos(e);
      g.globalAlpha = tool.alpha;
      g.strokeStyle = tool.id === "eraser" ? "#ffffff" : color;
      g.lineWidth = tool.size;
      g.beginPath();
      g.moveTo(last[0], last[1]);
      g.lineTo(x, y);
      g.stroke();
      last = [x, y];
    });
    const stop = () => { drawing = false; g.globalAlpha = 1; };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);

    function dot(x, y) {
      g.globalAlpha = tool.alpha;
      g.fillStyle = tool.id === "eraser" ? "#ffffff" : color;
      g.beginPath();
      g.arc(x, y, tool.size / 2, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
    }

    function drawShape(s, x, y) {
      g.fillStyle = color; g.strokeStyle = color; g.lineWidth = 5;
      if (s === "⬜") g.strokeRect(x - 45, y - 45, 90, 90);
      else if (s === "⚪") { g.beginPath(); g.arc(x, y, 45, 0, Math.PI * 2); g.stroke(); }
      else { g.font = "72px serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, x, y); }
    }

    /* Save / export / gallery */
    const actions = ctx.el("div", { class: "btn-row" }, [
      ctx.el("button", {
        class: "btn btn-small", onclick: () => {
          try {
            const gallery = JSON.parse(localStorage.getItem(SAVE_KEY) || "[]");
            gallery.push({ who: ctx.profile().id, when: Date.now(), img: canvas.toDataURL("image/jpeg", 0.7) });
            while (gallery.length > 12) gallery.shift();
            localStorage.setItem(SAVE_KEY, JSON.stringify(gallery));
            ctx.toast("Saved to your gallery! 🖼️");
            ctx.Sound.chime();
          } catch (e) { ctx.toast("Storage is full — try deleting an old drawing"); }
        }
      }, ["💾 Save"]),
      ctx.el("button", {
        class: "btn btn-small", onclick: () => {
          const a = ctx.el("a", { href: canvas.toDataURL("image/png"), download: "lamora-drawing.png" });
          document.body.appendChild(a); a.click(); a.remove();
          ctx.toast("Drawing exported as PNG 🎉");
        }
      }, ["📤 Export PNG"]),
      ctx.el("button", { class: "btn btn-ghost btn-small", onclick: () => gallery(ctx) }, ["🖼️ My gallery"])
    ]);
    ctx.root.appendChild(actions);
  }

  function gallery(ctx) {
    ctx.root.innerHTML = "";
    ctx.root.appendChild(ctx.backRow());
    ctx.root.appendChild(ctx.title("My Gallery 🖼️", "Your saved masterpieces (kept on this device)"));
    let items = [];
    try { items = JSON.parse(localStorage.getItem(SAVE_KEY) || "[]"); } catch (e) {}
    const mine = items.filter(d => d.who === ctx.profile().id);
    if (!mine.length) {
      ctx.root.appendChild(ctx.el("p", { class: "screen-sub", text: "No saved drawings yet — go make some art!" }));
      return;
    }
    const grid = ctx.el("div", { class: "tile-grid" });
    mine.forEach(d => {
      const img = ctx.el("img", { src: d.img, alt: "Saved drawing", style: "width:100%;border-radius:12px" });
      grid.appendChild(ctx.el("div", { class: "card" }, [
        img,
        ctx.el("div", { class: "btn-row" }, [
          ctx.el("button", {
            class: "btn btn-small btn-danger", onclick: e => {
              const all = items.filter(x => x !== d);
              localStorage.setItem(SAVE_KEY, JSON.stringify(all));
              gallery(ctx);
            }
          }, ["🗑️ Delete"])
        ])
      ]));
    });
    ctx.root.appendChild(grid);
  }

  window.LamoraDrawing = { open };
})();
