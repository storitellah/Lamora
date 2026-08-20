/* Lamora — Learn to Read.
   A gentle reading journey: letter sounds → blending short words →
   first sight words → everyday real-world words → reading a sentence.
   Every word comes with a picture so meaning is never a mystery. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

/* Simple consonant-vowel-consonant words with pictures for blending. */
const CVC = [
  ['cat', '🐱'], ['dog', '🐶'], ['pig', '🐷'], ['sun', '☀️'], ['bus', '🚌'],
  ['hat', '🎩'], ['cup', '☕'], ['box', '📦'], ['bed', '🛏️'], ['pen', '🖊️'],
  ['jam', '🍓'], ['fox', '🦊'], ['map', '🗺️'], ['van', '🚐'], ['bag', '🎒'],
  ['web', '🕸️'], ['net', '🥅'], ['bee', '🐝'], ['pot', '🍲'], ['key', '🔑']
];

/* Real-world everyday objects — this is more than a mermaid app! */
const OBJECTS = [
  ['house', '🏠'], ['chair', '🪑'], ['bed', '🛏️'], ['cup', '☕'], ['spoon', '🥄'],
  ['fork', '🍴'], ['plate', '🍽️'], ['book', '📚'], ['clock', '🕐'], ['key', '🔑'],
  ['shoe', '👟'], ['sock', '🧦'], ['hat', '🎩'], ['ball', '⚽'], ['car', '🚗'],
  ['bus', '🚌'], ['phone', '📱'], ['lamp', '💡'], ['door', '🚪'], ['brush', '🪥'],
  ['bag', '🎒'], ['window', '🪟'], ['bowl', '🥣'], ['toothbrush', '🪥']
];

const SIGHT = [
  ['the', '👉'], ['and', '➕'], ['is', '🟰'], ['it', '👆'], ['you', '🫵'],
  ['see', '👀'], ['go', '🟢'], ['we', '👨‍👩‍👧'], ['like', '❤️'], ['to', '➡️'],
  ['me', '🙋'], ['my', '🤗'], ['look', '👀'], ['can', '💪'], ['here', '📍']
];

const SENTENCES = [
  ['I see a big dog.', '🐶', ['🐶', '🐱', '🐟']],
  ['The cat is on the mat.', '🐱', ['🐱', '🐭', '🐰']],
  ['We go to the park.', '🏞️', ['🏞️', '🏫', '🏥']],
  ['I like red apples.', '🍎', ['🍎', '🍌', '🍇']],
  ['The sun is hot.', '☀️', ['☀️', '❄️', '🌧️']],
  ['My bag is here.', '🎒', ['🎒', '👟', '📱']]
];

/* ---- Blend It: read a CVC word sound by sound, then pick the picture ---- */
function blendIt() {
  const rounds = L.sample(CVC, 5);
  let round = 0, slips = 0;
  const body = L.page('🔤 Blend It', { speak: 'Read the word sound by sound, then tap the picture it matches.', backTo: 'reading' });
  const dots = h('div', { class: 'progress-dots' }, rounds.map(() => h('span', { class: 'dot' })));
  const wordEl = h('div', { class: 'read-word', 'aria-live': 'polite' });
  const msg = h('div', { class: 'hint-box' }, 'Sound out each letter…');
  const opts = h('div', { class: 'quiz-options' });
  body.append(dots, h('div', { class: 'card' }, wordEl, msg, opts));

  function start() {
    const [word, pic] = rounds[round];
    dots.querySelectorAll('.dot').forEach((d, i) => d.className = 'dot' + (i < round ? ' done' : i === round ? ' now' : ''));
    // reveal letters one at a time to model blending
    wordEl.innerHTML = '';
    const spans = word.split('').map((c) => h('span', {}, c.toUpperCase()));
    spans.forEach((s) => wordEl.appendChild(s));
    msg.textContent = 'Sound out each letter…';
    let i = 0;
    const timers = [];
    const step = () => {
      spans.forEach((s) => s.classList.remove('lit'));
      if (i < spans.length) { spans[i].classList.add('lit'); L.sfx('pop'); i++; timers.push(setTimeout(step, 650)); }
      else { msg.textContent = `Now blend them: "${word}". Which picture is it?`; showOptions(word, pic); }
    };
    timers.push(setTimeout(step, 400));
    L.onLeave(() => timers.forEach(clearTimeout));
  }

  function showOptions(word, pic) {
    opts.innerHTML = '';
    const others = L.sample(CVC.filter((c) => c[0] !== word), 2).map((c) => c[1]);
    const list = L.shuffle(others.concat(pic));
    list.forEach((emoji) => {
      const b = h('button', { class: 'option-btn', 'aria-label': 'picture' }, emoji);
      b.addEventListener('click', () => {
        if (b.disabled) return;
        if (emoji === pic) {
          b.classList.add('correct'); L.sfx('correct');
          opts.querySelectorAll('button').forEach((x) => (x.disabled = true));
          msg.textContent = `Yes! You read "${word}"! 🎉`;
          setTimeout(() => {
            round++;
            if (round < rounds.length) start();
            else L.completeActivity({ skill: 'reading', stars: Math.max(2, 5 - Math.floor(slips / 2)), onAgain: blendIt });
          }, 900);
        } else {
          slips++; b.classList.add('wrong'); b.disabled = true; L.sfx('wrong');
          msg.textContent = `Say it slowly: ${word.split('').join('-')}. Try again!`;
        }
      });
      opts.appendChild(b);
    });
  }
  start();
}

