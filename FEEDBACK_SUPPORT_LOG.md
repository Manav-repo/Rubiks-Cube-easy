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
