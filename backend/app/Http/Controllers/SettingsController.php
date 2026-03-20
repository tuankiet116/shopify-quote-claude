<?php

namespace App\Http\Controllers;

use App\Models\ShopSetting;
use App\Services\Shopify\ShopifyGraphqlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $settings = ShopSetting::firstOrCreate(['shop_id' => $shop->id]);

        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $validated = $request->validate([
            'quote_expiry_days' => 'sometimes|integer|min:1|max:365',
            'auto_expire_enabled' => 'sometimes|boolean',
            'reminder_days_before' => 'sometimes|integer|min:1|max:30',
            'notify_on_new_quote' => 'sometimes|boolean',
            'notify_on_accepted' => 'sometimes|boolean',
            'email_subject_template' => 'sometimes|string|max:255',
            'email_body_template' => 'sometimes|string',
        ]);

        $settings = ShopSetting::firstOrCreate(['shop_id' => $shop->id]);
        $settings->update($validated);

        return response()->json($settings);
    }

    public function updateStorefront(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $validated = $request->validate([
            'buttonSettings' => 'sometimes|array',
            'cartSettings' => 'sometimes|array',
        ]);

        $graphql = new ShopifyGraphqlService($shop);
        $metafields = [];

        if (isset($validated['buttonSettings'])) {
            $metafields[] = [
                'namespace' => '$app',
                'key' => 'quote_button_settings',
                'value' => json_encode($validated['buttonSettings']),
                'type' => 'json',
                'ownerId' => "gid://shopify/Shop",
            ];
        }

        if (isset($validated['cartSettings'])) {
            $metafields[] = [
                'namespace' => '$app',
                'key' => 'quote_cart_settings',
                'value' => json_encode($validated['cartSettings']),
                'type' => 'json',
                'ownerId' => "gid://shopify/Shop",
            ];
        }

        if (!empty($metafields)) {
            $graphql->mutate(<<<'GRAPHQL'
            mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
                metafieldsSet(metafields: $metafields) {
                    metafields {
                        id
                        key
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
            GRAPHQL, ['metafields' => $metafields]);
        }

        return response()->json(['message' => 'Storefront settings updated']);
    }
}
