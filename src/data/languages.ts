/**
 * Portuguese and Kiswahili for young learners.
 *
 * Every item has a picture (emoji), the English meaning, Brazilian
 * Portuguese (`pt`, with the European form in `ptPT` where it differs) and
 * Kiswahili (`sw`, standard East African Swahili as taught in Kenya and
 * Tanzania).
 *
 * Choices made for children:
 *  - Greetings come first and are taught as whole phrases, the way children
 *    actually use them, with a short "say it like" guide.
 *  - Portuguese adjectives and thanks are given in the form a girl uses
 *    ("Obrigada", "Bem-vinda"), with a note about the boys' form.
 *  - Swahili colours use the everyday form children hear ("nyekundu").
 *
 * Audio: each item has an `id`; `public/audio/<lang>/<id>.mp3` is generated
 * from this file by `scripts/generate-language-audio.sh`.
 */

export type LangId = "pt" | "sw";

export interface LangItem {
  id: string;
  emoji: string;
  en: string;
  pt: string;
  ptPT?: string;
  sw: string;
  /** Pronunciation help for English speakers. */
  ptSay?: string;
  swSay?: string;
  /** A tiny cultural or grammar note, shown under the card. */
  note?: Partial<Record<LangId, string>>;
}

export interface LangTopic {
  id: string;
  emoji: string;
  en: string;
  pt: string;
  sw: string;
  items: LangItem[];
}

export const LANGS: Record<LangId, { name: string; native: string; flag: string; greeting: string; cheer: string[]; tryAgain: string[]; voiceLangs: string[] }> = {
  pt: {
    name: "Portuguese", native: "Português", flag: "🇧🇷🇵🇹", greeting: "Olá!",
    cheer: ["Muito bem!", "Parabéns!", "Fantástico!", "Que legal!", "Excelente!"],
    tryAgain: ["Quase! Vamos de novo!", "Tente outra vez!"],
    voiceLangs: ["pt-BR", "pt-PT", "pt"]
  },
  sw: {
    name: "Kiswahili", native: "Kiswahili", flag: "🇰🇪🇹🇿", greeting: "Jambo!",
    cheer: ["Hongera!", "Vizuri sana!", "Safi sana!", "Hodari!", "Umeweza!"],
    tryAgain: ["Jaribu tena!", "Bado kidogo — jaribu tena!"],
    voiceLangs: ["sw-KE", "sw-TZ", "sw"]
  }
};

