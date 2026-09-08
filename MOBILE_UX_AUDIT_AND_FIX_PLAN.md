# Cube Brainiac — Mobile UX Audit and Fix Plan

Status: audit and plan only. No app code changes are included in this document.

Last reviewed: 2026-09-09

## Scope and current evidence

The live app was exercised through Learn mode, Fix My Cube painting, solver generation, 22-move playback, Replay, Previous, move-list selection, speed selection, mode switching, and the support footer.

The available browser session exposed a fixed 1363×936 viewport and did not expose real device emulation controls. The original mobile audit therefore did not claim false 375×667, 390×844, or 360×800 browser runs. The mobile findings below are based on the live flows plus the exact mobile CSS rules and calculated dimensions. The implementation pass must use genuine device emulation at all three sizes before it is considered complete.

## Core safety rules

These rules keep the mobile work from breaking the game:

1. Do not change cube mechanics, cubie positions, layer-pivot math, camera-pan math, solver legality checks, or move notation.
2. Keep one source of truth for every action. Existing IDs and handlers should be reused when controls move visually.
3. Every playback trigger must still end at the shared `playTurn → view.turn(...)` path.
4. Keep Learn state, Fix state, painting data, solver position, playback speed, calibration, and localStorage behavior intact.
5. Keep the actual cube colors saturated and accurate in both themes.
6. Do not add a second cube model, second move list, duplicate solver, or auto-play shortcut.
7. Preserve the existing support URLs, accessible labels, new-tab behavior, and no-CDN/no-tracking rule.

## Prioritized findings

### P0 — Follow-Along playback: cube and controls split across scroll contexts

**What happens:** On mobile, the header, objective bar, mode switch, and roughly 290px cube panel consume most of the first viewport. The playback panel sits below. The page can scroll, and the playback panel also has its own `overflow:auto` scroll area.

**Why it hurts:** A child can look at the cube, scroll to the move controls, lose the cube, then scroll again. Swiping over the panel and swiping over the page can move different containers. This defeats the watch-then-copy loop.

**Fix:** Make mobile playback a single controlled shell. Keep the cube and current-move action dock in a fixed-height top region. Give only the move details/list region the scroll overflow. Keep the cube, current move, and Previous/Replay/Next controls in the same visible shell.

**Implementation:** Reuse the existing `solution-back`, `solution-next`, and `solution-replay` buttons. Move them into a mobile playback control strip with CSS/markup wrappers, but do not create new handlers. Set the playback page to `overflow:hidden` and the move-list region to `min-height:0; overflow:auto`. Reserve safe-area space at the bottom.

### P0 — Follow-Along playback: sticky layers can cover the cube

**What happens:** Mobile currently gives the header, objective, and cube workspace competing sticky positions. The header is sticky at the top, the objective begins below it, and the cube workspace also sticks at `top:0`.

**Why it hurts:** When the user scrolls, the cube can sit underneath the header/objective layers. The cube is technically sticky but not fully visible.

**Fix:** Define one explicit sticky stack with measured offsets. The cube region should begin below the header and objective, or the header/objective should be included inside one playback shell. No sticky element should use `top:0` while another higher-priority sticky element occupies that space.

**Implementation:** Add mobile layout variables for header height, objective height, and playback control height. Use those variables for `top`, `height`, and `scroll-padding-top`. Validate screenshots at all three required viewports while the move panel is scrolled to its beginning, middle, and end.

### P1 — Follow-Along playback: duplicate Next controls

**What happens:** The objective bar and the playback panel both show a Next move action.

**Why it hurts:** The child cannot tell which control is the canonical action. The two locations also show overlapping progress information.

**Fix:** Keep one primary Next action visible in the playback shell. The objective bar should retain the current move and progress, but it should not duplicate the same action on mobile.

**Implementation:** Keep the existing `solution-next` handler. On mobile, visually place that button in the always-visible playback control strip. The objective remains status-only. On desktop, retain the current objective action if it fits the two-panel layout.

### P1 — Follow-Along playback: move-list buttons are below touch-target size

**What happens:** Live measurement found a move token around 37px high. The mobile rules keep `min-height:0` and compact padding.

