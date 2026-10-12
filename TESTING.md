# ✅ Lamora — Testing Checklist & Report

## Automated smoke tests (2026-09-20, Workbooks release)

Two Playwright suites drove the **production build** (`dist/`) over a local server. **39 of 39 checks passed with zero console errors** (13 puzzles/reading + 16 workbooks + 10 core).

### Workbooks suite — 16/16 ✅
| # | Check | Result |
| --- | --- | --- |
| 1 | Profile select renders | ✅ |
| 2 | Home shows the Workbooks tile | ✅ |
| 3 | Workbooks hub: 5 stage tabs, correct stage auto-selected for age, Cambridge mapping shown | ✅ |
| 4 | Switching stage changes the available sheets | ✅ |
| 5 | Patterns: tracing registers and awards a star | ✅ |
| 6 | Handwriting: mode picker (capitals/small/numbers/words) + letter tracing | ✅ |
| 7 | Join the Dots: dots render; tapping in order completes the letter | ✅ |
| 8 | Join the Dots: numbers mode | ✅ |
| 9 | First Letters: tapping the correct first letter is accepted | ✅ |
| 10 | Fun with Letters: capital/small pair cards render at the right count per level | ✅ |
| 11 | Letter Maze: maze renders, arrow pad moves the player | ✅ |
| 12 | Complete the Word: blanks fill from the letter bank | ✅ |
| 13 | Colour the Picture: region fills with the chosen colour; export present | ✅ |
| 14 | Odd & Even: sort, pair-up proof and number hunt all work | ✅ |
| 15 | Parent Dashboard: age 4 available; stage selector lists Auto + 5 stages; selection persists | ✅ |
| 16 | A pinned stage drives the child's workbook view | ✅ |


### Puzzles & Reading Gym suite — 13/13 ✅ (2026-09-29)
| # | Check | Result |
| --- | --- | --- |
| 1 | Home shows the Puzzles tile | ✅ |
| 2 | Puzzles hub lists all seven puzzles | ✅ |
| 3 | Shape Sums: equation renders; correct shape accepted; progress advances | ✅ |
| 4 | Shape Sums: easy/medium/hard bands switch | ✅ |
| 5 | What Comes Next renders a sequence | ✅ |
| 6 | Odd One Out renders choices | ✅ |
| 7 | Balance Scales renders the rule and the question | ✅ |
| 8 | Number Pyramid renders bricks with a blank to fill | ✅ |
| 9 | Shape Sudoku: 16 cells; hint fills a correct cell | ✅ |
| 10 | Maze Adventure: 16 levels listed, 15 locked at the start | ✅ |
| 11 | **Maze level 1 solved by BFS over the rendered walls**, unlocking level 2 and saving best steps | ✅ |
| 12 | Reading Gym: six steps, five locked at the start | ✅ |
| 13 | Reading Gym step 1 completes and unlocks step 2 | ✅ |

Check 11 is the important one: the test reads the *actual rendered wall borders*, runs a breadth-first search for a route, then walks it with arrow keys. That proves each generated maze is genuinely solvable rather than merely drawn.

Shape Sums is additionally verified at the data level: the 60 equations are *derived* from the segment algebra (union for `+`, difference for `−`) and only kept when both operands and the answer are all named, recognisable shapes — so no puzzle can be unsolvable or nonsensical.

### Core regression suite — 10/10 ✅
Home pathways (all 8 tiles), Reading → Phonics, Reading → Letter Tracing, Maths tier → Adding with visual counters, Trivia flashcards, Games hub, Chess puzzles board, Dream Cards canvas (unbranded + privacy note), Rewards, service worker registration and footer attribution.

### Bug found and fixed during testing
**Tracing canvases wiped themselves roughly once per second.** The screen-time engine dispatches a `tickUsage` action every second, re-rendering every store consumer. The workbook screens passed `guide={{...}}` as an inline object, so `TraceSheet`'s reset callback changed identity on every tick and cleared the child's work mid-letter. Fixed by keying the reset on the guide's *content* and reading the live guide through a ref. A dedicated regression check now draws a stroke, sits idle across four one-second ticks, then draws two more:

```
after stroke 1: 8566 ink pixels
after 4s idle : 8566  (preserved ✔)
after 3 strokes: 18577 (accumulating ✔)
```

Other automated checks:
- `tsc --noEmit` clean; `vite build` succeeds (~138 KB gzipped JS).
- PWA precache: 16 entries, ~483 KiB, with offline navigation fallback.
- Canvas drawing verified identical under desktop mouse and touch-emulated mobile (6,458 ink pixels each).
- Screenshots reviewed at **430×930 (phone)** and **1100×900 (tablet/desktop)** for every new sheet.
- No requests to any third-party origin.

## Cross-device sweep (v2.1)

Automated in Chromium with device emulation (scripts kept with the release notes):

