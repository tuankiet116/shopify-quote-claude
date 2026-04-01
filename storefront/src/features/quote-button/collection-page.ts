import { findAll, PRODUCT_CARD_SELECTORS } from '../../core/selectors';
import { createQuoteButtonContainer } from './button';
import type { QuoteButtonConfig } from './config';
import type { DomObserver } from '../../core/observer';

/**
 * Inject quote buttons on product cards for collection/search/home pages.
 * Uses DomObserver to handle dynamically loaded cards (pagination, infinite scroll).
 */
export function injectCollectionPageButtons(config: QuoteButtonConfig, observer: DomObserver): void {
  processCards(config, observer);
}

function processCards(config: QuoteButtonConfig, observer: DomObserver): void {
  const cards = findAll(PRODUCT_CARD_SELECTORS);

  for (const card of cards) {
    if (observer.isProcessed(card)) continue;
    observer.markProcessed(card);

    // Skip if button already exists in this card
    if (card.querySelector('[data-quote-button]')) continue;

    const container = createQuoteButtonContainer(config);
    card.appendChild(container);
  }
}
