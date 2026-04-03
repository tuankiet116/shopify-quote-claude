import { test, expect } from '@playwright/test';
import {
  bypassPasswordPage,
  navigateToProductPage,
  navigateToCollectionPage,
  clickQuoteButton,
} from './helpers/storefront';

test.describe('Storefront Quote Drawer', () => {
  test.beforeEach(async ({ page }) => {
    await bypassPasswordPage(page);
  });

  // === Drawer Open/Close ===

  test('clicking quote button on product page opens the drawer', async ({ page }) => {
    await navigateToProductPage(page);

    await clickQuoteButton(page.locator('[data-quote-button]'));

    const drawer = page.locator('.quote-drawer-container--open');
    await expect(drawer).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('.quote-drawer')).toBeVisible();
    await expect(page.locator('.quote-drawer-header h3')).toHaveText('Request a Quote');
  });

  test('drawer closes when clicking the close button', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-container--open')).toBeVisible();

    await page.locator('.quote-drawer-close').click();

    await expect(page.locator('.quote-drawer-container--open')).not.toBeVisible();
  });

  test('drawer closes when clicking the overlay', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-container--open')).toBeVisible();

    await page.locator('.quote-drawer-overlay').click({ force: true });

    await expect(page.locator('.quote-drawer-container--open')).not.toBeVisible();
  });

  test('drawer closes when pressing Escape', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-container--open')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.locator('.quote-drawer-container--open')).not.toBeVisible();
  });

  // === Product Auto-Add (Product Page) ===

  test('product page: current product is auto-added to drawer on click', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));

    const itemTitle = page.locator('.quote-drawer-item-title');
    await expect(itemTitle.first()).toBeVisible({ timeout: 5_000 });
    const titleText = await itemTitle.first().textContent();
    expect(titleText?.trim()).toBeTruthy();
  });

  test('product page: item count shows in drawer footer', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));

    const subtotal = page.locator('.quote-drawer-subtotal');
    await expect(subtotal).toContainText('item');
  });

  // === Quantity Controls ===

  test('quantity can be increased with plus button', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-item')).toBeVisible();

    const qtyInput = page.locator('.quote-qty-input').first();
    await expect(qtyInput).toHaveValue('1');

    await page.locator('.quote-qty-btn').last().click();
    await expect(qtyInput).toHaveValue('2');
  });

  test('quantity can be decreased with minus button', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-item')).toBeVisible();

    // Increase first
    await page.locator('.quote-qty-btn').last().click();
    const qtyInput = page.locator('.quote-qty-input').first();
    await expect(qtyInput).toHaveValue('2');

    // Then decrease
    await page.locator('.quote-qty-btn').first().click();
    await expect(qtyInput).toHaveValue('1');
  });

  test('quantity does not go below 1', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-item')).toBeVisible();

    const qtyInput = page.locator('.quote-qty-input').first();
    await expect(qtyInput).toHaveValue('1');

    // Try to decrease below 1
    await page.locator('.quote-qty-btn').first().click();
    await expect(qtyInput).toHaveValue('1');
  });

  // === Remove Item ===

  test('item can be removed from drawer', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-item')).toBeVisible();

    await page.locator('.quote-drawer-item-remove').first().click();

    await expect(page.locator('.quote-drawer-empty')).toBeVisible();
    await expect(page.locator('.quote-drawer-empty')).toHaveText('No items added yet.');
  });

  // === Two-Step Flow: Items -> Form ===

  test('Continue button navigates to form view', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-item')).toBeVisible();

    await page.locator('.quote-drawer-submit').click();

    await expect(page.locator('.quote-form')).toBeVisible();
    await expect(page.locator('.quote-form-field input[type="text"]').first()).toBeVisible();
    await expect(page.locator('.quote-form-field input[type="email"]')).toBeVisible();
  });

  test('Back button in form returns to items view', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await page.locator('.quote-drawer-submit').click();
    await expect(page.locator('.quote-form')).toBeVisible();

    await page.locator('.quote-drawer-continue').click();

    await expect(page.locator('.quote-drawer-item')).toBeVisible();
    await expect(page.locator('.quote-form')).not.toBeVisible();
  });

  // === Form Validation ===

  test('form shows error when submitting without name and email', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await page.locator('.quote-drawer-submit').click();
    await expect(page.locator('.quote-form')).toBeVisible();

    await page.locator('.quote-form-submit').click();

    await expect(page.locator('.quote-form-error')).toBeVisible();
    await expect(page.locator('.quote-form-error')).toContainText('name and email');
  });

  test('form shows error for invalid email', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await page.locator('.quote-drawer-submit').click();

    // Fill name but invalid email
    const inputs = page.locator('.quote-form-field input[type="text"]');
    await inputs.first().fill('Test User');
    await page.locator('.quote-form-field input[type="email"]').fill('not-valid');

    await page.locator('.quote-form-submit').click();

    await expect(page.locator('.quote-form-error')).toBeVisible();
    await expect(page.locator('.quote-form-error')).toContainText('valid email');
  });

  // === Form Submission ===

  test('form submits successfully with valid data', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await page.locator('.quote-drawer-submit').click();

    // Fill form
    const nameInput = page.locator('.quote-form-field input[type="text"]').first();
    await nameInput.fill('E2E Test User');
    await page.locator('.quote-form-field input[type="email"]').fill('e2e-test@example.com');

    await page.locator('.quote-form-submit').click();

    // Wait for success view
    await expect(page.locator('.quote-success')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.quote-success h3')).toHaveText('Quote Submitted!');
    await expect(page.locator('.quote-success p')).toContainText('e2e-test@example.com');
  });

  test('success view: close button closes drawer and resets state', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await page.locator('.quote-drawer-submit').click();

    const nameInput = page.locator('.quote-form-field input[type="text"]').first();
    await nameInput.fill('E2E Close Test');
    await page.locator('.quote-form-field input[type="email"]').fill('close-test@example.com');
    await page.locator('.quote-form-submit').click();

    await expect(page.locator('.quote-success')).toBeVisible({ timeout: 15_000 });

    // Click close in success view
    await page.locator('.quote-success .quote-btn--success').click();

    await expect(page.locator('.quote-drawer-container--open')).not.toBeVisible();
  });

  // === Floating Button ===

  test('floating button appears after adding item and closing drawer', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-item')).toBeVisible();

    // Close drawer via Continue Shopping
    await page.locator('.quote-drawer-continue').click();

    // Floating button should appear with badge
    const floatingBtn = page.locator('.quote-floating-btn');
    await expect(floatingBtn).toBeVisible({ timeout: 5_000 });

    const badge = page.locator('.quote-floating-badge');
    await expect(badge).toHaveText('1');
  });

  test('floating button opens drawer when clicked', async ({ page }) => {
    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-item')).toBeVisible();
    await page.locator('.quote-drawer-continue').click();

    await page.locator('.quote-floating-btn').click();

    await expect(page.locator('.quote-drawer-container--open')).toBeVisible();
    await expect(page.locator('.quote-drawer-item')).toBeVisible();
  });

  // === Collection Page ===

  test('collection page: clicking quote button opens drawer', async ({ page }) => {
    await navigateToCollectionPage(page);

    await clickQuoteButton(page.locator('[data-quote-button]').first());

    await expect(page.locator('.quote-drawer-container--open')).toBeVisible({ timeout: 10_000 });
  });

  // === No JS Errors ===

  test('no JS errors during full quote flow', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await navigateToProductPage(page);
    await clickQuoteButton(page.locator('[data-quote-button]'));
    await expect(page.locator('.quote-drawer-item')).toBeVisible();

    // Navigate to form
    await page.locator('.quote-drawer-submit').click();
    await expect(page.locator('.quote-form')).toBeVisible();

    // Fill and submit
    const nameInput = page.locator('.quote-form-field input[type="text"]').first();
    await nameInput.fill('No Error Test');
    await page.locator('.quote-form-field input[type="email"]').fill('noerror@example.com');
    await page.locator('.quote-form-submit').click();

    await expect(page.locator('.quote-success')).toBeVisible({ timeout: 15_000 });

    expect(errors).toHaveLength(0);
  });
});
