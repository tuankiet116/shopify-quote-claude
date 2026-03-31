import { test } from './fixtures/shopify';

test('screenshot homepage wide', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3001/build/');
  await page.locator('#app').waitFor({ state: 'visible' });
  await page.screenshot({ path: 'e2e/screenshots/homepage-wide.png', fullPage: true });
});
