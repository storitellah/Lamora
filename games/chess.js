/* Lamora — child-friendly chess: lessons, practice, puzzles,
   play vs a gentle computer, and two-player mode.
   Full legal movement incl. castling, promotion and en passant. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

const GLYPH = { wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙', bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟' };
const NAMES = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' };
const VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };

/* board: array of 64, index 0 = a8. entries like 'wP' or null. */
function startBoard() {
  const b = Array(64).fill(null);
  const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (let i = 0; i < 8; i++) {
    b[i] = 'b' + back[i]; b[8 + i] = 'bP';
    b[48 + i] = 'wP'; b[56 + i] = 'w' + back[i];
  }
  return b;
}
const rc = (sq) => [Math.floor(sq / 8), sq % 8];
const sq = (r, c) => r * 8 + c;
const onB = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
const sqName = (s) => 'abcdefgh'[s % 8] + (8 - Math.floor(s / 8));

/* pseudo-legal moves for a piece at "from" (state carries castling/ep info) */
function pieceMoves(b, from, st) {
  const p = b[from];
  if (!p) return [];
  const side = p[0], t = p[1];
  const [r, c] = rc(from);
  const out = [];
  const push = (rr, cc, flag) => {
    if (!onB(rr, cc)) return false;
    const target = b[sq(rr, cc)];
    if (target && target[0] === side) return false;
    out.push({ from, to: sq(rr, cc), flag });
    return !target; // continue sliding only through empty squares
  };
  if (t === 'P') {
    const dir = side === 'w' ? -1 : 1;
    const startRow = side === 'w' ? 6 : 1;
    if (onB(r + dir, c) && !b[sq(r + dir, c)]) {
      out.push({ from, to: sq(r + dir, c) });
      if (r === startRow && !b[sq(r + 2 * dir, c)]) out.push({ from, to: sq(r + 2 * dir, c), flag: 'dbl' });
    }
    for (const dc of [-1, 1]) {
      if (!onB(r + dir, c + dc)) continue;
      const to = sq(r + dir, c + dc);
      if (b[to] && b[to][0] !== side) out.push({ from, to });
      else if (st && st.ep === to) out.push({ from, to, flag: 'ep' });
    }
  } else if (t === 'N') {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => push(r + dr, c + dc));
  } else if (t === 'K') {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (dr || dc) push(r + dr, c + dc);
    if (st && st.castle) {
      const home = side === 'w' ? 56 : 0;
      if (st.castle[side + 'K'] && !b[home + 5] && !b[home + 6] &&
          !attacked(b, home + 4, side) && !attacked(b, home + 5, side) && !attacked(b, home + 6, side))
        out.push({ from, to: home + 6, flag: 'ck' });
      if (st.castle[side + 'Q'] && !b[home + 1] && !b[home + 2] && !b[home + 3] &&
          !attacked(b, home + 4, side) && !attacked(b, home + 3, side) && !attacked(b, home + 2, side))
        out.push({ from, to: home + 2, flag: 'cq' });
    }
  } else {
    const dirs = { R: [[0,1],[0,-1],[1,0],[-1,0]], B: [[1,1],[1,-1],[-1,1],[-1,-1]] };
    const use = t === 'Q' ? dirs.R.concat(dirs.B) : dirs[t];
    use.forEach(([dr, dc]) => {
      let rr = r + dr, cc = c + dc;
      while (push(rr, cc)) { rr += dr; cc += dc; }
    });
  }
  return out;
}

/* is square s attacked by the OPPONENT of `side`? */
function attacked(b, s, side) {
  const foe = side === 'w' ? 'b' : 'w';
  for (let i = 0; i < 64; i++) {
    if (b[i] && b[i][0] === foe) {
      if (b[i][1] === 'P') {
        const dir = foe === 'w' ? -1 : 1;
        const [r, c] = rc(i);
        if ((onB(r + dir, c - 1) && sq(r + dir, c - 1) === s) || (onB(r + dir, c + 1) && sq(r + dir, c + 1) === s)) return true;
      } else if (b[i][1] === 'K') {
        const [r, c] = rc(i), [tr, tc] = rc(s);
        if (Math.abs(r - tr) <= 1 && Math.abs(c - tc) <= 1) return true;
      } else if (pieceMoves(b, i, null).some((m) => m.to === s)) return true;
    }
  }
  return false;
}

function findKing(b, side) { return b.indexOf(side + 'K'); }

