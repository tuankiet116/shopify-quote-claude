<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use App\Services\Shopify\ShopifyAuthService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class VerifyShopifySession
{
    public function __construct(private ShopifyAuthService $authService) {}

    public function handle(Request $request, Closure $next): Response
    {
        // Developer mode: bypass Shopify JWT verification
        if ($this->isDeveloperMode($request)) {
            return $this->handleDeveloperMode($request, $next);
        }

        $token = $request->bearerToken();

        if (! $token) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'missing_session_token', 'message' => 'Session token is required.'],
            ], 401);
        }

        try {
            $payload = $this->authService->decodeSessionToken($token);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'invalid_session_token', 'message' => $e->getMessage()],
            ], 401);
        }

        $shopDomain = $this->authService->extractShopDomain($payload['dest']);
        $shop = Shop::where('shop', $shopDomain)->where('is_active', true)->first();

        if (! $shop || ! $shop->access_token) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'shop_not_installed', 'message' => 'App is not installed for this shop.'],
            ], 401);
        }

        $request->attributes->set('shopifyShop', $shop);
        $request->attributes->set('shopifyDomain', $shopDomain);

        return $next($request);
    }

    private function isDeveloperMode(Request $request): bool
    {
        if (app()->environment('production')) {
            return false;
        }

        return $request->query('scope') === 'developer';
    }

    private function handleDeveloperMode(Request $request, Closure $next): Response
    {
        $shopDomain = config('shopify.dev_shop_domain');

        if (! $shopDomain) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'dev_config_error', 'message' => 'SHOPIFY_DEV_SHOP_DOMAIN is not configured.'],
            ], 500);
        }

        $shop = Shop::firstOrCreate(
            ['shop' => $shopDomain],
            ['is_active' => true, 'installed_at' => now()]
        );

        $request->attributes->set('shopifyShop', $shop);
        $request->attributes->set('shopifyDomain', $shopDomain);

        return $next($request);
    }
}
