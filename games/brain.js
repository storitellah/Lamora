/* Lamora — Brain booster games & the Memory Gym.
   The same engines power the reward games (Play) and the
   star-earning Memory Gym activities. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

const ICON_SETS = {
  animals: ['🐱', '🐶', '🐸', '🦁', '🐼', '🦊', '🐢', '🦉', '🐙', '🦋'],
  fruit: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍒', '🍍', '🥝'],
  space: ['🚀', '🪐', '⭐', '🌙', '☀️', '👩‍🚀', '🛸', '☄️'],
  sea: ['🐬', '🐠', '🦀', '🐚', '🐳', '🦈', '🐙', '🧜‍♀️']
};

function diffFor(level) {
  if (level === 'easy') return 0;
  if (level === 'medium') return 1;
  if (level === 'hard') return 2;
  const band = L.ageBand(); // adaptive
  return band === 'young' ? 0 : band === 'mid' ? 1 : 2;
}

/* ============ generic: memory pairs board (reused by Nature & World) ============ */
L.memoryPairs = function (opts) {
  const body = L.page(opts.title || '🃏 Memory Match', { speak: opts.speak || 'Find the matching pairs!', backTo: opts.backTo || 'play' });
  const icons = L.sample(opts.icons, opts.pairs);
  const cards = L.shuffle(icons.concat(icons)).map((icon, i) => ({ icon, i, up: false, matched: false }));
  const cols = opts.cols || (opts.pairs <= 4 ? 4 : opts.pairs <= 6 ? 4 : 5);
  let first = null, lock = false, moves = 0, matched = 0;

  const msg = h('div', { class: 'chess-msg', 'aria-live': 'polite' }, 'Tap two cards to find a pair!');
  const grid = h('div', { class: 'mem-grid', style: { gridTemplateColumns: `repeat(${cols}, 1fr)` } });
  body.append(msg, grid);

  cards.forEach((card) => {
    const btn = h('button', { class: 'mem-card', 'aria-label': 'hidden card' }, h('span', { class: 'back-icon' }, '❔'));
    card.el = btn;
    btn.addEventListener('click', () => {
      if (lock || card.up || card.matched) return;
      L.sfx('flip');
      card.up = true;
      btn.classList.add('up');
      btn.textContent = card.icon;
      btn.setAttribute('aria-label', 'card showing ' + card.icon);
      if (!first) { first = card; return; }
      moves++;
      if (first.icon === card.icon) {
        card.matched = first.matched = true;
        card.el.classList.add('matched'); first.el.classList.add('matched');
        matched++;
        L.sfx('correct');
        msg.textContent = L.pick(['A pair! 🎉', 'Great memory! ⭐', 'You found it! 💛']);
        first = null;
        if (matched === icons.length) {
          L.sfx('win');
          setTimeout(() => opts.onWin(moves), 600);
        }
      } else {
        lock = true;
        msg.textContent = 'Not a pair — remember where they are!';
        const a = first, b = card;
        first = null;
        setTimeout(() => {
          [a, b].forEach((c) => { c.up = false; c.el.classList.remove('up'); c.el.textContent = ''; c.el.appendChild(h('span', { class: 'back-icon' }, '❔')); c.el.setAttribute('aria-label', 'hidden card'); });
          lock = false;
        }, 900);
      }
    });
    grid.appendChild(btn);
  });
};

