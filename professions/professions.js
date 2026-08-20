/* Lamora — "What Can I Be?" profession card studio.
   Privacy: an optional photo is read with FileReader and drawn onto a
   canvas ON THIS DEVICE ONLY. It is never uploaded, never analysed,
   never used for recognition, and is only stored if a grown-up presses
   Save. Delete removes it instantly. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

const PROFESSIONS = [
  { id: 'doctor', icon: '🩺', name: 'Doctor', title: 'Health Hero', skills: 'Kindness, science, listening', dream: 'I want to help people feel better.', colour: '#0984e3' },
  { id: 'teacher', icon: '🍎', name: 'Teacher', title: 'Knowledge Guide', skills: 'Patience, reading, explaining', dream: 'I want to help everyone learn.', colour: '#e17055' },
  { id: 'lawyer', icon: '⚖️', name: 'Lawyer', title: 'Fairness Champion', skills: 'Reading, speaking, fairness', dream: 'I want to stand up for what is right.', colour: '#6c5ce7' },
  { id: 'journalist', icon: '📰', name: 'Journalist', title: 'Truth Finder', skills: 'Curiosity, writing, questions', dream: 'I want to tell people true stories.', colour: '#2d3436' },
  { id: 'photographer', icon: '📷', name: 'Photographer', title: 'Moment Catcher', skills: 'Curiosity, patience, observation', dream: 'I want to tell stories with pictures.', colour: '#00b894' },
  { id: 'scientist', icon: '🔬', name: 'Scientist', title: 'Discovery Maker', skills: 'Wondering, testing, noticing', dream: 'I want to discover something new.', colour: '#00cec9' },
  { id: 'engineer', icon: '⚙️', name: 'Engineer', title: 'Problem Solver', skills: 'Building, maths, imagination', dream: 'I want to build amazing things.', colour: '#fdcb6e' },
  { id: 'pilot', icon: '✈️', name: 'Pilot', title: 'Sky Captain', skills: 'Focus, maps, calm thinking', dream: 'I want to fly above the clouds.', colour: '#74b9ff' },
  { id: 'farmer', icon: '🚜', name: 'Farmer', title: 'Food Grower', skills: 'Nature, hard work, care', dream: 'I want to grow food for everyone.', colour: '#55a630' },
  { id: 'artist', icon: '🎨', name: 'Artist', title: 'Colour Wizard', skills: 'Imagination, colours, practice', dream: 'I want to make the world beautiful.', colour: '#e84393' },
  { id: 'musician', icon: '🎸', name: 'Musician', title: 'Melody Maker', skills: 'Rhythm, listening, practice', dream: 'I want to make music that makes people smile.', colour: '#a29bfe' },
  { id: 'chef', icon: '👨‍🍳', name: 'Chef', title: 'Tasty Creator', skills: 'Tasting, mixing, sharing', dream: 'I want to cook delicious food.', colour: '#ff7675' },
  { id: 'architect', icon: '🏛️', name: 'Architect', title: 'Building Dreamer', skills: 'Drawing, maths, big ideas', dream: 'I want to design wonderful buildings.', colour: '#636e72' },
  { id: 'firefighter', icon: '🚒', name: 'Firefighter', title: 'Brave Rescuer', skills: 'Courage, teamwork, fitness', dream: 'I want to keep people safe.', colour: '#d63031' },
  { id: 'vet', icon: '🐾', name: 'Veterinarian', title: 'Animal Friend', skills: 'Gentleness, science, animal love', dream: 'I want to help animals feel better.', colour: '#e17055' },
  { id: 'astronaut', icon: '🚀', name: 'Astronaut', title: 'Star Voyager', skills: 'Science, fitness, bravery', dream: 'I want to explore space.', colour: '#30336b' },
  { id: 'marine', icon: '🐋', name: 'Marine Biologist', title: 'Ocean Explorer', skills: 'Swimming, science, patience', dream: 'I want to protect the ocean.', colour: '#0984e3' },
  { id: 'programmer', icon: '💻', name: 'Programmer', title: 'Code Wizard', skills: 'Logic, puzzles, creativity', dream: 'I want to build helpful apps.', colour: '#6c5ce7' }
];

L.route('professions', (id) => {
  if (id) {
    const prof = PROFESSIONS.find((p) => p.id === id);
    if (prof) { cardStudio(prof); return; }
  }
  const body = L.page('What Can I Be?', { speak: 'What do you want to be when you grow up? Pick a job and make your dream card!', backTo: 'home' });
  body.appendChild(h('p', { class: 'center small-note' }, 'Pick a profession and create your own dream card. Photos stay on this device only.'));
  const grid = h('div', { class: 'menu-grid' });
  PROFESSIONS.forEach((p) => grid.appendChild(L.bigButton(p.icon, p.name, () => L.go('professions', p.id))));
  body.appendChild(grid);
});

function cardStudio(prof) {
  const child = L.profile();
  const body = L.page(prof.icon + ' ' + prof.name + ' Card', {
    speak: `Let’s make your ${prof.name} dream card!`, backTo: 'professions'
  });

  let photo = null; // ImageBitmap/HTMLImageElement, local only
  let sticker = '⭐';

  const W = 640, H = 400;
  const canvas = h('canvas', { class: 'draw-surface', width: W, height: H, 'aria-label': prof.name + ' dream card preview' });
  const ctx = canvas.getContext('2d');

  const nameIn = h('input', { type: 'text', value: L.displayName(child), maxlength: '20', 'aria-label': 'Name on the card', placeholder: 'Name or nickname' });
  const dreamIn = h('input', { type: 'text', value: prof.dream, maxlength: '60', 'aria-label': 'Dream statement', placeholder: 'My dream…' });
  const toolIn = h('input', { type: 'text', value: defaultTool(prof.id), maxlength: '24', 'aria-label': 'Favourite tool', placeholder: 'Favourite tool' });
  [nameIn, dreamIn, toolIn].forEach((el) => el.addEventListener('input', draw));

  function defaultTool(id) {
    return ({ doctor: 'Stethoscope', photographer: 'Camera', chef: 'Wooden spoon', astronaut: 'Space helmet', artist: 'Paintbrush', programmer: 'Keyboard', firefighter: 'Fire hose', vet: 'Gentle hands', pilot: 'Compass', farmer: 'Tractor', musician: 'Guitar', scientist: 'Magnifying glass', engineer: 'Toolbox', architect: 'Pencil & ruler', teacher: 'Storybook', journalist: 'Notebook', lawyer: 'Law book', marine: 'Snorkel' })[id] || 'Curiosity';
  }

  function roundRect(x, y, w, hh, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + hh, r);
    ctx.arcTo(x + w, y + hh, x, y + hh, r);
    ctx.arcTo(x, y + hh, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // card background
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, prof.colour); g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    roundRect(0, 0, W, H, 26); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    roundRect(14, 14, W - 28, H - 28, 20); ctx.fill();

    // header
    ctx.fillStyle = prof.colour;
    roundRect(14, 14, W - 28, 64, 20); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`FUTURE ${prof.name.toUpperCase()}`, 34, 47);
    ctx.textAlign = 'right';
    ctx.font = '34px serif';
    ctx.fillText(prof.icon, W - 34, 47);

    // photo box
    const px = 34, py = 100, pw = 180, ph = 200;
    ctx.fillStyle = '#f0ecff';
    roundRect(px, py, pw, ph, 14); ctx.fill();
    ctx.save();
    roundRect(px, py, pw, ph, 14); ctx.clip();
    if (photo) {
      const scale = Math.max(pw / photo.width, ph / photo.height);
      const dw = photo.width * scale, dh = photo.height * scale;
      ctx.drawImage(photo, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
    } else {
      ctx.font = '90px serif';
      ctx.textAlign = 'center';
      ctx.fillText(prof.icon, px + pw / 2, py + ph / 2 + 8);
    }
    ctx.restore();
    ctx.strokeStyle = prof.colour; ctx.lineWidth = 4;
    roundRect(px, py, pw, ph, 14); ctx.stroke();

    // text fields
    ctx.fillStyle = '#2d3436';
    ctx.textAlign = 'left';
    const tx = 240;
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText((nameIn.value || 'Your Name').slice(0, 16), tx, 120);
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillStyle = '#5c5880';
    ctx.fillText('“' + prof.title + '”', tx, 148);
    ctx.fillStyle = '#2d3436';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText('Skills to learn:', tx, 186);
    ctx.font = '17px system-ui, sans-serif';
    wrapText(prof.skills, tx, 208, 360, 20);
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText('Favourite tool:', tx, 244);
    ctx.font = '17px system-ui, sans-serif';
    ctx.fillText((toolIn.value || '—').slice(0, 26), tx, 266);
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText('My dream:', tx, 302);
    ctx.font = 'italic 17px system-ui, sans-serif';
    wrapText('“' + (dreamIn.value || prof.dream) + '”', tx, 324, 360, 20);

    // sticker + footer
    ctx.font = '44px serif';
    ctx.fillText(sticker, W - 80, H - 52);
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillStyle = '#8a86a8';
    ctx.fillText('Lamora Dream Card ✦ made with love', 34, H - 34);
  }

  function wrapText(text, x, y, maxW, lh) {
    const words = String(text).split(' ');
    let line = '';
    for (const w of words) {
      if (ctx.measureText(line + w).width > maxW) { ctx.fillText(line, x, y); line = w + ' '; y += lh; }
      else line += w + ' ';
    }
    ctx.fillText(line.trim(), x, y);
  }

  /* local-only photo input — requires an explicit grown-up/child action */
  const fileIn = h('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, 'aria-hidden': 'true' });
  fileIn.addEventListener('change', () => {
    const f = fileIn.files && fileIn.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => { photo = img; draw(); L.toast('Photo added — it stays on this device only. 🔒'); };
      img.src = reader.result;
    };
    reader.readAsDataURL(f);
  });

  const stickerBar = h('div', { class: 'tool-bar', 'aria-label': 'card sticker' });
  ['⭐', '🌈', '💪', '🏅', '❤️', '✨'].concat(window.LamoraStickers ? window.LamoraStickers.earnedIcons().slice(0, 6) : []).forEach((s) => {
    const b = h('button', { class: 'tool-btn' + (s === sticker ? ' on' : ''), 'aria-label': 'sticker ' + s }, s);
    b.addEventListener('click', () => {
      sticker = s;
      stickerBar.querySelectorAll('.tool-btn').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      draw();
    });
    stickerBar.appendChild(b);
  });

  body.append(
    h('div', { class: 'card' },
      h('div', { class: 'stack' },
        h('label', {}, 'Name on the card: ', nameIn),
        h('label', {}, 'Favourite tool: ', toolIn),
        h('label', {}, 'My dream: ', dreamIn),
        stickerBar,
        h('div', { class: 'row' },
          h('button', { class: 'btn secondary', onclick: () => fileIn.click() }, '📷 Add photo (stays private)'),
          h('button', { class: 'btn soft', onclick: () => { photo = null; fileIn.value = ''; draw(); L.toast('Photo removed. 🔒'); } }, '🗑️ Remove photo')
        ),
        h('p', { class: 'small-note' }, '🔒 Photos are used only to draw this card, on this device. Nothing is uploaded, recognised or analysed — and nothing is kept unless you export the card yourself.')
      )
    ),
    h('div', { class: 'draw-canvas-wrap' }, canvas),
    fileIn,
    h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '10px' } },
      h('button', { class: 'btn', onclick: () => {
        L.download('lamora-dream-card.png', canvas.toDataURL('image/png'));
        const p = L.profile();
        if (p) { p.progress.creativity = (p.progress.creativity || 0) + 1; L.save(); }
        L.toast('Dream card exported! 🌟');
      } }, '⬇️ Export card as PNG')
    )
  );
  draw();
}
})();