function applyMove(b, mv, st) {
  const nb = b.slice();
  const p = nb[mv.from];
  const side = p[0];
  const nst = { ep: null, castle: Object.assign({}, st ? st.castle : { wK: true, wQ: true, bK: true, bQ: true }) };
  nb[mv.to] = p; nb[mv.from] = null;
  if (mv.flag === 'ep') nb[mv.to + (side === 'w' ? 8 : -8)] = null;
  if (mv.flag === 'dbl') nst.ep = mv.to + (side === 'w' ? 8 : -8);
  if (mv.flag === 'ck') { const home = side === 'w' ? 56 : 0; nb[home + 5] = nb[home + 7]; nb[home + 7] = null; }
  if (mv.flag === 'cq') { const home = side === 'w' ? 56 : 0; nb[home + 3] = nb[home]; nb[home] = null; }
  if (p[1] === 'P' && (mv.to < 8 || mv.to >= 56)) nb[mv.to] = side + 'Q'; // friendly auto-queen
  if (p[1] === 'K') { nst.castle[side + 'K'] = nst.castle[side + 'Q'] = false; }
  if (p[1] === 'R') {
    const home = side === 'w' ? 56 : 0;
    if (mv.from === home) nst.castle[side + 'Q'] = false;
    if (mv.from === home + 7) nst.castle[side + 'K'] = false;
  }
  return { board: nb, st: nst };
}

function legalMoves(b, side, st) {
  const all = [];
  for (let i = 0; i < 64; i++) {
    if (b[i] && b[i][0] === side) {
      pieceMoves(b, i, st).forEach((m) => {
        const { board: nb } = applyMove(b, m, st);
        if (!attacked(nb, findKing(nb, side), side)) all.push(m);
      });
    }
  }
  return all;
}

const inCheck = (b, side) => attacked(b, findKing(b, side), side);

/* gentle beginner AI: prefers good captures, avoids obvious blunders, small randomness */
function aiMove(b, side, st) {
  const moves = legalMoves(b, side, st);
  if (!moves.length) return null;
  let best = [], bestScore = -Infinity;
  for (const m of moves) {
    const captureVal = b[m.to] ? VAL[b[m.to][1]] : (m.flag === 'ep' ? 1 : 0);
    const { board: nb, st: nst } = applyMove(b, m, st);
    const foe = side === 'w' ? 'b' : 'w';
    // worst reply capture against us (1-ply lookahead)
    let worstLoss = 0;
    for (const r of legalMoves(nb, foe, nst)) {
      if (nb[r.to] && nb[r.to][0] === side) worstLoss = Math.max(worstLoss, VAL[nb[r.to][1]]);
    }
    let score = captureVal - worstLoss * 0.9 + Math.random() * 0.5;
    if (inCheck(nb, foe)) score += 0.4;
    if (score > bestScore) { bestScore = score; best = [m]; }
    else if (score > bestScore - 0.15) best.push(m);
  }
  return L.pick(best);
}

/* ---------------- board UI ---------------- */
function boardUI(container, opts) {
  const el = h('div', { class: 'chess-board', role: 'grid', 'aria-label': 'chess board' });
  container.appendChild(el);
  const cells = [];
  for (let i = 0; i < 64; i++) {
    const [r, c] = rc(i);
    const cell = h('button', {
      class: 'chess-sq ' + ((r + c) % 2 ? 'dark' : 'light'),
      'aria-label': sqName(i) + ' empty'
    });
    cell.addEventListener('click', () => opts.onTap(i));
    cells.push(cell);
    el.appendChild(cell);
  }
  return {
    el,
    draw(b, marks) {
      marks = marks || {};
      cells.forEach((cell, i) => {
        cell.textContent = b[i] ? GLYPH[b[i]] : '';
        cell.setAttribute('aria-label', sqName(i) + (b[i] ? ' ' + (b[i][0] === 'w' ? 'white ' : 'black ') + NAMES[b[i][1]] : ' empty'));
        cell.classList.toggle('sel', marks.sel === i);
        cell.classList.toggle('move', !!(marks.moves && marks.moves.includes(i) && !b[i]));
        cell.classList.toggle('cap', !!(marks.moves && marks.moves.includes(i) && b[i]));
        cell.classList.toggle('hintsq', !!(marks.hint && marks.hint.includes(i)));
      });
    }
  };
}

