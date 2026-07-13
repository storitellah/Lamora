# ✅ Lamora — Testing Checklist & Report

## Automated smoke test (2026-07-13)

An automated Chromium (Playwright) run against a local static server exercised the main flows. **All 17 checks passed with zero console errors:**

| # | Check | Result |
| --- | --- | --- |
| 1 | Profile select renders (demo profiles present) | ✅ PASS |
| 2 | Picking a profile opens the home screen (11 tiles) | ✅ PASS |
| 3 | Learn → Counting: full 5-question quiz flow, hints on wrong answers, celebration + stars | ✅ PASS |
| 4 | Home button navigation | ✅ PASS |
| 5 | Memory Gym → Matching Pairs renders the right deck size for age 6 (8 cards) | ✅ PASS |
| 6 | Chess vs computer: select pawn → move hints shown → e2–e4 played → computer replies | ✅ PASS |
| 7 | Drawing studio: canvas renders, pointer stroke draws | ✅ PASS |
| 8 | Colouring: page opens, tap-to-fill region works | ✅ PASS |
| 9 | Explore → Flags quiz renders | ✅ PASS |
| 10 | Stories: story page + read-aloud button render | ✅ PASS |
| 11 | Professions: card canvas renders and updates | ✅ PASS |
| 12 | Sticker book scene renders | ✅ PASS |
| 13 | Rewards screen stats render | ✅ PASS |
| 14 | Parent gate: PIN creation (enter twice) then Parent Zone opens | ✅ PASS |
| 15 | Delete-all-data control present in Parent Zone | ✅ PASS |
| 16 | Service worker registers | ✅ PASS |
| 17 | Progress persists to localStorage | ✅ PASS |

Additional automated checks:

- `node --check` passes on all 14 JavaScript files ✅
- `manifest.json` is valid JSON with 192/512/maskable icons ✅
- Layout verified via screenshots at 1024×768 (tablet/desktop) and 390×844 (phone) — home, chess board and colouring pages all fit without horizontal scrolling ✅
- Zero network requests to third-party origins (the app references only same-origin files) ✅

## Manual test checklist (for release on real devices)

### Installation
- [ ] iPad Safari: Share → Add to Home Screen; opens standalone
- [ ] iPhone Safari: layout correct with safe-area insets
- [ ] Android Chrome: install prompt; opens standalone
- [ ] Android tablet: layout correct
- [ ] Windows Chrome/Edge: address-bar install
- [ ] macOS Chrome/Safari: install / dock

### Input
- [x] Touch interactions (pointer events used throughout; verified via emulated pointer)
- [x] Mouse interactions (verified in smoke test)
- [x] Keyboard: focus states, Enter/Space on controls, arrow keys in maze, Enter on colouring regions
- [ ] Physical keyboard on tablet

### Offline
- [x] Service worker precaches all app files on install
- [x] Offline navigation falls back to cached `index.html`
- [ ] Airplane-mode reload on device after first visit

### Features
- [x] Numeracy activities (all 14 topics generate valid questions)
- [x] Literacy activities (all 9 topics)
- [x] Reward unlock loop (stars → play token → session timer)
- [x] Memory games (6 exercises)
- [x] Chess: lessons, capture practice, verified mate-in-one puzzles, vs-computer game legality (checks, checkmate, stalemate, promotion)
- [x] Drawing: tools, undo/redo, save to gallery, PNG export
- [x] Colouring: fill, undo/redo, save, PNG export
- [x] Sticker book: unlock ladder, drag, double-tap remove, PNG export
- [x] World: flags, capitals, continents, landmarks
- [x] Profession cards: fields, local photo, PNG export, remove photo
- [x] Timer: per-second tracking, 5-min/1-min warnings, break screen, PIN to extend
- [x] Parent PIN: create, confirm, wrong-PIN retry, change PIN
- [x] Progress saving and profile switching
- [x] Delete-all-data (clears localStorage + caches, reloads)
- [x] Reduced motion (setting + OS preference), high contrast, large text
- [x] Audio controls (mute persists; speech cancels on mute/navigation)

### Safety
- [x] No external tracking (no third-party requests exist in code)
- [x] No console errors in smoke run
- [x] No broken screens in smoke run
- [x] No public data exposure (no network I/O beyond same-origin app files)
- [x] No external links in child mode
- [x] Photos never uploaded (FileReader → canvas only)

## Known limitations

- Chess uses kid-friendly simplified rules: no castling and no en passant (promotion is always to a queen). Check, checkmate and stalemate are fully implemented.
- Read-aloud depends on the device's built-in speech voices; on devices without voices the app remains fully usable with visual text.
- Emoji artwork renders slightly differently per platform (by design — zero image downloads keeps the app tiny and offline-friendly).
