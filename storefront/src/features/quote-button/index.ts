import { DomObserver } from '../../core/observer';
import { parseConfig, isPageEnabled, isProductPage, isListingPage } from './config';
import { injectProductPageButton } from './product-page';
import { injectCollectionPageButtons } from './collection-page';

/** Active observer — tracked so we can clean up on re-init */
let activeObserver: DomObserver | null = null;

/**
 * Initialize the Quote Button feature.
 * Reads config from embedded JSON, determines page type,
 * and injects buttons accordingly.
 */
export function initQuoteButton(): void {
  // Clean up any previous observer (e.g. SPA navigation re-init)
  destroyQuoteButton();

  const config = parseConfig();
  if (!config) return;

  if (!isPageEnabled(config)) return;

  if (isProductPage(config)) {
    // Product page: inject once near add-to-cart
    // Also observe for theme variant switchers that re-render the form
    const observer = new DomObserver(() => {
      injectProductPageButton(config);
    });

    injectProductPageButton(config);
    observer.start();
    activeObserver = observer;
  } else if (isListingPage(config)) {
    // Collection/search/home: inject on all product cards
    // Observer handles pagination and dynamic loading
    const observer = new DomObserver(() => {
      injectCollectionPageButtons(config, observer);
    });

    injectCollectionPageButtons(config, observer);
    observer.start();
    activeObserver = observer;
  }
}

/** Stop observers and clean up */
export function destroyQuoteButton(): void {
  if (activeObserver) {
    activeObserver.stop();
    activeObserver = null;
  }
}