/* ---- word→picture quiz used by First Words & Everyday Things ---- */
function wordPictureQuiz(title, pairs, skill, again, readWordAsPrompt) {
  const questions = L.sample(pairs, Math.min(6, pairs.length)).map(([word, pic]) => {
    if (readWordAsPrompt) {
      // show the written word, choose the matching picture (reading practice)
      const opts = L.shuffle(L.sample(pairs.filter((p) => p[0] !== word), 2).map((p) => p[1]).concat(pic));
      return {
        prompt: `Read the word: "${word}"`,
        visual: '',
        options: opts, answer: opts.indexOf(pic),
        hint: `It starts with the sound "${word[0]}".`,
        explain: `"${word}" looks like ${pic}.`
      };
    }
    // show the picture, choose the written word (word recognition)
    const opts = L.shuffle(L.sample(pairs.filter((p) => p[0] !== word), 2).map((p) => p[0]).concat(word));
    return {
      prompt: 'Which word matches the picture?',
      visual: pic,
      options: opts, answer: opts.indexOf(word),
      hint: `It starts with the letter "${word[0].toUpperCase()}".`,
      explain: `This is "${word}".`
    };
  });
  L.runQuiz({ title, skill, backTo: 'reading', questions, onAgain: again });
}

/* ---- Everyday Things: flashcards of real objects ---- */
function objectCards() {
  const body = L.page('🏠 Everyday Things', { speak: 'These are real things from your day. Tap a card, then try the quiz!', backTo: 'reading' });
  const grid = h('div', { class: 'flash-grid' });
  OBJECTS.forEach(([word, pic]) => {
    const card = h('button', { class: 'flash-card', 'aria-label': word },
      h('span', { class: 'pic', 'aria-hidden': 'true' }, pic),
      h('span', { class: 'term' }, word)
    );
    card.addEventListener('click', () => { L.sfx('pop'); card.classList.toggle('flash-lift'); });
    grid.appendChild(card);
  });
  body.appendChild(grid);
  body.appendChild(h('div', { class: 'center', style: { marginTop: '16px' } },
    h('button', { class: 'btn', onclick: () => wordPictureQuiz('🏠 Everyday Things', OBJECTS, 'reading', () => wordPictureQuiz('🏠 Everyday Things', OBJECTS, 'reading', objectCards, true), true) }, '⭐ Read & match')
  ));
}

/* ---- Read a Sentence: read a short sentence, tap the matching picture ---- */
function readSentence() {
  const questions = L.sample(SENTENCES, SENTENCES.length).map(([sentence, pic, options]) => {
    const list = L.shuffle(options.slice());
    return {
      prompt: sentence,
      speak: sentence,
      options: list, answer: list.indexOf(pic),
      hint: 'Read the sentence slowly, word by word.',
      explain: 'Great reading! The sentence matches this picture.'
    };
  });
  L.runQuiz({ title: '📕 Read a Sentence', skill: 'reading', backTo: 'reading', questions, onAgain: readSentence });
}

const SECTIONS = [
  { id: 'blend', icon: '🔤', name: 'Blend It', sub: 'sound out words', run: blendIt },
  { id: 'first', icon: '👀', name: 'First Words', sub: 'sight reading', run: () => wordPictureQuiz('👀 First Words', SIGHT, 'reading', () => SECTIONS[1].run(), true) },
  { id: 'objects', icon: '🏠', name: 'Everyday Things', sub: 'real objects', run: objectCards },
  { id: 'sentence', icon: '📕', name: 'Read a Sentence', sub: 'put it together', run: readSentence }
];

L.route('reading', (id) => {
  if (id) {
    const s = SECTIONS.find((x) => x.id === id);
    if (s) { s.run(); return; }
  }
  const body = L.page('Learn to Read', { speak: 'Let’s learn to read, step by step. Pick where to start!', backTo: 'home' });
  body.appendChild(h('p', { class: 'center' }, h('span', { class: 'pill' }, '📖 Every word has a picture to help you!')));
  const grid = h('div', { class: 'menu-grid' });
  SECTIONS.forEach((s) => grid.appendChild(L.bigButton(s.icon, s.name, () => L.go('reading', s.id), s.sub)));
  body.appendChild(grid);
});
})();
