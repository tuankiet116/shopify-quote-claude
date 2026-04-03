<?php

namespace App\Http\Controllers;

use App\Services\Shopify\StorefrontTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StorefrontTokenController extends Controller
{
    public function __construct(private StorefrontTokenService $tokens) {}

    public function show(Request $request): JsonResponse
    {
        $shop = $this->shop($request);
        $token = $this->tokens->getToken($shop);

        return $this->success([
            'has_token' => $token !== null,
            'token_preview' => $token ? substr($token, 0, 6) . '...' : null,
        ]);
    }

    public function regenerate(Request $request): JsonResponse
    {
        $shop = $this->shop($request);
        $token = $this->tokens->regenerate($shop);

        return $this->success([
            'has_token' => true,
            'token_preview' => substr($token, 0, 6) . '...',
        ]);
    }
}
