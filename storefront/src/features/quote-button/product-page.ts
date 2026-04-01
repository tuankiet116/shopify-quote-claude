import { insertAfter } from '../../core/dom';
import { findFirst, PRODUCT_PAGE_SELECTORS } from '../../core/selectors';
import { createQuoteButtonContainer } from './button';
import type { QuoteButtonConfig } from './config';

/** Guard against concurrent injection */
let injecting = false;

/**
 * Inject a quote button on the product detail page,
 * positioned after the add-to-cart button/form.
 */
export function injectProductPageButton(config: QuoteButtonConfig): boolean {
  // Don't inject if already present
  if (document.querySelector('.quote-btn-container[data-quote-product]')) {
    return true;
  }

  // Prevent concurrent calls from observer race
  if (injecting) return false;
  injecting = true;

  try {
    const target = findFirst(PRODUCT_PAGE_SELECTORS);
    if (!target) {
      console.warn('[QuoteApp] Could not find add-to-cart area on product page');
      return false;
    }

    // Re-check after finding target (DOM may have changed)
    if (document.querySelector('.quote-btn-container[data-quote-product]')) {
      return true;
    }

    const container = createQuoteButtonContainer(config);
    container.setAttribute('data-quote-product', '');

    // Insert after the matched element
    // If the target is a button inside a form, insert after the form
    const insertTarget = target.closest('form[action*="/cart/add"]') || target;
    insertAfter(container, insertTarget);

    return true;
  } finally {
    injecting = false;
  }
}
