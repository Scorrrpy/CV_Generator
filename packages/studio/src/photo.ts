/** Longest edge of the stored portrait in pixels – plenty for print at the size the CV uses. */
const MAX_EDGE = 480;

/**
 * Reads an image file, crops it to a centred square and scales it down to a JPEG data URL,
 * so the saved CV stays small and self-contained.
 */
export async function photoToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const size = Math.min(side, MAX_EDGE);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available');
  context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.85);
}
