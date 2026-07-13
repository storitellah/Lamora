/* Lamora colouring — tap-to-fill colouring pages built from inline SVG.
   Every region with class "fill" can be tapped to fill with the chosen
   colour. Supports undo/redo, local save and PNG export. */
(function () {
  "use strict";

  const COLORS = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#1abc9c", "#3498db", "#9b59b6", "#e84393", "#8d6e63", "#95a5a6", "#2d3452", "#ffffff", "#ffd1dc", "#aee9ff", "#d6f5c9"];
  const SAVE_KEY = "lamora-colouring-v1";

  /* Each page: friendly line-art built from simple SVG shapes.
     Regions carrying class="fill" are tappable. */
  const PAGES = [
    {
      id: "fish", emoji: "🐠", name: "Friendly Fish",
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect class="fill" x="0" y="0" width="400" height="300" fill="#fff" stroke="none"/>
        <ellipse class="fill" cx="180" cy="150" rx="100" ry="60" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <polygon class="fill" points="270,150 340,100 340,200" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <polygon class="fill" points="160,95 200,60 210,100" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <circle class="fill" cx="120" cy="135" r="12" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <path class="fill" d="M195 120 Q225 150 195 180 Q215 150 195 120 Z" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <circle class="fill" cx="70" cy="80" r="12" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <circle class="fill" cx="55" cy="115" r="8" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <path d="M20 260 Q60 240 100 260 T180 260 T260 260 T340 260" fill="none" stroke="#2d3452" stroke-width="4"/>
      </svg>`
    },
    {
      id: "rocket", emoji: "🚀", name: "Space Rocket",
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect class="fill" x="0" y="0" width="400" height="300" fill="#fff" stroke="none"/>
        <path class="fill" d="M200 30 Q250 100 250 180 L150 180 Q150 100 200 30 Z" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <circle class="fill" cx="200" cy="120" r="24" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <polygon class="fill" points="150,180 110,230 150,220" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <polygon class="fill" points="250,180 290,230 250,220" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <path class="fill" d="M180 220 L220 220 L200 270 Z" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <circle class="fill" cx="70" cy="70" r="16" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <circle class="fill" cx="330" cy="90" r="10" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <path class="fill" d="M310 220 l8 16 18 3 -13 12 3 18 -16 -9 -16 9 3 -18 -13 -12 18 -3 Z" fill="#fff" stroke="#2d3452" stroke-width="3"/>
      </svg>`
    },
    {
      id: "dragon", emoji: "🐉", name: "Baby Dragon",
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect class="fill" x="0" y="0" width="400" height="300" fill="#fff" stroke="none"/>
        <ellipse class="fill" cx="200" cy="190" rx="90" ry="60" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <circle class="fill" cx="150" cy="105" r="45" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <polygon class="fill" points="125,70 115,35 145,60" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <polygon class="fill" points="170,65 180,30 190,62" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <circle cx="140" cy="100" r="6" fill="#2d3452"/>
        <path class="fill" d="M270 170 Q340 140 350 200 Q320 190 285 205 Z" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <polygon class="fill" points="190,130 210,95 230,135" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <ellipse class="fill" cx="170" cy="245" rx="18" ry="10" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <ellipse class="fill" cx="235" cy="245" rx="18" ry="10" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <path d="M120 120 Q105 128 108 140" fill="none" stroke="#2d3452" stroke-width="3"/>
      </svg>`
    },
    {
      id: "castle", emoji: "🏰", name: "Fairy Castle",
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect class="fill" x="0" y="0" width="400" height="300" fill="#fff" stroke="none"/>
        <rect class="fill" x="120" y="120" width="160" height="130" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <rect class="fill" x="90" y="90" width="50" height="160" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <rect class="fill" x="260" y="90" width="50" height="160" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <polygon class="fill" points="90,90 115,45 140,90" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <polygon class="fill" points="260,90 285,45 310,90" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <path class="fill" d="M175 250 L175 190 Q200 165 225 190 L225 250 Z" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <rect class="fill" x="185" y="120" width="30" height="30" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <polygon class="fill" points="115,45 115,25 145,35" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <circle class="fill" cx="60" cy="60" r="18" fill="#fff" stroke="#2d3452" stroke-width="3"/>
      </svg>`
    },
    {
      id: "flower", emoji: "🌸", name: "Happy Flower",
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect class="fill" x="0" y="0" width="400" height="300" fill="#fff" stroke="none"/>
        <circle class="fill" cx="200" cy="110" r="30" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <ellipse class="fill" cx="200" cy="55" rx="22" ry="30" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <ellipse class="fill" cx="145" cy="90" rx="30" ry="22" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <ellipse class="fill" cx="255" cy="90" rx="30" ry="22" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <ellipse class="fill" cx="160" cy="150" rx="26" ry="24" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <ellipse class="fill" cx="240" cy="150" rx="26" ry="24" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <path d="M200 180 L200 260" stroke="#2d3452" stroke-width="4" fill="none"/>
        <ellipse class="fill" cx="170" cy="225" rx="26" ry="14" fill="#fff" stroke="#2d3452" stroke-width="4" transform="rotate(-25 170 225)"/>
        <ellipse class="fill" cx="230" cy="240" rx="26" ry="14" fill="#fff" stroke="#2d3452" stroke-width="4" transform="rotate(25 230 240)"/>
        <circle class="fill" cx="330" cy="60" r="26" fill="#fff" stroke="#2d3452" stroke-width="4"/>
      </svg>`
    },
    {
      id: "dino", emoji: "🦕", name: "Gentle Dino",
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect class="fill" x="0" y="0" width="400" height="300" fill="#fff" stroke="none"/>
        <ellipse class="fill" cx="210" cy="200" rx="100" ry="55" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <path class="fill" d="M120 180 Q80 120 95 70 Q125 85 135 130" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <circle class="fill" cx="95" cy="62" r="26" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <circle cx="88" cy="56" r="5" fill="#2d3452"/>
        <path class="fill" d="M300 190 Q360 170 370 210 Q340 205 310 220 Z" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <rect class="fill" x="165" y="240" width="24" height="35" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <rect class="fill" x="235" y="240" width="24" height="35" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <polygon class="fill" points="170,150 185,125 200,150" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <polygon class="fill" points="210,148 225,123 240,148" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <circle class="fill" cx="330" cy="60" r="22" fill="#fff" stroke="#2d3452" stroke-width="3"/>
      </svg>`
    },
    {
      id: "mermaid", emoji: "🧜‍♀️", name: "Mermaid Cove",
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect class="fill" x="0" y="0" width="400" height="300" fill="#fff" stroke="none"/>
        <circle class="fill" cx="180" cy="80" r="30" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <path class="fill" d="M150 65 Q135 40 165 45 Q160 55 180 50 Q205 40 210 65 Q212 90 205 95 Q212 70 195 68 Q175 72 150 65 Z" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <path class="fill" d="M165 110 Q160 160 175 190 L205 190 Q215 155 195 110 Z" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <path class="fill" d="M175 190 Q160 250 130 265 Q170 262 190 240 Q205 262 245 265 Q212 245 205 190 Z" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <circle class="fill" cx="300" cy="200" r="18" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <path class="fill" d="M60 220 l6 12 13 2 -9 9 2 13 -12 -6 -12 6 2 -13 -9 -9 13 -2 Z" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <path d="M20 280 Q60 265 100 280 T180 280 T260 280 T340 280" fill="none" stroke="#2d3452" stroke-width="4"/>
      </svg>`
    },
    {
      id: "car", emoji: "🚗", name: "Race Car",
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect class="fill" x="0" y="0" width="400" height="300" fill="#fff" stroke="none"/>
        <path class="fill" d="M70 190 L90 140 Q100 120 130 120 L250 120 Q280 120 300 150 L330 190 Z" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <rect class="fill" x="50" y="190" width="300" height="40" rx="16" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <rect class="fill" x="140" y="132" width="55" height="45" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <rect class="fill" x="210" y="132" width="55" height="45" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <circle class="fill" cx="120" cy="235" r="28" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <circle class="fill" cx="280" cy="235" r="28" fill="#fff" stroke="#2d3452" stroke-width="4"/>
        <circle class="fill" cx="120" cy="235" r="10" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <circle class="fill" cx="280" cy="235" r="10" fill="#fff" stroke="#2d3452" stroke-width="3"/>
        <circle class="fill" cx="330" cy="70" r="24" fill="#fff" stroke="#2d3452" stroke-width="3"/>
      </svg>`
    }
  ];

  function menu(ctx) {
    ctx.root.appendChild(ctx.backRow());
    ctx.root.appendChild(ctx.title("Colouring 🖍️", "Pick a picture and tap to fill it with colour!"));
    const grid = ctx.el("div", { class: "tile-grid" });
    PAGES.forEach(p => {
      grid.appendChild(ctx.el("button", {
        class: "tile", onclick: () => { ctx.Sound.tap(); openPage(ctx, p); }
      }, [
        ctx.el("span", { class: "tile-emoji", text: p.emoji }),
        ctx.el("span", { class: "tile-label", text: p.name })
      ]));
    });
    ctx.root.appendChild(grid);
  }

  function openPage(ctx, page) {
    let color = COLORS[0];
    const undoStack = [], redoStack = [];

    ctx.root.innerHTML = "";
    ctx.root.appendChild(ctx.backRow());
    ctx.root.appendChild(ctx.title(page.emoji + " " + page.name, "Tap a colour, then tap the picture!"));

    const pal = ctx.el("div", { class: "studio-toolbar palette", role: "toolbar", "aria-label": "Colours" });
    COLORS.forEach(c => {
      const sw = ctx.el("button", {
        class: "swatch" + (c === color ? " active" : ""), style: "background:" + c, "aria-label": "Colour " + c,
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

    const stage = ctx.el("div", { class: "colouring-stage" });
    stage.innerHTML = page.svg;
    const svg = stage.querySelector("svg");

    /* Restore a saved colouring for this page if one exists */
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}"); } catch (e) {}
    const saveId = ctx.profile().id + ":" + page.id;
    const fills = svg.querySelectorAll(".fill");
    if (saved[saveId]) {
      saved[saveId].forEach((c, i) => { if (c && fills[i]) fills[i].setAttribute("fill", c); });
    }

    fills.forEach((region, i) => {
      region.setAttribute("tabindex", "0");
      region.setAttribute("role", "button");
      region.setAttribute("aria-label", "Colour region " + (i + 1));
      const fill = () => {
        undoStack.push([i, region.getAttribute("fill")]);
        redoStack.length = 0;
        region.setAttribute("fill", color);
        ctx.Sound.pop();
      };
      region.addEventListener("click", fill);
      region.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fill(); } });
    });
    ctx.root.appendChild(stage);

    ctx.root.appendChild(ctx.el("div", { class: "btn-row" }, [
      ctx.el("button", {
        class: "btn btn-ghost btn-small", "aria-label": "Undo", onclick: () => {
          const u = undoStack.pop();
          if (!u) return;
          redoStack.push([u[0], fills[u[0]].getAttribute("fill")]);
          fills[u[0]].setAttribute("fill", u[1]);
          ctx.Sound.flip();
        }
      }, ["↩️ Undo"]),
      ctx.el("button", {
        class: "btn btn-ghost btn-small", "aria-label": "Redo", onclick: () => {
          const r = redoStack.pop();
          if (!r) return;
          undoStack.push([r[0], fills[r[0]].getAttribute("fill")]);
          fills[r[0]].setAttribute("fill", r[1]);
          ctx.Sound.flip();
        }
      }, ["↪️ Redo"]),
      ctx.el("button", {
        class: "btn btn-small", onclick: () => {
          try {
            saved[saveId] = [...fills].map(f => f.getAttribute("fill"));
            localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
            ctx.toast("Colouring saved! 🖼️");
            ctx.Sound.chime();
          } catch (e) { ctx.toast("Storage is full"); }
        }
      }, ["💾 Save"]),
      ctx.el("button", {
        class: "btn btn-small", onclick: () => exportPNG(ctx, svg, page)
      }, ["📤 Export"])
    ]));
  }

  function exportPNG(ctx, svg, page) {
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800; canvas.height = 600;
      const g = canvas.getContext("2d");
      g.fillStyle = "#fff";
      g.fillRect(0, 0, 800, 600);
      g.drawImage(img, 0, 0, 800, 600);
      const a = ctx.el("a", { href: canvas.toDataURL("image/png"), download: "lamora-" + page.id + ".png" });
      document.body.appendChild(a); a.click(); a.remove();
      ctx.toast("Exported as PNG 🎉");
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  }

  window.LamoraColouring = { menu };
})();
