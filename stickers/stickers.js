/* Lamora sticker book — earn stickers by learning, then build sticker
   scenes by dragging stickers around. Scenes can be saved as PNG. */
(function () {
  "use strict";

  /* Ordered unlock list: children earn these one by one as total stars grow. */
  const ALL_STICKERS = [
    "🌟", "😀", "🧜‍♀️", "🐬", "🐉", "🦖", "⭐", "🌈", "🪐", "🦁",
    "🌸", "🚗", "📷", "📚", "🎵", "🍦", "⚽", "😎", "🧑‍🚒", "🌳",
    "🐙", "🦋", "🐳", "🦄", "🚀", "🎂", "🏆", "🐢", "🎨", "🥇",
    "🦩", "🍉", "🛸", "🐲", "🧁", "🎪", "🐠", "🌺", "🎻", "🦜"
  ];

  function all() { return ALL_STICKERS; }

  function open(ctx) {
    const p = ctx.profile();
    ctx.root.appendChild(ctx.backRow());
    ctx.root.appendChild(ctx.title("Sticker Book ✨", "You have " + p.stickers.length + " of " + ALL_STICKERS.length + " stickers. Tap one to add it to your scene!"));

    /* Shelf: owned + locked stickers */
    const shelf = ctx.el("div", { class: "sticker-shelf", role: "toolbar", "aria-label": "Your stickers" });
    ALL_STICKERS.forEach(s => {
      const owned = p.stickers.includes(s);
      shelf.appendChild(ctx.el("button", {
        class: "sticker-item" + (owned ? "" : " locked"),
        "aria-label": owned ? "Add sticker " + s + " to the scene" : "Locked sticker — keep learning to unlock",
        onclick: () => {
          if (!owned) { ctx.toast("Keep learning to unlock this sticker! 📚"); return; }
          addToScene(s);
          ctx.Sound.pop();
        }
      }, [s]));
    });
    ctx.root.appendChild(shelf);

    /* Scene */
    const scene = ctx.el("div", { class: "sticker-scene", "aria-label": "Sticker scene. Drag stickers to move them." });
    ctx.root.appendChild(scene);

    let zTop = 1;
    function addToScene(s) {
      const st = ctx.el("span", {
        class: "scene-sticker", text: s, role: "img", "aria-label": "Sticker " + s,
        style: "left:" + (20 + Math.random() * 60) + "%;top:" + (20 + Math.random() * 50) + "%"
      });
      let dragging = false, offX = 0, offY = 0;
      st.addEventListener("pointerdown", e => {
        dragging = true;
        st.setPointerCapture(e.pointerId);
        const r = st.getBoundingClientRect();
        offX = e.clientX - r.left; offY = e.clientY - r.top;
        st.style.zIndex = ++zTop;
      });
      st.addEventListener("pointermove", e => {
        if (!dragging) return;
        const sr = scene.getBoundingClientRect();
        const x = Math.min(Math.max(e.clientX - sr.left - offX, 0), sr.width - 44);
        const y = Math.min(Math.max(e.clientY - sr.top - offY, 0), sr.height - 44);
        st.style.left = x + "px";
        st.style.top = y + "px";
      });
      st.addEventListener("pointerup", () => { dragging = false; });
      /* Double-tap removes a sticker */
      let lastTap = 0;
      st.addEventListener("pointerdown", () => {
        const now = Date.now();
        if (now - lastTap < 350) { st.remove(); ctx.Sound.flip(); }
        lastTap = now;
      });
      scene.appendChild(st);
    }

    ctx.root.appendChild(ctx.el("p", { class: "screen-sub", text: "Tip: drag stickers to move them, double-tap to remove one." }));
    ctx.root.appendChild(ctx.el("div", { class: "btn-row" }, [
      ctx.el("button", {
        class: "btn btn-small", onclick: () => exportScene(ctx, scene)
      }, ["📤 Save scene as PNG"]),
      ctx.el("button", {
        class: "btn btn-ghost btn-small", onclick: () => { scene.querySelectorAll(".scene-sticker").forEach(s => s.remove()); ctx.Sound.tap(); }
      }, ["🗑️ Clear scene"])
    ]));
  }

  function exportScene(ctx, scene) {
    const canvas = document.createElement("canvas");
    const r = scene.getBoundingClientRect();
    canvas.width = r.width * 2; canvas.height = r.height * 2;
    const g = canvas.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#bde8ff"); grad.addColorStop(0.6, "#e8fbff"); grad.addColorStop(1, "#ffeebb");
    g.fillStyle = grad;
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.font = "84px serif";
    g.textBaseline = "top";
    scene.querySelectorAll(".scene-sticker").forEach(s => {
      const sr = s.getBoundingClientRect();
      g.fillText(s.textContent, (sr.left - r.left) * 2, (sr.top - r.top) * 2);
    });
    const a = ctx.el("a", { href: canvas.toDataURL("image/png"), download: "lamora-sticker-scene.png" });
    document.body.appendChild(a); a.click(); a.remove();
    ctx.toast("Sticker scene saved! 🎉");
    ctx.Sound.chime();
  }

  window.LamoraStickers = { open, all };
})();
