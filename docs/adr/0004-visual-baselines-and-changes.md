# ADR-0004: Visual baselines and intentional changes

Date: October 15, 2026. Status: accepted requirement; comparison environment/calibration pending G2/G4.

## Context

The archive has 447 page screenshots and seven representative state captures. The source uses deferred entrance animations; exact pixels also depend on browser/OS/fonts. An unrestricted screenshot-update workflow could hide defects rather than establish a faithful migration.

## Decision

Keep original evidence immutable. Compare every captured route at all three baseline profiles in a fixed environment, with additional template/state/breakpoint checks. Review geometry, content, typography and pixel differences together. Use narrow documented tolerances only for demonstrated renderer noise; never increase a global threshold or mask a meaningful section to clear a regression.

Known source defects and approved improvements have decision-specific expected behavior and retained before/after evidence. They do not overwrite the historical observation or become a generic exception to visual review.

## Consequences

Calibrate reference repeatability before broad page work. A changed shell/font/token triggers its whole route impact set. Final acceptance requires per-route evidence and reviewer, not just a passing aggregate ratio or accepted representative template.

The numerical proposal and exception procedure live in [testing](../08-testing-and-acceptance.md); changes to that contract update this ADR and its rationale.
