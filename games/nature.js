/* Lamora — Nature & Our Planet: animals, habitats, recycling,
   weather, oceans, space and caring for the Earth. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

const HABITATS = [
  ['🐠', 'fish', 'Ocean', '🌊'], ['🐫', 'camel', 'Desert', '🏜️'], ['🐒', 'monkey', 'Rainforest', '🌴'],
  ['🐧', 'penguin', 'Icy Antarctica', '🧊'], ['🦉', 'owl', 'Forest', '🌲'], ['🐸', 'frog', 'Pond', '🪷'],
  ['🦁', 'lion', 'Savanna', '🌾'], ['🐐', 'mountain goat', 'Mountains', '⛰️'], ['🐋', 'whale', 'Ocean', '🌊'],
  ['🦜', 'parrot', 'Rainforest', '🌴']
];
const HABITAT_NAMES = ['Ocean', 'Desert', 'Rainforest', 'Icy Antarctica', 'Forest', 'Pond', 'Savanna', 'Mountains'];

const SOUNDS = [
  ['moo', '🐮', 'cow'], ['woof', '🐶', 'dog'], ['meow', '🐱', 'cat'], ['baa', '🐑', 'sheep'],
  ['oink', '🐷', 'pig'], ['neigh', '🐴', 'horse'], ['roar', '🦁', 'lion'], ['quack', '🦆', 'duck'],
  ['hoot', '🦉', 'owl'], ['buzz', '🐝', 'bee']
];

const RECYCLE = [
  ['🍌', 'banana peel', 'compost'], ['📰', 'newspaper', 'paper'], ['🥫', 'tin can', 'metal & glass'],
  ['🍾', 'glass bottle', 'metal & glass'], ['📦', 'cardboard box', 'paper'], ['🍎', 'apple core', 'compost'],
  ['🥛', 'plastic bottle', 'plastic'], ['🧃', 'juice carton', 'paper'], ['🥤', 'plastic cup', 'plastic'],
  ['🥚', 'egg shells', 'compost']
];
const BINS = ['paper', 'plastic', 'metal & glass', 'compost'];

const WEATHER = [
  ['☀️', 'sunny', 'Wear a sun hat!'], ['🌧️', 'rainy', 'Take an umbrella!'], ['❄️', 'snowy', 'Wear warm gloves!'],
  ['🌪️', 'windy', 'Hold on to your hat!'], ['⛈️', 'stormy', 'Stay cosy inside!'], ['🌫️', 'foggy', 'Hard to see far!']
];

const PLANETQ = [
  { prompt: 'Which planet do we live on?', options: ['Earth 🌍', 'Mars 🔴', 'Jupiter 🟠'], answer: 0, hint: 'It’s the blue and green one!', explain: 'We live on planet Earth — the blue planet!' },
  { prompt: 'What does Earth travel around?', options: ['The Sun ☀️', 'The Moon 🌙', 'A star far away'], answer: 0, hint: 'It keeps us warm and bright.', explain: 'Earth travels around the Sun once every year.' },
  { prompt: 'What lights up the sky at night?', options: ['The Moon 🌙', 'The Sun ☀️', 'A rainbow 🌈'], answer: 0, hint: 'It changes shape through the month!', explain: 'The Moon reflects the Sun’s light at night.' },
  { prompt: 'What are stars?', options: ['Giant balls of hot gas', 'Tiny lamps', 'Fireflies'], answer: 0, hint: 'Our Sun is one of them!', explain: 'Stars are giant balls of glowing hot gas, very far away.' },
  { prompt: 'Which planet is called the Red Planet?', options: ['Mars 🔴', 'Earth 🌍', 'Venus 🟡'], answer: 0, hint: 'Robots have driven on it!', explain: 'Mars looks red because of its rusty dust.' },
  { prompt: 'How much of Earth is covered by ocean?', options: ['More than half', 'A tiny bit', 'None'], answer: 0, hint: 'That’s why Earth looks blue from space.', explain: 'Oceans cover about 7 out of every 10 parts of Earth!' }
];

const CAREQ = [
  { prompt: 'Water is precious! When should the tap be off?', options: ['While brushing teeth', 'Never', 'Only at night'], answer: 0, hint: 'Save water when you are not using it.', explain: 'Turning the tap off while brushing saves lots of clean water!' },
  { prompt: 'What helps our planet?', options: ['Planting trees 🌳', 'Dropping litter', 'Leaving lights on'], answer: 0, hint: 'They clean the air for us.', explain: 'Trees clean the air and give homes to animals.' },
  { prompt: 'Where should litter go?', options: ['In the bin 🗑️', 'On the ground', 'In the river'], answer: 0, hint: 'Keep nature tidy!', explain: 'Litter goes in the bin so animals stay safe.' },
  { prompt: 'Which animals need our protection?', options: ['Endangered animals', 'Toy animals', 'No animals'], answer: 0, hint: 'There are only a few of them left.', explain: 'Endangered animals, like some tigers and turtles, need our help to survive.' },
  { prompt: 'What can we do with an old jam jar?', options: ['Reuse or recycle it', 'Throw it in a lake', 'Bury it'], answer: 0, hint: 'It can have a second life!', explain: 'Reusing and recycling means less rubbish for the planet.' }
];

const FOODCHAIN = [
  { prompt: 'What does a rabbit eat?', options: ['Grass 🌱', 'Fish 🐟', 'Rocks 🪨'], answer: 0, hint: 'Rabbits are plant eaters.', explain: 'Rabbits eat plants like grass — they are herbivores.' },
  { prompt: 'Grass → rabbit → ❓ What might come next?', options: ['Fox 🦊', 'Carrot 🥕', 'Bee 🐝'], answer: 0, hint: 'Who might hunt a rabbit?', explain: 'A fox eats the rabbit — that’s a food chain!' },
  { prompt: 'What do plants need to make food?', options: ['Sunlight ☀️', 'Moonlight 🌙', 'Sweets 🍬'], answer: 0, hint: 'It happens in daytime.', explain: 'Plants use sunlight, water and air to make their own food.' },
  { prompt: 'Which one is a plant eater?', options: ['Cow 🐮', 'Lion 🦁', 'Shark 🦈'], answer: 0, hint: 'It munches grass all day.', explain: 'Cows eat grass — lions and sharks eat meat.' }
];

function habitatQuiz() {
  return L.sample(HABITATS, 6).map(([icon, name, home]) => {
    const opts = L.shuffle(L.sample(HABITAT_NAMES.filter((x) => x !== home), 2).concat(home));
    return {
      prompt: `Where does the ${name} live?`,
      speak: `Where does the ${name} live?`,
      visual: icon,
      options: opts, answer: opts.indexOf(home),
      hint: `Think about what the ${name} needs to be happy.`,
      explain: `The ${name} lives in the ${home.toLowerCase()}.`
    };
  });
}

function soundQuiz() {
  return L.sample(SOUNDS, 6).map(([sound, icon, animal]) => {
    const opts = L.shuffle(L.sample(SOUNDS.filter((s) => s[0] !== sound), 3).map((s) => s[1]).concat(icon));
    return {
      prompt: `Which animal says "${sound}"?`,
      speak: `Which animal says ${sound}, ${sound}?`,
      options: opts, answer: opts.indexOf(icon),
      hint: `Listen: ${sound}! ${sound}!`,
      explain: `The ${animal} says ${sound}!`
    };
  });
}

function recycleQuiz() {
  return L.sample(RECYCLE, 6).map(([icon, name, bin]) => {
    const opts = L.shuffle(BINS.slice());
    return {
      prompt: `Which bin for the ${name}?`,
      speak: `Sort it! Which bin does the ${name} go in?`,
      visual: icon,
      options: opts, answer: opts.indexOf(bin),
      hint: bin === 'compost' ? 'Food scraps become soil!' : `Think about what the ${name} is made of.`,
      explain: `The ${name} goes in the ${bin} bin.`
    };
  });
}

function weatherQuiz() {
  return L.sample(WEATHER, 5).map(([icon, name, tip]) => {
    const opts = L.shuffle(L.sample(WEATHER.filter((w) => w[1] !== name), 2).map((w) => w[1]).concat(name));
    return {
      prompt: 'What weather is this?',
      speak: 'Look at the sky picture. What weather is this?',
      visual: icon,
      options: opts, answer: opts.indexOf(name),
      hint: tip,
      explain: `It’s ${name}! ${tip}`
    };
  });
}

/* Build a healthy ocean: choose what belongs in a clean, happy ocean. */
function oceanBuilder() {
  const GOOD = [['🐠', 'colourful fish'], ['🐢', 'sea turtle'], ['🪸', 'coral'], ['🐬', 'dolphin'], ['🌿', 'sea grass'], ['🦀', 'crab']];
  const BAD = [['🛍️', 'plastic bag'], ['🥤', 'plastic cup'], ['🛢️', 'oil barrel'], ['👟', 'old shoe']];
  const body = L.page('🌊 Build a Healthy Ocean', { speak: 'Let’s build a healthy ocean! Add the things that belong, and leave out the rubbish.', backTo: 'nature' });
  const stage = h('div', { class: 'scene-stage', style: { background: 'linear-gradient(#74b9ff,#0984e3)' } });
  const msg = h('div', { class: 'chess-msg', 'aria-live': 'polite' }, 'Tap everything that belongs in a healthy ocean!');
  const tray = h('div', { class: 'quiz-options' });
  body.append(msg, stage, tray);
  let placed = 0, wrongTaps = 0;
  L.shuffle(GOOD.concat(BAD)).forEach(([icon, name]) => {
    const good = GOOD.some((g) => g[0] === icon);
    const b = h('button', { class: 'option-btn', 'aria-label': name }, icon);
    b.addEventListener('click', () => {
      if (b.disabled) return;
      if (good) {
        b.disabled = true; b.classList.add('correct');
        stage.appendChild(h('span', { class: 'placed', style: { left: L.rand(10, 90) + '%', top: L.rand(15, 85) + '%' } }, icon));
        placed++; L.sfx('pop');
        msg.textContent = `The ${name} loves its clean ocean home! 🌊`;
        if (placed === GOOD.length) {
          const p = L.profile();
          if (p && !p.natureBadges.includes('ocean')) p.natureBadges.push('ocean');
          L.completeActivity({ skill: 'nature', stars: Math.max(2, 4 - wrongTaps), onAgain: oceanBuilder });
        }
      } else {
        wrongTaps++;
        b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 450);
        L.sfx('wrong');
        msg.textContent = `Oh no — a ${name} doesn’t belong in the ocean! It goes in the bin.`;
      }
    });
    tray.appendChild(b);
  });
}

