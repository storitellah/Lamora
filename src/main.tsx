import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { StoreProvider } from "./lib/store";
import { toast } from "./components/UI";
import "./index.css";

// Offline-first service worker. When a new version is deployed, we refresh
// quietly on the next visit rather than interrupting a child mid-activity.
const updateSW = registerSW({
  onNeedRefresh() {
    toast("✨ A new version of Lamora is ready — updating…");
    // Give the toast a moment, then activate the new version.
    setTimeout(() => updateSW(true), 1500);
  },
  onOfflineReady() {
    toast("✅ Lamora is ready to work offline!");
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);
