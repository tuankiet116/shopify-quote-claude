<?php

namespace App\Services;

use App\Models\Quote;
use App\Models\QuoteActivity;
use App\Models\Shop;
use App\Services\Shopify\ShopifyDraftOrderService;

class QuoteAutomationService
{
    public function processExpiredQuotes(Shop $shop): int
    {
        $expiredCount = Quote::where('shop_id', $shop->id)
            ->where('status', 'sent')
            ->where('expires_at', '<', now())
            ->get()
            ->each(function ($quote) {
                $quote->update(['status' => 'expired']);
                QuoteActivity::create([
                    'quote_id' => $quote->id,
                    'action' => 'status_changed',
                    'details' => ['from' => 'sent', 'to' => 'expired', 'reason' => 'auto_expired'],
                    'actor' => 'system',
                    'created_at' => now(),
                ]);
            })
            ->count();

        return $expiredCount;
    }

    public function sendReminders(Shop $shop): int
    {
        $settings = $shop->settings;
        if (!$settings) return 0;

        $reminderDate = now()->addDays($settings->reminder_days_before);

        $quotes = Quote::where('shop_id', $shop->id)
            ->where('status', 'sent')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $reminderDate)
            ->where('expires_at', '>', now())
            ->whereNotNull('draft_order_gid')
            ->get();

        $sentCount = 0;

        foreach ($quotes as $quote) {
            // Check if reminder already sent
            $alreadySent = QuoteActivity::where('quote_id', $quote->id)
                ->where('action', 'reminder_sent')
                ->exists();

            if ($alreadySent) continue;

            try {
                $draftOrderService = new ShopifyDraftOrderService($shop);
                $draftOrderService->sendInvoice($quote->draft_order_gid, $quote->customer_email);

                QuoteActivity::create([
                    'quote_id' => $quote->id,
                    'action' => 'reminder_sent',
                    'details' => ['expires_at' => $quote->expires_at->toISOString()],
                    'actor' => 'system',
                    'created_at' => now(),
                ]);

                $sentCount++;
            } catch (\Exception $e) {
                report($e);
            }
        }

        return $sentCount;
    }
}
