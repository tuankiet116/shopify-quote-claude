<?php

namespace Tests\Feature;

use App\Models\ButtonSetting;
use App\Models\Shop;
use App\Services\Shopify\ShopifyMetafieldService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class ButtonSettingTest extends TestCase
{
    use RefreshDatabase;

    private Shop $shop;

    protected function setUp(): void
    {
        parent::setUp();

        $this->shop = Shop::create([
            'shop' => 'test-shop.myshopify.com',
            'access_token' => 'test-token',
            'is_active' => true,
            'installed_at' => now(),
        ]);

        config(['shopify.dev_shop_domain' => 'test-shop.myshopify.com']);
    }

    private function apiGet(string $url): \Illuminate\Testing\TestResponse
    {
        return $this->getJson("/api/shopify/{$url}?scope=developer");
    }

    private function apiPut(string $url, array $data): \Illuminate\Testing\TestResponse
    {
        return $this->putJson("/api/shopify/{$url}?scope=developer", $data);
    }

    // --- GET defaults ---

    public function test_get_returns_defaults_when_no_record_exists(): void
    {
        $response = $this->apiGet('button-settings');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_enabled' => true,
                    'show_on_product' => true,
                    'show_on_collection' => true,
                    'show_on_search' => true,
                    'show_on_home' => true,
                    'appearance' => [
                        'button_text' => 'Request a Quote',
                        'bg_color' => '#000000',
                        'text_color' => '#FFFFFF',
                        'hover_bg_color' => '#333333',
                        'border_radius' => 4,
                        'border_width' => 0,
                        'border_color' => '#000000',
                        'size' => 'medium',
                    ],
                ],
            ]);
    }

    // --- PUT create ---

    public function test_put_creates_record_with_valid_data(): void
    {
        $this->mock(ShopifyMetafieldService::class, function ($mock) {
            $mock->shouldReceive('setShopMetafield')->once();
        });

        $response = $this->apiPut('button-settings', [
            'is_enabled' => true,
            'show_on_product' => true,
            'show_on_collection' => false,
            'show_on_search' => true,
            'show_on_home' => false,
            'appearance' => [
                'button_text' => 'Get Quote',
                'bg_color' => '#FF0000',
                'text_color' => '#FFFFFF',
                'hover_bg_color' => '#CC0000',
                'border_radius' => 8,
                'border_width' => 2,
                'border_color' => '#990000',
                'size' => 'large',
            ],
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'data' => [
                    'show_on_collection' => false,
                    'show_on_home' => false,
                    'appearance' => [
                        'button_text' => 'Get Quote',
                        'bg_color' => '#FF0000',
                        'size' => 'large',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('button_settings', [
            'shop_id' => $this->shop->id,
            'show_on_collection' => false,
        ]);
    }

    // --- PUT upsert ---

    public function test_put_updates_existing_record(): void
    {
        ButtonSetting::create([
            'shop_id' => $this->shop->id,
            'is_enabled' => true,
            'show_on_product' => true,
            'show_on_collection' => true,
            'show_on_search' => true,
            'show_on_home' => true,
            'appearance' => ButtonSetting::defaults()['appearance'],
        ]);

        $this->mock(ShopifyMetafieldService::class, function ($mock) {
            $mock->shouldReceive('setShopMetafield')->once();
        });

        $response = $this->apiPut('button-settings', [
            'is_enabled' => false,
            'show_on_product' => true,
            'show_on_collection' => true,
            'show_on_search' => true,
            'show_on_home' => true,
            'appearance' => [
                'button_text' => 'Updated Text',
                'bg_color' => '#111111',
                'text_color' => '#EEEEEE',
                'hover_bg_color' => '#222222',
                'border_radius' => 10,
                'border_width' => 1,
                'border_color' => '#333333',
                'size' => 'small',
            ],
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_enabled' => false,
                    'appearance' => [
                        'button_text' => 'Updated Text',
                        'size' => 'small',
                    ],
                ],
            ]);

        $this->assertEquals(1, ButtonSetting::where('shop_id', $this->shop->id)->count());
    }

    // --- Validation errors ---

    public function test_put_rejects_invalid_hex_color(): void
    {
        $response = $this->apiPut('button-settings', [
            'is_enabled' => true,
            'show_on_product' => true,
            'show_on_collection' => true,
            'show_on_search' => true,
            'show_on_home' => true,
            'appearance' => [
                'button_text' => 'Quote',
                'bg_color' => 'notahex',
                'text_color' => '#FFFFFF',
                'hover_bg_color' => '#333333',
                'border_radius' => 4,
                'border_width' => 0,
                'border_color' => '#000000',
                'size' => 'medium',
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_put_rejects_invalid_size(): void
    {
        $response = $this->apiPut('button-settings', [
            'is_enabled' => true,
            'show_on_product' => true,
            'show_on_collection' => true,
            'show_on_search' => true,
            'show_on_home' => true,
            'appearance' => [
                'button_text' => 'Quote',
                'bg_color' => '#000000',
                'text_color' => '#FFFFFF',
                'hover_bg_color' => '#333333',
                'border_radius' => 4,
                'border_width' => 0,
                'border_color' => '#000000',
                'size' => 'extra-large',
            ],
        ]);

        $response->assertStatus(422);
    }

    public function test_put_rejects_border_radius_out_of_range(): void
    {
        $response = $this->apiPut('button-settings', [
            'is_enabled' => true,
            'show_on_product' => true,
            'show_on_collection' => true,
            'show_on_search' => true,
            'show_on_home' => true,
            'appearance' => [
                'button_text' => 'Quote',
                'bg_color' => '#000000',
                'text_color' => '#FFFFFF',
                'hover_bg_color' => '#333333',
                'border_radius' => 100,
                'border_width' => 0,
                'border_color' => '#000000',
                'size' => 'medium',
            ],
        ]);

        $response->assertStatus(422);
    }

    public function test_put_rejects_button_text_too_long(): void
    {
        $response = $this->apiPut('button-settings', [
            'is_enabled' => true,
            'show_on_product' => true,
            'show_on_collection' => true,
            'show_on_search' => true,
            'show_on_home' => true,
            'appearance' => [
                'button_text' => str_repeat('a', 101),
                'bg_color' => '#000000',
                'text_color' => '#FFFFFF',
                'hover_bg_color' => '#333333',
                'border_radius' => 4,
                'border_width' => 0,
                'border_color' => '#000000',
                'size' => 'medium',
            ],
        ]);

        $response->assertStatus(422);
    }

    // --- GET after PUT ---

    public function test_get_returns_saved_values_after_put(): void
    {
        $this->mock(ShopifyMetafieldService::class, function ($mock) {
            $mock->shouldReceive('setShopMetafield')->once();
        });

        $this->apiPut('button-settings', [
            'is_enabled' => true,
            'show_on_product' => false,
            'show_on_collection' => true,
            'show_on_search' => false,
            'show_on_home' => true,
            'appearance' => [
                'button_text' => 'Custom Text',
                'bg_color' => '#AABBCC',
                'text_color' => '#112233',
                'hover_bg_color' => '#445566',
                'border_radius' => 12,
                'border_width' => 3,
                'border_color' => '#778899',
                'size' => 'small',
            ],
        ]);

        $response = $this->apiGet('button-settings');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'data' => [
                    'show_on_product' => false,
                    'show_on_search' => false,
                    'appearance' => [
                        'button_text' => 'Custom Text',
                        'bg_color' => '#AABBCC',
                        'border_radius' => 12,
                        'size' => 'small',
                    ],
                ],
            ]);
    }

    // --- Metafield sync ---

    public function test_metafield_sync_is_called_on_update(): void
    {
        $this->mock(ShopifyMetafieldService::class, function ($mock) {
            $mock->shouldReceive('setShopMetafield')
                ->once()
                ->withArgs(function ($shop, $namespace, $key, $value, $type) {
                    return $shop->id === $this->shop->id
                        && $namespace === 'quote_app'
                        && $key === 'button_settings'
                        && $type === 'json'
                        && is_array($value)
                        && $value['appearance']['button_text'] === 'Sync Test';
                });
        });

        $this->apiPut('button-settings', [
            'is_enabled' => true,
            'show_on_product' => true,
            'show_on_collection' => true,
            'show_on_search' => true,
            'show_on_home' => true,
            'appearance' => [
                'button_text' => 'Sync Test',
                'bg_color' => '#000000',
                'text_color' => '#FFFFFF',
                'hover_bg_color' => '#333333',
                'border_radius' => 4,
                'border_width' => 0,
                'border_color' => '#000000',
                'size' => 'medium',
            ],
        ]);
    }
}
