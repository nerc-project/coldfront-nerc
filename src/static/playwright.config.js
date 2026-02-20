import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/visual',
  outputDir: 'tests/visual/test-results',
  snapshotDir: 'tests/visual/snapshots',
  use: {
    // Load fixture files directly — no running server needed
    baseURL: 'file://' + process.cwd() + '/tests/fixtures',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});