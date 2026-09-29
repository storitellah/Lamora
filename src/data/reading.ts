/**
 * Reading Gym content for ages 5–10.
 *
 * The ladder follows the usual systematic-phonics order that Cambridge
 * Primary's "Word structure (phonics)" sub-strand assumes: single letter
 * sounds → blending CVC words → word families → sight words → sentences →
 * a short passage with comprehension.
 */

/* ---------------- 1. Letter sounds ---------------- */

export interface SoundItem { letter: string; sound: string; word: string; emoji: string }

export const LETTER_SOUNDS: SoundItem[] = [
  { letter: "s", sound: "sss", word: "sun", emoji: "☀️" },
  { letter: "a", sound: "aa", word: "ant", emoji: "🐜" },
  { letter: "t", sound: "t", word: "tap", emoji: "🚰" },
  { letter: "p", sound: "p", word: "pig", emoji: "🐷" },
  { letter: "i", sound: "i", word: "ink", emoji: "🖋️" },
  { letter: "n", sound: "nnn", word: "net", emoji: "🥅" },
  { letter: "m", sound: "mmm", word: "map", emoji: "🗺️" },
  { letter: "d", sound: "d", word: "dog", emoji: "🐶" },
  { letter: "g", sound: "g", word: "goat", emoji: "🐐" },
  { letter: "o", sound: "o", word: "octopus", emoji: "🐙" },
  { letter: "c", sound: "k", word: "cat", emoji: "🐱" },
  { letter: "k", sound: "k", word: "kite", emoji: "🪁" },
  { letter: "e", sound: "e", word: "egg", emoji: "🥚" },
  { letter: "u", sound: "u", word: "umbrella", emoji: "☂️" },
  { letter: "r", sound: "rrr", word: "rain", emoji: "🌧️" },
  { letter: "h", sound: "h", word: "hat", emoji: "🎩" },
  { letter: "b", sound: "b", word: "ball", emoji: "⚽" },
  { letter: "f", sound: "fff", word: "fish", emoji: "🐟" },
  { letter: "l", sound: "lll", word: "leaf", emoji: "🍃" },
  { letter: "j", sound: "j", word: "jam", emoji: "🍓" },
  { letter: "v", sound: "vvv", word: "van", emoji: "🚐" },
  { letter: "w", sound: "w", word: "web", emoji: "🕸️" },
  { letter: "z", sound: "zzz", word: "zebra", emoji: "🦓" },
  { letter: "y", sound: "y", word: "yo-yo", emoji: "🪀" }
];

/* ---------------- 2. Blending (sound it out) ---------------- */

export interface CvcWord { word: string; emoji: string; parts: string[] }

export const CVC_WORDS: CvcWord[] = [
  { word: "cat", emoji: "🐱", parts: ["c", "a", "t"] },
  { word: "dog", emoji: "🐶", parts: ["d", "o", "g"] },
  { word: "pig", emoji: "🐷", parts: ["p", "i", "g"] },
  { word: "sun", emoji: "☀️", parts: ["s", "u", "n"] },
  { word: "hat", emoji: "🎩", parts: ["h", "a", "t"] },
  { word: "bus", emoji: "🚌", parts: ["b", "u", "s"] },
  { word: "net", emoji: "🥅", parts: ["n", "e", "t"] },
  { word: "map", emoji: "🗺️", parts: ["m", "a", "p"] },
  { word: "bed", emoji: "🛏️", parts: ["b", "e", "d"] },
  { word: "cup", emoji: "☕", parts: ["c", "u", "p"] },
  { word: "fox", emoji: "🦊", parts: ["f", "o", "x"] },
  { word: "web", emoji: "🕸️", parts: ["w", "e", "b"] },
  { word: "jam", emoji: "🍓", parts: ["j", "a", "m"] },
  { word: "van", emoji: "🚐", parts: ["v", "a", "n"] },
  { word: "pen", emoji: "🖊️", parts: ["p", "e", "n"] },
  { word: "log", emoji: "🪵", parts: ["l", "o", "g"] }
];

/* ---------------- 3. Word families (rimes) ---------------- */

export interface WordFamily { rime: string; words: { word: string; emoji: string }[] }

export const WORD_FAMILIES: WordFamily[] = [
  { rime: "-at", words: [{ word: "cat", emoji: "🐱" }, { word: "hat", emoji: "🎩" }, { word: "bat", emoji: "🦇" }, { word: "mat", emoji: "🧿" }] },
  { rime: "-an", words: [{ word: "man", emoji: "🧍" }, { word: "van", emoji: "🚐" }, { word: "pan", emoji: "🍳" }, { word: "fan", emoji: "🪭" }] },
  { rime: "-ig", words: [{ word: "pig", emoji: "🐷" }, { word: "dig", emoji: "⛏️" }, { word: "wig", emoji: "💇" }, { word: "fig", emoji: "🫒" }] },
  { rime: "-og", words: [{ word: "dog", emoji: "🐶" }, { word: "log", emoji: "🪵" }, { word: "frog", emoji: "🐸" }, { word: "fog", emoji: "🌫️" }] },
  { rime: "-un", words: [{ word: "sun", emoji: "☀️" }, { word: "run", emoji: "🏃" }, { word: "bun", emoji: "🍞" }, { word: "fun", emoji: "🎉" }] },
  { rime: "-ed", words: [{ word: "bed", emoji: "🛏️" }, { word: "red", emoji: "🔴" }, { word: "shed", emoji: "🛖" }, { word: "sled", emoji: "🛷" }] }
];

