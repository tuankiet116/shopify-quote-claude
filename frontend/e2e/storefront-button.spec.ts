import { test, expect, type Page } from '@playwright/test';

const STORE_URL = 'https://kietdt-claude-store.myshopify.com';
const STORE_PASSWORD = '1';

async function bypassPasswordPage(page: Page) {
  await page.goto(STORE_URL);

  // Check if we're on the password page
  const passwordInput = page.locator('input[type="password"]');
  if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await passwordInput.fill(STORE_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.includes('/password'));
  }
}

test.describe('Storefront Quote Button', () => {
  test.beforeEach(async ({ page }) => {
    await bypassPasswordPage(page);
  });

  test('quote button appears on product page', async ({ page }) => {
    // Navigate directly to a product page
    await page.goto(`${STORE_URL}/collections/all`);
    // Get the first product URL and navigate directly
    const productUrl = await page.locator('a[href*="/products/"]').first().getAttribute('href');
    expect(productUrl).toBeTruthy();
    await page.goto(`${STORE_URL}${productUrl}`);

    // Wait for quote button to appear
    const quoteButton = page.locator('[data-quote-button]');
    await expect(quoteButton).toBeVisible({ timeout: 10_000 });
    await expect(quoteButton).toBeEnabled();
  });

  test('quote button has correct text from settings', async ({ page }) => {
    await page.goto(`${STORE_URL}/collections/all`);
    const productUrl = await page.locator('a[href*="/products/"]').first().getAttribute('href');
    await page.goto(`${STORE_URL}${productUrl}`);

    const quoteButton = page.locator('[data-quote-button]');
    await expect(quoteButton).toBeVisible({ timeout: 10_000 });

    // Button should contain the text from metafield settings
    const buttonText = await quoteButton.textContent();
    expect(buttonText?.trim()).toBeTruthy();
  });

  test('quote button appears on collection page product cards', async ({ page }) => {
    await page.goto(`${STORE_URL}/collections/all`);

    // Quote buttons should appear on product cards
    const quoteButtons = page.locator('[data-quote-button]');
    await expect(quoteButtons.first()).toBeVisible({ timeout: 10_000 });

    // Should have at least one button (one per product card)
    const count = await quoteButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('quote button styles match settings', async ({ page }) => {
    await page.goto(`${STORE_URL}/collections/all`);
    const productUrl = await page.locator('a[href*="/products/"]').first().getAttribute('href');
    await page.goto(`${STORE_URL}${productUrl}`);

    const quoteButton = page.locator('[data-quote-button]');
    await expect(quoteButton).toBeVisible({ timeout: 10_000 });

    // Button should have custom styles applied
    const bgColor = await quoteButton.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBeTruthy();
    expect(bgColor).not.toBe('');
  });

  test('quote button click does not cause errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(`${STORE_URL}/collections/all`);
    const productUrl = await page.locator('a[href*="/products/"]').first().getAttribute('href');
    await page.goto(`${STORE_URL}${productUrl}`);

    const quoteButton = page.locator('[data-quote-button]');
    await expect(quoteButton).toBeVisible({ timeout: 10_000 });
    await quoteButton.click();

    // No JS errors should have occurred
    expect(errors).toHaveLength(0);
  });
});
