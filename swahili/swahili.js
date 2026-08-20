/* Lamora — Simple Swahili (Kiswahili) for children.
   Word-and-picture flashcards plus gentle quizzes. Kids learn real
   Swahili greetings, numbers, animals, colours, family, food and body
   words, each with a friendly picture. */
(function () {
'use strict';
const L = window.Lamora;
const h = L.h;

/* Each entry: { sw: Swahili, en: English, pic: picture (emoji), say: how to say it } */
const TOPICS = [
  { id: 'greetings', icon: '👋', name: 'Greetings', words: [
    { sw: 'Jambo', en: 'Hello', pic: '👋', say: 'JAM-bo' },
    { sw: 'Habari', en: 'How are you?', pic: '🙂', say: 'ha-BA-ree' },
    { sw: 'Nzuri', en: 'I am fine', pic: '😀', say: 'n-ZOO-ree' },
    { sw: 'Asante', en: 'Thank you', pic: '🙏', say: 'a-SAN-teh' },
    { sw: 'Karibu', en: 'Welcome', pic: '🤗', say: 'ka-REE-boo' },
    { sw: 'Kwaheri', en: 'Goodbye', pic: '👋', say: 'kwa-HEH-ree' },
    { sw: 'Ndiyo', en: 'Yes', pic: '✅', say: 'n-DEE-yo' },
    { sw: 'Hapana', en: 'No', pic: '❌', say: 'ha-PA-na' },
    { sw: 'Tafadhali', en: 'Please', pic: '🙏', say: 'ta-fa-DHA-lee' },
    { sw: 'Rafiki', en: 'Friend', pic: '🧑‍🤝‍🧑', say: 'ra-FEE-kee' }
  ] },
  { id: 'numbers', icon: '🔢', name: 'Numbers', words: [
    { sw: 'Moja', en: 'One', pic: '1️⃣', say: 'MO-ja' },
    { sw: 'Mbili', en: 'Two', pic: '2️⃣', say: 'm-BEE-lee' },
    { sw: 'Tatu', en: 'Three', pic: '3️⃣', say: 'TA-too' },
    { sw: 'Nne', en: 'Four', pic: '4️⃣', say: 'n-NEH' },
    { sw: 'Tano', en: 'Five', pic: '5️⃣', say: 'TA-no' },
    { sw: 'Sita', en: 'Six', pic: '6️⃣', say: 'SEE-ta' },
    { sw: 'Saba', en: 'Seven', pic: '7️⃣', say: 'SA-ba' },
    { sw: 'Nane', en: 'Eight', pic: '8️⃣', say: 'NA-neh' },
    { sw: 'Tisa', en: 'Nine', pic: '9️⃣', say: 'TEE-sa' },
    { sw: 'Kumi', en: 'Ten', pic: '🔟', say: 'KOO-mee' }
  ] },
  { id: 'animals', icon: '🦁', name: 'Animals', words: [
    { sw: 'Simba', en: 'Lion', pic: '🦁', say: 'SEEM-ba' },
    { sw: 'Tembo', en: 'Elephant', pic: '🐘', say: 'TEM-bo' },
    { sw: 'Twiga', en: 'Giraffe', pic: '🦒', say: 'TWEE-ga' },
    { sw: 'Nyani', en: 'Monkey', pic: '🐒', say: 'n-YA-nee' },
    { sw: 'Punda milia', en: 'Zebra', pic: '🦓', say: 'POON-da MEE-lee-a' },
    { sw: 'Kiboko', en: 'Hippo', pic: '🦛', say: 'kee-BO-ko' },
    { sw: 'Samaki', en: 'Fish', pic: '🐟', say: 'sa-MA-kee' },
    { sw: 'Ndege', en: 'Bird', pic: '🐦', say: 'n-DEH-geh' },
    { sw: 'Paka', en: 'Cat', pic: '🐱', say: 'PA-ka' },
    { sw: 'Mbwa', en: 'Dog', pic: '🐶', say: 'm-BWA' }
  ] },
  { id: 'colours', icon: '🌈', name: 'Colours', words: [
    { sw: 'Nyekundu', en: 'Red', pic: '🟥', say: 'nyeh-KOON-doo' },
    { sw: 'Bluu', en: 'Blue', pic: '🟦', say: 'BLOO' },
    { sw: 'Kijani', en: 'Green', pic: '🟩', say: 'kee-JA-nee' },
    { sw: 'Njano', en: 'Yellow', pic: '🟨', say: 'n-JA-no' },
    { sw: 'Nyeusi', en: 'Black', pic: '⬛', say: 'nyeh-OO-see' },
    { sw: 'Nyeupe', en: 'White', pic: '⬜', say: 'nyeh-OO-peh' },
    { sw: 'Rangi ya machungwa', en: 'Orange', pic: '🟧', say: 'RAN-gee ya ma-CHOON-gwa' }
  ] },
  { id: 'family', icon: '👨‍👩‍👧', name: 'Family', words: [
    { sw: 'Mama', en: 'Mother', pic: '👩', say: 'MA-ma' },
    { sw: 'Baba', en: 'Father', pic: '👨', say: 'BA-ba' },
    { sw: 'Dada', en: 'Sister', pic: '👧', say: 'DA-da' },
    { sw: 'Kaka', en: 'Brother', pic: '👦', say: 'KA-ka' },
    { sw: 'Bibi', en: 'Grandma', pic: '👵', say: 'BEE-bee' },
    { sw: 'Babu', en: 'Grandpa', pic: '👴', say: 'BA-boo' },
    { sw: 'Mtoto', en: 'Child', pic: '🧒', say: 'm-TO-to' }
  ] },
  { id: 'food', icon: '🍎', name: 'Food & Drink', words: [
    { sw: 'Chakula', en: 'Food', pic: '🍲', say: 'cha-KOO-la' },
    { sw: 'Maji', en: 'Water', pic: '💧', say: 'MA-jee' },
    { sw: 'Ndizi', en: 'Banana', pic: '🍌', say: 'n-DEE-zee' },
    { sw: 'Embe', en: 'Mango', pic: '🥭', say: 'EM-beh' },
    { sw: 'Mkate', en: 'Bread', pic: '🍞', say: 'm-KA-teh' },
    { sw: 'Maziwa', en: 'Milk', pic: '🥛', say: 'ma-ZEE-wa' },
    { sw: 'Yai', en: 'Egg', pic: '🥚', say: 'YA-ee' },
    { sw: 'Chai', en: 'Tea', pic: '🍵', say: 'CHA-ee' }
  ] },
  { id: 'body', icon: '🙂', name: 'My Body', words: [
    { sw: 'Kichwa', en: 'Head', pic: '🧑', say: 'KEE-chwa' },
    { sw: 'Mkono', en: 'Hand', pic: '✋', say: 'm-KO-no' },
    { sw: 'Mguu', en: 'Leg', pic: '🦵', say: 'm-GOO' },
    { sw: 'Jicho', en: 'Eye', pic: '👁️', say: 'JEE-cho' },
    { sw: 'Sikio', en: 'Ear', pic: '👂', say: 'see-KEE-o' },
    { sw: 'Pua', en: 'Nose', pic: '👃', say: 'POO-a' },
    { sw: 'Mdomo', en: 'Mouth', pic: '👄', say: 'm-DO-mo' },
    { sw: 'Meno', en: 'Teeth', pic: '🦷', say: 'MEH-no' }
  ] }
];

function flashcards(topic) {
  const body = L.page(topic.icon + ' ' + topic.name, { speak: 'Tap a card to see the Swahili word. Then try the quiz!', backTo: 'swahili' });
  const grid = h('div', { class: 'flash-grid' });
  topic.words.forEach((w) => {
    let flipped = false;
    const card = h('button', { class: 'flash-card', 'aria-label': `${w.en}, ${w.sw} in Swahili` },
      h('span', { class: 'pic', 'aria-hidden': 'true' }, w.pic),
      h('span', { class: 'term' }, w.sw),
      h('span', { class: 'sub' }, w.en),
      h('span', { class: 'say' }, '🗣️ ' + w.say)
    );
    card.addEventListener('click', () => { L.sfx('pop'); card.classList.toggle('flash-lift'); });
    grid.appendChild(card);
  });
  body.appendChild(grid);
  body.appendChild(h('div', { class: 'center', style: { marginTop: '16px' } },
    h('button', { class: 'btn', onclick: () => quiz(topic) }, '⭐ Try the quiz')
  ));
}

function quiz(topic) {
  const pool = topic.words;
  const questions = L.sample(pool, Math.min(6, pool.length)).map((w) => {
    const askSwahili = Math.random() < 0.5;
    if (askSwahili) {
      // show picture + English, choose the Swahili word
      const opts = L.shuffle(L.sample(pool.filter((x) => x.sw !== w.sw), 2).map((x) => x.sw).concat(w.sw));
      return {
        prompt: `How do you say "${w.en}" in Swahili?`,
        visual: w.pic,
        options: opts, answer: opts.indexOf(w.sw),
        hint: `It sounds like "${w.say}".`,
        explain: `"${w.en}" is "${w.sw}" in Swahili.`
      };
    }
    // show Swahili, choose the English meaning
    const opts = L.shuffle(L.sample(pool.filter((x) => x.en !== w.en), 2).map((x) => x.en).concat(w.en));
    return {
      prompt: `What does "${w.sw}" mean?`,
      visual: w.pic,
      options: opts, answer: opts.indexOf(w.en),
      hint: `Say it out loud: ${w.say}.`,
      explain: `"${w.sw}" means "${w.en}".`
    };
  });
  L.runQuiz({
    title: topic.icon + ' ' + topic.name,
    skill: 'swahili', backTo: 'swahili',
    questions,
    onAgain: () => quiz(topic)
  });
}

L.route('swahili', (id) => {
  if (id) {
    const topic = TOPICS.find((t) => t.id === id);
    if (topic) { flashcards(topic); return; }
  }
  const body = L.page('Swahili — Kiswahili', { speak: 'Karibu! Let’s learn some Swahili words with pictures.', backTo: 'home' });
  body.appendChild(h('p', { class: 'center' }, h('span', { class: 'pill' }, '🇰🇪 Karibu! (Welcome!)')));
  const grid = h('div', { class: 'menu-grid' });
  TOPICS.forEach((t) => grid.appendChild(L.bigButton(t.icon, t.name, () => L.go('swahili', t.id), t.words.length + ' words')));
  body.appendChild(grid);
});
})();