**Why it hurts:** Tapping one of 22 compact move buttons can select the wrong move, especially for children.

**Fix:** Give every move token at least a 44×44px hit area while keeping its visible label compact.

**Implementation:** Keep the existing `data-solution-index` and click handler. Use a grid or flex layout with 44px minimum rows, 6–8px gaps, and a clear current-state style. Test direct selection, selection while the list is scrolled, and keyboard focus.

### P1 — Follow-Along playback: fixed footer can cover lower content

**What happens:** The support footer is fixed to the bottom of playback. The move panel is a separate scroll container.

**Why it hurts:** The final move-list rows or lower controls can slide behind the footer and appear unreachable.

**Fix:** Keep the footer visible, but reserve its exact height plus `env(safe-area-inset-bottom)` inside the scrolling playback panel.

**Implementation:** Measure the footer with a CSS variable or fixed known height. Apply bottom padding to the actual scrolling element, not only its outer layout. Verify the last move token and status text can be scrolled fully above the footer.

### P1 — Learn mode: coach prompts and cube actions are separated

**What happens:** On mobile, the cube workspace appears before the thinking-buddy panel. Prediction answers, hints, and feedback therefore sit below the cube and face controls.

**Why it hurts:** The child reads a question, scrolls to the cube, acts, scrolls back for feedback, and repeats this during every stage.

**Fix:** Create a one-direction mobile learning flow: current task and prediction first, cube and turn controls immediately after, then feedback/recall. Keep the objective bar visible while scrolling.

**Implementation:** Use a mobile-only layout order or a small shared task header that reuses the existing coach content. Do not duplicate state or event listeners. Keep the existing Learn state machine and `perform(...)` calls unchanged. On desktop, preserve the current three-column arrangement.

### P1 — Fix My Cube painter: sticker cells are too small

**What happens:** The mobile cube-net cells resolve to roughly 19px at 360px, 20px at 375px, and 21px at 390px. They explicitly override the global minimum button height.

**Why it hurts:** Painting 54 stickers becomes error-prone and frustrating on touch screens.

**Fix:** Use a mobile two-column face layout or a face-at-a-time layout with 44px sticker hit areas. Keep the net readable without horizontal scrolling.

**Implementation:** Preserve each face’s `data-face`, each sticker’s `data-paint`, color counts, center locking, and `invalidateSolution()` behavior. Change only the responsive grid arrangement and cell dimensions. Desktop keeps the existing unfolded net.

### P2 — Learn mode: cube stickers are borderline-small after scaling

**What happens:** The mobile scene uses `scale:.72`; a 60px sticker becomes about 43px before perspective distortion.

**Why it hurts:** Stage 1 asks children to tap centers, edges, and corners. Small projected targets create mistaken selections.

**Fix:** Increase the mobile scene scale within the available width, or add a larger transparent interaction layer without changing the visible cube geometry.

**Implementation:** Prefer increasing the scene to a tested value around `.84–.9` only after measuring the 360px layout. If an interaction layer is needed, route it to the existing sticker index and `pickSticker(...)` logic.

### P2 — Learn mode: stage strip hides useful labels

**What happens:** Below 950px, non-selected stage titles are hidden and the stage list becomes horizontally scrollable.

**Why it hurts:** Children see numbered circles without knowing what later stages are, and the horizontal gesture is not obvious.

**Fix:** Keep a horizontally scrollable strip, but show compact readable labels such as “2 Cross” and “3 Corners”. Add scroll snapping and a visible fade/edge cue when more stages continue off-screen.

**Implementation:** Preserve the existing stage buttons, `data-stage`, disabled states, and `aria-current`. Change only label truncation, spacing, and scroll affordance.

### P2 — Fix My Cube painter: primary CTA is below the full net

**What happens:** “Find my moves” appears after the palette, all six faces, and the back-face explanation.

**Why it hurts:** A first-time user must travel to the bottom before seeing the final action. The sticky objective action exists, but it is easy to miss.

**Fix:** Keep one clear sticky painter action area that shows painting progress and the next action. The inline buttons can remain at the end of the net for desktop and screen-reader order.

