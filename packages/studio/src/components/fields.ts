import type { StudioMessages } from '../i18n';

/**
 * How a value of the CV is edited:
 * - `text` / `email` / `url` / `tel`: plain string, the same in both languages
 * - `localized`, `textarea`: translatable text
 * - `lines`: translatable list, one entry per line
 * - `list`: plain list, comma separated
 * - `month` / `date`: `YYYY-MM` / `YYYY-MM-DD`, empty removes the value
 * - `kind`: work or education
 */
export type FieldKind = 'text' | 'email' | 'url' | 'tel' | 'localized' | 'textarea' | 'lines' | 'list' | 'month' | 'date' | 'kind';

export interface FieldSpec {
  key: keyof StudioMessages['fields'];
  kind: FieldKind;
  /** Spans the full width of the form grid. */
  wide?: boolean;
}

export const personFields: FieldSpec[] = [
  { key: 'name', kind: 'text' },
  { key: 'headline', kind: 'localized' },
  { key: 'email', kind: 'email' },
  { key: 'phone', kind: 'tel' },
  { key: 'location', kind: 'localized' },
  { key: 'website', kind: 'url' },
  { key: 'birthDate', kind: 'date' },
];

export interface ListSpec {
  id: 'links' | 'career' | 'skills' | 'certificates' | 'projects' | 'languages';
  path: readonly string[];
  fields: FieldSpec[];
  /** Field shown as the title of a collapsed entry. */
  titleKey: FieldSpec['key'];
  newItem: () => object;
}

const thisMonth = () => new Date().toISOString().slice(0, 7);

export const listSpecs: ListSpec[] = [
  {
    id: 'career',
    path: ['career'],
    titleKey: 'title',
    fields: [
      { key: 'kind', kind: 'kind' },
      { key: 'title', kind: 'localized' },
      { key: 'organization', kind: 'text' },
      { key: 'location', kind: 'localized' },
      { key: 'start', kind: 'month' },
      { key: 'end', kind: 'month' },
      { key: 'description', kind: 'textarea', wide: true },
      { key: 'highlights', kind: 'lines', wide: true },
    ],
    newItem: () => ({ id: crypto.randomUUID(), kind: 'work', title: '', organization: '', start: thisMonth() }),
  },
  {
    id: 'skills',
    path: ['skills'],
    titleKey: 'group',
    fields: [
      { key: 'group', kind: 'localized' },
      { key: 'items', kind: 'list', wide: true },
    ],
    newItem: () => ({ group: '', items: [] }),
  },
  {
    id: 'certificates',
    path: ['certificates'],
    titleKey: 'title',
    fields: [
      { key: 'title', kind: 'localized', wide: true },
      { key: 'issuer', kind: 'text' },
      { key: 'date', kind: 'month' },
      { key: 'url', kind: 'url', wide: true },
    ],
    newItem: () => ({ title: '', issuer: '' }),
  },
  {
    id: 'projects',
    path: ['projects'],
    titleKey: 'title',
    fields: [
      { key: 'title', kind: 'localized' },
      { key: 'url', kind: 'url' },
      { key: 'description', kind: 'textarea', wide: true },
      { key: 'tags', kind: 'list', wide: true },
    ],
    newItem: () => ({ title: '', tags: [] }),
  },
  {
    id: 'languages',
    path: ['languages'],
    titleKey: 'name',
    fields: [
      { key: 'name', kind: 'localized' },
      { key: 'level', kind: 'localized' },
    ],
    newItem: () => ({ name: '', level: '' }),
  },
  {
    id: 'links',
    path: ['person', 'links'],
    titleKey: 'label',
    fields: [
      { key: 'label', kind: 'text' },
      { key: 'url', kind: 'url' },
    ],
    newItem: () => ({ label: '', url: '' }),
  },
];

/** Translatable kinds go through the `setText` action, the others are set as they are. */
export const isTranslatable = (kind: FieldKind) => kind === 'localized' || kind === 'textarea' || kind === 'lines';

/** Converts the raw input value into what is stored in the CV. */
export function parseInput(kind: FieldKind, raw: string): unknown {
  switch (kind) {
    case 'lines':
      return raw.split('\n');
    case 'list':
      return raw.split(',').map((item) => item.trimStart());
    case 'month':
    case 'date':
      return raw === '' ? undefined : raw;
    default:
      return raw;
  }
}

/** Converts a stored value (already resolved to the current language) into the input value. */
export function formatInput(kind: FieldKind, value: unknown): string {
  if (Array.isArray(value)) return value.join(kind === 'lines' ? '\n' : ', ');
  return typeof value === 'string' ? value : '';
}
