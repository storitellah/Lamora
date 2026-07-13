/* Lamora — World Discovery: continents, countries, capitals,
   flags, landmarks and a friendly tap-the-map. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

const COUNTRIES = [
  ['🇫🇷', 'France', 'Paris', 'Europe'], ['🇮🇹', 'Italy', 'Rome', 'Europe'], ['🇪🇸', 'Spain', 'Madrid', 'Europe'],
  ['🇬🇧', 'United Kingdom', 'London', 'Europe'], ['🇩🇪', 'Germany', 'Berlin', 'Europe'], ['🇬🇷', 'Greece', 'Athens', 'Europe'],
  ['🇺🇸', 'United States', 'Washington D.C.', 'North America'], ['🇨🇦', 'Canada', 'Ottawa', 'North America'],
  ['🇲🇽', 'Mexico', 'Mexico City', 'North America'], ['🇧🇷', 'Brazil', 'Brasília', 'South America'],
  ['🇦🇷', 'Argentina', 'Buenos Aires', 'South America'], ['🇵🇪', 'Peru', 'Lima', 'South America'],
  ['🇪🇬', 'Egypt', 'Cairo', 'Africa'], ['🇰🇪', 'Kenya', 'Nairobi', 'Africa'], ['🇳🇬', 'Nigeria', 'Abuja', 'Africa'],
  ['🇿🇦', 'South Africa', 'Cape Town', 'Africa'], ['🇲🇦', 'Morocco', 'Rabat', 'Africa'],
  ['🇨🇳', 'China', 'Beijing', 'Asia'], ['🇯🇵', 'Japan', 'Tokyo', 'Asia'], ['🇮🇳', 'India', 'New Delhi', 'Asia'],
  ['🇹🇭', 'Thailand', 'Bangkok', 'Asia'], ['🇰🇷', 'South Korea', 'Seoul', 'Asia'],
  ['🇦🇺', 'Australia', 'Canberra', 'Oceania'], ['🇳🇿', 'New Zealand', 'Wellington', 'Oceania']
];
const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'];
const LANDMARKS = [
  ['🗼', 'Eiffel Tower', 'France'], ['🗽', 'Statue of Liberty', 'United States'], ['🏛️', 'Ancient temples', 'Greece'],
  ['🗻', 'Mount Fuji', 'Japan'], ['🐨', 'Koala forests', 'Australia'], ['🏰', 'Fairy-tale castles', 'Germany'],
  ['🛕', 'Golden temples', 'Thailand'], ['🦁', 'Safari plains', 'Kenya'],
  ['⛩️', 'Red gateways', 'Japan'], ['🏯', 'The Great Wall', 'China']
];
const OCEANS = ['Pacific', 'Atlantic', 'Indian', 'Arctic', 'Southern'];
const FACTS = [
  { prompt: 'Which is the BIGGEST ocean?', options: ['Pacific', 'Atlantic', 'Indian'], answer: 0, hint: 'It touches Asia, Australia and the Americas.', explain: 'The Pacific Ocean is the biggest and deepest ocean.' },
  { prompt: 'How many continents are there?', options: ['7', '5', '12'], answer: 0, hint: 'Count them: Africa, Asia, Europe…', explain: 'There are 7 continents on Earth.' },
  { prompt: 'Which continent is the coldest?', options: ['Antarctica', 'Africa', 'Europe'], answer: 0, hint: 'Penguins love it!', explain: 'Antarctica, at the bottom of the world, is the coldest continent.' },
  { prompt: 'Which continent is the biggest?', options: ['Asia', 'Europe', 'Oceania'], answer: 0, hint: 'China and India are there.', explain: 'Asia is the biggest continent with the most people.' },
  { prompt: 'What is a capital city?', options: ['A country’s main city', 'A city with a C', 'The biggest beach'], answer: 0, hint: 'It’s where a country’s leaders work.', explain: 'A capital is the main city where a country’s government works.' },
  { prompt: 'The Sahara is a huge…', options: ['Desert 🏜️', 'Forest 🌲', 'Ocean 🌊'], answer: 0, hint: 'It is hot and sandy.', explain: 'The Sahara in Africa is the world’s biggest hot desert.' }
];

function band() { return L.ageBand(); }

function flagQuiz() {
  const pool = band() === 'young' ? COUNTRIES.slice(0, 12) : COUNTRIES;
  return L.sample(pool, 6).map(([flag, country]) => {
    const opts = L.shuffle(L.sample(pool.filter((c) => c[1] !== country), 2).map((c) => c[1]).concat(country));
    return {
      prompt: 'Which country has this flag?',
      speak: 'Look at the flag. Which country is it from?',
      visual: flag,
      options: opts, answer: opts.indexOf(country),
      hint: `It starts with "${country[0]}".`,
      explain: `That is the flag of ${country}.`
    };
  });
}

function flagFind() {
  const pool = band() === 'young' ? COUNTRIES.slice(0, 12) : COUNTRIES;
  return L.sample(pool, 6).map(([flag, country]) => {
    const others = L.sample(pool.filter((c) => c[1] !== country), 3).map((c) => c[0]);
    const opts = L.shuffle(others.concat(flag));
    return {
      prompt: `Find the flag of ${country}!`,
      speak: `Can you find the flag of ${country}?`,
      options: opts, answer: opts.indexOf(flag),
      hint: 'Look closely at the colours and patterns.',
      explain: `This is the flag of ${country}.`
    };
  });
}

function capitalQuiz() {
  const pool = COUNTRIES;
  return L.sample(pool, 6).map(([flag, country, capital]) => {
    const opts = L.shuffle(L.sample(pool.filter((c) => c[2] !== capital), 2).map((c) => c[2]).concat(capital));
    return {
      prompt: `What is the capital of ${country}?`,
      speak: `What is the capital city of ${country}?`,
      visual: flag,
      options: opts, answer: opts.indexOf(capital),
      hint: `It starts with "${capital[0]}".`,
      explain: `${capital} is the capital of ${country}.`
    };
  });
}

function continentQuiz() {
  return L.sample(COUNTRIES, 6).map(([flag, country, , continent]) => {
    const opts = L.shuffle(L.sample(CONTINENTS.filter((c) => c !== continent), 2).concat(continent));
    return {
      prompt: `Which continent is ${country} in?`,
      speak: `Which continent is ${country} in?`,
      visual: flag,
      options: opts, answer: opts.indexOf(continent),
      hint: 'Picture the world map in your head!',
      explain: `${country} is in ${continent}.`
    };
  });
}

function landmarkQuiz() {
  return L.sample(LANDMARKS, 6).map(([icon, name, country]) => {
    const opts = L.shuffle(L.sample(COUNTRIES.filter((c) => c[1] !== country).map((c) => c[1]), 2).concat(country));
    return {
      prompt: `Where would you find: ${name}?`,
      speak: `Where in the world is the ${name}?`,
      visual: icon,
      options: opts, answer: opts.indexOf(country),
      hint: 'Think about postcards you may have seen!',
      explain: `The ${name} is in ${country}.`
    };
  });
}

function worldMemory() {
  L.memoryPairs({
    title: '🗺️ World Memory',
    icons: COUNTRIES.slice(0, 10).map((c) => c[0]),
    pairs: band() === 'young' ? 4 : 6,
    backTo: 'world',
    onWin: () => L.completeActivity({ skill: 'world', stars: 3, onAgain: worldMemory })
  });
}

/* ---------------- interactive continent map ---------------- */
/* A friendly, simplified world map drawn as SVG blobs — not to scale, just for learning shapes & places. */
const MAP_SVG = `
<svg viewBox="0 0 500 300" role="img" aria-label="Simple world map">
  <rect x="0" y="0" width="500" height="300" fill="#bde8ff" rx="12"/>
  <path data-cont="North America" d="M40 40 L150 30 L160 60 L130 90 L110 130 L80 120 L50 90 Z" fill="#7ac74f" stroke="#4f772d" stroke-width="3"/>
  <path data-cont="South America" d="M120 150 L160 145 L170 190 L150 250 L130 240 L115 190 Z" fill="#f4a259" stroke="#bc6c25" stroke-width="3"/>
  <path data-cont="Europe" d="M230 40 L290 35 L300 65 L270 85 L235 80 Z" fill="#f9c74f" stroke="#bc9018" stroke-width="3"/>
  <path data-cont="Africa" d="M230 100 L290 95 L305 150 L275 215 L245 200 L225 150 Z" fill="#f8961e" stroke="#b26a12" stroke-width="3"/>
  <path data-cont="Asia" d="M310 30 L440 40 L450 100 L400 140 L340 120 L305 85 Z" fill="#90be6d" stroke="#5e8c3f" stroke-width="3"/>
  <path data-cont="Oceania" d="M400 190 L455 185 L465 220 L430 240 L400 225 Z" fill="#f94144" stroke="#b02a2c" stroke-width="3"/>
  <path data-cont="Antarctica" d="M150 275 L350 275 L330 292 L170 292 Z" fill="#ffffff" stroke="#9bb1c9" stroke-width="3"/>
</svg>`;

