/**
 * Unit tests for chart_utils.js.
 * We test these because the chart needs to behave correctly when data is missing,
 * sparse, or empty. Bugs here cause wrong numbers on screen or broken layouts.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadChartUtils() {
  const dom = new JSDOM('', { runScripts: 'dangerously' });
  const scriptPath = join(__dirname, '../../js/chart_utils.js');
  const script = readFileSync(scriptPath, 'utf8');
  dom.window.eval(script + '\nif (typeof ChartUtils !== "undefined") { window.ChartUtils = ChartUtils; }');
  return dom.window.ChartUtils;
}
const ChartUtils = loadChartUtils();

// When the backend has gaps (e.g. a day with no charges), we fill them so the line
// still draws. We must remember which points were filled so the chart can grey them out.
describe('interpolateMissingData', () => {
  it('returns data unchanged when no nulls are present', () => {
    const { data } = ChartUtils.interpolateMissingData([10, 20, 30]);
    expect(data).toEqual([10, 20, 30]);
  });

  it('fills a single null with midpoint between neighbours', () => {
    const { data, missingIndices } = ChartUtils.interpolateMissingData([10, null, 30]);
    expect(data[1]).toBe(20);
    expect(missingIndices.has(1)).toBe(true);
  });

  it('fills leading null with the first valid value', () => {
    const { data } = ChartUtils.interpolateMissingData([null, null, 30]);
    expect(data[0]).toBe(30);
    expect(data[1]).toBe(30);
  });

  it('fills trailing null with the last valid value', () => {
    const { data } = ChartUtils.interpolateMissingData([10, null, null]);
    expect(data[1]).toBe(10);
    expect(data[2]).toBe(10);
  });

  it('returns zeros when all data is null (no data state)', () => {
    const { data } = ChartUtils.interpolateMissingData([null, null, null]);
    expect(data).toEqual([0, 0, 0]);
  });

  it('tracks multiple discontiguous missing regions', () => {
    const { missingIndices } = ChartUtils.interpolateMissingData([10, null, 30, null, 50]);
    expect(missingIndices.has(1)).toBe(true);
    expect(missingIndices.has(3)).toBe(true);
    expect(missingIndices.has(0)).toBe(false);
  });
});

// Cumulative costs become daily costs by taking the difference between consecutive days.
// This powers the "Daily" view toggle. Wrong maths here shows wrong dollar amounts.
describe('calculateDailyData', () => {
  it('returns the first value as-is (day 1 delta)', () => {
    const result = ChartUtils.calculateDailyData([100, 150, 200]);
    expect(result[0]).toBe(100);
  });

  it('computes differences between consecutive values', () => {
    const result = ChartUtils.calculateDailyData([100, 150, 200]);
    expect(result[1]).toBe(50);
    expect(result[2]).toBe(50);
  });

  it('propagates null when a value is missing (missing data state)', () => {
    const result = ChartUtils.calculateDailyData([100, null, 200]);
    expect(result[1]).toBeNull();
    expect(result[2]).toBeNull(); // can't diff against a null predecessor
  });

  it('handles a single-point dataset (low data state)', () => {
    const result = ChartUtils.calculateDailyData([42]);
    expect(result).toEqual([42]);
  });

  it('handles empty input (no data state)', () => {
    const result = ChartUtils.calculateDailyData([]);
    expect(result).toEqual([]);
  });
});

// With only 1–3 data points, the chart looks lopsided. We pad with empty slots so the
// line sits in the middle. These helpers align labels and data for that layout.
describe('getCenteredLabels', () => {
  const labels = ['Jan 1', 'Jan 2', 'Jan 3'];

  it('pads 1 data point with empty strings on each side', () => {
    const result = ChartUtils.getCenteredLabels(labels, 1);
    expect(result).toEqual(['', 'Jan 1', '']);
  });

  it('returns labels unchanged when dataLength >= 4', () => {
    const fourLabels = ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4'];
    const result = ChartUtils.getCenteredLabels(fourLabels, 4);
    expect(result).toEqual(fourLabels);
  });
});

// Same centering idea but for the data values: nulls on the sides so the line is centred.
describe('getCenteredData', () => {
  it('wraps a single point in nulls', () => {
    expect(ChartUtils.getCenteredData([5])).toEqual([null, 5, null]);
  });

  it('wraps two points in nulls', () => {
    expect(ChartUtils.getCenteredData([5, 10])).toEqual([null, 5, 10, null]);
  });

  it('returns data unchanged for 4+ points', () => {
    const data = [1, 2, 3, 4];
    expect(ChartUtils.getCenteredData(data)).toEqual(data);
  });
});

// On small screens we show fewer date labels to avoid crowding. This decides how often
// to show a tick. Wrong intervals make the x-axis unreadable on mobile.
describe('getResponsiveTickInterval', () => {
  it('targets 4 ticks on narrow screens (<400px)', () => {
    const interval = ChartUtils.getResponsiveTickInterval(31, 350);
    expect(interval).toBe(Math.max(1, Math.ceil(31 / 4)));
  });

  it('targets 10 ticks on wide screens (>=800px)', () => {
    const interval = ChartUtils.getResponsiveTickInterval(31, 900);
    expect(interval).toBe(Math.max(1, Math.ceil(31 / 10)));
  });
});

// Legend and axis text shrink on narrow viewports so they fit. We check the breakpoints
// match the CSS so the chart stays readable on phones and tablets.
describe('getResponsiveFontSizes', () => {
  it('returns smallest sizes below 400px', () => {
    const sizes = ChartUtils.getResponsiveFontSizes(380);
    expect(sizes.legend).toBe(9);
    expect(sizes.axisTicks).toBe(8);
  });

  it('returns largest sizes at 800px and above', () => {
    const sizes = ChartUtils.getResponsiveFontSizes(1200);
    expect(sizes.legend).toBe(12);
    expect(sizes.axisTicks).toBe(11);
  });
});