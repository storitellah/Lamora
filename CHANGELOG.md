# Changelog

All notable changes to Lamora are documented here.

## [Unreleased]

### Added
- **Art Studio** — a drawing and painting studio built for tablets and Apple Pencil:
  - Pressure-sensitive strokes from a stylus or Apple Pencil, with every high-frequency sample used (coalesced pointer events) and adjustable line smoothing.
  - **Palm rejection** turns on automatically the first time a pencil touches the screen; fingers then pan and pinch-zoom instead of drawing.
  - Brushes: pen, pencil, crayon, marker, spray, rainbow; plus eraser, fill bucket, shapes (line, square, circle, triangle, star, heart; outline or filled), 30 stickers, eyedropper and a **move** tool that picks up any stroke, shape or sticker.
  - **Layers** (show/hide, lock, reorder, opacity, up to six) with a one-tap *paint under the lines* switch; mirror drawing (two-way and four-way); undo/redo; keyboard shortcuts on Mac and Windows.
  - Colour any colouring-book picture: its outlines sit on a locked layer above the paint.
  - Save as a **high-resolution JPG** (2400×1800 or a ~12 MP poster), keep pictures in **My Gallery**, and never lose work — the studio autosaves on the device.
- **Installable Android app (APK)**, built automatically by GitHub Actions and published on the Releases page; an iOS (Xcode) project for a native iPad build. See `docs/INSTALL.md`.
- **Forgot the PIN?** — a grown-up maths challenge resets the parent PIN without losing children's progress.

### Fixed
- **Parent zone lock** only "sometimes" opened on tablets: a slightly moving finger started a scroll and cancelled the hold, sliding off the button reset it, and the long-press menu stole the gesture. The lock now captures the finger, ignores scroll and long-press menus, needs 2 seconds instead of 3, and shows a ring filling up.
- **Join the Dots** — on 12 letters and numbers (B, D, E, F, O, Q, R, Y, 0, 3, 6, 8) two dots sat on the same spot: their numbers overlapped, and the hidden dot swallowed the tap so the child got stuck. Shared spots are now one dot labelled e.g. "1 · 3", and labels are placed clear of other dots and lines.
- **Read-aloud on phones and tablets** — speech now unlocks on the first touch on iPad/iPhone (so automatic prompts are heard), waits for the speech engine after a screen change instead of being dropped, splits long text so Chrome doesn't cut it off, falls back to an on-device voice when offline, and uses the device's native text-to-speech inside the installed app.
- **Maths counters** — multiplication now shows every group (it showed at most four), and counted counters no longer stay faded on the next question.
- **Saving files** — Dream Card PNG/PDF, colouring pages and the progress summary now save correctly on iPad/iPhone (share sheet → Save Image) and inside the installed app; Dream Card PDF is a real PDF file instead of a print pop-up that home-screen apps block.
- **Touch targets** — every control now meets the 44-point minimum.
- Tracing sheets ignore a second finger and a resting palm once a pencil has been used.

- **Colour Lab** — six rooms where children learn how colours are actually made. The mixing underneath is a real model, not an approximation: paint uses **subtractive RYB** mixing (Gosset–Chen cube, trilinear interpolation) and light uses **additive RGB**, so blue + yellow really makes green rather than the muddy grey a naive RGB average would give.
  - **Mixing Pots** — pour red, yellow, blue, white and black a drop at a time, hear the colour name, and fill a shelf of six discoveries (orange, green, purple, brown, pink, grey)
  - **Colour Wheel** — a 12-part wheel with three modes: every colour and its recipe, warm vs cool, and opposites (complementary pairs)
  - **Mix to Match** — "make this colour!" challenges in three bands, with a live closeness meter. Targets are generated from real recipes, so every target is reachable.
  - **Light vs Paint** — the same three colours side by side under torches and in paint pots: red + green light is yellow, red + yellow + blue paint is brown
  - **Tints & Shades** — tint (+white), tone (+grey) and shade (+black) ladders across six base colours
  - **Colour Science** — ten fact cards with a quiz: why rainbows appear, cones in the eye, chlorophyll, why the sky is blue, why light and paint behave differently, CMY printing, complementary colours, warm and cool
