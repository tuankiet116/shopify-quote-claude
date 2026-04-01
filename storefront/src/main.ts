import { initQuoteButton } from './features/quote-button';

// Initialize all storefront features when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init(): void {
  initQuoteButton();
}
