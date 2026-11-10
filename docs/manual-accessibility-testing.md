# Manual Accessibility Testing Workflow

Use this workflow for repeatable human review of BinRun's public, customer, and worker journeys.
It complements automated Axe and browser checks; it is not a formal WCAG certification and does
not replace testing with disabled users.

Copy the [manual review template](./templates/manual-accessibility-review.md) for each review. Keep
completed results separate from this procedure so the workflow remains stable as evidence changes.

## Test Environment

Run the review against the local application and disposable fictional seed data. Do not enter real
customer details or run destructive journeys against production.

Record:

- Review date and tester
- Commit or pull request reviewed
- Operating system and version
- Browser and version
- Screen reader or other assistive technology and version
- Device and viewport for mobile checks
- Checks that could not be completed and why

Prepare the application:

```bash
npm run db:up
npm run db:deploy
npm run db:seed
npm run dev
```

Run the automated baseline before manual testing:

```bash
npm run test:a11y
npm run test:e2e
```

Automated results must be recorded, but a passing scan does not make a manual check pass.

## Required Routes And States

| Journey             | Required routes or areas | States to review                                                                       |
| ------------------- | ------------------------ | -------------------------------------------------------------------------------------- |
| Public information  | `/`, `/pricing`          | Normal navigation, responsive layout, calls to action                                  |
| Authentication      | `/login`, `/register`    | Normal, invalid submission, safe error, successful navigation                          |
| Customer dashboard  | `/dashboard`             | Summary, property list, add-property disclosure, success and error feedback            |
| Property management | Customer property cards  | Edit disclosure, validation, deactivation confirmation, empty state where available    |
| Bin management      | Customer property cards  | Expanded management, add, edit, removal confirmation, success and error feedback       |
| Worker operations   | `/worker`                | Run-board scanning, status update, note entry, success and invalid transition feedback |

Use fictional seeded accounts from the development documentation. If a state is unavailable, mark it
`Not tested` with the reason rather than treating it as a pass.

## Keyboard-Only Review

Complete each core journey without a mouse, trackpad, or touch input.

1. Reload the route and begin from the browser chrome or address bar.
2. Use `Tab` and `Shift+Tab` through every interactive element.
3. Confirm focus order follows the visual and reading order.
4. Confirm every focused element has a persistent, visible indicator.
5. Activate links, buttons, disclosures, selects, checkboxes, and submission controls using their
   expected keyboard commands.
6. Confirm no component traps focus and no hidden control receives focus.
7. Trigger validation errors and confirm focus and error placement make the next action clear.
8. Complete at least one successful customer mutation and one worker status update.
9. Confirm destructive actions require explicit confirmation and can be cancelled safely.

Record the first affected control and the exact route when a journey fails.

## Native Zoom And Reflow

Use the browser's native zoom control rather than changing only the responsive viewport.

1. Start from a desktop viewport at 100% zoom.
2. Increase native browser zoom to 200% on every required route.
3. Confirm text is not clipped, overlapped, or hidden.
4. Confirm controls and status text remain available without two-dimensional scrolling. Horizontal
   scrolling is acceptable only for content that genuinely requires it and remains labelled.
5. Confirm sticky navigation does not obscure the focused control or route heading.
6. Repeat the longest expanded dashboard and run-board states.

Record the browser, starting viewport, zoom level, route, and any content that becomes unavailable.

## Screen-Reader Spot Checks

Use at least one supported desktop combination and record it, for example VoiceOver with Safari on
macOS or NVDA with Firefox/Chrome on Windows.

For every core journey:

1. Confirm the page title or primary heading identifies the new route after navigation.
2. Review the landmark and heading lists for a meaningful hierarchy.
3. Confirm links and buttons have understandable names without surrounding visual context.
4. Confirm inputs expose their visible labels, required state, current value, and relevant help.
5. Trigger a form error and confirm the error is announced and associated with the affected field.
6. Expand and collapse dashboard disclosures and confirm their state is announced.
7. Submit a successful customer or worker update and confirm the live status message is announced.
8. Confirm status meaning is available as text rather than colour alone.

This is a focused product review, not exhaustive screen-reader compatibility testing. Record the
commands and assistive-technology combination used so the result can be reproduced.

## Forced Colours And Contrast

Prefer native Windows High Contrast or forced-colours mode when available. Browser emulation may be
used as supporting evidence but must be identified as emulation.

- Confirm text and essential icons remain visible.
- Confirm focus indicators remain distinguishable.
- Confirm selected, active, error, and disabled states remain understandable without background
  colour alone.
- Confirm form boundaries and destructive actions remain identifiable.
- Record any component state that was not available in the seeded journey.

Use a contrast analyser for a specific colour pair when required. Record the measured colours, font
size/weight, ratio, and expected threshold.

## Mobile And Touch Review

Use a representative physical phone when available and record the model, operating system, browser,
orientation, and text-size settings. Responsive desktop emulation is useful but does not replace the
physical-device result.

- Review portrait and landscape orientation.
- Confirm there is no unexpected horizontal document overflow.
- Confirm controls can be activated without accidental neighbouring activation.
- Confirm form fields are not obscured by the on-screen keyboard.
- Confirm zoom and text enlargement do not remove essential actions.
- Confirm the customer dashboard and worker run board remain scannable in their longest states.

## Recording Findings

Use one row in the review template for each distinct finding. Create a GitHub issue for every finding
that is not resolved during the review and apply the `accessibility` and `testing` labels.

| Severity | Use when                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| Critical | A core journey is impossible for keyboard or assistive-technology users, or content is completely unavailable. |
| High     | A major task is blocked or seriously misleading without a practical workaround.                                |
| Medium   | The task remains possible, but operation, comprehension, or recovery is meaningfully harder.                   |
| Low      | A limited inconsistency or improvement with little immediate task impact.                                      |

Each finding must include the route, state, environment, reproduction steps, expected result, actual
result, severity, evidence, and follow-up issue link.

## Completion Rules

A review is complete when:

- All required journeys have a result for keyboard, native zoom, screen reader, and mobile/touch.
- Forced-colours testing is complete or explicitly recorded as unavailable.
- Automated results and manual results are recorded separately.
- Every failure has a severity and follow-up issue.
- Unavailable checks and untested states are visible rather than implied to pass.
- The report repeats that it is not a formal accessibility certification.
