import { Font, pdf, type DocumentProps } from '@react-pdf/renderer';
import { createElement, type ReactElement } from 'react';
import { fitsStandardFonts } from './charset';
import { CvDocument } from './document/CvDocument';
import { parseCvData, parseCvTheme, type CvDataInput, type CvTheme, type Locale } from './schema';
import { defaultTheme } from './theme';

// Automatic hyphenation is English-only and splits German words in odd places.
Font.registerHyphenationCallback((word) => [word]);

export interface RenderOptions {
  data: CvDataInput;
  theme?: CvTheme;
  locale: Locale;
}

let fallbackFont: Promise<string> | undefined;

/** Loads and registers the fallback font once; the ~450 kB font module is only fetched on first use. */
function loadFallbackFont(): Promise<string> {
  fallbackFont ??= import('./fonts/fallback').then(({ FALLBACK_FONT_FAMILY, fallbackFontSources }) => {
    Font.register({ family: FALLBACK_FONT_FAMILY, fonts: [...fallbackFontSources] });
    return FALLBACK_FONT_FAMILY;
  });
  return fallbackFont;
}

/**
 * Validates the data and renders the CV as a PDF. Works in the browser and in Node 22+.
 * Texts with characters outside the PDF standard fonts (e.g. "√", "Łukasz", Cyrillic) are set with an embedded
 * fallback font, character by character. Throws `CvValidationError` if `data` or `theme` do not match the schema.
 */
export async function renderCvPdf({ data, theme = defaultTheme, locale }: RenderOptions): Promise<Blob> {
  const cv = parseCvData(data);
  const document = createElement(CvDocument, {
    data: cv,
    theme: parseCvTheme(theme),
    locale,
    fallbackFont: fitsStandardFonts(cv) ? undefined : await loadFallbackFont(),
  });
  // `pdf()` is typed for a <Document> element; CvDocument renders exactly that.
  return withoutBufferWarning(() => pdf(document as unknown as ReactElement<DocumentProps>).toBlob());
}

/** The ReferenceError message in Chromium / Firefox and in Safari. */
const BUFFER_WARNING = /^(Buffer is not defined|Can't find variable: Buffer)$/;

let silenced = 0;
let originalWarn: typeof console.warn | undefined;

/**
 * react-pdf 4 checks `Buffer.isBuffer(source)` after loading an image. In the browser `Buffer` does not exist,
 * so every image logs "Buffer is not defined" – although the image is already loaded at that point and
 * renders fine. While a render runs, exactly that warning is dropped; all others pass through.
 * Counted, because the studio's preview and a download may render at the same time.
 */
export async function withoutBufferWarning<T>(render: () => Promise<T>): Promise<T> {
  // Not `typeof Buffer`: the studio and app typecheck this file without Node's types.
  if ((globalThis as { Buffer?: unknown }).Buffer !== undefined) return render();
  if (silenced++ === 0) {
    originalWarn = console.warn;
    const warn = originalWarn;
    console.warn = (...args: unknown[]) => {
      if (args.length === 1 && BUFFER_WARNING.test(String(args[0]))) return;
      warn.apply(console, args);
    };
  }
  try {
    return await render();
  } finally {
    if (--silenced === 0 && originalWarn) {
      console.warn = originalWarn;
      originalWarn = undefined;
    }
  }
}

/** File name for the download, e.g. `Max_Mustermann_Lebenslauf.pdf`. */
export function cvFileName(name: string, locale: Locale): string {
  const safe = name
    .normalize('NFKD')
    .replace(/ß/g, 'ss')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${safe || 'CV'}_${locale === 'de' ? 'Lebenslauf' : 'CV'}.pdf`;
}