- **Puzzles section** — seven generated brain-teasers, each with 🟢 easy / 🟡 medium / 🔴 hard bands:
  - **Shape Sums** — picture arithmetic. Shapes are modelled as *sets of line segments*, so `+` genuinely merges strokes and `−` removes them (two standing lines + two sleeping lines = a square; circle + small circle = circle-in-circle). All 60 equations are derived from that model and verified, never hand-written.
  - **What Comes Next?** — repeating, growing and number sequences
  - **Odd One Out** — with a spoken reason for *why* it doesn't belong
  - **Balance Scales** — pre-algebra reasoning with pictures
  - **Number Pyramid** — each brick is the sum of the two below it
  - **Shape Sudoku** — 4×4 picture sudoku, generated from a solved grid so it is always solvable, with a hint button
- **Maze Adventure** — 16 functional levels across Easy / Medium / Hard / Expert. Mazes are generated by randomised depth-first search (always exactly one path, so never unsolvable). Difficulty grows by size (6×6 → 16×16), collectible stars that force detours, and a keys-and-doors mechanic from the Hard tier. Swipe, tap-adjacent, arrow pad and keyboard all work. Unlocked level and best step count are saved per child.
- **Reading Gym** — a six-step reading ladder for ages 5–10, unlocked in order: letter sounds → sound-it-out blending → word families → sight-word speed → sentences → a short story with comprehension. Everything can be heard on demand.
- **Workbooks pathway** — a stage-aware workbook hub for ages 4–8, aligned to the Cambridge frameworks:
  Pre-Primary 1 → *Cambridge Early Years EY2*, Pre-Primary 2 → *EY3*, Grade 1/2/3 → *Cambridge Primary Stages 1/2/3*.
  Each stage lists its subjects, strands and learning objectives in a "What does this stage cover?" panel for parents and teachers.
  - **Patterns** — 10 pre-writing stroke sheets (standing/sleeping/slanting lines, zig-zags, waves, bumps, loops, circles, spirals, arches)
  - **Handwriting** — capital letters, small letters, numerals and short words, traced on a ruled sheet
  - **Join the Dots** — tap numbered dots in order to form all 26 letters and 0–9, with multi-stroke "lift your pencil" breaks
  - **First Letters** — look at a picture then *tap* or *write* its first letter
  - **Fun with Letters** — match BIG letters to small letters
  - **Letter Maze** — navigate a generated maze to the picture starting with the target letter
  - **Complete the Word** — fill the missing letters from a picture clue
  - **Colour the Picture** — 10 tap-to-fill line-art pages with palette, undo, clear and PNG export
  - **Odd & Even** — sort into baskets, pair-up visual proof, and a number hunt
- **Age 4 profiles** and a per-child **school stage** selector in the Parent Dashboard (follows age automatically, or pin it).

### Fixed
- Tracing canvases no longer clear themselves. The screen-time engine ticks the store every second, which re-created the
  tracing guide object and wiped a child's work roughly once per second; the guide is now keyed by content, so strokes persist.

### Changed
- **More human read-aloud voice.** The speech engine picks the most natural voice installed on the device — preferring Apple Siri/enhanced, Microsoft Natural/neural and Google voices over robotic fallbacks — and speaks with warmer, unhurried prosody.
- **Female / male reading-voice choice** in the Parent Dashboard, with a **Test** button. Defaults to female.

## [2.0.0] — 2026-08-19

A full ground-up rebuild with an Apple-grade, minimalist design and a modern component stack.

### Changed
- **New tech foundation:** React 18 + TypeScript, Tailwind CSS 4, Framer Motion (spring-based micro-interactions), Lucide icons, Vite, `vite-plugin-pwa`. Still zero runtime network requests and fully offline.
- **New visual identity:** clean glassmorphism surfaces, SF Pro system typography, a fresh minimal "rising sun over pages" logo/favicon, fluid transitions and haptic taps.
- **Demo profiles** are now Luna (6), Lara (8) and Arica (5); footer reads *"Made for Luna, Lara, Arica and all their friends."*

