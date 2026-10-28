import { describe, expect, it } from 'vitest';
import { contrastRatio, parseHex } from './color';
import { resolveLocalized, setLocalized } from './localize';
import { formatPeriod, parseYearMonth, sortCareer } from './period';
import { themeContrastPairs, themePresets } from './theme';
import { MIN_TEXT_CONTRAST } from './color';
import { cvFileName } from './render';

describe('resolveLocalized', () => {
  it('uses a single value for every language', () => {
    expect(resolveLocalized('Tools', 'en')).toBe('Tools');
  });

  it('picks the translation', () => {
    expect(resolveLocalized({ de: 'Profil', en: 'Profile' }, 'en')).toBe('Profile');
  });

  it('keeps arrays as single values', () => {
    expect(resolveLocalized(['a', 'b'], 'de')).toEqual(['a', 'b']);
  });

  it('passes undefined through', () => {
    expect(resolveLocalized(undefined, 'de')).toBeUndefined();
  });
});

describe('setLocalized', () => {
  it('stays a single value when not bilingual', () => {
    expect(setLocalized({ de: 'a', en: 'b' }, 'de', 'c', false)).toBe('c');
  });

  it('splits a single value into translations when bilingual', () => {
    expect(setLocalized('Profil', 'en', 'Profile', true)).toEqual({ de: 'Profil', en: 'Profile' });
  });

  it('starts both languages with the first value', () => {
    expect(setLocalized(undefined, 'de', 'Hallo', true)).toEqual({ de: 'Hallo', en: 'Hallo' });
  });
});

describe('periods', () => {
  it('rejects invalid months', () => {
    expect(() => parseYearMonth('2023-13')).toThrow();
  });

  it('formats running, finished and single-month periods', () => {
    expect(formatPeriod('2023-09', undefined, 'de-DE', 'heute')).toBe('09/2023 – heute');
    expect(formatPeriod('2023-09', '2026-01', 'en-GB', 'present')).toBe('09/2023 – 01/2026');
    expect(formatPeriod('2024-10', '2024-10', 'en-GB', 'present')).toBe('10/2024');
  });

  it('sorts running stations first, then newest first', () => {
    const entries = [
      { id: 'old', start: '2015-09', end: '2021-07' },
      { id: 'running', start: '2024-07' },
      { id: 'recent', start: '2021-09', end: '2024-06' },
    ];
    expect(sortCareer(entries).map((entry) => entry.id)).toEqual(['running', 'recent', 'old']);
    expect(entries[0]!.id).toBe('old');
  });
});

describe('colours', () => {
  it('parses hex colours', () => {
    expect(parseHex('#FF8000')).toEqual([255, 128, 0]);
    expect(() => parseHex('#fff')).toThrow();
  });

  it('computes the WCAG contrast ratio', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1);
  });

  it.each(Object.entries(themePresets))('preset "%s" has readable text everywhere', (_, theme) => {
    for (const pair of themeContrastPairs(theme)) {
      expect(contrastRatio(pair.foreground, pair.background), pair.id).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    }
  });
});

describe('cvFileName', () => {
  it('builds a safe, localised file name', () => {
    expect(cvFileName('David Roßkopf', 'de')).toBe('David_Rosskopf_Lebenslauf.pdf');
    expect(cvFileName('Zoë Müller', 'en')).toBe('Zoe_Muller_CV.pdf');
    expect(cvFileName('', 'en')).toBe('CV_CV.pdf');
  });
});
