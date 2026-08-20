/* Lamora — Code! Gentle first steps in coding for children.
   • Robot Path: build a little program (a sequence of move commands) to
     guide the robot to the star. Teaches sequencing and algorithms.
   • Step by Step: put the steps of a task in the right order. Teaches
     that programs are ordered instructions.
   No text coding required — everything is tap-and-build. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

/* '.' empty · '#' wall · 'R' robot start · 'G' goal (the star) */
const LEVELS = [
  ['R.G'],
  ['R..',
   '.#.',
   '..G'],
  ['R....',
   '.###.',
   '.....',
   '.###.',
   '....G'],
  ['R.#..',
   '..#..',
   '..#.G',
   '....#',
   '##...'],
  ['R.....',
   '#####.',
   '......',
   '.#####',
   '......',
   '####.G']
];

const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const ARROW = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };

function parseLevel(rows) {
  const grid = rows.map((r) => r.split(''));
  let start, goal;
  grid.forEach((row, r) => row.forEach((c, k) => {
    if (c === 'R') start = [r, k];
    if (c === 'G') goal = [r, k];
  }));
  return { grid, start, goal, rows: grid.length, cols: grid[0].length };
}

/* Breadth-first search for a shortest command list — powers "Show me". */
function solve(level) {
  const { grid, start, goal, rows, cols } = level;
  const key = (r, c) => r + ',' + c;
  const seen = new Set([key(start[0], start[1])]);
  let q = [{ r: start[0], c: start[1], path: [] }];
  while (q.length) {
    const cur = q.shift();
    if (cur.r === goal[0] && cur.c === goal[1]) return cur.path;
    for (const d in DIRS) {
      const nr = cur.r + DIRS[d][0], nc = cur.c + DIRS[d][1];
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (grid[nr][nc] === '#') continue;
      if (seen.has(key(nr, nc))) continue;
      seen.add(key(nr, nc));
      q.push({ r: nr, c: nc, path: cur.path.concat(d) });
    }
  }
  return null;
}

function robotLevel(idx) {
  idx = Math.max(0, Math.min(LEVELS.length - 1, Number(idx) || 0));
  const level = parseLevel(LEVELS[idx]);
  const program = [];
  let running = false;

  const body = L.page(`🤖 Robot Path — Level ${idx + 1}`, {
    speak: 'Build a program with the arrows to guide the robot to the star, then press Play!',
    backTo: 'code'
  });
  const msg = h('div', { class: 'chess-msg', 'aria-live': 'polite' }, 'Add arrows, then press ▶️ Play!');
  const board = h('div', { class: 'code-board', style: { gridTemplateColumns: `repeat(${level.cols}, 1fr)` } });
  const cells = [];
  for (let r = 0; r < level.rows; r++) for (let c = 0; c < level.cols; c++) {
    const type = level.grid[r][c];
    const cell = h('div', {
      class: 'code-cell' + (type === '#' ? ' wall' : '') + (type === 'G' ? ' goal' : ''),
      'aria-label': type === '#' ? 'wall' : type === 'G' ? 'star' : 'path'
    }, type === 'G' ? '⭐' : '');
    cells.push(cell);
    board.appendChild(cell);
  }
  const at = (r, c) => cells[r * level.cols + c];
  let robot = level.start.slice();
  function drawRobot() {
    cells.forEach((cell, i) => {
      const r = Math.floor(i / level.cols), c = i % level.cols;
      const isGoal = level.grid[r][c] === 'G';
      cell.textContent = (r === robot[0] && c === robot[1]) ? '🤖' : (isGoal ? '⭐' : '');
    });
  }

  const tray = h('div', { class: 'code-tray', 'aria-label': 'your program' });
  function drawTray() {
    tray.innerHTML = '';
    if (!program.length) { tray.appendChild(h('span', { class: 'small-note' }, 'Your program is empty. Tap arrows below!')); return; }
    program.forEach((d, i) => {
      const t = h('button', { class: 'code-token', 'aria-label': 'step ' + (i + 1) + ' ' + d + ', tap to remove' }, ARROW[d]);
      t.addEventListener('click', () => { if (running) return; program.splice(i, 1); drawTray(); });
      tray.appendChild(t);
    });
  }

  const palette = h('div', { class: 'code-palette' },
    ['up', 'left', 'right', 'down'].map((d) =>
      h('button', { class: 'code-token', 'aria-label': 'add ' + d, onclick: () => { if (running) return; program.push(d); L.sfx('tap'); drawTray(); } }, ARROW[d]))
  );

  function run() {
    if (running || !program.length) return;
    running = true;
    robot = level.start.slice();
    drawRobot();
    let i = 0;
    const timers = [];
    L.onLeave(() => timers.forEach(clearTimeout));
    const step = () => {
      if (i >= program.length) { finishRun(false); return; }
      const [dr, dc] = DIRS[program[i]];
      const nr = robot[0] + dr, nc = robot[1] + dc;
      if (nr < 0 || nc < 0 || nr >= level.rows || nc >= level.cols || level.grid[nr][nc] === '#') {
        L.sfx('wrong');
        msg.textContent = 'Oops! The robot bumped into something. Fix the steps and try again!';
        running = false;
        return;
      }
      robot = [nr, nc];
      L.sfx('move');
      drawRobot();
      i++;
      if (robot[0] === level.goal[0] && robot[1] === level.goal[1]) { finishRun(true); return; }
      timers.push(setTimeout(step, 420));
    };
    timers.push(setTimeout(step, 300));
  }

  function finishRun(won) {
    running = false;
    if (won) {
      L.sfx('win');
      msg.textContent = 'You did it! The robot reached the star! 🎉';
      const p = L.profile();
      const stars = Math.max(2, 5 - Math.max(0, program.length - (solve(level) || []).length));
      L.completeActivity({
        skill: 'coding', stars,
        onAgain: idx + 1 < LEVELS.length ? () => L.go('code', 'robot', idx + 1) : () => L.go('code', 'robot', idx)
      });
    } else {
      msg.textContent = 'Almost! The robot ran out of steps. Add more arrows and try again!';
    }
  }

  const controls = h('div', { class: 'row', style: { justifyContent: 'center' } },
    h('button', { class: 'btn', onclick: run }, '▶️ Play'),
    h('button', { class: 'btn soft', onclick: () => { if (running) return; program.length = 0; robot = level.start.slice(); drawRobot(); drawTray(); msg.textContent = 'Cleared! Build a new program.'; } }, '🧹 Clear'),
    h('button', { class: 'btn soft', onclick: () => {
      if (running) return;
      const sol = solve(level);
      if (sol) { program.length = 0; sol.forEach((d) => program.push(d)); drawTray(); msg.textContent = 'Here is one way — press ▶️ Play to watch!'; }
    } }, '💡 Show me')
  );

  body.append(msg, board, h('p', { class: 'small-note center' }, 'Your program:'), tray, palette, controls);
  drawRobot();
  drawTray();
}

