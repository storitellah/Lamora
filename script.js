/* ============================================================
   Lamora — core app
   Local-only, offline-first. No accounts, no network calls,
   no analytics. All data lives in localStorage on this device.
   ============================================================ */
(function () {
'use strict';

const L = window.Lamora = {};
const STORE_KEY = 'lamora:v1';
const $app = () => document.getElementById('app');

/* ---------------- tiny DOM helper ---------------- */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  attrs = attrs || {};
  for (const k in attrs) {
    const v = attrs[k];
    if (v == null) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(kid) : kid);
  }
  return el;
}
L.h = h;

/* ---------------- utilities ---------------- */
L.shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
L.rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
L.sample = (arr, n) => L.shuffle(arr).slice(0, n);
L.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
L.todayKey = () => new Date().toISOString().slice(0, 10);

L.download = function (filename, dataUrl) {
  const a = h('a', { href: dataUrl, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/* Simple non-cryptographic hash — the PIN is a child gate, not a security
   boundary; nothing sensitive is protected by it and it never leaves the device. */
function pinHash(pin) {
  let x = 2166136261;
  const s = 'lamora' + pin;
  for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
  return String(x >>> 0);
}

/* ---------------- state ---------------- */
const AVATARS = ['🦄', '🐬', '🐉', '🦖', '🚀', '🦊', '🐢', '🦋', '🐼', '🌟', '🧜‍♀️', '🦁'];
const THEMES = [
  { id: 'ocean',   name: 'Ocean Adventure', icon: '🌊' },
  { id: 'rainbow', name: 'Rainbow Garden',  icon: '🌈' },
  { id: 'dragon',  name: 'Dragon Kingdom',  icon: '🐉' },
  { id: 'space',   name: 'Space Explorer',  icon: '🚀' },
  { id: 'nature',  name: 'Nature Club',     icon: '🌿' },
  { id: 'dino',    name: 'Dinosaur World',  icon: '🦖' }
];
const REWARD_STYLES = {
  stars:   { name: 'Stars',          icon: '⭐' },
  gems:    { name: 'Gems',           icon: '💎' },
  shells:  { name: 'Shells',         icon: '🐚' },
  eggs:    { name: 'Dragon eggs',    icon: '🥚' },
  rainbow: { name: 'Rainbow points', icon: '🌈' },
  planets: { name: 'Planet badges',  icon: '🪐' }
};
L.THEMES = THEMES;
L.AVATARS = AVATARS;

function newProfile(name, age, avatar, theme) {
  return {
    id: 'p' + Date.now() + Math.floor(Math.random() * 9999),
    name, age,
    avatar: avatar || '🦄',
    colour: '#6c5ce7',
    theme: theme || 'ocean',
    stickerTheme: 'all',
    stars: 0,
    tokens: 1,
    stickers: [],
    progress: {},          // skill -> activities completed
    streaks: {},           // skill -> {count, last}
    chessLessons: [],
    natureBadges: [],
    drawings: [],          // saved data-URLs (kept small)
    scenes: []
  };
}

const DEFAULT_STATE = () => ({
  version: 1,
  activeProfileId: null,
  profiles: [
    newProfile('Maya', 5, '🧜‍♀️', 'ocean'),
    newProfile('Kai', 8, '🐉', 'dragon')
  ],
  parent: {
    pinHash: null,
    dailyLimitMin: 45,
    sessionLimitMin: 20,
    rewardMinutes: 5,
    rewardStyle: 'stars',
    freePlay: false,
    difficulty: 'age',      // 'age' | 'easy' | 'medium' | 'hard'
    sound: true,
    music: false,
    speech: true,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    categories: {
      learn: true, play: true, memory: true, draw: true, colour: true,
      explore: true, chess: true, professions: true, stories: true
    }
  },
  usage: {}                 // profileId -> { date, seconds }
});

let state;
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      state = JSON.parse(raw);
      // merge any new default keys added in updates
      const d = DEFAULT_STATE();
      state.parent = Object.assign({}, d.parent, state.parent);
      state.parent.categories = Object.assign({}, d.parent.categories, state.parent.categories);
      return;
    }
  } catch (e) { /* corrupted storage — start fresh */ }
  state = DEFAULT_STATE();
  save();
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { toast('Storage is full — drawings may not save.'); }
}
L.save = save;
Object.defineProperty(L, 'state', { get: () => state });

L.profile = () => state.profiles.find((p) => p.id === state.activeProfileId) || null;

/* Difficulty band for the active child. */
L.ageBand = function () {
  const p = L.profile();
  const diff = state.parent.difficulty;
  if (diff === 'easy') return 'young';
  if (diff === 'medium') return 'mid';
  if (diff === 'hard') return 'old';
  const age = p ? p.age : 7;
  return age <= 6 ? 'young' : age <= 8 ? 'mid' : 'old';
};

/* ---------------- audio wrappers (respect parent settings) ---------------- */
L.sfx = function (name, arg) {
  if (!state.parent.sound) return;
  try { window.LamoraSounds.SFX[name] && window.LamoraSounds.SFX[name](arg); } catch (e) {}
};
L.speak = function (text) {
  if (!state.parent.sound || !state.parent.speech) return;
  window.LamoraSounds.speak(text);
};
function syncMusic() {
  if (state.parent.sound && state.parent.music) window.LamoraSounds.startMusic();
  else window.LamoraSounds.stopMusic();
}

