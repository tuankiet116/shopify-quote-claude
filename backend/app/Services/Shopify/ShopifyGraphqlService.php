<?php

namespace App\Services\Shopify;

use App\Exceptions\ShopifyGraphqlException;
use App\Models\Shop;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShopifyGraphqlService
{
    public function query(Shop $shop, string $query, array $variables = []): array
    {
        $version = config('shopify.api_version');

        $payload = ['query' => $query];
        if (! empty($variables)) {
            $payload['variables'] = $variables;
        }

        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $shop->access_token,
            'Content-Type' => 'application/json',
        ])->post("https://{$shop->shop}/admin/api/{$version}/graphql.json", $payload);

        $data = $response->json();

        if (isset($data['errors'])) {
            Log::error('Shopify GraphQL error', [
                'shop' => $shop->shop,
                'errors' => $data['errors'],
            ]);

            throw new ShopifyGraphqlException($data['errors']);
        }

        return $data['data'] ?? [];
    }

    public function mutate(Shop $shop, string $mutation, array $variables = []): array
    {
        return $this->query($shop, $mutation, $variables);
    }
}
