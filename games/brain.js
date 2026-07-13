/* Lamora brain booster games — short, gentle reward games.
   Each game runs for a handful of quick rounds, then celebrates. */
(function () {
  "use strict";

  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];

  const GAMES = [
    { id: "oddone",  emoji: "🔍", name: "Odd One Out",    sub: "Spot the different one" },
    { id: "simon",   emoji: "🎵", name: "Simon Says",     sub: "Repeat the pattern" },
    { id: "maze",    emoji: "🌀", name: "Maze Explorer",  sub: "Find the way out" },
    { id: "count",   emoji: "⚡", name: "Quick Count",    sub: "Count at a glance" },
    { id: "shadow",  emoji: "🌑", name: "Shadow Match",   sub: "Match the shadow" },
    { id: "hidden",  emoji: "🕵️", name: "Hidden Objects", sub: "Find what's hiding" },
    { id: "sortit",  emoji: "🗂️", name: "Sort It!",       sub: "Sorting challenge" }
  ];

  function games() { return GAMES; }

  function start(id, ctx) {
    ({ oddone, simon, maze, count, shadow, hidden, sortit })[id](ctx);
  }

  function header(ctx, game, sub) {
    const wrap = ctx.el("div", { class: "activity-wrap" });
    wrap.appendChild(ctx.backRow());
    wrap.appendChild(ctx.el("h1", { class: "screen-title", text: game.emoji + " " + game.name }));
    if (sub) wrap.appendChild(ctx.el("p", { class: "screen-sub", text: sub }));
    return wrap;
  }

  function finish(ctx, game, msg) {
    ctx.celebrate({
      stars: 1, category: "play", emoji: game.emoji,
      title: "Great playing!", message: msg,
      again: () => start(game.id, ctx), againLabel: "Play again"
    });
  }

  /* ---------- Odd one out ---------- */
  const ODD_SETS = [
    ["🐟", "🐠"], ["🍎", "🍅"], ["🌕", "🌑"], ["🐶", "🐱"], ["⭐", "🌟"],
    ["🦆", "🐔"], ["🚗", "🚕"], ["🌸", "🌼"], ["🐸", "🦎"], ["🧁", "🍰"]
  ];
  function oddone(ctx) {
    const game = GAMES[0];
    let round = 0;
    const total = 5;
    function play() {
      const level = ctx.level();
      const size = level === 1 ? 9 : level === 2 ? 16 : 25;
      const [a, b] = ctx.shuffle(pick(ODD_SETS).slice());
      const oddIndex = rnd(size);
      ctx.root.innerHTML = "";
      const wrap = header(ctx, game, `Round ${round + 1} of ${total} — tap the one that is different!`);
      const grid = ctx.el("div", {
        class: "answer-grid",
        style: "grid-template-columns:repeat(" + Math.sqrt(size) + ",1fr);max-width:440px;margin:0 auto"
      });
      for (let i = 0; i < size; i++) {
        const isOdd = i === oddIndex;
        grid.appendChild(ctx.el("button", {
          class: "answer-btn", "aria-label": isOdd ? "item" : "item",
          onclick: e => {
            if (isOdd) {
              ctx.Sound.correct();
              e.target.classList.add("correct");
              round++;
              setTimeout(() => round < total ? play() : finish(ctx, game, "You spotted them all — eagle eyes!"), 700);
            } else {
              ctx.Sound.tryAgain();
              ctx.toast("Almost! Look for the different one 👀");
            }
          }
        }, [isOdd ? b : a]));
      }
      wrap.appendChild(grid);
      ctx.root.appendChild(wrap);
      if (round === 0) ctx.speak("Tap the one that is different!");
    }
    play();
  }

  /* ---------- Simon says ---------- */
  function simon(ctx) {
    const game = GAMES[1];
    const pads = [
      ["🔴", "#ff7675"], ["🟡", "#ffd166"], ["🟢", "#2ec27e"], ["🔵", "#54a0ff"]
    ];
    let seq = [], pos = 0, best = 0, showing = false;
    const target = ctx.level() === 1 ? 4 : ctx.level() === 2 ? 6 : 8;

    ctx.root.innerHTML = "";
    const wrap = header(ctx, game, "Watch the pattern, then repeat it!");
    const status = ctx.el("p", { class: "chess-status", text: "Watch carefully…", "aria-live": "polite" });
    wrap.appendChild(status);
    const grid = ctx.el("div", { class: "simon-grid" });
    const btns = pads.map(([emoji, color], i) => {
      const b = ctx.el("button", {
        class: "simon-pad", style: "background:" + color, "aria-label": "Pad " + (i + 1),
        onclick: () => tap(i)
      }, [emoji]);
      grid.appendChild(b);
      return b;
    });
    wrap.appendChild(grid);
    ctx.root.appendChild(wrap);

    function light(i, d) {
      setTimeout(() => {
        btns[i].classList.add("lit");
        ctx.Sound.note(i);
        setTimeout(() => btns[i].classList.remove("lit"), 420);
      }, d);
    }

    function playSeq() {
      showing = true; pos = 0;
      status.textContent = "Watch carefully… (" + seq.length + " step" + (seq.length > 1 ? "s" : "") + ")";
      seq.forEach((s, i) => light(s, 650 * (i + 1)));
      setTimeout(() => { showing = false; status.textContent = "Your turn!"; }, 650 * (seq.length + 1));
    }

    function next() {
      seq.push(rnd(4));
      playSeq();
    }

    function tap(i) {
      if (showing) return;
      light(i, 0);
      if (i === seq[pos]) {
        pos++;
        if (pos === seq.length) {
          best = seq.length;
          if (best >= target) { finish(ctx, game, "You remembered " + best + " steps — super memory!"); return; }
          status.textContent = "Yes! Get ready for more…";
          setTimeout(next, 1000);
        }
      } else {
        ctx.Sound.tryAgain();
        status.textContent = "Good try! Watch once more…";
        setTimeout(playSeq, 1000);
      }
    }
    setTimeout(next, 900);
  }

  /* ---------- Maze ---------- */
  function maze(ctx) {
    const game = GAMES[2];
    const size = ctx.level() === 1 ? 6 : ctx.level() === 2 ? 8 : 10;
    /* Generate a perfect maze with depth-first search over a grid of cells,
       each cell tracking its walls: [top, right, bottom, left]. */
    const cells = Array.from({ length: size * size }, () => ({ w: [true, true, true, true], seen: false }));
    const at = (x, y) => cells[y * size + x];
    const stack = [[0, 0]];
    at(0, 0).seen = true;
    const DIRS = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]];
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const options = DIRS.filter(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        return nx >= 0 && ny >= 0 && nx < size && ny < size && !at(nx, ny).seen;
      });
      if (!options.length) { stack.pop(); continue; }
      const [dx, dy, wall, opp] = pick(options);
      const nx = x + dx, ny = y + dy;
      at(x, y).w[wall] = false;
      at(nx, ny).w[opp] = false;
      at(nx, ny).seen = true;
      stack.push([nx, ny]);
    }

    let px = 0, py = 0;
    ctx.root.innerHTML = "";
    const wrap = header(ctx, game, "Help the bunny reach the carrot! Tap next to the bunny or use arrow keys.");
    const board = ctx.el("div", {
      class: "mem-grid", role: "application", "aria-label": "Maze",
      style: "grid-template-columns:repeat(" + size + ",1fr);max-width:480px;gap:0"
    });
    wrap.appendChild(board);

    const btnRow = ctx.el("div", { class: "btn-row" });
    [["⬆️", 0, -1], ["⬇️", 0, 1], ["⬅️", -1, 0], ["➡️", 1, 0]].forEach(([e, dx, dy]) => {
      btnRow.appendChild(ctx.el("button", { class: "icon-btn", "aria-label": "Move " + e, onclick: () => move(dx, dy) }, [e]));
    });
    wrap.appendChild(btnRow);
    ctx.root.appendChild(wrap);

    function draw() {
      board.innerHTML = "";
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const c = at(x, y);
        const isPlayer = x === px && y === py;
        const isGoal = x === size - 1 && y === size - 1;
        const cellBtn = ctx.el("button", {
          class: "mem-card flipped",
          style: "width:auto;height:auto;aspect-ratio:1;border-radius:0;font-size:1.2rem;box-shadow:none;" +
            "border-top:" + (c.w[0] ? "3px solid #6b4b2a" : "3px solid transparent") + ";" +
            "border-right:" + (c.w[1] ? "3px solid #6b4b2a" : "3px solid transparent") + ";" +
            "border-bottom:" + (c.w[2] ? "3px solid #6b4b2a" : "3px solid transparent") + ";" +
            "border-left:" + (c.w[3] ? "3px solid #6b4b2a" : "3px solid transparent") + ";" +
            "background:#fffbe9;transform:none",
          "aria-label": isPlayer ? "Bunny" : isGoal ? "Carrot" : "Path",
          onclick: () => {
            const dx = x - px, dy = y - py;
            if (Math.abs(dx) + Math.abs(dy) === 1) move(dx, dy);
          }
        }, [isPlayer ? "🐰" : isGoal ? "🥕" : ""]);
        board.appendChild(cellBtn);
      }
    }

    function move(dx, dy) {
      const wall = dy === -1 ? 0 : dx === 1 ? 1 : dy === 1 ? 2 : 3;
      if (at(px, py).w[wall]) { ctx.Sound.tap(); return; }
      px += dx; py += dy;
      ctx.Sound.pop();
      draw();
      if (px === size - 1 && py === size - 1) {
        setTimeout(() => finish(ctx, game, "The bunny got the carrot — brilliant navigating!"), 300);
      }
    }

    const keyHandler = e => {
      const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      if (map[e.key]) { e.preventDefault(); move(...map[e.key]); }
    };
    document.addEventListener("keydown", keyHandler);
    const obs = new MutationObserver(() => {
      if (!document.body.contains(board)) { document.removeEventListener("keydown", keyHandler); obs.disconnect(); }
    });
    obs.observe(ctx.root, { childList: true });

    draw();
  }

  /* ---------- Quick count ---------- */
  function count(ctx) {
    const game = GAMES[3];
    let round = 0;
    const total = 5;
    function play() {
      const level = ctx.level();
      const n = 2 + rnd(level === 1 ? 4 : level === 2 ? 6 : 9);
      const emoji = pick(["🦋", "🐞", "🐟", "⭐", "🎈"]);
      ctx.root.innerHTML = "";
      const wrap = header(ctx, game, `Round ${round + 1} of ${total} — count fast!`);
      const stage = ctx.el("div", { class: "prompt-card" }, [
        ctx.el("div", { class: "prompt-emoji", text: Array(n).fill(emoji).join(" ") })
      ]);
      wrap.appendChild(stage);
      const grid = ctx.el("div", { class: "answer-grid" });
      const opts = new Set([n]);
      while (opts.size < 3) opts.add(Math.max(1, n + rnd(5) - 2));
      ctx.shuffle([...opts]).forEach(v => {
        grid.appendChild(ctx.el("button", {
          class: "answer-btn", onclick: e => {
            if (v === n) {
              ctx.Sound.correct(); e.target.classList.add("correct");
              round++;
              setTimeout(() => round < total ? play() : finish(ctx, game, "Lightning-fast counting!"), 650);
            } else {
              ctx.Sound.tryAgain(); ctx.toast("Count once more! 🔢");
            }
          }
        }, [String(v)]));
      });
      wrap.appendChild(grid);
      ctx.root.appendChild(wrap);
      /* Hide the objects after a moment to train visual memory */
      setTimeout(() => { stage.firstChild.textContent = "❓"; }, level === 1 ? 4000 : 2500);
    }
    play();
    ctx.speak("How many can you see? Count quickly!");
  }

  /* ---------- Shadow match ---------- */
  const SHADOW_ITEMS = ["🐘", "🦒", "🚀", "🐳", "🦖", "🏰", "🦀", "🌵", "🛩️", "🐙"];
  function shadow(ctx) {
    const game = GAMES[4];
    let round = 0;
    const total = 5;
    function play() {
      const target = pick(SHADOW_ITEMS);
      const opts = new Set([target]);
      while (opts.size < 4) opts.add(pick(SHADOW_ITEMS));
      ctx.root.innerHTML = "";
      const wrap = header(ctx, game, `Round ${round + 1} of ${total} — whose shadow is this?`);
      wrap.appendChild(ctx.el("div", { class: "prompt-card" }, [
        ctx.el("div", { class: "prompt-emoji", style: "filter:brightness(0);", text: target })
      ]));
      const grid = ctx.el("div", { class: "answer-grid" });
      ctx.shuffle([...opts]).forEach(v => {
        grid.appendChild(ctx.el("button", {
          class: "answer-btn", onclick: e => {
            if (v === target) {
              ctx.Sound.correct(); e.target.classList.add("correct");
              round++;
              setTimeout(() => round < total ? play() : finish(ctx, game, "Shadow detective — case closed!"), 650);
            } else { ctx.Sound.tryAgain(); ctx.toast("Look at the shape of the shadow 🌑"); }
          }
        }, [v]));
      });
      wrap.appendChild(grid);
      ctx.root.appendChild(wrap);
    }
    play();
    ctx.speak("Whose shadow is this?");
  }

  /* ---------- Hidden objects ---------- */
  function hidden(ctx) {
    const game = GAMES[5];
    const fillers = ["🌳", "🌲", "🌴", "🌿", "🍃"];
    const targets = ctx.shuffle(["🦊", "🐰", "🦉"].slice());
    const size = ctx.level() === 1 ? 25 : 36;
    let found = 0;
    ctx.root.innerHTML = "";
    const wrap = header(ctx, game, "Three animals are hiding in the forest. Find the fox, the bunny and the owl!");
    const status = ctx.el("p", { class: "chess-status", text: "Found: 0 of 3", "aria-live": "polite" });
    wrap.appendChild(status);
    const grid = ctx.el("div", {
      class: "answer-grid",
      style: "grid-template-columns:repeat(" + Math.sqrt(size) + ",1fr);max-width:480px;margin:0 auto"
    });
    const spots = ctx.shuffle(Array.from({ length: size }, (_, i) => i)).slice(0, 3);
    for (let i = 0; i < size; i++) {
      const t = spots.indexOf(i);
      const isTarget = t >= 0;
      grid.appendChild(ctx.el("button", {
        class: "answer-btn", style: "min-height:64px;font-size:1.5rem",
        onclick: e => {
          if (e.target.disabled) return;
          if (isTarget) {
            e.target.textContent = targets[t];
            e.target.classList.add("correct");
            e.target.disabled = true;
            ctx.Sound.chime();
            found++;
            status.textContent = "Found: " + found + " of 3";
            if (found === 3) setTimeout(() => finish(ctx, game, "You found every hidden animal!"), 600);
          } else {
            ctx.Sound.flip();
            e.target.style.opacity = "0.45";
          }
        }
      }, [pick(fillers)]));
    }
    wrap.appendChild(grid);
    ctx.root.appendChild(wrap);
    ctx.speak("Three animals are hiding in the forest. Can you find them?");
  }

  /* ---------- Sort it ---------- */
  const SORT_SETS = [
    { name: "Things that fly", yes: ["🦅", "🦋", "🚁", "🎈", "🐝"], no: ["🐟", "🚗", "🐢", "🌵"] },
    { name: "Things in the sea", yes: ["🐙", "🐬", "🦈", "🐚", "🪸"], no: ["🦒", "🌵", "🚜", "🏔️"] },
    { name: "Fruits", yes: ["🍎", "🍌", "🍇", "🍓", "🍉"], no: ["🥕", "🍞", "🧀", "🍪"] },
    { name: "Things that are hot", yes: ["🔥", "☀️", "🌋", "♨️"], no: ["❄️", "🧊", "⛄", "🍦"] }
  ];
  function sortit(ctx) {
    const game = GAMES[6];
    const set = pick(SORT_SETS);
    const items = ctx.shuffle([...set.yes.map(x => [x, true]), ...set.no.map(x => [x, false])]);
    let done = 0, need = items.length;
    ctx.root.innerHTML = "";
    const wrap = header(ctx, game, `Tap YES if it belongs to “${set.name}”, NO if it doesn't!`);
    const stage = ctx.el("div", { class: "prompt-card" });
    const emojiDiv = ctx.el("div", { class: "prompt-emoji" });
    stage.appendChild(emojiDiv);
    wrap.appendChild(stage);
    const row = ctx.el("div", { class: "btn-row" });
    const yesBtn = ctx.el("button", { class: "btn btn-good", onclick: () => answer(true) }, ["✅ Yes"]);
    const noBtn = ctx.el("button", { class: "btn btn-danger", onclick: () => answer(false) }, ["❌ No"]);
    row.appendChild(yesBtn); row.appendChild(noBtn);
    wrap.appendChild(row);
    ctx.root.appendChild(wrap);

    function showItem() { emojiDiv.textContent = items[done][0]; }
    function answer(v) {
      if (v === items[done][1]) { ctx.Sound.correct(); }
      else { ctx.Sound.tryAgain(); ctx.toast("Hmm — think again! " + items[done][0]); return; }
      done++;
      if (done >= need) finish(ctx, game, "Everything sorted perfectly!");
      else showItem();
    }
    showItem();
    ctx.speak(set.name + ". Tap yes or no for each one!");
  }

  window.LamoraBrain = { games, start };
})();
