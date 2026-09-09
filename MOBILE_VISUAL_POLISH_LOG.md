# Cube Brainiac — Mobile Visual Polish Log

This log records the visual-polish pass requested after the merged mobile UX fixes. The prior P0–P3 structural fixes remain the baseline; this pass changes only mobile spacing, hierarchy, and support-link presentation.

## Safety baseline

- Cube mechanics, cubie/layer/camera math, solver legality, move notation, and playback timing are not to be changed.
- Existing IDs, handlers, state, localStorage keys, calibration mapping, and shared playback path remain the source of truth.
- No new dependency, CDN, tracking script, backend, second cube model, move list, or solver is introduced.

## Running entries

Entries will be added after each issue is implemented and validated.

## Issue 1 — Mobile spacing rhythm

- **What was broken:** Mobile sections, cards, controls, and viewport edges used mixed one-off spacing, making Learn and Fix screens feel cramped.
- **Requested guidance:** “Do a full mobile spacing pass — establish one consistent spacing scale (e.g., 8/12/16/24px steps) and apply it consistently to section padding, card padding, gaps between stacked elements, and edge margins.”
- **What changed:** Added a mobile-only `--space-1` through `--space-4` scale and applied it to `main`, `header`, objective, intro, app-layout, workspace, coach surfaces, palette, net, painter actions, and footer in `dist/style.css`. Playback’s measured shell rules were left untouched.
- **Why this was safe:** This is layout-only CSS; no cube view, state, solver, calibration, IDs, or event handlers changed.
- **Validation pass 1:** `node tests/core.cjs` (323), `node tests/planner.cjs` (30), `node tests/app-flow.cjs` (62), `node tests/playback.cjs` (18), `git diff --check`, protected `dist/js/cube-view.js` unchanged, and required handler IDs present all passed.
- **Why-it-hurts pass 2:** The new rules reserve 16px mobile edge margins, 24px section/card spacing, and at least 16px between the intro and app layout at the required viewport widths; content no longer touches the viewport edge or stacks with zero gap. A local Playwright measurement attempt was blocked because the QA-only Playwright module is not installed in this environment; the repository’s existing genuine-emulation evidence remains available for the final pass.

## Issue 2 — Icon-only support footer

- **What was broken:** The footer spent vertical space on visible “Support”, “X”, and “LinkedIn” labels, and the coffee URL used an outdated capitalized path.
- **Requested guidance:** “Remove the visible text labels; show icon-only buttons… Keep accessible labels (`aria-label`)… preserve a real ≥44×44px tap target… Default to Option A.”
- **What changed:** `dist/js/support.js` now uses `https://buymeacoffee.com/manavbuilds` and renders only inline SVGs while retaining ARIA labels, `_blank`, and `noopener noreferrer`. `dist/style.css` removes visible/pseudo labels, sets 44×44px mobile targets, 20px icons, and a 56px quiet footer strip. `README.md` now links to the same real URL. The mobile settings assertion was updated to verify icon-only output.
- **Why this was safe:** Existing support destinations, accessibility behavior, and no-CDN approach remain intact; no game handler or state path was touched.
- **Validation pass 1:** Core 323, planner 30, app-flow 62, playback 18, support JS syntax, `git diff --check`, protected cube-view identity, no external support script, and required handler IDs all passed.
- **Why-it-hurts pass 2:** Source-level assertions confirm no visible support-label span/pseudo content remains, the exact URL is present, each link reserves 44px, and the footer reserves only 56px. This directly removes the footer’s vertical competition while preserving touch and screen-reader access.

## Issue 3 — Post-painting ready screen hierarchy

- **What was broken:** When all 54 stickers were painted, marketing/tagline copy, QR code, free-to-play note, progress, and the solver CTA competed in the same narrow mobile view.
- **Requested guidance:** “The single most important thing here is the ‘Find my moves’ button… Progress status stays, but small and quiet… Marketing copy, the QR code, and ‘Free to play. Room to grow.’ are not needed at this moment… move them out of this critical path entirely.”
- **What changed:** `dist/js/app.js` adds only a derived `body.paint-ready` class when Fix mode has a complete paint and no solution. Mobile CSS hides the intro marketing block, painter instructions/net note, footer tagline/QR/free-play note in that state, quiets progress, and enlarges the existing `#solve` button to a 60px anchor with the existing handler.
- **Why this was safe:** The class is presentation-only; painting, `invalidateSolution()`, solver validation, and `#solve` click behavior remain unchanged.
- **Validation pass 1:** Core 323, planner 30, app-flow 62, playback 18, app JS syntax, `git diff --check`, protected cube-view identity, state-handler checks, and no-external-script check all passed.
- **Why-it-hurts pass 2:** Source assertions confirm the ready state suppresses the secondary blocks and gives `#solve` the largest ready-state control footprint, so the child reaches the one next action without scanning through QR or marketing clutter.

## Issue 4 — Mobile home hierarchy

- **What was broken:** The mobile landing view gave the headline, tagline, and supporting copy equal or greater visual weight than the two actions visitors actually need: Learn to Solve and Fix My Cube.
- **Requested guidance:** “Make ‘Learn to Solve’ and ‘Fix My Cube’ the visually largest, highest-contrast, first-seen elements… Cut or drastically shrink the marketing copy on mobile… Everything that isn’t one of these two actions should recede.”
- **What changed:** `dist/js/app.js` adds a derived `body.home` class only for the initial Learn/prediction state. Mobile CSS hides the marketing block, moves the existing mode switch before the objective, gives both buttons a 64px hit area and high-contrast surfaces, and keeps the objective as quieter supporting context.
- **Why this was safe:** The existing `learn-mode`/`fix-mode` buttons, handlers, mode state, and reset behavior are unchanged; only DOM ordering through CSS and presentation classes changed.
- **Validation pass 1:** Core 323, planner 30, app-flow 62, playback 18, app syntax, `git diff --check`, protected cube-view identity, mode-handler presence, and no-external-script checks all passed.
- **Why-it-hurts pass 2:** Source assertions confirm the two mode actions are the first mobile intro content, are 64px high in a two-column grid, and marketing is hidden only on the home presentation state; the objective remains available below them rather than competing above them.

## Final validation notes

The full device-emulation pass remains required before release. The included QA scripts target genuine Playwright mobile contexts at 375×667, 390×844, and 360×800. The primary runtime includes Playwright, but this environment does not have the Chromium executable installed, so the scripts stopped at browser launch; no claim of a fresh device run is made.
