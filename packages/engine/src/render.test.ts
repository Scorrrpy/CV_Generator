import { describe, expect, it } from 'vitest';
import { sampleCv } from './fixtures';
import { renderCvPdf } from './render';
import { CvValidationError } from './schema';
import { themePresets } from './theme';

async function pdfText(blob: Blob): Promise<string> {
  return Buffer.from(await blob.arrayBuffer()).toString('latin1');
}

describe('renderCvPdf', () => {
  it.each([
    ['de', 'sidebar'],
    ['en', 'classic'],
  ] as const)('renders a %s PDF with the %s layout', async (locale, layout) => {
    const theme = { ...themePresets.navy, layout };
    const text = await pdfText(await renderCvPdf({ data: sampleCv, theme, locale }));
    expect(text.startsWith('%PDF-')).toBe(true);
    expect(text.match(/\/Type \/Page\b/g)).toHaveLength(1);
  }, 30_000);

  it('renders a CV with nothing but a name', async () => {
    const blob = await renderCvPdf({ data: { version: 1, person: { name: 'Erika Musterfrau' } }, locale: 'de' });
    expect(blob.size).toBeGreaterThan(0);
  }, 30_000);

  it('validates the data before rendering', async () => {
    await expect(renderCvPdf({ data: { version: 1 } as never, locale: 'de' })).rejects.toThrow(CvValidationError);
  });
});
