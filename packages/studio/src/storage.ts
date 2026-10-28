import type { CvData, CvTheme } from '@scorrrpy/cv-engine';

export interface StoredCv {
  data: CvData;
  theme: CvTheme;
}

/**
 * Where the studio keeps its working state between visits. The studio loads once on start
 * and saves (debounced) after every change. Implementations must not throw for missing data.
 */
export interface CvStorage {
  load(): Promise<StoredCv | null>;
  save(cv: StoredCv): Promise<void>;
  clear(): Promise<void>;
}

/** Keeps the state only while the page is open – for demos. */
export function memoryStorage(): CvStorage {
  let stored: StoredCv | null = null;
  return {
    load: async () => stored,
    save: async (cv) => {
      stored = cv;
    },
    clear: async () => {
      stored = null;
    },
  };
}
