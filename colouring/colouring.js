/* Lamora — Colouring: tap-to-fill SVG pages with palette,
   undo/redo, local save and PNG export. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

const PALETTE = ['#d63031', '#e17055', '#fdcb6e', '#ffeaa7', '#00b894', '#55efc4', '#0984e3', '#74b9ff', '#6c5ce7', '#a29bfe', '#e84393', '#fd79a8', '#a0522d', '#f5f6fa', '#2d3436'];

/* Each page is a friendly line-art SVG. Every region with data-fill can be tapped. */
const S = (inner) => `<svg viewBox="0 0 400 400" role="img">${inner}</svg>`;
const st = 'stroke="#2d3436" stroke-width="5" stroke-linejoin="round"';

const PAGES = [
  { id: 'mermaid', icon: '🧜‍♀️', name: 'Mermaid', svg: S(`
    <rect data-fill x="0" y="0" width="400" height="400" fill="#fff" ${st}/>
    <circle data-fill cx="200" cy="100" r="45" fill="#fff" ${st}/>
    <path data-fill d="M155 80 Q200 20 245 80 Q250 120 235 135 Q245 60 200 62 Q155 60 165 135 Q150 120 155 80 Z" fill="#fff" ${st}/>
    <path data-fill d="M170 145 Q200 165 230 145 L245 230 Q200 260 155 230 Z" fill="#fff" ${st}/>
    <path data-fill d="M165 235 Q200 265 235 235 Q250 300 215 330 L185 330 Q150 300 165 235 Z" fill="#fff" ${st}/>
    <path data-fill d="M185 330 L215 330 Q235 355 255 370 Q225 375 200 355 Q175 375 145 370 Q165 355 185 330 Z" fill="#fff" ${st}/>
    <circle cx="185" cy="95" r="5" fill="#2d3436"/><circle cx="215" cy="95" r="5" fill="#2d3436"/>
    <path d="M185 115 Q200 125 215 115" fill="none" ${st}/>
    <circle data-fill cx="90" cy="300" r="26" fill="#fff" ${st}/>
    <circle data-fill cx="320" cy="90" r="20" fill="#fff" ${st}/>
    <path data-fill d="M40 60 Q60 40 80 60 Q60 80 40 60 Z" fill="#fff" ${st}/>`) },
  { id: 'dolphin', icon: '🐬', name: 'Dolphin', svg: S(`
    <rect data-fill x="0" y="0" width="400" height="400" fill="#fff" ${st}/>
    <path data-fill d="M60 220 Q120 120 240 140 Q330 155 350 220 Q300 240 260 235 Q290 265 270 290 Q240 265 225 245 Q140 260 60 220 Z" fill="#fff" ${st}/>
    <path data-fill d="M200 140 Q210 90 250 95 Q235 125 240 142 Z" fill="#fff" ${st}/>
    <path data-fill d="M345 215 Q385 195 380 235 Q365 225 348 228 Z" fill="#fff" ${st}/>
    <circle cx="120" cy="190" r="6" fill="#2d3436"/>
    <path d="M70 215 Q95 210 110 218" fill="none" ${st}/>
    <path data-fill d="M30 330 Q60 310 90 330 Q120 350 150 330 Q180 310 210 330 Q240 350 270 330 Q300 310 330 330 Q360 350 390 330 L390 400 L10 400 Z" fill="#fff" ${st}/>
    <circle data-fill cx="330" cy="60" r="30" fill="#fff" ${st}/>`) },
  { id: 'dragon', icon: '🐉', name: 'Dragon', svg: S(`
    <rect data-fill x="0" y="0" width="400" height="400" fill="#fff" ${st}/>
    <ellipse data-fill cx="200" cy="250" rx="90" ry="65" fill="#fff" ${st}/>
    <circle data-fill cx="290" cy="160" r="48" fill="#fff" ${st}/>
    <path data-fill d="M270 120 L280 90 L295 115 L310 88 L322 118 Z" fill="#fff" ${st}/>
    <path data-fill d="M120 230 Q40 200 40 140 Q75 165 95 200 Q105 215 120 230 Z" fill="#fff" ${st}/>
    <path data-fill d="M150 200 Q160 150 200 160 Q185 190 190 205 Z" fill="#fff" ${st}/>
    <ellipse data-fill cx="170" cy="310" rx="20" ry="14" fill="#fff" ${st}/>
    <ellipse data-fill cx="235" cy="310" rx="20" ry="14" fill="#fff" ${st}/>
    <circle cx="285" cy="150" r="6" fill="#2d3436"/>
    <path d="M320 175 Q335 185 330 195" fill="none" ${st}/>
    <path data-fill d="M330 190 Q365 195 355 215 Q340 205 328 202 Z" fill="#fff" ${st}/>`) },
  { id: 'dino', icon: '🦖', name: 'Dinosaur', svg: S(`
    <rect data-fill x="0" y="0" width="400" height="400" fill="#fff" ${st}/>
    <path data-fill d="M90 300 Q60 220 130 190 Q180 170 230 190 Q260 130 320 130 Q350 135 345 170 Q340 200 300 210 Q290 250 250 270 L250 300 L220 300 L215 275 L170 275 L165 300 L135 300 L130 270 Q105 290 90 300 Z" fill="#fff" ${st}/>
    <path data-fill d="M130 190 L120 165 L145 180 L150 155 L172 175 L185 150 L200 175 Z" fill="#fff" ${st}/>
    <circle cx="315" cy="155" r="6" fill="#2d3436"/>
    <path d="M330 180 Q340 185 338 192" fill="none" ${st}/>
    <ellipse data-fill cx="90" cy="350" rx="60" ry="16" fill="#fff" ${st}/>
    <ellipse data-fill cx="290" cy="350" rx="70" ry="16" fill="#fff" ${st}/>
    <circle data-fill cx="60" cy="70" r="28" fill="#fff" ${st}/>
    <path data-fill d="M320 40 L332 66 L360 66 L338 84 L346 110 L320 94 L294 110 L302 84 L280 66 L308 66 Z" fill="#fff" ${st}/>`) },
  { id: 'rocket', icon: '🚀', name: 'Space Rocket', svg: S(`
    <rect data-fill x="0" y="0" width="400" height="400" fill="#fff" ${st}/>
    <path data-fill d="M200 40 Q260 110 260 220 L140 220 Q140 110 200 40 Z" fill="#fff" ${st}/>
    <circle data-fill cx="200" cy="150" r="30" fill="#fff" ${st}/>
    <path data-fill d="M140 190 Q90 230 95 280 Q130 260 145 235 Z" fill="#fff" ${st}/>
    <path data-fill d="M260 190 Q310 230 305 280 Q270 260 255 235 Z" fill="#fff" ${st}/>
    <path data-fill d="M165 220 L235 220 Q235 260 200 285 Q165 260 165 220 Z" fill="#fff" ${st}/>
    <path data-fill d="M180 285 Q200 340 220 285 Q210 305 200 300 Q190 305 180 285 Z" fill="#fff" ${st}/>
    <circle data-fill cx="80" cy="90" r="22" fill="#fff" ${st}/>
    <path data-fill d="M320 60 L328 78 L348 78 L332 90 L338 110 L320 98 L302 110 L308 90 L292 78 L312 78 Z" fill="#fff" ${st}/>
    <circle data-fill cx="330" cy="320" r="34" fill="#fff" ${st}/>
    <circle data-fill cx="318" cy="312" r="8" fill="#fff" ${st}/>`) },
  { id: 'flower', icon: '🌸', name: 'Flower Garden', svg: S(`
    <rect data-fill x="0" y="0" width="400" height="400" fill="#fff" ${st}/>
    <circle data-fill cx="200" cy="150" r="34" fill="#fff" ${st}/>
    <ellipse data-fill cx="200" cy="85" rx="26" ry="34" fill="#fff" ${st}/>
    <ellipse data-fill cx="200" cy="215" rx="26" ry="34" fill="#fff" ${st}/>
    <ellipse data-fill cx="135" cy="150" rx="34" ry="26" fill="#fff" ${st}/>
    <ellipse data-fill cx="265" cy="150" rx="34" ry="26" fill="#fff" ${st}/>
    <path data-fill d="M195 240 L205 240 L205 330 L195 330 Z" fill="#fff" ${st}/>
    <path data-fill d="M200 290 Q160 270 150 300 Q180 310 200 300 Z" fill="#fff" ${st}/>
    <path data-fill d="M200 310 Q240 290 250 320 Q220 330 200 320 Z" fill="#fff" ${st}/>
    <path data-fill d="M0 340 Q100 320 200 340 Q300 360 400 340 L400 400 L0 400 Z" fill="#fff" ${st}/>
    <circle data-fill cx="330" cy="70" r="30" fill="#fff" ${st}/>
    <path data-fill d="M60 60 Q80 40 100 60 Q120 80 100 90 L60 90 Q40 80 60 60 Z" fill="#fff" ${st}/>`) },
  { id: 'castle', icon: '🏰', name: 'Castle', svg: S(`
    <rect data-fill x="0" y="0" width="400" height="400" fill="#fff" ${st}/>
    <rect data-fill x="120" y="160" width="160" height="160" fill="#fff" ${st}/>
    <rect data-fill x="70" y="120" width="60" height="200" fill="#fff" ${st}/>
    <rect data-fill x="270" y="120" width="60" height="200" fill="#fff" ${st}/>
    <path data-fill d="M70 120 L100 60 L130 120 Z" fill="#fff" ${st}/>
    <path data-fill d="M270 120 L300 60 L330 120 Z" fill="#fff" ${st}/>
    <path data-fill d="M175 320 Q175 260 200 260 Q225 260 225 320 Z" fill="#fff" ${st}/>
    <rect data-fill x="150" y="180" width="26" height="34" fill="#fff" ${st}/>
    <rect data-fill x="224" y="180" width="26" height="34" fill="#fff" ${st}/>
    <path data-fill d="M120 160 L136 130 L152 160 L168 130 L184 160 L200 130 L216 160 L232 130 L248 160 L264 130 L280 160 Z" fill="#fff" ${st}/>
    <path data-fill d="M100 60 L100 35 L130 42 L100 50 Z" fill="#fff" ${st}/>
    <circle data-fill cx="55" cy="55" r="22" fill="#fff" ${st}/>`) },
  { id: 'fish', icon: '🐠', name: 'Under the Sea', svg: S(`
    <rect data-fill x="0" y="0" width="400" height="400" fill="#fff" ${st}/>
    <ellipse data-fill cx="180" cy="180" rx="85" ry="55" fill="#fff" ${st}/>
    <path data-fill d="M260 180 L320 140 L320 220 Z" fill="#fff" ${st}/>
    <path data-fill d="M160 128 Q180 100 205 128 Z" fill="#fff" ${st}/>
    <circle cx="130" cy="170" r="7" fill="#2d3436"/>
    <path d="M105 195 Q118 202 130 196" fill="none" ${st}/>
    <path d="M170 140 Q175 180 170 220 M200 138 Q205 180 200 222" fill="none" ${st}/>
    <circle data-fill cx="80" cy="90" r="12" fill="#fff" ${st}/>
    <circle data-fill cx="60" cy="60" r="8" fill="#fff" ${st}/>
    <path data-fill d="M40 400 Q50 320 70 400 Z" fill="#fff" ${st}/>
    <path data-fill d="M90 400 Q100 340 120 400 Z" fill="#fff" ${st}/>
    <path data-fill d="M300 400 Q315 330 330 400 Z" fill="#fff" ${st}/>
    <path data-fill d="M320 280 Q340 260 360 280 Q380 300 360 310 Q340 320 320 310 Q300 300 320 280 Z" fill="#fff" ${st}/>`) },
  { id: 'monster', icon: '👾', name: 'Friendly Monster', svg: S(`
    <rect data-fill x="0" y="0" width="400" height="400" fill="#fff" ${st}/>
    <path data-fill d="M120 130 Q200 60 280 130 Q310 200 280 280 Q200 330 120 280 Q90 200 120 130 Z" fill="#fff" ${st}/>
    <circle data-fill cx="170" cy="180" r="28" fill="#fff" ${st}/>
    <circle data-fill cx="230" cy="180" r="28" fill="#fff" ${st}/>
    <circle cx="170" cy="180" r="10" fill="#2d3436"/><circle cx="230" cy="180" r="10" fill="#2d3436"/>
    <path data-fill d="M160 240 Q200 275 240 240 Q220 260 200 258 Q180 260 160 240 Z" fill="#fff" ${st}/>
    <path data-fill d="M140 95 Q135 55 165 60 Q155 85 152 100 Z" fill="#fff" ${st}/>
    <path data-fill d="M260 95 Q265 55 235 60 Q245 85 248 100 Z" fill="#fff" ${st}/>
    <ellipse data-fill cx="145" cy="330" rx="26" ry="14" fill="#fff" ${st}/>
    <ellipse data-fill cx="255" cy="330" rx="26" ry="14" fill="#fff" ${st}/>
    <circle data-fill cx="60" cy="320" r="20" fill="#fff" ${st}/>
    <circle data-fill cx="340" cy="80" r="18" fill="#fff" ${st}/>`) },
  { id: 'car', icon: '🚗', name: 'Racing Car', svg: S(`
    <rect data-fill x="0" y="0" width="400" height="400" fill="#fff" ${st}/>
    <path data-fill d="M60 250 L80 200 Q90 180 120 180 L160 140 Q170 130 190 130 L260 130 Q280 130 290 145 L320 185 Q345 190 350 210 L350 250 Z" fill="#fff" ${st}/>
    <circle data-fill cx="130" cy="255" r="35" fill="#fff" ${st}/>
    <circle data-fill cx="290" cy="255" r="35" fill="#fff" ${st}/>
    <circle data-fill cx="130" cy="255" r="14" fill="#fff" ${st}/>
    <circle data-fill cx="290" cy="255" r="14" fill="#fff" ${st}/>
    <path data-fill d="M175 145 L250 145 L270 180 L165 180 Z" fill="#fff" ${st}/>
    <rect data-fill x="0" y="300" width="400" height="30" fill="#fff" ${st}/>
    <circle data-fill cx="340" cy="70" r="28" fill="#fff" ${st}/>
    <path data-fill d="M40 80 Q60 60 85 80 Q105 95 85 105 L45 105 Q25 95 40 80 Z" fill="#fff" ${st}/>`) }
];

