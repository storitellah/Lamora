/**
 * Lamora curriculum map — Cambridge-aligned stages for ages 4–8(9).
 *
 * Sources this mapping follows:
 *  • Cambridge Early Years (ages 3–6) runs EY1 (3–4), EY2 (4–5), EY3 (5–6)
 *    across six curriculum areas, of which two are academic-core here:
 *    "Communication, language & literacy" and "Mathematics".
 *  • Cambridge Primary (ages 5–11) runs Stages 1–6 with core subjects
 *    English (0058), Mathematics (0096) and Science (0097). English carries a
 *    "Word structure (phonics)" sub-strand in Stages 1–4; Mathematics has the
 *    strands Number, Geometry & Measure, and Statistics & Probability.
 *
 * We expose the school labels families actually use (Pre-Primary 1/2,
 * Grade 1/2/3) and record the Cambridge equivalent alongside each one, so a
 * parent or teacher can see exactly which framework level a child is on.
 */

export type StageId = "pp1" | "pp2" | "g1" | "g2" | "g3";

export interface Strand {
  subject: "English" | "Mathematics" | "Science";
  strand: string;
  objectives: string[];
}

export interface Stage {
  id: StageId;
  name: string;          // school label, e.g. "Pre-Primary 1"
  short: string;         // compact badge, e.g. "PP1"
  cambridge: string;     // the Cambridge framework level this maps to
  ages: [number, number];
  emoji: string;
  blurb: string;
  strands: Strand[];
  /** Workbook activities unlocked at this stage (ids from WORKBOOKS). */
  workbooks: string[];
}

