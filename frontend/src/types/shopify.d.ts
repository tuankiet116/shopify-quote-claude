/**
 * Type declarations for Shopify App Bridge global object.
 * Available when app runs embedded in Shopify Admin.
 */
interface ShopifyGlobal {
  idToken(): Promise<string>;
  navigationMenu?(config: {
    items: Array<{ label: string; href: string }>;
  }): void;
  saveBar?: {
    show(id: string): Promise<void>;
    hide(id: string): Promise<void>;
    toggle(id: string): Promise<void>;
    leaveConfirmation(): Promise<void>;
  };
}

interface Window {
  readonly shopify?: ShopifyGlobal;
}
