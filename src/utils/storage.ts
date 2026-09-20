const memoryStore = new Map<string, string>();

function getStorage(kind: 'local' | 'session'): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStorage<T>(key: string, kind: 'local' | 'session' = 'local'): T | null {
  const storage = getStorage(kind);
  const raw = storage?.getItem(key) ?? memoryStore.get(`${kind}:${key}`);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function writeStorage<T>(key: string, value: T, kind: 'local' | 'session' = 'local') {
  const raw = JSON.stringify(value);
  const storage = getStorage(kind);
  try { storage?.setItem(key, raw); } catch { /* Use the in-memory fallback below. */ }
  memoryStore.set(`${kind}:${key}`, raw);
}

export function removeStorage(key: string, kind: 'local' | 'session' = 'local') {
  try { getStorage(kind)?.removeItem(key); } catch { /* Storage can be blocked by the browser. */ }
  memoryStore.delete(`${kind}:${key}`);
}
