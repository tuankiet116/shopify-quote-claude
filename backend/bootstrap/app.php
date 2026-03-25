<?php

use App\Exceptions\ApiException;
use App\Http\Middleware\EnsureShopifyEmbedded;
use App\Http\Middleware\VerifyShopifySession;
use App\Http\Middleware\VerifyShopifyWebhook;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'verify.shopify.session' => VerifyShopifySession::class,
            'verify.shopify.webhook' => VerifyShopifyWebhook::class,
            'ensure.shopify.embedded' => EnsureShopifyEmbedded::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // ApiException — known app errors
        $exceptions->renderable(function (ApiException $e, Request $request) {
            $shop = $request->attributes->get('shopifyShop');
            Log::warning('API Exception', [
                'shop' => $shop?->shop ?? null,
                'error_code' => $e->getErrorCode(),
                'message' => $e->getMessage(),
                'url' => $request->fullUrl(),
            ]);

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => $e->getErrorCode(),
                    'message' => $e->getMessage(),
                ],
            ], $e->getHttpStatus());
        });

        // Validation errors
        $exceptions->renderable(function (ValidationException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'validation_error',
                        'message' => 'Validation failed.',
                        'errors' => $e->errors(),
                    ],
                ], 422);
            }
        });

        // Model not found
        $exceptions->renderable(function (ModelNotFoundException $e, Request $request) {
            if ($request->expectsJson()) {
                $model = class_basename($e->getModel());

                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'not_found',
                        'message' => "{$model} not found.",
                    ],
                ], 404);
            }
        });

        // Route not found
        $exceptions->renderable(function (NotFoundHttpException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'not_found',
                        'message' => 'The requested endpoint does not exist.',
                    ],
                ], 404);
            }
        });

        // Other HTTP exceptions
        $exceptions->renderable(function (HttpException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'http_error',
                        'message' => $e->getMessage() ?: 'An error occurred.',
                    ],
                ], $e->getStatusCode());
            }
        });

        // Catch-all — log with shop context
        $exceptions->renderable(function (Throwable $e, Request $request) {
            if ($request->expectsJson()) {
                $shop = $request->attributes->get('shopifyShop');
                Log::error('Unhandled Exception', [
                    'shop' => $shop?->shop ?? null,
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'file' => $e->getFile().':'.$e->getLine(),
                    'url' => $request->fullUrl(),
                    'trace' => collect($e->getTrace())->take(5)->toArray(),
                ]);

                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'server_error',
                        'message' => app()->hasDebugModeEnabled()
                            ? $e->getMessage()
                            : 'An unexpected error occurred.',
                    ],
                ], $status);
            }
        });

    })->create();
