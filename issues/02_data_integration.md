---
title: "Chart Refactor: Data Integration"
labels: ["data", "backend-integration", "charting"]
assignees: []
---

## Description
Implement robust data handling for the chart, including interpolation of missing values and proper dataset mapping.

## Tasks
- [ ] Standardize the data structure passed from the backend to the frontend.
- [ ] Implement `interpolateMissingData` logic in `chart_tooltip.js` or `allocation_detail.js` to handle `null` values.
- [ ] Ensure datasets correctly map to:
  - CPU (Teal)
  - GPU H100 (Orange)
  - GPU V100 (Purple)
- [ ] Add logic to flag "missing" data points so they can be styled differently (e.g., grayscale).
- [ ] Pass backend data (e.g., attribute lengths, notes lengths) via `data-` attributes instead of Django template tags in JS.

## Acceptance Criteria
- [ ] Missing data points are mathematically interpolated.
- [ ] Data sets utilize the correct color schemes.
- [ ] The chart handles completely empty or partial datasets gracefully.

