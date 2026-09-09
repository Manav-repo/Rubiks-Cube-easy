# Figma exact-design correction plan

Date: 2026-09-10

Reference: https://www.figma.com/design/Mte3jf3uWAcPcrYapEWI5R/Rubiks-Cube?node-id=1-2

File key: `Mte3jf3uWAcPcrYapEWI5R`; root node: `1:2`.
Frame: **Mobile Fix my cube design**.
Current baseline: `16f5c93` on `codex/cube-easy-mobile-design`, fetched and
fast-forwarded from GitHub during this audit. Earlier screenshot baseline: `1d00c43`.

## Status and evidence boundary

This is a correction plan, not a claim of completed design implementation.
The new reference was opened in Figma's browser editor. Its canvas and the
properties listed below were inspected. The earlier local reference screenshot
`tests/design-evidence/393-light.png` and current CSS were reviewed for comparison.
That local screenshot is saved evidence, not a new live-browser test.

Figma MCP `get_design_context` and `get_screenshot` are not exposed in this task.
Tool discovery found no callable Figma tool. The plugin installation request was
also rejected because its ID was not accepted by the tool's current catalog.
Browser inspection supports this plan but does not satisfy the required structured
design-to-code workflow. Obtain that context before editing production UI.

Earlier functional/layout checks demonstrate the behavior they assert. They do
not establish pixel parity: several assertions encode the previous approximation.
The newer baseline also includes `MOBILE_VISUAL_POLISH_LOG.md`, which explicitly
records blocked fresh device emulation. Earlier screenshots do not verify those
newer changes. `dist/style.css` now has additional `body.home`, `body.paint-ready`
and non-playback overrides; audit their specificity against `mobile-design.css`.
No new UI implementation or runtime test is reported as completed in this pass.

## Measurements confirmed in the new file

| Node | Confirmed browser properties | Implication |
| --- | --- | --- |
| `1:2` — Mobile Fix my cube design | 393×852; fill `#F5F5F5`; clip content enabled | Use this exact size for the first visual comparison. |
| `1:74` — Frame 8 | x=0, y=161; 393×360; horizontal padding 16; vertical padding 0; gap 0 | Keep the outer cube region distinct from its inset card. |
| `1:102` — Frame 37 | x=16, y=612; width 361; height 199 Hug; vertical auto layout; gap 16; zero padding | The current speed/list region needs child-level inspection; the old 12px assumption cannot be applied to every gap. |

The canvas shows seven move chips per row, three rows of 21 moves, a compact
speed selector, outlined Replay, a solid Next button, a settings gear and branded
social tiles. The dark variant and individual text/icon styles have not yet been
extracted from this new file. Do not assign inferred hex/font values as confirmed.

## Corrections, in implementation order

| Order | Current implementation / visible discrepancy | Required change and evidence | Likely files |
| --- | --- | --- | --- |
| 1 | Styles are explicitly provisional; mobile body uses Arial/Helvetica while controls can retain older component typography. | Extract family, weight, size, line height and tracking for every text role. Load the actual permitted font locally, set control inheritance explicitly and compare baselines. Do not substitute a similar font silently. | `dist/mobile-design.css`, `dist/style.css`, `dist/fonts/`, `dist/index.html` |
| 2 | Header uses a shrinking wordmark, fixed 176px action group, a hand-written gear, and social images with intrinsic padding. Saved local LinkedIn appearance differs from the reference tile. | Extract header auto layout and exact icon/wordmark assets. Match visible glyph dimensions, separator, spacing and vertical alignment. Keep existing links and settings handler. | `dist/mobile-design.css`, `dist/index.html`, `dist/assets/cube-easy/` |
| 3 | Mode button glyphs are CSS shapes; text/border appearance differs from the reference. | Match glyph exports, text weight, selected/unselected fills, borders, radii and text-to-icon spacing from child nodes. Keep `learn-mode` and `fix-mode`. | `dist/mobile-design.css`, `dist/index.html` |
| 4 | Status and footer typography appear heavier than the reference; drag/reset symbols are Unicode substitutes. | Extract exact card text styles and footer icon assets. Position status and progress against measured card insets; preserve live status values and reset handler. | `dist/mobile-design.css`, `dist/index.html` |
| 5 | Playback buttons use proportional columns, generic SVG icons and whole-button disabled opacity. Saved local Replay is disabled at step zero while the mockup draws it outlined. | Extract individual bounds, strokes and state colors. Match each actual state without enabling an invalid action merely to mimic a static mockup. Verify why Replay is disabled in the fixture and compare enabled Replay separately. | `dist/mobile-design.css`, `dist/index.html`, presentation markup in `dist/js/app.js` only if needed |
| 6 | Speed selector uses the browser arrow and a 44px row; saved screenshot has different vertical spacing from the compact Figma control. | Inspect `1:102` children, separator and selector bounds. Match visible control height/underline/arrows with exact assets, retaining the native select and its handler. Separate visual bounds from hit area. | `dist/mobile-design.css`, `dist/index.html` |
| 7 | `repeat(auto-fill,minmax(44px,1fr))` with 12px gaps gives six columns and four rows at 393px, unlike Figma's seven columns and three rows. | Extract chip visual size, row/column gaps and states. Investigate fitting seven visual chips with nonoverlapping 44px interaction targets. At 361px inner width, seven 44px targets leave 53px total for target spacing; seven 44px targets plus six 12px gaps do not fit. Do not silently retain six columns or violate hit targets. Document any unresolved conflict. | `dist/mobile-design.css`, `tests/mobile-design.cjs` |
| 8 | Light colors/radii are estimates; dark mode uses the older blue palette rather than a verified new Figma variant. | Extract exact tokens and available theme variants. Keep device-controlled selection and live switching. If no dark design is present, explicitly record that exact dark parity is unspecified and preserve the existing dark behavior. | `dist/mobile-design.css`, existing theme integration |
| 9 | Fixed card heights and nested scrolling were adaptations to older screenshots. | First match 393×852, then verify 375×667, 390×844 and 360×800. Keep controls reachable and resolve overflow without compressing text or changing cube math. | `dist/mobile-design.css`, `tests/mobile-design.cjs`, `tests/mobile-design-flow.cjs` |

