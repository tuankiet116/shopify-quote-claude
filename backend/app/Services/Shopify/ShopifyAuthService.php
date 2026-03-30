<?php

namespace App\Services\Shopify;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Http;

class ShopifyAuthService
{
    private string $apiKey;

    private string $apiSecret;

    public function __construct()
    {
        $this->apiKey    = config('shopify.api_key');
        $this->apiSecret = config('shopify.api_secret');
    }

    // === Token Exchange (Embedded App — Managed Installation) ===

    public function decodeSessionToken(string $token): array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->apiSecret, 'HS256'));
            $payload = (array) $decoded;

            // Validate audience
            if (($payload['aud'] ?? '') !== $this->apiKey) {
                throw new \Exception('Invalid audience');
            }

            return $payload;
        } catch (\Exception $e) {
            throw new \Exception('Invalid session token: '.$e->getMessage());
        }
    }

    public function exchangeSessionTokenForAccessToken(string $shop, string $sessionToken, string $type = 'offline'): array
    {
        $requestedTokenType = $type === 'online'
            ? 'urn:shopify:params:oauth:token-type:online-access-token'
            : 'urn:shopify:params:oauth:token-type:offline-access-token';

        $response = Http::post("https://{$shop}/admin/oauth/access_token", [
            'client_id'            => $this->apiKey,
            'client_secret'        => $this->apiSecret,
            'grant_type'           => 'urn:ietf:params:oauth:grant-type:token-exchange',
            'subject_token'        => $sessionToken,
            'subject_token_type'   => 'urn:ietf:params:oauth:token-type:id_token',
            'requested_token_type' => $requestedTokenType,
        ]);

        $response->throw();

        return $response->json();
    }

    // === Webhook Verification ===

    public function verifyWebhookHmac(string $rawBody, string $hmacHeader): bool
    {
        $calculatedHmac = base64_encode(hash_hmac('sha256', $rawBody, $this->apiSecret, true));

        return hash_equals($calculatedHmac, $hmacHeader);
    }

    // === Helpers ===

    public function sanitizeShopDomain(?string $shop): ?string
    {
        if (empty($shop)) {
            return null;
        }

        $shop = strtolower(trim($shop));

        if (!preg_match('/^[a-z0-9][a-z0-9\-]*\.myshopify\.com$/', $shop)) {
            return null;
        }

        return $shop;
    }

    public function extractShopDomain(string $dest): string
    {
        // dest format: https://store.myshopify.com
        return str_replace('https://', '', rtrim($dest, '/'));
    }
}
