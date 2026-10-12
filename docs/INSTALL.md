# Installing Lamora

Lamora runs the same everywhere: as an app on Android tablets and phones, as a
home-screen app on iPad and iPhone, and as an installed app on Mac and Windows.
Every version works offline and keeps all data on the device.

| Device | How to install | What you get |
| --- | --- | --- |
| **Android tablet / phone** | Download the APK (below) | A real Android app with the Lamora icon |
| **iPad / iPhone** | Safari → Share → **Add to Home Screen** | A full-screen app with its own icon; works offline; Apple Pencil supported |
| **iPad / iPhone (native)** | Build in Xcode on a Mac (below) | A native iOS app |
| **Mac** | Safari → File → **Add to Dock**, or Chrome/Edge → Install | A desktop app window |
| **Windows** | Edge or Chrome → **Install Lamora** (address bar icon) | A Start-menu app |

> **Why there is no APK for iPad:** an APK is Android's app format. iPads can
> only install apps through Apple (App Store, TestFlight or Xcode), so on iPad
> Lamora installs from Safari instead — it looks and behaves like an app.

---

## Android: install the APK

1. On the Android tablet, open
   **https://github.com/storitellah/Lamora/releases/tag/android-latest**
2. Tap **Lamora.apk** to download it.
3. Open the download. Android asks for permission to install apps from your
   browser — tap **Settings → Allow from this source**, then go back and tap
   **Install**.
4. Open **Lamora** from the home screen.

A new APK is built automatically every time the `main` branch changes
(GitHub → Actions → *Android APK*). The same page always has the newest one.

### One-time setup: a signing key (recommended)

Android only lets a new version install **over** an old one if both were
signed with the same key. Without your own key, a newer APK may ask you to
uninstall the old app first, which deletes the children's stars and drawings.

Add these four repository secrets once (GitHub → **Settings → Secrets and
variables → Actions → New repository secret**):

| Secret | Value |
| --- | --- |
| `LAMORA_KEYSTORE_BASE64` | your keystore file, base64-encoded on one line |
| `LAMORA_KEYSTORE_PASSWORD` | the keystore password |
| `LAMORA_KEY_PASSWORD` | the key password (often the same) |
| `LAMORA_KEY_ALIAS` | `lamora` |

To make your own key instead of using a provided one:

```bash
keytool -genkeypair -keystore lamora.jks -alias lamora -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 lamora.jks   # macOS: base64 -i lamora.jks
```

Keep `lamora.jks` and its password somewhere safe (a password manager). Never
commit it — the repository is public.

### Build the APK yourself (optional)

Requires Node 22, JDK 21 and the Android SDK (Android Studio installs it):

```bash
npm ci && npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

---

## iPad / iPhone: add to Home Screen

1. Open the Lamora web address in **Safari** (see `README.md` → *Deploying*).
2. Tap **Share** (□↑) → **Add to Home Screen** → **Add**.
3. Open Lamora from the home screen once while online; after that it works
   fully offline.

Saved drawings and cards open the iPad share sheet — choose **Save Image** to
put them in Photos.

### Native iOS app (needs a Mac)

```bash
npm ci && npm run build
npx cap sync ios
npx cap open ios        # opens Xcode
```

In Xcode select the **App** target → *Signing & Capabilities* → choose your
Apple ID team, plug in the iPad and press ▶︎. A free Apple ID works for
testing (the app must be re-installed every 7 days); an Apple Developer
account (US$99/year) allows TestFlight and the App Store.

---

## What the installed app can and can't do

- **No network use:** the app's files are inside the app. It never loads
  remote content, has no analytics, ads, accounts or tracking.
- **No cloud backup:** Android backup and device-to-device transfer of app
  data are switched off, so children's data stays on the device.
- **Permissions:** none beyond what Android's web view needs to show the app's
  own pages. Photos for Dream Cards come through the system photo picker.
- **Speech:** read-aloud uses the device's own text-to-speech voices
  (Android: *Settings → Accessibility → Text-to-speech*; iPad: *Settings →
  Accessibility → Spoken Content → Voices* — download an "Enhanced" voice for
  the most natural sound).