/* ---------------- toast & overlay ---------------- */
let toastTimer = null;
function toast(msg, ms) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms || 2600);
}
L.toast = toast;

function overlay(contentEl) {
  const o = document.getElementById('overlay');
  o.innerHTML = '';
  if (!contentEl) { o.classList.remove('show'); return; }
  o.appendChild(contentEl);
  o.classList.add('show');
}
L.overlay = overlay;
L.closeOverlay = () => overlay(null);

L.confirmDialog = function (title, msg, okLabel) {
  return new Promise((resolve) => {
    overlay(h('div', { class: 'overlay-card', role: 'dialog', 'aria-label': title },
      h('h2', { text: title }),
      h('p', { text: msg }),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('button', { class: 'btn secondary', onclick: () => { overlay(null); resolve(false); } }, 'Cancel'),
        h('button', { class: 'btn danger', onclick: () => { overlay(null); resolve(true); } }, okLabel || 'Yes')
      )
    ));
  });
};

/* ---------------- rewards ---------------- */
L.rewardStyle = () => REWARD_STYLES[state.parent.rewardStyle] || REWARD_STYLES.stars;

const STICKER_MILESTONE = 12; // one new sticker roughly every 12 stars

const ENCOURAGE = [
  'Amazing work!', 'You are a star!', 'Super job!', 'Brilliant thinking!',
  'Wow, well done!', 'Your brain is growing!', 'Fantastic effort!', 'High five!'
];

/* Called by every learning activity when it finishes. */
L.completeActivity = function (opts) {
  const p = L.profile();
  if (!p) return;
  const starsEarned = Math.max(1, opts.stars || 1);
  p.stars += starsEarned;
  p.tokens = (p.tokens || 0) + 1;
  const skill = opts.skill || 'general';
  p.progress[skill] = (p.progress[skill] || 0) + 1;

  // streaks: one per day per skill
  const st = p.streaks[skill] || { count: 0, last: null };
  const today = L.todayKey();
  if (st.last !== today) {
    const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    st.count = st.last === yest ? st.count + 1 : 1;
    st.last = today;
  }
  p.streaks[skill] = st;

  // sticker milestone
  let newSticker = null;
  const owed = Math.floor(p.stars / STICKER_MILESTONE);
  if (owed > p.stickers.length && window.LamoraStickers) {
    newSticker = window.LamoraStickers.unlockNext(p);
  }
  save();

  const rw = L.rewardStyle();
  const msg = L.pick(ENCOURAGE);
  L.sfx('win');
  L.speak(msg + ' You earned ' + starsEarned + ' ' + rw.name.toLowerCase() + '!');

  overlay(h('div', { class: 'overlay-card', role: 'dialog', 'aria-label': 'Well done' },
    h('div', { class: 'celebrate-stars', 'aria-hidden': 'true' }, rw.icon.repeat(Math.min(starsEarned, 5))),
    h('h2', { text: msg }),
    h('p', {}, `You earned ${starsEarned} ${rw.name.toLowerCase()} and unlocked a play token! 🎟️`),
    newSticker ? h('p', { class: 'pill' }, `New sticker: ${newSticker.icon} ${newSticker.name}!`) : null,
    h('div', { class: 'row', style: { justifyContent: 'center' } },
      h('button', { class: 'btn secondary', onclick: () => { overlay(null); L.go('home'); } }, '🏠 Home'),
      h('button', { class: 'btn', onclick: () => { overlay(null); if (opts.onAgain) opts.onAgain(); else L.go('play'); } },
        opts.onAgain ? '🔁 Again' : '🎮 Play')
    )
  ));
};

/* Reward-game gating. */
L.canPlay = () => state.parent.freePlay || (L.profile() && (L.profile().tokens || 0) > 0);

let rewardTimer = null;
let rewardEndsAt = 0;
L.startRewardSession = function () {
  if (state.parent.freePlay) return true;
  const p = L.profile();
  if (!p || (p.tokens || 0) <= 0) return false;
  p.tokens -= 1;
  save();
  clearTimeout(rewardTimer);
  rewardEndsAt = Date.now() + state.parent.rewardMinutes * 60000;
  rewardTimer = setTimeout(endRewardSession, state.parent.rewardMinutes * 60000);
  toast(`Play time: ${state.parent.rewardMinutes} minutes 🎟️`);
  return true;
};
function endRewardSession() {
  rewardTimer = null;
  if (!location.hash.startsWith('#/game/')) return;
  L.sfx('ding');
  L.speak('Great playing! Time to learn something new or take a break.');
  overlay(h('div', { class: 'overlay-card' },
    h('div', { class: 'celebrate-stars' }, '🎈'),
    h('h2', { text: 'Great playing!' }),
    h('p', { text: 'Play time is finished. Learn something new to earn another play token, or take a little break.' }),
    h('div', { class: 'row', style: { justifyContent: 'center' } },
      h('button', { class: 'btn', onclick: () => { overlay(null); L.go('learn'); } }, '📚 Learn'),
      h('button', { class: 'btn secondary', onclick: () => { overlay(null); L.go('home'); } }, '🏠 Home')
    )
  ));
}
L.cancelRewardSession = () => { clearTimeout(rewardTimer); rewardTimer = null; };

/* ---------------- router ---------------- */
const routes = {};
L.route = (name, fn) => { routes[name] = fn; };
L.go = function () {
  const target = '#/' + Array.from(arguments).join('/');
  if (location.hash === target) render();      // same hash fires no event
  else location.hash = target;
};

