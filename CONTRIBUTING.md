# Contributing

Thanks for your interest in CV Generator! Bug reports, ideas and pull requests are all welcome.
Issues may be written in English or German.

## Reporting bugs and suggesting features

- Search the [existing issues](https://github.com/Scorrrpy/CV_Generator/issues) first.
- Use the issue templates. For rendering bugs, a minimal `.cv.json` file that reproduces the problem helps
  most – **please remove or replace any real personal data before attaching it.**
- For security issues, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Development setup

Requires Node.js 22 or newer.

```sh
npm install
npm run dev     # app at http://localhost:5173
npm run check   # typecheck, lint and all tests – must pass before a PR is merged
```

The repo is an npm workspace:

- `packages/engine` – data model, validation and PDF rendering (no UI)
- `packages/studio` – the React editor, built on the engine
- `apps/web` – the installable web app around the studio

Inside the repo the packages are resolved from `src/` (see `aliases.ts`), so you don't need to build them first.

## Pull requests

1. For larger changes, open an issue first so we can agree on the approach.
2. Create a branch from `main` and keep the PR focused on one topic.
3. Add or update tests for behaviour you change (Vitest, files next to the code as `*.test.ts(x)`).
4. Run `npm run check` locally; CI runs the same command plus `npm run build`.
5. If you change the public API of `@scorrrpy/cv-engine` or `@scorrrpy/cv-studio`, update the package README
   and mention the change in the PR description.

## Guidelines

- **Privacy first:** the app has no backend and must not send CV data anywhere. Don't add analytics,
  remote fonts, CDNs or other network requests.
- **Both languages:** user-facing texts exist in German and English (`packages/studio/src/i18n.ts`,
  `packages/engine/src/labels.ts`). Please add both; if you can't, say so in the PR and we'll fill in the other.
- **Schema changes:** the data model in `packages/engine/src/schema.ts` is the single source of truth and
  defines the saved file format. Changes must stay compatible with existing `.cv.json` files.
- Code, comments and commit messages are in English.

## Conduct

Be kind and constructive. This project follows the spirit of the
[Contributor Covenant](https://www.contributor-covenant.org/); harassment or abusive behaviour is not tolerated.

## Licence

By contributing, you agree that your contributions are licensed under the project's [MIT License](LICENSE).
