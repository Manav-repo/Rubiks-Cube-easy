# Cube Brainiac — Project Memory

Last updated: 2026-09-08

This file is the short handoff for future maintenance of Cube Brainiac.

## Project and deployment

- Repository: `https://github.com/Manav-repo/Rubiks-Cube-easy`
- GitHub Pages app: `https://manav-repo.github.io/Rubiks-Cube-easy/dist/`
- Pages publishes the `dist/` folder from the `main` branch.
- The repository root redirects to the `dist/` app, but the `/dist/` URL is the safest link to share.
- Latest Pages deployment after the camera fix: GitHub Actions run `34271432604`, completed successfully.

## What the app does

Cube Brainiac is a static, no-backend Rubik’s Cube learning game for children and beginners.

- **Learn to Solve:** seven small stages that ask the player to notice, predict, try, use hints, and recall before progressing.
- **Fix My Cube:** paints a real cube through a flat cube net, validates the colors, and gives a step-by-step move playback.
- Includes cube calibration for standard/mirrored adjacent-face layouts, dark blue light/dark themes, local progress saving, color/letter cues, responsive layouts, support links, and a solver worker.

## Important architecture

- `dist/index.html` — app shell, controls, playback markup, and asset references.
- `dist/style.css` — responsive layout, cube styling, light/dark themes, and playback visuals.
- `dist/js/app.js` — application state, Learn/Fix modes, solver flow, playback controls, and localStorage.
- `dist/js/cube-view.js` — CSS 3D cube, rigid cubies, layer pivots, camera orbit, highlights, direction arrow, and animation sequencing.
- `dist/js/lessons.js` / `dist/js/stage-planner.js` — lesson stages and stage planning.
- `dist/vendor/` and `dist/js/*-worker.js` — local solver dependencies and worker logic.
- `tests/` — core, planner, app-flow, and playback regression tests.

## Animation rules that must be preserved

### Layer turns

The cube is represented by 27 rigid cubies. A face move temporarily reparents the nine cubies in that slice under `turnLayer`, whose transform origin is the cube center. The pivot rotates on the correct X/Y/Z axis, then the resulting cubie positions, sticker normals, face labels, and facelet indices are baked back into the model.

Do not replace this with sticker scaling, opacity fades, or end-state swaps. Do not change the layer-turn math while fixing camera behavior.

### Playback sequence

All playback triggers use the same `CubeView.turn(...)` path:

1. If the requested face is hidden, `panToMove()` smoothly orients the whole cube.
2. The direction arrow and layer highlight appear.
3. The pre-turn hold lets the child see the starting layer.
4. The existing rigid layer pivot animates.
5. The post-turn hold lets the child see the result.
6. The model is baked and the temporary pivot/arrow/highlight are cleaned up.

This shared path is used by **Next move**, **Previous**, **Replay this move**, and direct move-list selection.

## Camera-pan fix

The old bug was an immediate `this.x/this.y` assignment inside `showDirection()`. That caused the complete cube view to jump before hidden faces were shown.

Current behavior in `dist/js/cube-view.js`:

- `cameraTarget(move)` decides whether the move face is sufficiently visible and returns a target orbit only when needed.
- `panToMove(move, {slow})` animates `rotateX(...) rotateY(...)` with Web Animations (or a CSS transition fallback), `ease-in-out`, and no scaling/fading.
- Normal camera pan is 500ms; Slow-mo is 1000ms, matching the playback speed choice.
- `turn()` awaits the camera pan before starting the already-correct layer turn.
- Reduced-motion mode snaps the camera directly and still preserves the layer highlight/turn sequence.
- `showDirection()` now only creates the arrow; it must never change the camera orientation.

The cache-busted script reference in `dist/index.html` is `js/cube-view.js?v=71074f0`, which prevents a stale Pages asset from hiding the camera fix.

## Playback timing and controls

- Normal layer turn: 800ms with an ease-in-out curve.
- Slow-mo layer turn: 1600ms.
- Before and after holds: 275ms each.
- Replay control repeats the current move without changing progress.
- Previous animates the inverse move and updates progress after completion.
- Move list selection animates the selected move through the same code path.

## Verification completed

Commands that pass from `/workspace/sites/cube-brainiac`:

```bash
node tests/core.cjs
node tests/planner.cjs
node tests/app-flow.cjs
node tests/playback.cjs
git diff --check
```

Results at the last check:

- 323 core assertions passed.
- 30 random layer-goal planner trials passed.
- 62 application state checks passed.
- 18-move playback geometry and animation checks passed, including camera pans, holds, arrow direction, Slow-mo, reduced motion, and Learn timing.
- In the running app, hidden-face moves showed an intermediate camera transform while no layer was turning; the layer turn began only after the camera settled.

## Maintenance guardrails

- Keep the app fully static and dependency-light; do not add a backend, login, tracking, or external runtime scripts.
- Keep the dark theme in the natural dark-blue palette. Cube sticker colors must remain saturated and accurate.
- Preserve the child-facing tone: short sentences, safe mistakes, predict-first, and recall before revealing answers.
- When changing playback, update both the shared `CubeView.turn()` path and `tests/playback.cjs`.
- When changing deployment assets, update the cache version in `dist/index.html` if a browser could retain an old file.
