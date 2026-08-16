import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// .env lives at the repo root and is shared with part3
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default defineConfig({
  testDir: './tests',
  // Every test drives the same live account and the same shared test video
  // on a real third-party SaaS app (not a local server under our control).
  // Running many sessions in parallel against it overloads the editor's own
  // boot time and causes failures that have nothing to do with the app
  // itself, so tests run one at a time for reliability.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  // The real login -> dashboard -> editor flow, including the editor's own
  // canvas engine boot time, comfortably exceeds Playwright's 30s default.
  timeout: 60_000,

  use: {
    baseURL: process.env.TRUPEER_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // expect() calls (e.g. toBeVisible()) auto-retry against this timeout
  // instead of using waitForTimeout()/sleep().
  expect: {
    timeout: 5_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
