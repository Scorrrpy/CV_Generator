# CV Generator

[![CI](https://github.com/Scorrrpy/CV_Generator/actions/workflows/ci.yml/badge.svg)](https://github.com/Scorrrpy/CV_Generator/actions/workflows/ci.yml)
[![npm: cv-engine](https://img.shields.io/npm/v/@scorrrpy/cv-engine?label=%40scorrrpy%2Fcv-engine)](https://www.npmjs.com/package/@scorrrpy/cv-engine)
[![npm: cv-studio](https://img.shields.io/npm/v/@scorrrpy/cv-studio?label=%40scorrrpy%2Fcv-studio)](https://www.npmjs.com/package/@scorrrpy/cv-studio)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Write and design a CV in the browser and export it as a PDF, in German or English.
Everything runs locally: there is no server, and your data never leaves your device.

🇩🇪 [Deutsche Version](README.de.md)

## Features

- **Private by design:** no backend, no account, no tracking. Data is stored in the browser and in files you save.
- **Bilingual:** keep every text in German and English and export either language.
- **Live PDF preview** while you edit, with theme presets, colours, fonts and layout options.
- **Installable and offline-capable** (PWA).
- **Reusable building blocks:** the PDF engine and the editor are published as separate npm packages.

## For users

1. Open the app in your browser. No installation is required. If you like, install it from the browser
   menu ("Install app"); it then works offline as well.
2. Enter your details under **Content**, then choose colours, font and layout under **Design**.
   The preview appears on the right.
3. **Download PDF** creates the CV in the language selected at the top.

**Bilingual editing:** when the checkbox is ticked, every text gets a German and an English version.
Switch between them with the DE / EN toggle; the fields show which language you are editing.

**Where is my data?** The app saves automatically in the browser (IndexedDB). That is convenient but not
permanent: clearing your browser data also deletes your CV. Back it up with **Save** as a `.cv.json` file
and open it again later with **Open file**, on any device.

## For developers

Node.js 22+, npm workspaces:

| Package | Contents |
| --- | --- |
| `packages/engine` ([`@scorrrpy/cv-engine`](packages/engine)) | Data model and validation (valibot), PDF rendering (react-pdf), themes, file format |
| `packages/studio` ([`@scorrrpy/cv-studio`](packages/studio)) | React editor `<CvStudio>` with live preview, usable as a library |
| `apps/web` | The standalone PWA around the studio, stores data in IndexedDB |

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | App at <http://localhost:5173> |
| `npm run check` | Typecheck, lint and all tests |
| `npm run build` | Build engine, studio and app |

Inside the repo the packages are used straight from `src/` (`aliases.ts`), so no prior build is needed.

### Using the engine

```ts
import { renderCvPdf, type CvDataInput } from '@scorrrpy/cv-engine';

const data: CvDataInput = {
  version: 1,
  person: { name: 'Erika Musterfrau', headline: { de: 'Entwicklerin', en: 'Developer' } },
  career: [{ id: 'job', kind: 'work', title: 'Developer', organization: 'Example Ltd', start: '2024-01' }],
};

const pdf: Blob = await renderCvPdf({ data, locale: 'en' }); // browser and Node 22+
```

Texts are either a string (used for both languages) or `{ de, en }`. `renderCvPdf` validates the data and
throws a `CvValidationError` with readable messages (`career.0.start: …`) if it is invalid.
Without `theme`, `defaultTheme` applies; presets are in `themePresets`.

**Fonts:** text is set in the built-in PDF standard fonts (Helvetica, Times, Courier). They only cover
Western European characters (WinAnsi). If a CV contains other characters – `π`, `√`, `Łukasz`, Greek,
Cyrillic, arrows, symbols – the engine loads an embedded fallback font once (DejaVu Sans, subset, ~330 kB
gzip as a separate chunk) and sets only those characters in it; all other text keeps the chosen font. The
font is embedded as a `data:` URL: no network request, no Content Security Policy entry needed.
The character ranges are defined in `packages/engine/scripts/subset-fallback-font.mjs`; after changing them,
`npm run fonts --workspace packages/engine` regenerates the font files (licence: `src/fonts/LICENSE-DejaVu.txt`).

### Embedding the studio

```tsx
import { CvStudio, memoryStorage } from '@scorrrpy/cv-studio';
import '@scorrrpy/cv-studio/style.css';

<CvStudio uiLocale="en" storage={memoryStorage()} />;
```

Without `initialData` the studio starts with a fictional sample CV. Colours, radii and font can be adjusted
with CSS custom properties (`--cv-studio-accent`, `--cv-studio-surface`, …), see
`packages/studio/src/components/studio.module.css`. The preview loads the PDF from a `blob:` URL into an
`<iframe>`, so a page with a Content Security Policy needs `frame-src blob:`.

### Release

Bump the version in `packages/engine/package.json` and `packages/studio/package.json`, then push a tag
`vX.Y.Z`. The GitHub Action `release.yml` checks, builds and publishes both packages to npm.

It authenticates with npm via **Trusted Publishing** (OIDC), so there is no token and no secret.
One-time setup:

1. **Publish the first version by hand**, because npm only allows Trusted Publishing for existing packages:
   ```sh
   npm login
   npm run build
   npm publish --workspace packages/engine
   npm publish --workspace packages/studio
   ```
2. **For each package**, on npmjs.com under *Settings → Trusted Publisher → GitHub Actions*, enter:
   Organization/User `Scorrrpy`, Repository `CV_Generator`, Workflow `release.yml`, Environment empty.
3. Optionally, under *Settings → Publishing access*, choose "Require two-factor authentication and
   disallow tokens". Then only this workflow (or you with 2FA) can publish.

## Contributing

Bug reports, ideas and pull requests are welcome – see [CONTRIBUTING.md](CONTRIBUTING.md).
For security issues, please follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## License

[MIT](LICENSE) © David Roßkopf. The bundled DejaVu Sans subset is under its own
[licence](packages/engine/src/fonts/LICENSE-DejaVu.txt).