export const STAGES: Stage[] = [
  {
    id: "pp1",
    name: "Pre-Primary 1",
    short: "PP1",
    cambridge: "Cambridge Early Years — EY2",
    ages: [4, 5],
    emoji: "🐣",
    blurb: "First marks, first sounds, first numbers.",
    strands: [
      {
        subject: "English",
        strand: "Communication, language & literacy",
        objectives: [
          "Make controlled marks and pre-writing patterns",
          "Recognise own name and familiar letter shapes",
          "Hear and say the first sound in a word",
          "Join in with songs, rhymes and stories"
        ]
      },
      {
        subject: "Mathematics",
        strand: "Sense of number",
        objectives: [
          "Count objects reliably to 10",
          "Recognise numerals 1 to 10",
          "Match a numeral to a quantity",
          "Copy and continue a simple repeating pattern"
        ]
      },
      {
        subject: "Mathematics",
        strand: "Shape, space & measure",
        objectives: ["Name circle, square, triangle", "Compare big and small, long and short"]
      }
    ],
    workbooks: ["patterns", "colouring", "joindots", "firstletter", "funletters"]
  },
  {
    id: "pp2",
    name: "Pre-Primary 2",
    short: "PP2",
    cambridge: "Cambridge Early Years — EY3",
    ages: [5, 6],
    emoji: "🐥",
    blurb: "Forming letters, blending sounds, counting on.",
    strands: [
      {
        subject: "English",
        strand: "Communication, language & literacy",
        objectives: [
          "Form most lower-case letters correctly",
          "Link all letters of the alphabet to their sounds",
          "Blend sounds to read simple three-letter words",
          "Write own name and simple labels"
        ]
      },
      {
        subject: "Mathematics",
        strand: "Sense of number",
        objectives: [
          "Count, read and write numbers to 20",
          "Add and take away small amounts using objects",
          "Order numbers to 20",
          "Begin to sort numbers into odd and even"
        ]
      },
      {
        subject: "Mathematics",
        strand: "Shape, space & measure",
        objectives: ["Name common 2D shapes", "Describe position: on, under, next to"]
      }
    ],
    workbooks: ["patterns", "handwriting", "joindots", "firstletter", "funletters", "lettermaze", "completeword", "colouring", "oddeven"]
  },
  {
    id: "g1",
    name: "Grade 1",
    short: "G1",
    cambridge: "Cambridge Primary — Stage 1",
    ages: [6, 7],
    emoji: "🦊",
    blurb: "Reading simple sentences and numbers to 100.",
    strands: [
      {
        subject: "English",
        strand: "Reading — Word structure (phonics)",
        objectives: [
          "Use phonics to decode unfamiliar regular words",
          "Read common high-frequency (sight) words on sight",
          "Read and understand simple sentences"
        ]
      },
      {
        subject: "English",
        strand: "Writing — Handwriting & presentation",
        objectives: [
          "Form lower-case and capital letters correctly and consistently",
          "Write letters of the correct size and orientation",
          "Spell simple consonant-vowel-consonant words"
        ]
      },
      {
        subject: "Mathematics",
        strand: "Number",
        objectives: [
          "Count on and back in ones and tens to 100",
          "Recognise odd and even numbers",
          "Add and subtract within 20",
          "Understand place value in two-digit numbers"
        ]
      },
      {
        subject: "Mathematics",
        strand: "Geometry & Measure",
        objectives: ["Name and sort 2D and 3D shapes", "Tell the time to the hour"]
      },
      {
        subject: "Science",
        strand: "Biology & Earth",
        objectives: ["Sort living and non-living things", "Name parts of a plant and animal habitats"]
      }
    ],
    workbooks: ["handwriting", "patterns", "joindots", "firstletter", "funletters", "lettermaze", "completeword", "colouring", "oddeven"]
  },
  {
    id: "g2",
    name: "Grade 2",
    short: "G2",
    cambridge: "Cambridge Primary — Stage 2",
    ages: [7, 8],
    emoji: "🦉",
    blurb: "Joined-up writing, spelling patterns, numbers to 1000.",
    strands: [
      {
        subject: "English",
        strand: "Reading — Word structure (phonics)",
        objectives: [
          "Decode words with common digraphs and blends",
          "Read a wider range of sight words fluently",
          "Answer simple questions about a text"
        ]
      },
      {
        subject: "English",
        strand: "Writing — Handwriting & spelling",
        objectives: [
          "Write letters with consistent size and spacing",
          "Begin to join some letters",
          "Spell words with common patterns and endings"
        ]
      },
      {
        subject: "Mathematics",
        strand: "Number",
        objectives: [
          "Count in twos, fives and tens",
          "Recognise odd and even numbers and explain why",
          "Add and subtract two-digit numbers",
          "Understand multiplication as repeated addition"
        ]
      },
      {
        subject: "Mathematics",
        strand: "Geometry & Measure",
        objectives: ["Measure length and mass in standard units", "Tell time to the half and quarter hour"]
      },
      {
        subject: "Science",
        strand: "Materials & Forces",
        objectives: ["Describe properties of everyday materials", "Explore pushes and pulls"]
      }
    ],
    workbooks: ["handwriting", "joindots", "funletters", "lettermaze", "completeword", "colouring", "oddeven"]
  },
  {
    id: "g3",
    name: "Grade 3",
    short: "G3",
    cambridge: "Cambridge Primary — Stage 3",
    ages: [8, 9],
    emoji: "🦅",
    blurb: "Fluent reading, times tables and problem solving.",
    strands: [
      {
        subject: "English",
        strand: "Reading & comprehension",
        objectives: [
          "Read age-appropriate texts with fluency",
          "Use context to work out unfamiliar words",
          "Retell a story and explain its main idea"
        ]
      },
      {
        subject: "English",
        strand: "Writing — Spelling & grammar",
        objectives: [
          "Spell words with prefixes and suffixes",
          "Write in clear joined handwriting",
          "Use capital letters and full stops accurately"
        ]
      },
      {
        subject: "Mathematics",
        strand: "Number",
        objectives: [
          "Know multiplication facts for 2, 3, 4, 5 and 10",
          "Divide by sharing and grouping",
          "Add and subtract three-digit numbers",
          "Classify numbers as odd or even and find patterns"
        ]
      },
      {
        subject: "Mathematics",
        strand: "Statistics & Probability",
        objectives: ["Read and make simple pictograms and block graphs"]
      },
      {
        subject: "Science",
        strand: "Living things & Space",
        objectives: ["Describe life cycles", "Explain day and night and the solar system"]
      }
    ],
    workbooks: ["handwriting", "joindots", "completeword", "funletters", "colouring", "oddeven"]
  }
];

export const stageById = (id: StageId): Stage => STAGES.find(s => s.id === id) ?? STAGES[0];

/** Suggest a stage from the child's age (parents can always override). */
export function stageForAge(age: number): StageId {
  if (age <= 4) return "pp1";
  if (age === 5) return "pp2";
  if (age === 6) return "g1";
  if (age === 7) return "g2";
  return "g3";
}
