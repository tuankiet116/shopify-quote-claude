<?php

use Illuminate\Support\Facades\Route;

// Shopify loads app at root URL — middleware handles install/token exchange
Route::get('/', function () {
    return view('app');
})->middleware('ensure.shopify.installed');

// SPA catch-all: serve app.blade.php for all client-side routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*')->middleware('ensure.shopify.installed');
