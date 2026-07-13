/* Lamora chess — child-friendly chess school and play.
   Simplified kid rules: full piece movement, check and checkmate, pawn
   promotion to queen. (Castling and en passant are left for chess club!)
   Board is an array of 64: null or { t: "P|N|B|R|Q|K", w: true|false }. */
(function () {
  "use strict";

  const GLYPHS = {
    wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
    bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟"
  };
  const NAMES = { P: "pawn", N: "knight", B: "bishop", R: "rook", Q: "queen", K: "king" };
  const VALUE = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };

  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const glyph = p => (p ? GLYPHS[(p.w ? "w" : "b") + p.t] : "");
  const sqName = i => "abcdefgh"[i % 8] + (8 - Math.floor(i / 8));

  /* ---------------- Board & move generation ---------------- */
  function emptyBoard() { return Array(64).fill(null); }

  function startBoard() {
    const b = emptyBoard();
    const back = ["R", "N", "B", "Q", "K", "B", "N", "R"];
    back.forEach((t, i) => { b[i] = { t, w: false }; b[56 + i] = { t, w: true }; });
    for (let i = 0; i < 8; i++) { b[8 + i] = { t: "P", w: false }; b[48 + i] = { t: "P", w: true }; }
    return b;
  }

  function onBoard(x, y) { return x >= 0 && x < 8 && y >= 0 && y < 8; }

  /* Pseudo-legal target squares for the piece at index i. */
  function rawMoves(b, i) {
    const p = b[i];
    if (!p) return [];
    const x = i % 8, y = Math.floor(i / 8);
    const out = [];
    const push = (nx, ny) => {
      if (!onBoard(nx, ny)) return false;
      const t = b[ny * 8 + nx];
      if (!t) { out.push(ny * 8 + nx); return true; }
      if (t.w !== p.w) out.push(ny * 8 + nx);
      return false;
    };
    const slide = dirs => dirs.forEach(([dx, dy]) => {
      let nx = x + dx, ny = y + dy;
      while (push(nx, ny)) { nx += dx; ny += dy; }
    });

    if (p.t === "P") {
      const dir = p.w ? -1 : 1;
      const fwd = (y + dir) * 8 + x;
      if (onBoard(x, y + dir) && !b[fwd]) {
        out.push(fwd);
        const startRow = p.w ? 6 : 1;
        const fwd2 = (y + dir * 2) * 8 + x;
        if (y === startRow && !b[fwd2]) out.push(fwd2);
      }
      [[-1, dir], [1, dir]].forEach(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        if (onBoard(nx, ny)) {
          const t = b[ny * 8 + nx];
          if (t && t.w !== p.w) out.push(ny * 8 + nx);
        }
      });
    } else if (p.t === "N") {
      [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
        .forEach(([dx, dy]) => push(x + dx, y + dy));
    } else if (p.t === "B") slide([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    else if (p.t === "R") slide([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    else if (p.t === "Q") slide([[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
    else if (p.t === "K") {
      [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
        .forEach(([dx, dy]) => push(x + dx, y + dy));
    }
    return out;
  }

  function kingIndex(b, white) {
    return b.findIndex(p => p && p.t === "K" && p.w === white);
  }

  function attacked(b, i, byWhite) {
    for (let j = 0; j < 64; j++) {
      const p = b[j];
      if (p && p.w === byWhite && rawMoves(b, j).includes(i)) return true;
    }
    return false;
  }

  function inCheck(b, white) {
    const k = kingIndex(b, white);
    return k >= 0 && attacked(b, k, !white);
  }

  function applyMove(b, from, to) {
    const nb = b.map(p => (p ? { ...p } : null));
    nb[to] = nb[from];
    nb[from] = null;
    /* Kid-friendly promotion: pawns always become queens */
    if (nb[to].t === "P" && (Math.floor(to / 8) === 0 || Math.floor(to / 8) === 7)) nb[to].t = "Q";
    return nb;
  }

  function legalMoves(b, i) {
    const p = b[i];
    if (!p) return [];
    return rawMoves(b, i).filter(to => !inCheck(applyMove(b, i, to), p.w));
  }

  function allMoves(b, white) {
    const out = [];
    for (let i = 0; i < 64; i++) {
      const p = b[i];
      if (p && p.w === white) legalMoves(b, i).forEach(to => out.push([i, to]));
    }
    return out;
  }

  /* Simple, friendly AI: prefers safe captures and checks; beginner level
     picks a gentle move most of the time. */
  function aiMove(b, white, strength) {
    const moves = allMoves(b, white);
    if (!moves.length) return null;
    if (strength === 0 && Math.random() < 0.6) return pick(moves);
    let best = [], bestScore = -Infinity;
    moves.forEach(([from, to]) => {
      let score = Math.random() * 0.5;
      const victim = b[to];
      if (victim) score += VALUE[victim.t] * 2;
      const nb = applyMove(b, from, to);
      if (inCheck(nb, !white)) score += allMoves(nb, !white).length === 0 ? 1000 : 1.5;
      if (attacked(nb, to, !white)) score -= VALUE[b[from].t];
      if (score > bestScore + 0.001) { bestScore = score; best = [[from, to]]; }
      else if (Math.abs(score - bestScore) <= 0.001) best.push([from, to]);
    });
    return pick(best);
  }

  /* ---------------- Board rendering ---------------- */
  function renderBoard(ctx, container, b, opts) {
    container.innerHTML = "";
    const boardEl = ctx.el("div", { class: "chess-board", role: "grid", "aria-label": "Chess board" });
    for (let i = 0; i < 64; i++) {
      const x = i % 8, y = Math.floor(i / 8);
      const dark = (x + y) % 2 === 1;
      const p = b[i];
      const cls = ["chess-sq", dark ? "dark" : "",
        opts.sel === i ? "sel" : "",
        opts.hints && opts.hints.includes(i) ? "move-hint" : "",
        opts.last && opts.last.includes(i) ? "last-move" : ""
      ].filter(Boolean).join(" ");
      boardEl.appendChild(ctx.el("button", {
        class: cls, role: "gridcell",
        "aria-label": sqName(i) + (p ? ", " + (p.w ? "white" : "black") + " " + NAMES[p.t] : ", empty"),
        onclick: () => opts.onTap && opts.onTap(i)
      }, [glyph(p)]));
    }
    container.appendChild(boardEl);
  }

  /* ---------------- Menu ---------------- */
  const LESSONS = [
    { id: "board",   emoji: "🏁", name: "The Board",        sub: "Meet the squares" },
    { id: "pieceP",  emoji: "♙", name: "Pawns",             sub: "Little heroes" },
    { id: "pieceR",  emoji: "♖", name: "Rooks",             sub: "Straight lines" },
    { id: "pieceB",  emoji: "♗", name: "Bishops",           sub: "Diagonal dancers" },
    { id: "pieceN",  emoji: "♘", name: "Knights",           sub: "Jumping horses" },
    { id: "pieceQ",  emoji: "♕", name: "The Queen",         sub: "Super mover" },
    { id: "pieceK",  emoji: "♔", name: "The King",          sub: "Protect him!" },
    { id: "capture", emoji: "⚔️", name: "Capture Practice",  sub: "Snack time!" },
    { id: "check",   emoji: "❗", name: "Check & Checkmate", sub: "Winning the game" },
    { id: "puzzle",  emoji: "🧩", name: "Mini Puzzles",      sub: "Checkmate in one" }
  ];

  function menu(ctx) {
    const p = ctx.profile();
    ctx.root.appendChild(ctx.backRow());
    ctx.root.appendChild(ctx.title("Chess ♟️", "Learn the royal game, step by step!"));
    const grid = ctx.el("div", { class: "tile-grid" });
    LESSONS.forEach(l => {
      const doneMark = p.progress.chessLessons.includes(l.id) ? " ✅" : "";
      grid.appendChild(ctx.el("button", {
        class: "tile", onclick: () => { ctx.Sound.tap(); startLesson(l.id, ctx); }
      }, [
        ctx.el("span", { class: "tile-emoji", text: l.emoji }),
        ctx.el("span", { class: "tile-label", text: l.name + doneMark }),
        ctx.el("span", { class: "tile-sub", text: l.sub })
      ]));
    });
    [
      { emoji: "🤖", name: "Play the Computer", sub: "Friendly game", fn: () => playGame(ctx, true) },
      { emoji: "🧑‍🤝‍🧑", name: "Two Players", sub: "Play a friend", fn: () => playGame(ctx, false) }
    ].forEach(g => {
      grid.appendChild(ctx.el("button", { class: "tile", onclick: () => { ctx.Sound.tap(); g.fn(); } }, [
        ctx.el("span", { class: "tile-emoji", text: g.emoji }),
        ctx.el("span", { class: "tile-label", text: g.name }),
        ctx.el("span", { class: "tile-sub", text: g.sub })
      ]));
    });
    ctx.root.appendChild(grid);
  }

  function lessonDone(ctx, id, msg) {
    const p = ctx.profile();
    if (!p.progress.chessLessons.includes(id)) p.progress.chessLessons.push(id);
    ctx.save();
    ctx.celebrate({
      stars: 2, category: "chess", emoji: "♟️",
      title: "Chess lesson complete!", message: msg,
      again: () => menuReset(ctx), againLabel: "Back to chess"
    });
  }
  function menuReset(ctx) { ctx.show("chess"); }

  /* ---------------- Lessons ---------------- */
  function startLesson(id, ctx) {
    if (id === "board") return lessonBoard(ctx);
    if (id.startsWith("piece")) return lessonPiece(ctx, id.slice(5));
    if (id === "capture") return lessonCapture(ctx);
    if (id === "check") return lessonCheck(ctx);
    if (id === "puzzle") return lessonPuzzle(ctx);
  }

  function lessonBoard(ctx) {
    let found = 0;
    const targets = ctx.shuffle([0, 7, 56, 63, 27, 36].slice()).slice(0, 4);
    let current = 0;
    ctx.root.innerHTML = "";
    const wrap = ctx.el("div", { class: "activity-wrap" });
    wrap.appendChild(ctx.backRow());
    wrap.appendChild(ctx.el("h1", { class: "screen-title", text: "🏁 The Board" }));
    const status = ctx.el("p", { class: "chess-status", "aria-live": "polite" });
    wrap.appendChild(ctx.el("p", { class: "screen-sub", text: "The chessboard has 64 squares — light and dark. Each square has a name, like a treasure map!" }));
    wrap.appendChild(status);
    const holder = ctx.el("div");
    wrap.appendChild(holder);
    ctx.root.appendChild(wrap);

    function ask() {
      status.textContent = "Can you tap square " + sqName(targets[current]) + "?";
      ctx.speak("Tap square " + sqName(targets[current]).split("").join(" "));
      renderBoard(ctx, holder, emptyBoard(), {
        onTap: i => {
          if (i === targets[current]) {
            ctx.Sound.correct();
            found++;
            current++;
            if (current >= targets.length) lessonDone(ctx, "board", "You can read the chessboard like a map!");
            else ask();
          } else {
            ctx.Sound.tryAgain();
            status.textContent = "That's " + sqName(i) + ". Letters go across, numbers go up — find " + sqName(targets[current]) + "!";
          }
        }
      });
    }
    ask();
  }

  const PIECE_STORY = {
    P: "Pawns are brave little walkers. They step ONE square forward (two on their first move) and capture diagonally!",
    R: "Rooks are towers that slide in straight lines — up, down, left and right, as far as they like!",
    B: "Bishops love diagonals. They slide corner-to-corner and always stay on their own colour!",
    N: "Knights are jumping horses! They move in an L shape and can hop right over other pieces!",
    Q: "The queen is the superstar — she moves like a rook AND a bishop combined!",
    K: "The king moves one careful step in any direction. Keep him safe — if he's trapped, the game ends!"
  };

  function lessonPiece(ctx, t) {
    let solved = 0;
    const need = 3;

    function round() {
      const b = emptyBoard();
      let from = rnd(64);
      if (t === "P") from = 48 + rnd(8) - (rnd(2) ? 8 : 0);
      b[from] = { t, w: true };
      /* Sprinkle a snack to capture when possible */
      const moves = legalMoves(b, from);
      if (!moves.length) return round();
      const target = pick(moves);
      const isCapture = t !== "P" && Math.random() < 0.5;
      if (isCapture) b[target] = { t: "P", w: false };

      ctx.root.innerHTML = "";
      const wrap = ctx.el("div", { class: "activity-wrap" });
      wrap.appendChild(ctx.backRow());
      wrap.appendChild(ctx.el("h1", { class: "screen-title", text: GLYPHS["w" + t] + " " + NAMES[t][0].toUpperCase() + NAMES[t].slice(1) + "s" }));
      wrap.appendChild(ctx.el("p", { class: "screen-sub", text: PIECE_STORY[t] }));
      const status = ctx.el("p", { class: "chess-status", "aria-live": "polite" });
      status.textContent = (isCapture ? "Capture the black pawn on " : "Move your " + NAMES[t] + " to ") + sqName(target) + "! (" + (solved + 1) + " of " + need + ")";
      wrap.appendChild(status);
      const holder = ctx.el("div");
      wrap.appendChild(holder);
      ctx.root.appendChild(wrap);

      let sel = null;
      function draw() {
        renderBoard(ctx, holder, b, {
          sel,
          hints: sel !== null ? legalMoves(b, sel) : [],
          onTap: i => {
            if (i === from && sel === null) { sel = from; ctx.Sound.tap(); draw(); return; }
            if (sel !== null && legalMoves(b, sel).includes(i)) {
              if (i === target) {
                ctx.Sound.correct();
                solved++;
                if (solved >= need) lessonDone(ctx, "piece" + t, "You know how the " + NAMES[t] + " moves!");
                else round();
              } else {
                ctx.Sound.tryAgain();
                status.textContent = "Good move — but aim for " + sqName(target) + "!";
                sel = null; draw();
              }
            } else { sel = b[i] && b[i].w ? i : null; draw(); }
          }
        });
      }
      draw();
      ctx.speak(PIECE_STORY[t]);
    }
    round();
  }

  function lessonCapture(ctx) {
    const b = emptyBoard();
    b[35] = { t: "Q", w: true };
    const snacks = ctx.shuffle([19, 21, 42, 49, 14, 28].slice()).slice(0, 4);
    snacks.forEach(s => { b[s] = { t: "P", w: false }; });
    let eaten = 0;

    ctx.root.innerHTML = "";
    const wrap = ctx.el("div", { class: "activity-wrap" });
    wrap.appendChild(ctx.backRow());
    wrap.appendChild(ctx.el("h1", { class: "screen-title", text: "⚔️ Capture Practice" }));
    wrap.appendChild(ctx.el("p", { class: "screen-sub", text: "Your queen is hungry! Capture all the black pawns." }));
    const status = ctx.el("p", { class: "chess-status", "aria-live": "polite", text: "Pawns left: " + snacks.length });
    wrap.appendChild(status);
    const holder = ctx.el("div");
    wrap.appendChild(holder);
    ctx.root.appendChild(wrap);

    let sel = null;
    function qIndex() { return b.findIndex(p => p && p.t === "Q"); }
    function draw() {
      renderBoard(ctx, holder, b, {
        sel,
        hints: sel !== null ? legalMoves(b, sel) : [],
        onTap: i => {
          const q = qIndex();
          if (i === q) { sel = i; ctx.Sound.tap(); draw(); return; }
          if (sel !== null && legalMoves(b, sel).includes(i)) {
            const wasSnack = !!b[i];
            b[i] = b[sel]; b[sel] = null; sel = null;
            if (wasSnack) { eaten++; ctx.Sound.correct(); }
            else ctx.Sound.flip();
            status.textContent = "Pawns left: " + (snacks.length - eaten);
            if (eaten === snacks.length) lessonDone(ctx, "capture", "Yum! You captured every pawn!");
            else draw();
          } else draw();
        }
      });
    }
    draw();
    ctx.speak("Your queen is hungry! Capture all the black pawns.");
  }

  function lessonCheck(ctx) {
    ctx.root.innerHTML = "";
    const wrap = ctx.el("div", { class: "activity-wrap" });
    wrap.appendChild(ctx.backRow());
    wrap.appendChild(ctx.el("h1", { class: "screen-title", text: "❗ Check & Checkmate" }));
    const cards = [
      ["👑", "CHECK means the king is in danger! When you hear “check”, the king must escape, block, or a friend must capture the attacker."],
      ["🛡️", "The king can step to a safe square, a friendly piece can block the attack, or the attacker can be captured."],
      ["🏆", "CHECKMATE means the king is trapped with no escape — the game is over and the attacker wins!"],
      ["🤝", "If a player can't move at all but is NOT in check, it's a draw called stalemate. Nobody loses — good game!"]
    ];
    let i = 0;
    const emoji = ctx.el("div", { class: "prompt-emoji", text: cards[0][0] });
    const text = ctx.el("p", { class: "story-text", text: cards[0][1] });
    const card = ctx.el("div", { class: "prompt-card" }, [emoji, text]);
    wrap.appendChild(card);
    const btn = ctx.el("button", {
      class: "btn", onclick: () => {
        i++;
        if (i >= cards.length) { lessonDone(ctx, "check", "Now you know how chess games are won!"); return; }
        emoji.textContent = cards[i][0];
        text.textContent = cards[i][1];
        ctx.speak(cards[i][1]);
        if (i === cards.length - 1) btn.textContent = "Finish lesson ✅";
      }
    }, ["Next ➡"]);
    wrap.appendChild(ctx.el("div", { class: "btn-row" }, [btn]));
    ctx.root.appendChild(wrap);
    ctx.speak(cards[0][1]);
  }

  /* Mate-in-one puzzles: [setup pieces, white to move] */
  const PUZZLES = [
    { name: "Back-rank surprise", pieces: [["bK", 6], ["bP", 13], ["bP", 14], ["bP", 15], ["wR", 40], ["wK", 62]], solution: [40, 0] },
    { name: "Queen's kiss", pieces: [["bK", 4], ["wQ", 39], ["wK", 19]], solution: [39, 12] },
    { name: "Rook ladder", pieces: [["bK", 3], ["wR", 15], ["wR", 8], ["wK", 60]], solution: [15, 7] },
    { name: "Knight's trick", pieces: [["bK", 0], ["bR", 1], ["bP", 8], ["bP", 9], ["wN", 25], ["wK", 60]], solution: [25, 10] }
  ];

  function lessonPuzzle(ctx) {
    let pi = 0, solvedCount = 0;

    function loadPuzzle() {
      const pz = PUZZLES[pi % PUZZLES.length];
      const b = emptyBoard();
      pz.pieces.forEach(([code, i]) => { b[i] = { t: code[1], w: code[0] === "w" }; });
      let sel = null;

      ctx.root.innerHTML = "";
      const wrap = ctx.el("div", { class: "activity-wrap" });
      wrap.appendChild(ctx.backRow());
      wrap.appendChild(ctx.el("h1", { class: "screen-title", text: "🧩 " + pz.name }));
      const status = ctx.el("p", { class: "chess-status", "aria-live": "polite", text: "White to move — find checkmate in ONE move!" });
      wrap.appendChild(status);
      const holder = ctx.el("div");
      wrap.appendChild(holder);
      const hintBtn = ctx.el("button", {
        class: "btn btn-ghost btn-small",
        onclick: () => {
          status.textContent = "Hint: try moving the piece on " + sqName(pz.solution[0]) + " 💡";
          ctx.Sound.tap();
        }
      }, ["💡 Hint"]);
      wrap.appendChild(ctx.el("div", { class: "btn-row" }, [hintBtn]));
      ctx.root.appendChild(wrap);

      function draw() {
        renderBoard(ctx, holder, b, {
          sel,
          hints: sel !== null ? legalMoves(b, sel) : [],
          onTap: i => {
            if (b[i] && b[i].w) { sel = i; ctx.Sound.tap(); draw(); return; }
            if (sel !== null && legalMoves(b, sel).includes(i)) {
              if (sel === pz.solution[0] && i === pz.solution[1]) {
                ctx.Sound.win();
                solvedCount++;
                pi++;
                if (solvedCount >= 2) lessonDone(ctx, "puzzle", "You solved " + solvedCount + " checkmate puzzles!");
                else { ctx.toast("Checkmate! 🏆 Next puzzle…"); setTimeout(loadPuzzle, 1200); }
              } else {
                ctx.Sound.tryAgain();
                status.textContent = "Good idea — but the king can escape. Try another move!";
                sel = null; draw();
              }
            } else { sel = null; draw(); }
          }
        });
      }
      draw();
      ctx.speak("White to move. Find checkmate in one move!");
    }
    loadPuzzle();
  }

  /* ---------------- Full game ---------------- */
  function playGame(ctx, vsComputer) {
    let b = startBoard();
    let whiteTurn = true;
    let sel = null, last = null, thinking = false;

    ctx.root.innerHTML = "";
    const wrap = ctx.el("div", { class: "activity-wrap" });
    wrap.appendChild(ctx.backRow());
    wrap.appendChild(ctx.el("h1", { class: "screen-title", text: vsComputer ? "🤖 You vs Computer" : "🧑‍🤝‍🧑 Two Players" }));
    const status = ctx.el("p", { class: "chess-status", "aria-live": "polite" });
    wrap.appendChild(status);
    const holder = ctx.el("div");
    wrap.appendChild(holder);
    const hintBtn = ctx.el("button", {
      class: "btn btn-ghost btn-small", onclick: () => {
        const m = aiMove(b, whiteTurn, 1);
        if (m) {
          sel = m[0];
          ctx.toast("💡 Try " + NAMES[b[m[0]].t] + " " + sqName(m[0]) + " → " + sqName(m[1]));
          draw();
        }
      }
    }, ["💡 Hint"]);
    const newBtn = ctx.el("button", {
      class: "btn btn-small", onclick: () => playGame(ctx, vsComputer)
    }, ["🔄 New game"]);
    wrap.appendChild(ctx.el("div", { class: "btn-row" }, [hintBtn, newBtn]));
    ctx.root.appendChild(wrap);

    function announce() {
      const moves = allMoves(b, whiteTurn);
      const check = inCheck(b, whiteTurn);
      if (!moves.length) {
        if (check) {
          const winner = whiteTurn ? "Black" : "White";
          status.textContent = "🏆 Checkmate! " + winner + " wins!";
          ctx.speak("Checkmate! " + winner + " wins! What a game!");
          if (!whiteTurn || !vsComputer) {
            /* Child (white) won vs computer, or a local two-player game ended */
            setTimeout(() => ctx.celebrate({
              stars: 3, category: "chess", emoji: "🏆",
              title: "Checkmate — " + winner + " wins!",
              message: "That was some brilliant chess!",
              again: () => playGame(ctx, vsComputer), againLabel: "Rematch"
            }), 1400);
          }
        } else {
          status.textContent = "🤝 Stalemate — it's a draw. Great game!";
          ctx.speak("Stalemate! It's a draw. Well played!");
        }
        return true;
      }
      status.textContent = (whiteTurn ? "⚪ White" : "⚫ Black") + (vsComputer && !whiteTurn ? " (computer)" : "") +
        " to move" + (check ? " — CHECK!" : "");
      return false;
    }

    function draw() {
      renderBoard(ctx, holder, b, {
        sel,
        last,
        hints: sel !== null ? legalMoves(b, sel) : [],
        onTap: i => {
          if (thinking) return;
          const p = b[i];
          if (sel !== null && legalMoves(b, sel).includes(i)) {
            move(sel, i);
            return;
          }
          if (p && p.w === whiteTurn && (!vsComputer || whiteTurn)) {
            sel = i; ctx.Sound.tap(); draw();
          } else { sel = null; draw(); }
        }
      });
    }

    function move(from, to) {
      const capture = !!b[to];
      b = applyMove(b, from, to);
      last = [from, to];
      sel = null;
      whiteTurn = !whiteTurn;
      if (capture) ctx.Sound.pop(); else ctx.Sound.flip();
      draw();
      if (announce()) return;
      if (vsComputer && !whiteTurn) {
        thinking = true;
        status.textContent = "🤖 Computer is thinking…";
        setTimeout(() => {
          const m = aiMove(b, false, 0);
          thinking = false;
          if (m) move(m[0], m[1]);
        }, 900);
      }
    }

    announce();
    draw();
    ctx.speak(vsComputer ? "You are white. Tap a piece to see where it can go!" : "White moves first. Tap a piece to see where it can go!");
  }

  window.LamoraChess = { menu };
})();
