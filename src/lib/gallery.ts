/**
 * My Gallery — artworks kept on this device in IndexedDB.
 *
 * IndexedDB rather than localStorage because a picture (with its fills) can
 * be a few megabytes and localStorage is capped around 5 MB in total.
 * Nothing here ever leaves the device.
 */

export interface ArtRecord {
  id: string;
  profileId: string;
  title: string;
  updated: number;
  thumb: string;   // small JPEG data URL for the gallery grid
  doc: string;     // serialised ArtDocData
}

const DB = "lamora-art";
const STORE = "art";
const AUTOSAVE = "__autosave__";

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => {
      const s = r.result.createObjectStore(STORE, { keyPath: "id" });
      s.createIndex("profile", "profileId");
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
    t.oncomplete = () => db.close();
  });
}

export async function listArt(profileId: string): Promise<ArtRecord[]> {
  try {
    const all = await tx<ArtRecord[]>("readonly", s => s.index("profile").getAll(profileId));
    return all.filter(a => !a.id.startsWith(AUTOSAVE)).sort((a, b) => b.updated - a.updated);
  } catch { return []; }
}

export async function putArt(rec: ArtRecord): Promise<boolean> {
  try { await tx("readwrite", s => s.put(rec)); return true; } catch { return false; }
}

export async function deleteArt(id: string): Promise<void> {
  try { await tx("readwrite", s => s.delete(id)); } catch { /* ignore */ }
}

export async function getArt(id: string): Promise<ArtRecord | undefined> {
  try { return await tx<ArtRecord | undefined>("readonly", s => s.get(id)); } catch { return undefined; }
}

/** One rolling autosave per child, so closing the studio never loses work. */
export const autosaveId = (profileId: string) => `${AUTOSAVE}${profileId}`;

/** Remove every artwork (used by the Parent Dashboard's "delete all data"). */
export async function wipeArt(): Promise<void> {
  try { await new Promise<void>((res) => { const r = indexedDB.deleteDatabase(DB); r.onsuccess = r.onerror = r.onblocked = () => res(); }); }
  catch { /* ignore */ }
}
