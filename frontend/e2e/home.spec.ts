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

  test('has start setup button', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Start setup' });
    await expect(button).toBeVisible();
  });
});
