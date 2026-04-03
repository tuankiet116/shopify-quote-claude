import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/auth.setup.ts'],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001/build/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'standalone',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: [
            '--disable-web-security',
            '--ignore-certificate-errors',
          ],
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001/build/',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
