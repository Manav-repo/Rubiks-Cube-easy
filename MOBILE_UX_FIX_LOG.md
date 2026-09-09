# Mobile UX fix log

Status: in progress; not complete until the entire fresh-storage checklist passes.

Repository: https://github.com/Manav-repo/Rubiks-Cube-easy
Base: 61577392880fbc8f5f485be9c99c53d779ffda72
Review branch: codex/mobile-ux-fixes

The initial folder was an empty Git repository with no remote, commits, or uncommitted changes. Fetched the requested repository and created this branch. Read both required documents before editing.

Pre-edit Playwright check passed against http://127.0.0.1:4173 with fresh contexts, isMobile=true, hasTouch=true, deviceScaleFactor=2, and exact 375×667, 390×844, 360×800 viewports. Playwright was provisioned in /private/tmp/cube-brainiac-qa, not as an app dependency. Sandbox network, server binding, and Chromium launch restrictions required approved escalation.

## P0 — Follow-Along playback: cube and controls split across scroll contexts

> **Fix:** Make mobile playback a single controlled shell. Keep the cube and current-move action dock in a fixed-height top region. Give only the move details/list region the scroll overflow. Keep the cube, current move, and Previous/Replay/Next controls in the same visible shell.
>
> **Implementation:** Reuse the existing `solution-back`, `solution-next`, and `solution-replay` buttons. Move them into a mobile playback control strip with CSS/markup wrappers, but do not create new handlers. Set the playback page to `overflow:hidden` and the move-list region to `min-height:0; overflow:auto`. Reserve safe-area space at the bottom.

Changed only playback wrappers and mobile CSS. Existing controls now share an always-visible strip; only .playback-details scrolls. Before: 375px viewport page height 982px, Next y=848. After: page height equals viewport at all three sizes; cube y=223–417 and Next y=472–520 remain visible. No source action or state changes.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## Final validation

The complete fresh-storage mobile checklist passed at 375×667, 390×844, and 360×800 on the final source revision. It covered all seven Learn stages and recalls, painter interactions, solver playback, camera pan, reduced motion, themes, calibration/settings, footer clearance, 44px controls, no overflow, and localStorage restoration. Desktop three-column layout and rendered sticker containment also passed. Final core, planner, app-flow, playback, and `git diff --check` checks passed.

## P0 — Follow-Along playback: sticky layers can cover the cube

> **Fix:** Define one explicit sticky stack with measured offsets. The cube region should begin below the header and objective, or the header/objective should be included inside one playback shell. No sticky element should use `top:0` while another higher-priority sticky element occupies that space.
>
> **Implementation:** Add mobile layout variables for header height, objective height, and playback control height. Use those variables for `top`, `height`, and `scroll-padding-top`. Validate screenshots at all three required viewports while the move panel is scrolled to its beginning, middle, and end.

Added explicit header, objective and control height variables. Header/objective/cube are in one non-overlapping viewport stack, with shared scroll padding. Playwright passed beginning/middle/end scroll checks at all three sizes (9 screenshots in tests/mobile-evidence); cube and all three controls remain above the footer without page overflow.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P1 — Follow-Along playback: duplicate Next controls

> **Fix:** Keep one primary Next action visible in the playback shell. The objective bar should retain the current move and progress, but it should not duplicate the same action on mobile.
>
> **Implementation:** Keep the existing `solution-next` handler. On mobile, visually place that button in the always-visible playback control strip. The objective remains status-only. On desktop, retain the current objective action if it fits the two-panel layout.

The mobile playback objective is status-only via CSS; the existing solution-next remains the single visible primary Next action in the dock. Desktop objective action is unchanged. The scoped display:none rule removes the duplicate from touch and keyboard navigation without changing its handler.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P1 — Follow-Along playback: move-list buttons are below touch-target size

> **Fix:** Give every move token at least a 44×44px hit area while keeping its visible label compact.
>
> **Implementation:** Keep the existing `data-solution-index` and click handler. Use a grid or flex layout with 44px minimum rows, 6–8px gaps, and a clear current-state style. Test direct selection, selection while the list is scrolled, and keyboard focus.

Changed only the mobile move-list grid: 44px minimum width/height, 8px gaps and focus-ring space. Existing data-solution-index controls and current-state styles remain. Browser checks cover middle-list selection, last-token focus plus Enter, and first-token selection; all route through the existing playback path.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P1 — Follow-Along playback: fixed footer can cover lower content

> **Fix:** Keep the footer visible, but reserve its exact height plus `env(safe-area-inset-bottom)` inside the scrolling playback panel.
>
> **Implementation:** Measure the footer with a CSS variable or fixed known height. Apply bottom padding to the actual scrolling element, not only its outer layout. Verify the last move token and status text can be scrolled fully above the footer.

