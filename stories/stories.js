/* Lamora — short interactive stories with read-aloud, questions,
   sequencing and gentle lessons. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

const STORIES = [
  {
    id: 'shell', icon: '🐚', name: 'The Shared Shell', theme: 'Sharing',
    pages: [
      { art: '🦀🐚', text: 'Coco the crab found the most beautiful shell on the whole beach. "Mine!" she said, and hid inside.' },
      { art: '🐢', text: 'Then Tilly the turtle came by. "What a lovely shell! May I look?" Coco held it tight. "It’s mine," she whispered.' },
      { art: '🌊', text: 'A big wave came — WHOOSH! It rolled the shell far away. Coco couldn’t reach it. But Tilly swam fast and brought it back!' },
      { art: '🦀💛🐢', text: '"Let’s share it," smiled Coco. They took turns listening to the sea inside. Shared treasure feels twice as special!' }
    ],
    lesson: 'Sharing makes good things even better.',
    quiz: [
      { prompt: 'Who found the shell?', options: ['Coco the crab', 'Tilly the turtle', 'A fish'], answer: 0, hint: 'She has claws!', explain: 'Coco the crab found it first.' },
      { prompt: 'Who rescued the shell from the wave?', options: ['Tilly the turtle', 'Coco', 'A seagull'], answer: 0, hint: 'She is a great swimmer.', explain: 'Tilly swam fast and brought it back.' },
      { prompt: 'What did Coco learn?', options: ['Sharing is special', 'Hide your things', 'Waves are mean'], answer: 0, hint: 'Think about the happy ending.', explain: 'Coco learned that sharing makes things better!' }
    ]
  },
  {
    id: 'dragon', icon: '🐉', name: 'The Little Brave Dragon', theme: 'Courage',
    pages: [
      { art: '🐉', text: 'Ember was the smallest dragon in the mountain. His flame was tiny — just a warm little puff.' },
      { art: '⛈️', text: 'One stormy night, the lights in the village below went out. Everyone was scared of the dark.' },
      { art: '🐉🕯️', text: 'Ember was scared too. But he flew down anyway, his heart going thump-thump-thump, and lit every lantern with his little puff of flame.' },
      { art: '🏮🎉', text: 'The village glowed like a sky full of stars. "Being brave," Ember smiled, "isn’t about being big. It’s about helping even when you’re scared."' }
    ],
    lesson: 'Being brave means trying even when you feel scared.',
    quiz: [
      { prompt: 'What was special about Ember?', options: ['He was the smallest dragon', 'He was the loudest', 'He could swim'], answer: 0, hint: 'Think about his size.', explain: 'Ember was the smallest dragon with a tiny flame.' },
      { prompt: 'How did Ember feel flying down?', options: ['Scared but brave', 'Angry', 'Sleepy'], answer: 0, hint: 'His heart went thump-thump.', explain: 'He was scared — and he helped anyway. That’s courage!' },
      { prompt: 'What did Ember light?', options: ['The lanterns', 'A campfire', 'The stars'], answer: 0, hint: 'They glow in the village.', explain: 'He lit every lantern in the village.' }
    ]
  },
  {
    id: 'seed', icon: '🌱', name: 'Pip and the Puzzle Seed', theme: 'Curiosity',
    pages: [
      { art: '🐿️🌰', text: 'Pip the squirrel found a strange, stripy seed. "What will you become?" she wondered.' },
      { art: '🕳️💧', text: 'Instead of eating it, Pip planted it, watered it, and visited every single day. She watched, and wondered, and waited.' },
      { art: '🌱☀️', text: 'A green shoot appeared! Then leaves, then a stem taller than Pip, taller than the fence, taller than the shed!' },
      { art: '🌻🐿️', text: 'It was a giant sunflower — with a hundred new stripy seeds to share. Questions, Pip learned, grow into wonderful answers.' }
    ],
    lesson: 'Curiosity and patience help wonderful things grow.',
    quiz: [
      { prompt: 'What did Pip find?', options: ['A stripy seed', 'A shiny coin', 'A red leaf'], answer: 0, hint: 'It was something to plant.', explain: 'Pip found a strange, stripy seed.' },
      { prompt: 'Put it in order: what came FIRST?', options: ['Planting the seed', 'The giant sunflower', 'The green shoot'], answer: 0, hint: 'What do you do before anything can grow?', explain: 'First Pip planted the seed, then the shoot grew, then the sunflower!' },
      { prompt: 'What grew from the seed?', options: ['A sunflower', 'An oak tree', 'A carrot'], answer: 0, hint: 'It turns to face the sun.', explain: 'A giant sunflower with a hundred new seeds!' }
    ]
  },
  {
    id: 'penguin', icon: '🐧', name: 'The Kind Penguin Parade', theme: 'Kindness',
    pages: [
      { art: '🐧🐧🐧', text: 'Every year the penguins held a great parade across the ice. Everyone marched together — flap, flap, waddle!' },
      { art: '🐧😟', text: 'But little Poppy slipped and dropped her snowflake hat into a crack in the ice. The parade marched on without her.' },
      { art: '🐧🤝', text: 'Everyone except Otto. He stopped, reached waaay down with his flipper, and fished out the hat. "A parade is no fun without you," he said.' },
      { art: '🎉🐧🐧', text: 'Poppy and Otto caught up, and the whole parade cheered. Kindness, the penguins say, is the warmest thing on the ice.' }
    ],
    lesson: 'A little kindness makes everyone’s day warmer.',
    quiz: [
      { prompt: 'What did Poppy drop?', options: ['Her snowflake hat', 'Her fish', 'Her scarf'], answer: 0, hint: 'She wore it on her head.', explain: 'Her snowflake hat fell into the ice crack.' },
      { prompt: 'Who stopped to help?', options: ['Otto', 'Nobody', 'A seal'], answer: 0, hint: 'One kind penguin.', explain: 'Otto stopped and helped Poppy.' },
      { prompt: 'What is the warmest thing on the ice?', options: ['Kindness', 'A blanket', 'Soup'], answer: 0, hint: 'It’s not something you can touch!', explain: 'Kindness is the warmest thing of all.' }
    ]
  },
  {
    id: 'robot', icon: '🤖', name: 'Beep’s Big Mistake', theme: 'Problem-solving',
    pages: [
      { art: '🤖🍞', text: 'Beep the robot wanted to surprise his family with toast. But he pressed the wrong button — and made ONE HUNDRED slices!' },
      { art: '🍞🍞🍞', text: 'Toast on the table! Toast on the chairs! Toast in the bathtub! "Error, error!" beeped Beep. "What do I do?"' },
      { art: '🤔💡', text: 'Beep took a deep robot breath and made a plan: 1) Stop the toaster. 2) Ask for help. 3) Think of who might LIKE lots of toast.' },
      { art: '🦆🍞🎉', text: 'The family had a toast picnic and shared the rest with the ducks at the pond. "Mistakes happen," smiled Beep. "Good plans fix them!"' }
    ],
    lesson: 'Mistakes are okay — a calm plan can fix almost anything.',
    quiz: [
      { prompt: 'What did Beep make too much of?', options: ['Toast', 'Soup', 'Cake'], answer: 0, hint: 'It pops out of a toaster!', explain: 'Beep made one hundred slices of toast.' },
      { prompt: 'What was step 1 of Beep’s plan?', options: ['Stop the toaster', 'Cry', 'Hide the toast'], answer: 0, hint: 'First, stop the problem growing!', explain: 'First stop the toaster, then ask for help.' },
      { prompt: 'Who enjoyed the extra toast?', options: ['The ducks', 'A dragon', 'Nobody'], answer: 0, hint: 'They live at the pond.', explain: 'The ducks at the pond loved the toast picnic!' }
    ]
  }
];

L.route('stories', (id, pageNum) => {
  if (id) {
    const story = STORIES.find((s) => s.id === id);
    if (story) { readStory(story, Number(pageNum) || 0); return; }
  }
  const body = L.page('Story Time', { speak: 'Story time! Pick a story to read together.', backTo: 'home' });
  const grid = h('div', { class: 'menu-grid' });
  STORIES.forEach((s) => grid.appendChild(L.bigButton(s.icon, s.name, () => L.go('stories', s.id, '0'), s.theme)));
  body.appendChild(grid);
});

function readStory(story, idx) {
  const page = story.pages[idx];
  const isLast = idx === story.pages.length - 1;
  const body = L.page(story.icon + ' ' + story.name, { speak: page.text, backTo: 'stories' });

  body.appendChild(h('div', { class: 'progress-dots' },
    story.pages.map((_, i) => h('span', { class: 'dot' + (i < idx ? ' done' : i === idx ? ' now' : '') }))));

  body.appendChild(h('div', { class: 'card' },
    h('div', { class: 'story-art', 'aria-hidden': 'true' }, page.art),
    h('p', { class: 'story-page' }, page.text),
    isLast ? h('p', { class: 'pill' }, '💛 ' + story.lesson) : null
  ));

  body.appendChild(h('div', { class: 'row', style: { justifyContent: 'center' } },
    idx > 0 ? h('button', { class: 'btn secondary', onclick: () => L.go('stories', story.id, String(idx - 1)) }, '⬅️ Back') : null,
    h('button', { class: 'btn soft', onclick: () => L.speak(page.text) }, '🔊 Read to me'),
    !isLast
      ? h('button', { class: 'btn', onclick: () => L.go('stories', story.id, String(idx + 1)) }, 'Next ➡️')
      : h('button', { class: 'btn', onclick: () => L.runQuiz({
          title: story.name + ' Quiz',
          speakTitle: 'Story quiz! Do you remember?',
          skill: 'stories',
          backTo: 'stories',
          questions: story.quiz,
          onAgain: () => L.go('stories', story.id, '0')
        }) }, '⭐ Story quiz')
  ));
}
})();
