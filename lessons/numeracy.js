/* Lamora numeracy lessons: question generators that adapt to the child's
   age level (1 = age 5-6, 2 = age 7-8, 3 = age 9-10). Each build() returns
   an options object for the shared quiz engine in script.js. */
(function () {
  "use strict";

  const OBJECTS = ["🍎", "🐟", "⭐", "🎈", "🐞", "🌸", "🚗", "🐤", "🧁", "⚽"];
  const SHAPES = [
    ["●", "circle"], ["■", "square"], ["▲", "triangle"], ["★", "star"],
    ["◆", "diamond"], ["▬", "rectangle"], ["⬟", "pentagon"], ["⬢", "hexagon"]
  ];

  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const range = (a, b) => a + rnd(b - a + 1);

  function distractors(answer, spread, count) {
    const set = new Set([answer]);
    let guard = 0;
    while (set.size < count + 1 && guard++ < 60) {
      const d = answer + (rnd(spread * 2 + 1) - spread);
      if (d >= 0 && d !== answer) set.add(d);
    }
    return [...set];
  }

  const TOPICS = [
    { id: "counting",  emoji: "🔢", name: "Counting",       min: 1 },
    { id: "compare",   emoji: "⚖️", name: "Bigger number",  min: 1 },
    { id: "shapes",    emoji: "🔷", name: "Shapes",         min: 1 },
    { id: "patterns",  emoji: "🎨", name: "Patterns",       min: 1 },
    { id: "addition",  emoji: "➕", name: "Adding",          min: 1 },
    { id: "subtract",  emoji: "➖", name: "Taking away",     min: 2 },
    { id: "missing",   emoji: "❓", name: "Missing number",  min: 2 },
    { id: "bonds",     emoji: "🔗", name: "Number bonds",    min: 2 },
    { id: "money",     emoji: "🪙", name: "Money",           min: 2 },
    { id: "time",      emoji: "🕐", name: "Telling time",    min: 2 },
    { id: "word",      emoji: "📝", name: "Word problems",   min: 3 },
    { id: "sequence",  emoji: "🧩", name: "Logic sequences", min: 3 },
    { id: "measure",   emoji: "📏", name: "Measuring",       min: 2 },
    { id: "sorting",   emoji: "🗂️", name: "Odd & even",      min: 3 }
  ];

  function topics(level) {
    return TOPICS.filter(t => t.min <= level);
  }

  const GEN = {
    counting(level) {
      const max = level === 1 ? 8 : level === 2 ? 15 : 25;
      const n = range(2, Math.min(max, 12));
      const emoji = pick(OBJECTS);
      return {
        prompt: "How many can you count?",
        speakText: "How many " + "things" + " can you count?",
        promptEmoji: Array(n).fill(emoji).join(""),
        choices: distractors(n, 3, 3),
        answer: n,
        hint: "Touch each one and count slowly: one, two, three…",
        explain: "There are " + n + "!"
      };
    },
    compare(level) {
      const max = level === 1 ? 10 : level === 2 ? 50 : 200;
      let a = range(1, max), b = range(1, max);
      while (a === b) b = range(1, max);
      return {
        prompt: "Tap the bigger number!",
        promptEmoji: "🐘",
        choices: [a, b],
        answer: Math.max(a, b),
        hint: "Which number means more things?",
        explain: Math.max(a, b) + " is bigger than " + Math.min(a, b) + "."
      };
    },
    shapes(level) {
      const pool = SHAPES.slice(0, level === 1 ? 4 : level === 2 ? 6 : 8);
      const [glyph, name] = pick(pool);
      return {
        prompt: "Which one is the " + name + "?",
        speakText: "Tap the " + name + "!",
        choices: pool.map(s => s[0]),
        answer: glyph,
        hint: "Look carefully at each shape.",
        explain: "That's the " + name + "!"
      };
    },
    patterns(level) {
      const items = level === 1 ? ["🔴", "🔵"] : level === 2 ? ["🔴", "🔵", "🟡"] : ["🔴", "🔵", "🟡", "🟢"];
      const patternLen = items.length;
      const seq = [];
      for (let i = 0; i < patternLen * 2 + 1; i++) seq.push(items[i % patternLen]);
      const answer = items[(patternLen * 2 + 1) % patternLen];
      return {
        prompt: "What comes next?",
        promptEmoji: seq.join(" ") + " ❓",
        choices: items.slice(),
        answer,
        keepOrder: true,
        hint: "Say the pattern out loud — what repeats?",
        explain: "The pattern repeats, so " + answer + " comes next."
      };
    },
    addition(level) {
      const max = level === 1 ? 5 : level === 2 ? 12 : 50;
      const a = range(1, max), b = range(1, max);
      return {
        prompt: a + " + " + b + " = ?",
        speakText: "What is " + a + " plus " + b + "?",
        promptEmoji: level === 1 ? Array(a).fill("🍓").join("") + " ➕ " + Array(b).fill("🍓").join("") : "➕",
        choices: distractors(a + b, level === 1 ? 2 : 5, 3),
        answer: a + b,
        hint: "Count on from " + Math.max(a, b) + ".",
        explain: a + " plus " + b + " makes " + (a + b) + "."
      };
    },
    subtract(level) {
      const max = level === 2 ? 15 : 60;
      const a = range(3, max), b = range(1, a - 1);
      return {
        prompt: a + " − " + b + " = ?",
        speakText: "What is " + a + " take away " + b + "?",
        promptEmoji: "➖",
        choices: distractors(a - b, 4, 3),
        answer: a - b,
        hint: "Start at " + a + " and count back " + b + ".",
        explain: a + " take away " + b + " leaves " + (a - b) + "."
      };
    },
    missing(level) {
      const max = level === 2 ? 12 : 30;
      const a = range(1, max), b = range(1, max);
      return {
        prompt: a + " + ❓ = " + (a + b),
        speakText: a + " plus what makes " + (a + b) + "?",
        promptEmoji: "❓",
        choices: distractors(b, 4, 3),
        answer: b,
        hint: "How far is it from " + a + " up to " + (a + b) + "?",
        explain: a + " plus " + b + " makes " + (a + b) + "."
      };
    },
    bonds(level) {
      const target = level === 2 ? 10 : 20;
      const a = range(0, target);
      return {
        prompt: "Friends of " + target + ": " + a + " + ❓ = " + target,
        speakText: a + " and what number are friends that make " + target + "?",
        promptEmoji: "🔗",
        choices: distractors(target - a, 4, 3),
        answer: target - a,
        hint: "Count up from " + a + " to " + target + ".",
        explain: a + " and " + (target - a) + " make " + target + " together."
      };
    },
    money(level) {
      const coins = level === 2 ? [1, 2, 5] : [1, 2, 5, 10, 20];
      const n = level === 2 ? 2 : 3;
      const picked = Array.from({ length: n }, () => pick(coins));
      const total = picked.reduce((x, y) => x + y, 0);
      return {
        prompt: "How much money is this? " + picked.map(c => c + "¢").join(" + "),
        speakText: "Add the coins: " + picked.join(", then ") + " cents.",
        promptEmoji: picked.map(() => "🪙").join(""),
        choices: distractors(total, 5, 3).map(v => v + "¢"),
        answer: total + "¢",
        hint: "Add the coins one at a time.",
        explain: "Together they make " + total + " cents."
      };
    },
    time(level) {
      const CLOCKS = { 1: "🕐", 2: "🕑", 3: "🕒", 4: "🕓", 5: "🕔", 6: "🕕", 7: "🕖", 8: "🕗", 9: "🕘", 10: "🕙", 11: "🕚", 12: "🕛" };
      const h = range(1, 12);
      const wrong = new Set([h]);
      while (wrong.size < 4) wrong.add(range(1, 12));
      return {
        prompt: "What time does the clock show?",
        promptEmoji: CLOCKS[h],
        choices: [...wrong].map(x => x + " o'clock"),
        answer: h + " o'clock",
        hint: "Look where the short hand points.",
        explain: "The clock shows " + h + " o'clock."
      };
    },
    word(level) {
      const scenarios = [
        (a, b) => [`${a} birds sat on a tree. ${b} more birds came. How many birds now?`, a + b, "🐦"],
        (a, b) => [`You had ${a + b} balloons and ${b} popped. How many are left?`, a, "🎈"],
        (a, b) => [`There are ${a} red fish and ${b} blue fish. How many fish altogether?`, a + b, "🐟"],
        (a, b) => [`${a + b} cookies were baked and you ate ${b}. How many remain?`, a, "🍪"]
      ];
      const a = range(2, 12), b = range(2, 9);
      const [text, ans, emoji] = pick(scenarios)(a, b);
      return {
        prompt: text,
        promptEmoji: emoji,
        choices: distractors(ans, 4, 3),
        answer: ans,
        hint: "Is the number getting bigger or smaller?",
        explain: "The answer is " + ans + "."
      };
    },
    sequence(level) {
      const step = pick([2, 3, 5, 10]);
      const start = range(0, 12);
      const seq = [start, start + step, start + step * 2, start + step * 3];
      return {
        prompt: seq.join(", ") + ", ❓",
        speakText: "What number comes next? " + seq.join(", "),
        promptEmoji: "🧩",
        choices: distractors(start + step * 4, step, 3),
        answer: start + step * 4,
        hint: "The numbers jump by " + step + " each time.",
        explain: "Adding " + step + " again gives " + (start + step * 4) + "."
      };
    },
    measure(level) {
      const things = [["🐜", "ant", 1], ["🐭", "mouse", 2], ["🐕", "dog", 3], ["🐘", "elephant", 4], ["🐋", "whale", 5]];
      const trio = window.Lamora ? Lamora.shuffle(things.slice()).slice(0, 3) : things.slice(0, 3);
      const biggest = trio.reduce((m, t) => (t[2] > m[2] ? t : m));
      return {
        prompt: "Which animal is the biggest in real life?",
        promptEmoji: trio.map(t => t[0]).join(" "),
        choices: trio.map(t => t[0]),
        answer: biggest[0],
        hint: "Imagine standing next to each animal.",
        explain: "The " + biggest[1] + " is the biggest!"
      };
    },
    sorting(level) {
      const n = range(1, 50);
      const isEven = n % 2 === 0;
      return {
        prompt: "Is " + n + " odd or even?",
        promptEmoji: "🗂️",
        choices: ["Odd", "Even"],
        answer: isEven ? "Even" : "Odd",
        keepOrder: true,
        hint: "Even numbers end in 0, 2, 4, 6 or 8.",
        explain: n + " is " + (isEven ? "even" : "odd") + " because it ends in " + (n % 10) + "."
      };
    }
  };

  function build(topicId, level) {
    const topic = TOPICS.find(t => t.id === topicId);
    const questions = Array.from({ length: 5 }, () => GEN[topicId](level));
    return {
      title: topic.emoji + " " + topic.name,
      category: "numeracy",
      questions,
      again: () => Lamora.runQuiz(build(topicId, level)),
      againLabel: "More " + topic.name.toLowerCase()
    };
  }

  window.LamoraNumeracy = { topics, build };
})();
