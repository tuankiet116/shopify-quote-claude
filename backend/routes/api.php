<?php

use App\Http\Controllers\ButtonSettingController;
use App\Http\Controllers\WebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
});

// Webhooks (HMAC verified)
Route::middleware(['verify.shopify.webhook'])->post('webhooks', [WebhookController::class, 'handle']);
