import { chromium } from '@playwright/test';
import path from 'path';

const PROFILE_DIR = path.join(import.meta.dirname, '.profile');

async function setup() {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 720 },
  });

  const page = context.pages()[0] || (await context.newPage());

  // Navigate to Shopify admin — login manually
  await page.goto(
    'https://admin.shopify.com/store/kietdt-claude-store/apps/claude-quote-ai',
  );

  // Keep browser open until user closes it
  await new Promise((resolve) => {
    context.on('close', resolve);
  });
}

setup();
