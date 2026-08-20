# ✅ Lamora — Testing Checklist & Report

## Automated smoke test (2026-08-19, v2.0.0)

An automated Chromium (Playwright) run drove the **production build** (`dist/`) served over a local HTTP server. **All 15 checks passed with zero console errors.**

| # | Check | Result |
| --- | --- | --- |
| 1 | Profile select shows Luna, Lara & Arica + correct footer attribution | ✅ PASS |
| 2 | Pick Lara (age 8) → home shows all 7 pathway tiles | ✅ PASS |
| 3 | Reading → Phonics: full 5-question quiz, hints on miss, celebration + stars awarded | ✅ PASS |
| 4 | Letter-tracing canvas accepts strokes and completes on sufficient coverage | ✅ PASS |
| 5 | Maths: tier → operation → **visual counters render** → quiz completes | ✅ PASS |
| 6 | Higher maths tier correctly **locked** for an age-8 profile | ✅ PASS |
| 7 | "Did You Know?" flashcards render, next-card works, category quiz runs | ✅ PASS |
| 8 | Games hub reflects earned play tokens; **Word Search** grid renders and is playable | ✅ PASS |
| 9 | Letter Scramble (anagram) renders draggable letter bank | ✅ PASS |
| 10 | Sliding Picture Puzzle renders 3×3 with goal preview | ✅ PASS |
| 11 | Chess: puzzle board renders; vs-computer move highlights + computer replies | ✅ PASS |
| 12 | Dream Cards: live canvas preview updates as the name field changes | ✅ PASS |
| 13 | Rewards screen renders progress stats | ✅ PASS |
| 14 | Parent gate: create-PIN flow → dashboard with working **background-music toggle** | ✅ PASS |
| 15 | Service worker registers + state persists to localStorage | ✅ PASS |

Additional automated checks:
- `tsc --noEmit` type-checks cleanly; `vite build` succeeds (~120 KB gzipped total).
- PWA precache generated: 16 entries, ~412 KiB, with `navigateFallback` for offline navigation.
- Manual screenshot review at **1180×820 (desktop)** and **390×844 (iPhone)**: home grid, Dream Card studio, maths counters, trivia cards and the top bar all fit without horizontal scrolling.
- No requests to any third-party origin (the app references only same-origin assets + the system font stack).

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
