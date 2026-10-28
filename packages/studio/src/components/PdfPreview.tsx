import { useState } from 'react';
import { canEmbedPdf } from './pdfEmbedding';
import { useStudio } from './StudioContext';
import styles from './studio.module.css';
import { usePdfPreview } from './usePdfPreview';

/**
 * Live preview of the PDF in the browser's own PDF viewer. Where PDFs cannot be shown inside the page
 * (phones, tablets), it offers to open the PDF in the device's viewer instead.
 */
export function PdfPreview() {
  const { state, ui } = useStudio();
  const preview = usePdfPreview(state.data, state.theme, state.cvLocale);
  const [embed] = useState(() =>
    canEmbedPdf(globalThis.navigator, typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : undefined),
  );

  return (
    <section className={styles.preview} aria-label={ui.preview.title} aria-busy={preview.busy}>
      <div className={styles.previewHeader}>
        <h2>{ui.preview.title}</h2>
        {embed && preview.url && (
          <a href={preview.url} target="_blank" rel="noreferrer" className={styles.linkButton}>
            {ui.preview.openInTab}
          </a>
        )}
      </div>

      {(preview.issues || preview.failed) && (
        <div className={styles.issues} role="alert">
          <p>{preview.failed ? ui.errors.pdf : ui.preview.invalid}</p>
          {preview.issues && (
            <ul>
              {preview.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {embed ? (
        <div className={styles.frame}>
          {preview.url ? (
            <iframe title={ui.preview.title} src={`${preview.url}#toolbar=0&navpanes=0&view=FitH`} />
          ) : (
            <p className={styles.hint}>{ui.preview.rendering}</p>
          )}
        </div>
      ) : (
        <div className={styles.external}>
          <p className={styles.hint}>{ui.preview.notEmbeddable}</p>
          {preview.url ? (
            <a href={preview.url} target="_blank" rel="noreferrer" className={`${styles.button} ${styles.primary}`}>
              {ui.preview.open}
            </a>
          ) : (
            <p className={styles.hint}>{ui.preview.rendering}</p>
          )}
        </div>
      )}
    </section>
  );
}
