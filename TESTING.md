# ✅ Lamora — Testing Checklist & Report

## Automated smoke tests (2026-09-20, Workbooks release)

Two Playwright suites drove the **production build** (`dist/`) over a local server. **26 of 26 checks passed with zero console errors.**

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
