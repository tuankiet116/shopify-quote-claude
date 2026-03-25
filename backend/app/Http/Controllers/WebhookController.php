<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $topic = $request->attributes->get('webhookTopic');
        $shopDomain = $request->attributes->get('shopifyDomain');

        Log::info('Webhook received', ['topic' => $topic, 'shop' => $shopDomain]);

        match ($topic) {
            'app/uninstalled' => $this->handleAppUninstalled($shopDomain),
            default => Log::warning('Unhandled webhook topic', ['topic' => $topic]),
        };

        return $this->success(message: 'Webhook processed');
    }

    private function handleAppUninstalled(string $shopDomain): void
    {
        $shop = Shop::where('shop', $shopDomain)->first();
        if (! $shop) {
            return;
        }

        $shop->update([
            'is_active' => false,
            'access_token' => null,
            'uninstalled_at' => now(),
        ]);

        Log::info('App uninstalled', ['shop' => $shopDomain]);
    }
}
