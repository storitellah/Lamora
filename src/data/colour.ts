/**
 * Colour Lab content: the colour wheel, mixing recipes to discover, and
 * kid-level colour science.
 */

export interface WheelSlice {
  name: string;
  hex: string;
  kind: "primary" | "secondary" | "tertiary";
  /** How an artist makes it, in a child's words. */
  recipe: string;
  warm: boolean;
}

/**
 * Twelve-part artist's wheel, in order. Opposite entries (6 apart) are
 * complementary pairs — the screen uses that to teach "opposites pop".
 */
export const WHEEL: WheelSlice[] = [
  { name: "Red",           hex: "#ff2727", kind: "primary",   recipe: "A primary colour — you cannot mix it", warm: true },
  { name: "Red-orange",    hex: "#ff5e14", kind: "tertiary",  recipe: "Lots of red + a little yellow",        warm: true },
  { name: "Orange",        hex: "#ff8c14", kind: "secondary", recipe: "Red + yellow",                          warm: true },
  { name: "Yellow-orange", hex: "#ffba1e", kind: "tertiary",  recipe: "Lots of yellow + a little red",        warm: true },
  { name: "Yellow",        hex: "#ffed2d", kind: "primary",   recipe: "A primary colour — you cannot mix it", warm: true },
  { name: "Yellow-green",  hex: "#b7d538", kind: "tertiary",  recipe: "Lots of yellow + a little blue",       warm: true },
  { name: "Green",         hex: "#26a64d", kind: "secondary", recipe: "Yellow + blue",                         warm: false },
  { name: "Blue-green",    hex: "#1f8f85", kind: "tertiary",  recipe: "Lots of blue + a little yellow",       warm: false },
  { name: "Blue",          hex: "#255ec7", kind: "primary",   recipe: "A primary colour — you cannot mix it", warm: false },
  { name: "Blue-purple",   hex: "#5b4bbf", kind: "tertiary",  recipe: "Lots of blue + a little red",          warm: false },
  { name: "Purple",        hex: "#9239a9", kind: "secondary", recipe: "Red + blue",                            warm: false },
  { name: "Red-purple",    hex: "#c7318c", kind: "tertiary",  recipe: "Lots of red + a little blue",          warm: true }
];

/** Recipes the Mixing Pots screen celebrates when a child discovers them. */
export interface Recipe { id: string; name: string; emoji: string; drops: Record<string, number>; note: string }

export const DISCOVERIES: Recipe[] = [
  { id: "orange", name: "Orange", emoji: "🟠", drops: { red: 1, yellow: 1 }, note: "Red + yellow makes orange!" },
  { id: "green",  name: "Green",  emoji: "🟢", drops: { yellow: 1, blue: 1 }, note: "Yellow + blue makes green!" },
  { id: "purple", name: "Purple", emoji: "🟣", drops: { red: 1, blue: 1 },    note: "Red + blue makes purple!" },
  { id: "brown",  name: "Brown",  emoji: "🟤", drops: { red: 1, yellow: 1, blue: 1 }, note: "All three primaries make brown!" },
  { id: "pink",   name: "Pink",   emoji: "🩷", drops: { red: 1, white: 2 },   note: "Red + white makes pink — that's a tint!" },
  { id: "darkred",name: "Dark red", emoji: "🟥", drops: { red: 2, black: 1 }, note: "Red + black makes dark red — that's a shade!" }
];

/* ---------------- Colour science for kids ---------------- */

export interface ColourFact {
  emoji: string;
  title: string;
  fact: string;
  quiz?: { q: string; a: string; opts: string[] };
}

export const COLOUR_FACTS: ColourFact[] = [
  {
    emoji: "🌈", title: "White light hides a rainbow",
    fact: "Sunlight looks white, but it is really every colour mixed together. A raindrop or a glass prism can bend the light and spread the colours out — that is how a rainbow is made!",
    quiz: { q: "What makes a rainbow?", a: "Light bending in raindrops", opts: ["Light bending in raindrops", "Paint in the sky", "Clouds mixing"] }
  },
  {
    emoji: "👁️", title: "Your eyes have three colour catchers",
    fact: "Inside your eye are tiny cells called cones. You have three kinds: one for red light, one for green and one for blue. Your brain mixes their signals into every colour you see.",
    quiz: { q: "How many kinds of colour cone do your eyes have?", a: "Three", opts: ["Three", "Seven", "One"] }
  },
  {
    emoji: "🍃", title: "Why leaves are green",
    fact: "Leaves are full of a green stuff called chlorophyll that soaks up red and blue light to make food. It cannot use green light, so it bounces green back to your eyes.",
    quiz: { q: "Why do leaves look green?", a: "They bounce green light back", opts: ["They bounce green light back", "They are painted", "They eat green light"] }
  },
  {
    emoji: "🫐", title: "Colour is light bouncing back",
    fact: "Nothing is really 'coloured' in the dark! An apple looks red because it soaks up every colour except red, and bounces the red light into your eyes.",
    quiz: { q: "Why does a red apple look red?", a: "It bounces red light back", opts: ["It bounces red light back", "It glows red", "It soaks up red"] }
  },
  {
    emoji: "💡", title: "Light mixes the other way round",
    fact: "Paint gets darker as you mix (all three primaries make brown), but light gets BRIGHTER. Red light + green light makes yellow, and all three make pure white!",
    quiz: { q: "What do red and green LIGHT make?", a: "Yellow", opts: ["Yellow", "Brown", "Black"] }
  },
  {
    emoji: "🌊", title: "Why the sky is blue",
    fact: "Air scatters blue light much more than red light, so blue bounces all around the sky and reaches you from every direction. At sunset the light travels further, the blue scatters away, and you see red and orange.",
    quiz: { q: "Why is the sky blue?", a: "Air scatters blue light", opts: ["Air scatters blue light", "The sea reflects up", "The sun is blue"] }
  },
  {
    emoji: "🦎", title: "Animals use colour to hide — or to warn",
    fact: "A chameleon changes colour to blend in, but a bright red ladybird does the opposite: its colour shouts 'I taste horrible!' to birds. Colour can hide you or protect you.",
    quiz: { q: "Why is a ladybird bright red?", a: "To warn birds away", opts: ["To warn birds away", "To hide in leaves", "To stay warm"] }
  },
  {
    emoji: "🖨️", title: "Printers use different primaries",
    fact: "Painters mix red, yellow and blue. Printers use cyan, magenta and yellow instead, because those inks can make the widest range of colours on white paper.",
    quiz: { q: "Which three inks does a printer use?", a: "Cyan, magenta, yellow", opts: ["Cyan, magenta, yellow", "Red, green, blue", "Black, white, grey"] }
  },
  {
    emoji: "🎨", title: "Opposite colours make each other pop",
    fact: "Colours across from each other on the wheel are called complementary — like red and green, or blue and orange. Put them side by side and they both look brighter.",
    quiz: { q: "What is opposite blue on the wheel?", a: "Orange", opts: ["Orange", "Green", "Purple"] }
  },
  {
    emoji: "🔥", title: "Warm colours and cool colours",
    fact: "Reds, oranges and yellows remind us of fire and sunshine, so we call them warm. Blues, greens and purples remind us of water and shade, so we call them cool.",
    quiz: { q: "Which of these is a cool colour?", a: "Blue", opts: ["Blue", "Orange", "Red"] }
  }
];
