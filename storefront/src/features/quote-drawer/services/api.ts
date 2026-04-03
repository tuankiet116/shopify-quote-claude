import type { QuoteFormData, QuoteItem } from '../store';

interface SubmitResult {
  success: boolean;
  data?: { quote_number: string };
  error?: { message: string };
}

export async function submitQuote(
  apiUrl: string,
  shopDomain: string,
  language: string,
  formData: QuoteFormData,
  items: readonly QuoteItem[],
  honeypot: string,
): Promise<SubmitResult> {
  const currency = items[0]?.product.currency || 'USD';

  const response = await fetch(`${apiUrl}/api/storefront/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      shop: shopDomain,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      message: formData.message,
      website: honeypot,
      locale: language.toLowerCase(),
      currency,
      items: items.map((item) => ({
        product_id: item.product.productId,
        variant_id: item.product.variantId,
        product_title: item.product.title,
        variant_title: item.product.variantTitle,
        product_handle: item.product.handle,
        image_url: item.product.imageUrl,
        price: item.product.price ? parseFloat(item.product.price) : null,
        currency: item.product.currency,
        quantity: item.quantity,
      })),
    }),
  });

  return response.json();
}
