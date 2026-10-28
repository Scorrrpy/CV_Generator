import type { CvTheme } from './schema';

export const defaultTheme: CvTheme = {
  colors: {
    primary: '#1f2a44',
    accent: '#c2410c',
    text: '#1f2937',
    muted: '#5b6472',
    background: '#ffffff',
    sidebar: '#1f2a44',
    sidebarText: '#f3f4f6',
  },
  font: 'Helvetica',
  layout: 'sidebar',
  showPhoto: true,
};

/** Starting points for the theme editor. All of them pass the contrast check (see `theme.test.ts`). */
export const themePresets = {
  navy: defaultTheme,
  forest: {
    ...defaultTheme,
    colors: {
      primary: '#14532d',
      accent: '#15803d',
      text: '#1c1917',
      muted: '#57534e',
      background: '#ffffff',
      sidebar: '#14532d',
      sidebarText: '#f0fdf4',
    },
  },
  berry: {
    ...defaultTheme,
    colors: {
      primary: '#831843',
      accent: '#be185d',
      text: '#1f2937',
      muted: '#5b6472',
      background: '#ffffff',
      sidebar: '#fdf2f8',
      sidebarText: '#3b0a22',
    },
  },
  mono: {
    ...defaultTheme,
    font: 'Times-Roman',
    layout: 'classic',
    colors: {
      primary: '#111111',
      accent: '#444444',
      text: '#111111',
      muted: '#555555',
      background: '#ffffff',
      sidebar: '#f4f4f4',
      sidebarText: '#111111',
    },
  },
} satisfies Record<string, CvTheme>;

export type ThemePresetId = keyof typeof themePresets;

/** Colour pairs that carry text, with the minimum contrast they need. */
export function themeContrastPairs(theme: CvTheme): { id: string; foreground: string; background: string }[] {
  const { colors } = theme;
  const pairs = [
    { id: 'text', foreground: colors.text, background: colors.background },
    { id: 'muted', foreground: colors.muted, background: colors.background },
    { id: 'primary', foreground: colors.primary, background: colors.background },
    { id: 'accent', foreground: colors.accent, background: colors.background },
  ];
  if (theme.layout === 'sidebar') {
    pairs.push({ id: 'sidebarText', foreground: colors.sidebarText, background: colors.sidebar });
  }
  return pairs;
}
