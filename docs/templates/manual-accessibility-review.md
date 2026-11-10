# BinRun Manual Accessibility Review

This report records a point-in-time manual review. It complements automated checks and is not a
formal WCAG certification or a substitute for testing with disabled users.

## Review Metadata

| Field                         | Value                               |
| ----------------------------- | ----------------------------------- |
| Review date                   |                                     |
| Tester                        |                                     |
| Commit or pull request        |                                     |
| Application environment       | Local disposable test data / other: |
| Operating system              |                                     |
| Browser and version           |                                     |
| Screen reader and version     |                                     |
| Mobile device and browser     |                                     |
| Native zoom starting viewport |                                     |

## Automated Baseline

| Command             | Result                | Evidence or notes |
| ------------------- | --------------------- | ----------------- |
| `npm run test:a11y` | Pass / Fail / Not run |                   |
| `npm run test:e2e`  | Pass / Fail / Not run |                   |

Automated results do not determine the outcome of the manual checks below.

## Manual Results

Use `Pass`, `Fail`, or `Not tested`. Add a finding identifier or explanation for every result that is
not `Pass`.

| Journey             | Keyboard only | Native 200% zoom | Screen reader | Mobile/touch | Forced colours | Notes or finding IDs |
| ------------------- | ------------- | ---------------- | ------------- | ------------ | -------------- | -------------------- |
| Landing page        |               |                  |               |              |                |                      |
| Pricing             |               |                  |               |              |                |                      |
| Login               |               |                  |               |              |                |                      |
| Registration        |               |                  |               |              |                |                      |
| Customer dashboard  |               |                  |               |              |                |                      |
| Property management |               |                  |               |              |                |                      |
| Bin management      |               |                  |               |              |                |                      |
| Worker run board    |               |                  |               |              |                |                      |

## State Coverage

| State                       | Routes or journeys reviewed | Result and notes |
| --------------------------- | --------------------------- | ---------------- |
| Normal                      |                             |                  |
| Empty                       |                             |                  |
| Validation error            |                             |                  |
| Authorization or safe error |                             |                  |
| Pending or submitting       |                             |                  |
| Success feedback            |                             |                  |
| Destructive confirmation    |                             |                  |

## Findings

| ID       | Severity                       | Route and state | Environment | Reproduction steps | Expected | Actual | Evidence | Follow-up issue |
| -------- | ------------------------------ | --------------- | ----------- | ------------------ | -------- | ------ | -------- | --------------- |
| A11Y-001 | Critical / High / Medium / Low |                 |             |                    |          |        |          |                 |

## Unavailable Or Deferred Checks

Record the check, affected scope, reason, and intended follow-up. Do not treat an unavailable check as
a pass.

| Check | Scope | Reason unavailable | Follow-up |
| ----- | ----- | ------------------ | --------- |
|       |       |                    |           |

## Summary

- Overall result: Pass / Pass with findings / Further review required
- Critical findings:
- High findings:
- Medium findings:
- Low findings:
- Follow-up issues created:
- Limitations:

## Review Confirmation

- [ ] Required routes and states were reviewed or explicitly marked `Not tested`.
- [ ] Automated and manual evidence are recorded separately.
- [ ] Every unresolved finding has a severity and follow-up.
- [ ] No real customer data or credentials appear in this report.
- [ ] The report does not claim formal accessibility certification.
