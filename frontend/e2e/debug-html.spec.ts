import { test } from './fixtures/shopify';
import fs from 'fs';
import path from 'path';

test('dump page html', async ({ page }) => {
  const html = await page.locator('#app').innerHTML();
  const outPath = path.join(import.meta.dirname, 'screenshots', 'page-html.txt');
  fs.writeFileSync(outPath, html);
});
