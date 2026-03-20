<?php

return [
    'api_key'      => env('SHOPIFY_API_KEY'),
    'api_secret'   => env('SHOPIFY_API_SECRET'),
    'scopes'       => env('SHOPIFY_API_SCOPES', 'write_draft_orders,read_draft_orders,write_orders,read_orders,read_products,read_customers,write_customers'),
    'api_version'  => env('SHOPIFY_API_VERSION', '2025-07'),
    'app_url'      => env('SHOPIFY_APP_URL'),
    'redirect_uri' => env('SHOPIFY_APP_URL') . '/auth/shopify/callback',
];
