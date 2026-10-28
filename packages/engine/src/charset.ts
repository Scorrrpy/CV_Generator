/**
 * The PDF standard fonts (Helvetica, Times, Courier) use WinAnsiEncoding: ASCII, Latin-1 and these
 * extra characters of Windows-1252. Everything else needs the embedded fallback font.
 */
const WIN_ANSI_EXTRAS = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');

export function isStandardFontChar(char: string): boolean {
  const codePoint = char.codePointAt(0)!;
  return (
    codePoint === 0x09 ||
    codePoint === 0x0a ||
    (codePoint >= 0x20 && codePoint <= 0x7e) ||
    (codePoint >= 0xa0 && codePoint <= 0xff) ||
    WIN_ANSI_EXTRAS.has(char)
  );
}

/** True if every string in `value` (nested objects and arrays included) can be set in a standard font. */
export function fitsStandardFonts(value: unknown): boolean {
  if (typeof value === 'string') {
    for (const char of value) if (!isStandardFontChar(char)) return false;
    return true;
  }
  if (Array.isArray(value)) return value.every(fitsStandardFonts);
  if (value !== null && typeof value === 'object') return Object.values(value).every(fitsStandardFonts);
  return true;
}
