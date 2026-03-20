<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\QuoteFormConfigController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StorefrontProxyController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

// Admin API routes (session token verified → JSON responses)
Route::middleware(['verify.shopify.session'])->prefix('shopify')->group(function () {
    // Dashboard
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);

    // Quotes CRUD
    Route::apiResource('quotes', QuoteController::class);
    Route::post('quotes/{id}/send', [QuoteController::class, 'sendQuote']);
    Route::post('quotes/{id}/convert', [QuoteController::class, 'convertToOrder']);
    Route::post('quotes/{id}/notes', [QuoteController::class, 'addNote']);

    // Form Builder
    Route::apiResource('form-configs', QuoteFormConfigController::class);
    Route::post('form-configs/{id}/publish', [QuoteFormConfigController::class, 'publish']);

    // Settings
    Route::get('settings', [SettingsController::class, 'show']);
    Route::put('settings', [SettingsController::class, 'update']);
    Route::put('settings/storefront', [SettingsController::class, 'updateStorefront']);

    // Products (proxy Shopify product search)
    Route::get('products/search', [ProductController::class, 'search']);
});

// App Proxy (public, signature verified)
Route::middleware(['verify.app.proxy'])->prefix('storefront')->group(function () {
    Route::get('form-config', [StorefrontProxyController::class, 'formConfig']);
    Route::post('submit-quote', [StorefrontProxyController::class, 'submitQuote']);
    Route::get('quote-status', [StorefrontProxyController::class, 'quoteStatus']);
});

// Webhooks (HMAC verified, raw body)
Route::middleware(['verify.shopify.webhook'])->post('webhooks', [WebhookController::class, 'handle']);