let leaveHooks = [];
L.onLeave = (fn) => leaveHooks.push(fn);

function render() {
  leaveHooks.forEach((fn) => { try { fn(); } catch (e) {} });
  leaveHooks = [];
  window.LamoraSounds.stopSpeech();
  overlay(null);

  const parts = (location.hash || '#/').slice(2).split('/').filter(Boolean);
  let name = parts[0] || 'home';
  const args = parts.slice(1);

  if (!L.profile() && name !== 'profiles') name = 'profiles';
  if (!routes[name]) name = 'home';

  const app = $app();
  app.innerHTML = '';
  window.scrollTo(0, 0);
  routes[name](...args);
  app.focus({ preventScroll: true });
  updateStatusbar();
}
window.addEventListener('hashchange', render);

/* ---------------- page scaffolding ---------------- */
L.page = function (title, opts) {
  opts = opts || {};
  const app = $app();
  const head = h('div', { class: 'page-head' },
    opts.back === false ? null :
      h('button', { class: 'icon-btn', 'aria-label': 'Go back', onclick: () => (opts.backTo ? L.go(opts.backTo) : history.back()) }, '⬅️'),
    h('h1', { text: title }),
    h('button', {
      class: 'icon-btn', 'aria-label': 'Hear instructions',
      onclick: () => L.speak(opts.speak || title)
    }, '🔊')
  );
  app.appendChild(head);
  if (opts.speakOnOpen !== false) L.speak(opts.speak || title);
  const body = h('div', { class: 'page-body' });
  app.appendChild(body);
  return body;
};

L.bigButton = function (icon, label, onTap, sub) {
  return h('button', {
    class: 'big-btn tint-a', onclick: () => { L.sfx('tap'); onTap(); },
    'aria-label': label + (sub ? '. ' + sub : '')
  },
    h('span', { class: 'emoji', 'aria-hidden': 'true' }, icon),
    h('span', {}, label),
    sub ? h('small', {}, sub) : null
  );
};

/* ---------------- generic quiz engine ----------------
   Powers numeracy, literacy, nature, world and tap-to-reveal
   activities. Gentle: hints on the first miss, a friendly
   reveal + explanation on the second, never any shaming. */
L.runQuiz = function (cfg) {
  const body = L.page(cfg.title, { speak: cfg.speakTitle || cfg.title, backTo: cfg.backTo });
  const questions = cfg.questions;
  let idx = 0, firstTryCorrect = 0, misses = 0;

  const dots = h('div', { class: 'progress-dots', 'aria-hidden': 'true' },
    questions.map(() => h('span', { class: 'dot' })));
  const promptEl = h('div', { class: 'quiz-prompt', 'aria-live': 'polite' });
  const visualEl = h('div', { class: 'quiz-visual' });
  const optsEl = h('div', { class: 'quiz-options' });
  const hintEl = h('div', { class: 'hint-box', 'aria-live': 'polite' });
  body.append(dots, h('div', { class: 'card' }, promptEl, visualEl, optsEl, hintEl));

  function showQuestion() {
    const q = questions[idx];
    misses = 0;
    dots.querySelectorAll('.dot').forEach((d, i) => {
      d.className = 'dot' + (i < idx ? ' done' : i === idx ? ' now' : '');
    });
    promptEl.textContent = q.prompt;
    visualEl.textContent = q.visual || '';
    visualEl.style.display = q.visual ? '' : 'none';
    visualEl.style.filter = q.visualFilter || '';
    hintEl.textContent = '';
    optsEl.innerHTML = '';
    optsEl.className = 'quiz-options' + (q.options.length === 2 ? ' two' : '');
    L.speak(q.speak || q.prompt);

    q.options.forEach((opt, i) => {
      const label = typeof opt === 'object' ? opt.label : String(opt);
      const btn = h('button', { class: 'option-btn', 'aria-label': label }, label);
      btn.addEventListener('click', () => choose(i, btn, q));
      optsEl.appendChild(btn);
    });
  }

  function lockOptions() { optsEl.querySelectorAll('button').forEach((b) => (b.disabled = true)); }

  function choose(i, btn, q) {
    if (btn.disabled) return;
    if (i === q.answer) {
      btn.classList.add('correct');
      lockOptions();
      L.sfx('correct');
      if (misses === 0) firstTryCorrect++;
      hintEl.textContent = misses === 0 ? L.pick(['Yes! 🎉', 'You got it! ⭐', 'Exactly right! 💛']) : 'You found it! 🎉';
      setTimeout(next, 850);
    } else {
      misses++;
      btn.classList.add('wrong');
      btn.disabled = true;
      L.sfx('wrong');
      if (misses === 1) {
        const hint = q.hint || 'Look carefully and try again — you can do it!';
        hintEl.textContent = '💡 ' + hint;
        L.speak(hint);
      } else {
        // gentle reveal with a simple explanation
        const correctBtn = optsEl.querySelectorAll('button')[q.answer];
        correctBtn.classList.add('reveal');
        lockOptions();
        const explain = q.explain || `The answer is ${typeof q.options[q.answer] === 'object' ? q.options[q.answer].label : q.options[q.answer]}.`;
        hintEl.textContent = '🌟 ' + explain;
        L.speak(explain + '. Let’s try the next one!');
        const nextBtn = h('button', { class: 'btn', style: { marginTop: '10px' }, onclick: next }, 'Next ➡️');
        hintEl.appendChild(h('div', {}, nextBtn));
        nextBtn.focus();
      }
    }
  }

  function next() {
    idx++;
    if (idx < questions.length) { showQuestion(); return; }
    const stars = Math.max(1, Math.round((firstTryCorrect / questions.length) * (cfg.maxStars || 5)));
    if (cfg.onDone) cfg.onDone(stars);
    else L.completeActivity({ skill: cfg.skill, stars, onAgain: cfg.onAgain });
  }

  showQuestion();
};

