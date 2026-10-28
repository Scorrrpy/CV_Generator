# @scorrrpy/cv-studio

React editor for CVs: forms, theme editor with contrast check, live PDF preview, JSON import / export.
Built on [@scorrrpy/cv-engine](https://www.npmjs.com/package/@scorrrpy/cv-engine).

```tsx
import { CvStudio, memoryStorage } from '@scorrrpy/cv-studio';
import '@scorrrpy/cv-studio/style.css';

<CvStudio uiLocale="en" storage={memoryStorage()} />;
```

Restyle it with the `--cv-studio-*` custom properties (accent, surface, border, text, radius, font, …).
The preview loads the PDF from a `blob:` URL into an `<iframe>`, so a Content Security Policy needs
`frame-src blob:`.

Part of [CV Generator](https://github.com/Scorrrpy/CV_Generator) – MIT licensed.
