import { test, expect } from './fixtures/shopify';

const API_URL = 'http://localhost:3001/api/shopify';
const DEFAULT_SETTINGS = {
  is_enabled: true,
  show_on_product: true,
  show_on_collection: true,
  show_on_search: true,
  show_on_home: true,
  appearance: {
    button_text: 'Request a Quote',
    bg_color: '#000000',
    text_color: '#FFFFFF',
    hover_bg_color: '#333333',
    border_radius: 4,
    border_width: 0,
    border_color: '#000000',
    size: 'medium',
  },
};

// Reset settings to defaults before each test
test.beforeEach(async () => {
  await fetch(`${API_URL}/button-settings?scope=developer`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(DEFAULT_SETTINGS),
  });
});

test.describe('Button Settings Page', () => {
  test('navigation has Settings link that navigates to settings page', async ({ page }) => {
    const settingsLink = page.getByRole('link', { name: 'Settings' });
    await expect(settingsLink).toBeVisible();
    await settingsLink.click();
    await expect(page).toHaveURL(/\/settings\/button/);
    await expect(page.getByRole('heading', { name: 'Quote Button Settings' })).toBeVisible();
  });

  test('settings page shows default values on first load', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();

    await expect(page.getByLabel('Button text')).toHaveValue('Request a Quote');
    const enableCheckbox = page.getByLabel('Enable quote button on storefront');
    await expect(enableCheckbox).toBeChecked();
  });

  test('live preview updates when changing button text', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();

    const textField = page.getByLabel('Button text');
    await textField.clear();
    await textField.fill('Get a Quote');

    const previewButton = page.locator('[data-testid="button-preview"]');
    await expect(previewButton).toContainText('Get a Quote');
  });

  test('live preview updates when changing colors via color picker', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();

    const bgSection = page.locator('label:text-is("Background")').locator('..');
    const bgHexInput = bgSection.locator('input[type="text"]');
    await bgHexInput.clear();
    await bgHexInput.fill('#ff0000');

    const previewButton = page.locator('[data-testid="button-preview"]');
    const bgColor = await previewButton.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bgColor).toBe('rgb(255, 0, 0)');
  });

  test('live preview updates when changing size', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();

    await page.getByLabel('Button size').selectOption('large');

    const previewButton = page.locator('[data-testid="button-preview"]');
    await expect(previewButton).toHaveClass(/large/);
  });

  test('save bar appears when settings are changed', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();

    // Save bar should NOT be visible initially
    await expect(page.getByText('Unsaved changes')).not.toBeVisible();

    // Make a change
    const textField = page.getByLabel('Button text');
    await textField.clear();
    await textField.fill('Changed Text');

    // Save bar should appear
    await expect(page.getByText('Unsaved changes')).toBeVisible();
  });

  test('save bar save action saves and hides bar', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();

    const textField = page.getByLabel('Button text');
    await textField.clear();
    await textField.fill('Save Test');

    // Save bar should appear
    await expect(page.getByText('Unsaved changes')).toBeVisible();

    // Click Save in the save bar
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Settings saved successfully.')).toBeVisible();

    // Save bar should disappear
    await expect(page.getByText('Unsaved changes')).not.toBeVisible();
  });

  test('save bar discard action reverts changes', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();

    const textField = page.getByLabel('Button text');
    await textField.clear();
    await textField.fill('Will Be Discarded');

    // Save bar should appear
    await expect(page.getByText('Unsaved changes')).toBeVisible();

    // Click Discard
    await page.getByRole('button', { name: 'Discard', exact: true }).click();

    // Text should revert to default
    await expect(page.getByLabel('Button text')).toHaveValue('Request a Quote');

    // Save bar should disappear
    await expect(page.getByText('Unsaved changes')).not.toBeVisible();
  });

  test('saved settings persist after reload', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();

    const textField = page.getByLabel('Button text');
    await textField.clear();
    await textField.fill('Persistent Text');

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Settings saved successfully.')).toBeVisible();

    // Reload and verify
    await page.reload();
    await page.locator('#app').waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('link', { name: 'Settings' }).click();

    await expect(page.getByLabel('Button text')).toHaveValue('Persistent Text');
  });

  test('enable/disable checkbox toggles preview', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();

    const enableCheckbox = page.getByLabel('Enable quote button on storefront');
    await enableCheckbox.uncheck();

    const previewContainer = page.locator('[data-testid="preview-container"]');
    await expect(previewContainer).toContainText('disabled');

    await enableCheckbox.check();
    await expect(page.locator('[data-testid="button-preview"]')).toBeVisible();
  });

  test('page visibility checkboxes work', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();

    await expect(page.getByLabel('Product pages')).toBeChecked();
    await expect(page.getByLabel('Collection pages')).toBeChecked();
    await expect(page.getByLabel('Search results')).toBeChecked();
    await expect(page.getByLabel('Home page')).toBeChecked();

    await page.getByLabel('Product pages').uncheck();
    await expect(page.getByLabel('Product pages')).not.toBeChecked();
  });
});