Added one 56px footer variable used by shell reservation and actual .playback-details bottom padding, plus env(safe-area-inset-bottom). Browser assertions verify the last token and playback status can scroll fully above the footer; the long-list scroll positions retain the visible dock.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P1 — Learn mode: coach prompts and cube actions are separated

> **Fix:** Create a one-direction mobile learning flow: current task and prediction first, cube and turn controls immediately after, then feedback/recall. Keep the objective bar visible while scrolling.
>
> **Implementation:** Use a mobile-only layout order or a small shared task header that reuses the existing coach content. Do not duplicate state or event listeners. Keep the existing Learn state machine and `perform(...)` calls unchanged. On desktop, preserve the current three-column arrangement.

Wrapped existing coach task and response markup without adding IDs or listeners. Mobile subgrid places task/prediction, existing cube/actions, then feedback/hints in one vertical flow; the coach keeps a real box so existing objective scrollIntoView still works. Desktop column layout is untouched. Learn state-machine and perform sources remain byte-identical.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P1 — Fix My Cube painter: sticker cells are too small

> **Fix:** Use a mobile two-column face layout or a face-at-a-time layout with 44px sticker hit areas. Keep the net readable without horizontal scrolling.
>
> **Implementation:** Preserve each face’s `data-face`, each sticker’s `data-paint`, color counts, center locking, and `invalidateSolution()` behavior. Change only the responsive grid arrangement and cell dimensions. Desktop keeps the existing unfolded net.

Mobile net now uses two columns of labeled faces with 44px cells and 12px column spacing (284px total). Desktop unfolded placement is unchanged. Browser test taps each palette and all 48 editable stickers, verifies six locked centers, 54/54 progress, minimum hit dimensions and no horizontal overflow.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P2 — Learn mode: cube stickers are borderline-small after scaling

> **Fix:** Increase the mobile scene scale within the available width, or add a larger transparent interaction layer without changing the visible cube geometry.
>
> **Implementation:** Prefer increasing the scene to a tested value around `.84–.9` only after measuring the 360px layout. If an interaction layer is needed, route it to the existing sticker index and `pickSticker(...)` logic.

Increased only Learn mobile scene scale from .72 to .9: nominal 60px stickers grow from 43.2px to 54px before projection. No geometry or interaction handler changes. Browser test uses real taps on front center, edge and corner at every required size and reaches the explanation phase.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P2 — Learn mode: cube stickers are borderline-small after scaling

> **Fix:** Increase the mobile scene scale within the available width, or add a larger transparent interaction layer without changing the visible cube geometry.
>
> **Implementation:** Prefer increasing the scene to a tested value around `.84–.9` only after measuring the 360px layout. If an interaction layer is needed, route it to the existing sticker index and `pickSticker(...)` logic.

Follow-up: the first real tap run FAILED because stickers inherited pointer-events:none from cubie wrappers. Enabled pointer-events:auto only on existing Learn mobile stickers. This routes taps to their original handlers without changing geometry, math or state. Rerunning real center/edge/corner taps before proceeding.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P2 — Learn mode: stage strip hides useful labels

> **Fix:** Keep a horizontally scrollable strip, but show compact readable labels such as “2 Cross” and “3 Corners”. Add scroll snapping and a visible fade/edge cue when more stages continue off-screen.
>
> **Implementation:** Preserve the existing stage buttons, `data-stage`, disabled states, and `aria-current`. Change only label truncation, spacing, and scroll affordance.

Show all existing stage titles with 14ch truncation; add horizontal snap points, a trailing fade and explicit swipe cue. Existing data-stage, disabled states and aria-current are unchanged. Browser assertions check all labels are displayed, the strip scrolls, stage 7 stays locked initially, and stage 1 retains aria-current.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P2 — Fix My Cube painter: primary CTA is below the full net

> **Fix:** Keep one clear sticky painter action area that shows painting progress and the next action. The inline buttons can remain at the end of the net for desktop and screen-reader order.
>
> **Implementation:** Reuse the existing `#solve` button and `renderObjective()` handler. Do not create a second solver action. Ensure the sticky action is disabled until all 54 stickers are painted and remains visible above the mobile safe area.

Reused the original solve button and painting-progress status in a mobile safe-area-aware bottom action region; mobile objective is status-only. renderObjective now disables solve until 54 stickers are painted and while solving/animating. Existing solver handler and legality checks are unchanged. Browser test verifies disabled-before, enabled-after, 54/54 progress and viewport clearance.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P3 — Calibration and settings need a narrow-screen check

