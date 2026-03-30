<?php

use Illuminate\Support\Facades\Route;

// Shopify embeds the app at root URL — serve SPA here too
Route::get('/', function () {
    return view('app');
})->middleware('ensure.shopify.embedded');

// SPA catch-all: serve app.blade.php for all /app/* routes
Route::get('/app/{any?}', function () {
    return view('app');
})->where('any', '.*')->middleware('ensure.shopify.embedded');
