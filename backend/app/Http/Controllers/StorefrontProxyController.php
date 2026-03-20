<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\QuoteActivity;
use App\Models\QuoteFormConfig;
use App\Services\QuoteNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StorefrontProxyController extends Controller
{
    public function __construct(private QuoteNumberService $numberService)
    {
    }

    public function formConfig(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $config = QuoteFormConfig::where('shop_id', $shop->id)
            ->where('is_active', true)
            ->where('is_default', true)
            ->with('fields')
            ->first();

        if (!$config) {
            $config = QuoteFormConfig::where('shop_id', $shop->id)
                ->where('is_active', true)
                ->with('fields')
                ->first();
        }

        if (!$config) {
            return response()->json(['fields' => []]);
        }

        return response()->json([
            'formId' => 'cf_' . $config->id,
            'title' => 'Request a Quote',
            'description' => 'Fill in details and we\'ll get back to you',
            'submitButtonText' => 'Submit Quote',
            'successMessage' => 'Quote submitted! We\'ll contact you soon.',
            'fields' => $config->fields->map(fn ($f) => [
                'name' => $f->field_name,
                'label' => $f->field_label,
                'type' => $f->field_type,
                'required' => $f->is_required,
                'options' => $f->options,
            ]),
        ]);
    }

    public function submitQuote(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required',
            'items.*.variantId' => 'required',
            'items.*.title' => 'required|string',
            'items.*.variantTitle' => 'nullable|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.imageUrl' => 'nullable|string',
            'items.*.sku' => 'nullable|string',
            'formData' => 'required|array',
            'formData.customer_name' => 'required|string|max:255',
            'formData.customer_email' => 'required|email|max:255',
        ]);

        $quoteNumber = $this->numberService->generate($shop);
        $settings = $shop->settings;

        $quote = Quote::create([
            'shop_id' => $shop->id,
            'quote_number' => $quoteNumber,
            'status' => 'pending',
            'customer_name' => $validated['formData']['customer_name'],
            'customer_email' => $validated['formData']['customer_email'],
            'customer_phone' => $validated['formData']['customer_phone'] ?? null,
            'customer_company' => $validated['formData']['customer_company'] ?? null,
            'customer_notes' => $validated['formData']['notes'] ?? null,
            'form_responses' => $validated['formData'],
            'expires_at' => $settings ? now()->addDays($settings->quote_expiry_days) : now()->addDays(30),
        ]);

        foreach ($validated['items'] as $index => $item) {
            $quote->items()->create([
                'product_id' => (string) $item['productId'],
                'variant_id' => (string) $item['variantId'],
                'product_title' => $item['title'],
                'variant_title' => $item['variantTitle'] ?? null,
                'sku' => $item['sku'] ?? null,
                'image_url' => $item['imageUrl'] ?? null,
                'quantity' => $item['quantity'],
                'original_price' => $item['price'],
                'sort_order' => $index,
            ]);
        }

        $quote->load('items');
        $quote->recalculateTotals();

        QuoteActivity::create([
            'quote_id' => $quote->id,
            'action' => 'created',
            'details' => ['source' => 'storefront'],
            'actor' => 'buyer',
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'quoteNumber' => $quoteNumber,
        ]);
    }

    public function quoteStatus(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $quoteNumber = $request->query('quote_number');
        $email = $request->query('email');

        if (!$quoteNumber || !$email) {
            return response()->json(['error' => 'Missing parameters'], 400);
        }

        $quote = Quote::where('shop_id', $shop->id)
            ->where('quote_number', $quoteNumber)
            ->where('customer_email', $email)
            ->first();

        if (!$quote) {
            return response()->json(['error' => 'Quote not found'], 404);
        }

        return response()->json([
            'quote_number' => $quote->quote_number,
            'status' => $quote->status,
            'total_price' => $quote->total_price,
            'currency_code' => $quote->currency_code,
            'created_at' => $quote->created_at,
            'expires_at' => $quote->expires_at,
            'invoice_url' => $quote->invoice_url,
        ]);
    }
}