/* ---------------- screen time engine ---------------- */
let sessionSeconds = 0;
let breakActive = false;

function usageFor(pid) {
  const today = L.todayKey();
  let u = state.usage[pid];
  if (!u || u.date !== today) { u = { date: today, seconds: 0 }; state.usage[pid] = u; }
  return u;
}

const BREAK_IDEAS = [
  '🐱 Stretch up tall like a cat', '🔵 Find something blue in your room', '💧 Drink a glass of water',
  '🪟 Look out of the window and name 3 things', '🌬️ Take five slow, deep breaths',
  '✏️ Draw something on real paper', '💚 Help someone at home with a little job', '🤸 Do five star jumps'
];

function showBreakScreen() {
  breakActive = true;
  L.cancelRewardSession();
  window.LamoraSounds.stopMusic();
  L.speak('Great job today! Screen time is finished. Time for a fun break.');
  overlay(h('div', { class: 'overlay-card', role: 'dialog', 'aria-label': 'Break time' },
    h('div', { class: 'celebrate-stars', 'aria-hidden': 'true' }, '🌤️'),
    h('h2', { text: 'Wonderful work today!' }),
    h('p', { text: 'Screen time is finished for now. Here is a fun idea for your break:' }),
    h('p', { class: 'pill', style: { fontSize: '1.05rem' } }, L.pick(BREAK_IDEAS)),
    h('p', { class: 'small-note', text: 'A grown-up can add more time from the Parent Zone.' }),
    h('div', { class: 'row', style: { justifyContent: 'center' } },
      h('button', { class: 'btn secondary', onclick: () => { overlay(null); askPin(() => { usageFor(state.activeProfileId).seconds = 0; sessionSeconds = 0; breakActive = false; save(); toast('Extra time added. Have fun! 🎈'); }); } }, '🔑 Parent: add time')
    )
  ));
}

let warned5 = false, warned1 = false, sessionWarned = false;
setInterval(() => {
  if (document.hidden || breakActive) return;
  const p = L.profile();
  if (!p) return;
  const hashName = (location.hash || '').slice(2).split('/')[0];
  if (hashName.startsWith('parent') || hashName === 'profiles') return;

  const u = usageFor(p.id);
  u.seconds++;
  sessionSeconds++;
  if (u.seconds % 30 === 0) save();

  const limit = state.parent.dailyLimitMin * 60;
  const remain = limit - u.seconds;
  if (remain === 300 && !warned5) { warned5 = true; toast('5 minutes of screen time left ⏳'); L.speak('Five minutes left.'); }
  if (remain === 60 && !warned1) { warned1 = true; toast('1 minute left — finish up! ⏳'); L.speak('One minute left. Finish up!'); }
  if (remain <= 0) { showBreakScreen(); return; }

  const sLimit = state.parent.sessionLimitMin * 60;
  if (sessionSeconds >= sLimit && !sessionWarned) {
    sessionWarned = true;
    toast('That was a long session — how about a stretch? 🤸');
    L.speak('You have been playing a while. How about a little stretch?');
    setTimeout(() => { sessionWarned = false; sessionSeconds = 0; }, 60000);
  }
  updateStatusbar();
}, 1000);

function updateStatusbar() {
  const bar = document.getElementById('statusbar');
  const p = L.profile();
  if (!p) { bar.innerHTML = ''; return; }
  const u = usageFor(p.id);
  const remain = state.parent.dailyLimitMin * 60 - u.seconds;
  bar.innerHTML = '';
  if (remain > 0 && remain <= 600) {
    const m = Math.ceil(remain / 60);
    bar.appendChild(h('span', { class: 'chip show' + (remain <= 120 ? ' warn' : '') }, `⏳ ${m} min left`));
  }
}

/* ---------------- parent gate ---------------- */
function adultGate(onPass) {
  /* Child-safe verification: a grown-up maths question answered on the keypad. */
  const a = L.rand(6, 9), b = L.rand(6, 9);
  pinPadDialog(`Grown-ups only: what is ${a} × ${b}?`, String(a * b).length, (entry) => {
    if (entry === String(a * b)) { onPass(); return true; }
    return false;
  }, 'This question keeps the settings safe for grown-ups.');
}

function askPin(onPass) {
  if (!state.parent.pinHash) {
    adultGate(() => setNewPin(onPass));
    return;
  }
  pinPadDialog('Enter your parent PIN', 4, (entry) => {
    if (pinHash(entry) === state.parent.pinHash) { onPass(); return true; }
    return false;
  }, null, () => adultGate(() => setNewPin(onPass)));
}
L.askPin = askPin;