/* ---------------- 4. Sight words by band ---------------- */

export const SIGHT_BANDS: string[][] = [
  ["the", "and", "a", "to", "I", "is", "it", "in", "we", "go"],
  ["you", "said", "was", "my", "she", "he", "they", "see", "like", "come"],
  ["have", "what", "when", "some", "here", "there", "were", "with", "your", "from"],
  ["because", "friend", "would", "people", "again", "thought", "through", "before"]
];

/* ---------------- 5. Sentences to read ---------------- */

export interface SentenceItem { text: string; emoji: string; q: string; a: string; opts: string[] }

export const SENTENCES: SentenceItem[] = [
  { text: "The cat sat on the mat.", emoji: "🐱", q: "Where did the cat sit?", a: "On the mat", opts: ["On the mat", "On the bed", "In the box"] },
  { text: "I can see a big red bus.", emoji: "🚌", q: "What colour is the bus?", a: "Red", opts: ["Red", "Blue", "Green"] },
  { text: "The dog ran to the park.", emoji: "🐶", q: "Where did the dog run?", a: "To the park", opts: ["To the park", "To the shop", "To bed"] },
  { text: "We had fun in the sun.", emoji: "☀️", q: "Where did we have fun?", a: "In the sun", opts: ["In the sun", "In the rain", "In the snow"] },
  { text: "My frog can hop on a log.", emoji: "🐸", q: "What can the frog do?", a: "Hop", opts: ["Hop", "Swim", "Fly"] },
  { text: "She put the jam on her bun.", emoji: "🍓", q: "What went on the bun?", a: "Jam", opts: ["Jam", "Cheese", "Butter"] }
];

/* ---------------- 6. Short passages ---------------- */

export interface Passage {
  title: string; emoji: string; lines: string[];
  questions: { q: string; a: string; opts: string[] }[];
}

export const PASSAGES: Passage[] = [
  {
    title: "The Lost Kite", emoji: "🪁",
    lines: [
      "Sam had a red kite.",
      "The wind blew it into a tall tree.",
      "His sister Mia climbed up and got it back.",
      "Sam said thank you, and they flew it together."
    ],
    questions: [
      { q: "What colour was the kite?", a: "Red", opts: ["Red", "Blue", "Yellow"] },
      { q: "Where did the kite go?", a: "Into a tree", opts: ["Into a tree", "Into a pond", "Onto a roof"] },
      { q: "Who got the kite back?", a: "Mia", opts: ["Mia", "Sam", "Dad"] }
    ]
  },
  {
    title: "Ben's Puppy", emoji: "🐶",
    lines: [
      "Ben has a small puppy called Pip.",
      "Pip likes to dig in the garden.",
      "One day Pip dug up an old spoon.",
      "Ben washed it and kept it on his shelf."
    ],
    questions: [
      { q: "What is the puppy called?", a: "Pip", opts: ["Pip", "Ben", "Max"] },
      { q: "What did Pip dig up?", a: "An old spoon", opts: ["An old spoon", "A bone", "A ball"] },
      { q: "Where did Ben keep it?", a: "On his shelf", opts: ["On his shelf", "In the bin", "Under his bed"] }
    ]
  },
  {
    title: "Rain at the Beach", emoji: "🏖️",
    lines: [
      "We went to the beach on Saturday.",
      "Grey clouds came and it began to rain.",
      "Instead of going home, we splashed in the puddles.",
      "It turned out to be the best day of the summer."
    ],
    questions: [
      { q: "When did they go to the beach?", a: "Saturday", opts: ["Saturday", "Monday", "Sunday"] },
      { q: "What did they do in the rain?", a: "Splashed in puddles", opts: ["Splashed in puddles", "Went home", "Built a sandcastle"] },
      { q: "How did the day turn out?", a: "The best day", opts: ["The best day", "A sad day", "A boring day"] }
    ]
  }
];

/* ---------------- The ladder ---------------- */

export interface ReadingDrill {
  id: string; name: string; emoji: string; sub: string;
  /** Roughly the age this drill suits; used only for display. */
  ages: string;
}

export const READING_DRILLS: ReadingDrill[] = [
  { id: "sounds",   name: "Letter Sounds",  emoji: "🔤", sub: "Hear it, find it",     ages: "5+" },
  { id: "blend",    name: "Sound It Out",   emoji: "🗣️", sub: "c-a-t … cat!",         ages: "5+" },
  { id: "families", name: "Word Families",  emoji: "👨‍👩‍👧", sub: "-at, -an, -ig",       ages: "6+" },
  { id: "sight",    name: "Sight Words",    emoji: "⚡", sub: "Read them fast",        ages: "6+" },
  { id: "sentence", name: "Sentences",      emoji: "📄", sub: "Read and answer",      ages: "7+" },
  { id: "passage",  name: "Story Reading",  emoji: "📖", sub: "A short story + questions", ages: "8+" }
];
