/**
 * Lamora curated content. All plain data — no logic — so parents and
 * educators can review or extend it easily.
 */

/* ---------------- Phonics ---------------- */

export interface PhonicsItem { letter: string; sound: string; word: string; emoji: string }

export const PHONICS: PhonicsItem[] = [
  { letter: "A", sound: "a as in apple", word: "apple", emoji: "🍎" },
  { letter: "B", sound: "b as in ball", word: "ball", emoji: "⚽" },
  { letter: "C", sound: "c as in cat", word: "cat", emoji: "🐱" },
  { letter: "D", sound: "d as in dog", word: "dog", emoji: "🐶" },
  { letter: "E", sound: "e as in egg", word: "egg", emoji: "🥚" },
  { letter: "F", sound: "f as in fish", word: "fish", emoji: "🐟" },
  { letter: "G", sound: "g as in goat", word: "goat", emoji: "🐐" },
  { letter: "H", sound: "h as in hat", word: "hat", emoji: "🎩" },
  { letter: "I", sound: "i as in igloo", word: "igloo", emoji: "🧊" },
  { letter: "J", sound: "j as in jam", word: "jam", emoji: "🍓" },
  { letter: "K", sound: "k as in kite", word: "kite", emoji: "🪁" },
  { letter: "L", sound: "l as in lion", word: "lion", emoji: "🦁" },
  { letter: "M", sound: "m as in moon", word: "moon", emoji: "🌙" },
  { letter: "N", sound: "n as in nest", word: "nest", emoji: "🪺" },
  { letter: "O", sound: "o as in octopus", word: "octopus", emoji: "🐙" },
  { letter: "P", sound: "p as in pig", word: "pig", emoji: "🐷" },
  { letter: "Q", sound: "q as in queen", word: "queen", emoji: "👑" },
  { letter: "R", sound: "r as in rainbow", word: "rainbow", emoji: "🌈" },
  { letter: "S", sound: "s as in sun", word: "sun", emoji: "☀️" },
  { letter: "T", sound: "t as in tree", word: "tree", emoji: "🌳" },
  { letter: "U", sound: "u as in umbrella", word: "umbrella", emoji: "☂️" },
  { letter: "V", sound: "v as in violin", word: "violin", emoji: "🎻" },
  { letter: "W", sound: "w as in whale", word: "whale", emoji: "🐳" },
  { letter: "X", sound: "x as in box", word: "box", emoji: "📦" },
  { letter: "Y", sound: "y as in yo-yo", word: "yo-yo", emoji: "🪀" },
  { letter: "Z", sound: "z as in zebra", word: "zebra", emoji: "🦓" }
];

/* ---------------- Sight words by level ---------------- */

export const SIGHT_WORDS: Record<1 | 2 | 3, string[]> = {
  1: ["the", "and", "a", "to", "I", "you", "it", "we", "go", "see", "my", "is", "in", "up"],
  2: ["said", "have", "like", "come", "some", "here", "they", "was", "with", "what", "when", "your"],
  3: ["because", "friend", "would", "people", "again", "thought", "through", "before", "different", "together"]
};

/* ---------------- Read-along stories ---------------- */

export interface Story {
  id: string; emoji: string; title: string; theme: string;
  pages: { art: string; text: string }[];
  quiz: { q: string; a: string; opts: string[] };
  lesson: string;
}

