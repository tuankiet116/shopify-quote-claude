import { QuoteApp } from './QuoteApp';
import { QuoteAppConfig } from './types';

function init(): void {
    const config = (window as any).__QUOTE_APP__ as QuoteAppConfig | undefined;
    if (!config) {
        console.warn('Quote App: No configuration found');
        return;
    }

    const app = new QuoteApp(config);
    app.init();
}

// Init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