L.route('colouring', (pageId) => {
  if (pageId) {
    const page = PAGES.find((p) => p.id === pageId);
    if (page) { colourPage(page); return; }
  }
  const body = L.page('Colouring', { speak: 'Pick a picture to colour in!', backTo: 'home' });
  const grid = h('div', { class: 'menu-grid' });
  PAGES.forEach((p) => grid.appendChild(L.bigButton(p.icon, p.name, () => L.go('colouring', p.id))));
  body.appendChild(grid);
});

function colourPage(page) {
  const body = L.page(page.icon + ' ' + page.name, { speak: 'Pick a colour, then tap a part of the picture to fill it in!', backTo: 'colouring' });
  let colour = PALETTE[0];
  const undoStack = [], redoStack = [];

  const colourBar = h('div', { class: 'tool-bar', role: 'toolbar', 'aria-label': 'colours' });
  PALETTE.forEach((c, i) => {
    const b = h('button', { class: 'swatch' + (i === 0 ? ' on' : ''), style: { background: c }, 'aria-label': 'colour ' + c });
    b.addEventListener('click', () => {
      colour = c;
      colourBar.querySelectorAll('.swatch').forEach((x) => x.classList.remove('on'));
      b.classList.add('on'); L.sfx('tap');
    });
    colourBar.appendChild(b);
  });

  const wrap = h('div', { class: 'colour-svg-wrap', html: page.svg });
  const svg = wrap.querySelector('svg');
  svg.querySelectorAll('[data-fill]').forEach((el) => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'colourable area');
    const fill = () => {
      undoStack.push({ el, prev: el.getAttribute('fill') });
      redoStack.length = 0;
      el.setAttribute('fill', colour);
      L.sfx('pop');
    };
    el.addEventListener('click', fill);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fill(); } });
  });

  function undo() { const a = undoStack.pop(); if (a) { redoStack.push({ el: a.el, prev: a.el.getAttribute('fill') }); a.el.setAttribute('fill', a.prev); L.sfx('tap'); } }
  function redo() { const a = redoStack.pop(); if (a) { undoStack.push({ el: a.el, prev: a.el.getAttribute('fill') }); a.el.setAttribute('fill', a.prev); L.sfx('tap'); } }

  function exportPNG(saveOnly) {
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800; canvas.height = 800;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 800, 800);
      ctx.drawImage(img, 0, 0, 800, 800);
      if (saveOnly) {
        const p = L.profile();
        const small = document.createElement('canvas');
        small.width = 300; small.height = 300;
        small.getContext('2d').drawImage(canvas, 0, 0, 300, 300);
        p.drawings.push({ date: L.todayKey(), data: small.toDataURL('image/jpeg', 0.7) });
        if (p.drawings.length > 12) p.drawings.shift();
        p.progress.creativity = (p.progress.creativity || 0) + 1;
        L.save();
        L.sfx('star');
        L.toast('Saved to your gallery! 💾');
      } else {
        L.download('lamora-colouring-' + page.id + '.png', canvas.toDataURL('image/png'));
        L.toast('Picture exported! 🖼️');
      }
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  }

  const actions = h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '10px' } },
    h('button', { class: 'btn soft', onclick: undo, 'aria-label': 'Undo' }, '↩️ Undo'),
    h('button', { class: 'btn soft', onclick: redo, 'aria-label': 'Redo' }, '↪️ Redo'),
    h('button', { class: 'btn secondary', onclick: () => exportPNG(true) }, '💾 Save'),
    h('button', { class: 'btn', onclick: () => exportPNG(false) }, '⬇️ Export PNG')
  );

  body.append(colourBar, wrap, actions);
}
})();
