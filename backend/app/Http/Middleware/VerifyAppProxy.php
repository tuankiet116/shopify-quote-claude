<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use App\Services\Shopify\ShopifyAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyAppProxy
{
    public function __construct(private ShopifyAuthService $authService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        if (!$this->authService->verifyAppProxySignature($request->query())) {
            return response()->json(['error' => 'invalid_signature'], 401);
        }

        $shopDomain = $request->query('shop');
        $shop = Shop::where('shopify_domain', $shopDomain)->where('is_active', true)->first();

        if (!$shop) {
            return response()->json(['error' => 'shop_not_found'], 404);
        }

        $request->attributes->set('shopifyShop', $shop);
        $request->attributes->set('shopifyDomain', $shopDomain);

        return $next($request);
    }
}
