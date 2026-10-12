import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native wrapper for the installable Android (APK) and iPad/iPhone apps.
 * The app runs entirely from files bundled inside it: no server URL, no
 * remote content, no analytics. See docs/INSTALL.md.
 */
const config: CapacitorConfig = {
  appId: "app.lamora.kids",
  appName: "Lamora",
  webDir: "dist",
  backgroundColor: "#f5f6fb",
  android: {
    // Children can't long-press their way into web inspection in release builds.
    webContentsDebuggingEnabled: false,
    allowMixedContent: false
  },
  ios: {
    contentInset: "never",
    backgroundColor: "#f5f6fb"
  },
  plugins: {
    SplashScreen: { launchShowDuration: 600, backgroundColor: "#f5f6fb", showSpinner: false },
    StatusBar: { style: "LIGHT", backgroundColor: "#f5f6fb", overlaysWebView: false }
  }
};

export default config;