export const STORIES: Story[] = [
  {
    id: "shell", emoji: "🐚", title: "The Sharing Shell", theme: "Sharing",
    pages: [
      { art: "🦀", text: "Coco the crab found a beautiful, shiny shell on the beach. It was the prettiest shell she had ever seen!" },
      { art: "🐠", text: "Her friend Finn the fish swam up. “Wow!” said Finn. “May I look at your shell?”" },
      { art: "💛", text: "Coco thought for a moment… then she showed Finn the shell. They took turns holding it and laughed as it sparkled in the sun!" },
      { art: "🌅", text: "That evening, Coco smiled. Treasures are lovely — but sharing them with friends is the loveliest thing of all." }
    ],
    quiz: { q: "What did Coco find on the beach?", a: "A shiny shell", opts: ["A shiny shell", "A gold coin", "A hat"] },
    lesson: "Sharing makes good things even better."
  },
  {
    id: "flight", emoji: "🦉", title: "Ollie's First Flight", theme: "Courage",
    pages: [
      { art: "🦉", text: "Ollie the little owl sat on a high branch. Tonight was his first flying night — and his tummy was full of butterflies." },
      { art: "🌙", text: "“What if I fall?” Ollie whispered. His mama hooted softly: “Being brave doesn't mean you're not scared. It means trying anyway.”" },
      { art: "💫", text: "Ollie took a deep breath, looked at the moon… and leapt! His wings caught the wind — he was flying!" },
      { art: "⭐", text: "Ollie whooshed past the stars, laughing. The thing he had feared became the thing he loved most." }
    ],
    quiz: { q: "How did Ollie feel before his first flight?", a: "Scared but brave", opts: ["Scared but brave", "Sleepy", "Angry"] },
    lesson: "Being brave means trying even when you feel scared."
  },
  {
    id: "seed", emoji: "🌱", title: "The Curious Seed", theme: "Curiosity",
    pages: [
      { art: "🌱", text: "Pip the seed lived in a cosy seed packet. One day she wondered: “What is out there, above the soil?”" },
      { art: "🌧️", text: "A kind gardener planted Pip in the earth. Rain fell — drip, drop! — and Pip felt herself stretch and grow." },
      { art: "🌤️", text: "Pip grew deep, strong roots. Then she pushed up, up, up — POP! She burst into the sunshine." },
      { art: "🌻", text: "Pip became a glorious sunflower. And it all began with one small question: “What is out there?”" }
    ],
    quiz: { q: "What did Pip become?", a: "A sunflower", opts: ["A sunflower", "A tree", "A cactus"] },
    lesson: "Asking questions helps us grow."
  },
  {
    id: "trunk", emoji: "🐘", title: "Ella Lends a Trunk", theme: "Kindness",
    pages: [
      { art: "🐘", text: "Ella the elephant was on her way to the waterhole when she heard a tiny cry. “Help! My ball is stuck in the tree!”" },
      { art: "🐒", text: "It was little Momo the monkey. His red ball was caught high in the branches, and he was too small to reach it." },
      { art: "🤝", text: "Ella reached up with her long trunk and — plop! — the ball came free. Momo cheered!" },
      { art: "💞", text: "At the waterhole, Momo shared his splashiest game with Ella. Kindness always finds its way back to you." }
    ],
    quiz: { q: "What was stuck in the tree?", a: "A red ball", opts: ["A red ball", "A kite", "A banana"] },
    lesson: "A little kindness makes a big difference."
  }
];

/* ---------------- "Did You Know?" trivia ---------------- */

export interface Fact { emoji: string; title: string; fact: string; quiz?: { q: string; a: string; opts: string[] } }
export interface FactCategory { id: string; name: string; emoji: string; facts: Fact[] }

