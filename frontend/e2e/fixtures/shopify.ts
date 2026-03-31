import { test as base } from '@playwright/test';

const STANDALONE_URL = 'http://localhost:3001/build/';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto(STANDALONE_URL);
    await page.locator('#app').waitFor({ state: 'visible', timeout: 10_000 });
    await use(page);
  },
});

export { expect } from '@playwright/test';
