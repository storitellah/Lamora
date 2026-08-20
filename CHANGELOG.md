# Changelog

All notable changes to Lamora are documented here.

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