export const TRIVIA: FactCategory[] = [
  {
    id: "space", name: "Planets & Space", emoji: "🪐",
    facts: [
      { emoji: "☀️", title: "The Sun is a star", fact: "Our Sun is a giant star. More than one million Earths could fit inside it!", quiz: { q: "What is the Sun?", a: "A star", opts: ["A star", "A planet", "A moon"] } },
      { emoji: "🔴", title: "Rusty Mars", fact: "Mars looks red because its ground is covered in rusty iron dust — it's nicknamed the Red Planet.", quiz: { q: "Why is Mars red?", a: "Rusty dust", opts: ["Rusty dust", "Red water", "Fire"] } },
      { emoji: "🪐", title: "Saturn's rings", fact: "Saturn's beautiful rings are made of billions of pieces of ice and rock, some as tiny as sand.", quiz: { q: "What are Saturn's rings made of?", a: "Ice and rock", opts: ["Ice and rock", "Gold", "Clouds"] } },
      { emoji: "🌙", title: "Moon footprints", fact: "There is no wind on the Moon, so astronauts' footprints could stay there for millions of years!" },
      { emoji: "⚡", title: "Speedy light", fact: "Light from the Sun takes about 8 minutes to reach Earth — sunlight is a little time-traveller!" },
      { emoji: "🌍", title: "Spinning Earth", fact: "Earth spins all the way around once every day. That's why we have day and night!", quiz: { q: "Why do we have day and night?", a: "Earth spins", opts: ["Earth spins", "The Sun sleeps", "Clouds hide us"] } }
    ]
  },
  {
    id: "wonders", name: "World Wonders", emoji: "🏛️",
    facts: [
      { emoji: "🧱", title: "The Great Wall", fact: "The Great Wall of China is over 21,000 kilometres long — it took nearly 2,000 years to build!", quiz: { q: "Where is the Great Wall?", a: "China", opts: ["China", "Egypt", "Brazil"] } },
      { emoji: "🔺", title: "Pyramid puzzle", fact: "The Great Pyramid of Giza in Egypt was built from about 2.3 million giant stone blocks." },
      { emoji: "🗼", title: "Growing tower", fact: "The Eiffel Tower in Paris grows about 15 centimetres taller in summer because heat expands the iron!", quiz: { q: "In which city is the Eiffel Tower?", a: "Paris", opts: ["Paris", "London", "Rome"] } },
      { emoji: "🏛️", title: "Mighty Colosseum", fact: "The Colosseum in Rome could hold 50,000 people — as many as a big football stadium today." },
      { emoji: "⛰️", title: "City in the clouds", fact: "Machu Picchu in Peru is an ancient city built high in the mountains, 2,430 metres above the sea!" },
      { emoji: "🗽", title: "A giant gift", fact: "The Statue of Liberty was a present from France to the United States. Her torch shines 93 metres high." }
    ]
  },
  {
    id: "animals", name: "Animals & Wildlife", emoji: "🦁",
    facts: [
      { emoji: "🐙", title: "Three hearts!", fact: "An octopus has three hearts and blue blood. When it swims, one heart takes a little rest!", quiz: { q: "How many hearts does an octopus have?", a: "Three", opts: ["Three", "One", "Ten"] } },
      { emoji: "🦒", title: "Tall sleepers", fact: "Giraffes sleep standing up and often for less than two hours a day." },
      { emoji: "🐘", title: "Super trunks", fact: "An elephant's trunk has about 40,000 muscles — your whole body has only about 600!", quiz: { q: "What does an elephant's trunk have lots of?", a: "Muscles", opts: ["Muscles", "Bones", "Teeth"] } },
      { emoji: "🦩", title: "Pink from food", fact: "Flamingos are born grey — they turn pink from the tiny shrimps and algae they eat!" },
      { emoji: "🐬", title: "Dolphin names", fact: "Dolphins call each other by name using special whistles — each dolphin has its own!" },
      { emoji: "🐝", title: "Waggle dance", fact: "Honeybees dance a special “waggle dance” to tell their friends where to find the best flowers.", quiz: { q: "Why do bees dance?", a: "To share where flowers are", opts: ["To share where flowers are", "To sleep", "To scare bears"] } }
    ]
  },
  {
    id: "cities", name: "Global Cities", emoji: "🌆",
    facts: [
      { emoji: "🗼", title: "Tokyo, Japan", fact: "Tokyo is the biggest city in the world — more than 37 million people live in and around it!", quiz: { q: "Which country is Tokyo in?", a: "Japan", opts: ["Japan", "India", "Italy"] } },
      { emoji: "🚕", title: "New York, USA", fact: "New York City is nicknamed the Big Apple, and its subway has 472 stations — the most anywhere." },
      { emoji: "🚤", title: "Venice, Italy", fact: "Venice is built on more than 100 little islands. People travel by boat instead of by car!", quiz: { q: "How do people travel in Venice?", a: "By boat", opts: ["By boat", "By camel", "By train only"] } },
      { emoji: "☂️", title: "London, England", fact: "London's Big Ben is actually the name of the giant bell inside the clock tower, not the tower itself." },
      { emoji: "🕌", title: "Cairo, Egypt", fact: "From tall buildings in Cairo you can see the ancient pyramids sitting right at the edge of the city!" },
      { emoji: "🎡", title: "Paris, France", fact: "Paris is called the City of Light — it was one of the first cities to light its streets at night." }
    ]
  },
  {
    id: "heroes", name: "Inspiring People", emoji: "🌟",
    facts: [
      { emoji: "🔬", title: "Marie Curie", fact: "Marie Curie was a scientist who won the Nobel Prize twice — the first person ever to do that!", quiz: { q: "What was Marie Curie?", a: "A scientist", opts: ["A scientist", "A pilot", "A painter"] } },
      { emoji: "✈️", title: "Amelia Earhart", fact: "Amelia Earhart was the first woman to fly an aeroplane all alone across the Atlantic Ocean." },
      { emoji: "🎨", title: "Leonardo da Vinci", fact: "Leonardo da Vinci painted the Mona Lisa and drew flying machines 400 years before real planes existed!" },
      { emoji: "🕊️", title: "Nelson Mandela", fact: "Nelson Mandela worked his whole life for fairness, and taught the world to answer unkindness with forgiveness.", quiz: { q: "What did Mandela teach the world?", a: "Forgiveness", opts: ["Forgiveness", "Cooking", "Juggling"] } },
      { emoji: "🐒", title: "Jane Goodall", fact: "Jane Goodall lived in the forest to learn the secrets of wild chimpanzees — and became their greatest protector." },
      { emoji: "📚", title: "Malala Yousafzai", fact: "Malala Yousafzai became the youngest Nobel Prize winner ever, standing up so every child can go to school.", quiz: { q: "What does Malala stand up for?", a: "School for every child", opts: ["School for every child", "More homework", "Faster cars"] } }
    ]
  }
];

