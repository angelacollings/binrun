# Accessibility And UX Baseline

This checklist keeps the MVP usable for busy households and people who may need
extra assistance. Update it when a page, form, workflow, or visual pattern is added.

## Current Baseline

- [x] The launch page has a single visible `h1`.
- [x] The default Next.js route announcer can use the document title or page heading.
- [x] ESLint is enabled for React and Next.js rules.
- [x] E2E smoke coverage checks the launch-page heading, key copy, service signup, and shared login.
- [ ] Automated accessibility checks are wired into Playwright.
- [ ] Manual keyboard and screen reader checks are documented per core flow.

## Page Checklist

- [ ] Each page has one clear `h1` and a unique, descriptive title.
- [ ] The primary action is visible without relying on instructions elsewhere.
- [ ] Empty, loading, success, and error states are present where data can vary.
- [ ] Status information is not conveyed by colour alone.
- [ ] Text contrast meets WCAG AA.
- [ ] Layout remains readable at mobile widths and at 200% browser zoom.
- [ ] Interactive targets are large enough for touch use.
- [ ] Motion is minimal and respects reduced-motion preferences.

## Form Checklist

- [ ] Every input has a visible label.
- [ ] Required fields are identified in text.
- [ ] Field errors are placed next to the relevant field.
- [ ] Error summaries link or move focus to the first invalid field where useful.
- [ ] Forms can be completed with keyboard only.
- [ ] Validation happens server-side as well as client-side.
- [ ] Autocomplete attributes are used for common personal and address fields.
- [ ] Buttons clearly indicate pending/submitting states.

## Keyboard And Focus Checklist

- [ ] All interactive controls are reachable with `Tab`.
- [ ] Focus order follows the visual order.
- [ ] Focus styles are visible against the page background.
- [ ] Dialogs trap focus and return it to the opener when closed.
- [ ] Escape closes dismissible overlays.
- [ ] Links navigate; buttons perform actions.

## Core Flow Review

| Flow                | Status    | Required checks                                                       |
| ------------------- | --------- | --------------------------------------------------------------------- |
| Launch page         | Built     | Heading, copy, mobile layout, colour contrast.                        |
| Login/register      | Built     | Labelled email/address fields, safe errors, keyboard flow.            |
| Property management | Not built | Address autocomplete/manual entry, validation, empty states.          |
| Bin selection       | Not built | Clear bin names, non-colour status, review before save.               |
| Dashboard           | Not built | Collection schedule readability, subscription state, mobile scanning. |
| Checkout            | Not built | Clear cost, cancellation path, success/failure states.                |
| Admin dashboard     | Not built | Dense operational views remain keyboard navigable and readable.       |

## Pre-Launch Review

- [ ] Run Playwright smoke tests.
- [ ] Run automated accessibility tests once configured.
- [ ] Complete each MVP form with keyboard only.
- [ ] Check light and dark mode contrast.
- [ ] Check mobile viewport layout for every core page.
- [ ] Check browser zoom at 200%.
- [ ] Spot-check with a screen reader for route changes, headings, labels, and error messages.
