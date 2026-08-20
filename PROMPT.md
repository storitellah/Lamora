# PROMPT.md — The original product brief

Lamora was built from the following brief.

## Product

Build a secure, playful, installable learning and memory app called **Lamora** for children aged **5 to 10**, used by children, parents, families, teachers and caregivers.

**Main goal:** a fun, interactive, touch-first app that strengthens numeracy, literacy, memory, logic, creativity, curiosity, general knowledge and problem-solving — with educational activities, short brain games, drawing, colouring, world knowledge, nature activities, chess, rewards, stickers, and parent-controlled screen-time limits. It must feel fun, colourful, safe, encouraging, and usable by a 5-year-old without constant adult help.

**Devices:** iPad, iPhone, Android phones/tablets, Windows PCs, Macs, touchscreen laptops. Installable as a PWA; works offline after installation.

**Core principles:** child-friendly, safe, private, educational, encouraging, inclusive, easy to navigate, touch-first, offline-first, no advertising, no social media, no public profiles, no chat, no tracking, no unnecessary data collection, no login for children.

## Required features

- **Parent Zone** gated by PIN / press-and-hold: screen-time and session limits, category and game selection, local progress review, reward resets, profile management, difficulty, sounds, reduced motion, delete-all-data, progress export, custom names, age 5–10.
- **Two or more local child profiles** (name/nickname, age, avatar, favourites, level, progress, stars, rewards) — all data on-device.
- **Home screen** with large friendly sections: Learn, Play, Memory, Draw, Colour, Explore, Chess, My Rewards, Sticker Book.
- **Numeracy**: number recognition, counting, matching quantities, addition, subtraction, shapes, patterns, comparing, sorting, sequencing, money, time, measurement, puzzles; difficulty adapting by age (younger: count objects, tap the bigger number, match quantity, patterns; older: add/subtract, missing numbers, number bonds, word problems, timed challenges, logic sequences).
- **Literacy**: letters, letter sounds, case matching, word building, rhyming, sight words, spelling, short sentences, story sequencing, vocabulary, comprehension, sentence completion, listening; tap-to-hear, tap-to-reveal, read-aloud, friendly correction, positive encouragement.
- **Reward loop**: learn → earn stars/gems/tokens → unlock a short game session → game ends after a parent-defined time → back to learning or a break. Reward styles: stars, gems, shells, dragon eggs, rainbow points, planet badges. No manipulative systems, purchases, loot boxes or paid unlocks.
- **Brain booster games**: memory cards, spot the difference, patterns, sequence recall, shape matching, colour memory, sound matching, odd one out, mazes, visual search, Simon, hidden objects, shadows, order recall, quick counting, sorting, logic tiles. Short sessions, clear feedback, no punishment.
- **Chess**: board, pieces, movement and capture practice, check/checkmate basics, mini puzzles, vs computer, two-player local, hints, beginner difficulty, no timer by default, large pieces.
- **Nature & planet**: animals, oceans, forests, weather, plants, recycling, clean water, climate basics, habitats, endangered animals, food chains, caring for the planet, solar system.
- **World discovery**: map, continents, countries, capitals, flags, landmarks, oceans, geography facts; flag/country/capital/continent games with age-appropriate difficulty.
- **Drawing studio**: pencil, crayon, marker, brush, eraser, palette, undo/redo, clear, save locally, PNG export, stickers, backgrounds, shapes.
- **Colouring**: themed pages (mermaids, dolphins, dragons, dinosaurs, animals, space, nature, professions, castles, vehicles, underwater, monsters, flowers, maps, planets) with tap-to-fill, brush, palette, undo/redo, save and export.
- **Sticker book**: themed stickers earned through learning; add to drawings, build scenes, save locally.
- **Tap-to-reveal learning** with gentle hints, retries and simple explanations — never shaming.
- **Professions studio ("What Can I Be?")**: local photo placed into a playful profession card (doctor, teacher, lawyer, journalist, photographer, scientist, engineer, pilot, farmer, artist, musician, chef, architect, firefighter, veterinarian, astronaut, marine biologist, programmer). Photos processed locally only — never uploaded, never recognised, never analysed; deletable immediately; not saved unless the parent chooses.
- **Memory Gym** with easy/medium/hard/adaptive difficulty and an encouraging tone.
- **Stories**: short interactive stories (friendship, sharing, courage, curiosity, kindness, nature, family, school, imagination, problem-solving) with read-aloud, reveals, questions and a positive lesson.
- **Timer**: 10/15/20/30/45/custom minutes, gentle countdown, 5-minute and 1-minute warnings, pause in parent settings, calm end screen suggesting a physical break, PIN to extend.
- **Progress**: activities, stars, skills, unlocks, streaks, stickers, chess lessons, badges — simple visuals, no sibling ranking, no public leaderboards.
- **Audio**: spoken instructions, pronunciation, letter sounds, gentle feedback, optional music, mute and volume — all offline.
- **Accessibility**: large text, high contrast, colour-blind-friendly palettes, reduced motion, screen-reader labels, focus states, keyboard and touch, spoken instructions, simple language.
- **Design**: bright balanced colours, soft gradients, rounded cards, friendly icons, large buttons, light animations; themes: Ocean Adventure, Rainbow Garden, Dragon Kingdom, Space Explorer, Nature Club, Dinosaur World.
- **Security**: no ads, purchases, chat, public profiles, external links in child mode, location, microphone, camera without parent action, analytics, third-party trackers, social sharing, cloud upload, facial recognition, behavioural profiling, targeted content or marketing notifications. All data local; delete/reset/export controls provided.
- **Offline-first**: PWA manifest, service worker, offline cache, local fonts/icons/assets/audio, local saving, update notification.
- **Performance**: lightweight, fast startup, low memory, smooth touch, no long loading screens, lazy-load large assets, avoid heavy frameworks.
- **Technology**: HTML, CSS, JavaScript, Canvas API, Web Audio API, IndexedDB or localStorage, PWA manifest, service worker.
- **Deliverables**: complete GitHub-ready repository with demo content, favicon and app icons, README, parent guide, privacy notice, child-safety document and testing report.

