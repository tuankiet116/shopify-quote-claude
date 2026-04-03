import { test, expect } from '@playwright/test';
import {
  bypassPasswordPage,
  clickQuoteButton,
  STORE_URL,
} from './helpers/storefront';

/**
 * Switch the store's country/currency via Shopify's /localization endpoint.
 * This is the same mechanism used by Shopify's region selector form.
 */
async function switchCountry(page: import('@playwright/test').Page, countryCode: string) {
  await page.evaluate(async (code) => {
    const formData = new FormData();
    formData.append('form_type', 'localization');
    formData.append('_method', 'put');
    formData.append('country_code', code);
    await fetch('/localization', { method: 'POST', body: formData, redirect: 'follow' });
  }, countryCode);
}

async function getDrawerPrice(page: import('@playwright/test').Page): Promise<string> {
  await clickQuoteButton(page.locator('[data-quote-button]'));
  await expect(page.locator('.quote-drawer-item')).toBeVisible({ timeout: 5_000 });
  return (await page.locator('.quote-drawer-item-price').first().textContent()) || '';
}

async function clearDrawerAndClose(page: import('@playwright/test').Page) {
  const removeBtn = page.locator('.quote-drawer-item-remove').first();
  if (await removeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await removeBtn.click();
  }
  const closeBtn = page.locator('.quote-drawer-close');
  if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await closeBtn.click();
  }
  await page.waitForTimeout(300);
}

test.describe('Storefront Currency Handling', () => {
  test.beforeEach(async ({ page }) => {
    await bypassPasswordPage(page);
  });

  test.afterEach(async ({ page }) => {
    // Reset to US/USD
    await switchCountry(page, 'US');
  });

  test('default USD currency shows in quote drawer price', async ({ page }) => {
    await page.goto(`${STORE_URL}/products/gift-card`);
    await page.locator('[data-quote-button]').waitFor({ state: 'visible', timeout: 10_000 });

    const currency = await page.evaluate(() => window.Shopify?.currency?.active);
    expect(currency).toBe('USD');

    const priceText = await getDrawerPrice(page);
    expect(priceText).toContain('USD');
  });

  test('switching to Canada shows CAD in quote drawer', async ({ page }) => {
    // Switch to Canada
    await switchCountry(page, 'CA');
    await page.goto(`${STORE_URL}/products/gift-card`);
    await page.locator('[data-quote-button]').waitFor({ state: 'visible', timeout: 10_000 });

    const currency = await page.evaluate(() => window.Shopify?.currency?.active);
    expect(currency).toBe('CAD');

    const rate = await page.evaluate(() => parseFloat(window.Shopify?.currency?.rate || '1'));
    expect(rate).toBeGreaterThan(1);

    const priceText = await getDrawerPrice(page);
    expect(priceText).toContain('CAD');
    expect(priceText).not.toContain('USD');
  });

  test('CAD price amount is higher than USD (converted by exchange rate)', async ({ page }) => {
    // Get USD price
    await page.goto(`${STORE_URL}/products/gift-card`);
    await page.locator('[data-quote-button]').waitFor({ state: 'visible', timeout: 10_000 });
    const usdPrice = await getDrawerPrice(page);
    const usdAmount = parseFloat(usdPrice.replace(/[^0-9.]/g, ''));
    expect(usdAmount).toBeGreaterThan(0);
    await clearDrawerAndClose(page);

    // Switch to CAD
    await switchCountry(page, 'CA');
    await page.goto(`${STORE_URL}/products/gift-card`);
    await page.locator('[data-quote-button]').waitFor({ state: 'visible', timeout: 10_000 });

    const cadPrice = await getDrawerPrice(page);
    const cadAmount = parseFloat(cadPrice.replace(/[^0-9.]/g, ''));

    // CAD should be higher (CAD/USD rate > 1)
    expect(cadAmount).toBeGreaterThan(usdAmount);
  });

  test('switching back to USD restores original currency label', async ({ page }) => {
    // Start with CAD
    await switchCountry(page, 'CA');
    await page.goto(`${STORE_URL}/products/gift-card`);
    await page.locator('[data-quote-button]').waitFor({ state: 'visible', timeout: 10_000 });
    const cadPrice = await getDrawerPrice(page);
    expect(cadPrice).toContain('CAD');
    await clearDrawerAndClose(page);

    // Switch back to USD
    await switchCountry(page, 'US');
    await page.goto(`${STORE_URL}/products/gift-card`);
    await page.locator('[data-quote-button]').waitFor({ state: 'visible', timeout: 10_000 });
    const usdPrice = await getDrawerPrice(page);
    expect(usdPrice).toContain('USD');
  });

  test('quote form submission sends correct CAD currency in payload', async ({ page }) => {
    await switchCountry(page, 'CA');
    await page.goto(`${STORE_URL}/products/gift-card`);
    await page.locator('[data-quote-button]').waitFor({ state: 'visible', timeout: 10_000 });

    // Open drawer and go to form
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-item')).toBeVisible({ timeout: 5_000 });
    await page.locator('.quote-drawer-submit').click();
    await expect(page.locator('.quote-form')).toBeVisible();

    // Intercept the API request
    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/api/storefront/quotes') && req.method() === 'POST',
      { timeout: 15_000 },
    );

    await page.locator('.quote-form-field input[type="text"]').first().fill('CAD Test');
    await page.locator('.quote-form-field input[type="email"]').fill('cad@test.com');
    await page.locator('.quote-form-submit').click();

    const request = await requestPromise;
    const body = JSON.parse(request.postData() || '{}');

    // Both top-level and item currency must be CAD
    expect(body.currency).toBe('CAD');
    expect(body.items[0].currency).toBe('CAD');
    expect(parseFloat(body.items[0].price)).toBeGreaterThan(0);
  });
});
