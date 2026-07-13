# ✅ Lamora Testing

## Automated smoke test (latest run: 2026-07-13)

An automated Playwright/Chromium smoke test drives the real app over HTTP and asserts renders, interactions and zero console errors.

**Result: 49 / 49 checks passed · console errors: none.**

What it covers:

| Area | Checks |
|---|---|
| Boot & profiles | Profile picker renders demo profiles; picking a profile opens the home grid |
| Routing | All 16 top-level routes render content (learn, numeracy, literacy, play, memory gym, draw, colouring, explore, nature, world, chess, professions, rewards, stickers, stories, home) |
| Learning loop | A full numeracy quiz completes with a celebration; stars are awarded; a play token is granted |
| Literacy | Word Builder renders tappable letters |
| Reward games | Play menu lists games; a token opens Memory Match with a live board |
| Chess | 64-square board renders; a legal pawn move works; the computer replies; **all four mate-in-one puzzles verified solvable by the engine** |
| Creative | Colouring tap-to-fill changes the region colour; drawing canvas renders; profession card canvas renders |
| World | Interactive map contains all 7 continents |
| Stories | Story pages render |
| Parent gate | Press-and-hold opens the grown-up multiplication gate; correct answer leads to PIN setup; PIN confirm opens the Parent Zone with settings |
| Profiles v1.1 | Profile editor offers an optional first-name field; choosing "First name" makes the home greeting use it |
| Voice removal v1.1 | No speaker button in headers; written tips shown instead; no speech engine present |
| Parent gate v1.1 | Typing `#/parent` directly into the URL shows the PIN pad instead of the settings |
| PWA | Service worker registers; manifest parses |

Reproduce locally:

```bash
python3 -m http.server 8471 &     # serve the repo
node scratch/smoke.js             # (script lives outside the repo; see below)
```

The smoke script is intentionally not shipped in the app payload (it would be cached by the service worker); it lives in the development scratchpad and is documented here.

## Manual test checklist

### Installation & platforms
- [ ] iPad: Safari → Share → *Add to Home Screen* → opens standalone, works in airplane mode
- [ ] iPhone: layout fits small portrait screens; safe-area insets respected
- [ ] Android phone/tablet: Chrome install prompt; standalone launch; offline relaunch
- [ ] Windows PC / Mac: Chrome/Edge install icon; window resizing keeps layout intact
- [ ] Touchscreen laptop: touch and mouse both work on the same session

### Input
- [ ] Touch: all buttons ≥ 44 px, drawing follows the finger, sticker drag works
- [ ] Mouse: hover states, drawing, chess selection
- [ ] Keyboard: Tab reaches every control with a visible focus ring; Enter/Space activates; arrow keys move the maze; Enter fills colouring regions and map continents

### Offline
- [ ] Load once online, go offline, reload: app opens and every section works
- [ ] Sound effects still work offline (generated on device)
- [ ] Update notification toast appears when a new version is deployed

### Learning content
- [ ] Numeracy: each activity for each age band produces sensible questions and answers
- [ ] Literacy: letter-sound clues shown as text, Word Builder accepts only the correct next letter
- [ ] Wrong answer flow: first miss = hint + retry; second = friendly reveal + Next
- [ ] Reward unlock: finishing an activity grants a token; Play is gated without one; reward session ends after the parent-set time

### Games & sections
- [ ] Memory games (pairs, Simon, recall variants) complete and celebrate
- [ ] Chess: illegal moves rejected, check announced, checkmate/stalemate detected, hint highlights a move, castling and promotion work
- [ ] Drawing: every tool, undo/redo, clear (with confirm), save to gallery, export PNG
- [ ] Colouring: fill, undo/redo, save, export PNG on every page
- [ ] Sticker book: locked stickers show ❔; scenes save/restore; scene exports PNG
- [ ] Maps/flags/capitals: continent tap targets work on touch; quizzes vary
- [ ] Profession cards: text edits live-update; local photo appears; Remove deletes it; export PNG works; nothing persists after leaving unless exported

### Parent & safety
- [ ] Press-and-hold + grown-up question + PIN setup; wrong PIN rejected; Forgot PIN flow
- [ ] Timer: warnings at 5 and 1 minutes; break screen at limit; PIN required to extend
- [ ] Profile switching keeps each child's progress separate
- [ ] Delete-all-data wipes storage and reloads to a fresh state
- [ ] Reduced motion / high contrast / large text apply immediately
- [ ] Sound and music toggles silence what they should

### Privacy verification
- [ ] DevTools Network tab: after load, no requests except same-origin app files
- [ ] No cookies set; storage contains only the `lamora:v1` key and cache storage
- [ ] No console errors anywhere in the app
