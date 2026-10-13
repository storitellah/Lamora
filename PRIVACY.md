# 🛡️ Lamora — Privacy Notice

**Short version: Lamora collects nothing. Everything stays on your device.**

## What data Lamora stores — and where

Lamora stores the following **only in your browser's local storage on your device**:

- Child profiles: first name or nickname, age, avatar, favourite theme
- Learning progress: activities completed, stars and earned play sessions
- Screen-time counts per day
- App settings and the parent PIN

None of this ever leaves the device. Lamora has no server, no accounts, no cloud sync and makes **no network requests** after the app's own files are downloaded (and once installed, it runs offline).

## What Lamora does NOT do

- ❌ No advertising, ad networks or sponsored content
- ❌ No analytics, telemetry or crash reporting
- ❌ No third-party trackers, pixels, fonts or CDNs
- ❌ No cookies sent to any server
- ❌ No accounts or logins — children never enter an email or password
- ❌ No chat, social features or public profiles
- ❌ No location access
- ❌ No microphone access for children. The only use is optional and grown-up-only: in the PIN-protected Parent Zone you can record Portuguese or Kiswahili words in your own voice. The microphone is on only while you hold a word's record button, and recordings stay on this device
- ❌ No camera access (photo upload is a manual file choice by a parent)
- ❌ No cloud upload of any kind
- ❌ No facial recognition or biometric processing
- ❌ No behavioural profiling or targeted content
- ❌ No marketing notifications
- ❌ No selling, sharing or transmitting of data — there is no data pipeline at all

## Photos (Dream Cards)

If a parent adds a photo to a Dream Card — by device **camera** or by **choosing a file**:

- The photo is read locally with the browser's FileReader and drawn onto a local canvas.
- It is **never uploaded** — the app makes no network requests with it.
- It is **never analysed** — no face recognition, no identification, no inference of any kind. It is used purely as a picture placed inside a card template.
- It is held only in memory while the card editor is open and is discarded when you leave the page, unless you explicitly export the finished card as a PNG or PDF.
- A *Remove* button deletes it immediately.
- Exported cards carry **no app branding or watermark** — they are timeless family keepsakes.

## Speech and sound

Read-aloud uses the speech voices built into your device's operating system (Web Speech API); sound effects and the optional background music are synthesised on the device (Web Audio API). The Portuguese and Kiswahili word clips are ordinary audio files packaged inside the app (made with open-source speech software), so they play offline. No audio data is ever sent anywhere.

The microphone is used only if a grown-up chooses **Parent Zone → Languages → Record words**. It switches on when you tap a word's record button and off as soon as you stop (5 seconds at most). Recordings are stored only on this device, are played back only inside Lamora, and are removed by **Delete all data**. Children cannot reach the recorder, and nothing in the child area uses the microphone.

## Your controls

In the Parent Zone you can, at any time:

- Export a plain-text progress summary (saved as a local file you control)
- Delete any profile and its data
- **Delete all data** — one action wipes every profile, setting and cache from the device

Uninstalling the app or clearing the browser's site data also removes everything.

## Children's privacy laws

Because Lamora collects no personal data, transmits nothing and has no third parties involved, it is designed to be safely usable under COPPA, GDPR-K and similar children's privacy frameworks. There is simply no data collection to consent to.

## Changes

If a future version ever changed any of the above, this document and the in-app Parent Zone would say so plainly before the change applies.
