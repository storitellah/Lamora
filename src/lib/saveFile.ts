/**
 * Save a file the way each platform expects — never by uploading it.
 *
 *  - Installed app (Android APK / iOS): write it to the device's Documents
 *    folder with the native file system, then open the share sheet so a
 *    grown-up can put it in Photos / Gallery / Files.
 *  - iPad / iPhone / Android browsers: the Web Share sheet ("Save Image"
 *    puts it straight into Photos). A plain download link on iOS just opens
 *    the image in a new tab, which children can't get back from.
 *  - Desktop (Mac / Windows): an ordinary download.
 *
 * Every route stays on the device; nothing is sent to a server.
 */
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export type SaveResult = "saved" | "shared" | "downloaded" | "cancelled" | "failed";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] ?? "");
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.92): Promise<Blob> {
  return new Promise((res, rej) => {
    canvas.toBlob(b => (b ? res(b) : rej(new Error("toBlob failed"))), type, quality);
  });
}

const isTouchDevice = () =>
  typeof navigator !== "undefined" && (navigator.maxTouchPoints > 1 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

export async function saveBlob(blob: Blob, filename: string, title = "My Lamora picture"): Promise<SaveResult> {
  // 1. Installed app
  if (Capacitor.isNativePlatform()) {
    try {
      const data = await blobToBase64(blob);
      let uri: string, kept = true;
      try {
        uri = (await Filesystem.writeFile({ path: `Lamora/${filename}`, data, directory: Directory.Documents, recursive: true })).uri;
      } catch {
        // Some Android builds restrict shared folders: keep a private copy
        // and let the share sheet put it in Gallery / Files / Drive.
        uri = (await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache })).uri;
        kept = false;
      }
      try { await Share.share({ title, files: [uri] }); return "shared"; }
      catch { return kept ? "saved" : "cancelled"; } // share sheet dismissed
    } catch {
      return "failed";
    }
  }

  // 2. Mobile browsers: the share sheet
  const file = new File([blob], filename, { type: blob.type });
  if (isTouchDevice() && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return "cancelled";
      // fall through to a download
    }
  }

  // 3. Desktop: download
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return "downloaded";
  } catch {
    return "failed";
  }
}

/** Friendly toast text for each outcome. */
export function saveMessage(r: SaveResult, what = "Picture"): string | null {
  switch (r) {
    case "saved": return `✅ ${what} saved to Documents › Lamora`;
    case "shared": return `✅ ${what} ready — choose where to keep it`;
    case "downloaded": return `✅ ${what} saved to your Downloads`;
    case "cancelled": return null;
    default: return "Hmm, that didn't save. Please try again.";
  }
}
