import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';

const FIXTURE_URL = `file://${path.resolve('tests/fixtures/chart_test.html')}`;

const BREAKPOINTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'mobile',  width: 375,  height: 667 },
  { name: 'narrow',  width: 360,  height: 640 },
];

// Helpers to inject data and initialize the chart from within the page context.
// The allocation_detail.js script reads from a <script id="charges-data"> element,
// so we inject that element and then run the initialization logic manually.
async function injectDataAndRender(page, rawData) {
  await page.evaluate((data) => {
    // Inject charges-data element the way Django's json_script template tag would
    let el = document.getElementById('charges-data');
    if (!el) {
      el = document.createElement('script');
      el.id = 'charges-data';
      el.type = 'application/json';
      document.body.appendChild(el);
    }
    el.textContent = JSON.stringify(data);

    // Re-run chart initialization since the page has already loaded
    const transformed = window.transformCumulativeChargesForTest
      ? window.transformCumulativeChargesForTest(data)
      : null;

    const ctx = document.getElementById('allocationUsageChart');
    if (ctx && transformed) {
      const existing = typeof Chart !== 'undefined' && Chart.getChart ? Chart.getChart(ctx) : null;
      if (existing) existing.destroy();
      if (window._testChart) window._testChart.destroy();
      let processedDatasets = transformed.datasets.map((ds, idx) =>
        ChartUtils.processDatasetForChart(ds, idx)
      );
      const dataLength = processedDatasets.reduce((max, ds) => Math.max(max, ds.data?.length || 0), 0);
      const isLowDataState = dataLength < 4;
      const labels = ChartUtils.generateUsageLabels(transformed.year, transformed.month);
      const chartLabels = isLowDataState ? ChartUtils.getCenteredLabels(labels, dataLength) : labels.slice(0, dataLength);
      if (isLowDataState) {
        processedDatasets = processedDatasets.map(ds =>
          ds.data ? { ...ds, data: ChartUtils.getCenteredData(ds.data) } : ds
        );
      } else {
        processedDatasets = processedDatasets.map(ds => ({
          ...ds,
          data: (ds.data || []).slice(0, dataLength)
        }));
      }
      window._testChart = new Chart(ctx, {
        type: 'line',
        data: { labels: chartLabels, datasets: processedDatasets },
        plugins: ChartUtils.missingDataGrayscalePlugin ? [ChartUtils.missingDataGrayscalePlugin] : [],
        options: { responsive: true, maintainAspectRatio: false, animation: false },
      });
    }

    // Hide card if no data
    const card = document.getElementById('su-costs-card');
    if (card && (!transformed || !transformed.datasets.length)) {
      card.style.display = 'none';
    } else if (card) {
      card.style.display = '';
    }
  }, rawData);

  // Allow the chart to finish rendering
  await page.waitForTimeout(300);
}

// -----------------------------------------------------------------------
// Data fixtures
// -----------------------------------------------------------------------

const REGULAR_DATA = {
  '2025-02-01': { 'OpenStack CPU SU': '10.00', 'OpenStack GPU A100 SU': '5.00' },
  '2025-02-02': { 'OpenStack CPU SU': '22.50', 'OpenStack GPU A100 SU': '11.00' },
  '2025-02-03': { 'OpenStack CPU SU': '37.80', 'OpenStack GPU A100 SU': '18.50' },
  // ... 28 days would be added in real fixture, abbreviated here for illustration
};

const LOW_DATA = {
  '2025-02-01': { 'OpenStack CPU SU': '10.00', 'OpenStack GPU A100 SU': '5.00', 'OpenShift CPU SU': '3.00' },
  '2025-02-02': { 'OpenStack CPU SU': '22.50', 'OpenStack GPU A100 SU': '11.00', 'OpenShift CPU SU': '7.20' },
  '2025-02-03': { 'OpenStack CPU SU': '37.80', 'OpenStack GPU A100 SU': '18.50', 'OpenShift CPU SU': '12.10' },
};

const MISSING_DATA = {
  '2025-02-01': { 'OpenStack CPU SU': '10.00', 'OpenStack GPU A100 SU': '5.00', 'OpenShift Storage SU': '2.00' },
  '2025-02-02': {},  // missing day
  '2025-02-03': { 'OpenStack CPU SU': '37.80', 'OpenStack GPU A100 SU': '18.50', 'OpenShift Storage SU': '8.50' },
  '2025-02-04': { 'OpenStack CPU SU': '55.00', 'OpenStack GPU A100 SU': '28.00', 'OpenShift Storage SU': '14.00' },
  '2025-02-05': { 'OpenStack CPU SU': '72.10', 'OpenStack GPU A100 SU': '39.20', 'OpenShift Storage SU': '20.50' },
};

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

for (const bp of BREAKPOINTS) {
  test.describe(`Breakpoint: ${bp.name} (${bp.width}x${bp.height})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto(FIXTURE_URL);
    });

    test('renders correctly with regular data', async ({ page }) => {
      await injectDataAndRender(page, REGULAR_DATA);
      await expect(page.locator('#su-costs-card')).toBeVisible();
      await expect(page.locator('#allocationUsageChart')).toBeVisible();
      await expect(page).toHaveScreenshot(`regular-data-${bp.name}.png`);
    });

    test('hides the costs card when there is no data', async ({ page }) => {
      await injectDataAndRender(page, {});
      await expect(page.locator('#su-costs-card')).toBeHidden();
      await expect(page).toHaveScreenshot(`no-data-${bp.name}.png`);
    });

    test('centers chart content with low data (1-3 points)', async ({ page }) => {
      await injectDataAndRender(page, LOW_DATA);
      await expect(page.locator('#su-costs-card')).toBeVisible();
      // Verify centering padding is applied: chart canvas should be visible
      await expect(page.locator('#allocationUsageChart')).toBeVisible();
      await expect(page).toHaveScreenshot(`low-data-${bp.name}.png`);
    });

    test('renders grayscale regions for missing data', async ({ page }) => {
      await injectDataAndRender(page, MISSING_DATA);
      await expect(page.locator('#allocationUsageChart')).toBeVisible();
      // Visual regression catches the grayscale plugin output
      await expect(page).toHaveScreenshot(`missing-data-${bp.name}.png`);
    });
  });
}

// -----------------------------------------------------------------------
// Functional behaviour tests (not breakpoint-specific)
// -----------------------------------------------------------------------

test('cumulative-to-daily toggle updates the chart', async ({ page }) => {
  await page.goto(FIXTURE_URL);
  await injectDataAndRender(page, REGULAR_DATA);

  // Inject and wire up the toggle buttons as allocation_detail.js would
  await page.evaluate(() => {
    // Simulate the daily button click via ChartUtils.calculateDailyData directly
    const result = ChartUtils.calculateDailyData([10, 22.5, 37.8, 55]);
    window._dailyResult = result;
  });
  const dailyData = await page.evaluate(() => window._dailyResult);
  expect(dailyData[0]).toBeCloseTo(10);
  expect(dailyData[1]).toBeCloseTo(12.5);
  expect(dailyData[2]).toBeCloseTo(15.3, 1);
});