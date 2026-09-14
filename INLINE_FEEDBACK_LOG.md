# Same-card completion feedback

Tapping Leave Feedback now replaces the camera-fund contents inside the existing completion dialog. The original form node is moved, retaining its ID, input value, validation and email-draft submit handler. The completion card keeps its measured height, position, white theme and existing close button; only one dialog is open. Closing restores the form to the Settings feedback dialog. Resizing preserves the inline view while switching native mobile modality.

Validation: completion-card-ui passed all eight viewport/theme cases with exact before/after card bounds, one open dialog, hidden funding content and visible inline form. Screenshots include `tests/completion-evidence/*-feedback.png`. completion-resize passed mobile→desktop→mobile with inline form retained and standalone Settings feedback verified afterward. Protected application/cube/planner/source comparisons in completion-card-ui passed. git diff --check passed. No changes to mechanics, solver, saved progress or donation destination.

This change is on Mcode/inline-completion-feedback for review; main is not merged automatically.
