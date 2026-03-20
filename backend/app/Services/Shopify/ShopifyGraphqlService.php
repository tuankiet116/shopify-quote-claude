<?php

namespace App\Services\Shopify;

use App\Models\Shop;
use Illuminate\Support\Facades\Http;

class ShopifyGraphqlService
{
    private string $shopDomain;
    private string $accessToken;
    private string $apiVersion;

    public function __construct(Shop $shop)
    {
        $this->shopDomain = $shop->shopify_domain;
        $this->accessToken = $shop->access_token;
        $this->apiVersion = config('shopify.api_version');
    }

    public function query(string $query, array $variables = []): array
    {
        $url = "https://{$this->shopDomain}/admin/api/{$this->apiVersion}/graphql.json";

        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $this->accessToken,
            'Content-Type' => 'application/json',
        ])->post($url, [
            'query' => $query,
            'variables' => $variables,
        ]);

        $response->throw();

        $data = $response->json();

        if (!empty($data['errors'])) {
            throw new \Exception('GraphQL errors: ' . json_encode($data['errors']));
        }

        return $data['data'] ?? [];
    }

    public function mutate(string $mutation, array $variables = []): array
    {
        return $this->query($mutation, $variables);
    }
}
