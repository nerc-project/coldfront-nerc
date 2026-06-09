# Frontend Tests

How to run the chart and UI tests.

## Setup

From `src/static/`:

```bash
npm install
```

For visual tests (Playwright), install the browser once:

```bash
npx playwright install chromium
```

## Running Tests

All commands run from `src/static/`:

**Unit tests** (Vitest, tests chart logic like missing data, daily calculations, responsive tick intervals):

```bash
npm run test:unit
```

**Unit tests in watch mode** (re-runs on file changes):

```bash
npx vitest
```

**Visual tests** (Playwright, loads the chart in a browser and checks rendering at different breakpoints):

```bash
npm run test:visual
```

**Both unit and visual tests:**

```bash
npm test
```

## Visual Test Notes

The first time you run visual tests, Playwright creates baseline screenshots in `tests/visual/snapshots/`.

If you intentionally change how the chart looks and need to refresh the baselines:

```bash
npx playwright test tests/visual --update-snapshots
```

To see the browser while tests run (useful for debugging):

```bash
npx playwright test tests/visual --headed
```
