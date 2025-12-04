---
title: "Chart Refactor: Tooltip & Error Handling"
labels: ["ux", "enhancement", "charting"]
assignees: []
---

## Description
Implement advanced custom tooltips to display detailed information and warnings about data quality.

## Tasks
- [ ] Move tooltip logic to `src/static/js/chart_tooltip.js`.
- [ ] Implement `externalTooltipHandler` to render custom HTML tooltips.
- [ ] Standardize missing data checks:
  - Use `isCurrentPointMissing` for row-level styling.
  - Use `doesTooltipHaveMissingData` for the footer warning.
- [ ] formatting for the error message:
  ```javascript
  errorMessage.innerHTML = 'Billing script was unavailable for this date.<br>Values shown are interpolated.';
  ```
- [ ] Ensure tooltips are positioned correctly relative to the cursor and chart boundaries.

## Acceptance Criteria
- [ ] Tooltips show exact values for valid data and "Data unavailable" for missing data.
- [ ] A warning message appears at the bottom of the tooltip if any visible dataset is missing data for that timestamp.
- [ ] Tooltips support multi-line error messages using `innerHTML`.

