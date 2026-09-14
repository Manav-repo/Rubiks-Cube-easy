# Cube Easy desktop redesign — 2026-09-14

## Correction to earlier scope

PR #6 previously contained completion-card work and desktop copy/rename fixes, but did not contain the complete desktop visual redesign. The deployed GitHub Pages main still used the old desktop layout. This change adds the desktop presentation itself; it does not merge main.

## Implementation

- `dist/desktop-design.css`: desktop-only two-column workspace; Cube Easy wordmark and social header; single mode row; current task status inside cube panel; painter/playback beside cube; remove visible marketing introduction and duplicate navigation CTA; monochrome light/dark surfaces; responsive net sizing. Learn retains its functional lesson, stage and move controls.
- `dist/js/mobile-presentation.js`: move the original status and support elements into their desktop positions, preserving their IDs and event handlers. Existing mobile playback placement stays intact.
- `dist/index.html`: load desktop stylesheet, refresh presentation-script cache key, and use Cube Easy page title.
- Existing completion card remains one light-colored card in both themes, with the supplied BMC/Mail/close assets, camera image, support and feedback choices.

## Verification

- `tests/desktop-design.cjs`: 24 layout cases passed: 768, 1024, 1440 and 1920 × light/dark × Learn/painter/playback. Verified single mode row, no horizontal overflow, no panel/mode overlap, correct header support placement and hidden legacy header/marketing/duplicate CTA. Screenshots and measured rectangles: `tests/desktop-design-evidence/`.
- Desktop copy sweep: `tests/desktop-copy.cjs`, with saved Learn heading/body results and painter/playback screenshots in `tests/desktop-evidence/`. Correct painter heading and distinct playback instruction retained.
- `tests/completion-card-ui.cjs`: eight viewport/theme combinations passed, including actual completion trigger, optional feedback, mobile modal/desktop side-panel behavior, SVG identity and decoding, icon line-height/4px gap, light card in dark mode, and overflow checks. Screenshot/results evidence in `tests/completion-evidence/`.
- Protected source comparisons passed: cube view, layout/camera code, lessons, stage planner, solver worker, vendor cube and theme unchanged; application changes remain limited to earlier copy assignments. No cube mechanics, move notation or saved-progress schema changed.
- Core: 323 checks; app state: 62 checks; playback: 18 move geometries and timing checks passed.

## Review deployment

The existing separate public Sites URL is used for review: https://cube-brainiac.manav-uix.chatgpt.site
The Sites source commit is `4d6ce487cef5967773197bb0924e4ecc4be5c264`, containing the same `dist/` files as this branch. GitHub Pages remains on GitHub main. Repository visibility has not been changed in this work. Review approval is required before merging main.

Final mobile regression: `tests/mobile-design-flow.cjs` passed with fresh storage at 375×667, 390×844 and 360×800. Each completed all seven Learn stages and recalls, painter/solver/playback checklist, camera pan and device-theme checks with no page errors. Evidence: `tests/design-evidence/flow-checklist.json` and screenshots. `git diff --check` passed. Case-insensitive current tracked file-content/filename search found zero old-agent-brand matches; Git history is not rewritten.
