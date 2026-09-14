# Desktop copy and Pages release verification

## 2026-09-14

Confirmed GitHub reports the repository public; retained that setting at the
owner's latest request. The separate hosted-app sharing label does not control
GitHub visibility. GitHub Pages initially returned 404 and its API reported no
site. Restored publishing from main at the repository root; GitHub returned
https://manav-repo.github.io/Rubiks-Cube-easy/ with status building.

Changed display copy in dist/js/app.js and the initial heading in dist/index.html:
- Painter: “Paint your cube’s current colors.”
- Playback description: “Watch the arrow, then copy the turn on your cube.”
- Painter stage label: “FIX MY CUBE · MATCH COLORS”.
- Painter stage description: “Copy all six faces to find your solution.”

The screenshot's broken grammar and exact duplicated playback text were absent
from the current branch. The explicit new strings prevent either from rendering.
The additional correction removes playback instructions from painter mode.
Reviewed seven Learn stages in six phases across both themes (84 states), plus
painter, playback, completion and feedback. No other empty, duplicated, or
placeholder heading/body pair was found. Form examples and empty status regions
are intentional. Screenshots and copy report: tests/desktop-evidence.

Tests passed: desktop-copy, core (323), app-flow (62), playback (18).
Only display-copy assignments changed in app.js; mechanics, solver, camera math,
IDs, handlers and saved-progress logic are unchanged.

Rebrand search: zero case-insensitive matches in working-tree text and filenames,
including untracked assets, excluding Git's internal database and OS metadata.
No clipboard-named asset matching the old brand is present in the repository.
The old matches on main were CUBE_EASY_DESIGN_LOG.md, MOBILE_UX_FIX_LOG.md, and
tools/mobile-checkpoint.cjs; the review branch already replaces these with Mcode.
Historical commit messages and older branch names remain unchanged. An absolute
zero across Git history is not claimed; rewriting published history is not part
of this release. README now links to the real GitHub Pages address.
