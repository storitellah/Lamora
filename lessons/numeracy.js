/* Lamora — Numeracy activities. Question sets are generated fresh each time
   and scale with the child's age band (young 5–6, mid 7–8, old 9–10). */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;
const OBJ =['🍎', '⭐', '🐟', '🌸', '🎈', '🐞', '🍪', '🐚', '🦆', '🚗'];
const SHAPES = [
  ['🔵', 'circle'], ['🟥', 'square'], ['🔺', 'triangle'], ['🟨', 'square'],
  ['🟣', 'circle'], ['💠', 'diamond'], ['⭐', 'star'], ['❤️', 'heart']
];

function numOptions(answer, spread, count) {
  const opts = new Set([answer]);
  while (opts.size < (count || 4)) {
    const v = answer + L.rand(-spread, spread);
    if (v >= 0 && v !== answer) opts.add(v);
  }
  const list = L.shuffle([...opts]);
  return { options: list, answer: list.indexOf(answer) };
}

function counting(n) {
  const qs = [];
  const band = L.ageBand();
  const max = band === 'young' ? 8 : band === 'mid' ? 15 : 20;
  for (let i = 0; i < n; i++) {
    const count = L.rand(2, max);
    const icon = L.pick(OBJ);
    const o = numOptions(count, 3, 4);
    qs.push({
      prompt: 'How many can you count?',
      speak: 'Count them all. How many are there?',
      visual: icon.repeat(count),
      options: o.options, answer: o.answer,
      hint: 'Touch each one as you count!',
      explain: `There are ${count}. Counting one at a time helps!`
    });
  }
  return qs;
}

function bigger(n) {
  const band = L.ageBand();
  const max = band === 'young' ? 10 : band === 'mid' ? 50 : 100;
  return Array.from({ length: n }, () => {
    let a = L.rand(1, max), b = L.rand(1, max);
    while (a === b) b = L.rand(1, max);
    const list = [a, b];
    return {
      prompt: 'Tap the BIGGER number!',
      speak: `Which is bigger: ${a} or ${b}?`,
      options: list, answer: list.indexOf(Math.max(a, b)),
      hint: 'Bigger means more!',
      explain: `${Math.max(a, b)} is bigger than ${Math.min(a, b)}.`
    };
  });
}

function matchQuantity(n) {
  return Array.from({ length: n }, () => {
    const count = L.rand(1, 9);
    const icon = L.pick(OBJ);
    const opts = new Set([count]);
    while (opts.size < 3) opts.add(L.rand(1, 9));
    const list = L.shuffle([...opts]).map((c) => ({ c, label: icon.repeat(c) }));
    return {
      prompt: `Find ${count} ${count === 1 ? 'thing' : 'things'}!`,
      speak: `Tap the group with ${count}.`,
      visual: String(count),
      options: list.map((x) => x.label),
      answer: list.findIndex((x) => x.c === count),
      hint: 'Count each group slowly.',
      explain: `This group has exactly ${count}.`
    };
  });
}

function addition(n) {
  const band = L.ageBand();
  const max = band === 'young' ? 5 : band === 'mid' ? 10 : 30;
  return Array.from({ length: n }, () => {
    const a = L.rand(1, max), b = L.rand(1, max);
    const o = numOptions(a + b, band === 'old' ? 6 : 3, 4);
    return {
      prompt: `${a} + ${b} = ?`,
      speak: `What is ${a} plus ${b}?`,
      visual: band === 'young' ? '🍎'.repeat(a) + ' ➕ ' + '🍎'.repeat(b) : '',
      options: o.options, answer: o.answer,
      hint: band === 'young' ? 'Count all the apples together!' : `Start at ${Math.max(a, b)} and count up ${Math.min(a, b)}.`,
      explain: `${a} plus ${b} makes ${a + b}.`
    };
  });
}

function subtraction(n) {
  const band = L.ageBand();
  const max = band === 'young' ? 8 : band === 'mid' ? 15 : 40;
  return Array.from({ length: n }, () => {
    const a = L.rand(2, max), b = L.rand(1, a - 1);
    const o = numOptions(a - b, 3, 4);
    return {
      prompt: `${a} − ${b} = ?`,
      speak: `What is ${a} take away ${b}?`,
      options: o.options, answer: o.answer,
      hint: `Start at ${a} and count back ${b}.`,
      explain: `${a} take away ${b} leaves ${a - b}.`
    };
  });
}

