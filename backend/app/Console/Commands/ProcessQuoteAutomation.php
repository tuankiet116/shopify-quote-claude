<?php

namespace App\Console\Commands;

use App\Models\Shop;
use App\Services\QuoteAutomationService;
use Illuminate\Console\Command;

class ProcessQuoteAutomation extends Command
{
    protected $signature = 'quotes:process-automation';
    protected $description = 'Process quote automation (expiry + reminders)';

    public function handle(QuoteAutomationService $automationService): int
    {
        $shops = Shop::where('is_active', true)->get();

        $totalExpired = 0;
        $totalReminders = 0;

        foreach ($shops as $shop) {
            try {
                $totalExpired += $automationService->processExpiredQuotes($shop);
                $totalReminders += $automationService->sendReminders($shop);
            } catch (\Exception $e) {
                $this->error("Error processing shop {$shop->shopify_domain}: {$e->getMessage()}");
                report($e);
            }
        }

        $this->info("Processed: {$totalExpired} expired, {$totalReminders} reminders sent");

        return self::SUCCESS;
    }
}
