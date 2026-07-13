# 🦉 Lamora — Learn, Play & Grow

**Lamora** is a secure, playful, installable learning and memory app for children aged **5 to 10**. It helps children practise numeracy, literacy, memory, logic, creativity, geography, nature knowledge and chess — and rewards learning with short, parent-controlled play sessions and creative activities.

Built with plain **HTML, CSS and JavaScript** — no frameworks, no build step, no server. It installs as a **Progressive Web App** and works **fully offline**.

## ✨ What's inside

| Section | What children do |
| --- | --- |
| 📚 Learn | Numeracy (counting, adding, patterns, time, money, word problems…) and Literacy (letters, sounds, rhymes, sight words, spelling, little stories…) |
| 🎮 Play | Brain-booster reward games: Odd One Out, Simon, mazes, quick counting, shadow match, hidden objects, sorting |
| 🧠 Memory | Memory Gym: matching pairs, picture recall, sequence recall, colour memory, word memory, location memory |
| 🎨 Draw | Drawing studio with pencil/crayon/marker/brush, colours, shapes, stickers, undo/redo, save & PNG export |
| 🖍️ Colour | Tap-to-fill colouring pages (fish, rocket, dragon, castle, flower, dino, mermaid, race car) |
| 🌍 Explore | Nature & planet (habitats, recycling, weather, space, planet care, food chains, animal sounds) and World (flags, capitals, continents, landmarks) |
| ♟️ Chess | Board & piece lessons, capture practice, check/checkmate basics, mate-in-one puzzles, play vs computer or a friend, hints |
| 📖 Stories | Short interactive read-aloud stories with choices and a memory quiz |
| 🧑‍🚀 What Can I Be? | Profession dream cards with an optional local-only photo, exported as PNG |
| 🏆 Rewards | Stars/gems/shells/dragon eggs (parent's choice), sticker unlocks, progress visuals |
| ✨ Sticker Book | Earn stickers, build drag-and-drop sticker scenes, export as PNG |

## 🛡️ Safety & privacy in one paragraph

No ads. No purchases. No chat. No accounts. No tracking. No analytics. No external requests after installation. All data — profiles, progress, drawings, photos — stays in the browser's local storage **on the device**. See [PRIVACY.md](PRIVACY.md) and [CHILD-SAFETY.md](CHILD-SAFETY.md).

## 🚀 Running Lamora

Lamora is static files. Serve the folder over HTTP(S) and open it:

```bash
# any static server works, e.g.:
python3 -m http.server 8080
# then visit http://localhost:8080
```

For full PWA installation (Add to Home Screen, offline mode) serve over **HTTPS** or `localhost` — service workers require a secure context.

### Installing on devices

- **iPad / iPhone (Safari)**: Share → *Add to Home Screen*.
- **Android (Chrome)**: menu → *Install app* (or the install banner).
- **Windows / Mac / Chromebook (Chrome or Edge)**: install icon in the address bar.

After the first visit, Lamora works completely offline.

## 👨‍👩‍👧 For parents

Press and **hold the 🔒 button for 3 seconds** (or use it from the profile screen) to reach the Parent Zone, protected by a 4-digit PIN that you create on first use. There you can set daily screen-time limits, reward-game session lengths, enable/disable activity categories, manage profiles and ages (5–10), review progress, export a progress summary, reset rewards, change accessibility settings and delete all data. See [PARENT-GUIDE.md](PARENT-GUIDE.md).

## 🗂️ Repository structure

```
index.html            App shell
styles.css            Design system (themes, accessibility modes)
script.js             Core: profiles, router, quiz engine, rewards, timer, parent zone, PWA
audio/audio.js        Synthesised sounds (Web Audio) + speech (Web Speech), all offline
lessons/              numeracy.js, literacy.js, nature.js, world.js
games/                brain.js (reward games), memory.js (Memory Gym), chess.js, drawing.js
colouring/            colouring.js (SVG tap-to-fill pages)
stickers/             stickers.js (sticker book & scenes)
stories/              stories.js (interactive stories)
professions/          professions.js ("What Can I Be?" card studio)
assets/               App icons + SVG favicon
manifest.json         PWA manifest
service-worker.js     Offline-first cache
PARENT-GUIDE.md       Guide for grown-ups
PRIVACY.md            Privacy notice
CHILD-SAFETY.md       Child-safety commitments
TESTING.md            Testing checklist & report
CHANGELOG.md          Version history
PROMPT.md             The original product brief
```

## 🧰 Technology

HTML + CSS + vanilla JavaScript, Canvas API (drawing, card export, confetti), Web Audio API (gentle synth sounds), Web Speech API (offline read-aloud via OS voices), SVG (colouring pages), localStorage (all data), PWA manifest + service worker (offline). No dependencies, no build step, no network calls.

## ♿ Accessibility

Large-text mode, high-contrast mode, reduced motion (also honours the OS `prefers-reduced-motion`), screen-reader labels on interactive elements, keyboard support (including the maze and colouring regions), visible focus states, spoken instructions and tap-to-hear throughout.

## 📄 License

Released under the MIT License.