/* ============ generic: Simon sequence (colour / sound memory) ============ */
function simonGame(opts) {
  const body = L.page(opts.title, { speak: 'Watch and listen, then copy the pattern!', backTo: opts.backTo });
  const PADS = [
    { c: '#e17055', icon: '🍊' }, { c: '#0984e3', icon: '💧' },
    { c: '#fdcb6e', icon: '⭐' }, { c: '#00b894', icon: '🍀' }
  ];
  const msg = h('div', { class: 'chess-msg', 'aria-live': 'polite' }, 'Watch carefully…');
  const grid = h('div', { class: 'simon-grid' });
  body.append(msg, grid);

  let seq = [], pos = 0, playing = true;
  const target = opts.target;
  const padEls = PADS.map((p, i) => {
    const el = h('button', { class: 'simon-pad', style: { background: p.c }, 'aria-label': 'pad ' + (i + 1) }, p.icon);
    el.addEventListener('click', () => tap(i));
    grid.appendChild(el);
    return el;
  });

  function light(i, dur) {
    padEls[i].classList.add('lit');
    L.sfx('note', i);
    setTimeout(() => padEls[i].classList.remove('lit'), dur || 380);
  }

  let timers = [];
  L.onLeave(() => timers.forEach(clearTimeout));

  function playback() {
    playing = true;
    pos = 0;
    msg.textContent = `Watch carefully… (${seq.length} of ${target})`;
    seq.forEach((v, i) => timers.push(setTimeout(() => light(v), 700 * (i + 1))));
    timers.push(setTimeout(() => { playing = false; msg.textContent = 'Your turn! Copy the pattern.'; L.speak('Your turn!'); }, 700 * (seq.length + 1)));
  }

  function tap(i) {
    if (playing) return;
    light(i, 220);
    if (i === seq[pos]) {
      pos++;
      if (pos === seq.length) {
        if (seq.length >= target) {
          msg.textContent = 'You did the whole pattern! 🌟';
          L.sfx('win');
          setTimeout(() => opts.onWin(seq.length), 700);
        } else {
          msg.textContent = 'Yes! Get ready for one more…';
          L.sfx('correct');
          timers.push(setTimeout(nextRound, 1000));
        }
      }
    } else {
      L.sfx('wrong');
      msg.textContent = 'Almost! Watch one more time — you can do it!';
      timers.push(setTimeout(playback, 1200));
    }
  }

  function nextRound() { seq.push(L.rand(0, 3)); playback(); }
  nextRound();
}

/* ============ memorize-then-answer helper ============ */
function memorizeThen(opts) {
  const body = L.page(opts.title, { speak: opts.intro, backTo: opts.backTo });
  const card = h('div', { class: 'card center' },
    h('p', { class: 'quiz-prompt' }, 'Remember these!'),
    h('div', { class: 'quiz-visual' }, opts.show),
    h('p', { class: 'hint-box' }, `You have ${opts.seconds} seconds…`)
  );
  body.appendChild(card);
  const t = setTimeout(() => opts.then(), opts.seconds * 1000);
  L.onLeave(() => clearTimeout(t));
}

/* ============ individual games ============ */

function gameMemoryMatch(gym) {
  const d = diffFor(gym ? gym.level : 'adaptive');
  L.memoryPairs({
    icons: ICON_SETS[L.pick(Object.keys(ICON_SETS))],
    pairs: [4, 6, 8][d],
    backTo: gym ? 'memorygym' : 'play',
    onWin: () => finish(gym, 'You matched every pair!', 3 + d, () => gameMemoryMatch(gym))
  });
}

function gameSimon(gym) {
  const d = diffFor(gym ? gym.level : 'adaptive');
  simonGame({
    title: '🎼 Copy the Pattern',
    target: [3, 5, 7][d],
    backTo: gym ? 'memorygym' : 'play',
    onWin: () => finish(gym, 'What a memory!', 3 + d, () => gameSimon(gym))
  });
}

function gameOddOneOut(gym) {
  const groups = [
    [['🍎', '🍌', '🍇'], '🚗', 'fruit'], [['🐶', '🐱', '🐰'], '🌳', 'animals'],
    [['🚗', '🚌', '🚲'], '🍰', 'things that go'], [['⭐', '🌙', '☀️'], '🐟', 'things in the sky'],
    [['👟', '🧦', '🥾'], '🍕', 'things for feet'], [['🌹', '🌻', '🌷'], '🦈', 'flowers'],
    [['🥕', '🥦', '🌽'], '⚽', 'vegetables'], [['✏️', '🖍️', '🖊️'], '🐸', 'things that write']
  ];
  const qs = L.sample(groups, 6).map(([same, odd, category]) => {
    const items = L.shuffle(same.concat(odd));
    return {
      prompt: 'Tap the odd one out!',
      speak: 'One of these does not belong. Tap the odd one out!',
      options: items, answer: items.indexOf(odd),
      hint: `Most of these are ${category}.`,
      explain: `${odd} is not one of the ${category}.`
    };
  });
  runGameQuiz(gym, '🔍 Odd One Out', qs, () => gameOddOneOut(gym));
}

