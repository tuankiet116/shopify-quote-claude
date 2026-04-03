import { parseConfig, isPageEnabled } from './shared/types/config';
import { initQuoteDrawer } from './features/quote-drawer';
import { initQuoteButtons } from './features/quote-button';

let cleanup: (() => void) | null = null;

export function bootstrap(): void {
  // Clean up previous init (e.g. SPA re-navigation)
  cleanup?.();

  const config = parseConfig();
  if (!config || !isPageEnabled(config)) return;

  // Mount drawer + floating button (single Preact root in body)
  initQuoteDrawer(config);

  // Mount buttons into Shopify theme DOM (multiple Preact render calls)
  cleanup = initQuoteButtons(config);
}
