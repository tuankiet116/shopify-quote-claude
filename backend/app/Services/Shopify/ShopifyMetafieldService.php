<?php

namespace App\Services\Shopify;

use App\Models\Shop;
use Illuminate\Support\Facades\Log;

class ShopifyMetafieldService
{
    public function __construct(private ShopifyGraphqlService $graphql) {}

    public function setShopMetafield(Shop $shop, string $namespace, string $key, mixed $value, string $type = 'json'): void
    {
        $jsonValue = is_string($value) ? $value : json_encode($value);

        $data = $this->graphql->mutate($shop, '
            mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
                metafieldsSet(metafields: $metafields) {
                    metafields {
                        id
                        namespace
                        key
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        ', [
            'metafields' => [[
                'namespace' => $namespace,
                'key' => $key,
                'ownerId' => $this->getShopGid($shop),
                'type' => $type,
                'value' => $jsonValue,
            ]],
        ]);

        $userErrors = $data['metafieldsSet']['userErrors'] ?? [];

        if (! empty($userErrors)) {
            Log::error('Shopify metafield user errors', [
                'shop' => $shop->shop,
                'namespace' => $namespace,
                'key' => $key,
                'errors' => $userErrors,
            ]);
        }
    }

    public function getShopMetafield(Shop $shop, string $namespace, string $key): ?array
    {
        $data = $this->graphql->query($shop, '
            query getMetafield($namespace: String!, $key: String!) {
                shop {
                    metafield(namespace: $namespace, key: $key) {
                        id
                        namespace
                        key
                        value
                        type
                    }
                }
            }
        ', [
            'namespace' => $namespace,
            'key' => $key,
        ]);

        $metafield = $data['shop']['metafield'] ?? null;

        if ($metafield && $metafield['type'] === 'json') {
            $metafield['value'] = json_decode($metafield['value'], true);
        }

        return $metafield;
    }

    private function getShopGid(Shop $shop): string
    {
        $data = $this->graphql->query($shop, '{ shop { id } }');

        return $data['shop']['id'];
    }
}
