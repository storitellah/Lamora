/* Lamora literacy lessons: letters, sounds, words, rhymes, sight words,
   spelling and simple comprehension. Adapts to age level 1-3.
   Uses the shared quiz engine; every prompt can be spoken aloud. */
(function () {
  "use strict";

  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];

  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const PICTURE_WORDS = [
    ["🐱", "cat"], ["🐶", "dog"], ["☀️", "sun"], ["🐷", "pig"], ["🎩", "hat"],
    ["🚌", "bus"], ["🐝", "bee"], ["🦆", "duck"], ["🐟", "fish"], ["⭐", "star"],
    ["🌙", "moon"], ["🐸", "frog"], ["🍰", "cake"], ["🚢", "ship"], ["🐍", "snake"],
    ["🌳", "tree"], ["📖", "book"], ["🏠", "house"], ["🍎", "apple"], ["🐯", "tiger"],
    ["🐘", "elephant"], ["🦋", "butterfly"], ["🌈", "rainbow"], ["🎸", "guitar"]
  ];

  const RHYMES = [
    ["cat", ["hat", "bat", "mat"], ["dog", "sun", "cup"]],
    ["frog", ["dog", "log", "fog"], ["cat", "bee", "pig"]],
    ["star", ["car", "far", "jar"], ["moon", "hat", "fish"]],
    ["cake", ["lake", "snake", "rake"], ["tree", "book", "duck"]],
    ["night", ["light", "kite", "bright"], ["day", "sun", "bed"]],
    ["bee", ["tree", "sea", "key"], ["ant", "bug", "fly"]]
  ];

  const SIGHT_WORDS = {
    1: ["the", "and", "a", "to", "I", "you", "it", "we", "go", "see", "my", "is"],
    2: ["said", "have", "like", "come", "some", "here", "they", "was", "with", "what"],
    3: ["because", "friend", "would", "people", "again", "thought", "through", "before"]
  };

  const SENTENCES = [
    { text: "The cat sat on the ___.", answer: "mat", options: ["mat", "sky", "cake"], emoji: "🐱" },
    { text: "I like to read a ___.", answer: "book", options: ["book", "fish", "shoe"], emoji: "📖" },
    { text: "The sun is very ___.", answer: "bright", options: ["bright", "wet", "square"], emoji: "☀️" },
    { text: "We swim in the ___.", answer: "sea", options: ["sea", "tree", "bed"], emoji: "🌊" },
    { text: "Birds can ___ in the sky.", answer: "fly", options: ["fly", "swim", "dig"], emoji: "🐦" },
    { text: "At night we see the ___.", answer: "moon", options: ["moon", "sun", "bus"], emoji: "🌙" }
  ];

  const COMPREHENSION = [
    {
      story: "Milo the dog found a red ball in the garden. He carried it to his best friend Ana.",
      q: "What did Milo find?", answer: "A red ball", options: ["A red ball", "A bone", "A stick"], emoji: "🐶"
    },
    {
      story: "Luna the owl only wakes up at night. She loves to watch the shining stars.",
      q: "When does Luna wake up?", answer: "At night", options: ["At night", "In the morning", "At lunchtime"], emoji: "🦉"
    },
    {
      story: "Sam planted a tiny seed. He watered it every day, and it grew into a tall sunflower.",
      q: "What did the seed grow into?", answer: "A sunflower", options: ["A sunflower", "A tree", "A carrot"], emoji: "🌻"
    },
    {
      story: "Mia lost her mitten in the snow. Her brother helped her look, and they found it by the gate.",
      q: "Who helped Mia look?", answer: "Her brother", options: ["Her brother", "Her teacher", "A penguin"], emoji: "🧤"
    }
  ];

  const TOPICS = [
    { id: "letters",   emoji: "🔤", name: "Letters",          min: 1 },
    { id: "sounds",    emoji: "🗣️", name: "Letter sounds",    min: 1 },
    { id: "case",      emoji: "🅰️", name: "Big & small",      min: 1 },
    { id: "firstWord", emoji: "🖼️", name: "First letters",    min: 1 },
    { id: "rhyme",     emoji: "🎵", name: "Rhyming",          min: 1 },
    { id: "sight",     emoji: "👀", name: "Sight words",      min: 2 },
    { id: "spelling",  emoji: "✏️", name: "Spelling",         min: 2 },
    { id: "sentence",  emoji: "💬", name: "Finish sentences", min: 2 },
    { id: "reading",   emoji: "📖", name: "Little stories",   min: 2 }
  ];

  function topics(level) { return TOPICS.filter(t => t.min <= level); }

  const GEN = {
    letters(level) {
      const target = pick(ALPHA);
      const opts = new Set([target]);
      while (opts.size < (level === 1 ? 3 : 5)) opts.add(pick(ALPHA));
      return {
        prompt: "Find the letter " + target + "!",
        speakText: "Tap the letter " + target,
        promptEmoji: "🔤",
        choices: [...opts],
        answer: target,
        hint: "Listen again and look carefully.",
        explain: "That's the letter " + target + "!"
      };
    },
    sounds(level) {
      const [emoji, word] = pick(PICTURE_WORDS.slice(0, level === 1 ? 12 : 24));
      const first = word[0].toUpperCase();
      const opts = new Set([first]);
      while (opts.size < 4) opts.add(pick(ALPHA));
      return {
        prompt: "Which letter starts the word “" + word + "”?",
        speakText: word + ". What sound does " + word + " start with?",
        promptEmoji: emoji,
        choices: [...opts],
        answer: first,
        hint: "Say the word slowly: " + word.split("").join(" - "),
        explain: word + " starts with " + first + "."
      };
    },
    case(level) {
      const target = pick(ALPHA);
      const opts = new Set([target.toLowerCase()]);
      while (opts.size < 4) opts.add(pick(ALPHA).toLowerCase());
      return {
        prompt: "Find the small letter that matches " + target,
        speakText: "Which small letter matches big " + target + "?",
        promptEmoji: target,
        choices: [...opts],
        answer: target.toLowerCase(),
        hint: "Big " + target + " and small " + target.toLowerCase() + " are a pair.",
        explain: "Big " + target + " matches small " + target.toLowerCase() + "."
      };
    },
    firstWord(level) {
      const pool = PICTURE_WORDS.slice(0, level === 1 ? 12 : 24);
      const [emoji, word] = pick(pool);
      const opts = new Set([word]);
      while (opts.size < (level === 1 ? 3 : 4)) opts.add(pick(pool)[1]);
      return {
        prompt: "Which word matches the picture?",
        speakText: "Which word matches the picture?",
        promptEmoji: emoji,
        choices: [...opts],
        answer: word,
        hint: "Sound out the first letter of each word.",
        explain: "It's “" + word + "”!"
      };
    },
    rhyme(level) {
      const [base, good, bad] = pick(RHYMES);
      const answer = pick(good);
      const set = new Set([answer]);
      while (set.size < 3) set.add(pick(bad));
      return {
        prompt: "Which word rhymes with “" + base + "”?",
        speakText: "Which word rhymes with " + base + "?",
        promptEmoji: "🎵",
        choices: [...set],
        answer,
        hint: "Rhyming words end with the same sound: " + base + "…",
        explain: base + " and " + answer + " rhyme!"
      };
    },
    sight(level) {
      const pool = SIGHT_WORDS[level] || SIGHT_WORDS[2];
      const target = pick(pool);
      const opts = new Set([target]);
      while (opts.size < 4) opts.add(pick(pool));
      return {
        prompt: "Tap the word “" + target + "”",
        speakText: "Find the word: " + target,
        promptEmoji: "👀",
        choices: [...opts],
        answer: target,
        hint: "Look at the first letter: " + target[0],
        explain: "That says “" + target + "”. Great reading!"
      };
    },
    spelling(level) {
      const pool = PICTURE_WORDS.filter(w => (level === 2 ? w[1].length <= 4 : w[1].length >= 4));
      const [emoji, word] = pick(pool);
      const misspell = w => {
        const i = rnd(w.length);
        const wrongChar = pick("aeiouszrtq".split("").filter(c => c !== w[i]));
        return w.slice(0, i) + wrongChar + w.slice(i + 1);
      };
      const opts = new Set([word]);
      let guard = 0;
      while (opts.size < 3 && guard++ < 30) opts.add(misspell(word));
      return {
        prompt: "Which spelling is right?",
        speakText: "How do you spell " + word + "?",
        promptEmoji: emoji,
        choices: [...opts],
        answer: word,
        hint: "Sound it out: " + word.split("").join(" - "),
        explain: word.toUpperCase() + " — " + word.split("").join(", ") + "."
      };
    },
    sentence(level) {
      const s = pick(SENTENCES);
      return {
        prompt: s.text,
        speakText: s.text.replace("___", "hmm"),
        promptEmoji: s.emoji,
        choices: s.options.slice(),
        answer: s.answer,
        hint: "Say the sentence with each word — which one sounds right?",
        explain: s.text.replace("___", s.answer.toUpperCase())
      };
    },
    reading(level) {
      const c = pick(COMPREHENSION);
      return {
        prompt: c.story + " — " + c.q,
        speakText: c.story + ". " + c.q,
        promptEmoji: c.emoji,
        choices: c.options.slice(),
        answer: c.answer,
        hint: "Listen to the story again. 🔊",
        explain: c.answer + " — you remembered the story!"
      };
    }
  };

  function build(topicId, level) {
    const topic = TOPICS.find(t => t.id === topicId);
    const questions = Array.from({ length: 5 }, () => GEN[topicId](level));
    return {
      title: topic.emoji + " " + topic.name,
      category: "literacy",
      questions,
      again: () => Lamora.runQuiz(build(topicId, level)),
      againLabel: "More " + topic.name.toLowerCase()
    };
  }

  window.LamoraLiteracy = { topics, build };
})();