> **Fix:** At widths below 420px, stack calibration choices if the two cards become cramped. Keep the dialog internally scrollable and keep the Skip button reachable.
>
> **Implementation:** Preserve the calibration state, mirrored layout mapping, and solution invalidation behavior. Test opening calibration from settings while the keyboard is not present and while browser chrome reduces the available height.

Below 420px, calibration choices stack with 100px illustrations; dialog height includes safe-area allowances. Settings is viewport-anchored and internally scrollable; checkbox labels provide 44px rows. Browser test covers dark first load, orange/right and red/right selection, settings reopening, Skip, and 160px reduced available height without a keyboard.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P3 — Support footer clarity on touch

> **Fix:** Keep the 44px hit targets and add compact visible labels on mobile if there is room, or a single “Connect” label above the icons.
>
> **Implementation:** Preserve the current URLs, ARIA labels, `target="_blank"`, `rel="noopener noreferrer"`, and inline SVG approach.

Added mobile CSS labels X and LinkedIn; shortened only the visible coffee label to Support to fit 360px. support.js is untouched, preserving exact URLs, ARIA labels, new-tab attributes and inline SVG. Browser test checks labels and at least 44px targets without navigating away.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P1 — Learn mode: coach prompts and cube actions are separated

> **Fix:** Create a one-direction mobile learning flow: current task and prediction first, cube and turn controls immediately after, then feedback/recall. Keep the objective bar visible while scrolling.
>
> **Implementation:** Use a mobile-only layout order or a small shared task header that reuses the existing coach content. Do not duplicate state or event listeners. Keep the existing Learn state machine and `perform(...)` calls unchanged. On desktop, preserve the current three-column arrangement.

Final-checklist refinement: explanation, recall-entry and badge content now follows the cube using scoped grid-row placement. Prediction remains before the cube, feedback/hints after. No Learn state or handler changes. Complete browser progression verifies these screens through actual actions.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P3 — Calibration and settings need a narrow-screen check

> **Fix:** At widths below 420px, stack calibration choices if the two cards become cramped. Keep the dialog internally scrollable and keep the Skip button reachable.
>
> **Implementation:** Preserve the calibration state, mirrored layout mapping, and solution invalidation behavior. Test opening calibration from settings while the keyboard is not present and while browser chrome reduces the available height.

Full 375px checklist completed Learn, solver, playback and reload checks but FAILED the touch audit: home link height 37.5px and Settings width 35.9px. Added 44px header minima; also gave mobile face buttons three columns and the reverse label a 44px row. These are CSS-only touch-area changes. Full checklist will be rerun at every size.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.

## P0 — Follow-Along playback: sticky layers can cover the cube

> **Fix:** Define one explicit sticky stack with measured offsets. The cube region should begin below the header and objective, or the header/objective should be included inside one playback shell. No sticky element should use `top:0` while another higher-priority sticky element occupies that space.
>
> **Implementation:** Add mobile layout variables for header height, objective height, and playback control height. Use those variables for `top`, `height`, and `scroll-padding-top`. Validate screenshots at all three required viewports while the move panel is scrolled to its beginning, middle, and end.

Visual QA found lower cube-edge clipping that the earlier container-rectangle assertions missed, plus a self-referencing objective-height variable. Corrected the variable to 64px, made playback objective compact status-only, and enlarged the cube drawing region to 248px. Added an assertion covering all rendered sticker bounds, not just the outer cube-space box. Full final QA must rerun on this revision.

Safety invariants verified at this checkpoint:

- CubeView.turn, all 27 cubies, layer pivots and camera math: protected cube-view.js is byte-identical to base.
- Hidden-face camera pan precedes the turn; final state matches cubejs for all 18 move forms: playback regression passed.
- Next, Previous, Replay and list selection retain shared playTurn → view.turn: playback/state functions unchanged; app-flow and playback tests pass.
- No competing handlers, duplicate IDs, cube models, move lists or solvers: ID set and handler assignment set match base; protected sources unchanged.
- Painter invalidation, calibration red/orange mapping, legality, move notation: handlers/layout/solver sources unchanged; core and app-flow pass.
- Learn/Fix state, painting, position, speed, layout and localStorage save/restore code preserved: state/action sources unchanged; application state checks pass. Full browser reload coverage is tracked in final QA.
- Accurate sticker colors and dark-blue theme preserved: layout.js/theme.js unchanged; no color palette edits.
- Support URLs, accessible labels, new-tab attributes and inline SVG preserved; no new runtime scripts, app dependencies, CDN, tracking or backend.

Documented checks: 323 core assertions, 30 planner trials, 62 app state checks, 18-move geometry/timing suite, and git diff --check all PASS.
