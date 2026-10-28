# CV Generator

Lebenslauf im Browser erstellen, gestalten und als PDF exportieren – auf Deutsch oder Englisch.
Alles läuft lokal: Es gibt keinen Server, und deine Daten verlassen dein Gerät nicht.

## Für Nutzer

1. App im Browser öffnen. Eine Installation ist nicht nötig. Optional lässt sie sich über das
   Browser-Menü („App installieren“) wie ein Programm installieren und funktioniert dann auch offline.
2. Unter **Inhalt** die eigenen Daten eintragen, unter **Design** Farben, Schrift und Layout wählen.
   Rechts erscheint die Vorschau.
3. **PDF herunterladen** erzeugt den Lebenslauf in der oben gewählten Sprache.

**Zweisprachig pflegen:** Ist der Haken gesetzt, bekommt jeder Text eine deutsche und eine englische
Fassung. Mit dem Umschalter DE / EN wechselst du zwischen beiden; die Felder zeigen an, welche Sprache
du gerade bearbeitest.

**Wo sind meine Daten?** Die App speichert automatisch im Browser (IndexedDB). Das ist bequem, aber
nicht dauerhaft sicher: Löschst du die Browserdaten, ist auch der Lebenslauf weg. Sichere ihn deshalb
mit **Speichern** als `.cv.json`-Datei und öffne ihn später mit **Datei öffnen** wieder – auch auf
einem anderen Gerät.

## Für Entwickler

Node.js 22+, npm-Workspaces:

| Paket | Inhalt |
| --- | --- |
| `packages/engine` (`@scorrrpy/cv-engine`) | Datenmodell und Validierung (valibot), PDF-Rendering (react-pdf), Themes, Dateiformat |
| `packages/studio` (`@scorrrpy/cv-studio`) | React-Editor `<CvStudio>` mit Live-Vorschau, als Bibliothek nutzbar |
| `apps/web` | Die eigenständige PWA um das Studio, speichert in IndexedDB |

| Befehl | Zweck |
| --- | --- |
| `npm install` | Abhängigkeiten installieren |
| `npm run dev` | App unter <http://localhost:5173> |
| `npm run check` | Typecheck, Lint und alle Tests |
| `npm run build` | Engine, Studio und App bauen |

Innerhalb des Repos werden die Pakete direkt aus `src/` verwendet (`aliases.ts`), ein vorheriger Build
ist nicht nötig.

### Engine verwenden

```ts
import { renderCvPdf, type CvDataInput } from '@scorrrpy/cv-engine';

const data: CvDataInput = {
  version: 1,
  person: { name: 'Erika Musterfrau', headline: { de: 'Entwicklerin', en: 'Developer' } },
  career: [{ id: 'job', kind: 'work', title: 'Entwicklerin', organization: 'Beispiel GmbH', start: '2024-01' }],
};

const pdf: Blob = await renderCvPdf({ data, locale: 'de' }); // Browser und Node 22+
```

Texte sind entweder ein String (gilt für beide Sprachen) oder `{ de, en }`. `renderCvPdf` validiert die
Daten und wirft bei Fehlern einen `CvValidationError` mit lesbaren Meldungen (`career.0.start: …`).
Ohne `theme` gilt `defaultTheme`; Vorlagen liegen in `themePresets`.

Die PDFs nutzen die eingebauten PDF-Standardschriften (Helvetica, Times, Courier). Sie unterstützen
Umlaute und ß und brauchen keine Schriftdateien, also auch keine zusätzlichen CSP-Freigaben.

### Studio einbetten

```tsx
import { CvStudio, memoryStorage } from '@scorrrpy/cv-studio';
import '@scorrrpy/cv-studio/style.css';

<CvStudio uiLocale="de" storage={memoryStorage()} />;
```

Ohne `initialData` startet das Studio mit einem fiktiven Beispiel-Lebenslauf. Farben, Radien und
Schrift lassen sich über CSS-Variablen (`--cv-studio-accent`, `--cv-studio-surface`, …) anpassen,
siehe `packages/studio/src/components/studio.module.css`. Die Vorschau lädt das PDF als `blob:`-URL in
einen `<iframe>`; eine Seite mit CSP braucht dafür `frame-src blob:`.

### Release

Version in `packages/engine/package.json` und `packages/studio/package.json` anheben, dann einen Tag
`vX.Y.Z` pushen. Die GitHub Action `release.yml` prüft, baut und veröffentlicht beide Pakete auf npm.

Sie meldet sich per **Trusted Publishing** (OIDC) bei npm an, es gibt also keinen Token und kein Secret.
Einmalige Einrichtung:

1. **Erste Veröffentlichung von Hand**, denn npm lässt Trusted Publishing nur für bestehende Pakete zu:
   ```sh
   npm login
   npm run build
   npm publish --workspace packages/engine
   npm publish --workspace packages/studio
   ```
2. **Pro Paket** auf npmjs.com unter *Settings → Trusted Publisher → GitHub Actions* eintragen:
   Organization/User `Scorrrpy`, Repository `CV_Generator`, Workflow `release.yml`, Environment leer.
3. Optional unter *Settings → Publishing access* „Require two-factor authentication and disallow tokens“
   wählen. Dann kann nur noch dieser Workflow (oder du mit 2FA) veröffentlichen.
