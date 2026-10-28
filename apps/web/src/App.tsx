import { LOCALES, type Locale } from '@scorrrpy/cv-engine';
import { CvStudio } from '@scorrrpy/cv-studio';
import { useEffect, useState } from 'react';
import { indexedDbStorage } from './idbStorage';

const LOCALE_KEY = 'cv-generator:locale';
const storage = indexedDbStorage();

const copy = {
  de: { tagline: 'Lebenslauf erstellen, gestalten und als PDF exportieren.', language: 'Sprache der Oberfläche' },
  en: { tagline: 'Create, design and export your CV as a PDF.', language: 'Interface language' },
} satisfies Record<Locale, unknown>;

function initialLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === 'de' || stored === 'en') return stored;
  } catch {
    /* storage blocked – fall back to the browser language */
  }
  return navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en';
}

export function App() {
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      /* preference simply isn't remembered */
    }
  }, [locale]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>CV Generator</h1>
          <p>{copy[locale].tagline}</p>
        </div>
        <label className="language">
          {copy[locale].language}
          <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
            {LOCALES.map((option) => (
              <option key={option} value={option}>
                {option === 'de' ? 'Deutsch' : 'English'}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main>
        {/* Keyed by locale so the CV language starts in the newly chosen interface language. */}
        <CvStudio key={locale} uiLocale={locale} storage={storage} />
      </main>
    </div>
  );
}
