// DejaVu Sans, cut down to the blocks a CV needs (see scripts/subset-fallback-font.mjs, license in
// LICENSE-DejaVu.txt). Inlined as data URLs: react-pdf decodes them itself, so there is no fetch – no CSP
// entry, no hosting of font files by the consumer. This module is only imported when a CV needs it.
import bold from './DejaVuSans-Bold-Subset.ttf?inline';
import regular from './DejaVuSans-Subset.ttf?inline';

export const FALLBACK_FONT_FAMILY = 'DejaVu Sans';

export const fallbackFontSources = [
  { src: regular, fontWeight: 'normal' },
  { src: bold, fontWeight: 'bold' },
] as const;
