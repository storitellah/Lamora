# Changelog

All notable changes to Lamora are documented here.

## [2.0.0] — 2026-07-15

### Added
- **📖 Learn to Read section** — a gentle reading journey: Blend It (sound
  out CVC words and match the picture), First Words (sight words), Everyday
  Things (real-world object vocabulary), and Read a Sentence.
- **🇰🇪 Swahili section** — simple Kiswahili with pictures across seven
  topics (greetings, numbers, animals, colours, family, food, body):
  flashcards with pronunciation plus gentle two-way quizzes.
- **🤖 Code section** — first coding for children: *Robot Path*, where kids
  build a program of move commands to guide a robot to the star (5 levels,
  each verified solvable, with a "Show me" helper), and *Step by Step*,
  ordering the steps of everyday tasks.
- **Real-life objects** throughout Reading and Swahili — the app now goes
  well beyond mermaids and dragons into houses, cups, buses, spoons and more.
- **Per-child PINs**: each child can have their own **unique** PIN. When set,
  the child taps their picture and enters their PIN to open their saved games
  and rewards, keeping siblings' progress separate. Uniqueness is enforced.
- **Bug reports**: a *Help & feedback* card in the Parent Zone with the
  **hello@storitellah.com** email.
- **Footer**: "Made with love by Luna and Lara's dad 💛" on the main screens.

### Changed
- **Real continent shapes** in World Discovery: the doodled blobs are gone.
  The map is now drawn from actual coastline coordinates (longitude/latitude)
  projected onto a true 720×360 equirectangular canvas, so every continent
  has its real silhouette and position, with island decorations (Greenland,
  Japan, Madagascar, New Zealand, the British Isles).
- **Demo profiles are now Luna (6) and Lara (8).**
- **Parent Zone opens on a normal tap** instead of a 2-second press-and-hold,
  which parents found unreliable. The grown-up maths gate and PIN still
  protect it.
- Service-worker cache bumped to `lamora-v3`.

### Note
- The synthesized voice remains fully removed (see 1.1.0). This release adds
  no speech; all instructions are on-screen text.

## [1.1.0] — 2026-07-13

### Removed
- **Synthesized speech (the "voice") removed entirely** — the robotic
  text-to-speech voice sounded unsettling to children. All spoken
  instructions are now shown as friendly written tips under each page
  title instead; the header speaker button, the stories "Read to me"
  button and the "Spoken instructions" parent toggle are gone. Gentle
  Web-Audio chimes and tones are unchanged.

### Added
- **First names for children**: the profile editor now has an optional
  *First name* field alongside the nickname, plus a "Greet the child by"
  choice (nickname or first name). The home greeting, profile picker,
  screen-time report, progress export and profession dream cards all use
  the chosen name. Names stay on the device like all other data.

### Changed
- Activities that relied on hearing the voice now show their clue as text
  (e.g. Letter Sounds asks: *Which letter says "mmm, like moon"?*).
- Service-worker cache bumped so installed apps pick up the update.

### Fixed
- The Parent Zone can no longer be reached by typing `#/parent` into the
  address bar — the route itself now requires the PIN, and re-locks the
  moment the parent leaves.

## [1.0.0] — 2026-07-13

### Added
- First complete release of **Lamora — Learn & Play** for children aged 5–10
- Installable **PWA** with service worker, offline cache, manifest and app icons
- Local child profiles (two demo profiles included) with avatars, ages and themes
- Six child-selectable visual themes (Ocean, Rainbow, Dragon, Space, Nature, Dino)
- **Numeracy**: counting, quantity matching, comparing, patterns, shapes, sorting, measuring, addition, subtraction, missing numbers, number bonds, money, time, word problems — age-adaptive
- **Literacy**: letter recognition, letter sounds, case matching, word builder, vocabulary, rhyming, sight words, spelling, sentence reading
- **Memory Gym**: pairs, picture/order/number/word/location recall, colour & sound sequences, with Easy/Medium/Hard/Adaptive levels
- **Brain-booster reward games**: memory match, Simon, odd one out, quick counting, shadow match, visual search, sorting challenge, maze, spot the difference
- **Chess Club**: 8 lessons with quizzes, movement & capture practice, four verified mate-in-one puzzles, play vs a gentle computer (full legal chess incl. castling, promotion, en passant), two-player mode, hints
- **Nature & Planet**: habitats, animal sounds, recycling sort, healthy-ocean builder, virtual garden, weather, space quiz, Earth-care quiz, food chains, nature memory
- **World Discovery**: interactive continent map (explore + find modes), flags, capitals, continents, landmarks, world facts, world memory
- **Drawing Studio**: five tools, colour palette, shapes, sticker stamps, backgrounds, undo/redo, local gallery, PNG export
- **Colouring**: ten tap-to-fill pages with undo/redo, save and PNG export
- **Sticker Book**: 30 earnable stickers and a drag-and-drop scene builder with export
- **"What Can I Be?"** profession dream cards (18 professions) with local-only optional photo and PNG export
- **Stories**: five interactive read-aloud stories with quizzes and gentle lessons
- **Reward loop**: stars → play tokens → timed reward sessions; six parent-selectable reward styles; optional free-play mode
- **Parent Zone**: press-and-hold + grown-up gate + PIN; daily/session limits, reward length, difficulty, section toggles, profile management, sound/accessibility settings, progress export, delete-all-data
- **Screen-time engine**: gentle 5-min/1-min warnings, calm break screen with activity ideas, PIN-gated extensions
- **Accessibility**: large text, high contrast, reduced motion, spoken instructions, captions/labels, keyboard support, focus states
- On-device **Web Audio** sound engine and speech synthesis — all audio works offline
- Documentation: README, Parent Guide, Privacy Notice, Child Safety, Testing report, Prompt spec
