import { setLocalized, type CvData, type CvTheme, type Locale, type Localized } from '@scorrrpy/cv-engine';
import { getIn, moveItem, setIn, updateList, type Path } from './path';

export interface StudioState {
  data: CvData;
  theme: CvTheme;
  /** Language that is edited and previewed. */
  cvLocale: Locale;
  /** Texts are kept per language (`{ de, en }`) instead of once for both. */
  bilingual: boolean;
}

export type StudioAction =
  | { type: 'load'; data: CvData; theme: CvTheme }
  | { type: 'set'; path: Path; value: unknown }
  /** Sets a translatable field for the current `cvLocale`. */
  | { type: 'setText'; path: Path; value: string | string[] }
  | { type: 'add'; path: Path; item: unknown }
  | { type: 'remove'; path: Path; index: number }
  | { type: 'move'; path: Path; from: number; to: number }
  | { type: 'theme'; theme: CvTheme }
  | { type: 'cvLocale'; locale: Locale }
  | { type: 'bilingual'; value: boolean };

const isTranslations = (value: object): value is Record<Locale, unknown> => {
  const keys = Object.keys(value);
  return keys.length === 2 && keys.includes('de') && keys.includes('en');
};

/** True if any text of the CV already has separate translations. */
export function hasTranslations(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasTranslations);
  if (value === null || typeof value !== 'object') return false;
  return isTranslations(value) || Object.values(value).some(hasTranslations);
}

/** Replaces every `{ de, en }` by its value for `locale`. */
function keepLocale(value: unknown, locale: Locale): unknown {
  if (Array.isArray(value)) return value.map((item) => keepLocale(item, locale));
  if (value === null || typeof value !== 'object') return value;
  if (isTranslations(value)) return value[locale];
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, keepLocale(item, locale)]));
}

/** Starting point of "Start over". */
export const emptyCv = (): CvData => ({
  version: 1,
  person: { name: '', links: [] },
  career: [],
  skills: [],
  certificates: [],
  projects: [],
  languages: [],
});

export function createStudioState(data: CvData, theme: CvTheme, cvLocale: Locale): StudioState {
  return { data, theme, cvLocale, bilingual: hasTranslations(data) };
}

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'load':
      return createStudioState(action.data, action.theme, state.cvLocale);
    case 'set':
      return { ...state, data: setIn(state.data, action.path, action.value) };
    case 'setText': {
      const current = getIn(state.data, action.path) as Localized<string | string[]> | undefined;
      const next = setLocalized(current, state.cvLocale, action.value, state.bilingual);
      return { ...state, data: setIn(state.data, action.path, next) };
    }
    case 'add':
      return { ...state, data: updateList(state.data, action.path, (list) => [...list, action.item]) };
    case 'remove':
      return {
        ...state,
        data: updateList(state.data, action.path, (list) => list.filter((_, index) => index !== action.index)),
      };
    case 'move':
      return { ...state, data: updateList(state.data, action.path, (list) => moveItem(list, action.from, action.to)) };
    case 'theme':
      return { ...state, theme: action.theme };
    case 'cvLocale':
      return { ...state, cvLocale: action.locale };
    case 'bilingual':
      return {
        ...state,
        bilingual: action.value,
        // Back to one language: keep the texts of the language on screen, drop the others.
        data: action.value ? state.data : (keepLocale(state.data, state.cvLocale) as CvData),
      };
  }
}
