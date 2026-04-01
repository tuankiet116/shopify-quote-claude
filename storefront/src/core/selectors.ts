/**
 * Common Shopify theme CSS selectors for product forms and product cards.
 * Organized in priority order — try from top to bottom, use first match.
 */

/** Selectors to find the add-to-cart button area on product pages */
export const PRODUCT_PAGE_SELECTORS = [
  // Dawn / OS 2.0 themes
  'product-form form[action*="/cart/add"] button[type="submit"]',
  'form[action*="/cart/add"] button[name="add"]',
  'form[action*="/cart/add"] button[type="submit"]',
  // Shopify Buy Button / Dynamic Checkout
  '.shopify-payment-button',
  // Generic fallback
  'form[action*="/cart/add"]',
  '[data-add-to-cart]',
  '.product-form__submit',
  '.add-to-cart',
] as const;

/** Selectors to find product cards on collection/search/home pages */
export const PRODUCT_CARD_SELECTORS = [
  // Dawn
  '.product-card-wrapper',
  '.card-wrapper',
  // Common patterns across themes
  '.product-card',
  '.product-item',
  '.grid-product',
  '.product-grid-item',
  // Generic
  '.collection-product-card',
] as const;

/**
 * Find the first matching element from a list of selectors.
 * Returns null if no match found.
 */
export function findFirst(selectors: readonly string[], root: Element | Document = document): Element | null {
  for (const selector of selectors) {
    const el = root.querySelector(selector);
    if (el) return el;
  }
  return null;
}

/**
 * Find all matching elements from a list of selectors.
 * Uses the first selector that returns results.
 */
export function findAll(selectors: readonly string[], root: Element | Document = document): Element[] {
  for (const selector of selectors) {
    const els = root.querySelectorAll(selector);
    if (els.length > 0) return Array.from(els);
  }
  return [];
}
