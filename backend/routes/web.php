<?php

use App\Http\Controllers\Auth\ShopifyAuthController;
use Illuminate\Support\Facades\Route;

// OAuth routes (no auth middleware)
Route::get('auth/shopify', [ShopifyAuthController::class, 'redirect']);
Route::get('auth/shopify/callback', [ShopifyAuthController::class, 'callback']);

// SPA catch-all: serve app.blade.php for all /app/* routes
// React Router handles client-side routing
Route::get('/app/{any?}', function () {
    return view('app');
})->where('any', '.*')->middleware('ensure.shopify.embedded');
