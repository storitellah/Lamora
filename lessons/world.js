/* Lamora world discovery: continents, countries, capitals, flags and
   landmarks. Flags use emoji so everything works offline with no images. */
(function () {
  "use strict";

  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];

  /* flag, country, capital, continent, landmark (optional) */
  const COUNTRIES = [
    ["🇫🇷", "France", "Paris", "Europe", ["🗼", "the Eiffel Tower"]],
    ["🇬🇧", "United Kingdom", "London", "Europe", ["🕰️", "Big Ben"]],
    ["🇮🇹", "Italy", "Rome", "Europe", ["🏛️", "the Colosseum"]],
    ["🇪🇸", "Spain", "Madrid", "Europe", null],
    ["🇩🇪", "Germany", "Berlin", "Europe", null],
    ["🇬🇷", "Greece", "Athens", "Europe", ["🏛️", "the Parthenon"]],
    ["🇵🇹", "Portugal", "Lisbon", "Europe", null],
    ["🇳🇱", "Netherlands", "Amsterdam", "Europe", ["🌷", "tulip fields"]],
    ["🇺🇸", "United States", "Washington, D.C.", "North America", ["🗽", "the Statue of Liberty"]],
    ["🇨🇦", "Canada", "Ottawa", "North America", ["🍁", "maple forests"]],
    ["🇲🇽", "Mexico", "Mexico City", "North America", ["🛕", "ancient pyramids"]],
    ["🇧🇷", "Brazil", "Brasília", "South America", ["🌴", "the Amazon rainforest"]],
    ["🇦🇷", "Argentina", "Buenos Aires", "South America", null],
    ["🇵🇪", "Peru", "Lima", "South America", ["⛰️", "Machu Picchu"]],
    ["🇪🇬", "Egypt", "Cairo", "Africa", ["🔺", "the Pyramids of Giza"]],
    ["🇰🇪", "Kenya", "Nairobi", "Africa", ["🦁", "safari grasslands"]],
    ["🇳🇬", "Nigeria", "Abuja", "Africa", null],
    ["🇿🇦", "South Africa", "Pretoria", "Africa", ["🐧", "Boulders Beach penguins"]],
    ["🇲🇦", "Morocco", "Rabat", "Africa", null],
    ["🇨🇳", "China", "Beijing", "Asia", ["🧱", "the Great Wall"]],
    ["🇯🇵", "Japan", "Tokyo", "Asia", ["🗻", "Mount Fuji"]],
    ["🇮🇳", "India", "New Delhi", "Asia", ["🕌", "the Taj Mahal"]],
    ["🇰🇷", "South Korea", "Seoul", "Asia", null],
    ["🇹🇭", "Thailand", "Bangkok", "Asia", null],
    ["🇮🇩", "Indonesia", "Jakarta", "Asia", null],
    ["🇹🇷", "Türkiye", "Ankara", "Asia", null],
    ["🇦🇺", "Australia", "Canberra", "Oceania", ["🎭", "the Sydney Opera House"]],
    ["🇳🇿", "New Zealand", "Wellington", "Oceania", ["🥝", "kiwi birds"]],
    ["🇫🇯", "Fiji", "Suva", "Oceania", null],
    ["🇳🇴", "Norway", "Oslo", "Europe", ["🏔️", "fjords"]],
    ["🇸🇪", "Sweden", "Stockholm", "Europe", null],
    ["🇨🇭", "Switzerland", "Bern", "Europe", ["⛰️", "the Alps"]],
    ["🇮🇪", "Ireland", "Dublin", "Europe", null],
    ["🇨🇱", "Chile", "Santiago", "South America", null],
    ["🇬🇭", "Ghana", "Accra", "Africa", null],
    ["🇻🇳", "Vietnam", "Hanoi", "Asia", null],
    ["🇵🇭", "Philippines", "Manila", "Asia", null],
    ["🇸🇦", "Saudi Arabia", "Riyadh", "Asia", null],
    ["🇮🇸", "Iceland", "Reykjavík", "Europe", ["🌋", "volcanoes and geysers"]],
    ["🇹🇿", "Tanzania", "Dodoma", "Africa", ["🏔️", "Mount Kilimanjaro"]]
  ];

  const CONTINENTS = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Antarctica"];

  const CONTINENT_FACTS = [
    { q: "Which continent is the biggest?", a: "Asia", opts: ["Asia", "Europe", "Oceania"], emoji: "🌏", why: "Asia is the largest continent with the most people." },
    { q: "Which continent is frozen and full of penguins?", a: "Antarctica", opts: ["Antarctica", "Africa", "Europe"], emoji: "🐧", why: "Antarctica is the icy continent at the very south." },
    { q: "Where do lions, giraffes and elephants roam wild?", a: "Africa", opts: ["Africa", "Europe", "Antarctica"], emoji: "🦒", why: "Africa's grasslands are home to amazing animals." },
    { q: "Which continent are kangaroos from?", a: "Oceania", opts: ["Oceania", "Asia", "South America"], emoji: "🦘", why: "Kangaroos hop around Australia, in Oceania." },
    { q: "Which is the biggest ocean?", a: "Pacific Ocean", opts: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean"], emoji: "🌊", why: "The Pacific is the biggest, deepest ocean of all." },
    { q: "The Amazon rainforest is in…", a: "South America", opts: ["South America", "Europe", "Asia"], emoji: "🦜", why: "The Amazon in South America is the world's largest rainforest." }
  ];

  const TOPICS = [
    { id: "flags",     emoji: "🚩", name: "Flags",         sub: "World" },
    { id: "capitals",  emoji: "🏙️", name: "Capital cities", sub: "World" },
    { id: "continent", emoji: "🗺️", name: "Continents",     sub: "World" },
    { id: "landmarks", emoji: "🗼", name: "Landmarks",      sub: "World" },
    { id: "worldfact", emoji: "🌐", name: "World facts",    sub: "World" }
  ];

  function topics() { return TOPICS; }

  /* Younger children get fewer choices and the most famous countries. */
  function pool(level) {
    return level === 1 ? COUNTRIES.slice(0, 16) : COUNTRIES;
  }
  function optCount(level) { return level === 1 ? 3 : 4; }

  function qFlag(level) {
    const p = pool(level);
    const c = pick(p);
    const opts = new Set([c[1]]);
    while (opts.size < optCount(level)) opts.add(pick(p)[1]);
    return {
      prompt: "Which country does this flag belong to?",
      speakText: "Which country has this flag?",
      promptEmoji: c[0],
      choices: [...opts],
      answer: c[1],
      hint: "Have you seen this flag before? Take a guess!",
      explain: "That's the flag of " + c[1] + "! " + c[0]
    };
  }

  function qCapital(level) {
    const p = pool(level);
    const c = pick(p);
    const opts = new Set([c[2]]);
    while (opts.size < optCount(level)) opts.add(pick(p)[2]);
    return {
      prompt: "What is the capital of " + c[1] + "? " + c[0],
      speakText: "What is the capital city of " + c[1] + "?",
      promptEmoji: "🏙️",
      choices: [...opts],
      answer: c[2],
      hint: "It's a famous city in " + c[1] + ".",
      explain: c[2] + " is the capital of " + c[1] + "."
    };
  }

  function qContinent(level) {
    const p = pool(level);
    const c = pick(p);
    const opts = new Set([c[3]]);
    while (opts.size < 3) opts.add(pick(CONTINENTS));
    return {
      prompt: "Which continent is " + c[1] + " in? " + c[0],
      speakText: "Which continent is " + c[1] + " in?",
      promptEmoji: "🗺️",
      choices: [...opts],
      answer: c[3],
      hint: "Picture the world map — where is " + c[1] + "?",
      explain: c[1] + " is in " + c[3] + "."
    };
  }

  function qLandmark(level) {
    const withLm = COUNTRIES.filter(c => c[4]);
    const c = pick(withLm);
    const opts = new Set([c[1]]);
    while (opts.size < optCount(level)) opts.add(pick(withLm)[1]);
    return {
      prompt: "Where would you find " + c[4][1] + "?",
      speakText: "In which country would you find " + c[4][1] + "?",
      promptEmoji: c[4][0],
      choices: [...opts],
      answer: c[1],
      hint: "It's a very famous place!",
      explain: c[4][1][0].toUpperCase() + c[4][1].slice(1) + " is in " + c[1] + ". " + c[0]
    };
  }

  function qFact() {
    const c = pick(CONTINENT_FACTS);
    return {
      prompt: c.q, promptEmoji: c.emoji, choices: c.opts.slice(), answer: c.a,
      hint: "Think about the pictures you have seen of the world.",
      explain: c.why
    };
  }

  const BUILDERS = { flags: qFlag, capitals: qCapital, continent: qContinent, landmarks: qLandmark, worldfact: qFact };

  function start(topicId, ctx) {
    const topic = TOPICS.find(t => t.id === topicId);
    const level = ctx.level();
    const seen = new Set();
    const questions = [];
    let guard = 0;
    while (questions.length < 5 && guard++ < 60) {
      const q = BUILDERS[topicId](level);
      if (!seen.has(q.prompt + q.answer)) { seen.add(q.prompt + q.answer); questions.push(q); }
    }
    ctx.runQuiz({
      title: topic.emoji + " " + topic.name,
      category: "explore",
      questions,
      again: () => start(topicId, ctx),
      againLabel: "More " + topic.name.toLowerCase()
    });
  }

  window.LamoraWorld = { topics, start, COUNTRIES };
})();