/* Plant a virtual garden: tap the steps in the right order. */
function garden() {
  const STEPS = [['🕳️', 'Dig a little hole'], ['🌰', 'Plant the seed'], ['💧', 'Water it'], ['☀️', 'Give it sunshine'], ['🌻', 'Watch it grow!']];
  const body = L.page('🌻 Plant a Garden', { speak: 'Let’s plant a garden! Tap the steps in the right order.', backTo: 'nature' });
  const msg = h('div', { class: 'chess-msg' }, 'What do we do first?');
  const grid = h('div', { class: 'quiz-options' });
  const stage = h('div', { class: 'quiz-visual', 'aria-live': 'polite' }, '🟫🟫🟫');
  body.append(msg, stage, h('div', { class: 'card' }, grid));
  let need = 0, slips = 0;
  const SHOW = ['🟫🕳️🟫', '🟫🌰🟫', '🟫💧🌱', '☀️🌱☀️', '🌻🌻🌻'];
  L.shuffle(STEPS).forEach(([icon, name], _, arr) => {
    const b = h('button', { class: 'option-btn', 'aria-label': name }, icon + ' ' + name);
    b.style.fontSize = '1.05rem';
    b.addEventListener('click', () => {
      if (b.disabled) return;
      if (name === STEPS[need][1]) {
        b.disabled = true; b.classList.add('correct');
        stage.textContent = SHOW[need];
        need++; L.sfx('pop');
        msg.textContent = need < STEPS.length ? 'Lovely! What comes next?' : 'Your flower grew! 🌻';
        if (need === STEPS.length) {
          const p = L.profile();
          if (p && !p.natureBadges.includes('garden')) p.natureBadges.push('garden');
          L.completeActivity({ skill: 'nature', stars: Math.max(2, 4 - slips), onAgain: garden });
        }
      } else {
        slips++; L.sfx('wrong');
        b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 450);
        msg.textContent = 'Hmm, not yet — what would a gardener do first?';
      }
    });
    grid.appendChild(b);
  });
}

