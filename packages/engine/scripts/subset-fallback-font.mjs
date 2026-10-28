/**
 * Generates the fallback font of the PDF engine: DejaVu Sans (regular + bold), cut down to the Unicode
 * blocks a CV realistically needs. The PDF standard fonts only cover Western European characters (WinAnsi);
 * everything else – "√", "Łukasz", Greek, Cyrillic – is taken from this font, glyph by glyph.
 *
 * Run after changing the ranges: `npm run fonts --workspace packages/engine`. The output is committed.
 */
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const require = createRequire(import.meta.url);
const source = dirname(require.resolve('dejavu-fonts-ttf/package.json'));
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'fonts');

/** Unicode blocks to keep, as [first, last] code points. */
const RANGES = [
  [0x0020, 0x007e], // Basic Latin
  [0x00a0, 0x024f], // Latin-1 Supplement, Latin Extended-A/B (Polish, Czech, Turkish, Romanian, …)
  [0x0370, 0x03ff], // Greek
  [0x0400, 0x04ff], // Cyrillic
  [0x1e00, 0x1eff], // Latin Extended Additional (Vietnamese, …)
  [0x2000, 0x206f], // General Punctuation
  [0x20a0, 0x20cf], // Currency Symbols
  [0x2100, 0x214f], // Letterlike Symbols (™, №, …)
  [0x2150, 0x218f], // Number Forms (⅓, Ⅻ, …)
  [0x2190, 0x21ff], // Arrows
  [0x2200, 0x22ff], // Mathematical Operators (√, ≈, ≠, …)
  [0x2300, 0x23ff], // Miscellaneous Technical (⌘, ⏎, …)
  [0x25a0, 0x25ff], // Geometric Shapes (■, ●, …)
  [0x2600, 0x26ff], // Miscellaneous Symbols (★, ☎, …)
  [0x2700, 0x27bf], // Dingbats (✓, ✗, …)
];

const text = RANGES.flatMap(([first, last]) =>
  Array.from({ length: last - first + 1 }, (_, index) => String.fromCodePoint(first + index)),
).join('');

for (const [input, output] of [
  ['DejaVuSans.ttf', 'DejaVuSans-Subset.ttf'],
  ['DejaVuSans-Bold.ttf', 'DejaVuSans-Bold-Subset.ttf'],
]) {
  // Hinting only helps screen rasterizers at small pixel sizes; in a PDF it is dead weight (about half the file).
  const subset = await subsetFont(readFileSync(join(source, 'ttf', input)), text, {
    targetFormat: 'truetype',
    noHinting: true,
  });
  writeFileSync(join(out, output), subset);
  console.log(`${output}: ${(subset.length / 1024).toFixed(0)} kB`);
}

// The DejaVu / Bitstream Vera license must accompany every copy of the font.
copyFileSync(join(source, 'LICENSE'), join(out, 'LICENSE-DejaVu.txt'));
