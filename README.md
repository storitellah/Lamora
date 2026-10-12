<div align="center">

<img src="public/icons/icon-192.png" width="96" alt="Lamora icon" />

# Lamora

**A calm, joyful learning world for children aged 4–10.**

No ads · No accounts · No tracking · Works completely offline

</div>

---

## For parents & educators, in 30 seconds

Lamora is a learning app your child can use **on their own** — and that you can trust completely:

- 🧒 **Made for little hands.** Big buttons, spoken instructions, gentle feedback. A five-year-old can navigate it without help.
- 🔒 **Truly private.** Everything — profiles, stars, progress, photos — stays on your device. There is no server, no account, no analytics, nothing to leak. Ever.
- ✈️ **Works anywhere.** Install it once and it runs fully offline: perfect for flights, car rides and waiting rooms.
- ⏳ **You set the limits.** Daily screen-time caps, short reward-game sessions and a PIN-protected parent dashboard.
- 💛 **Kind by design.** Wrong answers get a hint and another try — never a buzzer, never shame. Learning earns play, transparently, with no manipulative tricks and nothing to buy.

> *Made for Luna, Lara, Arica and all their friends.*

## What children do in Lamora

| Pathway | What's inside |
| --- | --- |
| 🧩 **Puzzles** | Seven brain-teasers with easy/medium/hard levels: **Shape Sums** (picture arithmetic — add and subtract the *lines* that make a shape), **Maze Adventure** (16 levels, stars, keys & doors), What Comes Next, Odd One Out, Balance Scales, Number Pyramid and Shape Sudoku |
| ✏️ **Workbooks** | Stage-by-stage workbook sheets aligned to the **Cambridge** frameworks (Pre-Primary 1 & 2, Grade 1–3): pre-writing **patterns**, **handwriting**, **join the dots**, **first letters**, **fun with letters**, **letter maze**, **complete the word**, **colouring pages**, and **odd & even numbers** |
| 🖌️ **Art Studio** | Draw and paint with a finger, stylus or **Apple Pencil** (pressure-sensitive, with automatic palm rejection). Pen, pencil, crayon, marker, spray and rainbow brushes; fill bucket, shapes, stickers, eyedropper and move tool; **layers** with a one-tap "paint under the lines"; mirror drawing; pinch-zoom; unlimited undo. Colour any of the colouring-book pictures, keep work in **My Gallery**, and save **high-resolution JPGs** (2400×1800, or a 12-megapixel poster) |
| 🎨 **Colour Lab** | Six rooms for learning how colour really works: **Mixing Pots** (pour red, yellow, blue, white and black and name what you made), **Colour Wheel** (recipes, warm vs cool, opposites), **Mix to Match** challenges, **Light vs Paint** (why torches and paint pots mix in *opposite* ways), **Tints & Shades**, and **Colour Science** fact cards with a quiz |
| 💪 **Reading Gym** | A six-step reading ladder that unlocks in order: letter sounds → sound-it-out blending → word families → sight-word speed → sentences → a short story with comprehension |
| 📖 **Reading & Writing** | Phonics with letter sounds, **letter tracing** on a drawing canvas, sight words by level, read-along stories with quizzes |
| 🔢 **Maths Journey** | Progressive tiers (1–10 → 10–20 → 20–30 → 30–40 → 40–100 → 100+) across **+ − × ÷**, with tappable visual counters so young children can *see* every sum |
| 🌍 **Did You Know?** | Swipeable curiosity cards: Planets & Space, World Wonders, Animals & Wildlife, Global Cities, Inspiring People — each with a mini-quiz |
| 🎮 **Play** | Reward games unlocked by learning: Word Match, Word Search (drag to circle!), Letter Scramble, sliding Picture Puzzles, Logic Tiles, Matching Pairs |
| ♟️ **Chess** | Checkmate-in-one puzzles, a friendly beginner computer opponent, two-player mode — every legal move lights up, and a Hint button helps |
| ✨ **Dream Cards** | Beautiful, collectible "when I grow up" keepsake cards — add a photo (kept on-device), export as high-res PNG or print to PDF. **No branding on the card, ever** — it's your family's keepsake |
| 🏆 **My Rewards** | A simple, honest progress view: stars, saved play sessions, and a visible ladder to the next unlock |

### 🎓 Following a real curriculum

The **Workbooks** pathway is organised into five stages that map onto the Cambridge frameworks, so school and home stay in step:

