/* Lamora "What Can I Be?" professions studio.
   PRIVACY: an optional photo can be added to the card. The photo is read
   with FileReader and drawn onto a local canvas only. It is never uploaded,
   never analysed, never face-recognised, and is discarded unless the family
   explicitly exports the finished card. A delete button clears it at once. */
(function () {
  "use strict";

  const PROFESSIONS = [
    { id: "doctor",     emoji: "🧑‍⚕️", name: "Doctor",          skills: "Caring, listening, science", tool: "Stethoscope", dream: "I want to help people feel better." },
    { id: "teacher",    emoji: "🧑‍🏫", name: "Teacher",         skills: "Patience, kindness, explaining", tool: "Books", dream: "I want to help everyone learn." },
    { id: "lawyer",     emoji: "⚖️",   name: "Lawyer",          skills: "Fairness, reading, speaking", tool: "Law books", dream: "I want to stand up for what is right." },
    { id: "journalist", emoji: "📰",   name: "Journalist",      skills: "Curiosity, writing, honesty", tool: "Notebook", dream: "I want to tell true stories." },
    { id: "photo",      emoji: "📷",   name: "Photographer",    skills: "Curiosity, patience, observation", tool: "Camera", dream: "I want to tell stories with pictures." },
    { id: "scientist",  emoji: "🔬",   name: "Scientist",       skills: "Wondering, testing, noticing", tool: "Microscope", dream: "I want to discover something new." },
    { id: "engineer",   emoji: "⚙️",   name: "Engineer",        skills: "Building, maths, imagination", tool: "Toolbox", dream: "I want to build amazing things." },
    { id: "pilot",      emoji: "✈️",   name: "Pilot",           skills: "Focus, maps, calm thinking", tool: "Aeroplane", dream: "I want to fly above the clouds." },
    { id: "farmer",     emoji: "🚜",   name: "Farmer",          skills: "Nature, hard work, animals", tool: "Tractor", dream: "I want to grow food for everyone." },
    { id: "artist",     emoji: "🎨",   name: "Artist",          skills: "Imagination, colours, practice", tool: "Paintbrush", dream: "I want to fill the world with colour." },
    { id: "musician",   emoji: "🎻",   name: "Musician",        skills: "Listening, rhythm, practice", tool: "Violin", dream: "I want to make music that makes people smile." },
    { id: "chef",       emoji: "👨‍🍳", name: "Chef",            skills: "Tasting, creativity, safety", tool: "Whisk", dream: "I want to cook delicious food." },
    { id: "architect",  emoji: "📐",   name: "Architect",       skills: "Drawing, maths, big ideas", tool: "Ruler", dream: "I want to design beautiful buildings." },
    { id: "firefighter",emoji: "🧑‍🚒", name: "Firefighter",     skills: "Bravery, teamwork, fitness", tool: "Fire hose", dream: "I want to keep people safe." },
    { id: "vet",        emoji: "🐾",   name: "Veterinarian",    skills: "Animal care, gentleness, science", tool: "Bandages", dream: "I want to help animals feel better." },
    { id: "astronaut",  emoji: "🧑‍🚀", name: "Astronaut",       skills: "Science, fitness, courage", tool: "Space suit", dream: "I want to explore the stars." },
    { id: "marine",     emoji: "🐠",   name: "Marine biologist",skills: "Swimming, ocean facts, patience", tool: "Diving mask", dream: "I want to protect the ocean." },
    { id: "programmer", emoji: "💻",   name: "Programmer",      skills: "Logic, puzzles, creativity", tool: "Computer", dream: "I want to build helpful apps." }
  ];

  function open(ctx) {
    ctx.root.appendChild(ctx.backRow());
    ctx.root.appendChild(ctx.title("What Can I Be? 🧑‍🚀", "Pick a job and make your own dream card!"));
    const grid = ctx.el("div", { class: "tile-grid" });
    PROFESSIONS.forEach(pr => {
      grid.appendChild(ctx.el("button", {
        class: "tile", onclick: () => { ctx.Sound.tap(); builder(ctx, pr); }
      }, [
        ctx.el("span", { class: "tile-emoji", text: pr.emoji }),
        ctx.el("span", { class: "tile-label", text: pr.name })
      ]));
    });
    ctx.root.appendChild(grid);
  }

  function builder(ctx, pr) {
    const p = ctx.profile();
    let photoImg = null;   /* HTMLImageElement, kept in memory only */

    ctx.root.innerHTML = "";
    ctx.root.appendChild(ctx.backRow());
    ctx.root.appendChild(ctx.title(pr.emoji + " Future " + pr.name, "Fill in your card, then export it!"));

    const nameIn = input("Your name or nickname", p.name);
    const titleIn = input("Fun title", "Super " + pr.name + " in training");
    const skillsIn = input("Skills to learn", pr.skills);
    const toolIn = input("Favourite tool", pr.tool);
    const dreamIn = input("My dream", pr.dream);

    function input(label, value) {
      const i = ctx.el("input", { type: "text", value, maxlength: "60", "aria-label": label });
      i.addEventListener("input", draw);
      return { label, el: i };
    }

    const form = ctx.el("div", { class: "form-grid" });
    [nameIn, titleIn, skillsIn, toolIn, dreamIn].forEach(f => {
      form.appendChild(ctx.el("label", { text: f.label }));
      form.appendChild(f.el);
    });

    /* Photo controls — file never leaves the device */
    const fileIn = ctx.el("input", { type: "file", accept: "image/*", "aria-label": "Add a photo (stays on this device)" });
    fileIn.addEventListener("change", () => {
      const f = fileIn.files && fileIn.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => { photoImg = img; draw(); };
        img.src = reader.result;
      };
      reader.readAsDataURL(f);
    });
    form.appendChild(ctx.el("label", { text: "Photo (optional — never uploaded, never analysed)" }));
    form.appendChild(fileIn);
    form.appendChild(ctx.el("button", {
      class: "btn btn-ghost btn-small", onclick: () => { photoImg = null; fileIn.value = ""; draw(); ctx.toast("Photo removed"); }
    }, ["🗑️ Remove photo"]));
    ctx.root.appendChild(form);

    /* Card canvas */
    const preview = ctx.el("div", { class: "pro-card-preview" });
    const canvas = ctx.el("canvas", { width: "600", height: "840", "aria-label": "Profession card preview", role: "img" });
    preview.appendChild(canvas);
    ctx.root.appendChild(preview);
    const g = canvas.getContext("2d");

    function draw() {
      const W = 600, H = 840;
      /* Background */
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#6c5ce7"); grad.addColorStop(1, "#2f9ee8");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      /* Card face */
      g.fillStyle = "#ffffff";
      roundRect(g, 24, 24, W - 48, H - 48, 28);
      g.fill();
      /* Header */
      g.fillStyle = "#6c5ce7";
      roundRect(g, 24, 24, W - 48, 110, 28);
      g.fill();
      g.fillStyle = "#fff";
      g.font = "bold 40px sans-serif";
      g.textAlign = "center";
      g.fillText("WHEN I GROW UP", W / 2, 92);

      /* Photo circle or emoji */
      g.save();
      g.beginPath();
      g.arc(W / 2, 265, 105, 0, Math.PI * 2);
      g.closePath();
      g.fillStyle = "#e8ecff";
      g.fill();
      g.clip();
      if (photoImg) {
        const s = Math.max(210 / photoImg.width, 210 / photoImg.height);
        const dw = photoImg.width * s, dh = photoImg.height * s;
        g.drawImage(photoImg, W / 2 - dw / 2, 265 - dh / 2, dw, dh);
      } else {
        g.font = "120px serif";
        g.fillText(pr.emoji, W / 2, 310);
      }
      g.restore();
      g.strokeStyle = "#6c5ce7";
      g.lineWidth = 8;
      g.beginPath();
      g.arc(W / 2, 265, 105, 0, Math.PI * 2);
      g.stroke();

      /* Text lines */
      g.fillStyle = "#2d3452";
      g.textAlign = "center";
      g.font = "bold 44px sans-serif";
      g.fillText(clip(nameIn.el.value, 20), W / 2, 440);
      g.font = "bold 34px sans-serif";
      g.fillStyle = "#2f9ee8";
      g.fillText("Future " + pr.name + " " + pr.emoji, W / 2, 495);
      g.fillStyle = "#5b6285";
      g.font = "26px sans-serif";
      g.fillText(clip(titleIn.el.value, 40), W / 2, 545);

      g.textAlign = "left";
      g.fillStyle = "#2d3452";
      g.font = "bold 26px sans-serif";
      g.fillText("Skills to learn:", 70, 615);
      g.font = "24px sans-serif";
      g.fillStyle = "#5b6285";
      g.fillText(clip(skillsIn.el.value, 42), 70, 650);

      g.fillStyle = "#2d3452";
      g.font = "bold 26px sans-serif";
      g.fillText("Favourite tool:", 70, 700);
      g.font = "24px sans-serif";
      g.fillStyle = "#5b6285";
      g.fillText(clip(toolIn.el.value, 42), 70, 735);

      g.fillStyle = "#2d3452";
      g.font = "bold 26px sans-serif";
      g.fillText("My dream:", 70, 785);
      g.font = "italic 22px sans-serif";
      g.fillStyle = "#5b6285";
      g.fillText("“" + clip(dreamIn.el.value, 44) + "”", 70, 815);

      /* Sticker in the corner */
      g.font = "52px serif";
      g.fillText(p.stickers[p.stickers.length - 1] || "🌟", W - 120, 130);
    }

    function clip(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }

    function roundRect(g, x, y, w, h, r) {
      g.beginPath();
      g.moveTo(x + r, y);
      g.arcTo(x + w, y, x + w, y + h, r);
      g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r);
      g.arcTo(x, y, x + w, y, r);
      g.closePath();
    }

    ctx.root.appendChild(ctx.el("div", { class: "btn-row" }, [
      ctx.el("button", {
        class: "btn", onclick: () => {
          const a = ctx.el("a", { href: canvas.toDataURL("image/png"), download: "lamora-" + pr.id + "-card.png" });
          document.body.appendChild(a); a.click(); a.remove();
          ctx.toast("Card exported! 🎉");
          ctx.Sound.chime();
        }
      }, ["📤 Export card as PNG"]),
      ctx.el("button", { class: "btn btn-ghost", onclick: () => window.print() }, ["🖨️ Print / PDF"])
    ]));
    ctx.root.appendChild(ctx.el("p", {
      class: "screen-sub",
      text: "🛡️ Privacy: photos stay on this device only. Nothing is uploaded or analysed, and the photo is gone when you leave this page unless you export the card yourself."
    }));

    draw();
    ctx.speak("Make your future " + pr.name + " card! Fill in your name and your dream.");
  }

  window.LamoraProfessions = { open };
})();