/* ---------------- Word game vocabulary ---------------- */

export interface PictureWord { word: string; emoji: string }

export const PICTURE_WORDS: PictureWord[] = [
  { word: "cat", emoji: "🐱" }, { word: "dog", emoji: "🐶" }, { word: "sun", emoji: "☀️" },
  { word: "hat", emoji: "🎩" }, { word: "bus", emoji: "🚌" }, { word: "bee", emoji: "🐝" },
  { word: "duck", emoji: "🦆" }, { word: "fish", emoji: "🐟" }, { word: "star", emoji: "⭐" },
  { word: "moon", emoji: "🌙" }, { word: "frog", emoji: "🐸" }, { word: "cake", emoji: "🍰" },
  { word: "ship", emoji: "🚢" }, { word: "tree", emoji: "🌳" }, { word: "book", emoji: "📚" },
  { word: "apple", emoji: "🍎" }, { word: "tiger", emoji: "🐯" }, { word: "house", emoji: "🏠" },
  { word: "cloud", emoji: "☁️" }, { word: "shell", emoji: "🐚" }, { word: "plane", emoji: "✈️" },
  { word: "robot", emoji: "🤖" }, { word: "whale", emoji: "🐳" }, { word: "snake", emoji: "🐍" }
];

/** Word-search themes; words are short enough for a 7×7 / 9×9 grid. */
export const SEARCH_THEMES: { name: string; emoji: string; words: string[] }[] = [
  { name: "Animals", emoji: "🦁", words: ["CAT", "DOG", "LION", "FROG", "BEAR", "DUCK"] },
  { name: "Space", emoji: "🚀", words: ["SUN", "MOON", "STAR", "MARS", "COMET"] },
  { name: "Ocean", emoji: "🌊", words: ["FISH", "CRAB", "WAVE", "SHELL", "CORAL"] },
  { name: "Food", emoji: "🍎", words: ["CAKE", "PLUM", "RICE", "TACO", "PEAR"] }
];

