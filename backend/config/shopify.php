<?php

return [
    'api_key' => env('SHOPIFY_API_KEY'),
    'api_secret' => env('SHOPIFY_API_SECRET'),
    'scopes' => env('SHOPIFY_API_SCOPES', 'read_products'),
    'api_version' => env('SHOPIFY_API_VERSION', '2025-07'),
    'app_url' => env('SHOPIFY_APP_URL'),
    'redirect_uri' => env('SHOPIFY_APP_URL').'/auth/shopify/callback',

    // Developer mode: shop domain for local testing without Shopify embed
    'dev_shop_domain' => env('SHOPIFY_DEV_SHOP_DOMAIN'),
];