### Added
- **Reading & Writing:** phonics, **letter-tracing writing canvas** (coverage-based, forgiving), levelled sight words, read-along stories with quizzes.
- **Progressive Maths:** number tiers 1–10 → 10–20 → 20–30 → 30–40 → 40–100 → 100+ across **+ − × ÷**, with tappable **visual counters (manipulatives)**; higher tiers unlock by age or practice.
- **"Did You Know?"** swipeable curiosity flashcards: Planets & Space, World Wonders, Animals & Wildlife, Global Cities, Inspiring People — each with a mini-quiz.
- **Reward games:** Word Match, **Word Search (drag-to-circle)**, Letter Scramble (anagram), sliding Picture Puzzle, Logic Tiles, Matching Pairs — gated by earned play tokens with a live session timer.
- **Chess:** verified mate-in-one puzzles, beginner computer opponent, two-player mode, move highlighting and a Hint button.
- **Dream Cards:** redesigned as premium, **completely unbranded** keepsake cards; **camera capture or photo upload** (processed on-device only), high-resolution **PNG and PDF/print** export.
- **Parent Dashboard:** now includes a **background-music toggle** (generative, on-device) alongside sound/volume, screen-time, reward tuning, profiles, accessibility and data controls.
- **Accessibility:** reduced-motion (setting + OS), ARIA labels, keyboard support, ≥44 pt targets, read-aloud throughout.

## [1.0.0] — 2026-07-13

### Added
- Initial release of Lamora 🦉
- Local child profiles (2 demo profiles included, up to 6 supported) with avatars, ages 5–10 and per-profile progress
- Age-adaptive difficulty (three levels across ages 5–10)
- **Numeracy**: counting, bigger number, shapes, patterns, addition, subtraction, missing numbers, number bonds, money, telling time, word problems, logic sequences, measuring, odd & even
- **Literacy**: letter recognition, letter sounds, upper/lowercase matching, picture words, rhyming, sight words, spelling, sentence completion, reading comprehension
- **Memory Gym**: matching pairs, picture recall, recall-the-order, colour memory, word memory, location memory
- **Brain booster reward games**: Odd One Out, Simon Says, Maze Explorer, Quick Count, Shadow Match, Hidden Objects, Sort It!
- **Chess school**: board lesson, six piece lessons, capture practice, check & checkmate lesson, mate-in-one puzzles, play vs computer (beginner-friendly), two-player local mode, hint button
- **Explore**: nature (habitats, recycling, weather, space, planet care, food chains, animal sounds) and world (flags, capitals, continents, landmarks, world facts)
- **Drawing studio**: pencil/crayon/marker/brush/eraser, palette, shapes, sticker stamps, backgrounds, undo/redo, local gallery, PNG export
- **Colouring**: 8 tap-to-fill SVG pages with palette, undo/redo, local save and PNG export
- **Sticker book**: 40 unlockable stickers, drag-and-drop scenes, PNG export
- **Stories**: 4 interactive read-aloud stories with choices and quizzes
- **"What Can I Be?" professions studio**: 18 professions, editable card fields, optional local-only photo, PNG export and print
- **Reward loop**: stars → play sessions, parent-configurable style (stars/gems/shells/dragon eggs/rainbow points/planet badges), amount and session length
- **Parent Zone**: PIN + press-and-hold gate, screen-time limits with gentle warnings and calm break screen, category toggles, profile management, reward resets, accessibility settings, progress export, delete-all-data
- **Accessibility**: large text, high contrast, reduced motion (honours OS preference), screen-reader labels, keyboard support, spoken instructions (offline OS voices)
- **PWA**: manifest, offline-first service worker, app icons, update banner
- Documentation: README, PARENT-GUIDE, PRIVACY, CHILD-SAFETY, TESTING, PROMPT