export const TOPICS: LangTopic[] = [
  {
    id: "greet", emoji: "👋", en: "Hello & greetings", pt: "Olá!", sw: "Salamu",
    items: [
      { id: "hello", emoji: "👋", en: "Hello", pt: "Olá", sw: "Jambo", ptSay: "oh-LAH", swSay: "JAHM-boh",
        note: { pt: "Friends in Brazil also say “Oi!”", sw: "“Hujambo?” means “How are you?” — answer “Sijambo!”" } },
      { id: "good-morning", emoji: "🌅", en: "Good morning", pt: "Bom dia", sw: "Habari za asubuhi", ptSay: "bong DEE-ah", swSay: "ha-BAH-ree zah ah-soo-BOO-hee" },
      { id: "good-afternoon", emoji: "🌤️", en: "Good afternoon", pt: "Boa tarde", sw: "Habari za mchana", ptSay: "BOH-ah TAR-jee", swSay: "ha-BAH-ree zah m-CHAH-nah" },
      { id: "good-night", emoji: "🌙", en: "Good night", pt: "Boa noite", sw: "Lala salama", ptSay: "BOH-ah NOY-chee", swSay: "LAH-lah sah-LAH-mah",
        note: { sw: "“Lala salama” means “sleep peacefully”." } },
      { id: "how-are-you", emoji: "🙂", en: "How are you?", pt: "Como você está?", ptPT: "Como estás?", sw: "Habari yako?", ptSay: "KOH-moo voh-SAY ish-TAH", swSay: "ha-BAH-ree YAH-koh" },
      { id: "im-fine", emoji: "😊", en: "I'm fine!", pt: "Estou bem!", sw: "Nzuri!", ptSay: "ish-TOH bayng", swSay: "n-ZOO-ree",
        note: { sw: "Answer “Habari?” with “Nzuri!” — it means “good”." } },
      { id: "thank-you", emoji: "🙏", en: "Thank you", pt: "Obrigada", sw: "Asante", ptSay: "oh-bree-GAH-dah", swSay: "ah-SAHN-teh",
        note: { pt: "Girls say “obrigada”, boys say “obrigado”.", sw: "“Asante sana” means “thank you very much”." } },
      { id: "please", emoji: "🤲", en: "Please", pt: "Por favor", sw: "Tafadhali", ptSay: "por fah-VOR", swSay: "tah-fah-THAH-lee" },
      { id: "welcome", emoji: "🤗", en: "Welcome / You're welcome", pt: "De nada", sw: "Karibu", ptSay: "jee NAH-dah", swSay: "kah-REE-boo",
        note: { pt: "“De nada” is the answer to “obrigada”.", sw: "“Karibu” means “welcome” and “come in” too!" } },
      { id: "goodbye", emoji: "🫡", en: "Goodbye", pt: "Tchau", ptPT: "Adeus", sw: "Kwaheri", ptSay: "chow", swSay: "kwah-HEH-ree" },
      { id: "my-name", emoji: "📛", en: "My name is…", pt: "Meu nome é…", ptPT: "O meu nome é…", sw: "Jina langu ni…", ptSay: "MAY-oo NOH-mee eh", swSay: "JEE-nah LAHN-goo nee" },
      { id: "yes", emoji: "👍", en: "Yes", pt: "Sim", sw: "Ndiyo", ptSay: "seeng", swSay: "n-DEE-yoh" },
      { id: "no", emoji: "🙅", en: "No", pt: "Não", sw: "Hapana", ptSay: "nowng", swSay: "hah-PAH-nah" },
      { id: "elder", emoji: "👵🏾", en: "Respectful hello to an elder", pt: "Bom dia, senhora", sw: "Shikamoo", ptSay: "bong DEE-ah sen-YOR-ah", swSay: "shee-kah-MOH",
        note: { sw: "Children greet grown-ups with “Shikamoo”. The grown-up answers “Marahaba!”" } }
    ]
  },
  {
    id: "numbers", emoji: "🔢", en: "Numbers 1–10", pt: "Números", sw: "Namba",
    items: [
      { id: "1", emoji: "1️⃣", en: "one", pt: "um", sw: "moja" },
      { id: "2", emoji: "2️⃣", en: "two", pt: "dois", sw: "mbili" },
      { id: "3", emoji: "3️⃣", en: "three", pt: "três", sw: "tatu" },
      { id: "4", emoji: "4️⃣", en: "four", pt: "quatro", sw: "nne" },
      { id: "5", emoji: "5️⃣", en: "five", pt: "cinco", sw: "tano" },
      { id: "6", emoji: "6️⃣", en: "six", pt: "seis", sw: "sita" },
      { id: "7", emoji: "7️⃣", en: "seven", pt: "sete", sw: "saba" },
      { id: "8", emoji: "8️⃣", en: "eight", pt: "oito", sw: "nane" },
      { id: "9", emoji: "9️⃣", en: "nine", pt: "nove", sw: "tisa" },
      { id: "10", emoji: "🔟", en: "ten", pt: "dez", sw: "kumi" }
    ]
  },
  {
    id: "colours", emoji: "🎨", en: "Colours", pt: "Cores", sw: "Rangi",
    items: [
      { id: "red", emoji: "🔴", en: "red", pt: "vermelho", sw: "nyekundu" },
      { id: "blue", emoji: "🔵", en: "blue", pt: "azul", sw: "bluu" },
      { id: "yellow", emoji: "🟡", en: "yellow", pt: "amarelo", sw: "njano" },
      { id: "green", emoji: "🟢", en: "green", pt: "verde", sw: "kijani" },
      { id: "orange", emoji: "🟠", en: "orange", pt: "laranja", sw: "rangi ya chungwa" },
      { id: "purple", emoji: "🟣", en: "purple", pt: "roxo", sw: "zambarau" },
      { id: "pink", emoji: "🩷", en: "pink", pt: "rosa", ptPT: "cor-de-rosa", sw: "waridi" },
      { id: "brown", emoji: "🟤", en: "brown", pt: "marrom", ptPT: "castanho", sw: "kahawia" },
      { id: "black", emoji: "⚫", en: "black", pt: "preto", sw: "nyeusi" },
      { id: "white", emoji: "⚪", en: "white", pt: "branco", sw: "nyeupe" }
    ]
  },
  {
    id: "family", emoji: "👨‍👩‍👧‍👧", en: "Family", pt: "Família", sw: "Familia",
    items: [
      { id: "mum", emoji: "👩🏾", en: "mum", pt: "mãe", sw: "mama" },
      { id: "dad", emoji: "👨🏾", en: "dad", pt: "pai", sw: "baba" },
      { id: "sister", emoji: "👧🏽", en: "sister", pt: "irmã", sw: "dada" },
      { id: "brother", emoji: "👦🏽", en: "brother", pt: "irmão", sw: "kaka" },
      { id: "grandma", emoji: "👵🏾", en: "grandma", pt: "avó", sw: "bibi" },
      { id: "grandpa", emoji: "👴🏾", en: "grandpa", pt: "avô", sw: "babu" },
      { id: "baby", emoji: "👶🏽", en: "baby", pt: "bebê", ptPT: "bebé", sw: "mtoto" },
      { id: "friend", emoji: "🧒🏽", en: "friend", pt: "amiga", sw: "rafiki",
        note: { pt: "A girl friend is “amiga”, a boy friend is “amigo”." } }
    ]
  },
  {
    id: "animals", emoji: "🦁", en: "Animals", pt: "Animais", sw: "Wanyama",
    items: [
      { id: "dog", emoji: "🐶", en: "dog", pt: "cachorro", ptPT: "cão", sw: "mbwa" },
      { id: "cat", emoji: "🐱", en: "cat", pt: "gato", sw: "paka" },
      { id: "bird", emoji: "🐦", en: "bird", pt: "pássaro", sw: "ndege",
        note: { sw: "“Ndege” also means aeroplane — both fly!" } },
      { id: "fish", emoji: "🐟", en: "fish", pt: "peixe", sw: "samaki" },
      { id: "lion", emoji: "🦁", en: "lion", pt: "leão", sw: "simba" },
      { id: "elephant", emoji: "🐘", en: "elephant", pt: "elefante", sw: "tembo" },
      { id: "giraffe", emoji: "🦒", en: "giraffe", pt: "girafa", sw: "twiga" },
      { id: "zebra", emoji: "🦓", en: "zebra", pt: "zebra", sw: "punda milia",
        note: { sw: "“Punda milia” means “striped donkey”!" } },
      { id: "monkey", emoji: "🐒", en: "monkey", pt: "macaco", sw: "tumbili" },
      { id: "cow", emoji: "🐄", en: "cow", pt: "vaca", sw: "ng'ombe" },
      { id: "chicken", emoji: "🐔", en: "chicken", pt: "galinha", sw: "kuku" },
      { id: "butterfly", emoji: "🦋", en: "butterfly", pt: "borboleta", sw: "kipepeo" }
    ]
  },
  {
    id: "food", emoji: "🍌", en: "Food & drink", pt: "Comida", sw: "Chakula",
    items: [
      { id: "water", emoji: "💧", en: "water", pt: "água", sw: "maji" },
      { id: "milk", emoji: "🥛", en: "milk", pt: "leite", sw: "maziwa" },
      { id: "bread", emoji: "🍞", en: "bread", pt: "pão", sw: "mkate" },
      { id: "banana", emoji: "🍌", en: "banana", pt: "banana", sw: "ndizi" },
      { id: "mango", emoji: "🥭", en: "mango", pt: "manga", sw: "embe" },
      { id: "orange-fruit", emoji: "🍊", en: "orange", pt: "laranja", sw: "chungwa" },
      { id: "apple", emoji: "🍎", en: "apple", pt: "maçã", sw: "tufaha" },
      { id: "rice", emoji: "🍚", en: "rice", pt: "arroz", sw: "wali" },
      { id: "egg", emoji: "🥚", en: "egg", pt: "ovo", sw: "yai" },
      { id: "ice-cream", emoji: "🍦", en: "ice cream", pt: "sorvete", ptPT: "gelado", sw: "aiskrimu" }
    ]
  },
  {
    id: "body", emoji: "🙋🏽‍♀️", en: "My body", pt: "O corpo", sw: "Mwili",
    items: [
      { id: "head", emoji: "🙂", en: "head", pt: "cabeça", sw: "kichwa" },
      { id: "eyes", emoji: "👀", en: "eyes", pt: "olhos", sw: "macho" },
      { id: "ear", emoji: "👂🏽", en: "ear", pt: "orelha", sw: "sikio" },
      { id: "nose", emoji: "👃🏽", en: "nose", pt: "nariz", sw: "pua" },
      { id: "mouth", emoji: "👄", en: "mouth", pt: "boca", sw: "mdomo" },
      { id: "teeth", emoji: "🦷", en: "teeth", pt: "dentes", sw: "meno" },
      { id: "hand", emoji: "✋🏽", en: "hand", pt: "mão", sw: "mkono" },
      { id: "foot", emoji: "🦶🏽", en: "foot", pt: "pé", sw: "mguu" }
    ]
  },
  {
    id: "home", emoji: "🏠", en: "Home & school", pt: "Casa e escola", sw: "Nyumbani na shuleni",
    items: [
      { id: "house", emoji: "🏠", en: "house", pt: "casa", sw: "nyumba" },
      { id: "school", emoji: "🏫", en: "school", pt: "escola", sw: "shule" },
      { id: "book", emoji: "📖", en: "book", pt: "livro", sw: "kitabu" },
      { id: "pencil", emoji: "✏️", en: "pencil", pt: "lápis", sw: "penseli" },
      { id: "chair", emoji: "🪑", en: "chair", pt: "cadeira", sw: "kiti" },
      { id: "cup", emoji: "🥤", en: "cup", pt: "copo", sw: "kikombe" },
      { id: "bed", emoji: "🛏️", en: "bed", pt: "cama", sw: "kitanda" },
      { id: "door", emoji: "🚪", en: "door", pt: "porta", sw: "mlango" },
      { id: "ball", emoji: "⚽", en: "ball", pt: "bola", sw: "mpira" },
      { id: "car", emoji: "🚗", en: "car", pt: "carro", sw: "gari" }
    ]
  },
  {
    id: "nature", emoji: "🌳", en: "Nature", pt: "Natureza", sw: "Mazingira",
    items: [
      { id: "sun", emoji: "☀️", en: "sun", pt: "sol", sw: "jua" },
      { id: "moon", emoji: "🌙", en: "moon", pt: "lua", sw: "mwezi" },
      { id: "star", emoji: "⭐", en: "star", pt: "estrela", sw: "nyota" },
      { id: "tree", emoji: "🌳", en: "tree", pt: "árvore", sw: "mti" },
      { id: "flower", emoji: "🌸", en: "flower", pt: "flor", sw: "ua" },
      { id: "rain", emoji: "🌧️", en: "rain", pt: "chuva", sw: "mvua" },
      { id: "sea", emoji: "🌊", en: "sea", pt: "mar", sw: "bahari" },
      { id: "mountain", emoji: "⛰️", en: "mountain", pt: "montanha", sw: "mlima" }
    ]
  }
];

