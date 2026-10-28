/**
 * Whether the browser can show a PDF inside the page (`<iframe>`). Android browsers have no built-in PDF viewer
 * (`navigator.pdfViewerEnabled === false`), and on touch devices without a mouse – phones, tablets – embedded PDFs
 * are unreliable (iOS shows only the first page, Chrome's mobile mode cannot frame its viewer). There the preview
 * offers to open the PDF instead.
 */
export function canEmbedPdf(
  navigatorLike: { pdfViewerEnabled?: boolean } | undefined,
  matchMedia: ((query: string) => { matches: boolean }) | undefined,
): boolean {
  if (navigatorLike?.pdfViewerEnabled === false) return false;
  if (!matchMedia) return true;
  return matchMedia('(hover: hover) and (pointer: fine)').matches;
}
