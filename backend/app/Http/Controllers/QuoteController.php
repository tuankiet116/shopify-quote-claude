<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\QuoteActivity;
use App\Models\QuoteItem;
use App\Services\QuoteNumberService;
use App\Services\Shopify\ShopifyDraftOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class QuoteController extends Controller
{
    public function __construct(private QuoteNumberService $numberService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $query = Quote::where('shop_id', $shop->id)
            ->with('items');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('quote_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_company', 'like', "%{$search}%");
            });
        }

        $quotes = $query->orderByDesc('created_at')
            ->paginate($request->query('per_page', 20));

        return response()->json($quotes);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $quote = Quote::where('shop_id', $shop->id)
            ->with(['items', 'activities'])
            ->findOrFail($id);

        return response()->json($quote);
    }

    public function store(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'customer_company' => 'nullable|string|max:255',
            'customer_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string',
            'items.*.variant_id' => 'required|string',
            'items.*.product_title' => 'required|string',
            'items.*.variant_title' => 'nullable|string',
            'items.*.sku' => 'nullable|string',
            'items.*.image_url' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.original_price' => 'required|numeric|min:0',
            'items.*.offered_price' => 'nullable|numeric|min:0',
        ]);

        $quoteNumber = $this->numberService->generate($shop);
        $settings = $shop->settings;

        $quote = Quote::create([
            'shop_id' => $shop->id,
            'quote_number' => $quoteNumber,
            'status' => 'pending',
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'] ?? null,
            'customer_company' => $validated['customer_company'] ?? null,
            'customer_notes' => $validated['customer_notes'] ?? null,
            'expires_at' => $settings ? now()->addDays($settings->quote_expiry_days) : now()->addDays(30),
        ]);

        foreach ($validated['items'] as $index => $itemData) {
            $quote->items()->create(array_merge($itemData, ['sort_order' => $index]));
        }

        $quote->load('items');
        $quote->recalculateTotals();

        QuoteActivity::create([
            'quote_id' => $quote->id,
            'action' => 'created',
            'details' => ['source' => 'admin'],
            'actor' => 'merchant',
            'created_at' => now(),
        ]);

        return response()->json($quote->fresh(['items', 'activities']), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $quote = Quote::where('shop_id', $shop->id)->findOrFail($id);

        $validated = $request->validate([
            'customer_name' => 'sometimes|string|max:255',
            'customer_email' => 'sometimes|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'customer_company' => 'nullable|string|max:255',
            'customer_notes' => 'nullable|string',
            'internal_notes' => 'nullable|string',
            'discount_type' => ['nullable', Rule::in(['percentage', 'fixed'])],
            'discount_value' => 'nullable|numeric|min:0',
            'status' => ['sometimes', Rule::in(['pending', 'reviewed', 'sent', 'accepted', 'rejected', 'converted', 'expired', 'cancelled'])],
            'items' => 'sometimes|array|min:1',
            'items.*.id' => 'nullable|integer',
            'items.*.product_id' => 'required_with:items|string',
            'items.*.variant_id' => 'required_with:items|string',
            'items.*.product_title' => 'required_with:items|string',
            'items.*.variant_title' => 'nullable|string',
            'items.*.sku' => 'nullable|string',
            'items.*.image_url' => 'nullable|string',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.original_price' => 'required_with:items|numeric|min:0',
            'items.*.offered_price' => 'nullable|numeric|min:0',
        ]);

        $oldStatus = $quote->status;

        // Update quote fields
        $quoteFields = collect($validated)->except('items')->toArray();
        if (!empty($quoteFields)) {
            $quote->update($quoteFields);
        }

        // Update items if provided
        if (isset($validated['items'])) {
            $quote->items()->delete();
            foreach ($validated['items'] as $index => $itemData) {
                unset($itemData['id']);
                $quote->items()->create(array_merge($itemData, ['sort_order' => $index]));
            }
        }

        $quote->load('items');
        $quote->recalculateTotals();

        if (isset($validated['status']) && $oldStatus !== $validated['status']) {
            QuoteActivity::create([
                'quote_id' => $quote->id,
                'action' => 'status_changed',
                'details' => ['from' => $oldStatus, 'to' => $validated['status']],
                'actor' => 'merchant',
                'created_at' => now(),
            ]);
        }

        return response()->json($quote->fresh(['items', 'activities']));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $quote = Quote::where('shop_id', $shop->id)->findOrFail($id);

        $quote->update(['status' => 'cancelled']);

        QuoteActivity::create([
            'quote_id' => $quote->id,
            'action' => 'status_changed',
            'details' => ['from' => $quote->getOriginal('status'), 'to' => 'cancelled'],
            'actor' => 'merchant',
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Quote cancelled']);
    }

    public function sendQuote(Request $request, int $id): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $quote = Quote::where('shop_id', $shop->id)->with('items')->findOrFail($id);

        $draftOrderService = new ShopifyDraftOrderService($shop);

        // Create draft order
        $draftOrderData = $draftOrderService->createFromQuote($quote);
        $draftOrderGid = $draftOrderData['draftOrderCreate']['draftOrder']['id'] ?? null;
        $invoiceUrl = $draftOrderData['draftOrderCreate']['draftOrder']['invoiceUrl'] ?? null;

        if ($draftOrderGid) {
            // Send invoice
            $draftOrderService->sendInvoice($draftOrderGid, $quote->customer_email);

            $quote->update([
                'status' => 'sent',
                'sent_at' => now(),
                'draft_order_gid' => $draftOrderGid,
                'invoice_url' => $invoiceUrl,
            ]);

            QuoteActivity::create([
                'quote_id' => $quote->id,
                'action' => 'email_sent',
                'details' => ['draft_order_gid' => $draftOrderGid],
                'actor' => 'merchant',
                'created_at' => now(),
            ]);
        }

        return response()->json($quote->fresh(['items', 'activities']));
    }

    public function convertToOrder(Request $request, int $id): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $quote = Quote::where('shop_id', $shop->id)->findOrFail($id);

        if (!$quote->draft_order_gid) {
            return response()->json(['error' => 'No draft order linked'], 400);
        }

        $draftOrderService = new ShopifyDraftOrderService($shop);
        $orderData = $draftOrderService->complete($quote->draft_order_gid);
        $orderGid = $orderData['draftOrderComplete']['draftOrder']['order']['id'] ?? null;

        $quote->update([
            'status' => 'converted',
            'converted_at' => now(),
            'order_gid' => $orderGid,
        ]);

        QuoteActivity::create([
            'quote_id' => $quote->id,
            'action' => 'status_changed',
            'details' => ['from' => 'sent', 'to' => 'converted', 'order_gid' => $orderGid],
            'actor' => 'merchant',
            'created_at' => now(),
        ]);

        return response()->json($quote->fresh(['items', 'activities']));
    }

    public function addNote(Request $request, int $id): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $quote = Quote::where('shop_id', $shop->id)->findOrFail($id);

        $validated = $request->validate([
            'note' => 'required|string',
        ]);

        $quote->update(['internal_notes' => $validated['note']]);

        QuoteActivity::create([
            'quote_id' => $quote->id,
            'action' => 'note_added',
            'details' => ['note' => $validated['note']],
            'actor' => 'merchant',
            'created_at' => now(),
        ]);

        return response()->json($quote->fresh(['items', 'activities']));
    }
}