function gameQuickCount(gym) {
  const d = diffFor(gym ? gym.level : 'adaptive');
  const count = L.rand(3 + d * 2, 5 + d * 3);
  const icon = L.pick(ICON_SETS.fruit);
  memorizeThen({
    title: '⚡ Quick Counting',
    intro: 'Count the things before they hide!',
    show: icon.repeat(count),
    seconds: Math.max(2, 5 - d),
    backTo: gym ? 'memorygym' : 'play',
    then: () => {
      const opts = new Set([count]);
      while (opts.size < 4) opts.add(Math.max(1, count + L.rand(-2, 2)));
      const list = L.shuffle([...opts]);
      runGameQuiz(gym, '⚡ Quick Counting', [{
        prompt: 'How many did you see?',
        speak: 'How many did you see?',
        options: list, answer: list.indexOf(count),
        hint: 'Picture them in your mind.',
        explain: `There were ${count}.`
      }], () => gameQuickCount(gym));
    }
  });
}

function gameShadow(gym) {
  const all = ICON_SETS.animals.concat(ICON_SETS.sea);
  const qs = Array.from({ length: 6 }, () => {
    const target = L.pick(all);
    const opts = L.shuffle(L.sample(all.filter((x) => x !== target), 3).concat(target));
    return {
      prompt: 'Whose shadow is this?',
      speak: 'Look at the shadow. Who is it?',
      visual: target,
      visualFilter: 'brightness(0)',
      options: opts, answer: opts.indexOf(target),
      hint: 'Look at the shape of the shadow.',
      explain: `The shadow belongs to ${target}!`
    };
  });
  runGameQuiz(gym, '👤 Shadow Match', qs, () => gameShadow(gym));
}

function gameVisualSearch(gym) {
  const d = diffFor(gym ? gym.level : 'adaptive');
  const pairsPool = [['🐱', '🐯'], ['🌕', '🌝'], ['🐦', '🐤'], ['⭐', '🌟'], ['🍏', '🍎'], ['🐢', '🐸']];
  let round = 0, found = 0;
  function next() {
    if (round >= 4) { finish(gym, `You found ${found} hidden friends!`, 2 + d, () => gameVisualSearch(gym)); return; }
    round++;
    const [common, odd] = L.pick(pairsPool);
    const size = 16 + d * 9;
    const oddAt = L.rand(0, size - 1);
    const body = L.page('🕵️ Find the Hidden One', { speak: `Find the one that is different! Round ${round}.`, backTo: gym ? 'memorygym' : 'play', speakOnOpen: round === 1 });
    const msg = h('div', { class: 'chess-msg' }, `Find the ${odd} hiding with the ${common}s! (round ${round} of 4)`);
    const grid = h('div', { class: 'mem-grid', style: { gridTemplateColumns: `repeat(${d === 2 ? 5 : 4}, 1fr)`, maxWidth: '480px' } });
    for (let i = 0; i < size; i++) {
      const isOdd = i === oddAt;
      const b = h('button', { class: 'mem-card up', style: { aspectRatio: '1', fontSize: '1.7rem' }, 'aria-label': isOdd ? 'different one' : 'same one' }, isOdd ? odd : common);
      b.addEventListener('click', () => {
        if (isOdd) { L.sfx('correct'); found++; msg.textContent = 'You found it! 🎉'; setTimeout(next, 700); }
        else { L.sfx('wrong'); msg.textContent = 'Keep looking — one is a tiny bit different!'; }
      });
      grid.appendChild(b);
    }
    body.append(msg, grid);
  }
  next();
}