/* ---------------- Dream Card professions ---------------- */

export interface Profession { id: string; emoji: string; name: string; skills: string; tool: string; dream: string; hue: number }

export const PROFESSIONS: Profession[] = [
  { id: "doctor", emoji: "🩺", name: "Doctor", skills: "Caring · Listening · Science", tool: "Stethoscope", dream: "I want to help people feel better.", hue: 200 },
  { id: "teacher", emoji: "📖", name: "Teacher", skills: "Patience · Kindness · Explaining", tool: "Books", dream: "I want to help everyone learn.", hue: 30 },
  { id: "astronaut", emoji: "🚀", name: "Astronaut", skills: "Science · Fitness · Courage", tool: "Space suit", dream: "I want to explore the stars.", hue: 250 },
  { id: "artist", emoji: "🎨", name: "Artist", skills: "Imagination · Colours · Practice", tool: "Paintbrush", dream: "I want to fill the world with colour.", hue: 330 },
  { id: "scientist", emoji: "🔬", name: "Scientist", skills: "Wondering · Testing · Noticing", tool: "Microscope", dream: "I want to discover something new.", hue: 160 },
  { id: "photographer", emoji: "📷", name: "Photographer", skills: "Curiosity · Patience · Observation", tool: "Camera", dream: "I want to tell stories with pictures.", hue: 210 },
  { id: "engineer", emoji: "⚙️", name: "Engineer", skills: "Building · Maths · Imagination", tool: "Toolbox", dream: "I want to build amazing things.", hue: 20 },
  { id: "pilot", emoji: "✈️", name: "Pilot", skills: "Focus · Maps · Calm thinking", tool: "Aeroplane", dream: "I want to fly above the clouds.", hue: 190 },
  { id: "vet", emoji: "🐾", name: "Veterinarian", skills: "Animal care · Gentleness · Science", tool: "Bandages", dream: "I want to help animals feel better.", hue: 130 },
  { id: "chef", emoji: "🍳", name: "Chef", skills: "Tasting · Creativity · Safety", tool: "Whisk", dream: "I want to cook delicious food.", hue: 45 },
  { id: "firefighter", emoji: "🚒", name: "Firefighter", skills: "Bravery · Teamwork · Fitness", tool: "Fire hose", dream: "I want to keep people safe.", hue: 5 },
  { id: "marine", emoji: "🐠", name: "Marine Biologist", skills: "Swimming · Ocean facts · Patience", tool: "Diving mask", dream: "I want to protect the ocean.", hue: 175 },
  { id: "musician", emoji: "🎻", name: "Musician", skills: "Listening · Rhythm · Practice", tool: "Violin", dream: "I want to make music that makes people smile.", hue: 280 },
  { id: "programmer", emoji: "💻", name: "Programmer", skills: "Logic · Puzzles · Creativity", tool: "Computer", dream: "I want to build helpful apps.", hue: 220 },
  { id: "architect", emoji: "📐", name: "Architect", skills: "Drawing · Maths · Big ideas", tool: "Ruler", dream: "I want to design beautiful buildings.", hue: 90 },
  { id: "farmer", emoji: "🚜", name: "Farmer", skills: "Nature · Hard work · Animals", tool: "Tractor", dream: "I want to grow food for everyone.", hue: 110 },
  { id: "journalist", emoji: "📰", name: "Journalist", skills: "Curiosity · Writing · Honesty", tool: "Notebook", dream: "I want to tell true stories.", hue: 240 },
  { id: "lawyer", emoji: "⚖️", name: "Lawyer", skills: "Fairness · Reading · Speaking", tool: "Law books", dream: "I want to stand up for what is right.", hue: 260 }
];