function setNewPin(onDone) {
  pinPadDialog('Choose a 4-digit parent PIN', 4, (first) => {
    pinPadDialog('Type the same PIN again', 4, (second) => {
      if (first === second) {
        state.parent.pinHash = pinHash(first);
        save();
        toast('Parent PIN saved 🔒');
        onDone();
        return true;
      }
      return false;
    });
    return true;
  });
}

function pinPadDialog(title, length, onSubmit, note, onForgot) {
  let entry = '';
  const dots = h('div', { class: 'pin-dots' });
  const msg = h('p', { class: 'small-note', 'aria-live': 'polite' }, note || '');
  function renderDots() {
    dots.innerHTML = '';
    for (let i = 0; i < length; i++) dots.appendChild(h('span', { class: i < entry.length ? 'filled' : '' }));
  }
  renderDots();
  function press(k) {
    L.sfx('tap');
    if (k === '⌫') entry = entry.slice(0, -1);
    else if (entry.length < length) entry += k;
    renderDots();
    if (entry.length === length) {
      setTimeout(() => {
        const ok = onSubmit(entry);
        if (!ok) { entry = ''; renderDots(); msg.textContent = 'Not quite — try again.'; L.sfx('wrong'); return; }
        // Only close if the submit handler didn't already open a follow-up dialog
        const o = document.getElementById('overlay');
        if (o.firstChild === card) overlay(null);
      }, 120);
    }
  }
  const pad = h('div', { class: 'pin-pad' },
    ['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k) =>
      k === '' ? h('span') : h('button', { class: 'pin-key', 'aria-label': k === '⌫' ? 'Delete' : k, onclick: () => press(k) }, k))
  );
  const card = h('div', { class: 'overlay-card', role: 'dialog', 'aria-label': title },
    h('h2', { text: title }),
    dots, pad, msg,
    h('div', { class: 'row', style: { justifyContent: 'center' } },
      onForgot ? h('button', { class: 'btn soft small', onclick: () => onForgot() }, 'Forgot PIN?') : null,
      h('button', { class: 'btn secondary small', onclick: () => overlay(null) }, 'Cancel')
    )
  );
  overlay(card);
}

/* Press-and-hold helper for the parent entrance. */
function holdButton(label, ms, onHeld) {
  const btn = h('button', { class: 'btn secondary', 'aria-label': label + '. Press and hold for 2 seconds.' }, label);
  let timer = null, prog = 0, tick = null;
  const start = (e) => {
    e.preventDefault();
    btn.textContent = label + ' …';
    timer = setTimeout(() => { cancel(); onHeld(); }, ms);
  };
  const cancel = () => { clearTimeout(timer); clearInterval(tick); btn.textContent = label; };
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', cancel);
  btn.addEventListener('pointerleave', cancel);
  btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onHeld(); } });
  return btn;
}

/* ---------------- profiles ---------------- */
L.route('profiles', () => {
  const body = L.page('Who is playing?', { back: false, speak: 'Who is playing today? Tap your picture!' });
  const wrap = h('div', { class: 'profile-pick' });
  state.profiles.forEach((p) => {
    wrap.appendChild(h('button', {
      class: 'profile-btn' + (p.id === state.activeProfileId ? ' active' : ''),
      onclick: () => {
        state.activeProfileId = p.id;
        warned5 = warned1 = false;
        save();
        applyTheme();
        L.sfx('pop');
        L.speak('Hello ' + p.name + '!');
        L.go('home');
      }
    },
      h('span', { class: 'avatar', 'aria-hidden': 'true' }, p.avatar),
      h('span', {}, p.name),
      h('small', { class: 'muted' }, `age ${p.age}`)
    ));
  });
  body.appendChild(wrap);
  body.appendChild(h('div', { class: 'center', style: { marginTop: '18px' } },
    holdButton('👨‍👩‍👧 Parent Zone', 2000, () => askPin(() => L.go('parent')))
  ));
});

function applyTheme() {
  const p = L.profile();
  document.body.dataset.theme = p ? p.theme : 'ocean';
  const root = document.documentElement;
  root.classList.toggle('large-text', !!state.parent.largeText);
  root.classList.toggle('high-contrast', !!state.parent.highContrast);
  root.classList.toggle('reduced-motion', !!state.parent.reducedMotion);
  syncMusic();
}
L.applyTheme = applyTheme;

/* ---------------- home ---------------- */
L.route('home', () => {
  const p = L.profile();
  const cats = state.parent.categories;
  const rw = L.rewardStyle();
  const app = $app();

  app.appendChild(h('div', { class: 'hero' },
    h('h1', { class: 'logo' }, '🌙 Lamora'),
    h('p', { class: 'hello' }, `Hi ${p.name}! ${p.avatar}  ·  ${rw.icon} ${p.stars}  ·  🎟️ ${p.tokens || 0}`)
  ));

  const grid = h('div', { class: 'menu-grid' });
  const items = [
    cats.learn && ['📚', 'Learn', () => L.go('learn'), 'numbers & letters'],
    cats.play && ['🎮', 'Play', () => L.go('play'), 'reward games'],
    cats.memory && ['🧠', 'Memory', () => L.go('memorygym'), 'memory gym'],
    cats.draw && ['🎨', 'Draw', () => L.go('draw'), 'drawing studio'],
    cats.colour && ['🖍️', 'Colour', () => L.go('colouring'), 'colouring pages'],
    cats.explore && ['🌍', 'Explore', () => L.go('explore'), 'nature & world'],
    cats.chess && ['♟️', 'Chess', () => L.go('chess'), 'learn & play'],
    cats.professions && ['🧑‍🚀', 'What Can I Be?', () => L.go('professions'), 'dream cards'],
    ['🏆', 'My Rewards', () => L.go('rewards'), 'your progress'],
    ['🦄', 'Sticker Book', () => L.go('stickers'), 'collect & create']
  ].filter(Boolean);
  items.forEach(([icon, label, fn, sub]) => grid.appendChild(L.bigButton(icon, label, fn, sub)));
  app.appendChild(grid);

  app.appendChild(h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '8px' } },
    h('button', { class: 'btn soft small', onclick: () => L.go('profiles') }, '🔄 Switch player'),
    h('button', { class: 'btn soft small', onclick: () => themePicker() }, '🎨 Theme'),
    holdButton('👨‍👩‍👧 Parents', 2000, () => askPin(() => L.go('parent')))
  ));
  L.speak('Hi ' + p.name + '! What would you like to do?');
});