/* ---- Step by Step: order the instructions of an everyday task ---- */
const ROUTINES = [
  { name: 'Brush your teeth', steps: [['🪥', 'Put paste on the brush'], ['💧', 'Wet the brush'], ['😬', 'Brush all your teeth'], ['🫗', 'Rinse with water'], ['😁', 'Big clean smile!']] },
  { name: 'Make a sandwich', steps: [['🍞', 'Take two slices of bread'], ['🧈', 'Spread the filling'], ['🥪', 'Put the slices together'], ['🔪', 'Cut it in half'], ['😋', 'Eat it up!']] },
  { name: 'Get ready for school', steps: [['⏰', 'Wake up'], ['👕', 'Get dressed'], ['🥣', 'Eat breakfast'], ['🎒', 'Pack your bag'], ['🚪', 'Off you go!']] },
  { name: 'Plant a seed', steps: [['🕳️', 'Dig a hole'], ['🌰', 'Drop in the seed'], ['🪴', 'Cover with soil'], ['💧', 'Water it'], ['🌻', 'Watch it grow!']] }
];

function stepByStep() {
  const routine = L.pick(ROUTINES);
  const steps = routine.steps;
  const body = L.page('🧩 Step by Step', { speak: 'A program is a list of steps in the right order. Put these in order!', backTo: 'code' });
  const msg = h('div', { class: 'chess-msg' }, `Put "${routine.name}" in the right order!`);
  const stage = h('div', { class: 'quiz-visual', 'aria-live': 'polite' }, '🔢');
  const grid = h('div', { class: 'quiz-options' });
  body.append(msg, stage, h('div', { class: 'card' }, grid));
  let need = 0, slips = 0;
  const doneIcons = [];
  L.shuffle(steps).forEach(([icon, label]) => {
    const b = h('button', { class: 'option-btn', 'aria-label': label, style: { fontSize: '1.02rem' } }, icon + ' ' + label);
    b.addEventListener('click', () => {
      if (b.disabled) return;
      if (label === steps[need][1]) {
        b.disabled = true; b.classList.add('correct'); L.sfx('pop');
        doneIcons.push(icon); stage.textContent = doneIcons.join(' → ');
        need++;
        msg.textContent = need < steps.length ? 'Yes! What comes next?' : 'Perfect program! 🎉';
        if (need === steps.length) L.completeActivity({ skill: 'coding', stars: Math.max(2, 4 - slips), onAgain: stepByStep });
      } else {
        slips++; L.sfx('wrong');
        b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 450);
        msg.textContent = 'Hmm — what would you really do first?';
      }
    });
    grid.appendChild(b);
  });
}

L.route('code', (section, arg) => {
  if (section === 'robot') { robotLevel(arg); return; }
  if (section === 'steps') { stepByStep(); return; }
  const body = L.page('Code!', { speak: 'Welcome to coding! Guide the robot, or put steps in order.', backTo: 'home' });
  body.appendChild(h('p', { class: 'center' }, h('span', { class: 'pill' }, '🤖 Coding is just giving clear instructions!')));
  body.appendChild(h('h2', { style: { fontFamily: 'var(--font-display)' } }, '🤖 Robot Path'));
  const rgrid = h('div', { class: 'menu-grid' });
  LEVELS.forEach((_, i) => rgrid.appendChild(L.bigButton('🤖', 'Level ' + (i + 1), () => L.go('code', 'robot', i), i === 0 ? 'start here' : null)));
  body.appendChild(rgrid);
  body.appendChild(h('h2', { style: { fontFamily: 'var(--font-display)' } }, '🧩 Thinking like a coder'));
  const sgrid = h('div', { class: 'menu-grid' });
  sgrid.appendChild(L.bigButton('🧩', 'Step by Step', () => L.go('code', 'steps'), 'order the steps'));
  body.appendChild(sgrid);
});
})();
