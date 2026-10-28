# @scorrrpy/cv-engine

Data model, validation and PDF rendering for CVs in German and English. Runs in the browser and in Node 22+.

```ts
import { renderCvPdf } from '@scorrrpy/cv-engine';

const pdf: Blob = await renderCvPdf({
  data: {
    version: 1,
    person: { name: 'Erika Musterfrau', headline: { de: 'Entwicklerin', en: 'Developer' } },
    career: [{ id: 'job', kind: 'work', title: 'Developer', organization: 'Example Ltd', start: '2024-01' }],
  },
  locale: 'en',
});
```

Texts are either a string (used for both languages) or `{ de, en }`. Invalid data throws a
`CvValidationError` with readable messages. Themes: `defaultTheme`, `themePresets`.

Text is set in the PDF standard fonts. Characters they lack (`π`, `Ł`, Greek, Cyrillic, arrows, symbols) are
taken from an embedded, subset DejaVu Sans, which is only loaded when a CV contains such characters. It is
inlined as a data URL, so no network request and no Content Security Policy entry is needed.

Part of [CV Generator](https://github.com/Scorrrpy/CV_Generator) – MIT licensed.
