<div align="center">

<img src="public/icons/icon-192.png" width="96" alt="Lamora icon" />

# Lamora

**A calm, joyful learning world for children aged 5–10.**

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
| 📖 **Reading & Writing** | Phonics with letter sounds, **letter tracing** on a drawing canvas, sight words by level, read-along stories with quizzes |
| 🔢 **Maths Journey** | Progressive tiers (1–10 → 10–20 → 20–30 → 30–40 → 40–100 → 100+) across **+ − × ÷**, with tappable visual counters so young children can *see* every sum |
| 🌍 **Did You Know?** | Swipeable curiosity cards: Planets & Space, World Wonders, Animals & Wildlife, Global Cities, Inspiring People — each with a mini-quiz |
| 🎮 **Play** | Reward games unlocked by learning: Word Match, Word Search (drag to circle!), Letter Scramble, sliding Picture Puzzles, Logic Tiles, Matching Pairs |
| ♟️ **Chess** | Checkmate-in-one puzzles, a friendly beginner computer opponent, two-player mode — every legal move lights up, and a Hint button helps |
| ✨ **Dream Cards** | Beautiful, collectible "when I grow up" keepsake cards — add a photo (kept on-device), export as high-res PNG or print to PDF. **No branding on the card, ever** — it's your family's keepsake |
| 🏆 **My Rewards** | A simple, honest progress view: stars, saved play sessions, and a visible ladder to the next unlock |

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

Lamora is a Progressive Web App — one page, no installation store needed:

```bash
npm install
npm run dev       # local development
npm run build     # production build in dist/
npm run preview   # serve the production build
```

Deploy the `dist/` folder to any static host (Cloudflare Pages, Netlify, GitHub Pages…). Then on your device:

- **iPad / iPhone (Safari):** Share → *Add to Home Screen*
- **Android (Chrome):** menu → *Install app*
- **Windows / Mac (Chrome or Edge):** the install icon in the address bar

After the first visit, Lamora works entirely offline — updates apply quietly when you're back online.

## Privacy, in plain words

Lamora makes **zero network requests** after loading: no fonts from CDNs, no analytics, no APIs. Sounds are synthesised on the device, speech uses your device's built-in voices, and photos for Dream Cards are drawn straight onto a local canvas — never uploaded, never analysed, gone when you leave unless *you* export the card. Full details: [PRIVACY.md](PRIVACY.md) · [CHILD-SAFETY.md](CHILD-SAFETY.md) · [PARENT-GUIDE.md](PARENT-GUIDE.md).

## Under the hood

React 18 + TypeScript, Tailwind CSS 4, Framer Motion (fluid, spring-based micro-interactions), Lucide icons, Vite, and `vite-plugin-pwa` for offline precaching. System font stack (SF Pro on Apple devices) — no font downloads. State lives in `localStorage` behind a single typed reducer. ~120 KB gzipped, all-in.

```
src/
  lib/        store (state + persistence) · audio engine · chess engine
  components/ UI kit (glass surfaces, buttons, quiz engine, confetti)
  screens/    Reading · Math · Trivia · Games · Chess · DreamCards · Parent
  data/       all curriculum content, in one reviewable file
```

Accessibility: every control is ≥44×44 pt with a visible focus ring, screen-reader labels throughout, full keyboard support, reduced-motion support, and read-aloud on demand.

## License

MIT — use it, remix it, share it with a classroom.
