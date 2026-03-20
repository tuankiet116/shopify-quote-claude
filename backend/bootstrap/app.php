<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'verify.shopify.session' => \App\Http\Middleware\VerifyShopifySession::class,
            'verify.shopify.webhook' => \App\Http\Middleware\VerifyShopifyWebhook::class,
            'verify.app.proxy' => \App\Http\Middleware\VerifyAppProxy::class,
            'ensure.shopify.embedded' => \App\Http\Middleware\EnsureShopifyEmbedded::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
