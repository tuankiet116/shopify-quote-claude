<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Services\Shopify\ShopifyAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ShopifyAuthController extends Controller
{
    public function __construct(
        private ShopifyAuthService $authService,
    ) {}

    public function redirect(Request $request)
    {
        $shop = $this->authService->sanitizeShopDomain($request->query('shop'));

        if (! $shop) {
            return $this->error('Invalid shop domain', 'invalid_shop', 400);
        }

        $nonce = Str::random(32);
        session(['shopify_nonce' => $nonce]);

        $authUrl = $this->authService->buildAuthUrl($shop, $nonce);

        return redirect($authUrl);
    }

    public function callback(Request $request)
    {
        if (! $this->authService->verifyHmac($request->query())) {
            return $this->error('Invalid HMAC', 'invalid_hmac', 401);
        }

        $nonce = session('shopify_nonce');
        if (! $nonce || $nonce !== $request->query('state')) {
            return $this->error('Invalid state', 'invalid_state', 401);
        }
        session()->forget('shopify_nonce');

        $shop = $this->authService->sanitizeShopDomain($request->query('shop'));
        if (! $shop) {
            return $this->error('Invalid shop domain', 'invalid_shop', 400);
        }

        $tokenData = $this->authService->exchangeCodeForToken($shop, $request->query('code'));

        Shop::updateOrCreate(
            ['shop' => $shop],
            [
                'access_token' => $tokenData['access_token'],
                'is_active' => true,
                'installed_at' => now(),
                'uninstalled_at' => null,
            ]
        );

        Log::info('Shop installed', ['shop' => $shop]);

        $apiKey = config('shopify.api_key');

        return redirect("https://{$shop}/admin/apps/{$apiKey}");
    }

    private function error(string $message, string $code, int $status)
    {
        return response()->json([
            'success' => false,
            'error' => ['code' => $code, 'message' => $message],
        ], $status);
    }
}
