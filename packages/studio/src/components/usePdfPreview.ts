import { CvValidationError, renderCvPdf, type CvData, type CvTheme, type Locale } from '@scorrrpy/cv-engine';
import { useEffect, useRef, useState } from 'react';

/** Waits for a pause in typing before the PDF is rendered again. */
const DEBOUNCE_MS = 500;

export interface PdfPreview {
  /** Object URL of the last successful render – kept while a newer render fails. */
  url?: string;
  busy: boolean;
  /** Validation messages of the current data, if it cannot be rendered. */
  issues?: string[];
  failed?: boolean;
}

export function usePdfPreview(data: CvData, theme: CvTheme, locale: Locale): PdfPreview {
  const [preview, setPreview] = useState<PdfPreview>({ busy: true });
  const urlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setPreview((current) => ({ ...current, busy: true }));
      try {
        const blob = await renderCvPdf({ data, theme, locale });
        if (cancelled) return;
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(blob);
        setPreview({ url: urlRef.current, busy: false });
      } catch (error) {
        if (cancelled) return;
        const issues = error instanceof CvValidationError ? error.issues : undefined;
        setPreview((current) => ({ url: current.url, busy: false, issues, failed: !issues }));
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data, theme, locale]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return preview;
}
