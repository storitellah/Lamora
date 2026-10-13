/**
 * Grown-up voice recordings for the language words — kept only on this
 * device (IndexedDB). A parent, grandparent or teacher who speaks Portuguese
 * or Kiswahili can record any word in the Parent Zone, and the children then
 * hear that real voice instead of the built-in one. Nothing is uploaded.
 */
const DB = "lamora-voices";
const STORE = "rec";

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode);
    const q = fn(t.objectStore(STORE));
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
    t.oncomplete = () => db.close();
  });
}

export const recKey = (lang: string, id: string) => `${lang}:${id}`;

let cache: Map<string, Blob> | null = null;

/** All recordings, cached in memory after the first read. */
export async function allRecordings(): Promise<Map<string, Blob>> {
  if (cache) return cache;
  try {
    const keys = await run<IDBValidKey[]>("readonly", s => s.getAllKeys());
    const vals = await run<Blob[]>("readonly", s => s.getAll());
    cache = new Map(keys.map((k, i) => [String(k), vals[i]]));
  } catch { cache = new Map(); }
  return cache;
}

/** Synchronous lookup once recordings have been loaded (see allRecordings). */
export function cachedRecording(key: string): Blob | null {
  return cache?.get(key) ?? null;
}

export async function saveRecording(key: string, blob: Blob) {
  await run("readwrite", s => s.put(blob, key));
  (await allRecordings()).set(key, blob);
}

export async function deleteRecording(key: string) {
  try { await run("readwrite", s => s.delete(key)); } catch { /* ignore */ }
  (await allRecordings()).delete(key);
}

export async function wipeRecordings() {
  cache = new Map();
  await new Promise<void>(res => { const r = indexedDB.deleteDatabase(DB); r.onsuccess = r.onerror = r.onblocked = () => res(); });
}
