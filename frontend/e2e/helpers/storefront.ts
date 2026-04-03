import type { Page, Locator } from '@playwright/test';

declare global {
  interface Window {
    Shopify?: {
      currency?: { active?: string; rate?: string };
      locale?: string;
      country?: string;
      shop?: string;
    };
  }
}

export const STORE_URL = 'https://kietdt-claude-store.myshopify.com';
export const STORE_PASSWORD = '1';

export async function bypassPasswordPage(page: Page) {
  await page.goto(STORE_URL);

  const passwordInput = page.locator('input[type="password"]');
  if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await passwordInput.fill(STORE_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.includes('/password'));
  }
}

export async function navigateToProductPage(page: Page) {
  await page.goto(`${STORE_URL}/collections/all`);
  const productUrl = await page.locator('a[href*="/products/"]').first().getAttribute('href');
  if (!productUrl) throw new Error('No product found on collection page');
  await page.goto(`${STORE_URL}${productUrl}`);
  await page.locator('[data-quote-button]').waitFor({ state: 'visible', timeout: 10_000 });
}

export async function navigateToCollectionPage(page: Page) {
  await page.goto(`${STORE_URL}/collections/all`);
  await page.locator('[data-quote-button]').first().waitFor({ state: 'visible', timeout: 10_000 });
}

/**
 * Click a quote button using JS dispatchEvent.
 * Shopify custom elements (product-form-component) can intercept pointer events
 * in Playwright's actionability checks even when the button is visually clickable.
 * Using JS click bypasses this Playwright-specific limitation.
 */
export async function clickQuoteButton(locator: Locator) {
  await locator.dispatchEvent('click');
}
