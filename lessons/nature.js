/* Lamora nature & planet learning: animals, habitats, recycling, weather,
   space and caring for the Earth. Quizzes run on the shared quiz engine. */
(function () {
  "use strict";

  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];

  const HABITATS = [
    ["🐠", "clownfish", "Ocean", "🌊"],
    ["🐋", "whale", "Ocean", "🌊"],
    ["🦀", "crab", "Ocean", "🌊"],
    ["🐒", "monkey", "Forest", "🌳"],
    ["🦉", "owl", "Forest", "🌳"],
    ["🦊", "fox", "Forest", "🌳"],
    ["🐫", "camel", "Desert", "🏜️"],
    ["🦂", "scorpion", "Desert", "🏜️"],
    ["🐧", "penguin", "Icy poles", "🧊"],
    ["🐻‍❄️", "polar bear", "Icy poles", "🧊"],
    ["🦁", "lion", "Grassland", "🌾"],
    ["🦒", "giraffe", "Grassland", "🌾"],
    ["🐸", "frog", "Pond", "🪷"],
    ["🦆", "duck", "Pond", "🪷"]
  ];
  const HABITAT_NAMES = ["Ocean", "Forest", "Desert", "Icy poles", "Grassland", "Pond"];

  const RECYCLING = [
    ["🍌", "banana peel", "Compost"],
    ["🍎", "apple core", "Compost"],
    ["🥬", "old lettuce", "Compost"],
    ["📰", "newspaper", "Paper"],
    ["📦", "cardboard box", "Paper"],
    ["📄", "old drawing", "Paper"],
    ["🍾", "glass bottle", "Glass"],
    ["🫙", "glass jar", "Glass"],
    ["🥤", "plastic cup", "Plastic"],
    ["🧴", "shampoo bottle", "Plastic"],
    ["🥫", "tin can", "Metal"],
    ["🔩", "old bolt", "Metal"]
  ];
  const BINS = ["Compost", "Paper", "Glass", "Plastic", "Metal"];

  const WEATHER = [
    ["☀️", "sunny", "Wear a sun hat!"],
    ["🌧️", "rainy", "Take an umbrella!"],
    ["❄️", "snowy", "Wear warm gloves!"],
    ["💨", "windy", "Hold on to your hat!"],
    ["⛈️", "stormy", "Stay cosy inside!"],
    ["🌫️", "foggy", "Look carefully — it's hard to see!"]
  ];

  const SPACE = [
    { q: "Which planet do we live on?", a: "Earth", opts: ["Earth", "Mars", "Jupiter"], emoji: "🌍", why: "Earth is our beautiful blue home." },
    { q: "What lights up our sky in the daytime?", a: "The Sun", opts: ["The Sun", "The Moon", "A lamp"], emoji: "☀️", why: "The Sun is a giant star that gives us light and warmth." },
    { q: "What do we see shining at night?", a: "The Moon and stars", opts: ["The Moon and stars", "Rainbows", "Clouds only"], emoji: "🌙", why: "The Moon and thousands of stars shine at night." },
    { q: "Which planet is called the Red Planet?", a: "Mars", opts: ["Mars", "Venus", "Saturn"], emoji: "🔴", why: "Mars looks red because of its rusty dust." },
    { q: "Which planet has beautiful rings?", a: "Saturn", opts: ["Saturn", "Mercury", "Earth"], emoji: "🪐", why: "Saturn's rings are made of ice and rock." },
    { q: "What does the Earth travel around?", a: "The Sun", opts: ["The Sun", "The Moon", "Mars"], emoji: "🌏", why: "Earth goes around the Sun once every year." }
  ];

  const PLANET_CARE = [
    { q: "Water is precious! When should you turn off the tap?", a: "While brushing teeth", opts: ["While brushing teeth", "Never", "Only in winter"], emoji: "🚰", why: "Turning off the tap saves lots of clean water." },
    { q: "What can we do with an old toy we don't use?", a: "Give it to someone", opts: ["Give it to someone", "Throw it in a river", "Hide it forever"], emoji: "🧸", why: "Sharing toys means less waste and more smiles." },
    { q: "How can we help bees and butterflies?", a: "Plant flowers", opts: ["Plant flowers", "Catch them", "Shout at them"], emoji: "🐝", why: "Flowers give bees and butterflies food." },
    { q: "What should we do with rubbish at the park?", a: "Put it in a bin", opts: ["Put it in a bin", "Leave it on the grass", "Bury it"], emoji: "🗑️", why: "Bins keep parks clean and safe for animals." },
    { q: "Which of these helps our planet?", a: "Riding a bike", opts: ["Riding a bike", "Wasting paper", "Leaving lights on"], emoji: "🚲", why: "Bikes are fun and don't make smoke." },
    { q: "Endangered animals need our…", a: "Protection", opts: ["Protection", "Loud noise", "Litter"], emoji: "🐼", why: "Protecting wild places keeps rare animals safe." }
  ];

  const FOOD_CHAIN = [
    { q: "What does a rabbit like to eat?", a: "Grass and plants", opts: ["Grass and plants", "Fish", "Insects"], emoji: "🐇", why: "Rabbits are plant-eaters — herbivores!" },
    { q: "Plants make their food using…", a: "Sunlight", opts: ["Sunlight", "Moonlight", "Sweets"], emoji: "🌱", why: "Plants use sunlight, water and air to grow." },
    { q: "Who is at the start of most food chains?", a: "Plants", opts: ["Plants", "Lions", "Sharks"], emoji: "🌿", why: "Food chains start with plants that use the sun." },
    { q: "What does a lion eat?", a: "Other animals", opts: ["Other animals", "Grass", "Flowers"], emoji: "🦁", why: "Lions are meat-eaters — carnivores!" }
  ];

  const SOUNDS = [
    ["🐄", "cow", "moo"], ["🐑", "sheep", "baa"], ["🐶", "dog", "woof woof"],
    ["🐱", "cat", "meow"], ["🦆", "duck", "quack"], ["🐝", "bee", "buzz"],
    ["🦁", "lion", "roar"], ["🐸", "frog", "ribbit"], ["🐔", "chicken", "cluck"], ["🐴", "horse", "neigh"]
  ];

  const TOPICS = [
    { id: "habitats",  emoji: "🏞️", name: "Animal homes",   sub: "Nature" },
    { id: "recycle",   emoji: "♻️",  name: "Recycling",      sub: "Nature" },
    { id: "weather",   emoji: "⛅",  name: "Weather",        sub: "Nature" },
    { id: "space",     emoji: "🪐",  name: "Space",          sub: "Nature" },
    { id: "care",      emoji: "💚",  name: "Planet care",    sub: "Nature" },
    { id: "foodchain", emoji: "🌱",  name: "Food chains",    sub: "Nature" },
    { id: "sounds",    emoji: "🔊",  name: "Animal sounds",  sub: "Nature" }
  ];

  function topics() { return TOPICS; }

  function qHabitat() {
    const [emoji, animal, habitat] = pick(HABITATS);
    const opts = new Set([habitat]);
    while (opts.size < 3) opts.add(pick(HABITAT_NAMES));
    return {
      prompt: "Where does the " + animal + " live?",
      speakText: "Where does the " + animal + " live?",
      promptEmoji: emoji,
      choices: [...opts],
      answer: habitat,
      hint: "Think about what the " + animal + " needs to be happy.",
      explain: "The " + animal + " lives in the " + habitat.toLowerCase() + "."
    };
  }

  function qRecycle() {
    const [emoji, item, bin] = pick(RECYCLING);
    const opts = new Set([bin]);
    while (opts.size < 3) opts.add(pick(BINS));
    return {
      prompt: "Which bin for the " + item + "?",
      speakText: "Which bin does the " + item + " go in?",
      promptEmoji: emoji + " ♻️",
      choices: [...opts],
      answer: bin,
      hint: "What is the " + item + " made of?",
      explain: "The " + item + " goes in the " + bin.toLowerCase() + " bin. Great sorting!"
    };
  }

  function qWeather() {
    const [emoji, name, tip] = pick(WEATHER);
    const opts = new Set([name]);
    while (opts.size < 3) opts.add(pick(WEATHER)[1]);
    return {
      prompt: "What kind of weather is this?",
      promptEmoji: emoji,
      choices: [...opts],
      answer: name,
      hint: "Look at the picture carefully.",
      explain: "It's " + name + "! " + tip
    };
  }

  function fromBank(bank) {
    const c = pick(bank);
    return {
      prompt: c.q, promptEmoji: c.emoji, choices: c.opts.slice(), answer: c.a,
      hint: "Take your time and think about it.",
      explain: c.why
    };
  }

  function qSound() {
    const [emoji, animal, sound] = pick(SOUNDS);
    const opts = new Set([animal]);
    while (opts.size < 3) opts.add(pick(SOUNDS)[1]);
    return {
      prompt: "Which animal says “" + sound + "”?",
      speakText: "Which animal says " + sound + "?",
      promptEmoji: "🔊",
      choices: [...opts],
      answer: animal,
      hint: "Say “" + sound + "” out loud — who talks like that?",
      explain: "The " + animal + " says " + sound + "! " + emoji
    };
  }

  const BUILDERS = {
    habitats: qHabitat, recycle: qRecycle, weather: qWeather,
    space: () => fromBank(SPACE), care: () => fromBank(PLANET_CARE),
    foodchain: () => fromBank(FOOD_CHAIN), sounds: qSound
  };

  function start(topicId, ctx) {
    const topic = TOPICS.find(t => t.id === topicId);
    const seen = new Set();
    const questions = [];
    let guard = 0;
    while (questions.length < 5 && guard++ < 40) {
      const q = BUILDERS[topicId]();
      if (!seen.has(q.prompt)) { seen.add(q.prompt); questions.push(q); }
    }
    ctx.runQuiz({
      title: topic.emoji + " " + topic.name,
      category: "explore",
      questions,
      again: () => start(topicId, ctx),
      againLabel: "More " + topic.name.toLowerCase()
    });
  }

  window.LamoraNature = { topics, start };
})();