function themePicker() {
  const p = L.profile();
  overlay(h('div', { class: 'overlay-card' },
    h('h2', { text: 'Pick your world!' }),
    h('div', { class: 'menu-grid' },
      THEMES.map((t) => L.bigButton(t.icon, t.name, () => {
        p.theme = t.id; save(); applyTheme(); overlay(null); L.speak(t.name + '!');
      }))
    ),
    h('button', { class: 'btn secondary', onclick: () => overlay(null) }, 'Close')
  ));
}

/* ---------------- learn menu ---------------- */
L.route('learn', () => {
  const body = L.page('Learn', { speak: 'What would you like to learn? Numbers or letters?', backTo: 'home' });
  const grid = h('div', { class: 'menu-grid' });
  grid.append(
    L.bigButton('🔢', 'Numbers', () => L.go('numeracy'), 'counting & maths'),
    L.bigButton('🔤', 'Letters & Words', () => L.go('literacy'), 'reading & spelling'),
    state.parent.categories.stories ? L.bigButton('📖', 'Stories', () => L.go('stories'), 'read together') : null
  );
  body.appendChild(grid);
});

/* ---------------- explore menu ---------------- */
L.route('explore', () => {
  const body = L.page('Explore', { speak: 'Let’s explore! Nature, our planet, or the world map?', backTo: 'home' });
  const grid = h('div', { class: 'menu-grid' });
  grid.append(
    L.bigButton('🌿', 'Nature & Planet', () => L.go('nature'), 'animals & earth'),
    L.bigButton('🗺️', 'World Discovery', () => L.go('world'), 'maps, flags & capitals'),
    state.parent.categories.stories ? L.bigButton('📖', 'Stories', () => L.go('stories'), 'short tales') : null
  );
  body.appendChild(grid);
});

/* ---------------- play (reward games) ---------------- */
L.route('play', () => {
  const p = L.profile();
  const body = L.page('Play', {
    speak: L.canPlay() ? 'Pick a game to play!' : 'Finish a learning activity to earn a play token!',
    backTo: 'home'
  });
  body.appendChild(h('p', { class: 'center' },
    state.parent.freePlay
      ? h('span', { class: 'pill' }, '🎈 Free play is on')
      : h('span', { class: 'pill' }, `🎟️ Play tokens: ${p.tokens || 0}`)
  ));
  if (!L.canPlay()) {
    body.appendChild(h('div', { class: 'card center' },
      h('p', { style: { fontSize: '2.4rem', margin: '0' } }, '🎟️'),
      h('h2', { text: 'Earn a play token!' }),
      h('p', { text: 'Finish any learning activity to unlock a play session. You can do it!' }),
      h('button', { class: 'btn', onclick: () => L.go('learn') }, '📚 Go learn')
    ));
    return;
  }
  const grid = h('div', { class: 'menu-grid' });
  (window.LamoraGames || []).forEach((g) => {
    grid.appendChild(L.bigButton(g.icon, g.name, () => {
      if (L.startRewardSession()) L.go('game', g.id);
      else L.go('play');
    }, g.sub));
  });
  body.appendChild(grid);
});

/* ---------------- rewards page ---------------- */
L.route('rewards', () => {
  const p = L.profile();
  const rw = L.rewardStyle();
  const body = L.page('My Rewards', { speak: 'Look at everything you have earned!', backTo: 'home' });

  body.appendChild(h('div', { class: 'card center' },
    h('div', { style: { fontSize: '3rem' } }, rw.icon),
    h('h2', {}, `${p.stars} ${rw.name}`),
    h('p', { class: 'muted' }, `🎟️ ${p.tokens || 0} play tokens · 🦄 ${p.stickers.length} stickers`)
  ));

  const skills = [
    ['numeracy', '🔢 Numbers'], ['literacy', '🔤 Letters'], ['memory', '🧠 Memory'],
    ['chess', '♟️ Chess'], ['nature', '🌿 Nature'], ['world', '🗺️ World'], ['stories', '📖 Stories'],
    ['creativity', '🎨 Creativity']
  ];
  const card = h('div', { class: 'card' }, h('h2', { text: 'Skills you practised' }));
  skills.forEach(([key, label]) => {
    const n = p.progress[key] || 0;
    const streak = (p.streaks[key] || {}).count || 0;
    card.appendChild(h('div', { class: 'setting-row' },
      h('span', { class: 'lbl' }, label),
      h('span', {}, `${n} done ${streak > 1 ? `· 🔥 ${streak}-day streak` : ''}`)
    ));
    const bar = h('div', { class: 'bar', style: { marginBottom: '6px' } }, h('i', { style: { width: Math.min(100, n * 10) + '%' } }));
    card.appendChild(bar);
  });
  body.appendChild(card);
  body.appendChild(h('div', { class: 'center' },
    h('button', { class: 'btn', onclick: () => L.go('stickers') }, '🦄 See my stickers')
  ));
});