function missing(n) {
  const band = L.ageBand();
  return Array.from({ length: n }, () => {
    const step = band === 'young' ? 1 : L.pick(band === 'mid' ? [1, 2, 5, 10] : [2, 3, 5, 10]);
    const start = L.rand(0, band === 'young' ? 8 : 40);
    const seq = [0, 1, 2, 3].map((i) => start + i * step);
    const hole = L.rand(1, 3);
    const answer = seq[hole];
    const o = numOptions(answer, step * 2 || 2, 4);
    return {
      prompt: 'What number is missing?',
      speak: 'Find the missing number in the pattern.',
      visual: seq.map((v, i) => (i === hole ? '❓' : v)).join('  '),
      options: o.options, answer: o.answer,
      hint: step === 1 ? 'The numbers go up by one each time.' : `The numbers jump by ${step} each time.`,
      explain: `The pattern counts in ${step}s, so the missing number is ${answer}.`
    };
  });
}

function bonds(n) {
  const target = L.ageBand() === 'old' ? 20 : 10;
  return Array.from({ length: n }, () => {
    const a = L.rand(0, target);
    const o = numOptions(target - a, 3, 4);
    return {
      prompt: `${a} + ? = ${target}`,
      speak: `${a} plus what makes ${target}?`,
      options: o.options, answer: o.answer,
      hint: `Count up from ${a} to ${target}.`,
      explain: `${a} and ${target - a} are number friends — together they make ${target}!`
    };
  });
}

function patterns(n) {
  const pool = ['🔴', '🔵', '🟡', '🟢', '⭐', '❤️', '🟣'];
  return Array.from({ length: n }, () => {
    const band = L.ageBand();
    const p = L.sample(pool, band === 'young' ? 2 : 3);
    const patt = band === 'young' ? [p[0], p[1], p[0], p[1], p[0]] : [p[0], p[1], p[2], p[0], p[1]];
    const answer = band === 'young' ? p[1] : p[2];
    const opts = L.shuffle(L.sample(pool.filter((x) => x !== answer), 2).concat(answer));
    return {
      prompt: 'What comes next?',
      speak: 'Look at the pattern. What comes next?',
      visual: patt.join(' ') + ' ❓',
      options: opts, answer: opts.indexOf(answer),
      hint: 'Say the pattern out loud — it repeats!',
      explain: 'The pattern repeats, so next comes ' + answer + '.'
    };
  });
}

function shapes(n) {
  return Array.from({ length: n }, () => {
    const [icon, name] = L.pick(SHAPES);
    const others = L.sample([...new Set(SHAPES.map((s) => s[1]))].filter((x) => x !== name), 2);
    const opts = L.shuffle(others.concat(name));
    return {
      prompt: 'What shape is this?',
      speak: 'What shape is this?',
      visual: icon,
      options: opts, answer: opts.indexOf(name),
      hint: name === 'triangle' ? 'Count the corners — three!' : 'Look at its sides and corners.',
      explain: `This is a ${name}.`
    };
  });
}

function money(n) {
  const band = L.ageBand();
  return Array.from({ length: n }, () => {
    const coins = band === 'young' ? [1, 2] : [1, 2, 5, 10];
    const picked = Array.from({ length: band === 'young' ? 2 : 3 }, () => L.pick(coins));
    const total = picked.reduce((a, b) => a + b, 0);
    const o = numOptions(total, 3, 4);
    return {
      prompt: 'How much money is this?',
      speak: 'Add up the coins. How much is it?',
      visual: picked.map((c) => `🪙${c}`).join(' + '),
      options: o.options, answer: o.answer,
      hint: 'Add the numbers on the coins.',
      explain: `${picked.join(' + ')} makes ${total}.`
    };
  });
}

const CLOCKS = ['🕐 1','🕑 2','🕒 3','🕓 4','🕔 5','🕕 6','🕖 7','🕗 8','🕘 9','🕙 10','🕚 11','🕛 12'];
function time(n) {
  return Array.from({ length: n }, () => {
    const i = L.rand(0, 11);
    const [face, hour] = CLOCKS[i].split(' ');
    const opts = new Set([hour + " o'clock"]);
    while (opts.size < 3) opts.add((L.rand(1, 12)) + " o'clock");
    const list = L.shuffle([...opts]);
    return {
      prompt: 'What time is it?',
      speak: 'Look at the clock. What time is it?',
      visual: face,
      options: list, answer: list.indexOf(hour + " o'clock"),
      hint: 'The short hand points to the hour.',
      explain: `The clock shows ${hour} o'clock.`
    };
  });
}