/* ---------------- play (vs computer or two players) ---------------- */
function playChess(vsAI) {
  const body = L.page(vsAI ? '♟️ You vs Computer' : '♟️ Two Players', {
    speak: vsAI ? 'You play the white pieces! Tap a piece, then tap where it should go.' : 'Take turns! White goes first.',
    backTo: 'chess'
  });
  let board = startBoard();
  let st = { ep: null, castle: { wK: true, wQ: true, bK: true, bQ: true } };
  let turn = 'w', sel = null, over = false;
  const msg = h('div', { class: 'chess-msg', 'aria-live': 'polite' }, 'White to move — tap a piece!');
  const wrap = h('div', { class: 'chess-wrap' });
  body.append(msg, wrap);

  let aiTimer = null;
  L.onLeave(() => clearTimeout(aiTimer));

  const ui = boardUI(wrap, { onTap: tap });
  wrap.appendChild(h('div', { class: 'row', style: { justifyContent: 'center' } },
    h('button', { class: 'btn soft small', onclick: hint }, '💡 Hint'),
    h('button', { class: 'btn soft small', onclick: () => { board = startBoard(); st = { ep: null, castle: { wK: true, wQ: true, bK: true, bQ: true } }; turn = 'w'; sel = null; over = false; msg.textContent = 'New game! White to move.'; ui.draw(board); } }, '🔄 Restart')
  ));
  ui.draw(board);

  function moveList(from) { return legalMoves(board, turn, st).filter((m) => m.from === from); }

  function afterMove() {
    const foe = turn === 'w' ? 'b' : 'w';
    turn = foe;
    const moves = legalMoves(board, turn, st);
    if (!moves.length) {
      over = true;
      if (inCheck(board, turn)) {
        const winner = foe === 'w' ? 'White' : 'Black';
        msg.textContent = `Checkmate! ${winner} wins! 🎉`;
        L.sfx('win');
        if (vsAI && foe === 'w') L.completeActivity({ skill: 'chess', stars: 5, onAgain: () => L.go('chess', 'play') });
      } else {
        msg.textContent = 'Stalemate — a friendly draw! 🤝';
      }
      return;
    }
    if (inCheck(board, turn)) { msg.textContent = (turn === 'w' ? 'White' : 'Black') + ' is in CHECK! Protect the king!'; L.sfx('ding'); }
    else msg.textContent = (turn === 'w' ? 'White' : 'Black') + ' to move.';
    if (vsAI && turn === 'b' && !over) {
      msg.textContent = 'Computer is thinking… 🤔';
      aiTimer = setTimeout(() => {
        const m = aiMove(board, 'b', st);
        if (m) {
          const res = applyMove(board, m, st);
          board = res.board; st = res.st;
          L.sfx('move');
          ui.draw(board);
          afterMove();
        }
      }, 700);
    }
  }

  function tap(i) {
    if (over || (vsAI && turn === 'b')) return;
    if (sel != null) {
      const mv = moveList(sel).find((m) => m.to === i);
      if (mv) {
        const res = applyMove(board, mv, st);
        board = res.board; st = res.st;
        sel = null;
        L.sfx('move');
        ui.draw(board);
        afterMove();
        return;
      }
    }
    if (board[i] && board[i][0] === turn) {
      sel = i;
      ui.draw(board, { sel: i, moves: moveList(i).map((m) => m.to) });
    } else {
      sel = null;
      ui.draw(board);
    }
  }

  function hint() {
    if (over) return;
    const m = aiMove(board, turn, st);
    if (m) {
      ui.draw(board, { hint: [m.from, m.to] });
      msg.textContent = `Hint: try moving the ${NAMES[board[m.from][1]]} from ${sqName(m.from)} to ${sqName(m.to)}.`;
    }
  }
}