function mapGame() {
  const body = L.page('🗺️ Find the Continent', { speak: 'Look at the map! Tap the continent I ask for.', backTo: 'world' });
  const msg = h('div', { class: 'chess-msg', 'aria-live': 'polite' });
  const wrap = h('div', { class: 'colour-svg-wrap', html: MAP_SVG });
  body.append(msg, wrap);

  const rounds = L.shuffle(CONTINENTS.slice());
  let idx = 0, slips = 0;
  const dots = h('div', { class: 'progress-dots' }, rounds.map(() => h('span', { class: 'dot' })));
  body.insertBefore(dots, msg);

  function ask() {
    dots.querySelectorAll('.dot').forEach((d, i) => d.className = 'dot' + (i < idx ? ' done' : i === idx ? ' now' : ''));
    msg.textContent = `Tap: ${rounds[idx]}!`;
    L.speak(`Can you find ${rounds[idx]}?`);
  }
  wrap.querySelectorAll('[data-cont]').forEach((path) => {
    path.setAttribute('tabindex', '0');
    path.setAttribute('role', 'button');
    path.setAttribute('aria-label', path.dataset.cont);
    const choose = () => {
      if (path.dataset.cont === rounds[idx]) {
        L.sfx('correct');
        path.style.opacity = '0.55';
        idx++;
        if (idx >= rounds.length) {
          L.completeActivity({ skill: 'world', stars: Math.max(2, 5 - Math.floor(slips / 2)), onAgain: mapGame });
        } else ask();
      } else {
        slips++;
        L.sfx('wrong');
        msg.textContent = `That is ${path.dataset.cont}! Now find ${rounds[idx]}.`;
        L.speak(`That one is ${path.dataset.cont}. Try to find ${rounds[idx]}!`);
      }
    };
    path.addEventListener('click', choose);
    path.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
  });
  ask();
}

