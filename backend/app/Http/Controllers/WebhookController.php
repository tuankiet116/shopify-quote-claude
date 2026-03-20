<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\QuoteActivity;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $topic = $request->attributes->get('webhookTopic');
        $shopDomain = $request->attributes->get('shopifyDomain');
        $data = $request->all();

        match ($topic) {
            'orders/create' => $this->handleOrderCreate($shopDomain, $data),
            'app/uninstalled' => $this->handleAppUninstalled($shopDomain),
            default => null,
        };

        return response()->json(['status' => 'ok']);
    }

    private function handleOrderCreate(string $shopDomain, array $data): void
    {
        $shop = Shop::where('shopify_domain', $shopDomain)->first();
        if (!$shop) return;

        // Check if order came from a draft order linked to a quote
        $draftOrderId = $data['draft_order_id'] ?? null;
        if (!$draftOrderId) return;

        $draftOrderGid = "gid://shopify/DraftOrder/{$draftOrderId}";
        $orderId = $data['id'] ?? null;
        $orderGid = $orderId ? "gid://shopify/Order/{$orderId}" : null;

        $quote = Quote::where('shop_id', $shop->id)
            ->where('draft_order_gid', $draftOrderGid)
            ->first();

        if ($quote) {
            $quote->update([
                'status' => 'converted',
                'converted_at' => now(),
                'order_gid' => $orderGid,
            ]);

            QuoteActivity::create([
                'quote_id' => $quote->id,
                'action' => 'status_changed',
                'details' => ['from' => 'sent', 'to' => 'converted', 'order_gid' => $orderGid],
                'actor' => 'system',
                'created_at' => now(),
            ]);
        }
    }

    private function handleAppUninstalled(string $shopDomain): void
    {
        $shop = Shop::where('shopify_domain', $shopDomain)->first();
        if (!$shop) return;

        $shop->update([
            'is_active' => false,
            'access_token' => null,
            'uninstalled_at' => now(),
        ]);
    }
}
