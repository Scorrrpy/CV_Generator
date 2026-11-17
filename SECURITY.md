# Security Policy

## Supported versions

Only the latest released versions of `@scorrrpy/cv-engine` and `@scorrrpy/cv-studio`, and the current state
of the `main` branch, receive security fixes.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report them privately via GitHub instead:
[Security → Report a vulnerability](https://github.com/Scorrrpy/CV_Generator/security/advisories/new).

Please include a description of the issue, steps to reproduce it and the affected version. You can expect a
first response within a week. Once a fix is released, the advisory will be published and you will be credited
if you wish.

## Scope

CV Generator runs entirely in the browser and has no server. Relevant issues include, for example, ways for a
crafted `.cv.json` file or theme to execute code, leak data or crash the app, and anything that causes CV data
to leave the user's device.
