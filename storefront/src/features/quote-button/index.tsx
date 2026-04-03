import { render } from 'preact';
import type { QuoteButtonConfig } from '../../shared/types/config';
import { isProductPage, isListingPage } from '../../shared/types/config';
import {
  PRODUCT_PAGE_SELECTORS, PRODUCT_CARD_SELECTORS,
  findFirst, findAll, insertAfter, observeDom,
} from '../../shared/services/dom';
import { ProductPageButton } from './components/product-page-button';
import { CollectionCardButton } from './components/collection-card-button';

/** Mount quote buttons into Shopify theme DOM. Returns cleanup function. */
export function initQuoteButtons(config: QuoteButtonConfig): () => void {
  if (isProductPage(config)) {
    return mountProductButton(config);
  }
  if (isListingPage(config)) {
    return mountCollectionButtons(config);
  }
  return () => {};
}

function mountProductButton(config: QuoteButtonConfig): () => void {
  let mounted = false;

  const mount = () => {
    if (mounted || document.querySelector('[data-quote-product]')) return;

    const target = findFirst(PRODUCT_PAGE_SELECTORS);
    if (!target) return;

    const form = target.closest('form[action*="/cart/add"]');
    const wrapper = form?.closest('product-form, product-form-component, [data-product-form]');
    const insertTarget = wrapper || form || target;

    const container = document.createElement('div');
    container.setAttribute('data-quote-product', '');
    insertAfter(container, insertTarget);
    render(<ProductPageButton config={config} />, container);
    mounted = true;
  };

  mount();
  const cleanup = observeDom(mount);
  return cleanup;
}

function mountCollectionButtons(config: QuoteButtonConfig): () => void {
  const processed = new WeakSet<Element>();

  const mount = () => {
    const cards = findAll(PRODUCT_CARD_SELECTORS);
    for (const card of cards) {
      if (processed.has(card)) continue;
      processed.add(card);
      if (card.querySelector('[data-quote-button]')) continue;

      const container = document.createElement('div');
      card.appendChild(container);
      render(<CollectionCardButton config={config} card={card} />, container);
    }
  };

  mount();
  const cleanup = observeDom(mount);
  return cleanup;
}
