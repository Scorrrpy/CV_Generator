import { describe, expect, it } from 'vitest';
import { canEmbedPdf } from './pdfEmbedding';

const media = (finePointer: boolean) => () => ({ matches: finePointer });

describe('canEmbedPdf', () => {
  it('embeds on desktops with a PDF viewer and a mouse', () => {
    expect(canEmbedPdf({ pdfViewerEnabled: true }, media(true))).toBe(true);
  });

  it('does not embed without a built-in PDF viewer (Android)', () => {
    expect(canEmbedPdf({ pdfViewerEnabled: false }, media(true))).toBe(false);
  });

  it('does not embed on touch devices without a mouse (phones, tablets)', () => {
    expect(canEmbedPdf({ pdfViewerEnabled: true }, media(false))).toBe(false);
  });

  it('embeds when the browser tells nothing (older browsers, tests)', () => {
    expect(canEmbedPdf({}, undefined)).toBe(true);
    expect(canEmbedPdf(undefined, undefined)).toBe(true);
  });
});
