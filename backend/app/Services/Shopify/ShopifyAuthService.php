<?php

namespace App\Services\Shopify;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Http;

class ShopifyAuthService
{
    private string $apiKey;
    private string $apiSecret;
    private string $scopes;
    private string $redirectUri;

    public function __construct()
    {
        $this->apiKey = config('shopify.api_key');
        $this->apiSecret = config('shopify.api_secret');
        $this->scopes = config('shopify.scopes');
        $this->redirectUri = config('shopify.redirect_uri');
    }

    // === OAuth Authorization Code Grant ===

    public function buildAuthUrl(string $shop, string $nonce): string
    {
        $params = http_build_query([
            'client_id' => $this->apiKey,
            'scope' => $this->scopes,
            'redirect_uri' => $this->redirectUri,
            'state' => $nonce,
        ]);

        return "https://{$shop}/admin/oauth/authorize?{$params}";
    }

    public function verifyHmac(array $queryParams): bool
    {
        if (!isset($queryParams['hmac'])) {
            return false;
        }

        $hmac = $queryParams['hmac'];
        unset($queryParams['hmac']);

        ksort($queryParams);

        $message = http_build_query($queryParams);
        $calculatedHmac = hash_hmac('sha256', $message, $this->apiSecret);

        return hash_equals($calculatedHmac, $hmac);
    }

    public function exchangeCodeForToken(string $shop, string $code): array
    {
        $response = Http::post("https://{$shop}/admin/oauth/access_token", [
            'client_id' => $this->apiKey,
            'client_secret' => $this->apiSecret,
            'code' => $code,
        ]);

        $response->throw();

        return $response->json();
    }

    // === Token Exchange (Embedded App) ===

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
            throw new \Exception('Invalid session token: ' . $e->getMessage());
        }
    }

    public function exchangeSessionTokenForAccessToken(string $shop, string $sessionToken, string $type = 'offline'): array
    {
        $requestedTokenType = $type === 'online'
            ? 'urn:shopify:params:oauth:token-type:online-access-token'
            : 'urn:shopify:params:oauth:token-type:offline-access-token';

        $response = Http::post("https://{$shop}/admin/oauth/access_token", [
            'client_id' => $this->apiKey,
            'client_secret' => $this->apiSecret,
            'grant_type' => 'urn:ietf:params:oauth:grant-type:token-exchange',
            'subject_token' => $sessionToken,
            'subject_token_type' => 'urn:ietf:params:oauth:token-type:id_token',
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

    // === App Proxy Verification ===

    public function verifyAppProxySignature(array $queryParams): bool
    {
        if (!isset($queryParams['signature'])) {
            return false;
        }

        $signature = $queryParams['signature'];
        unset($queryParams['signature']);

        ksort($queryParams);

        $message = '';
        foreach ($queryParams as $key => $value) {
            $message .= $key . '=' . $value;
        }

        $calculatedSignature = hash_hmac('sha256', $message, $this->apiSecret);

        return hash_equals($calculatedSignature, $signature);
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
