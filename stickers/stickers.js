/* Lamora — Sticker Book: earn stickers with stars, browse the
   collection, and build sticker scenes. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

const CATALOG = [
  { icon: '🧜‍♀️', name: 'Merry Mermaid', theme: 'mermaids' },
  { icon: '🐬', name: 'Splashy Dolphin', theme: 'dolphins' },
  { icon: '🐉', name: 'Sparky Dragon', theme: 'dragons' },
  { icon: '🦖', name: 'Rex the Dino', theme: 'dinosaurs' },
  { icon: '⭐', name: 'Shiny Star', theme: 'stars' },
  { icon: '🌈', name: 'Big Rainbow', theme: 'rainbows' },
  { icon: '🪐', name: 'Ringed Planet', theme: 'planets' },
  { icon: '🦁', name: 'Brave Lion', theme: 'animals' },
  { icon: '🌸', name: 'Happy Blossom', theme: 'flowers' },
  { icon: '🚂', name: 'Choo-Choo Train', theme: 'vehicles' },
  { icon: '📷', name: 'Snap Camera', theme: 'cameras' },
  { icon: '📚', name: 'Story Books', theme: 'books' },
  { icon: '🎸', name: 'Rock Guitar', theme: 'music' },
  { icon: '🍦', name: 'Ice-cream Dream', theme: 'food' },
  { icon: '⚽', name: 'Super Striker', theme: 'sports' },
  { icon: '😄', name: 'Sunny Smile', theme: 'smileys' },
  { icon: '👩‍🚒', name: 'Fire Hero', theme: 'professions' },
  { icon: '🌳', name: 'Wise Oak', theme: 'nature' },
  { icon: '🐙', name: 'Giggly Octopus', theme: 'ocean' },
  { icon: '🦋', name: 'Flutter Wings', theme: 'nature' },
  { icon: '🚀', name: 'Zoom Rocket', theme: 'planets' },
  { icon: '🧁', name: 'Sweet Cupcake', theme: 'food' },
  { icon: '🐢', name: 'Slow-mo Turtle', theme: 'ocean' },
  { icon: '🎨', name: 'Paint Palette', theme: 'professions' },
  { icon: '🦕', name: 'Long-neck Pal', theme: 'dinosaurs' },
  { icon: '🐠', name: 'Rainbow Fish', theme: 'ocean' },
  { icon: '👨‍🚀', name: 'Space Explorer', theme: 'professions' },
  { icon: '🌻', name: 'Tall Sunflower', theme: 'flowers' },
  { icon: '🚁', name: 'Whirly Copter', theme: 'vehicles' },
  { icon: '🥁', name: 'Boom Drum', theme: 'music' }
];

const SCENE_BGS = [
  ['Under the sea', 'linear-gradient(#74b9ff,#0984e3)'],
  ['Meadow', 'linear-gradient(#aee9ff,#8fd18f)'],
  ['Space', 'linear-gradient(#2b2e5e,#5b5ea6)'],
  ['Sunset beach', 'linear-gradient(#ffd29d,#f7b267)'],
  ['Dragon castle', 'linear-gradient(#c7b8ff,#8d80d8)']
];

window.LamoraStickers = {
  unlockNext(profile) {
    const next = CATALOG.find((s) => !profile.stickers.includes(s.icon));
    if (!next) return null;
    profile.stickers.push(next.icon);
    return next;
  },
  earnedIcons() {
    const p = L.profile();
    return p ? p.stickers.slice() : [];
  }
};

L.route('stickers', (mode) => {
  if (mode === 'scene') { sceneBuilder(); return; }
  const p = L.profile();
  const rw = L.rewardStyle();
  const body = L.page('Sticker Book', { speak: `You have ${p.stickers.length} stickers! Earn more by learning and playing!`, backTo: 'home' });
  body.appendChild(h('p', { class: 'center' },
    h('span', { class: 'pill' }, `🦄 ${p.stickers.length} of ${CATALOG.length} collected · earn ${rw.name.toLowerCase()} to unlock more!`)));
  const grid = h('div', { class: 'sticker-grid' });
  CATALOG.forEach((s) => {
    const got = p.stickers.includes(s.icon);
    const cell = h('button', {
      class: 'sticker-cell' + (got ? '' : ' locked'),
      'aria-label': got ? s.name : 'locked sticker',
      onclick: () => {
        if (got) { L.sfx('pop'); L.toast(s.icon + ' ' + s.name); }
        else { L.sfx('tap'); L.toast('Keep learning to unlock this sticker! 🌟'); }
      }
    }, got ? s.icon : '❔');
    grid.appendChild(cell);
  });
  body.appendChild(grid);
  body.appendChild(h('div', { class: 'center', style: { marginTop: '16px' } },
    h('button', { class: 'btn', onclick: () => L.go('stickers', 'scene') }, '🖼️ Build a sticker scene')
  ));
});

function sceneBuilder() {
  const p = L.profile();
  const body = L.page('Sticker Scene', { speak: 'Build a picture! Tap a sticker, then tap the scene to place it. Drag stickers to move them.', backTo: 'stickers' });
  let bg = SCENE_BGS[0][1];
  let picked = null;
  const placed = []; // {icon, x, y} in percent

  const stage = h('div', { class: 'scene-stage', style: { background: bg }, 'aria-label': 'sticker scene' });

  const bgBar = h('div', { class: 'tool-bar' });
  SCENE_BGS.forEach(([name, grad]) => {
    bgBar.appendChild(h('button', { class: 'btn soft small', onclick: () => { bg = grad; stage.style.background = grad; L.sfx('tap'); } }, name));
  });

  const available = ['⭐', '🌸', '🐟', '☁️', '🌈'].concat(p.stickers);
  const tray = h('div', { class: 'tool-bar', 'aria-label': 'stickers to place' });
  available.forEach((icon) => {
    const b = h('button', { class: 'tool-btn', 'aria-label': 'sticker ' + icon }, icon);
    b.addEventListener('click', () => {
      picked = icon;
      tray.querySelectorAll('.tool-btn').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      L.sfx('tap');
    });
    tray.appendChild(b);
  });

  stage.addEventListener('pointerdown', (e) => {
    if (e.target !== stage || !picked) return;
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    addSticker(picked, x, y);
    L.sfx('pop');
  });

  function addSticker(icon, x, y) {
    const el = h('span', { class: 'placed', style: { left: x + '%', top: y + '%' } }, icon);
    const item = { icon, x, y, el };
    placed.push(item);
    let dragging = false;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      dragging = true;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const r = stage.getBoundingClientRect();
      item.x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      item.y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
      el.style.left = item.x + '%'; el.style.top = item.y + '%';
    });
    el.addEventListener('pointerup', () => (dragging = false));
    el.addEventListener('dblclick', () => { placed.splice(placed.indexOf(item), 1); el.remove(); L.sfx('tap'); });
    stage.appendChild(el);
  }

  function exportScene() {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 525;
    const ctx = canvas.getContext('2d');
    // approximate the gradient background
    const colours = bg.match(/#[0-9a-f]{6}/gi) || ['#74b9ff', '#0984e3'];
    const g = ctx.createLinearGradient(0, 0, 0, 525);
    g.addColorStop(0, colours[0]); g.addColorStop(1, colours[1] || colours[0]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 800, 525);
    ctx.font = '64px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    placed.forEach((s) => ctx.fillText(s.icon, (s.x / 100) * 800, (s.y / 100) * 525));
    L.download('lamora-scene.png', canvas.toDataURL('image/png'));
    L.toast('Scene exported! 🖼️');
  }

  body.append(
    h('p', { class: 'small-note center' }, 'Tap a sticker below, then tap the scene. Drag to move · double-tap to remove.'),
    tray, stage, bgBar,
    h('div', { class: 'row', style: { justifyContent: 'center' } },
      h('button', { class: 'btn', onclick: exportScene }, '⬇️ Export PNG'),
      h('button', { class: 'btn secondary', onclick: () => {
        p.progress.creativity = (p.progress.creativity || 0) + 1;
        p.scenes.push({ date: L.todayKey(), bg, items: placed.map((s) => ({ icon: s.icon, x: s.x, y: s.y })) });
        if (p.scenes.length > 8) p.scenes.shift();
        L.save(); L.sfx('star'); L.toast('Scene saved! 💾');
      } }, '💾 Save')
    )
  );

  // restore last saved scene if there is one
  const last = p.scenes[p.scenes.length - 1];
  if (last) {
    bg = last.bg; stage.style.background = bg;
    last.items.forEach((s) => addSticker(s.icon, s.x, s.y));
  }
}
})();
