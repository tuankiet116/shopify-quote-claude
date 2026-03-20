<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use App\Services\Shopify\ShopifyAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyShopifySession
{
    public function __construct(private ShopifyAuthService $authService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken() ?? $request->query('id_token');

        if (!$token) {
            return response()->json(['error' => 'missing_session_token'], 401);
        }

        try {
            $payload = $this->authService->decodeSessionToken($token);
        } catch (\Exception $e) {
            return response()->json(['error' => 'invalid_session_token', 'message' => $e->getMessage()], 401);
        }

        $shopDomain = $this->authService->extractShopDomain($payload['dest']);

        $shop = Shop::where('shopify_domain', $shopDomain)->first();

        if (!$shop || !$shop->access_token) {
            try {
                $tokenData = $this->authService->exchangeSessionTokenForAccessToken($shopDomain, $token);
                $shop = Shop::updateOrCreate(
                    ['shopify_domain' => $shopDomain],
                    [
                        'access_token' => $tokenData['access_token'],
                        'scopes' => $tokenData['scope'] ?? config('shopify.scopes'),
                        'is_active' => true,
                        'installed_at' => $shop?->installed_at ?? now(),
                    ]
                );
            } catch (\Exception $e) {
                return response()->json(['error' => 'token_exchange_failed', 'message' => $e->getMessage()], 401);
            }
        }

        $request->attributes->set('shopifyShop', $shop);
        $request->attributes->set('shopifyDomain', $shopDomain);

        return $next($request);
    }
}
