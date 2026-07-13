/* Lamora Memory Gym — matching pairs, sequence recall, picture recall,
   colour sequences and word memory. Difficulty adapts to age, with an
   encouraging tone throughout. */
(function () {
  "use strict";

  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];

  const EXERCISES = [
    { id: "pairs",   emoji: "🃏", name: "Matching Pairs",  sub: "Find the twins" },
    { id: "recall",  emoji: "🖼️", name: "Picture Recall",  sub: "What did you see?" },
    { id: "order",   emoji: "📋", name: "Recall the Order", sub: "Remember the sequence" },
    { id: "colours", emoji: "🌈", name: "Colour Memory",   sub: "Remember the colours" },
    { id: "words",   emoji: "💬", name: "Word Memory",     sub: "Remember the words" },
    { id: "where",   emoji: "📍", name: "Where Was It?",   sub: "Location memory" }
  ];

  const EMOJI_POOL = ["🐬", "🦄", "🐉", "🦖", "🌈", "🚀", "🐼", "🦊", "🐸", "🦋", "🌻", "🍓", "⚽", "🎸", "🧁", "🐙", "🦉", "🐝"];

  function menu(ctx) {
    ctx.root.appendChild(ctx.backRow());
    ctx.root.appendChild(ctx.title("Memory Gym 🧠", "Give your brain a happy workout!"));
    const grid = ctx.el("div", { class: "tile-grid" });
    EXERCISES.forEach(g => {
      grid.appendChild(ctx.el("button", {
        class: "tile",
        onclick: () => { ctx.Sound.tap(); start(g.id, ctx); }
      }, [
        ctx.el("span", { class: "tile-emoji", text: g.emoji }),
        ctx.el("span", { class: "tile-label", text: g.name }),
        ctx.el("span", { class: "tile-sub", text: g.sub })
      ]));
    });
    ctx.root.appendChild(grid);
  }

  function start(id, ctx) {
    ({ pairs, recall, order, colours, words, where })[id](ctx);
  }

  function header(ctx, ex, sub) {
    const wrap = ctx.el("div", { class: "activity-wrap" });
    wrap.appendChild(ctx.backRow());
    wrap.appendChild(ctx.el("h1", { class: "screen-title", text: ex.emoji + " " + ex.name }));
    if (sub) wrap.appendChild(ctx.el("p", { class: "screen-sub", text: sub }));
    return wrap;
  }

  function done(ctx, ex, msg, stars) {
    ctx.celebrate({
      stars: stars || 2, category: "memory", emoji: "🧠",
      title: "Memory master!", message: msg,
      again: () => start(ex.id, ctx), againLabel: "Train again"
    });
  }

  /* ---------- Matching pairs ---------- */
  function pairs(ctx) {
    const ex = EXERCISES[0];
    const nPairs = ctx.level() === 1 ? 4 : ctx.level() === 2 ? 6 : 8;
    const faces = ctx.shuffle(EMOJI_POOL.slice()).slice(0, nPairs);
    const deck = ctx.shuffle([...faces, ...faces]);
    let first = null, lock = false, matched = 0, moves = 0;

    ctx.root.innerHTML = "";
    const wrap = header(ctx, ex, "Flip two cards and find the matching pairs!");
    const cols = nPairs <= 4 ? 4 : 4;
    const grid = ctx.el("div", { class: "mem-grid", style: "grid-template-columns:repeat(" + cols + ",auto)" });
    deck.forEach(face => {
      const card = ctx.el("button", { class: "mem-card", "aria-label": "Face-down card" }, [face]);
      card.addEventListener("click", () => {
        if (lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
        ctx.Sound.flip();
        card.classList.add("flipped");
        card.setAttribute("aria-label", face);
        if (!first) { first = card; return; }
        moves++;
        if (first.textContent === face && first !== card) {
          first.classList.add("matched"); card.classList.add("matched");
          ctx.Sound.correct();
          matched++;
          first = null;
          if (matched === nPairs) setTimeout(() => done(ctx, ex, `You found all ${nPairs} pairs in ${moves} tries!`), 500);
        } else {
          lock = true;
          const a = first; first = null;
          setTimeout(() => {
            a.classList.remove("flipped"); card.classList.remove("flipped");
            a.setAttribute("aria-label", "Face-down card");
            card.setAttribute("aria-label", "Face-down card");
            lock = false;
          }, 900);
        }
      });
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    ctx.root.appendChild(wrap);
    ctx.speak("Flip two cards and find the matching pairs!");
  }

  /* ---------- Picture recall ---------- */
  function recall(ctx) {
    const ex = EXERCISES[1];
    const n = ctx.level() === 1 ? 3 : ctx.level() === 2 ? 4 : 6;
    const shown = ctx.shuffle(EMOJI_POOL.slice()).slice(0, n);
    const missing = pick(shown);

    ctx.root.innerHTML = "";
    const wrap = header(ctx, ex, "Look carefully — one picture will disappear!");
    const stage = ctx.el("div", { class: "prompt-card" }, [
      ctx.el("div", { class: "prompt-emoji", text: shown.join(" ") }),
      ctx.el("p", { class: "prompt-hint", text: "Remember them all…" })
    ]);
    wrap.appendChild(stage);
    ctx.root.appendChild(wrap);
    ctx.speak("Look carefully and remember the pictures!");

    setTimeout(() => {
      const remaining = shown.filter(e => e !== missing);
      ctx.root.innerHTML = "";
      const w2 = header(ctx, ex, "Which picture disappeared?");
      w2.appendChild(ctx.el("div", { class: "prompt-card" }, [
        ctx.el("div", { class: "prompt-emoji", text: ctx.shuffle(remaining.slice()).join(" ") + " ❓" })
      ]));
      const grid = ctx.el("div", { class: "answer-grid" });
      const opts = new Set([missing]);
      while (opts.size < Math.min(4, n + 1)) opts.add(pick(EMOJI_POOL));
      ctx.shuffle([...opts]).forEach(o => {
        grid.appendChild(ctx.el("button", {
          class: "answer-btn", onclick: e => {
            if (o === missing) {
              ctx.Sound.correct(); e.target.classList.add("correct");
              setTimeout(() => done(ctx, ex, "You spotted the missing picture!"), 600);
            } else { ctx.Sound.tryAgain(); ctx.toast("Close your eyes and picture them again 💭"); }
          }
        }, [o]));
      });
      w2.appendChild(grid);
      ctx.root.appendChild(w2);
      ctx.speak("Which picture disappeared?");
    }, ctx.level() === 1 ? 5000 : 3500);
  }

  /* ---------- Recall the order ---------- */
  function order(ctx) {
    const ex = EXERCISES[2];
    const n = ctx.level() === 1 ? 3 : ctx.level() === 2 ? 4 : 5;
    const seq = ctx.shuffle(EMOJI_POOL.slice()).slice(0, n);

    ctx.root.innerHTML = "";
    const wrap = header(ctx, ex, "Watch the order — then repeat it!");
    const stage = ctx.el("div", { class: "prompt-card" }, [
      ctx.el("div", { class: "prompt-emoji", text: "👀" })
    ]);
    wrap.appendChild(stage);
    ctx.root.appendChild(wrap);

    /* Show items one at a time */
    seq.forEach((e, i) => {
      setTimeout(() => { stage.firstChild.textContent = e; ctx.Sound.tick(); }, 900 * (i + 1));
    });

    setTimeout(() => {
      let progress = 0;
      ctx.root.innerHTML = "";
      const w2 = header(ctx, ex, "Tap them in the same order!");
      const doneRow = ctx.el("div", { class: "prompt-card" }, [
        ctx.el("div", { class: "prompt-emoji", text: "_ ".repeat(n) })
      ]);
      w2.appendChild(doneRow);
      const grid = ctx.el("div", { class: "answer-grid" });
      ctx.shuffle(seq.slice()).forEach(o => {
        grid.appendChild(ctx.el("button", {
          class: "answer-btn", onclick: e => {
            if (o === seq[progress]) {
              ctx.Sound.correct();
              e.target.classList.add("correct");
              e.target.disabled = true;
              progress++;
              doneRow.firstChild.textContent = seq.slice(0, progress).join(" ") + " _".repeat(n - progress);
              if (progress === n) setTimeout(() => done(ctx, ex, `You remembered all ${n} in order!`), 500);
            } else {
              ctx.Sound.tryAgain();
              ctx.toast("Hmm, which one came next? 💭");
            }
          }
        }, [o]));
      });
      w2.appendChild(grid);
      ctx.root.appendChild(w2);
      ctx.speak("Now tap them in the same order!");
    }, 900 * (n + 1) + 600);
    ctx.speak("Watch the order carefully!");
  }

  /* ---------- Colour memory ---------- */
  function colours(ctx) {
    const ex = EXERCISES[3];
    const COLS = [["🔴", "red"], ["🟠", "orange"], ["🟡", "yellow"], ["🟢", "green"], ["🔵", "blue"], ["🟣", "purple"]];
    const n = ctx.level() === 1 ? 3 : ctx.level() === 2 ? 4 : 5;
    const seq = Array.from({ length: n }, () => pick(COLS));

    ctx.root.innerHTML = "";
    const wrap = header(ctx, ex, "Remember the colour pattern!");
    const stage = ctx.el("div", { class: "prompt-card" }, [
      ctx.el("div", { class: "prompt-emoji", text: seq.map(c => c[0]).join(" ") })
    ]);
    wrap.appendChild(stage);
    ctx.root.appendChild(wrap);
    ctx.speak("Remember the colours: " + seq.map(c => c[1]).join(", "));

    setTimeout(() => {
      const qIndex = rnd(n);
      ctx.root.innerHTML = "";
      const w2 = header(ctx, ex, "Which colour was number " + (qIndex + 1) + "?");
      const hiddenSeq = seq.map((c, i) => (i === qIndex ? "❓" : "⚪")).join(" ");
      w2.appendChild(ctx.el("div", { class: "prompt-card" }, [
        ctx.el("div", { class: "prompt-emoji", text: hiddenSeq })
      ]));
      const grid = ctx.el("div", { class: "answer-grid" });
      COLS.forEach(([e, name]) => {
        grid.appendChild(ctx.el("button", {
          class: "answer-btn", "aria-label": name, onclick: ev => {
            if (e === seq[qIndex][0]) {
              ctx.Sound.correct(); ev.target.classList.add("correct");
              setTimeout(() => done(ctx, ex, "Colour memory unlocked!"), 600);
            } else { ctx.Sound.tryAgain(); ctx.toast("Picture the colours again 🌈"); }
          }
        }, [e]));
      });
      w2.appendChild(grid);
      ctx.root.appendChild(w2);
      ctx.speak("Which colour was number " + (qIndex + 1) + "?");
    }, ctx.level() === 1 ? 5000 : 3500);
  }

  /* ---------- Word memory ---------- */
  function words(ctx) {
    const ex = EXERCISES[4];
    const POOL = ["sun", "cat", "boat", "tree", "star", "cake", "frog", "moon", "ball", "bird", "shell", "cloud"];
    const n = ctx.level() === 1 ? 3 : ctx.level() === 2 ? 4 : 6;
    const shown = ctx.shuffle(POOL.slice()).slice(0, n);
    const target = pick(shown);

    ctx.root.innerHTML = "";
    const wrap = header(ctx, ex, "Read (or listen to) these words and remember them!");
    wrap.appendChild(ctx.el("div", { class: "prompt-card" }, [
      ctx.el("div", { class: "prompt-text", text: shown.join(" • ") }),
      ctx.el("button", { class: "speak-btn", "aria-label": "Hear the words", onclick: () => ctx.speak(shown.join(", ")) }, ["🔊"])
    ]));
    ctx.root.appendChild(wrap);
    ctx.speak("Remember these words: " + shown.join(", "));

    setTimeout(() => {
      ctx.root.innerHTML = "";
      const w2 = header(ctx, ex, "Which word WAS on the list?");
      const opts = new Set([target]);
      let guard = 0;
      while (opts.size < 4 && guard++ < 50) {
        const w = pick(POOL);
        if (!shown.includes(w)) opts.add(w);
      }
      const grid = ctx.el("div", { class: "answer-grid" });
      ctx.shuffle([...opts]).forEach(o => {
        grid.appendChild(ctx.el("button", {
          class: "answer-btn", style: "font-size:1.3rem", onclick: e => {
            if (o === target) {
              ctx.Sound.correct(); e.target.classList.add("correct");
              setTimeout(() => done(ctx, ex, "Word wizard — you remembered!"), 600);
            } else if (shown.includes(o)) {
              ctx.Sound.correct(); e.target.classList.add("correct");
              setTimeout(() => done(ctx, ex, "Yes — that word was on the list too!"), 600);
            } else {
              ctx.Sound.tryAgain(); ctx.toast("Hmm — say the list in your head again 💭");
            }
          }
        }, [o]));
      });
      w2.appendChild(grid);
      ctx.root.appendChild(w2);
      ctx.speak("Which word was on the list?");
    }, ctx.level() === 1 ? 6000 : 4500);
  }

  /* ---------- Where was it? ---------- */
  function where(ctx) {
    const ex = EXERCISES[5];
    const size = ctx.level() === 1 ? 9 : 16;
    const cols = Math.sqrt(size);
    const star = rnd(size);

    ctx.root.innerHTML = "";
    const wrap = header(ctx, ex, "Remember where the star is hiding!");
    const grid = ctx.el("div", {
      class: "answer-grid",
      style: "grid-template-columns:repeat(" + cols + ",1fr);max-width:420px;margin:0 auto"
    });
    for (let i = 0; i < size; i++) {
      grid.appendChild(ctx.el("button", { class: "answer-btn", disabled: "true", style: "min-height:64px" }, [i === star ? "⭐" : ""]));
    }
    wrap.appendChild(grid);
    ctx.root.appendChild(wrap);
    ctx.speak("Remember where the star is!");

    setTimeout(() => {
      ctx.root.innerHTML = "";
      const w2 = header(ctx, ex, "Where was the star? Tap the spot!");
      const g2 = ctx.el("div", {
        class: "answer-grid",
        style: "grid-template-columns:repeat(" + cols + ",1fr);max-width:420px;margin:0 auto"
      });
      for (let i = 0; i < size; i++) {
        g2.appendChild(ctx.el("button", {
          class: "answer-btn", style: "min-height:64px", "aria-label": "Spot " + (i + 1),
          onclick: e => {
            if (i === star) {
              e.target.textContent = "⭐"; e.target.classList.add("correct");
              ctx.Sound.star();
              setTimeout(() => done(ctx, ex, "Perfect memory for places!"), 600);
            } else {
              ctx.Sound.tryAgain();
              e.target.textContent = "💨";
              ctx.toast("Not there — picture the grid again 💭");
            }
          }
        }, [""]));
      }
      w2.appendChild(g2);
      ctx.root.appendChild(w2);
    }, ctx.level() === 1 ? 3500 : 2500);
  }

  window.LamoraMemory = { menu, start };
})();
