# Cube Easy mobile design implementation

Base: `d14e01d` (completed P0–P3 fixes). Branch: `codex/cube-easy-mobile-design`.

This pass implements the user-supplied mobile design spec and screenshots. The
user's explicit requirement is that appearance follows the device system choice,
including changes while the page is open. Old manual theme preferences are ignored;
saved cube/lesson/solver progress is not cleared or migrated.

## Implemented presentation

- Reuse the supplied light/dark logo SVGs, coffee SVG, X SVG and blue/white LinkedIn PNGs as local
  assets. The wordmark is the supplied vector artwork, so no font approximation is needed.
- Move the one existing support nav into the mobile header; retain links, labels,
  new-tab behavior and handlers. Restore it to the desktop footer on resize.
- Move the one existing objective into the playback cube card on mobile. Restore it
  to its original position outside playback/on desktop.
- Retain the existing interactive cube, reset control, Previous/Replay/Next controls,
  speed selector, move list, painter and Learn flow. No replacement cube or solver.
- Keep device-controlled appearance on initial load and live preference changes;
  hide the two legacy manual-theme buttons while retaining their IDs/API compatibility.

## Confirmed dimensions and explicit adaptations

- Reference 393×852: header 81px, mode row 80px, cube card 360px, controls row 75px;
  speed/list region begins 16px after the controls. Card footer is 44px.
- Section horizontal padding and mode/control gaps are 16px; move grid gaps are 12px.
- Below 700px viewport height, the card becomes 320px so the details scroller remains
  usable while the cube and controls stay visible.
- The 81px header keeps 24px CSS padding. Its 32px artwork sits inside 44px hit areas
  that extend into the padding; clickable regions do not overlap. Target wrappers
  have no gap, giving 12px visual gaps between 32px icons. The wordmark shrinks at
  narrow widths instead of hiding links.
- At 393px, seven 44px tokens plus six 12px gaps need 380px, which exceeds the
  specified 361px inner width. Use six columns there and seven when enough width
  is available. No sub-44px tokens or overlapping hit areas.
- Playback buttons use 44px targets rather than the spec's 40px Next button. The
  75px row is preserved; its 44px control extends 1px into the nominal padding.

These adaptations prioritize the user's working mobile experience and the previous
44px safety requirement. The six-column fallback is used only when seven 44px
targets plus their required gaps cannot fit.

## Provisional styles requiring design confirmation

No callable Figma connector was available. The supplied screenshots and viewable
Figma file confirmed the frame/card dimensions, Inter 12px card text and #EEEEEE
card surface. Remaining values below are implementation estimates because the
connector did not expose inspectable styles:

- Sans text: Arial/Helvetica, 16px controls, 12px card status/footer.
- Light surfaces: page #f5f5f5, card #eeeeee, primary #242424, muted #666666,
  borders #cccccc. Logo colors come directly from the assets.
- Outer radii: 10px cards, 8px buttons; button-leading symbols retain confirmed 2px radius.
- Dark mode retains the actual established dark-blue palette. The spec's description
  of the current palette as charcoal-green is stale relative to project memory/code.

## Verification

The local presentation suite completed with isolated Playwright storage and fresh
contexts for 393×852, 375×667, 390×844 and 360×800 in both system color schemes.
It passed the 81/80/360-or-320/75px layout checks, 44px hit-area checks, 12px move
grid gap, no-overflow check, card scrolling, live system-theme switching, stable
sticker colors, unique IDs, mobile-to-desktop restoration and asset decoding.

The full mobile flow also passed at 375×667, 390×844 and 360×800: all seven Learn
stages and recalls, painter, solver/playback, camera pan, saved-progress restore,
theme changes and checklist assertions. Core, planner, app-flow and playback suites
passed, followed by `git diff --check`.

The direct rerun of the presentation suite was blocked by the environment's
automatic approval usage limit when Chromium launch required elevation; the recorded
fresh run above is retained in `tests/design-evidence/measurements.json`,
`tests/design-evidence/flow-checklist.json` and the accompanying screenshots.
