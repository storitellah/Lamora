/* Lamora — Literacy activities: letters, sounds, words, rhymes, reading. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LETTER_SOUNDS = {
  A: 'ah, like apple', B: 'buh, like ball', C: 'kuh, like cat', D: 'duh, like dog',
  E: 'eh, like egg', F: 'fff, like fish', G: 'guh, like goat', H: 'huh, like hat',
  I: 'ih, like igloo', J: 'juh, like jam', K: 'kuh, like kite', L: 'lll, like lion',
  M: 'mmm, like moon', N: 'nnn, like nest', O: 'oh, like octopus', P: 'puh, like pig',
  Q: 'kwuh, like queen', R: 'rrr, like rabbit', S: 'sss, like sun', T: 'tuh, like tiger',
  U: 'uh, like umbrella', V: 'vvv, like van', W: 'wuh, like water', X: 'ks, like box',
  Y: 'yuh, like yo-yo', Z: 'zzz, like zebra'
};
const WORDS = [
  ['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['bee', '🐝'], ['hat', '🎩'],
  ['fish', '🐟'], ['star', '⭐'], ['moon', '🌙'], ['frog', '🐸'], ['cake', '🍰'],
  ['bird', '🐦'], ['boat', '⛵'], ['tree', '🌳'], ['duck', '🦆'], ['ball', '⚽'],
  ['apple', '🍎'], ['house', '🏠'], ['snake', '🐍'], ['train', '🚂'], ['tiger', '🐯']
];
const RHYMES = [
  ['cat', ['hat', 'bat', 'mat'], ['dog', 'sun', 'cup', 'fish']],
  ['sun', ['fun', 'run', 'bun'], ['moon', 'sit', 'top', 'leg']],
  ['bee', ['tree', 'sea', 'key'], ['bat', 'cup', 'pig', 'box']],
  ['dog', ['frog', 'log', 'fog'], ['cat', 'hen', 'bus', 'map']],
  ['cake', ['lake', 'snake', 'rake'], ['fish', 'sock', 'bird', 'cow']],
  ['star', ['car', 'jar', 'far'], ['sun', 'bed', 'hat', 'net']]
];
const SIGHT = ['the', 'and', 'you', 'said', 'was', 'they', 'she', 'have', 'like', 'come', 'here', 'look'];
const SENTENCES = [
  ['The cat sat on the mat.', '🐱', ['🐱', '🐶', '🐟']],
  ['The fish can swim.', '🐟', ['🐟', '🐦', '🐱']],
  ['I see a big red bus.', '🚌', ['🚌', '✈️', '🚲']],
  ['The bird is in the tree.', '🐦', ['🐦', '🐸', '🐮']],
  ['We like to eat cake.', '🍰', ['🍰', '🥦', '🧊']],
  ['The frog can hop and hop.', '🐸', ['🐸', '🐌', '🐘']]
];
const MISSPELL = { cat: 'kat', fish: 'fesh', star: 'sdar', boat: 'bote', tree: 'tre', duck: 'duk', apple: 'appel', house: 'howse', train: 'trane', snake: 'snayk' };

function letterFind(n) {
  return Array.from({ length: n }, () => {
    const target = L.pick(ALPHA);
    const lower = Math.random() < 0.4 && L.ageBand() !== 'young';
    const shown = lower ? target.toLowerCase() : target;
    const opts = L.shuffle(L.sample(ALPHA.filter((x) => x !== target), 3).map((x) => lower ? x.toLowerCase() : x).concat(shown));
    return {
      prompt: `Find the letter ${target}!`,
      speak: `Can you find the letter ${target}?`,
      options: opts, answer: opts.indexOf(shown),
      hint: `${target} says ${LETTER_SOUNDS[target]}.`,
      explain: `This is the letter ${target}.`
    };
  });
}

function letterSound(n) {
  return Array.from({ length: n }, () => {
    const target = L.pick(ALPHA);
    const opts = L.shuffle(L.sample(ALPHA.filter((x) => x !== target), 3).concat(target));
    return {
      prompt: `Which letter says "${LETTER_SOUNDS[target]}"?`,
      options: opts, answer: opts.indexOf(target),
      hint: `Say it out loud: ${LETTER_SOUNDS[target]}!`,
      explain: `${target} says ${LETTER_SOUNDS[target]}.`
    };
  });
}

function caseMatch(n) {
  return Array.from({ length: n }, () => {
    const target = L.pick(ALPHA);
    const opts = L.shuffle(L.sample(ALPHA.filter((x) => x !== target), 3).concat(target).map((x) => x.toLowerCase()));
    return {
      prompt: `Match the big letter ${target} to its little letter!`,
      speak: `Find the small letter that matches big ${target}.`,
      visual: target,
      options: opts, answer: opts.indexOf(target.toLowerCase()),
      hint: 'Big and small letters are a team!',
      explain: `Big ${target} and small ${target.toLowerCase()} go together.`
    };
  });
}

function rhyming(n) {
  return Array.from({ length: n }, () => {
    const [word, rhymes, others] = L.pick(RHYMES);
    const answer = L.pick(rhymes);
    const opts = L.shuffle(L.sample(others, 2).concat(answer));
    return {
      prompt: `Which word rhymes with "${word}"?`,
      speak: `Which word rhymes with ${word}?`,
      options: opts, answer: opts.indexOf(answer),
      hint: `Rhyming words end with the same sound, like ${word}.`,
      explain: `${answer} rhymes with ${word} — they sound the same at the end!`
    };
  });
}

function sightWords(n) {
  return Array.from({ length: n }, () => {
    const target = L.pick(SIGHT);
    const opts = L.shuffle(L.sample(SIGHT.filter((x) => x !== target), 3).concat(target));
    return {
      prompt: `Find the word "${target}"!`,
      speak: `Can you find the word ${target}?`,
      options: opts, answer: opts.indexOf(target),
      hint: `Look for ${target.length} letters: ${target.split('').join(', ')}.`,
      explain: `That word is "${target}".`
    };
  });
}

function vocab(n) {
  return Array.from({ length: n }, () => {
    const [word, icon] = L.pick(WORDS);
    const opts = L.shuffle(L.sample(WORDS.filter((w) => w[0] !== word), 3).map((w) => w[0]).concat(word));
    return {
      prompt: 'What is this?',
      speak: 'What is this? Tap the word.',
      visual: icon,
      options: opts, answer: opts.indexOf(word),
      hint: `It starts with the letter ${word[0].toUpperCase()}.`,
      explain: `That is a ${word}.`
    };
  });
}

function spelling(n) {
  const keys = Object.keys(MISSPELL);
  return Array.from({ length: n }, () => {
    const word = L.pick(keys);
    const icon = (WORDS.find((w) => w[0] === word) || ['', '✨'])[1];
    const opts = L.shuffle([word, MISSPELL[word]]);
    return {
      prompt: 'Tap the correct spelling!',
      speak: `Which spelling of ${word} is right?`,
      visual: icon,
      options: opts, answer: opts.indexOf(word),
      hint: 'Sound it out slowly.',
      explain: `${word} is spelled ${word.split('').join(', ')}.`
    };
  });
}

function reading(n) {
  return L.sample(SENTENCES, Math.min(n, SENTENCES.length)).map(([sentence, icon, opts]) => {
    const list = L.shuffle(opts.slice());
    return {
      prompt: sentence,
      speak: 'Read the sentence, then tap the matching picture. ' + sentence,
      options: list, answer: list.indexOf(icon),
      hint: 'Read it once more, slowly.',
      explain: 'The sentence tells us about this picture.'
    };
  });
}

/* ---- word builder: tap letters in order to spell the word ---- */
function wordBuilder() {
  const band = L.ageBand();
  const pool = WORDS.filter(([w]) => band === 'young' ? w.length <= 3 : band === 'mid' ? w.length <= 4 : true);
  const rounds = L.sample(pool.length >= 5 ? pool : WORDS, 5);
  let round = 0, mistakes = 0;

  const body = L.page('🔡 Word Builder', { speak: 'Tap the letters in order to build the word!', backTo: 'literacy' });
  const iconEl = h('div', { class: 'quiz-visual' });
  const slotsEl = h('div', { class: 'quiz-visual', style: { letterSpacing: '8px', fontFamily: 'var(--font-display)' } });
  const lettersEl = h('div', { class: 'quiz-options' });
  const hintEl = h('div', { class: 'hint-box', 'aria-live': 'polite' });
  const dots = h('div', { class: 'progress-dots' }, rounds.map(() => h('span', { class: 'dot' })));
  body.append(dots, h('div', { class: 'card' }, iconEl, slotsEl, lettersEl, hintEl));

  function startRound() {
    const [word, icon] = rounds[round];
    let pos = 0;
    dots.querySelectorAll('.dot').forEach((d, i) => d.className = 'dot' + (i < round ? ' done' : i === round ? ' now' : ''));
    iconEl.textContent = icon;
    hintEl.textContent = '';
    const draw = () => { slotsEl.textContent = word.split('').map((c, i) => (i < pos ? c.toUpperCase() : '_')).join(' '); };
    draw();
    const extra = L.sample(ALPHA.filter((x) => !word.toUpperCase().includes(x)), 3);
    const letters = L.shuffle(word.toUpperCase().split('').concat(extra));
    lettersEl.innerHTML = '';
    letters.forEach((ch) => {
      const btn = h('button', { class: 'option-btn', 'aria-label': 'letter ' + ch }, ch);
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        if (ch === word[pos].toUpperCase()) {
          btn.disabled = true; btn.classList.add('correct');
          pos++; draw(); L.sfx('pop');
          if (pos === word.length) {
            L.sfx('correct');
            hintEl.textContent = `You built "${word}"! 🎉`;
            setTimeout(() => {
              round++;
              if (round < rounds.length) startRound();
              else L.completeActivity({ skill: 'literacy', stars: Math.max(1, 5 - Math.floor(mistakes / 2)), onAgain: () => L.go('literacy', 'build') });
            }, 1200);
          }
        } else {
          mistakes++;
          btn.classList.add('wrong');
          setTimeout(() => btn.classList.remove('wrong'), 450);
          L.sfx('wrong');
          hintEl.textContent = `💡 The next letter is "${word[pos].toUpperCase()}".`;
        }
      });
      lettersEl.appendChild(btn);
    });
  }
  startRound();
}

