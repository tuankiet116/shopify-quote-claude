<?php

namespace App\Services\Shopify;

use App\Models\Shop;
use Illuminate\Support\Facades\Log;

class StorefrontTokenService
{
    public function __construct(
        private ShopifyGraphqlService $graphql,
        private ShopifyMetafieldService $metafields,
    ) {}

    /**
     * Create a new Storefront API access token via Admin API
     * and store it in the shop's metafield for the theme extension to read.
     */
    public function regenerate(Shop $shop): string
    {
        // Delete existing tokens first
        $this->deleteExistingTokens($shop);

        // Create new token
        $data = $this->graphql->mutate($shop, '
            mutation storefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
                storefrontAccessTokenCreate(input: $input) {
                    storefrontAccessToken {
                        accessToken
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        ', [
            'input' => [
                'title' => 'Quote App Storefront Token',
            ],
        ]);

        $userErrors = $data['storefrontAccessTokenCreate']['userErrors'] ?? [];

        if (! empty($userErrors)) {
            Log::error('Failed to create storefront token', [
                'shop' => $shop->shop,
                'errors' => $userErrors,
            ]);

            throw new \RuntimeException('Failed to create storefront access token: ' . $userErrors[0]['message']);
        }

        $token = $data['storefrontAccessTokenCreate']['storefrontAccessToken']['accessToken'];

        // Save token to metafield so Liquid template can read it
        $this->metafields->setShopMetafield(
            $shop,
            'quote_app',
            'storefront_token',
            $token,
            'single_line_text_field',
        );

        return $token;
    }

    /**
     * Get the current storefront token from metafield.
     */
    public function getToken(Shop $shop): ?string
    {
        $metafield = $this->metafields->getShopMetafield($shop, 'quote_app', 'storefront_token');

        return $metafield['value'] ?? null;
    }

    /**
     * Delete all existing storefront access tokens for this app.
     */
    private function deleteExistingTokens(Shop $shop): void
    {
        try {
            $data = $this->graphql->query($shop, '
                query {
                    shop {
                        storefrontAccessTokens(first: 10) {
                            nodes {
                                id
                                title
                            }
                        }
                    }
                }
            ');

            $tokens = $data['shop']['storefrontAccessTokens']['nodes'] ?? [];

            foreach ($tokens as $token) {
                if ($token['title'] === 'Quote App Storefront Token') {
                    $this->graphql->mutate($shop, '
                        mutation storefrontAccessTokenDelete($input: StorefrontAccessTokenDeleteInput!) {
                            storefrontAccessTokenDelete(input: $input) {
                                deletedStorefrontAccessTokenId
                                userErrors {
                                    field
                                    message
                                }
                            }
                        }
                    ', [
                        'input' => ['id' => $token['id']],
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to delete existing storefront tokens', [
                'shop' => $shop->shop,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
