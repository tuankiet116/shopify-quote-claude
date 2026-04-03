<?php

use App\Http\Controllers\ButtonSettingController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\StorefrontQuoteController;
use App\Http\Controllers\StorefrontTokenController;
use App\Http\Controllers\WebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public storefront API (no auth, rate limited)
Route::prefix('storefront')->group(function () {
    Route::middleware(['throttle:quote-submit'])->post('quotes', [StorefrontQuoteController::class, 'store']);
});

// Admin API routes (session token verified)
Route::middleware(['verify.shopify.session'])->prefix('shopify')->group(function () {
    Route::get('shop', function (Request $request) {
        $shop = $request->attributes->get('shopifyShop');

        return response()->json([
            'success' => true,
            'data' => [
                'shop' => $shop->shop,
                'is_active' => $shop->is_active,
                'installed_at' => $shop->installed_at,
            ],
        ]);
    });

    Route::get('button-settings', [ButtonSettingController::class, 'show']);
    Route::put('button-settings', [ButtonSettingController::class, 'update']);

    Route::get('storefront-token', [StorefrontTokenController::class, 'show']);
    Route::post('storefront-token/regenerate', [StorefrontTokenController::class, 'regenerate']);

    Route::get('quotes', [QuoteController::class, 'index']);
    Route::get('quotes/{id}', [QuoteController::class, 'show']);
    Route::put('quotes/{id}/status', [QuoteController::class, 'updateStatus']);
});

// Webhooks (HMAC verified)
Route::middleware(['verify.shopify.webhook'])->post('webhooks', [WebhookController::class, 'handle']);