/* ---------------- parent zone ---------------- */
function toggleRow(label, get, set) {
  const t = h('button', { class: 'toggle', role: 'switch', 'aria-checked': String(!!get()), 'aria-label': label });
  t.addEventListener('click', () => {
    set(!get());
    save();
    t.setAttribute('aria-checked', String(!!get()));
    applyTheme();
  });
  return h('div', { class: 'setting-row' }, h('span', { class: 'lbl' }, label), t);
}

function selectRow(label, options, get, set) {
  const sel = h('select', { 'aria-label': label });
  options.forEach(([val, text]) => sel.appendChild(h('option', { value: val, selected: String(get()) === String(val) ? '' : null }, text)));
  sel.addEventListener('change', () => { set(sel.value); save(); });
  return h('div', { class: 'setting-row' }, h('span', { class: 'lbl' }, label), sel);
}

L.route('parent', () => {
  const body = L.page('Parent Zone', { speak: '', speakOnOpen: false, backTo: 'home' });
  const P = state.parent;

  body.appendChild(h('p', { class: 'small-note' },
    'Everything in Lamora is stored only on this device. There are no accounts, no ads, no tracking and nothing is ever uploaded.'));

  // --- screen time ---
  const time = h('div', { class: 'card' }, h('h2', { text: '⏳ Screen time' }));
  time.append(
    selectRow('Daily time limit', [[10,'10 minutes'],[15,'15 minutes'],[20,'20 minutes'],[30,'30 minutes'],[45,'45 minutes'],[60,'60 minutes'],[90,'90 minutes'],[9999,'No limit today']],
      () => P.dailyLimitMin, (v) => { P.dailyLimitMin = +v; warned5 = warned1 = false; }),
    selectRow('Session reminder after', [[10,'10 minutes'],[15,'15 minutes'],[20,'20 minutes'],[30,'30 minutes'],[45,'45 minutes']],
      () => P.sessionLimitMin, (v) => P.sessionLimitMin = +v),
    selectRow('Reward game length', [[3,'3 minutes'],[5,'5 minutes'],[8,'8 minutes'],[10,'10 minutes']],
      () => P.rewardMinutes, (v) => P.rewardMinutes = +v),
    h('div', { class: 'setting-row' },
      h('span', { class: 'lbl' }, 'Time used today'),
      h('span', {}, state.profiles.map((pr) => `${pr.name}: ${Math.round(usageFor(pr.id).seconds / 60)} min`).join(' · ')))
  );
  body.appendChild(time);

  // --- learning ---
  const learn = h('div', { class: 'card' }, h('h2', { text: '📚 Learning' }));
  learn.append(
    selectRow('Difficulty', [['age','Match child’s age'],['easy','Easy (5–6)'],['medium','Medium (7–8)'],['hard','Harder (9–10)']],
      () => P.difficulty, (v) => P.difficulty = v),
    selectRow('Reward style', Object.entries(REWARD_STYLES).map(([k, v]) => [k, v.icon + ' ' + v.name]),
      () => P.rewardStyle, (v) => P.rewardStyle = v),
    toggleRow('Free play (no tokens needed)', () => P.freePlay, (v) => P.freePlay = v)
  );
  learn.appendChild(h('h2', { text: 'Sections shown to children', style: { marginTop: '14px' } }));
  const catNames = { learn: '📚 Learn', play: '🎮 Play', memory: '🧠 Memory', draw: '🎨 Draw', colour: '🖍️ Colour', explore: '🌍 Explore', chess: '♟️ Chess', professions: '🧑‍🚀 What Can I Be?', stories: '📖 Stories' };
  Object.keys(catNames).forEach((c) => learn.appendChild(toggleRow(catNames[c], () => P.categories[c], (v) => P.categories[c] = v)));
  body.appendChild(learn);

  // --- sound & accessibility ---
  const acc = h('div', { class: 'card' }, h('h2', { text: '🔊 Sound & accessibility' }));
  acc.append(
    toggleRow('Sounds', () => P.sound, (v) => { P.sound = v; syncMusic(); }),
    toggleRow('Spoken instructions', () => P.speech, (v) => P.speech = v),
    toggleRow('Background music', () => P.music, (v) => { P.music = v; syncMusic(); }),
    toggleRow('Large text', () => P.largeText, (v) => P.largeText = v),
    toggleRow('High contrast', () => P.highContrast, (v) => P.highContrast = v),
    toggleRow('Reduced motion', () => P.reducedMotion, (v) => P.reducedMotion = v)
  );
  body.appendChild(acc);

  // --- profiles ---
  const prof = h('div', { class: 'card' }, h('h2', { text: '👧 Child profiles' }));
  state.profiles.forEach((pr) => {
    prof.appendChild(h('div', { class: 'setting-row' },
      h('span', { class: 'lbl' }, `${pr.avatar} ${pr.name} (${pr.age})`),
      h('span', { class: 'row' },
        h('button', { class: 'btn soft small', onclick: () => editProfile(pr) }, 'Edit'),
        h('button', { class: 'btn soft small', onclick: async () => {
          if (await L.confirmDialog('Reset rewards?', `Set ${pr.name}'s stars, tokens and stickers back to zero?`, 'Reset')) {
            pr.stars = 0; pr.tokens = 0; pr.stickers = []; pr.progress = {}; pr.streaks = {}; save(); render();
          }
        } }, 'Reset rewards'),
        state.profiles.length > 1 ? h('button', { class: 'btn danger small', onclick: async () => {
          if (await L.confirmDialog('Delete profile?', `Delete ${pr.name} and all their local progress? This cannot be undone.`, 'Delete')) {
            state.profiles = state.profiles.filter((x) => x.id !== pr.id);
            if (state.activeProfileId === pr.id) state.activeProfileId = state.profiles[0].id;
            delete state.usage[pr.id];
            save(); render();
          }
        } }, 'Delete') : null
      )
    ));
  });
  prof.appendChild(h('button', { class: 'btn', onclick: () => editProfile(null) }, '➕ Add child'));
  body.appendChild(prof);

  // --- data ---
  const data = h('div', { class: 'card' }, h('h2', { text: '🔒 Data & privacy' }));
  data.append(
    h('p', { class: 'small-note', text: 'All progress, drawings and photos stay on this device. Export creates a simple text summary you can save or print.' }),
    h('div', { class: 'row' },
      h('button', { class: 'btn secondary', onclick: exportProgress }, '📄 Export progress summary'),
      h('button', { class: 'btn secondary', onclick: () => setNewPin(() => {}) }, '🔑 Change PIN'),
      h('button', { class: 'btn danger', onclick: async () => {
        if (await L.confirmDialog('Delete ALL data?', 'This erases every profile, drawing, photo and setting on this device. It cannot be undone.', 'Delete everything')) {
          localStorage.removeItem(STORE_KEY);
          location.reload();
        }
      } }, '🗑️ Delete all data')
    )
  );
  body.appendChild(data);

  body.appendChild(h('div', { class: 'center', style: { marginTop: '10px' } },
    h('button', { class: 'btn', onclick: () => L.go('home') }, '✅ Done — back to Lamora')
  ));
});

