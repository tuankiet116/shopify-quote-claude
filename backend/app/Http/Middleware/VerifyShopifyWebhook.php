<?php

namespace App\Http\Middleware;

use App\Services\Shopify\ShopifyAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyShopifyWebhook
{
    public function __construct(private ShopifyAuthService $authService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $hmacHeader = $request->header('X-Shopify-Hmac-SHA256');

        if (!$hmacHeader) {
            return response()->json(['error' => 'missing_hmac'], 401);
        }

        $rawBody = $request->getContent();

        if (!$this->authService->verifyWebhookHmac($rawBody, $hmacHeader)) {
            return response()->json(['error' => 'invalid_hmac'], 401);
        }

        $request->attributes->set('shopifyDomain', $request->header('X-Shopify-Shop-Domain'));
        $request->attributes->set('webhookTopic', $request->header('X-Shopify-Topic'));

        return $next($request);
    }
}