**Implementation:** Reuse the existing `#solve` button and `renderObjective()` handler. Do not create a second solver action. Ensure the sticky action is disabled until all 54 stickers are painted and remains visible above the mobile safe area.

### P3 — Calibration and settings need a narrow-screen check

**What happens:** Calibration uses two illustrated choices in a two-column dialog. Settings is an absolutely positioned panel.

**Why it hurts:** These are likely to be okay, but they are sensitive to the smallest viewport and browser safe areas.

**Fix:** At widths below 420px, stack calibration choices if the two cards become cramped. Keep the dialog internally scrollable and keep the Skip button reachable.

**Implementation:** Preserve the calibration state, mirrored layout mapping, and solution invalidation behavior. Test opening calibration from settings while the keyboard is not present and while browser chrome reduces the available height.

### P3 — Support footer clarity on touch

**What happens:** Buy Me a Coffee has a visible label; X and LinkedIn are icon-only.

**Why it hurts:** The hit areas are accessible, but the purpose is less obvious to a parent scanning the footer.

**Fix:** Keep the 44px hit targets and add compact visible labels on mobile if there is room, or a single “Connect” label above the icons.

**Implementation:** Preserve the current URLs, ARIA labels, `target="_blank"`, `rel="noopener noreferrer"`, and inline SVG approach.

## Things the audit did not find

- No core interaction depends on hover; hover only adds visual feedback.
- The mobile CSS does not appear to require page-wide horizontal scrolling. The stage strip is intentionally horizontal.
- Palette buttons, mode buttons, primary actions, settings buttons, and footer links inherit or define roughly 44px touch targets.
- The native Turn speed selector is an appropriate touch control.
- The public app loads, the solver produces a 22-move path, and playback controls share the same animation path.

## Implementation order

1. Build the mobile playback shell and remove the nested page/panel scroll conflict.
2. Fix sticky offsets and make one control strip for Previous, Replay, and Next.
3. Increase move-list hit areas and reserve footer safe-area space.
4. Reorder the Learn mobile flow so task, cube, action, and feedback read in one direction.
5. Redesign the mobile painter net with 44px sticker targets.
6. Increase/test cube sticker interaction size.
7. Improve stage labels and horizontal-scroll affordance.
8. Audit calibration, settings, footer labels, dark mode, and reduced motion.

## Validation pass 1 — static and behavioral safety

Before visual QA, check the implementation against these invariants:

- `CubeView.turn(...)` and the 27-cubie model are unchanged.
- Camera panning still occurs before a hidden-face turn.
- Next, Previous, Replay, and direct move-list selection still call the shared playback path.
- No button has two competing click handlers.
- Painter edits still invalidate an old solution.
- Calibration still maps red/orange mirrored layouts correctly.
- LocalStorage still restores stage, paint, solution, speed, and layout settings.
- The last playback move still bakes into the same cube state.
- No new dependency, CDN, tracking script, or backend is introduced.

Run:

```bash
node tests/core.cjs
node tests/planner.cjs
node tests/app-flow.cjs
node tests/playback.cjs
git diff --check
```

## Validation pass 2 — real mobile device-emulation QA

Use genuine device emulation, not a narrowed desktop window, at:

- 375×667
- 390×844
- 360×800

For each viewport, use a fresh localStorage profile and test:

1. First load, calibration, system light/dark preference, and settings.
2. Learn stage 1 prediction, cube taps, hints, undo, and recall.
3. Advance through all seven stages far enough to verify the stage strip, objective, badges, and recall screens.
4. Fix My Cube painting: palette selection, every face, center locks, progress count, reset, scramble, and the final solver action.
5. Solver playback: first move, Next, Previous, Replay, direct move-list selection, Slow-mo, reduced motion, hidden-face camera pan, last move, and solved state.
6. Scroll the playback panel to its beginning, middle, and end while checking that the cube, current instruction, and primary controls remain available as designed.
7. Verify the final move-list token and footer links are reachable above the safe-area/footer region.
8. Check for horizontal overflow, clipped text, focus rings, accidental double taps, and controls below 44×44px.

The fix is complete only when both validation passes succeed at all three viewport sizes.