function editProfile(pr) {
  const isNew = !pr;
  if (isNew) pr = newProfile('', 6);
  const nameIn = h('input', { type: 'text', value: pr.name, maxlength: '14', 'aria-label': 'Name or nickname', placeholder: 'Name or nickname' });
  const ageSel = h('select', { 'aria-label': 'Age' });
  for (let a = 5; a <= 10; a++) ageSel.appendChild(h('option', { value: a, selected: pr.age === a ? '' : null }, String(a)));
  let avatar = pr.avatar;
  const avatarWrap = h('div', { class: 'row', style: { justifyContent: 'center' } });
  AVATARS.forEach((av) => {
    const b = h('button', { class: 'tool-btn' + (av === avatar ? ' on' : ''), 'aria-label': 'avatar ' + av, onclick: () => {
      avatar = av;
      avatarWrap.querySelectorAll('.tool-btn').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
    } }, av);
    avatarWrap.appendChild(b);
  });
  overlay(h('div', { class: 'overlay-card' },
    h('h2', { text: isNew ? 'New child' : 'Edit ' + pr.name }),
    h('div', { class: 'stack' },
      nameIn,
      h('label', {}, 'Age: ', ageSel),
      avatarWrap
    ),
    h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '12px' } },
      h('button', { class: 'btn secondary', onclick: () => overlay(null) }, 'Cancel'),
      h('button', { class: 'btn', onclick: () => {
        const nm = nameIn.value.trim();
        if (!nm) { toast('Please add a name or nickname'); return; }
        pr.name = nm; pr.age = +ageSel.value; pr.avatar = avatar;
        if (isNew) state.profiles.push(pr);
        save(); overlay(null); render();
      } }, 'Save')
    )
  ));
}

function exportProgress() {
  const lines = ['Lamora — progress summary', 'Date: ' + L.todayKey(), ''];
  state.profiles.forEach((p) => {
    lines.push(`${p.name} (age ${p.age})`);
    lines.push(`  ${L.rewardStyle().name}: ${p.stars} · Stickers: ${p.stickers.length} · Play tokens: ${p.tokens || 0}`);
    const prog = Object.entries(p.progress);
    if (prog.length) prog.forEach(([k, v]) => lines.push(`  ${k}: ${v} activities completed`));
    else lines.push('  No activities completed yet.');
    lines.push('');
  });
  lines.push('All data is stored only on this device. — Lamora');
  const url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
  L.download('lamora-progress.txt', url);
  toast('Progress summary downloaded 📄');
}

/* ---------------- service worker + updates ---------------- */
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  navigator.serviceWorker.register('service-worker.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          toast('✨ A new version of Lamora is ready — close and reopen to update.', 5000);
        }
      });
    });
  }).catch(() => { /* offline or unsupported — the app still works */ });
}

/* ---------------- boot ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  applyTheme();
  registerSW();
  // unlock audio on first interaction (required by mobile browsers)
  const unlock = () => { window.LamoraSounds.unlock(); document.removeEventListener('pointerdown', unlock); };
  document.addEventListener('pointerdown', unlock);
  if (!location.hash) location.hash = '#/home';
  render();
});

})();
