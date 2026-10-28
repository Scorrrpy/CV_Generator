import { Font, pdf, type DocumentProps } from '@react-pdf/renderer';
import { createElement, type ReactElement } from 'react';
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

/**
 * Validates the data and renders the CV as a PDF. Works in the browser and in Node 22+.
 * Throws `CvValidationError` if `data` or `theme` do not match the schema.
 */
export async function renderCvPdf({ data, theme = defaultTheme, locale }: RenderOptions): Promise<Blob> {
  const document = createElement(CvDocument, { data: parseCvData(data), theme: parseCvTheme(theme), locale });
  // `pdf()` is typed for a <Document> element; CvDocument renders exactly that.
  return pdf(document as unknown as ReactElement<DocumentProps>).toBlob();
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
