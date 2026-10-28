import {
  CV_FILE_EXTENSION,
  cvFileName,
  defaultTheme,
  LOCALES,
  parseCvFile,
  renderCvPdf,
  sampleCv,
  serializeCvFile,
  type CvData,
  type CvTheme,
  type Locale,
} from '@scorrrpy/cv-engine';
import { useEffect, useId, useMemo, useReducer, useRef, useState } from 'react';
import { ContentEditor } from './components/ContentEditor';
import { PdfPreview } from './components/PdfPreview';
import { StudioContext } from './components/StudioContext';
import styles from './components/studio.module.css';
import { ThemeEditor } from './components/ThemeEditor';
import { saveFile } from './fileAccess';
import { messages } from './i18n';
import { createStudioState, emptyCv, studioReducer } from './state/studioReducer';
import { memoryStorage, type CvStorage } from './storage';

const SAVE_DEBOUNCE_MS = 400;

export interface CvStudioProps {
  /** Language of the editor itself. The CV language is chosen inside the studio and starts with it. */
  uiLocale: Locale;
  /** Shown on the first visit (nothing in `storage` yet). Defaults to a fictional sample CV. */
  initialData?: CvData;
  initialTheme?: CvTheme;
  /** Where the working state survives reloads. Defaults to memory only. */
  storage?: CvStorage;
  className?: string;
}

export function CvStudio({
  uiLocale,
  initialData = sampleCv,
  initialTheme = defaultTheme,
  storage: storageProp,
  className,
}: CvStudioProps) {
  const ui = messages[uiLocale];
  const [storage] = useState(() => storageProp ?? memoryStorage());
  const [state, dispatch] = useReducer(studioReducer, undefined, () =>
    createStudioState(initialData, initialTheme, uiLocale),
  );
  const [tab, setTab] = useState<'content' | 'design'>('content');
  const [error, setError] = useState<string>();
  const loaded = useRef(false);
  const fileInputId = useId();
  const bilingualHintId = useId();

  // Restore the last working state once, then save every change after a short pause.
  useEffect(() => {
    let cancelled = false;
    storage
      .load()
      .then((stored) => {
        if (!cancelled && stored) dispatch({ type: 'load', data: stored.data, theme: stored.theme });
      })
      .catch(() => undefined)
      .finally(() => {
        loaded.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  useEffect(() => {
    if (!loaded.current) return;
    const timer = setTimeout(() => void storage.save({ data: state.data, theme: state.theme }), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [storage, state.data, state.theme]);

  const context = useMemo(() => ({ state, dispatch, ui }), [state, ui]);
  const baseName = cvFileName(state.data.person.name, state.cvLocale).replace(/\.pdf$/, '');

  const run = async (task: () => Promise<unknown>, message: string) => {
    setError(undefined);
    try {
      await task();
    } catch {
      setError(message);
    }
  };

  const downloadPdf = () =>
    run(async () => {
      const blob = await renderCvPdf({ data: state.data, theme: state.theme, locale: state.cvLocale });
      await saveFile(blob, `${baseName}.pdf`, 'PDF');
    }, ui.errors.pdf);

  const saveJson = () =>
    run(async () => {
      const blob = new Blob([serializeCvFile(state.data, state.theme)], { type: 'application/json' });
      await saveFile(blob, `${baseName}${CV_FILE_EXTENSION}`, ui.title);
    }, ui.errors.save);

  const openJson = (file: File) =>
    run(async () => {
      const { data, theme } = parseCvFile(await file.text());
      dispatch({ type: 'load', data, theme });
    }, ui.errors.open);

  return (
    <StudioContext.Provider value={context}>
      <div className={className ? `${styles.studio} ${className}` : styles.studio} lang={uiLocale}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup} role="group" aria-label={ui.toolbar.cvLanguage}>
            <span className={styles.toolbarLabel}>{ui.toolbar.cvLanguage}</span>
            <div className={styles.segmented}>
              {LOCALES.map((locale) => (
                <button
                  key={locale}
                  type="button"
                  aria-pressed={state.cvLocale === locale}
                  onClick={() => dispatch({ type: 'cvLocale', locale })}
                >
                  {locale.toUpperCase()}
                </button>
              ))}
            </div>
            <label className={styles.checkbox} title={ui.toolbar.bilingualHint}>
              <input
                type="checkbox"
                checked={state.bilingual}
                aria-describedby={bilingualHintId}
                onChange={(event) => dispatch({ type: 'bilingual', value: event.target.checked })}
              />
              {ui.toolbar.bilingual}
            </label>
            <span id={bilingualHintId} className={styles.visuallyHidden}>
              {ui.toolbar.bilingualHint}
            </span>
          </div>

          <div className={styles.toolbarGroup}>
            <label htmlFor={fileInputId} className={styles.button}>
              {ui.toolbar.open}
            </label>
            <input
              id={fileInputId}
              type="file"
              accept=".json,application/json"
              className={styles.visuallyHidden}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void openJson(file);
              }}
            />
            <button type="button" className={styles.button} onClick={() => void saveJson()}>
              {ui.toolbar.save}
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                if (window.confirm(ui.toolbar.resetConfirm)) dispatch({ type: 'load', data: emptyCv(), theme: state.theme });
              }}
            >
              {ui.toolbar.reset}
            </button>
            <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => void downloadPdf()}>
              {ui.toolbar.download}
            </button>
          </div>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.layout}>
          <div className={styles.editor}>
            <div className={styles.tabs} role="tablist">
              {(['content', 'design'] as const).map((id) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
                  {ui.tabs[id]}
                </button>
              ))}
            </div>
            <div role="tabpanel">{tab === 'content' ? <ContentEditor /> : <ThemeEditor />}</div>
            <p className={styles.hint}>{ui.privacy}</p>
          </div>
          <PdfPreview />
        </div>
      </div>
    </StudioContext.Provider>
  );
}
