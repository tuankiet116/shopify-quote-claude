<?php

return [
    'api_key' => env('SHOPIFY_API_KEY'),
    'api_secret' => env('SHOPIFY_API_SECRET'),
    'api_version' => env('SHOPIFY_API_VERSION', '2025-07'),
    'app_url' => env('SHOPIFY_APP_URL'),

    // Developer mode: shop domain for local testing without Shopify embed
    'dev_shop_domain' => env('SHOPIFY_DEV_SHOP_DOMAIN'),
];
