import { defaultTheme, sampleCv, themePresets, type CvData } from '@scorrrpy/cv-engine';
import { describe, expect, it } from 'vitest';
import { getIn, moveItem, setIn } from './path';
import { createStudioState, hasTranslations, studioReducer, type StudioState } from './studioReducer';

const minimal: CvData = {
  version: 1,
  person: { name: 'Erika', links: [] },
  career: [],
  skills: [],
  certificates: [],
  projects: [],
  languages: [],
};

describe('path helpers', () => {
  it('reads nested values', () => {
    expect(getIn({ a: [{ b: 1 }] }, ['a', 0, 'b'])).toBe(1);
    expect(getIn({ a: 1 }, ['x', 'y'])).toBeUndefined();
  });

  it('writes without mutating', () => {
    const root = { a: [{ b: 1 }, { b: 2 }] };
    const next = setIn(root, ['a', 1, 'b'], 3);
    expect(next).toEqual({ a: [{ b: 1 }, { b: 3 }] });
    expect(root.a[1]!.b).toBe(2);
    expect(next.a[0]).toBe(root.a[0]);
  });

  it('removes object keys set to undefined', () => {
    expect(setIn({ a: 1, b: 2 }, ['b'], undefined)).toEqual({ a: 1 });
  });

  it('moves items within bounds only', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItem(['a', 'b'], 1, 2)).toEqual(['a', 'b']);
  });
});

describe('studioReducer', () => {
  const state = (data: CvData = minimal, bilingual = false): StudioState => ({
    ...createStudioState(data, defaultTheme, 'de'),
    bilingual,
  });

  it('detects bilingual data on load', () => {
    expect(hasTranslations(sampleCv)).toBe(true);
    expect(hasTranslations(minimal)).toBe(false);
    expect(studioReducer(state(), { type: 'load', data: sampleCv, theme: defaultTheme }).bilingual).toBe(true);
  });

  it('sets plain fields', () => {
    const next = studioReducer(state(), { type: 'set', path: ['person', 'email'], value: 'a@b.c' });
    expect(next.data.person.email).toBe('a@b.c');
  });

  it('writes a single text when not bilingual', () => {
    const next = studioReducer(state(), { type: 'setText', path: ['person', 'headline'], value: 'Entwickler' });
    expect(next.data.person.headline).toBe('Entwickler');
  });

  it('writes only the current language when bilingual', () => {
    let next = studioReducer(state(minimal, true), { type: 'setText', path: ['summary'], value: 'Hallo' });
    next = studioReducer({ ...next, cvLocale: 'en' }, { type: 'setText', path: ['summary'], value: 'Hello' });
    expect(next.data.summary).toEqual({ de: 'Hallo', en: 'Hello' });
  });

  it('keeps the language on screen when switching to one language', () => {
    const next = studioReducer({ ...state(sampleCv, true), cvLocale: 'en' }, { type: 'bilingual', value: false });
    expect(next.data.person.headline).toBe('Software Developer');
    expect(next.data.career[1]!.highlights).toEqual(['Migrated a legacy application to React', 'Set up a CI/CD pipeline']);
    expect(hasTranslations(next.data)).toBe(false);
  });

  it('adds, moves and removes list items', () => {
    const add = (s: StudioState, name: string) =>
      studioReducer(s, { type: 'add', path: ['languages'], item: { name, level: 'C1' } });
    let next = add(add(state(), 'A'), 'B');
    next = studioReducer(next, { type: 'move', path: ['languages'], from: 1, to: 0 });
    expect(next.data.languages.map((language) => language.name)).toEqual(['B', 'A']);
    next = studioReducer(next, { type: 'remove', path: ['languages'], index: 0 });
    expect(next.data.languages.map((language) => language.name)).toEqual(['A']);
  });

  it('replaces the theme', () => {
    expect(studioReducer(state(), { type: 'theme', theme: themePresets.mono }).theme).toBe(themePresets.mono);
  });
});
