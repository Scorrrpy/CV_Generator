import type { CareerEntry } from './schema';

/** Parses a month (`YYYY-MM`) as the first day of that month in local time. */
export function parseYearMonth(value: string): Date {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
  if (!match) throw new Error(`Invalid year-month: "${value}"`);
  const [, year, month] = match;
  return new Date(Number(year), Number(month) - 1, 1);
}

/** Parses an ISO date (`YYYY-MM-DD`) as a local calendar date. */
export function parseIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error(`Invalid ISO date: "${value}"`);
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** "09/2023 – heute", "09/2023 – 01/2026", or only "10/2024" for a station within one month. */
export function formatPeriod(start: string, end: string | undefined, intl: string, present: string): string {
  const month = new Intl.DateTimeFormat(intl, { month: '2-digit', year: 'numeric' });
  const from = month.format(parseYearMonth(start));
  if (!end) return `${from} – ${present}`;
  return end === start ? from : `${from} – ${month.format(parseYearMonth(end))}`;
}

/** Running stations first, then by end and start, newest first. Does not mutate the input. */
export function sortCareer<T extends Pick<CareerEntry, 'start' | 'end'>>(entries: readonly T[]): T[] {
  const key = (entry: T) => `${entry.end ?? '9999-99'}|${entry.start}`;
  return [...entries].sort((a, b) => key(b).localeCompare(key(a)));
}
