export interface QuoteButtonConfig {
  pageType: string;
  is_enabled: boolean;
  show_on_product: boolean;
  show_on_collection: boolean;
  show_on_search: boolean;
  show_on_home: boolean;
  appearance: {
    button_text: string;
    bg_color: string;
    text_color: string;
    hover_bg_color: string;
    border_radius: number;
    border_width: number;
    border_color: string;
    size: string;
  };
}

/** Page types we support, mapped from Shopify's request.page_type */
const PAGE_TYPE_MAP: Record<string, keyof Pick<QuoteButtonConfig, 'show_on_product' | 'show_on_collection' | 'show_on_search' | 'show_on_home'>> = {
  product: 'show_on_product',
  collection: 'show_on_collection',
  search: 'show_on_search',
  index: 'show_on_home',
};

/** Parse the config from the embedded JSON script tag */
export function parseConfig(): QuoteButtonConfig | null {
  const el = document.getElementById('quote-app-config');
  if (!el) return null;

  try {
    const data = JSON.parse(el.textContent || '');

    // Validate required fields
    if (
      typeof data.pageType !== 'string' ||
      typeof data.is_enabled !== 'boolean' ||
      !data.appearance ||
      typeof data.appearance.button_text !== 'string'
    ) {
      console.error('[QuoteApp] Invalid config structure');
      return null;
    }

    return data as QuoteButtonConfig;
  } catch {
    console.error('[QuoteApp] Failed to parse config');
    return null;
  }
}

/** Check if the quote button should be shown on the current page */
export function isPageEnabled(config: QuoteButtonConfig): boolean {
  if (!config.is_enabled) return false;

  const flagKey = PAGE_TYPE_MAP[config.pageType];
  if (!flagKey) return false;

  return config[flagKey] === true;
}

/** Determine if current page is a product detail page */
export function isProductPage(config: QuoteButtonConfig): boolean {
  return config.pageType === 'product';
}

/** Determine if current page is a listing page (collection, search, home) */
export function isListingPage(config: QuoteButtonConfig): boolean {
  return ['collection', 'search', 'index'].includes(config.pageType);
}
