/** WCAG 2 helpers, used to warn about unreadable colour combinations. */

export function parseHex(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`Invalid colour: "${hex}"`);
  const [, r, g, b] = match;
  return [parseInt(r!, 16), parseInt(g!, 16), parseInt(b!, 16)];
}

/** Relative luminance (0 = black, 1 = white). */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between 1 and 21. Body text needs at least 4.5 (WCAG AA). */
export function contrastRatio(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

export const MIN_TEXT_CONTRAST = 4.5;
