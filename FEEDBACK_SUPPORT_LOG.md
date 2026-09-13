# Feedback and camera fund — revision 2
Settings opens one compact dialog containing BOTH the message-only feedback form and camera fund.
Submit feedback opens a draft to manav.uix@gmail.com. One short explanatory line; no post-submit paragraph.
Camera copy: Saving up for a Sony ZV-E10 II + lens to make better tutorial videos.
Manual values in dist/js/feedback.js: raised=459, goal=1000.
Displayed text: $459 of $1000 raised. Native green progress: 45.9%.
Buy Me a Coffee, X, LinkedIn are grouped together under the progress bar.
Removed the separated footer fund block. No game state, handlers, mechanics, or camera files changed.
Source/VM tests validate content, grouping, message-only requirement, encoded mailto and progress.
Core/app-flow/playback regression checks pass. Browser visual confirmation remains pending.

## Completion popup — revision 3
First popup adopts reference white card, rounded corners, green progress and black support button.
Shown 3 seconds after playback transitions into its settled all-faces-match caption and enabled speed control.
Observes existing rendered completion UI; no edits to app.js, cube model, handlers or animation.
Canceled by leaving completed state or hiding tab; skips other open dialogs and restored finished games.
Shown once per session (sessionStorage marker with graceful unavailable-storage fallback).
Close returns to game; Leave feedback opens the existing form. No automatic feedback popup on dismissal.
Manual shared goal remains 459/1000. Screenshot 448 was not adopted.
No unverified tip amount controls: supporter chooses amount on Buy Me a Coffee.
tests/feedback-completion.cjs covers delay, suppression, cancellation, transition and email encoding.
Core 323, application 62, playback 18 and diff checks pass. Visual/browser QA still pending.

## Revision 4
Top-right SVG X buttons with 44px targets on both dialogs.
Escape cancel is prevented; backdrop has no dismissal handler.
Leave feedback opens the form above the support dialog; only X dismisses either dialog.
Reminder uses a localStorage timestamp and seven-day interval checked again before display.
Cooldown is per browser/device; unavailable or cleared storage cannot preserve it across visits.
Tests include suppression at six days, eligibility at eight days, and Escape prevention.

## Revision 5 — supplied coffee artwork
Both support links use the existing dist/assets/cube-easy/coffee.svg unchanged.
Main button: 24px. Compact modal link: 18px. Flex centering and 8px icon/text gap.
Decorative empty alt preserves the button text as its accessible name.
No changes to timing, dismiss behavior or game code. Preview updated; visual browser confirmation pending.

## 2026-09-12 — One completion card, confirmed palette, device layout

Current review branch: `Mcode/completion-card-final`, based on `a076727` from the private
`Manav-repo/Rubiks-Cube-easy` repository. This update supersedes any earlier
support-close → automatic-feedback sequence. The two choices are independent,
stacked in the same card as specified by the reference (support first, outlined
feedback below). Feedback opens only after its own explicit action.

### Changes

- Exact supplied `Assests/Buy me coffee.svg` bytes are used from
  `dist/assets/cube-easy/coffee.svg` on support buttons and the support navigation.
  Removed the generic SVG coffee glyph from the navigation renderer.
- Completion CTA uses a 24px line height and an icon of `1lh` (24px), with a 4px
  gap. The feedback support link similarly sizes its icon to its own line height.
  Icon-only mobile header keeps the original 32px branded chip.
- Both funding copy locations now say “Saving up for a DJI Osmo Pocket 4P to make
  better tutorial videos ❤️”. The total remains $459. Goal is `$— (pending
  confirmation)`. The progress track is intentionally unfilled while the target
  is unknown; no fabricated percentage or old $1,000 denominator is displayed.
- Mobile uses a centered native modal with safe-area-aware available dimensions.
  Desktop uses a fixed right-side, non-modal panel with a 24px inset. Open cards
  switch native modality when crossing the mobile breakpoint.
- Preserved the existing three-second completion delay, seven-day cooldown,
  restored-game suppression, close controls, optional mail draft, and all IDs.
  Closing the completion card never opens feedback.

### Confirmed dark roles and pure-black audit

- `#121212`: page background and X social chip surface.
- `#2B2B2B`: card and panel backgrounds.
- `#1A1A1A`: secondary button/input surfaces and pending progress track.
- `#606060`: muted UI text and borders; completion body remains primary white.
- `#F2F2F2`: inverted primary button fill and progress-fill token.
- `#FFFFFF`: primary card text/icons.
- `#FFDD00`: original BMC SVG chip, unchanged between themes.
- Found `#000000` as the X social chip background; replaced it with `#121212`.
  Remaining CSS `#000` is in a journey scrolling mask (alpha geometry, not a
  rendered black surface). Card backdrops/shadows use translucent `#121212`.
  Original branded image/vector glyph colors are retained, including the BMC
  asset's `#0D0C22` artwork. No visible card element had a pure-black background
  in computed-style checks.

### Completed verification

- `node tests/core.cjs`: 323 assertions passed.
- `node tests/planner.cjs`: 30 randomized layer goals passed.
- `node tests/app-flow.cjs`: 62 application state checks passed.
- `node tests/playback.cjs`: 18 move geometry/timing checks passed.
- `node tests/feedback-completion.cjs`: delay, one prompt, cooldown, restored-state
  suppression, cancellation and mail draft encoding passed; unknown target checked.
- `node tests/completion-card-ui.cjs`: eight fresh viewport/theme contexts passed:
  375×667, 390×844, 360×800, 1280×900 × light/dark. Completed an actual final R turn
  to trigger the card. Checked SVG byte identity and browser decode, 4px gap,
  icon/text line-height match, >=44px targets, all card bounds, no internal
  scrolling, copy, amount, exact dark colors, native modality, both actions,
  explicit-only feedback and no repeat on render. Saved screenshots and source
  fingerprint in `tests/completion-evidence/results.json`.
- Protected app, cube view, layout, lessons, planner, solver, cube library and
  theme source match `a076727` byte-for-byte. Saved-progress code/keys untouched.
- `node tests/completion-resize.cjs`: open mobile-to-desktop and desktop-to-mobile
  modality changes passed; no forced feedback on close. Evidence: `resize.json`.
- Screenshot inspection: light/dark mobile card and desktop side panel reviewed.
  These are Chromium emulation checks; physical iPhone/Android hardware was not used.
- `git diff --check`: passed.

### 2026-09-13 — Exact close asset and final model wording

Resolved the missing asset using `Assests/x close.svg`, copied byte-for-byte to
`dist/assets/cube-easy/close.svg`. Both close buttons use this asset as a mask
so its glyph follows the system theme. Camera copy now says
“DJI OSMO Pocket 4p Vlog combo”; $459 and the pending target are unchanged.

Reran completion checks in all eight viewport/theme contexts and the resize
check successfully, with refreshed screenshots and results in
`tests/completion-evidence`. Visually inspected the dark mobile screenshot:
the supplied close glyph and BMC asset render and both actions fit onscreen.
Core (323), planner (30), app-flow (62), playback (18), and feedback-completion
checks passed again. Protected cube and saved-progress source remains unchanged.
README now includes the public demo link and Mcode attribution; current review
branch is `Mcode/completion-card-final`. Historical Git commits are not rewritten.

Full fresh-storage mobile checklist passed at 375×667, 390×844 and 360×800,
including all seven Learn stages/recalls and Fix My Cube playback. Refreshed
screenshots and the report are in `tests/design-evidence`. `git diff --check`
passed. Published the byte-identical `dist` output successfully to
https://cube-brainiac.manav-uix.chatgpt.site with public access confirmed.