/* ---------------- lessons ---------------- */
const LESSONS = [
  {
    id: 'board', icon: '🏁', name: 'The Board',
    text: 'A chessboard has 64 squares — 32 light and 32 dark. Rows are called RANKS and columns are called FILES. Each square has a name, like e4!',
    quiz: () => [
      { prompt: 'How many squares does a chessboard have?', options: ['64', '50', '100'], answer: 0, hint: '8 rows of 8 squares.', explain: '8 × 8 = 64 squares.' },
      { prompt: 'What do we call a row on the board?', options: ['A rank', 'A ladder', 'A street'], answer: 0, hint: 'It rhymes with "bank".', explain: 'Rows are ranks, columns are files.' }
    ]
  },
  {
    id: 'pawn', icon: '♙', name: 'The Pawn',
    text: 'Pawns are the little helpers. They move FORWARD one square (or two on their first move) but capture DIAGONALLY. If a pawn reaches the other side, it becomes a queen!',
    quiz: () => [
      { prompt: 'How does a pawn capture?', options: ['Diagonally', 'Straight ahead', 'It cannot'], answer: 0, hint: 'It attacks corner-to-corner.', explain: 'Pawns capture one square diagonally forward.' },
      { prompt: 'What can a pawn become at the far side?', options: ['A queen', 'A king', 'Nothing'], answer: 0, hint: 'The strongest piece!', explain: 'A pawn that crosses the board is promoted — usually to a queen!' }
    ]
  },
  {
    id: 'rook', icon: '♖', name: 'The Rook',
    text: 'The rook looks like a castle tower. It slides in straight lines — up, down, left and right — as far as it likes!',
    quiz: () => [
      { prompt: 'Which way does a rook move?', options: ['Straight lines', 'Diagonals', 'In an L shape'], answer: 0, hint: 'Like a tower sliding along corridors.', explain: 'Rooks move in straight lines: up, down, left, right.' }
    ]
  },
  {
    id: 'bishop', icon: '♗', name: 'The Bishop',
    text: 'The bishop slides DIAGONALLY as far as it likes. Each bishop stays on its own colour for the whole game!',
    quiz: () => [
      { prompt: 'Which way does a bishop move?', options: ['Diagonally', 'Straight lines', 'One square only'], answer: 0, hint: 'Corner to corner!', explain: 'Bishops slide diagonally and never change square colour.' }
    ]
  },
  {
    id: 'knight', icon: '♘', name: 'The Knight',
    text: 'The knight is the jumping horse! It moves in an L shape: two squares one way, then one square to the side. It is the only piece that can jump over others!',
    quiz: () => [
      { prompt: 'Which piece can JUMP over others?', options: ['The knight', 'The rook', 'The queen'], answer: 0, hint: 'It’s a horse!', explain: 'Only the knight can jump over pieces.' },
      { prompt: 'What shape is a knight’s move?', options: ['An L', 'A circle', 'A zig-zag'], answer: 0, hint: 'Two then one.', explain: 'Two squares, then one to the side — an L!' }
    ]
  },
  {
    id: 'queen', icon: '♕', name: 'The Queen',
    text: 'The queen is the most powerful piece! She can slide in straight lines AND diagonals, as far as she likes.',
    quiz: () => [
      { prompt: 'Which is the most powerful piece?', options: ['The queen', 'The pawn', 'The knight'], answer: 0, hint: 'She moves like a rook and bishop together.', explain: 'The queen combines the rook’s and bishop’s powers.' }
    ]
  },
  {
    id: 'king', icon: '♔', name: 'The King',
    text: 'The king is the most IMPORTANT piece — the whole game is about keeping him safe! He moves just one square in any direction.',
    quiz: () => [
      { prompt: 'How far can the king move?', options: ['One square', 'Anywhere', 'Two squares'], answer: 0, hint: 'He walks slowly and carefully.', explain: 'The king moves one square in any direction.' }
    ]
  },
  {
    id: 'check', icon: '⚠️', name: 'Check & Checkmate',
    text: 'CHECK means the king is being attacked — he must escape! CHECKMATE means the king is attacked and has NO way to escape. Checkmate wins the game!',
    quiz: () => [
      { prompt: 'What does CHECK mean?', options: ['The king is attacked', 'The game is over', 'You lose a pawn'], answer: 0, hint: 'The king is in danger but can still escape.', explain: 'Check means the king is attacked and must get safe.' },
      { prompt: 'What ends the game?', options: ['Checkmate', 'Check', 'Capturing a queen'], answer: 0, hint: 'The king cannot escape.', explain: 'Checkmate — the attacked king has no escape — ends the game.' }
    ]
  }
];

function runLesson(lesson) {
  const body = L.page(lesson.icon + ' ' + lesson.name, { speak: lesson.text, backTo: 'chess' });
  body.appendChild(h('div', { class: 'card' },
    h('div', { class: 'story-art' }, lesson.icon),
    h('p', { class: 'story-page' }, lesson.text),
    h('button', {
      class: 'btn', onclick: () => {
        L.runQuiz({
          title: lesson.name + ' Quiz', skill: 'chess', backTo: 'chess',
          questions: lesson.quiz(),
          onDone: (stars) => {
            const p = L.profile();
            if (p && !p.chessLessons.includes(lesson.id)) p.chessLessons.push(lesson.id);
            L.completeActivity({ skill: 'chess', stars, onAgain: () => L.go('chess', 'lesson', lesson.id) });
          }
        });
      }
    }, '✅ Quick quiz')
  ));
}

