<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\ShopSetting;
use App\Models\QuoteNumberSequence;
use App\Services\Shopify\ShopifyAuthService;
use App\Services\Shopify\ShopifyWebhookService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ShopifyAuthController extends Controller
{
    public function __construct(
        private ShopifyAuthService $authService,
        private ShopifyWebhookService $webhookService,
    ) {
    }

    public function redirect(Request $request)
    {
        $shop = $this->authService->sanitizeShopDomain($request->query('shop'));

        if (!$shop) {
            return response()->json(['error' => 'Invalid shop domain'], 400);
        }

        $nonce = Str::random(32);
        session(['shopify_nonce' => $nonce]);

        $authUrl = $this->authService->buildAuthUrl($shop, $nonce);

        return redirect($authUrl);
    }

    public function callback(Request $request)
    {
        // Verify HMAC
        if (!$this->authService->verifyHmac($request->query())) {
            return response()->json(['error' => 'Invalid HMAC'], 401);
        }

        // Verify nonce
        $nonce = session('shopify_nonce');
        if (!$nonce || $nonce !== $request->query('state')) {
            return response()->json(['error' => 'Invalid state'], 401);
        }
        session()->forget('shopify_nonce');

        // Validate shop
        $shop = $this->authService->sanitizeShopDomain($request->query('shop'));
        if (!$shop) {
            return response()->json(['error' => 'Invalid shop domain'], 400);
        }

        // Exchange code for token
        $tokenData = $this->authService->exchangeCodeForToken($shop, $request->query('code'));

        // Create/update shop
        $shopModel = Shop::updateOrCreate(
            ['shopify_domain' => $shop],
            [
                'access_token' => $tokenData['access_token'],
                'scopes' => $tokenData['scope'] ?? config('shopify.scopes'),
                'is_active' => true,
                'installed_at' => now(),
                'uninstalled_at' => null,
            ]
        );

        // Create default settings
        ShopSetting::firstOrCreate(['shop_id' => $shopModel->id]);

        // Create number sequence
        QuoteNumberSequence::firstOrCreate(['shop_id' => $shopModel->id]);

        // Register webhooks
        try {
            $this->webhookService->registerAll($shopModel);
        } catch (\Exception $e) {
            report($e);
        }

        // Redirect to embedded app
        $apiKey = config('shopify.api_key');
        return redirect("https://{$shop}/admin/apps/{$apiKey}");
    }
}