| In Lamora | Cambridge level | Typical ages |
| --- | --- | --- |
| Pre-Primary 1 | Cambridge Early Years — EY2 | 4–5 |
| Pre-Primary 2 | Cambridge Early Years — EY3 | 5–6 |
| Grade 1 | Cambridge Primary — Stage 1 | 6–7 |
| Grade 2 | Cambridge Primary — Stage 2 | 7–8 |
| Grade 3 | Cambridge Primary — Stage 3 | 8–9 |

Each stage lists the subjects, strands and learning objectives it covers — tap **"What does this stage cover?"** inside Workbooks. A child's stage follows their age automatically, and a grown-up can pin a different one in the Parent Dashboard. Any stage can be opened at any time, so siblings can share a device and a teacher can revise or reach ahead.

**How the learning loop works:** finishing any lesson earns ⭐ stars → every few stars (you choose how many) become one 🎮 play session → the session ends automatically after the time you set. Learning always comes first, and the deal is visible to the child.

## The Parent Dashboard

Hold the 🔒 button for 3 seconds and enter your PIN (you create it on first use) to:

- Toggle **sounds, speech and background music**, set volume
- Set the **daily screen-time limit** (gentle 5-minute and 1-minute warnings, then a calm break screen suggesting an off-screen activity)
- Set **reward-game session length** and how many stars a session costs
- Manage up to six **child profiles** (name, age 5–10, avatar) — difficulty adapts to age automatically
- Turn on **reduced motion** (also follows your device's setting)
- **Export a progress summary**, reset rewards, change the PIN, or **delete all data** in one tap

## Getting started

**Installing on a tablet or computer?** See **[docs/INSTALL.md](docs/INSTALL.md)** — Android APK, iPad / iPhone, Mac and Windows.

Lamora is a Progressive Web App that also ships as a native Android app (APK) and an iOS project, built with Capacitor from the same code:

```bash
npm install
npm run dev       # local development
npm run build     # production build in dist/
npm run preview   # serve the production build
```

Deploy the `dist/` folder to any static host (Cloudflare Pages, Netlify, GitHub Pages…). Then on your device:

- **iPad / iPhone (Safari):** Share → *Add to Home Screen*
- **Android:** install the APK from the [Releases page](https://github.com/storitellah/Lamora/releases/tag/android-latest), or Chrome → menu → *Install app*
- **Windows / Mac (Chrome or Edge):** the install icon in the address bar

After the first visit, Lamora works entirely offline — updates apply quietly when you're back online.

## Privacy, in plain words

Lamora makes **zero network requests** after loading: no fonts from CDNs, no analytics, no APIs. Sounds are synthesised on the device, speech uses your device's built-in voices, and photos for Dream Cards are drawn straight onto a local canvas — never uploaded, never analysed, gone when you leave unless *you* export the card. Drawings from the Art Studio are kept in the browser's on-device storage (or inside the installed app) and leave the device only when you choose **Save**. The Android app has cloud backup switched off, so children's data isn't copied to Google Drive either. Full details: [PRIVACY.md](PRIVACY.md) · [CHILD-SAFETY.md](CHILD-SAFETY.md) · [PARENT-GUIDE.md](PARENT-GUIDE.md).

## Under the hood

React 18 + TypeScript, Tailwind CSS 4, Framer Motion (fluid, spring-based micro-interactions), Lucide icons, Vite, and `vite-plugin-pwa` for offline precaching. System font stack (SF Pro on Apple devices) — no font downloads. State lives in `localStorage` behind a single typed reducer. ~120 KB gzipped, all-in.

```
src/
  lib/        store (state + persistence) · audio + speech engine · chess engine
              art engine (vector strokes, flood fill, export) · gallery (IndexedDB)
              saveFile (download / share sheet / native) · tiny PDF writer
  components/ UI kit (glass surfaces, buttons, quiz engine, confetti)
  screens/    Reading · Math · Trivia · Games · Chess · DreamCards · Parent
  data/       all curriculum content, in one reviewable file
```

Two pieces of content are *computed* rather than hand-written, because getting them wrong would teach children something false:

- **Colour mixing** (`lib/color.ts`) — paint mixes with a subtractive **RYB** model (Gosset–Chen cube, trilinear interpolation) and light mixes additively in **RGB**. A naive RGB average would make blue + yellow into grey; here it makes green, exactly as it does in a real paint pot.
- **Shape Sums** (`data/shapes.ts`) — shapes are sets of line segments, so `+` is a union and `−` is a difference. Every equation in the game is discovered from that model and checked, never typed in by hand.

Accessibility: every control is ≥44×44 pt with a visible focus ring, screen-reader labels throughout, full keyboard support, reduced-motion support, and read-aloud on demand.

## License

MIT — use it, remix it, share it with a classroom.
