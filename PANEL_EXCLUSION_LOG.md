# Single active panel — 2026-09-17

Audited all opening paths: Settings toggle, initial and Settings/solver calibration, Settings Feedback, automatic completion, inline completion feedback and responsive dialog re-presentation. Added CubePanels as the shared active-panel owner. Opening a panel closes the previous panel synchronously; Settings aria-expanded follows the controller. Native dialog dismissal clears ownership. Inline completion form cleanup is synchronous so switching immediately into standalone Feedback cannot lose the form. Resizing preserves the current card content.

Desktop dialogs now start below the header, keeping Settings clickable. LinkedIn uses the supplied LI-In-Bug.png unchanged, with white backing to fill its transparent lettering in both themes.

Validation:
- Actual Chromium click flows: calibration dismiss/selection; Settings→Feedback; desktop Feedback→Settings; Settings→calibration; real last playback move→completion; completion→inline feedback; desktop inline feedback→Settings→Feedback. Mobile native modal backdrop intentionally blocks header clicks until dismissal.
- All 16 ordered controller pairs across Settings, Feedback, completion and calibration, at 375/390/360/1280 widths × light/dark: passed. The pair matrix uses controller calls for combinations without UI links; clickable paths above use real clicks. Evidence: tests/panel-evidence.
- Completion card: eight viewport/theme cases passed; inline feedback retains bounds and one dialog. Resize and Settings feedback restore passed.
- Core 323, app state 62, playback 18 geometry/timing checks passed. Protected-source checks allow only the exact audited panel routing substitutions in app.js; cube/camera/planner/solver files unchanged.
- Supplied LinkedIn asset + white backing checked at mobile/desktop in both themes, with header screenshots.
- git diff --check passed.

The first desktop click test exposed a card covering the header; fixed by placing cards below it. An earlier in-progress completion run failed its source-stability guard because CSS changed during that run; the final unchanged-source rerun passed.

No merge to main performed. No saved-progress format or cube mechanics changed.