function gameSortOrder(gym) {
  const d = diffFor(gym ? gym.level : 'adaptive');
  let round = 0, slips = 0;
  function next() {
    if (round >= 4) { finish(gym, 'Everything in order — super sorting!', Math.max(2, 4 + d - slips), () => gameSortOrder(gym)); return; }
    round++;
    const nums = L.sample([...Array(d === 0 ? 10 : 30).keys()].map((x) => x + 1), 4 + d);
    const sorted = nums.slice().sort((a, b) => a - b);
    let need = 0;
    const body = L.page('📶 Sorting Challenge', { speak: 'Tap the numbers from smallest to biggest!', backTo: gym ? 'memorygym' : 'play', speakOnOpen: round === 1 });
    const msg = h('div', { class: 'chess-msg' }, `Tap smallest → biggest! (round ${round} of 4)`);
    const grid = h('div', { class: 'quiz-options' });
    nums.forEach((n) => {
      const b = h('button', { class: 'option-btn' }, String(n));
      b.addEventListener('click', () => {
        if (b.disabled) return;
        if (n === sorted[need]) {
          need++; b.disabled = true; b.classList.add('correct'); L.sfx('pop');
          if (need === sorted.length) { L.sfx('correct'); msg.textContent = 'Perfect order! 🎉'; setTimeout(next, 700); }
        } else { slips++; b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 450); L.sfx('wrong'); msg.textContent = `Look for the smallest number that is left!`; }
      });
      grid.appendChild(b);
    });
    body.append(msg, h('div', { class: 'card' }, grid));
  }
  next();
}

function gameMaze(gym) {
  const d = diffFor(gym ? gym.level : 'adaptive');
  const size = [7, 9, 11][d]; // odd sizes for wall-carving
  // generate maze: grid of walls (1) and paths (0), carve with DFS
  const g = Array.from({ length: size }, () => Array(size).fill(1));
  function carve(x, y) {
    g[y][x] = 0;
    L.shuffle([[2, 0], [-2, 0], [0, 2], [0, -2]]).forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && ny > 0 && nx < size - 1 && ny < size - 1 && g[ny][nx] === 1) {
        g[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    });
  }
  carve(1, 1);
  let px = 1, py = 1;
  const gx = size - 2, gy = size - 2;
  g[gy][gx] = 0;

  const body = L.page('🌀 Maze', { speak: 'Help the mouse find the cheese! Tap next to the mouse to move.', backTo: gym ? 'memorygym' : 'play' });
  const msg = h('div', { class: 'chess-msg' }, 'Get the 🐭 to the 🧀!');
  const grid = h('div', { class: 'mem-grid', style: { gridTemplateColumns: `repeat(${size}, 1fr)`, gap: '2px', maxWidth: '440px' } });
  body.append(msg, grid);

  const cells = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const cell = h('button', {
      class: 'mem-card up',
      style: { aspectRatio: '1', fontSize: '1.05rem', borderRadius: '6px', background: g[y][x] ? '#5e548e' : '#fff', boxShadow: 'none' },
      'aria-label': g[y][x] ? 'wall' : 'path'
    });
    cell.addEventListener('click', () => tryMove(x, y));
    cells.push(cell);
    grid.appendChild(cell);
  }
  function draw() {
    cells.forEach((c, i) => {
      const x = i % size, y = (i / size) | 0;
      c.textContent = x === px && y === py ? '🐭' : (x === gx && y === gy ? '🧀' : '');
    });
  }
  function tryMove(x, y) {
    if (g[y] && g[y][x] === 0 && Math.abs(x - px) + Math.abs(y - py) === 1) {
      px = x; py = y; L.sfx('tap'); draw();
      if (px === gx && py === gy) {
        L.sfx('win');
        finish(gym, 'The mouse found the cheese!', 2 + d, () => gameMaze(gym));
      }
    }
  }
  const keyHandler = (e) => {
    const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    if (map[e.key]) { e.preventDefault(); tryMove(px + map[e.key][0], py + map[e.key][1]); }
  };
  document.addEventListener('keydown', keyHandler);
  L.onLeave(() => document.removeEventListener('keydown', keyHandler));
  draw();
}

