---
title: "Chart Refactor: Responsiveness & Interactivity"
labels: ["ux", "responsiveness", "charting"]
assignees: []
---

## Description
Fine-tune the user experience, ensuring the chart behaves correctly on resize and provides useful interactive feedback.

## Tasks
- [ ] Fix the "shrinking chart" bug where the canvas doesn't expand after shrinking.
- [ ] Verify `responsive: true` configuration in Chart.js.
- [ ] Configure x-axis ticks to avoid overcrowding (e.g., `maxTicksLimit` or custom callback to show every 3rd day).
- [ ] Implement hover effects:
  - Gray out points that are interpolated.
  - Show custom tooltips on hover.
- [ ] Test behavior on mobile vs. desktop viewports.

## Acceptance Criteria
- [ ] Chart resizes dynamically (grows and shrinks) with the window.
- [ ] Axis labels remain readable on smaller screens.
- [ ] Interacting with the chart (hover/click) is smooth and lag-free.

