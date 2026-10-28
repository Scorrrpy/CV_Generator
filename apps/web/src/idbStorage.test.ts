import { defaultTheme, sampleCv } from '@scorrrpy/cv-engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { indexedDbStorage } from './idbStorage';

// jsdom has no IndexedDB – an in-memory stand-in for idb-keyval is enough to test the logic around it.
const store = new Map<string, unknown>();
vi.mock('idb-keyval', () => ({
  get: async (key: string) => store.get(key),
  set: async (key: string, value: unknown) => void store.set(key, value),
  del: async (key: string) => void store.delete(key),
}));

describe('indexedDbStorage', () => {
  beforeEach(() => store.clear());

  it('returns null before anything was saved', async () => {
    expect(await indexedDbStorage().load()).toBeNull();
  });

  it('round-trips a CV', async () => {
    const storage = indexedDbStorage();
    await storage.save({ data: sampleCv, theme: defaultTheme });
    expect(await storage.load()).toEqual({ data: sampleCv, theme: defaultTheme });
  });

  it('ignores a stored state that no longer matches the schema', async () => {
    store.set('cv-generator:current', { data: { version: 99 }, theme: defaultTheme });
    expect(await indexedDbStorage().load()).toBeNull();
  });

  it('forgets the CV on clear', async () => {
    const storage = indexedDbStorage();
    await storage.save({ data: sampleCv, theme: defaultTheme });
    await storage.clear();
    expect(await storage.load()).toBeNull();
  });
});
