<?php

namespace App\Services;

use App\Models\ButtonSetting;
use App\Models\Shop;
use App\Services\Shopify\ShopifyMetafieldService;
use Illuminate\Support\Facades\Log;

class ButtonSettingService
{
    public function __construct(private ShopifyMetafieldService $metafields) {}

    public function getSettings(Shop $shop): array
    {
        $setting = $shop->buttonSetting;

        if (! $setting) {
            return ButtonSetting::defaults();
        }

        return $setting->toMetafieldJson();
    }

    public function updateSettings(Shop $shop, array $data): ButtonSetting
    {
        $setting = ButtonSetting::updateOrCreate(
            ['shop_id' => $shop->id],
            $data,
        );

        $this->syncMetafield($shop, $setting);

        return $setting->fresh();
    }

    private function syncMetafield(Shop $shop, ButtonSetting $setting): void
    {
        try {
            $this->metafields->setShopMetafield(
                $shop,
                'quote_app',
                'button_settings',
                $setting->toMetafieldJson(),
                'json',
            );
        } catch (\Throwable $e) {
            Log::error('Failed to sync button settings metafield', [
                'shop' => $shop->shop,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
