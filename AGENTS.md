# Project Rules: Low-Usage Frontend Work

This repo is a photography portfolio frontend. Usage-heavy visual work should be manual-by-default unless the user explicitly asks Codex to run it.

## Usage Budget

- Prefer targeted source inspection, scoped edits, and one `npm run build`.
- Avoid repeated browser screenshots, scroll loops, external-site inspections, and server restart cycles.
- Do not keep trying to visually tune subjective motion through many automated browser passes.
- After implementing visual or motion changes, provide a short manual QA checklist for the user.

## Manual-by-Default Tasks

- Comparing animation feel against `photoyoshi.com`.
- Testing many scroll speeds, trackpads, mobile gestures, or viewport sizes.
- Restarting/killing local servers when approval is needed.
- Frame-by-frame animation analysis or performance profiling.
- Repeated reference-site browsing once behavior notes already exist.

## Preferred Workflow

1. Reuse existing notes about the desired Photoyoshi-like UX.
2. Inspect only the local files needed for the change.
3. Patch the smallest relevant component/style surface.
4. Run `npm run build` once.
5. Tell the user what to manually check at `http://localhost:3001/`.

## Manual QA Template

When finishing frontend motion work, include:

- URL to open.
- Gestures to try.
- Expected difference.
- What detail the user should report if it still feels wrong.