| Suite | What it drives | Result |
| --- | --- | --- |
| Screen crawl | Every pathway and its sub-screens (99 screens) on **iPhone 390×844, Android 412×915, iPad portrait 820×1180, iPad landscape 1180×820, desktop 1440×900**: JS errors, console errors, sideways scrolling, controls cut off, touch targets under **44 pt** | 0 issues on all five |
| Art Studio | Mouse, **pen with pressure** and **multi-touch** through Chrome DevTools input: strokes, undo/redo (buttons, Ctrl+Z, ⌘⇧Z), pressure width (3 px light → 11 px hard), palm rejection, pinch zoom, shapes, fill stays inside outlines, stickers + move, mirror, eraser, layers, eyedropper, JPG 2400×1800 and 4000×3000 (checked from the JPEG header), gallery, autosave, all colouring pictures, phone layout | 23 / 23 |
| Voice | A stand-in speech engine with iOS and Android rules (no speech before the first tap; `speak()` within 50 ms of `cancel()` is dropped; network voices fail offline) | 5 / 5 |
| Parent lock | Real touch: quick tap shows a hint, 2 s hold with a **drifting** finger opens, sliding off the button still opens, early release cancels, fast PIN taps, keyboard digits, wrong PIN, forgot-PIN reset | 7 / 7 |
| Join the Dots | Every letter and numeral playable end to end, including the 12 with shared dots | ✔ |
| Colour Lab · Workbooks · Puzzles · Core | Existing suites | all green |

**What emulation cannot prove** — please check on the real devices before handing them to children:
Safari's own speech voices and Apple Pencil hardware on iPad (Chromium stands in for WebKit here), the installed Android APK (built by CI, not in this sandbox), and Windows' touch keyboard.

## Manual test checklist (for release on real devices)

### Installation
- [ ] iPad Safari: Share → Add to Home Screen; opens standalone
- [ ] iPhone Safari: safe-area insets respected
- [ ] Android Chrome: install prompt; opens standalone
- [ ] Android tablet: layout correct
- [ ] Windows / Mac Chrome or Edge: address-bar install

### Input & touch
- [x] Touch pointer events throughout (verified via emulated + real mouse)
- [x] Drag interactions: Word Search selection, Letter Scramble, trivia card swipe
- [x] Mouse interactions
- [x] Keyboard: focus rings, Enter/Space on controls, click-click fallback for Word Search
- [ ] Physical keyboard + external trackpad on tablet

### Offline
- [x] Service worker precaches the whole build on install
- [x] Offline navigation falls back to cached `index.html`
- [ ] Airplane-mode reload on a device after first visit

### Features
- [x] Workbooks: patterns, handwriting, join-the-dots, first letters, fun with letters, letter maze, complete the word, colouring, odd & even
- [x] Cambridge stage mapping (PP1→EY2, PP2→EY3, G1/2/3→Primary Stages 1/2/3) and per-child stage override
- [x] Colour Lab: mixing pots (blue+yellow→green, red+yellow→orange, red+blue→purple, red+white→pink, verified against the *rendered pixels*, not just the labels), discovery shelf + star, 12-slice wheel with recipes and opposites, light-vs-paint divergence (red+green light = yellow while the same paints = orange), Mix to Match accepting a correct recipe, monotonic tint/tone/shade ladders, science cards + quiz
- [x] Phonics, sight words, read-along stories + quizzes
- [x] Letter tracing (coverage detection, forgiving threshold)
- [x] Maths tiers 1–10 … 100+ across + − × ÷ with visual counters; progressive unlock
- [x] Trivia flashcards + category quizzes across all five categories
- [x] Reward loop: stars → play token → timed session
- [x] Word Match, Word Search, Letter Scramble, Sliding Puzzle, Logic Tiles, Matching Pairs
- [x] Chess: verified mate-in-one puzzles, vs-computer legality (check/checkmate/stalemate/promotion), two-player, hints
- [x] Dream Cards: fields, camera + upload photo, PNG export, PDF/print, unbranded output, remove-photo
- [x] Parent PIN create/confirm/retry/change; background music; screen-time + warnings + break screen
- [x] Progress saving, profile switching, reduced motion, delete-all-data

### Safety
- [x] No external tracking (no third-party requests exist in the code)
- [x] No console errors in the smoke run
- [x] No broken screens in the smoke run
- [x] Photos never uploaded (FileReader → canvas only), never analysed
- [x] Exported Dream Cards carry no app branding or watermark

## Known limitations
- Chess uses simplified junior rules: no castling and no en passant (pawns always promote to a queen). Check, checkmate and stalemate are fully implemented.
- Read-aloud depends on the device's built-in speech voices; the app is fully usable without them.
- Emoji artwork renders slightly differently per platform (by design — it keeps the app tiny and fully offline).
