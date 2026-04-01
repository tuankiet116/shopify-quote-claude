import { test, expect } from './fixtures/shopify';

test.describe('Home page', () => {
  test('displays page heading', async ({ page }) => {
    await expect(page.getByText('Claude Quote AI', { exact: true })).toBeVisible();
  });

  test('shows welcome banner', async ({ page }) => {
    await expect(
      page.locator(
        "text=Welcome! Let's set up your quote request system in a few simple steps.",
      ),
    ).toBeVisible();
  });

  test('lists feature descriptions', async ({ page }) => {
    await expect(
      page.locator(
        'text=Customers request quotes directly from your store',
      ),
    ).toBeVisible();
    await expect(
      page.locator(
        'text=You receive and manage all quote requests in one place',
      ),
    ).toBeVisible();
    await expect(
      page.locator(
        'text=Send professional quotes and convert them to orders',
      ),
    ).toBeVisible();
  });

  test('has start setup button that is not full width', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Start setup' });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    // Button should not be full width - it should be narrower than the page content
    const buttonBox = await button.boundingBox();
    const appContainer = page.locator('#app');
    const appBox = await appContainer.boundingBox();

    expect(buttonBox).toBeTruthy();
    expect(appBox).toBeTruthy();
    expect(buttonBox!.width).toBeLessThan(appBox!.width * 0.5);
  });
});