const ACTIVITIES = [
  { id: 'letters', icon: '🅰️', name: 'Find the Letter', gen: letterFind, bands: ['young', 'mid'] },
  { id: 'sounds', icon: '🔊', name: 'Letter Sounds', gen: letterSound, bands: ['young', 'mid'] },
  { id: 'case', icon: '🔠', name: 'Big & Small', gen: caseMatch, bands: ['young', 'mid'] },
  { id: 'build', icon: '🔡', name: 'Word Builder', custom: wordBuilder, bands: ['young', 'mid', 'old'] },
  { id: 'vocab', icon: '🖼️', name: 'Word Pictures', gen: vocab, bands: ['young', 'mid'] },
  { id: 'rhyme', icon: '🎵', name: 'Rhyme Time', gen: rhyming, bands: ['mid', 'old'] },
  { id: 'sight', icon: '👀', name: 'Sight Words', gen: sightWords, bands: ['mid', 'old'] },
  { id: 'spell', icon: '✏️', name: 'Super Speller', gen: spelling, bands: ['mid', 'old'] },
  { id: 'read', icon: '📖', name: 'Read & Match', gen: reading, bands: ['mid', 'old'] }
];

L.route('literacy', (activityId) => {
  if (activityId) {
    const act = ACTIVITIES.find((a) => a.id === activityId);
    if (act) {
      if (act.custom) { act.custom(); return; }
      L.runQuiz({
        title: act.icon + ' ' + act.name,
        speakTitle: act.name + '! Let’s go!',
        skill: 'literacy',
        backTo: 'literacy',
        questions: act.gen(6),
        onAgain: () => L.go('literacy', act.id)
      });
      return;
    }
  }
  const band = L.ageBand();
  const body = L.page('Letters & Words', { speak: 'Pick a letters and words activity!', backTo: 'learn' });
  const grid = h('div', { class: 'menu-grid' });
  ACTIVITIES.filter((a) => a.bands.includes(band)).forEach((a) => {
    grid.appendChild(L.bigButton(a.icon, a.name, () => L.go('literacy', a.id)));
  });
  body.appendChild(grid);
});
})();
