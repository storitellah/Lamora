/* ==========================================================================
   Lamora — script.js (core app shell)
   Profiles, navigation, quiz engine, rewards, screen-time, parent zone, PWA.
   All data stays in localStorage on this device. No network calls are made.
   ========================================================================== */
(function () {
  "use strict";

  const { Sound, speak, stopSpeaking } = window.LamoraAudio;

  /* ------------------------------------------------------------------
     State
  ------------------------------------------------------------------ */
  const STORE_KEY = "lamora-state-v1";

  const AVATARS = ["🦄", "🐬", "🐉", "🦖", "🐼", "🦊", "🐢", "🦋", "🐙", "🦁", "🐧", "🌟"];
  const REWARD_STYLES = {
    star:    { emoji: "⭐", name: "Stars" },
    gem:     { emoji: "💎", name: "Gems" },
    shell:   { emoji: "🐚", name: "Shells" },
    egg:     { emoji: "🥚", name: "Dragon eggs" },
    rainbow: { emoji: "🌈", name: "Rainbow points" },
    planet:  { emoji: "🪐", name: "Planet badges" }
  };
  const THEMES = [
    { id: "ocean",   name: "Ocean Adventure", emoji: "🌊" },
    { id: "rainbow", name: "Rainbow Garden",  emoji: "🌈" },
    { id: "dragon",  name: "Dragon Kingdom",  emoji: "🐉" },
    { id: "space",   name: "Space Explorer",  emoji: "🚀" },
    { id: "nature",  name: "Nature Club",     emoji: "🌿" },
    { id: "dino",    name: "Dinosaur World",  emoji: "🦕" }
  ];
  const CATEGORIES = ["numeracy", "literacy", "memory", "play", "draw", "colour", "explore", "chess", "stories", "professions", "stickers"];

  function defaultSettings() {
    return {
      muted: false,
      volume: 0.7,
      textLarge: false,
      highContrast: false,
      reducedMotion: false,
      rewardStyle: "star",
      dailyLimitMin: 30,
      playMinutes: 5,
      starsPerPlay: 5,
      enabled: CATEGORIES.reduce((o, c) => { o[c] = true; return o; }, {})
    };
  }

  function makeProfile(name, age, avatar) {
    return {
      id: "p" + Date.now() + Math.floor(Math.random() * 999),
      name: name || "Explorer",
      age: age || 6,
      avatar: avatar || "🦄",
      theme: "ocean",
      stars: 0,
      totalStars: 0,
      playTokens: 0,
      stickers: ["🌟", "😀"],
      progress: {
        activities: 0,
        byCategory: {},
        chessLessons: [],
        badges: [],
        streaks: { memory: 0, reading: 0, numeracy: 0 },
        lastPlayed: {}
      },
      usage: {}
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        s.settings = Object.assign(defaultSettings(), s.settings || {});
        return s;
      }
    } catch (e) { /* corrupted store — start fresh */ }
    return {
      version: 1,
      pin: null,
      settings: defaultSettings(),
      profiles: [makeProfile("Maya", 6, "🐬"), makeProfile("Leo", 9, "🦖")],
      activeProfileId: null
    };
  }

  const state = loadState();

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (e) { toast("Could not save — storage may be full"); }
  }

  function profile() {
    return state.profiles.find(p => p.id === state.activeProfileId) || null;
  }

  /* Age → difficulty level: 1 (age 5-6), 2 (age 7-8), 3 (age 9-10) */
  function level() {
    const p = profile();
    const age = p ? p.age : 6;
    return age <= 6 ? 1 : age <= 8 ? 2 : 3;
  }

  /* ------------------------------------------------------------------
     DOM helpers
  ------------------------------------------------------------------ */
  const $ = sel => document.querySelector(sel);
  const root = $("#screen-root");

  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), attrs[k]);
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(c => { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }

  let toastTimer = null;
  function toast(msg, ms) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add("hidden"), ms || 2400);
  }

  /* ------------------------------------------------------------------
     Celebration confetti (skipped in reduced-motion mode)
  ------------------------------------------------------------------ */
  function confetti() {
    if (state.settings.reducedMotion) return;
    const canvas = $("#fx-canvas");
    const cx = canvas.getContext("2d");
    canvas.width = innerWidth; canvas.height = innerHeight;
    const colors = ["#ffca28", "#2f9ee8", "#e84393", "#2ec27e", "#6c5ce7", "#fd7e14"];
    const bits = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height * 0.4,
      r: 4 + Math.random() * 6, c: colors[Math.floor(Math.random() * colors.length)],
      vy: 2 + Math.random() * 3.5, vx: -1.5 + Math.random() * 3, rot: Math.random() * 6
    }));
    let frames = 0;
    (function tick() {
      cx.clearRect(0, 0, canvas.width, canvas.height);
      bits.forEach(b => {
        b.y += b.vy; b.x += b.vx; b.rot += 0.1;
        cx.save(); cx.translate(b.x, b.y); cx.rotate(b.rot);
        cx.fillStyle = b.c; cx.fillRect(-b.r, -b.r / 2, b.r * 2, b.r);
        cx.restore();
      });
      if (++frames < 140) requestAnimationFrame(tick);
      else cx.clearRect(0, 0, canvas.width, canvas.height);
    })();
  }

  /* ------------------------------------------------------------------
     Router
  ------------------------------------------------------------------ */
  const screens = {};
  let currentScreen = null;
  const navStack = [];

  function show(name, params, push) {
    stopSpeaking();
    if (push !== false && currentScreen && currentScreen !== name) navStack.push(currentScreen);
    currentScreen = name;
    root.innerHTML = "";
    root.scrollTop = 0; window.scrollTo(0, 0);
    (screens[name] || screens.home)(root, params || {});
    root.focus({ preventScroll: true });
  }

  function goBack() {
    const prev = navStack.pop() || "home";
    show(prev, {}, false);
  }

  function backRow(labelOverride) {
    return el("div", { class: "back-row" }, [
      el("button", {
        class: "btn-back", "aria-label": "Go back",
        onclick: () => { Sound.tap(); goBack(); }
      }, ["⬅ " + (labelOverride || "Back")])
    ]);
  }

  function title(t, sub, say) {
    const wrap = el("div", {}, [
      el("h1", { class: "screen-title", text: t }),
      sub ? el("p", { class: "screen-sub", text: sub }) : null
    ]);
    if (say !== false) speak(t + (sub ? ". " + sub : ""));
    return wrap;
  }

  /* ------------------------------------------------------------------
     Rewards
  ------------------------------------------------------------------ */
  function rewardEmoji() { return REWARD_STYLES[state.settings.rewardStyle].emoji; }
  function rewardName() { return REWARD_STYLES[state.settings.rewardStyle].name; }

  function awardStars(n, category) {
    const p = profile();
    if (!p) return;
    p.stars += n;
    p.totalStars += n;
    p.progress.activities += 1;
    if (category) {
      p.progress.byCategory[category] = (p.progress.byCategory[category] || 0) + 1;
      if (category === "numeracy") p.progress.streaks.numeracy += 1;
      if (category === "literacy") p.progress.streaks.reading += 1;
      if (category === "memory") p.progress.streaks.memory += 1;
    }
    // Convert stars into play tokens
    const per = state.settings.starsPerPlay;
    while (p.stars >= per) {
      p.stars -= per;
      p.playTokens += 1;
      toast(`🎮 You unlocked a play session!`);
    }
    maybeAwardSticker(p);
    save();
    updateTopbar();
  }

  const STICKER_LADDER = [3, 8, 15, 25, 40, 60, 85, 115, 150, 200, 260, 330];
  function maybeAwardSticker(p) {
    const allStickers = window.LamoraStickers ? LamoraStickers.all() : [];
    let earned = 0;
    STICKER_LADDER.forEach(threshold => { if (p.totalStars >= threshold) earned++; });
    while (p.stickers.length - 2 < earned && p.stickers.length < allStickers.length) {
      const next = allStickers.find(s => !p.stickers.includes(s));
      if (!next) break;
      p.stickers.push(next);
      toast(`🎉 New sticker unlocked: ${next}`);
      Sound.chime();
    }
  }

  /* Completion screen shown after any activity */
  function celebrate(opts) {
    const stars = opts.stars || 1;
    awardStars(stars, opts.category);
    Sound.win();
    confetti();
    root.innerHTML = "";
    const p = profile();
    root.appendChild(el("div", { class: "card celebrate-card activity-wrap" }, [
      el("div", { class: "celebrate-emoji", text: opts.emoji || "🎉" }),
      el("h2", { text: opts.title || "Wonderful work!" }),
      el("div", { class: "celebrate-stars", text: `+${stars} ${rewardEmoji()}` }),
      el("p", { text: opts.message || "You are getting better every day!" }),
      p && p.playTokens > 0 && state.settings.enabled.play
        ? el("p", { text: `🎮 You have ${p.playTokens} play session${p.playTokens > 1 ? "s" : ""} saved up!` }) : null,
      el("div", { class: "btn-row" }, [
        el("button", { class: "btn", onclick: () => { Sound.tap(); if (opts.again) opts.again(); else goBack(); } }, [opts.againLabel || "Play again"]),
        p && p.playTokens > 0 && state.settings.enabled.play
          ? el("button", { class: "btn btn-good", onclick: () => { Sound.tap(); show("play"); } }, ["🎮 Use a play session"]) : null,
        el("button", { class: "btn btn-ghost", onclick: () => { Sound.tap(); show("home"); } }, ["🏠 Home"])
      ])
    ]));
    speak(opts.title || "Wonderful work! You earned " + stars + " " + rewardName());
  }

  /* ------------------------------------------------------------------
     Shared quiz engine — gentle, tap-to-reveal, no punishment.
     questions: [{ prompt, promptEmoji, speakText, choices, answer, hint, explain }]
  ------------------------------------------------------------------ */
  function runQuiz(opts) {
    const qs = opts.questions;
    let i = 0, correctCount = 0, attempts = 0;

    function renderQ() {
      const q = qs[i];
      root.innerHTML = "";
      attempts = 0;
      const wrap = el("div", { class: "activity-wrap" });
      wrap.appendChild(backRow());
      wrap.appendChild(el("h1", { class: "screen-title", text: opts.title }));

      const dots = el("div", { class: "progress-dots", role: "img", "aria-label": `Question ${i + 1} of ${qs.length}` });
      qs.forEach((_, j) => dots.appendChild(el("span", { class: "pdot" + (j < i ? " done" : j === i ? " now" : "") })));
      wrap.appendChild(dots);

      const hintP = el("p", { class: "prompt-hint", text: "" });
      const promptCard = el("div", { class: "prompt-card" }, [
        q.promptEmoji ? el("div", { class: "prompt-emoji", text: q.promptEmoji }) : null,
        el("div", { class: "prompt-text" }, [
          q.prompt,
          el("button", {
            class: "speak-btn", "aria-label": "Hear the question again",
            onclick: () => speak(q.speakText || q.prompt)
          }, ["🔊"])
        ]),
        hintP
      ]);
      wrap.appendChild(promptCard);

      const grid = el("div", { class: "answer-grid" });
      const shuffled = q.keepOrder ? q.choices.slice() : shuffle(q.choices.slice());
      shuffled.forEach(choice => {
        const b = el("button", { class: "answer-btn", text: String(choice) });
        b.addEventListener("click", () => {
          if (b.disabled) return;
          if (String(choice) === String(q.answer)) {
            Sound.correct();
            b.classList.add("correct");
            if (attempts === 0) correctCount++;
            grid.querySelectorAll("button").forEach(x => x.disabled = true);
            hintP.textContent = q.explain ? "✅ " + q.explain : "✅ Well done!";
            speak(q.explain || "Well done!");
            setTimeout(next, 1100);
          } else {
            attempts++;
            Sound.tryAgain();
            b.classList.add("wrong");
            setTimeout(() => b.classList.remove("wrong"), 700);
            if (attempts === 1) {
              hintP.textContent = "💡 " + (q.hint || "Good try! Have another go.");
              speak(q.hint || "Good try! Have another go.");
            } else {
              // Reveal gently after the second try
              grid.querySelectorAll("button").forEach(x => {
                if (x.textContent === String(q.answer)) x.classList.add("revealed", "correct");
                x.disabled = true;
              });
              hintP.textContent = "🌈 The answer is " + q.answer + ". " + (q.explain || "You'll get it next time!");
              speak("The answer is " + q.answer + ". " + (q.explain || "You'll get it next time!"));
              setTimeout(next, 1900);
            }
          }
        });
        grid.appendChild(b);
      });
      wrap.appendChild(grid);
      root.appendChild(wrap);
      if (q.speakText || q.prompt) speak(q.speakText || q.prompt);
    }

    function next() {
      i++;
      if (i < qs.length) renderQ();
      else {
        const stars = Math.max(1, Math.round((correctCount / qs.length) * (opts.maxStars || 3)));
        celebrate({
          stars,
          category: opts.category,
          emoji: correctCount === qs.length ? "🏆" : "🎉",
          title: correctCount === qs.length ? "Perfect! Amazing!" : "Great effort!",
          message: `You got ${correctCount} out of ${qs.length} first try.`,
          again: opts.again,
          againLabel: opts.againLabel
        });
      }
    }

    renderQ();
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ------------------------------------------------------------------
     Screen-time engine
  ------------------------------------------------------------------ */
  function todayKey() { return new Date().toISOString().slice(0, 10); }

  function usedSecondsToday() {
    const p = profile();
    return p ? (p.usage[todayKey()] || 0) : 0;
  }
  function remainingSeconds() {
    return Math.max(0, state.settings.dailyLimitMin * 60 - usedSecondsToday());
  }

  let warned5 = false, warned1 = false, saveCounter = 0;
  setInterval(() => {
    const p = profile();
    if (!p || document.hidden || currentScreen === "break" || currentScreen === "parent" || currentScreen === "parentGate" || currentScreen === "profiles") return;
    p.usage[todayKey()] = (p.usage[todayKey()] || 0) + 1;
    if (++saveCounter % 15 === 0) save();
    const rem = remainingSeconds();
    updateTimeChip(rem);
    if (rem <= 300 && !warned5) { warned5 = true; toast("⏳ Five more minutes today!"); speak("Five more minutes today!"); }
    if (rem <= 60 && !warned1) { warned1 = true; toast("⏳ One more minute — nearly time for a break!"); speak("One more minute!"); }
    if (rem <= 0) { save(); show("break"); }
  }, 1000);

  function updateTimeChip(rem) {
    const chip = $("#time-chip");
    if (!profile()) { chip.classList.add("hidden"); return; }
    chip.classList.remove("hidden");
    const m = Math.ceil(rem / 60);
    chip.textContent = "⏳ " + m + "m";
    chip.classList.toggle("low", rem <= 300);
  }

  const BREAK_IDEAS = [
    ["🐱", "Stretch up tall like a cat!"],
    ["🔵", "Find something blue in your room!"],
    ["💧", "Drink a glass of water!"],
    ["🪟", "Look out of the window — what can you see?"],
    ["🌬️", "Take five slow, deep breaths."],
    ["✏️", "Draw something on real paper!"],
    ["💚", "Help someone at home with a little job!"]
  ];

  screens.break = function () {
    stopSpeaking();
    const idea = BREAK_IDEAS[Math.floor(Math.random() * BREAK_IDEAS.length)];
    root.appendChild(el("div", { class: "card break-screen activity-wrap" }, [
      el("div", { class: "break-emoji", text: "🌙" }),
      el("h1", { text: "Time for a break!" }),
      el("p", { text: "You did some wonderful learning today. See you soon!" }),
      el("div", { class: "break-idea" }, [idea[0] + " " + idea[1]]),
      el("div", { class: "btn-row" }, [
        el("button", { class: "btn btn-ghost", onclick: () => show("profiles") }, ["👋 Switch profile"]),
        el("button", {
          class: "btn", onclick: () => show("parentGate", { then: "parent" })
        }, ["🔒 Parent: add time"])
      ])
    ]));
    speak("Time for a break! " + idea[1]);
  };

  /* ------------------------------------------------------------------
     Top bar
  ------------------------------------------------------------------ */
  function updateTopbar() {
    const p = profile();
    $("#topbar").classList.toggle("hidden", !p);
    if (!p) return;
    $("#topbar-avatar").textContent = p.avatar;
    $("#topbar-name").textContent = p.name;
    $("#star-chip").firstChild.textContent = rewardEmoji() + " ";
    $("#star-count").textContent = p.totalStars;
    $("#btn-mute").textContent = state.settings.muted ? "🔇" : "🔊";
    $("#btn-mute").setAttribute("aria-pressed", String(state.settings.muted));
    updateTimeChip(remainingSeconds());
    document.body.parentElement.setAttribute("data-theme", p.theme || "ocean");
  }

  $("#btn-home").addEventListener("click", () => { Sound.tap(); navStack.length = 0; show("home"); });
  $("#btn-mute").addEventListener("click", () => {
    state.settings.muted = !state.settings.muted;
    if (state.settings.muted) stopSpeaking();
    save(); updateTopbar();
  });

  /* Parent button: press and hold for 3 seconds (child-safe gate) */
  (function () {
    const btn = $("#btn-parent");
    let holdTimer = null;
    const start = () => {
      btn.textContent = "⏳";
      holdTimer = setTimeout(() => { btn.textContent = "🔒"; show("parentGate", { then: "parent" }); }, 3000);
    };
    const cancel = () => {
      btn.textContent = "🔒";
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    };
    btn.addEventListener("pointerdown", start);
    btn.addEventListener("pointerup", cancel);
    btn.addEventListener("pointerleave", cancel);
    btn.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show("parentGate", { then: "parent" }); } });
    btn.addEventListener("click", () => toast("Grown-ups: press and hold for 3 seconds 🔒"));
  })();

  /* ------------------------------------------------------------------
     Profile select
  ------------------------------------------------------------------ */
  screens.profiles = function () {
    state.activeProfileId = null;
    save(); updateTopbar();
    navStack.length = 0;
    root.appendChild(el("div", { class: "brand-hero" }, [
      el("div", { class: "brand-logo", text: "🦉" }),
      el("h1", { class: "brand-title", text: "Lamora" }),
      el("p", { class: "brand-tag", text: "Learn, play and grow — who is playing today?" })
    ]));
    const grid = el("div", { class: "profile-grid" });
    state.profiles.forEach(p => {
      grid.appendChild(el("button", {
        class: "profile-card", "aria-label": "Play as " + p.name,
        onclick: () => {
          Sound.chime();
          state.activeProfileId = p.id;
          warned5 = warned1 = false;
          save(); updateTopbar();
          if (remainingSeconds() <= 0) show("break");
          else { show("home"); speak("Hello " + p.name + "! Let's learn and play!"); }
        }
      }, [
        el("div", { class: "profile-avatar", text: p.avatar }),
        el("div", { class: "profile-name", text: p.name }),
        el("div", { class: "tile-sub", text: `${rewardEmoji()} ${p.totalStars}` })
      ]));
    });
    root.appendChild(grid);
    root.appendChild(el("div", { class: "btn-row" }, [
      el("button", {
        class: "btn btn-ghost btn-small",
        onclick: () => show("parentGate", { then: "parent" })
      }, ["🔒 Parent zone"])
    ]));
  };

  /* ------------------------------------------------------------------
     Home
  ------------------------------------------------------------------ */
  const HOME_TILES = [
    { id: "learn",    emoji: "📚", label: "Learn",        sub: "Numbers & letters", screen: "learn",    cats: ["numeracy", "literacy"] },
    { id: "play",     emoji: "🎮", label: "Play",         sub: "Brain games",       screen: "play",     cats: ["play"] },
    { id: "memory",   emoji: "🧠", label: "Memory",       sub: "Memory gym",        screen: "memory",   cats: ["memory"] },
    { id: "draw",     emoji: "🎨", label: "Draw",         sub: "Drawing studio",    screen: "draw",     cats: ["draw"] },
    { id: "colour",   emoji: "🖍️", label: "Colour",       sub: "Colouring pages",   screen: "colour",   cats: ["colour"] },
    { id: "explore",  emoji: "🌍", label: "Explore",      sub: "Nature & world",    screen: "explore",  cats: ["explore"] },
    { id: "chess",    emoji: "♟️", label: "Chess",        sub: "Learn & play",      screen: "chess",    cats: ["chess"] },
    { id: "stories",  emoji: "📖", label: "Stories",      sub: "Read together",     screen: "stories",  cats: ["stories"] },
    { id: "prof",     emoji: "🧑‍🚀", label: "What Can I Be?", sub: "Profession cards", screen: "professions", cats: ["professions"] },
    { id: "rewards",  emoji: "🏆", label: "My Rewards",   sub: "See your progress", screen: "rewards",  cats: [] },
    { id: "stickers", emoji: "✨", label: "Sticker Book", sub: "Collect & create",  screen: "stickers", cats: ["stickers"] }
  ];

  screens.home = function () {
    const p = profile();
    if (!p) { show("profiles", {}, false); return; }
    navStack.length = 0;
    root.appendChild(title("Hello, " + p.name + "! 👋", "What would you like to do today?", false));
    const grid = el("div", { class: "tile-grid" });
    HOME_TILES.forEach(t => {
      if (t.cats.length && !t.cats.some(c => state.settings.enabled[c])) return;
      grid.appendChild(el("button", {
        class: "tile home-tile", "aria-label": t.label + ". " + t.sub,
        onclick: () => { Sound.tap(); speak(t.label); show(t.screen); }
      }, [
        el("span", { class: "tile-emoji", text: t.emoji, "aria-hidden": "true" }),
        el("span", { class: "tile-label", text: t.label }),
        el("span", { class: "tile-sub", text: t.sub })
      ]));
    });
    root.appendChild(grid);

    // Theme picker
    const themeRow = el("div", { class: "btn-row", role: "group", "aria-label": "Choose a colour theme" });
    THEMES.forEach(t => {
      themeRow.appendChild(el("button", {
        class: "icon-btn", title: t.name, "aria-label": "Theme: " + t.name,
        onclick: () => { Sound.pop(); p.theme = t.id; save(); updateTopbar(); }
      }, [t.emoji]));
    });
    root.appendChild(el("div", { style: "margin-top:26px;text-align:center" }, [
      el("p", { class: "screen-sub", text: "Pick your world:" }), themeRow
    ]));
  };

  /* ------------------------------------------------------------------
     Learn menu
  ------------------------------------------------------------------ */
  screens.learn = function () {
    root.appendChild(backRow());
    root.appendChild(title("Learn 📚", "Earn " + rewardName().toLowerCase() + " to unlock play time!"));
    const grid = el("div", { class: "tile-grid" });
    if (state.settings.enabled.numeracy) {
      window.LamoraNumeracy.topics(level()).forEach(t => {
        grid.appendChild(el("button", {
          class: "tile", onclick: () => { Sound.tap(); runQuiz(window.LamoraNumeracy.build(t.id, level())); }
        }, [
          el("span", { class: "tile-emoji", text: t.emoji }),
          el("span", { class: "tile-label", text: t.name }),
          el("span", { class: "tile-sub", text: "Numbers" })
        ]));
      });
    }
    if (state.settings.enabled.literacy) {
      window.LamoraLiteracy.topics(level()).forEach(t => {
        grid.appendChild(el("button", {
          class: "tile", onclick: () => { Sound.tap(); runQuiz(window.LamoraLiteracy.build(t.id, level())); }
        }, [
          el("span", { class: "tile-emoji", text: t.emoji }),
          el("span", { class: "tile-label", text: t.name }),
          el("span", { class: "tile-sub", text: "Letters & words" })
        ]));
      });
    }
    root.appendChild(grid);
  };

  /* ------------------------------------------------------------------
     Play (reward games, gated by play tokens)
  ------------------------------------------------------------------ */
  let playSessionEnd = 0, playSessionTimer = null;

  screens.play = function () {
    const p = profile();
    root.appendChild(backRow());
    root.appendChild(title("Play 🎮", p.playTokens > 0
      ? `You have ${p.playTokens} play session${p.playTokens > 1 ? "s" : ""}! Pick a game.`
      : `Earn ${state.settings.starsPerPlay} ${rewardName().toLowerCase()} in Learn to unlock a game session!`));

    const grid = el("div", { class: "tile-grid" });
    window.LamoraBrain.games().forEach(g => {
      const locked = p.playTokens <= 0;
      grid.appendChild(el("button", {
        class: "tile" + (locked ? " locked" : ""),
        "aria-label": g.name + (locked ? ". Locked. Earn stars in learn to unlock." : ""),
        onclick: () => {
          Sound.tap();
          if (locked) {
            toast(`Learn first to earn ${rewardName().toLowerCase()}! 📚`);
            speak("Do some learning first to unlock play time!");
            return;
          }
          p.playTokens -= 1; save(); updateTopbar();
          startPlaySession();
          window.LamoraBrain.start(g.id, gameCtx());
        }
      }, [
        el("span", { class: "tile-emoji", text: g.emoji }),
        el("span", { class: "tile-label", text: g.name }),
        el("span", { class: "tile-sub", text: locked ? "🔒 Locked" : g.sub })
      ]));
    });
    root.appendChild(grid);
  };

  function startPlaySession() {
    playSessionEnd = Date.now() + state.settings.playMinutes * 60000;
    clearInterval(playSessionTimer);
    playSessionTimer = setInterval(() => {
      const left = playSessionEnd - Date.now();
      if (left <= 60000 && left > 58000) toast("⏳ One more minute of play!");
      if (left <= 0) {
        clearInterval(playSessionTimer);
        toast("🎮 Play session finished — great job!");
        speak("Play time is over. Back to learning or take a break!");
        show("home");
      }
    }, 1000);
  }

  /* Context object passed to game/feature modules */
  function gameCtx() {
    return {
      root, el, backRow, title, toast, celebrate, runQuiz, shuffle,
      speak, Sound, level, profile, save, show, goBack,
      settings: state.settings, confetti, rewardEmoji
    };
  }

  /* ------------------------------------------------------------------
     Feature screens delegated to modules
  ------------------------------------------------------------------ */
  screens.memory = () => window.LamoraMemory.menu(gameCtx());
  screens.chess = p => window.LamoraChess.menu(gameCtx(), p);
  screens.draw = () => window.LamoraDrawing.open(gameCtx());
  screens.colour = () => window.LamoraColouring.menu(gameCtx());
  screens.stickers = () => window.LamoraStickers.open(gameCtx());
  screens.stories = () => window.LamoraStories.menu(gameCtx());
  screens.professions = () => window.LamoraProfessions.open(gameCtx());

  screens.explore = function () {
    root.appendChild(backRow());
    root.appendChild(title("Explore 🌍", "Discover nature, animals and our world!"));
    const grid = el("div", { class: "tile-grid" });
    const items = [
      ...window.LamoraNature.topics().map(t => ({ ...t, mod: "nature" })),
      ...window.LamoraWorld.topics().map(t => ({ ...t, mod: "world" }))
    ];
    items.forEach(t => {
      grid.appendChild(el("button", {
        class: "tile", onclick: () => {
          Sound.tap();
          const mod = t.mod === "nature" ? window.LamoraNature : window.LamoraWorld;
          mod.start(t.id, gameCtx());
        }
      }, [
        el("span", { class: "tile-emoji", text: t.emoji }),
        el("span", { class: "tile-label", text: t.name }),
        el("span", { class: "tile-sub", text: t.sub || "" })
      ]));
    });
    root.appendChild(grid);
  };

  /* ------------------------------------------------------------------
     Rewards screen
  ------------------------------------------------------------------ */
  screens.rewards = function () {
    const p = profile();
    root.appendChild(backRow());
    root.appendChild(title("My Rewards 🏆", "Look how much you have learned!"));

    const nextThreshold = STICKER_LADDER.find(t => t > p.totalStars) || (p.totalStars + 50);
    const pct = Math.min(100, Math.round((p.totalStars / nextThreshold) * 100));

    root.appendChild(el("div", { class: "card activity-wrap" }, [
      el("div", { class: "stat-grid" }, [
        statCard(rewardEmoji() + " " + p.totalStars, rewardName() + " earned"),
        statCard("🎮 " + p.playTokens, "Play sessions saved"),
        statCard("✅ " + p.progress.activities, "Activities done"),
        statCard("✨ " + p.stickers.length, "Stickers collected"),
        statCard("🔢 " + p.progress.streaks.numeracy, "Number wins"),
        statCard("📖 " + p.progress.streaks.reading, "Reading wins"),
        statCard("🧠 " + p.progress.streaks.memory, "Memory wins"),
        statCard("♟️ " + p.progress.chessLessons.length, "Chess lessons")
      ]),
      el("div", { style: "margin-top:20px" }, [
        el("p", { text: `Next sticker at ${nextThreshold} ${rewardName().toLowerCase()}:` }),
        el("div", { class: "progress-bar", role: "progressbar", "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100 }, [
          el("div", { style: "width:" + pct + "%" })
        ])
      ]),
      el("div", { class: "btn-row" }, [
        el("button", { class: "btn", onclick: () => show("stickers") }, ["✨ Sticker book"])
      ])
    ]));
  };

  function statCard(num, label) {
    return el("div", { class: "card stat-card" }, [
      el("div", { class: "stat-num", text: num }),
      el("div", { class: "stat-label", text: label })
    ]);
  }

  /* ------------------------------------------------------------------
     Parent gate (PIN pad)
  ------------------------------------------------------------------ */
  screens.parentGate = function (r, params) {
    stopSpeaking();
    const creating = !state.pin;
    let entered = "", firstPin = null;

    const heading = el("h1", { class: "screen-title", text: creating ? "Create a parent PIN" : "Parent PIN" });
    const sub = el("p", {
      class: "screen-sub",
      text: creating ? "Grown-ups: choose a 4-digit PIN to protect the parent zone." : "Grown-ups only: enter your 4-digit PIN."
    });
    const display = el("div", { class: "pin-display", "aria-live": "polite" });

    function refresh() { display.textContent = "•".repeat(entered.length) + "◦".repeat(4 - entered.length); }
    refresh();

    function submit() {
      if (creating) {
        if (!firstPin) {
          firstPin = entered; entered = "";
          sub.textContent = "Type the same PIN again to confirm.";
          refresh();
        } else if (firstPin === entered) {
          state.pin = entered; save();
          toast("✅ PIN saved");
          show(params.then || "parent", {}, false);
        } else {
          firstPin = null; entered = "";
          sub.textContent = "Those didn't match — let's start again.";
          refresh();
        }
      } else if (entered === state.pin) {
        show(params.then || "parent", {}, false);
      } else {
        entered = "";
        sub.textContent = "That's not right. Try again, grown-up!";
        Sound.tryAgain();
        refresh();
      }
    }

    const pad = el("div", { class: "pin-pad" });
    ["1","2","3","4","5","6","7","8","9","⌫","0","✔"].forEach(k => {
      pad.appendChild(el("button", {
        class: "pin-key", "aria-label": k === "⌫" ? "Delete" : k === "✔" ? "Confirm" : k,
        onclick: () => {
          Sound.tap();
          if (k === "⌫") entered = entered.slice(0, -1);
          else if (k === "✔") { if (entered.length === 4) submit(); return; }
          else if (entered.length < 4) entered += k;
          refresh();
          if (entered.length === 4 && k !== "⌫") setTimeout(submit, 150);
        }
      }, [k]));
    });

    root.appendChild(el("div", { class: "activity-wrap" }, [
      backRow(), heading, sub, display, pad
    ]));
  };

  /* ------------------------------------------------------------------
     Parent zone
  ------------------------------------------------------------------ */
  screens.parent = function () {
    stopSpeaking();
    const wrap = el("div", { class: "activity-wrap" });
    wrap.appendChild(el("div", { class: "back-row" }, [
      el("button", { class: "btn-back", onclick: () => show(profile() ? "home" : "profiles", {}, false) }, ["⬅ Exit parent zone"])
    ]));
    wrap.appendChild(el("h1", { class: "screen-title", text: "Parent Zone 🔒" }));
    wrap.appendChild(el("p", { class: "screen-sub", text: "All data stays on this device. Nothing is uploaded, ever." }));

    /* --- Screen time --- */
    const timeSec = el("div", { class: "card parent-section" });
    timeSec.appendChild(el("h3", { text: "⏳ Screen time" }));
    timeSec.appendChild(settingSelect("Daily limit", [
      ["10", "10 minutes"], ["15", "15 minutes"], ["20", "20 minutes"], ["30", "30 minutes"],
      ["45", "45 minutes"], ["60", "60 minutes"], ["90", "90 minutes"], ["120", "2 hours"]
    ], String(state.settings.dailyLimitMin), v => { state.settings.dailyLimitMin = parseInt(v, 10); warned5 = warned1 = false; save(); }));
    timeSec.appendChild(settingSelect("Reward game session length", [
      ["3", "3 minutes"], ["5", "5 minutes"], ["8", "8 minutes"], ["10", "10 minutes"]
    ], String(state.settings.playMinutes), v => { state.settings.playMinutes = parseInt(v, 10); save(); }));
    timeSec.appendChild(settingSelect("Learning needed per play session", [
      ["3", "3 " + rewardName().toLowerCase()], ["5", "5 " + rewardName().toLowerCase()], ["8", "8 " + rewardName().toLowerCase()], ["10", "10 " + rewardName().toLowerCase()]
    ], String(state.settings.starsPerPlay), v => { state.settings.starsPerPlay = parseInt(v, 10); save(); }));
    const p0 = profile();
    if (p0) {
      timeSec.appendChild(el("div", { class: "setting-row" }, [
        el("label", { text: `Used today (${p0.name}): ${Math.round(usedSecondsToday() / 60)} min` }),
        el("button", {
          class: "btn btn-small", onclick: () => {
            p0.usage[todayKey()] = 0; warned5 = warned1 = false; save();
            toast("Today's timer reset"); updateTimeChip(remainingSeconds());
          }
        }, ["Reset today's timer"])
      ]));
    }
    wrap.appendChild(timeSec);

    /* --- Rewards --- */
    const rewSec = el("div", { class: "card parent-section" });
    rewSec.appendChild(el("h3", { text: "🏆 Rewards" }));
    rewSec.appendChild(settingSelect("Reward style",
      Object.entries(REWARD_STYLES).map(([k, v]) => [k, v.emoji + " " + v.name]),
      state.settings.rewardStyle, v => { state.settings.rewardStyle = v; save(); updateTopbar(); }));
    state.profiles.forEach(p => {
      rewSec.appendChild(el("div", { class: "setting-row" }, [
        el("label", { text: p.avatar + " " + p.name + " — " + p.totalStars + " " + rewardName().toLowerCase() }),
        el("button", {
          class: "btn btn-small btn-danger", onclick: () => {
            if (confirm("Reset all rewards and progress for " + p.name + "?")) {
              p.stars = 0; p.totalStars = 0; p.playTokens = 0; p.stickers = ["🌟", "😀"];
              p.progress = makeProfile().progress; save(); show("parent", {}, false);
            }
          }
        }, ["Reset rewards"])
      ]));
    });
    wrap.appendChild(rewSec);

    /* --- Categories --- */
    const catSec = el("div", { class: "card parent-section" });
    catSec.appendChild(el("h3", { text: "📚 Available activities" }));
    const catNames = {
      numeracy: "Numeracy", literacy: "Literacy", memory: "Memory gym", play: "Reward games",
      draw: "Drawing", colour: "Colouring", explore: "Explore (nature & world)", chess: "Chess",
      stories: "Stories", professions: "Profession cards", stickers: "Sticker book"
    };
    CATEGORIES.forEach(c => {
      catSec.appendChild(settingToggle(catNames[c], state.settings.enabled[c], v => { state.settings.enabled[c] = v; save(); }));
    });
    wrap.appendChild(catSec);

    /* --- Profiles --- */
    const profSec = el("div", { class: "card parent-section" });
    profSec.appendChild(el("h3", { text: "🧒 Child profiles" }));
    state.profiles.forEach(p => {
      const nameInput = el("input", { type: "text", value: p.name, maxlength: "14", "aria-label": "Name for this profile" });
      nameInput.addEventListener("change", () => { p.name = nameInput.value.trim() || p.name; save(); updateTopbar(); });
      const row = el("div", { class: "setting-row" }, [
        el("span", { text: p.avatar, style: "font-size:1.6rem" }),
        nameInput,
        ageSelect(p),
        avatarSelect(p),
        el("button", {
          class: "btn btn-small btn-danger", "aria-label": "Delete profile " + p.name,
          onclick: () => {
            if (state.profiles.length <= 1) { toast("Keep at least one profile"); return; }
            if (confirm("Delete " + p.name + "'s profile and all their local data?")) {
              state.profiles = state.profiles.filter(x => x.id !== p.id);
              if (state.activeProfileId === p.id) state.activeProfileId = null;
              save(); show("parent", {}, false);
            }
          }
        }, ["Delete"])
      ]);
      profSec.appendChild(row);
    });
    profSec.appendChild(el("div", { class: "btn-row" }, [
      el("button", {
        class: "btn btn-small", onclick: () => {
          if (state.profiles.length >= 6) { toast("Up to 6 profiles supported"); return; }
          state.profiles.push(makeProfile("New child", 6, AVATARS[state.profiles.length % AVATARS.length]));
          save(); show("parent", {}, false);
        }
      }, ["➕ Add profile"])
    ]));
    wrap.appendChild(profSec);

    /* --- Sound & accessibility --- */
    const accSec = el("div", { class: "card parent-section" });
    accSec.appendChild(el("h3", { text: "🔊 Sound & accessibility" }));
    accSec.appendChild(settingToggle("Sounds & speech", !state.settings.muted, v => { state.settings.muted = !v; save(); updateTopbar(); }));
    accSec.appendChild(settingSelect("Volume", [["0.3", "Quiet"], ["0.7", "Medium"], ["1", "Loud"]],
      String(state.settings.volume), v => { state.settings.volume = parseFloat(v); save(); }));
    accSec.appendChild(settingToggle("Large text", state.settings.textLarge, v => { state.settings.textLarge = v; applyA11y(); save(); }));
    accSec.appendChild(settingToggle("High contrast", state.settings.highContrast, v => { state.settings.highContrast = v; applyA11y(); save(); }));
    accSec.appendChild(settingToggle("Reduced motion", state.settings.reducedMotion, v => { state.settings.reducedMotion = v; applyA11y(); save(); }));
    wrap.appendChild(accSec);

    /* --- Data & privacy --- */
    const dataSec = el("div", { class: "card parent-section" });
    dataSec.appendChild(el("h3", { text: "🛡️ Data & privacy" }));
    dataSec.appendChild(el("p", { text: "Lamora keeps everything on this device: progress, drawings and photos never leave it. There are no accounts, ads, analytics or uploads." }));
    dataSec.appendChild(el("div", { class: "btn-row" }, [
      el("button", { class: "btn btn-small", onclick: exportSummary }, ["📄 Export progress summary"]),
      el("button", {
        class: "btn btn-small", onclick: () => {
          if (state.pin && confirm("Change the parent PIN?")) { state.pin = null; save(); show("parentGate", { then: "parent" }, false); }
        }
      }, ["🔑 Change PIN"]),
      el("button", {
        class: "btn btn-small btn-danger", onclick: () => {
          if (confirm("Delete ALL Lamora data on this device? This removes every profile, drawing, photo and setting.") &&
              confirm("Are you completely sure? This cannot be undone.")) {
            localStorage.clear();
            if (window.caches) caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
            location.reload();
          }
        }
      }, ["🗑️ Delete all data"])
    ]));
    wrap.appendChild(dataSec);

    root.appendChild(wrap);
  };

  function settingToggle(label, value, onChange) {
    const id = "sw" + Math.random().toString(36).slice(2, 8);
    const input = el("input", { type: "checkbox", id, "aria-label": label });
    input.checked = value;
    input.addEventListener("change", () => onChange(input.checked));
    return el("div", { class: "setting-row" }, [
      el("label", { text: label, for: id }),
      el("span", { class: "switch" }, [input, el("span", { class: "slider" })])
    ]);
  }

  function settingSelect(label, options, value, onChange) {
    const sel = el("select", { "aria-label": label });
    options.forEach(([v, txt]) => {
      const o = el("option", { value: v, text: txt });
      if (v === value) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => onChange(sel.value));
    return el("div", { class: "setting-row" }, [el("label", { text: label }), sel]);
  }

  function ageSelect(p) {
    const sel = el("select", { "aria-label": "Age for " + p.name });
    for (let a = 5; a <= 10; a++) {
      const o = el("option", { value: String(a), text: "Age " + a });
      if (a === p.age) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener("change", () => { p.age = parseInt(sel.value, 10); save(); });
    return sel;
  }

  function avatarSelect(p) {
    const sel = el("select", { "aria-label": "Avatar for " + p.name });
    AVATARS.forEach(a => {
      const o = el("option", { value: a, text: a });
      if (a === p.avatar) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => { p.avatar = sel.value; save(); updateTopbar(); });
    return sel;
  }

  function exportSummary() {
    let txt = "Lamora — Progress Summary\nDate: " + new Date().toLocaleDateString() + "\n\n";
    state.profiles.forEach(p => {
      txt += `${p.name} (age ${p.age})\n`;
      txt += `  ${rewardName()}: ${p.totalStars}\n`;
      txt += `  Activities completed: ${p.progress.activities}\n`;
      txt += `  Stickers collected: ${p.stickers.length}\n`;
      txt += `  Chess lessons done: ${p.progress.chessLessons.length}\n`;
      Object.entries(p.progress.byCategory).forEach(([c, n]) => { txt += `  ${c}: ${n} activities\n`; });
      const mins = Object.values(p.usage).reduce((a, b) => a + b, 0) / 60;
      txt += `  Total screen time recorded: ${Math.round(mins)} minutes\n\n`;
    });
    const blob = new Blob([txt], { type: "text/plain" });
    const a = el("a", { href: URL.createObjectURL(blob), download: "lamora-progress.txt" });
    document.body.appendChild(a); a.click(); a.remove();
    toast("Summary downloaded 📄");
  }

  /* ------------------------------------------------------------------
     Accessibility application
  ------------------------------------------------------------------ */
  function applyA11y() {
    const html = document.documentElement;
    html.setAttribute("data-textsize", state.settings.textLarge ? "large" : "normal");
    html.setAttribute("data-contrast", state.settings.highContrast ? "high" : "normal");
    html.setAttribute("data-motion", state.settings.reducedMotion ? "reduced" : "full");
  }
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) {
    state.settings.reducedMotion = true;
  }
  applyA11y();

  /* ------------------------------------------------------------------
     PWA: service worker + update banner
  ------------------------------------------------------------------ */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").then(reg => {
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              $("#update-banner").classList.remove("hidden");
              $("#btn-update").onclick = () => {
                nw.postMessage({ type: "SKIP_WAITING" });
                location.reload();
              };
            }
          });
        });
      }).catch(() => { /* offline or unsupported — the app still works */ });
    });
  }

  /* ------------------------------------------------------------------
     Boot
  ------------------------------------------------------------------ */
  window.Lamora = {
    state, settings: state.settings, profile, level, save, show, goBack,
    runQuiz, celebrate, awardStars, toast, el, backRow, title, shuffle, confetti,
    gameCtx
  };

  updateTopbar();
  show("profiles", {}, false);
})();
