<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\Shop;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class QuoteService
{
    public function createFromStorefront(array $validated, string $ipAddress): Quote
    {
        $shop = Shop::where('shop', $validated['shop'])
            ->where('is_active', true)
            ->first();

        if (! $shop) {
            throw new ApiException('Shop not found', 'shop_not_found', 404);
        }

        return DB::transaction(function () use ($shop, $validated, $ipAddress) {
            $quote = Quote::create([
                'shop_id' => $shop->id,
                'quote_number' => Quote::generateQuoteNumber($shop->id),
                'status' => 'pending',
                'customer_name' => $validated['name'],
                'customer_email' => $validated['email'],
                'customer_phone' => $validated['phone'] ?? null,
                'customer_company' => $validated['company'] ?? null,
                'message' => $validated['message'] ?? null,
                'locale' => $validated['locale'] ?? null,
                'currency' => $validated['currency'] ?? null,
                'total_items' => count($validated['items']),
                'ip_address' => $ipAddress,
                'submitted_at' => now(),
            ]);

            foreach ($validated['items'] as $item) {
                QuoteItem::create([
                    'quote_id' => $quote->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'] ?? null,
                    'product_title' => $item['product_title'],
                    'variant_title' => $item['variant_title'] ?? null,
                    'product_handle' => $item['product_handle'],
                    'image_url' => $this->normalizeUrl($item['image_url'] ?? null),
                    'price' => $item['price'] ?? null,
                    'currency' => $item['currency'] ?? null,
                    'quantity' => $item['quantity'],
                ]);
            }

            return $quote->load('items');
        });
    }

    public function listForShop(Shop $shop, ?string $status = null): LengthAwarePaginator
    {
        $query = Quote::where('shop_id', $shop->id)
            ->orderByDesc('created_at');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate(20);
    }

    public function getForShop(Shop $shop, int $quoteId): Quote
    {
        $quote = Quote::where('shop_id', $shop->id)
            ->where('id', $quoteId)
            ->with('items')
            ->first();

        if (! $quote) {
            throw new ApiException('Quote not found', 'not_found', 404);
        }

        return $quote;
    }

    public function updateStatus(Shop $shop, int $quoteId, string $status): Quote
    {
        $quote = $this->getForShop($shop, $quoteId);

        $data = ['status' => $status];
        if ($status === 'reviewed' && ! $quote->reviewed_at) {
            $data['reviewed_at'] = now();
        }

        $quote->update($data);

        return $quote->fresh('items');
    }

    private function normalizeUrl(?string $url): ?string
    {
        if ($url && str_starts_with($url, '//')) {
            return 'https:' . $url;
        }

        return $url;
    }
}
