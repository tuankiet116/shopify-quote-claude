import { test, expect } from './fixtures/shopify';

test.describe('Routing', () => {
  test('app loads at standalone URL', async ({ page }) => {
    await expect(page.locator('#app')).toBeVisible();
  });
});