function natureMemory() {
  L.memoryPairs({
    title: '🌿 Nature Memory',
    icons: ['🦋', '🐞', '🌸', '🍄', '🦔', '🐿️', '🌈', '🍁'],
    pairs: L.ageBand() === 'young' ? 4 : 6,
    backTo: 'nature',
    onWin: () => L.completeActivity({ skill: 'nature', stars: 3, onAgain: natureMemory })
  });
}

const SECTIONS = [
  { id: 'habitats', icon: '🏠', name: 'Animal Homes', run: () => quiz('🏠 Animal Homes', habitatQuiz()) },
  { id: 'sounds', icon: '🔊', name: 'Animal Sounds', run: () => quiz('🔊 Animal Sounds', soundQuiz()) },
  { id: 'recycle', icon: '♻️', name: 'Recycling Sort', run: () => quiz('♻️ Recycling Sort', recycleQuiz()) },
  { id: 'ocean', icon: '🌊', name: 'Healthy Ocean', run: oceanBuilder },
  { id: 'garden', icon: '🌻', name: 'Plant a Garden', run: garden },
  { id: 'weather', icon: '⛅', name: 'Weather Watch', run: () => quiz('⛅ Weather Watch', weatherQuiz()) },
  { id: 'space', icon: '🪐', name: 'Space & Planets', run: () => quiz('🪐 Space & Planets', L.sample(PLANETQ, 5)) },
  { id: 'care', icon: '💚', name: 'Care for Earth', run: () => quiz('💚 Care for Earth', L.sample(CAREQ, 5)) },
  { id: 'food', icon: '🥕', name: 'Food Chains', run: () => quiz('🥕 Food Chains', L.sample(FOODCHAIN, 4)) },
  { id: 'memory', icon: '🃏', name: 'Nature Memory', run: natureMemory }
];

function quiz(title, questions) {
  L.runQuiz({
    title, skill: 'nature', backTo: 'nature', questions,
    onAgain: () => { const s = SECTIONS.find((x) => title.includes(x.name)); if (s) s.run(); else L.go('nature'); }
  });
}

L.route('nature', (id) => {
  if (id) {
    const s = SECTIONS.find((x) => x.id === id);
    if (s) { s.run(); return; }
  }
  const p = L.profile();
  const body = L.page('Nature & Our Planet', { speak: 'Let’s explore nature and look after our planet!', backTo: 'explore' });
  if (p && p.natureBadges.length) {
    body.appendChild(h('p', { class: 'center' }, h('span', { class: 'pill' }, `🌿 Nature badges: ${p.natureBadges.length}`)));
  }
  const grid = h('div', { class: 'menu-grid' });
  SECTIONS.forEach((s) => grid.appendChild(L.bigButton(s.icon, s.name, () => L.go('nature', s.id))));
  body.appendChild(grid);
});
})();
