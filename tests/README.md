# Allocation Detail Tests

This folder contains JavaScript tests for the allocation detail costs table.

## Run tests

From the repo root:

```bash
npm test
```

Or run the files directly:

```bash
node --test tests/allocation_detail_js.test.mjs tests/allocation_detail_template.test.mjs
```

## Why we test both HTML and JavaScript

The feature depends on both parts at the same time:

- HTML/template provides DOM elements and charge payload
- JavaScript reads that payload and builds the table rows

Testing only one side misses real failures.  
Example: JS logic may be correct, but a renamed template ID still breaks the page.