/* ---------------- movement / capture practice ---------------- */
function practice(kind) {
  const pieceT = L.pick(['R', 'B', 'N', 'Q']);
  let board = Array(64).fill(null);
  const startSq = sq(L.rand(2, 5), L.rand(2, 5));
  board[startSq] = 'w' + pieceT;
  let targets = [];
  const st = null;
  const reachable = pieceMoves(board, startSq, st).map((m) => m.to);
  if (!reachable.length) { practice(kind); return; }
  if (kind === 'move') {
    targets = [L.pick(reachable)];
  } else {
    L.sample(reachable, Math.min(3, reachable.length)).forEach((t) => { board[t] = 'bP'; targets.push(t); });
  }
  const title = kind === 'move' ? '🎯 Movement Practice' : '⚔️ Capture Practice';
  const body = L.page(title, {
    speak: kind === 'move'
      ? `Move the ${NAMES[pieceT]} to the star square!`
      : `Capture all the black pawns with your ${NAMES[pieceT]}!`,
    backTo: 'chess'
  });
  const msg = h('div', { class: 'chess-msg' }, kind === 'move' ? `Move the ${NAMES[pieceT]} to ⭐!` : `Capture the pawns with your ${NAMES[pieceT]}!`);
  const wrap = h('div', { class: 'chess-wrap' });
  body.append(msg, wrap);
  let sel = null, captured = 0, moves = 0;
  const ui = boardUI(wrap, { onTap: tap });
  function marks() {
    const mk = { hint: kind === 'move' ? targets : [] };
    if (sel != null) { mk.sel = sel; mk.moves = pieceMoves(board, sel, st).map((m) => m.to); }
    return mk;
  }
  function draw() {
    ui.draw(board, marks());
    if (kind === 'move') {
      const cell = wrap.querySelectorAll('.chess-sq')[targets[0]];
      if (!board[targets[0]]) cell.textContent = '⭐';
    }
  }
  function tap(i) {
    if (board[i] && board[i][0] === 'w') { sel = i; draw(); return; }
    if (sel == null) return;
    const mv = pieceMoves(board, sel, st).find((m) => m.to === i);
    if (!mv) { L.sfx('wrong'); msg.textContent = `A ${NAMES[pieceT]} cannot move there — look at the blue dots!`; return; }
    const wasCapture = !!board[i];
    board[i] = board[sel]; board[sel] = null; sel = i; moves++;
    L.sfx('move');
    if (kind === 'move' && i === targets[0]) {
      L.completeActivity({ skill: 'chess', stars: moves <= 2 ? 3 : 2, onAgain: () => practice('move') });
      return;
    }
    if (kind === 'capture' && wasCapture) {
      captured++;
      L.sfx('correct');
      msg.textContent = `Captured! ${targets.length - captured} to go!`;
      if (captured === targets.length) {
        L.completeActivity({ skill: 'chess', stars: 3, onAgain: () => practice('capture') });
        return;
      }
    }
    draw();
  }
  draw();
}

/* ---------------- mate-in-one puzzles ---------------- */
/* All are verified mate-in-one for White.
   Square index: 0 = a8 (top-left) … 63 = h1 (bottom-right). */
const PUZZLES = [
  // Rd1–d8#: classic back-rank mate, king trapped by its own pawns
  { name: 'Back-rank surprise', place: { 6: 'bK', 13: 'bP', 14: 'bP', 15: 'bP', 59: 'wR', 62: 'wK' } },
  // Qg2–g7# (queen guarded by the king on f7)
  { name: 'Queen power', place: { 7: 'bK', 13: 'wK', 54: 'wQ' } },
  // Rb1–b8#: one rook guards the 7th rank, the other delivers mate
  { name: 'Two rooks team up', place: { 4: 'bK', 8: 'wR', 57: 'wR', 62: 'wK' } },
  // Qe1–e8#: the white king guards all the corner escape squares
  { name: 'Cornered king', place: { 0: 'bK', 17: 'wK', 60: 'wQ' } }
];

