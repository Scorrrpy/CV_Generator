import { afterEach, describe, expect, it, vi } from 'vitest';
import { fitsStandardFonts, isStandardFontChar } from './charset';
import { sampleCv } from './fixtures';
import { renderCvPdf, withoutBufferWarning } from './render';

const pdfText = async (blob: Blob) => Buffer.from(await blob.arrayBuffer()).toString('latin1');

describe('fitsStandardFonts', () => {
  it('accepts German, French and typographic characters', () => {
    expect(fitsStandardFonts({ a: 'Größe – „Zitat“ … 5 € · café', b: ['Œuvre', '™'] })).toBe(true);
  });

  it.each(['√', 'Ł', 'Ω', 'Ж', '→', '✓'])('rejects "%s"', (char) => {
    expect(isStandardFontChar(char)).toBe(false);
    expect(fitsStandardFonts({ nested: [{ text: `x${char}` }] })).toBe(false);
  });
});

describe('fallback font', () => {
  it('is embedded only when the CV needs it', async () => {
    const plain = await pdfText(await renderCvPdf({ data: sampleCv, locale: 'de' }));
    expect(plain).not.toContain('DejaVuSans');

    const special = { ...sampleCv, person: { ...sampleCv.person, name: 'Łukasz Żółć' }, summary: 'Quadrat- und √-Funktion' };
    const text = await pdfText(await renderCvPdf({ data: special, locale: 'de' }));
    expect(text).toContain('DejaVuSans');
    // The regular text keeps the standard font.
    expect(text).toContain('/BaseFont /Helvetica');
  }, 30_000);
});

describe('withoutBufferWarning', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('drops only react-pdf’s Buffer warning while rendering in a browser', async () => {
    vi.stubGlobal('Buffer', undefined);
    const warn = vi.fn();
    const original = console.warn;
    console.warn = warn;
    try {
      await withoutBufferWarning(async () => {
        console.warn('Buffer is not defined');
        console.warn("Can't find variable: Buffer");
        console.warn('something else');
      });
      console.warn('Buffer is not defined');
    } finally {
      console.warn = original;
    }
    expect(warn.mock.calls).toEqual([['something else'], ['Buffer is not defined']]);
  });

  it('restores console.warn only after the last of overlapping renders', async () => {
    vi.stubGlobal('Buffer', undefined);
    const original = console.warn;
    let releaseFirst!: () => void;
    const first = withoutBufferWarning(() => new Promise<void>((resolve) => (releaseFirst = resolve)));
    await withoutBufferWarning(async () => undefined);
    expect(console.warn).not.toBe(original);
    releaseFirst();
    await first;
    expect(console.warn).toBe(original);
  });
});
