<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use App\Services\Shopify\ShopifyAuthService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureShopifyInstalled
{
    public function __construct(private ShopifyAuthService $authService) {}

    public function handle(Request $request, Closure $next): Response
    {
        // On first load, Shopify passes id_token as query param
        $idToken = $request->query('id_token');

        if ($idToken) {
            $this->ensureShopInstalled($idToken);
        }

        $response = $next($request);

        $response->headers->set(
            'Content-Security-Policy',
            'frame-ancestors https://*.myshopify.com https://admin.shopify.com'
        );

        return $response;
    }

    private function ensureShopInstalled(string $idToken): void
    {
        try {
            $payload = $this->authService->decodeSessionToken($idToken);
            $shopDomain = $this->authService->extractShopDomain($payload['dest']);

            $shop = Shop::where('shop', $shopDomain)->first();

            // Already installed with access token — skip
            if ($shop && $shop->access_token && $shop->is_active) {
                return;
            }

            // Token exchange to get offline access token
            $tokenData = $this->authService->exchangeSessionTokenForAccessToken($shopDomain, $idToken);

            Shop::updateOrCreate(
                ['shop' => $shopDomain],
                [
                    'access_token' => $tokenData['access_token'],
                    'is_active' => true,
                    'installed_at' => $shop?->installed_at ?? now(),
                    'uninstalled_at' => null,
                ]
            );

            Log::info('Shop installed via token exchange', ['shop' => $shopDomain]);
        } catch (\Exception $e) {
            Log::error('Install token exchange failed', ['message' => $e->getMessage()]);
        }
    }
}
