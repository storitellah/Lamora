# 🌙 Lamora — Learn & Play

**Lamora** is a secure, playful, installable learning and memory app for children aged **5 to 10**.
It helps children practise **numeracy, literacy, memory, logic, creativity, geography, nature knowledge and chess** — and rewards learning with short, parent-controlled play sessions and creative activities.

Lamora is a **Progressive Web App (PWA)**: it installs like a native app on iPads, iPhones, Android phones and tablets, Windows PCs, Macs and touchscreen laptops, and it **works fully offline** after the first visit.

> 🔒 **Privacy first:** no ads, no accounts, no chat, no tracking, no cloud. Everything stays on the device. See [PRIVACY.md](PRIVACY.md) and [CHILD-SAFETY.md](CHILD-SAFETY.md).

---

## ✨ What's inside

| Section | What children do |
|---|---|
| 📚 **Learn** | Numeracy (counting, adding, patterns, time, money…) and Literacy (letters, sounds, word building, rhymes, reading) with age-adaptive difficulty |
| 🎮 **Play** | Short brain-booster reward games unlocked by learning (memory match, Simon, mazes, odd-one-out, visual search…) |
| 🧠 **Memory Gym** | Dedicated memory training: picture/sequence/number/word/location recall with Easy → Hard → Adaptive levels |
| ♟️ **Chess Club** | Learn the board and every piece, movement & capture practice, mate-in-one puzzles, play a gentle computer, or two-player local |
| 🌿 **Nature & Planet** | Animal homes, animal sounds, recycling sort, build a healthy ocean, plant a garden, weather, space, food chains, caring for Earth |
| 🗺️ **World Discovery** | Interactive continent map, flags, capitals, landmarks, world facts and world memory cards |
| 🎨 **Draw** | Pencil / crayon / marker / brush / eraser, shapes, sticker stamps, backgrounds, undo/redo, save locally, export PNG |
| 🖍️ **Colour** | Tap-to-fill colouring pages (mermaid, dolphin, dragon, dinosaur, rocket, castle, sea, monster…), export as an image |
| 🦄 **Sticker Book** | Earn stickers by learning, browse the collection, build & export sticker scenes |
| 🧑‍🚀 **What Can I Be?** | Profession "dream cards" (doctor, pilot, marine biologist, programmer…) with an optional **local-only** photo — export as PNG |
| 📖 **Stories** | Short interactive read-aloud stories about sharing, courage, curiosity, kindness and problem-solving, each with a memory quiz |
| 🏆 **My Rewards** | Stars/gems/shells/dragon-egg rewards, streaks and simple progress bars — never comparisons or leaderboards |

Plus: two demo child profiles (Maya, 5 and Kai, 8), six visual themes (Ocean Adventure, Rainbow Garden, Dragon Kingdom, Space Explorer, Nature Club, Dinosaur World), spoken instructions, and a full **Parent Zone**.

## 👨‍👩‍👧 Parent Zone

Protected by a press-and-hold gesture plus a grown-up verification step and a 4-digit PIN. Parents can:

- Set **daily screen-time limits** (10–90 min) with gentle 5-minute and 1-minute warnings and a calm break screen
- Set session reminders and **reward-game length** (3–10 min)
- Choose which sections children see, the difficulty, and the reward style
- Manage profiles (name/nickname, age 5–10, avatar), reset rewards, review local progress
- Toggle sounds, speech, music, large text, high contrast and reduced motion
- **Export a progress summary**, change the PIN, or **delete all local data**

See [PARENT-GUIDE.md](PARENT-GUIDE.md) for details.

## 🚀 Running Lamora

Lamora is plain HTML/CSS/JavaScript — no build step, no dependencies.

```bash
# any static server works, e.g.:
python3 -m http.server 8080
# then open http://localhost:8080
```

To install as an app: open the site in a browser and use **“Add to Home Screen”** (iPad/iPhone/Android) or the **install icon** in the address bar (Chrome/Edge on desktop). After the first visit it works completely offline.

> The service worker needs `https://` or `localhost` — opening `index.html` directly from the file system still works for quick previews, just without offline caching.

## 🧱 Technology

- **HTML + CSS + vanilla JavaScript** — no frameworks, fast on low-cost tablets
- **Canvas API** for drawing, profession cards and PNG export
- **SVG** for colouring pages and the world map
- **Web Audio API** for all sound effects and gentle music (generated on-device, no audio downloads)
- **Speech Synthesis API** for spoken instructions, word pronunciation and read-aloud stories
- **localStorage** for all profiles, progress, settings, drawings and scenes
- **PWA manifest + service worker** for install and offline use

## 📁 Repository structure

```
index.html            app shell
styles.css            all styling, themes & accessibility modes
script.js             core: state, router, profiles, rewards, timer, parent zone, quiz engine
audio/sounds.js       Web-Audio sound engine + speech helpers
lessons/              numeracy.js, literacy.js
games/                brain.js (games + memory gym), chess.js, nature.js, world.js, draw.js
colouring/            colouring.js (SVG pages)
stickers/             stickers.js (sticker book & scenes)
professions/          professions.js (dream-card studio)
stories/              stories.js (interactive stories)
assets/               app icons (SVG + PNG)
manifest.json         PWA manifest
service-worker.js     offline cache
```

## 📚 Documentation

- [PARENT-GUIDE.md](PARENT-GUIDE.md) — everything grown-ups need
- [PRIVACY.md](PRIVACY.md) — the (very short) privacy story
- [CHILD-SAFETY.md](CHILD-SAFETY.md) — safety-by-design decisions
- [TESTING.md](TESTING.md) — test checklist and automated smoke-test report
- [CHANGELOG.md](CHANGELOG.md) — version history
- [PROMPT.md](PROMPT.md) — the original product specification

---

Made with 💛 for curious kids.