/** Short scenes that put greetings together, read as a conversation. */
export interface Dialogue { id: string; title: string; emoji: string; lines: { who: "a" | "b"; pt: string; ptPT?: string; sw: string; en: string }[] }

export const DIALOGUES: Dialogue[] = [
  {
    id: "meet", title: "Meeting a friend", emoji: "👧🏽👧🏾",
    lines: [
      { who: "a", en: "Hello!", pt: "Olá!", sw: "Jambo!" },
      { who: "b", en: "Hello! How are you?", pt: "Oi! Como você está?", ptPT: "Olá! Como estás?", sw: "Jambo! Habari yako?" },
      { who: "a", en: "I'm fine, thank you!", pt: "Estou bem, obrigada!", sw: "Nzuri, asante!" },
      { who: "b", en: "My name is Lara.", pt: "Meu nome é Lara.", ptPT: "O meu nome é Lara.", sw: "Jina langu ni Lara." },
      { who: "a", en: "Goodbye!", pt: "Tchau!", ptPT: "Adeus!", sw: "Kwaheri!" }
    ]
  },
  {
    id: "morning", title: "Good morning, Grandma", emoji: "👧🏽👵🏾",
    lines: [
      { who: "a", en: "Good morning, Grandma!", pt: "Bom dia, vovó!", ptPT: "Bom dia, avó!", sw: "Shikamoo, bibi!" },
      { who: "b", en: "Good morning, my dear!", pt: "Bom dia, querida!", sw: "Marahaba, mjukuu wangu!" },
      { who: "a", en: "May I have some milk, please?", pt: "Posso tomar leite, por favor?", ptPT: "Posso beber leite, por favor?", sw: "Naomba maziwa, tafadhali." },
      { who: "b", en: "Here you are!", pt: "Aqui está!", sw: "Haya, chukua!" },
      { who: "a", en: "Thank you!", pt: "Obrigada!", sw: "Asante!" }
    ]
  },
  {
    id: "bedtime", title: "Bedtime", emoji: "👩🏾🛏️",
    lines: [
      { who: "b", en: "Time for bed!", pt: "Hora de dormir!", sw: "Ni wakati wa kulala!" },
      { who: "a", en: "Good night, Mum!", pt: "Boa noite, mamãe!", ptPT: "Boa noite, mãe!", sw: "Lala salama, mama!" },
      { who: "b", en: "Good night, sleep well!", pt: "Boa noite, durma bem!", ptPT: "Boa noite, dorme bem!", sw: "Lala salama, mpenzi!" }
    ]
  }
];

/** The word a child should see/hear for the chosen Portuguese variant. */
export function word(item: { pt: string; ptPT?: string; sw: string }, lang: LangId, variant: "br" | "pt" = "br"): string {
  if (lang === "sw") return item.sw;
  return variant === "pt" && item.ptPT ? item.ptPT : item.pt;
}

/** Stable audio id for a dialogue line. */
export const lineId = (d: Dialogue, i: number) => `dlg-${d.id}-${i}`;
