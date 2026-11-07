// A list kept in Local Storage and shared with React through useSyncExternalStore.
import { useSyncExternalStore } from 'react';

export function createListStore(key) {
  const listeners = new Set();
  const emit = () => listeners.forEach((l) => l());

  const read = () => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  let items = read();
  const subscribe = (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  // Keep other open tabs in sync.
  window.addEventListener('storage', (e) => {
    if (e.key !== key) return;
    items = read();
    emit();
  });

  return {
    get: () => items,
    set(next) {
      items = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Private mode or storage full: keep working in memory for this visit.
      }
      emit();
    },
    use: () => useSyncExternalStore(subscribe, () => items),
  };
}

/** A short random code: digits only, `length` long. */
export const randomDigits = (length) => Array.from(crypto.getRandomValues(new Uint8Array(length)), (b) => b % 10).join('');
