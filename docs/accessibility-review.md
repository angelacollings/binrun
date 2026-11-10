# Accessibility Review

Review date: 8 November 2026

This review records the checks completed for the current BinRun portfolio build. It is not a
claim of formal WCAG conformance or a substitute for testing with disabled users and assistive
technology.

Future reviews should follow the [manual accessibility testing workflow](./manual-accessibility-testing.md)
and use the [copyable review template](./templates/manual-accessibility-review.md). This file remains
the historical result of the initial review rather than the reusable procedure.

## Scope

Representative routes reviewed:

- Public landing page
- Login
- Registration
- Pricing
- Customer dashboard using fictional seed data
- Worker service run board using fictional seed data

## Automated Checks

`npm run test:a11y` runs Axe through Playwright against all six representative routes using the
WCAG 2.0, 2.1, and 2.2 A/AA rule tags.

Result: all six scans pass with no automatically detectable A/AA violations.

The first review run identified help-card text with a 4.23:1 contrast ratio. The shared muted text
colour was darkened, and the affected landing and pricing pages now pass the 4.5:1 normal-text
threshold. No Axe rules are disabled or excluded.

## Manual Checks Completed

| Check                | Scope                                                                                 | Result                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Keyboard focus order | Landing navigation and login form                                                     | Focus followed the visual order.                                                                            |
| Focus visibility     | Landing links and login inputs                                                        | A visible high-contrast focus indicator remained present.                                                   |
| Form labels          | Login form                                                                            | Email and password controls exposed clear accessible labels.                                                |
| Mobile layout        | Landing and login at a 468px-wide Chromium viewport                                   | Content remained readable in a single column with no clipped controls.                                      |
| Reflow               | Landing at a 720px CSS viewport, equivalent to halving a 1440px viewport at 200% zoom | No horizontal document overflow; navigation, cards, calls to action, and footer content remained available. |
| Status communication | Dashboard and run-board source plus browser tests                                     | Statuses use visible text, and visit-update results are announced through live regions.                     |

## Outstanding Manual Checks

The following checks still require a human review with the relevant browser or assistive
technology:

- Native browser zoom at 200% on each core route, rather than viewport-equivalent reflow only
- Complete keyboard-only operation of property creation, editing, deactivation, and visit updates
- Screen-reader checks for route changes, form errors, dashboard summaries, and run-board updates
- Contrast inspection for focus indicators and component states not present in the seeded flows
- Windows High Contrast Mode or forced-colours testing
- Touch target review on representative physical mobile devices

BinRun currently has no user-selectable dark theme, so dark-mode conformance was not assessed.

The reusable workflow defines the evidence, severity, route/state coverage, and follow-up issue
requirements for completing these checks consistently.

## Repeatable Commands

```bash
npm run test:a11y
npm run test:e2e
```

These commands refresh the fictional accounts and time-relative visits automatically. Run them
only against the disposable local/test database described in the project README.
