import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Lamora build configuration.
 *
 * - React + Tailwind v4 (CSS-first config, see src/index.css).
 * - vite-plugin-pwa precaches every built asset so the app runs fully
 *   offline after the first visit. There are zero runtime CDN requests:
 *   fonts use the OS system stack (SF Pro on Apple devices), icons are
 *   bundled lucide-react components, sounds are synthesised on-device.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icons/*.png", "icons/*.svg"],
      manifest: {
        name: "Lamora — Learn, Play & Grow",
        short_name: "Lamora",
        description:
          "A safe, offline-first learning and play app for children aged 5-10. No ads, no tracking, no accounts.",
        start_url: ".",
        display: "standalone",
        background_color: "#f5f6fb",
        theme_color: "#5b5bd6",
        lang: "en",
        categories: ["education", "kids", "games"],
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        // Precache everything the build emits — the whole app works offline.
        globPatterns: ["**/*.{js,css,html,png,svg,webmanifest}"],
        navigateFallback: "index.html"
      }
    })
  ],
  build: {
    // Keep chunks comfortable for low-cost tablets: one vendor chunk keeps
    // request count minimal and the whole bundle stays small.
    chunkSizeWarningLimit: 900
  }
});
