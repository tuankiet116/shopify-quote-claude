// === Selectors ===

export const PRODUCT_PAGE_SELECTORS = [
  'product-form form[action*="/cart/add"] button[type="submit"]',
  'form[action*="/cart/add"] button[name="add"]',
  'form[action*="/cart/add"] button[type="submit"]',
  '.shopify-payment-button',
  'form[action*="/cart/add"]',
  '[data-add-to-cart]',
  '.product-form__submit',
  '.add-to-cart',
] as const;

export const PRODUCT_CARD_SELECTORS = [
  '.product-card-wrapper',
  '.card-wrapper',
  '.product-card',
  '.product-item',
  '.grid-product',
  '.product-grid-item',
  '.collection-product-card',
] as const;

export function findFirst(selectors: readonly string[]): Element | null {
  for (const s of selectors) {
    const el = document.querySelector(s);
    if (el) return el;
  }
  return null;
}

export function findAll(selectors: readonly string[]): Element[] {
  for (const s of selectors) {
    const els = document.querySelectorAll(s);
    if (els.length > 0) return Array.from(els);
  }
  return [];
}

// === DOM helpers ===

export function insertAfter(newEl: Element, refEl: Element): void {
  refEl.parentNode?.insertBefore(newEl, refEl.nextSibling);
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// === DOM Observer ===

/**
 * Watch for new DOM nodes added to body.
 * Returns a cleanup function to stop observing.
 */
export function observeDom(callback: () => void, debounceMs = 100): () => void {
  const debouncedCb = debounce(callback, debounceMs);
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes.length > 0) {
        debouncedCb();
        return;
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}