/* explore-the-map (no quiz — tap to hear names) */
function mapExplore() {
  const body = L.page('🌍 World Map', { speak: 'Tap a continent to hear its name!', backTo: 'world' });
  const msg = h('div', { class: 'chess-msg', 'aria-live': 'polite' }, 'Tap a continent!');
  const wrap = h('div', { class: 'colour-svg-wrap', html: MAP_SVG });
  const facts = {
    'North America': 'North America has huge forests, the Rocky Mountains, and Canada, the USA and Mexico.',
    'South America': 'South America has the Amazon rainforest — home to millions of animals!',
    'Europe': 'Europe has many countries close together, full of castles and old cities.',
    'Africa': 'Africa has lions, elephants, the Sahara desert and the long Nile river.',
    'Asia': 'Asia is the biggest continent — home to pandas, tigers and the tallest mountains.',
    'Oceania': 'Oceania includes Australia, New Zealand and thousands of islands. Kangaroos live here!',
    'Antarctica': 'Antarctica is the frozen continent at the bottom of the world. Penguins love it!'
  };
  body.append(msg, wrap);
  wrap.querySelectorAll('[data-cont]').forEach((path) => {
    path.setAttribute('tabindex', '0');
    path.setAttribute('role', 'button');
    path.setAttribute('aria-label', path.dataset.cont);
    const tell = () => {
      msg.textContent = `${path.dataset.cont}: ${facts[path.dataset.cont]}`;
      L.sfx('pop');
      L.speak(path.dataset.cont + '. ' + facts[path.dataset.cont]);
    };
    path.addEventListener('click', tell);
    path.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tell(); } });
  });
}

const SECTIONS = [
  { id: 'map', icon: '🌍', name: 'Explore the Map', run: mapExplore },
  { id: 'find', icon: '🗺️', name: 'Find the Continent', run: mapGame },
  { id: 'flags', icon: '🚩', name: 'Flag to Country', run: () => quiz('🚩 Whose Flag?', flagQuiz()) },
  { id: 'findflag', icon: '🔎', name: 'Find the Flag', run: () => quiz('🔎 Find the Flag', flagFind()) },
  { id: 'capitals', icon: '🏙️', name: 'Capital Cities', run: () => quiz('🏙️ Capital Cities', capitalQuiz()) },
  { id: 'continents', icon: '🧭', name: 'Which Continent?', run: () => quiz('🧭 Which Continent?', continentQuiz()) },
  { id: 'landmarks', icon: '🗼', name: 'Landmarks', run: () => quiz('🗼 Famous Landmarks', landmarkQuiz()) },
  { id: 'facts', icon: '💡', name: 'World Facts', run: () => quiz('💡 World Facts', L.sample(FACTS, 5)) },
  { id: 'memory', icon: '🃏', name: 'World Memory', run: worldMemory }
];

function quiz(title, questions) {
  L.runQuiz({ title, skill: 'world', backTo: 'world', questions, onAgain: () => L.go('world') });
}

L.route('world', (id) => {
  if (id) {
    const s = SECTIONS.find((x) => x.id === id);
    if (s) { s.run(); return; }
  }
  const band = L.ageBand();
  const body = L.page('World Discovery', { speak: 'Let’s discover the world! Maps, flags and far-away places!', backTo: 'explore' });
  const grid = h('div', { class: 'menu-grid' });
  SECTIONS
    .filter((s) => band !== 'young' || !['capitals', 'facts'].includes(s.id))
    .forEach((s) => grid.appendChild(L.bigButton(s.icon, s.name, () => L.go('world', s.id))));
  body.appendChild(grid);
});
})();