function measure(n) {
  return Array.from({ length: n }, () => {
    const a = L.rand(2, 5), b = L.rand(6, 9);
    const icon = L.pick(['🚂', '🐛', '🚌']);
    const flip = Math.random() < 0.5;
    const rows = [icon.repeat(a), icon.repeat(b)];
    const list = flip ? [rows[1], rows[0]] : rows;
    return {
      prompt: 'Tap the LONGER one!',
      speak: 'Which one is longer?',
      options: list,
      answer: list.indexOf(icon.repeat(b)),
      hint: 'Longer means it stretches further.',
      explain: 'The longer row has more in it!'
    };
  });
}

function wordProblems(n) {
  const templates = [
    () => { const a = L.rand(2, 8), b = L.rand(1, 6); return [`${a} birds sit in a tree. ${b} more fly in. How many now?`, a + b]; },
    () => { const a = L.rand(5, 12), b = L.rand(1, 4); return [`You have ${a} grapes and eat ${b}. How many are left?`, a - b]; },
    () => { const a = L.rand(2, 5); return [`There are ${a} dogs. How many legs is that?`, a * 4]; },
    () => { const a = L.rand(2, 6), b = L.rand(2, 6); return [`${a} red fish and ${b} blue fish swim by. How many fish?`, a + b]; }
  ];
  return Array.from({ length: n }, () => {
    const [text, ans] = L.pick(templates)();
    const o = numOptions(ans, 3, 4);
    return {
      prompt: text, speak: text,
      options: o.options, answer: o.answer,
      hint: 'Picture it in your head, then count.',
      explain: `The answer is ${ans}.`
    };
  });
}

function sorting(n) {
  return Array.from({ length: n }, () => {
    const nums = L.sample([...Array(20).keys()].map((x) => x + 1), 3);
    const smallest = Math.min(...nums);
    return {
      prompt: 'Tap the SMALLEST number!',
      speak: 'Which number is the smallest?',
      options: nums, answer: nums.indexOf(smallest),
      hint: 'Smallest means the least.',
      explain: `${smallest} is the smallest.`
    };
  });
}

const ACTIVITIES = [
  { id: 'counting', icon: '🍎', name: 'Counting', gen: counting, bands: ['young', 'mid'] },
  { id: 'match', icon: '🔟', name: 'Match Amounts', gen: matchQuantity, bands: ['young'] },
  { id: 'bigger', icon: '🐘', name: 'Bigger Number', gen: bigger, bands: ['young', 'mid', 'old'] },
  { id: 'patterns', icon: '🌈', name: 'Patterns', gen: patterns, bands: ['young', 'mid'] },
  { id: 'shapes', icon: '🔺', name: 'Shapes', gen: shapes, bands: ['young', 'mid'] },
  { id: 'sorting', icon: '📏', name: 'Smallest First', gen: sorting, bands: ['young', 'mid'] },
  { id: 'measure', icon: '🚂', name: 'Long & Short', gen: measure, bands: ['young'] },
  { id: 'add', icon: '➕', name: 'Adding', gen: addition, bands: ['young', 'mid', 'old'] },
  { id: 'sub', icon: '➖', name: 'Taking Away', gen: subtraction, bands: ['mid', 'old'] },
  { id: 'missing', icon: '❓', name: 'Missing Numbers', gen: missing, bands: ['mid', 'old'] },
  { id: 'bonds', icon: '🤝', name: 'Number Friends', gen: bonds, bands: ['mid', 'old'] },
  { id: 'money', icon: '🪙', name: 'Money', gen: money, bands: ['mid', 'old'] },
  { id: 'time', icon: '🕒', name: 'Telling Time', gen: time, bands: ['mid', 'old'] },
  { id: 'words', icon: '📝', name: 'Word Problems', gen: wordProblems, bands: ['old'] }
];

L.route('numeracy', (activityId) => {
  if (activityId) {
    const act = ACTIVITIES.find((a) => a.id === activityId);
    if (act) {
      L.runQuiz({
        title: act.icon + ' ' + act.name,
        speakTitle: act.name + '! Here we go!',
        skill: 'numeracy',
        backTo: 'numeracy',
        questions: act.gen(6),
        onAgain: () => L.go('numeracy', act.id)
      });
      return;
    }
  }
  const band = L.ageBand();
  const body = L.page('Numbers', { speak: 'Pick a number activity!', backTo: 'learn' });
  const grid = h('div', { class: 'menu-grid' });
  ACTIVITIES.filter((a) => a.bands.includes(band)).forEach((a) => {
    grid.appendChild(L.bigButton(a.icon, a.name, () => L.go('numeracy', a.id)));
  });
  body.appendChild(grid);
});
})();