---

# v2.0 revamp brief (2026-08-19)

The app was later rebuilt to Apple-grade polish on a modern stack, to this brief:

## 1. Visual design & branding
- Clean, minimalist, modern Apple HIG: SF Pro system typography, subtle glassmorphism/materials, fluid micro-interactions, springy bounces and haptics.
- Modern, minimal, child-friendly vector logo/favicon (clean geometric shapes).
- Flawless touch optimisation across iOS Safari, Android Chrome, tablets and desktop. ≥44 pt targets, smooth drag-and-drop, no accidental gesture conflicts.

## 2. Learning & educational features
- **Reading & Writing:** interactive phonics, a letter-tracing/writing canvas, sight words, read-along stories.
- **Progressive Mathematics:** multi-tier levels (1–10, 10–20, 20–30, 30–40, up to 100+); +, −, ×, ÷; interactive visual counters (manipulatives) for younger children.
- **"Did You Know?" trivia:** curated flashcards covering Planets & Space, World Wonders & Geography, Animals & Wildlife, Global Cities, and Inspiring Historical Figures.

## 3. Reward games & interactive play
- Completed lessons unlock games: word match, word search (drag/circle to select), anagram/spelling puzzles; tile/drag puzzles for early learners and logic puzzles for older kids; a kid-friendly mini-chess engine and chess puzzle challenges with visual assist moves.

## 4. Unbranded "Dream Cards" (timeless keepsakes)
- Redesign to ultra-premium, modern, collectible cards; remove all Lamora watermarks/branding.
- Photo via device camera or upload, featured on the card.
- Easy high-resolution PNG/PDF export for printing or saving.

## 5. Parent dashboard & settings
- Lively, high-quality, child-friendly background music and audio effects with an easy mute/toggle inside the PIN-protected section.
- Footer: "Made for Luna, Lara, Arica and all their friends."

## 6. README overhaul
- Clean, attractive, welcoming for parents and educators; highlight ease of use, safety, offline capability, learning pathways and privacy.

## Output requirements
- Complete, modular React/TypeScript + Tailwind CSS + Lucide + Framer Motion code and documentation.
- Full accessibility, semantic HTML, and zero external runtime dependencies that could break offline usage where possible.
- Inline comments explaining complex logic and styling decisions.
