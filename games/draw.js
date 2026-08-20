/* Lamora — Drawing Studio: pencil, crayon, marker, paintbrush, eraser,
   shapes, stamps, backgrounds, undo/redo, save locally, export as PNG. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

const PALETTE = ['#2d3436', '#d63031', '#e17055', '#fdcb6e', '#00b894', '#0984e3', '#6c5ce7', '#e84393', '#a0522d', '#ffffff'];
const TOOLS = [
  { id: 'pencil', icon: '✏️', name: 'Pencil', width: 3, alpha: 1 },
  { id: 'crayon', icon: '🖍️', name: 'Crayon', width: 10, alpha: 0.7 },
  { id: 'marker', icon: '🖊️', name: 'Marker', width: 16, alpha: 0.9 },
  { id: 'brush', icon: '🖌️', name: 'Paintbrush', width: 28, alpha: 0.5 },
  { id: 'eraser', icon: '🧽', name: 'Eraser', width: 30, alpha: 1 }
];
const STAMPS = ['⭐', '❤️', '🌈', '🌸', '🦋', '☀️', '🐬', '🐉', '🦖', '🚀'];
const SHAPES = ['⬜', '⚪', '🔺', '➖'];
const BACKGROUNDS = [
  ['plain', 'White', '#ffffff'],
  ['sky', 'Sky', 'linear:#aee3ff,#e8fbff'],
  ['sunset', 'Sunset', 'linear:#ffd29d,#ff9a8b'],
  ['night', 'Night', 'linear:#2b2e5e,#5b5ea6'],
  ['grass', 'Meadow', 'linear:#d8f5d0,#8fd18f']
];

L.route('draw', () => {
  const body = L.page('Drawing Studio', { speak: 'Time to draw! Pick a tool and a colour, then draw with your finger!', backTo: 'home' });

  const W = 800, H = 560;
  const canvas = h('canvas', { class: 'draw-surface', width: W, height: H, 'aria-label': 'drawing canvas' });
  const ctx = canvas.getContext('2d');
  let tool = TOOLS[0], colour = PALETTE[5], mode = 'draw', stamp = STAMPS[0], shape = SHAPES[0];
  let undoStack = [], redoStack = [];
  let drawing = false, sx = 0, sy = 0;

  function paintBackground(bg) {
    if (bg.startsWith('linear:')) {
      const [c1, c2] = bg.slice(7).split(',');
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, c1); g.addColorStop(1, c2);
      ctx.fillStyle = g;
    } else ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }
  paintBackground('#ffffff');
  snapshot();

  function snapshot() {
    if (undoStack.length > 20) undoStack.shift();
    undoStack.push(ctx.getImageData(0, 0, W, H));
    redoStack = [];
  }
  function undo() {
    if (undoStack.length < 2) return;
    redoStack.push(undoStack.pop());
    ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
    L.sfx('tap');
  }
  function redo() {
    if (!redoStack.length) return;
    const img = redoStack.pop();
    undoStack.push(img);
    ctx.putImageData(img, 0, 0);
    L.sfx('tap');
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)];
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const [x, y] = pos(e);
    if (mode === 'stamp') {
      ctx.globalAlpha = 1;
      ctx.font = '54px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(stamp, x, y);
      snapshot(); L.sfx('pop');
      return;
    }
    if (mode === 'shape') { sx = x; sy = y; drawing = true; return; }
    drawing = true; sx = x; sy = y;
    ctx.globalAlpha = tool.alpha;
    ctx.strokeStyle = tool.id === 'eraser' ? '#ffffff' : colour;
    ctx.lineWidth = tool.width;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y + 0.1); ctx.stroke();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing || mode !== 'draw') return;
    const [x, y] = pos(e);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x, y); ctx.stroke();
    sx = x; sy = y;
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!drawing) return;
    drawing = false;
    if (mode === 'shape') {
      const [x, y] = pos(e);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colour; ctx.fillStyle = colour; ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      const wdt = x - sx, hgt = y - sy;
      ctx.beginPath();
      if (shape === '⬜') ctx.strokeRect(sx, sy, wdt || 60, hgt || 60);
      else if (shape === '⚪') { ctx.arc(sx + wdt / 2, sy + hgt / 2, Math.max(12, Math.hypot(wdt, hgt) / 2), 0, 7); ctx.stroke(); }
      else if (shape === '🔺') { ctx.moveTo(sx + wdt / 2, sy); ctx.lineTo(sx, y); ctx.lineTo(x, y); ctx.closePath(); ctx.stroke(); }
      else { ctx.moveTo(sx, sy); ctx.lineTo(x, y); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    snapshot();
  });

  /* toolbars */
  const toolBar = h('div', { class: 'tool-bar', role: 'toolbar', 'aria-label': 'drawing tools' });
  const toolBtns = [];
  TOOLS.forEach((t) => {
    const b = h('button', { class: 'tool-btn' + (t === tool ? ' on' : ''), 'aria-label': t.name, title: t.name }, t.icon);
    b.addEventListener('click', () => { tool = t; mode = 'draw'; refreshTools(b); L.sfx('tap'); });
    toolBtns.push(b); toolBar.appendChild(b);
  });
  const stampBtn = h('button', { class: 'tool-btn', 'aria-label': 'Sticker stamp' }, '🌟');
  stampBtn.addEventListener('click', () => {
    mode = 'stamp'; refreshTools(stampBtn);
    stampTray.style.display = ''; shapeTray.style.display = 'none';
  });
  const shapeBtn = h('button', { class: 'tool-btn', 'aria-label': 'Shapes' }, '🔷');
  shapeBtn.addEventListener('click', () => {
    mode = 'shape'; refreshTools(shapeBtn);
    shapeTray.style.display = ''; stampTray.style.display = 'none';
  });
  toolBar.append(stampBtn, shapeBtn,
    h('button', { class: 'tool-btn', 'aria-label': 'Undo', onclick: undo }, '↩️'),
    h('button', { class: 'tool-btn', 'aria-label': 'Redo', onclick: redo }, '↪️'),
    h('button', { class: 'tool-btn', 'aria-label': 'Clear canvas', onclick: async () => {
      if (await L.confirmDialog('Start again?', 'Clear the whole drawing?', 'Clear')) { paintBackground('#ffffff'); snapshot(); }
    } }, '🗑️')
  );
  toolBtns.push(stampBtn, shapeBtn);
  function refreshTools(active) {
    toolBtns.forEach((x) => x.classList.remove('on'));
    if (mode === 'draw') { stampTray.style.display = 'none'; shapeTray.style.display = 'none'; }
    active.classList.add('on');
  }

  const colourBar = h('div', { class: 'tool-bar', role: 'toolbar', 'aria-label': 'colours' });
  PALETTE.forEach((c) => {
    const b = h('button', { class: 'swatch' + (c === colour ? ' on' : ''), style: { background: c }, 'aria-label': 'colour ' + c });
    b.addEventListener('click', () => {
      colour = c;
      colourBar.querySelectorAll('.swatch').forEach((x) => x.classList.remove('on'));
      b.classList.add('on'); L.sfx('tap');
    });
    colourBar.appendChild(b);
  });

  const stampTray = h('div', { class: 'tool-bar', style: { display: 'none' }, 'aria-label': 'stickers' });
  const earned = (L.profile() && window.LamoraStickers) ? window.LamoraStickers.earnedIcons() : [];
  STAMPS.concat(earned.filter((x) => !STAMPS.includes(x))).forEach((s) => {
    const b = h('button', { class: 'tool-btn' + (s === stamp ? ' on' : ''), 'aria-label': 'sticker ' + s }, s);
    b.addEventListener('click', () => {
      stamp = s;
      stampTray.querySelectorAll('.tool-btn').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
    });
    stampTray.appendChild(b);
  });

  const shapeTray = h('div', { class: 'tool-bar', style: { display: 'none' }, 'aria-label': 'shapes' });
  SHAPES.forEach((s) => {
    const b = h('button', { class: 'tool-btn' + (s === shape ? ' on' : ''), 'aria-label': 'shape ' + s }, s);
    b.addEventListener('click', () => {
      shape = s;
      shapeTray.querySelectorAll('.tool-btn').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
    });
    shapeTray.appendChild(b);
  });

  const bgBar = h('div', { class: 'tool-bar', 'aria-label': 'backgrounds' });
  bgBar.appendChild(h('span', { class: 'small-note', style: { alignSelf: 'center' } }, 'Backgrounds:'));
  BACKGROUNDS.forEach(([id, name, bg]) => {
    bgBar.appendChild(h('button', { class: 'btn soft small', onclick: () => { paintBackground(bg); snapshot(); } }, name));
  });

  const actions = h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '10px' } },
    h('button', { class: 'btn secondary', onclick: saveLocal }, '💾 Save'),
    h('button', { class: 'btn', onclick: () => { L.download('lamora-drawing.png', canvas.toDataURL('image/png')); toast('Drawing exported! 🖼️'); } }, '⬇️ Export PNG'),
    h('button', { class: 'btn soft', onclick: gallery }, '🖼️ My gallery')
  );

  function toast(m) { L.toast(m); }

  function saveLocal() {
    const p = L.profile();
    if (!p) return;
    // keep saved drawings small so localStorage stays healthy
    const thumb = document.createElement('canvas');
    thumb.width = 400; thumb.height = 280;
    thumb.getContext('2d').drawImage(canvas, 0, 0, 400, 280);
    p.drawings.push({ date: L.todayKey(), data: thumb.toDataURL('image/jpeg', 0.7) });
    if (p.drawings.length > 12) p.drawings.shift();
    L.save();
    L.sfx('star');
    L.toast('Saved to your gallery! 💾');
    const prog = p.progress;
    prog.creativity = (prog.creativity || 0) + 1;
    L.save();
  }

  function gallery() {
    const p = L.profile();
    L.overlay(h('div', { class: 'overlay-card' },
      h('h2', { text: '🖼️ My gallery' }),
      p.drawings.length
        ? h('div', { class: 'stack' }, p.drawings.slice().reverse().map((d) =>
            h('div', {},
              h('img', { src: d.data, class: 'photo-preview', alt: 'saved drawing from ' + d.date }),
              h('div', { class: 'row', style: { justifyContent: 'center' } },
                h('button', { class: 'btn soft small', onclick: () => { const img = new Image(); img.onload = () => { ctx.drawImage(img, 0, 0, W, H); snapshot(); L.closeOverlay(); }; img.src = d.data; } }, 'Open'),
                h('button', { class: 'btn danger small', onclick: () => { p.drawings = p.drawings.filter((x) => x !== d); L.save(); L.closeOverlay(); gallery(); } }, 'Delete')
              ))))
        : h('p', { text: 'No saved drawings yet — draw something wonderful!' }),
      h('button', { class: 'btn secondary', onclick: () => L.closeOverlay() }, 'Close')
    ));
  }

  body.append(toolBar, colourBar, stampTray, shapeTray, h('div', { class: 'draw-canvas-wrap' }, canvas), bgBar, actions);
});
})();