function gameSpotDifference(gym) {
  let round = 0;
  function next() {
    if (round >= 4) { finish(gym, 'Eagle eyes! You spotted them all!', 3, () => gameSpotDifference(gym)); return; }
    round++;
    const icons = L.sample(ICON_SETS.animals.concat(ICON_SETS.fruit), 9);
    const changed = icons.slice();
    const at = L.rand(0, 8);
    const pool = ICON_SETS.space.filter((x) => !icons.includes(x));
    changed[at] = L.pick(pool);
    const body = L.page('👀 Spot the Difference', { speak: 'One picture changed in the second box. Tap it!', backTo: gym ? 'memorygym' : 'play', speakOnOpen: round === 1 });
    const msg = h('div', { class: 'chess-msg' }, `Which one changed? (round ${round} of 4)`);
    const make = (arr, clickable) => {
      const grd = h('div', { class: 'mem-grid', style: { gridTemplateColumns: 'repeat(3,1fr)', maxWidth: '300px', margin: '8px auto' } });
      arr.forEach((ic, i) => {
        const b = h('button', { class: 'mem-card up', style: { aspectRatio: '1', fontSize: '1.8rem' }, 'aria-label': clickable ? 'picture ' + ic : ic, disabled: clickable ? null : '' }, ic);
        if (clickable) b.addEventListener('click', () => {
          if (i === at) { L.sfx('correct'); msg.textContent = 'You spotted it! 🎉'; setTimeout(next, 700); }
          else { L.sfx('wrong'); msg.textContent = 'Compare the two boxes carefully!'; }
        });
        grd.appendChild(b);
      });
      return grd;
    };
    body.append(msg,
      h('p', { class: 'center muted', style: { margin: '4px' } }, 'Before:'), make(icons, false),
      h('p', { class: 'center muted', style: { margin: '4px' } }, 'After — tap the change:'), make(changed, true));
  }
  next();
}

/* ---- memory gym exclusives ---- */

function gymPictureRecall(gym) {
  const d = diffFor(gym.level);
  const shown = L.sample(ICON_SETS.animals.concat(ICON_SETS.sea), 3 + d);
  memorizeThen({
    title: '🖼️ Picture Recall', intro: 'Look at the pictures and remember them!',
    show: shown.join('  '), seconds: Math.max(3, 6 - d), backTo: 'memorygym',
    then: () => {
      const qs = Array.from({ length: 3 }, () => {
        const yes = L.pick(shown);
        const pool = ICON_SETS.fruit.filter((x) => !shown.includes(x));
        const opts = L.shuffle(L.sample(pool, 3).concat(yes));
        return {
          prompt: 'Which one did you see?',
          speak: 'Which of these did you see before?',
          options: opts, answer: opts.indexOf(yes),
          hint: 'Close your eyes and picture them.',
          explain: `${yes} was in the pictures.`
        };
      });
      runGameQuiz(gym, '🖼️ Picture Recall', qs, () => gymPictureRecall(gym));
    }
  });
}

function gymSequenceRecall(gym) {
  const d = diffFor(gym.level);
  const seq = L.sample(ICON_SETS.sea.concat(ICON_SETS.fruit), 3 + d);
  memorizeThen({
    title: '🔢 Order Recall', intro: 'Remember the order they appear in!',
    show: seq.join(' ➡️ '), seconds: Math.max(3, 6 - d), backTo: 'memorygym',
    then: () => {
      const body = L.page('🔢 Order Recall', { speak: 'Now tap them in the same order!', backTo: 'memorygym' });
      const msg = h('div', { class: 'chess-msg' }, 'Tap them in the same order!');
      const grid = h('div', { class: 'quiz-options' });
      let need = 0, slips = 0;
      L.shuffle(seq).forEach((ic) => {
        const b = h('button', { class: 'option-btn', 'aria-label': ic }, ic);
        b.addEventListener('click', () => {
          if (b.disabled) return;
          if (ic === seq[need]) {
            need++; b.disabled = true; b.classList.add('correct'); L.sfx('pop');
            if (need === seq.length) finish(gym, 'You remembered the whole order!', Math.max(2, 4 + d - slips), () => gymSequenceRecall(gym));
          } else { slips++; L.sfx('wrong'); msg.textContent = `Hmm — what came ${['first', 'next', 'after that'][Math.min(need, 2)]}?`; }
        });
        grid.appendChild(b);
      });
      body.append(msg, h('div', { class: 'card' }, grid));
    }
  });
}

