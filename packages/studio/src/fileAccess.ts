/**
 * Saving and opening files. Chromium browsers get a real "Save as" dialog (File System Access API),
 * all others fall back to a plain download.
 */

interface SaveFilePickerOptions {
  suggestedName: string;
  types: { description: string; accept: Record<string, string[]> }[];
}

type WindowWithFilePicker = Window & {
  showSaveFilePicker?: (options: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
};

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Give the browser time to start the download before the URL is revoked.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Returns `false` if the user cancelled the dialog. */
export async function saveFile(blob: Blob, fileName: string, description: string): Promise<boolean> {
  const picker = (window as WindowWithFilePicker).showSaveFilePicker;
  if (!picker) {
    downloadBlob(blob, fileName);
    return true;
  }
  try {
    const extension = fileName.slice(fileName.indexOf('.'));
    const handle = await picker({ suggestedName: fileName, types: [{ description, accept: { [blob.type]: [extension] } }] });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return false;
    throw error;
  }
}
