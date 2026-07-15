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

/* ---------------- interactive continent map ----------------
   Real continent shapes, drawn from actual coastline coordinates
   (longitude, latitude) projected onto an equirectangular grid, so the
   continents have their true silhouettes and positions — not doodles. */
const MAP_W = 720, MAP_H = 360;
// project [lon, lat] → [x, y] on a 2:1 equirectangular canvas
const projX = (lon) => (lon + 180) * (MAP_W / 360);
const projY = (lat) => (90 - lat) * (MAP_H / 180);
function poly(coords) {
  return 'M' + coords.map(([lon, lat]) => projX(lon).toFixed(1) + ' ' + projY(lat).toFixed(1)).join(' L') + ' Z';
}

const CONTINENT_SHAPES = {
  'North America': { fill: '#7ac74f', stroke: '#4f772d', coords: [
    [-166,66],[-157,71],[-133,69],[-124,71],[-95,70],[-82,73],[-64,60],[-56,52],[-66,45],[-70,42],
    [-74,40],[-81,31],[-80,25],[-83,29],[-90,29],[-97,26],[-97,21],[-90,20],[-88,21],[-84,10],
    [-83,9],[-92,16],[-96,16],[-105,20],[-110,23],[-114,28],[-117,33],[-122,37],[-124,42],[-124,48],
    [-130,54],[-135,58],[-140,60],[-150,59],[-158,56],[-164,60]
  ] },
  'South America': { fill: '#f4a259', stroke: '#bc6c25', coords: [
    [-77,8],[-71,11],[-62,10],[-52,5],[-50,0],[-44,-2],[-35,-5],[-38,-13],[-40,-20],[-48,-25],
    [-54,-34],[-58,-39],[-63,-42],[-66,-45],[-69,-52],[-74,-53],[-73,-45],[-73,-38],[-71,-30],[-70,-18],
    [-76,-14],[-81,-5],[-80,0],[-78,5]
  ] },
  'Europe': { fill: '#f9c74f', stroke: '#b8901c', coords: [
    [-9,43],[-9,38],[-6,36],[0,38],[5,43],[8,44],[13,42],[18,40],[16,42],[19,42],[24,40],[27,41],
    [28,45],[30,50],[30,60],[28,66],[24,70],[16,68],[12,64],[5,61],[8,58],[10,55],[7,53],[3,51],
    [0,49],[-4,48],[-2,44]
  ] },
  'Africa': { fill: '#f8961e', stroke: '#b26a12', coords: [
    [-6,36],[10,37],[11,34],[20,32],[25,32],[35,31],[43,12],[51,12],[42,-1],[40,-11],[35,-19],
    [33,-26],[27,-34],[20,-35],[15,-28],[13,-17],[9,-1],[8,4],[3,6],[-4,5],[-8,4],[-13,8],[-16,12],
    [-17,15],[-16,21],[-13,25],[-10,30],[-9,33]
  ] },
  'Asia': { fill: '#90be6d', stroke: '#5e8c3f', coords: [
    [50,68],[60,70],[73,73],[90,75],[105,77],[125,73],[140,73],[160,70],[170,68],[180,65],[170,60],
    [162,58],[155,52],[142,48],[135,45],[128,42],[122,40],[122,31],[110,21],[108,14],[104,9],[100,8],
    [98,10],[94,16],[90,22],[88,21],[82,17],[80,13],[77,8],[73,17],[68,24],[62,25],[58,24],[57,20],
    [52,17],[45,13],[43,17],[40,22],[36,29],[36,36],[36,41],[41,42],[48,45],[52,45],[55,50],[58,55],[60,62]
  ] },
  'Oceania': { fill: '#f94144', stroke: '#b02a2c', coords: [
    [114,-22],[114,-26],[116,-32],[120,-34],[129,-32],[135,-35],[138,-35],[141,-38],[147,-38],[150,-37],
    [153,-31],[153,-27],[149,-22],[146,-19],[145,-15],[142,-11],[137,-12],[132,-11],[126,-14],[122,-18]
  ] },
  'Antarctica': { fill: '#f2f6fb', stroke: '#9bb1c9', coords: [
    [-180,-70],[-150,-73],[-120,-71],[-90,-74],[-60,-71],[-30,-69],[0,-70],[30,-68],[60,-66],[90,-66],
    [120,-67],[150,-70],[180,-71],[180,-88],[-180,-88]
  ] }
};

// small non-interactive island decorations for realism
const ISLANDS = [
  { name: 'Greenland', fill: '#cfe8d0', coords: [[-45,60],[-30,60],[-20,70],[-25,78],[-40,80],[-55,76],[-50,68]] },
  { name: 'Madagascar', fill: '#f6b06a', coords: [[44,-12],[50,-15],[47,-25],[44,-22]] },
  { name: 'Japan', fill: '#9fce7f', coords: [[131,31],[141,36],[142,43],[137,37],[132,34]] },
  { name: 'New Zealand', fill: '#f96d6f', coords: [[166,-46],[172,-42],[178,-38],[174,-40],[168,-44]] },
  { name: 'British Isles', fill: '#ffd75e', coords: [[-6,50],[-2,53],[-3,58],[-6,55],[-8,52]] }
];

const MAP_SVG = (() => {
  let s = `<svg viewBox="0 0 ${MAP_W} ${MAP_H}" role="img" aria-label="World map with real continent shapes">`;
  s += `<rect x="0" y="0" width="${MAP_W}" height="${MAP_H}" fill="#bde8ff" rx="14"/>`;
  ISLANDS.forEach((i) => { s += `<path d="${poly(i.coords)}" fill="${i.fill}" stroke="#7fa3b0" stroke-width="1.5" opacity="0.9"/>`; });
  Object.entries(CONTINENT_SHAPES).forEach(([name, c]) => {
    s += `<path data-cont="${name}" d="${poly(c.coords)}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2" stroke-linejoin="round"/>`;
  });
  s += `</svg>`;
  return s;
})();

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
      }
    };
    path.addEventListener('click', choose);
    path.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
  });
  ask();
}

/* explore-the-map (no quiz — tap to read about each continent) */
function mapExplore() {
  const body = L.page('🌍 World Map', { speak: 'Tap a continent to learn about it!', backTo: 'world' });
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
