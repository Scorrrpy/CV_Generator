import { parseCvData, parseCvTheme } from '@scorrrpy/cv-engine';
import type { CvStorage } from '@scorrrpy/cv-studio';
import { del, get, set } from 'idb-keyval';

const KEY = 'cv-generator:current';

/**
 * Keeps the CV in the browser's IndexedDB, so it survives reloads and works offline.
 * A stored state that no longer matches the schema is ignored instead of breaking the app.
 */
export function indexedDbStorage(key = KEY): CvStorage {
  return {
    async load() {
      try {
        const stored = (await get(key)) as { data?: unknown; theme?: unknown } | undefined;
        if (!stored) return null;
        return { data: parseCvData(stored.data), theme: parseCvTheme(stored.theme) };
      } catch {
        return null;
      }
    },
    async save(cv) {
      try {
        await set(key, cv);
      } catch {
        /* storage unavailable (private mode, quota) – the CV can still be saved as a file */
      }
    },
    async clear() {
      await del(key).catch(() => undefined);
    },
  };
}
