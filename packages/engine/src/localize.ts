import type { Locale, Localized } from './schema';

const isTranslated = <T>(value: Localized<T>): value is Record<Locale, T> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && 'de' in value && 'en' in value;

/** Picks the translation for `locale`; a single value counts for both languages. */
export function resolveLocalized<T>(value: Localized<T>, locale: Locale): T;
export function resolveLocalized<T>(value: Localized<T> | undefined, locale: Locale): T | undefined;
export function resolveLocalized<T>(value: Localized<T> | undefined, locale: Locale): T | undefined {
  if (value === undefined) return undefined;
  return isTranslated(value) ? value[locale] : value;
}

/**
 * Writes the value for one language. With `bilingual` the value is split into one translation per language
 * (a single value becomes the starting point for both), otherwise it stays a single value.
 */
export function setLocalized<T>(
  current: Localized<T> | undefined,
  locale: Locale,
  next: T,
  bilingual: boolean,
): Localized<T> {
  if (!bilingual) return next;
  const base = current === undefined ? { de: next, en: next } : toTranslations(current);
  return { ...base, [locale]: next };
}

/** A single value becomes the same value for every language. */
export function toTranslations<T>(value: Localized<T>): Record<Locale, T> {
  return isTranslated(value) ? value : { de: value, en: value };
}
