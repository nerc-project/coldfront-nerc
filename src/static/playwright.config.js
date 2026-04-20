import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/visual',
  outputDir: 'tests/visual/test-results',
  snapshotDir: 'tests/visual/snapshots',
  use: {
    // Load fixture files directly — no running server needed
    baseURL: 'file://' + process.cwd() + '/tests/fixtures',
    // Consistent 2x scale for crisp screenshot snapshots without inflating
    // the canvas resolution in production code
    deviceScaleFactor: 2,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});