## Required retrieval before implementation

1. Connect/expose Figma MCP in this task. Request `get_design_context` for file key
   `Mte3jf3uWAcPcrYapEWI5R`, node `1:2`, with skillNames `figma-design-to-code`.
2. If oversized, use metadata to map children, then fetch individual header,
   mode, card, playback and speed/list nodes. Known card/list IDs are above.
3. Obtain the reference screenshot using the Figma screenshot tool.
4. Record exact measurements/tokens and download exact exported asset bytes into
   the repository. Reuse supplied assets only when they match those exports.
5. Replace provisional CSS in place. Avoid another cumulative override layer.
6. Record each correction, evidence, test result and any deliberate deviation in
   `CUBE_EASY_DESIGN_LOG.md` and update the status of this plan.

## Safety invariants

- Preserve all IDs, event handlers, link destinations and accessibility names.
- Keep the real interactive cube. The black “3D Cube” graphic is a design
  placeholder, not a replacement for the working renderer.
- Do not modify cube mechanics, layer/camera math, notation, solver, planner,
  calibration mapping, sticker colors, persistence keys or saved progress.
- Keep appearance driven by `prefers-color-scheme`, including live changes.
- Preserve pointer/keyboard interaction, nonoverlapping hit areas, focus visibility,
  reduced-motion behavior, painter flow and every Learn stage.
- Any conflict between exact visual dimensions and an earlier safety requirement
  must be documented and resolved explicitly before calling the result exact.

## Acceptance and evidence

- Capture Figma and local app at the same 393×852 CSS viewport and matching state.
  Compare typography, asset shapes, bounds, spacing, fills, borders and radii.
  Mask only the expected dynamic cube content; do not hide surrounding differences.
- Repeat screenshots/checks at 375×667, 390×844 and 360×800 in fresh storage and
  both device themes. Record which theme has an actual Figma reference.
- Test start/middle/end playback, Next/Previous/Replay, move selection, speed,
  reset view, scrolling, settings, painting, saved restore and all Learn/recall stages.
- Run `node tests/core.cjs`, `node tests/planner.cjs`, `node tests/app-flow.cjs`,
  `node tests/playback.cjs`, updated `node tests/mobile-design.cjs`,
  `node tests/mobile-design-flow.cjs`, and `git diff --check`.
- Update presentation assertions from retrieved Figma values, not current CSS.
  Save screenshots, measurements, source fingerprint and full command outcomes.
- Review the protected-file comparison in `tests/mobile-design.cjs`: it pins
  `support.js` to `d14e01d`, while the merged baseline legitimately updated support
  markup/destination. Preserve that authorized change and update this specific
  guard to the current baseline; do not remove the cube/solver identity guards.
- Commit and push changes on `codex/cube-easy-mobile-design`; verify the remote
  commit and log file. Leave the branch for review; do not merge to main.