function puzzle(idx) {
  idx = Number(idx) || 0;
  const pz = PUZZLES[idx % PUZZLES.length];
  let board = Array(64).fill(null);
  Object.entries(pz.place).forEach(([k, v]) => (board[k] = v));
  const st = { ep: null, castle: { wK: false, wQ: false, bK: false, bQ: false } };
  const body = L.page('🧩 Puzzle: ' + pz.name, { speak: 'Find the checkmate in one move!', backTo: 'chess' });
  const msg = h('div', { class: 'chess-msg' }, 'White to move — find CHECKMATE in one!');
  const wrap = h('div', { class: 'chess-wrap' });
  body.append(msg, wrap);
  let sel = null;
  const ui = boardUI(wrap, { onTap: tap });
  wrap.appendChild(h('button', { class: 'btn soft small', onclick: hint }, '💡 Hint'));
  ui.draw(board);

  function mating() {
    return legalMoves(board, 'w', st).filter((m) => {
      const { board: nb, st: nst } = applyMove(board, m, st);
      return inCheck(nb, 'b') && legalMoves(nb, 'b', nst).length === 0;
    });
  }
  function hint() {
    const m = mating()[0];
    if (m) { ui.draw(board, { hint: [m.from] }); msg.textContent = `Hint: the ${NAMES[board[m.from][1]]} can do it!`; }
  }
  function tap(i) {
    if (board[i] && board[i][0] === 'w') { sel = i; ui.draw(board, { sel: i, moves: legalMoves(board, 'w', st).filter((m) => m.from === i).map((m) => m.to) }); return; }
    if (sel == null) return;
    const mv = legalMoves(board, 'w', st).find((m) => m.from === sel && m.to === i);
    if (!mv) return;
    const isMate = mating().some((m) => m.from === mv.from && m.to === mv.to);
    const res = applyMove(board, mv, st);
    if (isMate) {
      board = res.board;
      ui.draw(board);
      msg.textContent = 'CHECKMATE! Brilliant! 🎉';
      L.completeActivity({ skill: 'chess', stars: 4, onAgain: () => L.go('chess', 'puzzle', String((idx + 1) % PUZZLES.length)) });
    } else {
      L.sfx('wrong');
      msg.textContent = 'Good try — but the black king can still escape. Try another move!';
      sel = null;
      ui.draw(board);
    }
  }
}

/* ---------------- chess menu ---------------- */
L.route('chess', (section, arg) => {
  if (section === 'play') { playChess(true); return; }
  if (section === 'two') { playChess(false); return; }
  if (section === 'move') { practice('move'); return; }
  if (section === 'capture') { practice('capture'); return; }
  if (section === 'puzzle') { puzzle(arg); return; }
  if (section === 'lesson') {
    const lesson = LESSONS.find((x) => x.id === arg);
    if (lesson) { runLesson(lesson); return; }
  }
  const p = L.profile();
  const body = L.page('Chess Club', { speak: 'Welcome to the chess club! Learn the pieces, solve puzzles, or play a game!', backTo: 'home' });
  const done = p ? p.chessLessons.length : 0;
  body.appendChild(h('p', { class: 'center' }, h('span', { class: 'pill' }, `♟️ Lessons finished: ${done} of ${LESSONS.length}`)));
  body.appendChild(h('h2', { style: { fontFamily: 'var(--font-display)' } }, '📖 Learn'));
  const lgrid = h('div', { class: 'menu-grid' });
  LESSONS.forEach((lesson) => lgrid.appendChild(L.bigButton(lesson.icon, lesson.name, () => L.go('chess', 'lesson', lesson.id), p && p.chessLessons.includes(lesson.id) ? '✅ done' : null)));
  body.appendChild(lgrid);
  body.appendChild(h('h2', { style: { fontFamily: 'var(--font-display)' } }, '🎯 Practise & Play'));
  const ggrid = h('div', { class: 'menu-grid' });
  ggrid.append(
    L.bigButton('🎯', 'Movement Practice', () => L.go('chess', 'move')),
    L.bigButton('⚔️', 'Capture Practice', () => L.go('chess', 'capture')),
    L.bigButton('🧩', 'Mini Puzzles', () => L.go('chess', 'puzzle', '0')),
    L.bigButton('🤖', 'Play the Computer', () => L.go('chess', 'play')),
    L.bigButton('🧑‍🤝‍🧑', 'Two Players', () => L.go('chess', 'two'))
  );
  body.appendChild(ggrid);
});
})();
