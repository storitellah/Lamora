# 🛡️ Lamora Child Safety

Lamora is built for children aged 5–10, so safety is a design requirement, not a feature. This document lists the concrete decisions that keep the app safe.

## No strangers, no contact, no exposure

- **No chat or messaging** of any kind.
- **No social features**: no friends, no sharing feeds, no comments.
- **No public profiles or leaderboards** — a child's name, age and progress exist only on the family's device.
- **No external links in child mode.** Children cannot navigate out of the app. Documentation links exist only in this repository, not in the child UI.
- **No user-generated content from other people** — every word, picture and sound a child sees ships with the app.

## No commercial pressure

- **No advertising** of any kind.
- **No in-app purchases, loot boxes, currencies that cost money, or paid unlocks.**
- **No marketing notifications** — the app sends no notifications at all.
- The reward system is deliberately gentle: rewards come **only from learning effort**, tokens simply time-box play, stars are never taken away, and nothing nags a child to come back.

## No surveillance

- No analytics, tracking, profiling or targeted content (see [PRIVACY.md](PRIVACY.md)).
- No location, microphone or contact access.
- Photos for dream cards are local-only, never analysed, and never used for face recognition or to infer anything about a child.

## Emotional safety

- **Wrong answers are never punished or shamed.** The first miss gives a hint and another try; the second gently reveals the answer with a simple explanation.
- Language is always encouraging ("Almost! Watch one more time — you can do it!").
- **No countdown pressure** in learning activities and no timers in chess by default.
- Siblings are never ranked against each other.
- The screen-time break screen is calm and positive, and suggests a fun physical activity rather than showing a "time's up" lockout.

## Healthy screen time

- Parents set a **daily limit** and a **session reminder**; children get friendly 5-minute and 1-minute warnings.
- Reward-game sessions end automatically after a parent-chosen length.
- Extending time always requires the parent PIN.

## Grown-up gate

The Parent Zone sits behind three layers appropriate to this age group:

1. a **press-and-hold** gesture (2 seconds),
2. a **grown-up verification question** (multiplication beyond the app's age range) on first use or PIN reset,
3. a **4-digit parent PIN** thereafter.

The PIN is a child gate, not a security boundary — Lamora deliberately stores nothing sensitive that would need one.

## Age-appropriate content

- All content is curated, offline and reviewed: animals, nature, geography, friendly stories, chess.
- Difficulty adapts to the child's age (5–10) or the parent's chosen level.
- Younger children get less text, bigger targets and simple written tips.

## Accessibility & inclusion

- Large text, high contrast and reduced-motion modes.
- Simple language, short sentences and friendly written tips on every page. (Synthesized speech was deliberately removed — robot voices can frighten young children.)
- Keyboard, mouse and touch all work everywhere; interactive elements have screen-reader labels and clear focus states.
- Sticker themes, avatars and professions are inclusive and stereotype-free — every child can be the astronaut, the chef, or the marine biologist.

## Reporting a concern

If you find anything in Lamora that seems unsafe or inappropriate for children, please open an issue in this repository so it can be fixed quickly.