function gymNumberRecall(gym) {
  const d = diffFor(gym.level);
  const digits = 3 + d;
  let num = '';
  for (let i = 0; i < digits; i++) num += L.rand(i ? 0 : 1, 9);
  memorizeThen({
    title: '🧮 Number Memory', intro: 'Remember this number!',
    show: num, seconds: Math.max(3, 5 - d), backTo: 'memorygym',
    then: () => {
      const opts = new Set([num]);
      while (opts.size < 4) {
        const arr = num.split('');
        const i = L.rand(0, digits - 1);
        arr[i] = String((Number(arr[i]) + L.rand(1, 8)) % 10);
        opts.add(arr.join(''));
      }
      const list = L.shuffle([...opts]);
      runGameQuiz(gym, '🧮 Number Memory', [{
        prompt: 'Which number did you see?',
        speak: 'Which number did you see?',
        options: list, answer: list.indexOf(num),
        hint: 'Say the number in your head.',
        explain: `The number was ${num}.`
      }], () => gymNumberRecall(gym));
    }
  });
}

function gymWordMemory(gym) {
  const d = diffFor(gym.level);
  const POOL = ['cat', 'sun', 'boat', 'tree', 'star', 'fish', 'cake', 'frog', 'moon', 'bird', 'sock', 'drum'];
  const shown = L.sample(POOL, 3 + d);
  memorizeThen({
    title: '📚 Word Memory', intro: 'Read and remember these words!',
    show: shown.join('   '), seconds: Math.max(4, 7 - d), backTo: 'memorygym',
    then: () => {
      const qs = Array.from({ length: 3 }, () => {
        const yes = L.pick(shown);
        const opts = L.shuffle(L.sample(POOL.filter((x) => !shown.includes(x)), 3).concat(yes));
        return {
          prompt: 'Which word was on the list?',
          speak: 'Which word was on the list?',
          options: opts, answer: opts.indexOf(yes),
          hint: 'Whisper the list to yourself.',
          explain: `"${yes}" was on the list.`
        };
      });
      runGameQuiz(gym, '📚 Word Memory', qs, () => gymWordMemory(gym));
    }
  });
}

function gymLocationMemory(gym) {
  const d = diffFor(gym.level);
  const size = 3 + (d === 2 ? 1 : 0);
  const cellCount = size * size;
  const targets = L.sample([...Array(cellCount).keys()], 2 + d);
  const body = L.page('📍 Where Was It?', { speak: 'Watch where the stars are hiding!', backTo: 'memorygym' });
  const msg = h('div', { class: 'chess-msg' }, 'Watch where the ⭐ hide…');
  const grid = h('div', { class: 'mem-grid', style: { gridTemplateColumns: `repeat(${size},1fr)`, maxWidth: '340px' } });
  body.append(msg, grid);
  let phase = 'show', found = 0, slips = 0;
  const cells = [];
  for (let i = 0; i < cellCount; i++) {
    const b = h('button', { class: 'mem-card up', style: { aspectRatio: '1' }, 'aria-label': 'square ' + (i + 1) }, targets.includes(i) ? '⭐' : '');
    b.addEventListener('click', () => {
      if (phase !== 'guess' || b.disabled) return;
      if (targets.includes(i)) {
        b.textContent = '⭐'; b.classList.add('matched'); b.disabled = true; found++; L.sfx('pop');
        if (found === targets.length) finish(gym, 'You remembered every hiding spot!', Math.max(2, 4 + d - slips), () => gymLocationMemory(gym));
      } else { slips++; L.sfx('wrong'); msg.textContent = 'Not there — picture where the stars were!'; }
    });
    cells.push(b); grid.appendChild(b);
  }
  const t = setTimeout(() => {
    cells.forEach((c) => (c.textContent = ''));
    phase = 'guess';
    msg.textContent = 'Now tap where the ⭐ were!';
    L.speak('Where were the stars? Tap the squares!');
  }, Math.max(2500, 5000 - d * 1000));
  L.onLeave(() => clearTimeout(t));
}

/* ============ shared finish/quiz plumbing ============ */

function finish(gym, message, stars, again) {
  if (gym) {
    L.completeActivity({ skill: 'memory', stars, onAgain: again });
  } else {
    L.sfx('win');
    L.overlay(h('div', { class: 'overlay-card' },
      h('div', { class: 'celebrate-stars' }, '🎉'),
      h('h2', { text: message }),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('button', { class: 'btn secondary', onclick: () => { L.closeOverlay(); L.go('play'); } }, '🎮 More games'),
        h('button', { class: 'btn', onclick: () => { L.closeOverlay(); again(); } }, '🔁 Again')
      )
    ));
  }
}

