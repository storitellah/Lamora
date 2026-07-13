# 📜 Lamora — Original Product Specification

This document records the specification Lamora was built from.

## Product

Build a secure, playful, installable learning and memory app called **Lamora** for children aged **5 to 10**. Primary users: young children, parents, families, teachers, caregivers.

**Main goal:** a fun, interactive, touch-first app that strengthens numeracy, literacy, memory, logic, creativity, curiosity, general knowledge and problem-solving — with educational activities, short brain games, drawing, colouring, world knowledge, nature activities, chess, rewards, stickers and parent-controlled screen-time limits. Easy for a 5-year-old to use without constant adult help.

**Devices:** iPad, iPhone, Android phones and tablets, Windows PCs, Macs, touchscreen laptops. Installable as a **PWA**, working **offline** after installation.

## Core principles

Child-friendly · safe · private · educational · encouraging · inclusive · easy to navigate · touch-first · offline-first · **no advertising · no social media · no public profiles · no chat · no tracking · no unnecessary data collection · no login for children**.

## Parent area

Protected Parent Zone (PIN + press-and-hold + child-safe verification) allowing: daily and session screen-time limits, category/game selection, local progress review, reward reset, profile management, difficulty, sounds on/off, reduced motion, delete all local data, export progress summary, custom child names, age level 5–10. No sensitive info on the child interface.

## Child profiles

Two or more local profiles: name/nickname, age, avatar, favourite colour, sticker theme, learning level, progress, stars, rewards. All data on-device.

## Home screen

Large friendly sections: **Learn, Play, Memory, Draw, Colour, Explore, Chess, My Rewards, Sticker Book** — large icons, spoken labels.

## Learning categories

**Numeracy** (age-adaptive): number recognition, counting, matching quantities, addition, subtraction, shapes, patterns, comparing, sorting, sequencing, money, time, measurement, number puzzles; word problems / number bonds / missing numbers for older children.

**Literacy:** letter recognition and sounds, case matching, word building, rhyming, sight words, spelling, reading short sentences, story sequencing, vocabulary, comprehension, sentence completion, listening — with tap-to-hear, tap-to-reveal, drag letters, read-aloud, friendly correction, positive encouragement.

## Reward loop

Complete learning → earn stars/gems/tokens → unlock a short game session → game ends after parent-defined time → return to learning or break. Reward styles: stars, gems, shells, dragon eggs, rainbow points, planet badges (parent-selectable). **No manipulative rewards, purchases, loot boxes or paid unlocks.**

## Brain booster games

Memory matching, spot the difference, pattern completion, sequence recall, shape matching, colour memory, sound matching, odd one out, mazes, visual search, Simon-style memory, hidden objects, shadow matching, order recall, quick counting, sorting, logic tiles. Short sessions, clear feedback, no punishment.

## Chess

Learn the board and each piece, movement/capture practice, check & checkmate basics, mini puzzles, play vs computer, two-player local, hint mode, beginner difficulty, no timer by default. Large pieces, simple instructions.

## Nature & planet

Animals, oceans, forests, weather, plants, recycling, clean water, climate basics, habitats, endangered animals, food chains, caring for the planet, solar system, Earth, Moon, stars. Games: habitat matching, recycling sort, build a healthy ocean, virtual garden, animal sounds, water saving, planet quiz, weather matching, nature memory.

## World discovery

Interactive world map, continents, countries, capitals, flags, landmarks, oceans, geography facts. Games: flag↔country, country↔capital, find the continent, landmark matching, capital quiz, world memory. Age-appropriate text volume.

## Drawing studio

Free drawing: pencil, crayon, marker, paintbrush, eraser, palette, undo/redo, clear, save locally, export PNG, stickers, backgrounds, shapes.

## Colouring

Pages: mermaids, dolphins, dragons, dinosaurs, animals, space, nature, professions, castles, vehicles, underwater, friendly monsters, flowers, maps, planets. Tap-to-fill, brush, palette, undo/redo, save, export.

## Sticker book

Themes: mermaids, dolphins, dragons, dinosaurs, stars, rainbows, planets, animals, flowers, vehicles, cameras, books, music, food, sports, smileys, professions, nature, ocean. Earn stickers, add to drawings, build scenes, save locally.

## Tap-to-reveal learning

For numbers, letters, words, animals, countries, capitals, flags, shapes, professions, nature facts. Wrong answers: no shaming, gentle hint, another try, simple explanation.

## Professions studio

"What Can I Be?" — local photo placed in a playful profession card (doctor, teacher, lawyer, journalist, photographer, scientist, engineer, pilot, farmer, artist, musician, chef, architect, firefighter, veterinarian, astronaut, marine biologist, programmer). **Privacy: photos processed locally, never uploaded, never recognised or analysed, deletable immediately, saved only by explicit choice.** Card fields: nickname, profession, fun title, skills, favourite tool, dream statement, sticker, photo; export PNG/PDF.

## Memory Gym

Picture/sequence/sound/object recall, matching pairs, story recall, colour/number sequences, word memory, location memory. Difficulty: easy, medium, hard, adaptive. Encouraging tone.

## Stories

Short interactive stories (friendship, sharing, courage, curiosity, kindness, nature, family, school, imagination, problem-solving) with read-aloud, tap-to-reveal art, questions, sequencing, choices, memory quiz, positive lesson.

## Timer & screen time

Parent-set limits (10/15/20/30/45/custom minutes), gentle countdown, 5-minute and 1-minute warnings, pause during parent settings, calm end screen suggesting physical breaks (stretch like a cat, find something blue, drink water, look outside, five slow breaths, draw on paper, help someone), PIN to extend.

## Progress

Track locally: activities, stars, skills, unlocked games, memory/reading/numeracy streaks, stickers, chess lessons, nature badges. Simple visuals; **no sibling ranking, no leaderboards.**

## Audio, accessibility, design

Spoken instructions, pronunciation, letter sounds, gentle feedback, optional music, mute/volume — all offline. Large text, high contrast, colour-blind-friendly palettes, reduced motion, screen-reader labels, focus states, keyboard + touch, simple language, captions. Bright balanced colours, soft gradients, rounded cards, friendly icons, large buttons, light animations. Themes: Ocean Adventure, Rainbow Garden, Dragon Kingdom, Space Explorer, Nature Club, Dinosaur World (child-selectable).

## Security & child safety (critical)

No ads · no IAP · no chat · no public profiles · no external links in child mode · no location · no microphone unless required locally · no camera without parent action · no analytics · no third-party trackers · no social sharing · no cloud upload · no facial recognition · no behavioural profiling · no targeted content · no marketing notifications. All data local. Provide: delete profile, delete photos, clear progress, reset app, export summary.

## Technical

Offline-first PWA: manifest, service worker, offline cache, local fonts/icons/assets/audio, update notification. Performance: lightweight, fast startup, low memory, smooth touch, lazy-load, no heavy frameworks. Technology: HTML, CSS, JavaScript, Canvas API, Web Audio API, IndexedDB/localStorage.

## Deliverables

Complete GitHub-ready repository: installable PWA for iPad/Android/desktop, offline learning content, educational + memory games, chess, drawing and colouring studios, sticker book, world map & capitals, nature section, profession card creator, parent controls, timer, rewards, demo content (activities, games, lessons, colouring pages, sticker packs, profession cards, two demo profiles, parent timer settings), favicon & app icons, README, PARENT-GUIDE, PRIVACY, CHILD-SAFETY, TESTING, CHANGELOG, PROMPT.
