import type { QuoteButtonConfig } from '../types/config';

export interface QuoteProduct {
  productId: number;
  variantId: number | null;
  title: string;
  variantTitle: string | null;
  handle: string;
  imageUrl: string | null;
  price: string | null;
  currency: string | null;
}

function parseGid(gid: string): number {
  const parts = gid.split('/');
  return parseInt(parts[parts.length - 1], 10);
}

const PRODUCT_QUERY = `
  query GetProduct($handle: String!) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      featuredImage { url }
      variants(first: 10) {
        nodes {
          id
          title
          availableForSale
          price { amount, currencyCode }
        }
      }
    }
  }
`;

/**
 * Fetch product via Shopify Storefront GraphQL API with @inContext.
 * Returns product with prices in buyer's local currency.
 */
export async function fetchProduct(
  handle: string,
  config: QuoteButtonConfig,
  variantId?: number | null,
): Promise<QuoteProduct | null> {
  if (!config.storefrontAccessToken) {
    console.warn('[QuoteApp] No storefront access token configured');
    return null;
  }

  try {
    const query = PRODUCT_QUERY
      .replace('$country', config.country || 'US')
      .replace('$language', config.language || 'EN');

    const response = await fetch(
      `https://${config.shopDomain}/api/2026-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken,
        },
        body: JSON.stringify({ query, variables: { handle } }),
      },
    );

    if (!response.ok) return null;

    const { data, errors } = await response.json();
    if (errors?.length || !data?.product) return null;

    const product = data.product;
    const variants = product.variants.nodes;
    const selected = variantId
      ? variants.find((v: { id: string }) => parseGid(v.id) === variantId) ?? variants[0]
      : variants[0];

    return {
      productId: parseGid(product.id),
      variantId: selected ? parseGid(selected.id) : null,
      title: product.title,
      variantTitle: selected?.title !== 'Default Title' ? (selected?.title ?? null) : null,
      handle: product.handle,
      imageUrl: product.featuredImage?.url ?? null,
      price: selected?.price.amount ?? null,
      currency: selected?.price.currencyCode ?? null,
    };
  } catch {
    console.error('[QuoteApp] Failed to fetch product from Storefront API');
    return null;
  }
}

/** Extract product handle from a link inside a product card */
export function extractHandleFromCard(card: Element): string | null {
  const link = card.querySelector<HTMLAnchorElement>('a[href*="/products/"]');
  if (!link) return null;
  const match = link.href.match(/\/products\/([^/?#]+)/);
  return match ? match[1] : null;
}

/** Get the currently selected variant ID from the product form */
export function getSelectedVariantId(): number | null {
  const input = document.querySelector<HTMLInputElement | HTMLSelectElement>(
    'form[action*="/cart/add"] [name="id"]',
  );
  return input ? parseInt(input.value, 10) || null : null;
}