/* Runs quiz questions inside either a gym activity (stars) or a play game. */
function runGameQuiz(gym, title, questions, again) {
  if (gym) {
    L.runQuiz({ title, skill: 'memory', backTo: 'memorygym', questions, onAgain: again });
  } else {
    // reward-game version: fun only, no stars or tokens are minted here
    L.runQuiz({ title, backTo: 'play', questions, onDone: () => finish(null, 'That was fun!', 0, again) });
  }
}

/* ============ registries & routes ============ */

window.LamoraGames = [
  { id: 'pairs', icon: '🃏', name: 'Memory Match', sub: 'find the pairs', run: () => gameMemoryMatch(null) },
  { id: 'simon', icon: '🎼', name: 'Copy the Pattern', sub: 'watch & repeat', run: () => gameSimon(null) },
  { id: 'odd', icon: '🔍', name: 'Odd One Out', sub: 'who doesn’t belong?', run: () => gameOddOneOut(null) },
  { id: 'count', icon: '⚡', name: 'Quick Counting', sub: 'count fast!', run: () => gameQuickCount(null) },
  { id: 'shadow', icon: '👤', name: 'Shadow Match', sub: 'guess the shadow', run: () => gameShadow(null) },
  { id: 'search', icon: '🕵️', name: 'Hidden One', sub: 'visual search', run: () => gameVisualSearch(null) },
  { id: 'sort', icon: '📶', name: 'Sorting Challenge', sub: 'smallest to biggest', run: () => gameSortOrder(null) },
  { id: 'maze', icon: '🌀', name: 'Maze', sub: 'mouse & cheese', run: () => gameMaze(null) },
  { id: 'spot', icon: '👀', name: 'Spot the Difference', sub: 'what changed?', run: () => gameSpotDifference(null) }
];

L.route('game', (id) => {
  const g = window.LamoraGames.find((x) => x.id === id);
  if (!g) { L.go('play'); return; }
  g.run();
});

const GYM = [
  { id: 'pairs', icon: '🃏', name: 'Matching Pairs', run: (lv) => gameMemoryMatch({ level: lv }) },
  { id: 'picture', icon: '🖼️', name: 'Picture Recall', run: (lv) => gymPictureRecall({ level: lv }) },
  { id: 'order', icon: '🔢', name: 'Order Recall', run: (lv) => gymSequenceRecall({ level: lv }) },
  { id: 'colour', icon: '🎼', name: 'Colour & Sound', run: (lv) => gameSimon({ level: lv }) },
  { id: 'number', icon: '🧮', name: 'Number Memory', run: (lv) => gymNumberRecall({ level: lv }) },
  { id: 'word', icon: '📚', name: 'Word Memory', run: (lv) => gymWordMemory({ level: lv }) },
  { id: 'where', icon: '📍', name: 'Where Was It?', run: (lv) => gymLocationMemory({ level: lv }) }
];

L.route('memorygym', (id, level) => {
  if (id) {
    const gact = GYM.find((x) => x.id === id);
    if (gact) {
      if (!level) {
        const body = L.page(gact.icon + ' ' + gact.name, { speak: 'How tricky should it be?', backTo: 'memorygym' });
        const grid = h('div', { class: 'menu-grid' });
        [['easy', '🌱', 'Easy'], ['medium', '🌼', 'Medium'], ['hard', '🌟', 'Hard'], ['adaptive', '🪄', 'Just Right']]
          .forEach(([lv, ic, nm]) => grid.appendChild(L.bigButton(ic, nm, () => L.go('memorygym', gact.id, lv))));
        body.appendChild(grid);
        return;
      }
      gact.run(level);
      return;
    }
  }
  const body = L.page('Memory Gym', { speak: 'Welcome to the Memory Gym! Pick an exercise for your brain!', backTo: 'home' });
  body.appendChild(h('p', { class: 'center' }, h('span', { class: 'pill' }, '🧠 Every exercise earns rewards!')));
  const grid = h('div', { class: 'menu-grid' });
  GYM.forEach((gact) => grid.appendChild(L.bigButton(gact.icon, gact.name, () => L.go('memorygym', gact.id))));
  body.appendChild(grid);
});
})();
